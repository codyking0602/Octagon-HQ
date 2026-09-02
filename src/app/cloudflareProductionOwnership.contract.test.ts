import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const wranglerConfig = readFileSync("wrangler.jsonc", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-cloudflare.yml", "utf8");
const liveDeliveryWorkflow = readFileSync(
  ".github/workflows/verify-live-frontend-delivery.yml",
  "utf8",
);
const richPreviewWorkflow = readFileSync(
  ".github/workflows/verify-live-rich-previews.yml",
  "utf8",
);

const canonicalProductionOrigin = "https://the.hq-app.workers.dev";

describe("Cloudflare production ownership", () => {
  it("keeps Wrangler pointed at the single renamed production Worker", () => {
    expect(wranglerConfig).toContain('"name": "the"');
    expect(wranglerConfig).not.toContain('"name": "octagon"');
  });

  it("keeps canonical frontend delivery on the renamed workers.dev origin", () => {
    expect(deployWorkflow).toContain(
      `OCTAGON_PRODUCTION_URL: ${canonicalProductionOrigin}`,
    );
    expect(deployWorkflow).toContain('echo "- Worker: the"');
    expect(deployWorkflow).not.toContain("octagon.hq-app.workers.dev");
  });

  it("keeps every frontend post-deploy proof on the same renamed origin", () => {
    for (const workflow of [liveDeliveryWorkflow, richPreviewWorkflow]) {
      expect(workflow).toContain(
        `OCTAGON_PRODUCTION_ORIGIN: ${canonicalProductionOrigin}`,
      );
      expect(workflow).not.toContain("octagon.hq-app.workers.dev");
    }
  });

  it("does not retain the completed one-time rename workflow", () => {
    expect(existsSync(".github/workflows/rename-cloudflare-worker.yml")).toBe(false);
  });
});
