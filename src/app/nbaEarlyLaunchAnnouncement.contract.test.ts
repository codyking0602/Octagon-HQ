import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";
const runbook=readFileSync("docs/nba-early-public-launch-runbook-20261029.md","utf8");
const sql=readFileSync("ops/nba-public-early-launch-manual-push.sql","utf8");
const intro=readFileSync("src/features/nba/NbaWelcomeTakeover.tsx","utf8");
const championship=readFileSync("src/features/nba/NbaChampionshipPage.tsx","utf8");

describe("NBA launch announcement is post-verification and manual",()=>{
  it("never publishes from migrations, crons, or frontend render",()=>{
    expect(sql).toContain("MANUAL GO-LIVE ONLY");
    expect(sql).toContain("hq:nba:games-cup-public-launch:2026");
    expect(sql).toContain("nba_launch_available");
    expect(sql).toContain("2026-10-30");
    expect(sql).toContain("notification_nba_release_gate");
    expect(sql).toContain("select distinct profile.id");
    expect(sql).toContain("publish_notification_to_profile");
    expect(runbook).toContain("only after verified go-live");
    expect(runbook).toContain("do not run both");
  });
  it("updates intro to the current Cup Picks and official NBA Daily",()=>{
    expect(intro).toContain("02 · AVAILABLE NOW");
    expect(intro).toContain("03 · AVAILABLE NOW");
    expect(intro).toContain("October 30");
    expect(intro).toContain("EXPLORE NBA PICKS");
    expect(intro).not.toContain("AFTER THE WORLD SERIES");
    expect(championship).toContain("NBA Cup Picks and games are here");
    expect(championship).toContain("VIEW NBA PICKS");
    expect(championship).not.toContain("games join later");
  });
});
