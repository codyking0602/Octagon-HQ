import { describe, expect, it } from "vitest";
import {
  changedFilesFromPushPayload,
  isBackendReleasePath,
} from "./backend-release-scope.mjs";

describe("backend release scope", () => {
  it("keeps normal frontend-only changes out of the Supabase deployment lane", () => {
    for (const path of [
      "src/features/home/HomePage.tsx",
      "src/features/rankings/RankingsPage.tsx",
      "src/features/rankings/data/v2RankingRoster.ts",
      "src/features/picks/PicksPage.tsx",
      "public/fighters/robbie-lawler.webp",
      "worker/index.ts",
      ".github/workflows/deploy-cloudflare.yml",
      "docs/HANDOFF.md",
      "docs/ranking-profile-copy.md",
    ]) {
      expect(isBackendReleasePath(path), path).toBe(false);
    }
  });

  it("routes every canonical backend-owned surface through the Supabase deployment lane", () => {
    for (const path of [
      "supabase/migrations/202608160001_example.sql",
      "supabase/functions/pin-auth/index.ts",
      ".github/workflows/deploy-supabase.yml",
      "scripts/backend-release-scope.mjs",
      "scripts/bundle-daily-challenge-runtime.mjs",
      "scripts/configure-monitoring-scheduler.mjs",
      "scripts/verify-monitoring-function-deployment.mjs",
      "scripts/verify-sync-function-deployment.mjs",
      "src/features/play/todaysChallengeRuntime.ts",
      "src/features/play/wavelengthEngine.ts",
      "package.json",
      "package-lock.json",
    ]) {
      expect(isBackendReleasePath(path), path).toBe(true);
    }
  });

  it("derives the exact changed-file set from the push payload without a compare API call", () => {
    expect(
      changedFilesFromPushPayload({
        size: 2,
        commits: [
          {
            added: ["docs/ranking-profile-copy.md"],
            modified: ["src/features/rankings/data/v2RankingRoster.ts"],
            removed: [],
          },
          {
            added: ["src/features/rankings/data/profileCopyProtection.test.ts"],
            modified: ["src/features/rankings/data/v2RankingRoster.ts"],
            removed: ["docs/old-profile-copy.md"],
          },
        ],
      }),
    ).toEqual({
      files: [
        "docs/ranking-profile-copy.md",
        "src/features/rankings/data/v2RankingRoster.ts",
        "src/features/rankings/data/profileCopyProtection.test.ts",
        "docs/old-profile-copy.md",
      ],
      truncated: false,
    });
  });

  it("deploys conservatively when GitHub truncates the push commit list", () => {
    expect(
      changedFilesFromPushPayload({
        size: 2,
        commits: [{ added: [], modified: ["src/App.tsx"], removed: [] }],
      }).truncated,
    ).toBe(true);
  });
});
