import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  FOOTBALL_HIT_THE_NUMBER_GAME_ID,
  createFootballHitTheNumberPlan,
  createFootballHitTheNumberRun,
  footballHitTheNumberActiveProgressionSlot,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberBoardType,
  type FootballHitTheNumberPlan,
  type FootballHitTheNumberResult,
  type FootballHitTheNumberRun,
} from "./footballHitTheNumberModel";
import { footballHitTheNumberPeakSeasons } from "./footballHitTheNumberPeakSeasonContext";
import {
  FootballHitTheNumberPresentation,
  footballHitNumberTheme,
} from "./FootballHitTheNumberPresentation";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

function boardType(value: string | null): FootballHitTheNumberBoardType | null {
  return value === "open-roster" || value === "random-pool" ? value : null;
}

function isSlotProgression(plan: FootballHitTheNumberPlan) {
  return plan.formatId === "one-from-each" || plan.formatId === "build-the-team";
}

function subjectDisplayName(subject: NonNullable<ReturnType<typeof getFootballHitTheNumberSubject>>) {
  if (subject.kind !== "team-season" || subject.season == null) return subject.name;
  return subject.name.replace(new RegExp(`^${subject.season}\\s+`), "");
}

function subjectDisplaySubtitle(
  subject: NonNullable<ReturnType<typeof getFootballHitTheNumberSubject>>,
  metricId: FootballHitTheNumberPlan["metricId"],
) {
  if (subject.kind === "team-season" && subject.season != null) {
    return `${subject.season} season${subject.nationalChampion ? " · National champion" : ""}`;
  }
  if (subject.group === "cfb-player-peak" && metricId.startsWith("cfb-best-season-")) {
    const seasons = footballHitTheNumberPeakSeasons(subject.id, metricId);
    if (seasons.length > 0) {
      return `${subject.position ?? "Player"} · ${seasons.join("/")} peak college season${seasons.length > 1 ? "s" : ""}`;
    }
  }
  return subject.subtitle;
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
  const slotProgression = isSlotProgression(plan);
  const availableSubjectIds = availableProgressionSubjectIds(plan, selectedIds);
  const presentationCandidates = plan.subjectIds.map((subjectId) => {
    const subject = getFootballHitTheNumberSubject(subjectId)!;
    return {
      id: subjectId,
      name: subjectDisplayName(subject),
      subtitle: subjectDisplaySubtitle(subject, plan.metricId),
    };
  });

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
        if (slotProgression) {
          return current[current.length - 1] === subjectId ? current.slice(0, -1) : current;
        }
        return current.filter((id) => id !== subjectId);
      }
      if (current.length >= plan.pickCount) return current;
      if (slotProgression && !availableProgressionSubjectIds(plan, current).includes(subjectId)) return current;
      return [...current, subjectId];
    });
  }

  function rewindToSlot(slotIndex: number) {
    if (result || !slotProgression || slotIndex >= selectedIds.length) return;
    setSelectedIds((current) => current.slice(0, slotIndex));
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

  const resultActions = result ? (
    <GameResultActions
      onChallenge={() => void challengeSomeone()}
      onReplay={replay}
      onAllGames={() => navigate("/football")}
      replayLabel={shared ? "REPLAY CHALLENGE" : "NEW BOARD"}
      status={challengeStatus}
    />
  ) : null;

  return (
    <div
      className="page hit-number-page football-hit-number-page"
      data-challenge-id={run.identity.challengeId}
      data-format-id={plan.formatId}
      style={footballHitNumberTheme}
    >
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Hit the Number board.</strong>
          <small>Both locked totals reveal after you finish.</small>
        </section>
      ) : null}

      <FootballHitTheNumberPresentation
        target={plan.target}
        metricLabel={plan.metricLabel}
        league={plan.league}
        configurationLabel={plan.configurationLabel}
        pickCount={plan.pickCount}
        candidates={presentationCandidates}
        selectedIds={selectedIds}
        slots={plan.slots}
        activeSlotIndex={slotProgression && !result && selectedIds.length < plan.pickCount ? selectedIds.length : null}
        availableIds={slotProgression && !result ? availableSubjectIds : plan.subjectIds}
        values={result ? Object.fromEntries(plan.subjectIds.map((id) => [id, footballHitTheNumberValue(id, plan.metricId)])) : undefined}
        result={result}
        formatValue={(value) => formatFootballHitTheNumberValue(plan, value)}
        onBack={() => navigate("/football")}
        onNewBoard={!result && !shared ? startNew : null}
        onToggle={toggleSubject}
        onRewind={rewindToSlot}
        onLock={selectionValid ? lockPicks : null}
        resultActions={resultActions}
      />
    </div>
  );
}
