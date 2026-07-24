import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeJson } from "../challenges/challengeModel";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { GameResultActions } from "./GameResultActions";
import {
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  createKeepCutSeed,
  keepCutChallengeUrl,
  loadKeepCutHistory,
  resolveKeepCutChallenge,
  saveKeepCutLineup,
  type KeepCutLineup,
  type KeepCutPackId,
} from "./keepCutEngine";
import type { PlayFighter } from "./playFighterPool";

type KeepCutChoice = "keep" | "cut";

function validPack(value: string | null): value is KeepCutPackId {
  return KEEP_CUT_PACKS.some((pack) => pack.id === value);
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

function generatedLineup(packId: KeepCutPackId) {
  const lineup = createKeepCutLineup(packId, createKeepCutSeed(), loadKeepCutHistory(packId));
  saveKeepCutLineup(lineup);
  return lineup;
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
  };
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
  const requestedPack = searchParams.get("pack");
  const initialPack = profilePack ?? (validPack(requestedPack) ? requestedPack : "ufc-careers");
  const challengeIds = (searchParams.get("lineup") ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  const resolvedChallenge = profileLineup ?? resolveKeepCutChallenge(initialPack, challengeIds);
  const [lineup, setLineup] = useState<KeepCutLineup>(() =>
    resolvedChallenge ? challengeLineup(initialPack, resolvedChallenge) : generatedLineup(initialPack),
  );
  const [decisions, setDecisions] = useState<KeepCutChoice[]>([]);
  const [shareStatus, setShareStatus] = useState("");

  const pack = KEEP_CUT_PACKS.find((row) => row.id === lineup.packId) ?? KEEP_CUT_PACKS[0]!;
  const complete = decisions.length === 8;
  const kept = lineup.fighters.filter((_fighter, index) => decisions[index] === "keep");
  const cut = lineup.fighters.filter((_fighter, index) => decisions[index] === "cut");
  const current = lineup.fighters[decisions.length];
  const isChallenge = Boolean(resolvedChallenge && lineup.seed === "friend-challenge");
  const groupedPacks = useMemo(() => ["Serious", "Debate", "Entertainment", "Chaos"].map((group) => ({
    group,
    rows: KEEP_CUT_PACKS.filter((row) => row.group === group),
  })), []);

  useEffect(() => {
    if (!complete || !profileMatch.isRecipient || profileMatch.challenge?.responderResult !== null) return;
    profileMatch.submitResult(asJson({
      decisions,
      keptIds: kept.map((fighter) => fighter.id),
      cutIds: cut.map((fighter) => fighter.id),
    }));
  }, [complete, cut, decisions, kept, profileMatch]);

  function startNew(packId: KeepCutPackId = lineup.packId) {
    setLineup(generatedLineup(packId));
    setDecisions([]);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function decide(choice: KeepCutChoice) {
    if (!current || complete) return;
    if (choice === "keep" && kept.length >= 4) return;
    if (choice === "cut" && cut.length >= 4) return;
    setDecisions((rows) => [...rows, choice]);
  }

  async function challengeSomeone() {
    if (!complete) return;
    setShareStatus("");
    const status = await beginChallenge({
      gameId: "keep-cut",
      gameVersion: "keep-cut-v2",
      gameTitle: "Keep 4, Cut 4",
      summary: `${pack.name} · exact eight-fighter lineup`,
      setup: asJson({
        packId: lineup.packId,
        packName: pack.name,
        lineupIds: lineup.fighters.map((fighter) => fighter.id),
        lineup: lineup.fighters.map((fighter) => ({ id: fighter.id, name: fighter.name })),
      }),
      creatorResult: asJson({
        decisions,
        keptIds: kept.map((fighter) => fighter.id),
        cutIds: cut.map((fighter) => fighter.id),
      }),
      shareTitle: "UFC Keep 4, Cut 4 Challenge",
      shareText: `Keep four and cut four from my exact ${pack.name} lineup. Every decision locks.`,
      shareUrl: keepCutChallengeUrl(lineup.packId, lineup.fighters),
    });
    setShareStatus(status);
  }

  if (complete) {
    return (
      <div className="page keep-cut-page">
        {profileMatch.creator ? (
          <section className="challenge-game-banner">
            <span>PROFILE CHALLENGE</span>
            <strong>{profileMatch.creator.displayName} sent this exact eight-fighter lineup.</strong>
            <small>Both Keep/Cut cards reveal after your eighth call.</small>
          </section>
        ) : null}
        <section className="keep-cut-result-hero">
          <p className="eyebrow">EIGHT CALLS LOCKED</p>
          <h1>YOUR KEEP/CUT CARD</h1>
          <p>{pack.name} · four kept, four cut.</p>
        </section>
        <section className="keep-cut-results">
          <div className="keep-cut-result-group keep-cut-result-group--keep">
            <header><span>YOUR FOUR</span><strong>KEPT</strong></header>
            <div>{kept.map((fighter) => <FighterTile fighter={fighter} key={fighter.id} />)}</div>
          </div>
          <div className="keep-cut-result-group keep-cut-result-group--cut">
            <header><span>YOUR FOUR</span><strong>CUT</strong></header>
            <div>{cut.map((fighter) => <FighterTile fighter={fighter} key={fighter.id} />)}</div>
          </div>
          <GameResultActions
            onChallenge={() => void challengeSomeone()}
            onReplay={() => startNew()}
            onAllGames={() => navigate("/play")}
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
          <strong>{profileMatch.creator.displayName} sent this exact eight-fighter lineup.</strong>
          <small>Your card remains hidden until all eight calls are locked.</small>
        </section>
      ) : null}
      <section className="keep-cut-intro">
        <div className="keep-cut-intro__copy">
          <p className="eyebrow">{isChallenge ? "FRIEND CHALLENGE" : "KEEP 4 · CUT 4"}</p>
          <h1>{pack.prompt}</h1>
          <p>{pack.description} You will not see who comes next.</p>
        </div>
        <div className="keep-cut-intro__controls">
          <label>
            <span>CATEGORY</span>
            <select
              value={lineup.packId}
              onChange={(event) => startNew(event.target.value as KeepCutPackId)}
              disabled={isChallenge}
            >
              {groupedPacks.map(({ group, rows }) => (
                <optgroup label={group} key={group}>
                  {rows.map((row) => <option value={row.id} key={row.id}>{row.name}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <button
            className="keep-cut-new-lineup"
            type="button"
            disabled={isChallenge}
            onClick={() => startNew()}
          >
            {isChallenge ? "SHARED LINEUP" : "NEW LINEUP"}
          </button>
        </div>
      </section>

      <section className="keep-cut-game-card">
        <header className="keep-cut-progress">
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
              style={{ width: "96px", height: "96px", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: "center" }}
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
