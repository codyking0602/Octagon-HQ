import { describe, expect, it } from "vitest";
import page from "./NbaPlayPage.tsx?raw";
import shared from "../play/PlayV2Page.tsx?raw";
import nbaCss from "../../styles/nba-games-hub.css?raw";
import playCss from "../../styles/play-v2.css?raw";
import { NBA_CASUAL_GAME_TYPES, NBA_DAILY_WEIGHTED_CYCLE, NBA_OFFICIAL_GAMES_RELEASE_READY } from "./nbaDailySchedule";

describe("NBA Play mirrors UFC Play layout", () => {
  it("uses the identical compact card primitives in the correct hierarchy", () => {
    const sections = [
      'className="play-v2__heading"',
      'className="play-v2__daily"',
      'className="play-v2__performance"',
      '<MatchupsCompact sport="nba" />',
      'className="play-v2__room"',
    ];
    let lastIndex = -1;
    for (const section of sections) {
      const at = page.indexOf(section);
      expect(at).toBeGreaterThan(lastIndex);
      lastIndex = at;
    }
    expect(page).toContain('className="play-v2__room-grid"');
    expect(page).toContain('className="play-v2__game"');
    expect(page).toContain('className="play-v2__metrics"');
    expect(page).toContain('className="play-v2__daily-row"');
    expect(page).not.toContain("<TodayChallengeHub");
    expect(page).toContain('className="play-v2__daily-actions"');
    expect(page).toContain('className="play-v2__daily-leaders"');
    expect(playCss).toContain(".play-v2__daily {");
    expect(nbaCss).toContain('.play-v2[data-sport="nba"]');
  });

  it("only features nine Daily and four Casual, while protecting preview-only scores", () => {
    expect(NBA_CASUAL_GAME_TYPES).toHaveLength(4);
    expect(new Set(NBA_DAILY_WEIGHTED_CYCLE).size).toBe(9);
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(page).toContain("Private previews do not count.");
    expect(page).toContain('ownerTest ? "test games" : "official games"');
    expect(page).toContain('dailyCompleted ? "VIEW RESULT"');
    expect(page).toContain("Owner-only scored rehearsal · not ranked publicly");
    expect(page).toContain("disabled={!published}");
    expect(page).toContain("Daily Test Catalog");
    expect(page).toContain("previewRoute(game)");
  });

  it("reuses the existing UFC matchups component with NBA game isolation", () => {
    expect(shared).toContain('export function MatchupsCompact({ sport }: { sport: PlaySport | "nba" })');
    expect(shared).toContain('challenge.gameVersion.startsWith("nba-")');
    expect(shared).toContain('challenge.playUrl.includes("/nba/")');
    expect(shared).toContain("viewResults(match.code)");
    expect(shared).toContain("markOpened(challenge.code)");
  });
});
