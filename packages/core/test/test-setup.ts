// Suppress known benign browser console messages so CI doesn't fail on noisy logs.
// Only filter specific message patterns so real warnings/errors still surface.
const IGNORED_PATTERNS: RegExp[] = [
  /Lit is in dev mode/i,
  /ResizeObserver loop completed with undelivered notifications/i,
  /ResizeObserver loop limit exceeded/i,
  /Floating UI/i,
];

function shouldIgnoreConsole(args: unknown[]): boolean {
  if (!args || args.length === 0) return false;
  try {
    return args.some(a => {
      if (typeof a === 'string') {
        return IGNORED_PATTERNS.some(rx => rx.test(a));
      }
      if (typeof a === 'object' && a !== null) {
        try {
          const s = JSON.stringify(a);
          return IGNORED_PATTERNS.some(rx => rx.test(s));
        } catch {
          return false;
        }
      }
      return false;
    });
  } catch {
    return false;
  }
}

const _warn = console.warn.bind(console);
const _error = console.error.bind(console);
const _log = console.log.bind(console);

console.warn = (...args: unknown[]) => {
  if (shouldIgnoreConsole(args)) return;
  return _warn(...args);
};

console.error = (...args: unknown[]) => {
  if (shouldIgnoreConsole(args)) return;
  return _error(...args);
};

console.log = (...args: unknown[]) => {
  if (shouldIgnoreConsole(args)) return;
  return _log(...args);
};

// Also suppress uncaught-error events for the known benign ResizeObserver messages.
window.addEventListener(
  'error',
  (e: ErrorEvent) => {
    const msg = e && e.message ? e.message : '';
    if (typeof msg === 'string' && IGNORED_PATTERNS.some(rx => rx.test(msg))) {
      e.stopImmediatePropagation();
    }
  },
  true
);
