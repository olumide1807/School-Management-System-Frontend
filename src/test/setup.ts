// Runs before every test file (vitest.config.ts → setupFiles)
import { afterEach } from "vitest";

// Lets react-dom's act() flush effects the way the browser would
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Files marked `@vitest-environment node` have no DOM; the rest are jsdom
const hasDom = typeof window !== "undefined";

// Browser APIs jsdom doesn't implement, used by MUI and a few pages
if (hasDom && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
  })) as any;
}
if (hasDom && !(window as any).ResizeObserver) {
  (window as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
}
if (hasDom) {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  window.scrollTo = (() => {}) as any;
}

// Rendering to a string (renderToStaticMarkup) inside a MemoryRouter makes
// React warn that layout effects don't run on the server. Expected there,
// and it would bury any warning that matters.
const consoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].startsWith("Warning: useLayoutEffect does nothing on the server")) return;
  consoleError(...args);
};

afterEach(() => {
  if (hasDom) document.body.innerHTML = "";
});
