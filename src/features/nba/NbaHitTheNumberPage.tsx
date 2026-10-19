import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { FootballHitTheNumberPresentation, footballHitNumberTheme } from "../back-room/FootballHitTheNumberPresentation";
import { GameResultActions } from "../play/GameResultActions";
import { curatedLineupIdentity, recordLineupCompletion } from "../play/lineupModel";
import { asChallengeJson, challengeRecord, challengeString } from "../back-room/footballChallengeRuntime";
import {
  NBA_HIT_THE_NUMBER_GAME_ID,
  NBA_HIT_THE_NUMBER_VERSION,
  createNbaHitTheNumberPlan,
  createNbaHitTheNumberRun,
  formatNbaHitTheNumberValue,
  getNbaHitTheNumberSubject,
  gradeNbaHitTheNumberSelection,
  nbaHitTheNumberAvailableProgressionSubjectIds,
  nbaHitTheNumberSelectionSatisfies,
  nbaHitTheNumberValue,
  type NbaHitNumberBoardType,
  type NbaHitNumberResult,
  type NbaHitNumberRun,
} from "./nbaHitTheNumberModel";

const nbaHitNumberTheme: CSSProperties = {
  ...footballHitNumberTheme,
  "--football-accent": "#f2a341",
  "--football-accent-rgb": "242, 163, 65",
} as CSSProperties;

function boardType(value: string | null): NbaHitNumberBoardType | null {
  return value === "random-pool" || value === "open-roster" ? value : null;
}
function restoredRun(seed: string | null, mode: NbaHitNumberBoardType | null, challengeId: string): NbaHitNumberRun | null {
  if (!seed || !mode) return null;
  try {
    const plan = createNbaHitTheNumberPlan(seed, mode);
    return {
      plan,
      identity: curatedLineupIdentity(NBA_HIT_THE_NUMBER_GAME_ID, challengeId, [
        plan.metricId, plan.formatId, String(plan.target), ...plan.subjectIds,
      ], "nba-hit-the-number-challenge"),
    };
  } catch {
    return null;
  }
}
export default function NbaHitTheNumberPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const match = useProfileChallengeMatch("hit-the-number");
  const storedSetup = challengeRecord(match.challenge?.setup);
  const profileSeed = challengeString(storedSetup?.seed);
  const profileMode = boardType(challengeString(storedSetup?.boardType));
  const querySeed = searchParams.get("seed");
  const queryMode = boardType(searchParams.get("board"));
  const challengeId = match.challenge?.code ?? `nba-shared:${querySeed ?? "unknown"}:${queryMode ?? "unknown"}`;
  const sharedRun = useMemo(() =>
    restoredRun(profileSeed, profileMode, challengeId)
      ?? restoredRun(querySeed, queryMode, challengeId),
  [profileSeed, profileMode, querySeed, queryMode, challengeId]);
  const [run, setRun] = useState<NbaHitNumberRun>(() => sharedRun ?? createNbaHitTheNumberRun());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<NbaHitNumberResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const plan = run.plan;
  const shared = run.identity.type === "curated";
  const progression = plan.slots.length > 0;
  const allowedIds = progression && !result ? nbaHitTheNumberAvailableProgressionSubjectIds(plan, selectedIds) : plan.subjectIds;
  const validSelection = nbaHitTheNumberSelectionSatisfies(plan, selectedIds);
  const candidates = plan.subjectIds.map((id) => {
    const subject = getNbaHitTheNumberSubject(id)!;
    return {
      id,
      name: subject.name,
      // Season is part of the identity: never hide or truncate the year.
      subtitle: subject.scope === "season" ? `${subject.season} season · ${subject.position}` : `NBA career · ${subject.position}`,
    };
  });

  useEffect(() => {
    if (!sharedRun || sharedRun.identity.challengeId === run.identity.challengeId) return;
    setRun(sharedRun);
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
  }, [sharedRun, run.identity.challengeId]);

  function toggleSubject(id: string) {
    if (result) return;
    setSelectedIds((current) => {
      if (current.includes(id)) return progression
        ? current[current.length - 1] === id ? current.slice(0, -1) : current
        : current.filter((subjectId) => subjectId !== id);
      if (current.length >= plan.pickCount || !plan.subjectIds.includes(id)) return current;
      if (progression && !nbaHitTheNumberAvailableProgressionSubjectIds(plan, current).includes(id)) return current;
      return [...current, id];
    });
  }
  function rewind(index: number) {
    if (result || !progression || index >= selectedIds.length) return;
    setSelectedIds((ids) => ids.slice(0, index));
  }
  function resultPayload(value: NbaHitNumberResult) {
    return {
      score: value.score, status: value.status, target: value.target, total: value.total,
      distance: value.distance,
      selections: value.selections.map((selection) => ({
        fighterId: selection.subjectId,
        name: getNbaHitTheNumberSubject(selection.subjectId)?.name ?? selection.subjectId,
        value: selection.value,
      })),
    };
  }
  function lock() {
    if (!validSelection || result) return;
    const graded = gradeNbaHitTheNumberSelection(plan, selectedIds);
    const payload = resultPayload(graded);
    recordLineupCompletion(run.identity, {
      ...payload,
      boardType: plan.boardType,
      league: "NBA",
      formatId: plan.formatId,
      domainId: plan.domainId,
      metricId: plan.metricId,
      selectedIds,
    });
    if (match.isRecipient && match.challenge?.responderResult === null) {
      match.submitResult(asChallengeJson(payload));
    }
    setResult(graded);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function newBoard() {
    setRun(createNbaHitTheNumberRun());
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function replay() {
    if (!shared) { newBoard(); return; }
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const url = new URL("/nba/hit-the-number", window.location.origin);
    url.searchParams.set("seed", plan.seed);
    url.searchParams.set("board", plan.boardType);
    const status = await beginChallenge({
      gameId: "hit-the-number",
      gameVersion: NBA_HIT_THE_NUMBER_VERSION,
      gameTitle: "NBA Hit the Number",
      summary: `${plan.metricLabel} · target ${formatNbaHitTheNumberValue(plan, plan.target)}`,
      setup: asChallengeJson({
        seed: plan.seed, boardType: plan.boardType, target: plan.target,
        pickCount: plan.pickCount, metricId: plan.metricId, subjectIds: plan.subjectIds,
      }),
      creatorResult: asChallengeJson(resultPayload(result)),
      shareTitle: "NBA Hit the Number Challenge",
      shareText: `I challenged you to NBA Hit the Number: pick ${plan.pickCount} to hit ${formatNbaHitTheNumberValue(plan, plan.target)} ${plan.metricLabel}.`,
      shareUrl: url.toString(),
    });
    setChallengeStatus(status);
  }

  const actions = result ? (
    <GameResultActions
      onChallenge={() => void challengeSomeone()}
      onReplay={replay}
      onAllGames={() => navigate("/nba")}
      replayLabel={shared ? "REPLAY CHALLENGE" : "NEW BOARD"}
      status={challengeStatus}
    />
  ) : null;
  return (
    <div
      className="page hit-number-page football-hit-number-page nba-hit-number-page"
      data-sport="nba"
      data-game="hit-the-number"
      style={nbaHitNumberTheme}
    >
      {match.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{match.creator.displayName} sent this exact NBA Hit the Number board.</strong>
          <small>Both locked totals reveal after you finish.</small>
        </section>
      ) : null}
      <FootballHitTheNumberPresentation
        target={plan.target}
        metricLabel={plan.metricLabel}
        league="NBA"
        configurationLabel={plan.configurationLabel}
        pickCount={plan.pickCount}
        candidates={candidates}
        selectedIds={selectedIds}
        slots={plan.slots}
        activeSlotIndex={progression && !result && selectedIds.length < plan.pickCount ? selectedIds.length : null}
        availableIds={allowedIds}
        values={result ? Object.fromEntries(plan.subjectIds.map((id) => [id, nbaHitTheNumberValue(id, plan.metricId)])) : undefined}
        result={result}
        formatValue={(value) => formatNbaHitTheNumberValue(plan, value)}
        onBack={() => navigate("/nba")}
        onNewBoard={!result && !shared ? newBoard : null}
        onToggle={toggleSubject}
        onRewind={rewind}
        onLock={validSelection ? lock : null}
        resultActions={actions}
        renderSubjectMark={(id, className) => {
          const subject = getNbaHitTheNumberSubject(id);
          return subject ? (
            <img className={className} src={subject.image} alt="" loading="lazy"
              style={{ objectFit: "contain", background: "rgba(242,163,65,.09)", borderRadius: 8 }} />
          ) : null;
        }}
      />
    </div>
  );
}
