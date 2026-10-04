import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { createMemberProfilesRepository } from "../members/memberProfilesRepository";
import type { MemberCardSummary } from "../members/memberProfilesModel";
import {
  createHqImpostorRepository,
  type HqImpostorEvent,
  type HqImpostorRound,
  type HqImpostorState,
} from "./hqImpostorRepository";
import { hqImpostorV1Window } from "./hqImpostorSchedule";
import "../../styles/hq-impostor.css";

function readableError(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "HQ Impostor could not complete that request.";
}

function wordCount(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function formatClock(target: string | null, now: number) {
  if (!target) return "";
  const remaining = Math.max(0, new Date(target).getTime() - now);
  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const minuteRemainder = minutes % 60;
    return `${hours}h ${minuteRemainder}m`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function sportLabel(round: HqImpostorRound) {
  return round.sport === "CFB" ? "COLLEGE FOOTBALL" : round.sport;
}

function phaseLabel(round: HqImpostorRound) {
  switch (round.phase) {
    case "assignment": return "ASSIGNMENT READY";
    case "clue": return "CLUE CLOCK";
    case "clue_locked": return "CLUE LOCKED";
    case "board_ready": return "CLUES READY";
    case "vote": return "VOTE CLOCK";
    case "vote_locked": return "VOTE LOCKED";
    case "inactive": return "ROUND MISSED";
    case "waiting_round": return "NEXT ROUND";
    case "resolved": return "ROUND RESULT";
    case "event_complete": return "EVENT COMPLETE";
    default: return "ROUND IN PROGRESS";
  }
}

function Panel({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`hq-impostor-panel ${className}`.trim()}>
      {eyebrow || title ? (
        <header>
          {eyebrow ? <span>{eyebrow}</span> : null}
          {title ? <h2>{title}</h2> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function Standings({ event, compact = false }: { event: HqImpostorEvent; compact?: boolean }) {
  return (
    <section className={`hq-impostor-standings${compact ? " is-compact" : ""}`} aria-label="HQ Impostor standings">
      <header>
        <span>EVENT STANDINGS</span>
        <small>MAX 400</small>
      </header>
      <div>
        {event.standings.map((standing) => (
          <article key={standing.profile_id} className={event.members.find((member) => member.profile_id === standing.profile_id)?.is_current_user ? "is-you" : ""}>
            <b>#{standing.rank}</b>
            <i>{standing.initials}</i>
            <span>
              <strong>{standing.display_name}</strong>
              {!compact ? <small>R1 {standing.round_scores[0]} · R2 {standing.round_scores[1]} · R3 {standing.round_scores[2]} · R4 {standing.round_scores[3]}</small> : null}
            </span>
            <em>{standing.total_score}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function Lobby({
  members,
  loading,
  busy,
  onCreate,
}: {
  members: MemberCardSummary[];
  loading: boolean;
  busy: boolean;
  onCreate: (names: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const eligible = members.filter((member) => !member.isCurrentUser);

  function toggle(name: string) {
    setSelected((current) => (
      current.includes(name)
        ? current.filter((item) => item !== name)
        : current.length < 7
          ? [...current, name]
          : current
    ));
  }

  return (
    <Panel eyebrow="FEATURED CHALLENGE" title="BUILD YOUR GROUP" className="hq-impostor-lobby">
      <p>
        Pick 3–7 other HQ members. Everyone is entered immediately, Round 1 opens now,
        and the event runs four rounds across four days. HQ balances Impostor assignments,
        but repeats remain possible.
      </p>
      <div className="hq-impostor-lobby__meter">
        <span><b>{selected.length + 1}</b> / 8 PLAYERS</span>
        <small>YOU + {selected.length} SELECTED</small>
      </div>
      {loading ? <p className="hq-impostor-muted">Loading HQ members…</p> : (
        <div className="hq-impostor-member-grid" role="listbox" aria-label="Choose HQ Impostor players">
          {eligible.map((member) => {
            const active = selected.includes(member.displayName);
            return (
              <button
                key={member.displayName}
                type="button"
                role="option"
                aria-selected={active}
                className={active ? "is-selected" : ""}
                onClick={() => toggle(member.displayName)}
                disabled={busy}
              >
                <i>
                  {member.avatarPhotoData
                    ? <img src={member.avatarPhotoData} alt="" />
                    : member.initials}
                </i>
                <span>{member.displayName}</span>
                <b>{active ? "✓" : "+"}</b>
              </button>
            );
          })}
        </div>
      )}
      <div className="hq-impostor-rules-strip">
        <span><b>1</b> BLIND CLUE</span>
        <span><b>1</b> VOTE</span>
        <span><b>4</b> ROUNDS</span>
        <span><b>400</b> MAX</span>
      </div>
      <button
        type="button"
        className="hq-impostor-primary"
        disabled={busy || selected.length < 3 || selected.length > 7}
        onClick={() => onCreate(selected)}
      >
        {busy ? "STARTING…" : selected.length < 3 ? "SELECT AT LEAST 3 MEMBERS" : "START HQ IMPOSTOR →"}
      </button>
    </Panel>
  );
}

function ClueBoard({
  round,
  selectedVote,
  onSelectVote,
}: {
  round: HqImpostorRound;
  selectedVote: string;
  onSelectVote?: (profileId: string) => void;
}) {
  const candidates = new Set((round.vote_candidates ?? []).map((candidate) => candidate.profile_id));
  return (
    <div className="hq-impostor-clue-board">
      {(round.clues ?? []).map((clue) => {
        const selectable = Boolean(onSelectVote) && candidates.has(clue.profile_id);
        const selected = selectedVote === clue.profile_id;
        const body = (
          <>
            <span className="hq-impostor-clue-board__identity">
              <i>{clue.initials}</i>
              <strong>{clue.display_name}</strong>
            </span>
            <b>{clue.clue ?? "NO CLUE"}</b>
            {!clue.active ? <small>OUT THIS ROUND</small> : selectable ? <small>{selected ? "YOUR VOTE" : "TAP TO ACCUSE"}</small> : <small>LOCKED</small>}
          </>
        );
        return selectable ? (
          <button
            type="button"
            key={clue.profile_id}
            className={selected ? "is-selected" : ""}
            aria-pressed={selected}
            onClick={() => onSelectVote?.(clue.profile_id)}
          >
            {body}
          </button>
        ) : (
          <article key={clue.profile_id}>{body}</article>
        );
      })}
    </div>
  );
}

function ResultReveal({ event, busy, onContinue }: { event: HqImpostorEvent; busy: boolean; onContinue: () => void }) {
  const round = event.current_round;
  const result = round.result;
  const votes = result?.votes ?? [];
  const [revealedVotes, setRevealedVotes] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  useEffect(() => {
    setRevealedVotes(0);
    setShowOutcome(false);
    const timers: number[] = [];
    votes.forEach((_, index) => {
      timers.push(window.setTimeout(() => setRevealedVotes(index + 1), 500 + index * 650));
    });
    timers.push(window.setTimeout(
      () => setShowOutcome(true),
      650 + Math.max(1, votes.length) * 650,
    ));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [round.round_no, result?.outcome, votes.length]);

  if (!result) return null;

  const outcomeTitle = result.outcome === "caught"
    ? "IMPOSTOR EXPOSED"
    : result.outcome === "survived"
      ? "IMPOSTOR SURVIVES"
      : result.outcome === "forfeit"
        ? "IMPOSTOR FORFEIT"
        : "ROUND VOID";

  return (
    <div className="hq-impostor-result">
      <Panel eyebrow={round.is_final_round ? "FINAL ROUND REVEAL" : `ROUND ${round.round_no} REVEAL`} title="THE VOTES">
        <ClueBoard round={round} selectedVote="" />
        <div className="hq-impostor-vote-reveal" aria-label="Vote reveal">
          {votes.map((vote, index) => (
            <div key={vote.voter_profile_id} className={index < revealedVotes ? "is-revealed" : ""}>
              <strong>{vote.voter_display_name}</strong>
              <span>VOTED</span>
              <b>{index < revealedVotes ? (vote.target_display_name ?? "NO VOTE") : "••••••"}</b>
            </div>
          ))}
        </div>
      </Panel>

      <section className={`hq-impostor-outcome ${showOutcome ? "is-visible" : ""}`}>
        <span>{result.outcome === "caught" ? "THE GROUP FOUND THEM" : result.outcome === "survived" ? "THE ROOM MISSED" : "ROUND DECISION"}</span>
        <h2>{outcomeTitle}</h2>
        <strong>{result.impostor_display_name}</strong>

        {result.outcome === "caught" ? (
          <div className="hq-impostor-recovery">
            <small>BUT THEY HAD ONE WAY OUT…</small>
            <b>{result.impostor_guess || "NO GUESS"}</b>
            <em>{result.guess_correct ? "RECOVERY · +50" : "LOCKED OUT"}</em>
          </div>
        ) : result.outcome === "survived" ? (
          <div className="hq-impostor-recovery">
            <small>THE IMPOSTOR’S LOCKED GUESS</small>
            <b>{result.impostor_guess || "NO GUESS"}</b>
            <em>{result.guess_correct ? "THEY KNEW IT" : "THEY ESCAPED ANYWAY"}</em>
          </div>
        ) : null}

        <div className="hq-impostor-secret-reveal">
          <small>THE SECRET</small>
          <b>{result.secret_answer}</b>
          <span>{sportLabel(round)} · {round.category}</span>
        </div>
      </section>

      {showOutcome ? (
        <>
          <Panel eyebrow="ROUND SCORE" title={round.is_final_round ? "FINALE POINTS" : `ROUND ${round.round_no} POINTS`}>
            <div className="hq-impostor-scorecards">
              {result.scorecards.map((card) => (
                <article key={card.profile_id} className={card.is_impostor ? "is-impostor" : ""}>
                  <span>{card.is_impostor ? "IMPOSTOR" : "PLAYER"}</span>
                  <strong>{card.display_name}</strong>
                  <b>+{card.score}</b>
                </article>
              ))}
            </div>
          </Panel>
          <Standings event={event} />
          <div className="hq-impostor-result-continue">
            <p className="hq-impostor-next-round">
              {round.round_no < 4
                ? `Round ${round.round_no + 1} opens ${new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(round.vote_lock_at))}.`
                : "Final standings are ready."}
            </p>
            {!round.result_acknowledged ? (
              <button type="button" className="hq-impostor-primary" disabled={busy} onClick={onContinue}>
                {busy ? "CONTINUING…" : round.round_no === 4 ? "LOCK FINAL STANDINGS →" : "CONTINUE →"}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="hq-impostor-reveal-progress">Revealing the room…</p>
      )}
    </div>
  );
}

function RoundPlay({
  event,
  busy,
  onReveal,
  onClue,
  onOpenBoard,
  onVote,
  onAcknowledge,
}: {
  event: HqImpostorEvent;
  busy: boolean;
  onReveal: () => void;
  onClue: (clue: string) => void;
  onOpenBoard: () => void;
  onVote: (profileId: string, guess: string | null) => void;
  onAcknowledge: (roundNo: number) => void;
}) {
  const round = event.current_round;
  const now = useNow();
  const [clue, setClue] = useState("");
  const [selectedVote, setSelectedVote] = useState("");
  const [guess, setGuess] = useState("");

  useEffect(() => {
    setClue("");
    setSelectedVote("");
    setGuess("");
  }, [round.round_no]);

  if (round.phase === "resolved") {
    return <ResultReveal event={event} busy={busy} onContinue={() => onAcknowledge(round.round_no)} />;
  }

  if (round.phase === "event_complete") return null;

  if (round.phase === "waiting_round") {
    return (
      <Panel eyebrow={round.is_final_round ? "FINAL ROUND" : `ROUND ${round.round_no}`} title="NEXT ROUND LOCKED">
        <p className="hq-impostor-big-copy">The next assignment stays sealed until the round opens.</p>
        <div className="hq-impostor-countdown">
          <small>OPENS IN</small>
          <strong>{formatClock(round.opens_at, now)}</strong>
        </div>
        <Standings event={event} compact />
      </Panel>
    );
  }

  if (round.phase === "inactive") {
    return (
      <Panel eyebrow={`ROUND ${round.round_no}`} title="YOU MISSED THE CLUE WINDOW" className="is-warning">
        <p>Your score is 0 for this round. You are off the ballot and the remaining group can finish without you.</p>
        <Standings event={event} compact />
      </Panel>
    );
  }

  if (round.phase === "assignment") {
    return (
      <Panel eyebrow={round.is_final_round ? "FINAL ROUND" : `ROUND ${round.round_no} OF 4`} title={round.category}>
        <div className="hq-impostor-assignment-sealed">
          <span>{sportLabel(round)}</span>
          <b>YOUR ROLE IS SEALED</b>
          <p>Revealing it starts your personal 3-minute clue clock. Nobody else’s clue is visible yet.</p>
        </div>
        <button type="button" className="hq-impostor-primary" disabled={busy} onClick={onReveal}>
          {busy ? "REVEALING…" : "REVEAL ASSIGNMENT →"}
        </button>
        <small className="hq-impostor-deadline">GLOBAL CLUE WINDOW · {formatClock(round.clue_lock_at, now)} LEFT</small>
      </Panel>
    );
  }

  if (round.phase === "clue") {
    const words = wordCount(clue);
    const valid = words >= 1 && words <= 4 && clue.length <= 32;
    return (
      <>
        <section className={`hq-impostor-role-card${round.is_impostor ? " is-impostor" : " is-normal"}`}>
          <span>{sportLabel(round)} · {round.category}</span>
          {round.is_impostor ? (
            <>
              <small>YOUR ROLE</small>
              <h2>YOU ARE THE IMPOSTOR</h2>
              <p>You do not know the secret. Bluff with one clue and learn from the room later.</p>
            </>
          ) : (
            <>
              <small>THE SECRET</small>
              <h2>{round.secret_answer}</h2>
              <p>Prove you know it without giving the Impostor an easy answer.</p>
            </>
          )}
        </section>
        <Panel eyebrow="ONE BLIND CLUE" title="LOCK YOUR CLUE">
          <div className="hq-impostor-clue-input">
            <input
              autoFocus
              autoComplete="off"
              maxLength={32}
              value={clue}
              placeholder="1–4 words"
              onChange={(event) => setClue(event.target.value)}
              disabled={busy}
            />
            <div>
              <span className={words > 4 ? "is-over" : ""}>{words}/4 WORDS</span>
              <span>{clue.length}/32</span>
            </div>
          </div>
          <p className="hq-impostor-hint">Teams, schools, awards, years, roles and career anchors are fair game. Names, initials, direct nicknames, spelling hints and links are not.</p>
          <button type="button" className="hq-impostor-primary" disabled={busy || !valid} onClick={() => onClue(clue)}>
            {busy ? "LOCKING…" : "LOCK CLUE →"}
          </button>
          <div className="hq-impostor-countdown is-small">
            <small>YOUR CLUE CLOCK</small>
            <strong>{formatClock(round.clue_deadline_at, now)}</strong>
          </div>
        </Panel>
      </>
    );
  }

  if (round.phase === "clue_locked") {
    return (
      <Panel eyebrow={`ROUND ${round.round_no}`} title="YOUR CLUE IS LOCKED">
        <blockquote>{round.my_clue}</blockquote>
        <p>HQ is holding every clue until the entire active field is ready or their clocks expire.</p>
        <div className="hq-impostor-waiting-dots"><i /><i /><i /></div>
      </Panel>
    );
  }

  if (round.phase === "board_ready") {
    return (
      <Panel eyebrow={`ROUND ${round.round_no}`} title="ALL CLUES ARE IN">
        <p className="hq-impostor-big-copy">The room is ready. Reveal the clue board when you are ready to vote.</p>
        <div className="hq-impostor-assignment-sealed">
          <b>5:00 VOTE CLOCK</b>
          <p>The timer starts only when you reveal the board. Votes stay hidden until the round resolves.</p>
        </div>
        <button type="button" className="hq-impostor-primary" disabled={busy} onClick={onOpenBoard}>
          {busy ? "OPENING…" : "REVEAL CLUE BOARD →"}
        </button>
      </Panel>
    );
  }

  if (round.phase === "vote") {
    const canSubmit = Boolean(selectedVote) && (!round.is_impostor || Boolean(guess.trim()));
    return (
      <>
        <Panel eyebrow={`ROUND ${round.round_no} · CLUE BOARD`} title="WHO IS THE IMPOSTOR?">
          <ClueBoard round={round} selectedVote={selectedVote} onSelectVote={setSelectedVote} />
          <p className="hq-impostor-hint">One vote. No self-vote. A tie for the top vote means the Impostor survives.</p>
        </Panel>
        {round.is_impostor ? (
          <Panel eyebrow="YOUR ESCAPE HATCH" title="LOCK THE SECRET TOO">
            <p>Your vote and secret guess submit together. You will not get another look after the vote reveal.</p>
            <input
              className="hq-impostor-guess-input"
              autoComplete="off"
              maxLength={100}
              value={guess}
              placeholder="Who or what is the secret?"
              onChange={(event) => setGuess(event.target.value)}
              disabled={busy}
            />
          </Panel>
        ) : null}
        <div className="hq-impostor-vote-action">
          <div className="hq-impostor-countdown is-small">
            <small>YOUR VOTE CLOCK</small>
            <strong>{formatClock(round.vote_deadline_at, now)}</strong>
          </div>
          <button
            type="button"
            className="hq-impostor-primary"
            disabled={busy || !canSubmit}
            onClick={() => onVote(selectedVote, round.is_impostor ? guess.trim() : null)}
          >
            {busy ? "LOCKING…" : "LOCK VOTE →"}
          </button>
        </div>
      </>
    );
  }

  if (round.phase === "vote_locked") {
    return (
      <Panel eyebrow={`ROUND ${round.round_no}`} title="YOUR VOTE IS LOCKED">
        <ClueBoard round={round} selectedVote={round.my_vote_profile_id ?? ""} />
        <div className="hq-impostor-lock-progress">
          <b>{round.votes_locked_count}</b>
          <span>OF {round.active_count} VOTES LOCKED</span>
        </div>
        <p>Votes stay hidden until every active player finishes or their voting clock expires.</p>
      </Panel>
    );
  }

  return (
    <Panel eyebrow={`ROUND ${round.round_no}`} title="ROUND UPDATING">
      <p>HQ is resolving the latest submissions.</p>
    </Panel>
  );
}

export default function HqImpostorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identity = useIdentity();
  const launchWindow = hqImpostorV1Window();
  const returnToDaily = searchParams.get("from") === "daily";
  const rollout = hqImpostorV1Window();
  const repository = useMemo(() => createHqImpostorRepository(), []);
  const memberRepository = useMemo(() => createMemberProfilesRepository(), []);
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);
  const [state, setState] = useState<HqImpostorState | null>(null);
  const [members, setMembers] = useState<MemberCardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showLobby, setShowLobby] = useState(false);

  async function loadState(silent = false) {
    if (!repository || !signedIn) {
      if (!silent) setLoading(false);
      return;
    }
    try {
      const next = await repository.load();
      setState(next);
      setError("");
    } catch (nextError) {
      if (!silent) setError(readableError(nextError));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function loadMembers() {
    if (!memberRepository || !signedIn) return;
    setMembersLoading(true);
    try {
      setMembers(await memberRepository.listMembers());
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setMembersLoading(false);
    }
  }

  useEffect(() => {
    if (rollout.before || !signedIn) {
      setLoading(false);
      return;
    }
    void loadState();
  }, [signedIn, repository, rollout.before]);

  useEffect(() => {
    if (!signedIn || !state?.event || state.event.status !== "active") return undefined;
    const timer = window.setInterval(() => void loadState(true), 15000);
    return () => window.clearInterval(timer);
  }, [signedIn, state?.event?.id, state?.event?.status]);

  useEffect(() => {
    if (rollout.active && (!state?.event || showLobby) && signedIn && !members.length && !membersLoading) {
      void loadMembers();
    }
  }, [state?.event?.id, showLobby, signedIn, rollout.active]);

  async function perform(action: () => Promise<HqImpostorState>) {
    setBusy(true);
    setError("");
    try {
      const next = await action();
      setState(next);
      return true;
    } catch (nextError) {
      setError(readableError(nextError));
      try {
        if (repository) setState(await repository.load());
      } catch {
        // Keep the actionable server error above if the refresh also fails.
      }
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function createEvent(names: string[]) {
    if (!repository) return;
    const created = await perform(() => repository.createEvent(names));
    if (created) setShowLobby(false);
  }

  if (rollout.before) {
    return (
      <div className="page hq-impostor-page">
        <header className="hq-impostor-page__top">
          <button type="button" aria-label="Back home" onClick={() => navigate("/")}>←</button>
          <div><span>FEATURED CHALLENGE</span><h1>HQ IMPOSTOR</h1><small>OPENS OCTOBER 13</small></div>
        </header>
        <Panel eyebrow="OCT 13–19 · FEATURED CHALLENGE" title="NOT OPEN YET">
          <p>Weekly Auction remains the featured requirement through October 12. HQ Impostor takes over the next Tuesday–Monday slot.</p>
          <button type="button" className="hq-impostor-secondary" onClick={() => navigate("/football/today")}>BACK TO FOOTBALL DAILY</button>
        </Panel>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="page hq-impostor-page">
        <header className="hq-impostor-page__top">
          <button type="button" aria-label="Back home" onClick={() => navigate("/")}>←</button>
          <div><span>FEATURED CHALLENGE</span><h1>HQ IMPOSTOR</h1></div>
        </header>
        <Panel eyebrow="4–8 PLAYERS · 4 ROUNDS" title="KNOW THE SPORT. FOOL THE ROOM.">
          <p>One player does not know the secret. Everyone gets one blind clue, then one vote.</p>
          <button type="button" className="hq-impostor-primary" onClick={identity.openDialog}>SIGN IN TO PLAY →</button>
        </Panel>
      </div>
    );
  }

  if (loading) {
    return <div className="page hq-impostor-page"><section className="hq-impostor-loading">Loading HQ Impostor…</section></div>;
  }

  const event = state?.event ?? null;
  const lobby = rollout.active && (!event || showLobby);

  if (rollout.after && !event) {
    return (
      <div className="page hq-impostor-page">
        <header className="hq-impostor-page__top">
          <button type="button" aria-label="Back home" onClick={() => navigate("/")}>←</button>
          <div><span>FEATURED CHALLENGE</span><h1>HQ IMPOSTOR</h1><small>OCT 13–19 EVENT</small></div>
        </header>
        <Panel eyebrow="FEATURED CHALLENGE" title="EVENT CLOSED">
          <p>The October HQ Impostor window has ended. Completed event results remain available to participants.</p>
          <button type="button" className="hq-impostor-secondary" onClick={() => navigate("/football")}>FOOTBALL HQ</button>
        </Panel>
      </div>
    );
  }

  return (
    <div className="page hq-impostor-page">
      <header className="hq-impostor-page__top">
        <button type="button" aria-label="Back home" onClick={() => navigate("/")}>←</button>
        <div>
          <span>FEATURED CHALLENGE</span>
          <h1>HQ IMPOSTOR</h1>
          <small>{event && !lobby ? `ROUND ${event.current_round.round_no} OF 4 · ${phaseLabel(event.current_round)}` : "SPORTS SOCIAL DEDUCTION"}</small>
        </div>
        {event && !lobby ? <b>{event.standings.find((standing) => standing.profile_id === identity.profile?.id)?.total_score ?? 0}<small>PTS</small></b> : null}
      </header>

      {error ? <div className="hq-impostor-error" role="alert">{error}</div> : null}

      {lobby ? (
        <Lobby members={members} loading={membersLoading} busy={busy} onCreate={createEvent} />
      ) : event ? (
        <>
          <section className="hq-impostor-round-banner">
            <div>
              <span>{event.current_round.is_final_round ? "FINAL ROUND" : `ROUND ${event.current_round.round_no}`}</span>
              <h2>{event.current_round.category}</h2>
            </div>
            <b>{sportLabel(event.current_round)}</b>
          </section>

          <div className="hq-impostor-roster" aria-label="Event players">
            {event.members.map((member) => (
              <span key={member.profile_id} className={member.is_current_user ? "is-you" : ""}>
                <i>{member.initials}</i>{member.display_name}
              </span>
            ))}
          </div>

          <RoundPlay
            event={event}
            busy={busy}
            onReveal={() => repository && void perform(() => repository.revealAssignment(event.id))}
            onClue={(clue) => void submitClueAndReturn(clue)}
            onOpenBoard={() => repository && void perform(() => repository.openBoard(event.id))}
            onVote={(profileId, guess) => repository && void perform(() => repository.submitVote(event.id, profileId, guess))}
            onAcknowledge={(roundNo) => repository && void perform(() => repository.acknowledgeResult(event.id, roundNo))}
          />

          {returnToDaily && !hqImpostorDailyGateRequired(state) ? (
            <button type="button" className="hq-impostor-primary" onClick={() => navigate("/football/today", { replace: true })}>
              CONTINUE TO TODAY’S CHALLENGE →
            </button>
          ) : null}

          {event.status === "completed" && event.current_round.phase === "event_complete" ? (
            <section className="hq-impostor-complete">
              <span>EVENT COMPLETE</span>
              <h2>FOUR ROUNDS. FINAL TABLE.</h2>
              <Standings event={event} />
              {rollout.active ? <button type="button" className="hq-impostor-secondary" onClick={() => setShowLobby(true)}>START ANOTHER EVENT</button> : null}
            </section>
          ) : event.current_round.phase !== "resolved" ? (
            <Standings event={event} compact />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
