import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/OwnerAverageFanDailyPreviewPage.tsx", "utf8");
const repositorySource = readFileSync("src/features/play/todayChallengeRepository.ts", "utf8");
const routerSource = readFileSync("src/app/router.tsx", "utf8");
const shellSource = readFileSync("src/app/AppShell.tsx", "utf8");
const edgeSource = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const migrationSource = readFileSync(
  "supabase/migrations/202612310219_owner_average_fan_daily_preview.sql",
  "utf8",
);

describe("owner Average Fan canonical Daily preview", () => {
  it("keeps the hidden preview route owner-gated and on the official Daily presentation", () => {
    expect(routerSource).toContain(
      '{ path: "play/average-fan-preview", element: <OwnerAverageFanDailyPreviewPage /> }',
    );
    expect(pageSource).toContain("identity.profile?.canControlPicks === true");
    expect(pageSource).toContain("<Navigate replace");
    expect(pageSource).toContain("<OfficialAverageFanDailyView");
    expect(shellSource).toContain('location.pathname === "/play/average-fan-preview"');
  });

  it("loads and advances through dedicated owner preview modes instead of the official attempt repository", () => {
    expect(repositorySource).toContain('mode: "owner-preview-get"');
    expect(repositorySource).toContain('mode: "owner-preview-advance"');
    expect(repositorySource).not.toContain("public_state: projection.publicState");
    expect(repositorySource).not.toMatch(
      /createOwnerAverageFanPreviewRepository[\s\S]*?save_daily_challenge_runtime_progress/,
    );
  });

  it("rebuilds the exact scheduled Average Fan setup and never saves official Daily progress", () => {
    const previewStart = edgeSource.indexOf("async function ownerAverageFanPreview(");
    const previewEnd = edgeSource.indexOf("\nDeno.serve", previewStart);
    const previewSource = edgeSource.slice(previewStart, previewEnd);

    expect(previewSource).toContain('"get_owner_average_fan_daily_preview_descriptor"');
    expect(previewSource).toContain("buildAverageFanDailySetup(");
    expect(previewSource).toContain("advanceAverageFanDailyRuntime(context, action)");
    expect(previewSource).toContain('"get_owner_average_fan_daily_preview_progress"');
    expect(previewSource).toContain('"save_owner_average_fan_daily_preview_progress"');
    expect(previewSource).toContain('"grade_owner_average_fan_daily_preview"');
    expect(previewSource).not.toContain("save_daily_challenge_runtime_progress");
    expect(previewSource).not.toContain("finalizePending");
  });

  it("keeps preview persistence private, owner-only, and outside official Daily progress", () => {
    expect(migrationSource).toContain("private.owner_average_fan_daily_preview_progress");
    expect(migrationSource).toContain("enable row level security");
    expect(migrationSource).toContain("get_owner_average_fan_daily_preview_progress");
    expect(migrationSource).toContain("save_owner_average_fan_daily_preview_progress");
    expect(migrationSource).not.toContain("insert into private.daily_challenge_progress");
    expect(migrationSource).not.toContain("insert into private.daily_challenge_attempts");
    expect(migrationSource).toContain("public.is_pick_control_owner(p_profile_id)");
    expect(migrationSource).toContain("private.daily_challenge_schedule_for_day(p_day, p_sport)");
    expect(migrationSource).toContain("private.daily_challenge_expected_game(v_schedule_version, p_day)");
    expect(migrationSource).toContain("private.grade_daily_challenge_pre_combo(");
    expect(migrationSource).toContain("'average_fan'");
    expect(migrationSource).toContain("to service_role;");
  });

  it("uses optimistic revisions so refresh/resume behaves like the official Daily runtime", () => {
    expect(migrationSource).toContain("p_expected_revision integer");
    expect(migrationSource).toContain("progress.revision + 1");
    expect(migrationSource).toContain("errcode = '40001'");
    expect(edgeSource).toContain('"STALE_PROGRESS"');
    expect(edgeSource).toContain("Number(body.revision) !== revision");
    expect(repositorySource).toContain("revision: projection.progressRevision");
  });

  it("restricts preview descriptor and grading to the private Picks owner and canonical scoring gate", () => {
    expect(migrationSource).toContain("public.is_pick_control_owner(p_profile_id)");
    expect(migrationSource).toContain("private.daily_challenge_schedule_for_day(p_day, p_sport)");
    expect(migrationSource).toContain("private.daily_challenge_expected_game(v_schedule_version, p_day)");
    expect(migrationSource).toContain("private.grade_daily_challenge_pre_combo(");
    expect(migrationSource).toContain("'average_fan'");
    expect(migrationSource).toContain("to service_role;");
  });
});
