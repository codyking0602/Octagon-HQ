import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor, type PlayLineupType } from "../play/lineupModel";
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

export function footballFindLeaderRankLabel(rows: readonly { value: number }[], index: number) {
  const value = rows[index]?.value;
  if (value == null) return "";
  const rank = rows.findIndex((row) => row.value === value) + 1;
  const tied = rows.filter((row) => row.value === value).length > 1;
  return tied ? `T-${rank}` : `#${rank}`;
}

export function footballFindLeaderReplayLabel(type: PlayLineupType) {
  return type === "replayable" ? "NEW LINEUP" : replayLabelFor(type);
}

export function footballFindLeaderCandidateAsset(domainId: FootballFindLeaderDomainId, candidateId: string) {
  if (domainId === "nfl-qb-career" || domainId === "nfl-rb-career") return null;
  return footballSubjectAsset(candidateId);
}

function footballFindLeaderFallbackMark(domainId: FootballFindLeaderDomainId) {
  if (domainId === "nfl-qb-career" || domainId === "nfl-qb-season") return "QB";
  if (domainId === "nfl-rb-career") return "RB";
  return domainId.startsWith("cfb-") ? "CFB" : "NFL";
}

function FootballFindLeaderVisual({
  candidateId,
  candidateName,
  domainId,
  compact = false,
}: {
  candidateId: string;
  candidateName: string;
  domainId: FootballFindLeaderDomainId;
  compact?: boolean;
}) {
  const asset = footballFindLeaderCandidateAsset(domainId, candidateId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [asset?.src, candidateId]);

  return (
    <span
      className={`football-find-card__visual${asset && !failed ? " has-logo" : ""}${compact ? " is-compact" : ""}`}
      aria-label={asset && !failed ? `${asset.label} logo for ${candidateName}` : `${candidateName} ${footballFindLeaderFallbackMark(domainId)} mark`}
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
        <b aria-hidden="true">{footballFindLeaderFallbackMark(domainId)}</b>
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
  const showCandidateContext = new Set(board.candidates.map((candidate) => candidate.subtitle)).size > 1;

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
      shareUrl: footballChallengeUrl("/football/find-leader", {
        seed: boardSeed,
        definition: board.definitionId,
      }),
    });
    setChallengeStatus(status);
  }

  if (result) {
    const leader = board.candidates.find((candidate) => candidate.id === board.leaderId)!;
    const sorted = [...board.candidates].sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    const fatalRound = result.perfect ? null : result.score / 10;
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
          <div className="football-find-result__copy">
            <p className="eyebrow">{result.perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
            <h1>{result.score}/100</h1>
            <p>{result.perfect
              ? `You cleared all nine decoys and left ${leader.name} standing.`
              : `You eliminated the group leader, ${leader.name}, in Round ${fatalRound}.`}</p>
          </div>
          <article className="football-find-result__leader">
            <FootballFindLeaderVisual candidateId={leader.id} candidateName={leader.name} domainId={board.domainId} compact />
            <span>
              <small>GROUP LEADER</small>
              <strong>{leader.name}</strong>
              {showCandidateContext ? <em>{leader.subtitle}</em> : null}
              <b>{formatFootballFindLeaderValue(board, leader.value)} {board.shortLabel}</b>
            </span>
          </article>
        </section>

        <section className="football-find-reveal">
          <header><p className="eyebrow">FULL STAT REVEAL</p><h2>{board.question}</h2></header>
          <div>
            {sorted.map((candidate, index) => (
              <article className={`${candidate.id === board.leaderId ? "is-leader" : ""}${candidate.id === result.fatalId ? " is-fatal" : ""}`} key={candidate.id}>
                <em>{footballFindLeaderRankLabel(sorted, index)}</em>
                <span>
                  <strong>{candidate.name}</strong>
                  {showCandidateContext ? <small>{candidate.subtitle}</small> : null}
                </span>
                <b>{formatFootballFindLeaderValue(board, candidate.value)}<small>{board.shortLabel}</small></b>
              </article>
            ))}
          </div>
        </section>

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
      <section className="football-find-hero">
        <div className="football-find-hero__copy">
          <p className="eyebrow">{shared ? "CHALLENGE BOARD" : "REPLAYABLE GAME"}</p>
          <h1>{board.question}</h1>
          <p>{board.context}</p>
          <small className="football-find-hero__category">{footballFindLeaderCategoryLabel(board.domainId)}</small>
          {!shared ? (
            <button className="primary-action football-find-hero__new-lineup" type="button" onClick={startNew}>
              NEW LINEUP
            </button>
          ) : null}
        </div>
        <aside className="football-find-hero__status" aria-label="Find the Leader progress">
          <div><span>ROUND</span><strong>{eliminated.length + 1}</strong></div>
          <div><span>STANDING</span><strong>{10 - eliminated.length}</strong></div>
          <div><span>SAFE</span><strong>{eliminated.length}/9</strong></div>
        </aside>
      </section>

      <section className="football-find-grid" aria-label="Football Find the Leader candidates">
        {board.candidates.map((candidate, index) => {
          const safe = eliminatedSet.has(candidate.id);
          return (
            <button className={`football-find-card${safe ? " is-safe" : ""}`} type="button" disabled={safe} onClick={() => eliminate(candidate.id)} key={candidate.id}>
              <span className="football-find-card__number">{index + 1}</span>
              <FootballFindLeaderVisual candidateId={candidate.id} candidateName={candidate.name} domainId={board.domainId} />
              <span className="football-find-card__copy">
                {showCandidateContext ? <small>{candidate.subtitle}</small> : null}
                <strong>{candidate.name}</strong>
              </span>
              <em>{safe
                ? <>SAFE · <b>{formatFootballFindLeaderValue(board, candidate.value)} {board.shortLabel}</b></>
                : "ELIMINATE"}</em>
            </button>
          );
        })}
      </section>
    </div>
  );
}
