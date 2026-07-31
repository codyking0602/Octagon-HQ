import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const component = readFileSync("src/app/BrandedPullToRefresh.tsx", "utf8");

describe("pull refresh ownership", () => {
  it("does not create an alternate network or app reload owner", () => {
    expect(component).not.toContain("getSupabaseClient");
    expect(component).not.toContain("createQueryClient");
    expect(component).not.toContain("invalidateQueries");
    expect(component).not.toContain("dispatchEvent");
    expect(component).not.toContain("window.location");
    expect(component).not.toContain("document.location");
  });
});
