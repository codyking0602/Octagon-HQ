import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor, type PlayLineupType } from "../play/lineupModel";
import { FootballFindLeaderPresentation } from "../back-room/FootballFindLeaderPresentation";
import { nbaFindLeaderHeadshot } from "./nbaFindLeaderModel";
import "../../styles/nba-find-leader.css";
import {
  NBA_FIND_LEADER_GAME_ID,
  buildNbaFindLeaderBoard,
  createNbaFindLeaderRun,
  createNbaFindLeaderDailyPreviewRun,
  nbaFindLeaderDefinitionById,
  type NbaFindLeaderRun,
} from "./nbaFindLeaderModel";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "../back-room/footballChallengeRuntime";


interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}


function NbaFindLeaderVisual({ candidateId, candidateName, compact = false }: {
  candidateId: string; candidateName: string; compact?: boolean;
}) {
  const src = nbaFindLeaderHeadshot(candidateId);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [candidateId, src]);
  return <span className={"football-find-card__visual" + (compact ? " is-compact" : "")}
    aria-label={src && !failed ? candidateName + " NBA headshot" : candidateName + " NBA mark"}>
    {src && !failed
      ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      : <b aria-hidden="true">NBA</b>}
  </span>;
}


export function nbaFindLeaderReplayLabel(type: PlayLineupType) {
  return type === "replayable" ? "NEW LINEUP" : replayLabelFor(type);
}

function resolveChallengeRun(seed: string | null, definitionId: string | null, challengeId: string): NbaFindLeaderRun | null {
  if (!seed || !definitionId) return null;
  const definition = nbaFindLeaderDefinitionById.get(definitionId);
  if (!definition) return null;
  const board = buildNbaFindLeaderBoard(definition, seed);
  if (!board) return null;
  return {
    board,
    identity: footballCuratedIdentity(
      NBA_FIND_LEADER_GAME_ID,
      challengeId,
      [`question:${board.definitionId}`, `metric:${board.metricId}`, `family:${board.family}`, ...board.candidates.map((item) => item.id)],
      "nba-find-leader",
    ),
  };
}

export default function NbaFindLeaderPage({ dailyPreview = false }: { dailyPreview?: boolean }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("find-leader");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profileSeed = challengeString(profileSetup?.seed);
  const profileDefinitionId = challengeString(profileSetup?.definitionId);
  const querySeed = searchParams.get("seed");
  const queryDefinitionId = searchParams.get("definition");
  const sharedChallengeId = profileMatch.challenge?.code ?? `shared:${querySeed ?? "unknown"}:${queryDefinitionId ?? "unknown"}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profileSeed, profileDefinitionId, sharedChallengeId)
      ?? resolveChallengeRun(querySeed, queryDefinitionId, sharedChallengeId)
  ), [profileSeed, profileDefinitionId, querySeed, queryDefinitionId, sharedChallengeId]);
  const [run, setRun] = useState<NbaFindLeaderRun>(() => sharedRun ?? (dailyPreview ? createNbaFindLeaderDailyPreviewRun() : createNbaFindLeaderRun()));
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const board = run.board;
  const previewNotice = dailyPreview ? <section className="challenge-game-banner nba-find-leader-preview"><span>OWNER DAILY PREVIEW · UNOFFICIAL</span><strong>Today’s Chicago-date NBA board.</strong><small>This preview is not a public Daily Challenge and does not post an official leaderboard score.</small></section> : null;
  const eliminatedSet = new Set(eliminated);
  const shared = run.identity.type === "curated";
  const boardSeed = shared ? (profileSeed ?? querySeed ?? run.identity.seed) : run.identity.seed;

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    reset(sharedRun);
  }, [run.identity.challengeId, sharedRun]);

  function reset(nextRun: NbaFindLeaderRun) {
    setRun(nextRun);
    setEliminated([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function challengeResult(nextResult: ResultState, nextEliminated: readonly string[]) {
    return {
      score: nextResult.score / 10,
      perfect: nextResult.perfect,
      fatalId: nextResult.fatalId,
      eliminated: [...nextEliminated],
    };
  }

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    setEliminated(next);
    if (id === board.leaderId) {
      const nextResult = { score: round * 10, perfect: false, fatalId: id };
      setResult(nextResult);
      recordLineupCompletion(run.identity, { ...nextResult, eliminated: next });
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asChallengeJson(challengeResult(nextResult, next)));
      }
      return;
    }
    if (next.length === 9) {
      const nextResult = { score: 100, perfect: true, fatalId: null };
      setResult(nextResult);
      recordLineupCompletion(run.identity, { ...nextResult, eliminated: next });
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asChallengeJson(challengeResult(nextResult, next)));
      }
    }
  }

  function startNew() {
    reset(createNbaFindLeaderRun());
  }

  function replay() {
    if (shared || dailyPreview) reset(run);
    else startNew();
  }

  async function challengeSomeone() {
    if (!result || dailyPreview) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "find-leader",
      gameVersion: board.version,
      gameTitle: "NBA Find the Leader",
      summary: `${board.statLabel} · same ten-subject board`,
      setup: asChallengeJson({
        seed: boardSeed,
        definitionId: board.definitionId,
        board: {
          leaderId: board.leaderId,
          candidates: board.candidates.map((item) => ({ id: item.id, name: item.name })),
        },
      }),
      creatorResult: asChallengeJson(challengeResult(result, eliminated)),
      shareTitle: "NBA Find the Leader Challenge",
      shareText: `I challenged you to the same ten-subject NBA Find the Leader board for ${board.statLabel}.`,
      shareUrl: footballChallengeUrl("/nba/find-leader", {
        seed: boardSeed,
        definition: board.definitionId,
      }),
    });
    setChallengeStatus(status);
  }

  if (result) {
    return (
      <div className="page football-find-leader-page nba-find-leader-page">
        {previewNotice}
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact NBA Find the Leader board.</strong>
            <small>Both elimination paths reveal after you finish.</small>
          </section>
        ) : null}
        <FootballFindLeaderPresentation
          question={board.question}
          context={board.context}
          categoryLabel={board.categoryLabel}
          statLabel={board.statLabel}
          shortLabel={board.shortLabel}
          candidates={board.candidates}
          leaderId={board.leaderId}
          eliminatedIds={eliminated}
          result={result}
          eyebrow={dailyPreview ? "NBA DAILY PREVIEW" : shared ? "CHALLENGE BOARD" : "REPLAYABLE GAME"}
          formatValue={(value) => value.toFixed(1)}
          renderVisual={(candidate, compact) => (
            <NbaFindLeaderVisual
              candidateId={candidate.id}
              candidateName={candidate.name}
              compact={compact}
            />
          )}
        />

        {dailyPreview ? (
          <div className="game-result-actions-wrap">
            <div className="game-result-actions">
              <button className="find-secondary-action" type="button" onClick={replay}>REPLAY PREVIEW</button>
              <button className="find-secondary-action" type="button" onClick={() => navigate("/nba")}>ALL GAMES</button>
            </div>
          </div>
        ) : (
          <GameResultActions
            onChallenge={() => void challengeSomeone()}
            onReplay={replay}
            onAllGames={() => navigate("/nba")}
            replayLabel={nbaFindLeaderReplayLabel(run.identity.type)}
            status={challengeStatus}
          />
        )}
      </div>
    );
  }

  return (
    <div className="page football-find-leader-page nba-find-leader-page">
        {previewNotice}
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact NBA Find the Leader board.</strong>
          <small>Eliminate until the leader falls or only the leader remains.</small>
        </section>
      ) : null}
      <FootballFindLeaderPresentation
        question={board.question}
        context={board.context}
        categoryLabel={board.categoryLabel}
        statLabel={board.statLabel}
        shortLabel={board.shortLabel}
        candidates={board.candidates}
        leaderId={board.leaderId}
        eliminatedIds={eliminated}
        result={null}
        eyebrow={dailyPreview ? "NBA DAILY PREVIEW" : shared ? "CHALLENGE BOARD" : "REPLAYABLE GAME"}
        intro="Eliminate nine decoys until only the leader remains."
        onNewLineup={shared || dailyPreview ? null : startNew}
        onEliminate={eliminate}
        formatValue={(value) => value.toFixed(1)}
        renderVisual={(candidate, compact) => (
          <NbaFindLeaderVisual
            candidateId={candidate.id}
            candidateName={candidate.name}
            compact={compact}
          />
        )}
      />
    </div>
  );
}
