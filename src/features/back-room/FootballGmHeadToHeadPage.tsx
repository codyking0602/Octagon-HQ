import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/football-gm-mode.css";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballGmMatchRepository,
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
  footballGmSpinTeam,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
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
  footballGmFinalResultV2,
  footballGmIsOffseasonCompliantV2,
  footballGmResolveTradeAssets,
  footballGmSeasonResultV2,
  footballGmSignFreeAgent,
  type FootballGmTradeProposal,
} from "./footballGmStrategy";
import FootballGmSoloPage, {
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
import { footballGmPlaytestOpponentName, isFootballGmPlaytestProfile } from "./footballGmAccess";
import { wheelFootballTeam, type WheelFootballTeam } from "./wheelFootballModel";

type VersusMode = "cpu" | "human";
type LocalMatchPhase = "draft" | "year1" | "offseason" | "complete";
type LocalTurn = "user" | "cpu" | null;

const FINISH_RANK: Record<string, number> = {
  "Missed Playoffs": 0,
  "Wild Card": 1,
  Divisional: 2,
  "Conference Championship": 3,
  "Super Bowl Loss": 4,
  Champion: 5,
};

function freshSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(36).slice(2)}`;
}

function normalizedRun(seed: string, value: unknown): PersistedRun {
  const base = initialRun(seed);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...base, phase: "draft" };
  }
  const raw = value as Partial<PersistedRun>;
  return {
    ...base,
    ...raw,
    version: FOOTBALL_GM_VERSION,
    seed,
    phase: raw.phase ?? "draft",
    roster: Array.isArray(raw.roster) ? raw.roster : [],
    finalRoster: Array.isArray(raw.finalRoster) ? raw.finalRoster : [],
    tradeChipPlayerIds: Array.isArray(raw.tradeChipPlayerIds) ? raw.tradeChipPlayerIds : [],
    shoppedPlayerIds: Array.isArray(raw.shoppedPlayerIds) ? raw.shoppedPlayerIds : [],
    negotiationConsequences: raw.negotiationConsequences ?? {},
  };
}

function heldPlayerIds(run: PersistedRun) {
  const roster = run.finalRoster.length ? run.finalRoster : run.roster;
  return [...new Set([
    ...roster.map((entry) => entry.playerId),
    ...run.tradeChipPlayerIds,
  ])];
}

function rosterForDisplay(run: PersistedRun, phase: LocalMatchPhase | FootballGmMatchState["phase"]) {
  if ((phase === "offseason" || phase === "complete") && run.finalRoster.length) return run.finalRoster;
  return run.roster;
}

function compareProposal(left: FootballGmTradeProposal, right: FootballGmTradeProposal) {
  const key = (values: readonly string[]) => [...values].sort().join("|");
  return key(left.outgoingPlayerIds) === key(right.outgoingPlayerIds)
    && key(left.incomingPlayerIds) === key(right.incomingPlayerIds);
}

function scoutingStyle(teamCode: string) {
  const team = wheelFootballTeam(teamCode);
  if (!team) return undefined;
  return {
    "--gm-team-primary": team.primaryColor,
    "--gm-team-secondary": team.secondaryColor,
  } as CSSProperties;
}

function capForRun(run: PersistedRun, phase: LocalMatchPhase | FootballGmMatchState["phase"], year: 1 | 2) {
  if (year === 1 || (phase !== "offseason" && phase !== "complete")) {
    return footballGmRosterCap(run.roster, 1);
  }
  return footballGmAdjustedHoldingsCap(
    run.finalRoster.length ? run.finalRoster : run.roster,
    run.tradeChipPlayerIds,
    2,
    run.seed,
    run.negotiationConsequences,
  );
}

function VersusRosterBoard({
  leftName,
  rightName,
  leftRun,
  rightRun,
  phase,
  activeSide,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
  phase: LocalMatchPhase | FootballGmMatchState["phase"];
  activeSide: "left" | "right" | null;
}) {
  const leftRoster = rosterForDisplay(leftRun, phase);
  const rightRoster = rosterForDisplay(rightRun, phase);
  const leftBySlot = new Map(leftRoster.map((entry) => [entry.slot, entry]));
  const rightBySlot = new Map(rightRoster.map((entry) => [entry.slot, entry]));
  const showFuture = phase === "offseason" || phase === "complete";

  const cell = (entry: FootballGmRosterEntry | undefined, side: "left" | "right", run: PersistedRun) => {
    const player = entry ? footballGmPlayerById(entry.playerId) : null;
    if (!player) {
      return (
        <div className={`football-gm-versus__cell ${side}`}>
          <span className="football-wheel-roster__empty-mark">+</span>
          <strong>OPEN</strong>
        </div>
      );
    }
    const salary = showFuture
      ? footballGmAdjustedSalaryForPlayer(player, 2, run.seed, run.negotiationConsequences)
      : player.salaryWindow[0];
    return (
      <div
        className={`football-gm-versus__cell is-filled ${side}`}
        style={scoutingStyle(player.team)}
      >
        <PlayerHeadshot player={player} className="football-gm-versus__headshot" />
        <span>
          <strong>{player.name}</strong>
          <small>{footballGmMoney(salary)}</small>
          <span className="football-gm-versus__pills">
            <PlayerQualityPill player={player} />
            <PlayerOutlookPill outlook={player.outlook} />
          </span>
        </span>
      </div>
    );
  };

  return (
    <section className="football-gm-versus surface-card">
      <header>
        <div className={activeSide === "left" ? "is-active" : ""}>
          <small>YOU</small>
          <strong>{leftName}</strong>
          <b>{footballGmMoney(capForRun(leftRun, phase, showFuture ? 2 : 1))}</b>
        </div>
        <span>THE GM</span>
        <div className={activeSide === "right" ? "is-active" : ""}>
          <small>OPPONENT</small>
          <strong>{rightName}</strong>
          <b>{footballGmMoney(capForRun(rightRun, phase, showFuture ? 2 : 1))}</b>
        </div>
      </header>
      <div className="football-gm-versus__rows">
        {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => (
          <div className="football-gm-versus__row" key={slot}>
            {cell(leftBySlot.get(slot), "left", leftRun)}
            <b>{slot}</b>
            {cell(rightBySlot.get(slot), "right", rightRun)}
          </div>
        ))}
      </div>
    </section>
  );
}

function YearOneMatchup({
  leftName,
  rightName,
  leftRun,
  rightRun,
  firstName,
  waiting,
  onContinue,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
  firstName: string | null;
  waiting?: boolean;
  onContinue?: () => void;
}) {
  const left = footballGmSeasonResultV2({ seed: leftRun.seed, yearOneRoster: leftRun.roster, roster: leftRun.roster, year: 1 });
  const right = footballGmSeasonResultV2({ seed: rightRun.seed, yearOneRoster: rightRun.roster, roster: rightRun.roster, year: 1 });
  return (
    <section className="football-gm__year-reveal football-gm__year1-matchup surface-card">
      <p className="eyebrow">YEAR 1 COMPLETE</p>
      <div className="football-gm__head-to-head-seasons">
        <article>
          <small>{leftName}</small>
          <strong>{left.teamGrade.toFixed(1)}</strong>
          <b>{left.finish}</b>
        </article>
        <span>VS</span>
        <article>
          <small>{rightName}</small>
          <strong>{right.teamGrade.toFixed(1)}</strong>
          <b>{right.finish}</b>
        </article>
      </div>
      {firstName ? (
        <div className="football-gm__priority-callout">
          <small>OFFSEASON PRIORITY</small>
          <strong>{firstName.toUpperCase()} GOES FIRST</strong>
          <span>Lower Year 1 finisher gets first access to the shared player market.</span>
        </div>
      ) : null}
      {waiting ? <p>Waiting for both Year 1 results to lock.</p> : null}
      {onContinue ? <button className="primary-action" type="button" onClick={onContinue}>ENTER THE OFFSEASON</button> : null}
    </section>
  );
}

function FrontOfficeSummary({
  run,
  isReady,
}: {
  run: PersistedRun;
  isReady: boolean;
}) {
  const y2 = footballGmAdjustedHoldingsCap(run.finalRoster, run.tradeChipPlayerIds, 2, run.seed, run.negotiationConsequences);
  const y3 = footballGmAdjustedHoldingsCap(run.finalRoster, run.tradeChipPlayerIds, 3, run.seed, run.negotiationConsequences);
  const continuity = footballGmContinuity(run.roster, run.finalRoster, 2);
  const capStat = (year: 2 | 3, value: number) => {
    const room = FOOTBALL_GM_CAP - value;
    return (
      <span className={room < 0 ? "is-over" : ""}>
        <small>YEAR {year}</small>
        <strong>{footballGmMoney(value)}</strong>
        <em>{room >= 0 ? `${footballGmMoney(room)} LEFT` : `${footballGmMoney(Math.abs(room))} OVER`}</em>
      </span>
    );
  };
  return (
    <section className={`football-gm__front-office-summary surface-card${isReady ? " is-ready" : " is-crisis"}`}>
      <header>
        <span><small>FRONT OFFICE</small><strong>{isReady ? "WINDOW SET" : "GET UNDER BOTH CAPS"}</strong></span>
        <b>{continuity.label} CONTINUITY</b>
      </header>
      <div>{capStat(2, y2)}{capStat(3, y3)}</div>
      <footer>
        <span>{continuity.retained}/7 Year 1 players retained</span>
        <b>{continuity.meter}/100</b>
      </footer>
    </section>
  );
}

function ReleasePicker({
  run,
  excludedPlayerIds,
  selectedPlayerId,
  onSelect,
  onClose,
  onRelease,
}: {
  run: PersistedRun;
  excludedPlayerIds: readonly string[];
  selectedPlayerId: string | null;
  onSelect: (playerId: string | null) => void;
  onClose: () => void;
  onRelease: (playerId: string) => void;
}) {
  const rows = run.finalRoster.flatMap((entry) => {
    const player = footballGmPlayerById(entry.playerId);
    if (!player) return [];
    const stripped = run.finalRoster.filter((candidate) => candidate.playerId !== player.id);
    const teams = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      excludedPlayerIds: [...excludedPlayerIds, player.id],
    });
    const y2Room = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 2, run.seed, run.negotiationConsequences);
    const y3Room = FOOTBALL_GM_CAP - footballGmAdjustedRosterCap(stripped, 3, run.seed, run.negotiationConsequences);
    return [{
      entry,
      player,
      teams: teams.length,
      budget: Math.max(0, Math.min(y2Room, y3Room)),
    }];
  });
  const selected = rows.find((row) => row.player.id === selectedPlayerId) ?? null;
  return (
    <section className="football-gm__release-picker surface-card">
      <header>
        <span><small>ONE VOLUNTARY RELEASE</small><strong>CREATE AN FA OPENING</strong></span>
        <button type="button" onClick={onClose}>×</button>
      </header>
      <div>
        {rows.map((row) => (
          <button
            type="button"
            key={row.player.id}
            disabled={!row.teams}
            className={selectedPlayerId === row.player.id ? "is-selected" : ""}
            onClick={() => onSelect(selectedPlayerId === row.player.id ? null : row.player.id)}
          >
            <PlayerHeadshot player={row.player} />
            <span>
              <small>{row.entry.slot} · {row.teams ? `${row.teams} FA TEAMS` : "NO LEGAL REPLACEMENT"}</small>
              <strong>{row.player.name}</strong>
            </span>
            <b>{footballGmMoney(row.budget)}</b>
          </button>
        ))}
      </div>
      {selected ? (
        <button className="primary-action" type="button" onClick={() => onRelease(selected.player.id)}>
          RELEASE {selected.player.name.toUpperCase()}
        </button>
      ) : null}
      <small>The release is final and that player cannot be re-signed this offseason.</small>
    </section>
  );
}

function WaitingCard({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="football-gm__waiting surface-card">
      <p className="eyebrow">LIVE MATCH</p>
      <h2>{title}</h2>
      <p>{copy}</p>
    </section>
  );
}

function FinalMatch({
  leftName,
  rightName,
  leftRun,
  rightRun,
  onReplay,
}: {
  leftName: string;
  rightName: string;
  leftRun: PersistedRun;
  rightRun: PersistedRun;
  onReplay: () => void;
}) {
  const left = footballGmFinalResultV2({
    seed: leftRun.seed,
    yearOneRoster: leftRun.roster,
    finalRoster: leftRun.finalRoster.length ? leftRun.finalRoster : leftRun.roster,
  });
  const right = footballGmFinalResultV2({
    seed: rightRun.seed,
    yearOneRoster: rightRun.roster,
    finalRoster: rightRun.finalRoster.length ? rightRun.finalRoster : rightRun.roster,
  });
  const winner = left.score === right.score ? "TIE" : left.score > right.score ? leftName : rightName;
  return (
    <section className="football-gm__final football-gm__versus-final surface-card">
      <p className="eyebrow">THE GM · 3-YEAR RESULT</p>
      <h1>{winner === "TIE" ? "DEAD EVEN" : `${winner.toUpperCase()} WINS`}</h1>
      <div className="football-gm__final-versus-score">
        <article><small>{leftName}</small><strong>{left.score.toFixed(1)}</strong></article>
        <span>VS</span>
        <article><small>{rightName}</small><strong>{right.score.toFixed(1)}</strong></article>
      </div>
      <div className="football-gm__final-season-table">
        {[1,2,3].map((year, index) => (
          <div key={year}>
            <span>{left.seasons[index]!.finish}</span>
            <b>Y{year}</b>
            <span>{right.seasons[index]!.finish}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onReplay}>NEW GM MATCH</button>
    </section>
  );
}

export default function FootballGmHeadToHeadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createFootballGmMatchRepository(), []);
  const matchCode = (searchParams.get("match") ?? "").trim().toUpperCase();
  const soloRequested = searchParams.get("solo") === "1";
  const allowed = isFootballGmPlaytestProfile(identity.profile);
  const opponentName = footballGmPlaytestOpponentName(identity.profile);

  const [showModePicker, setShowModePicker] = useState(false);
  const [mode, setMode] = useState<VersusMode | null>(matchCode ? "human" : null);
  const [setupBusy, setSetupBusy] = useState(false);
  const [status, setStatus] = useState("");

  const [run, setRun] = useState<PersistedRun>(() => initialRun(freshSeed()));
  const [cpuRun, setCpuRun] = useState<PersistedRun>(() => initialRun(run.seed));
  const [localPhase, setLocalPhase] = useState<LocalMatchPhase>("draft");
  const [localTurn, setLocalTurn] = useState<LocalTurn>(null);
  const [localOffseasonFirst, setLocalOffseasonFirst] = useState<LocalTurn>(null);
  const [userOffseasonDone, setUserOffseasonDone] = useState(false);
  const [cpuOffseasonDone, setCpuOffseasonDone] = useState(false);

  const [remote, setRemote] = useState<FootballGmMatchState | null>(null);
  const [remoteError, setRemoteError] = useState("");
  const humanHydratedRef = useRef(false);
  const yearOneSubmittedRef = useRef(false);

  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [faWheelRotation, setFaWheelRotation] = useState(0);
  const [faWheelSpinning, setFaWheelSpinning] = useState(false);
  const [cpuPendingTeam, setCpuPendingTeam] = useState<string | null>(null);
  const cpuBusyRef = useRef(false);

  const [showReleasePicker, setShowReleasePicker] = useState(false);
  const [releasePlayerId, setReleasePlayerId] = useState<string | null>(null);

  const activeProfileId = identity.profile?.id ?? null;
  const remoteMe = remote?.participants.find((participant) => participant.id === activeProfileId) ?? null;
  const remoteOpponent = remote?.participants.find((participant) => participant.id !== activeProfileId) ?? null;
  const remoteOpponentRun = remoteOpponent
    ? normalizedRun(`${remote?.seed ?? run.seed}:${remoteOpponent.id}`, remoteOpponent.run_state)
    : null;

  const opponentRun = mode === "human" ? remoteOpponentRun ?? initialRun(remote?.seed ?? run.seed) : cpuRun;
  const displayedPhase = mode === "human" ? remote?.phase ?? "waiting" : localPhase;
  const opponentDisplayName = mode === "human"
    ? remoteOpponent?.display_name ?? opponentName ?? "OPPONENT"
    : "CPU";
  const myDisplayName = identity.profile?.displayName ?? "YOU";
  const isMyTurn = mode === "human"
    ? Boolean(remote && remote.current_turn_profile_id === activeProfileId)
    : localTurn === "user";
  const activeSide = isMyTurn ? "left" : (
    (mode === "human" && remote?.current_turn_profile_id)
    || (mode === "cpu" && localTurn === "cpu")
      ? "right"
      : null
  );

  const opponentHeldIds = heldPlayerIds(opponentRun);
  const exclusionIds = [...new Set([
    ...opponentHeldIds,
    ...(run.releasedFreeAgentPlayerId ? [run.releasedFreeAgentPlayerId] : []),
  ])];

  const currentDraftRoster = mode === "cpu" && localTurn === "cpu" ? cpuRun.roster : run.roster;
  const currentDraftPreviousTeam = mode === "cpu" && localTurn === "cpu" ? cpuRun.previousTeam : run.previousTeam;
  const draftExcludedIds = mode === "cpu" && localTurn === "cpu"
    ? heldPlayerIds(run)
    : opponentHeldIds;
  const draftEligibleTeamCodes = (displayedPhase === "draft")
    ? footballGmEligibleTeams({
        roster: currentDraftRoster,
        previousTeam: currentDraftPreviousTeam,
        year: 1,
        excludedPlayerIds: draftExcludedIds,
      })
    : [];
  const draftWheelTeams = draftEligibleTeamCodes
    .map((teamCode) => wheelFootballTeam(teamCode))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pendingTeamCode = mode === "human"
    ? remote?.pending_team_code ?? null
    : localTurn === "cpu"
      ? cpuPendingTeam
      : run.pendingTeam;
  const pendingTeam = pendingTeamCode ? wheelFootballTeam(pendingTeamCode) ?? null : null;
  const canUseFreeAgency = displayedPhase === "offseason"
    && isMyTurn
    && footballGmCanUseFreeAgency(run.finalRoster, run.tradeChipPlayerIds);
  const freeAgencyTeamCodes = canUseFreeAgency
    ? footballGmEligibleFreeAgencyTeams({
        roster: run.finalRoster,
        tradeChipPlayerIds: run.tradeChipPlayerIds,
        seed: run.seed,
        consequences: run.negotiationConsequences,
        previousTeam: run.previousFreeAgentTeam,
        excludedPlayerIds: exclusionIds,
      })
    : [];
  const freeAgencyWheelTeams = freeAgencyTeamCodes
    .map((teamCode) => wheelFootballTeam(teamCode))
    .filter((team): team is WheelFootballTeam => Boolean(team));
  const pendingFreeAgencyTeam = run.pendingFreeAgentTeam
    ? wheelFootballTeam(run.pendingFreeAgentTeam) ?? null
    : null;

  useEffect(() => {
    if (!matchCode || !repository || !activeProfileId) return;
    let active = true;
    let timer = 0;

    const applyState = (next: FootballGmMatchState) => {
      if (!active) return;
      setRemote(next);
      setRemoteError("");
      const participant = next.participants.find((row) => row.id === activeProfileId);
      if (!participant) return;
      const nextRun = normalizedRun(`${next.seed}:${participant.id}`, participant.run_state);
      const myOffseason = next.phase === "offseason" && next.current_turn_profile_id === activeProfileId;
      if (!myOffseason) {
        humanHydratedRef.current = false;
        setRun(nextRun);
      } else if (!humanHydratedRef.current) {
        humanHydratedRef.current = true;
        setRun({
          ...nextRun,
          phase: "offseason",
          finalRoster: nextRun.finalRoster.length ? nextRun.finalRoster : [...nextRun.roster],
        });
      }
    };

    const sync = async (open = false) => {
      try {
        const next = open ? await repository.open(matchCode) : await repository.load(matchCode);
        applyState(next);
      } catch (reason) {
        if (!active) return;
        setRemoteError(reason instanceof Error ? reason.message : "The GM match could not be loaded.");
      }
    };

    void sync(true);
    timer = window.setInterval(() => void sync(false), 5_000);
    const onFocus = () => void sync(false);
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [activeProfileId, matchCode, repository]);

  useEffect(() => {
    if (
      mode !== "human"
      || !matchCode
      || !repository
      || !remote
      || remote.phase !== "offseason"
      || remote.current_turn_profile_id !== activeProfileId
      || !humanHydratedRef.current
    ) return;
    const timer = window.setTimeout(() => {
      void repository.saveOffseason(matchCode, run).catch((reason) => {
        setRemoteError(reason instanceof Error ? reason.message : "Front office changes could not be saved.");
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [activeProfileId, matchCode, mode, remote?.current_turn_profile_id, remote?.phase, repository, run]);

  useEffect(() => {
    if (
      mode !== "human"
      || !remote
      || remote.phase !== "year1"
      || !remoteMe
      || remoteMe.year1_result
      || yearOneSubmittedRef.current
      || !repository
      || run.roster.length !== 7
    ) return;
    yearOneSubmittedRef.current = true;
    const result = footballGmSeasonResultV2({
      seed: run.seed,
      yearOneRoster: run.roster,
      roster: run.roster,
      year: 1,
    });
    void repository.submitYear1(remote.code, result)
      .then((next) => setRemote(next))
      .catch((reason) => {
        yearOneSubmittedRef.current = false;
        setRemoteError(reason instanceof Error ? reason.message : "Year 1 could not be locked.");
      });
  }, [mode, remote, remoteMe, repository, run.roster]);

  useEffect(() => {
    if (mode !== "cpu" || localPhase !== "draft" || localTurn !== "cpu" || cpuBusyRef.current) return;
    cpuBusyRef.current = true;
    const delay = window.setTimeout(() => {
      const choice = footballGmCpuDraftChoice({
        roster: cpuRun.roster,
        seed: cpuRun.seed,
        spinIndex: cpuRun.spinIndex,
        previousTeam: cpuRun.previousTeam,
        excludedPlayerIds: heldPlayerIds(run),
      });
      if (!choice) {
        cpuBusyRef.current = false;
        return;
      }
      const index = draftWheelTeams.findIndex((team) => team.code === choice.team);
      if (index >= 0 && draftWheelTeams.length) {
        const step = 360 / draftWheelTeams.length;
        setWheelSpinning(true);
        setWheelRotation((current) => {
          const modulo = ((current % 360) + 360) % 360;
          const target = ((-index * step) % 360 + 360) % 360;
          return current + 1080 + ((target - modulo + 360) % 360);
        });
      }
      const land = window.setTimeout(() => {
        setWheelSpinning(false);
        setCpuPendingTeam(choice.team);
        const choose = window.setTimeout(() => {
          const player = footballGmPlayerById(choice.playerId);
          if (!player) {
            cpuBusyRef.current = false;
            return;
          }
          const nextRoster: FootballGmRosterEntry[] = [
            ...cpuRun.roster,
            { slot: choice.slot, playerId: choice.playerId, acquired: "draft" },
          ];
          setCpuRun((current) => ({
            ...current,
            roster: nextRoster,
            previousTeam: choice.team,
            pendingTeam: null,
            spinIndex: current.spinIndex + 1,
            phase: nextRoster.length === 7 ? "year1" : "draft",
          }));
          setCpuPendingTeam(null);
          if (nextRoster.length === 7 && run.roster.length === 7) {
            setLocalPhase("year1");
            setLocalTurn(null);
          } else {
            setLocalTurn("user");
          }
          cpuBusyRef.current = false;
        }, 650);
        return () => window.clearTimeout(choose);
      }, 1550);
      return () => window.clearTimeout(land);
    }, 450);
    return () => window.clearTimeout(delay);
  }, [cpuRun, draftWheelTeams, localPhase, localTurn, mode, run]);

  useEffect(() => {
    if (mode !== "cpu" || localPhase !== "offseason" || localTurn !== "cpu" || cpuOffseasonDone || cpuBusyRef.current) return;
    cpuBusyRef.current = true;
    const timer = window.setTimeout(() => {
      const result = footballGmCpuOffseason({
        yearOneRoster: cpuRun.roster,
        seed: cpuRun.seed,
        excludedPlayerIds: heldPlayerIds(run),
      });
      const nextCpu = {
        ...cpuRun,
        phase: "offseason" as const,
        finalRoster: [...result.roster],
        tradeChipPlayerIds: [],
      };
      setCpuRun(nextCpu);
      setCpuOffseasonDone(true);
      cpuBusyRef.current = false;
      if (userOffseasonDone) {
        setLocalPhase("complete");
        setLocalTurn(null);
      } else {
        setLocalTurn("user");
      }
    }, 1_250);
    return () => window.clearTimeout(timer);
  }, [cpuOffseasonDone, cpuRun, localPhase, localTurn, mode, run, userOffseasonDone]);

  if (!identity.ready) return null;
  if (!allowed) return <Navigate to="/football" replace />;
  if (soloRequested) return <FootballGmSoloPage startImmediately standalone />;

  function resetLocal() {
    navigate("/football/gm-mode?solo=1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createHumanMatch() {
    if (!repository || !opponentName) return;
    setSetupBusy(true);
    setStatus("");
    try {
      const profile = await challenges.findProfile(opponentName);
      if (!profile) {
        setStatus(`${opponentName} is not available to challenge right now.`);
        return;
      }
      const code = await repository.create(profile.id);
      navigate(`/football/gm-mode?match=${code}`, { replace: true });
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "The GM challenge could not be created.");
    } finally {
      setSetupBusy(false);
    }
  }

  function animateWheelTo(teamCode: string, teams: readonly WheelFootballTeam[], done: () => void) {
    const index = teams.findIndex((team) => team.code === teamCode);
    if (index < 0 || !teams.length) {
      done();
      return;
    }
    const step = 360 / teams.length;
    setWheelSpinning(true);
    setWheelRotation((current) => {
      const modulo = ((current % 360) + 360) % 360;
      const target = ((-index * step) % 360 + 360) % 360;
      return current + 1080 + ((target - modulo + 360) % 360);
    });
    window.setTimeout(() => {
      setWheelSpinning(false);
      done();
    }, 1550);
  }

  async function spinDraft() {
    if (wheelSpinning || !isMyTurn || displayedPhase !== "draft" || pendingTeamCode) return;
    if (mode === "human") {
      if (!repository || !remote) return;
      try {
        const next = await repository.spin(remote.code, draftEligibleTeamCodes);
        const teamCode = next.pending_team_code;
        if (!teamCode) return;
        animateWheelTo(teamCode, draftWheelTeams, () => setRemote(next));
      } catch (reason) {
        setRemoteError(reason instanceof Error ? reason.message : "The wheel could not be spun.");
      }
      return;
    }
    const teamCode = footballGmSpinTeam(run.seed, run.spinIndex, draftEligibleTeamCodes);
    if (!teamCode) return;
    animateWheelTo(teamCode, draftWheelTeams, () => {
      setRun((current) => ({ ...current, pendingTeam: teamCode }));
    });
  }

  async function makeDraftPick(playerId: string, slot: FootballGmRosterSlot) {
    if (!isMyTurn || displayedPhase !== "draft") return;
    const player = footballGmPlayerById(playerId);
    if (!player || opponentHeldIds.includes(player.id)) return;
    const nextRoster: FootballGmRosterEntry[] = [...run.roster, { slot, playerId, acquired: "draft" }];
    const nextRun: PersistedRun = {
      ...run,
      roster: nextRoster,
      pendingTeam: null,
      previousTeam: player.team,
      spinIndex: run.spinIndex + 1,
      phase: nextRoster.length === 7 ? "year1" : "draft",
    };

    if (mode === "human") {
      if (!repository || !remote) return;
      try {
        const next = await repository.pick(remote.code, { playerId, slot, runState: nextRun });
        setRun(nextRun);
        setRemote(next);
      } catch (reason) {
        setRemoteError(reason instanceof Error ? reason.message : "That player could not be drafted.");
      }
      return;
    }

    setRun(nextRun);
    if (nextRoster.length === 7 && cpuRun.roster.length === 7) {
      setLocalPhase("year1");
      setLocalTurn(null);
    } else {
      setLocalTurn("cpu");
    }
  }

  function beginCpuOffseason() {
    const left = footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.roster, year: 1 });
    const right = footballGmSeasonResultV2({ seed: cpuRun.seed, yearOneRoster: cpuRun.roster, roster: cpuRun.roster, year: 1 });
    let first: LocalTurn;
    if (FINISH_RANK[left.finish] !== FINISH_RANK[right.finish]) {
      first = FINISH_RANK[left.finish] < FINISH_RANK[right.finish] ? "user" : "cpu";
    } else {
      first = parseInt(run.seed.slice(-2), 16) % 2 === 0 ? "user" : "cpu";
    }
    setRun((current) => ({ ...current, phase: "offseason", finalRoster: [...current.roster] }));
    setCpuRun((current) => ({ ...current, phase: "offseason", finalRoster: [...current.roster] }));
    setLocalOffseasonFirst(first);
    setLocalPhase("offseason");
    setLocalTurn(first);
  }

  function patch(next: Partial<PersistedRun>) {
    setRun((current) => ({ ...current, ...next }));
  }

  function spinFreeAgency() {
    if (!canUseFreeAgency || faWheelSpinning || run.pendingFreeAgentTeam) return;
    const teamCode = footballGmSpinTeam(
      `${run.seed}:free-agency`,
      run.freeAgentSpinIndex,
      freeAgencyTeamCodes,
    );
    if (!teamCode) {
      patch({ tradeMessage: "No legal 1YR free agent fits the remaining shared market and both future caps." });
      return;
    }
    const index = freeAgencyWheelTeams.findIndex((team) => team.code === teamCode);
    if (index < 0 || !freeAgencyWheelTeams.length) {
      patch({ pendingFreeAgentTeam: teamCode, tradeMessage: "" });
      return;
    }

    const step = 360 / freeAgencyWheelTeams.length;
    setFaWheelSpinning(true);
    setFaWheelRotation((current) => {
      const modulo = ((current % 360) + 360) % 360;
      const target = ((-index * step) % 360 + 360) % 360;
      return current + 1080 + ((target - modulo + 360) % 360);
    });
    window.setTimeout(() => {
      setFaWheelSpinning(false);
      patch({ pendingFreeAgentTeam: teamCode, tradeMessage: "" });
    }, 1550);
  }

  function makeFreeAgentPick(playerId: string, slot: FootballGmRosterSlot, displacedPlayerId?: string) {
    if (!run.pendingFreeAgentTeam || exclusionIds.includes(playerId)) return;
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
      excludedPlayerIds: exclusionIds,
    });
    if (!next) {
      patch({ tradeMessage: "That signing is no longer legal." });
      return;
    }
    const displaced = displacedPlayerId ? footballGmPlayerById(displacedPlayerId) : null;
    patch({
      finalRoster: [...next.roster],
      tradeChipPlayerIds: [...next.tradeChipPlayerIds],
      previousFreeAgentTeam: run.pendingFreeAgentTeam,
      pendingFreeAgentTeam: null,
      freeAgentSpinIndex: run.freeAgentSpinIndex + 1,
      tradeMessage: displaced ? `${displaced.name} is now a trade asset.` : `${player.name} signed.`,
    });
  }

  function releaseToFreeAgency(playerId: string) {
    if (run.voluntaryFreeAgencyUsed || run.tradeChipPlayerIds.length || run.finalRoster.length !== 7) return;
    const player = footballGmPlayerById(playerId);
    if (!player) return;
    const stripped = run.finalRoster.filter((entry) => entry.playerId !== playerId);
    const eligible = footballGmEligibleFreeAgencyTeams({
      roster: stripped,
      seed: run.seed,
      consequences: run.negotiationConsequences,
      excludedPlayerIds: [...exclusionIds, playerId],
    });
    if (!eligible.length) {
      patch({ tradeMessage: `Releasing ${player.name} does not create a legal free-agency path.` });
      return;
    }
    patch({
      finalRoster: stripped,
      voluntaryFreeAgencyUsed: true,
      releasedFreeAgentPlayerId: playerId,
      pendingFreeAgentTeam: null,
      previousFreeAgentTeam: null,
      tradeMessage: `${player.name} released. Fill the opening through free agency.`,
    });
    setShowReleasePicker(false);
    setReleasePlayerId(null);
  }

  function beginTrade(playerId: string) {
    const held = run.finalRoster.some((entry) => entry.playerId === playerId) || run.tradeChipPlayerIds.includes(playerId);
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
    const nextSalary = footballGmAdjustedSalaryForPlayer(anchor, 2, run.seed, nextConsequences);
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
        ? `${prefix} ${anchor.name}'s new price is ${footballGmMoney(nextSalary)}.`
        : `${prefix} ${anchor.name}'s 3YR salary stays locked.`,
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
      excludedPlayerIds: opponentHeldIds,
      maxOffers: 5,
    });
    const offer = offers.find((candidate) => compareProposal(candidate.proposal, proposal));
    if (!offer) {
      patch({ tradeMessage: "That asking price is no longer available." });
      return;
    }
    const common = {
      previousTradePartner: run.tradePartnerTeam,
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
          partnerTeam: run.tradePartnerTeam,
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
        tradeMessage: `Choose ${offer.evaluation.requiresCuts} cut${offer.evaluation.requiresCuts === 1 ? "" : "s"} to finish the trade.`,
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

  function togglePendingCut(playerId: string) {
    const pending = run.pendingTradeResolution;
    if (!pending || playerId === pending.targetPlayerId || !pending.postTradePlayerIds.includes(playerId)) return;
    const cutPlayerIds = pending.cutPlayerIds.includes(playerId)
      ? pending.cutPlayerIds.filter((value) => value !== playerId)
      : pending.cutPlayerIds.length < pending.requiredCuts
        ? [...pending.cutPlayerIds, playerId]
        : pending.cutPlayerIds;
    patch({ pendingTradeResolution: { ...pending, cutPlayerIds }, tradeMessage: "" });
  }

  function finalizeTradeCuts() {
    const pending = run.pendingTradeResolution;
    if (!pending || pending.cutPlayerIds.length !== pending.requiredCuts || pending.cutPlayerIds.includes(pending.targetPlayerId)) return;
    const next = footballGmResolveTradeAssets({
      roster: run.finalRoster,
      tradeChipPlayerIds: run.tradeChipPlayerIds,
      proposal: pending.proposal,
      cutPlayerIds: pending.cutPlayerIds,
    });
    if (!next) {
      patch({ tradeMessage: "Those cuts do not leave a legal core." });
      return;
    }
    patch({
      finalRoster: [...next.roster],
      tradeChipPlayerIds: [...next.tradeChipPlayerIds],
      pendingTradeResolution: null,
      tradeMessage: "Trade finalized.",
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
      tradeMessage: player ? `${player.name} released. Free agency is open again.` : "Trade asset released.",
    });
  }

  async function finishOffseason() {
    const ready = footballGmIsOffseasonCompliantV2(
      run.finalRoster,
      run.seed,
      run.negotiationConsequences,
      run.tradeChipPlayerIds,
    );
    if (!ready) return;
    if (mode === "human") {
      if (!repository || !remote) return;
      try {
        const next = await repository.finishOffseason(remote.code, run);
        setRemote(next);
        humanHydratedRef.current = false;
      } catch (reason) {
        setRemoteError(reason instanceof Error ? reason.message : "The offseason could not be locked.");
      }
      return;
    }

    setUserOffseasonDone(true);
    if (cpuOffseasonDone) {
      setLocalPhase("complete");
      setLocalTurn(null);
    } else {
      setLocalTurn("cpu");
    }
  }

  function replay() {
    navigate("/football/gm-mode", { replace: true });
    setMode(null);
    setShowModePicker(false);
    setRemote(null);
    setRemoteError("");
    const seed = freshSeed();
    setRun(initialRun(seed));
    setCpuRun(initialRun(seed));
    setLocalPhase("draft");
    setLocalTurn(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (mode === "human" && matchCode && remoteError && !remote) {
    return (
      <div className="page football-gm-page">
        <section className="surface-card"><h1>The GM match unavailable</h1><p>{remoteError}</p></section>
      </div>
    );
  }

  const intro = !matchCode && !mode && !showModePicker;
  const modePicker = !matchCode && !mode && showModePicker;
  const offseasonReady = footballGmIsOffseasonCompliantV2(
    run.finalRoster,
    run.seed,
    run.negotiationConsequences,
    run.tradeChipPlayerIds,
  );

  let humanFirstName: string | null = null;
  if (remote?.offseason_first_profile_id) {
    humanFirstName = remote.participants.find((row) => row.id === remote.offseason_first_profile_id)?.display_name ?? null;
  }

  const cpuYear1Left = mode === "cpu" && run.roster.length === 7
    ? footballGmSeasonResultV2({ seed: run.seed, yearOneRoster: run.roster, roster: run.roster, year: 1 })
    : null;
  const cpuYear1Right = mode === "cpu" && cpuRun.roster.length === 7
    ? footballGmSeasonResultV2({ seed: cpuRun.seed, yearOneRoster: cpuRun.roster, roster: cpuRun.roster, year: 1 })
    : null;
  const cpuPriorityName = localOffseasonFirst === "user"
    ? myDisplayName
    : localOffseasonFirst === "cpu"
      ? "CPU"
      : cpuYear1Left && cpuYear1Right
        ? (
            FINISH_RANK[cpuYear1Left.finish] < FINISH_RANK[cpuYear1Right.finish]
              ? myDisplayName
              : FINISH_RANK[cpuYear1Right.finish] < FINISH_RANK[cpuYear1Left.finish]
                ? "CPU"
                : null
          )
        : null;

  return (
    <div className="page football-gm-page football-gm-h2h">
      <header className="football-gm__header">
        <button type="button" onClick={() => navigate("/football")}>← FOOTBALL HQ</button>
        <span><small>OWNER PLAYTEST</small><strong>THE GM</strong></span>
        <b>3 YEARS</b>
      </header>

      {intro ? (
        <section className="football-gm__intro surface-card">
          <p className="eyebrow">NFL FRONT OFFICE CHALLENGE</p>
          <h1>BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.</h1>
          <p className="football-gm__intro-lede">Build a 7-man NFL core under a {footballGmMoney(FOOTBALL_GM_CAP)} cap.</p>
          <div className="football-gm__intro-stages">
            <article><b>1</b><span><strong>DRAFT</strong><small>Spin a team. Pick one player. Fill all 7 spots.</small></span></article>
            <article><b>2</b><span><strong>OFFSEASON</strong><small>1YR deals reprice. Trade and use free agency to get under the cap.</small></span></article>
            <article><b>3</b><span><strong>3-YEAR RESULT</strong><small>Roster quality + continuity + playoff results determine your GM score.</small></span></article>
          </div>
          <div className="football-gm__intro-facts">
            <span>{footballGmMoney(FOOTBALL_GM_CAP)} CAP</span><span>1YR / 3YR CONTRACTS</span><span>HIDDEN GRADES</span>
          </div>
          <button className="primary-action" type="button" onClick={() => setShowModePicker(true)}>START THE DRAFT</button>
        </section>
      ) : null}

      {modePicker ? (
        <section className="football-gm__mode-picker surface-card">
          <p className="eyebrow">CHOOSE YOUR FRONT OFFICE MODE</p>
          <h1>HOW DO YOU WANT TO PLAY?</h1>
          <button className="football-gm__mode-option" type="button" onClick={resetLocal}>
            <span><small>PLAY NOW</small><strong>SOLO RUN</strong><em>The original standalone GM game. Build your roster, manage your offseason, and chase the best three-year score.</em></span>
            <b>PLAY →</b>
          </button>
          {opponentName ? (
            <button className="football-gm__mode-option" type="button" disabled={setupBusy} onClick={() => void createHumanMatch()}>
              <span><small>HEAD TO HEAD</small><strong>CHALLENGE {opponentName}</strong><em>Alternate every draft pick, then the worse Year 1 team gets the first full offseason.</em></span>
              <b>{setupBusy ? "SENDING…" : "SEND →"}</b>
            </button>
          ) : null}
          {status ? <p className="football-gm__status">{status}</p> : null}
          <button type="button" onClick={() => setShowModePicker(false)}>← BACK</button>
        </section>
      ) : null}

      {mode === "human" && remote?.phase === "waiting" ? (
        <WaitingCard
          title={remoteMe?.accepted && remoteOpponent?.accepted ? "SETTING THE DRAFT ORDER" : `WAITING FOR ${opponentDisplayName.toUpperCase()}`}
          copy="The draft starts as soon as both GMs open the match. The first pick is randomized."
        />
      ) : null}

      {(mode === "cpu" || (mode === "human" && remote && remote.phase !== "waiting")) ? (
        <>
          <VersusRosterBoard
            leftName={myDisplayName}
            rightName={opponentDisplayName}
            leftRun={run}
            rightRun={opponentRun}
            phase={displayedPhase}
            activeSide={activeSide}
          />

          {displayedPhase === "draft" ? (
            <>
              <div className="football-gm__draft-context">
                <span>{isMyTurn ? `YOUR PICK · ${run.roster.length + 1}/7` : `${opponentDisplayName.toUpperCase()}'S PICK`}</span>
                <strong>{isMyTurn ? footballGmOpenSlots(run.roster).join(" · ") : "WATCH THE BOARD UPDATE LIVE"}</strong>
              </div>
              <GmFootballWheel
                teams={draftWheelTeams}
                rotation={wheelRotation}
                spinning={wheelSpinning}
                pendingTeam={pendingTeam}
                canSpin={Boolean(isMyTurn && !pendingTeamCode && draftWheelTeams.length)}
                onSpin={() => void spinDraft()}
              />
              {isMyTurn && pendingTeamCode ? (
                <CandidateBoard
                  teamCode={pendingTeamCode}
                  roster={run.roster}
                  year={1}
                  excludedPlayerIds={opponentHeldIds}
                  onPick={(playerId, slot) => void makeDraftPick(playerId, slot)}
                />
              ) : !isMyTurn ? (
                <WaitingCard title={`${opponentDisplayName.toUpperCase()} IS ON THE CLOCK`} copy="Their pick locks that player out of your shared draft pool." />
              ) : null}
            </>
          ) : null}

          {displayedPhase === "year1" ? (
            <YearOneMatchup
              leftName={myDisplayName}
              rightName={opponentDisplayName}
              leftRun={run}
              rightRun={opponentRun}
              firstName={mode === "human" ? humanFirstName : cpuPriorityName}
              waiting={mode === "human"}
              onContinue={mode === "cpu" ? beginCpuOffseason : undefined}
            />
          ) : null}

          {displayedPhase === "offseason" ? (
            isMyTurn ? (
              <div className="football-gm__front-office">
                <FrontOfficeSummary run={run} isReady={offseasonReady} />
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
                  <TradeCutResolution run={run} onToggleCut={togglePendingCut} onFinalize={finalizeTradeCuts} />
                ) : run.tradeAnchorPlayerId ? (
                  <TradeRoom
                    run={run}
                    patch={patch}
                    onAccept={acceptTrade}
                    onEndTalks={() => applyShoppingConsequence("Talks ended.")}
                    excludedPlayerIds={opponentHeldIds}
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
                        excludedPlayerIds={exclusionIds}
                        sharedMarket
                        onPick={makeFreeAgentPick}
                      />
                    ) : canUseFreeAgency ? (
                      <section className="football-gm__market-wheel">
                        <div className="football-gm__trade-stage-heading">
                          <p className="eyebrow">FREE AGENCY · {footballGmOpenSlots(run.finalRoster).join(" · ")} OPEN</p>
                          <h2>SPIN THE 1YR MARKET</h2>
                          <span>Same NFL wheel. Players already held by {opponentDisplayName} are off the board.</span>
                        </div>
                        <GmFootballWheel
                          teams={freeAgencyWheelTeams}
                          rotation={faWheelRotation}
                          spinning={faWheelSpinning}
                          pendingTeam={pendingFreeAgencyTeam}
                          canSpin={!faWheelSpinning && !run.pendingFreeAgentTeam && freeAgencyWheelTeams.length > 0}
                          onSpin={spinFreeAgency}
                        />
                      </section>
                    ) : (
                      <section className="football-gm__front-office-actions surface-card">
                        <button
                          type="button"
                          disabled={run.voluntaryFreeAgencyUsed || Boolean(run.tradeChipPlayerIds.length)}
                          onClick={() => setShowReleasePicker(true)}
                        >
                          <small>{run.voluntaryFreeAgencyUsed ? "USED" : "ONE AVAILABLE"}</small>
                          <strong>RELEASE PLAYER</strong>
                        </button>
                        <button className="primary-action" type="button" disabled={!offseasonReady} onClick={() => void finishOffseason()}>
                          FINISH OFFSEASON
                        </button>
                      </section>
                    )}

                    {showReleasePicker && !run.voluntaryFreeAgencyUsed ? (
                      <ReleasePicker
                        run={run}
                        excludedPlayerIds={opponentHeldIds}
                        selectedPlayerId={releasePlayerId}
                        onSelect={setReleasePlayerId}
                        onClose={() => { setShowReleasePicker(false); setReleasePlayerId(null); }}
                        onRelease={releaseToFreeAgency}
                      />
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <WaitingCard
                title={mode === "human" ? `${opponentDisplayName.toUpperCase()} HAS THE FRONT OFFICE` : "CPU IS IN THE FRONT OFFICE"}
                copy={mode === "human"
                  ? "They get their entire offseason first. Their completed moves remove players from the market you will inherit."
                  : "The CPU is completing its entire offseason. You get the remaining shared market when it finishes."}
              />
            )
          ) : null}

          {displayedPhase === "complete" ? (
            <FinalMatch
              leftName={myDisplayName}
              rightName={opponentDisplayName}
              leftRun={run}
              rightRun={opponentRun}
              onReplay={replay}
            />
          ) : null}
        </>
      ) : null}

      {remoteError ? <p className="football-gm__status" role="status">{remoteError}</p> : null}
    </div>
  );
}
