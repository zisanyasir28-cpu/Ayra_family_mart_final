import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  /** What the user picked. */
  theme:    Theme;
  /** What's currently applied (resolved from 'system' via matchMedia). */
  resolved: 'dark' | 'light';
  setTheme: (t: Theme) => void;
  /** Refresh resolved theme from system preference (called on matchMedia change). */
  refreshResolved: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme;
}

function applyTheme(resolved: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  html.classList.remove('dark', 'light');
  html.classList.add(resolved);
  // Update meta theme-color so PWA install + mobile chrome address bar match
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0E0D0B' : '#FBF7EC');
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme:    'system',
      resolved: resolveTheme('system'),

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ theme, resolved });
      },

      refreshResolved: () => {
        const { theme } = get();
        if (theme !== 'system') return;
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        set({ resolved });
      },
    }),
    {
      name:    'ayra:theme',
      version: 1,
      // Only persist user choice — resolved is recomputed on hydrate
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const resolved = resolveTheme(state.theme);
        applyTheme(resolved);
        state.resolved = resolved;
      },
    },
  ),
);

// ─── matchMedia listener — installed once when the module loads ──────────────

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useThemeStore.getState().refreshResolved();
  });
}
