import { describe, expect, it } from "vitest";
import { buildNbaServerDailyPublication } from "./nbaDailyServerPublication";
import { advanceNbaOfficialDailyRuntime } from "./nbaDailyServerAdvance";
import type { OfficialDailyRuntimeContext } from "../play/todaysChallengeRuntime";

function context(day:string,game:Parameters<typeof buildNbaServerDailyPublication>[2]):OfficialDailyRuntimeContext {
  const published=buildNbaServerDailyPublication(day,"nba-daily-regular-v1",game);
  return {
    gameType:game,
    setupKey:published.setupKey,
    publicSetup:published.publicSetup,
    revealSetup:published.revealSetup,
    privateSetupEvidence:published.privateSetupEvidence,
    privateGradingEvidence:published.privateGradingEvidence,
    submissionState:{},
    publicState:published.publicSetup.initial_state as Record<string,unknown>,
  };
}
describe("NBA canonical Daily private server advancement",()=>{
  it("does not expose Wavelength target to the browser until completion",()=>{
    const ctx=context("2026-11-11","wavelength");
    const first=advanceNbaOfficialDailyRuntime(ctx,{guess:50});
    expect(first.complete).toBe(false);
    const active=first.publicState.active_round as Record<string,unknown>;
    expect(active.guesses).toEqual([50]);
    expect(active.reveal).toBeNull();
    expect(JSON.stringify(first.publicState)).not.toContain('"target":');
  });
  it("only accepts actual eligible Hit the Number players and cannot score early",()=>{
    const ctx=context("2026-11-15","hit_the_number");
    expect(()=>advanceNbaOfficialDailyRuntime(ctx,{lock:true})).toThrow();
    expect(()=>advanceNbaOfficialDailyRuntime(ctx,{fighter_id:"not-on-board"})).toThrow();
    const active=ctx.publicState.active_round as Record<string,unknown>;
    const id=(active.available_subject_ids as string[])[0]!;
    const next=advanceNbaOfficialDailyRuntime(ctx,{fighter_id:id});
    expect(next.complete).toBe(false);
    expect((next.publicState.active_round as Record<string,unknown>).selected_ids).toContain(id);
  });
  it("does not accept wrong choices or leak the Higher Lower hidden answer",()=>{
    const ctx=context("2026-11-17","higher_lower");
    expect(()=>advanceNbaOfficialDailyRuntime(ctx,{choice:"neither"})).toThrow();
    const prior=ctx.publicState.current_question as Record<string,unknown>;
    expect(prior.answer).toBeUndefined();
    expect((prior.hidden as Record<string,unknown>).value).toBeUndefined();
    const a=advanceNbaOfficialDailyRuntime(ctx,{choice:"higher"});
    expect(a.complete).toBe(false);
    expect(a.publicState.index).toBe(1);
    expect((a.publicState.current_question as Record<string,unknown>).answer).toBeUndefined();
    expect((a.publicState.current_question as Record<string,unknown>).hidden).not.toHaveProperty("value");
  },15_000);
});
