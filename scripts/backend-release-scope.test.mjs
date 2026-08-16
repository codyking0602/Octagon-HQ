import { describe, expect, it } from "vitest";
import { isBackendReleasePath } from "./backend-release-scope.mjs";

describe("backend release scope", () => {
  it("keeps normal frontend-only changes out of the Supabase deployment lane", () => {
    for (const path of [
      "src/features/home/HomePage.tsx",
      "src/features/rankings/RankingsPage.tsx",
      "src/features/picks/PicksPage.tsx",
      "public/fighters/robbie-lawler.webp",
      "worker/index.ts",
      ".github/workflows/deploy-cloudflare.yml",
      "docs/HANDOFF.md",
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
});
