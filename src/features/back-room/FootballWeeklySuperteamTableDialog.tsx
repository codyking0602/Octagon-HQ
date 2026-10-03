import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-superteam.css";
import {
  createFootballWeeklySuperteamTableRepository,
  type FootballWeeklySuperteamTableMode,
  type FootballWeeklySuperteamTablePlayer,
  type FootballWeeklySuperteamTableRosterItem,
} from "../play/footballWeeklySuperteamTableRepository";
import { AuctionTableRosterScroll } from "./AuctionTableRosterScroll";
import {
  footballWeeklySuperteamIdentity,
  footballWeeklySuperteamSportsReferenceUrl,
  footballWeeklySuperteamStyle,
} from "./footballWeeklySuperteamVisualIdentity";

const ROSTER_ORDER = ["QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach"] as const;

function TeamMark({ school }: { school: string }) {
  const identity = footballWeeklySuperteamIdentity(school);
  const [failed, setFailed] = useState(false);
  return (
    <span className="football-weekly-superteam__mark" aria-hidden="true">
      {identity.logoSrc && !failed
        ? <img src={identity.logoSrc} alt="" onError={() => setFailed(true)} />
        : <b>{identity.code}</b>}
    </span>
  );
}

function RosterRow({ item }: { item: FootballWeeklySuperteamTableRosterItem }) {
  const identity = footballWeeklySuperteamIdentity(item.school);
  return (
    <article
      className="football-weekly-superteam-table__roster-row"
      style={footballWeeklySuperteamStyle(identity)}
    >
      <TeamMark school={item.school} />
      <div>
        <small>{item.roster_slot}</small>
        <strong>
          <a
            className="football-weekly-superteam__sports-reference-link"
            href={footballWeeklySuperteamSportsReferenceUrl(item.display_name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.display_name + " on Sports-Reference"}
          >
            {item.display_name}
          </a>
        </strong>
        <span>{item.school} · {item.season_year}</span>
      </div>
      <b>WON {"$"}{item.price_paid}</b>
    </article>
  );
}

function PlayerRow({
  player,
  expanded,
  onToggle,
}: {
  player: FootballWeeklySuperteamTablePlayer;
  expanded: boolean;
  onToggle: () => void;
}) {
  const ordered = [...player.roster].sort(
    (left, right) => ROSTER_ORDER.indexOf(left.roster_slot) - ROSTER_ORDER.indexOf(right.roster_slot),
  );
  return (
    <article className={"football-weekly-superteam-table__player" + (player.is_current_user ? " is-current" : "")}>
      <button type="button" aria-expanded={expanded} onClick={onToggle}>
        <span>
          <strong>{player.display_name}</strong>
          {player.is_current_user ? <small>YOU</small> : null}
        </span>
        <span><strong>{"$"}{player.bankroll}</strong><small>LEFT</small></span>
        <span><strong>{player.owned_count}/7</strong><small>FILLED</small></span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      {expanded ? (
        <AuctionTableRosterScroll
          className="football-weekly-superteam-table__roster"
          label={player.display_name + " roster"}
        >
          {ordered.length ? ordered.map((item) => (
            <RosterRow key={item.item_reference} item={item} />
          )) : <p>No roster spots won yet.</p>}
        </AuctionTableRosterScroll>
      ) : null}
    </article>
  );
}

export function FootballWeeklySuperteamTableDialog({
  mode = "live",
  seatIndex = 1,
  onClose,
}: {
  mode?: FootballWeeklySuperteamTableMode;
  seatIndex?: number;
  onClose: () => void;
}) {
  const repository = useMemo(() => createFootballWeeklySuperteamTableRepository(), []);
  const [players, setPlayers] = useState<FootballWeeklySuperteamTablePlayer[]>([]);
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

    setLoading(true);
    setError(null);
    repository.load(mode, seatIndex)
      .then((next) => {
        if (!active) return;
        setPlayers(next);
        setExpandedProfileId(next.find((player) => player.is_current_user)?.profile_id ?? null);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Auction Table could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [mode, repository, seatIndex]);

  return (
    <div className="football-weekly-superteam-table__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="football-weekly-superteam-table__sheet"
        role="dialog"
        aria-modal="true"
        aria-label="CFB Superteam Auction Table"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <button
            className="football-weekly-superteam-table__back"
            type="button"
            onClick={onClose}
            aria-label="Back to CFB Superteam"
          >
            ← BACK
          </button>
          <div>
            <p className="eyebrow">WEEKLY AUCTION · CFB SUPERTEAM</p>
            <h2>AUCTION TABLE</h2>
            <span>Resolved rosters + bankrolls. Today’s bids stay sealed.</span>
          </div>
        </header>
        <div className="football-weekly-superteam-table__body">
          {loading ? <p className="football-weekly-superteam-table__message">Loading table…</p> : null}
          {error ? <p className="football-weekly-superteam-table__message is-error">{error}</p> : null}
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
