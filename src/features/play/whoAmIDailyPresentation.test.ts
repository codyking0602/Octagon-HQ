import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Who Am I official Daily presentation ownership", () => {
  const ufcDaily = readFileSync("src/features/play/OfficialTodayChallengePage.tsx", "utf8");
  const footballDaily = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
  const router = readFileSync("src/app/router.tsx", "utf8");
  const view = readFileSync("src/features/play/OfficialWhoAmIDailyView.tsx", "utf8");
  const casual = readFileSync("src/features/play/WhoAmIPage.tsx", "utf8");
  const shared = readFileSync("src/features/play/WhoAmIPresentation.tsx", "utf8");

  it("uses one shared Who Am I presentation for casual and official Daily", () => {
    expect(casual).toContain('import WhoAmIPresentation from "./WhoAmIPresentation"');
    expect(view).toContain('import WhoAmIPresentation from "./WhoAmIPresentation"');
    expect(casual).toContain("<WhoAmIPresentation");
    expect(view).toContain("<WhoAmIPresentation");
    expect(shared).toContain('className="page twenty-questions-page who-am-i-page"');
    expect(shared).toContain("REVIEW ALL CLUES");
    expect(shared).toContain("PLAY AGAIN");
  });

  it("keeps one official Daily runtime in UFC and Football without a second Football Who Am I shell", () => {
    expect(ufcDaily).toContain('import { OfficialWhoAmIDailyView } from "./OfficialWhoAmIDailyView"');
    expect(footballDaily).toContain('import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView"');
    expect(ufcDaily).toContain('projection.gameType === "who_am_i"');
    expect(footballDaily).toContain('if (projection.gameType === "who_am_i")');
    expect(footballDaily.indexOf('if (projection.gameType === "who_am_i")'))
      .toBeLessThan(footballDaily.lastIndexOf('<div className="page football-today-page">'));
  });

  it("routes UFC Daily through the existing official route gate while preserving casual replay memory", () => {
    expect(router).toContain('<TodayChallengeGameRoute gameType="who_am_i" casual={<UfcWhoAmIPage />} />');
    expect(casual).toContain("WHO_AM_I_RECENT_SUBJECTS_STORAGE_KEY");
    expect(casual).toContain("rememberRecentSubject");
    expect(view).not.toContain("localStorage");
    expect(view).not.toContain("rememberRecentSubject");
  });

  it("reveals the official identity only from the post-completion reveal setup", () => {
    expect(view).toContain("const identity = subject(reveal.identity)");
    expect(view).toContain("attempt ?");
    expect(view).not.toContain("hidden_subject_id");
  });
});
