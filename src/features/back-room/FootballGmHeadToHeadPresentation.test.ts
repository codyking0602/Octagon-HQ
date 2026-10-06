import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballGmHeadToHeadPage.tsx"),
  "utf8",
);
const css = readFileSync(
  resolve(process.cwd(), "src/styles/football-gm-mode.css"),
  "utf8",
);
const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202612310271_football_gm_head_to_head.sql"),
  "utf8",
);
const polishMigration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202612310273_football_gm_year1_ack_and_completion.sql"),
  "utf8",
);
const report = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballGmFranchiseReport.tsx"),
  "utf8",
);

describe("The GM head-to-head presentation", () => {
  it("keeps the approved intro and offers the original solo run or one-GM play", () => {
    expect(page).toContain("BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.");
    expect(page).toContain("<strong>SOLO RUN</strong>");
    expect(page).toContain('navigate("/football/gm-mode?solo=1")');
    expect(page).toContain("<FootballGmSoloPage startImmediately standalone />");
    expect(page).not.toContain("<strong>VS CPU</strong>");
    expect(page).toContain("HEAD TO HEAD");
    expect(page).toContain("Alternate every draft pick");
    expect(page).toContain("the worse Year 1 team gets the first full offseason");
  });

  it("uses the shared two-sided seven-position board throughout the match", () => {
    expect(page).toContain("function VersusRosterBoard");
    expect(page).toContain("FOOTBALL_GM_ROSTER_SLOTS.map");
    expect(page).toContain("football-gm-versus__row");
    expect(page).toContain("<PlayerQualityPill player={player} />");
    expect(page).toContain("<PlayerOutlookPill outlook={player.outlook} />");
    expect(css).toContain(".football-gm-versus__row");
    expect(css).toContain(".football-gm-versus__pills");
  });

  it("keeps one shared player market and hands the whole offseason to one GM at a time", () => {
    expect(page).toContain("excludedPlayerIds={opponentHeldIds}");
    expect(page).toContain("Players already held by");
    expect(page).toContain("FINISH OFFSEASON");
    expect(page).toContain("They get their entire offseason first.");
    expect(migration).toContain("That player was already drafted in this match");
    expect(migration).toContain("That player is already held by the other GM");
    expect(migration).toContain("offseason_first_profile_id");
    expect(migration).toContain("The remaining market is yours");
  });

  it("uses the same wheel treatment for draft, trade partner, and free agency", () => {
    expect(page.match(/<GmFootballWheel/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(page).toContain("SPIN THE 1YR MARKET");
    expect(page).toContain("faWheelSpinning");
    expect(page).toContain("}, 1550);");
    expect(css).toContain(".football-gm__market-wheel");
    expect(css).toContain(".football-gm__trade-wheel-stage");
  });

  it("uses compact front-office controls instead of the old offseason documentation stack", () => {
    expect(page).toContain("function FrontOfficeSummary");
    expect(page).toContain("GET UNDER BOTH CAPS");
    expect(page).toContain("RELEASE PLAYER");
    expect(page).toContain("CREATE AN FA OPENING");
    expect(page).not.toContain("CREATE ONE EXTRA FA OPENING");
    expect(css).toContain(".football-gm__front-office-summary");
    expect(css).toContain(".football-gm__front-office-actions");
  });
  it("makes the Year 1 matchup a persistent, acknowledged handoff", () => {
    expect(page).toContain("showPersistentYearOne");
    expect(page).toContain("acknowledgeYearOne");
    expect(page).toContain("OFFSEASON PRIORITY");
    expect(page).toContain("Lower Year 1 finisher gets first access to the shared player market.");
    expect(page).toContain("function YearOneMiniRecap");
    expect(polishMigration).toContain("year1_acknowledged_at");
    expect(polishMigration).toContain("acknowledge_football_gm_year1");
  });

  it("cannot let notification delivery roll back a completed offseason", () => {
    expect(polishMigration).toContain("'game_challenge_result_ready'");
    expect(polishMigration).not.toContain("'game_challenge_completed'");
    expect(polishMigration).toContain("exception when others then");
    expect(polishMigration).toContain("Completion is authoritative. Notification delivery must never roll it back.");
  });

  it("ends with a focused franchise postmortem instead of an internal-data report", () => {
    expect(page).toContain("FootballGmFranchiseReport");
    expect(report).toContain("FRANCHISE ARC");
    expect(report).toContain("ROSTER EVOLUTION");
    expect(report).toContain("OFFSEASON TRANSACTIONS");
    expect(report).toContain("WHERE THE MATCH WAS WON");
    expect(report).toContain("Original core");
    expect(report).toContain("GM Score");
    expect(report).not.toContain("BEST ROSTER DECISION");
    expect(report).not.toContain("WHAT COST YOU");
    expect(report).not.toContain("THE OWNER'S VERDICT");
    expect(report).not.toContain("WHEELER-DEALER");
    expect(report).not.toContain("continuity.year3.meter");
    expect(css).toContain(".football-gm-report__evolution-row");
    expect(css).toContain(".football-gm-report__ledger");
  });

  it("shows Team OVR rather than exposing the hidden internal team grade", () => {
    expect(page).toContain("footballGmTeamOverall(left.teamGrade)");
    expect(page).toContain("footballGmTeamOverall(right.teamGrade)");
    expect(report).toContain("teamOveralls[index]");
    expect(report).toContain(" OVR");
    expect(report).not.toContain("teamGrade.toFixed");
  });

  it("compresses the seven-player offseason core without stripping scouting context", () => {
    expect(page).toContain("compact");
    expect(css).toContain(".football-gm__roster.is-compact .football-gm__roster-grid > article");
    expect(css).toContain("min-height: 46px");
    expect(css).toContain(".football-gm__roster.is-compact .football-gm__roster-scouting");
  });

});
