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
  FOOTBALL_GM_VERSION,
  footballGmCandidatesForTeam,
  footballGmEligibleReplacementTeams,
  footballGmEligibleTeams,
  footballGmFinalResult,
  footballGmIsOffseasonCompliant,
  footballGmMoney,
  footballGmOpenSlots,
  footballGmPlayerById,
  footballGmReplacementCandidatesForTeam,
  footballGmReplacePlayer,
  footballGmRosterCap,
  footballGmRosterPlayers,
  footballGmSeasonResult,
  footballGmSpinTeam,
  footballGmTradeOffers,
  type FootballGmFinalResult,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
  type FootballGmTeamCandidate,
} from "./footballGmEngine";
import {
  footballGmPlaytestOpponentName,
  isFootballGmPlaytestProfile,
} from "./footballGmAccess";

type Phase = "intro" | "draft" | "year1" | "offseason" | "years23" | "final";

interface PersistedRun {
  version: string;
  seed: string;
  phase: Phase;
  roster: FootballGmRosterEntry[];
  finalRoster: FootballGmRosterEntry[];
  spinIndex: number;
  previousTeam: string | null;
  pendingTeam: string | null;
  replaceSlot: FootballGmRosterSlot | null;
  offseasonSpinIndex: number;
  offseasonPendingTeam: string | null;
  acceptedTradeIds: string[];
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
    replaceSlot: null,
    offseasonSpinIndex: 0,
    offseasonPendingTeam: null,
    acceptedTradeIds: [],
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
  const replacementCandidates = run.replaceSlot && run.offseasonPendingTeam
    ? footballGmReplacementCandidatesForTeam({
        team: run.offseasonPendingTeam,
        roster: run.finalRoster,
        slot: run.replaceSlot,
      }).map(auditCandidate)
    : [];
  const offers = run.roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
    ? footballGmTradeOffers(run.seed, run.roster)
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
      year2: footballGmRosterCap(effectiveFinalRoster, 2),
      year3: footballGmRosterCap(effectiveFinalRoster, 3),
    },
    roster: auditRoster(run.roster),
    finalRoster: auditRoster(run.finalRoster),
    pendingDraft: run.pendingTeam
      ? { team: run.pendingTeam, candidates: draftCandidates }
      : null,
    pendingReplacement: run.replaceSlot
      ? {
          slot: run.replaceSlot,
          team: run.offseasonPendingTeam,
          candidates: replacementCandidates,
        }
      : null,
    tradeOffers: offers.map((offer) => ({
      ...offer,
      outgoing: auditPlayer(offer.outgoingPlayerId),
      incoming: auditPlayer(offer.incomingPlayerId),
      accepted: run.acceptedTradeIds.includes(offer.id),
    })),
    seasons: {
      year1: run.roster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResult(run.roster, 1)
        : null,
      year2: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResult(run.finalRoster, 2)
        : null,
      year3: run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
        ? footballGmSeasonResult(run.finalRoster, 3)
        : null,
    },
    finalResult: run.phase === "final" && run.finalRoster.length === FOOTBALL_GM_ROSTER_SLOTS.length
      ? footballGmFinalResult(run.roster, run.finalRoster)
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

function CapMeter({ roster, year }: { roster: readonly FootballGmRosterEntry[]; year: 1 | 2 | 3 }) {
  const spent = footballGmRosterCap(roster, year);
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
  showFutureSalary = false,
  onReplace,
}: {
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2 | 3;
  showFutureSalary?: boolean;
  onReplace?: (slot: FootballGmRosterSlot) => void;
}) {
  const bySlot = new Map(roster.map((entry) => [entry.slot, entry]));
  return (
    <section className="football-gm__roster surface-card">
      <header><span><small>YOUR TEAM</small><strong>7-MAN CORE</strong></span><b>{roster.length}/7</b></header>
      <div className="football-gm__roster-grid">
        {FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
          const entry = bySlot.get(slot);
          const player = entry ? footballGmPlayerById(entry.playerId) : null;
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
                    <b>{footballGmMoney(player.salaryWindow[year - 1])}</b>
                    <span>{showFutureSalary ? "Y2/Y3" : player.gameContract}</span>
                  </div>
                  {onReplace ? <button type="button" onClick={() => onReplace(slot)}>REPLACE</button> : null}
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
  candidates: suppliedCandidates,
}: {
  teamCode: string;
  roster: readonly FootballGmRosterEntry[];
  year: 1 | 2;
  onPick: (playerId: string, slot: FootballGmRosterSlot) => void;
  candidates?: readonly FootballGmTeamCandidate[];
}) {
  const team = wheelFootballTeam(teamCode);
  const candidates = suppliedCandidates ?? footballGmCandidatesForTeam({ team: teamCode, roster, year });
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

function SeasonCard({ year, roster }: { year: 1 | 2 | 3; roster: readonly FootballGmRosterEntry[] }) {
  const result = footballGmSeasonResult(roster, year);
  return (
    <article className="football-gm__season-card">
      <small>YEAR {year}</small>
      <strong>{result.teamGrade.toFixed(1)}</strong>
      <span>TEAM GRADE</span>
      <b>{result.finish}</b>
    </article>
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
  result: FootballGmFinalResult;
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
    () => run.phase === "final" ? footballGmFinalResult(yearOneRoster, finalRoster) : null,
    [finalRoster, run.phase, yearOneRoster],
  );
  const tradeOffers = useMemo(
    () => run.roster.length === 7 ? footballGmTradeOffers(run.seed, run.roster) : [],
    [run.roster, run.seed],
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

  function beginReplacement(slot: FootballGmRosterSlot) {
    patch({
      replaceSlot: slot,
      offseasonPendingTeam: null,
    });
  }

  function spinReplacement() {
    if (!run.replaceSlot) return;
    const teams = footballGmEligibleReplacementTeams({
      roster: run.finalRoster,
      slot: run.replaceSlot,
    });
    const team = footballGmSpinTeam(run.seed, 100 + run.offseasonSpinIndex, teams);
    if (!team) return;
    patch({ offseasonPendingTeam: team });
  }

  function makeReplacement(playerId: string, slot: FootballGmRosterSlot) {
    if (!run.replaceSlot || slot !== run.replaceSlot) return;
    try {
      const next = footballGmReplacePlayer(run.finalRoster, slot, playerId, "replacement");
      patch({
        finalRoster: next,
        replaceSlot: null,
        offseasonPendingTeam: null,
        offseasonSpinIndex: run.offseasonSpinIndex + 1,
      });
    } catch {
      // Candidate legality can change only if the local roster changed between render and click.
    }
  }

  function acceptTrade(offerId: string) {
    const offer = tradeOffers.find((item) => item.id === offerId);
    if (!offer || run.acceptedTradeIds.includes(offer.id)) return;
    const outgoingStillRostered = run.finalRoster.some(
      (entry) => entry.slot === offer.slot && entry.playerId === offer.outgoingPlayerId,
    );
    if (!outgoingStillRostered) return;
    try {
      const next = footballGmReplacePlayer(run.finalRoster, offer.slot, offer.incomingPlayerId, "trade");
      patch({
        finalRoster: next,
        acceptedTradeIds: [...run.acceptedTradeIds, offer.id],
      });
    } catch {
      // An accepted earlier move can make a later stored offer illegal.
    }
  }

  async function challengeOpponent() {
    if (!finalResult || !opponentName) return;
    setChallengeStatus("");
    const url = new URL("/football/gm-mode", window.location.origin);
    const status = await challenges.beginChallenge({
      gameId: "gm-football",
      gameVersion: FOOTBALL_GM_VERSION,
      gameTitle: "The GM",
      summary: "NFL · 3 years · $155M cap · one offseason",
      setup: asJson({
        version: FOOTBALL_GM_VERSION,
        seed: run.seed,
        cap: FOOTBALL_GM_CAP,
        rosterSlots: [...FOOTBALL_GM_ROSTER_SLOTS],
      }),
      creatorResult: asJson(finalResult),
      shareTitle: "The GM Challenge",
      shareText: `I challenged you to The GM. Build a seven-player NFL core under the $155M cap and beat my three-year score.`,
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
          <p>Spin an NFL team, sign one legal player from that team, and build a seven-man core under a $155M cap.</p>
          <div className="football-gm__rules">
            <span><b>7</b><small>QB · RB · WR · FLEX · DL · LB · DB</small></span>
            <span><b>1YR / 3YR</b><small>One-year deals reprice after Year 1. Three-year deals stay locked.</small></span>
            <span><b>1</b><small>One offseason to fix the cap before Years 2 and 3.</small></span>
          </div>
          <p className="football-gm__intro-note">Exact player grades and future salaries stay hidden during the draft. You see contract risk and three-year outlook instead.</p>
          <button className="primary-action" type="button" onClick={() => patch({ phase: "draft" })}>START THE DRAFT</button>
        </section>
      ) : null}

      {run.phase === "draft" ? (
        <>
          <CapMeter roster={run.roster} year={1} />
          <RosterGrid roster={run.roster} year={1} />
          {run.pendingTeam ? (
            <CandidateBoard teamCode={run.pendingTeam} roster={run.roster} year={1} onPick={makeDraftPick} />
          ) : (
            <section className="football-gm__wheel surface-card">
              <p className="eyebrow">ROUND {run.roster.length + 1} OF 7</p>
              <h2>{footballGmOpenSlots(run.roster).join(" · ")}</h2>
              <p>Only teams with at least one legal player who fits your remaining cap are on the wheel.</p>
              <button className="primary-action" type="button" onClick={spinDraft}>SPIN THE NFL WHEEL</button>
            </section>
          )}
        </>
      ) : null}

      {run.phase === "year1" ? (
        <>
          <CapMeter roster={run.roster} year={1} />
          <RosterGrid roster={run.roster} year={1} />
          <section className="football-gm__year-reveal surface-card">
            <p className="eyebrow">YEAR 1 COMPLETE</p>
            <SeasonCard year={1} roster={run.roster} />
            <p>Now every 1YR contract hits the market. This is the only offseason you get.</p>
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
            <CapMeter roster={run.finalRoster} year={2} />
            <CapMeter roster={run.finalRoster} year={3} />
          </div>
          <RosterGrid roster={run.finalRoster} year={2} showFutureSalary onReplace={beginReplacement} />

          {run.replaceSlot ? (
            run.offseasonPendingTeam ? (
              <CandidateBoard
                teamCode={run.offseasonPendingTeam}
                roster={run.finalRoster}
                year={2}
                candidates={footballGmReplacementCandidatesForTeam({
                  team: run.offseasonPendingTeam,
                  roster: run.finalRoster,
                  slot: run.replaceSlot,
                })}
                onPick={makeReplacement}
              />
            ) : (
              <section className="football-gm__wheel surface-card">
                <p className="eyebrow">REPLACE {run.replaceSlot}</p>
                <h2>SPIN FOR A NEW OPTION</h2>
                <p>The replacement must keep both remaining seasons cap-legal.</p>
                <div className="football-gm__inline-actions">
                  <button className="primary-action" type="button" onClick={spinReplacement}>SPIN THE NFL WHEEL</button>
                  <button type="button" onClick={() => patch({ replaceSlot: null })}>KEEP CURRENT PLAYER</button>
                </div>
              </section>
            )
          ) : null}

          {!run.replaceSlot && tradeOffers.length ? (
            <section className="football-gm__trades surface-card">
              <header><span><small>CPU TRADE CALLS</small><strong>UP TO TWO OFFERS</strong></span></header>
              {tradeOffers.map((offer) => {
                const outgoing = footballGmPlayerById(offer.outgoingPlayerId);
                const incoming = footballGmPlayerById(offer.incomingPlayerId);
                const accepted = run.acceptedTradeIds.includes(offer.id);
                const stillAvailable = run.finalRoster.some(
                  (entry) => entry.slot === offer.slot && entry.playerId === offer.outgoingPlayerId,
                );
                if (!outgoing || !incoming) return null;
                return (
                  <article key={offer.id}>
                    <div><small>{offer.slot} TRADE</small><strong>{outgoing.name} → {incoming.name}</strong><span>{incoming.team} · saves {footballGmMoney(offer.yearTwoSavings)} in Year 2</span></div>
                    <button type="button" disabled={accepted || !stillAvailable} onClick={() => acceptTrade(offer.id)}>
                      {accepted ? "ACCEPTED" : stillAvailable ? "ACCEPT" : "NO LONGER AVAILABLE"}
                    </button>
                  </article>
                );
              })}
            </section>
          ) : null}

          {!run.replaceSlot ? (
            <section className={`football-gm__offseason-status surface-card${footballGmIsOffseasonCompliant(run.finalRoster) ? " is-ready" : " is-crisis"}`}>
              <p className="eyebrow">{footballGmIsOffseasonCompliant(run.finalRoster) ? "CAP COMPLIANT" : "CAP CRISIS"}</p>
              <h2>{footballGmIsOffseasonCompliant(run.finalRoster) ? "YOU CAN MOVE FORWARD" : "YOU HAVE MOVES TO MAKE"}</h2>
              <p>Years 2 and 3 must both fit under the $155M cap.</p>
              <button
                className="primary-action"
                type="button"
                disabled={!footballGmIsOffseasonCompliant(run.finalRoster)}
                onClick={() => patch({ phase: "years23" })}
              >SIMULATE YEARS 2 & 3</button>
            </section>
          ) : null}
        </>
      ) : null}

      {run.phase === "years23" ? (
        <section className="football-gm__years23 surface-card">
          <p className="eyebrow">THE WINDOW</p>
          <h1>YEARS 2 & 3</h1>
          <div className="football-gm__season-grid">
            <SeasonCard year={2} roster={run.finalRoster} />
            <SeasonCard year={3} roster={run.finalRoster} />
          </div>
          <p>No second offseason. The roster you built has to carry the full three-year window.</p>
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
