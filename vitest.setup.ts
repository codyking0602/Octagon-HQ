import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

configure({ asyncUtilTimeout: 30_000 });

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});
