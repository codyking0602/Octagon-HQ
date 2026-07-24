import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  BETTER_THAN_LENSES,
  DEFAULT_BETTER_THAN_TARGET,
  betterThanChallengeUrl,
  betterThanEligible,
  betterThanLens,
  betterThanMaxClaim,
  betterThanPool,
  betterThanPoolOptions,
  betterThanStatement,
  compareBetterThanClaims,
  resolveBetterThanChallenge,
  type BetterThanChallenge,
  type BetterThanLensId,
  type BetterThanPoolId,
} from "./betterThanEngine";
import { shareGameChallenge } from "./challengeShare";
import { GameResultActions } from "./GameResultActions";
import { getPlayFighter, rankedPlayFighters, type PlayFighter } from "./playFighterPool";

function FighterRow({ fighter, selected = false, onClick }: { fighter: PlayFighter; selected?: boolean; onClick?: () => void }) {
  const content = (
    <>
      <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="better-than-fighter__photo" />
      <span><strong>{fighter.name}</strong><small>{fighter.divisions.join(" / ")}</small></span>
      <em>{selected ? "IN MY CLAIM" : "ADD"}</em>
    </>
  );
  return onClick ? (
    <button className={`better-than-fighter${selected ? " is-selected" : ""}`} type="button" onClick={onClick}>{content}</button>
  ) : (
    <article className={`better-than-fighter${selected ? " is-selected" : ""}`}>{content}</article>
  );
}

function ResultList({ title, fighters }: { title: string; fighters: readonly PlayFighter[] }) {
  return (
    <section className="better-than-result-list">
      <header><span>{title}</span><strong>{fighters.length}</strong></header>
      <div>{fighters.map((fighter) => <FighterRow fighter={fighter} key={fighter.id} />)}</div>
    </section>
  );
}

export default function BetterThanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incoming = resolveBetterThanChallenge({
    targetId: searchParams.get("target"),
    lensId: searchParams.get("lens"),
    poolId: searchParams.get("pool"),
    claimCount: searchParams.get("count"),
    selectionIds: searchParams.get("selections"),
  });

  const defaultTarget = getPlayFighter(DEFAULT_BETTER_THAN_TARGET) ?? rankedPlayFighters[0];
  const [targetId, setTargetId] = useState(incoming?.target.id ?? defaultTarget.id);
  const [lensId, setLensId] = useState<BetterThanLensId>(incoming?.lens.id ?? "overall");
  const [poolId, setPoolId] = useState<BetterThanPoolId>(incoming?.pool.id ?? "all");
  const [claimCount, setClaimCount] = useState(incoming?.claimCount ?? 5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [locked, setLocked] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const target = getPlayFighter(targetId) ?? defaultTarget;
  const lens = betterThanLens(lensId);
  const pool = betterThanPool(target, poolId);
  const eligible = useMemo(() => betterThanEligible(target.id, pool.id), [target.id, pool.id]);
  const maxClaim = betterThanMaxClaim(target.id, pool.id);
  const byId = useMemo(() => new Map(eligible.map((fighter) => [fighter.id, fighter])), [eligible]);
  const selectedFighters = [...selected].map((id) => byId.get(id)).filter((fighter): fighter is PlayFighter => Boolean(fighter));
  const filtered = eligible.filter((fighter) => `${fighter.name} ${fighter.divisions.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  const challengeMode = Boolean(incoming);
  const ready = selected.size === claimCount;

  function resetSelections(nextCount = claimCount) {
    setSelected(new Set());
    setClaimCount(Math.max(1, Math.min(nextCount, betterThanMaxClaim(target.id, pool.id))));
    setLocked(false);
    setShareStatus("");
  }

  function toggle(id: string) {
    if (locked) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < claimCount) next.add(id);
      return next;
    });
  }

  function changeTarget(nextId: string) {
    const nextTarget = getPlayFighter(nextId) ?? target;
    setTargetId(nextTarget.id);
    setPoolId("all");
    setSelected(new Set());
    setClaimCount(Math.min(5, betterThanMaxClaim(nextTarget.id, "all")));
    setLocked(false);
  }

  function changePool(nextPool: BetterThanPoolId) {
    setPoolId(nextPool);
    setSelected(new Set());
    setClaimCount(Math.min(claimCount, betterThanMaxClaim(target.id, nextPool)));
    setLocked(false);
  }

  function currentChallenge(): BetterThanChallenge {
    return { target, lens, pool, claimCount, selections: selectedFighters };
  }

  async function challengeSomeone() {
    if (!ready) return;
    setShareStatus("");
    const status = await shareGameChallenge({
      title: "UFC Better Than Challenge",
      text: `I made this claim: ${betterThanStatement(target, lens, pool, claimCount)} Build your counterclaim before my list is revealed.`,
      url: betterThanChallengeUrl(currentChallenge()),
    });
    setShareStatus(status);
  }

  if (locked) {
    const statement = betterThanStatement(target, lens, pool, claimCount);
    const comparison = incoming ? compareBetterThanClaims(incoming, claimCount, selectedFighters) : null;
    const narrower = comparison?.narrower === "same"
      ? "You made claims of the same size."
      : comparison?.narrower === "responder"
        ? `You made the narrower claim by ${incoming!.claimCount - claimCount}.`
        : comparison
          ? `The original claim was narrower by ${claimCount - incoming!.claimCount}.`
          : "";

    return (
      <div className="page better-than-page">
        <section className="better-than-result-hero">
          <p className="eyebrow">{comparison ? "CLAIMS REVEALED" : "CLAIM LOCKED"}</p>
          <h1>{comparison ? `${comparison.shared.length} SHARED NAMES · ${comparison.overlapPct}% OVERLAP` : statement}</h1>
          <p>{comparison ? `${narrower} Smaller does not mean officially correct—the disagreement is the game.` : "This is your argument, not an official model verdict."}</p>
        </section>

        {comparison ? (
          <section className="better-than-comparison">
            <div className="better-than-duel">
              <article><span>YOUR NUMBER</span><strong>{claimCount}</strong></article>
              <b>VS</b>
              <article><span>ORIGINAL NUMBER</span><strong>{incoming!.claimCount}</strong></article>
            </div>
            <ResultList title="SHARED NAMES" fighters={comparison.shared} />
            <div className="better-than-split-results">
              <ResultList title="ONLY ON YOUR LIST" fighters={comparison.responderOnly} />
              <ResultList title="ONLY ON THEIR LIST" fighters={comparison.creatorOnly} />
            </div>
          </section>
        ) : (
          <section className="better-than-locked-card">
            <article className="better-than-target-card">
              <FighterPhoto name={target.name} src={target.profileUrl || target.thumbUrl} className="better-than-target-card__photo" />
              <span><small>CHALLENGE FIGHTER</small><strong>{target.name}</strong><em>{lens.label}</em></span>
            </article>
            <ResultList title="YOUR EXACT LIST" fighters={selectedFighters} />
          </section>
        )}

        <GameResultActions
          onChallenge={() => void challengeSomeone()}
          onReplay={() => resetSelections(challengeMode ? incoming!.claimCount : 5)}
          onAllGames={() => navigate("/play")}
          status={shareStatus}
        />
      </div>
    );
  }

  return (
    <div className="page better-than-page">
      <section className="better-than-intro">
        <div>
          <p className="eyebrow">{challengeMode ? "FRIEND CHALLENGE" : "SUBJECTIVE CLAIM BUILDER"}</p>
          <h1>{challengeMode ? "Build your counterclaim." : "Make a UFC argument."}</h1>
          <p>{challengeMode ? "The original exact list stays hidden until you lock yours." : "Choose the fighter, debate lens, eligible pool, and exact names you can defend."}</p>
        </div>
        <article>
          <FighterPhoto name={target.name} src={target.profileUrl || target.thumbUrl} className="better-than-featured__photo" />
          <span><small>CHALLENGE FIGHTER</small><strong>{target.name}</strong><em>YOUR CALL</em></span>
        </article>
      </section>

      <section className="better-than-controls">
        <label><span>CHALLENGE FIGHTER</span><select value={target.id} disabled={challengeMode} onChange={(event) => changeTarget(event.target.value)}>{rankedPlayFighters.map((fighter) => <option value={fighter.id} key={fighter.id}>{fighter.name}</option>)}</select></label>
        <label><span>BETTER AT</span><select value={lens.id} disabled={challengeMode} onChange={(event) => { setLensId(event.target.value as BetterThanLensId); setSelected(new Set()); }}>{BETTER_THAN_LENSES.map((row) => <option value={row.id} key={row.id}>{row.label}</option>)}</select></label>
        <label><span>ELIGIBLE POOL</span><select value={pool.id} disabled={challengeMode} onChange={(event) => changePool(event.target.value as BetterThanPoolId)}>{betterThanPoolOptions(target).map((row) => <option value={row.id} key={row.id}>{row.label}</option>)}</select></label>
        <div className="better-than-count-control"><span>MY NUMBER</span><div><button type="button" disabled={claimCount <= 1} onClick={() => { setClaimCount((count) => Math.max(1, count - 1)); setSelected(new Set()); }}>−</button><strong>{claimCount}</strong><button type="button" disabled={claimCount >= maxClaim} onClick={() => { setClaimCount((count) => Math.min(maxClaim, count + 1)); setSelected(new Set()); }}>+</button></div><small>1–{maxClaim} allowed</small></div>
      </section>

      <section className="better-than-statement-card">
        <span>{challengeMode ? "YOUR COUNTERCLAIM" : "YOUR CLAIM"}</span>
        <strong>{betterThanStatement(target, lens, pool, claimCount, challengeMode ? "You" : "I")}</strong>
        {challengeMode ? <small>Original claim: {incoming!.claimCount} names. Their exact list is hidden.</small> : null}
      </section>

      <section className="better-than-selected">
        <header><div><span>YOUR EXACT LIST</span><strong>{selected.size}/{claimCount} selected</strong></div><button type="button" onClick={() => setSelected(new Set())}>CLEAR</button></header>
        <div>{selectedFighters.length ? selectedFighters.map((fighter) => <FighterRow fighter={fighter} selected onClick={() => toggle(fighter.id)} key={fighter.id} />) : <p>Tap fighters below to build the claim.</p>}</div>
      </section>

      <section className="better-than-roster">
        <header><div><span>FIGHTER POOL</span><strong>{filtered.length} shown · {eligible.length} eligible</strong></div></header>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search eligible fighters" />
        <div className="better-than-grid">{filtered.map((fighter) => <FighterRow fighter={fighter} selected={selected.has(fighter.id)} onClick={() => toggle(fighter.id)} key={fighter.id} />)}</div>
        <button className="better-than-lock" type="button" disabled={!ready} onClick={() => setLocked(true)}>LOCK MY CLAIM</button>
      </section>
    </div>
  );
}
