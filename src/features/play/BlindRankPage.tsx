import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  blindRankChallengeUrl,
  blindRankPacks,
  createBlindRankLineup,
  resolveBlindRankChallenge,
} from "./blindRankEngine";
import { GameResultActions } from "./GameResultActions";
import {
  createReplaySeed,
  curatedLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  replayLabelFor,
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "./lineupModel";
import { scoreBlindRankOrderedRatings } from "./officialScoreContract";
import {
  blindRankPool,
  blindRankRating,
  type BlindRankPackId,
  type PlayFighter,
} from "./playFighterPool";

interface BlindRankRun {
  packId: BlindRankPackId;
  lineup: PlayFighter[];
  identity: PlayLineupIdentity;
}

function packIsValid(value: string | null): value is BlindRankPackId {
  return blindRankPacks.some((pack) => pack.id === value);
}

function randomBlindRankPack(exclude?: BlindRankPackId): BlindRankPackId {
  const candidates = exclude && blindRankPacks.length > 1
    ? blindRankPacks.filter((pack) => pack.id !== exclude)
    : blindRankPacks;
  const random = seededLineupRandom("blind-rank", "category", createReplaySeed("blind-rank-category"));
  return candidates[Math.floor(random() * candidates.length)]!.id;
}

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function strings(value: ChallengeJson | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asJson(value: unknown): ChallengeJson {
  return JSON.parse(JSON.stringify(value)) as ChallengeJson;
}

function compactDivision(fighter: PlayFighter) {
  const abbreviations: Record<string, string> = {
    Strawweight: "SW",
    Flyweight: "FLW",
    Bantamweight: "BW",
    Featherweight: "FW",
    Lightweight: "LW",
    Welterweight: "WW",
    Middleweight: "MW",
    "Light Heavyweight": "LHW",
    Heavyweight: "HW",
  };
  return fighter.divisions.map((division) => abbreviations[division] ?? division).join(" / ");
}

function casualBlindRankRun(packId: BlindRankPackId): BlindRankRun {
  const pool = blindRankPool(packId);
  const validIds = new Set(pool.map((fighter) => fighter.id));
  const selected = selectReplayLineup({
    gameId: "blind-rank",
    scopeId: packId,
    lineupSize: 5,
    attempts: 12,
    validItemIds: validIds,
    validFighterIds: validIds,
    build: (seed) => {
      const generated = createBlindRankLineup(packId, seed);
      const ids = generated.fighters.map((fighter) => fighter.id);
      return {
        value: generated.fighters,
        itemIds: ids,
        fighterIds: ids,
      };
    },
  });
  return { packId, lineup: selected.value, identity: selected.identity };
}

function curatedBlindRankRun(
  packId: BlindRankPackId,
  lineup: PlayFighter[],
  challengeId: string,
): BlindRankRun {
  const ids = lineup.map((fighter) => fighter.id);
  const identity = curatedLineupIdentity("blind-rank", challengeId, ids, packId);
  rememberLineup(identity, ids, ids);
  return { packId, lineup, identity };
}

export default function BlindRankPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("blind-rank");
  const profileSetup = record(profileMatch.challenge?.setup);
  const profilePackValue = typeof profileSetup?.packId === "string" ? profileSetup.packId : null;
  const profilePack = packIsValid(profilePackValue) ? profilePackValue : null;
  const profileLineupIds = strings(profileSetup?.lineupIds);
  const profileLineup = profilePack ? resolveBlindRankChallenge(profilePack, profileLineupIds) : null;
  const queryPackValue = searchParams.get("pack");
  const queryPack = packIsValid(queryPackValue) ? queryPackValue : null;
  const queryLineup = searchParams.get("lineup") ?? "";
  const querySharedLineup = useMemo(() => {
    if (!queryPack) return null;
    const ids = queryLineup.split(",").map((value) => value.trim()).filter(Boolean);
    return resolveBlindRankChallenge(queryPack, ids);
  }, [queryLineup, queryPack]);
  const sharedLineup = profileLineup ?? querySharedLineup;
  const sharedPack = profileLineup && profilePack
    ? profilePack
    : querySharedLineup && queryPack
      ? queryPack
      : null;
  const casualInitialPack = useMemo(() => randomBlindRankPack(), []);
  const initialPack = sharedPack ?? casualInitialPack;
  const sharedChallengeId = profileMatch.challenge?.code
    ?? `shared:${initialPack}:${sharedLineup?.map((fighter) => fighter.id).join("|") ?? "invalid"}`;
  const [run, setRun] = useState<BlindRankRun>(() =>
    sharedLineup
      ? curatedBlindRankRun(initialPack, sharedLineup, sharedChallengeId)
      : casualBlindRankRun(initialPack),
  );
  const [placements, setPlacements] = useState<Array<PlayFighter | null>>(Array(5).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState("");
  const pack = blindRankPacks.find((item) => item.id === run.packId)!;
  const complete = currentIndex >= 5;
  const current = run.lineup[currentIndex];
  const shared = run.identity.type === "curated";
  const completedScore = complete
    ? scoreBlindRankOrderedRatings(
      placements.flatMap((fighter) => fighter ? [blindRankRating(fighter, run.packId)] : []),
    )
    : null;
  const canonicalOrder = complete
    ? run.lineup
      .map((fighter, boardIndex) => ({
        fighter,
        boardIndex,
        rating: blindRankRating(fighter, run.packId),
      }))
      .sort((left, right) => right.rating - left.rating || left.boardIndex - right.boardIndex)
    : [];

  useEffect(() => {
    if (!complete) return;
    const result = { placements: placements.flatMap((fighter) => fighter ? [fighter.id] : []) };
    recordLineupCompletion(run.identity, result);
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asJson(result));
    }
  }, [complete, placements, profileMatch, run.identity]);

  function resetPlacements() {
    setPlacements(Array(5).fill(null));
    setCurrentIndex(0);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewLineup() {
    setRun(casualBlindRankRun(randomBlindRankPack(run.packId)));
    resetPlacements();
  }

  function replay() {
    if (run.identity.type === "replayable") startNewLineup();
    else resetPlacements();
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
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "blind-rank",
      gameVersion: "blind-rank-v2",
      gameTitle: "Blind Rank 5",
      summary: `${pack.name} · same five fighters`,
      setup: asJson({
        packId: run.packId,
        packName: pack.name,
        lineupIds: run.lineup.map((fighter) => fighter.id),
        lineup: run.lineup.map((fighter) => ({ id: fighter.id, name: fighter.name })),
      }),
      creatorResult: asJson({ placements: placements.flatMap((fighter) => fighter ? [fighter.id] : []) }),
      shareTitle: "Blind Rank 5 Challenge",
      shareText: `I challenged you to rank the same five UFC fighters in ${pack.name}. Every slot locks before the next reveal.`,
      shareUrl: blindRankChallengeUrl(run.packId, run.lineup),
    });
    setChallengeStatus(status);
  }

  return (
    <div className="page blind-rank-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent these exact five fighters.</strong>
          <small>Both locked rankings reveal after you finish.</small>
        </section>
      ) : null}
      <section className="blind-rank-intro">
        <div>
          <p className="eyebrow">{shared ? "FRIEND CHALLENGE" : "REPLAYABLE GAME"}</p>
          <h1>{shared ? "Same five. Your ranking." : pack.prompt}</h1>
          <p>{pack.intro}</p>
        </div>
        {!shared ? (
          <div className="blind-rank-controls">
            <button type="button" onClick={startNewLineup}>NEW LINEUP</button>
          </div>
        ) : <span className="blind-rank-shared-pack">{pack.name}</span>}
      </section>

      <section className={`blind-rank-game${complete ? " is-complete" : ""}`}>
        <header><strong>{complete ? "COMPLETE" : `LOCKED ${currentIndex} OF 5`}</strong>{!complete ? <span>{pack.name}</span> : null}</header>
        {!complete ? (
          <div className="blind-rank-slots" aria-label="Blind Rank locked slots">
            {placements.map((fighter, index) => fighter ? (
              <button className="blind-rank-slot is-filled" type="button" disabled key={index}>
                <b>{index + 1}</b>
                <FighterPhoto className="blind-rank-slot__photo" name={fighter.name} src={fighter.thumbUrl} />
                <strong>{fighter.name}</strong>
              </button>
            ) : (
              <button className="blind-rank-slot" type="button" disabled={complete} key={index} onClick={() => placeCurrent(index)}>
                <b>{index + 1}</b><span>PLACE HERE</span>
              </button>
            ))}
          </div>
        ) : null}

        {complete ? (
          <div className="blind-rank-finish">
            {completedScore ? (
              <section className="keep-cut-result-hero" aria-label="Blind Rank score">
                <p className="eyebrow">FIVE SLOTS LOCKED</p>
                <h1>{completedScore.normalizedScore}/100</h1>
                <p>FIVE PLACEMENTS GRADED AGAINST OCTAGON HQ</p>
                <small>Your five locked placements are graded by their relative order to produce the 100-point score.</small>
                <p>OCTAGON HQ ORDER</p>
                <p aria-label="Octagon HQ order">
                  {canonicalOrder.map(({ fighter }, index) => (
                    <span key={fighter.id}>#{index + 1} {fighter.name}{index < canonicalOrder.length - 1 ? <br /> : null}</span>
                  ))}
                </p>
                <small>Fighters within one rating point are treated as tied for scoring.</small>
              </section>
            ) : null}
            <p className="eyebrow">YOUR FINAL RANKING</p>
            <div className="blind-rank-results">
              {placements.map((fighter, index) => fighter ? (
                <article key={fighter.id}>
                  <b>#{index + 1}</b>
                  <FighterPhoto className="blind-rank-result__photo" name={fighter.name} src={fighter.thumbUrl} />
                  <span><strong>{fighter.name}</strong><small>{compactDivision(fighter)}</small></span>
                </article>
              ) : null)}
            </div>
            <GameResultActions
              onChallenge={() => void challengeSomeone()}
              onReplay={replay}
              onAllGames={() => navigate("/play")}
              replayLabel={replayLabelFor(run.identity.type)}
              status={challengeStatus}
            />
          </div>
        ) : current ? (
          <article className="blind-rank-current">
            <FighterPhoto className="blind-rank-current__photo" name={current.name} src={current.thumbUrl} />
            <div>
              <p className="eyebrow">FIGHTER {currentIndex + 1} OF 5</p>
              <h2>{current.name}</h2>
              <p>{compactDivision(current)}</p>
              <strong>Choose an open slot. Once placed, it is locked.</strong>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
