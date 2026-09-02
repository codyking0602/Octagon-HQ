import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("canonical production origin ownership", () => {
  it("keeps the post-deploy model sync on The HQ production host", () => {
    const workflow = readFileSync(
      resolve(process.cwd(), ".github/workflows/sync-whats-new-rankings.yml"),
      "utf8",
    );

    expect(workflow).toContain("OCTAGON_PRODUCTION_ORIGIN: https://the.hq-app.workers.dev");
    expect(workflow).not.toContain("OCTAGON_PRODUCTION_ORIGIN: https://octagon.hq-app.workers.dev");
  });
});
