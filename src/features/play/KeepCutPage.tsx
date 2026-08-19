import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { GameResultActions } from "./GameResultActions";
import { KeepCutResultSummary } from "./KeepCutResultSummary";
import {
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  keepCutChallengeUrl,
  keepCutPool,
  resolveKeepCutChallenge,
  scoreKeepCutSelection,
  type KeepCutLineup,
  type KeepCutPackId,
} from "./keepCutEngine";
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
import type { PlayFighter } from "./playFighterPool";

type KeepCutChoice = "keep" | "cut";

interface KeepCutRun {
  lineup: KeepCutLineup;
  identity: PlayLineupIdentity;
}

function validPack(value: string | null): value is KeepCutPackId {
  return KEEP_CUT_PACKS.some((pack) => pack.id === value);
}

function randomKeepCutPack(exclude?: KeepCutPackId): KeepCutPackId {
  const candidates = exclude && KEEP_CUT_PACKS.length > 1
    ? KEEP_CUT_PACKS.filter((pack) => pack.id !== exclude)
    : KEEP_CUT_PACKS;
  const random = seededLineupRandom("keep-cut", "category", createReplaySeed("keep-cut-category"));
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

function casualKeepCutRun(packId: KeepCutPackId): KeepCutRun {
  const pool = keepCutPool(packId);
  const validIds = new Set(pool.map((fighter) => fighter.id));
  const selected = selectReplayLineup({
    gameId: "keep-cut",
    scopeId: packId,
    lineupSize: 8,
    attempts: 14,
    validItemIds: validIds,
    validFighterIds: validIds,
    build: (seed) => {
      const lineup = createKeepCutLineup(packId, seed);
      const ids = lineup.fighters.map((fighter) => fighter.id);
      return { value: lineup, itemIds: ids, fighterIds: ids };
    },
  });
  return { lineup: selected.value, identity: selected.identity };
}

function challengeLineup(packId: KeepCutPackId, fighters: PlayFighter[]): KeepCutLineup {
  return {
    packId,
    seed: "friend-challenge",
    fighters,
    assignments: [],
    shape: "friend-challenge",
    recentOverlap: 0,
    repeatedShape: false,
    attemptsUsed: 0,
    fallbackUsed: false,
  };
}

function curatedKeepCutRun(
  packId: KeepCutPackId,
  fighters: PlayFighter[],
  challengeId: string,
): KeepCutRun {
  const lineup = challengeLineup(packId, fighters);
  const ids = fighters.map((fighter) => fighter.id);
  const identity = curatedLineupIdentity("keep-cut", challengeId, ids, packId);
  rememberLineup(identity, ids, ids);
  return { lineup, identity };
}

function FighterTile({ fighter, compact = false }: { fighter: PlayFighter; compact?: boolean }) {
  return (
    <article className={`keep-cut-fighter${compact ? " keep-cut-fighter--compact" : ""}`}>
      <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="keep-cut-fighter__photo" />
      <span><strong>{fighter.name}</strong><small>{fighter.divisions.join(" / ")} · {fighter.mainEra}</small></span>
    </article>
  );
}

function DecisionTray({ title, fighters }: { title: KeepCutChoice; fighters: PlayFighter[] }) {
  return (
    <section className={`keep-cut-tray keep-cut-tray--${title}`}>
      <header><strong>{title.toUpperCase()}</strong><span>{fighters.length}/4</span></header>
      <div className="keep-cut-tray__slots">
        {Array.from({ length: 4 }, (_, index) => {
          const fighter = fighters[index];
          return fighter ? (
            <FighterTile fighter={fighter} compact key={fighter.id} />
          ) : (
            <div className="keep-cut-empty-slot" key={index}><span>{index + 1}</span></div>
          );
        })}
      </div>
    </section>
  );
}

export default function KeepCutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("keep-cut");
  const profileSetup = record(profileMatch.challenge?.setup);
  const profilePackValue = typeof profileSetup?.packId === "string" ? profileSetup.packId : null;
  const profilePack = validPack(profilePackValue) ? profilePackValue : null;
  const profileLineupIds = strings(profileSetup?.lineupIds);
  const profileLineup = profilePack ? resolveKeepCutChallenge(profilePack, profileLineupIds) : null;
  const requestedPackValue = searchParams.get("pack");
  const requestedPack = validPack(requestedPackValue) ? requestedPackValue : null;
  const queryLineup = searchParams.get("lineup") ?? "";
  const queryResolvedChallenge = useMemo(() => {
    if (!requestedPack) return null;
    const ids = queryLineup.split(",").map((id) => id.trim()).filter(Boolean);
    return resolveKeepCutChallenge(requestedPack, ids);
  }, [queryLineup, requestedPack]);
  const resolvedChallenge = profileLineup ?? queryResolvedChallenge;
  const sharedPack = profileLineup && profilePack
    ? profilePack
    : queryResolvedChallenge && requestedPack
      ? requestedPack
      : null;
  const casualInitialPack = useMemo(() => randomKeepCutPack(), []);
  const initialPack = sharedPack ?? casualInitialPack;
  const challengeId = profileMatch.challenge?.code
    ?? `shared:${initialPack}:${resolvedChallenge?.map((fighter) => fighter.id).join("|") ?? "invalid"}`;
  const [run, setRun] = useState<KeepCutRun>(() =>
    resolvedChallenge
      ? curatedKeepCutRun(initialPack, resolvedChallenge, challengeId)
      : casualKeepCutRun(initialPack),
  );
  const [decisions, setDecisions] = useState<KeepCutChoice[]>([]);
  const [shareStatus, setShareStatus] = useState("");

  const lineup = run.lineup;
  const pack = KEEP_CUT_PACKS.find((row) => row.id === lineup.packId) ?? KEEP_CUT_PACKS[0]!;
  const complete = decisions.length === lineup.fighters.length;
  const kept = lineup.fighters.filter((_fighter, index) => decisions[index] === "keep");
  const cut = lineup.fighters.filter((_fighter, index) => decisions[index] === "cut");
  const current = lineup.fighters[decisions.length];
  const result = useMemo(() => {
    if (decisions.length !== lineup.fighters.length) return null;
    const keptIds = lineup.fighters
      .filter((_fighter, index) => decisions[index] === "keep")
      .map((fighter) => fighter.id);
    return scoreKeepCutSelection(lineup.packId, lineup.fighters, keptIds);
  }, [decisions, lineup]);
  const isChallenge = run.identity.type === "curated";

  useEffect(() => {
    if (!result) return;
    const persistedResult = {
      keptIds: result.keptIds,
      cutIds: result.cutIds,
      correctComparisons: result.correctComparisons,
      modelTopFourKept: result.modelTopFourKept,
      score: result.score,
      label: result.label,
    };
    recordLineupCompletion(run.identity, persistedResult);
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asJson(persistedResult));
    }
  }, [profileMatch, result, run.identity]);

  function resetDecisions() {
    setDecisions([]);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setRun(casualKeepCutRun(randomKeepCutPack(lineup.packId)));
    resetDecisions();
  }

  function replay() {
    if (run.identity.type === "replayable") startNew();
    else resetDecisions();
  }

  function decide(choice: KeepCutChoice) {
    if (!current || complete) return;
    if (choice === "keep" && kept.length >= 4) return;
    if (choice === "cut" && cut.length >= 4) return;
    setDecisions((rows) => [...rows, choice]);
  }

  async function challengeSomeone() {
    if (!result) return;
    setShareStatus("");
    const status = await beginChallenge({
      gameId: "keep-cut",
      gameVersion: "keep-cut-v3",
      gameTitle: "Keep 4, Cut 4",
      summary: `${pack.name} · blind eight-fighter reveal`,
      setup: asJson({
        packId: lineup.packId,
        lineupIds: lineup.fighters.map((fighter) => fighter.id),
      }),
      creatorResult: asJson({
        keptIds: result.keptIds,
        cutIds: result.cutIds,
        correctComparisons: result.correctComparisons,
        modelTopFourKept: result.modelTopFourKept,
        score: result.score,
        label: result.label,
      }),
      shareTitle: "UFC Keep 4, Cut 4 Challenge",
      shareText: `Make eight locked blind Keep/Cut calls on my exact ${pack.name} lineup.`,
      shareUrl: keepCutChallengeUrl(lineup.packId, lineup.fighters),
    });
    setShareStatus(status);
  }

  if (result) {
    return (
      <div className="page keep-cut-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact blind reveal order.</strong>
            <small>Both private scores reveal after all eight locked decisions.</small>
          </section>
        ) : null}
        <KeepCutResultSummary
          board={lineup.fighters}
          keptIds={result.keptIds}
          packId={lineup.packId}
          score={result.score}
          scoreLabel={result.label}
          topFourKept={result.modelTopFourKept}
        />
        <section className="keep-cut-results">
          <GameResultActions
            onChallenge={() => void challengeSomeone()}
            onReplay={replay}
            onAllGames={() => navigate("/play")}
            replayLabel={replayLabelFor(run.identity.type)}
            status={shareStatus}
          />
        </section>
      </div>
    );
  }

  const keepFull = kept.length >= 4;
  const cutFull = cut.length >= 4;
  const forced = keepFull
    ? "KEEP IS FULL — THIS FIGHTER MUST BE CUT"
    : cutFull
      ? "CUT IS FULL — THIS FIGHTER MUST BE KEPT"
      : "MAKE THE CALL. IT LOCKS IMMEDIATELY.";

  return (
    <div className="page keep-cut-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact blind reveal order.</strong>
          <small>Each decision locks. The remaining fighters stay hidden.</small>
        </section>
      ) : null}
      <section className="keep-cut-intro">
        <div className="keep-cut-intro__copy">
          <p className="eyebrow">{isChallenge ? "FRIEND CHALLENGE" : "BLIND KEEP 4 · CUT 4"}</p>
          <h1>{pack.prompt}</h1>
          <p>{pack.description} Eight fighters arrive one at a time. Every call locks, and you will not see who comes next.</p>
        </div>
        {!isChallenge ? (
          <div className="keep-cut-intro__controls">
            <button className="keep-cut-new-lineup" type="button" onClick={startNew}>NEW LINEUP</button>
          </div>
        ) : null}
      </section>

      <section className="keep-cut-game-card">
        <header className="keep-cut-progress" aria-live="polite">
          <strong>FIGHTER {decisions.length + 1} OF 8</strong>
          <span>{pack.group} · {pack.name}</span>
        </header>

        <div className="keep-cut-board">
          <DecisionTray title="keep" fighters={kept} />
          <DecisionTray title="cut" fighters={cut} />
        </div>

        {current ? (
          <section
            className="keep-cut-current"
            style={{ gridTemplateColumns: "96px minmax(0, 1fr)" }}
          >
            <FighterPhoto
              name={current.name}
              src={current.thumbUrl}
              className="keep-cut-current__photo"
              style={{
                width: "96px",
                height: "96px",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <div>
              <span>REVEAL {decisions.length + 1} OF 8</span>
              <h2>{current.name}</h2>
              <p>{current.divisions.join(" / ")} · {current.mainEra}</p>
              <small className={keepFull || cutFull ? "is-forced" : ""}>{forced}</small>
              <div className="keep-cut-current__actions">
                <button type="button" className="keep" disabled={keepFull} onClick={() => decide("keep")}>KEEP</button>
                <button type="button" className="cut" disabled={cutFull} onClick={() => decide("cut")}>CUT</button>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
