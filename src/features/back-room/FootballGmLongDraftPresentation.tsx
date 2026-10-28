import { useEffect, useState, type CSSProperties } from "react";
import { footballGmMoney, footballGmPlayerById } from "./footballGmEngine";
import { nflGmLongCalibratedOlDevelopment } from "./footballGmLongOlCalibration";
import {
  footballGmOutlookFromOdds, footballGmTalentTier, footballGmRepriceLabel,
} from "./footballGmScouting";
import {
  PlayerHeadshot, PlayerQualityPill, PlayerOutlookPill,
} from "./FootballGmModePage";
import { wheelFootballTeam } from "./wheelFootballModel";
import { useNflGmLongOlBio } from "./footballGmLongOlMedia";
import {
  NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS, NFL_GM_LONG_SLOT_LABELS,
  nflGmLongSpend, type NflGmLongPick, type NflGmLongSlot,
} from "./footballGmLongFoundation";
import {
  NFL_GM_LONG_BY_ID, nflGmLongTeamCandidates, type NflGmLongPlayer,
} from "./footballGmLongCatalog";

/**
 * Long intentionally uses Short GM's existing scouting/headshot components and
 * EXACT Short GM card, cap, wheel and position-tab class names. No parallel
 * visual language: only the slot count, OL eligibility and cap differ.
 */
function teamStyle(teamCode: string): CSSProperties | undefined {
  const team = wheelFootballTeam(teamCode);
  if (!team) return undefined;
  return {
    "--gm-team-primary": team.primaryColor,
    "--gm-team-secondary": team.secondaryColor,
  } as CSSProperties;
}

/** Short keeps its existing picture component; only OL needs an ESPN lookup. */
export function LongPlayerPortrait({ player, className = "football-gm__player-headshot" }: {
  player: NflGmLongPlayer;
  className?: string;
}) {
  const isOl = player.family === "OL";
  const bio = useNflGmLongOlBio(player.team, player.name, isOl);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  if (!isOl) return <PlayerHeadshot player={player} className={className} />;
  const headshot = bio?.headshotUrl;
  const team = wheelFootballTeam(player.team);
  return <span className={className} aria-hidden="true">
    {headshot && failedUrl !== headshot
      ? <img src={headshot} alt="" onError={() => setFailedUrl(headshot)} />
      : team?.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team?.shortCode ?? player.team}</b>}
  </span>;
}

function LongPlayerRoleAge({ player, includeTeam = false }: {
  player: NflGmLongPlayer;
  includeTeam?: boolean;
}) {
  const bio = useNflGmLongOlBio(player.team, player.name, player.family === "OL");
  const age = player.age ?? bio?.age;
  const role = includeTeam ? `${player.team} · ${player.position}` : player.position;
  // Unknown OL age must be visibly unknown, never a made-up value.
  const text = `${role}${age != null ? ` · AGE ${age}` : player.family === "OL" ? " · AGE —" : ""}`;
  return includeTeam ? <em>{text}</em> : <small>{text}</small>;
}

function longScouting(player: NflGmLongPlayer) {
  const tier = footballGmTalentTier(player.currentGrade);
  if (player.family !== "OL") return { tier, outlook: null };
  const odds = nflGmLongCalibratedOlDevelopment(player);
  const outlook = odds ? footballGmOutlookFromOdds(odds) : "STEADY";
  return { tier, outlook };
}

/** Reuse existing Short scouting tiers; OL uses its audited current grade. */
export function LongPlayerTier({ player }: { player: NflGmLongPlayer }) {
  const shortPlayer = footballGmPlayerById(player.id);
  if (shortPlayer) return <PlayerQualityPill player={shortPlayer} />;
  const tier = footballGmTalentTier(player.currentGrade);
  return <span className={`football-gm__quality-pill quality-${tier.toLowerCase()}`}>{tier}</span>;
}

function LongQualityAndOutlook({ player }: { player: NflGmLongPlayer }) {
  const shortPlayer = footballGmPlayerById(player.id);
  if (shortPlayer) {
    return <><PlayerQualityPill player={shortPlayer} /><PlayerOutlookPill player={shortPlayer} /></>;
  }
  const { tier, outlook } = longScouting(player);
  const tone = outlook === "HIGH UPSIDE" ? "upside" :
    outlook === "RISING" ? "rising" : outlook === "BOOM/BUST" ? "volatile" :
      outlook === "DECLINE RISK" ? "decline" : "stable";
  return <>
    <span className={`football-gm__quality-pill quality-${tier.toLowerCase()}`}>{tier}</span>
    <span className={`football-gm__outlook-pill outlook-${tone}`}>{outlook}</span>
  </>;
}

function repriceRisk(player: NflGmLongPlayer) {
  if (player.gameContract === "3YR") return "LOCKED" as const;
  const increase = player.salaryWindow[1] - player.salaryWindow[0];
  const multiple = player.salaryWindow[1] / Math.max(1, player.salaryWindow[0]);
  return increase >= 20_000_000 || multiple >= 4 ? "HIGH" as const
    : increase >= 8_000_000 || multiple >= 2 ? "MEDIUM" as const : "LOW" as const;
}

export function LongPlayerTags({ player }: { player: NflGmLongPlayer }) {
  const risk = repriceRisk(player);
  return <span className="football-gm__candidate-tags">
    <LongQualityAndOutlook player={player} />
    <span>{player.gameContract}</span>
    <span className={`risk-${risk.toLowerCase()}`}>{footballGmRepriceLabel(risk)}</span>
  </span>;
}

export function longSlotLabel(slot: NflGmLongSlot) {
  return slot === "DL" ? "F7-1" : slot === "LB" ? "F7-2"
    : slot === "DB" ? "DB-1" : slot === "DB2" ? "DB-2" : NFL_GM_LONG_SLOT_LABELS[slot];
}

/** The same cap meter shape and classes as Short GM's CapMeter. */
export function LongCapMeter({ picks }: { picks: readonly NflGmLongPick[] }) {
  const spent = nflGmLongSpend(picks, NFL_GM_LONG_BY_ID);
  const left = NFL_GM_LONG_CAP - spent;
  return <section className={`football-gm__cap surface-card${left < 0 ? " is-over" : ""}`}>
    <div>
      <span><small>YEAR 1 CAP</small><strong>{footballGmMoney(spent)} / {footballGmMoney(NFL_GM_LONG_CAP)}</strong></span>
      <b>{left >= 0 ? `${footballGmMoney(left)} LEFT` : `${footballGmMoney(-left)} OVER`}</b>
    </div>
    <i><em style={{ width: `${Math.min(100, spent / NFL_GM_LONG_CAP * 100)}%` }} /></i>
  </section>;
}

/** Identical roster hierarchy/headshots/scouting to Short; nine cells instead of seven. */
export function LongRosterGrid({ picks }: { picks: readonly NflGmLongPick[] }) {
  const bySlot = new Map(picks.map(pick => [pick.slot, pick]));
  return <section className="football-gm__roster surface-card">
    <header><span><small>YOUR TEAM</small><strong>9-MAN CORE</strong></span><b>{picks.length}/9</b></header>
    <div className="football-gm__roster-grid">
      {NFL_GM_LONG_SLOTS.map(slot => {
        const entry = bySlot.get(slot);
        const player = entry ? NFL_GM_LONG_BY_ID.get(entry.playerId) : null;
        return <article key={slot} className={player ? "is-filled" : ""} style={player ? teamStyle(player.team) : undefined}>
          <small>{longSlotLabel(slot)}</small>
          {player ? <>
            <div className="football-gm__roster-player">
              <LongPlayerPortrait player={player} />
              <span>
                <strong>{player.name}</strong>
                <LongPlayerRoleAge player={player} includeTeam />
                <span className="football-gm__roster-scouting">
                  <LongQualityAndOutlook player={player} />
                </span>
              </span>
            </div>
            <div className="football-gm__roster-contract">
              <b>{footballGmMoney(player.salaryWindow[0])}</b>
              <span>{player.gameContract}</span>
              <small className="football-gm__roster-reprice">{footballGmRepriceLabel(repriceRisk(player))}</small>
            </div>
          </> : <strong className="football-gm__open">OPEN</strong>}
        </article>;
      })}
    </div>
  </section>;
}

function positionFor(player: NflGmLongPlayer): string {
  if (player.family === "OL") return "OL";
  if (player.family === "TE") return "TE";
  if (player.family === "Front Seven") return "FRONT 7";
  if (player.family === "Secondary") return "DB";
  return player.family;
}

const POSITIONS = ["QB", "RB", "WR", "TE", "OL", "FRONT 7", "DB"] as const;

/** Short GM's position-first candidate picker, including the entire scout key. */
export function LongCandidateBoard({ teamCode, picks, onPick }: {
  teamCode: string;
  picks: readonly NflGmLongPick[];
  onPick: (playerId: string) => void;
}) {
  const team = wheelFootballTeam(teamCode);
  const candidates = nflGmLongTeamCandidates(teamCode, picks);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showScoutKey, setShowScoutKey] = useState(false);
  const availablePositions = POSITIONS.filter(position =>
    candidates.some(({ player }) => positionFor(player) === position));
  const visible = candidates.filter(({ player }) =>
    positionFor(player) === selectedPosition);

  useEffect(() => {
    setSelectedPosition(null);
    setShowScoutKey(false);
  }, [teamCode]);

  if (!team) return null;
  return <>
    <section className="football-wheel-picker football-gm__picker surface-card" style={teamStyle(teamCode)}>
      <header>
        <span className="football-wheel-team-logo" aria-hidden="true">
          {team.logoSrc ? <img src={team.logoSrc} alt="" /> : <b>{team.shortCode}</b>}
        </span>
        <div>
          <p className="eyebrow">YOUR SPIN</p>
          <h2>{team.name}</h2>
          <span>Choose a position, then a player. GM automatically fits the legal roster spots.</span>
        </div>
        <button className="football-gm__scout-key-button" type="button"
          aria-label="Open player scouting key" onClick={() => setShowScoutKey(true)}>?</button>
      </header>
      <div className="football-wheel-picker__slots football-gm__position-tabs" aria-label="Available positions">
        {availablePositions.map(position =>
          <button type="button" key={position}
            className={selectedPosition === position ? "is-active" : ""}
            aria-pressed={selectedPosition === position}
            onClick={() => setSelectedPosition(position)}>
            <strong>{position}</strong>
          </button>)}
      </div>
      {selectedPosition && availablePositions.some(position => position === selectedPosition)
        ? <div className="football-wheel-picker__candidates football-gm__picker-candidates"
          aria-label={`${selectedPosition} candidates`}>
          {visible.map(({ player }) =>
            <button type="button" className="gm-long__candidate-choice"
              onClick={() => onPick(player.id)} key={player.id}
              aria-label={`Select ${player.name} for ${footballGmMoney(player.salaryWindow[0])}`}>
              <span className="gm-long__candidate-identity">
                <LongPlayerPortrait player={player} className="football-wheel-picker__headshot" />
                <span className="football-gm__picker-player-copy">
                  <strong>{player.name}</strong>
                  <LongPlayerRoleAge player={player} />
                  <LongPlayerTags player={player} />
                </span>
              </span>
              <span className="football-gm__picker-action gm-long__candidate-select">
                <b>{footballGmMoney(player.salaryWindow[0])}</b>
                <em>SELECT →</em>
              </span>
            </button>)}
        </div>
        : <p className="football-wheel-picker__message football-gm__position-prompt">
            {candidates.length ? "Select a position to see available players."
              : "No legal player from this team fits the remaining roster and cap."}
          </p>}
    </section>
    {showScoutKey ? <div className="football-gm__scout-sheet-backdrop"
      role="presentation" onClick={() => setShowScoutKey(false)}>
      <section className="football-gm__scout-sheet" role="dialog" aria-modal="true"
        aria-label="Player scouting key" onClick={event => event.stopPropagation()}>
        <header><span><small>PLAYER OUTLOOK</small><strong>SCOUT KEY</strong></span>
          <button type="button" aria-label="Close player scouting key"
            onClick={() => setShowScoutKey(false)}>×</button></header>
        <div>
          <p><b>ELITE / IMPACT / STARTER / DEPTH</b><span>Current-ability scouting bands. Exact grades remain hidden.</span></p>
          <p><b>HIGH UPSIDE / RISING / STEADY / BOOM/BUST / DECLINE RISK</b><span>Outlooks derive from researched development probabilities.</span></p>
          <p><b>1YR</b><span>Salary reprices after Year 1.</span></p>
          <p><b>3YR · SALARY LOCKED</b><span>Salary stays fixed for all three years.</span></p>
          <p><b>LOW / MED / HIGH REPRICE</b><span>Expected size of a 1YR salary increase. OL estimates are provisional until the first offseason is implemented.</span></p>
        </div>
      </section>
    </div> : null}
  </>;
}
