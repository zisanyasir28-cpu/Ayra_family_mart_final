import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// ─── matchMedia mock — used by PWA InstallPrompt + themeStore listener ───────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:           false,
    media:             query,
    onchange:          null,
    addEventListener:  vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent:     vi.fn(),
    addListener:       vi.fn(),
    removeListener:    vi.fn(),
  })),
});

// ─── IntersectionObserver mock — used by framer-motion + lazy loading ────────
class MockIntersectionObserver {
  observe   = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root        = null;
  rootMargin  = '';
  thresholds  = [];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

// ─── ResizeObserver mock ──────────────────────────────────────────────────────
class MockResizeObserver {
  observe   = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = MockResizeObserver;

// ─── Cleanup after each test ──────────────────────────────────────────────────
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ─── Reset Zustand stores between tests ───────────────────────────────────────
beforeEach(() => {
  // ensure each test starts with a clean localStorage so Zustand persist
  // doesn't leak state across cases
  localStorage.clear();
});
