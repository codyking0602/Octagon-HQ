import { useEffect, useState } from "react";
import {
  createFootballWeeklyContentRepository,
  nextFootballEditorialTuesday,
  type FootballWeeklyContentPackage,
  type FootballWeeklyContentRepository,
} from "../home/footballWeeklyContentRepository";
import "../../styles/football-weekly-editorial-control.css";

type Sport = "cfb" | "nfl";
type PendingSelection = { playerId: string; gameId: string };
const sports: readonly Sport[] = ["cfb", "nfl"];

function errorText(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Weekly editorial choices could not be saved.";
}

export default function FootballWeeklyEditorialControl({
  repository: suppliedRepository,
  now = new Date(),
}: {
  repository?: FootballWeeklyContentRepository | null;
  now?: Date;
}) {
  const [repository] = useState<FootballWeeklyContentRepository | null>(() => (
    suppliedRepository === undefined ? createFootballWeeklyContentRepository() : suppliedRepository
  ));
  const [weekOf] = useState(() => nextFootballEditorialTuesday(now));
  const [content, setContent] = useState<FootballWeeklyContentPackage | null>(null);
  const [selections, setSelections] = useState<Record<Sport, PendingSelection>>({
    cfb: { playerId: "", gameId: "" }, nfl: { playerId: "", gameId: "" },
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Sport | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    if (!repository) {
      setError("Football editorial storage is not available.");
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    void repository.load(weekOf).then((next) => {
      if (!active) return;
      setContent(next);
      setError("");
      setSelections({
        cfb: { playerId: next?.choices.cfb?.player.id ?? "", gameId: next?.choices.cfb?.game.id ?? "" },
        nfl: { playerId: next?.choices.nfl?.player.id ?? "", gameId: next?.choices.nfl?.game.id ?? "" },
      });
    }).catch((nextError) => {
      if (active) setError(errorText(nextError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [repository, weekOf]);

  async function approve(sport: Sport) {
    if (!repository || busy) return;
    const { playerId, gameId } = selections[sport];
    if (!playerId || !gameId) return;
    setBusy(sport);
    setError("");
    setNotice("");
    try {
      const next = await repository.selectChoices(weekOf, sport, playerId, gameId);
      setContent(next);
      setNotice(sport.toUpperCase() + " selections saved for " + weekOf + ".");
    } catch (nextError) {
      setError(errorText(nextError));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="surface-card football-editorial" aria-label="Football weekly editorial approval">
      <div className="football-editorial__header">
        <div>
          <p className="eyebrow">FOOTBALL WEEKLY EDITORIAL</p>
          <h2>Approve featured content</h2>
          <p>Week of {weekOf} · Tuesday midnight Central</p>
        </div>
        <span className="football-editorial__status">DRAFT ONLY</span>
      </div>
      <p className="football-editorial__explain">
        Choose one featured player and one Game of the Week for each sport.
        Your selections are saved for production, not published early.
      </p>
      {loading ? <p role="status">Loading editorial selections…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {!loading ? sports.map((sport) => {
        const candidates = content?.proposals[sport];
        const saved = content?.choices[sport];
        const chosen = selections[sport];
        return (
          <div className="football-editorial__sport" key={sport}>
            <div className="football-editorial__sport-heading">
              <h3>{sport === "cfb" ? "College Football" : "NFL"}</h3>
              <span>{content?.production[sport] ? "EDITORIAL PREPARED" : saved ? "SELECTIONS SAVED" : candidates ? "READY TO SELECT" : "AWAITING RECOMMENDATIONS"}</span>
            </div>
            {candidates ? (
              <>
                <fieldset className="football-editorial__group" disabled={Boolean(busy) || content?.status !== "draft"}>
                  <legend>Player Spotlight</legend>
                  <div className="football-editorial__options">
                    {candidates.players.map((candidate) => (
                      <label className={chosen.playerId === candidate.id ? "football-editorial__option is-selected" : "football-editorial__option"} key={candidate.id}>
                        <input
                          type="radio"
                          name={sport + "-featured-player"}
                          checked={chosen.playerId === candidate.id}
                          onChange={() => setSelections((current) => ({
                            ...current, [sport]: { ...current[sport], playerId: candidate.id },
                          }))}
                        />
                        <span><strong>{candidate.name}</strong><small>{candidate.team} · {candidate.position} — {candidate.summary}</small></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="football-editorial__group" disabled={Boolean(busy) || content?.status !== "draft"}>
                  <legend>Game of the Week</legend>
                  <div className="football-editorial__options">
                    {candidates.games.map((candidate) => (
                      <label className={chosen.gameId === candidate.id ? "football-editorial__option is-selected" : "football-editorial__option"} key={candidate.id}>
                        <input
                          type="radio"
                          name={sport + "-featured-game"}
                          checked={chosen.gameId === candidate.id}
                          onChange={() => setSelections((current) => ({
                            ...current, [sport]: { ...current[sport], gameId: candidate.id },
                          }))}
                        />
                        <span><strong>{candidate.away_team} at {candidate.home_team}</strong><small>{candidate.summary}</small></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button
                  className="primary-action football-editorial__save"
                  type="button"
                  disabled={Boolean(busy) || content?.status !== "draft" || !chosen.playerId || !chosen.gameId}
                  onClick={() => void approve(sport)}
                >
                  {busy === sport ? "SAVING…" : saved ? "UPDATE " + sport.toUpperCase() + " PICKS" : "SAVE " + sport.toUpperCase() + " PICKS"}
                </button>
                {saved ? <p className="football-editorial__saved">Saved: {saved.player.name} · {saved.game.away_team} at {saved.game.home_team}</p> : null}
                {content?.production[sport] ? <p className="football-editorial__saved">Four-stat Spotlight, matchup editorial, and image asset references prepared for production. Publication remains separate.</p> : null}
              </>
            ) : (
              <p className="football-editorial__waiting">
                Five player and five matchup recommendations will appear when staged.
              </p>
            )}
          </div>
        );
      }) : null}
      <p className="football-editorial__footnote">
        Tuesday 12:00 AM Central is the locked future release time. Phase 2 saves choices only;
        image preparation and publication follow in later phases.
      </p>
    </section>
  );
}
