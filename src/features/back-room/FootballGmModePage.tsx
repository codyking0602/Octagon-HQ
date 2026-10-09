import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { useIdentity } from "../identity/IdentityProvider";
import { createFootballGmRunRepository } from "./footballGmRunRepository";
import {
  loadWheelFootballRoster,
  wheelFootballTeam,
  type WheelFootballTeam,
} from "./wheelFootballModel";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmAutoAddPick,
  footballGmCandidatesForTeam,
  footballGmEligibleTeams,
  footballGmMoney,
  footballGmOpenSlots,
  footballGmPlayerById,
  footballGmPlayoffFinishLabel,
  footballGmReflowRoster,
  footballGmRosterCap,
  footballGmRosterPlayers,
  footballGmSlotLabel,
  footballGmSpinTeam,
  type FootballGmPlayer,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
  type FootballGmTeamCandidate,
} from "./footballGmEngine";
import {
  FOOTBALL_GM_VERSION,
  footballGmAcceptedTargetTradeOffers,
  footballGmAdjustedHoldingsCap,
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmCanUseFreeAgency,
  footballGmContinuity,
  footballGmEligibleFreeAgencyTeams,
  footballGmEligibleTradeTeams,
  footballGmFinalResultV2,
  footballGmFreeAgencyCandidatesForTeam,
  footballGmIsOffseasonCompliantV2,
  footballGmResolveTradeAssets,
  footballGmSeasonResultV2,
  footballGmSeasonRecordLabel,
  footballGmTeamOverall,
  footballGmSignFreeAgent,
  footballGmTradePartnerPlayers,
  type FootballGmNegotiationConsequences,
  type FootballGmSeasonResultV2,
  type FootballGmTradeProposal,
} from "./footballGmStrategy";
import { FootballGmFranchiseReport } from "./FootballGmFranchiseReport";
import { FootballGmDevelopmentReport } from "./FootballGmDevelopmentReport";
import { FOOTBALL_GM_DEVELOPMENT_SEED_TAG } from "./wheelFootballGmEconomy";
import { footballGmRepriceLabel, footballGmScoutingSnapshot } from "./footballGmScouting";

type Phase = "intro" | "draft" | "year1" | "offseason" | "years23" | "final";

interface PendingTradeResolution {
  partnerTeam: string;
  offerNumber: number;
  anchorPlayerId: string;
  targetPlayerId: string;
  proposal: FootballGmTradeProposal;
  postTradePlayerIds: string[];
  requiredCuts: number;
  cutPlayerIds: string[];
}

export interface PersistedRun {
  version: string;
  seed: string;
  phase: Phase;
  roster: FootballGmRosterEntry[];
  finalRoster: FootballGmRosterEntry[];
  tradeChipPlayerIds: string[];
  spinIndex: number;
  previousTeam: string | null;
  pendingTeam: string | null;
  freeAgentSpinIndex: number;
  previousFreeAgentTeam: string | null;
  pendingFreeAgentTeam: string | null;
  voluntaryFreeAgencyUsed: boolean;
  releasedFreeAgentPlayerId: string | null;
  tradeSpinIndex: number;
  previousTradePartner: string | null;
  tradeAnchorPlayerId: string | null;
  tradePartnerTeam: string | null;
  tradeTargetPlayerId: string | null;
  shoppedPlayerIds: string[];
  pendingTradeResolution: PendingTradeResolution | null;
  negotiationConsequences: Record<string, number>;
  tradeMessage: string;
  /** Immutable solo results once the franchise is completed. */
  resolvedSeasons?: FootballGmSeasonResultV2[];
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function challengeSeed(value: ChallengeJson | undefined) {
  const row = record(value);
  return [FOOTBALL_GM_VERSION, "football-gm-v10-shared-real-seasons", "football-gm-v9-grade-driven-playoffs"].includes(String(row?.version)) && typeof row?.seed === "string"
    ? row.seed
    : null;
}

function freshSeed() {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${id}${FOOTBALL_GM_DEVELOPMENT_SEED_TAG}`;
}

export function initialRun(seed: string): PersistedRun {
  return {
    version: FOOTBALL_GM_VERSION,
    seed,
    phase: "intro",
    roster: [],
    finalRoster: [],
    tradeChipPlayerIds: [],
    spinIndex: 0,
    previousTeam: null,
    pendingTeam: null,
    freeAgentSpinIndex: 0,
    previousFreeAgentTeam: null,
    pendingFreeAgentTeam: null,
    voluntaryFreeAgencyUsed: false,
    releasedFreeAgentPlayerId: null,
    tradeSpinIndex: 0,
    previousTradePartner: null,
    tradeAnchorPlayerId: null,
    tradePartnerTeam: null,
    tradeTargetPlayerId: null,
    shoppedPlayerIds: [],
    pendingTradeResolution: null,
    negotiationConsequences: {},
    tradeMessage: "",
    resolvedSeasons: [],
  };
}

function storageKey(profileId: string | undefined, seed: string) {
  return `octagon:football-gm:${profileId ?? "anon"}:${seed}`;
}

function activeStorageKey(profileId: string) {
  return `octagon:football-gm:${profileId}:active`;
}

function parsePersistedRun(value: unknown) {
  if (!value || Array.isArray(value) || typeof value !== "object") return null;
  const parsed = value as Partial<PersistedRun>;
  const compatibleVersion = parsed.version === FOOTBALL_GM_VERSION
    || parsed.version === "football-gm-v10-shared-real-seasons"
    || parsed.version === "football-gm-v9-grade-driven-playoffs"
    || parsed.version === "football-gm-v8-head-to-head";
  if (
    !compatibleVersion
    || typeof parsed.seed !== "string"
    || typeof parsed.phase !== "string"
    || !Array.isArray(parsed.roster)
    || !Array.isArray(parsed.finalRoster)
  ) return null;
  const roster = footballGmReflowRoster(parsed.roster as FootballGmRosterEntry[]);
  const finalRoster = footballGmReflowRoster(parsed.finalRoster as FootballGmRosterEntry[]);
  if (!roster || !finalRoster) return null;
  return {
    ...parsed,
    version: FOOTBALL_GM_VERSION,
    resolvedSeasons: Array.isArray(parsed.resolvedSeasons) && parsed.resolvedSeasons.length === 3
      ? parsed.resolvedSeasons : [],
    roster,
    finalRoster,
  } as PersistedRun;
}

function loadPersistedRun(profileId: string | undefined, seed: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(profileId, seed));
    if (!raw) return null;
    const parsed = parsePersistedRun(JSON.parse(raw));
    return parsed?.seed === seed ? parsed : null;
  } catch {
    return null;
  }
}

function loadActivePersistedRun(profileId: string) {
  try {
    const seed = window.localStorage.getItem(activeStorageKey(profileId));
    if (!seed) return null;
    const run = loadPersistedRun(profileId, seed);
    if (!run || run.phase === "final") {
      window.localStorage.removeItem(activeStorageKey(profileId));
      return null;
    }
    return run;
  } catch {
    return null;
  }
}

function runFromAuditSnapshot(value: ChallengeJson | null) {
  const snapshot = value && !Array.isArray(value) && typeof value === "object"
    ? value as { [key: string]: ChallengeJson }
    : null;
  const parsed = parsePersistedRun(snapshot?.run ?? null);
  const finalResult = snapshot?.finalResult && !Array.isArray(snapshot.finalResult)
    && typeof snapshot.finalResult === "object"
    ? snapshot.finalResult as { [key: string]: ChallengeJson } : null;
  const oldSeasons = finalResult?.seasons;
  if (parsed && parsed.phase === "final" && Array.isArray(oldSeasons) && oldSeasons.length === 3) {
    return { ...parsed, resolvedSeasons: oldSeasons as unknown as FootballGmSeasonResultV2[] };
  }
  return parsed;
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
  const targetOffers = run.tradePartnerTeam && run.tradeAnchorPlayerId && run.tradeTargetPlayerId
    ? footballGmAcceptedTargetTradeOffers({
        seed: run.seed,
        partnerTeam: run.tradePartnerTeam,
        roster: run.finalRoster,
        tradeChipPlayerIds: run.tradeChipPlayerIds,
        anchorPlayerId: run.tradeAnchorPlayerId,
        targetPlayerId: run.tradeTargetPlayerId,
        shoppedPlayerIds: run.shoppedPlayerIds,
      })
    : [];

  return asJson({
    version: run.version,
    seed: run.seed,
    phase: run.phase,
    context,
    run,
    cap: {
      limit: FOOTBALL_GM_CAP,
      year1: footballGmRosterCap(run.roster, 1),
      year2: footballGmAdjustedHoldingsCap(effectiveFinalRoster, run.tradeChipPlayerIds, 2, run.seed, run.negotiationConsequences),
      year3: footballGmAdjustedHoldingsCap(effectiveFinalRoster, run.tradeChipPlayerIds, 3, run.seed, run.negotiationConsequences),
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
            ? footballGmTradePartnerPlayers(run.tradePartnerTeam, run.finalRoster, run.tradeChipPlayerIds).map((player) => auditPlayer(player.id))
            : [],
          target: run.tradeTargetPlayerId ? auditPlayer(run.tradeTargetPlayerId) : null,
          askingPrices: targetOffers.map((offer, index) => ({
            offerNumber: index + 1,
            proposal: offer.proposal,
            evaluation: offer.evaluation,
            shape: offer.shape,
          })),
        }
      : null,
    negotiationConsequences: run.negotiationConsequences,
    tradeChips: run.tradeChipPlayerIds.map((playerId) => auditPlayer(playerId)),
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
        ? run.resolvedSeasons?.[0] ?? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.roster, year: 1 })
        : null,
      year2: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? run.resolvedSeasons?.[1] ?? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 2 })
        : null,
      year3: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? run.resolvedSeasons?.[2] ?? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.finalRoster, year: 3 })
        : null,
    },
    finalResult: run.phase === "final" && run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster: run.roster, finalRoster: run.finalRoster, resolvedSeasons: run.resolvedSeasons })
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

function WheelTeamLogo({ team }: { team: WheelFootballTeam }) {
  return (
    <span className="football-wheel-team-logo" aria-hidden="true">
      {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
    </span>
  );
}

function normalizedGmPlayerName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const footballGmHeadshotCache = new Map<string, string | null>();
const footballGmTeamHeadshotLoads = new Map<string, Promise<Map<string, string | null>>>();

function footballGmHeadshotsForTeam(teamCode: string) {
  const cached = footballGmTeamHeadshotLoads.get(teamCode);
  if (cached) return cached;
  const load = loadWheelFootballRoster(teamCode)
    .then((candidates) => new Map(
      candidates.map((candidate) => [
        normalizedGmPlayerName(candidate.name),
        candidate.headshotUrl,
      ]),
    ))
    .catch(() => new Map<string, string | null>());
  footballGmTeamHeadshotLoads.set(teamCode, load);
  return load;
}

export function PlayerHeadshot({
  player,
  className = "football-gm__player-headshot",
}: {
  player: Pick<FootballGmPlayer, "team" | "name">;
  className?: string;
}) {
  const cacheKey = `${player.team}:${normalizedGmPlayerName(player.name)}`;
  const [headshot, setHeadshot] = useState<string | null | undefined>(() => footballGmHeadshotCache.get(cacheKey));
  const team = wheelFootballTeam(player.team);

  useEffect(() => {
    if (headshot !== undefined) return;
    let active = true;
    void footballGmHeadshotsForTeam(player.team).then((headshots) => {
      const resolved = headshots.get(normalizedGmPlayerName(player.name)) ?? null;
      footballGmHeadshotCache.set(cacheKey, resolved);
      if (active) setHeadshot(resolved);
    });
    return () => {
      active = false;
    };
  }, [cacheKey, headshot, player.name, player.team]);

  return (
    <span className={className} aria-hidden="true">
      {headshot ? (
        <img src={headshot} alt="" onError={() => setHeadshot(null)} />
      ) : team?.logoSrc ? (
        <img src={team.logoSrc} alt="" />
      ) : (
        <b>{team?.shortCode ?? player.team}</b>
      )}
    </span>
  );
}

export function PlayerQualityPill({
  player, year = 1, seed,
}: { player: FootballGmPlayer; year?: 1 | 2 | 3; seed?: string }) {
  const tier = footballGmScoutingSnapshot(player, year, seed).tier;
  return <span className={`football-gm__quality-pill quality-${tier.toLowerCase()}`}>{tier}</span>;
}

export function PlayerOutlookPill({
  player, year = 1, seed,
}: { player: FootballGmPlayer; year?: 1 | 2 | 3; seed?: string }) {
  const outlook = footballGmScoutingSnapshot(player, year, seed).outlook;
  if (!outlook) return null;
  const tone = outlook === "HIGH UPSIDE" ? "upside"
    : outlook === "RISING" ? "rising"
      : outlook === "BOOM/BUST" ? "volatile"
        : outlook === "DECLINE RISK" ? "decline" : "stable";
  return <span className={`football-gm__outlook-pill outlook-${tone}`}>{outlook}</span>;
}

/** Historical movement stays secondary to talent, outlook and contract. */
export function PlayerDevelopmentNote({ player, seed }: { player: FootballGmPlayer; seed: string }) {
  const outcome = footballGmScoutingSnapshot(player, 2, seed).development;
  if (!outcome) return null;
  const tone = outcome === "BREAKOUT" || outcome === "IMPROVED" ? "up"
    : outcome === "REGRESSED" || outcome === "MAJOR REGRESSION" ? "down" : "steady";
  const arrow = tone === "up" ? "↗" : tone === "down" ? "↘" : "–";
  return <span className={`football-gm__development-note is-${tone}`}>
    <span aria-hidden="true">{arrow}</span> {outcome === "HELD STEADY" ? "Held steady in Year 1" : `${outcome.charAt(0)}${outcome.slice(1).toLowerCase()} in Year 1`}
  </span>;
}

function wheelTeamBackground(teams: readonly WheelFootballTeam[]) {
  if (!teams.length) return undefined;
  const slice = 360 / teams.length;
  const stops = teams.flatMap((team, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return [`${team.primaryColor} ${start}deg`, `${team.primaryColor} ${end}deg`];
  });
  return `conic-gradient(from ${-slice / 2}deg, ${stops.join(", ")})`;
}

export function GmFootballWheel({
  teams,
  rotation,
  spinning,
  pendingTeam,
  canSpin,
  onSpin,
}: {
  teams: readonly WheelFootballTeam[];
  rotation: number;
  spinning: boolean;
  pendingTeam: WheelFootballTeam | null;
  canSpin: boolean;
  onSpin: () => void;
}) {
  return (
    <section className="football-wheel surface-card" aria-label="Football team wheel">
      <div className="football-wheel__pointer" aria-hidden="true" />
      <div
        className={`football-wheel__disc${spinning ? " is-spinning" : ""}${teams.length > 40 ? " is-dense" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: wheelTeamBackground(teams),
        }}
      >
        <div className="football-wheel__rings" aria-hidden="true" />
        {teams.map((team, index) => (
          <span
            className="football-wheel__label"
            key={team.code}
            style={{
              "--wheel-index": index,
              "--wheel-count": teams.length,
              "--team-primary": team.primaryColor,
              "--team-secondary": team.secondaryColor,
            } as CSSProperties}
            title={team.name}
          >
            {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
          </span>
        ))}
      </div>
      <button
        className={`football-wheel__center${pendingTeam ? " has-team" : ""}`}
        type="button"
        disabled={!canSpin || spinning}
        onClick={onSpin}
      >
        {pendingTeam ? (
          <>
            <WheelTeamLogo team={pendingTeam} />
            <strong>{pendingTeam.shortCode}</strong>
          </>
        ) : spinning ? (
          <><strong>SPINNING</strong><span>…</span></>
        ) : (
          <><strong>SPIN</strong><span>THE WHEEL</span></>
        )}
      </button>
    </section>
  );
}

export function CapMeter({
  roster,
  year,
  seed,
  consequences,
  tradeChipPlayerIds = [],
}: {
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  tradeChipPlayerIds?: readonly string[];
}) {
  const spent = year === 1
    ? footballGmRosterCap(roster, 1)
    : footballGmAdjustedHoldingsCap(roster, tradeChipPlayerIds, year, seed, consequences);
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

export function RosterGrid({
  roster,
  year,
  seed,
  consequences,
  showFutureSalary = false,
  compact = false,
  onShop,
  shoppedPlayerIds = [],
}: {
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  showFutureSalary?: boolean;
  compact?: boolean;
  onShop?: (playerId: string) => void;
  shoppedPlayerIds?: readonly string[];
}) {
  const optimized = footballGmReflowRoster(roster, year, seed) ?? roster;
  const bySlot = new Map(optimized.map((entry) => [entry.slot, entry]));
  return (
    <section className={"football-gm__roster surface-card" + (compact ? " is-compact" : "")}>
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
              <small>{footballGmSlotLabel(slot)}</small>
              {player ? (
                <>
                  <div className="football-gm__roster-player">
                    <PlayerHeadshot player={player} />
                    <span>
                      <strong>{player.name}</strong>
                      <em>{player.team} · {player.position}</em>
                      <span className="football-gm__roster-scouting">
                        <PlayerQualityPill player={player} year={year} seed={seed} />
                        <PlayerOutlookPill player={player} year={year} seed={seed} />
                        {year === 2 ? <PlayerDevelopmentNote player={player} seed={seed} /> : null}
                      </span>
                    </span>
                  </div>
                  <div className="football-gm__roster-contract">
                    <b>{footballGmMoney(salary)}</b>
                    <span>{failedTalks && player.gameContract === "1YR"
                      ? `CAMP MARKUP · ${failedTalks} FAILED TALK${failedTalks === 1 ? "" : "S"}`
                      : showFutureSalary ? `Y2/Y3 · ${player.gameContract}` : player.gameContract}</span>
                    {year === 1 ? <small className="football-gm__roster-reprice">{footballGmRepriceLabel(player.extensionRisk)}</small> : null}
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

export function CandidateBoard({
  teamCode,
  roster,
  year,
  onPick,
  excludedPlayerIds = [],
}: {
  teamCode: string;
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2;
  onPick: (playerId: string) => void;
  excludedPlayerIds?: readonly string[];
}) {
  const team = wheelFootballTeam(teamCode);
  const candidates = footballGmCandidatesForTeam({
    team: teamCode,
    roster,
    year,
    excludedPlayerIds,
  });
  const [showScoutKey, setShowScoutKey] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  // Position tabs filter the legal market only. Picking is still auto-reflowed,
  // so WR/RB/TE players can fill FLEX without the user pre-assigning a slot.
  const positionFor = (player: FootballGmPlayer) => {
    if (player.position === "TE" || player.family === "TE") return "TE";
    if (player.position === "QB" || player.position === "RB" || player.position === "WR") return player.position;
    if (player.family === "Front Seven") return "FRONT 7";
    if (player.eligibleSlots.includes("DB")) return "DB";
    return player.eligibleSlots.includes("RB") ? "RB" : "WR";
  };
  const positions = ["QB", "RB", "WR", "TE", "FRONT 7", "DB"] as const;
  const availablePositions = positions.filter((position) =>
    candidates.some(({ player }) => positionFor(player) === position));
  const visibleCandidates = selectedPosition && availablePositions.includes(selectedPosition as typeof positions[number])
    ? candidates.filter(({ player }) => positionFor(player) === selectedPosition) : [];

  useEffect(() => {
    setShowScoutKey(false);
    setSelectedPosition(null);
  }, [teamCode]);

  if (!team) return null;

  return (
    <>
      <section className="football-wheel-picker football-gm__picker surface-card" style={playerStyle(teamCode)}>
        <header>
          <WheelTeamLogo team={team} />
          <div>
            <p className="eyebrow">YOUR SPIN</p>
            <h2>{team.name}</h2>
            <span>Choose a position, then a player. GM automatically fits the legal roster spots.</span>
          </div>
          <button
            className="football-gm__scout-key-button"
            type="button"
            aria-label="Open player scouting key"
            onClick={() => setShowScoutKey(true)}
          >?</button>
        </header>

        <div className="football-wheel-picker__slots football-gm__position-tabs" aria-label="Available positions">
          {availablePositions.map((position) => (
            <button
              type="button"
              key={position}
              className={selectedPosition === position ? "is-active" : ""}
              aria-pressed={selectedPosition === position}
              onClick={() => setSelectedPosition(position)}
            >
              <strong>{position}</strong>
            </button>
          ))}
        </div>
        {selectedPosition ? (
        <div className="football-wheel-picker__candidates football-gm__picker-candidates" aria-label={`${selectedPosition} candidates`}>
          {visibleCandidates.map(({ player, salary }) => (
            <button
              type="button"
              onClick={() => onPick(player.id)}
              key={player.id}
            >
              <PlayerHeadshot player={player} className="football-wheel-picker__headshot" />
              <span className="football-gm__picker-player-copy">
                <strong>{player.name}</strong>
                <small>{player.position} · AGE {player.age}</small>
                <span className="football-gm__candidate-tags">
                  <PlayerQualityPill player={player} />
                  <PlayerOutlookPill player={player} />
                  <span>{player.gameContract}</span>
                  <span className={`risk-${player.extensionRisk.toLowerCase()}`}>
                    {footballGmRepriceLabel(player.extensionRisk)}
                  </span>
                </span>
              </span>
              <span className="football-gm__picker-action">
                <b>{footballGmMoney(salary)}</b>
                <em>SELECT →</em>
              </span>
            </button>
          ))}
        </div>
        ) : (
          <p className="football-wheel-picker__message football-gm__position-prompt">
            {candidates.length ? "Select a position to see available players." : "No legal player from this team fits the remaining roster and cap."}
          </p>
        )}
      </section>

      {showScoutKey ? (
        <div className="football-gm__scout-sheet-backdrop" role="presentation" onClick={() => setShowScoutKey(false)}>
          <section
            className="football-gm__scout-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Player scouting key"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <span><small>PLAYER OUTLOOK</small><strong>SCOUT KEY</strong></span>
              <button type="button" aria-label="Close player scouting key" onClick={() => setShowScoutKey(false)}>×</button>
            </header>
            <div>
              <p><b>ELITE / IMPACT / STARTER / DEPTH</b><span>Broad current-ability scouting bands. Exact grades stay hidden.</span></p>
              <p><b>HIGH UPSIDE / RISING / STEADY / BOOM/BUST / DECLINE RISK</b><span>Five outlooks derived from individual development probabilities. They recalculate for Year 3 after the first season.</span></p>
              <p><b>1YR</b><span>Salary reprices after Year 1.</span></p>
              <p><b>3YR · SALARY LOCKED</b><span>Salary stays fixed for the full game.</span></p>
              <p><b>LOW / MED / HIGH REPRICE</b><span>Expected size of a 1YR salary increase (not an exact probability). Repricing is settled in the offseason.</span></p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function FreeAgencyBoard({
  teamCode,
  roster,
  tradeChipPlayerIds,
  seed,
  consequences,
  onPick,
  excludedPlayerIds = [],
  sharedMarket = false,
}: {
  teamCode: string;
  roster: readonly FootballGmRosterEntry[];
  tradeChipPlayerIds: readonly string[];
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  onPick: (playerId: string, slot: FootballGmRosterSlot, displacedPlayerId?: string) => void;
  excludedPlayerIds?: readonly string[];
  sharedMarket?: boolean;
}) {
  const team = wheelFootballTeam(teamCode);
  const candidates = footballGmFreeAgencyCandidatesForTeam({
    team: teamCode,
    roster,
    tradeChipPlayerIds,
    seed,
    consequences,
    excludedPlayerIds,
  });
  return (
    <section className="football-wheel-picker football-gm__picker football-gm__market-picker surface-card" style={playerStyle(teamCode)}>
      <header>
        <TeamLogo teamCode={teamCode} />
        <div>
          <p className="eyebrow">FREE AGENCY · {sharedMarket ? "SHARED 1YR MARKET" : "1YR MARKET"}</p>
          <h2>{team?.name ?? teamCode}</h2>
          <span>{sharedMarket
            ? "Choose any legal fit. A player already held by the other GM never appears."
            : "Choose any legal fit for your roster and cap."}</span>
        </div>
      </header>
      <div className="football-gm__market-list">
        {candidates.map(({ player, legalSlots, displacementOptions, salary }) => (
          <article className="football-gm__market-player" key={player.id} style={playerStyle(player.team)}>
            <PlayerHeadshot player={player} className="football-wheel-picker__headshot" />
            <div className="football-gm__market-copy">
              <strong>{player.name}</strong>
              <small>{player.position} · AGE {player.age}</small>
              <div className="football-gm__candidate-tags">
                <PlayerQualityPill player={player} year={2} seed={seed} />
                <PlayerOutlookPill player={player} year={2} seed={seed} />
                <span>1YR</span>
                <PlayerDevelopmentNote player={player} seed={seed} />
              </div>
            </div>
            <b>{footballGmMoney(salary)}</b>
            <div className="football-gm__market-actions">
              {legalSlots.map((slot) => (
                <button type="button" key={`open:${slot}`} onClick={() => onPick(player.id, slot)}>
                  SIGN AS {footballGmSlotLabel(slot)}
                </button>
              ))}
              {displacementOptions.map((option) => {
                const displaced = footballGmPlayerById(option.displacedPlayerId);
                return (
                  <button
                    type="button"
                    key={`displace:${option.slot}:${option.displacedPlayerId}`}
                    onClick={() => onPick(player.id, option.slot, option.displacedPlayerId)}
                  >
                    {footballGmSlotLabel(option.slot)} · REPLACE {displaced?.name.toUpperCase() ?? "INCUMBENT"}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function freeAgencyReleaseBudget(
  roster: readonly FootballGmRosterEntry[],
  playerId: string,
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  const stripped = roster.filter((entry) => entry.playerId !== playerId);
  if (stripped.length !== FOOTBALL_GM_ROSTER_SLOTS.length - 1) return 0;
  const year2Room = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 2, seed, consequences);
  const year3Room = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 3, seed, consequences);
  return Math.max(0, Math.min(year2Room, year3Room));
}

export function FreeAgencyReleasePanel({
  roster,
  seed,
  consequences,
  onRelease,
}: {
  roster: readonly FootballGmRosterEntry[];
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  onRelease: (playerId: string) => void;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const rows = footballGmRosterPlayers(roster).map(({ entry, player }) => {
    const stripped = roster.filter((candidate) => candidate.playerId !== player.id);
    const eligibleTeams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed,
      consequences,
      tradeChipPlayerIds: [],
      excludedPlayerIds: [player.id],
    });
    return {
      entry,
      player,
      budget: freeAgencyReleaseBudget(roster, player.id, seed, consequences),
      eligibleTeams: eligibleTeams.length,
    };
  });
  const selected = rows.find((row) => row.player.id === selectedPlayerId) ?? null;

  return (
    <section className="football-gm__trade-cuts surface-card">
      <p className="eyebrow">ONE VOLUNTARY RELEASE</p>
      <h2>CREATE ONE EXTRA FA OPENING</h2>
      <p>
        You may deliberately cut one settled starter during the offseason. His salary plus any existing cap room becomes your free-agent budget.
        That is the only manufactured-vacancy limit: normal trades and released displaced assets can reopen free agency whenever they leave fewer than seven held assets.
      </p>
      <div className="football-gm__cut-list">
        {rows.map(({ entry, player, budget, eligibleTeams }) => {
          const selectedRow = player.id === selectedPlayerId;
          return (
            <button
              key={player.id}
              type="button"
              className={selectedRow ? "is-selected" : ""}
              disabled={!eligibleTeams}
              onClick={() => setSelectedPlayerId(selectedRow ? null : player.id)}
            >
              <span>{footballGmSlotLabel(entry.slot)} · {eligibleTeams ? `${eligibleTeams} WHEEL TEAMS` : "NO LEGAL REPLACEMENT"}</span>
              <strong>{player.name}</strong>
              <em>FA BUDGET {footballGmMoney(budget)}</em>
            </button>
          );
        })}
      </div>
      {selected ? (
        <button
          className="primary-action"
          type="button"
          onClick={() => onRelease(selected.player.id)}
        >RELEASE {selected.player.name.toUpperCase()} · {footballGmMoney(selected.budget)} BUDGET</button>
      ) : null}
      <small className="football-gm__trade-warning">
        The release is final. Your one voluntary cut cannot be undone, and that player cannot be re-signed this offseason.
      </small>
    </section>
  );
}

export function TradeChipPanel({
  playerIds,
  seed,
  consequences,
  shoppedPlayerIds,
  onShop,
  onRelease,
}: {
  playerIds: readonly string[];
  seed: string;
  consequences: FootballGmNegotiationConsequences;
  shoppedPlayerIds: readonly string[];
  onShop: (playerId: string) => void;
  onRelease: (playerId: string) => void;
}) {
  if (!playerIds.length) return null;
  return (
    <section className="football-gm__trade-cuts surface-card">
      <p className="eyebrow">DISPLACED ASSET{playerIds.length === 1 ? "" : "S"}</p>
      <h2>KEEP WORKING THE ROSTER</h2>
      <p>
        A non-matching signing displaced {playerIds.length === 1 ? "an incumbent" : "incumbents"} from the active core.
        These players are still your trade assets. Shop them through the normal Trade Room — there is no special one-for-one or position-match restriction.
      </p>
      <div className="football-gm__trade-chip-list">
        {playerIds.map((playerId) => {
          const player = footballGmPlayerById(playerId);
          if (!player) return null;
          const shopped = shoppedPlayerIds.includes(playerId);
          return (
            <article className="football-gm__trade-chip" key={playerId}>
              <span>{player.team} · {player.position} · {player.gameContract}</span>
              <strong>{player.name}</strong>
              <em>{footballGmMoney(footballGmAdjustedSalaryForPlayer(player, 2, seed, consequences))}</em>
              <span className="football-gm__trade-scouting">
                <PlayerQualityPill player={player} year={2} seed={seed} />
                <PlayerOutlookPill player={player} year={2} seed={seed} />
                <PlayerDevelopmentNote player={player} seed={seed} />
              </span>
              <div className="football-gm__inline-actions">
                <button type="button" disabled={shopped} onClick={() => onShop(playerId)}>
                  {shopped ? "SHOPPED" : "SHOP NORMALLY"}
                </button>
                <button type="button" onClick={() => onRelease(playerId)}>RELEASE</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function SeasonCard({
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
      <strong>{footballGmTeamOverall(result.teamGrade)} OVR</strong>
      <span>TEAM OVR · {result.titleOdds.toFixed(1)}% TITLE ODDS</span>
      {footballGmSeasonRecordLabel(result) ? <span>{footballGmSeasonRecordLabel(result)} REGULAR SEASON</span> : null}
      <b>{footballGmPlayoffFinishLabel(result.finish)}</b>

    </article>
  );
}

export function ContinuityMeter({
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
      <small>YEAR 2 GAME ODDS −{(year2.winChancePenalty * 100).toFixed(1)} PP · YEAR 3 −{(year3.winChancePenalty * 100).toFixed(1)} PP · Team OVR unaffected.</small>
    </section>
  );
}

function sameTradeProposal(left: FootballGmTradeProposal, right: FootballGmTradeProposal) {
  const normalize = (values: readonly string[]) => [...values].sort().join("|");
  return normalize(left.outgoingPlayerIds) === normalize(right.outgoingPlayerIds)
    && normalize(left.incomingPlayerIds) === normalize(right.incomingPlayerIds);
}

function TradePackagePlayer({
  playerId,
  seed,
  consequences,
}: {
  playerId: string;
  seed: string;
  consequences: FootballGmNegotiationConsequences;
}) {
  const player = footballGmPlayerById(playerId);
  if (!player) return null;
  const salary = footballGmAdjustedSalaryForPlayer(player, 2, seed, consequences);
  return (
    <div className="football-gm__trade-package-player">
      <span>{player.team} · {player.position} · {player.gameContract}</span>
      <strong>{player.name}</strong>
      <em>{footballGmMoney(salary)}</em>
      <span className="football-gm__trade-scouting">
        <PlayerQualityPill player={player} year={2} seed={seed} />
        <PlayerOutlookPill player={player} year={2} seed={seed} />
        <PlayerDevelopmentNote player={player} seed={seed} />
      </span>
    </div>
  );
}

export function TradeRoom({
  run,
  patch,
  onAccept,
  onEndTalks,
  excludedPlayerIds = [],
}: {
  run: PersistedRun;
  patch: (next: Partial<PersistedRun>) => void;
  onAccept: (proposal: FootballGmTradeProposal, offerNumber: number) => void;
  onEndTalks: () => void;
  excludedPlayerIds?: readonly string[];
}) {
  const anchor = run.tradeAnchorPlayerId ? footballGmPlayerById(run.tradeAnchorPlayerId) : null;
  if (!anchor) return null;
  const partner = run.tradePartnerTeam ? wheelFootballTeam(run.tradePartnerTeam) : null;
  const [tradeWheelRotation, setTradeWheelRotation] = useState(0);
  const [tradeWheelSpinning, setTradeWheelSpinning] = useState(false);
  const tradeTeamCodes = footballGmEligibleTradeTeams(anchor.id).filter((teamCode) => (
    footballGmTradePartnerPlayers(
      teamCode,
      run.finalRoster,
      run.tradeChipPlayerIds,
      excludedPlayerIds,
    ).length > 0
  ));
  const tradeWheelTeams = tradeTeamCodes
    .map((teamCode) => wheelFootballTeam(teamCode))
    .filter((team): team is WheelFootballTeam => Boolean(team));

  if (!run.tradePartnerTeam) {
    return (
      <section className="football-gm__trade-wheel-stage">
        <div className="football-gm__trade-stage-heading">
          <p className="eyebrow">SHOPPING {anchor.name.toUpperCase()}</p>
          <h2>FIND A TRADE PARTNER</h2>
          <span>Spin one team. Choose one target. Then decide between the accepted asking prices.</span>
        </div>
        <GmFootballWheel
          teams={tradeWheelTeams}
          rotation={tradeWheelRotation}
          spinning={tradeWheelSpinning}
          pendingTeam={null}
          canSpin={!tradeWheelSpinning && tradeWheelTeams.length > 0}
          onSpin={() => {
            if (tradeWheelSpinning || !tradeTeamCodes.length) return;
            const teamCode = footballGmSpinTeam(run.seed, 500 + run.tradeSpinIndex, tradeTeamCodes);
            if (!teamCode) return;
            const index = tradeWheelTeams.findIndex((team) => team.code === teamCode);
            if (index < 0) return;
            const step = 360 / tradeWheelTeams.length;
            setTradeWheelSpinning(true);
            setTradeWheelRotation((current) => {
              const modulo = ((current % 360) + 360) % 360;
              const target = ((-index * step) % 360 + 360) % 360;
              return current + 1080 + ((target - modulo + 360) % 360);
            });
            window.setTimeout(() => {
              setTradeWheelSpinning(false);
              patch({
                tradePartnerTeam: teamCode,
                tradeTargetPlayerId: null,
                shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, anchor.id])],
                tradeMessage: "",
              });
            }, 1550);
          }}
        />
        <button className="football-gm__quiet-action" type="button" onClick={() => patch({
          tradeAnchorPlayerId: null,
          tradeTargetPlayerId: null,
        })}>NEVER MIND</button>
      </section>
    );
  }

  const anchorSlot = run.finalRoster.find((entry) => entry.playerId === anchor.id)?.slot ?? null;
  const partnerPlayers = [...footballGmTradePartnerPlayers(
    run.tradePartnerTeam,
    run.finalRoster,
    run.tradeChipPlayerIds,
    excludedPlayerIds,
  )]
    .sort((left, right) => (
      Number(Boolean(anchorSlot && right.eligibleSlots.includes(anchorSlot)))
      - Number(Boolean(anchorSlot && left.eligibleSlots.includes(anchorSlot)))
      || left.position.localeCompare(right.position)
      || left.name.localeCompare(right.name)
    ));
  const target = run.tradeTargetPlayerId ? footballGmPlayerById(run.tradeTargetPlayerId) : null;
  const offers = target
    ? footballGmAcceptedTargetTradeOffers({
        seed: run.seed,
        partnerTeam: run.tradePartnerTeam,
        roster: run.finalRoster,
        tradeChipPlayerIds: run.tradeChipPlayerIds,
        anchorPlayerId: anchor.id,
        targetPlayerId: target.id,
        shoppedPlayerIds: run.shoppedPlayerIds,
        excludedPlayerIds,
        maxOffers: 5,
      })
    : [];

  return (
    <section className="football-gm__trade-room surface-card" style={playerStyle(run.tradePartnerTeam)}>
      <header>
        <TeamLogo teamCode={run.tradePartnerTeam} />
        <span><small>TRADE TALKS</small><strong>{partner?.name ?? run.tradePartnerTeam}</strong></span>
      </header>

      {!target ? (
        <>
          <p>
            You chose to shop <strong>{anchor.name}</strong>. Now choose exactly one {partner?.name ?? run.tradePartnerTeam} player to target.
            {anchorSlot ? ` Players who can fill ${anchorSlot} are listed first, but you can target anyone.` : " This is a displaced trade chip, so there is no forced position match — you can target anyone."}
          </p>
          <div className="football-gm__trade-targets">
            {partnerPlayers.map((player) => (
              <button
                type="button"
                key={player.id}
                onClick={() => patch({ tradeTargetPlayerId: player.id, tradeMessage: "" })}
              >
                <span>{player.position} · AGE {player.age} · {player.gameContract}</span>
                <strong>{player.name}</strong>
                <em>{footballGmMoney(footballGmAdjustedSalaryForPlayer(player, 2, run.seed, run.negotiationConsequences))}</em>
                <span className="football-gm__trade-scouting">
                  <PlayerQualityPill player={player} year={2} seed={run.seed} />
                  <PlayerOutlookPill player={player} year={2} seed={run.seed} />
                    <PlayerDevelopmentNote player={player} seed={run.seed} />
                </span>
              </button>
            ))}
          </div>
          <div className="football-gm__inline-actions">
            <button type="button" onClick={onEndTalks}>KEEP {anchor.name.toUpperCase()} · END TALKS</button>
          </div>
          <small className="football-gm__trade-warning">
            Your target is final once selected. Walking away uses this shopping attempt but does not raise {anchor.name}'s salary.
          </small>
        </>
      ) : (
        <>
          <div className="football-gm__trade-target-lock">
            <span><small>YOUR TARGET</small><strong>{target.name}</strong></span>
            <b>{target.team} · {target.position} · {target.gameContract}</b>
          </div>
          {offers.length ? (
            <>
              <p>{partner?.name ?? run.tradePartnerTeam} gave you {offers.length} asking price{offers.length === 1 ? "" : "s"}. Every one will be accepted. None is labeled as good or bad — that decision is yours.</p>
              <div className="football-gm__asking-prices">
                {offers.map((offer, index) => (
                  <article key={`${offer.shape}:${offer.proposal.outgoingPlayerIds.join("|")}:${offer.proposal.incomingPlayerIds.join("|")}`}>
                    <header>
                      <span><small>ASKING PRICE {index + 1}</small><strong>{offer.shape.toUpperCase()}</strong></span>
                      {offer.evaluation.requiresCuts > 0 ? <b>REQUIRES {offer.evaluation.requiresCuts} CUT</b> : null}
                      {offer.proposal.outgoingPlayerIds.length > offer.proposal.incomingPlayerIds.length ? <b>OPENS FREE AGENCY</b> : null}
                    </header>
                    <div className="football-gm__trade-columns">
                      <div>
                        <small>YOU SEND</small>
                        {offer.proposal.outgoingPlayerIds.map((playerId) => (
                          <TradePackagePlayer
                            key={playerId}
                            playerId={playerId}
                            seed={run.seed}
                            consequences={run.negotiationConsequences}
                          />
                        ))}
                      </div>
                      <div>
                        <small>YOU GET</small>
                        {offer.proposal.incomingPlayerIds.map((playerId) => (
                          <TradePackagePlayer
                            key={playerId}
                            playerId={playerId}
                            seed={run.seed}
                            consequences={run.negotiationConsequences}
                          />
                        ))}
                      </div>
                    </div>
                    <button className="primary-action" type="button" onClick={() => onAccept(offer.proposal, index + 1)}>
                      ACCEPT ASKING PRICE {index + 1}
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="football-gm__no-trade-offer">
              <strong>NO DEAL AVAILABLE</strong>
              <p>{partner?.name ?? run.tradePartnerTeam} will not move {target.name} for any legal package built around {anchor.name}.</p>
            </div>
          )}
          <div className="football-gm__inline-actions">
            <button type="button" onClick={onEndTalks}>KEEP {anchor.name.toUpperCase()} · WALK AWAY</button>
          </div>
          <small className="football-gm__trade-warning">
            The target is locked. You cannot ask about another {partner?.name ?? run.tradePartnerTeam} player on this spin.
          </small>
        </>
      )}
    </section>
  );
}

export function TradeCutResolution({
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
        You accepted Asking Price {pending.offerNumber} from {pending.partnerTeam}, but the uneven package would leave you with {pending.postTradePlayerIds.length} players.
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
              disabled={playerId === pending.targetPlayerId}
              onClick={() => onToggleCut(playerId)}
            >
              <span>{playerId === pending.targetPlayerId ? "TRADE TARGET · LOCKED" : `${player.team} · ${player.position}`}</span>
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
  run,
  gmName,
  challengeStatus,
  opponentName,
  isRecipient,
  onChallenge,
  onReplay,
}: {
  run: PersistedRun;
  gmName: string;
  challengeStatus: string;
  opponentName: string | null;
  isRecipient: boolean;
  onChallenge: () => void;
  onReplay: () => void;
}) {
  return (
    <>
      <FootballGmFranchiseReport name={gmName} run={run} />
      <section className="football-gm-report__actions surface-card">
        {!isRecipient && opponentName ? (
          <button className="primary-action" type="button" onClick={onChallenge}>CHALLENGE {opponentName}</button>
        ) : null}
        <button type="button" onClick={onReplay}>NEW GM RUN</button>
        <button type="button" className="gm-final__secondary-action" onClick={() => {
          const details = document.getElementById("gm-full-roster");
          if (details instanceof HTMLDetailsElement) {
            details.open = true;
            details.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}>VIEW FULL ROSTER</button>
        <p className="football-gm__status" role="status">
          {isRecipient ? "RESULT SUBMITTED. BOTH GM SCORES REVEAL IN THE CHALLENGE RESULT." : challengeStatus}
        </p>
      </section>
    </>
  );
}

export default function FootballGmModePage({
  startImmediately = false,
  standalone = false,
}: {
  startImmediately?: boolean;
  standalone?: boolean;
} = {}) {
  const navigate = useNavigate();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("gm-football");
  const storedSeed = challengeSeed(profileMatch.challenge?.setup);
  const [seed, setSeed] = useState(() => storedSeed ?? freshSeed());
  const [run, setRun] = useState<PersistedRun>(() => {
    const persisted = typeof window === "undefined"
      ? null
      : loadPersistedRun(identity.profile?.id, seed);
    if (persisted) {
      return startImmediately && persisted.phase === "intro"
        ? { ...persisted, phase: "draft" }
        : persisted;
    }
    const fresh = initialRun(seed);
    return startImmediately ? { ...fresh, phase: "draft" } : fresh;
  });
  const [challengeStatus, setChallengeStatus] = useState("");
  const [runRepository] = useState(() => createFootballGmRunRepository());
  const [soloHydrated, setSoloHydrated] = useState(() => !standalone);
  const [draftWheelSpinning, setDraftWheelSpinning] = useState(false);
  const [draftWheelRotation, setDraftWheelRotation] = useState(0);
  const opponentName: string | null = null;
  const draftEligibleTeamCodes = run.phase === "draft"
    ? footballGmEligibleTeams({
        roster: run.roster,
        previousTeam: run.previousTeam,
        year: 1,
      })
    : [];
  const draftWheelTeams = draftEligibleTeamCodes
    .map((teamCode) => wheelFootballTeam(teamCode))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pendingDraftWheelTeam = run.pendingTeam ? wheelFootballTeam(run.pendingTeam) ?? null : null;

  useEffect(() => {
    if (!storedSeed || storedSeed === seed) return;
    setSeed(storedSeed);
    const persisted = loadPersistedRun(identity.profile?.id, storedSeed);
    if (persisted) {
      setRun(startImmediately && persisted.phase === "intro"
        ? { ...persisted, phase: "draft" }
        : persisted);
      return;
    }
    const fresh = initialRun(storedSeed);
    setRun(startImmediately ? { ...fresh, phase: "draft" } : fresh);
  }, [identity.profile?.id, seed, startImmediately, storedSeed]);

  useEffect(() => {
    if (!standalone || soloHydrated || !identity.ready) return;
    if (!identity.profile?.id) {
      setSoloHydrated(true);
      return;
    }
    let cancelled = false;
    const profileId = identity.profile.id;

    async function restoreSoloRun() {
      const local = loadActivePersistedRun(profileId);
      if (local) {
        if (cancelled) return;
        setSeed(local.seed);
        setRun(startImmediately && local.phase === "intro" ? { ...local, phase: "draft" } : local);
        setSoloHydrated(true);
        return;
      }

      try {
        const snapshot = await runRepository?.loadLatestActive();
        const remote = runFromAuditSnapshot(snapshot ?? null);
        if (cancelled) return;
        if (remote && remote.phase !== "final") {
          window.localStorage.setItem(storageKey(profileId, remote.seed), JSON.stringify(remote));
          window.localStorage.setItem(activeStorageKey(profileId), remote.seed);
          setSeed(remote.seed);
          setRun(startImmediately && remote.phase === "intro" ? { ...remote, phase: "draft" } : remote);
        }
      } catch (error) {
        console.error("GM run restore failed", error);
      } finally {
        if (!cancelled) setSoloHydrated(true);
      }
    }

    void restoreSoloRun();
    return () => {
      cancelled = true;
    };
  }, [
    identity.profile?.id,
    identity.ready,
    runRepository,
    soloHydrated,
    standalone,
    startImmediately,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined"
      || !identity.profile?.id
      || (standalone && !soloHydrated)
    ) return;
    window.localStorage.setItem(storageKey(identity.profile.id, run.seed), JSON.stringify(run));
    if (standalone) {
      if (run.phase === "final") {
        window.localStorage.removeItem(activeStorageKey(identity.profile.id));
      } else {
        window.localStorage.setItem(activeStorageKey(identity.profile.id), run.seed);
      }
    }
  }, [identity.profile?.id, run, soloHydrated, standalone]);

  useEffect(() => {
    if (
      !identity.profile?.id
      || !identity.profile.displayName
      || !runRepository
      || (standalone && !soloHydrated)
    ) return;
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
    identity.profile?.displayName,
    identity.profile?.id,
    profileMatch.challenge?.code,
    profileMatch.isRecipient,
    run,
    runRepository,
    soloHydrated,
    standalone,
  ]);

  const yearOneRoster = run.roster;
  const finalRoster = run.finalRoster.length ? run.finalRoster : run.roster;
  const finalResult = useMemo(
    () => run.phase === "final"
      ? footballGmFinalResultV2({ seed: run.seed, yearOneRoster, finalRoster, resolvedSeasons: run.resolvedSeasons })
      : null,
    [finalRoster, run.phase, run.seed, run.resolvedSeasons, yearOneRoster],
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
  if (standalone && !soloHydrated) {
    return (
      <div className="page football-gm-page">
        <section className="surface-card">
          <p className="eyebrow">THE GM</p>
          <h1>RESTORING YOUR FRONT OFFICE…</h1>
        </section>
      </div>
    );
  }

  function patch(next: Partial<PersistedRun>) {
    setRun((current) => ({ ...current, ...next }));
  }

  function spinDraft() {
    if (draftWheelSpinning || run.pendingTeam) return;
    const teamCode = footballGmSpinTeam(run.seed, run.spinIndex, draftEligibleTeamCodes);
    if (!teamCode) return;
    const index = draftWheelTeams.findIndex((team) => team.code === teamCode);
    if (index < 0 || !draftWheelTeams.length) {
      patch({ pendingTeam: teamCode });
      return;
    }

    setDraftWheelSpinning(true);
    const step = 360 / draftWheelTeams.length;
    setDraftWheelRotation((current) => {
      const currentModulo = ((current % 360) + 360) % 360;
      const targetModulo = ((-index * step) % 360 + 360) % 360;
      const correction = (targetModulo - currentModulo + 360) % 360;
      return current + 1080 + correction;
    });
    window.setTimeout(() => {
      patch({ pendingTeam: teamCode });
      setDraftWheelSpinning(false);
    }, 1550);
  }

  function makeDraftPick(playerId: string) {
    const player = footballGmPlayerById(playerId);
    if (!player) return;
    let nextRoster: FootballGmRosterEntry[];
    try {
      nextRoster = footballGmAutoAddPick(run.roster, playerId);
    } catch {
      return;
    }
    patch({
      roster: nextRoster,
      pendingTeam: null,
      previousTeam: player.team,
      spinIndex: run.spinIndex + 1,
      phase: nextRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length ? "year1" : "draft",
    });
  }

  function spinFreeAgency() {
    if (!footballGmCanUseFreeAgency(run.finalRoster, run.tradeChipPlayerIds)) {
      patch({ tradeMessage: "Free agency opens whenever normal roster work leaves fewer than seven held assets. The one-time limit applies only to deliberately releasing a settled starter." });
      return;
    }
    const teams = footballGmEligibleFreeAgencyTeams({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      previousTeam: run.previousFreeAgentTeam,
      excludedPlayerIds: run.releasedFreeAgentPlayerId ? [run.releasedFreeAgentPlayerId] : [],
    });
    const team = footballGmSpinTeam(`${run.seed}:free-agency`, run.freeAgentSpinIndex, teams);
    if (!team) {
      patch({ tradeMessage: "No eligible 1YR free agent fits both future caps from the teams available to this spin." });
      return;
    }
    patch({ pendingFreeAgentTeam: team, tradeMessage: "" });
  }

  function makeFreeAgentPick(playerId: string, slot: FootballGmRosterSlot, displacedPlayerId?: string) {
    if (!run.pendingFreeAgentTeam) return;
    const player = footballGmPlayerById(playerId);
    if (!player || player.team !== run.pendingFreeAgentTeam) return;
    const next = footballGmSignFreeAgent({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      playerId,
      slot,
      displacedPlayerId,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      excludedPlayerIds: run.releasedFreeAgentPlayerId ? [run.releasedFreeAgentPlayerId] : [],
    });
    if (!next) {
      patch({ tradeMessage: "That free-agent signing is no longer legal under the roster and cap rules." });
      return;
    }
    const displaced = displacedPlayerId ? footballGmPlayerById(displacedPlayerId) : null;
    patch({
      finalRoster: [...next.roster],
      tradeChipPlayerIds: [...next.tradeChipPlayerIds],
      previousFreeAgentTeam: run.pendingFreeAgentTeam,
      pendingFreeAgentTeam: null,
      freeAgentSpinIndex: run.freeAgentSpinIndex + 1,
      tradeMessage: displaced
        ? `${player.name} signed at ${footballGmSlotLabel(slot)}. ${displaced.name} is now a normal trade chip; shop him through the regular Trade Room or release him.`
        : `${player.name} signed through free agency to fill ${footballGmSlotLabel(slot)}.`,
    });
  }

  function releaseToFreeAgency(playerId: string) {
    if (run.voluntaryFreeAgencyUsed || run.tradeChipPlayerIds.length || run.finalRoster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return;
    const player = footballGmPlayerById(playerId);
    if (!player || !run.finalRoster.some((entry) => entry.playerId === playerId)) return;
    const stripped = run.finalRoster.filter((entry) => entry.playerId !== playerId);
    const eligibleTeams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      excludedPlayerIds: [playerId],
    });
    if (!eligibleTeams.length) {
      patch({ tradeMessage: `Releasing ${player.name} does not leave a legal free-agency path under the cap.` });
      return;
    }
    const budget = freeAgencyReleaseBudget(run.finalRoster, playerId, run.seed, run.negotiationConsequences);
    patch({
      finalRoster: stripped,
      voluntaryFreeAgencyUsed: true,
      releasedFreeAgentPlayerId: playerId,
      pendingFreeAgentTeam: null,
      previousFreeAgentTeam: null,
      tradeMessage: `${player.name} released. Free-agency replacement budget: ${footballGmMoney(budget)}.`,
    });
  }

  function beginTrade(playerId: string) {
    const isHeld = run.finalRoster.some((entry) => entry.playerId === playerId)
      || run.tradeChipPlayerIds.includes(playerId);
    if (!isHeld || run.shoppedPlayerIds.includes(playerId) || run.pendingTradeResolution) return;
    patch({
      tradeAnchorPlayerId: playerId,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      tradeMessage: "",
    });
  }

  // Walking away from a trade never changes salary; the attempt is still spent.
  function applyShoppingConsequence(messagePrefix: string, additionalShoppedIds: readonly string[] = []) {
    const anchor = run.tradeAnchorPlayerId ? footballGmPlayerById(run.tradeAnchorPlayerId) : null;
    if (!anchor) return;
    patch({
      shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, anchor.id, ...additionalShoppedIds])],
      previousTradePartner: run.tradePartnerTeam,
      tradeSpinIndex: run.tradeSpinIndex + 1,
      tradeAnchorPlayerId: null,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      pendingTradeResolution: null,
      tradeMessage: `${messagePrefix} ${anchor.name}'s salary remains unchanged.`,
    });
  }

  function acceptTradeAskingPrice(proposal: FootballGmTradeProposal, offerNumber: number) {
    if (!run.tradeAnchorPlayerId || !run.tradePartnerTeam || !run.tradeTargetPlayerId) return;
    const partnerTeam = run.tradePartnerTeam;
    const offers = footballGmAcceptedTargetTradeOffers({
      seed: run.seed,
      partnerTeam,
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      anchorPlayerId: run.tradeAnchorPlayerId,
      targetPlayerId: run.tradeTargetPlayerId,
      shoppedPlayerIds: run.shoppedPlayerIds,
      maxOffers: 5,
    });
    const offer = offers.find((candidate) => sameTradeProposal(candidate.proposal, proposal));
    if (!offer) {
      patch({ tradeMessage: "That asking price is no longer available." });
      return;
    }

    const submittedOutgoingIds = [...offer.proposal.outgoingPlayerIds];
    const common = {
      previousTradePartner: partnerTeam,
      tradeSpinIndex: run.tradeSpinIndex + 1,
      tradeAnchorPlayerId: null,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      pendingFreeAgentTeam: null,
      shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, ...submittedOutgoingIds])],
    };

    if (offer.evaluation.requiresCuts > 0) {
      patch({
        ...common,
        pendingTradeResolution: {
          partnerTeam,
          offerNumber,
          anchorPlayerId: run.tradeAnchorPlayerId,
          targetPlayerId: run.tradeTargetPlayerId,
          proposal: {
            outgoingPlayerIds: [...offer.proposal.outgoingPlayerIds],
            incomingPlayerIds: [...offer.proposal.incomingPlayerIds],
          },
          postTradePlayerIds: [...offer.evaluation.postTradePlayerIds],
          requiredCuts: offer.evaluation.requiresCuts,
          cutPlayerIds: [],
        },
        tradeMessage: `You accepted Asking Price ${offerNumber} from ${partnerTeam}. Choose ${offer.evaluation.requiresCuts} cut${offer.evaluation.requiresCuts === 1 ? "" : "s"} to finalize the uneven trade.`,
      });
      return;
    }

    if (offer.evaluation.nextRoster && offer.evaluation.nextTradeChipPlayerIds) {
      const vacancies = FOOTBALL_GM_ROSTER_SLOTS.length - offer.evaluation.nextRoster.length;
      const chipCount = offer.evaluation.nextTradeChipPlayerIds.length;
      patch({
        ...common,
        finalRoster: [...offer.evaluation.nextRoster],
        tradeChipPlayerIds: [...offer.evaluation.nextTradeChipPlayerIds],
        pendingTradeResolution: null,
        tradeMessage: chipCount > 0
          ? `You accepted Asking Price ${offerNumber} from ${partnerTeam}. Trade completed; ${chipCount} displaced asset${chipCount === 1 ? "" : "s"} remain in the normal trade flow.`
          : vacancies > 0
            ? `You accepted Asking Price ${offerNumber} from ${partnerTeam}. Trade completed. Fill the open spot through free agency.`
            : `You accepted Asking Price ${offerNumber} from ${partnerTeam}. Trade completed and locked.`,
      });
    }
  }

  function togglePendingCut(playerId: string) {
    const pending = run.pendingTradeResolution;
    if (!pending || playerId === pending.targetPlayerId || !pending.postTradePlayerIds.includes(playerId)) return;
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
    if (
      !pending
      || pending.cutPlayerIds.length !== pending.requiredCuts
      || pending.cutPlayerIds.includes(pending.targetPlayerId)
    ) return;
    const nextAssets = footballGmResolveTradeAssets({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      proposal: pending.proposal,
      cutPlayerIds: pending.cutPlayerIds,
    });
    if (!nextAssets) {
      patch({ tradeMessage: "Those cuts do not leave a legal core. Choose a different cut combination." });
      return;
    }
    const cutNames = pending.cutPlayerIds
      .map((playerId) => footballGmPlayerById(playerId)?.name)
      .filter(Boolean)
      .join(", ");
    patch({
      finalRoster: [...nextAssets.roster],
      tradeChipPlayerIds: [...nextAssets.tradeChipPlayerIds],
      pendingTradeResolution: null,
      tradeMessage: `Asking Price ${pending.offerNumber} from ${pending.partnerTeam} completed${cutNames ? `; cut ${cutNames}` : ""}.`,
    });
  }

  function releaseTradeChip(playerId: string) {
    if (!run.tradeChipPlayerIds.includes(playerId)) return;
    const player = footballGmPlayerById(playerId);
    patch({
      tradeChipPlayerIds: run.tradeChipPlayerIds.filter((id) => id !== playerId),
      releasedFreeAgentPlayerId: playerId,
      pendingFreeAgentTeam: null,
      previousFreeAgentTeam: null,
      tradeMessage: player
        ? `${player.name} released from the displaced-asset pool. The open roster spot can return to free agency.`
        : "Displaced asset released. The open roster spot can return to free agency.",
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
    run.tradeChipPlayerIds,
  );

  return (
    <div className="page football-gm-page">
      {run.phase === "final" ? (
        <header className="football-gm__header is-final">
          <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
          <span><strong>THE GM</strong><small>3 YEARS</small></span>
          <button type="button" className="football-gm__share-result" disabled={!finalResult} onClick={() => {
            if (!finalResult) return;
            const text = "My Octagon HQ GM score: " + finalResult.score.toFixed(1)
              + ". Three seasons: " + finalResult.seasons.map((season) => "Year " + season.year
                + " " + (footballGmSeasonRecordLabel(season) ?? "—")
                + " (" + footballGmPlayoffFinishLabel(season.finish) + ")").join(" · ");
            if (navigator.share) {
              void navigator.share({ title: "The GM · Octagon HQ", text }).catch(() => {});
            } else if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(text).then(
                () => setChallengeStatus("RESULT COPIED TO CLIPBOARD"),
                () => setChallengeStatus("SHARING UNAVAILABLE ON THIS DEVICE"),
              );
            } else {
              setChallengeStatus("SHARING UNAVAILABLE ON THIS DEVICE");
            }
          }}>SHARE ↗</button>
        </header>
      ) : (
        <header className="football-gm__header">
          <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
          <span><small>NFL FRONT OFFICE</small><strong>THE GM</strong></span>
          <b>3 YEARS</b>
        </header>
      )}

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
          <h1>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h1>
          <p className="football-gm__intro-lede">Build a 7-man NFL core under a {footballGmMoney(FOOTBALL_GM_CAP)} cap.</p>

          <div className="football-gm__intro-stages">
            <article>
              <b>1</b>
              <span>
                <strong>DRAFT</strong>
                <small>Spin a team. Pick one player. Fill all 7 spots.</small>
              </span>
            </article>
            <article>
              <b>2</b>
              <span>
                <strong>OFFSEASON</strong>
                <small>Players develop differently in every run. 1YR deals reprice; 3YR salaries stay locked.</small>
              </span>
            </article>
            <article>
              <b>3</b>
              <span>
                <strong>3-YEAR RESULT</strong>
                <small>Roster quality + continuity + playoff results determine your GM score.</small>
              </span>
            </article>
          </div>

          <div className="football-gm__intro-facts" aria-label="Key game rules">
            <span>{footballGmMoney(FOOTBALL_GM_CAP)} CAP</span>
            <span>1YR / 3YR CONTRACTS</span>
            <span>HIDDEN GRADES</span>
          </div>

          <details className="football-gm__position-guide">
            <summary>HOW POSITION VALUE WORKS</summary>
            <p>QB and WR carry a little more weight. EDGE and CB have a modest positional premium; linebackers, safeties and FLEX options are valued by their real role. Every match uses the same rules, and player HQ grades stay unchanged.</p>
          </details>

          <button className="primary-action" type="button" onClick={() => patch({ phase: "draft" })}>START THE DRAFT</button>
        </section>
      ) : null}

      {run.phase === "draft" ? (
        <>
          <CapMeter roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          <RosterGrid roster={run.roster} year={1} seed={run.seed} consequences={run.negotiationConsequences} />
          <div className="football-gm__draft-context" aria-label="Draft round and open roster spots">
            <span>ROUND {run.roster.length + 1} OF 7</span>
            <strong>{footballGmOpenSlots(run.roster).join(" · ")}</strong>
          </div>
          <GmFootballWheel
            teams={draftWheelTeams}
            rotation={draftWheelRotation}
            spinning={draftWheelSpinning}
            pendingTeam={pendingDraftWheelTeam}
            canSpin={!run.pendingTeam && draftWheelTeams.length > 0}
            onSpin={spinDraft}
          />
          {run.pendingTeam ? (
            <CandidateBoard teamCode={run.pendingTeam} roster={run.roster} year={1} onPick={makeDraftPick} />
          ) : null}
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
          <FootballGmDevelopmentReport roster={run.roster} seed={run.seed} />
          <div className="football-gm__dual-cap">
            <CapMeter roster={run.finalRoster} tradeChipPlayerIds={run.tradeChipPlayerIds} year={2} seed={run.seed} consequences={run.negotiationConsequences} />
            <CapMeter roster={run.finalRoster} tradeChipPlayerIds={run.tradeChipPlayerIds} year={3} seed={run.seed} consequences={run.negotiationConsequences} />
          </div>
          <ContinuityMeter yearOneRoster={run.roster} roster={run.finalRoster} />
          <RosterGrid
            roster={run.finalRoster}
            year={2}
            seed={run.seed}
            consequences={run.negotiationConsequences}
            showFutureSalary
            compact
            onShop={!run.tradeAnchorPlayerId && !run.pendingTradeResolution && !run.pendingFreeAgentTeam ? beginTrade : undefined}
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
              onAccept={acceptTradeAskingPrice}
              onEndTalks={() => applyShoppingConsequence("You ended the talks without a deal.")}
            />
          ) : (
            <>
              {run.tradeChipPlayerIds.length ? (
                <TradeChipPanel
                  playerIds={run.tradeChipPlayerIds}
                  seed={run.seed}
                  consequences={run.negotiationConsequences}
                  shoppedPlayerIds={run.shoppedPlayerIds}
                  onShop={beginTrade}
                  onRelease={releaseTradeChip}
                />
              ) : null}

              {run.pendingFreeAgentTeam ? (
                <FreeAgencyBoard
                  teamCode={run.pendingFreeAgentTeam}
                  roster={run.finalRoster}
                  tradeChipPlayerIds={run.tradeChipPlayerIds}
                  seed={run.seed}
                  consequences={run.negotiationConsequences}
                  excludedPlayerIds={run.releasedFreeAgentPlayerId ? [run.releasedFreeAgentPlayerId] : []}
                  onPick={makeFreeAgentPick}
                />
              ) : footballGmCanUseFreeAgency(run.finalRoster, run.tradeChipPlayerIds) ? (
                <section className="football-gm__wheel surface-card">
                  <p className="eyebrow">FREE AGENCY · {footballGmOpenSlots(run.finalRoster).join(" · ")}</p>
                  <h2>SPIN THE 1YR MARKET</h2>
                  <p>
                    Your offseason holdings are below seven. Spin an NFL team and see every game-eligible 1YR free agent from that team who fits both future caps.
                    The signing is not position-locked; if you take someone at an occupied spot, that incumbent becomes a normal trade chip.
                  </p>
                  <button className="primary-action" type="button" onClick={spinFreeAgency}>SPIN FREE AGENCY WHEEL</button>
                </section>
              ) : run.tradeChipPlayerIds.length ? (
                <section className="football-gm__offseason-status surface-card is-crisis">
                  <p className="eyebrow">ROSTER WORK REQUIRED</p>
                  <h2>YOU HAVE A DISPLACED TRADE ASSET</h2>
                  <p>
                    Your seven offseason assets include a player outside the active core. Shop or release the displaced player.
                    Any trade still uses the normal package shapes; there is no forced one-for-one cleanup.
                  </p>
                </section>
              ) : (
                <>
                  <section className={`football-gm__offseason-status surface-card${offseasonReady ? " is-ready" : " is-crisis"}`}>
                    <p className="eyebrow">{offseasonReady ? "WINDOW SET" : "CAP CRISIS"}</p>
                    <h2>{offseasonReady ? "YOU CAN MOVE FORWARD" : "YOU HAVE MOVES TO MAKE"}</h2>
                    <p>
                      {offseasonReady
                        ? `Your seven-man core fits Years 2 and 3 under the ${footballGmMoney(FOOTBALL_GM_CAP)} cap. You can advance now, keep shopping trades, or use your one voluntary release if it is still available.`
                        : `Years 2 and 3 must both fit under the ${footballGmMoney(FOOTBALL_GM_CAP)} cap. Keep shopping players; any genuine vacancy can use free agency, and you may manufacture one vacancy with a voluntary release.`}
                    </p>
                    <button
                      className="primary-action"
                      type="button"
                      disabled={!offseasonReady}
                      onClick={() => patch({ phase: "years23" })}
                    >SIMULATE YEARS 2 & 3</button>
                  </section>
                  {!run.voluntaryFreeAgencyUsed ? (
                    <FreeAgencyReleasePanel
                      roster={run.finalRoster}
                      seed={run.seed}
                      consequences={run.negotiationConsequences}
                      onRelease={releaseToFreeAgency}
                    />
                  ) : null}
                </>
              )}
            </>
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
          <button className="primary-action" type="button" onClick={() => {
            const resolvedSeasons: FootballGmSeasonResultV2[] = [1, 2, 3].map((year) =>
              footballGmSeasonResultV2({
                seed: run.seed,
                yearOneRoster: run.roster,
                roster: year === 1 ? run.roster : run.finalRoster,
                year: year as 1 | 2 | 3,
              }),
            );
            patch({ phase: "final", resolvedSeasons });
          }}>SEE 3-YEAR GM SCORE</button>
        </section>
      ) : null}

      {run.phase === "final" && finalResult ? (
        <FinalScreen
          run={run}
          gmName={identity.profile?.displayName ?? "YOU"}
          challengeStatus={challengeStatus}
          opponentName={standalone ? null : opponentName}
          isRecipient={profileMatch.isRecipient}
          onChallenge={() => void challengeOpponent()}
          onReplay={replay}
        />
      ) : null}
    </div>
  );
}
