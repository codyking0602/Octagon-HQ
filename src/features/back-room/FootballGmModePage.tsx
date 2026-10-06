import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-gm-mode.css";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { useIdentity } from "../identity/IdentityProvider";
import { createFootballGmRunRepository } from "./footballGmRunRepository";
import { wheelFootballTeam } from "./wheelFootballModel";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmMoney,
  footballGmOpenSlots,
  footballGmPlayerById,
  footballGmRosterCap,
  footballGmRosterPlayers,
  footballGmSpinTeam,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
  type FootballGmTeamCandidate,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_MAX_TRADE_PLAYERS,
  FOOTBALL_GM_VERSION,
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmContinuity,
  footballGmEvaluateTradeProposal,
  footballGmFinalResultV2,
  footballGmIsOffseasonCompliantV2,
  footballGmResolveTradeRoster,
  footballGmSeasonResultV2,
  footballGmSpinTradePartner,
  footballGmTradePartnerPlayers,
  type FootballGmFinalResultV2,
  type FootballGmNegotiationConsequences,
  type FootballGmTradeProposal,
} from "./footballGmStrategy";
import {
  footballGmPlaytestOpponentName,
  isFootballGmPlaytestProfile,
} from "./footballGmAccess";

type Phase = "intro" | "draft" | "year1" | "offseason" | "years23" | "final";

interface PendingTradeResolution {
  partnerTeam: string;
  priority: 1 | 2;
  anchorPlayerId: string;
  proposal: FootballGmTradeProposal;
  postTradePlayerIds: string[];
  requiredCuts: number;
  cutPlayerIds: string[];
}

interface PersistedRun {
  version: string;
  seed: string;
  phase: Phase;
  roster: FootballGmRosterEntry[];
  finalRoster: FootballGmRosterEntry[];
  spinIndex: number;
  previousTeam: string | null;
  pendingTeam: string | null;
  tradeSpinIndex: number;
  previousTradePartner: string | null;
  tradeAnchorPlayerId: string | null;
  tradePartnerTeam: string | null;
  tradeOfferOne: FootballGmTradeProposal;
  tradeOfferTwo: FootballGmTradeProposal;
  tradeOfferTwoEnabled: boolean;
  shoppedPlayerIds: string[];
  pendingTradeResolution: PendingTradeResolution | null;
  negotiationConsequences: Record<string, number>;
  tradeMessage: string;
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function challengeSeed(value: ChallengeJson | undefined) {
  const row = record(value);
  return row?.version === FOOTBALL_GM_VERSION && typeof row.seed === "string"
    ? row.seed
    : null;
}

function freshSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyProposal(anchorPlayerId?: string | null): FootballGmTradeProposal {
  return {
    outgoingPlayerIds: anchorPlayerId ? [anchorPlayerId] : [],
    incomingPlayerIds: [],
  };
}

function initialRun(seed: string): PersistedRun {
  return {
    version: FOOTBALL_GM_VERSION,
    seed,
    phase: "intro",
    roster: [],
    finalRoster: [],
    spinIndex: 0,
    previousTeam: null,
    pendingTeam: null,
    tradeSpinIndex: 0,
    previousTradePartner: null,
    tradeAnchorPlayerId: null,
    tradePartnerTeam: null,
    tradeOfferOne: emptyProposal(),
    tradeOfferTwo: emptyProposal(),
    tradeOfferTwoEnabled: false,
    shoppedPlayerIds: [],
    pendingTradeResolution: null,
    negotiationConsequences: {},
    tradeMessage: "",
  };
}

function storageKey(profileId: string | undefined, seed: string) {
  return `octagon:football-gm:${profileId ?? "anon"}:${seed}`;
}

function loadPersistedRun(profileId: string | undefined, seed: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(profileId, seed));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedRun;
    return parsed.version === FOOTBALL_GM_VERSION && parsed.seed === seed ? parsed : null;
  } catch {
    return null;
  }
}

function auditPlayer(playerId: string) {
  const player = footballGmPlayerById(playerId);
  if (!player) return null;
  return {
    id: player.id,
    name: player.name,
    team: player.team,
    family: player.family,
    position: player.position,
    eligibleSlots: [...player.eligibleSlots],
    age: player.age,
    salaryApy: player.salaryApy,
    gameContract: player.gameContract,
    currentGrade: player.currentGrade,
    projectedExtensionApy: player.projectedExtensionApy,
    salaryWindow: [...player.salaryWindow],
    outlook: player.outlook,
    extensionRisk: player.extensionRisk,
  };
}

function auditRoster(roster: readonly FootballGmRosterEntry[]) {
  return roster.map((entry) => ({
    ...entry,
    player: auditPlayer(entry.playerId),
  }));
}

function auditCandidate(candidate: FootballGmTeamCandidate) {
  return {
    player: auditPlayer(candidate.player.id),
    legalSlots: [...candidate.legalSlots],
    salary: candidate.salary,
  };
}

function gmAuditSnapshot(
  run: PersistedRun,
  context: {
    profileId: string;
    profileName: string;
    challengeCode: string | null;
    challengeRole: "solo" | "recipient";
  },
) {
  const effectiveFinalRoster = run.finalRoster.length ? run.finalRoster : run.roster;
  const draftCandidates = run.pendingTeam
    ? footballGmCandidatesForTeam({ team: run.pendingTeam, roster: run.roster, year: 1 }).map(auditCandidate)
    : [];
  const tradeOne = run.tradePartnerTeam
    ? footballGmEvaluateTradeProposal({
        seed: run.seed,
        partnerTeam: run.tradePartnerTeam,
        roster: run.finalRoster,
        proposal: run.tradeOfferOne,
        priority: 1,
      })
    : null;
  const tradeTwo = run.tradePartnerTeam && run.tradeOfferTwoEnabled
    ? footballGmEvaluateTradeProposal({
        seed: run.seed,
        partnerTeam: run.tradePartnerTeam,
        roster: run.finalRoster,
        proposal: run.tradeOfferTwo,
        priority: 2,
      })
    : null;

  return asJson({
    version: run.version,
    seed: run.seed,
    phase: run.phase,
    context,
    run,
    cap: {
      limit: FOOTBALL_GM_CAP,
      year1: footballGmRosterCap(run.roster, 1),
      year2: footballGmAdjustedRosterCap(effectiveFinalRoster, 2, run.seed, run.negotiationConsequences),
      year3: footballGmAdjustedRosterCap(effectiveFinalRoster, 3, run.seed, run.negotiationConsequences),
    },
    roster: auditRoster(run.roster),
    finalRoster: auditRoster(run.finalRoster),
    pendingDraft: run.pendingTeam
      ? { team: run.pendingTeam, candidates: draftCandidates }
      : null,
    tradeSession: run.tradeAnchorPlayerId
      ? {
          anchor: auditPlayer(run.tradeAnchorPlayerId),
          partnerTeam: run.tradePartnerTeam,
          partnerPlayers: run.tradePartnerTeam
            ? footballGmTradePartnerPlayers(run.tradePartnerTeam, run.finalRoster).map((player) => auditPlayer(player.id))
            : [],
          priorityOne: { proposal: run.tradeOfferOne, evaluation: tradeOne },
          priorityTwo: { proposal: run.tradeOfferTwo, evaluation: tradeTwo },
        }
      : null,
    negotiationConsequences: run.negotiationConsequences,
    pendingTradeResolution: run.pendingTradeResolution,
    shoppedPlayerIds: run.shoppedPlayerIds,
    continuity: run.finalRoster.length
      ? {
          year2: footballGmContinuity(run.roster, run.finalRoster, 2),
          year3: footballGmContinuity(run.roster, run.finalRoster, 3),
        }
      : null,
    seasons: {
      year1: run.roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.roster, year: 1 })
        : null,
      year2: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 2 })
        : null,
      year3: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 3 })
        : null,
    },
    finalResult: run.phase === "final" && run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster: run.roster, finalRoster: run.finalRoster })
      : null,
  });
}

function playerStyle(teamCode: string) {
  const team = wheelFootballTeam(teamCode);
  if (!team) return undefined;
  return {
    "--gm-team-primary": team.primaryColor,
    "--gm-team-secondary": team.secondaryColor,
  } as CSSProperties;
}

function TeamLogo({ teamCode }: { teamCode: string }) {
  const team = wheelFootballTeam(teamCode);
  return team?.logoSrc
    ? <img className="football-gm__team-logo" src={team.logoSrc} alt="" />
    : <span className="football-gm__team-fallback">{teamCode}</span>;
}

function CapMeter({
  roster,
  year,
  seed,
  consequences,
}: {
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
}) {
  const spent = year === 1
    ? footballGmRosterCap(roster, 1)
    : footballGmAdjustedRosterCap(roster, year, seed, consequences);
  const remaining = FOOTBALL_GM_CAP - spent;
  const pct = Math.min(100, Math.max(0, (spent / FOOTBALL_GM_CAP) * 100));
  return (
    <section className={`football-gm__cap surface-card${remaining < 0 ? " is-over" : ""}`}>
      <div>
        <span><small>YEAR {year} CAP</small><strong>{footballGmMoney(spent)} / {footballGmMoney(FOOTBALL_GM_CAP)}</strong></span>
        <b>{remaining >= 0 ? `${footballGmMoney(remaining)} LEFT` : `${footballGmMoney(Math.abs(remaining))} OVER`}</b>
      </div>
      <i><em style={{ width: `${pct}%` }} /></i>
    </section>
  );
}

function RosterGrid({
  roster,
  year,
  seed,
  consequences,
  showFutureSalary = false,
  onShop,
  shoppedPlayerIds = [],
}: {
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  showFutureSalary?: boolean;
  onShop?: (playerId: string) => void;
  shoppedPlayerIds?: readonly string[];
}) {
  const bySlot = new Map(roster.map((entry) => [entry.slot, entry]));
  return (
    <section className="football-gm__roster surface-card">
      <header><span><small>YOUR TEAM</small><strong>7-MAN CORE</strong></span><b>{roster.length}/7</b></header>
      <div className="football-gm__roster-grid">
        {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
          const entry = bySlot.get(slot);
          const player = entry ? footballGmPlayerById(entry.playerId) : null;
          const salary = player
            ? (year === 1 ? player.salaryWindow[0] : footballGmAdjustedSalaryForPlayer(player, year, seed, consequences))
            : 0;
          const failedTalks = player ? consequences[player.id] ?? 0 : 0;
          return (
            <article key={slot} className={player ? "is-filled" : ""} style={player ? playerStyle(player.team) : undefined}>
              <small>{slot}</small>
              {player ? (
                <>
                  <div className="football-gm__roster-player">
                    <TeamLogo teamCode={player.team} />
                    <span><strong>{player.name}</strong><em>{player.team} · {player.position}</em></span>
                  </div>
                  <div className="football-gm__roster-contract">
                    <b>{footballGmMoney(salary)}</b>
                    <span>{failedTalks && player.gameContract === "1YR"
                      ? `CAMP MARKUP · ${failedTalks} FAILED TALK${failedTalks === 1 ? "" : "S"}`
                      : showFutureSalary ? "Y2/Y3" : player.gameContract}</span>
                  </div>
                  {onShop ? (
                    <button
                      type="button"
                      disabled={shoppedPlayerIds.includes(player.id)}
                      onClick={() => onShop(player.id)}
                    >{shoppedPlayerIds.includes(player.id) ? "SHOPPED" : "SHOP"}</button>
                  ) : null}
                </>
              ) : <strong className="football-gm__open">OPEN</strong>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CandidateBoard({
  teamCode,
  roster,
  year,
  onPick,
}: {
  teamCode: string;
  roster: readonly FootballGmRosterEntry[];
  year: 1;
  onPick: (playerId: string, slot: FootballGmRosterSlot) => void;
}) {
  const team = wheelFootballTeam(teamCode);
  const candidates = footballGmCandidatesForTeam({ team: teamCode, roster, year });
  return (
    <section className="football-gm__candidates surface-card" style={playerStyle(teamCode)}>
      <header>
        <TeamLogo teamCode={teamCode} />
        <span><small>THE WHEEL LANDED ON</small><strong>{team?.name ?? teamCode}</strong></span>
      </header>
      <div className="football-gm__candidate-list">
        {candidates.map(({ player, legalSlots, salary }) => (
          <article key={player.id} style={playerStyle(player.team)}>
            <div className="football-gm__candidate-main">
              <span><small>{player.position} · AGE {player.age}</small><strong>{player.name}</strong></span>
              <b>{footballGmMoney(salary)}</b>
            </div>
            <div className="football-gm__candidate-tags">
              <span>{player.gameContract}</span>
              <span>{player.outlook}</span>
              <span className={`risk-${player.extensionRisk.toLowerCase()}`}>
                {player.extensionRisk === "LOCKED" ? "SALARY LOCKED" : `${player.extensionRisk} EXTENSION RISK`}
              </span>
            </div>
            <div className="football-gm__candidate-actions">
              {legalSlots.map((slot) => (
                <button type="button" key={slot} onClick={() => onPick(player.id, slot)}>
                  SIGN AS {slot}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SeasonCard({
  seed,
  year,
  yearOneRoster,
  roster,
}: {
  seed: string;
  year: 1 | 2 | 3;
  yearOneRoster: readonly FootballGmRosterEntry[];
  roster: readonly FootballGmRosterEntry[];
}) {
  const result = footballGmSeasonResultV2({ seed, yearOneRoster, roster, year });
  return (
    <article className="football-gm__season-card">
      <small>YEAR {year}</small>
      <strong>{result.teamGrade.toFixed(1)}</strong>
      <span>TEAM GRADE · {result.titleOdds.toFixed(1)}% TITLE ODDS</span>
      <b>{result.finish}</b>
      {result.weakLinkPenalty > 0 || result.continuityAdjustment !== 0 ? (
        <em>
          {result.weakLinkPenalty > 0 ? `WEAK LINK −${result.weakLinkPenalty.toFixed(1)}` : ""}
          {result.weakLinkPenalty > 0 && result.continuityAdjustment !== 0 ? " · " : ""}
          {result.continuityAdjustment !== 0 ? `CONTINUITY ${result.continuityAdjustment > 0 ? "+" : ""}${result.continuityAdjustment.toFixed(1)}` : ""}
        </em>
      ) : null}
    </article>
  );
}

function ContinuityMeter({
  yearOneRoster,
  roster,
}: {
  yearOneRoster: readonly FootballGmRosterEntry[];
  roster: readonly FootballGmRosterEntry[];
}) {
  const year2 = footballGmContinuity(yearOneRoster, roster, 2);
  const year3 = footballGmContinuity(yearOneRoster, roster, 3);
  return (
    <section className="football-gm__continuity surface-card">
      <header>
        <span><small>ROSTER CONTINUITY</small><strong>{year2.label}</strong></span>
        <b>{year2.meter}/100</b>
      </header>
      <i><em style={{ width: `${year2.meter}%` }} /></i>
      <p>{year2.retained}/7 Year 1 players retained{year2.qbRetained ? " · QB retained" : " · new QB"}.</p>
      <small>YEAR 2 IMPACT {year2.adjustment > 0 ? "+" : ""}{year2.adjustment.toFixed(1)} · YEAR 3 {year3.adjustment > 0 ? "+" : ""}{year3.adjustment.toFixed(1)} as the rebuilt group settles in.</small>
    </section>
  );
}

function selectableIds(list: readonly string[], id: string, max: number, lockedId?: string | null) {
  if (id === lockedId) return [...list];
  if (list.includes(id)) return list.filter((value) => value !== id);
  if (list.length >= max) return [...list];
  return [...list, id];
}

function sameTradeProposal(left: FootballGmTradeProposal, right: FootballGmTradeProposal) {
  const normalize = (values: readonly string[]) => [...values].sort().join("|");
  return normalize(left.outgoingPlayerIds) === normalize(right.outgoingPlayerIds)
    && normalize(left.incomingPlayerIds) === normalize(right.incomingPlayerIds);
}

function TradeOfferBuilder({
  label,
  proposal,
  anchorPlayerId,
  roster,
  partnerTeam,
  shoppedPlayerIds,
  onChange,
}: {
  label: string;
  proposal: FootballGmTradeProposal;
  anchorPlayerId: string;
  roster: readonly FootballGmRosterEntry[];
  partnerTeam: string;
  shoppedPlayerIds: readonly string[];
  onChange: (proposal: FootballGmTradeProposal) => void;
}) {
  const incoming = footballGmTradePartnerPlayers(partnerTeam, roster);
  return (
    <article className="football-gm__trade-offer">
      <header><span><small>{label}</small><strong>BUILD THE PACKAGE</strong></span></header>
      <div className="football-gm__trade-columns">
        <div>
          <small>YOU SEND · 1–{FOOTBALL_GM_MAX_TRADE_PLAYERS}</small>
          {footballGmRosterPlayers(roster).map(({ entry, player }) => {
            const selected = proposal.outgoingPlayerIds.includes(player.id);
            const locked = player.id === anchorPlayerId;
            const alreadyShopped = shoppedPlayerIds.includes(player.id) && !locked;
            return (
              <button
                className={selected ? "is-selected" : ""}
                type="button"
                key={player.id}
                disabled={locked || alreadyShopped}
                onClick={() => onChange({
                  ...proposal,
                  outgoingPlayerIds: selectableIds(
                    proposal.outgoingPlayerIds,
                    player.id,
                    FOOTBALL_GM_MAX_TRADE_PLAYERS,
                    anchorPlayerId,
                  ),
                })}
              >
                <span>{locked ? "SHOPPING" : alreadyShopped ? "ALREADY SHOPPED" : entry.slot}</span>
                <strong>{player.name}</strong>
                <em>{footballGmMoney(player.salaryWindow[1])}</em>
              </button>
            );
          })}
        </div>
        <div>
          <small>YOU GET · 1–{FOOTBALL_GM_MAX_TRADE_PLAYERS}</small>
          {incoming.map((player) => {
            const selected = proposal.incomingPlayerIds.includes(player.id);
            return (
              <button
                className={selected ? "is-selected" : ""}
                type="button"
                key={player.id}
                onClick={() => onChange({
                  ...proposal,
                  incomingPlayerIds: selectableIds(
                    proposal.incomingPlayerIds,
                    player.id,
                    FOOTBALL_GM_MAX_TRADE_PLAYERS,
                  ),
                })}
              >
                <span>{player.position} · {player.gameContract}</span>
                <strong>{player.name}</strong>
                <em>{footballGmMoney(player.salaryWindow[1])}</em>
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function TradeRoom({
  run,
  patch,
  onSubmit,
  onEndTalks,
}: {
  run: PersistedRun;
  patch: (next: Partial<PersistedRun>) => void;
  onSubmit: () => void;
  onEndTalks: () => void;
}) {
  const anchor = run.tradeAnchorPlayerId ? footballGmPlayerById(run.tradeAnchorPlayerId) : null;
  if (!anchor) return null;
  const partner = run.tradePartnerTeam ? wheelFootballTeam(run.tradePartnerTeam) : null;
  if (!run.tradePartnerTeam) {
    return (
      <section className="football-gm__wheel surface-card">
        <p className="eyebrow">SHOPPING {anchor.name.toUpperCase()}</p>
        <h2>FIND A TRADE PARTNER</h2>
        <p>One wheel spin locks this player's only trade partner for the offseason. Build one offer, with an optional backup.</p>
        <div className="football-gm__inline-actions">
          <button className="primary-action" type="button" onClick={() => {
            const team = footballGmSpinTradePartner(run.seed, run.tradeSpinIndex, anchor.id, run.previousTradePartner);
            if (team) patch({
              tradePartnerTeam: team,
              shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, anchor.id])],
              tradeMessage: "",
            });
          }}>SPIN TRADE PARTNER</button>
          <button type="button" onClick={() => patch({
            tradeAnchorPlayerId: null,
            tradeOfferOne: emptyProposal(),
            tradeOfferTwo: emptyProposal(),
            tradeOfferTwoEnabled: false,
          })}>NEVER MIND</button>
        </div>
      </section>
    );
  }

  return (
    <section className="football-gm__trade-room surface-card" style={playerStyle(run.tradePartnerTeam)}>
      <header>
        <TeamLogo teamCode={run.tradePartnerTeam} />
        <span><small>TRADE TALKS</small><strong>{partner?.name ?? run.tradePartnerTeam}</strong></span>
      </header>
      <p>Priority 1 is your offer. Add a backup only if you actually want a second package. Each side can include up to {FOOTBALL_GM_MAX_TRADE_PLAYERS} players.</p>
      <TradeOfferBuilder
        label="PRIORITY 1"
        proposal={run.tradeOfferOne}
        anchorPlayerId={anchor.id}
        roster={run.finalRoster}
        partnerTeam={run.tradePartnerTeam}
        shoppedPlayerIds={run.shoppedPlayerIds}
        onChange={(tradeOfferOne) => patch({ tradeOfferOne, tradeMessage: "" })}
      />
      {run.tradeOfferTwoEnabled ? (
        <>
          <TradeOfferBuilder
            label="BACKUP OFFER"
            proposal={run.tradeOfferTwo}
            anchorPlayerId={anchor.id}
            roster={run.finalRoster}
            partnerTeam={run.tradePartnerTeam}
            shoppedPlayerIds={run.shoppedPlayerIds}
            onChange={(tradeOfferTwo) => patch({ tradeOfferTwo, tradeMessage: "" })}
          />
          <button
            className="football-gm__backup-toggle"
            type="button"
            onClick={() => patch({
              tradeOfferTwoEnabled: false,
              tradeOfferTwo: emptyProposal(anchor.id),
              tradeMessage: "",
            })}
          >REMOVE BACKUP OFFER</button>
        </>
      ) : (
        <button
          className="football-gm__backup-toggle"
          type="button"
          onClick={() => patch({
            tradeOfferTwoEnabled: true,
            tradeOfferTwo: emptyProposal(anchor.id),
            tradeMessage: "",
          })}
        >+ ADD BACKUP OFFER (OPTIONAL)</button>
      )}
      <div className="football-gm__inline-actions">
        <button
          className="primary-action"
          type="button"
          disabled={!run.tradeOfferOne.incomingPlayerIds.length}
          onClick={onSubmit}
        >{run.tradeOfferTwoEnabled ? "SUBMIT RANKED OFFERS" : "SUBMIT OFFER"}</button>
        <button type="button" onClick={onEndTalks}>KEEP {anchor.name.toUpperCase()} · END TALKS</button>
      </div>
      <small className="football-gm__trade-warning">
        This partner is final for {anchor.name}. Walking away still counts as shopping him; a 1YR player's camp can raise its extension demand.
      </small>
    </section>
  );
}

function TradeCutResolution({
  run,
  onToggleCut,
  onFinalize,
}: {
  run: PersistedRun;
  onToggleCut: (playerId: string) => void;
  onFinalize: () => void;
}) {
  const pending = run.pendingTradeResolution;
  if (!pending) return null;
  const selected = new Set(pending.cutPlayerIds);
  return (
    <section className="football-gm__trade-cuts surface-card">
      <p className="eyebrow">TRADE ACCEPTED · ROSTER MOVE REQUIRED</p>
      <h2>CUT {pending.requiredCuts} PLAYER{pending.requiredCuts === 1 ? "" : "S"}</h2>
      <p>
        The {pending.partnerTeam} accepted Priority {pending.priority}, but the uneven package would leave you with {pending.postTradePlayerIds.length} players.
        Choose exactly {pending.requiredCuts} cut{pending.requiredCuts === 1 ? "" : "s"} to finalize the deal.
      </p>
      <div className="football-gm__cut-list">
        {pending.postTradePlayerIds.map((playerId) => {
          const player = footballGmPlayerById(playerId);
          if (!player) return null;
          const isSelected = selected.has(playerId);
          return (
            <button
              key={playerId}
              type="button"
              className={isSelected ? "is-selected" : ""}
              onClick={() => onToggleCut(playerId)}
            >
              <span>{player.team} · {player.position}</span>
              <strong>{player.name}</strong>
              <em>{footballGmMoney(player.salaryWindow[1])}</em>
            </button>
          );
        })}
      </div>
      <button
        className="primary-action"
        type="button"
        disabled={pending.cutPlayerIds.length !== pending.requiredCuts}
        onClick={onFinalize}
      >FINALIZE TRADE & CUT{pending.requiredCuts === 1 ? "" : "S"}</button>
    </section>
  );
}

function FinalScreen({
  result,
  challengeStatus,
  opponentName,
  isRecipient,
  onChallenge,
  onReplay,
}: {
  result: FootballGmFinalResultV2;
  challengeStatus: string;
  opponentName: string | null;
  isRecipient: boolean;
  onChallenge: () => void;
  onReplay: () => void;
}) {
  return (
    <section className="football-gm__final surface-card">
      <p className="eyebrow">THE GM · 3-YEAR RESULT</p>
      <h1>{result.score.toFixed(1)}</h1>
      <strong>3-YEAR GM SCORE</strong>
      <div className="football-gm__season-grid">
        {result.seasons.map((season) => (
          <article key={season.year}>
            <small>YEAR {season.year}</small>
            <b>{season.teamGrade.toFixed(1)}</b>
            <span>{season.finish}</span>
          </article>
        ))}
      </div>
      <div className="football-gm__final-math">
        <span><small>3-YEAR CORE</small><b>{result.coreScore.toFixed(1)}</b></span>
        <span><small>AVG PLAYOFF BONUS</small><b>+{result.postseasonBonus.toFixed(1)}</b></span>
      </div>
      <div className="football-gm__final-actions">
        {!isRecipient && opponentName ? (
          <button className="primary-action" type="button" onClick={onChallenge}>CHALLENGE {opponentName}</button>
        ) : null}
        <button type="button" onClick={onReplay}>NEW GM RUN</button>
      </div>
      <p className="football-gm__status" role="status">
        {isRecipient ? "RESULT SUBMITTED. BOTH GM SCORES REVEAL IN THE CHALLENGE RESULT." : challengeStatus}
      </p>
    </section>
  );
}

export default function FootballGmModePage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("gm-football");
  const storedSeed = challengeSeed(profileMatch.challenge?.setup);
  const [seed, setSeed] = useState(() => storedSeed ?? freshSeed());
  const [run, setRun] = useState<PersistedRun>(() => (
    typeof window === "undefined"
      ? initialRun(seed)
      : loadPersistedRun(identity.profile?.id, seed) ?? initialRun(seed)
  ));
  const [challengeStatus, setChallengeStatus] = useState("");
  const [runRepository] = useState(() => createFootballGmRunRepository());
  const opponentName = footballGmPlaytestOpponentName(identity.profile);
  const allowed = isFootballGmPlaytestProfile(identity.profile);

  useEffect(() => {
    if (!storedSeed || storedSeed === seed) return;
    setSeed(storedSeed);
    setRun(loadPersistedRun(identity.profile?.id, storedSeed) ?? initialRun(storedSeed));
  }, [identity.profile?.id, seed, storedSeed]);

  useEffect(() => {
    if (typeof window === "undefined" || !identity.profile?.id) return;
    window.localStorage.setItem(storageKey(identity.profile.id, run.seed), JSON.stringify(run));
  }, [identity.profile?.id, run]);

  useEffect(() => {
    if (!allowed || !identity.profile?.id || !identity.profile.displayName || !runRepository) return;
    const snapshot = gmAuditSnapshot(run, {
      profileId: identity.profile.id,
      profileName: identity.profile.displayName,
      challengeCode: profileMatch.challenge?.code ?? null,
      challengeRole: profileMatch.isRecipient ? "recipient" : "solo",
    });
    void runRepository.save({
      seed: run.seed,
      gameVersion: run.version,
      snapshot,
      completed: run.phase === "final",
    }).catch((error) => {
      console.error("GM run persistence failed", error);
    });
  }, [
    allowed,
    identity.profile?.displayName,
    identity.profile?.id,
    profileMatch.challenge?.code,
    profileMatch.isRecipient,
    run,
    runRepository,
  ]);

  const yearOneRoster = run.roster;
  const finalRoster = run.finalRoster.length ? run.finalRoster : run.roster;
  const finalResult = useMemo(
    () => run.phase === "final"
      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster, finalRoster })
      : null,
    [finalRoster, run.phase, run.seed, yearOneRoster],
  );

  useEffect(() => {
    if (
      !finalResult
      || !profileMatch.isRecipient
      || !profileMatch.challenge
      || profileMatch.challenge.responderResult !== null
    ) return;
    profileMatch.submitResult(asJson(finalResult));
  }, [
    finalResult,
    profileMatch.challenge?.code,
    profileMatch.challenge?.responderResult,
    profileMatch.isRecipient,
  ]);

  if (!identity.ready) return null;
  if (!allowed) return <Navigate to="/football" replace />;

  function patch(next: Partial<PersistedRun>) {
    setRun((current) => ({ ...current, ...next }));
  }

  function spinDraft() {
    const teams = footballGmEligibleTeams({
      roster: run.roster,
      previousTeam: run.previousTeam,
      year: 1,
    });
    const team = footballGmSpinTeam(run.seed, run.spinIndex, teams);
    if (!team) return;
    patch({ pendingTeam: team });
  }

  function makeDraftPick(playerId: string, slot: FootballGmRosterSlot) {
    const player = footballGmPlayerById(playerId);
    if (!player) return;
    const nextRoster = [...run.roster, { slot, playerId, acquired: "draft" as const }];
    patch({
      roster: nextRoster,
      pendingTeam: null,
      previousTeam: player.team,
      spinIndex: run.spinIndex + 1,
      phase: nextRoster.length === 7 ? "year1" : "draft",
    });
  }

  function beginTrade(playerId: string) {
    if (run.shoppedPlayerIds.includes(playerId) || run.pendingTradeResolution) return;
    patch({
      tradeAnchorPlayerId: playerId,
      tradePartnerTeam: null,
      tradeOfferOne: emptyProposal(playerId),
      tradeOfferTwo: emptyProposal(playerId),
      tradeOfferTwoEnabled: false,
      tradeMessage: "",
    });
  }

  function applyShoppingConsequence(messagePrefix: string) {
    const anchor = run.tradeAnchorPlayerId ? footballGmPlayerById(run.tradeAnchorPlayerId) : null;
    if (!anchor) return;
    const nextConsequences = { ...run.negotiationConsequences };
    if (anchor.gameContract === "1YR") {
      nextConsequences[anchor.id] = (nextConsequences[anchor.id] ?? 0) + 1;
    }
    const newSalary = footballGmAdjustedSalaryForPlayer(anchor, 2, run.seed, nextConsequences);
    patch({
      negotiationConsequences: nextConsequences,
      previousTradePartner: run.tradePartnerTeam,
      tradeSpinIndex: run.tradeSpinIndex + 1,
      tradeAnchorPlayerId: null,
      tradePartnerTeam: null,
      tradeOfferOne: emptyProposal(),
      tradeOfferTwo: emptyProposal(),
      tradeOfferTwoEnabled: false,
      pendingTradeResolution: null,
      tradeMessage: anchor.gameContract === "1YR"
        ? `${messagePrefix} ${anchor.name}'s camp raised the extension demand to ${footballGmMoney(newSalary)}.`
        : `${messagePrefix} ${anchor.name} remains under a locked 3YR deal.`,
    });
  }

  function submitTradeOffers() {
    if (!run.tradeAnchorPlayerId || !run.tradePartnerTeam) return;
    const partnerTeam = run.tradePartnerTeam;
    const first = footballGmEvaluateTradeProposal({
      seed: run.seed,
      partnerTeam,
      roster: run.finalRoster,
      proposal: run.tradeOfferOne,
      priority: 1,
    });

    if (first.reason === "invalid" || first.reason === "roster") {
      patch({
        tradeMessage: first.reason === "roster"
          ? "Priority 1 cannot leave you with a usable core, even after the required cuts. Change that package."
          : "Priority 1 needs 1–3 valid players on each side.",
      });
      return;
    }

    let accepted: { evaluation: typeof first; priority: 1 | 2; proposal: FootballGmTradeProposal } | null = first.accepted
      ? { evaluation: first, priority: 1, proposal: run.tradeOfferOne }
      : null;

    if (!accepted && run.tradeOfferTwoEnabled) {
      if (!run.tradeOfferTwo.incomingPlayerIds.length) {
        patch({ tradeMessage: "Your backup offer is empty. Add a package or remove the backup offer." });
        return;
      }
      if (sameTradeProposal(run.tradeOfferOne, run.tradeOfferTwo)) {
        patch({ tradeMessage: "Your backup offer is the same as Priority 1. Change it or remove the backup offer." });
        return;
      }
      const second = footballGmEvaluateTradeProposal({
        seed: run.seed,
        partnerTeam,
        roster: run.finalRoster,
        proposal: run.tradeOfferTwo,
        priority: 2,
      });
      if (second.reason === "invalid" || second.reason === "roster") {
        patch({
          tradeMessage: second.reason === "roster"
            ? "The backup offer cannot leave you with a usable core, even after the required cuts. Change that package."
            : "The backup offer needs 1–3 valid players on each side.",
        });
        return;
      }
      if (second.accepted) accepted = { evaluation: second, priority: 2, proposal: run.tradeOfferTwo };
    }

    if (accepted) {
      const common = {
        previousTradePartner: partnerTeam,
        tradeSpinIndex: run.tradeSpinIndex + 1,
        tradeAnchorPlayerId: null,
        tradePartnerTeam: null,
        tradeOfferOne: emptyProposal(),
        tradeOfferTwo: emptyProposal(),
        tradeOfferTwoEnabled: false,
      };
      if (accepted.evaluation.requiresCuts > 0) {
        patch({
          ...common,
          pendingTradeResolution: {
            partnerTeam,
            priority: accepted.priority,
            anchorPlayerId: run.tradeAnchorPlayerId,
            proposal: {
              outgoingPlayerIds: [...accepted.proposal.outgoingPlayerIds],
              incomingPlayerIds: [...accepted.proposal.incomingPlayerIds],
            },
            postTradePlayerIds: [...accepted.evaluation.postTradePlayerIds],
            requiredCuts: accepted.evaluation.requiresCuts,
            cutPlayerIds: [],
          },
          tradeMessage: `${partnerTeam} accepted Priority ${accepted.priority}. Choose ${accepted.evaluation.requiresCuts} cut${accepted.evaluation.requiresCuts === 1 ? "" : "s"} to finalize the uneven trade.`,
        });
        return;
      }
      if (accepted.evaluation.nextRoster) {
        patch({
          ...common,
          finalRoster: [...accepted.evaluation.nextRoster],
          pendingTradeResolution: null,
          tradeMessage: `${partnerTeam} accepted Priority ${accepted.priority}. Trade completed and locked.`,
        });
        return;
      }
    }

    applyShoppingConsequence(
      `${partnerTeam} rejected ${run.tradeOfferTwoEnabled ? "both offers" : "the offer"}.`,
    );
  }

  function togglePendingCut(playerId: string) {
    const pending = run.pendingTradeResolution;
    if (!pending || !pending.postTradePlayerIds.includes(playerId)) return;
    const current = pending.cutPlayerIds;
    const cutPlayerIds = current.includes(playerId)
      ? current.filter((value) => value !== playerId)
      : current.length < pending.requiredCuts
        ? [...current, playerId]
        : current;
    patch({
      pendingTradeResolution: {
        ...pending,
        cutPlayerIds,
      },
      tradeMessage: "",
    });
  }

  function finalizeTradeCuts() {
    const pending = run.pendingTradeResolution;
    if (!pending || pending.cutPlayerIds.length !== pending.requiredCuts) return;
    const nextRoster = footballGmResolveTradeRoster({
      roster: run.finalRoster,
      proposal: pending.proposal,
      cutPlayerIds: pending.cutPlayerIds,
    });
    if (!nextRoster) {
      patch({ tradeMessage: "Those cuts do not leave a legal core. Choose a different cut combination." });
      return;
    }
    const cutNames = pending.cutPlayerIds
      .map((playerId) => footballGmPlayerById(playerId)?.name)
      .filter(Boolean)
      .join(", ");
    patch({
      finalRoster: [...nextRoster],
      pendingTradeResolution: null,
      tradeMessage: `${pending.partnerTeam} accepted Priority ${pending.priority}. Trade completed${cutNames ? `; cut ${cutNames}` : ""}.`,
    });
  }

  async function challengeOpponent() {
    if (!finalResult || !opponentName) return;
    setChallengeStatus("");
    const url = new URL("/football/gm-mode", window.location.origin);
    const status = await challenges.beginChallenge({
      gameId: "gm-football",
      gameVersion: FOOTBALL_GM_VERSION,
      gameTitle: "The GM",
      summary: `NFL · 3 years · ${footballGmMoney(FOOTBALL_GM_CAP)} cap · one offseason`,
      setup: asJson({
        version: FOOTBALL_GM_VERSION,
        seed: run.seed,
        cap: FOOTBALL_GM_CAP,
        rosterSlots: [...FOOTBALL_GM_ROSTER_SLOTS],
      }),
      creatorResult: asJson(finalResult),
      shareTitle: "The GM Challenge",
      shareText: `I challenged you to The GM. Build a seven-player NFL core under the ${footballGmMoney(FOOTBALL_GM_CAP)} cap and beat my three-year score.`,
      shareUrl: url.toString(),
      allowedRecipientNames: [opponentName],
    });
    setChallengeStatus(status);
  }

  function replay() {
    const nextSeed = freshSeed();
    setSeed(nextSeed);
    setRun(initialRun(nextSeed));
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (profileMatch.code && challenges.loading && !profileMatch.challenge) {
    return <div className="page football-gm-page"><section className="surface-card">Loading GM challenge…</section></div>;
  }

  if (profileMatch.code && !challenges.loading && !profileMatch.challenge) {
    return (
      <div className="page football-gm-page">
        <section className="surface-card"><h1>GM challenge unavailable</h1><p>This matchup is not available to this profile.</p></section>
      </div>
    );
  }

  if (profileMatch.challenge && !storedSeed) {
    return (
      <div className="page football-gm-page">
        <section className="surface-card"><h1>GM challenge unavailable</h1><p>The stored playtest setup is invalid.</p></section>
      </div>
    );
  }

  const offseasonReady = footballGmIsOffseasonCompliantV2(
    run.finalRoster,
    run.seed,
    run.negotiationConsequences,
  );

  return (
    <div className="page football-gm-page">
      <header className="football-gm__header">
        <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
        <span><small>OWNER PLAYTEST</small><strong>THE GM</strong></span>
        <b>3 YEARS</b>
      </header>

      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent you The GM.</strong>
          <small>Build your own roster under the same cap rules. Final three-year GM scores reveal after you finish.</small>
        </section>
      ) : null}

      {run.phase === "intro" ? (
        <section className="football-gm__intro surface-card">
          <p className="eyebrow">NFL FRONT OFFICE CHALLENGE</p>
          <h1>BUILD IT. PAY FOR IT. LIVE WITH IT.</h1>
          <p>Spin an NFL team, sign one legal player from that team, and build a seven-man core under a {footballGmMoney(FOOTBALL_GM_CAP)} cap.</p>
          <div className="football-gm__rules">
            <span><b>7</b><small>QB · RB · WR · FLEX · DL · LB · DB</small></span>
            <span><b>1YR / 3YR</b><small>One-year deals reprice after Year 1. Three-year deals stay locked.</small></span>
            <span><b>1 + 1</b><small>One required trade offer. One optional backup if you actually want it.</small></span>
          </div>
          <p className="football-gm__intro-note">Exact player grades and future salaries stay hidden during the draft. Talent, cap, trade value and roster continuity all matter across the full window.</p>
          <button className="primary-action" type="button" onClick={() => patch({ phase: "draft" })}>START THE DRAFT</button>
        </section>
      ) : null}

      {run.phase === "draft" ? (
        <>
          <CapMeter roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          <RosterGrid roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          {run.pendingTeam ? (
            <CandidateBoard teamCode={run.pendingTeam} roster={run.roster} year={1} onPick={makeDraftPick} />
          ) : (
            <section className="football-gm__wheel surface-card">
              <p className="eyebrow">ROUND {run.roster.length + 1} OF 7</p>
              <h2>{footballGmOpenSlots(run.roster).join(" · ")}</h2>
              <p>Only teams with at least one legal player who still leaves enough cap room to finish the seven-man core are on the wheel.</p>
              <button className="primary-action" type="button" onClick={spinDraft}>SPIN THE NFL WHEEL</button>
            </section>
          )}
        </>
      ) : null}

      {run.phase === "year1" ? (
        <>
          <CapMeter roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          <RosterGrid roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          <section className="football-gm__year-reveal surface-card">
            <p className="eyebrow">YEAR 1 COMPLETE</p>
            <SeasonCard seed={run.seed} year={1} yearOneRoster={run.roster} roster={run.roster} />
            <p>The finish is no longer tied to a fixed grade threshold. Your roster quality sets the odds; the seeded season simulation decides what actually happened.</p>
            <button className="primary-action" type="button" onClick={() => patch({
              phase: "offseason",
              finalRoster: [...run.roster],
            })}>ENTER THE OFFSEASON</button>
          </section>
        </>
      ) : null}

      {run.phase === "offseason" ? (
        <>
          <div className="football-gm__dual-cap">
            <CapMeter roster={run.finalRoster} year={2} seed={run.seed} consequences={run.negotiationConsequences} />
            <CapMeter roster={run.finalRoster} year={3} seed={run.seed} consequences={run.negotiationConsequences} />
          </div>
          <ContinuityMeter yearOneRoster={run.roster} roster={run.finalRoster} />
          <RosterGrid
            roster={run.finalRoster}
            year={2}
            seed={run.seed}
            consequences={run.negotiationConsequences}
            showFutureSalary
            onShop={run.tradeAnchorPlayerId || run.pendingTradeResolution ? undefined : beginTrade}
            shoppedPlayerIds={run.shoppedPlayerIds}
          />

          {run.tradeMessage ? <section className="football-gm__trade-message surface-card">{run.tradeMessage}</section> : null}

          {run.pendingTradeResolution ? (
            <TradeCutResolution
              run={run}
              onToggleCut={togglePendingCut}
              onFinalize={finalizeTradeCuts}
            />
          ) : run.tradeAnchorPlayerId ? (
            <TradeRoom
              run={run}
              patch={patch}
              onSubmit={submitTradeOffers}
              onEndTalks={() => applyShoppingConsequence("You ended the talks without a deal.")}
            />
          ) : (
            <section className={`football-gm__offseason-status surface-card${offseasonReady ? " is-ready" : " is-crisis"}`}>
              <p className="eyebrow">{offseasonReady ? "WINDOW SET" : run.finalRoster.length === 7 ? "CAP CRISIS" : "CORE INCOMPLETE"}</p>
              <h2>{offseasonReady ? "YOU CAN MOVE FORWARD" : "YOU HAVE MOVES TO MAKE"}</h2>
              <p>
                {run.finalRoster.length !== 7
                  ? `Your uneven trades left ${run.finalRoster.length}/7 core spots filled. Use another trade to get back to seven.`
                  : `Years 2 and 3 must both fit under the ${footballGmMoney(FOOTBALL_GM_CAP)} cap. Shop an eligible player, spin one final trade partner, and submit one package with an optional backup.`}
              </p>
              <button
                className="primary-action"
                type="button"
                disabled={!offseasonReady}
                onClick={() => patch({ phase: "years23" })}
              >SIMULATE YEARS 2 & 3</button>
            </section>
          )}
        </>
      ) : null}

      {run.phase === "years23" ? (
        <section className="football-gm__years23 surface-card">
          <p className="eyebrow">THE WINDOW</p>
          <h1>YEARS 2 & 3</h1>
          <ContinuityMeter yearOneRoster={run.roster} roster={run.finalRoster} />
          <div className="football-gm__season-grid">
            <SeasonCard seed={run.seed} year={2} yearOneRoster={run.roster} roster={run.finalRoster} />
            <SeasonCard seed={run.seed} year={3} yearOneRoster={run.roster} roster={run.finalRoster} />
          </div>
          <p>No second offseason. Talent still drives the team, but a massive Year 2 rebuild carries a continuity cost that partially recovers in Year 3.</p>
          <button className="primary-action" type="button" onClick={() => patch({ phase: "final" })}>SEE 3-YEAR GM SCORE</button>
        </section>
      ) : null}

      {run.phase === "final" && finalResult ? (
        <FinalScreen
          result={finalResult}
          challengeStatus={challengeStatus}
          opponentName={opponentName}
          isRecipient={profileMatch.isRecipient}
          onChallenge={() => void challengeOpponent()}
          onReplay={replay}
        />
      ) : null}
    </div>
  );
}
