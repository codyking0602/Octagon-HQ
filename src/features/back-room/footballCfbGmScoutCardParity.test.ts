import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CFB_GM_PLAYERS, cfbGmExitSignal } from "./footballCfbGmEngine";

const page=readFileSync("src/features/back-room/FootballCfbGmPage.tsx","utf8");
const css=readFileSync("src/styles/football-gm-mode.css","utf8");

describe("CFB GM scouting presentation matches the established NFL cards",()=>{
  it("keeps eligibility uncertainty honest without a placeholder question-mark chip",()=>{
    const uncertain=CFB_GM_PLAYERS.find(p=>cfbGmExitSignal(p).label==="RETURN UNCERTAIN");
    expect(uncertain).toBeDefined();
    expect(cfbGmExitSignal(uncertain!).detail).toContain("not verified");
    expect(page).not.toContain("ELIGIBILITY ?");
    expect(page).toContain("RETURN UNCERTAIN");
  });
  it("shows three helpful scouting chips in NFL order without duplicate multi-slot badges",()=>{
    const board=page.split("function Board(")[1]!.split("function Season(")[0]!;
    expect(board).toContain("<Quality grade={cfbGmEffectiveGrade(player, year, seed)} />");
    expect(board).toContain("<Outlook value={player.outlook} /><ExitSignal player={player} />");
    expect(board).not.toContain("<RoleFit");
    expect(page).not.toContain("MULTI-SLOT");
    expect(page).not.toContain("NATURAL FIT");
    expect(page).toContain('cfbGmRoleFit(player, slot).label !== "FLEX FIT"');
    expect(page).toContain("<RoleFit player={player} slot={slot} />");
  });
  it("uses SELECT for the draft, keeps negotiation in the offseason and standardizes phone chips",()=>{
    expect(page).toContain("<em>SELECT →</em>");
    expect(page).not.toContain("2027 NEGOTIATE");
    expect(page).toContain("2027 NIL negotiations");
    expect(css).toContain("College GM scouting cards: match NFL");
    expect(css).toContain("min-height: 24px;");
    expect(css).toContain("min-height: 21px;");
    expect(css).toContain('data-cfb-gm="true"');
  });
});
