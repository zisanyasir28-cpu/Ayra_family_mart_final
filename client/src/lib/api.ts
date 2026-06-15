import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Access token store (in-memory only — not localStorage) ──────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

// ─── Request interceptor — attach access token ───────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token) {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Never intercept the refresh endpoint itself — a 401 there means "no valid
    // session", and AuthProvider's own .catch() handles it gracefully (clearAuth).
    // Intercepting it causes an infinite retry loop that fires auth:logout on every
    // unauthenticated page load.
    const isRefreshEndpoint = originalRequest.url?.endsWith('/auth/refresh');
    if (error.response?.status !== 401 || originalRequest._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    // If there's no in-memory access token the user was never authenticated in this
    // session. A 401 on e.g. wishlist/cart endpoints is EXPECTED for guests — don't
    // attempt a refresh or fire auth:logout (that would redirect them to /login just
    // for browsing).
    if (!accessToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest._retry = true; // a re-queued retry must not kick off another refresh
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(Promise.reject.bind(Promise));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ success: true; data: { accessToken: string } }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = data.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      // Redirect to login — the auth store will handle this via an event.
      // Pass the current path so the login page can redirect back after sign-in.
      window.dispatchEvent(
        new CustomEvent('auth:logout', {
          detail: { from: window.location.pathname + window.location.search },
        }),
      );
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
