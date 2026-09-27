import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { footballWeeklySuperteamIdentity } from "../back-room/footballWeeklySuperteamVisualIdentity";
import FootballPushControl from "../picks-control/FootballPushControl";
import { createPickControlRepository } from "../picks-control/pickControlRepository";
import type { FootballMatchupBreakdown, FootballMatchupRichTextPart } from "./footballMatchupBreakdowns";
import { footballDateTimeLabel } from "./footballTime";
import { usePicks } from "./PicksProvider";

function MatchupRichText({ parts }: { parts: FootballMatchupRichTextPart[] }) {
  return (
    <>
      {parts.map((part, index) => {
        const copy = part.emphasis ? <strong>{part.text}</strong> : part.text;
        return part.href ? (
          <a
            className="football-matchup-breakdown-inline-link"
            href={part.href}
            target="_blank"
            rel="noreferrer"
            key={`${part.text}-${index}`}
          >
            {copy}
          </a>
        ) : <span key={`${part.text}-${index}`}>{copy}</span>;
      })}
    </>
  );
}

function CompactMatchupHeader({
  breakdown,
  onClose,
}: {
  breakdown: FootballMatchupBreakdown;
  onClose: () => void;
}) {
  const [away, home] = breakdown.teams;
  const awayIdentity = footballWeeklySuperteamIdentity(away.name);
  const homeIdentity = footballWeeklySuperteamIdentity(home.name);
  const rankingSource = breakdown.compact?.rankingSource ?? "AP";
  const style = {
    "--football-matchup-away": awayIdentity.primary,
    "--football-matchup-away-rgb": awayIdentity.primaryRgb,
    "--football-matchup-home": homeIdentity.primary,
    "--football-matchup-home-rgb": homeIdentity.primaryRgb,
  } as CSSProperties;

  function Team({
    team,
    identity,
    side,
  }: {
    team: FootballMatchupBreakdown["teams"][number];
    identity: ReturnType<typeof footballWeeklySuperteamIdentity>;
    side: "away" | "home";
  }) {
    return (
      <div className={`football-matchup-breakdown-feature-team is-${side}`}>
        <span className="football-matchup-breakdown-feature-team__logo" aria-hidden="true">
          {identity.logoSrc ? <img src={identity.logoSrc} alt="" /> : <b>{identity.code}</b>}
        </span>
        <div>
          {team.sportsReferenceUrl ? (
            <a href={team.sportsReferenceUrl} target="_blank" rel="noreferrer">{team.name}</a>
          ) : <strong>{team.name}</strong>}
          <span>
            {team.rank ? <b>{rankingSource} #{team.rank}</b> : <b>{rankingSource} NR</b>}
            {team.record ? <> · {team.record}</> : null}
          </span>
        </div>
      </div>
    );
  }

  return (
    <header className="football-matchup-breakdown-sheet__header is-compact" style={style}>
      <div className="football-matchup-breakdown-feature">
        <p className="eyebrow">THE HQ · MATCHUP BREAKDOWN</p>
        <h2 id="football-matchup-breakdown-title">{breakdown.compact ? breakdown.title : breakdown.title}</h2>
        <div className="football-matchup-breakdown-feature__teams">
          <Team team={away} identity={awayIdentity} side="away" />
          <b className="football-matchup-breakdown-feature__at">AT</b>
          <Team team={home} identity={homeIdentity} side="home" />
        </div>
        <p className="football-matchup-breakdown-feature__meta">
          {breakdown.kickoffAt ? footballDateTimeLabel(breakdown.kickoffAt) : null}
          {breakdown.kickoffAt && breakdown.venue ? " · " : null}
          {breakdown.venue}
        </p>
      </div>
      <button type="button" aria-label="Close matchup breakdown" onClick={onClose}>×</button>
    </header>
  );
}

export function FootballMatchupBreakdowns({
  breakdowns,
  requestedBreakdownId = null,
}: {
  breakdowns: FootballMatchupBreakdown[];
  requestedBreakdownId?: string | null;
}) {
  const picks = usePicks();
  const footballEvent = picks.event?.sport === "football" ? picks.event : null;
  const canControl = footballEvent?.canControl === true;
  const controlRepository = useMemo(() => (
    canControl ? createPickControlRepository() : null
  ), [canControl]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const handledRequestedId = useRef<string | null>(null);
  const deepLinkedBreakdownId = requestedBreakdownId
    ?? (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("matchup"));
  const active = useMemo(
    () => breakdowns.find((breakdown) => breakdown.id === activeId) ?? null,
    [activeId, breakdowns],
  );

  useEffect(() => {
    if (!deepLinkedBreakdownId || handledRequestedId.current === deepLinkedBreakdownId) return;
    if (!breakdowns.some((breakdown) => breakdown.id === deepLinkedBreakdownId)) return;
    handledRequestedId.current = deepLinkedBreakdownId;
    setActiveId(deepLinkedBreakdownId);
  }, [breakdowns, deepLinkedBreakdownId]);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    const bodyOverflow = document.body.style.overflow;
    const documentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = documentOverflow;
    };
  }, [active]);

  if (!breakdowns.length && !canControl) return null;

  const modal = active ? createPortal(
    <div className="football-matchup-breakdown-backdrop" role="presentation" onMouseDown={() => setActiveId(null)}>
      <section
        className="football-matchup-breakdown-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="football-matchup-breakdown-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {active.compact ? (
          <CompactMatchupHeader breakdown={active} onClose={() => setActiveId(null)} />
        ) : (
          <header className="football-matchup-breakdown-sheet__header">
            <div>
              <p className="eyebrow">THE HQ · MATCHUP BREAKDOWN</p>
              <h2 id="football-matchup-breakdown-title">{active.title}</h2>
              <p>{active.venue}</p>
            </div>
            <button type="button" aria-label="Close matchup breakdown" onClick={() => setActiveId(null)}>×</button>
          </header>
        )}

        {breakdowns.length > 1 ? (
          <nav className={`football-matchup-breakdown-tabs${active.compact ? " is-compact" : ""}`} aria-label="Featured matchup breakdowns">
            {breakdowns.map((breakdown) => (
              <button
                type="button"
                key={breakdown.id}
                aria-pressed={breakdown.id === active.id}
                onClick={() => setActiveId(breakdown.id)}
              >
                {breakdown.title}
              </button>
            ))}
          </nav>
        ) : null}

        {active.compact ? (
          <div className="football-matchup-breakdown-sheet__body football-matchup-breakdown-sheet__body--compact">
            <section className="football-matchup-breakdown-compact-section is-setup">
              <h3>THE SETUP</h3>
              <p><MatchupRichText parts={active.compact.setup} /></p>
            </section>

            <section className="football-matchup-breakdown-compact-section is-things">
              <h3>3 THINGS THAT MATTER</h3>
              <div className="football-matchup-breakdown-compact-things">
                {active.compact.things.map((thing, index) => (
                  <article key={thing.title}>
                    <span>{index + 1}</span>
                    <div>
                      <h4>{thing.title}</h4>
                      <p><MatchupRichText parts={thing.body} /></p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="football-matchup-breakdown-compact-section is-bottom-line">
              <h3>THE BOTTOM LINE</h3>
              <p><MatchupRichText parts={active.compact.bottomLine} /></p>
            </section>
          </div>
        ) : (
          <div className="football-matchup-breakdown-sheet__body">
            <section>
              <h3>THE SETUP</h3>
              {(active.setup ?? []).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            <section>
              <h3>3 MATCHUPS THAT DECIDE IT</h3>
              <div className="football-matchup-breakdown-battles">
                {(active.keyMatchups ?? []).map((matchup, index) => (
                  <article key={matchup.title}>
                    <h4>{index + 1}. {matchup.title}</h4>
                    <p>{matchup.body}</p>
                    <strong>ADVANTAGE: {matchup.edge}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3>HOW EACH TEAM WINS</h3>
              <div className="football-matchup-breakdown-grid">
                {(active.pathsToWin ?? []).map((path) => (
                  <article key={path.team}>
                    <h4>HOW {path.team.toUpperCase()} WINS</h4>
                    <p>{path.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3>PLAYERS TO WATCH</h3>
              <div className="football-matchup-breakdown-grid">
                {(active.playersToWatch ?? []).map((group) => (
                  <article key={group.team}>
                    <h4>{group.team.toUpperCase()}</h4>
                    <div className="football-matchup-breakdown-players">
                      {group.players.map((player) => (
                        <div key={player.name}>
                          <strong>{player.name} · {player.position}</strong>
                          <p>{player.body}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h3>THE HQ EDGE</h3>
              <div className="football-matchup-breakdown-edges">
                {(active.unitEdges ?? []).map((unit) => (
                  <article key={unit.title}>
                    <h4>{unit.title}</h4>
                    <strong>EDGE: {unit.edge}</strong>
                    <p>{unit.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {active.videos?.length ? (
              <section>
                <h3>WATCH</h3>
                <div className="football-matchup-breakdown-videos">
                  {active.videos.map((video) => (
                    <a key={video.url} href={video.url} target="_blank" rel="noreferrer">
                      <span>{video.title}</span><strong>YOUTUBE ↗</strong>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}

      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      {breakdowns.length ? (
        <button
          type="button"
          className="football-matchup-breakdown-entry"
          onClick={() => setActiveId(breakdowns[0].id)}
        >
          MATCHUP BREAKDOWN{breakdowns.length > 1 ? "S" : ""}
        </button>
      ) : null}
      {canControl && footballEvent ? (
        <FootballPushControl eventId={footballEvent.eventId} repository={controlRepository} />
      ) : null}
      {modal}
    </>
  );
}
