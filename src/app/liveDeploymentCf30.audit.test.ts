import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const expectedSha = "cf30b1f7ab181155e0589c64b6ea3cf616a039a0";

describe("exact live frontend audit", () => {
  it("proves production is serving the exact current main SHA", () => {
    const output = execFileSync(
      process.execPath,
      ["scripts/verify-live-frontend-delivery.mjs"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          EXPECTED_SOURCE_SHA: expectedSha,
          OCTAGON_PRODUCTION_ORIGIN: "https://octagon.hq-app.workers.dev",
          FRONTEND_DELIVERY_ATTEMPTS: "24",
          FRONTEND_DELIVERY_DELAY_MS: "5000",
        },
        timeout: 125_000,
      },
    );

    expect(output).toContain(`PASS: live shell loads deployment ${expectedSha}`);
  }, 130_000);
});
