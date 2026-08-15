import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { MemberCardSummary, MemberProfileSummary } from "../members/memberProfilesModel";
import { createMemberProfilesRepository } from "../members/memberProfilesRepository";
import {
  ULTIMATE_FIGHTER_CATEGORIES,
  auctionModeDefinition,
  auctionModeGroups,
  auctionModes,
  auctionModesForGroup,
  type AuctionModeGroupId,
  type AuctionModeId,
  type UltimateFighterCategory,
} from "./auctionContract";
import { auctionModeArtwork } from "./auctionModeArtwork";
import {
  AuctionRepositoryError,
  createAuctionRepository,
  maximumLegalAuctionBid,
  validateAuctionBid,
  type AuctionProjection,
} from "./auctionRepository";

type AuctionParticipantProfile = Pick<
  MemberProfileSummary,
  "displayName" | "initials" | "avatarPhotoData"
>;
type AuctionParticipantProfiles = Record<string, AuctionParticipantProfile | undefined>;

function fallbackInitials(displayName: string) {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : words[0]?.slice(0, 1) ?? "?").toUpperCase();
}

function fallbackParticipant(displayName: string): AuctionParticipantProfile {
  return { displayName, initials: fallbackInitials(displayName), avatarPhotoData: null };
}

function MemberAvatar({
  name,
  profile,
  className = "",
}: {
  name: string;
  profile?: AuctionParticipantProfile;
  className?: string;
}) {
  const avatar = profile ?? fallbackParticipant(name);
  return (
    <span className={`auction-member-avatar${className ? ` ${className}` : ""}`}>
      {avatar.avatarPhotoData
        ? <img src={avatar.avatarPhotoData} alt={`${name} profile`} />
        : avatar.initials}
    </span>
  );
}

function AuctionArtworkImage({
  modeId,
  className,
}: {
  modeId: AuctionModeId;
  className: string;
}) {
  const artwork = auctionModeArtwork(modeId);
  return (
    <img
      className={className}
      src={artwork.src}
      alt=""
      aria-hidden="true"
      style={{ objectPosition: artwork.objectPosition }}
      onError={(event) => { event.currentTarget.hidden = true; }}
    />
  );
}

function CollectionComparison({
  state,
  participants,
}: {
  state: AuctionProjection;
  participants: AuctionParticipantProfiles;
}) {
  const mode = auctionModeDefinition(state.mode_id);
  const challengerAwards = state.awarded_collections.filter((item) => item.awarded_to === state.challenger_id);
  const recipientAwards = state.awarded_collections.filter((item) => item.awarded_to === state.recipient_id);
  const rows = mode.usesUltimateFighterPlacement
    ? ULTIMATE_FIGHTER_CATEGORIES.map((category) => ({
      label: category,
      challenger: challengerAwards.find((item) => item.category === category)?.display_label ?? "OPEN",
      recipient: recipientAwards.find((item) => item.category === category)?.display_label ?? "OPEN",
    }))
    : Array.from({ length: mode.requiredSelectionsPerPlayer }, (_, index) => ({
      label: `PICK ${index + 1}`,
      challenger: challengerAwards[index]?.display_label ?? "OPEN",
      recipient: recipientAwards[index]?.display_label ?? "OPEN",
    }));

  return (
    <section className={`auction-collections surface-card${state.lifecycle_state === "completed" ? " is-complete" : ""}`}>
      <header className="auction-collections__header">
        <div>
          <MemberAvatar
            name={state.challenger_display_name}
            profile={participants[state.challenger_id]}
          />
          <strong>{state.challenger_display_name}</strong>
        </div>
        <span>VS</span>
        <div>
          <MemberAvatar
            name={state.recipient_display_name}
            profile={participants[state.recipient_id]}
          />
          <strong>{state.recipient_display_name}</strong>
        </div>
      </header>
      <div className="auction-collections__rows">
        {rows.map((row) => (
          <article key={row.label}>
            <div className={row.challenger === "OPEN" ? "" : "is-filled"}>
              <small>{row.label}</small>
              <strong>{row.challenger}</strong>
            </div>
            <span aria-hidden="true">VS</span>
            <div className={row.recipient === "OPEN" ? "" : "is-filled"}>
              <small>{row.label}</small>
              <strong>{row.recipient}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoundReveal({
  state,
  participants,
}: {
  state: AuctionProjection;
  participants: AuctionParticipantProfiles;
}) {
  const round = state.resolved_rounds.at(-1);
  if (!round) return null;
  const award = state.awarded_collections.find((item) => item.resolved_round === round.round);
  const winnerId = round.winner;
  const winner = winnerId === state.challenger_id
    ? state.challenger_display_name
    : state.recipient_display_name;

  return (
    <section className="auction-result surface-card" aria-label="Latest resolved round">
      <p className="eyebrow">{round.forced ? "FORCED $1 ASSIGNMENT" : `ROUND ${round.round} RESULT`}</p>
      <h2>{award?.display_label ?? "Resolved item"}</h2>
      <strong className="auction-result__winner">
        <MemberAvatar name={winner} profile={participants[winnerId]} />
        <span>{winner} WON · ${round.charged_amount}</span>
      </strong>
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

function AuctionFinalResult({
  state,
  participants,
}: {
  state: AuctionProjection;
  participants: AuctionParticipantProfiles;
}) {
  if (
    state.lifecycle_state !== "completed"
    || state.challenger_final_score === null
    || state.recipient_final_score === null
  ) return null;

  const winnerName = state.winner_profile_id === state.challenger_id
    ? state.challenger_display_name
    : state.recipient_display_name;
  const verdict = state.is_tie ? "TRUE TIE" : `${winnerName} WINS`;

  return (
    <section className="auction-final surface-card" aria-label="Auction final result">
      <p className="eyebrow">FINAL 0–100 SCORE</p>
      <div className="auction-final__winner">
        {state.is_tie ? (
          <span className="auction-final__avatars">
            <MemberAvatar
              name={state.challenger_display_name}
              profile={participants[state.challenger_id]}
            />
            <MemberAvatar
              name={state.recipient_display_name}
              profile={participants[state.recipient_id]}
            />
          </span>
        ) : (
          <MemberAvatar
            name={winnerName}
            profile={participants[state.winner_profile_id ?? ""]}
            className="is-winner"
          />
        )}
        <h2>{verdict}</h2>
      </div>
      <div className="auction-final__scores">
        <article>
          <span>
            <MemberAvatar
              name={state.challenger_display_name}
              profile={participants[state.challenger_id]}
            />
            <small>{state.challenger_display_name}</small>
          </span>
          <strong>{state.challenger_final_score}</strong>
        </article>
        <b>–</b>
        <article>
          <span>
            <MemberAvatar
              name={state.recipient_display_name}
              profile={participants[state.recipient_id]}
            />
            <small>{state.recipient_display_name}</small>
          </span>
          <strong>{state.recipient_final_score}</strong>
        </article>
      </div>
    </section>
  );
}

function AuctionBoard({
  state,
  participants,
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
  participants: AuctionParticipantProfiles;
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
      <header className="auction-board__header">
        <AuctionArtworkImage modeId={state.mode_id} className="auction-board__image" />
        <div className="auction-board__nav">
          <Link className="auction-board__back" to="/play">
            <span>‹</span><span><small>PLAY</small><strong>All Games</strong></span>
          </Link>
          <button type="button" onClick={onReload} disabled={busy}>REFRESH</button>
        </div>
        <div className="auction-board__title">
          <p className="eyebrow">AUCTION</p>
          <h1>{mode.displayName}</h1>
        </div>
      </header>
      <section className="auction-scoreboard surface-card">
        <article>
          <small>CHALLENGER</small>
          <div className="auction-scoreboard__identity">
            <MemberAvatar
              name={state.challenger_display_name}
              profile={participants[state.challenger_id]}
            />
            <strong>{state.challenger_display_name}</strong>
          </div>
          <b>${state.challenger_bankroll}</b>
          <em>{state.challenger_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
        </article>
        <span>VS</span>
        <article>
          <small>OPPONENT</small>
          <div className="auction-scoreboard__identity">
            <MemberAvatar
              name={state.recipient_display_name}
              profile={participants[state.recipient_id]}
            />
            <strong>{state.recipient_display_name}</strong>
          </div>
          <b>${state.recipient_bankroll}</b>
          <em>{state.recipient_selection_count}/{mode.requiredSelectionsPerPlayer}</em>
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
      <RoundReveal state={state} participants={participants} />
      <AuctionFinalResult state={state} participants={participants} />
      <CollectionComparison state={state} participants={participants} />
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
  const memberRepository = useMemo(() => createMemberProfilesRepository(), []);
  const [state, setState] = useState<AuctionProjection | null>(null);
  const [mode, setMode] = useState<AuctionModeId | null>(null);
  const [modeGroup, setModeGroup] = useState<AuctionModeGroupId | "all">("all");
  const [setupStep, setSetupStep] = useState<"formats" | "opponent">("formats");
  const [selectedOpponent, setSelectedOpponent] = useState<MemberCardSummary | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<AuctionParticipantProfiles>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const submitting = useRef(false);
  const auctionId = params.get("auction") ?? "";
  const visibleModes = useMemo(() => auctionModesForGroup(modeGroup), [modeGroup]);
  const selectedMode = mode ? auctionModeDefinition(mode) : null;

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

  useEffect(() => {
    let active = true;
    if (!state || !memberRepository) {
      setParticipantProfiles({});
      return () => { active = false; };
    }

    const challengerFallback = fallbackParticipant(state.challenger_display_name);
    const recipientFallback = fallbackParticipant(state.recipient_display_name);
    void Promise.all([
      memberRepository.loadMember(state.challenger_display_name),
      memberRepository.loadMember(state.recipient_display_name),
    ]).then(([challenger, recipient]) => {
      if (!active) return;
      setParticipantProfiles({
        [state.challenger_id]: challenger ?? challengerFallback,
        [state.recipient_id]: recipient ?? recipientFallback,
      });
    }).catch(() => {
      if (!active) return;
      setParticipantProfiles({
        [state.challenger_id]: challengerFallback,
        [state.recipient_id]: recipientFallback,
      });
    });

    return () => { active = false; };
  }, [
    memberRepository,
    state?.challenger_display_name,
    state?.challenger_id,
    state?.recipient_display_name,
    state?.recipient_id,
  ]);

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
    setSetupStep("formats");
    setSelectedOpponent(null);
    setError("");
    setShareStatus("");
    navigate("/play/auction", { replace: true });
  }

  function continueToOpponent() {
    if (!mode) return;
    setSetupStep("opponent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function prepare() {
    if (!repository || !mode || !selectedOpponent || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const opponent = await challenges.findProfile(selectedOpponent.displayName);
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
        {error ? <p className="auction-error" role="status">{error}</p> : null}
        <AuctionBoard
          state={state}
          participants={participantProfiles}
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
        <p className="eyebrow">SEALED BID CHALLENGE</p>
        <h1>Auction</h1>
        <p>Pick a format and challenge another member. Bid privately to build the stronger collection.</p>
      </header>
      {!identity.profile ? (
        <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN TO PLAY</button>
      ) : setupStep === "formats" ? (
        <section className="auction-catalog" aria-labelledby="auction-modes-title">
          <header>
            <p className="eyebrow">STEP 1</p>
            <h2 id="auction-modes-title">Choose your auction</h2>
            <p>Browse everything or narrow the board by type.</p>
          </header>
          <div className="auction-catalog__tabs" role="tablist" aria-label="Auction format groups">
            <button
              type="button"
              aria-pressed={modeGroup === "all"}
              className={modeGroup === "all" ? "is-active" : ""}
              onClick={() => setModeGroup("all")}
            >
              ALL
            </button>
            {auctionModeGroups.map((group) => (
              <button
                type="button"
                key={group.id}
                aria-pressed={modeGroup === group.id}
                className={modeGroup === group.id ? "is-active" : ""}
                onClick={() => setModeGroup(group.id)}
              >
                {group.label.toUpperCase()}
              </button>
            ))}
          </div>
          <ol>
            {visibleModes.map((item) => {
              const index = auctionModes.findIndex((candidate) => candidate.id === item.id);
              return (
                <li className={mode === item.id ? "is-selected" : ""} key={item.id}>
                  <button type="button" onClick={() => setMode(item.id)}>
                    <AuctionArtworkImage modeId={item.id} className="auction-catalog__image" />
                    <span className="auction-catalog__number">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="auction-catalog__name">{item.displayName}</strong>
                    <em className="auction-catalog__mark" aria-hidden="true">{mode === item.id ? "✓" : "›"}</em>
                  </button>
                </li>
              );
            })}
          </ol>
          {selectedMode ? (
            <div className="auction-catalog__continue">
              <span><small>SELECTED</small><strong>{selectedMode.displayName}</strong></span>
              <button className="primary-action" type="button" onClick={continueToOpponent}>
                CHOOSE OPPONENT →
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="auction-opponents surface-card">
          <button className="auction-opponents__back" type="button" onClick={() => setSetupStep("formats")}>
            ← CHANGE FORMAT
          </button>
          <p className="eyebrow">STEP 2</p>
          <h2>Choose opponent</h2>
          <div className="auction-opponents__summary">
            <small>SELECTED AUCTION</small>
            <strong>{selectedMode?.displayName}</strong>
          </div>
          <ChallengeMemberPicker
            members={challenges.members}
            recentNames={challenges.profiles.map((profile) => profile.displayName)}
            selectedName={selectedOpponent?.displayName}
            busy={busy}
            onSelect={setSelectedOpponent}
          />
          <p>Choose any Octagon HQ member. Search is optional.</p>
          <button
            className="primary-action"
            type="button"
            disabled={!repository || !mode || !selectedOpponent || busy}
            onClick={() => void prepare()}
          >
            {busy ? "PREPARING…" : "PREPARE AUCTION"}
          </button>
        </section>
      )}
      {error ? <p className="auction-error" role="status">{error}</p> : null}
    </div>
  );
}
