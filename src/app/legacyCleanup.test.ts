import { describe, expect, it } from "vitest";
import type { RouteObject } from "react-router-dom";
import { brand } from "../config/brand";
import { appRoutes } from "./router";

describe("The HQ legacy cleanup", () => {
  it("uses The HQ as the universal product brand", () => {
    expect(brand.name).toBe("The HQ");
  });

  it("has no War Room route owner left in the app router", () => {
    const paths: string[] = [];
    const visit = (routes: RouteObject[]) => {
      routes.forEach((route) => {
        if (route.path) paths.push(route.path);
        if (route.children) visit(route.children);
      });
    };

    visit(appRoutes);
    expect(paths.some((path) => path.startsWith("war-room"))).toBe(false);
    expect(paths).toContain("back-room");
  });
});
