import { describe, expect, it, vi } from "vitest";

describe("Vitest DOM scroll contract", () => {
  it("supports the element scroll API used by modal animation-frame effects", () => {
    const viewport = document.createElement("main");

    expect(viewport.scrollTo).toEqual(expect.any(Function));
    expect(() => viewport.scrollTo({ top: 0 })).not.toThrow();
    expect(vi.mocked(viewport.scrollTo)).toHaveBeenCalledWith({ top: 0 });
  });
});
