import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import {
  FOOTBALL_HIT_THE_NUMBER_GAME_ID,
  createFootballHitTheNumberPlan,
  createFootballHitTheNumberRun,
  footballHitTheNumberActiveBuildSlot,
  footballHitTheNumberAvailableBuildSubjectIds,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberBoardType,
  type FootballHitTheNumberResult,
  type FootballHitTheNumberRun,
} from "./footballHitTheNumberModel";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

function resultTitle(result: FootballHitTheNumberResult) {
  if (result.status === "perfect") return "PERFECT";
  if (result.status === "bust") return "BUST";
  return `${formatDistance(result.distance)} OFF`;
}

function formatDistance(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
}

function boardType(value: string | null): FootballHitTheNumberBoardType | null {
  return value === "open-roster" || value === "random-pool" ? value : null;
}

function resolveChallengeRun(
  seed: string | null,
  requestedBoardType: FootballHitTheNumberBoardType | null,
  challengeId: string,
): FootballHitTheNumberRun | null {
  if (!seed || !requestedBoardType) return null;
  try {
    const plan = createFootballHitTheNumberPlan(seed, requestedBoardType);
    return {
      plan,
      identity: footballCuratedIdentity(
        FOOTBALL_HIT_THE_NUMBER_GAME_ID,
        challengeId,
        [`${plan.domainId}:${plan.metricId}:${plan.formatId}:${plan.target}`],
        requestedBoardType,
        requestedBoardType === "random-pool" ? plan.subjectIds : [],
      ),
    };
  } catch {
    return null;
  }
}

export default function FootballHitTheNumberPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("hit-the-number");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profileSeed = challengeString(profileSetup?.seed);
  const profileBoardType = boardType(challengeString(profileSetup?.boardType));
  const querySeed = searchParams.get("seed");
  const queryBoardType = boardType(searchParams.get("board"));
  const sharedChallengeId = profileMatch.challenge?.code ?? `shared:${querySeed ?? "unknown"}:${queryBoardType ?? "unknown"}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profileSeed, profileBoardType, sharedChallengeId)
      ?? resolveChallengeRun(querySeed, queryBoardType, sharedChallengeId)
  ), [profileSeed, profileBoardType, querySeed, queryBoardType, sharedChallengeId]);
  const [run, setRun] = useState<FootballHitTheNumberRun>(() => sharedRun ?? createFootballHitTheNumberRun());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FootballHitTheNumberResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const plan = run.plan;
  const selectionValid = footballHitTheNumberSelectionSatisfies(plan, selectedIds);
  const shared = run.identity.type === "curated";
  const activeBuildSlot = footballHitTheNumberActiveBuildSlot(plan, selectedIds);
  const availableBuildSubjectIds = footballHitTheNumberAvailableBuildSubjectIds(plan, selectedIds);
  const displayedSubjectIds = result || plan.formatId !== "build-the-team"
    ? plan.subjectIds
    : [...selectedIds, ...availableBuildSubjectIds];

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    setRun(sharedRun);
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
  }, [run.identity.challengeId, sharedRun]);

  function toggleSubject(subjectId: string) {
    if (result) return;
    setSelectedIds((current) => {
      if (current.includes(subjectId)) {
        if (plan.formatId === "build-the-team") {
          return current[current.length - 1] === subjectId ? current.slice(0, -1) : current;
        }
        return current.filter((id) => id !== subjectId);
      }
      if (current.length >= plan.pickCount) return current;
      if (
        plan.formatId === "build-the-team"
        && !footballHitTheNumberAvailableBuildSubjectIds(plan, current).includes(subjectId)
      ) return current;
      return [...current, subjectId];
    });
  }

  function challengeResult(next: FootballHitTheNumberResult) {
    return {
      score: next.score,
      status: next.status,
      target: next.target,
      total: next.total,
      distance: next.distance,
      selections: next.selections.map((selection) => ({
        fighterId: selection.subjectId,
        name: getFootballHitTheNumberSubject(selection.subjectId)?.name ?? selection.subjectId,
        value: selection.value,
      })),
    };
  }

  function lockPicks() {
    if (!selectionValid || result) return;
    const next = gradeFootballHitTheNumberSelection(plan, selectedIds);
    const payload = challengeResult(next);
    recordLineupCompletion(run.identity, {
      ...payload,
      boardType: plan.boardType,
      league: plan.league,
      formatId: plan.formatId,
      domainId: plan.domainId,
      metricId: plan.metricId,
      selectedIds,
    });
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asChallengeJson(payload));
    }
    setResult(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setRun(createFootballHitTheNumberRun());
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replay() {
    if (shared) {
      setSelectedIds([]);
      setResult(null);
      setChallengeStatus("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      startNew();
    }
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "hit-the-number",
      gameVersion: "football-hit-the-number-v1",
      gameTitle: "Football Hit the Number",
      summary: `${plan.metricLabel} · target ${formatFootballHitTheNumberValue(plan, plan.target)}`,
      setup: asChallengeJson({
        seed: plan.seed,
        boardType: plan.boardType,
        target: plan.target,
        pickCount: plan.pickCount,
        metricId: plan.metricId,
        subjectIds: plan.subjectIds,
      }),
      creatorResult: asChallengeJson(challengeResult(result)),
      shareTitle: "Football Hit the Number Challenge",
      shareText: `I challenged you to the same Football Hit the Number board: pick ${plan.pickCount} and chase ${formatFootballHitTheNumberValue(plan, plan.target)} ${plan.metricLabel}.`,
      shareUrl: footballChallengeUrl("/football/hit-the-number", {
        seed: plan.seed,
        board: plan.boardType,
      }),
    });
    setChallengeStatus(status);
  }

  return (
    <div className="page football-debate-page football-hit-number-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Hit the Number board.</strong>
          <small>Both locked totals reveal after you finish.</small>
        </section>
      ) : null}
      <section className="football-hit-number-hero">
        <div>
          <p className="eyebrow">HIT THE NUMBER · FOOTBALL</p>
          <span>{plan.formatLabel.toUpperCase()} · {plan.league}</span>
          <h1>{formatFootballHitTheNumberValue(plan, plan.target)}</h1>
          <strong>{plan.metricLabel.toUpperCase()}</strong>
          <p>Pick {plan.pickCount}. Get as close as possible without going over. Go over the target and you bust.</p>
        </div>
        <aside>
          <small>BOARD</small>
          <b>{plan.domainLabel}</b>
          {plan.configurationLabel ? <em>{plan.configurationLabel}</em> : null}
        </aside>
      </section>

      {plan.slots.length ? (
        <section className="football-hit-number-rules" aria-label="Required lineup roles">
          <small>{plan.formatId === "one-from-each" ? "ONE FROM EACH" : "BUILD REQUIREMENTS"}</small>
          <div>
            {plan.slots.map((slot, index) => {
              const selectedSubject = selectedIds[index]
                ? getFootballHitTheNumberSubject(selectedIds[index]!)
                : null;
              const active = !result && plan.formatId === "build-the-team" && activeBuildSlot?.id === slot.id;
              return (
                <span key={slot.id}>
                  {active ? "NOW · " : ""}{slot.label}{selectedSubject ? ` · ${selectedSubject.name}` : ""}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}

      {result ? (
        <section className={`football-hit-number-result is-${result.status}`}>
          <p>{resultTitle(result)}</p>
          <strong>{formatFootballHitTheNumberValue(plan, result.total)}</strong>
          <span>TOTAL · TARGET {formatFootballHitTheNumberValue(plan, result.target)}</span>
          <div><small>SCORE</small><b>{result.score}<em>/100</em></b></div>
        </section>
      ) : (
        <section className="football-hit-number-selection">
          <span>{selectedIds.length} / {plan.pickCount} SELECTED</span>
          <strong>
            {activeBuildSlot
              ? `NOW: ${activeBuildSlot.label.toUpperCase()}`
              : "Stats stay hidden until you lock."}
          </strong>
        </section>
      )}

      <section className="football-hit-number-grid" aria-label="Football Hit the Number pool">
        {displayedSubjectIds.map((subjectId) => {
          const subject = getFootballHitTheNumberSubject(subjectId)!;
          const selected = selectedIds.includes(subjectId);
          const value = result ? footballHitTheNumberValue(subjectId, plan.metricId) : null;
          return (
            <button
              className={`${selected ? "is-selected" : ""}${result ? " is-revealed" : ""}`}
              type="button"
              aria-pressed={selected}
              disabled={Boolean(result)}
              onClick={() => toggleSubject(subjectId)}
              key={subjectId}
            >
              <small>{subject.subtitle}</small>
              <strong>{subject.name}</strong>
              <span>{result ? formatFootballHitTheNumberValue(plan, value!) : selected ? "SELECTED" : "TAP TO PICK"}</span>
            </button>
          );
        })}
      </section>

      {!result ? (
        <div className="football-hit-number-lock">
          <button type="button" disabled={!selectionValid} onClick={lockPicks}>
            {selectedIds.length < plan.pickCount
              ? `${selectedIds.length}/${plan.pickCount} SELECTED`
              : selectionValid
                ? "LOCK PICKS"
                : "FILL EVERY REQUIRED ROLE"}
          </button>
        </div>
      ) : (
        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={replay}
          onAllGames={() => navigate("/football")}
          replayLabel={replayLabelFor(run.identity.type)}
          status={challengeStatus}
        />
      )}
    </div>
  );
}
