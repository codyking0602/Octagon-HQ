import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import { scoreBlindRankOrderedRatings } from "../play/officialScoreContract";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  FOOTBALL_RANK_FIVE_GAME_ID,
  createRandomFootballRankFiveRun,
  getFootballRankFivePack,
  type FootballRankFiveItem,
  type FootballRankFiveRun,
} from "./footballRankFiveModel";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  challengeStrings,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

function resolveChallengeRun(
  packId: string | null,
  lineupIds: readonly string[],
  challengeId: string,
): FootballRankFiveRun | null {
  if (!packId || lineupIds.length !== 5 || new Set(lineupIds).size !== 5) return null;
  try {
    const pack = getFootballRankFivePack(packId as Parameters<typeof getFootballRankFivePack>[0]);
    const items = new Map(pack.items.map((item) => [item.id, item]));
    const lineup = lineupIds.flatMap((id) => items.get(id) ? [items.get(id)!] : []);
    if (lineup.length !== 5) return null;
    return {
      pack,
      lineup,
      identity: footballCuratedIdentity(FOOTBALL_RANK_FIVE_GAME_ID, challengeId, lineupIds, pack.id),
    };
  } catch {
    return null;
  }
}

export default function FootballRankFivePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("blind-rank");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profilePackId = challengeString(profileSetup?.packId);
  const profileLineupIds = challengeStrings(profileSetup?.lineupIds);
  const queryPackId = searchParams.get("pack");
  const queryLineupIds = (searchParams.get("lineup") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const sharedChallengeId = profileMatch.challenge?.code
    ?? `shared:${queryPackId ?? "unknown"}:${queryLineupIds.join("|")}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profilePackId, profileLineupIds, sharedChallengeId)
      ?? resolveChallengeRun(queryPackId, queryLineupIds, sharedChallengeId)
  ), [profilePackId, profileLineupIds.join("|"), queryPackId, queryLineupIds.join("|"), sharedChallengeId]);
  const [run, setRun] = useState<FootballRankFiveRun>(() => sharedRun ?? createRandomFootballRankFiveRun());
  const [placements, setPlacements] = useState<Array<FootballRankFiveItem | null>>(Array(5).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState("");
  const complete = currentIndex >= 5;
  const current = run.lineup[currentIndex];
  const shared = run.identity.type === "curated";
  const completedScore = complete
    ? scoreBlindRankOrderedRatings(
      placements.flatMap((item) => item ? [item.rating] : []),
    )
    : null;
  const canonicalOrder = complete
    ? run.lineup
      .map((item, boardIndex) => ({ item, boardIndex }))
      .sort((left, right) => right.item.rating - left.item.rating || left.boardIndex - right.boardIndex)
    : [];

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    setRun(sharedRun);
    setPlacements(Array(5).fill(null));
    setCurrentIndex(0);
    setChallengeStatus("");
  }, [run.identity.challengeId, sharedRun]);

  useEffect(() => {
    if (!complete) return;
    const result = {
      placements: placements.flatMap((item) => item ? [item.id] : []),
      score: completedScore?.normalizedScore ?? 0,
    };
    recordLineupCompletion(run.identity, result);
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asChallengeJson(result));
    }
  }, [complete, completedScore?.normalizedScore, placements, profileMatch, run.identity]);

  function resetBoard() {
    setPlacements(Array(5).fill(null));
    setCurrentIndex(0);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewLineup() {
    setRun(createRandomFootballRankFiveRun(run.pack.id));
    resetBoard();
  }

  function replay() {
    if (shared) resetBoard();
    else startNewLineup();
  }

  function placeCurrent(slotIndex: number) {
    if (complete || !current || placements[slotIndex]) return;
    const next = [...placements];
    next[slotIndex] = current;
    setPlacements(next);
    setCurrentIndex((index) => index + 1);
  }

  async function challengeSomeone() {
    if (!complete) return;
    const result = {
      placements: placements.flatMap((item) => item ? [item.id] : []),
      score: completedScore?.normalizedScore ?? 0,
    };
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "blind-rank",
      gameVersion: "football-blind-rank-v1",
      gameTitle: "Football Blind Rank 5",
      summary: `${run.pack.name} · same five subjects`,
      setup: asChallengeJson({
        packId: run.pack.id,
        lineupIds: run.lineup.map((item) => item.id),
        lineup: run.lineup.map((item) => ({ id: item.id, name: item.name })),
      }),
      creatorResult: asChallengeJson(result),
      shareTitle: "Football Blind Rank 5 Challenge",
      shareText: `I challenged you to rank the same five football subjects in ${run.pack.name}. Every slot locks before the next reveal.`,
      shareUrl: footballChallengeUrl("/football/rank-five", {
        pack: run.pack.id,
        lineup: run.lineup.map((item) => item.id).join(","),
      }),
    });
    setChallengeStatus(status);
  }

  return (
    <div className="page football-rank-five-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Blind Rank 5 board.</strong>
          <small>Both locked rankings reveal after you finish.</small>
        </section>
      ) : null}
      <section className="football-rank-five-intro">
        <div>
          <p className="eyebrow">FOOTBALL HQ</p>
          <h1>{run.pack.prompt}</h1>
          <p>{run.pack.intro}</p>
        </div>
        <div className="football-rank-five-category">
          <small>CURRENT CATEGORY</small>
          <strong>{run.pack.name}</strong>
          {!complete && !shared ? <button type="button" onClick={startNewLineup}>SWITCH CATEGORY</button> : null}
        </div>
      </section>

      <section className={`football-rank-five-board${complete ? " is-complete" : ""}`}>
        <header>
          <span>{complete ? "BOARD LOCKED" : `LOCKED ${currentIndex} OF 5`}</span>
          <strong>BLIND RANK 5</strong>
        </header>

        {!complete ? (
          <div className="football-rank-five-slots" aria-label="Football Blind Rank 5 locked slots">
            {placements.map((item, index) => item ? (
              <button className="football-rank-five-slot is-filled" type="button" disabled key={index}>
                <b>#{index + 1}</b>
                <FootballSubjectVisual className="football-rank-five-slot__visual" item={item} packId={run.pack.id} />
                <span>{item.name}</span>
              </button>
            ) : (
              <button
                className="football-rank-five-slot"
                type="button"
                key={index}
                aria-label={`Place current item at rank ${index + 1}`}
                onClick={() => placeCurrent(index)}
              >
                <b>#{index + 1}</b>
                <span>PLACE HERE</span>
              </button>
            ))}
          </div>
        ) : null}

        {complete ? (
          <div className="football-rank-five-finish">
            <section className="football-rank-five-score" aria-label="Football Blind Rank 5 score">
              <p className="eyebrow">FIVE SPOTS. NO TAKEBACKS.</p>
              <h2>{completedScore?.normalizedScore ?? 0}/100</h2>
              <p>Graded against the Football HQ order using the same pairwise Blind Rank 5 scoring as UFC.</p>
            </section>

            <div className="football-rank-five-reveal-grid">
              <section>
                <p className="eyebrow">YOUR FINAL RANKING</p>
                <div className="football-rank-five-results">
                  {placements.map((item, index) => item ? (
                    <article key={item.id}>
                      <b>#{index + 1}</b>
                      <FootballSubjectVisual item={item} packId={run.pack.id} />
                      <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
                      <em>{item.league}</em>
                    </article>
                  ) : null)}
                </div>
              </section>

              <section>
                <p className="eyebrow">FOOTBALL HQ ORDER</p>
                <div className="football-rank-five-results is-canonical">
                  {canonicalOrder.map(({ item }, index) => (
                    <article key={item.id}>
                      <b>#{index + 1}</b>
                      <FootballSubjectVisual item={item} packId={run.pack.id} />
                      <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
                      <em>{item.league}</em>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <GameResultActions
              onChallenge={() => void challengeSomeone()}
              onReplay={replay}
              onAllGames={() => navigate("/football")}
              replayLabel={replayLabelFor(run.identity.type)}
              status={challengeStatus}
            />
          </div>
        ) : current ? (
          <article className="football-rank-five-current">
            <FootballSubjectVisual className="football-rank-five-current__visual" item={current} packId={run.pack.id} />
            <div>
              <p className="eyebrow">{current.league} · REVEAL {currentIndex + 1} OF 5</p>
              <h2>{current.name}</h2>
              <p>{current.subtitle}</p>
              <strong>Choose an open slot. Once placed, it’s locked.</strong>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
