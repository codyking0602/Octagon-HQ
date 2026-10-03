import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/football-wheel.css";
import { ChallengeMemberPicker } from "../challenges/ChallengeMemberPicker";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import {
  createWheelFootballRepository,
  type WheelFootballPick,
  type WheelFootballState,
} from "../play/wheelFootballRepository";
import {
  WHEEL_FOOTBALL_DIVISIONS,
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  loadWheelFootballRoster,
  wheelFootballPoolTeams,
  wheelFootballShortlist,
  wheelFootballTeam,
  type WheelFootballCandidate,
  type WheelFootballDivision,
  type WheelFootballPoolScope,
  type WheelFootballRosterSlot,
  type WheelFootballTeam,
} from "./wheelFootballModel";

const SCOPE_OPTIONS: readonly {
  value: WheelFootballPoolScope;
  label: string;
  detail: string;
}[] = [
  { value: "NFL", label: "FULL NFL", detail: "All 32 teams" },
  { value: "AFC", label: "AFC", detail: "16 teams" },
  { value: "NFC", label: "NFC", detail: "16 teams" },
  { value: "DIVISION", label: "DIVISION", detail: "4 teams · repeats allowed" },
];

function divisionFromState(value: string | null): WheelFootballDivision | null {
  return (WHEEL_FOOTBALL_DIVISIONS as readonly string[]).includes(value ?? "")
    ? value as WheelFootballDivision
    : null;
}

function normalizeCode(value: string | null) {
  const code = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{4,12}$/.test(code) ? code : "";
}

function rosterForProfile(state: WheelFootballState, profileId: string | null | undefined) {
  if (!profileId) return [] as WheelFootballPick[];
  return state.creator.id === profileId ? state.creator_roster : state.recipient_roster;
}

function otherParticipant(state: WheelFootballState, profileId: string | null | undefined) {
  return state.creator.id === profileId ? state.recipient : state.creator;
}

function openSlots(roster: readonly WheelFootballPick[]) {
  const filled = new Set(roster.map((pick) => pick.roster_slot));
  return WHEEL_FOOTBALL_ROSTER_SLOTS.filter((slot) => !filled.has(slot));
}

function pickForSlot(roster: readonly WheelFootballPick[], slot: WheelFootballRosterSlot) {
  return roster.find((pick) => pick.roster_slot === slot) ?? null;
}

function PickMark({ pick }: { pick: WheelFootballPick | null }) {
  const team = pick ? wheelFootballTeam(pick.team_code) : null;
  if (!pick) return <span className="football-wheel-roster__empty-mark" aria-hidden="true">+</span>;
  return (
    <span className="football-wheel-roster__mark" aria-hidden="true">
      {pick.headshot_url ? (
        <img src={pick.headshot_url} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
      ) : team?.logoSrc ? (
        <img src={team.logoSrc} alt="" />
      ) : (
        <b>{pick.team_code}</b>
      )}
    </span>
  );
}

function RosterCell({
  pick,
  align,
}: {
  pick: WheelFootballPick | null;
  align: "left" | "right";
}) {
  const team = pick ? wheelFootballTeam(pick.team_code) : null;
  return (
    <div
      className={`football-wheel-roster__cell is-${align}${pick ? " is-filled" : ""}`}
      style={team ? {
        "--team-primary": team.primaryColor,
        "--team-secondary": team.secondaryColor,
      } as CSSProperties : undefined}
    >
      <PickMark pick={pick} />
      <div>
        <strong>{pick?.display_name ?? "OPEN"}</strong>
        <span>{pick ? `${pick.team_code} · ${pick.position_abbreviation}` : "—"}</span>
      </div>
      {pick?.hidden_grade != null ? (
        <em className="football-wheel-roster__grade">{Math.round(pick.hidden_grade)}</em>
      ) : null}
    </div>
  );
}

function HeadToHeadRoster({
  state,
  activeProfileId,
}: {
  state: WheelFootballState;
  activeProfileId: string | null | undefined;
}) {
  return (
    <section className="football-wheel-roster surface-card" aria-label="Wheel of Football Superteams">
      <header>
        <div className={state.creator.id === activeProfileId ? "is-you" : ""}>
          <small>{state.creator.id === activeProfileId ? "YOU" : "CHALLENGER"}</small>
          <strong>{state.creator.display_name}</strong>
        </div>
        <span>SUPERTEAMS</span>
        <div className={state.recipient.id === activeProfileId ? "is-you" : ""}>
          <small>{state.recipient.id === activeProfileId ? "YOU" : "OPPONENT"}</small>
          <strong>{state.recipient.display_name}</strong>
        </div>
      </header>
      <div className="football-wheel-roster__rows">
        {WHEEL_FOOTBALL_ROSTER_SLOTS.map((slot) => (
          <div className="football-wheel-roster__row" key={slot}>
            <RosterCell pick={pickForSlot(state.creator_roster, slot)} align="left" />
            <b>{slot}</b>
            <RosterCell pick={pickForSlot(state.recipient_roster, slot)} align="right" />
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamLogo({ team, className = "" }: { team: WheelFootballTeam; className?: string }) {
  return (
    <span className={`football-wheel-team-logo ${className}`} aria-hidden="true">
      {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.code}</b>}
    </span>
  );
}

function wheelTeamBackground(teams: readonly WheelFootballTeam[]) {
  if (!teams.length) return undefined;
  const slice = 360 / teams.length;
  const stops = teams.flatMap((team, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return [`${team.primaryColor} ${start}deg`, `${team.primaryColor} ${end}deg`];
  });
  return `conic-gradient(from ${-slice / 2}deg, ${stops.join(", ")})`;
}

function FootballWheel({
  teams,
  rotation,
  spinning,
  pendingTeam,
  canSpin,
  onSpin,
}: {
  teams: readonly WheelFootballTeam[];
  rotation: number;
  spinning: boolean;
  pendingTeam: WheelFootballTeam | null;
  canSpin: boolean;
  onSpin: () => void;
}) {
  return (
    <section className="football-wheel surface-card" aria-label="NFL team wheel">
      <div className="football-wheel__pointer" aria-hidden="true" />
      <div
        className={`football-wheel__disc${spinning ? " is-spinning" : ""}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          background: wheelTeamBackground(teams),
        }}
      >
        <div className="football-wheel__rings" aria-hidden="true" />
        {teams.map((team, index) => (
          <span
            className="football-wheel__label"
            key={team.code}
            style={{
              "--wheel-index": index,
              "--wheel-count": teams.length,
              "--team-primary": team.primaryColor,
              "--team-secondary": team.secondaryColor,
            } as CSSProperties}
            title={team.name}
          >
            {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.code}</b>}
          </span>
        ))}
      </div>
      <button
        className={`football-wheel__center${pendingTeam ? " has-team" : ""}`}
        type="button"
        disabled={!canSpin || spinning}
        onClick={onSpin}
      >
        {pendingTeam ? (
          <>
            <TeamLogo team={pendingTeam} />
            <strong>{pendingTeam.code}</strong>
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
  team,
  candidates,
  roster,
  selectedSlot,
  loading,
  busy,
  error,
  onSelectSlot,
  onPick,
  onRetry,
}: {
  team: WheelFootballTeam;
  candidates: readonly WheelFootballCandidate[];
  roster: readonly WheelFootballPick[];
  selectedSlot: WheelFootballRosterSlot | null;
  loading: boolean;
  busy: boolean;
  error: string;
  onSelectSlot: (slot: WheelFootballRosterSlot) => void;
  onPick: (candidate: WheelFootballCandidate) => void;
  onRetry: () => void;
}) {
  const usedIds = new Set(roster.map((pick) => pick.athlete_id));
  const slots = openSlots(roster);
  const available = candidates.filter((candidate) => !usedIds.has(candidate.id));
  const visible = selectedSlot
    ? wheelFootballShortlist(available, selectedSlot, team.code)
    : [];

  return (
    <section className="football-wheel-picker surface-card">
      <header>
        <TeamLogo team={team} />
        <div>
          <p className="eyebrow">YOUR SPIN</p>
          <h2>{team.name}</h2>
          <span>Choose an open roster spot, then take a current player or the head coach.</span>
        </div>
      </header>

      {loading ? <p className="football-wheel-picker__message">Loading the current {team.name} roster…</p> : null}
      {error ? (
        <div className="football-wheel-picker__error" role="status">
          <span>{error}</span>
          <button type="button" onClick={onRetry}>RETRY</button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="football-wheel-picker__slots" aria-label="Open roster spots">
            {slots.map((slot) => {
              const count = wheelFootballShortlist(available, slot, team.code).length;
              return (
                <button
                  type="button"
                  className={selectedSlot === slot ? "is-active" : ""}
                  disabled={busy || count === 0}
                  onClick={() => onSelectSlot(slot)}
                  key={slot}
                >
                  <strong>{slot}</strong>
                </button>
              );
            })}
          </div>

          {selectedSlot ? (
            <div className="football-wheel-picker__candidates" aria-label={`${selectedSlot} candidates`}>
              {visible.map((candidate) => (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPick(candidate)}
                  key={candidate.id}
                >
                  <span className="football-wheel-picker__headshot" aria-hidden="true">
                    {candidate.headshotUrl
                      ? <img src={candidate.headshotUrl} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />
                      : team.logoSrc
                        ? <img src={team.logoSrc} alt="" />
                        : <b>{team.code}</b>}
                  </span>
                  <span>
                    <strong>{candidate.name}</strong>
                    <small>{candidate.positionLabel}</small>
                  </span>
                  <em>SELECT →</em>
                </button>
              ))}
              {!visible.length ? (
                <p className="football-wheel-picker__message">No eligible current roster option is available for that spot.</p>
              ) : null}
            </div>
          ) : (
            <p className="football-wheel-picker__message">Pick the roster spot you want to use for this spin.</p>
          )}
        </>
      ) : null}
    </section>
  );
}

function SetupScreen() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createWheelFootballRepository(), []);
  const [scope, setScope] = useState<WheelFootballPoolScope>("NFL");
  const [division, setDivision] = useState<WheelFootballDivision>("NFC East");
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

  const pool = wheelFootballPoolTeams(scope, scope === "DIVISION" ? division : null);

  async function createMatch() {
    if (!repository || !opponent || !challenges.activeProfile) return;
    setBusy(true);
    setError("");
    try {
      const profile = await challenges.findProfile(opponent.displayName);
      if (!profile) throw new Error("That Octagon HQ member could not be resolved.");
      const code = await repository.create(
        profile.id,
        scope,
        scope === "DIVISION" ? division : null,
      );
      challenges.clearPreparedRecipient();
      await challenges.refresh();
      navigate(`/football/wheel?match=${code}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of Football challenge could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page football-wheel-page">
      <section className="football-wheel-setup__hero surface-card">
        <p className="eyebrow">FOOTBALL CHALLENGE</p>
        <h1>WHEEL OF FOOTBALL</h1>
        <strong>Spin. Pick. Pass the turn.</strong>
        <p>
          Build a seven-slot NFL Superteam head-to-head. Alternate spins and picks until both
          rosters are full.
        </p>
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>1</small><span><b>CHOOSE THE WHEEL</b><em>Current NFL only</em></span></div>
          <strong>{pool.length} TEAMS</strong>
        </header>
        <div className="football-wheel-setup__scope">
          {SCOPE_OPTIONS.map((option) => (
            <button
              type="button"
              className={scope === option.value ? "is-active" : ""}
              onClick={() => setScope(option.value)}
              key={option.value}
            >
              <strong>{option.label}</strong>
              <span>{option.detail}</span>
            </button>
          ))}
        </div>
        {scope === "DIVISION" ? (
          <div className="football-wheel-setup__divisions" aria-label="NFL division">
            {WHEEL_FOOTBALL_DIVISIONS.map((value) => (
              <button
                type="button"
                className={division === value ? "is-active" : ""}
                onClick={() => setDivision(value)}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>2</small><span><b>CHOOSE YOUR OPPONENT</b><em>This game is challenge-only</em></span></div>
        </header>
        {challenges.activeProfile ? (
          opponent ? (
            <div className="football-wheel-opponent">
              <i aria-hidden="true">
                {opponent.avatarPhotoData
                  ? <img src={opponent.avatarPhotoData} alt="" />
                  : opponent.initials}
              </i>
              <span>
                <small>OPPONENT SELECTED</small>
                <strong>{opponent.displayName}</strong>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpponent(null)}
              >
                CHANGE
              </button>
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
        <header><p className="eyebrow">HOW IT WORKS</p><strong>14 total turns · 7 picks each</strong></header>
        <div>
          <span><b>1</b> The first player is randomized after the challenge is accepted.</span>
          <span><b>2</b> Spin a team, then choose one current player or coach for an open Superteam slot.</span>
          <span><b>3</b> Turns alternate until both QB · RB · WR · Flex · Front Seven · Secondary · Head Coach are filled.</span>
          <span><b>4</b> No re-spins. Teams can return later, but you will not get the same team on back-to-back personal spins.</span>
          <span><b>5</b> Player grades stay hidden until both Superteams are complete. All seven roster spots count equally.</span>
        </div>
      </section>

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}
      <div className="football-wheel-setup__actions">
        <button type="button" className="secondary-action" onClick={() => navigate("/football")}>ALL GAMES</button>
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
  const repository = useMemo(() => createWheelFootballRepository(), []);
  const activeProfileId = challenges.activeProfile?.id ?? null;
  const [state, setState] = useState<WheelFootballState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [candidates, setCandidates] = useState<WheelFootballCandidate[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<WheelFootballRosterSlot | null>(null);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [error, setError] = useState("");
  const openedRef = useRef(false);

  async function syncMatch(showLoading = false) {
    if (!repository) return;
    if (showLoading) setLoading(true);
    try {
      const next = await repository.load(code);
      setState(next);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of Football match could not be loaded.");
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
      !repository
      || !state
      || openedRef.current
      || state.opened_at
      || state.completed_at
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
  const myRoster = state ? rosterForProfile(state, activeProfileId) : [];
  const opponent = state ? otherParticipant(state, activeProfileId) : null;
  const division = state ? divisionFromState(state.division) : null;
  const poolTeams = state ? wheelFootballPoolTeams(state.pool_scope, division) : [];
  const pendingTeam = state?.pending_team ? wheelFootballTeam(state.pending_team.code) : null;

  async function loadRoster() {
    if (!pendingTeam) return;
    setRosterLoading(true);
    setRosterError("");
    try {
      setCandidates(await loadWheelFootballRoster(pendingTeam.code));
    } catch (reason) {
      setCandidates([]);
      setRosterError(reason instanceof Error ? reason.message : "Current roster could not be loaded.");
    } finally {
      setRosterLoading(false);
    }
  }

  useEffect(() => {
    setSelectedSlot(null);
    setCandidates([]);
    setRosterError("");
    if (state?.phase === "pick" && isMyTurn && pendingTeam) void loadRoster();
  }, [isMyTurn, pendingTeam?.code, state?.phase]);

  async function spin() {
    if (!repository || !state || !isMyTurn || state.phase !== "spin" || spinning || !state.opened_at) return;
    setSpinning(true);
    setError("");
    try {
      const next = await repository.spin(code);
      const team = next.pending_team ? wheelFootballTeam(next.pending_team.code) : null;
      const index = team ? poolTeams.findIndex((candidate) => candidate.code === team.code) : -1;
      if (index >= 0 && poolTeams.length) {
        const step = 360 / poolTeams.length;
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
      } else {
        setState(next);
        setSpinning(false);
        void challenges.refresh();
      }
    } catch (reason) {
      setSpinning(false);
      setError(reason instanceof Error ? reason.message : "The wheel could not be spun.");
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
      setError(reason instanceof Error
        ? reason.message
        : "The match could not be forfeited.");
    } finally {
      setBusy(false);
    }
  }

  async function pick(candidate: WheelFootballCandidate) {
    if (!repository || !state || !selectedSlot || !isMyTurn || state.phase !== "pick") return;
    setBusy(true);
    setError("");
    try {
      const next = await repository.pick(code, {
        athleteId: candidate.id,
        displayName: candidate.name,
        positionLabel: candidate.positionLabel,
        positionAbbreviation: candidate.positionAbbreviation,
        rosterSlot: selectedSlot,
        headshotUrl: candidate.headshotUrl,
      });
      setState(next);
      setSelectedSlot(null);
      setCandidates([]);
      await challenges.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That Superteam pick could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page football-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF FOOTBALL</p>
          <h1>Loading matchup…</h1>
        </section>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page football-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF FOOTBALL</p>
          <h1>Match unavailable</h1>
          <p>{error || "This challenge could not be found."}</p>
          <button type="button" onClick={() => navigate("/football")}>BACK TO FOOTBALL</button>
        </section>
      </div>
    );
  }

  const turnLabel = !state.opened_at
    ? activeProfileId === state.recipient.id
      ? "ACCEPTING CHALLENGE…"
      : `WAITING FOR ${state.recipient.display_name.toUpperCase()} TO ACCEPT`
    : state.phase === "complete"
      ? "FINAL SUPERTEAMS"
      : isMyTurn
        ? state.phase === "spin"
          ? "YOUR TURN · SPIN"
          : "YOUR TURN · MAKE YOUR PICK"
        : state.phase === "pick" && pendingTeam
          ? `${opponent?.display_name.toUpperCase() ?? "OPPONENT"} SPUN ${pendingTeam.code}`
          : `${opponent?.display_name.toUpperCase() ?? "OPPONENT"}'S TURN`;

  if (state.phase === "complete") {
    const forfeitedProfile = state.forfeited_by_profile_id === state.creator.id
      ? state.creator
      : state.forfeited_by_profile_id === state.recipient.id
        ? state.recipient
        : null;
    const forfeitWinner = forfeitedProfile?.id === state.creator.id
      ? state.recipient
      : forfeitedProfile?.id === state.recipient.id
        ? state.creator
        : null;
    const gradedWinner = state.result?.winner_profile_id === state.creator.id
      ? state.creator
      : state.result?.winner_profile_id === state.recipient.id
        ? state.recipient
        : null;

    return (
      <div className="page football-wheel-page">
        <section className="football-wheel-match__status surface-card is-complete">
          <p className="eyebrow">WHEEL OF FOOTBALL · {forfeitedProfile ? "FORFEIT" : "FINAL"}</p>
          <h1>{forfeitedProfile
            ? `${forfeitedProfile.display_name} forfeited`
            : gradedWinner
              ? `${gradedWinner.display_name} wins`
              : "Dead even"}</h1>
          <span>{state.pool_scope === "DIVISION" ? state.division : state.pool_scope === "NFL" ? "FULL NFL" : state.pool_scope} · CURRENT NFL</span>
        </section>

        {!forfeitedProfile && state.result ? (
          <section className="football-wheel-final-score surface-card" aria-label="Final Wheel of Football score">
            <div className={state.result.winner_profile_id === state.creator.id ? "is-winner" : ""}>
              <small>{state.creator.id === activeProfileId ? "YOU" : state.creator.display_name}</small>
              <strong>{state.result.creator_score}</strong>
              <span>TEAM SCORE</span>
            </div>
            <b>VS</b>
            <div className={state.result.winner_profile_id === state.recipient.id ? "is-winner" : ""}>
              <small>{state.recipient.id === activeProfileId ? "YOU" : state.recipient.display_name}</small>
              <strong>{state.result.recipient_score}</strong>
              <span>TEAM SCORE</span>
            </div>
          </section>
        ) : null}

        <HeadToHeadRoster state={state} activeProfileId={activeProfileId} />

        <section className="football-wheel-final surface-card">
          <strong>{forfeitedProfile
            ? `${forfeitWinner?.display_name ?? "Opponent"} wins by forfeit.`
            : gradedWinner
              ? `${gradedWinner.display_name} built the stronger Superteam.`
              : "The Superteams finished tied."}</strong>
          <p>{forfeitedProfile
            ? "The matchup ended early. All picks made before the forfeit remain visible; hidden grades stay hidden."
            : "Grades were hidden until the final pick. All seven roster slots count equally, and the displayed score stretches the raw average for a clearer head-to-head result."}</p>
          <div className="football-wheel-final__actions">
            <button type="button" className="secondary-action" onClick={() => navigate("/football")}>ALL GAMES</button>
            <button type="button" className="primary-action" onClick={() => navigate("/football/wheel")}>NEW CHALLENGE →</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page football-wheel-page">
      <section className="football-wheel-match__status surface-card">
        <div>
          <p className="eyebrow">WHEEL OF FOOTBALL · TURN {Math.min(14, state.turn_count + 1)} OF 14</p>
          <h1>{turnLabel}</h1>
          <span>{state.pool_scope === "DIVISION" ? state.division : state.pool_scope === "NFL" ? "FULL NFL" : state.pool_scope} · CURRENT NFL</span>
        </div>
        <div className="football-wheel-match__actions">
          <button type="button" disabled={busy || spinning} onClick={() => void syncMatch(false)}>REFRESH</button>
          {state.opened_at ? (
            <button
              type="button"
              className="is-danger"
              disabled={busy || spinning}
              onClick={() => setShowForfeitConfirm(true)}
            >
              FORFEIT
            </button>
          ) : null}
        </div>
      </section>

      <HeadToHeadRoster state={state} activeProfileId={activeProfileId} />

      <FootballWheel
        teams={poolTeams}
        rotation={rotation}
        spinning={spinning}
        pendingTeam={pendingTeam}
        canSpin={Boolean(state.opened_at && isMyTurn && state.phase === "spin")}
        onSpin={() => void spin()}
      />

      {state.phase === "pick" && pendingTeam && isMyTurn ? (
        <CandidatePicker
          team={pendingTeam}
          candidates={candidates}
          roster={myRoster}
          selectedSlot={selectedSlot}
          loading={rosterLoading}
          busy={busy}
          error={rosterError}
          onSelectSlot={setSelectedSlot}
          onPick={(candidate) => void pick(candidate)}
          onRetry={() => void loadRoster()}
        />
      ) : null}

      {!isMyTurn && state.opened_at ? (
        <section className="football-wheel-waiting surface-card">
          <strong>{state.phase === "pick" && pendingTeam
            ? `${opponent?.display_name ?? "Your opponent"} is choosing from the ${pendingTeam.name}.`
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
            aria-labelledby="wheel-forfeit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">END MATCH</p>
            <h2 id="wheel-forfeit-title">Forfeit Wheel of Football?</h2>
            <p>Your opponent will win by forfeit. The picks already made will stay visible.</p>
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

export default function FootballWheelPage() {
  const [searchParams] = useSearchParams();
  const code = normalizeCode(searchParams.get("match"));
  return code ? <MatchScreen code={code} /> : <SetupScreen />;
}
