import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const css=readFileSync("src/styles/nba-gm-dev.css","utf8");

describe("NBA GM dedicated trade screen and scouting-first target selection",()=>{
  it("opens a dedicated trade screen without duplicating the full offseason report",()=>{
    expect(page).toContain('const isTradeStage=run?.phase==="offseason"&&Boolean(run.shopPlayerId)');
    expect(page).toContain("const tradeStage=");
    expect(page).toContain("{tradeStage}");
    expect(page).not.toContain("showOffseasonReport");
    expect(page).toContain('(run.phase==="draft"||run.phase==="year1"||run.phase==="offseason")&&!isTradeStage&&<section');
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
    const toggleIndex=page.indexOf("setExpandedTradeCandidate(current=>current===player.id?null:player.id)");
    const offerIndex=page.indexOf("onClick={()=>void chooseTradeTarget(player.id)}");
    expect(toggleIndex).toBeGreaterThan(0);
    expect(offerIndex).toBeGreaterThan(toggleIndex);
    expect(page).not.toContain("OWNER ONLY · NOT PUBLIC");
    expect(page).not.toContain("OPTIONAL SECOND TRADE CHIP");
  });

  it("renders NFL-equivalent asset information in SEND and GET offers",()=>{
    expect(page).toContain("function TradeOfferPlayer(");
    expect(page).toContain('className="nba-gm-dev__trade-columns"');
    expect(page).toContain("outgoingPlayerIds.map(id=><TradeOfferPlayer");
    expect(page).toContain("incomingPlayerIds.map(id=><TradeOfferPlayer");
    expect(page).toContain('className="nba-gm-dev__offer-player"');
    expect(page).toContain("<PlayerPortrait player={player}/>");
    expect(page).toContain("<ScoutBadges player={player} run={run}/>");
    expect(page).toContain("outcome.label.toLowerCase()");
    expect(page).toContain("tradeYearTwoSkillLetter(player,run,key)");
    expect(page).toContain("Y2/Y3 · {player.gameContract}");
    expect(css).toContain(".nba-gm-dev__trade-columns");
    expect(css).toContain(".nba-gm-dev__offer-player[open]");
    expect(css).toContain("@media (max-width:680px)");
  });
  it("shows SHOPPED instead of offering a second shopping attempt",()=>{
    expect(page).toContain('run.shoppedPlayerIds?.includes(player.id)');
    expect(page).toContain('run.shoppedPlayerIds?.includes(id)');
    expect(page).toContain('"SHOPPED":"SHOP"');
    expect(page).toContain('"SHOPPED":"SHOP HELD ASSET"');
  });

});
