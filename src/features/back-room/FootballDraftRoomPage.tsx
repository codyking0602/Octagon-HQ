import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import {
  BUILD_QB_HERO_IMAGE,
  buildQbVisualIdentity,
  type BuildQbVisualIdentity,
} from "./buildQbVisualIdentity";
import {
  CFB_BUILD_QB_HERO_IMAGE,
  cfbBuildQbVisualIdentity,
} from "./cfbBuildQbVisualIdentity";
import {
  AuctionRepositoryError,
  createAuctionRepository,
  maximumLegalAuctionBid,
  validateAuctionBid,
  type DraftRoomProjection,
} from "../play/auctionRepository";
import {
  BUILD_QB_TRAITS,
  draftRoomModeDefinition,
  draftRoomModes,
  type BuildQbTrait,
  type DraftRoomModeId,
} from "../play/draftRoomContract";

export { BUILD_QB_TRAITS as BUILD_A_QB_TRAITS } from "../play/draftRoomContract";

export const BUILD_A_QB_TRAIT_HELP: Readonly<Record<BuildQbTrait, string>> = {
  Arm: "Throwing power, velocity, and ability to drive difficult throws",
  Accuracy: "Ball placement and consistent catchable precision at all levels",
  Processing: "Speed and quality of reads, decisions, and getting to the right answer",
  Mobility: "Movement, escape ability, rushing value, and creation outside structure",
  Clutch: "Performance in high-leverage, pressure, closing, and playoff-type situations",
};

export function hasDraftRoomAdminAccess(profile: IdentityProfile | null | undefined) {
  return profile?.canControlPicks === true;
}

function draftRoomVisualIdentity(modeId: DraftRoomModeId, itemReference: string | null | undefined) {
  return modeId === "build-qb-cfb"
    ? cfbBuildQbVisualIdentity(itemReference)
    : buildQbVisualIdentity(itemReference);
}

function draftRoomHeroImage(modeId: DraftRoomModeId) {
  return modeId === "build-qb-cfb" ? CFB_BUILD_QB_HERO_IMAGE : BUILD_QB_HERO_IMAGE;
}

function draftRoomTitle(modeId: DraftRoomModeId) {
  return modeId === "build-qb-cfb" ? "CFB Build a QB" : "Build a QB";
}

function buildQbTeamStyle(identity: BuildQbVisualIdentity): CSSProperties {
  return {
    "--build-qb-team-color": identity.primary,
    "--build-qb-team-rgb": identity.primaryRgb,
    "--build-qb-team-secondary": identity.secondary,
  } as CSSProperties;
}

function BuildQbTeamMark({
  identity,
  compact = false,
}: {
  identity: BuildQbVisualIdentity;
  compact?: boolean;
}) {
  return (
    <span
      className={`build-qb-team-mark${compact ? " build-qb-team-mark--compact" : ""}`}
      role="img"
      aria-label={identity.teamName}
      title={identity.teamName}
    >
      <span className="build-qb-team-mark__fallback" aria-hidden="true">{identity.teamCode}</span>
      {identity.logoSrc ? (
        <img
          src={identity.logoSrc}
          alt=""
          aria-hidden="true"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      ) : null}
    </span>
  );
}

function BuildComparison({ state }: { state: DraftRoomProjection }) {
  const challengerAwards = state.awarded_collections.filter((item) => item.awarded_to === state.challenger_id);
  const recipientAwards = state.awarded_collections.filter((item) => item.awarded_to === state.recipient_id);

  return (
    <section className="auction-collections surface-card" aria-label="Build a QB comparison">
      <header className="auction-collections__header">
        <div><strong>{state.challenger_display_name}</strong></div>
        <span>VS</span>
        <div><strong>{state.recipient_display_name}</strong></div>
      </header>
      <div className="auction-collections__rows">
        {BUILD_QB_TRAITS.map((trait) => {
          const challengerAward = challengerAwards.find((item) => item.category === trait);
          const recipientAward = recipientAwards.find((item) => item.category === trait);
          const challengerIdentity = draftRoomVisualIdentity(state.mode_id, challengerAward?.item_reference);
          const recipientIdentity = draftRoomVisualIdentity(state.mode_id, recipientAward?.item_reference);

          return (
            <article key={trait}>
              <div
                className={challengerAward ? `is-filled${challengerIdentity ? " build-qb-team-slot" : ""}` : ""}
                style={challengerIdentity ? buildQbTeamStyle(challengerIdentity) : undefined}
              >
                <small>{trait}</small>
                {challengerAward ? (
                  <span className="build-qb-slot__player">
                    {challengerIdentity ? <BuildQbTeamMark identity={challengerIdentity} compact /> : null}
                    <strong>{challengerAward.display_label}</strong>
                  </span>
                ) : <strong>OPEN</strong>}
              </div>
              <span aria-hidden="true">VS</span>
              <div
                className={recipientAward ? `is-filled${recipientIdentity ? " build-qb-team-slot" : ""}` : ""}
                style={recipientIdentity ? buildQbTeamStyle(recipientIdentity) : undefined}
              >
                <small>{trait}</small>
                {recipientAward ? (
                  <span className="build-qb-slot__player">
                    {recipientIdentity ? <BuildQbTeamMark identity={recipientIdentity} compact /> : null}
                    <strong>{recipientAward.display_label}</strong>
                  </span>
                ) : <strong>OPEN</strong>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DraftRoomBoard({
  state,
  profileId,
  busy,
  onBid,
  onReload,
  onAbandon,
  onDecline,
  onCancel,
  onNewRoom,
}: {
  state: DraftRoomProjection;
  profileId: string;
  busy: boolean;
  onBid(amount: number, category: BuildQbTrait): void;
  onReload(): void;
  onAbandon(): void;
  onDecline(): void;
  onCancel(): void;
  onNewRoom(): void;
}) {
  const mode = draftRoomModeDefinition(state.mode_id);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<BuildQbTrait | "">("");
  const [formError, setFormError] = useState("");
  const ownAwards = state.awarded_collections.filter((item) => item.awarded_to === profileId);
  const usedCategories = new Set(ownAwards.map((item) => item.category));
  const maximum = maximumLegalAuctionBid(state, profileId);
  const terminal = ["completed", "declined", "cancelled"].includes(state.lifecycle_state);
  const canBid = ["prepared", "sent", "active"].includes(state.lifecycle_state)
    && !state.current_user_submitted_bid
    && state.action_required_by !== "opponent"
    && !(state.lifecycle_state === "sent" && profileId === state.challenger_id);
  const tieName = state.tie_priority_profile_id === state.challenger_id
    ? state.challenger_display_name
    : state.recipient_display_name;
  const latestRound = state.resolved_rounds.at(-1);
  const latestAward = latestRound
    ? state.awarded_collections.find((item) => item.resolved_round === latestRound.round)
    : null;
  const currentQbIdentity = draftRoomVisualIdentity(state.mode_id, state.current_item?.item_reference);

  const status = state.lifecycle_state === "prepared"
    ? "Your first bid sends this Build a QB room"
    : state.lifecycle_state === "sent"
      ? profileId === state.recipient_id
        ? "Your first bid accepts this Build a QB room"
        : "Waiting for opponent's first bid"
      : state.lifecycle_state === "active" && state.current_user_submitted_bid
        ? "Bid locked · waiting for opponent"
        : state.lifecycle_state === "active"
          ? "Your sealed bid is required"
          : state.lifecycle_state === "completed"
            ? "Build complete"
            : state.lifecycle_state === "cancelled"
              ? "Room cancelled"
              : "Challenge declined";

  useEffect(() => {
    setAmount("");
    setCategory("");
    setFormError("");
  }, [state.auction_id, state.current_round, state.revision]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextError = validateAuctionBid(amount, maximum, true, category, BUILD_QB_TRAITS);
    setFormError(nextError);
    if (!nextError && category) onBid(Number(amount), category);
  }

  return (
    <div className="auction-board">
      <header className="auction-board__header">
        <img
          className="auction-board__image build-qb-board__image"
          src={draftRoomHeroImage(state.mode_id)}
          alt=""
          aria-hidden="true"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
        <div className="auction-board__nav">
          <button type="button" onClick={onNewRoom}>‹ NEW ROOM</button>
          <button type="button" onClick={onReload} disabled={busy}>REFRESH</button>
        </div>
        <div className="auction-board__title">
          <p className="eyebrow">DRAFT ROOM</p>
          <h1>{draftRoomTitle(state.mode_id)}</h1>
        </div>
      </header>

      <section className="auction-scoreboard surface-card">
        <article>
          <small>CHALLENGER</small>
          <strong>{state.challenger_display_name}</strong>
          <b>${state.challenger_bankroll}</b>
          <em>{state.challenger_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
        </article>
        <span>VS</span>
        <article>
          <small>OPPONENT</small>
          <strong>{state.recipient_display_name}</strong>
          <b>${state.recipient_bankroll}</b>
          <em>{state.recipient_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
        </article>
      </section>

      <section className="auction-current surface-card">
        <div className="auction-current__meta">
          <span>ROUND {Math.min(state.current_round, mode.rounds)} / {mode.rounds}</span>
          <span>TIES → {tieName}</span>
        </div>
        <div
          className={`auction-current__item${currentQbIdentity ? " has-build-qb-team" : ""}`}
          style={currentQbIdentity ? buildQbTeamStyle(currentQbIdentity) : undefined}
        >
          <small>CURRENT QB</small>
          <div className="build-qb-current__identity">
            {currentQbIdentity ? <BuildQbTeamMark identity={currentQbIdentity} /> : null}
            <h2>{state.current_item?.display_label ?? (terminal ? "BUILD LOCKED" : "LOADING")}</h2>
          </div>
        </div>
        <strong className="auction-current__status">{status}</strong>
      </section>

      {latestRound ? (
        <section className="auction-result surface-card" aria-label="Latest Draft Room result">
          <p className="eyebrow">{latestRound.forced ? "FORCED $1 ASSIGNMENT" : `ROUND ${latestRound.round} RESULT`}</p>
          <h2>{latestAward?.display_label ?? "Resolved QB"}</h2>
          <p>
            {latestAward?.category ? `${latestAward.category} · ` : ""}
            {latestRound.forced
              ? `assigned for $${latestRound.charged_amount}`
              : `${state.challenger_display_name} $${latestRound.challenger_bid} · ${state.recipient_display_name} $${latestRound.recipient_bid}`}
          </p>
        </section>
      ) : null}

      {state.lifecycle_state === "completed"
        && state.challenger_final_score !== null
        && state.recipient_final_score !== null ? (
        <section className="auction-final surface-card" aria-label="Build a QB final result">
          <p className="eyebrow">FINAL BUILD SCORE</p>
          <h2>
            {state.is_tie
              ? "TRUE TIE"
              : state.winner_profile_id === state.challenger_id
                ? `${state.challenger_display_name} WINS`
                : `${state.recipient_display_name} WINS`}
          </h2>
          <div className="auction-final__scores">
            <article><small>{state.challenger_display_name}</small><strong>{state.challenger_final_score}</strong></article>
            <b>–</b>
            <article><small>{state.recipient_display_name}</small><strong>{state.recipient_final_score}</strong></article>
          </div>
        </section>
      ) : null}

      <BuildComparison state={state} />

      {canBid ? (
        <form className="auction-bid surface-card" onSubmit={submit}>
          <fieldset>
            <legend>ASSIGN THIS QB</legend>
            {BUILD_QB_TRAITS.map((trait) => (
              <button
                type="button"
                key={trait}
                className={category === trait ? "is-selected" : ""}
                disabled={usedCategories.has(trait)}
                onClick={() => setCategory(trait)}
              >
                {trait}
              </button>
            ))}
          </fieldset>
          {category ? (
            <p className="challenge-center__hint" aria-live="polite">{BUILD_A_QB_TRAIT_HELP[category]}</p>
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
          <button type="button" disabled={busy} onClick={onAbandon}>ABANDON ROOM</button>
        ) : null}
        {state.lifecycle_state === "sent" && profileId === state.recipient_id ? (
          <button type="button" disabled={busy} onClick={onDecline}>DECLINE</button>
        ) : null}
        {state.lifecycle_state === "active" ? (
          <button type="button" disabled={busy} onClick={onCancel}>CANCEL ROOM</button>
        ) : null}
        {terminal ? (
          <button className="primary-action" type="button" disabled={busy} onClick={onNewRoom}>NEW ROOM</button>
        ) : null}
      </footer>
    </div>
  );
}

export default function FootballDraftRoomPage() {
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const repository = useMemo(() => createAuctionRepository(), []);
  const [state, setState] = useState<DraftRoomProjection | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<MemberCardSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const auctionId = params.get("auction") ?? "";
  const requestedMode: DraftRoomModeId = params.get("mode") === "build-qb-cfb" ? "build-qb-cfb" : "build-qb";
  const requestedModeDefinition = draftRoomModeDefinition(requestedMode);

  useEffect(() => {
    let cancelled = false;
    setState(null);
    setError("");
    if (!auctionId || !identity.profile || !repository || !hasDraftRoomAdminAccess(identity.profile)) {
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    void repository.read<DraftRoomModeId>(auctionId)
      .then((nextState) => {
        if (!cancelled) setState(nextState);
      })
      .catch((nextError) => {
        if (!cancelled) setError(nextError instanceof Error ? nextError.message : "Draft Room could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [auctionId, identity.profile?.id, repository]);

  if (!identity.ready) {
    return (
      <div className="page football-room-page">
        <section className="surface-card" aria-live="polite">
          <p className="eyebrow">DRAFT ROOM</p>
          <strong>Loading Draft Room…</strong>
        </section>
      </div>
    );
  }

  if (!hasDraftRoomAdminAccess(identity.profile)) {
    return <Navigate to="/football" replace />;
  }

  const profileId = identity.profile!.id;

  async function reload() {
    if (!repository || !auctionId) return;
    setLoading(true);
    setError("");
    try {
      setState(await repository.read<DraftRoomModeId>(auctionId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Draft Room could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function command(action: () => Promise<DraftRoomProjection>) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      setState(await action());
      await challenges.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Draft Room could not be updated.");
      if (nextError instanceof AuctionRepositoryError && nextError.stale) await reload();
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function newRoom(modeId: DraftRoomModeId = requestedMode) {
    setState(null);
    setSelectedOpponent(null);
    setError("");
    navigate(`/football/draft-room?mode=${modeId}`, { replace: true });
  }

  async function prepare() {
    if (!repository || !selectedOpponent || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const opponent = await challenges.findProfile(selectedOpponent.displayName);
      if (!opponent) throw new Error("No Octagon HQ profile matched that exact name.");
      const prepared = await repository.prepare(opponent.id, requestedMode);
      setState(prepared);
      navigate(`/football/draft-room?auction=${prepared.auction_id}`, { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Draft Room could not be prepared.");
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
      newRoom();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Draft Room could not be abandoned.");
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
      if (!declined) setError("Draft Room challenge could not be declined.");
      else newRoom();
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (state) {
    return (
      <div className="page-stack football-room-page auction-page">
        {error ? <p className="auction-error" role="status">{error}</p> : null}
        <DraftRoomBoard
          state={state}
          profileId={profileId}
          busy={busy || loading}
          onBid={(amount, category) => void command(() => repository!.bid(state, amount, category))}
          onReload={() => void reload()}
          onAbandon={() => void abandon()}
          onDecline={() => void decline()}
          onNewRoom={() => newRoom(state.mode_id)}
          onCancel={() => {
            if (window.confirm("Cancel this Draft Room for both players? It ends with no winner, loss, score, or forfeit.")) {
              void command(() => repository!.cancel(state));
            }
          }}
        />
      </div>
    );
  }

  if (auctionId) {
    return (
      <div className="page-stack football-room-page auction-page">
        <section className="auction-destination surface-card">
          <p className="eyebrow">DRAFT ROOM</p>
          <h1>{loading ? "Loading Build a QB…" : "Draft Room unavailable"}</h1>
          {error ? <p className="auction-error" role="status">{error}</p> : null}
          {!loading ? <button className="primary-action" type="button" onClick={() => newRoom(requestedMode)}>BACK TO DRAFT ROOM</button> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack football-room-page auction-page">
      <section className="page-heading">
        <p className="eyebrow">DRAFT ROOM</p>
        <h1>Draft Room</h1>
        <p>Football’s sealed-bid strategy room. Bid smart, build your quarterback, and beat your opponent.</p>
      </section>

      <section className="auction-hero surface-card" aria-labelledby="build-a-qb-title">
        <p className="eyebrow">LAUNCH ROOM</p>
        <h2 id="build-a-qb-title">{requestedModeDefinition.displayName}</h2>
        <p>{requestedModeDefinition.description} Bid from a $50 bankroll; ten QBs appear and each side finishes with five.</p>
        <div className="draft-room-mode-switcher" role="group" aria-label="Draft Room mode">
          {draftRoomModes.map((mode) => (
            <button
              type="button"
              key={mode.id}
              className={requestedMode === mode.id ? "is-selected" : ""}
              onClick={() => navigate(`/football/draft-room?mode=${mode.id}`, { replace: true })}
            >
              {mode.displayName}
            </button>
          ))}
        </div>
        <div className="auction-catalog__tabs" aria-label="Build a QB traits">
          {BUILD_QB_TRAITS.map((trait) => <span key={trait}>{trait}</span>)}
        </div>
      </section>

      <section className="auction-opponents surface-card">
        <p className="eyebrow">START ROOM</p>
        <h2>Choose opponent</h2>
        <ChallengeMemberPicker
          members={challenges.members}
          recentNames={challenges.profiles.map((profile) => profile.displayName)}
          selectedName={selectedOpponent?.displayName}
          busy={busy}
          onSelect={setSelectedOpponent}
        />
        <p>Preparing fixes the private 10-QB deck. Refreshing cannot reroll it.</p>
        <button
          className="primary-action"
          type="button"
          disabled={!repository || !selectedOpponent || busy}
          onClick={() => void prepare()}
        >
          {busy ? "PREPARING…" : `PREPARE ${requestedMode === "build-qb-cfb" ? "CFB" : "NFL"} BUILD A QB`}
        </button>
      </section>

      {error ? <p className="auction-error" role="status">{error}</p> : null}
    </div>
  );
}
