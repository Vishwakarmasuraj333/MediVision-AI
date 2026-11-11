import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Polyfill window.matchMedia if not available in happy-dom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // Polyfill ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock Recharts ResponsiveContainer to prevent width/height 0 warnings in headless environment
vi.mock('recharts', async () => {
  const actual = await vi.importActual<Record<string, any>>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', { style: { width: 500, height: 300 } }, children),
  };
});
