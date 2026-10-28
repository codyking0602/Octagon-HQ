import { describe, expect, it } from "vitest";
import { nbaHigherLowerOfficialResultRows } from "./NbaHigherLowerLeaderboardResult";
import type { NbaHigherLowerOfficialDetail } from "./NbaHigherLowerLeaderboardResult";

function official(): NbaHigherLowerOfficialDetail {
  return {
    unlocked: true,
    normalizedScore: 70,
    answers: Array.from({length:10},(_,i)=>({question_id:"q"+i,choice:i<7?"higher":"lower"})),
    revealQuestions: Array.from({length:10},(_,i)=>({
      id:"q"+i,metricLabel:"NBA Points Per Game",
      answer:"higher",known:{name:"Player One "+i,value:15,formattedValue:"15.0",context:"2024–25 NBA"},
      hidden:{name:"Player Two "+i,value:20,formattedValue:"20.0",context:"2025–26 NBA"},
    })),
  };
}
describe("NBA member Daily Higher or Lower result review",()=>{
  it("never reveals unreleased answers",()=>{
    const value=official();value.unlocked=false;
    expect(nbaHigherLowerOfficialResultRows(value)).toEqual([]);
  });
  it("lists the other player's exact persisted choices and numeric reveals",()=>{
    const rows=nbaHigherLowerOfficialResultRows(official());
    expect(rows).toHaveLength(10);
    expect(rows.filter(x=>x.correct)).toHaveLength(7);
    expect(rows[0].hiddenContext).toContain("2025–26");
    expect(rows[0].knownValue).toBe("15.0");
    expect(rows[9].picked).toBe("lower");
  });
  it("does not invent correct answer when backend evidence missing or contradictory",()=>{
    const value=official();
    (value.revealQuestions as Record<string,unknown>[])[0]!.answer="lower";
    expect(nbaHigherLowerOfficialResultRows(value)).toHaveLength(9);
    const missing=official();missing.revealQuestions=[];
    expect(nbaHigherLowerOfficialResultRows(missing)).toEqual([]);
  });
});
