import { useEffect, useMemo, useState } from "react";
import { MLB_ROUND_LABELS, type MlbPlayoffRound } from "./mlbPlayoffsConfig";
import { bracketComplete, nodeParticipants, sanitizeBracketPicks, teamById } from "./mlbBracket";
import type { MlbBracketEntry, MlbBracketNode } from "./mlbPlayoffsRepository";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import "../../styles/mlb-playoffs.css";

const ROUND_ORDER: MlbPlayoffRound[] = [
  "wild_card",
  "division_series",
  "championship_series",
  "world_series",
];

function dateTime(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "LOCK TBD";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function bracketRank(entries: MlbBracketEntry[], profileId: string) {
  const index = entries.findIndex((entry) => entry.profile_id === profileId);
  return index >= 0 ? index + 1 : null;
}

function nodeResultClass(node: MlbBracketNode, pick: string | undefined, winners: Map<string, string>) {
  const winner = winners.get(node.id);
  if (!pick || !winner) return "";
  return pick === winner ? " is-alive" : " is-eliminated";
}

export default function MlbPicksPage() {
  const { hub, loading, error, saving, saveBracket, saveSeriesPick } = useMlbPlayoffs(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [viewedProfileId, setViewedProfileId] = useState("");

  useEffect(() => {
    if (!hub) return;
    setDraft(hub.ownBracket ?? {});
    const preferred = hub.brackets[0]?.profile_id ?? "";
    setViewedProfileId((current) => hub.brackets.some((entry) => entry.profile_id === current) ? current : preferred);
  }, [hub]);

  const winners = useMemo(
    () => new Map(hub?.series.filter((series) => series.winner_team_id).map((series) => [series.series_id, series.winner_team_id!]) ?? []),
    [hub?.series],
  );
  const viewed = hub?.brackets.find((entry) => entry.profile_id === viewedProfileId) ?? hub?.brackets[0] ?? null;
  const ownEntry = hub?.brackets.find((entry) => entry.is_current_user) ?? null;
  const ownRank = hub && ownEntry ? bracketRank(hub.brackets, ownEntry.profile_id) : null;
  const roundSeries = hub?.series.filter((series) => series.round === hub.currentRound) ?? [];
  const ownSeriesPicks = new Map(hub?.ownRoundPicks.map((pick) => [pick.series_id, pick.winner_team_id]) ?? []);

  if (loading && !hub) {
    return <div className="page mlb-picks-page"><section className="surface-card mlb-state-card"><strong>Loading MLB Playoffs…</strong></section></div>;
  }

  if (!hub) {
    return (
      <div className="page mlb-picks-page">
        <section className="page-heading"><p className="eyebrow">MLB PLAYOFFS</p><h1>Playoff Picks</h1></section>
        <section className="surface-card mlb-state-card"><strong>MLB Playoffs is being prepared.</strong><p>{error}</p></section>
      </div>
    );
  }

  const complete = bracketComplete(hub.bracketTemplate, draft);

  return (
    <div className="page mlb-picks-page">
      <section className="page-heading mlb-picks-page__intro">
        <p className="eyebrow">MLB PLAYOFFS · PICKS</p>
        <h1>Call October</h1>
        <p>One bracket before first pitch. Fresh series picks every round.</p>
      </section>

      <section id="mlb-bracket" className="mlb-bracket" aria-labelledby="mlb-bracket-title">
        <header className="mlb-section-heading">
          <div><p className="eyebrow">PLAYOFF BRACKET</p><h2 id="mlb-bracket-title">Your postseason path</h2></div>
          <small>{hub.bracketLocked ? "LOCKED" : hub.fieldReady ? `LOCKS ${dateTime(hub.bracketLockAt).toUpperCase()}` : "FIELD PENDING"}</small>
        </header>

        {!hub.fieldReady ? (
          <section className="surface-card mlb-state-card">
            <strong>Bracket shell ready.</strong>
            <p>The 2026 playoff field is still being finalized. Teams and official series will populate here without inventing matchups early.</p>
          </section>
        ) : (
          <>
            {ROUND_ORDER.map((round) => {
              const nodes = hub.bracketTemplate.nodes.filter((node) => node.round === round);
              if (!nodes.length) return null;
              const roundPoints = nodes[0]?.points ?? 0;

              return (
                <section className="mlb-bracket-round" key={round}>
                  <header><strong>{MLB_ROUND_LABELS[round]}</strong><span>+{roundPoints} EACH</span></header>
                  {nodes.map((node) => {
                    const [left, right] = nodeParticipants(node, draft, hub.bracketTemplate);
                    const selected = draft[node.id];
                    const resultClass = nodeResultClass(node, selected, winners);
                    const officialWinner = winners.get(node.id) ?? null;
                    return (
                      <article className={`surface-card mlb-bracket-node${resultClass}`} key={node.id}>
                        <div className="mlb-bracket-node__topline">
                          <span>{node.label}</span>
                          <small>{officialWinner ? "FINAL" : hub.bracketLocked ? "LIVE" : "PICK WINNER"}</small>
                        </div>
                        <div className="mlb-team-choices">
                          {[left, right].map((team, index) => team ? (
                            <button
                              key={team.id}
                              type="button"
                              className={`mlb-team-choice${selected === team.id ? " is-selected" : ""}${officialWinner && officialWinner !== team.id ? " is-eliminated" : ""}`}
                              disabled={hub.bracketLocked}
                              aria-pressed={selected === team.id}
                              onClick={() => {
                                const next = sanitizeBracketPicks(hub.bracketTemplate, { ...draft, [node.id]: team.id });
                                setDraft(next);
                              }}
                            >
                              <span>{team.name}</span>
                              <small>{team.seed ? `#${team.seed} ` : ""}{team.league ?? node.league ?? ""}</small>
                            </button>
                          ) : (
                            <div className="mlb-team-choice" key={`${node.id}:${index}`}>
                              <span>TBD</span><small>ADVANCES HERE</small>
                            </div>
                          ))}
                        </div>
                        {officialWinner && selected ? (
                          <p className="mlb-series-card__result">
                            {selected === officialWinner ? "✓ Pick survived" : "✕ Pick eliminated"} · Official: {teamById(hub.bracketTemplate, officialWinner)?.name ?? officialWinner}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </section>
              );
            })}

            {!hub.bracketLocked ? (
              <div className="mlb-bracket-actions">
                <button
                  className="primary-action"
                  type="button"
                  disabled={!complete || saving === "bracket"}
                  onClick={() => void saveBracket(draft)}
                >
                  {saving === "bracket" ? "SAVING BRACKET…" : hub.ownBracket ? "UPDATE FULL BRACKET" : "SUBMIT FULL BRACKET"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section id="mlb-bracket-race" className="mlb-race" aria-labelledby="mlb-race-title">
        <header className="mlb-section-heading">
          <div><p className="eyebrow">BRACKET RACE</p><h2 id="mlb-race-title">October standings</h2></div>
          <small>{ownRank ? `YOU · #${ownRank} · ${hub.ownBracketScore} PTS` : `${hub.ownBracketScore} PTS`}</small>
        </header>

        {hub.brackets.length ? (
          <>
            <div className="mlb-race-strip" role="group" aria-label="View submitted brackets">
              {hub.brackets.map((entry, index) => (
                <button
                  key={entry.profile_id}
                  type="button"
                  className={viewed?.profile_id === entry.profile_id ? "is-active" : ""}
                  onClick={() => setViewedProfileId(entry.profile_id)}
                >
                  {index + 1}. {entry.display_name} · {entry.score}
                </button>
              ))}
            </div>
            {viewed ? (
              <article className="surface-card mlb-viewed-bracket">
                <div className="mlb-viewed-bracket__summary">
                  <strong>{viewed.display_name}{viewed.is_current_user ? " · YOU" : ""}</strong>
                  <span>{viewed.score} PTS</span>
                </div>
                <div className="mlb-viewed-bracket__picks">
                  {hub.bracketTemplate.nodes.map((node) => {
                    const pickedTeam = teamById(hub.bracketTemplate, viewed.picks[node.id]);
                    if (!pickedTeam) return null;
                    const officialWinner = winners.get(node.id);
                    return (
                      <p key={node.id}>
                        <span>{node.label}</span>
                        <strong className={officialWinner && officialWinner !== pickedTeam.id ? "is-eliminated" : ""}>
                          {pickedTeam.name}
                        </strong>
                      </p>
                    );
                  })}
                </div>
              </article>
            ) : null}
          </>
        ) : (
          <section className="surface-card mlb-state-card">
            <strong>No brackets submitted yet.</strong>
            <p>The race appears here as brackets are locked in.</p>
          </section>
        )}
      </section>

      <section id="mlb-round-picks" className="mlb-round-picks" aria-labelledby="mlb-round-picks-title">
        <header className="mlb-section-heading">
          <div><p className="eyebrow">ROUND-BY-ROUND PICKS &amp; PLAY</p><h2 id="mlb-round-picks-title">{MLB_ROUND_LABELS[hub.currentRound]}</h2></div>
          <small>FRESH PICKS · SEPARATE FROM BRACKET</small>
        </header>

        {!roundSeries.length ? (
          <section className="surface-card mlb-state-card">
            <strong>Series picks are waiting on the field.</strong>
            <p>Each matchup will lock independently before that series starts.</p>
          </section>
        ) : roundSeries.map((series) => {
          const selected = ownSeriesPicks.get(series.series_id) ?? "";
          const locked = series.starts_at ? Date.now() >= Date.parse(series.starts_at) : true;
          return (
            <article className="surface-card mlb-series-card" key={series.series_id}>
              <div className="mlb-series-card__topline">
                <span>{series.label}</span>
                <small className="mlb-series-card__status">
                  {series.status === "complete" ? "FINAL" : locked ? "LOCKED" : `LOCKS ${dateTime(series.starts_at).toUpperCase()}`}
                </small>
              </div>
              <div className="mlb-team-choices">
                {[
                  [series.team_a_id, series.team_a_name],
                  [series.team_b_id, series.team_b_name],
                ].map(([teamId, teamName]) => (
                  <button
                    key={teamId}
                    type="button"
                    className={`mlb-team-choice${selected === teamId ? " is-selected" : ""}${series.winner_team_id && series.winner_team_id !== teamId ? " is-eliminated" : ""}`}
                    disabled={locked || saving === series.series_id}
                    aria-pressed={selected === teamId}
                    onClick={() => void saveSeriesPick(series.series_id, teamId)}
                  >
                    <span>{teamName}</span>
                    <small>{selected === teamId ? "YOUR PICK" : "PICK SERIES WINNER"}</small>
                  </button>
                ))}
              </div>
              <p className="mlb-series-card__result">
                {series.series_score
                  ? `${series.series_score}${series.winner_team_id ? " · FINAL" : ""}`
                  : series.schedule.length
                    ? series.schedule.join(" · ")
                    : "Schedule details coming with the official matchup."}
              </p>
            </article>
          );
        })}
      </section>

      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
