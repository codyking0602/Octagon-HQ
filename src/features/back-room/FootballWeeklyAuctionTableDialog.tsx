import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-auction-table.css";
import {
  createFootballWeeklyAuctionTableRepository,
  type FootballWeeklyAuctionTablePlayer,
  type FootballWeeklyAuctionTableTeam,
} from "../play/footballWeeklyAuctionTableRepository";
import {
  footballWeeklyAuctionTeamIdentity,
  footballWeeklyAuctionTeamStyle,
  type FootballWeeklyAuctionTeamIdentity,
} from "./footballWeeklyAuctionPresentation";
import { footballNflTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";

function TeamMark({ identity, school }: { identity: FootballWeeklyAuctionTeamIdentity; school: string }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(identity.logoSrc) && !logoFailed;

  return (
    <span className="football-weekly-auction-table__mark" aria-hidden="true">
      {showLogo ? (
        <img src={identity.logoSrc ?? ""} alt="" onError={() => setLogoFailed(true)} />
      ) : (
        <span>{school.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
} 

function NflTeamMark({ teamCode, label }: { teamCode: string; label: string }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const asset = footballTeamAssets[footballNflTeamMediaId(teamCode)] ?? null;
  return (
    <span className="football-weekly-auction-table__mark" aria-hidden="true">
      {asset && !logoFailed ? (
        <img src={asset.src} alt="" onError={() => setLogoFailed(true)} />
      ) : (
        <span>{teamCode || label.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

function rankedResume(identity: FootballWeeklyAuctionTeamIdentity) {
  const cleaned = identity.resume
    .replace(/ · No\. \d+ Final AP/, "")
    .replace(/No\. \d+ Final AP · /, "");
  if (identity.finalApRank == null) return cleaned;
  return `#${identity.finalApRank} · ${cleaned}`;
}

function TeamRow({ team }: { team: FootballWeeklyAuctionTableTeam }) {
  const identity = team.team_code ? null : footballWeeklyAuctionTeamIdentity(
    team.season_reference,
    team.school,
    team.season_year,
  );

  return (
    <article
      className={"football-weekly-auction-table__team" + (team.team_code ? " is-nfl" : "")}
      style={identity ? footballWeeklyAuctionTeamStyle(identity) : undefined}
    >
      {team.team_code
        ? <NflTeamMark teamCode={team.team_code} label={team.school} />
        : <TeamMark identity={identity!} school={team.school} />}
      <div className="football-weekly-auction-table__team-copy">
        <strong className="football-weekly-auction-table__team-name">{team.school}</strong>
        <span className="football-weekly-auction-table__team-meta">
          <b>{team.season_year}</b> · WON {"$"}{team.price_paid}
        </span>
        {identity ? <small>{rankedResume(identity)}</small> : <small>Exact NFL team-season</small>}
      </div>
    </article>
  );
}

function PlayerRow({
  player,
  expanded,
  onToggle,
}: {
  player: FootballWeeklyAuctionTablePlayer;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={"football-weekly-auction-table__player" + (player.is_current_user ? " is-current" : "")}>
      <button type="button" aria-expanded={expanded} onClick={onToggle}>
        <span className="football-weekly-auction-table__player-name">
          <strong>{player.display_name}</strong>
          {player.is_current_user ? <small>YOU</small> : null}
        </span>
        <span className="football-weekly-auction-table__player-stat">
          <strong>{"$"}{player.bankroll}</strong>
          <small>LEFT</small>
        </span>
        <span className="football-weekly-auction-table__player-stat">
          <strong>{player.owned_count}</strong>
          <small>TEAMS</small>
        </span>
        <span className="football-weekly-auction-table__chevron" aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>

      {expanded ? (
        <div className="football-weekly-auction-table__roster">
          {player.teams.length ? (
            player.teams.map((team) => <TeamRow key={team.season_reference} team={team} />)
          ) : (
            <p>No teams won yet.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function FootballWeeklyAuctionTableDialog({ onClose }: { onClose: () => void }) {
  const repository = useMemo(() => createFootballWeeklyAuctionTableRepository(), []);
  const [players, setPlayers] = useState<FootballWeeklyAuctionTablePlayer[]>([]);
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    if (!repository) {
      setError("Auction Table is unavailable right now.");
      setLoading(false);
      return () => { active = false; };
    }

    repository.load()
      .then((nextPlayers) => {
        if (!active) return;
        setPlayers(nextPlayers);
        setExpandedProfileId(nextPlayers.find((player) => player.is_current_user)?.profile_id ?? null);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Auction Table could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [repository]);

  return (
    <div className="football-weekly-auction-table__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="football-weekly-auction-table__sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Weekly Auction table"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p className="eyebrow">WEEKLY AUCTION</p>
            <h2>AUCTION TABLE</h2>
            <span>Resolved teams + bankrolls. Today’s bids stay sealed.</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Auction Table">×</button>
        </header>

        <div className="football-weekly-auction-table__body">
          {loading ? <p className="football-weekly-auction-table__message">Loading table…</p> : null}
          {error ? <p className="football-weekly-auction-table__message is-error">{error}</p> : null}
          {!loading && !error ? players.map((player) => (
            <PlayerRow
              key={player.profile_id}
              player={player}
              expanded={expandedProfileId === player.profile_id}
              onToggle={() => setExpandedProfileId((current) => current === player.profile_id ? null : player.profile_id)}
            />
          )) : null}
        </div>
      </section>
    </div>
  );
}
