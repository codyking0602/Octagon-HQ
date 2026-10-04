import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-wheel.css";
import "../../styles/ufc-wheel.css";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import {
  createWheelUfcRepository,
  type WheelUfcCandidate,
  type WheelUfcPick,
  type WheelUfcState,
} from "../play/wheelUfcRepository";
import {
  WHEEL_UFC_CATEGORIES,
  WHEEL_UFC_ROSTER_SLOTS,
  WHEEL_UFC_SLOT_ABBREVIATIONS,
  WHEEL_UFC_VISUAL_SLICES,
  wheelUfcCategory,
  wheelUfcSliceBackground,
  wheelUfcSpinDisplay,
  wheelUfcTargetSlice,
  type WheelUfcRosterSlot,
} from "./wheelUfcModel";

function normalizeCode(value: string | null) {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{4,12}$/.test(code) ? code : "";
}

function rosterForProfile(state: WheelUfcState, profileId: string | null | undefined) {
  if (!profileId) return [] as WheelUfcPick[];
  return state.creator.id === profileId ? state.creator_roster : state.recipient_roster;
}

function otherParticipant(state: WheelUfcState, profileId: string | null | undefined) {
  return state.creator.id === profileId ? state.recipient : state.creator;
}

function pickForSlot(roster: readonly WheelUfcPick[], slot: WheelUfcRosterSlot) {
  return roster.find((pick) => pick.roster_slot === slot) ?? null;
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function FighterMark({ pick }: { pick: WheelUfcPick | null }) {
  if (!pick) return <span className="football-wheel-roster__empty-mark" aria-hidden="true">+</span>;
  return (
    <span className="football-wheel-roster__mark ufc-wheel-roster__mark" aria-hidden="true">
      {pick.headshot_url ? (
        <img
          src={pick.headshot_url}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
            event.currentTarget.nextElementSibling?.removeAttribute("hidden");
          }}
        />
      ) : null}
      <b hidden={Boolean(pick.headshot_url)}>{initials(pick.display_name)}</b>
    </span>
  );
}

function RosterCell({
  pick,
  align,
}: {
  pick: WheelUfcPick | null;
  align: "left" | "right";
}) {
  return (
    <div className={`football-wheel-roster__cell is-${align}${pick ? " is-filled" : ""}`}>
      <FighterMark pick={pick} />
      <div>
        <strong>{pick?.display_name ?? "OPEN"}</strong>
        <span>{pick ? [pick.ranking_label, pick.country_code].filter(Boolean).join(" · ") : "—"}</span>
      </div>
    </div>
  );
}

function HeadToHeadRoster({
  state,
  activeProfileId,
}: {
  state: WheelUfcState;
  activeProfileId: string | null | undefined;
}) {
  return (
    <section className="football-wheel-roster surface-card ufc-wheel-roster" aria-label="Wheel of UFC rosters">
      <header>
        <div className={state.creator.id === activeProfileId ? "is-you" : ""}>
          <small>{state.creator.id === activeProfileId ? "YOU" : "CHALLENGER"}</small>
          <strong>{state.creator.display_name}</strong>
        </div>
        <span>ROSTERS</span>
        <div className={state.recipient.id === activeProfileId ? "is-you" : ""}>
          <small>{state.recipient.id === activeProfileId ? "YOU" : "OPPONENT"}</small>
          <strong>{state.recipient.display_name}</strong>
        </div>
      </header>
      <div className="football-wheel-roster__rows">
        {WHEEL_UFC_ROSTER_SLOTS.map((slot) => (
          <div className="football-wheel-roster__row" key={slot}>
            <RosterCell pick={pickForSlot(state.creator_roster, slot)} align="left" />
            <b title={slot}>{WHEEL_UFC_SLOT_ABBREVIATIONS[slot]}</b>
            <RosterCell pick={pickForSlot(state.recipient_roster, slot)} align="right" />
          </div>
        ))}
      </div>
    </section>
  );
}

function UfcWheel({
  rotation,
  spinning,
  pendingSpin,
  canSpin,
  onSpin,
}: {
  rotation: number;
  spinning: boolean;
  pendingSpin: WheelUfcState["pending_spin"];
  canSpin: boolean;
  onSpin: () => void;
}) {
  return (
    <section className="football-wheel surface-card ufc-wheel" aria-label="UFC category wheel">
      <div className="football-wheel__pointer" aria-hidden="true" />
      <div
        className={`football-wheel__disc ufc-wheel__disc${spinning ? " is-spinning" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: wheelUfcSliceBackground(),
        }}
      >
        <div className="football-wheel__rings" aria-hidden="true" />
        {WHEEL_UFC_VISUAL_SLICES.map((categoryId, index) => (
          <span
            className="football-wheel__label ufc-wheel__label"
            key={`${categoryId}:${index}`}
            style={{
              "--wheel-index": index,
              "--wheel-count": WHEEL_UFC_VISUAL_SLICES.length,
            } as CSSProperties}
            title={wheelUfcCategory(categoryId).label}
          >
            <b>{wheelUfcCategory(categoryId).shortLabel}</b>
          </span>
        ))}
      </div>
      <button
        className={`football-wheel__center ufc-wheel__center${pendingSpin ? " has-team" : ""}`}
        type="button"
        disabled={!canSpin || spinning}
        onClick={onSpin}
      >
        {pendingSpin ? (
          <>
            <strong>{pendingSpin.category === "COUNTRY" ? pendingSpin.country_code ?? "WORLD" : wheelUfcCategory(pendingSpin.category).shortLabel}</strong>
            <span>{pendingSpin.category === "COUNTRY" ? pendingSpin.country_name : pendingSpin.label}</span>
          </>
        ) : spinning ? (
          <><strong>SPINNING</strong><span>…</span></>
        ) : canSpin ? (
          <><strong>SPIN</strong><span>THE WHEEL</span></>
        ) : (
          <><strong>WAIT</strong><span>FOR YOUR TURN</span></>
        )}
      </button>
    </section>
  );
}

function CandidatePicker({
  code,
  state,
  selectedSlot,
  candidates,
  loading,
  busy,
  error,
  onSelectSlot,
  onCandidates,
  onPick,
}: {
  code: string;
  state: WheelUfcState;
  selectedSlot: WheelUfcRosterSlot | null;
  candidates: readonly WheelUfcCandidate[];
  loading: boolean;
  busy: boolean;
  error: string;
  onSelectSlot: (slot: WheelUfcRosterSlot) => void;
  onCandidates: (slot: WheelUfcRosterSlot) => void;
  onPick: (candidate: WheelUfcCandidate) => void;
}) {
  const spin = state.pending_spin;
  if (!spin) return null;
  const category = wheelUfcCategory(spin.category);

  return (
    <section className="football-wheel-picker surface-card ufc-wheel-picker">
      <header>
        <span
          className="ufc-wheel-category-badge"
          style={{ "--category-color": category.color } as CSSProperties}
          aria-hidden="true"
        >
          {spin.category === "COUNTRY" ? spin.country_code ?? "WORLD" : category.shortLabel}
        </span>
        <div>
          <p className="eyebrow">YOUR SPIN</p>
          <h2>{wheelUfcSpinDisplay(spin.category, spin.country_name)}</h2>
          <span>Choose an open weight class, then lock one eligible current fighter.</span>
        </div>
      </header>

      <div className="football-wheel-picker__slots ufc-wheel-picker__slots" aria-label="Eligible open weight classes">
        {spin.eligible_slots.map((slot) => (
          <button
            type="button"
            className={selectedSlot === slot ? "is-active" : ""}
            disabled={busy}
            onClick={() => {
              onSelectSlot(slot);
              onCandidates(slot);
            }}
            key={slot}
          >
            <strong>{WHEEL_UFC_SLOT_ABBREVIATIONS[slot]}</strong>
            <span>{slot}</span>
          </button>
        ))}
      </div>

      {!spin.eligible_slots.length ? (
        <p className="football-wheel-picker__message">No open weight class can use this spin. Refresh the match.</p>
      ) : null}

      {loading ? <p className="football-wheel-picker__message">Loading eligible current UFC fighters…</p> : null}
      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}

      {!loading && !error && selectedSlot ? (
        <div className="football-wheel-picker__candidates" aria-label={`${selectedSlot} candidates`}>
          {candidates.map((candidate) => (
            <button type="button" disabled={busy} onClick={() => onPick(candidate)} key={candidate.fighter_id}>
              <span className="football-wheel-picker__headshot ufc-wheel-picker__headshot" aria-hidden="true">
                {candidate.headshot_url ? (
                  <img
                    src={candidate.headshot_url}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                      event.currentTarget.nextElementSibling?.removeAttribute("hidden");
                    }}
                  />
                ) : null}
                <b hidden={Boolean(candidate.headshot_url)}>{initials(candidate.display_name)}</b>
              </span>
              <span>
                <strong>{candidate.display_name}</strong>
                <small>{candidate.ranking_label}{candidate.country_name ? ` · ${candidate.country_name}` : ""}</small>
              </span>
              <em>SELECT →</em>
            </button>
          ))}
          {!candidates.length ? <p className="football-wheel-picker__message">No eligible fighter is available for that weight class.</p> : null}
        </div>
      ) : !selectedSlot && spin.eligible_slots.length ? (
        <p className="football-wheel-picker__message">Pick the weight class you want to use for this spin.</p>
      ) : null}
      <input type="hidden" value={code} readOnly />
    </section>
  );
}

function SetupScreen() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createWheelUfcRepository(), []);
  const [opponent, setOpponent] = useState<MemberCardSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!challenges.preferredRecipientName || opponent) return;
    const preferred = challenges.members.find((member) => (
      member.displayName.toUpperCase() === challenges.preferredRecipientName.toUpperCase()
    ));
    if (preferred) setOpponent(preferred);
  }, [challenges.members, challenges.preferredRecipientName, opponent]);

  async function createMatch() {
    if (!repository || !opponent || !challenges.activeProfile) return;
    setBusy(true);
    setError("");
    try {
      const profile = await challenges.findProfile(opponent.displayName);
      if (!profile) throw new Error("That Octagon HQ member could not be resolved.");
      const code = await repository.create(profile.id);
      challenges.clearPreparedRecipient();
      await challenges.refresh();
      navigate(`/play/wheel?match=${code}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of UFC challenge could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page football-wheel-page ufc-wheel-page">
      <section className="football-wheel-setup__hero surface-card">
        <p className="eyebrow">UFC CHALLENGE</p>
        <h1>WHEEL OF UFC</h1>
        <strong>Spin a category. Build all eight divisions.</strong>
        <p>
          Challenge another HQ member and build a current UFC roster from Flyweight through Heavyweight.
          Fighter grades stay hidden until both eight-man rosters are complete.
        </p>
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>1</small><span><b>THE WHEEL</b><em>Weighted for more roster decisions, fewer automatic stars</em></span></div>
          <strong>100% TOTAL</strong>
        </header>
        <div className="ufc-wheel-category-grid" aria-label="Wheel category odds">
          {WHEEL_UFC_CATEGORIES.map((category) => (
            <article key={category.id} style={{ "--category-color": category.color } as CSSProperties}>
              <span>{category.weight}%</span>
              <strong>{category.label}</strong>
              <small>{category.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>2</small><span><b>CHOOSE YOUR OPPONENT</b><em>Challenge-only · turns alternate</em></span></div>
        </header>
        {challenges.activeProfile ? (
          opponent ? (
            <div className="football-wheel-opponent">
              <i aria-hidden="true">
                {opponent.avatarPhotoData ? <img src={opponent.avatarPhotoData} alt="" /> : opponent.initials}
              </i>
              <span>
                <small>OPPONENT SELECTED</small>
                <strong>{opponent.displayName}</strong>
              </span>
              <button type="button" disabled={busy} onClick={() => setOpponent(null)}>CHANGE</button>
            </div>
          ) : (
            <ChallengeMemberPicker
              members={challenges.members}
              recentNames={challenges.profiles.map((profile) => profile.displayName)}
              selectedName=""
              busy={busy}
              onSelect={setOpponent}
            />
          )
        ) : (
          <div className="football-wheel-setup__signin">
            <p>Sign in to challenge another HQ member.</p>
            <button type="button" onClick={identity.openDialog}>SIGN IN</button>
          </div>
        )}
      </section>

      <section className="football-wheel-setup__rules surface-card">
        <header><p className="eyebrow">HOW IT WORKS</p><strong>16 turns · 8 picks each</strong></header>
        <div>
          <span><b>1</b> The first player is randomized after the challenge is accepted.</span>
          <span><b>2</b> Spin a category, choose any eligible open division, then take one current UFC fighter.</span>
          <span><b>3</b> Fill FLW · BW · FW · LW · WW · MW · LHW · HW. The same fighter cannot appear twice in a matchup.</span>
          <span><b>4</b> Young Gun means under 25. Veteran means 10+ UFC fights. Country draws a viable country after the spin.</span>
          <span><b>5</b> Dead categories are automatically removed from late spins. Individual HQ grades stay private until the final team grades.</span>
        </div>
      </section>

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}
      <div className="football-wheel-setup__actions">
        <button type="button" className="secondary-action" onClick={() => navigate("/play")}>ALL GAMES</button>
        <button
          type="button"
          className="primary-action"
          disabled={!repository || !opponent || !challenges.activeProfile || busy}
          onClick={() => void createMatch()}
        >
          {busy ? "CREATING MATCH…" : opponent ? `CHALLENGE ${opponent.displayName.toUpperCase()} →` : "CHOOSE AN OPPONENT"}
        </button>
      </div>
    </div>
  );
}

function MatchScreen({ code }: { code: string }) {
  const navigate = useNavigate();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createWheelUfcRepository(), []);
  const activeProfileId = challenges.activeProfile?.id ?? null;
  const [state, setState] = useState<WheelUfcState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<WheelUfcRosterSlot | null>(null);
  const [candidates, setCandidates] = useState<WheelUfcCandidate[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [error, setError] = useState("");
  const openedRef = useRef(false);

  async function syncMatch(showLoading = false) {
    if (!repository) return;
    if (showLoading) setLoading(true);
    try {
      setState(await repository.load(code));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of UFC match could not be loaded.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void syncMatch(true);
    const timer = window.setInterval(() => void syncMatch(false), 10_000);
    const onFocus = () => void syncMatch(false);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [code, repository]);

  useEffect(() => {
    if (
      !repository || !state || openedRef.current || state.opened_at || state.completed_at
      || activeProfileId !== state.recipient.id
    ) return;
    openedRef.current = true;
    repository.open(code)
      .then(() => Promise.all([syncMatch(false), challenges.refresh()]))
      .catch((reason) => {
        openedRef.current = false;
        setError(reason instanceof Error ? reason.message : "Challenge could not be accepted.");
      });
  }, [activeProfileId, challenges, code, repository, state]);

  const isMyTurn = Boolean(state && activeProfileId && state.current_turn_profile_id === activeProfileId);
  const opponent = state ? otherParticipant(state, activeProfileId) : null;

  useEffect(() => {
    setSelectedSlot(null);
    setCandidates([]);
    setCandidateError("");
  }, [state?.pending_spin?.category, state?.pending_spin?.country_code, state?.turn_count]);

  async function spin() {
    if (!repository || !state || !isMyTurn || state.phase !== "spin" || spinning || !state.opened_at) return;
    setSpinning(true);
    setError("");
    try {
      const next = await repository.spin(code);
      const spinResult = next.pending_spin;
      if (!spinResult) throw new Error("The UFC wheel did not return a category.");
      const index = wheelUfcTargetSlice(spinResult.category, next.turn_count);
      const step = 360 / WHEEL_UFC_VISUAL_SLICES.length;
      setRotation((current) => {
        const currentModulo = ((current % 360) + 360) % 360;
        const targetModulo = ((-index * step) % 360 + 360) % 360;
        const correction = (targetModulo - currentModulo + 360) % 360;
        return current + 1080 + correction;
      });
      window.setTimeout(() => {
        setState(next);
        setSpinning(false);
        void challenges.refresh();
      }, 1550);
    } catch (reason) {
      setSpinning(false);
      setError(reason instanceof Error ? reason.message : "The UFC wheel could not be spun.");
    }
  }

  async function loadCandidates(slot: WheelUfcRosterSlot) {
    if (!repository || !state || !isMyTurn || state.phase !== "pick") return;
    setCandidateLoading(true);
    setCandidateError("");
    try {
      setCandidates(await repository.candidates(code, slot));
    } catch (reason) {
      setCandidates([]);
      setCandidateError(reason instanceof Error ? reason.message : "Eligible fighters could not be loaded.");
    } finally {
      setCandidateLoading(false);
    }
  }

  async function pick(candidate: WheelUfcCandidate) {
    if (!repository || !state || !selectedSlot || !isMyTurn || state.phase !== "pick") return;
    setBusy(true);
    setError("");
    try {
      const next = await repository.pick(code, candidate.fighter_id, selectedSlot);
      setState(next);
      setSelectedSlot(null);
      setCandidates([]);
      await challenges.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That UFC roster pick could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function forfeitMatch() {
    if (!repository || !state?.opened_at || state.phase === "complete" || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await repository.forfeit(code);
      setState(next);
      setShowForfeitConfirm(false);
      await challenges.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The match could not be forfeited.");
    } finally {
      setBusy(false);
    }
  }

  async function shareResult() {
    if (!state?.result) return;
    const winner = state.result.winner_profile_id === state.creator.id
      ? state.creator.display_name
      : state.result.winner_profile_id === state.recipient.id
        ? state.recipient.display_name
        : "Tie";
    const text = `Wheel of UFC · ${winner === "Tie" ? "Dead even" : `${winner} wins`} · ${state.creator.display_name} ${state.result.creator_final_grade.toFixed(1)} vs ${state.recipient.display_name} ${state.result.recipient_final_grade.toFixed(1)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Wheel of UFC · Final", text, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} · ${window.location.href}`);
        setShareStatus("LINK COPIED");
        window.setTimeout(() => setShareStatus(""), 1600);
      }
    } catch (reason) {
      if (!(reason instanceof DOMException && reason.name === "AbortError")) setShareStatus("SHARE FAILED");
    }
  }

  if (loading) {
    return (
      <div className="page football-wheel-page ufc-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF UFC</p>
          <h1>Loading matchup…</h1>
        </section>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page football-wheel-page ufc-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF UFC</p>
          <h1>Match unavailable</h1>
          <p>{error || "This challenge could not be found."}</p>
          <button type="button" onClick={() => navigate("/play")}>BACK TO UFC</button>
        </section>
      </div>
    );
  }

  if (state.phase === "complete") {
    const forfeitedProfile = state.forfeited_by_profile_id === state.creator.id
      ? state.creator
      : state.forfeited_by_profile_id === state.recipient.id
        ? state.recipient
        : null;
    const gradedWinner = state.result?.winner_profile_id === state.creator.id
      ? state.creator
      : state.result?.winner_profile_id === state.recipient.id
        ? state.recipient
        : null;
    const forfeitWinner = forfeitedProfile?.id === state.creator.id ? state.recipient : state.creator;

    return (
      <div className="page football-wheel-page football-wheel-page--result ufc-wheel-page">
        <section className="football-wheel-result-summary surface-card">
          <div className="football-wheel-result-summary__meta">
            <div>
              <p className="eyebrow">WHEEL OF UFC · {forfeitedProfile ? "FORFEIT" : "FINAL"}</p>
              <h1>{forfeitedProfile
                ? `${forfeitedProfile.display_name} forfeited`
                : gradedWinner
                  ? `${gradedWinner.display_name} wins`
                  : "Dead even"}</h1>
            </div>
            <span>CURRENT UFC · 8 DIVISIONS</span>
          </div>
          {!forfeitedProfile && state.result ? (
            <div className="football-wheel-result-score">
              <div className={state.result.winner_profile_id === state.creator.id ? "is-winner" : ""}>
                <small>{state.creator.id === activeProfileId ? "YOU" : state.creator.display_name}</small>
                <strong>{state.result.creator_final_grade.toFixed(1)}</strong>
                <span>FINAL GRADE</span>
              </div>
              <b>VS</b>
              <div className={state.result.winner_profile_id === state.recipient.id ? "is-winner" : ""}>
                <small>{state.recipient.id === activeProfileId ? "YOU" : state.recipient.display_name}</small>
                <strong>{state.result.recipient_final_grade.toFixed(1)}</strong>
                <span>FINAL GRADE</span>
              </div>
            </div>
          ) : (
            <p className="football-wheel-result-summary__note">{forfeitWinner.display_name} wins by forfeit.</p>
          )}
        </section>

        <HeadToHeadRoster state={state} activeProfileId={activeProfileId} />

        <div className={`football-wheel-result-actions${state.result && !forfeitedProfile ? "" : " without-share"}`}>
          {state.result && !forfeitedProfile ? (
            <button className="football-wheel-result-actions__share" type="button" onClick={() => void shareResult()}>
              {shareStatus || "SHARE RESULT ↗"}
            </button>
          ) : null}
          <button className="football-wheel-result-actions__new" type="button" onClick={() => navigate("/play/wheel")}>NEW CHALLENGE →</button>
          <button className="football-wheel-result-actions__all" type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
        </div>
      </div>
    );
  }

  const turnLabel = !state.opened_at
    ? activeProfileId === state.recipient.id
      ? "ACCEPTING CHALLENGE…"
      : `WAITING FOR ${state.recipient.display_name.toUpperCase()} TO ACCEPT`
    : isMyTurn
      ? state.phase === "spin" ? "YOUR TURN · SPIN" : "YOUR TURN · MAKE YOUR PICK"
      : state.phase === "pick" && state.pending_spin
        ? `${opponent?.display_name.toUpperCase() ?? "OPPONENT"} SPUN ${wheelUfcSpinDisplay(state.pending_spin.category, state.pending_spin.country_name)}`
        : `${opponent?.display_name.toUpperCase() ?? "OPPONENT"}'S TURN`;

  return (
    <div className="page football-wheel-page ufc-wheel-page">
      <section className="football-wheel-match__status surface-card">
        <div>
          <p className="eyebrow">WHEEL OF UFC · TURN {Math.min(16, state.turn_count + 1)} OF 16</p>
          <h1>{turnLabel}</h1>
          <span>CURRENT UFC · 8 MEN'S DIVISIONS · GRADES HIDDEN</span>
        </div>
        <div className="football-wheel-match__actions">
          <button type="button" disabled={busy || spinning} onClick={() => void syncMatch(false)}>REFRESH</button>
          {state.opened_at ? (
            <button type="button" className="is-danger" disabled={busy || spinning} onClick={() => setShowForfeitConfirm(true)}>FORFEIT</button>
          ) : null}
        </div>
      </section>

      <HeadToHeadRoster state={state} activeProfileId={activeProfileId} />

      <UfcWheel
        rotation={rotation}
        spinning={spinning}
        pendingSpin={state.pending_spin}
        canSpin={Boolean(state.opened_at && isMyTurn && state.phase === "spin")}
        onSpin={() => void spin()}
      />

      {state.phase === "pick" && state.pending_spin && isMyTurn ? (
        <CandidatePicker
          code={code}
          state={state}
          selectedSlot={selectedSlot}
          candidates={candidates}
          loading={candidateLoading}
          busy={busy}
          error={candidateError}
          onSelectSlot={setSelectedSlot}
          onCandidates={(slot) => void loadCandidates(slot)}
          onPick={(candidate) => void pick(candidate)}
        />
      ) : null}

      {!isMyTurn && state.opened_at ? (
        <section className="football-wheel-waiting surface-card">
          <strong>{state.phase === "pick" && state.pending_spin
            ? `${opponent?.display_name ?? "Your opponent"} is choosing from ${wheelUfcSpinDisplay(state.pending_spin.category, state.pending_spin.country_name)}.`
            : `Waiting on ${opponent?.display_name ?? "your opponent"}.`}</strong>
          <span>You’ll get a notification when your next spin is ready.</span>
        </section>
      ) : null}

      {showForfeitConfirm ? (
        <div className="football-wheel-forfeit" role="presentation" onClick={() => !busy && setShowForfeitConfirm(false)}>
          <section
            className="football-wheel-forfeit__card surface-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ufc-wheel-forfeit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">END MATCH</p>
            <h2 id="ufc-wheel-forfeit-title">Forfeit Wheel of UFC?</h2>
            <p>Your opponent will win by forfeit. Picks already made stay visible.</p>
            <div>
              <button type="button" className="secondary-action" disabled={busy} onClick={() => setShowForfeitConfirm(false)}>KEEP PLAYING</button>
              <button type="button" className="football-wheel-forfeit__confirm" disabled={busy} onClick={() => void forfeitMatch()}>
                {busy ? "FORFEITING…" : "FORFEIT MATCH"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}
    </div>
  );
}

export default function UfcWheelPage() {
  const [searchParams] = useSearchParams();
  const code = normalizeCode(searchParams.get("match"));
  return code ? <MatchScreen code={code} /> : <SetupScreen />;
}
