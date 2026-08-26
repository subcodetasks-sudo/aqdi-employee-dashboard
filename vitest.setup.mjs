import "@testing-library/jest-dom/vitest";

// jsdom has no layout engine, so Radix primitives (Checkbox/Select/Popover) that
// measure elements via ResizeObserver/scrollIntoView need light stand-ins.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (typeof Element !== "undefined" && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (typeof Element !== "undefined" && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
