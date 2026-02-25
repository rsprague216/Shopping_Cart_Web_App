import '@testing-library/jest-dom';

// ─── localStorage mock ────────────────────────────────────────────────────────
// jsdom provides a real localStorage implementation, but we replace it with a
// controlled mock so we can clear it reliably between tests and prevent state
// from bleeding between test cases.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem:    (key)        => store[key] ?? null,
    setItem:    (key, value) => { store[key] = String(value); },
    removeItem: (key)        => { delete store[key]; },
    clear:      ()           => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Clear storage before every test so tests cannot bleed state into each other.
beforeEach(() => {
  localStorageMock.clear();
});

// ─── fetch mock ───────────────────────────────────────────────────────────────
// Replace global fetch with a vi.fn() stub. Each test that exercises a hook or
// component that calls fetch should use vi.mocked(fetch).mockResolvedValueOnce()
// to control the response for that specific test.
global.fetch = vi.fn();

beforeEach(() => {
  vi.mocked(fetch).mockReset();
});
