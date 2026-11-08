import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PlayerCard } from "./NbaGmDevPage";
import type { NbaGmDevPlayer } from "./nbaGmDevModel";

const css = readFileSync("src/styles/nba-gm-dev.css", "utf8");
const nflCss = readFileSync("src/styles/football-gm-mode.css", "utf8");
const page = readFileSync("src/features/nba/NbaGmDevPage.tsx", "utf8");
const cardCss = css.slice(css.indexOf("/* Locked GM player-card parity"));
const base: NbaGmDevPlayer = {
  id:"nba-gm-compact-scouter", name:"Anthony Davis", teamCode:"LAC",
  positions:["C","PF"], currentGrade:90, ageAtStart:33,
  skills:{scoring:87, shooting:65, playmaking:65, perimeterDefense:82, interiorDefense:96, rebounding:89},
  salaries:[60_600_000, 62_000_000, 64_000_000],
  gameContract:"1YR", repriceRisk:"HIGH", developmentOdds:null,
  pricingKind:"SIGNED_REAL_SALARY_WINDOW", eligibilityKind:"PROVISIONAL_EDITORIAL",
  officialNbaPlayerId:null, officialRosterPosition:"C", positionReview:"unverified",
  reviewFlags:["availability-separate"],
};

describe("NBA GM locked NFL-player-card parity", () => {
  it("uses the NFL identity, badge and salary arrangement with a whole-card SELECT target", () => {
    const html = renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}}/>);
    expect(html).toContain("<button");
    expect(html).toContain("nba-gm-dev__scout-card");
    expect(html).toContain('aria-label="DRAFT Anthony Davis"');
    expect(html).toContain("football-gm__picker-player-copy");
    expect(html).toContain("football-gm__picker-action");
    expect(html).toContain("football-gm__candidate-tags");
    expect(html).toContain("nba-gm-dev__select-inline");
    expect(html).toContain("SELECT");
    expect(html).toContain("$60.6M");
    expect(html).toContain("BOOM/BUST");
    expect(html).toContain("risk-high");
    expect(html).toContain("HIGH REPRICE");
    expect(html).not.toContain("style=\"border-top-color:");
    expect(html).not.toContain('class="nba-gm-dev__primary"');
    expect(html).not.toContain("DRAFT Anthony Davis</button>");
    expect((html.match(/<button/g)||[]).length).toBe(1);
  });

  it("keeps every one of the six letter grades visible in ONE horizontal mobile row", () => {
    const html = renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}}/>);
    expect(html).toContain("nba-gm-dev__quick-skills");
    expect((html.match(/<small aria-label=/g)||[]).length).toBe(6);
    for (const label of ["SCOR","SHOOT","PLAY","PER D","INT D","REB"]) {
      expect(html).toContain(label);
    }
    expect(cardCss).toContain("grid-template-columns: repeat(6,minmax(0,1fr));");
    expect(cardCss.slice(cardCss.indexOf("@media (max-width: 680px)")))
      .toContain("grid-template-columns: repeat(6,minmax(0,1fr));");
    expect(cardCss).not.toContain("grid-template-columns: repeat(3,minmax(0,1fr))");
    expect(cardCss).toContain("flex-direction: column;");
    expect(cardCss).toContain("@media (max-width: 355px)");
  });

  it("matches NFL's actual headshot box, quiet border and text-only action", () => {
    expect(cardCss).toContain("grid-template-columns: 46px minmax(0,1fr) auto;");
    expect(cardCss).toContain("grid-template-columns: 44px minmax(0,1fr) auto;");
    expect(cardCss).toContain("background: rgba(255,255,255,.92);");
    expect(cardCss).toContain("border: 1px solid rgba(255,255,255,.07);");
    expect(cardCss).toContain("background: rgba(255,255,255,.025);");
    expect(cardCss).toContain("background: transparent;");
    expect(cardCss).not.toContain("border-top: 2px solid #a87843;");
    expect(nflCss).toContain('margin-bottom: 4px;');
    expect(css).toContain('padding: 4px 10px 10px;');
  });

  it("uses the same NFL tier, outlook, and risk colors, including green ELITE", () => {
    expect(css).not.toContain(".nba-gm-dev .football-gm__quality-pill.quality-impact { border-color: rgba(243,164,73,.5)");
    expect(nflCss).toContain(".football-gm__quality-pill.quality-elite {");
    expect(nflCss).toContain("color: #9bd9b7;");
    for (const [risk,expected] of [["LOW","risk-low"],["MEDIUM","risk-medium"],["HIGH","risk-high"]] as const) {
      const html = renderToStaticMarkup(<PlayerCard player={{...base,repriceRisk:risk}} onPick={()=>{}}/>);
      expect(html).toContain(expected);
    }
    const html = renderToStaticMarkup(<PlayerCard player={{...base,currentGrade:94}} onPick={()=>{}}/>);
    expect(html).toContain("quality-elite");
    expect(html).toContain("ELITE");
    expect(html).toContain("outlook-volatile");
    expect(nflCss).toContain(".football-gm__outlook-pill.outlook-decline");
    expect(nflCss).toContain(".football-gm__candidate-tags .risk-high");
  });

  it("lets all seven NBA cards grow instead of shrinking into the inherited 410px scroll area", () => {
    expect(css).toContain(".nba-gm-dev__candidate-grid.football-wheel-picker__candidates");
    expect(css).toContain("max-height: none;");
    expect(css).toContain("overflow: visible;");
    expect(css).toContain("grid-auto-rows: max-content;");
    expect(css).toContain("grid-template-rows: auto auto;");
    expect(css).toContain("min-height: max-content;");
    expect(css).toContain("grid-row: 2;");
  });

  it("stacks the six skill grades below the intact name/salary/SELECT row at every mobile width", () => {
    expect(cardCss).toContain("display: flex;");
    expect(cardCss).toContain("flex-direction: column;");
    expect(cardCss).toContain("align-items: stretch;");
    expect(cardCss).toContain("row-gap: 7px;");
    expect(cardCss).toContain(".nba-gm-dev__scout-card > .nba-gm-dev__quick-skills");
    expect(cardCss).toContain("flex: 0 0 auto;");
    expect(cardCss).toContain("position: static;");
    expect(cardCss).toContain("padding-top: 7px;");
    expect(cardCss).toContain("grid-template-columns: repeat(6,minmax(0,1fr));");
    const html = renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}}/>);
    expect(html.indexOf("nba-gm-dev__player-head")).toBeLessThan(html.indexOf("nba-gm-dev__quick-skills"));
    expect(html).toContain("$60.6M");
    expect(html).toContain("SELECT");
  });

  it("compacts only the settled draft wheel and removes the picker-header dead band", () => {
    expect(page).toContain('run.pendingTeam&&!wheelSpinning?" is-team-picked":""');
    expect(css).toContain(".nba-gm-dev__draft.is-team-picked .football-wheel");
    expect(css).toContain("min-height: 254px;");
    expect(css).toContain("width: 224px;");
    expect(css).toContain("padding: 10px 12px 2px;");
    expect(css).toContain("padding: 4px 12px 2px;");
  });

  it("keeps 3YR · LOCKED on one line and preserves free-agency actions", () => {
    const player = {...base,gameContract:"3YR" as const,repriceRisk:"LOCKED" as const};
    const html = renderToStaticMarkup(<PlayerCard player={player} onPick={()=>{}}/>);
    expect(html).toContain("3YR · LOCKED");
    expect(html).toContain("risk-locked");
    expect(html).toContain('aria-label="Three-year contract, salary locked"');
    expect(html).not.toContain(">SALARY LOCKED<");
    expect(html).not.toContain(">3YR</span>");
    expect(cardCss).toContain("flex-wrap: nowrap;");
    const fa = renderToStaticMarkup(<PlayerCard player={base} onPick={()=>{}} action="SIGN" salaryYear={1}/>);
    expect(fa).toContain('aria-label="SIGN Anthony Davis"');
    expect(fa).toContain("YEAR 2");
    expect(fa).toContain("$62.0M");
    // Current franchises preview a server-vetted lineup before signing.
    // Older saved franchises retain their original direct-SIGN action.
    expect(page).toContain('action={run.rosterQualityVersion===1?"PREVIEW":"SIGN"} salaryYear={1}');
    expect(page).toContain('action={run.rosterQualityVersion===1?"PREVIEW":"SIGN DEPTH"}');
    expect(page).toContain('onClick={()=>void act("sign",selectedFreeAgentId)}');
    expect(page).toContain('onClick={()=>void act("emergency-sign",selectedFreeAgentId)}');
  });
});
