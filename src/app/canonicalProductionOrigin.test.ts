import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("canonical production origin ownership", () => {
  it("keeps the post-deploy model sync on The HQ production host", () => {
    const workflow = readFileSync(
      new URL("../../.github/workflows/sync-whats-new-rankings.yml", import.meta.url),
      "utf8",
    );

    expect(workflow).toContain("OCTAGON_PRODUCTION_ORIGIN: https://the.hq-app.workers.dev");
    expect(workflow).not.toContain("OCTAGON_PRODUCTION_ORIGIN: https://octagon.hq-app.workers.dev");
  });
});
