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
  keepCutChallengeUrl,
  keepCutPool,
  resolveKeepCutChallenge,
  scoreKeepCutSelection,
  type KeepCutLineup,
  type KeepCutPackId,
} from "./keepCutEngine";
import {
  curatedLineupIdentity,
  recordLineupCompletion,
  rememberLineup,
  replayLabelFor,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "./lineupModel";
import type { PlayFighter } from "./playFighterPool";

interface KeepCutRun {
  lineup: KeepCutLineup;
  identity: PlayLineupIdentity;
}

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

function DecisionTray({ title, fighters }: { title: "keep" | "cut"; fighters: PlayFighter[] }) {
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
  const queryLineup = searchParams.get("lineup") ?? "";
  const resolvedChallenge = useMemo(() => {
    if (profileLineup) return profileLineup;
    const ids = queryLineup.split(",").map((id) => id.trim()).filter(Boolean);
    return resolveKeepCutChallenge(initialPack, ids);
  }, [initialPack, profileLineup, queryLineup]);
  const challengeId = profileMatch.challenge?.code
    ?? `shared:${initialPack}:${resolvedChallenge?.map((fighter) => fighter.id).join("|") ?? "invalid"}`;
  const [run, setRun] = useState<KeepCutRun>(() =>
    resolvedChallenge
      ? curatedKeepCutRun(initialPack, resolvedChallenge, challengeId)
      : casualKeepCutRun(initialPack),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const lineup = run.lineup;
  const pack = KEEP_CUT_PACKS.find((row) => row.id === lineup.packId) ?? KEEP_CUT_PACKS[0]!;
  const result = useMemo(
    () => submitted ? scoreKeepCutSelection(lineup.packId, lineup.fighters, selectedIds) : null,
    [lineup, selectedIds, submitted],
  );
  const kept = result?.kept ?? lineup.fighters.filter((fighter) => selectedIds.includes(fighter.id));
  const cut = result?.cut ?? [];
  const canSubmit = selectedIds.length === 4;
  const isChallenge = run.identity.type === "curated";
  const groupedPacks = useMemo(() => ["Careers", "Divisions", "Skills"].map((group) => ({
    group,
    rows: KEEP_CUT_PACKS.filter((row) => row.group === group),
  })), []);

  useEffect(() => {
    if (!result) return;
    const persistedResult = {
      keptIds: result.keptIds,
      cutIds: result.cutIds,
      score: result.score,
      label: result.label,
    };
    recordLineupCompletion(run.identity, persistedResult);
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asJson(persistedResult));
    }
  }, [profileMatch, result, run.identity]);

  function resetDecisions() {
    setSelectedIds([]);
    setSubmitted(false);
    setShareStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew(packId: KeepCutPackId = lineup.packId) {
    setRun(casualKeepCutRun(packId));
    resetDecisions();
  }

  function replay() {
    if (run.identity.type === "replayable") startNew();
    else resetDecisions();
  }

  function toggleKeep(fighterId: string) {
    if (submitted) return;
    setSelectedIds((ids) => ids.includes(fighterId)
      ? ids.filter((id) => id !== fighterId)
      : ids.length < 4 ? [...ids, fighterId] : ids);
  }

  function submit() {
    if (!canSubmit) return;
    setSubmitted(true);
  }

  async function challengeSomeone() {
    if (!result) return;
    setShareStatus("");
    const status = await beginChallenge({
      gameId: "keep-cut",
      gameVersion: "keep-cut-v2",
      gameTitle: "Keep 4, Cut 4",
      summary: `${pack.name} · exact eight-fighter board`,
      setup: asJson({
        packId: lineup.packId,
        lineupIds: lineup.fighters.map((fighter) => fighter.id),
      }),
      creatorResult: asJson({
        keptIds: result.keptIds,
        cutIds: result.cutIds,
        score: result.score,
        label: result.label,
      }),
      shareTitle: "UFC Keep 4, Cut 4 Challenge",
      shareText: `Select four keeps from my exact ${pack.name} board.`,
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
            <strong>{profileMatch.creator.displayName} sent this exact eight-fighter board.</strong>
            <small>Both private scores reveal after you submit your four keeps.</small>
          </section>
        ) : null}
        <section className="keep-cut-result-hero">
          <p className="eyebrow">SUBMITTED RESULT</p>
          <h1>{result.score}/100 · {result.label}</h1>
          <p>{pack.name} · four kept, four cut. Private score grades only your kept fighters.</p>
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
            onReplay={replay}
            onAllGames={() => navigate("/play")}
            replayLabel={replayLabelFor(run.identity.type)}
            status={shareStatus}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page keep-cut-page">
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact eight-fighter board.</strong>
          <small>Your four keeps remain private until you submit.</small>
        </section>
      ) : null}
      <section className="keep-cut-intro">
        <div className="keep-cut-intro__copy">
          <p className="eyebrow">{isChallenge ? "FRIEND CHALLENGE" : "REPLAYABLE GAME"}</p>
          <h1>{pack.prompt}</h1>
          <p>{pack.description} All eight fighters are available now. Select exactly four to keep.</p>
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
            {isChallenge ? "SHARED BOARD" : "NEW BOARD"}
          </button>
        </div>
      </section>

      <section className="keep-cut-game-card">
        <header className="keep-cut-progress">
          <strong>{selectedIds.length} of 4 kept</strong>
          <span>{pack.group} · {pack.name}</span>
        </header>

        <div className="keep-cut-board keep-cut-board--selection">
          {lineup.fighters.map((fighter) => {
            const selected = selectedIds.includes(fighter.id);
            return (
              <button
                type="button"
                className={`keep-cut-select-card${selected ? " is-kept" : ""}`}
                onClick={() => toggleKeep(fighter.id)}
                key={fighter.id}
                aria-pressed={selected}
              >
                <FighterTile fighter={fighter} />
                <strong>{selected ? "KEEP" : selectedIds.length >= 4 ? "CUT" : "TAP TO KEEP"}</strong>
              </button>
            );
          })}
        </div>

        <button type="button" className="keep-cut-submit" disabled={!canSubmit} onClick={submit}>
          {canSubmit ? "SUBMIT FOUR KEEPS" : `SELECT ${4 - selectedIds.length} MORE KEEP${4 - selectedIds.length === 1 ? "" : "S"}`}
        </button>
      </section>
    </div>
  );
}
