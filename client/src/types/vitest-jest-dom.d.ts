// Bridge @testing-library/jest-dom matchers into Vitest 4's Assertion interface.
// Vitest 4 moved `Assertion` from module `vitest` to module `@vitest/expect`,
// so jest-dom 6.x's built-in `declare module 'vitest'` no longer applies.
// Augment the correct module here.

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module '@vitest/expect' {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
