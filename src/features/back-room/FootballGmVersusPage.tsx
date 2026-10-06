import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballGmMatchRepository,
  type FootballGmMatchParticipant,
  type FootballGmMatchState,
} from "../play/footballGmMatchRepository";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmEligibleTeams,
  footballGmMoney,
  footballGmOpenSlots,
  footballGmPlayerById,
  footballGmRosterCap,
  footballGmRosterPlayers,
  footballGmSpinTeam,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  footballGmAcceptedTargetTradeOffers,
  footballGmAdjustedHoldingsCap,
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmCanUseFreeAgency,
  footballGmContinuity,
  footballGmEligibleFreeAgencyTeams,
  footballGmFinalResultV2,
  footballGmIsOffseasonCompliantV2,
  footballGmResolveTradeAssets,
  footballGmSeasonResultV2,
  footballGmSignFreeAgent,
  type FootballGmNegotiationConsequences,
  type FootballGmTradeProposal,
} from "./footballGmStrategy";
import {
  CandidateBoard,
  FreeAgencyBoard,
  GmFootballWheel,
  PlayerHeadshot,
  PlayerOutlookPill,
  PlayerQualityPill,
  RosterGrid,
  TradeChipPanel,
  TradeCutResolution,
  TradeRoom,
  initialRun,
  type PersistedRun,
} from "./FootballGmModePage";
import { footballGmCpuDraftChoice, footballGmCpuOffseason } from "./footballGmCpu";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";
import { isFootballGmPlaytestProfile } from "./footballGmAccess";

type CpuPhase = "draft" | "year1" | "offseason" | "complete";
type CpuTurn = "YOU" | "CPU";

function freshSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizedCode(value: string | null) {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{4,12}$/.test(code) ? code : "";
}

function hydratedRun(
  participant: FootballGmMatchParticipant,
  matchSeed: string,
): PersistedRun {
  const source = participant.run_state as Partial<PersistedRun>;
  const seed = typeof source.seed === "string" && source.seed
    ? source.seed
    : `${matchSeed}:${participant.id}`;
  const base = initialRun(seed);
  return {
    ...base,
    ...source,
    seed,
    phase: source.phase ?? "draft",
    roster: Array.isArray(source.roster) ? source.roster : [],
    finalRoster: Array.isArray(source.finalRoster) ? source.finalRoster : [],
    tradeChipPlayerIds: Array.isArray(source.tradeChipPlayerIds) ? source.tradeChipPlayerIds : [],
    shoppedPlayerIds: Array.isArray(source.shoppedPlayerIds) ? source.shoppedPlayerIds : [],
    negotiationConsequences: source.negotiationConsequences && typeof source.negotiationConsequences === "object"
      ? source.negotiationConsequences
      : {},
  };
}

function offseasonRun(run: PersistedRun): PersistedRun {
  return {
    ...run,
    phase: "offseason",
    finalRoster: run.finalRoster.length ? run.finalRoster : [...run.roster],
  };
}

function heldPlayerIds(run: PersistedRun) {
  const active = run.finalRoster.length ? run.finalRoster : run.roster;
  return [...new Set([
    ...active.map((entry) => entry.playerId),
    ...run.tradeChipPlayerIds,
  ])];
}

function finishRank(finish: string) {
  const order = [
    "Missed Playoffs",
    "Wild Card",
    "Divisional",
    "Conference Championship",
    "Super Bowl Loss",
    "Champion",
  ];
  const index = order.indexOf(finish);
  return index < 0 ? 99 : index;
}

function GmHeader() {
  const navigate = useNavigate();
  return (
    <header className="football-gm__header">
      <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
      <span><small>OWNER PLAYTEST</small><strong>THE GM</strong></span>
      <b>3 YEARS</b>
    </header>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-gm__intro surface-card">
      <p className="eyebrow">NFL FRONT OFFICE CHALLENGE</p>
      <h1>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h1>
      <p className="football-gm__intro-lede">Build a 7-man NFL core under a {footballGmMoney(FOOTBALL_GM_CAP)} cap.</p>
      <div className="football-gm__intro-stages">
        <article>
          <b>1</b>
          <span><strong>DRAFT</strong><small>Spin a team. Pick one player. Fill all 7 spots.</small></span>
        </article>
        <article>
          <b>2</b>
          <span><strong>OFFSEASON</strong><small>1YR deals reprice. Trade and use free agency to get under the cap.</small></span>
        </article>
        <article>
          <b>3</b>
          <span><strong>3-YEAR RESULT</strong><small>Roster quality + continuity + playoff results determine your GM score.</small></span>
        </article>
      </div>
      <div className="football-gm__intro-facts" aria-label="Key game rules">
        <span>{footballGmMoney(FOOTBALL_GM_CAP)} CAP</span>
        <span>1YR / 3YR CONTRACTS</span>
        <span>HIDDEN GRADES</span>
      </div>
      <button className="primary-action" type="button" onClick={onStart}>START THE DRAFT</button>
    </section>
  );
}

function ModeChooser({
  onCpu,
  onChallenge,
}: {
  onCpu: () => void;
  onChallenge: () => void;
}) {
  return (
    <section className="football-gm__mode surface-card">
      <p className="eyebrow">CHOOSE YOUR MATCHUP</p>
      <h2>WHO ARE YOU BUILDING AGAINST?</h2>
      <div className="football-gm__mode-grid">
        <button type="button" className="is-primary" onClick={onCpu}>
          <small>PLAY NOW</small>
          <strong>VS CPU</strong>
          <span>Same shared draft and offseason market. The CPU takes the other front office.</span>
        </button>
        <button type="button" onClick={onChallenge}>
          <small>HEAD-TO-HEAD</small>
          <strong>VS GM</strong>
          <span>Alternate draft picks, then hand the full offseason from one GM to the other.</span>
        </button>
      </div>
      <small className="football-gm__mode-note">One player can belong to only one team in a matchup.</small>
    </section>
  );
}

function capForBoard(run: PersistedRun, year: 1 | 2) {
  if (year === 1) return footballGmRosterCap(run.roster, 1);
  const active = run.finalRoster.length ? run.finalRoster : run.roster;
  return footballGmAdjustedHoldingsCap(
    active,
    run.tradeChipPlayerIds,
    2,
    run.seed,
    run.negotiationConsequences,
  );
}

function BoardCell({
  entry,
  align,
}: {
  entry: FootballGmRosterEntry | null;
  align: "left" | "right";
}) {
  const player = entry ? footballGmPlayerById(entry.playerId) : null;
  if (!player) {
    return (
      <div className={`football-gm-versus__cell is-empty is-${align}`}>
        <span>OPEN</span>
      </div>
    );
  }
  return (
    <div className={`football-gm-versus__cell is-filled is-${align}`}>
      <PlayerHeadshot player={player} className="football-gm-versus__headshot" />
      <div>
        <strong>{player.name}</strong>
        <small>{player.team} · {player.position}</small>
        <span className="football-gm-versus__pills">
          <PlayerQualityPill player={player} />
          <PlayerOutlookPill outlook={player.outlook} />
        </span>
      </div>
    </div>
  );
}

function VersusBoard({
  leftName,
  rightName,
  leftRun,
  rightRun,
  activeSide,
  year = 1,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
  activeSide: "left" | "right" | null;
  year?: 1 | 2;
}) {
  const leftRoster = year === 1 || !leftRun.finalRoster.length ? leftRun.roster : leftRun.finalRoster;
  const rightRoster = year === 1 || !rightRun.finalRoster.length ? rightRun.roster : rightRun.finalRoster;
  const leftBySlot = new Map(leftRoster.map((entry) => [entry.slot, entry]));
  const rightBySlot = new Map(rightRoster.map((entry) => [entry.slot, entry]));
  const leftCap = capForBoard(leftRun, year);
  const rightCap = capForBoard(rightRun, year);
  return (
    <section className="football-gm-versus surface-card">
      <header>
        <div className={activeSide === "left" ? "is-active" : ""}>
          <small>{activeSide === "left" ? "YOUR TURN" : "YOU"}</small>
          <strong>{leftName}</strong>
          <b>{footballGmMoney(leftCap)} / {footballGmMoney(FOOTBALL_GM_CAP)}</b>
        </div>
        <span>7-MAN CORE</span>
        <div className={activeSide === "right" ? "is-active" : ""}>
          <small>{activeSide === "right" ? "ON THE CLOCK" : "OPPONENT"}</small>
          <strong>{rightName}</strong>
          <b>{footballGmMoney(rightCap)} / {footballGmMoney(FOOTBALL_GM_CAP)}</b>
        </div>
      </header>
      <div className="football-gm-versus__rows">
        {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => (
          <div className="football-gm-versus__row" key={slot}>
            <BoardCell entry={leftBySlot.get(slot) ?? null} align="left" />
            <b>{slot}</b>
            <BoardCell entry={rightBySlot.get(slot) ?? null} align="right" />
          </div>
        ))}
      </div>
    </section>
  );
}

function CompactCapStrip({
  run,
}: {
  run: PersistedRun;
}) {
  const roster = run.finalRoster.length ? run.finalRoster : run.roster;
  const y2 = footballGmAdjustedHoldingsCap(roster, run.tradeChipPlayerIds, 2, run.seed, run.negotiationConsequences);
  const y3 = footballGmAdjustedHoldingsCap(roster, run.tradeChipPlayerIds, 3, run.seed, run.negotiationConsequences);
  return (
    <section className="football-gm-front-office__caps surface-card">
      <div className={y2 > FOOTBALL_GM_CAP ? "is-over" : ""}>
        <small>YEAR 2</small>
        <strong>{footballGmMoney(y2)}</strong>
        <span>{y2 <= FOOTBALL_GM_CAP ? `${footballGmMoney(FOOTBALL_GM_CAP - y2)} LEFT` : `${footballGmMoney(y2 - FOOTBALL_GM_CAP)} OVER`}</span>
      </div>
      <i />
      <div className={y3 > FOOTBALL_GM_CAP ? "is-over" : ""}>
        <small>YEAR 3</small>
        <strong>{footballGmMoney(y3)}</strong>
        <span>{y3 <= FOOTBALL_GM_CAP ? `${footballGmMoney(FOOTBALL_GM_CAP - y3)} LEFT` : `${footballGmMoney(y3 - FOOTBALL_GM_CAP)} OVER`}</span>
      </div>
    </section>
  );
}

function releaseBudget(
  roster: readonly FootballGmRosterEntry[],
  playerId: string,
  seed: string,
  consequences: FootballGmNegotiationConsequences,
) {
  const stripped = roster.filter((entry) => entry.playerId !== playerId);
  if (stripped.length !== FOOTBALL_GM_ROSTER_SLOTS.length - 1) return 0;
  const y2 = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 2, seed, consequences);
  const y3 = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 3, seed, consequences);
  return Math.max(0, Math.min(y2, y3));
}

function ReleaseSheet({
  run,
  excludedPlayerIds,
  onClose,
  onRelease,
}: {
  run: PersistedRun;
  excludedPlayerIds: readonly string[];
  onClose: () => void;
  onRelease: (playerId: string) => void;
}) {
  const rows = footballGmRosterPlayers(run.finalRoster).map(({ entry, player }) => {
    const stripped = run.finalRoster.filter((candidate) => candidate.playerId !== player.id);
    const eligibleTeams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      tradeChipPlayerIds: [],
      excludedPlayerIds: [...excludedPlayerIds, player.id],
    });
    return {
      entry,
      player,
      teams: eligibleTeams.length,
      budget: releaseBudget(run.finalRoster, player.id, run.seed, run.negotiationConsequences),
    };
  });
  return (
    <div className="football-gm__scout-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="football-gm__scout-sheet football-gm-release-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <header>
          <span><small>ONE VOLUNTARY RELEASE</small><strong>OPEN FREE AGENCY</strong></span>
          <button type="button" aria-label="Close release menu" onClick={onClose}>×</button>
        </header>
        <div className="football-gm-release-sheet__list">
          {rows.map(({ entry, player, teams, budget }) => (
            <button
              key={player.id}
              type="button"
              disabled={!teams}
              onClick={() => onRelease(player.id)}
            >
              <PlayerHeadshot player={player} />
              <span>
                <small>{entry.slot} · {teams ? `${teams} WHEEL TEAMS` : "NO LEGAL REPLACEMENT"}</small>
                <strong>{player.name}</strong>
              </span>
              <b>{footballGmMoney(budget)}</b>
            </button>
          ))}
        </div>
        <small className="football-gm-release-sheet__warning">Final once confirmed. The released player cannot be re-signed this offseason.</small>
      </section>
    </div>
  );
}

function sameTradeProposal(left: FootballGmTradeProposal, right: FootballGmTradeProposal) {
  const normalize = (values: readonly string[]) => [...values].sort().join("|");
  return normalize(left.outgoingPlayerIds) === normalize(right.outgoingPlayerIds)
    && normalize(left.incomingPlayerIds) === normalize(right.incomingPlayerIds);
}

function FrontOffice({
  run,
  excludedPlayerIds,
  onChange,
  onFinish,
  busy = false,
}: {
  run: PersistedRun;
  excludedPlayerIds: readonly string[];
  onChange: (next: PersistedRun) => void;
  onFinish: (next: PersistedRun) => void | Promise<void>;
  busy?: boolean;
}) {
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [faWheelSpinning, setFaWheelSpinning] = useState(false);
  const [faWheelRotation, setFaWheelRotation] = useState(0);

  function patch(next: Partial<PersistedRun>) {
    onChange({ ...run, ...next });
  }

  const excluded = [...new Set([
    ...excludedPlayerIds,
    ...(run.releasedFreeAgentPlayerId ? [run.releasedFreeAgentPlayerId] : []),
  ])];

  const offseasonReady = footballGmIsOffseasonCompliantV2(
    run.finalRoster,
    run.seed,
    run.negotiationConsequences,
    run.tradeChipPlayerIds,
  );

  const canUseFa = footballGmCanUseFreeAgency(run.finalRoster, run.tradeChipPlayerIds);
  const faTeamCodes = canUseFa
    ? footballGmEligibleFreeAgencyTeams({
        roster: run.finalRoster,
        tradeChipPlayerIds: run.tradeChipPlayerIds,
        seed: run.seed,
        consequences: run.negotiationConsequences,
        previousTeam: run.previousFreeAgentTeam,
        excludedPlayerIds: excluded,
      })
    : [];
  const faTeams = faTeamCodes
    .map((code) => wheelFootballTeam(code))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pendingFaTeam = run.pendingFreeAgentTeam ? wheelFootballTeam(run.pendingFreeAgentTeam) ?? null : null;

  function spinFreeAgency() {
    if (faWheelSpinning || run.pendingFreeAgentTeam || !faTeamCodes.length) return;
    const teamCode = footballGmSpinTeam(`${run.seed}:free-agency`, run.freeAgentSpinIndex, faTeamCodes);
    if (!teamCode) return;
    const index = faTeams.findIndex((team) => team.code === teamCode);
    if (index < 0 || !faTeams.length) {
      patch({ pendingFreeAgentTeam: teamCode, tradeMessage: "" });
      return;
    }
    setFaWheelSpinning(true);
    const step = 360 / faTeams.length;
    setFaWheelRotation((current) => {
      const currentModulo = ((current % 360) + 360) % 360;
      const targetModulo = ((-index * step) % 360 + 360) % 360;
      const correction = (targetModulo - currentModulo + 360) % 360;
      return current + 1080 + correction;
    });
    window.setTimeout(() => {
      patch({ pendingFreeAgentTeam: teamCode, tradeMessage: "" });
      setFaWheelSpinning(false);
    }, 1550);
  }

  function makeFreeAgentPick(playerId: string, slot: FootballGmRosterSlot, displacedPlayerId?: string) {
    if (!run.pendingFreeAgentTeam) return;
    const player = footballGmPlayerById(playerId);
    if (!player || player.team !== run.pendingFreeAgentTeam || excludedPlayerIds.includes(player.id)) return;
    const next = footballGmSignFreeAgent({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      playerId,
      slot,
      displacedPlayerId,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      excludedPlayerIds: excluded,
    });
    if (!next) {
      patch({ tradeMessage: "That signing is no longer legal under the shared market and cap rules." });
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
        ? `${player.name} signed at ${slot}. ${displaced.name} is now a normal trade asset.`
        : `${player.name} signed at ${slot}.`,
    });
  }

  function releasePlayer(playerId: string) {
    if (run.voluntaryFreeAgencyUsed || run.tradeChipPlayerIds.length || run.finalRoster.length !== 7) return;
    const player = footballGmPlayerById(playerId);
    if (!player) return;
    const stripped = run.finalRoster.filter((entry) => entry.playerId !== playerId);
    const teams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      tradeChipPlayerIds: [],
      excludedPlayerIds: [...excludedPlayerIds, playerId],
    });
    if (!teams.length) return;
    setReleaseOpen(false);
    patch({
      finalRoster: stripped,
      voluntaryFreeAgencyUsed: true,
      releasedFreeAgentPlayerId: playerId,
      pendingFreeAgentTeam: null,
      previousFreeAgentTeam: null,
      tradeMessage: `${player.name} released. You now have a real free-agency vacancy.`,
    });
  }

  function beginTrade(playerId: string) {
    const held = run.finalRoster.some((entry) => entry.playerId === playerId)
      || run.tradeChipPlayerIds.includes(playerId);
    if (!held || run.shoppedPlayerIds.includes(playerId) || run.pendingTradeResolution) return;
    patch({
      tradeAnchorPlayerId: playerId,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      tradeMessage: "",
    });
  }

  function applyShoppingConsequence(prefix: string, additionalShoppedIds: readonly string[] = []) {
    const anchor = run.tradeAnchorPlayerId ? footballGmPlayerById(run.tradeAnchorPlayerId) : null;
    if (!anchor) return;
    const nextConsequences = { ...run.negotiationConsequences };
    if (anchor.gameContract === "1YR") {
      nextConsequences[anchor.id] = (nextConsequences[anchor.id] ?? 0) + 1;
    }
    const salary = footballGmAdjustedSalaryForPlayer(anchor, 2, run.seed, nextConsequences);
    patch({
      negotiationConsequences: nextConsequences,
      shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, ...additionalShoppedIds])],
      previousTradePartner: run.tradePartnerTeam,
      tradeSpinIndex: run.tradeSpinIndex + 1,
      tradeAnchorPlayerId: null,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      pendingTradeResolution: null,
      tradeMessage: anchor.gameContract === "1YR"
        ? `${prefix} ${anchor.name}'s camp moved the Year 2 price to ${footballGmMoney(salary)}.`
        : `${prefix} ${anchor.name} stays on the locked 3YR deal.`,
    });
  }

  function acceptTrade(proposal: FootballGmTradeProposal, offerNumber: number) {
    if (!run.tradeAnchorPlayerId || !run.tradePartnerTeam || !run.tradeTargetPlayerId) return;
    const offers = footballGmAcceptedTargetTradeOffers({
      seed: run.seed,
      partnerTeam: run.tradePartnerTeam,
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      anchorPlayerId: run.tradeAnchorPlayerId,
      targetPlayerId: run.tradeTargetPlayerId,
      shoppedPlayerIds: run.shoppedPlayerIds,
      excludedPlayerIds,
      maxOffers: 5,
    });
    const offer = offers.find((candidate) => sameTradeProposal(candidate.proposal, proposal));
    if (!offer) {
      patch({ tradeMessage: "That asking price is no longer available." });
      return;
    }

    const partnerTeam = run.tradePartnerTeam;
    const common = {
      previousTradePartner: partnerTeam,
      tradeSpinIndex: run.tradeSpinIndex + 1,
      tradeAnchorPlayerId: null,
      tradePartnerTeam: null,
      tradeTargetPlayerId: null,
      pendingFreeAgentTeam: null,
      shoppedPlayerIds: [...new Set([...run.shoppedPlayerIds, ...offer.proposal.outgoingPlayerIds])],
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
        tradeMessage: `Asking Price ${offerNumber} accepted. Choose ${offer.evaluation.requiresCuts} cut${offer.evaluation.requiresCuts === 1 ? "" : "s"} to finish it.`,
      });
      return;
    }

    if (offer.evaluation.nextRoster && offer.evaluation.nextTradeChipPlayerIds) {
      patch({
        ...common,
        finalRoster: [...offer.evaluation.nextRoster],
        tradeChipPlayerIds: [...offer.evaluation.nextTradeChipPlayerIds],
        pendingTradeResolution: null,
        tradeMessage: `Asking Price ${offerNumber} accepted. Trade complete.`,
      });
    }
  }

  function toggleCut(playerId: string) {
    const pending = run.pendingTradeResolution;
    if (!pending || playerId === pending.targetPlayerId || !pending.postTradePlayerIds.includes(playerId)) return;
    const selected = pending.cutPlayerIds;
    const cutPlayerIds = selected.includes(playerId)
      ? selected.filter((value) => value !== playerId)
      : selected.length < pending.requiredCuts
        ? [...selected, playerId]
        : selected;
    patch({ pendingTradeResolution: { ...pending, cutPlayerIds }, tradeMessage: "" });
  }

  function finalizeCuts() {
    const pending = run.pendingTradeResolution;
    if (!pending || pending.cutPlayerIds.length !== pending.requiredCuts) return;
    const next = footballGmResolveTradeAssets({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      proposal: pending.proposal,
      cutPlayerIds: pending.cutPlayerIds,
    });
    if (!next) return;
    patch({
      finalRoster: [...next.roster],
      tradeChipPlayerIds: [...next.tradeChipPlayerIds],
      pendingTradeResolution: null,
      tradeMessage: `Asking Price ${pending.offerNumber} completed.`,
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
      tradeMessage: player ? `${player.name} released from the displaced-asset pool.` : "Displaced asset released.",
    });
  }

  const continuity = footballGmContinuity(run.roster, run.finalRoster, 2);

  return (
    <div className="football-gm-front-office">
      <section className="football-gm-front-office__status">
        <span>
          <small>YOUR OFFSEASON</small>
          <strong>{offseasonReady ? "WINDOW SET" : "FRONT OFFICE OPEN"}</strong>
        </span>
        <b>{continuity.label} CONTINUITY · {continuity.retained}/7 BACK</b>
      </section>

      <CompactCapStrip run={run} />

      <RosterGrid
        roster={run.finalRoster}
        year={2}
        seed={run.seed}
        consequences={run.negotiationConsequences}
        showFutureSalary
        onShop={!run.tradeAnchorPlayerId && !run.pendingTradeResolution && !run.pendingFreeAgentTeam ? beginTrade : undefined}
        shoppedPlayerIds={run.shoppedPlayerIds}
      />

      {run.tradeMessage ? <section className="football-gm__trade-message surface-card">{run.tradeMessage}</section> : null}

      {run.pendingTradeResolution ? (
        <TradeCutResolution run={run} onToggleCut={toggleCut} onFinalize={finalizeCuts} />
      ) : run.tradeAnchorPlayerId ? (
        <TradeRoom
          run={run}
          patch={(next) => patch(next)}
          onAccept={acceptTrade}
          onEndTalks={() => applyShoppingConsequence("You ended trade talks.")}
          excludedPlayerIds={excludedPlayerIds}
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
              excludedPlayerIds={excluded}
              onPick={makeFreeAgentPick}
            />
          ) : canUseFa && faTeams.length ? (
            <div className="football-gm-front-office__market">
              <div>
                <small>FREE AGENCY</small>
                <strong>{footballGmOpenSlots(run.finalRoster).join(" · ") || "OPEN MARKET"}</strong>
                <span>Spin the same NFL wheel. Only legal Year 2 market options remain.</span>
              </div>
              <GmFootballWheel
                teams={faTeams}
                rotation={faWheelRotation}
                spinning={faWheelSpinning}
                pendingTeam={pendingFaTeam}
                canSpin={!busy && !run.pendingFreeAgentTeam}
                onSpin={spinFreeAgency}
              />
            </div>
          ) : null}

          <section className="football-gm-front-office__actions surface-card">
            <div>
              <small>FRONT OFFICE</small>
              <strong>{offseasonReady ? "READY TO LOCK IT" : "MAKE YOUR MOVES"}</strong>
            </div>
            <div>
              {!run.voluntaryFreeAgencyUsed && run.finalRoster.length === 7 && !run.tradeChipPlayerIds.length ? (
                <button type="button" onClick={() => setReleaseOpen(true)}>RELEASE</button>
              ) : null}
              <button
                className="primary-action"
                type="button"
                disabled={!offseasonReady || busy}
                onClick={() => void onFinish({ ...run, phase: "years23" })}
              >FINISH OFFSEASON</button>
            </div>
          </section>
        </>
      )}

      {releaseOpen ? (
        <ReleaseSheet
          run={run}
          excludedPlayerIds={excludedPlayerIds}
          onClose={() => setReleaseOpen(false)}
          onRelease={releasePlayer}
        />
      ) : null}
    </div>
  );
}

function YearOneStrip({
  leftName,
  rightName,
  leftRun,
  rightRun,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
}) {
  const left = footballGmSeasonResultV2({ seed: leftRun.seed, yearOneRoster: leftRun.roster, roster: leftRun.roster, year: 1 });
  const right = footballGmSeasonResultV2({ seed: rightRun.seed, yearOneRoster: rightRun.roster, roster: rightRun.roster, year: 1 });
  return (
    <section className="football-gm-year1-versus surface-card">
      <p className="eyebrow">YEAR 1 COMPLETE</p>
      <div>
        <article>
          <small>{leftName}</small>
          <strong>{left.finish}</strong>
          <span>{left.teamGrade.toFixed(1)} TEAM GRADE</span>
        </article>
        <b>VS</b>
        <article>
          <small>{rightName}</small>
          <strong>{right.finish}</strong>
          <span>{right.teamGrade.toFixed(1)} TEAM GRADE</span>
        </article>
      </div>
      <p>The lower Year 1 finisher gets the first full offseason and first access to the shared player market.</p>
    </section>
  );
}

function FinalCompare({
  leftName,
  rightName,
  leftRun,
  rightRun,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
}) {
  const leftFinal = leftRun.finalRoster.length ? leftRun.finalRoster : leftRun.roster;
  const rightFinal = rightRun.finalRoster.length ? rightRun.finalRoster : rightRun.roster;
  const left = footballGmFinalResultV2({ seed: leftRun.seed, yearOneRoster: leftRun.roster, finalRoster: leftFinal });
  const right = footballGmFinalResultV2({ seed: rightRun.seed, yearOneRoster: rightRun.roster, finalRoster: rightFinal });
  const winner = left.score === right.score ? "TIE" : left.score > right.score ? leftName : rightName;
  return (
    <section className="football-gm-final-versus surface-card">
      <p className="eyebrow">THE GM · FINAL</p>
      <h1>{winner === "TIE" ? "DEAD EVEN" : `${winner.toUpperCase()} WINS`}</h1>
      <div className="football-gm-final-versus__scores">
        <article className={left.score >= right.score ? "is-winner" : ""}>
          <small>{leftName}</small>
          <strong>{left.score.toFixed(1)}</strong>
          {left.seasons.map((season) => <span key={season.year}>Y{season.year} · {season.finish}</span>)}
        </article>
        <b>VS</b>
        <article className={right.score >= left.score ? "is-winner" : ""}>
          <small>{rightName}</small>
          <strong>{right.score.toFixed(1)}</strong>
          {right.seasons.map((season) => <span key={season.year}>Y{season.year} · {season.finish}</span>)}
        </article>
      </div>
      <p>Three-year score combines roster quality, continuity and postseason results. Exact player grades remain hidden.</p>
    </section>
  );
}

function OnlineMatch({
  code,
}: {
  code: string;
}) {
  const identity = useIdentity();
  const repository = useMemo(() => createFootballGmMatchRepository(), []);
  const [state, setState] = useState<FootballGmMatchState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [localOffseasonRun, setLocalOffseasonRun] = useState<PersistedRun | null>(null);
  const year1SubmitRef = useRef(false);
  const offseasonSaveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    if (!repository || !identity.profile?.id) return () => { active = false; };

    const sync = async (open = false) => {
      try {
        const next = open ? await repository.open(code) : await repository.load(code);
        if (active) {
          setState(next);
          setError("");
        }
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "The GM match could not be loaded.");
      }
    };

    void sync(true);
    const timer = window.setInterval(() => void sync(false), 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [code, identity.profile?.id, repository]);

  const me = state?.participants.find((participant) => participant.id === identity.profile?.id) ?? null;
  const opponent = state?.participants.find((participant) => participant.id !== identity.profile?.id) ?? null;
  const myRun = me && state ? hydratedRun(me, state.seed) : null;
  const opponentRun = opponent && state ? hydratedRun(opponent, state.seed) : null;
  const opponentHeld = opponentRun ? heldPlayerIds(opponentRun) : [];
  const myTurn = Boolean(state && identity.profile?.id && state.current_turn_profile_id === identity.profile.id);

  useEffect(() => {
    if (!state || state.phase !== "year1" || !me || !myRun || me.year1_result || year1SubmitRef.current || !repository) return;
    year1SubmitRef.current = true;
    const result = footballGmSeasonResultV2({ seed: myRun.seed, yearOneRoster: myRun.roster, roster: myRun.roster, year: 1 });
    void repository.submitYear1(code, result)
      .then((next) => {
        setState(next);
        setError("");
      })
      .catch((nextError) => {
        year1SubmitRef.current = false;
        setError(nextError instanceof Error ? nextError.message : "Year 1 could not be locked.");
      });
  }, [code, me, myRun, repository, state]);

  useEffect(() => {
    if (!state || state.phase !== "offseason" || !myRun || !myTurn) {
      setLocalOffseasonRun(null);
      return;
    }
    if (!localOffseasonRun) setLocalOffseasonRun(offseasonRun(myRun));
  }, [myRun, myTurn, state?.phase]);

  if (!repository) return <section className="surface-card">The GM match service is unavailable.</section>;
  if (error && !state) return <section className="surface-card"><h2>GM MATCH UNAVAILABLE</h2><p>{error}</p></section>;
  if (!state || !me || !opponent || !myRun || !opponentRun) {
    return <section className="surface-card">Loading The GM matchup…</section>;
  }

  const leftName = identity.profile?.displayName ?? "YOU";
  const rightName = opponent.display_name;
  const activeSide = state.current_turn_profile_id === me.id
    ? "left"
    : state.current_turn_profile_id === opponent.id
      ? "right"
      : null;

  const draftEligibleCodes = state.phase === "draft" && myTurn
    ? footballGmEligibleTeams({
        roster: myRun.roster,
        previousTeam: myRun.previousTeam,
        year: 1,
        excludedPlayerIds: opponentHeld,
      })
    : [];
  const draftTeams = draftEligibleCodes
    .map((teamCode) => wheelFootballTeam(teamCode))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pendingTeam = state.pending_team_code ? wheelFootballTeam(state.pending_team_code) ?? null : null;

  async function spin() {
    if (!myTurn || state.phase !== "draft" || state.pending_team_code || wheelSpinning || !draftEligibleCodes.length) return;
    setBusy(true);
    try {
      const next = await repository.spin(code, draftEligibleCodes);
      const landed = next.pending_team_code;
      const index = draftTeams.findIndex((team) => team.code === landed);
      if (landed && index >= 0 && draftTeams.length) {
        setWheelSpinning(true);
        const step = 360 / draftTeams.length;
        setWheelRotation((current) => {
          const currentModulo = ((current % 360) + 360) % 360;
          const targetModulo = ((-index * step) % 360 + 360) % 360;
          const correction = (targetModulo - currentModulo + 360) % 360;
          return current + 1080 + correction;
        });
        window.setTimeout(() => {
          setState(next);
          setWheelSpinning(false);
          setBusy(false);
        }, 1550);
      } else {
        setState(next);
        setBusy(false);
      }
    } catch (nextError) {
      setBusy(false);
      setError(nextError instanceof Error ? nextError.message : "The spin failed.");
    }
  }

  async function pick(playerId: string, slot: FootballGmRosterSlot) {
    if (!myTurn || state.phase !== "draft" || !state.pending_team_code) return;
    const player = footballGmPlayerById(playerId);
    if (!player || opponentHeld.includes(player.id)) return;
    const nextRoster = [...myRun.roster, { slot, playerId, acquired: "draft" as const }];
    const nextRun: PersistedRun = {
      ...myRun,
      roster: nextRoster,
      previousTeam: player.team,
      pendingTeam: null,
      spinIndex: myRun.spinIndex + 1,
      phase: nextRoster.length === 7 ? "year1" : "draft",
    };
    setBusy(true);
    try {
      const next = await repository.pick(code, { playerId, slot, runState: nextRun });
      setState(next);
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That pick is no longer available.");
    } finally {
      setBusy(false);
    }
  }

  function saveOffseason(nextRun: PersistedRun) {
    setLocalOffseasonRun(nextRun);
    offseasonSaveQueue.current = offseasonSaveQueue.current.then(async () => {
      if (!repository) return;
      const next = await repository.saveOffseason(code, nextRun);
      setState(next);
    }).catch((nextError) => {
      setError(nextError instanceof Error ? nextError.message : "The offseason could not be synced.");
    });
  }

  async function finishOffseason(nextRun: PersistedRun) {
    if (!repository || busy) return;
    setBusy(true);
    try {
      await offseasonSaveQueue.current;
      const next = await repository.finishOffseason(code, nextRun);
      setState(next);
      setLocalOffseasonRun(null);
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The offseason could not be finished.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <VersusBoard
        leftName={leftName}
        rightName={rightName}
        leftRun={myRun}
        rightRun={opponentRun}
        activeSide={activeSide}
        year={state.phase === "offseason" || state.phase === "complete" ? 2 : 1}
      />

      {error ? <section className="football-gm__trade-message surface-card">{error}</section> : null}

      {state.phase === "waiting" ? (
        <section className="football-gm-versus__waiting surface-card">
          <p className="eyebrow">HEAD-TO-HEAD LOBBY</p>
          <h2>WAITING FOR {rightName.toUpperCase()}</h2>
          <p>The draft starts when both GMs have opened the matchup. Picks then alternate one at a time.</p>
        </section>
      ) : null}

      {state.phase === "draft" ? (
        <>
          <div className="football-gm__draft-context">
            <span>ROUND {myRun.roster.length + 1} OF 7</span>
            <strong>{myTurn ? "YOUR TURN" : `${rightName.toUpperCase()}'S TURN`}</strong>
          </div>
          <GmFootballWheel
            teams={draftTeams.length ? draftTeams : footballGmEligibleTeams({
              roster: myRun.roster,
              previousTeam: myRun.previousTeam,
              year: 1,
              excludedPlayerIds: opponentHeld,
            }).map((teamCode) => wheelFootballTeam(teamCode)).filter((team): team is WheelFootballTeam => Boolean(team))}
            rotation={wheelRotation}
            spinning={wheelSpinning}
            pendingTeam={pendingTeam}
            canSpin={myTurn && !busy && !state.pending_team_code}
            onSpin={() => void spin()}
          />
          {myTurn && state.pending_team_code ? (
            <CandidateBoard
              teamCode={state.pending_team_code}
              roster={myRun.roster}
              year={1}
              excludedPlayerIds={opponentHeld}
              onPick={(playerId, slot) => void pick(playerId, slot)}
            />
          ) : !myTurn ? (
            <section className="football-gm-versus__turn surface-card">
              <small>WAITING</small>
              <strong>{rightName.toUpperCase()} IS ON THE CLOCK</strong>
              <span>Their pick will appear on the board as soon as it is locked.</span>
            </section>
          ) : null}
        </>
      ) : null}

      {state.phase === "year1" ? (
        <>
          <YearOneStrip leftName={leftName} rightName={rightName} leftRun={myRun} rightRun={opponentRun} />
          <section className="football-gm-versus__turn surface-card">
            <small>OFFSEASON ORDER</small>
            <strong>LOCKING YEAR 1 RESULTS…</strong>
            <span>The lower finisher gets the first complete offseason. An exact tie uses a seeded tiebreak.</span>
          </section>
        </>
      ) : null}

      {state.phase === "offseason" ? (
        myTurn && localOffseasonRun ? (
          <>
            <section className="football-gm-versus__priority surface-card">
              <small>{state.offseason_first_profile_id === me.id ? "FIRST OFFSEASON" : "SECOND OFFSEASON"}</small>
              <strong>THE FRONT OFFICE IS YOURS</strong>
              <span>Finish every move you want. When you lock the offseason, the remaining shared market passes to {rightName}.</span>
            </section>
            <FrontOffice
              run={localOffseasonRun}
              excludedPlayerIds={heldPlayerIds(opponentRun)}
              onChange={saveOffseason}
              onFinish={finishOffseason}
              busy={busy}
            />
          </>
        ) : (
          <>
            <YearOneStrip leftName={leftName} rightName={rightName} leftRun={myRun} rightRun={opponentRun} />
            <section className="football-gm-versus__turn surface-card">
              <small>WAITING</small>
              <strong>{rightName.toUpperCase()} IS IN THE FRONT OFFICE</strong>
              <span>They own the market until they finish. Their roster will update here; then the remaining market becomes yours.</span>
            </section>
          </>
        )
      ) : null}

      {state.phase === "complete" ? (
        <>
          <FinalCompare leftName={leftName} rightName={rightName} leftRun={myRun} rightRun={opponentRun} />
          <VersusBoard
            leftName={leftName}
            rightName={rightName}
            leftRun={myRun}
            rightRun={opponentRun}
            activeSide={null}
            year={2}
          />
        </>
      ) : null}
    </>
  );
}

function CpuMatch() {
  const identity = useIdentity();
  const matchSeedRef = useRef(freshSeed());
  const [you, setYou] = useState<PersistedRun>(() => ({ ...initialRun(`${matchSeedRef.current}:you`), phase: "draft" }));
  const [cpu, setCpu] = useState<PersistedRun>(() => ({ ...initialRun(`${matchSeedRef.current}:cpu`), phase: "draft" }));
  const [phase, setPhase] = useState<CpuPhase>("draft");
  const [turn, setTurn] = useState<CpuTurn>(() => (
    matchSeedRef.current.charCodeAt(0) % 2 === 0 ? "YOU" : "CPU"
  ));
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [cpuThinking, setCpuThinking] = useState(false);
  const [cpuOffseasonDone, setCpuOffseasonDone] = useState(false);
  const [youOffseasonDone, setYouOffseasonDone] = useState(false);

  const cpuHeld = heldPlayerIds(cpu);
  const youHeld = heldPlayerIds(you);

  const year1You = you.roster.length === 7
    ? footballGmSeasonResultV2({ seed: you.seed, yearOneRoster: you.roster, roster: you.roster, year: 1 })
    : null;
  const year1Cpu = cpu.roster.length === 7
    ? footballGmSeasonResultV2({ seed: cpu.seed, yearOneRoster: cpu.roster, roster: cpu.roster, year: 1 })
    : null;

  const priority: CpuTurn | null = year1You && year1Cpu
    ? finishRank(year1You.finish) < finishRank(year1Cpu.finish)
      ? "YOU"
      : finishRank(year1Cpu.finish) < finishRank(year1You.finish)
        ? "CPU"
        : matchSeedRef.current.charCodeAt(matchSeedRef.current.length - 1) % 2 === 0 ? "YOU" : "CPU"
    : null;

  useEffect(() => {
    if (phase !== "draft" || turn !== "CPU" || cpuThinking) return;
    setCpuThinking(true);
    const timer = window.setTimeout(() => {
      const choice = footballGmCpuDraftChoice({
        roster: cpu.roster,
        seed: cpu.seed,
        spinIndex: cpu.spinIndex,
        previousTeam: cpu.previousTeam,
        excludedPlayerIds: youHeld,
      });
      if (choice) {
        const nextRoster = [...cpu.roster, { slot: choice.slot, playerId: choice.playerId, acquired: "draft" as const }];
        setCpu({
          ...cpu,
          roster: nextRoster,
          previousTeam: choice.team,
          spinIndex: cpu.spinIndex + 1,
          phase: nextRoster.length === 7 ? "year1" : "draft",
        });
        if (nextRoster.length === 7 && you.roster.length === 7) {
          setPhase("year1");
        } else {
          setTurn("YOU");
        }
      }
      setCpuThinking(false);
    }, 850);
    return () => window.clearTimeout(timer);
  }, [cpu, cpuThinking, phase, turn, you.roster.length, youHeld.join("|")]);

  useEffect(() => {
    if (phase !== "year1" || !priority || !year1You || !year1Cpu) return;
    setPhase("offseason");
    setTurn(priority);
    setYou((current) => offseasonRun(current));
    setCpu((current) => offseasonRun(current));
  }, [phase, priority, year1Cpu, year1You]);

  useEffect(() => {
    if (phase !== "offseason" || turn !== "CPU" || cpuOffseasonDone || cpuThinking) return;
    setCpuThinking(true);
    const timer = window.setTimeout(() => {
      const result = footballGmCpuOffseason({
        yearOneRoster: cpu.roster,
        seed: cpu.seed,
        excludedPlayerIds: heldPlayerIds(you),
      });
      setCpu((current) => ({
        ...current,
        phase: "years23",
        finalRoster: [...result.roster],
        tradeChipPlayerIds: [],
      }));
      setCpuOffseasonDone(true);
      setCpuThinking(false);
      if (youOffseasonDone) {
        setPhase("complete");
      } else {
        setTurn("YOU");
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cpu, cpuOffseasonDone, cpuThinking, phase, turn, you, youOffseasonDone]);

  const eligibleCodes = phase === "draft" && turn === "YOU"
    ? footballGmEligibleTeams({
        roster: you.roster,
        previousTeam: you.previousTeam,
        year: 1,
        excludedPlayerIds: cpuHeld,
      })
    : [];
  const teams = eligibleCodes
    .map((code) => wheelFootballTeam(code))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pending = you.pendingTeam ? wheelFootballTeam(you.pendingTeam) ?? null : null;

  function spin() {
    if (phase !== "draft" || turn !== "YOU" || you.pendingTeam || wheelSpinning) return;
    const code = footballGmSpinTeam(you.seed, you.spinIndex, eligibleCodes);
    if (!code) return;
    const index = teams.findIndex((team) => team.code === code);
    if (index < 0) {
      setYou({ ...you, pendingTeam: code });
      return;
    }
    setWheelSpinning(true);
    const step = 360 / teams.length;
    setWheelRotation((current) => {
      const currentModulo = ((current % 360) + 360) % 360;
      const targetModulo = ((-index * step) % 360 + 360) % 360;
      const correction = (targetModulo - currentModulo + 360) % 360;
      return current + 1080 + correction;
    });
    window.setTimeout(() => {
      setYou((current) => ({ ...current, pendingTeam: code }));
      setWheelSpinning(false);
    }, 1550);
  }

  function pick(playerId: string, slot: FootballGmRosterSlot) {
    if (phase !== "draft" || turn !== "YOU" || !you.pendingTeam || cpuHeld.includes(playerId)) return;
    const player = footballGmPlayerById(playerId);
    if (!player) return;
    const nextRoster = [...you.roster, { slot, playerId, acquired: "draft" as const }];
    setYou({
      ...you,
      roster: nextRoster,
      previousTeam: player.team,
      pendingTeam: null,
      spinIndex: you.spinIndex + 1,
      phase: nextRoster.length === 7 ? "year1" : "draft",
    });
    if (nextRoster.length === 7 && cpu.roster.length === 7) {
      setPhase("year1");
    } else {
      setTurn("CPU");
    }
  }

  function finishYourOffseason(nextRun: PersistedRun) {
    const locked = { ...nextRun, phase: "years23" as const };
    setYou(locked);
    setYouOffseasonDone(true);
    if (cpuOffseasonDone) {
      setPhase("complete");
    } else {
      setTurn("CPU");
    }
  }

  const yourName = identity.profile?.displayName ?? "YOU";

  return (
    <>
      <VersusBoard
        leftName={yourName}
        rightName="CPU"
        leftRun={you}
        rightRun={cpu}
        activeSide={phase === "draft" || phase === "offseason" ? (turn === "YOU" ? "left" : "right") : null}
        year={phase === "offseason" || phase === "complete" ? 2 : 1}
      />

      {phase === "draft" ? (
        <>
          <div className="football-gm__draft-context">
            <span>ROUND {you.roster.length + 1} OF 7</span>
            <strong>{turn === "YOU" ? "YOUR TURN" : "CPU TURN"}</strong>
          </div>
          {turn === "YOU" ? (
            <>
              <GmFootballWheel
                teams={teams}
                rotation={wheelRotation}
                spinning={wheelSpinning}
                pendingTeam={pending}
                canSpin={!you.pendingTeam}
                onSpin={spin}
              />
              {you.pendingTeam ? (
                <CandidateBoard
                  teamCode={you.pendingTeam}
                  roster={you.roster}
                  year={1}
                  excludedPlayerIds={cpuHeld}
                  onPick={pick}
                />
              ) : null}
            </>
          ) : (
            <section className="football-gm-versus__turn surface-card">
              <small>CPU FRONT OFFICE</small>
              <strong>{cpuThinking ? "MAKING THE PICK…" : "ON THE CLOCK"}</strong>
              <span>The CPU uses the same cap and shared player pool.</span>
            </section>
          )}
        </>
      ) : null}

      {phase === "year1" && year1You && year1Cpu ? (
        <YearOneStrip leftName={yourName} rightName="CPU" leftRun={you} rightRun={cpu} />
      ) : null}

      {phase === "offseason" ? (
        turn === "YOU" ? (
          <>
            <section className="football-gm-versus__priority surface-card">
              <small>{priority === "YOU" ? "FIRST OFFSEASON" : "SECOND OFFSEASON"}</small>
              <strong>THE FRONT OFFICE IS YOURS</strong>
              <span>Take your entire offseason. The CPU only gets the remaining shared market after you finish.</span>
            </section>
            <FrontOffice
              run={offseasonRun(you)}
              excludedPlayerIds={heldPlayerIds(cpu)}
              onChange={setYou}
              onFinish={finishYourOffseason}
            />
          </>
        ) : (
          <>
            {year1You && year1Cpu ? <YearOneStrip leftName={yourName} rightName="CPU" leftRun={you} rightRun={cpu} /> : null}
            <section className="football-gm-versus__turn surface-card">
              <small>CPU FRONT OFFICE</small>
              <strong>{cpuThinking ? "WORKING THE OFFSEASON…" : "OFFSEASON PRIORITY"}</strong>
              <span>The CPU owns the market until its full offseason is complete.</span>
            </section>
          </>
        )
      ) : null}

      {phase === "complete" ? (
        <>
          <FinalCompare leftName={yourName} rightName="CPU" leftRun={you} rightRun={cpu} />
          <VersusBoard leftName={yourName} rightName="CPU" leftRun={you} rightRun={cpu} activeSide={null} year={2} />
        </>
      ) : null}
    </>
  );
}

export default function FootballGmVersusPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createFootballGmMatchRepository(), []);
  const code = normalizedCode(params.get("match"));
  const [stage, setStage] = useState<"intro" | "mode" | "challenge" | "cpu">("intro");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!identity.ready) return null;
  if (!isFootballGmPlaytestProfile(identity.profile)) return <Navigate to="/football" replace />;

  async function challengeMember(memberId: string) {
    if (!repository || creating) return;
    setCreating(true);
    setError("");
    try {
      const nextCode = await repository.create(memberId);
      await challenges.refresh();
      navigate(`/football/gm-mode?match=${nextCode}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The GM challenge could not be created.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page football-gm-page football-gm-versus-page">
      <GmHeader />

      {code ? <OnlineMatch code={code} /> : null}

      {!code && stage === "intro" ? <Intro onStart={() => setStage("mode")} /> : null}

      {!code && stage === "mode" ? (
        <ModeChooser onCpu={() => setStage("cpu")} onChallenge={() => setStage("challenge")} />
      ) : null}

      {!code && stage === "challenge" ? (
        <section className="football-gm__challenge-setup surface-card">
          <header>
            <span><small>HEAD-TO-HEAD</small><strong>CHALLENGE A GM</strong></span>
            <button type="button" onClick={() => setStage("mode")}>BACK</button>
          </header>
          <p>Draft turns alternate. The lower Year 1 finisher receives the first complete offseason, then the remaining market passes to the other GM.</p>
          <ChallengeMemberPicker
            members={challenges.members}
            busy={creating}
            onSelect={(member) => void challengeMember(member.id)}
          />
          {error ? <small className="football-gm__challenge-error">{error}</small> : null}
        </section>
      ) : null}

      {!code && stage === "cpu" ? <CpuMatch /> : null}
    </div>
  );
}
