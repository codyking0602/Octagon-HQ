import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-auction-table.css";
import {
  createFootballWeeklyAuctionTableRepository,
  type FootballWeeklyAuctionTablePlayer,
  type FootballWeeklyAuctionTableTeam,
} from "../play/footballWeeklyAuctionTableRepository";
import { AuctionTablePlayerScroll } from "./AuctionTablePlayerScroll";
import { AuctionTableRosterScroll } from "./AuctionTableRosterScroll";
import { createFootballWeeklyAuctionRepository } from "../play/footballWeeklyAuctionRepository";
import {
  footballWeeklyAuctionTeamIdentity,
  footballWeeklyAuctionTeamStyle,
  type FootballWeeklyAuctionTeamIdentity,
} from "./footballWeeklyAuctionPresentation";
import { footballNflTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";

const PFR_TEAM_CODES: Record<string, string> = {
  ARI: "crd", ATL: "atl", BAL: "rav", BUF: "buf", CAR: "car", CHI: "chi",
  CIN: "cin", CLE: "cle", DAL: "dal", DEN: "den", DET: "det", GB: "gnb",
  HOU: "htx", IND: "clt", JAX: "jax", KC: "kan", LAC: "sdg", LAR: "ram",
  LV: "rai", MIA: "mia", MIN: "min", NE: "nwe", NO: "nor", NYG: "nyg",
  NYJ: "nyj", PHI: "phi", PIT: "pit", SEA: "sea", SF: "sfo", TB: "tam",
  TEN: "oti", WAS: "was",
};

function nflSeasonUrl(teamCode: string, seasonYear: number) {
  const code = PFR_TEAM_CODES[teamCode];
  return code
    ? `https://www.pro-football-reference.com/teams/${code}/${seasonYear}.htm`
    : "https://www.pro-football-reference.com/";
}

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
        {team.team_code ? (
          <a
            className="football-weekly-auction-table__team-name football-weekly-auction-table__nfl-link"
            href={nflSeasonUrl(team.team_code, team.season_year)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {team.school}
          </a>
        ) : (
          <strong className="football-weekly-auction-table__team-name">{team.school}</strong>
        )}
        <span className="football-weekly-auction-table__team-meta">
          <b>{team.season_year}</b> · WON {"$"}{team.price_paid}
        </span>
        {identity ? <small>{rankedResume(identity)}</small> : <small>{team.card_tag ?? "Exact NFL team-season"}</small>}
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
    <AuctionTablePlayerScroll
      className={"football-weekly-auction-table__player" + (player.is_current_user ? " is-current" : "")}
      expanded={expanded}
    >
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
        <AuctionTableRosterScroll
          className="football-weekly-auction-table__roster"
          label={player.display_name + " teams"}
        >
          {player.teams.length ? (
            player.teams.map((team) => <TeamRow key={team.season_reference} team={team} />)
          ) : (
            <p>No teams won yet.</p>
          )}
        </AuctionTableRosterScroll>
      ) : null}
    </AuctionTablePlayerScroll>
  );
}

export function FootballWeeklyAuctionTableDialog({
  mode = "live",
  seatIndex = 1,
  onClose,
}: {
  mode?: "live" | "lab";
  seatIndex?: number;
  onClose: () => void;
}) {
  const repository = useMemo(() => createFootballWeeklyAuctionTableRepository(), []);
  const weeklyRepository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
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

    async function loadPlayers() {
      if (mode === "lab") {
        if (!weeklyRepository) throw new Error("Auction Table is unavailable right now.");
        const labStates = await Promise.all(
          [1, 2, 3, 4, 5].map((index) => weeklyRepository.loadNflTeamSeasonLab(index)),
        );
        return labStates.map((labState, index): FootballWeeklyAuctionTablePlayer => {
          const labSeat = labState.seats.find((seat) => seat.seat_index === index + 1)!;
          const state = labState.state;
          return {
            profile_id: labSeat.profile_id,
            display_name: labSeat.display_name,
            is_current_user: labSeat.seat_index === seatIndex,
            bankroll: labSeat.bankroll,
            owned_count: labSeat.owned_count,
            teams: state?.collection.map((team) => ({
              season_reference: team.item_reference,
              school: team.team_name,
              team_code: team.team_code,
              season_year: team.season_year,
              display_label: team.display_label,
              card_tag: team.card_tag ?? null,
              price_paid: team.winning_bid,
            })) ?? [],
          };
        });
      }

      if (!repository) throw new Error("Auction Table is unavailable right now.");
      return repository.load();
    }

    setLoading(true);
    setError(null);
    loadPlayers()
      .then((nextPlayers) => {
        if (!active) return;
        setPlayers(nextPlayers);
        setExpandedProfileId(nextPlayers.find((player) => player.is_current_user)?.profile_id ?? null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Auction Table could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [mode, repository, seatIndex, weeklyRepository]);

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
