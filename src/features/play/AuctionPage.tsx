import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import {
  ULTIMATE_FIGHTER_CATEGORIES,
  auctionModeDefinition,
  auctionModes,
  type AuctionModeId,
  type UltimateFighterCategory,
} from "./auctionContract";
import {
  AuctionRepositoryError,
  createAuctionRepository,
  maximumLegalAuctionBid,
  validateAuctionBid,
  type AuctionProjection,
} from "./auctionRepository";

function Collection({ state, playerId, name }: { state: AuctionProjection; playerId: string; name: string }) {
  const mode = auctionModeDefinition(state.mode_id);
  const awards = state.awarded_collections.filter((item) => item.awarded_to === playerId);
  if (mode.usesUltimateFighterPlacement) {
    return (
      <div className="auction-slots" aria-label={`${name} build`}>
        {ULTIMATE_FIGHTER_CATEGORIES.map((category) => {
const award = awards.find((item) => item.category === category);
return (
  <span className={award ? "is-filled" : ""} key={category}>
    <small>{category}</small>
    <b>{award?.display_label ?? "OPEN"}</b>
  </span>
);
        })}
      </div>
    );
  }
  return (
    <div className="auction-slots" aria-label={`${name} collection`}>
      {Array.from({ length: mode.requiredSelectionsPerPlayer }, (_, index) => (
        <span className={awards[index] ? "is-filled" : ""} key={index}>
<small>PICK {index + 1}</small>
<b>{awards[index]?.display_label ?? "OPEN"}</b>
        </span>
      ))}
    </div>
  );
}

function RoundReveal({ state }: { state: AuctionProjection }) {
  const round = state.resolved_rounds.at(-1);
  if (!round) return null;
  const award = state.awarded_collections.find((item) => item.resolved_round === round.round);
  const winner = round.winner === state.challenger_id
    ? state.challenger_display_name
    : state.recipient_display_name;
  return (
    <section className="auction-result surface-card" aria-label="Latest resolved round">
      <p className="eyebrow">{round.forced ? "FORCED $1 ASSIGNMENT" : `ROUND ${round.round} RESULT`}</p>
      <h2>{award?.display_label ?? "Resolved item"}</h2>
      <strong>{winner} WON · ${round.charged_amount}</strong>
      {round.forced ? (
        <p>The server awarded this remaining item for $1 after the other collection filled.</p>
      ) : (
        <p>
{state.challenger_display_name} ${round.challenger_bid} · {state.recipient_display_name} ${round.recipient_bid}
{award?.category ? ` · ${award.category}` : ""}
        </p>
      )}
    </section>
  );
}


function AuctionFinalResult({ state }: { state: AuctionProjection }) {
  if (
    state.lifecycle_state !== "completed"
    || state.challenger_final_score === null
    || state.recipient_final_score === null
  ) return null;

  const verdict = state.is_tie
    ? "TRUE TIE"
    : state.winner_profile_id === state.challenger_id
      ? `${state.challenger_display_name} WINS`
      : `${state.recipient_display_name} WINS`;

  return (
    <section className="auction-final surface-card" aria-label="Auction final result">
      <p className="eyebrow">FINAL 0–100 SCORE</p>
      <h2>{verdict}</h2>
      <div>
        <article>
          <small>{state.challenger_display_name}</small>
          <strong>{state.challenger_final_score}</strong>
        </article>
        <span>–</span>
        <article>
          <small>{state.recipient_display_name}</small>
          <strong>{state.recipient_final_score}</strong>
        </article>
      </div>
    </section>
  );
}

function AuctionBoard({
  state,
  profileId,
  busy,
  onBid,
  onReload,
  onCancel,
  onDecline,
  onAbandon,
  onRematch,
  onShare,
  shareStatus,
}: {
  state: AuctionProjection;
  profileId: string;
  busy: boolean;
  onBid(amount: number, category?: UltimateFighterCategory): void;
  onReload(): void;
  onCancel(): void;
  onDecline(): void;
  onAbandon(): void;
  onRematch(): void;
  onShare(): void;
  shareStatus: string;
}) {
  const mode = auctionModeDefinition(state.mode_id);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<UltimateFighterCategory | "">("");
  const [formError, setFormError] = useState("");
  const maximum = maximumLegalAuctionBid(state, profileId);
  const ownAwards = state.awarded_collections.filter((item) => item.awarded_to === profileId);
  const usedCategories = new Set(ownAwards.map((item) => item.category));
  const canBid = ["prepared", "sent", "active"].includes(state.lifecycle_state)
    && !state.current_user_submitted_bid
    && state.action_required_by !== "opponent"
    && !(state.lifecycle_state === "sent" && profileId === state.challenger_id);
  const tieName = state.tie_priority_profile_id === state.challenger_id
    ? state.challenger_display_name
    : state.recipient_display_name;
  const terminal = ["completed", "declined", "cancelled"].includes(state.lifecycle_state);
  const status = state.lifecycle_state === "prepared"
    ? "Your first bid sends this challenge"
    : state.lifecycle_state === "sent"
      ? profileId === state.recipient_id
        ? "Your first bid accepts this challenge"
        : "Waiting for opponent's first bid"
      : state.lifecycle_state === "active" && state.current_user_submitted_bid
        ? "Bid locked · waiting for opponent"
        : state.lifecycle_state === "active"
? "Your sealed bid is required"
: state.lifecycle_state === "completed"
  ? "Auction complete · collections locked"
  : state.lifecycle_state === "cancelled"
    ? "Cancelled · no winner, loss, score, or forfeit"
    : "Challenge declined";

  useEffect(() => {
    setAmount("");
    setCategory("");
    setFormError("");
  }, [state.auction_id, state.current_round, state.revision]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextError = validateAuctionBid(
      amount,
      maximum,
      mode.usesUltimateFighterPlacement,
      category,
    );
    setFormError(nextError);
    if (!nextError) onBid(Number(amount), category || undefined);
  }

  return (
    <div className="auction-board">
      <header className="auction-board__top">
        <div><p className="eyebrow">{mode.displayName}</p><h1>Auction</h1></div>
        <button type="button" onClick={onReload} disabled={busy}>REFRESH</button>
      </header>
      <section className="auction-scoreboard surface-card">
        <article>
<small>CHALLENGER</small><strong>{state.challenger_display_name}</strong>
<b>${state.challenger_bankroll}</b><em>{state.challenger_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
        </article>
        <span>VS</span>
        <article>
<small>OPPONENT</small><strong>{state.recipient_display_name}</strong>
<b>${state.recipient_bankroll}</b><em>{state.recipient_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
        </article>
      </section>
      <section className="auction-current surface-card">
        <div className="auction-current__meta">
<span>ROUND {Math.min(state.current_round, mode.rounds)} / {mode.rounds}</span>
<span>TIES → {tieName}</span>
        </div>
        <div className="auction-current__item">
<small>CURRENT ITEM</small>
<h2>{state.current_item?.display_label ?? (terminal ? "FINAL BELL" : "LOADING")}</h2>
        </div>
        <strong className="auction-current__status">{status}</strong>
      </section>
      <RoundReveal state={state} />
      <AuctionFinalResult state={state} />
      <section className="auction-collections">
        <article>
<h3>{state.challenger_display_name}</h3>
<Collection state={state} playerId={state.challenger_id} name={state.challenger_display_name} />
        </article>
        <article>
<h3>{state.recipient_display_name}</h3>
<Collection state={state} playerId={state.recipient_id} name={state.recipient_display_name} />
        </article>
      </section>
      {canBid ? (
        <form className="auction-bid surface-card" onSubmit={submit}>
{mode.usesUltimateFighterPlacement ? (
  <fieldset>
    <legend>PLACE FIGHTER</legend>
    {ULTIMATE_FIGHTER_CATEGORIES.map((value) => (
      <button
        type="button"
        key={value}
        className={category === value ? "is-selected" : ""}
        disabled={usedCategories.has(value)}
        onClick={() => setCategory(value)}
      >
        {value}
      </button>
    ))}
  </fieldset>
) : null}
<label>
  <span>SEALED BID · MAX ${maximum}</span>
  <div>
    <b>$</b>
    <input
      aria-label="Whole-dollar bid"
      inputMode="numeric"
      pattern="[0-9]*"
      value={amount}
      onChange={(event) => setAmount(event.target.value)}
    />
  </div>
</label>
{formError ? <p role="alert">{formError}</p> : null}
<button className="primary-action" disabled={busy} type="submit">
  {busy
    ? "LOCKING…"
    : state.lifecycle_state === "prepared"
      ? "LOCK BID & SEND"
      : state.lifecycle_state === "sent"
        ? "LOCK BID & ACCEPT"
        : "LOCK SEALED BID"}
</button>
        </form>
      ) : null}
      <footer className="auction-board__actions">
        {state.lifecycle_state === "prepared" ? (
<button type="button" disabled={busy} onClick={onAbandon}>ABANDON AUCTION</button>
        ) : null}
        {state.lifecycle_state === "sent" && profileId === state.recipient_id ? (
<button type="button" disabled={busy} onClick={onDecline}>DECLINE</button>
        ) : null}
        {state.lifecycle_state === "active" ? (
<button type="button" disabled={busy} onClick={onCancel}>CANCEL GAME</button>
        ) : null}
        {state.lifecycle_state === "completed" ? (
<button type="button" disabled={busy} onClick={onShare}>SHARE RESULT</button>
        ) : null}
        {terminal ? (
<button className="primary-action" type="button" disabled={busy} onClick={onRematch}>NEW AUCTION</button>
        ) : null}
      </footer>
      {shareStatus ? <p className="auction-share-status" role="status">{shareStatus}</p> : null}
    </div>
  );
}

export default function AuctionPage() {
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const repository = useMemo(() => createAuctionRepository(), []);
  const [state, setState] = useState<AuctionProjection | null>(null);
  const [mode, setMode] = useState<AuctionModeId | null>(null);
  const [opponentName, setOpponentName] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const submitting = useRef(false);
  const auctionId = params.get("auction") ?? "";

  useEffect(() => {
    let cancelled = false;
    setState(null);
    setError("");
    if (!auctionId || !identity.profile || !repository) {
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    void repository.read(auctionId)
      .then((nextState) => {
        if (!cancelled) setState(nextState);
      })
      .catch((nextError) => {
        if (!cancelled) {
setError(nextError instanceof Error ? nextError.message : "Auction could not be loaded.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [auctionId, identity.profile?.id, repository]);

  async function reload() {
    if (!repository || !auctionId || !identity.profile) return;
    setLoading(true);
    setError("");
    try {
      setState(await repository.read(auctionId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Auction could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function command(action: () => Promise<AuctionProjection>) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      setState(await action());
      await challenges.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Auction could not be updated.");
      if (nextError instanceof AuctionRepositoryError && nextError.stale) await reload();
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function returnToModeSelection() {
    setState(null);
    setMode(null);
    setOpponentName("");
    setError("");
    setShareStatus("");
    navigate("/play/auction", { replace: true });
  }

  async function prepare() {
    if (!repository || !mode || opponentName.trim().length < 2 || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const opponent = await challenges.findProfile(opponentName);
      if (!opponent) throw new Error("No Octagon HQ profile matched that exact name.");
      const prepared = await repository.prepare(opponent.id, mode);
      setState(prepared);
      navigate(`/play/auction?auction=${prepared.auction_id}`, { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Auction could not be prepared.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function abandon() {
    if (!repository || state?.lifecycle_state !== "prepared" || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await repository.abandon(state);
      await challenges.refresh();
      returnToModeSelection();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Auction could not be abandoned.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function decline() {
    if (!state?.challenge_code || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const declined = await challenges.dismissChallenge(state.challenge_code);
      if (!declined) {
        setError("Auction could not be declined.");
        return;
      }
      returnToModeSelection();
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  async function shareResult() {
    if (
      state?.lifecycle_state !== "completed"
      || state.challenger_final_score === null
      || state.recipient_final_score === null
    ) return;

    const verdict = state.is_tie
      ? "True tie"
      : state.winner_profile_id === state.challenger_id
        ? `${state.challenger_display_name} wins`
        : `${state.recipient_display_name} wins`;
    const score = `${state.challenger_display_name} ${state.challenger_final_score} – ${state.recipient_display_name} ${state.recipient_final_score}`;
    const outcome = await shareCanonicalDestination({
      destination: { kind: "auction", auctionId: state.auction_id },
      title: "Octagon HQ Auction Result",
      text: `${score}. ${verdict}.`,
      fallbackText: `${score}. ${verdict}.`,
    });
    setShareStatus(
      outcome === "shared"
        ? "Auction result shared."
        : outcome === "copied"
          ? "Auction result link copied."
          : outcome === "cancelled"
            ? "Share cancelled."
            : "Sharing is unavailable on this device.",
    );
  }

  const backLink = (
    <Link className="game-header__back" to="/play">
      <span>‹</span><span><small>PLAY</small><strong>All Games</strong></span>
    </Link>
  );

  if (state && identity.profile) {
    return (
      <div className="page-stack auction-page">
        {backLink}
        {error ? <p className="auction-error" role="status">{error}</p> : null}
        <AuctionBoard
state={state}
profileId={identity.profile.id}
busy={busy || loading}
onBid={(amount, category) => void command(() => repository!.bid(state, amount, category))}
onReload={() => void reload()}
onRematch={returnToModeSelection}
onShare={() => void shareResult()}
shareStatus={shareStatus}
onAbandon={() => void abandon()}
onDecline={() => void decline()}
onCancel={() => {
  if (window.confirm("Cancel this Auction for both players? It ends with no winner, loss, score, grade, or forfeit.")) {
    void command(() => repository!.cancel(state));
  }
}}
        />
      </div>
    );
  }

  if (auctionId && identity.profile) {
    return (
      <div className="page-stack auction-page">
        {backLink}
        <section className="auction-destination surface-card">
<p className="eyebrow">AUCTION DESTINATION</p>
<h1>{loading ? "Loading Auction…" : "Auction unavailable"}</h1>
{error ? <p className="auction-error" role="status">{error}</p> : null}
{!loading ? (
  <button className="primary-action" type="button" onClick={returnToModeSelection}>BACK TO AUCTION MENU</button>
) : null}
        </section>
      </div>
    );
  }

  if (auctionId && !identity.profile) {
    return (
      <div className="page-stack auction-page">
        {backLink}
        <section className="auction-destination surface-card">
          <p className="eyebrow">PRIVATE AUCTION</p>
          <h1>Sign in to open this Auction</h1>
          <p>The exact destination will stay here while you sign in. Only a participant can load the sealed-bid game.</p>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO CONTINUE</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack auction-page">
      {backLink}
      <header className="auction-hero surface-card">
        <p className="eyebrow">ASYNCHRONOUS SEALED BID</p>
        <h1>Auction</h1>
        <p>Pick a format and an opponent. The server locks your deck before the first bid.</p>
      </header>
      {!identity.profile ? (
        <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO PLAY</button>
      ) : (
        <>
<section className="auction-catalog" aria-labelledby="auction-modes-title">
  <header><p className="eyebrow">STEP 1</p><h2 id="auction-modes-title">Choose your auction</h2></header>
  <ol>
    {auctionModes.map((item, index) => (
      <li className={mode === item.id ? "is-selected" : ""} key={item.id}>
        <button type="button" onClick={() => setMode(item.id)}>
          <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.displayName}</strong>
        </button>
      </li>
    ))}
  </ol>
</section>
<section className="auction-opponents surface-card">
  <p className="eyebrow">STEP 2</p><h2>Choose opponent</h2>
  <input
    aria-label="Auction opponent profile name"
    autoCapitalize="characters"
    autoComplete="off"
    list="auction-opponent-suggestions"
    maxLength={24}
    placeholder="EXACT PROFILE NAME"
    value={opponentName}
    onChange={(event) => setOpponentName(event.target.value.toUpperCase())}
  />
  <datalist id="auction-opponent-suggestions">
    {challenges.profiles
      .filter((profile) => profile.id !== identity.profile?.id)
      .map((profile) => <option key={profile.id} value={profile.displayName} />)}
  </datalist>
  <p>Enter the exact Octagon HQ profile name. Recent opponents appear as suggestions.</p>
  <button
    className="primary-action"
    type="button"
    disabled={!repository || !mode || opponentName.trim().length < 2 || busy}
    onClick={() => void prepare()}
  >
    {busy ? "PREPARING…" : "PREPARE AUCTION"}
  </button>
</section>
        </>
      )}
      {error ? <p className="auction-error" role="status">{error}</p> : null}
    </div>
  );
}
