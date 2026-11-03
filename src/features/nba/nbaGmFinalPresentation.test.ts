import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const final=readFileSync("src/features/nba/NbaGmFinalExperience.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");
describe("NBA GM Priority 4 — final presentation focused follow-up",()=>{
 it("keeps development visible in the offseason roster rather than another report",()=>{
  expect(page).not.toContain('<FitReport');
  expect(page).toContain('run.phase==="offseason"&&run.development?.[player.id]');
  expect(page).toContain('nba-gm-dev__roster-development');
 });
 it("leads the offseason with the full cap and roster, then optional release and advance",()=>{
  const offseason=page.slice(page.indexOf("{run&&<>"),page.indexOf('{run.phase==="final"'));
  expect(page).toContain('(run.phase==="draft"||run.phase==="year1"||run.phase==="offseason")&&!isTradeStage&&<section className={`football-gm__cap');
  expect(page).toContain('(run.phase==="draft"||run.phase==="year1"||run.phase==="offseason")&&!isTradeStage&&<section className="football-gm__roster');
  expect(offseason.indexOf("nba-gm-dev__caps")).toBeLessThan(offseason.indexOf("nba-gm-dev__roster-panel"));
  expect(offseason.indexOf("{releasePanel}")).toBeLessThan(offseason.indexOf("SIMULATE YEARS 2 & 3"));
  expect(page).not.toContain('<NbaGmDevelopmentReport');
  expect(page).not.toContain("showOffseasonReport");
  expect(page).toContain("ONE VOLUNTARY RELEASE");
  expect(page).toContain('window.confirm("Release "+player.name');
  expect(page).not.toContain('>CUT</button>');
  expect(css).toContain(".nba-gm-dev__release-row");
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
  // The final is a five-column Football roster grid: a draft-size portrait
  // can overflow a narrow phone even when text wrapping is correct.
  expect(final).toContain('className="gm-final__portrait nba-gm-final__portrait"');
  expect(final).not.toContain('className="nba-gm-dev__portrait"');
  expect(css).toContain('.nba-gm-final .nba-gm-final__portrait>img{object-fit:contain');
 });
 it("falls back to a visible team abbreviation when headshot or team SVG fails",()=>{
  expect(final).toContain('<FinalTeamLogo code={player.teamCode} inset />');
  expect(final).toContain('<FinalTeamLogo code={row.player.teamCode}/>');
  expect(final).toContain('onError={() => setFailed(true)}');
  expect(final).toContain('className="nba-gm-final__team-code"');
  expect(css).toContain('.nba-gm-final__team-code{display:block');
 });
});
