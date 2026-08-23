import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion, replayLabelFor } from "../play/lineupModel";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  FOOTBALL_KEEP_CUT_GAME_ID,
  createRandomFootballKeepCutRun,
  getFootballKeepCutPack,
  scoreFootballKeepCutSelection,
  type FootballKeepCutRun,
} from "./footballKeepCutModel";
import type { FootballRankFiveItem } from "./footballRankFiveModel";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  challengeStrings,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

type Decision = "keep" | "cut";

function Tray({
  title,
  items,
  packId,
}: {
  title: Decision;
  items: FootballRankFiveItem[];
  packId: FootballKeepCutRun["pack"]["id"];
}) {
  return (
    <section className={`football-keep-cut-tray is-${title}`}>
      <header><strong>{title.toUpperCase()}</strong><span>{items.length}/4</span></header>
      <div>
        {Array.from({ length: 4 }, (_, index) => {
          const item = items[index];
          return item ? (
            <article key={item.id}>
              <FootballSubjectVisual className="football-keep-cut-tray__visual" item={item} packId={packId} />
              <span><strong>{item.name}</strong><small>{item.league}</small></span>
            </article>
          ) : <i aria-hidden="true" key={index}>{index + 1}</i>;
        })}
      </div>
    </section>
  );
}

function ResultList({
  title,
  items,
  packId,
}: {
  title: string;
  items: FootballRankFiveItem[];
  packId: FootballKeepCutRun["pack"]["id"];
}) {
  return (
    <section className="football-debate-result-list">
      <p className="eyebrow">{title}</p>
      <div>
        {items.map((item, index) => (
          <article key={item.id}>
            <b>#{index + 1}</b>
            <FootballSubjectVisual item={item} packId={packId} />
            <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
            <em>{item.league}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function resolveChallengeRun(
  packId: string | null,
  lineupIds: readonly string[],
  challengeId: string,
): FootballKeepCutRun | null {
  if (!packId || lineupIds.length !== 8 || new Set(lineupIds).size !== 8) return null;
  try {
    const pack = getFootballKeepCutPack(packId as Parameters<typeof getFootballKeepCutPack>[0]);
    const items = new Map(pack.items.map((item) => [item.id, item]));
    const lineup = lineupIds.flatMap((id) => items.get(id) ? [items.get(id)!] : []);
    if (lineup.length !== 8) return null;
    return {
      pack,
      lineup,
      identity: footballCuratedIdentity(FOOTBALL_KEEP_CUT_GAME_ID, challengeId, lineupIds, pack.id),
    };
  } catch {
    return null;
  }
}

export default function FootballKeepCutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("keep-cut");
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
  const [run, setRun] = useState<FootballKeepCutRun>(() => sharedRun ?? createRandomFootballKeepCutRun());
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [challengeStatus, setChallengeStatus] = useState("");
  const complete = decisions.length === run.lineup.length;
  const kept = run.lineup.filter((_item, index) => decisions[index] === "keep");
  const cut = run.lineup.filter((_item, index) => decisions[index] === "cut");
  const current = run.lineup[decisions.length];
  const shared = run.identity.type === "curated";
  const result = useMemo(() => {
    if (!complete) return null;
    return scoreFootballKeepCutSelection(run.lineup, kept.map((item) => item.id));
  }, [complete, kept.map((item) => item.id).join("|"), run.lineup]);

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    setRun(sharedRun);
    setDecisions([]);
    setChallengeStatus("");
  }, [run.identity.challengeId, sharedRun]);

  function reset(nextRun: FootballKeepCutRun) {
    setRun(nextRun);
    setDecisions([]);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    reset(createRandomFootballKeepCutRun(run.pack.id));
  }

  function replay() {
    if (shared) reset(run);
    else startNew();
  }

  function challengeResult(nextDecisions: readonly Decision[], nextKept: readonly FootballRankFiveItem[]) {
    const graded = scoreFootballKeepCutSelection(run.lineup, nextKept.map((item) => item.id));
    return {
      decisions: [...nextDecisions],
      keptIds: graded.kept.map((item) => item.id),
      cutIds: graded.cut.map((item) => item.id),
      score: graded.score,
      correctComparisons: graded.correctComparisons,
    };
  }

  function decide(decision: Decision) {
    if (!current || complete) return;
    if (decision === "keep" && kept.length >= 4) return;
    if (decision === "cut" && cut.length >= 4) return;
    const next = [...decisions, decision];
    setDecisions(next);
    if (next.length === run.lineup.length) {
      const finalKept = run.lineup.filter((_item, index) => next[index] === "keep");
      const finalResult = challengeResult(next, finalKept);
      recordLineupCompletion(run.identity, {
        packId: run.pack.id,
        ...finalResult,
      });
      if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
        profileMatch.submitResult(asChallengeJson(finalResult));
      }
    }
  }

  async function challengeSomeone() {
    if (!result) return;
    const creatorResult = challengeResult(decisions, result.kept);
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "keep-cut",
      gameVersion: "football-keep-cut-v1",
      gameTitle: "Football Keep 4 / Cut 4",
      summary: `${run.pack.name} · same eight subjects`,
      setup: asChallengeJson({
        packId: run.pack.id,
        lineupIds: run.lineup.map((item) => item.id),
        lineup: run.lineup.map((item) => ({ id: item.id, name: item.name })),
      }),
      creatorResult: asChallengeJson(creatorResult),
      shareTitle: "Football Keep 4 / Cut 4 Challenge",
      shareText: `I challenged you to make Keep/Cut calls on the same eight football subjects in ${run.pack.name}.`,
      shareUrl: footballChallengeUrl("/back-room/football/keep-cut", {
        pack: run.pack.id,
        lineup: run.lineup.map((item) => item.id).join(","),
      }),
    });
    setChallengeStatus(status);
  }

  if (result) {
    return (
      <div className="page football-debate-page football-keep-cut-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent these exact eight football subjects.</strong>
            <small>Both Keep/Cut boards reveal after you finish.</small>
          </section>
        ) : null}
        <section className="football-debate-result-hero">
          <p className="eyebrow">THE BACK ROOM · KEEP 4 / CUT 4</p>
          <strong>{result.score}<small>/100</small></strong>
          <span>{result.label} · {result.topFourKept}/4 Back Room keeps</span>
        </section>

        <div className="football-debate-result-grid">
          <ResultList title="YOUR FOUR" items={result.kept} packId={run.pack.id} />
          <ResultList title="BACK ROOM FOUR" items={result.topFour} packId={run.pack.id} />
        </div>

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

  const keepFull = kept.length >= 4;
  const cutFull = cut.length >= 4;
  const instruction = keepFull
    ? "KEEP IS FULL — THIS ONE HAS TO GO"
    : cutFull
      ? "CUT IS FULL — THIS ONE HAS TO STAY"
      : "MAKE THE CALL. IT LOCKS IMMEDIATELY.";

  return (
    <div className="page football-debate-page football-keep-cut-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent these exact eight football subjects.</strong>
          <small>Make all eight locked calls to reveal the matchup.</small>
        </section>
      ) : null}
      <section className="football-debate-intro">
        <div>
          <p className="eyebrow">THE BACK ROOM · FOOTBALL</p>
          <h1>{run.pack.prompt}</h1>
          <p>{run.pack.intro}</p>
        </div>
        <div className="football-debate-category">
          <small>CURRENT CATEGORY</small>
          <strong>{run.pack.name}</strong>
          {!shared ? <button type="button" onClick={startNew}>NEW LINEUP</button> : null}
        </div>
      </section>

      <section className="football-keep-cut-board">
        <header><strong>REVEAL {decisions.length + 1} OF 8</strong><span>{run.pack.name}</span></header>
        <div className="football-keep-cut-trays">
          <Tray title="keep" items={kept} packId={run.pack.id} />
          <Tray title="cut" items={cut} packId={run.pack.id} />
        </div>

        {current ? (
          <article className="football-keep-cut-current">
            <FootballSubjectVisual item={current} packId={run.pack.id} />
            <div>
              <p className="eyebrow">{current.league} · LOCKED DECISION</p>
              <h2>{current.name}</h2>
              <p>{current.subtitle}</p>
              <small className={keepFull || cutFull ? "is-forced" : ""}>{instruction}</small>
            </div>
            <div className="football-keep-cut-current__actions">
              <button className="is-keep" type="button" disabled={keepFull} onClick={() => decide("keep")}>KEEP</button>
              <button className="is-cut" type="button" disabled={cutFull} onClick={() => decide("cut")}>CUT</button>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
