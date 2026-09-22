import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-build-qb.css";
import {
  createFootballWeeklyBuildQbTableRepository,
  type FootballWeeklyBuildQbTablePlayer,
  type FootballWeeklyBuildQbTableTrait,
} from "../play/footballWeeklyBuildQbTableRepository";
import { buildQbTeamVisualIdentity } from "./buildQbVisualIdentity";

function TraitMark({ teamCode }: { teamCode: string }) {
  const identity = buildQbTeamVisualIdentity(teamCode);
  const [failed, setFailed] = useState(false);
  return (
    <span className="football-weekly-build-qb__mark" aria-hidden="true">
      {identity?.logoSrc && !failed ? (
        <img src={identity.logoSrc} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{teamCode}</span>
      )}
    </span>
  );
}

function TraitRow({ item }: { item: FootballWeeklyBuildQbTableTrait }) {
  return (
    <article className="football-weekly-build-qb-table__trait">
      <TraitMark teamCode={item.team_code} />
      <div>
        <small>{item.trait}</small>
        <strong>{item.display_name}</strong>
      </div>
      <span>WON ${item.price_paid}</span>
    </article>
  );
}

function PlayerRow({
  player,
  expanded,
  onToggle,
}: {
  player: FootballWeeklyBuildQbTablePlayer;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={"football-weekly-build-qb-table__player" + (player.is_current_user ? " is-current" : "")}>
      <button type="button" aria-expanded={expanded} onClick={onToggle}>
        <span>
          <strong>{player.display_name}</strong>
          {player.is_current_user ? <small>YOU</small> : null}
        </span>
        <span><strong>${player.bankroll}</strong><small>LEFT</small></span>
        <span><strong>{player.owned_count}/4</strong><small>TRAITS</small></span>
        <b aria-hidden="true">{expanded ? "−" : "+"}</b>
      </button>
      {expanded ? (
        <div className="football-weekly-build-qb-table__roster">
          {player.traits.length ? player.traits.map((item) => (
            <TraitRow key={item.trait} item={item} />
          )) : <p>No traits won yet.</p>}
        </div>
      ) : null}
    </article>
  );
}

export function FootballWeeklyBuildQbTableDialog({ onClose }: { onClose: () => void }) {
  const repository = useMemo(() => createFootballWeeklyBuildQbTableRepository(), []);
  const [players, setPlayers] = useState<FootballWeeklyBuildQbTablePlayer[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    if (!repository) {
      setError("Auction Table is unavailable right now.");
      setLoading(false);
      return () => { active = false; };
    }
    repository.load()
      .then((next) => {
        if (!active) return;
        setPlayers(next);
        setExpanded(next.find((player) => player.is_current_user)?.profile_id ?? null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Auction Table could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [repository]);

  return (
    <div className="football-weekly-build-qb-table__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="football-weekly-build-qb-table__sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Build a QB Auction Table"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <button className="football-weekly-build-qb__sheet-back" type="button" onClick={onClose} aria-label="Back to Build a QB">
            ← BACK
          </button>
          <div>
            <p className="eyebrow">WEEKLY AUCTION · BUILD A QB</p>
            <h2>AUCTION TABLE</h2>
            <span>Resolved traits + bankrolls. Today’s bids stay sealed.</span>
          </div>
        </header>
        <div className="football-weekly-build-qb-table__body">
          {loading ? <p>Loading table…</p> : null}
          {error ? <p className="is-error">{error}</p> : null}
          {!loading && !error ? players.map((player) => (
            <PlayerRow
              key={player.profile_id}
              player={player}
              expanded={expanded === player.profile_id}
              onToggle={() => setExpanded((current) => current === player.profile_id ? null : player.profile_id)}
            />
          )) : null}
        </div>
      </section>
    </div>
  );
}
