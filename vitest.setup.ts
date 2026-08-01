import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: () => undefined,
  writable: true,
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});
