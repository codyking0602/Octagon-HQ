import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("temporary repair tree probe", () => {
  it("records the exact branch tree used for the asset commit", () => {
    const treeSha = execFileSync("git", ["rev-parse", "HEAD^{tree}"], {
      encoding: "utf8",
    }).trim();
    console.log(`PLAY_THUMBNAIL_REPAIR_TREE_SHA=${treeSha}`);
    expect(treeSha).toMatch(/^[0-9a-f]{40}$/);
  });
});
