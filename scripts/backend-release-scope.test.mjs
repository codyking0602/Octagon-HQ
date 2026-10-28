import { describe, expect, it, vi } from "vitest";
import {
  isBackendReleasePath,
  resolveChangedFiles,
} from "./backend-release-scope.mjs";

describe("backend release scope", () => {
  it("keeps normal frontend-only changes out of the Supabase deployment lane", () => {
    for (const path of [
      "src/features/home/HomePage.tsx",
      "src/features/rankings/RankingsPage.tsx",
      "src/features/rankings/data/v2RankingRoster.ts",
      "src/features/picks/PicksPage.tsx",
      "src/features/picks/spotlightContent.test.ts",
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
      "src/features/picks/spotlightContent.ts",
      "src/features/play/todaysChallengeRuntime.ts",
      "src/features/play/wavelengthEngine.ts",
      "package.json",
      "package-lock.json",
    ]) {
      expect(isBackendReleasePath(path), path).toBe(true);
    }
  });

  it("reads the exact single-commit changed-file list without the compare endpoint", async () => {
    const source = "a".repeat(40);
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        files: [
          { filename: "scripts/backend-release-scope.mjs" },
          { filename: "scripts/backend-release-scope.test.mjs" },
        ],
      }),
    }));

    await expect(
      resolveChangedFiles("codyking0602/Octagon-HQ", source, "token", fetchImpl),
    ).resolves.toEqual({
      files: [
        "scripts/backend-release-scope.mjs",
        "scripts/backend-release-scope.test.mjs",
      ],
      truncated: false,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://api.github.com/repos/codyking0602/Octagon-HQ/commits/${source}?per_page=100`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
  });

  it("treats a full commit-files page as truncated so deployment stays conservative", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        files: Array.from({ length: 100 }, (_, index) => ({ filename: `file-${index}.txt` })),
      }),
    }));

    const result = await resolveChangedFiles(
      "codyking0602/Octagon-HQ",
      "b".repeat(40),
      "token",
      fetchImpl,
    );
    expect(result.truncated).toBe(true);
  });
});
