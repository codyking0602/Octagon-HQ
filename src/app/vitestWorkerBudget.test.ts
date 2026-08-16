import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteConfig = readFileSync("vite.config.ts", "utf8");

describe("Vitest worker budget", () => {
  it("uses four workers per validation lane", () => {
    expect(viteConfig).toContain("maxWorkers: 4");
    expect(viteConfig).not.toContain("maxWorkers: 2");
  });
});
