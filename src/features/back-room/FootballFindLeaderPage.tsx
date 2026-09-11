import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor, type PlayLineupType } from "../play/lineupModel";
import { FootballFindLeaderPresentation } from "./FootballFindLeaderPresentation";
export { footballFindLeaderRankLabel } from "./FootballFindLeaderPresentation";
import {
  FOOTBALL_FIND_LEADER_GAME_ID,
  buildFootballFindLeaderBoard,
  createFootballFindLeaderRun,
  footballFindLeaderCategoryLabel,
  footballFindLeaderQuestions,
  formatFootballFindLeaderValue,
  type FootballFindLeaderRun,
} from "./footballFindLeaderModel";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";
import { footballSubjectAsset } from "./footballSubjectAssets";
import "../../styles/football-find-leader.css";

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

type FootballFindLeaderDomainId = FootballFindLeaderRun["board"]["domainId"];

export function footballFindLeaderReplayLabel(type: PlayLineupType) {
  return type === "replayable" ? "NEW LINEUP" : replayLabelFor(type);
}

export function footballFindLeaderCandidateAsset(_domainId: FootballFindLeaderDomainId, candidateId: string) {
  return footballSubjectAsset(candidateId);
}

function footballFindLeaderFallbackMark(domainId?: FootballFindLeaderDomainId, league?: string) {
  if (domainId === "nfl-qb-career" || domainId === "nfl-qb-season") return "QB";
  if (domainId === "nfl-rb-career") return "RB";
  if (domainId?.startsWith("cfb-")) return "CFB";
  return league === "CFB" ? "CFB" : "NFL";
}

export function FootballFindLeaderVisual({
  candidateId,
  candidateName,
  domainId,
  league,
  compact = false,
}: {
  candidateId: string;
  candidateName: string;
  domainId?: FootballFindLeaderDomainId;
  league?: string;
  compact?: boolean;
}) {
  const asset = footballSubjectAsset(candidateId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [asset?.src, candidateId]);

  return (
    <span
      className={`football-find-card__visual${asset && !failed ? " has-logo" : ""}${compact ? " is-compact" : ""}`}
      aria-label={asset && !failed ? `${asset.label} logo for ${candidateName}` : `${candidateName} ${footballFindLeaderFallbackMark(domainId, league)} mark`}
    >
      {asset && !failed ? (
        <img
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          src={asset.src}
          title={asset.label}
          onError={() => setFailed(true)}
        />
      ) : (
        <b aria-hidden="true">{footballFindLeaderFallbackMark(domainId, league)}</b>
      )}
    </span>
  );
}

function resolveChallengeRun(seed: string | null, definitionId: string | null, challengeId: string): FootballFindLeaderRun | null {
  if (!seed || !definitionId) return null;
  const definition = footballFindLeaderQuestions.find((row) => row.id === definitionId);
  if (!definition) return null;
  const board = buildFootballFindLeaderBoard(definition, seed);
  if (!board) return null;
  return {
    board,
    identity: footballCuratedIdentity(
      FOOTBALL_FIND_LEADER_GAME_ID,
      challengeId,
      [`question:${board.definitionId}`, `metric:${board.metricId}`, `family:${board.family}`, ...board.candidates.map((item) => item.id)],
      "football-find-leader",
    ),
  };
}

export default function FootballFindLeaderPage() {
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
  const [run, setRun] = useState<FootballFindLeaderRun>(() => sharedRun ?? createFootballFindLeaderRun());
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const board = run.board;
  const eliminatedSet = new Set(eliminated);
  const shared = run.identity.type === "curated";
  const boardSeed = shared ? (profileSeed ?? querySeed ?? run.identity.seed) : run.identity.seed;

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    reset(sharedRun);
  }, [run.identity.challengeId, sharedRun]);

  function reset(nextRun: FootballFindLeaderRun) {
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
    reset(createFootballFindLeaderRun());
  }

  function replay() {
    if (shared) reset(run);
    else startNew();
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "find-leader",
      gameVersion: board.version,
      gameTitle: "Football Find the Leader",
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
      shareTitle: "Football Find the Leader Challenge",
      shareText: `I challenged you to the same ten-subject Football Find the Leader board for ${board.statLabel}.`,
      shareUrl: footballChallengeUrl("/football/find-leader", {
        seed: boardSeed,
        definition: board.definitionId,
      }),
    });
    setChallengeStatus(status);
  }

  if (result) {
    return (
      <div className="page football-find-leader-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact Football Find the Leader board.</strong>
            <small>Both elimination paths reveal after you finish.</small>
          </section>
        ) : null}
        <FootballFindLeaderPresentation
          question={board.question}
          context={board.context}
          categoryLabel={footballFindLeaderCategoryLabel(board.domainId)}
          statLabel={board.statLabel}
          shortLabel={board.shortLabel}
          candidates={board.candidates}
          leaderId={board.leaderId}
          eliminatedIds={eliminated}
          result={result}
          eyebrow={shared ? "CHALLENGE BOARD" : "REPLAYABLE GAME"}
          formatValue={(value) => formatFootballFindLeaderValue(board, value)}
          renderVisual={(candidate, compact) => (
            <FootballFindLeaderVisual
              candidateId={candidate.id}
              candidateName={candidate.name}
              domainId={board.domainId}
              compact={compact}
            />
          )}
        />

        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={replay}
          onAllGames={() => navigate("/football")}
          replayLabel={footballFindLeaderReplayLabel(run.identity.type)}
          status={challengeStatus}
        />
      </div>
    );
  }

  return (
    <div className="page football-find-leader-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Find the Leader board.</strong>
          <small>Eliminate until the leader falls or only the leader remains.</small>
        </section>
      ) : null}
      <FootballFindLeaderPresentation
        question={board.question}
        context={board.context}
        categoryLabel={footballFindLeaderCategoryLabel(board.domainId)}
        statLabel={board.statLabel}
        shortLabel={board.shortLabel}
        candidates={board.candidates}
        leaderId={board.leaderId}
        eliminatedIds={eliminated}
        result={null}
        eyebrow={shared ? "CHALLENGE BOARD" : "REPLAYABLE GAME"}
        intro="Eliminate nine decoys until only the leader remains."
        onNewLineup={shared ? null : startNew}
        onEliminate={eliminate}
        formatValue={(value) => formatFootballFindLeaderValue(board, value)}
        renderVisual={(candidate, compact) => (
          <FootballFindLeaderVisual
            candidateId={candidate.id}
            candidateName={candidate.name}
            domainId={board.domainId}
            compact={compact}
          />
        )}
      />
    </div>
  );
}
