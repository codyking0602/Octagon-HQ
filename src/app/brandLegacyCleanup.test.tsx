import { describe, expect, it } from "vitest";
import { brand } from "../config/brand";
import { appRoutes } from "./router";

describe("The HQ brand and legacy route cleanup", () => {
  it("uses the approved universal The HQ brand owner", () => {
    expect(brand.name).toBe("The HQ");
    expect(brand.logoUrl).toBe("/assets/the-hq-app-icon-v2.png");
  });

  it("does not expose legacy War Room routes", () => {
    const routePaths = appRoutes.flatMap((route) => route.children ?? []).map((route) => route.path);

    expect(routePaths).not.toContain("war-room");
    expect(routePaths).not.toContain("war-room/join");
  });
});
