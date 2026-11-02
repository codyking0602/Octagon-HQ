import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");

describe("NBA GM dedicated trade screen and scouting-first target selection",()=>{
  it("opens a dedicated trade screen without duplicating the full offseason report",()=>{
    expect(page).toContain('const isTradeStage=run?.phase==="offseason"&&Boolean(run.shopPlayerId)');
    expect(page).toContain("const tradeStage=");
    expect(page).toContain("{tradeStage}");
    expect(page).toContain('run.phase==="offseason"&&!isTradeStage&&<>');
    expect(page).toContain('run.phase!=="final"&&!isTradeStage&&<section');
    expect(page).toContain('run.phase==="offseason"&&!isTradeStage&&<section');
    expect(page).toContain('window.scrollTo({top:0,behavior:"instant"})');
    expect(page).toContain('!run.tradeTeam||wheelSpinning?');
    expect(page).toContain("nba-gm-dev__trade-team");
    expect(css).toContain(".nba-gm-dev .nba-gm-dev__trade-screen");
  });
  it("keeps team players compact, with independent chevron scouting before View Offers",()=>{
    expect(page).toContain("eligibleTrade.map(player=><article");
    expect(page).toContain('className="nba-gm-dev__trade-candidate-toggle"');
    expect(page).toContain("aria-expanded={expandedTradeCandidate===player.id}");
    expect(page).toContain("setExpandedTradeCandidate(current=>current===player.id?null:player.id)");
    expect(page).toContain('expandedTradeCandidate===player.id&&<div className="nba-gm-dev__trade-candidate-details"');
    expect(page).toContain("labels.map(key=><div key={key}>");
    expect(page).toContain("NBA_GM_DEV_SKILL_LABELS[key]");
    expect(page).toContain("nbaGmScoutLetter");
    expect(page).toContain("run.development?.[player.id]?.year2Grade");
    expect(page).toContain("VIEW OFFERS FOR {player.name}");
    expect(page).toContain("onClick={()=>void chooseTradeTarget(player.id)}");
    expect(page).toContain('act("trade",tradeTarget,"offer:"+(index+1))');
    expect(css).toContain(".nba-gm-dev .nba-gm-dev__trade-chevron");
    expect(css).toContain(".nba-gm-dev .nba-gm-dev__trade-candidate-details");
  });
  it("does not change ratings, contracts, economics, or owner-only access",()=>{
    const targetSelection=page.slice(page.indexOf('eligibleTrade.map(player=><article'),
      page.indexOf('</article>)}',page.indexOf('eligibleTrade.map(player=><article')));
    expect(targetSelection).not.toContain("onClick={()=>void chooseTradeTarget(player.id)}>");
    expect(page).toContain("OWNER ONLY · NOT PUBLIC");
    expect(page).not.toContain("OPTIONAL SECOND TRADE CHIP");
  });
});