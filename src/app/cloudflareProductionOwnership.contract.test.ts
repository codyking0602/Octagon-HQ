import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const wranglerConfig = readFileSync("wrangler.jsonc", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");

describe("Cloudflare production ownership", () => {
  it("keeps Wrangler pointed at the single renamed production Worker", () => {
    expect(wranglerConfig).toContain('"name": "the"');
    expect(wranglerConfig).not.toContain('"name": "octagon"');
  });

  it("keeps canonical frontend delivery on the renamed workers.dev origin", () => {
    expect(deployWorkflow).toContain(
      "OCTAGON_PRODUCTION_URL: https://the.hq-app.workers.dev",
    );
    expect(deployWorkflow).toContain('echo "- Worker: the"');
    expect(deployWorkflow).not.toContain("octagon.hq-app.workers.dev");
  });

  it("does not retain the completed one-time rename workflow", () => {
    expect(existsSync(".github/workflows/rename-cloudflare-worker.yml")).toBe(false);
  });
});
