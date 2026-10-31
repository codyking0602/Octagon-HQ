import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const final=readFileSync("src/features/nba/NbaGmFinalExperience.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
describe("NBA GM Priority 4 — final presentation focused follow-up",()=>{
 it("shows fit after Year 1 and in offseason, never redundantly on the final recap",()=>{
  expect(page).toContain('(run.phase==="year1"||run.phase==="offseason")&&<FitReport');
  expect(page).not.toContain('run.phase==="final")&&<FitReport');
 });
 it("presents the three-season result before optional highlights and transactions",()=>{
  expect(final.indexOf('aria-label="Three-year NBA GM final result"')).toBeGreaterThan(0);
  expect(final.indexOf('gm-final__hero surface-card')).toBeLessThan(final.indexOf('THREE-YEAR RESULTS'));
  expect(final.indexOf('THREE-YEAR RESULTS')).toBeLessThan(final.indexOf('YOUR FINAL ROSTER'));
  expect(final).toContain('arrivals.length>0&&<section');
  expect(final).toContain('(biggestJump?.delta??0)>=.85');
  expect(final).toContain('score.roster');
  expect(final).toContain('missedEveryPlayoff');
 });
 it("keeps Football final styling and protects the NBA recap on narrow phones",()=>{
  expect(final).toContain('football-gm-final gm-final nba-gm-final');
  expect(final).toContain("nbaGmOfficialHeadshotId(player)");
  expect(css).toContain('@media(max-width:480px)');
  expect(css).toContain('.nba-gm-final .gm-final__player-identity{grid-template-columns:23px');
  expect(css).toContain('overflow-wrap:anywhere');
 });
});
