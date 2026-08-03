import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const auctionContract = readFileSync("docs/auction-game.md", "utf8");
const backendDeployment = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);
const backendVerification = readFileSync(
  ".github/workflows/verify-supabase-backend.yml",
  "utf8",
);

const pr5MigrationVersions = [
  "202609020001",
  "202609020002",
  "202609020003",
  "202609020004",
  "202609020005",
  "202609020006",
  "202609020007",
  "202609020008",
] as const;

describe("Auction PR 5 release proof", () => {
  it("preserves the canonical merged and deployed PR 5 record", () => {
    expect(auctionContract).toContain(
      "| Auction PR 5: real UFC content and private grading | Complete | #274 | `3fdac6e7e526d92e437789c2bed128fa821914ee` |",
    );
    expect(auctionContract).toContain(
      "Its exact reviewed head `bb78d8a5db2bac51897bbfe7c60bfdd943376353`",
    );
    expect(auctionContract).toContain(
      "migrations `202609020001` through `202609020008`",
    );
    expect(auctionContract).toContain(
      "PR 6 remains the notification-completion and final release-proof stage.",
    );
    expect(auctionContract).not.toContain(
      "Implemented on the current branch; not released",
    );
    expect(auctionContract).not.toContain("Draft PR");
  });

  it("hard-fails deployment proof when any PR 5 migration is absent remotely", () => {
    for (const version of pr5MigrationVersions) {
      expect(backendDeployment).toContain(
        `require_remote_migration \"${version}\"`,
      );
    }
    expect(backendDeployment).toContain(
      "Auction real-content and private-grading migrations 202609020001 through 202609020008 verified in linked production history",
    );
  });

  it("treats the live-verifier script as verification code, not deployed frontend runtime", () => {
    expect(backendVerification).toContain(
      '- "scripts/verify-live-frontend-delivery.mjs"',
    );
    const runtimePatterns = backendVerification.match(
      /const runtimePathPatterns = \[([\s\S]*?)\n\s*\];/,
    )?.[1];
    expect(runtimePatterns).toBeDefined();
    expect(runtimePatterns).not.toContain(
      "scripts\\/verify-live-frontend-delivery",
    );
    expect(runtimePatterns).toContain("^src\\/");
  });
});
