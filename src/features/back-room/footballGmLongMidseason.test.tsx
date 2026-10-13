// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, nflGmLongOverall, nflGmLongSpend, nflGmLongValidRoster,
  type NflGmLongPick,
} from "./footballGmLongFoundation";
import { NFL_GM_LONG_PLAYER_POOL, NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";
import { NFL_GM_LONG_COACHES } from "./footballGmLongCoaches";
import {
  nflGmLongCreateMidseason, nflGmLongGameProbability, nflGmLongRecord,
  nflGmLongPlayoffOutlook, nflGmLongTradePartners, nflGmLongTradeTargets,
  nflGmLongSpinTradePartner, nflGmLongTryTrade, nflGmLongActiveGrade,
  nflGmLongActivePicks, nflGmLongValidMidseason, type NflGmLongMidseason,
} from "./footballGmLongMidseason";
import {
  nflGmLongInitialSave, nflGmLongParseSave, nflGmLongWriteSave, nflGmLongLoadSave, nflGmLongStorageKey,
} from "./footballGmLongPersistence";
import { FootballGmLongMidseasonPage } from "./FootballGmLongMidseasonPage";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS, FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import { nflGmLongMigrateDeadlineSave } from "./footballGmLongPersistence";

const profileId = "7e9b17e6-118b-47b3-8f92-c9bc19b7d242";
function legalPicks(): NflGmLongPick[] {
  const taken = new Set<string>();
  const picks = NFL_GM_LONG_SLOTS.map(slot => {
    const player = NFL_GM_LONG_PLAYER_POOL.filter(p => p.eligibleSlots.includes(slot)
      && !taken.has(p.id)).sort((a, b) => a.salaryWindow[0] - b.salaryWindow[0])[0]!;
    taken.add(player.id);
    return { slot, playerId: player.id };
  });
  expect(nflGmLongValidRoster(picks, NFL_GM_LONG_BY_ID)).toBe(true);
  return picks;
}
const coachName = "Dan Campbell";
const runId = "long-midseason-locked-001";
function checkpoint(picks = legalPicks(), coach = coachName) {
  return nflGmLongCreateMidseason(runId, picks, coach);
}
function afterShop(mid: NflGmLongMidseason, playerId: string, partnerTeam: string): NflGmLongMidseason {
  return { ...mid, stage: "offers", shoppedPlayerId: playerId, partnerTeam };
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("NFL GM Long Year 1 midseason", () => {
  it("plays eight reproducible, distinct-opponent games and never forecasts a completed season", () => {
    const picks = legalPicks();
    const a = checkpoint(picks);
    expect(checkpoint(picks)).toEqual(a);
    expect(a.games).toHaveLength(8);
    expect(new Set(a.games.map(game => game.opponent)).size).toBe(8);
    expect(a.games.every(game => FOOTBALL_GM_TEAMS.includes(game.opponent))).toBe(true);
    const record = nflGmLongRecord(a);
    expect(record.wins + record.losses).toBe(8);
    expect(a.development).toHaveLength(9);
    expect(new Set(a.development.map(item => item.playerId)).size).toBe(9);
    for (const change of a.development) {
      const player = NFL_GM_LONG_BY_ID.get(change.playerId)!;
      expect(player.currentGrade + change.delta).toBeGreaterThanOrEqual(70);
      expect(player.currentGrade + change.delta).toBeLessThanOrEqual(99);
      expect(Math.abs(change.delta)).toBeLessThanOrEqual(4);
    }
    expect(nflGmLongValidMidseason(a, picks)).toBe(true);
    expect(NFL_GM_LONG_COACHES).toHaveLength(32);
  });

  it("applies coach scheme to actual matchup probabilities rather than increasing player grades", () => {
    const inputs = {
      passingMatchupPct: 4, rushingMatchupPct: 0.3, pressurePct: 0, coveragePct: 0,
      developmentOpportunityPct: 0.5, chemistryResiliencePct: 1.2,
    };
    expect(nflGmLongGameProbability(86, 86, inputs, 0))
      .toBeGreaterThan(nflGmLongGameProbability(86, 86, inputs, 1));
    const noCoach = { ...inputs, passingMatchupPct: 0, chemistryResiliencePct: 0 };
    expect(nflGmLongGameProbability(86, 86, inputs, 0)).toBeGreaterThan(
      nflGmLongGameProbability(86, 86, noCoach, 0));
    expect(nflGmLongGameProbability(98, 75, inputs, 0)).toBeLessThanOrEqual(.92);
    expect(nflGmLongGameProbability(75, 98, inputs, 0)).toBeGreaterThanOrEqual(.08);
    const picks = legalPicks();
    const before = JSON.stringify(picks);
    checkpoint(picks, "Dan Campbell");
    checkpoint(picks, "Sean McVay");
    expect(JSON.stringify(picks)).toBe(before);
    expect(nflGmLongOverall(picks, NFL_GM_LONG_BY_ID)).not.toBeNull();
  });

  it("keeps a real playoff race estimate responsive to actual wins, but never guarantees future wins", () => {
    const picks = legalPicks();
    const mid = checkpoint(picks);
    const high = { ...mid, games: mid.games.map(g => ({ ...g, won: true })) };
    const low = { ...mid, games: mid.games.map(g => ({ ...g, won: false })) };
    const strong = nflGmLongPlayoffOutlook(runId, picks, coachName, high);
    const weak = nflGmLongPlayoffOutlook(runId, picks, coachName, low);
    expect(strong.percent).toBeGreaterThan(weak.percent);
    expect(strong.percent).toBeLessThanOrEqual(100);
    expect(weak.percent).toBeGreaterThanOrEqual(0);
    expect(nflGmLongPlayoffOutlook(runId, picks, coachName, high)).toEqual(strong);
  });

  it("keeps old Phase 1 saves and separates the locked checkpoint from Short GM saves", () => {
    const picks = legalPicks();
    const coach = NFL_GM_LONG_COACHES.find(c => c.name === coachName)!;
    const original = { ...nflGmLongInitialSave(profileId, runId),
      phase: "outlook" as const, picks,
      selectedCoachBucket: coach.bucket, selectedCoach: coach.name, coachWheelDraw: 0.43,
    };
    // A real existing Phase 1 localStorage JSON has no midseason property.
    const legacy = { ...original } as Record<string, unknown>;
    delete legacy.midseason;
    const parsedOld = nflGmLongParseSave(legacy, profileId, NFL_GM_LONG_BY_ID);
    expect(parsedOld?.phase).toBe("outlook");
    expect(parsedOld?.midseason).toBeNull();
    const played = { ...parsedOld!, phase: "midseason" as const,
      midseason: checkpoint(picks) };
    const db = new Map<string, string>();
    const storage = {
      getItem: (key: string) => db.get(key) ?? null,
      setItem: (key: string, value: string) => { db.set(key, value); },
      removeItem: (key: string) => { db.delete(key); },
    };
    nflGmLongWriteSave(storage, played, NFL_GM_LONG_BY_ID);
    expect(nflGmLongLoadSave(storage, profileId, NFL_GM_LONG_BY_ID)).toEqual(played);
    expect(nflGmLongStorageKey(profileId)).not.toContain("football-gm-v1");
    expect(nflGmLongParseSave({ ...played, midseason: null }, profileId, NFL_GM_LONG_BY_ID)).toBeNull();
    expect(nflGmLongParseSave({ ...played, midseason: { ...played.midseason, games: [] } }, profileId, NFL_GM_LONG_BY_ID)).toBeNull();
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
  });

  it("spins a deterministic partner from the whole league and never permits an extra offer after deadline", () => {
    const picks = legalPicks();
    const outgoingId = picks[0]!.playerId;
    const teams = nflGmLongTradePartners(outgoingId);
    expect(teams).toHaveLength(31);
    const partner = nflGmLongSpinTradePartner(runId, outgoingId);
    expect(teams).toContain(partner);
    expect(nflGmLongSpinTradePartner(runId, outgoingId)).toBe(partner);
    expect(nflGmLongTradePartners("unknown")).toHaveLength(0);
    const mid = afterShop(checkpoint(picks), outgoingId, partner);
    expect(nflGmLongValidMidseason(mid, picks)).toBe(true);
    expect(() => nflGmLongTryTrade(runId, picks, { ...mid, stage: "complete" }, "anyone")).toThrow();
    expect(() => nflGmLongTryTrade(runId, picks, mid, "unknown-player")).toThrow();
    expect(nflGmLongTradeTargets(picks, outgoingId, "NOT-A-TEAM")).toHaveLength(0);
  });

  it("rejects draft-pick deals outright and preserves all nine starters", () => {
    const picks = legalPicks();
    const outgoingId = picks[0]!.playerId;
    const partner = nflGmLongSpinTradePartner(runId, outgoingId);
    const mid = afterShop(checkpoint(picks), outgoingId, partner);
    // Runtime attack/old caller: null is never a valid incoming starter.
    expect(() => nflGmLongTryTrade(runId, picks, mid, null as unknown as string)).toThrow();
    expect(nflGmLongActivePicks(picks, null)).toEqual(picks);
    expect(nflGmLongValidMidseason({
      ...mid, stage: "complete",
      trade: { outgoingId, incomingId: null, partnerTeam: partner, futurePickRound: 1 },
    }, picks)).toBe(false);
    expect(nflGmLongValidMidseason({
      ...mid, rejectedOfferIds: ["future"],
    }, picks)).toBe(false);
    expect(nflGmLongValidMidseason({
      ...mid, stage: "complete",
      trade: { outgoingId, incomingId: "fake", partnerTeam: partner },
    }, picks)).toBe(false);
  });

  it("migrates older saved future-pick trades to the original nine-player roster without resetting the record", () => {
    const picks = legalPicks();
    const coach = NFL_GM_LONG_COACHES.find(c => c.name === coachName)!;
    const outgoingId = picks[0]!.playerId;
    const partner = nflGmLongSpinTradePartner(runId, outgoingId);
    const original = checkpoint(picks);
    const oldSaved = {
      ...nflGmLongInitialSave(profileId, runId),
      phase: "midseason", picks,
      selectedCoachBucket: coach.bucket, selectedCoach: coach.name, coachWheelDraw: 0.43,
      midseason: { ...original, stage: "complete", shoppedPlayerId: outgoingId,
        partnerTeam: partner,
        rejectedOfferIds: ["future"],
        trade: { outgoingId, incomingId: null, partnerTeam: partner, futurePickRound: 2 },
      },
    };
    const migrated = nflGmLongParseSave(oldSaved, profileId, NFL_GM_LONG_BY_ID);
    expect(migrated?.phase).toBe("midseason");
    expect(migrated?.midseason?.trade).toBeNull();
    expect(migrated?.midseason?.stage).toBe("complete");
    expect(migrated?.midseason?.games).toEqual(original.games);
    expect(migrated?.midseason?.development).toEqual(original.development);
    expect(nflGmLongActivePicks(picks, migrated!.midseason!.trade)).toHaveLength(9);
    expect(migrated?.picks).toEqual(picks);
    const db = new Map<string, string>();
    const storage = {
      getItem: (key: string) => db.get(key) ?? null,
      setItem: (key: string, value: string) => { db.set(key, value); },
      removeItem: (key: string) => { db.delete(key); },
    };
    nflGmLongWriteSave(storage, migrated!, NFL_GM_LONG_BY_ID);
    expect(nflGmLongLoadSave(storage, profileId, NFL_GM_LONG_BY_ID)).toEqual(migrated);
    // No arbitrary deleted slot or future draft asset survives the migration.
    expect(JSON.stringify(migrated)).not.toMatch(/"futurePickRound"|"incomingId":null/);
  });

  it("replacement offers cannot duplicate players or exceed $205M and lose the chance after two refusals", () => {
    const picks = legalPicks();
    const candidate = picks.flatMap(pick => nflGmLongTradePartners(pick.playerId).flatMap(team =>
      nflGmLongTradeTargets(picks, pick.playerId, team)
        .map(player => ({ pick, team, player })))).at(0);
    expect(candidate).toBeDefined();
    const rosterAfter = nflGmLongActivePicks(picks, {
      outgoingId: candidate!.pick.playerId, incomingId: candidate!.player.id,
      partnerTeam: candidate!.team,
    });
    expect(rosterAfter).toHaveLength(9);
    expect(nflGmLongSpend(rosterAfter, NFL_GM_LONG_BY_ID)).toBeLessThanOrEqual(NFL_GM_LONG_CAP);
    expect(nflGmLongValidRoster(rosterAfter, NFL_GM_LONG_BY_ID)).toBe(true);

    const firstAttempt = afterShop(checkpoint(picks), candidate!.pick.playerId, candidate!.team);
    const invalid = { ...firstAttempt, rejectedOfferIds: [candidate!.player.id, candidate!.player.id] };
    expect(() => nflGmLongTryTrade(runId, picks, invalid, candidate!.player.id)).toThrow();
    expect(nflGmLongValidMidseason(invalid, picks)).toBe(false);
    expect(() => nflGmLongTryTrade(runId, picks,
      { ...firstAttempt, rejectedOfferIds: [candidate!.player.id, "other-player"] },
      candidate!.player.id)).toThrow();
    const legacyRegularTrade = {
      ...firstAttempt, stage: "complete", trade: {
        outgoingId: candidate!.pick.playerId, incomingId: candidate!.player.id,
        partnerTeam: candidate!.team, futurePickRound: null,
      },
    };
    expect(nflGmLongValidMidseason(legacyRegularTrade, picks)).toBe(false);
    const migrated = nflGmLongMigrateDeadlineSave(legacyRegularTrade, picks);
    expect(nflGmLongValidMidseason(migrated, picks)).toBe(true);
    expect(nflGmLongActivePicks(picks, (migrated as NflGmLongMidseason).trade)).toHaveLength(9);
  });

  it("renders the compact record and an actionable deadline without a season finish claim", () => {
    const picks = legalPicks();
    const midseason = checkpoint(picks);
    const explore = vi.fn();
    const { container } = render(<FootballGmLongMidseasonPage
      runId={runId} picks={picks} coachName={coachName} midseason={midseason}
      onExplore={explore} onShop={vi.fn()} onSpin={() => "BUF"}
      onOffer={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "HALFWAY THROUGH THE SEASON" })).toBeTruthy();
    expect(container.querySelectorAll(".gm-long__midseason-games > span")).toHaveLength(8);
    expect(container.querySelectorAll(".gm-long__midseason-growth-grid > div")).toHaveLength(9);
    expect(screen.getByText("THE TRADE DEADLINE")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "EXPLORE A TRADE →" }));
    expect(explore).toHaveBeenCalledOnce();
    expect(container.textContent).not.toMatch(/SUPER BOWL CHAMPION|SEASON 1 FORECAST|INJURY|FUTURE ROUND|DRAFT PICK/);
    const offersMid = afterShop(midseason, picks[0]!.playerId,
      nflGmLongSpinTradePartner(runId, picks[0]!.playerId));
    const offers = render(<FootballGmLongMidseasonPage
      runId={runId} picks={picks} coachName={coachName} midseason={offersMid}
      onExplore={vi.fn()} onShop={vi.fn()} onSpin={() => "BUF"} onOffer={vi.fn()} onSkip={vi.fn()} />);
    expect(offers.container.querySelector(".gm-long__deadline-future")).toBeNull();
    expect(offers.container.textContent).toMatch(/same starting slot/);
    expect(offers.container.textContent).not.toMatch(/draft pick|future round|vacant/i);
  });
});
