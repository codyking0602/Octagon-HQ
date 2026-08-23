import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import {
  FOOTBALL_FIND_LEADER_GAME_ID,
  buildFootballFindLeaderBoard,
  createFootballFindLeaderRun,
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
import "../../styles/football-find-leader.css";

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
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
      gameVersion: "football-find-leader-v1",
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
      shareUrl: footballChallengeUrl("/back-room/football/find-leader", {
        seed: boardSeed,
        definition: board.definitionId,
      }),
    });
    setChallengeStatus(status);
  }

  if (result) {
    const leader = board.candidates.find((candidate) => candidate.id === board.leaderId)!;
    const sorted = [...board.candidates].sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    return (
      <div className="page football-find-leader-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact Football Find the Leader board.</strong>
            <small>Both elimination paths reveal after you finish.</small>
          </section>
        ) : null}
        <section className={`football-find-result${result.perfect ? " is-perfect" : ""}`}>
          <p className="eyebrow">{result.perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
          <h1>{result.score}/100</h1>
          <p>{result.perfect
            ? `You cleared all nine decoys and left ${leader.name} standing.`
            : `You eliminated the group leader, ${leader.name}.`}</p>
          <div><small>GROUP LEADER</small><strong>{leader.name}</strong><b>{formatFootballFindLeaderValue(board, leader.value)} {board.shortLabel}</b></div>
        </section>

        <section className="football-find-reveal">
          <header><p className="eyebrow">FULL STAT REVEAL</p><h2>{board.question}</h2></header>
          <div>
            {sorted.map((candidate, index) => (
              <article className={`${candidate.id === board.leaderId ? "is-leader" : ""}${candidate.id === result.fatalId ? " is-fatal" : ""}`} key={candidate.id}>
                <em>#{index + 1}</em>
                <span><strong>{candidate.name}</strong><small>{candidate.subtitle}</small></span>
                <b>{formatFootballFindLeaderValue(board, candidate.value)}<small>{board.shortLabel}</small></b>
              </article>
            ))}
          </div>
        </section>

        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={replay}
          onAllGames={() => navigate("/back-room/football")}
          replayLabel={replayLabelFor(run.identity.type)}
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
      <section className="football-find-hero">
        <p className="eyebrow">FIND THE LEADER · FOOTBALL</p>
        <h1>{board.question}</h1>
        <p>{board.context}</p>
        <div><strong>{10 - eliminated.length}</strong><span>STILL STANDING</span><small>Eliminate players or teams until only the leader remains.</small></div>
      </section>

      <section className="football-find-grid" aria-label="Football Find the Leader candidates">
        {board.candidates.map((candidate) => {
          const gone = eliminatedSet.has(candidate.id);
          return (
            <button className={gone ? "is-eliminated" : ""} type="button" disabled={gone} onClick={() => eliminate(candidate.id)} key={candidate.id}>
              <small>{candidate.subtitle}</small>
              <strong>{candidate.name}</strong>
              <span>{gone ? "ELIMINATED" : "TAP TO ELIMINATE"}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
