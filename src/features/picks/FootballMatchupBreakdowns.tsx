import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FootballMatchupBreakdown } from "./footballMatchupBreakdowns";

export function FootballMatchupBreakdowns({
  breakdowns,
  requestedBreakdownId = null,
}: {
  breakdowns: FootballMatchupBreakdown[];
  requestedBreakdownId?: string | null;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const handledRequestedId = useRef<string | null>(null);
  const active = useMemo(
    () => breakdowns.find((breakdown) => breakdown.id === activeId) ?? null,
    [activeId, breakdowns],
  );

  useEffect(() => {
    if (!requestedBreakdownId || handledRequestedId.current === requestedBreakdownId) return;
    if (!breakdowns.some((breakdown) => breakdown.id === requestedBreakdownId)) return;
    handledRequestedId.current = requestedBreakdownId;
    setActiveId(requestedBreakdownId);
  }, [breakdowns, requestedBreakdownId]);

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

  if (!breakdowns.length) return null;

  const modal = active ? createPortal(
    <div className="football-matchup-breakdown-backdrop" role="presentation" onMouseDown={() => setActiveId(null)}>
      <section
        className="football-matchup-breakdown-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="football-matchup-breakdown-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="football-matchup-breakdown-sheet__header">
          <div>
            <p className="eyebrow">THE HQ · MATCHUP BREAKDOWN</p>
            <h2 id="football-matchup-breakdown-title">{active.title}</h2>
            <p>{active.venue}</p>
          </div>
          <button type="button" aria-label="Close matchup breakdown" onClick={() => setActiveId(null)}>×</button>
        </header>

        {breakdowns.length > 1 ? (
          <nav className="football-matchup-breakdown-tabs" aria-label="Featured matchup breakdowns">
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

        <div className="football-matchup-breakdown-sheet__body">
          <section>
            <h3>THE SETUP</h3>
            {active.setup.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>

          <section>
            <h3>3 MATCHUPS THAT DECIDE IT</h3>
            <div className="football-matchup-breakdown-battles">
              {active.keyMatchups.map((matchup, index) => (
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
              {active.pathsToWin.map((path) => (
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
              {active.playersToWatch.map((group) => (
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
              {active.unitEdges.map((unit) => (
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
      </section>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <button
        type="button"
        className="football-matchup-breakdown-entry"
        onClick={() => setActiveId(breakdowns[0].id)}
      >
        MATCHUP BREAKDOWN{breakdowns.length > 1 ? "S" : ""}
      </button>
      {modal}
    </>
  );
}
