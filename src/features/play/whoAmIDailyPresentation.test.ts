import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Who Am I official Daily presentation ownership", () => {
  const ufcDaily = readFileSync("src/features/play/OfficialTodayChallengePage.tsx", "utf8");
  const footballDaily = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
  const router = readFileSync("src/app/router.tsx", "utf8");
  const view = readFileSync("src/features/play/OfficialWhoAmIDailyView.tsx", "utf8");
  const casual = readFileSync("src/features/play/WhoAmIPage.tsx", "utf8");

  it("uses one shared Who Am I Daily gameplay presentation in UFC and Football", () => {
    expect(ufcDaily).toContain('import { OfficialWhoAmIDailyView } from "./OfficialWhoAmIDailyView"');
    expect(footballDaily).toContain('import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView"');
    expect(ufcDaily).toContain('projection.gameType === "who_am_i"');
    expect(footballDaily).toContain('projection.gameType === "who_am_i"');
  });

  it("routes UFC Daily through the existing official route gate while preserving casual Who Am I", () => {
    expect(router).toContain('<TodayChallengeGameRoute gameType="who_am_i" casual={<UfcWhoAmIPage />} />');
    expect(casual).toContain("WHO_AM_I_RECENT_SUBJECTS_STORAGE_KEY");
    expect(casual).toContain("rememberRecentSubject");
    expect(view).not.toContain("localStorage");
    expect(view).not.toContain("rememberRecentSubject");
  });

  it("reveals the identity only from the post-completion reveal setup", () => {
    expect(view).toContain("const identity = subject(reveal.identity)");
    expect(view).toContain("attempt ?");
    expect(view).not.toContain("hidden_subject_id");
  });
});
