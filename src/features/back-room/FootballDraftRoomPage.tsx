import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityProfile } from "../identity/identityModel";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import {
  buildQbVisualIdentity,
  type BuildQbVisualIdentity,
} from "./buildQbVisualIdentity";
import { cfbBuildQbVisualIdentity } from "./cfbBuildQbVisualIdentity";
import { draftRoomModeArtwork } from "./draftRoomModeArtwork";
import { trioPlayerVisualIdentity } from "./draftRoomTrioVisualIdentity";
import { longhornsPlayerSummary } from "./longhornsPlayerSummaries";
import { longhornsTeamSeasonSummary } from "./longhornsTeamSeasonSummaries";
import {
  AuctionRepositoryError,
  createAuctionRepository,
  maximumLegalAuctionBid,
  validateAuctionBid,
  type DraftRoomProjection,
} from "../play/auctionRepository";
import {
  BUILD_QB_TRAITS,
  TRIO_POSITIONS,
  draftRoomModeDefinition,
  draftRoomModes,
  isCfbDraftRoomMode,
  isCowboysDraftRoomMode,
  isDraftRoomModeId,
  isLonghornsDraftRoomMode,
  isLonghornsTeamsDraftRoomMode,
  isTrioDraftRoomMode,
  type BuildQbTrait,
  type DraftRoomModeId,
  type TrioPosition,
} from "../play/draftRoomContract";

export { BUILD_QB_TRAITS as BUILD_A_QB_TRAITS } from "../play/draftRoomContract";

export const BUILD_A_QB_TRAIT_HELP: Readonly<Record<BuildQbTrait, string>> = {
  Arm: "Throwing power, velocity, and ability to drive difficult throws",
  Accuracy: "Ball placement and consistent catchable precision at all levels",
  Processing: "Speed and quality of reads, decisions, and getting to the right answer",
  Mobility: "Movement, escape ability, rushing value, and creation outside structure",
};

export function hasDraftRoomAdminAccess(profile: IdentityProfile | null | undefined) {
  return profile?.canControlPicks === true;
}

export function formatTrioFinalScore(score: number) {
  return score.toFixed(1);
}

function draftRoomVisualIdentity(modeId: DraftRoomModeId, itemReference: string | null | undefined) {
  return modeId === "build-qb-cfb"
    ? cfbBuildQbVisualIdentity(itemReference)
    : buildQbVisualIdentity(itemReference);
}

function draftRoomTitle(modeId: DraftRoomModeId) {
  return draftRoomModeDefinition(modeId).displayName;
}

type DraftRoomSport = "nfl" | "cfb";

function DraftRoomModeArtworkImage({
  modeId,
  className,
}: {
  modeId: DraftRoomModeId;
  className: string;
}) {
  const artwork = draftRoomModeArtwork(modeId);
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

export interface TrioPackagePlayer {
  position: TrioPosition;
  label: string;
}

export function parseTrioPackageLabel(displayLabel: string): TrioPackagePlayer[] {
  const players = displayLabel.split(" | ").map((label) => label.trim()).filter(Boolean);
  return TRIO_POSITIONS.map((position, index) => ({
    position,
    label: players[index] ?? "Unknown player",
  }));
}

function TrioPackageCard({
  modeId,
  displayLabel,
  compact = false,
}: {
  modeId: DraftRoomModeId;
  displayLabel: string;
  compact?: boolean;
}) {
  return (
    <div className={`draft-room-trio-package${compact ? " draft-room-trio-package--compact" : ""}`}>
      {parseTrioPackageLabel(displayLabel).map((player) => {
        const identity = trioPlayerVisualIdentity(modeId, player.label);
        return (
          <div
            className={`draft-room-trio-package__player${identity ? " has-team-identity" : ""}`}
            key={player.position}
            style={identity ? buildQbTeamStyle(identity) : undefined}
          >
            <small>{player.position}</small>
            {identity ? <BuildQbTeamMark identity={identity} compact /> : <span className="draft-room-trio-package__mark-spacer" />}
            <strong>{player.label}</strong>
          </div>
        );
      })}
    </div>
  );
}

function TrioComparison({ state }: { state: DraftRoomProjection }) {
  const challengerAwards = state.awarded_collections
    .filter((item) => item.awarded_to === state.challenger_id)
    .sort((a, b) => a.resolved_round - b.resolved_round);
  const recipientAwards = state.awarded_collections
    .filter((item) => item.awarded_to === state.recipient_id)
    .sort((a, b) => a.resolved_round - b.resolved_round);

  return (
    <section className="draft-room-trio-rosters surface-card" aria-label="Trio roster comparison">
      <header className="auction-collections__header">
        <div><strong>{state.challenger_display_name}</strong></div>
        <span>VS</span>
        <div><strong>{state.recipient_display_name}</strong></div>
      </header>
      <div className="draft-room-trio-rosters__grid">
        <div>
          {challengerAwards.map((award, index) => (
            <article key={award.deck_position}>
              <small>TRIO {index + 1}</small>
              <TrioPackageCard modeId={state.mode_id} displayLabel={award.display_label} compact />
            </article>
          ))}
          {Array.from({ length: Math.max(0, 3 - challengerAwards.length) }, (_, index) => (
            <article className="is-open" key={`challenger-open-${index}`}><strong>OPEN TRIO</strong></article>
          ))}
        </div>
        <div>
          {recipientAwards.map((award, index) => (
            <article key={award.deck_position}>
              <small>TRIO {index + 1}</small>
              <TrioPackageCard modeId={state.mode_id} displayLabel={award.display_label} compact />
            </article>
          ))}
          {Array.from({ length: Math.max(0, 3 - recipientAwards.length) }, (_, index) => (
            <article className="is-open" key={`recipient-open-${index}`}><strong>OPEN TRIO</strong></article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LonghornsComparison({
  state,
  itemLabel = "PLAYER",
  ariaLabel = "Longhorns roster comparison",
  itemSummary,
}: {
  state: DraftRoomProjection;
  itemLabel?: "PLAYER" | "TEAM";
  ariaLabel?: string;
  itemSummary?: (displayLabel: string) => string;
}) {
  const challengerAwards = state.awarded_collections
    .filter((item) => item.awarded_to === state.challenger_id)
    .sort((a, b) => a.resolved_round - b.resolved_round);
  const recipientAwards = state.awarded_collections
    .filter((item) => item.awarded_to === state.recipient_id)
    .sort((a, b) => a.resolved_round - b.resolved_round);

  return (
    <section className="auction-collections surface-card" aria-label={ariaLabel}>
      <header className="auction-collections__header">
        <div><strong>{state.challenger_display_name}</strong></div>
        <span>VS</span>
        <div><strong>{state.recipient_display_name}</strong></div>
      </header>
      <div className="auction-collections__rows">
        {Array.from({ length: 4 }, (_, index) => {
          const challengerAward = challengerAwards[index];
          const recipientAward = recipientAwards[index];
          return (
            <article key={index}>
              <div className={challengerAward ? "is-filled" : ""}>
                <small>{itemLabel} {index + 1}</small>
                <strong className={itemLabel === "TEAM" ? "draft-room-season-label" : undefined}>{challengerAward?.display_label ?? "OPEN"}</strong>
                {challengerAward && itemSummary ? (
                  <span className={itemLabel === "TEAM" ? "draft-room-season-summary" : "draft-room-player-summary"}>
                    {itemSummary(challengerAward.display_label)}
                  </span>
                ) : null}
              </div>
              <span aria-hidden="true">VS</span>
              <div className={recipientAward ? "is-filled" : ""}>
                <small>{itemLabel} {index + 1}</small>
                <strong className={itemLabel === "TEAM" ? "draft-room-season-label" : undefined}>{recipientAward?.display_label ?? "OPEN"}</strong>
                {recipientAward && itemSummary ? (
                  <span className={itemLabel === "TEAM" ? "draft-room-season-summary" : "draft-room-player-summary"}>
                    {itemSummary(recipientAward.display_label)}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
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
  onBid(amount: number, category?: BuildQbTrait): void;
  onReload(): void;
  onAbandon(): void;
  onDecline(): void;
  onCancel(): void;
  onNewRoom(): void;
}) {
  const mode = draftRoomModeDefinition(state.mode_id);
  const trioMode = isTrioDraftRoomMode(state.mode_id);
  const longhornsMode = isLonghornsDraftRoomMode(state.mode_id);
  const longhornsTeamsMode = isLonghornsTeamsDraftRoomMode(state.mode_id);
  const cowboysMode = isCowboysDraftRoomMode(state.mode_id);
  const longhornsFamilyMode = longhornsMode || longhornsTeamsMode;
  const openRosterMode = trioMode || longhornsFamilyMode || cowboysMode;
  const rosterResult = openRosterMode && state.lifecycle_state === "completed";
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
  const currentQbIdentity = openRosterMode ? null : draftRoomVisualIdentity(state.mode_id, state.current_item?.item_reference);

  const roomLabel = trioMode ? "Trio" : longhornsTeamsMode ? "Longhorns Teams" : longhornsMode ? "Longhorns" : cowboysMode ? "Cowboys" : "Build a QB";
  const status = state.lifecycle_state === "prepared"
    ? `Your first bid sends this ${roomLabel} room`
    : state.lifecycle_state === "sent"
      ? profileId === state.recipient_id
        ? `Your first bid accepts this ${roomLabel} room`
        : "Waiting for opponent's first bid"
      : state.lifecycle_state === "active" && state.current_user_submitted_bid
        ? "Bid locked · waiting for opponent"
        : state.lifecycle_state === "active"
          ? "Your sealed bid is required"
          : state.lifecycle_state === "completed"
            ? (openRosterMode ? "Roster complete" : "Build complete")
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
    const nextError = validateAuctionBid(amount, maximum, !openRosterMode, category, BUILD_QB_TRAITS);
    setFormError(nextError);
    if (!nextError) onBid(Number(amount), openRosterMode ? undefined : category || undefined);
  }

  return (
    <div className={`auction-board${longhornsFamilyMode ? " auction-board--longhorns" : ""}`}>
      <header className="auction-board__header">
        <DraftRoomModeArtworkImage
          modeId={state.mode_id}
          className="auction-board__image build-qb-board__image"
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

      {!rosterResult ? <section className="auction-scoreboard surface-card">
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
      </section> : null}

      {!rosterResult ? <section className="auction-current surface-card">
        <div className="auction-current__meta">
          <span>ROUND {Math.min(state.current_round, mode.rounds)} / {mode.rounds}</span>
          <span>TIES → {tieName}</span>
        </div>
        <div
          className={`auction-current__item${currentQbIdentity ? " has-build-qb-team" : ""}${trioMode ? " draft-room-trio-current" : ""}`}
          style={currentQbIdentity ? buildQbTeamStyle(currentQbIdentity) : undefined}
        >
          <small>{trioMode ? "CURRENT TRIO" : longhornsTeamsMode ? "CURRENT TEXAS TEAM" : longhornsMode ? "CURRENT LONGHORN" : cowboysMode ? "CURRENT COWBOY" : "CURRENT QB"}</small>
          {trioMode ? (
            state.current_item?.display_label
              ? <TrioPackageCard modeId={state.mode_id} displayLabel={state.current_item.display_label} />
              : <h2>{terminal ? "ROSTERS LOCKED" : "LOADING"}</h2>
          ) : longhornsMode || longhornsTeamsMode || cowboysMode ? (
            <>
              <h2 className={longhornsTeamsMode ? "draft-room-season-label" : undefined}>{state.current_item?.display_label ?? (terminal ? "ROSTER LOCKED" : "LOADING")}</h2>
              {longhornsTeamsMode && state.current_item?.display_label ? (
                <p className="draft-room-season-summary draft-room-season-summary--current">
                  {longhornsTeamSeasonSummary(state.current_item.display_label)}
                </p>
              ) : longhornsMode && state.current_item?.display_label ? (
                <p className="draft-room-player-summary draft-room-player-summary--current">
                  {longhornsPlayerSummary(state.current_item.display_label)}
                </p>
              ) : null}
            </>
          ) : (
            <div className="build-qb-current__identity">
              {currentQbIdentity ? <BuildQbTeamMark identity={currentQbIdentity} /> : null}
              <h2>{state.current_item?.display_label ?? (terminal ? "BUILD LOCKED" : "LOADING")}</h2>
            </div>
          )}
        </div>
        <strong className="auction-current__status">{status}</strong>
      </section> : null}

      {latestRound && !rosterResult ? (
        <section className="auction-result surface-card" aria-label="Latest Draft Room result">
          <p className="eyebrow">{latestRound.forced ? "FORCED $1 ASSIGNMENT" : `ROUND ${latestRound.round} RESULT`}</p>
          <h2>{latestAward ? (trioMode ? "Trio awarded" : latestAward.display_label) : (trioMode ? "Resolved trio" : longhornsTeamsMode ? "Resolved Texas team" : longhornsMode ? "Resolved Longhorn" : cowboysMode ? "Resolved Cowboy" : "Resolved QB")}</h2>
          <p>
            {trioMode && latestAward ? `${latestAward.display_label} · ` : latestAward?.category ? `${latestAward.category} · ` : ""}
            {latestRound.forced
              ? `assigned for ${latestRound.charged_amount}`
              : `${state.challenger_display_name} ${latestRound.challenger_bid} · ${state.recipient_display_name} ${latestRound.recipient_bid}`}
          </p>
          {longhornsTeamsMode && latestAward ? (
            <span className="draft-room-season-summary">{longhornsTeamSeasonSummary(latestAward.display_label)}</span>
          ) : longhornsMode && latestAward ? (
            <span className="draft-room-player-summary">{longhornsPlayerSummary(latestAward.display_label)}</span>
          ) : null}
        </section>
      ) : null}

      {state.lifecycle_state === "completed"
        && state.challenger_final_score !== null
        && state.recipient_final_score !== null ? (
        <section className="auction-final surface-card" aria-label={trioMode ? "Trio final result" : longhornsTeamsMode ? "Longhorns Teams final result" : longhornsMode ? "Longhorns final result" : cowboysMode ? "Cowboys final result" : "Build a QB final result"}>
          <p className="eyebrow">{openRosterMode ? "FINAL ROSTER SCORE" : "FINAL BUILD SCORE"}</p>
          <h2>
            {state.is_tie
              ? "TRUE TIE"
              : state.winner_profile_id === state.challenger_id
                ? `${state.challenger_display_name} WINS`
                : `${state.recipient_display_name} WINS`}
          </h2>
          <div className="auction-final__scores">
            <article><small>{state.challenger_display_name}</small><strong>{openRosterMode ? formatTrioFinalScore(state.challenger_final_score) : state.challenger_final_score}</strong></article>
            <b>–</b>
            <article><small>{state.recipient_display_name}</small><strong>{openRosterMode ? formatTrioFinalScore(state.recipient_final_score) : state.recipient_final_score}</strong></article>
          </div>
        </section>
      ) : null}

      {trioMode
        ? <TrioComparison state={state} />
        : longhornsTeamsMode
          ? <LonghornsComparison
              state={state}
              itemLabel="TEAM"
              ariaLabel="Longhorns team-season comparison"
              itemSummary={longhornsTeamSeasonSummary}
            />
          : longhornsMode
            ? <LonghornsComparison state={state} itemSummary={longhornsPlayerSummary} />
            : cowboysMode
              ? <LonghornsComparison state={state} ariaLabel="Cowboys roster comparison" />
              : <BuildComparison state={state} />}

      {canBid ? (
        <form className="auction-bid surface-card" onSubmit={submit}>
          {!openRosterMode ? (
            <>
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
            </>
          ) : (
            <p className="draft-room-trio-bid-note">
              {trioMode
                ? "Bid on the full QB / RB / WR package."
                : longhornsTeamsMode
                  ? "Bid on this Texas season. Win four seasons and build the stronger four-team group."
                  : cowboysMode
                    ? "Bid on this Cowboy. Any position can join your four-player roster."
                    : "Bid on this Longhorn. Any position can join your four-player roster."}
            </p>
          )}
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
  const requestedModeParam = params.get("mode") ?? "";
  const requestedMode: DraftRoomModeId | null = isDraftRoomModeId(requestedModeParam) ? requestedModeParam : null;
  const [selectedModeId, setSelectedModeId] = useState<DraftRoomModeId | null>(requestedMode);
  const [selectedSport, setSelectedSport] = useState<DraftRoomSport>(
    requestedMode && isCfbDraftRoomMode(requestedMode) ? "cfb" : "nfl",
  );
  const [setupStep, setSetupStep] = useState<"formats" | "opponent">("formats");
  const selectedMode = selectedModeId ? draftRoomModeDefinition(selectedModeId) : null;
  const visibleModes = draftRoomModes.filter((mode) => (
    selectedSport === "cfb" ? isCfbDraftRoomMode(mode.id) : !isCfbDraftRoomMode(mode.id)
  ));

  useEffect(() => {
    if (auctionId || !requestedMode) return;
    setSelectedModeId(requestedMode);
    setSelectedSport(isCfbDraftRoomMode(requestedMode) ? "cfb" : "nfl");
    setSetupStep("formats");
  }, [auctionId, requestedMode]);

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
  const backLink = (
    <Link className="game-header__back" to="/football">
      <span>‹</span><span><small>FOOTBALL HQ</small><strong>All Games</strong></span>
    </Link>
  );

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

  function newRoom(modeId: DraftRoomModeId = selectedModeId ?? requestedMode ?? "build-qb") {
    setState(null);
    setSelectedOpponent(null);
    setSelectedModeId(modeId);
    setSelectedSport(isCfbDraftRoomMode(modeId) ? "cfb" : "nfl");
    setSetupStep("formats");
    setError("");
    navigate(`/football/draft-room?mode=${modeId}`, { replace: true });
  }

  function selectSport(sport: DraftRoomSport) {
    setSelectedSport(sport);
    setSelectedModeId(null);
    setSelectedOpponent(null);
    setSetupStep("formats");
    setError("");
  }

  function selectMode(modeId: DraftRoomModeId) {
    setSelectedModeId(modeId);
    setSelectedOpponent(null);
    setError("");
  }

  function continueToOpponent() {
    if (!selectedModeId) return;
    setSetupStep("opponent");
  }

  async function prepare() {
    if (!repository || !selectedModeId || !selectedOpponent || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const opponent = await challenges.findProfile(selectedOpponent.displayName);
      if (!opponent) throw new Error("No Octagon HQ profile matched that exact name.");
      const prepared = await repository.prepare(opponent.id, selectedModeId);
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
      newRoom(state.mode_id);
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
      else newRoom(state.mode_id);
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
        {backLink}
        <section className="auction-destination surface-card">
          <p className="eyebrow">DRAFT ROOM</p>
          <h1>{loading ? "Loading Draft Room…" : "Draft Room unavailable"}</h1>
          {error ? <p className="auction-error" role="status">{error}</p> : null}
          {!loading ? <button className="primary-action" type="button" onClick={() => newRoom(requestedMode ?? "build-qb")}>BACK TO DRAFT ROOM</button> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack football-room-page auction-page">
      {backLink}
      <header className="auction-hero surface-card draft-room-hero">
        <p className="eyebrow">SEALED BID CHALLENGE</p>
        <h1>Draft Room</h1>
        <p>Pick a format and challenge another member. Bid privately to build the stronger roster.</p>
      </header>

      {setupStep === "formats" ? (
        <section className="auction-catalog draft-room-catalog" aria-labelledby="draft-room-modes-title">
          <header>
            <p className="eyebrow">STEP 1</p>
            <h2 id="draft-room-modes-title">Choose a format</h2>
          </header>

          <div className="auction-catalog__tabs draft-room-sport-toggle" role="group" aria-label="Draft Room sport">
            <button
              type="button"
              aria-pressed={selectedSport === "nfl"}
              className={selectedSport === "nfl" ? "is-active" : ""}
              onClick={() => selectSport("nfl")}
            >
              NFL
            </button>
            <button
              type="button"
              aria-pressed={selectedSport === "cfb"}
              className={selectedSport === "cfb" ? "is-active" : ""}
              onClick={() => selectSport("cfb")}
            >
              CFB
            </button>
          </div>

          <ol>
            {visibleModes.map((mode, index) => (
              <li
                className={[
                  selectedModeId === mode.id ? "is-selected" : "",
                  isLonghornsDraftRoomMode(mode.id) || isLonghornsTeamsDraftRoomMode(mode.id) ? "is-longhorns-mode" : "",
                ].filter(Boolean).join(" ")}
                key={mode.id}
              >
                <button
                  type="button"
                  aria-label={mode.displayName}
                  aria-pressed={selectedModeId === mode.id}
                  onClick={() => selectMode(mode.id)}
                >
                  <DraftRoomModeArtworkImage modeId={mode.id} className="auction-catalog__image" />
                  <span className="auction-catalog__number">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="auction-catalog__name">{mode.displayName}</strong>
                  <em className="auction-catalog__mark" aria-hidden="true">{selectedModeId === mode.id ? "✓" : "›"}</em>
                </button>
              </li>
            ))}
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
          <button
            className="auction-opponents__back"
            type="button"
            onClick={() => {
              setSetupStep("formats");
              setSelectedOpponent(null);
            }}
          >
            ← CHANGE FORMAT
          </button>
          <p className="eyebrow">STEP 2</p>
          <h2>Choose opponent</h2>
          <div className="auction-opponents__summary">
            <small>SELECTED FORMAT</small>
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
            disabled={!repository || !selectedModeId || !selectedOpponent || busy}
            onClick={() => void prepare()}
          >
            {busy ? "PREPARING…" : "PREPARE ROOM"}
          </button>
        </section>
      )}

      {error ? <p className="auction-error" role="status">{error}</p> : null}
    </div>
  );
}
