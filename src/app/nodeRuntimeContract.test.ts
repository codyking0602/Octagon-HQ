import nodeVersion from "../../.nvmrc?raw";
import cloudflareWorkflow from "../../.github/workflows/deploy-cloudflare.yml?raw";
import validateWorkflow from "../../.github/workflows/validate.yml?raw";
import { describe, expect, it } from "vitest";

describe("Node runtime contract", () => {
  it("uses the hosted Node 22 line for validation and frontend production builds", () => {
    expect(nodeVersion.trim()).toBe("22");
    expect(validateWorkflow).toContain("node-version-file: .nvmrc");
    expect(cloudflareWorkflow).toContain("node-version: 22");
  });
});
