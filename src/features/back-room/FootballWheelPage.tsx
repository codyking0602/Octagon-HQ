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
  type WheelFootballParticipant,
  type WheelFootballPick,
  type WheelFootballStanding,
  type WheelFootballState,
} from "../play/wheelFootballRepository";
import {
  WHEEL_FOOTBALL_DIVISIONS,
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  loadWheelFootballRoster,
  wheelFootballLeagueFromScope,
  wheelFootballPoolLabel,
  wheelFootballPoolTeams,
  wheelFootballShortlist,
  wheelFootballTeam,
  type WheelFootballCandidate,
  type WheelFootballDivision,
  type WheelFootballLeague,
  type WheelFootballPoolScope,
  type WheelFootballRosterSlot,
  type WheelFootballTeam,
} from "./wheelFootballModel";

const NFL_SCOPE_OPTIONS: readonly {
  value: WheelFootballPoolScope;
  label: string;
  detail: string;
}[] = [
  { value: "NFL", label: "FULL NFL", detail: "All 32 teams" },
  { value: "AFC", label: "AFC", detail: "16 teams" },
  { value: "NFC", label: "NFC", detail: "16 teams" },
  { value: "DIVISION", label: "DIVISION", detail: "4 teams · repeats allowed" },
];

const CFB_SCOPE_OPTIONS: readonly {
  value: WheelFootballPoolScope;
  label: string;
  detail: string;
}[] = [
  { value: "AP_TOP_25", label: "AP TOP 25", detail: "Latest poll · 25 schools" },
  { value: "CFB", label: "NATIONAL", detail: "All 68 schools" },
  { value: "SEC", label: "SEC", detail: "16 schools" },
  { value: "BIG_TEN", label: "BIG TEN", detail: "18 schools" },
  { value: "BIG_12", label: "BIG 12", detail: "16 schools" },
  { value: "ACC", label: "ACC", detail: "17 schools" },
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

function participantForProfile(
  state: WheelFootballState,
  profileId: string | null | undefined,
) {
  if (!profileId) return null;
  return state.participants.find((participant) => participant.id === profileId) ?? null;
}

function rosterForProfile(state: WheelFootballState, profileId: string | null | undefined) {
  return participantForProfile(state, profileId)?.roster ?? [] as WheelFootballPick[];
}

function openSlots(roster: readonly WheelFootballPick[]) {
  const filled = new Set(roster.map((pick) => pick.roster_slot));
  return WHEEL_FOOTBALL_ROSTER_SLOTS.filter((slot) => !filled.has(slot));
}

function pickForSlot(roster: readonly WheelFootballPick[], slot: WheelFootballRosterSlot) {
  return roster.find((pick) => pick.roster_slot === slot) ?? null;
}

function resultPoolLabel(state: WheelFootballState) {
  const league = wheelFootballLeagueFromScope(state.pool_scope);
  return `${wheelFootballPoolLabel(state.pool_scope, divisionFromState(state.division))} · CURRENT ${league}`;
}

function roundedCanvasRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function canvasTextToFit(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && context.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}…`;
}

function resultWinnerCopy(state: WheelFootballState) {
  if (!state.result) return "FINAL STANDINGS";
  const winners = state.result.winner_profile_ids
    .map((id) => state.participants.find((participant) => participant.id === id)?.display_name)
    .filter((name): name is string => Boolean(name));
  if (!winners.length) return "FINAL STANDINGS";
  if (state.result.resolved_by_forfeit && winners.length === 1) {
    return `${winners[0]!.toUpperCase()} WINS BY FORFEIT`;
  }
  if (winners.length > 1) return `${winners.map((name) => name.toUpperCase()).join(" & ")} TIE`;
  return `${winners[0]!.toUpperCase()} WINS`;
}

async function buildWheelResultShareImage(state: WheelFootballState) {
  if (!state.result) throw new Error("Final standings are not available.");

  const width = 1200;
  const rosterRowHeight = 70;
  const rosterHeaderHeight = 82;
  const rosterBlockHeight = rosterHeaderHeight + rosterRowHeight * WHEEL_FOOTBALL_ROSTER_SLOTS.length;
  const standingsRows = Math.ceil(state.participants.length / 2);
  const standingsHeight = standingsRows * 150;
  const rosterStart = 300 + standingsHeight;
  const height = rosterStart + state.participants.length * (rosterBlockHeight + 26) + 92;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Result image could not be created.");

  context.fillStyle = "#03070b";
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(270, 80, 20, 270, 80, 650);
  glow.addColorStop(0, "rgba(51, 135, 201, .24)");
  glow.addColorStop(1, "rgba(3, 7, 11, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, 700);

  context.textAlign = "left";
  context.fillStyle = "#8bbfe7";
  context.font = "900 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText("THE HQ", 58, 62);
  context.fillStyle = "#8297a8";
  context.font = "900 24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText("WHEEL OF FOOTBALL · FINAL", 58, 108);
  context.fillStyle = "#ffffff";
  context.font = "900 50px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(canvasTextToFit(context, resultWinnerCopy(state), 1080), 58, 174);
  context.fillStyle = "#7f96a8";
  context.font = "800 23px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(resultPoolLabel(state), 58, 216);

  const standings = state.result.standings
    .map((standing) => ({
      standing,
      participant: state.participants.find((participant) => participant.id === standing.profile_id),
    }))
    .filter((entry): entry is { standing: WheelFootballStanding; participant: WheelFootballParticipant } => Boolean(entry.participant));

  standings.forEach((entry, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 58 + column * 548;
    const y = 258 + row * 150;
    roundedCanvasRect(context, x, y, 520, 126, 20);
    context.fillStyle = entry.standing.rank === 1 ? "rgba(42, 112, 168, .24)" : "rgba(255,255,255,.025)";
    context.fill();
    context.strokeStyle = entry.standing.rank === 1 ? "rgba(117,192,247,.42)" : "rgba(255,255,255,.08)";
    context.stroke();

    context.textAlign = "left";
    context.fillStyle = "#8ca1b2";
    context.font = "900 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    const prefix = entry.standing.rank ? `#${entry.standing.rank} · ` : entry.standing.forfeited ? "DNF · " : "";
    context.fillText(
      canvasTextToFit(context, `${prefix}${entry.participant.display_name.toUpperCase()}`, 325),
      x + 22,
      y + 44,
    );
    context.fillStyle = entry.standing.rank === 1 ? "#8fcaf5" : "#ffffff";
    context.font = "900 52px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    context.textAlign = "right";
    context.fillText(
      entry.standing.final_grade == null ? (entry.standing.forfeited ? "DNF" : "—") : entry.standing.final_grade.toFixed(1),
      x + 495,
      y + 79,
    );
    context.textAlign = "left";
    context.fillStyle = "#687f91";
    context.font = "800 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    context.fillText("FINAL GRADE", x + 22, y + 92);
  });

  state.participants.forEach((participant, participantIndex) => {
    const y = rosterStart + participantIndex * (rosterBlockHeight + 26);
    roundedCanvasRect(context, 58, y, 1084, rosterBlockHeight, 24);
    context.fillStyle = "#0b1117";
    context.fill();
    context.strokeStyle = "rgba(122,169,205,.18)";
    context.stroke();

    const standing = state.result!.standings.find((item) => item.profile_id === participant.id);
    context.textAlign = "left";
    context.fillStyle = "#70b8f2";
    context.font = "900 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    context.fillText(
      `${standing?.rank ? `#${standing.rank} · ` : participant.forfeited_at ? "DNF · " : ""}${participant.display_name.toUpperCase()}`,
      86,
      y + 34,
    );
    context.fillStyle = "#ffffff";
    context.font = "900 27px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    context.fillText("SUPERTEAM", 86, y + 64);
    context.textAlign = "right";
    context.fillStyle = "#8fcaf5";
    context.font = "900 34px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    context.fillText(
      participant.final_grade == null ? (participant.forfeited_at ? "DNF" : "—") : participant.final_grade.toFixed(1),
      1114,
      y + 54,
    );

    WHEEL_FOOTBALL_ROSTER_SLOTS.forEach((slot, slotIndex) => {
      const rowY = y + rosterHeaderHeight + slotIndex * rosterRowHeight;
      const pick = pickForSlot(participant.roster, slot);
      const team = pick ? wheelFootballTeam(pick.team_code) : null;
      if (slotIndex > 0) {
        context.strokeStyle = "rgba(255,255,255,.055)";
        context.beginPath();
        context.moveTo(78, rowY);
        context.lineTo(1122, rowY);
        context.stroke();
      }
      context.textAlign = "left";
      context.fillStyle = "#73b4e7";
      context.font = "900 19px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      context.fillText(slot, 86, rowY + 43);
      context.fillStyle = pick ? "#ffffff" : "#5d6f7d";
      context.font = "900 25px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      context.fillText(pick ? canvasTextToFit(context, pick.display_name, 650) : "OPEN", 260, rowY + 36);
      context.fillStyle = "#7890a3";
      context.font = "800 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      context.fillText(
        pick ? `${team?.shortCode ?? pick.team_code} · ${pick.position_abbreviation}` : "—",
        260,
        rowY + 59,
      );
    });
  });

  context.fillStyle = "#60788b";
  context.textAlign = "left";
  context.font = "800 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText("Individual player grades stay private.", 58, height - 36);
  context.textAlign = "right";
  context.fillStyle = "#86bce6";
  context.font = "900 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText("THE HQ · WHEEL OF FOOTBALL", 1142, height - 36);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Result image could not be created."));
    }, "image/png");
  });
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
        <b>{team?.shortCode ?? pick.team_code}</b>
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
        <span>{pick ? `${team?.shortCode ?? pick.team_code} · ${pick.position_abbreviation}` : "—"}</span>
      </div>
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

function WheelRosters({
  state,
  activeProfileId,
}: {
  state: WheelFootballState;
  activeProfileId: string | null | undefined;
}) {
  return state.participants.length === 2 ? (
    <HeadToHeadRoster state={state} activeProfileId={activeProfileId} />
  ) : (
    <MultiplayerRosters state={state} activeProfileId={activeProfileId} />
  );
}

function TwoPlayerResultScore({
  state,
  activeProfileId,
}: {
  state: WheelFootballState;
  activeProfileId: string | null | undefined;
}) {
  const creator = participantForProfile(state, state.creator.id);
  const recipient = participantForProfile(state, state.recipient.id);
  const creatorStanding = state.result?.standings.find((standing) => standing.profile_id === state.creator.id);
  const recipientStanding = state.result?.standings.find((standing) => standing.profile_id === state.recipient.id);

  return (
    <div className="football-wheel-result-score" aria-label="Final Wheel of Football grades">
      <div className={creatorStanding?.rank === 1 ? "is-winner" : ""}>
        <small>{state.creator.id === activeProfileId ? "YOU" : state.creator.display_name}</small>
        <strong>{creator?.final_grade == null
          ? creator?.forfeited_at ? "DNF" : "—"
          : creator.final_grade.toFixed(1)}</strong>
        <span>FINAL GRADE</span>
      </div>
      <b>VS</b>
      <div className={recipientStanding?.rank === 1 ? "is-winner" : ""}>
        <small>{state.recipient.id === activeProfileId ? "YOU" : state.recipient.display_name}</small>
        <strong>{recipient?.final_grade == null
          ? recipient?.forfeited_at ? "DNF" : "—"
          : recipient.final_grade.toFixed(1)}</strong>
        <span>FINAL GRADE</span>
      </div>
    </div>
  );
}

function MultiplayerRosters({
  state,
  activeProfileId,
}: {
  state: WheelFootballState;
  activeProfileId: string | null | undefined;
}) {
  return (
    <section
      className="football-wheel-multiplayer-rosters surface-card"
      aria-label="Wheel of Football Superteams"
      data-player-count={state.participants.length}
    >
      <header>
        <div>
          <p className="eyebrow">SUPERTEAMS</p>
          <strong>{state.participants.length} PLAYERS</strong>
        </div>
        <span>{state.phase === "complete" ? "FINAL ROSTERS" : "LIVE DRAFT"}</span>
      </header>
      <div className="football-wheel-multiplayer-rosters__track">
        {state.participants.map((participant) => {
          const isYou = participant.id === activeProfileId;
          const isTurn = participant.id === state.current_turn_profile_id;
          return (
            <article
              className={`football-wheel-player-roster${isTurn ? " is-turn" : ""}${participant.forfeited_at ? " is-forfeited" : ""}`}
              key={participant.id}
            >
              <header>
                <span>
                  <small>{participant.forfeited_at ? "DNF" : isYou ? "YOU" : isTurn ? "ON THE CLOCK" : `PLAYER ${participant.seat_order + 1}`}</small>
                  <strong>{participant.display_name}</strong>
                </span>
                {state.phase === "complete" ? (
                  <b>{participant.final_grade == null ? (participant.forfeited_at ? "DNF" : "—") : participant.final_grade.toFixed(1)}</b>
                ) : (
                  <b>{participant.roster.length}/7</b>
                )}
              </header>
              <div>
                {WHEEL_FOOTBALL_ROSTER_SLOTS.map((slot) => {
                  const pick = pickForSlot(participant.roster, slot);
                  const team = pick ? wheelFootballTeam(pick.team_code) : null;
                  return (
                    <div className={`football-wheel-player-roster__row${pick ? " is-filled" : ""}`} key={slot}>
                      <em>{slot}</em>
                      <PickMark pick={pick} />
                      <span>
                        <strong>{pick?.display_name ?? "OPEN"}</strong>
                        <small>{pick ? `${team?.shortCode ?? pick.team_code} · ${pick.position_abbreviation}` : "—"}</small>
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TeamLogo({ team, className = "" }: { team: WheelFootballTeam; className?: string }) {
  return (
    <span className={`football-wheel-team-logo ${className}`} aria-hidden="true">
      {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
    </span>
  );
}

function TeamReferenceLink({
  team,
  showRank = false,
  className = "",
}: {
  team: WheelFootballTeam;
  showRank?: boolean;
  className?: string;
}) {
  const provider = team.league === "NFL" ? "Pro Football Reference" : "Sports Reference";
  return (
    <a
      className={`football-wheel-team-reference ${className}`.trim()}
      href={team.sportsReferenceUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open 2026 ${team.name} on ${provider}`}
      title={`2026 ${team.name} · ${provider}`}
    >
      {showRank && team.apRank ? `#${team.apRank} ` : ""}{team.name}
    </a>
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
    <section className="football-wheel surface-card" aria-label="Football team wheel">
      <div className="football-wheel__pointer" aria-hidden="true" />
      <div
        className={`football-wheel__disc${spinning ? " is-spinning" : ""}${teams.length > 40 ? " is-dense" : ""}`}
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
            {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
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
            <strong>{pendingTeam.shortCode}</strong>
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
  usedAthleteIds,
  selectedSlot,
  loading,
  busy,
  error,
  showRank,
  onSelectSlot,
  onPick,
  onRetry,
}: {
  team: WheelFootballTeam;
  candidates: readonly WheelFootballCandidate[];
  roster: readonly WheelFootballPick[];
  usedAthleteIds: ReadonlySet<string>;
  selectedSlot: WheelFootballRosterSlot | null;
  loading: boolean;
  busy: boolean;
  error: string;
  showRank: boolean;
  onSelectSlot: (slot: WheelFootballRosterSlot) => void;
  onPick: (candidate: WheelFootballCandidate) => void;
  onRetry: () => void;
}) {
  const slots = openSlots(roster);
  const available = candidates.filter((candidate) => !usedAthleteIds.has(candidate.id));
  const visible = selectedSlot
    ? wheelFootballShortlist(available, selectedSlot, team.code)
    : [];

  return (
    <section className="football-wheel-picker surface-card">
      <header>
        <TeamLogo team={team} />
        <div>
          <p className="eyebrow">YOUR SPIN</p>
          <h2><TeamReferenceLink team={team} showRank={showRank} /></h2>
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
                        : <b>{team.shortCode}</b>}
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
  const [league, setLeague] = useState<WheelFootballLeague>("NFL");
  const [scope, setScope] = useState<WheelFootballPoolScope>("NFL");
  const [division, setDivision] = useState<WheelFootballDivision>("NFC East");
  const [opponents, setOpponents] = useState<MemberCardSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addOpponent(member: MemberCardSummary) {
    setOpponents((current) => {
      if (current.length >= 3 || current.some((entry) => entry.displayName === member.displayName)) return current;
      return [...current, member];
    });
  }

  useEffect(() => {
    if (!challenges.preferredRecipientName) return;
    const preferred = challenges.members.find((member) => (
      member.displayName.toUpperCase() === challenges.preferredRecipientName.toUpperCase()
    ));
    if (preferred) addOpponent(preferred);
  }, [challenges.members, challenges.preferredRecipientName]);

  const scopeOptions = league === "NFL" ? NFL_SCOPE_OPTIONS : CFB_SCOPE_OPTIONS;
  const pool = wheelFootballPoolTeams(scope, scope === "DIVISION" ? division : null);
  const playerCount = opponents.length + 1;
  const availableMembers = challenges.members.filter((member) => (
    !opponents.some((selected) => selected.displayName === member.displayName)
  ));

  function chooseLeague(nextLeague: WheelFootballLeague) {
    setLeague(nextLeague);
    setScope(nextLeague === "NFL" ? "NFL" : "CFB");
  }

  async function createMatch() {
    if (!repository || !opponents.length || !challenges.activeProfile) return;
    setBusy(true);
    setError("");
    try {
      const profiles = await Promise.all(
        opponents.map((opponent) => challenges.findProfile(opponent.displayName)),
      );
      if (profiles.some((profile) => !profile)) {
        throw new Error("One of those Octagon HQ members could not be resolved.");
      }
      const code = await repository.create(
        profiles.map((profile) => profile!.id),
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
          Build seven-slot {league === "NFL" ? "NFL" : "college football"} Superteams with 2–4 HQ players.
          The same Wheel rules and curated player choices apply at every player count.
        </p>
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>1</small><span><b>CHOOSE THE WHEEL</b><em>Current {league === "NFL" ? "NFL" : "CFB"} only</em></span></div>
          <strong>{pool.length} {league === "NFL" ? "TEAMS" : "SCHOOLS"}</strong>
        </header>
        <div className="football-wheel-setup__league" aria-label="Football level">
          <button type="button" className={league === "NFL" ? "is-active" : ""} onClick={() => chooseLeague("NFL")}>NFL</button>
          <button type="button" className={league === "CFB" ? "is-active" : ""} onClick={() => chooseLeague("CFB")}>COLLEGE</button>
        </div>
        <div className="football-wheel-setup__scope">
          {scopeOptions.map((option) => (
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
              <button type="button" className={division === value ? "is-active" : ""} onClick={() => setDivision(value)} key={value}>
                {value}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="football-wheel-setup surface-card">
        <header>
          <div><small>2</small><span><b>CHOOSE 1–3 OPPONENTS</b><em>{playerCount} of 4 players</em></span></div>
        </header>
        {challenges.activeProfile ? (
          <>
            {opponents.length ? (
              <div className="football-wheel-opponents" aria-label="Selected Wheel players">
                {opponents.map((opponent, index) => (
                  <div className="football-wheel-opponent" key={opponent.displayName}>
                    <i aria-hidden="true">
                      {opponent.avatarPhotoData ? <img src={opponent.avatarPhotoData} alt="" /> : opponent.initials}
                    </i>
                    <span>
                      <small>PLAYER {index + 2}</small>
                      <strong>{opponent.displayName}</strong>
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setOpponents((current) => current.filter((entry) => entry.displayName !== opponent.displayName))}
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {opponents.length < 3 ? (
              <ChallengeMemberPicker
                key={opponents.map((opponent) => opponent.displayName).join("|")}
                members={availableMembers}
                recentNames={challenges.profiles.map((profile) => profile.displayName)}
                selectedName=""
                busy={busy}
                onSelect={addOpponent}
              />
            ) : (
              <p className="football-wheel-setup__maxed">Four-player lobby full.</p>
            )}
          </>
        ) : (
          <div className="football-wheel-setup__signin">
            <p>Sign in to challenge other HQ members.</p>
            <button type="button" onClick={identity.openDialog}>SIGN IN</button>
          </div>
        )}
      </section>

      <section className="football-wheel-setup__rules surface-card">
        <header><p className="eyebrow">HOW IT WORKS</p><strong>{playerCount * 7} total picks · 7 each</strong></header>
        <div>
          <span><b>1</b> Everyone accepts the lobby, then the first player is randomized.</span>
          <span><b>2</b> Spin a team, then choose one current player or coach for an open Superteam slot.</span>
          <span><b>3</b> Turns rotate through all {playerCount} players until every active QB · RB · WR · Flex · Front Seven · Secondary · Head Coach slot is filled.</span>
          <span><b>4</b> The wheel only keeps teams that can still fill your open spots. Back-to-back repeats are avoided unless that team is the only valid option; dead spins auto-respin for free.</span>
          <span><b>5</b> No player or coach can be drafted twice in the same match. Individual grades stay private; final Superteam grades determine the standings.</span>
        </div>
      </section>

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}
      <div className="football-wheel-setup__actions">
        <button type="button" className="secondary-action" onClick={() => navigate("/football")}>ALL GAMES</button>
        <button
          type="button"
          className="primary-action"
          disabled={!repository || !opponents.length || !challenges.activeProfile || busy}
          onClick={() => void createMatch()}
        >
          {busy ? "CREATING MATCH…" : opponents.length ? `START ${playerCount}-PLAYER CHALLENGE →` : "CHOOSE AN OPPONENT"}
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
  const [shareState, setShareState] = useState<"idle" | "sharing" | "saved" | "error">("idle");
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

  const me = state ? participantForProfile(state, activeProfileId) : null;

  useEffect(() => {
    if (
      !repository
      || !state
      || !me
      || me.accepted
      || me.forfeited_at
      || openedRef.current
      || state.phase !== "waiting"
      || state.completed_at
      || state.declined_at
    ) return;
    openedRef.current = true;
    repository.open(code)
      .then(() => Promise.all([syncMatch(false), challenges.refresh()]))
      .catch((reason) => {
        openedRef.current = false;
        setError(reason instanceof Error ? reason.message : "Challenge could not be accepted.");
      });
  }, [challenges, code, me, repository, state]);

  const isMyTurn = Boolean(state && activeProfileId && state.current_turn_profile_id === activeProfileId && !me?.forfeited_at);
  const myRoster = state ? rosterForProfile(state, activeProfileId) : [];
  const usedAthleteIds = new Set(
    state
      ? state.participants.flatMap((participant) => participant.roster).map((pick) => pick.athlete_id)
      : [],
  );
  const currentParticipant = state
    ? participantForProfile(state, state.current_turn_profile_id)
    : null;
  const division = state ? divisionFromState(state.division) : null;
  const allPoolTeams = state ? wheelFootballPoolTeams(state.pool_scope, division) : [];
  const eligibleTeamCodes = new Set(state?.eligible_team_codes ?? []);
  const shouldFilterWheel = Boolean(
    state?.opened_at
    && state.phase !== "complete"
    && state.current_turn_profile_id
    && state.eligible_team_codes !== null,
  );
  const poolTeams = shouldFilterWheel
    ? allPoolTeams.filter((team) => eligibleTeamCodes.has(team.code))
    : allPoolTeams;
  const pendingTeam = state?.pending_team ? wheelFootballTeam(state.pending_team.code) : null;
  const pendingTeamEligible = state?.eligible_team_codes === null
    || !pendingTeam
    || eligibleTeamCodes.has(pendingTeam.code);

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
    if (state?.phase === "pick" && isMyTurn && pendingTeam && pendingTeamEligible) void loadRoster();
  }, [isMyTurn, pendingTeam?.code, pendingTeamEligible, state?.phase]);

  async function spin() {
    const isFreeReroll = Boolean(
      state
      && state.phase === "pick"
      && pendingTeam
      && (state.eligible_team_codes?.length ?? 0) > 0
      && !pendingTeamEligible,
    );
    if (
      !repository
      || !state
      || !isMyTurn
      || (state.phase !== "spin" && !isFreeReroll)
      || spinning
      || !state.opened_at
    ) return;
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

  useEffect(() => {
    if (
      !state
      || !isMyTurn
      || state.phase !== "pick"
      || !pendingTeam
      || pendingTeamEligible
      || (state.eligible_team_codes?.length ?? 0) === 0
      || spinning
    ) return;
    void spin();
  }, [
    isMyTurn,
    pendingTeam?.code,
    pendingTeamEligible,
    spinning,
    state?.eligible_team_codes,
    state?.phase,
  ]);

  async function cancelWaitingLobby() {
    if (!repository || !state || state.phase !== "waiting" || busy) return;
    setBusy(true);
    setError("");
    try {
      const ended = await repository.decline(code);
      if (!ended) throw new Error("The lobby could not be canceled.");
      await Promise.all([syncMatch(false), challenges.refresh()]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The lobby could not be canceled.");
    } finally {
      setBusy(false);
    }
  }

  async function forfeitMatch() {
    if (!repository || !state?.opened_at || state.phase === "complete" || busy || me?.forfeited_at) return;
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

  async function shareResult() {
    if (!state?.result || shareState === "sharing") return;
    setShareState("sharing");
    try {
      const blob = await buildWheelResultShareImage(state);
      const file = new File([blob], `wheel-of-football-${code.toLowerCase()}-final.png`, { type: "image/png" });
      const canShareFile = typeof navigator.share === "function"
        && (typeof navigator.canShare !== "function" || navigator.canShare({ files: [file] }));
      if (canShareFile) {
        await navigator.share({ files: [file], title: "Wheel of Football · Final" });
        setShareState("idle");
        return;
      }
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      setShareState("saved");
      window.setTimeout(() => setShareState("idle"), 1600);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        setShareState("idle");
        return;
      }
      setShareState("error");
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

  const pendingAcceptances = state.participants.filter((participant) => !participant.accepted && !participant.forfeited_at);
  const waitingNames = pendingAcceptances.map((participant) => participant.display_name.toUpperCase());
  const turnLabel = !state.opened_at
    ? me && !me.accepted
      ? "ACCEPTING INVITE…"
      : waitingNames.length
        ? `WAITING FOR ${waitingNames.join(waitingNames.length > 1 ? " · " : "")}`
        : "STARTING MATCH…"
    : state.phase === "complete"
      ? "FINAL SUPERTEAMS"
      : me?.forfeited_at
        ? "YOU FORFEITED · MATCH CONTINUES"
        : isMyTurn
          ? state.phase === "spin"
            ? "YOUR TURN · SPIN"
            : "YOUR TURN · MAKE YOUR PICK"
          : state.phase === "pick" && pendingTeam
            ? `${currentParticipant?.display_name.toUpperCase() ?? "PLAYER"} SPUN ${pendingTeam.shortCode}`
            : `${currentParticipant?.display_name.toUpperCase() ?? "ANOTHER PLAYER"}'S TURN`;

  if (state.phase === "complete") {
    if (state.declined_at) {
      return (
        <div className="page football-wheel-page football-wheel-page--result">
          <section className="football-wheel-result-summary surface-card">
            <div className="football-wheel-result-summary__meta">
              <div><p className="eyebrow">WHEEL OF FOOTBALL · CANCELED</p><h1>Lobby canceled</h1></div>
              <span>{resultPoolLabel(state)}</span>
            </div>
            <p className="football-wheel-result-summary__note">The match ended before every player accepted.</p>
          </section>
          <div className="football-wheel-result-actions without-share">
            <button type="button" className="football-wheel-result-actions__new" onClick={() => navigate("/football/wheel")}>NEW CHALLENGE →</button>
            <button type="button" className="football-wheel-result-actions__all" onClick={() => navigate("/football")}>ALL GAMES</button>
          </div>
        </div>
      );
    }

    const standings = state.result?.standings ?? [];
    const orderedParticipants = standings
      .map((standing) => state.participants.find((participant) => participant.id === standing.profile_id))
      .filter((participant): participant is WheelFootballParticipant => Boolean(participant));
    const winnerNames = state.result?.winner_profile_ids
      .map((id) => state.participants.find((participant) => participant.id === id)?.display_name)
      .filter((name): name is string => Boolean(name)) ?? [];
    const headline = state.result?.resolved_by_forfeit && winnerNames.length === 1
      ? `${winnerNames[0]} wins by forfeit`
      : winnerNames.length > 1
        ? `${winnerNames.join(" & ")} tie`
        : winnerNames.length === 1
          ? `${winnerNames[0]} wins`
          : "Final standings";

    return (
      <div className="page football-wheel-page football-wheel-page--result">
        <section className="football-wheel-result-summary surface-card">
          <div className="football-wheel-result-summary__meta">
            <div>
              <p className="eyebrow">WHEEL OF FOOTBALL · FINAL</p>
              <h1>{headline}</h1>
            </div>
            <span>{resultPoolLabel(state)}</span>
          </div>

          {state.result ? state.participants.length === 2 ? (
            <TwoPlayerResultScore state={state} activeProfileId={activeProfileId} />
          ) : (
            <div className="football-wheel-multiplayer-score" aria-label="Final Wheel of Football standings">
              {(orderedParticipants.length ? orderedParticipants : state.participants).map((participant) => {
                const standing = standings.find((item) => item.profile_id === participant.id);
                return (
                  <article className={standing?.rank === 1 ? "is-winner" : ""} key={participant.id}>
                    <small>{standing?.rank ? `#${standing.rank}` : participant.forfeited_at ? "DNF" : "—"}</small>
                    <strong>{participant.id === activeProfileId ? "YOU" : participant.display_name}</strong>
                    <b>{participant.final_grade == null ? (participant.forfeited_at ? "DNF" : "—") : participant.final_grade.toFixed(1)}</b>
                    <span>FINAL GRADE</span>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="football-wheel-result-summary__note">Final grading is unavailable for this legacy matchup.</p>
          )}
        </section>

        <WheelRosters state={state} activeProfileId={activeProfileId} />

        <div className="football-wheel-result-actions">
          {state.result ? (
            <button
              type="button"
              className="football-wheel-result-actions__share"
              disabled={shareState === "sharing"}
              onClick={() => void shareResult()}
            >
              {shareState === "sharing" ? "PREPARING…" : shareState === "saved" ? "IMAGE SAVED" : shareState === "error" ? "TRY SHARE" : "SHARE RESULT ↗"}
            </button>
          ) : null}
          <button type="button" className="football-wheel-result-actions__new" onClick={() => navigate("/football/wheel")}>NEW CHALLENGE →</button>
          <button type="button" className="football-wheel-result-actions__all" onClick={() => navigate("/football")}>ALL GAMES</button>
        </div>
      </div>
    );
  }

  const currentTurnNumber = Math.min(state.max_turns || state.participants.length * 7, state.turn_count + 1);
  const displayedMaxTurns = state.max_turns || state.participants.length * 7;

  return (
    <div className="page football-wheel-page">
      <section className="football-wheel-match__status surface-card">
        <div>
          <p className="eyebrow">
            WHEEL OF FOOTBALL · {state.opened_at ? `TURN ${currentTurnNumber} OF ${displayedMaxTurns}` : `${state.participants.length}-PLAYER LOBBY`}
          </p>
          <h1>{turnLabel}</h1>
          <span>{wheelFootballPoolLabel(state.pool_scope, division)} · CURRENT {wheelFootballLeagueFromScope(state.pool_scope)}</span>
        </div>
        <div className="football-wheel-match__actions">
          <button type="button" disabled={busy || spinning} onClick={() => void syncMatch(false)}>REFRESH</button>
          {state.phase === "waiting" && activeProfileId === state.creator.id ? (
            <button type="button" className="is-danger" disabled={busy || spinning} onClick={() => void cancelWaitingLobby()}>
              {busy ? "CANCELING…" : "CANCEL LOBBY"}
            </button>
          ) : state.opened_at && me && !me.forfeited_at ? (
            <button type="button" className="is-danger" disabled={busy || spinning} onClick={() => setShowForfeitConfirm(true)}>FORFEIT</button>
          ) : null}
        </div>
      </section>

      <WheelRosters state={state} activeProfileId={activeProfileId} />

      <FootballWheel
        teams={poolTeams}
        rotation={rotation}
        spinning={spinning}
        pendingTeam={pendingTeamEligible ? pendingTeam : null}
        canSpin={Boolean(state.opened_at && isMyTurn && state.phase === "spin" && poolTeams.length > 0)}
        onSpin={() => void spin()}
      />

      {state.phase === "pick" && pendingTeam && pendingTeamEligible && isMyTurn ? (
        <CandidatePicker
          team={pendingTeam}
          candidates={candidates}
          roster={myRoster}
          usedAthleteIds={usedAthleteIds}
          selectedSlot={selectedSlot}
          loading={rosterLoading}
          busy={busy}
          error={rosterError}
          showRank={state.pool_scope === "AP_TOP_25"}
          onSelectSlot={setSelectedSlot}
          onPick={(candidate) => void pick(candidate)}
          onRetry={() => void loadRoster()}
        />
      ) : null}

      {!isMyTurn && state.opened_at ? (
        <section className="football-wheel-waiting surface-card">
          <strong>{me?.forfeited_at
            ? "You’re out of this match. The remaining players are finishing their Superteams."
            : state.phase === "pick" && pendingTeam
              ? (
                <>
                  {currentParticipant?.display_name ?? "Another player"} is choosing from the{" "}
                  <TeamReferenceLink team={pendingTeam} showRank={state.pool_scope === "AP_TOP_25"} />.
                </>
              )
              : `Waiting on ${currentParticipant?.display_name ?? "another player"}.`}</strong>
          <span>{me?.forfeited_at ? "You can keep watching the live draft." : "You’ll get a notification when your next spin is ready."}</span>
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
            <p className="eyebrow">LEAVE MATCH</p>
            <h2 id="wheel-forfeit-title">Forfeit Wheel of Football?</h2>
            <p>{state.participants.filter((participant) => !participant.forfeited_at).length > 2
              ? "You’ll be eliminated and the remaining players will continue. Your completed picks stay visible."
              : "The remaining player will win by forfeit. Your completed picks stay visible and grades stay private."}</p>
            <div>
              <button type="button" className="secondary-action" disabled={busy} onClick={() => setShowForfeitConfirm(false)}>KEEP PLAYING</button>
              <button type="button" className="football-wheel-forfeit__confirm" disabled={busy} onClick={() => void forfeitMatch()}>
                {busy ? "FORFEITING…" : "FORFEIT"}
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
