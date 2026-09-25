import { useEffect, useMemo, useState } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_ROUND_LABELS, type MlbPlayoffRound } from "./mlbPlayoffsConfig";
import { bracketComplete, nodeParticipants, sanitizeBracketPicks, teamById } from "./mlbBracket";
import type { MlbBracketEntry, MlbBracketNode } from "./mlbPlayoffsRepository";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import { mlbTeamAssetByName, mlbTeamLogoUrl } from "./mlbTeamAssets";
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
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading, error, saving, saveBracket, saveSeriesPick } = useMlbPlayoffs(signedIn);
  const previewMode = identity.profile?.canControlPicks === true && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [viewedProfileId, setViewedProfileId] = useState("");
  const [previewBracketSaved, setPreviewBracketSaved] = useState(false);
  const [previewSeriesPicks, setPreviewSeriesPicks] = useState<Record<string, string>>(() => Object.fromEntries(
    MLB_OWNER_PREVIEW_HUB.ownRoundPicks.map((pick) => [pick.series_id, pick.winner_team_id]),
  ));

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
  const ownSeriesPicks = new Map(
    previewMode
      ? Object.entries(previewSeriesPicks)
      : hub?.ownRoundPicks.map((pick) => [pick.series_id, pick.winner_team_id]) ?? [],
  );

  if (!signedIn) {
    return (
      <div className="page mlb-picks-page">
        <section className="page-heading"><p className="eyebrow">MLB PLAYOFFS · PICKS</p><h1>Call October</h1></section>
        <section className="surface-card mlb-state-card">
          <strong>Sign in to make playoff picks.</strong>
          <p>Your full bracket and round-by-round picks stay tied to your HQ profile.</p>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      </div>
    );
  }

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
  const worldSeriesNode = hub.bracketTemplate.nodes.find((node) => node.round === "world_series") ?? null;

  const renderBracketNode = (
    node: MlbBracketNode,
    picks: Record<string, string>,
    interactive: boolean,
  ) => {
    const [left, right] = nodeParticipants(node, picks, hub.bracketTemplate);
    const selected = picks[node.id];
    const resultClass = nodeResultClass(node, selected, winners);
    const officialWinner = winners.get(node.id) ?? null;
    const nodeLabel = node.round === "wild_card"
      ? node.label.split("·").at(-1)?.trim() ?? node.label
      : node.round === "division_series"
        ? node.label.split("·").at(-1)?.trim() ?? node.label
        : node.label;

    return (
      <article className={`surface-card mlb-bracket-node${resultClass}`} key={node.id}>
        <div className="mlb-bracket-node__topline">
          <span>{nodeLabel}</span>
          <small>{officialWinner ? "FINAL" : interactive ? "PICK WINNER" : "BRACKET PICK"}</small>
        </div>
        <div className="mlb-team-choices">
          {[left, right].map((team, index) => team ? (
            <button
              key={team.id}
              type="button"
              className={`mlb-team-choice${selected === team.id ? " is-selected" : ""}${officialWinner && officialWinner !== team.id ? " is-eliminated" : ""}`}
              disabled={!interactive || hub.bracketLocked}
              aria-pressed={selected === team.id}
              onClick={interactive ? () => {
                const next = sanitizeBracketPicks(hub.bracketTemplate, { ...draft, [node.id]: team.id });
                setDraft(next);
              } : undefined}
            >
              <div className="mlb-team-choice__main">
                {(team.logo_url ?? mlbTeamLogoUrl(team.abbreviation, team.name)) ? (
                  <span className="mlb-team-choice__mark" aria-hidden="true">
                    <img
                      className="mlb-team-choice__logo"
                      src={team.logo_url ?? mlbTeamLogoUrl(team.abbreviation, team.name) ?? undefined}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                ) : null}
                <span>{team.name}</span>
              </div>
              <small>{team.seed ? `#${team.seed}` : ""}{team.league ? ` · ${team.league}` : ""}</small>
            </button>
          ) : (
            <div className="mlb-team-choice is-tbd" key={`${node.id}:${index}`}>
              <span>TBD</span><small>ADVANCES HERE</small>
            </div>
          ))}
        </div>
      </article>
    );
  };

  const renderRaceBracket = (picks: Record<string, string>) => (
    <div className="mlb-race-bracket__viewport">
      <div className="mlb-race-bracket__track">
        {ROUND_ORDER.map((round) => {
          const nodes = hub.bracketTemplate.nodes.filter((node) => node.round === round);
          const points = nodes[0]?.points ?? 0;
          const label = round === "wild_card"
            ? "WC"
            : round === "division_series"
              ? "DS"
              : round === "championship_series"
                ? "LCS"
                : "WS";
          return (
            <section className="mlb-race-bracket__round" key={round}>
              <header><strong>{label}</strong><small>+{points}</small></header>
              <div>
                {nodes.map((node) => {
                  const pickedTeam = teamById(hub.bracketTemplate, picks[node.id]);
                  if (!pickedTeam) return null;
                  const logo = pickedTeam.logo_url ?? mlbTeamLogoUrl(pickedTeam.abbreviation, pickedTeam.name);
                  return (
                    <span className="mlb-race-bracket__pick" key={node.id}>
                      {logo ? <span aria-hidden="true"><img src={logo} alt="" loading="lazy" /></span> : null}
                      <b>{pickedTeam.name}</b>
                    </span>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page mlb-picks-page">
      <section className="mlb-picks-page__intro">
        <div>
          <p className="eyebrow">2026 MLB PLAYOFFS</p>
          <h1>Playoff Picks</h1>
        </div>
        <p>Build the bracket once. Pick each series as October moves.</p>
      </section>

      <section id="mlb-bracket" className="mlb-bracket" aria-labelledby="mlb-bracket-title">
        <header className="mlb-section-heading">
          <div><p className="eyebrow">2026 PLAYOFF BRACKET</p><h2 id="mlb-bracket-title">Your postseason path</h2></div>
          <small>{hub.bracketLocked ? "LOCKED" : hub.fieldReady ? `LOCKS ${dateTime(hub.bracketLockAt).toUpperCase()}` : "FIELD PENDING"}</small>
        </header>

        {!hub.fieldReady ? (
          <section className="surface-card mlb-state-card">
            <strong>Bracket shell ready.</strong>
            <p>The playoff field will populate here when it is official.</p>
          </section>
        ) : (
          <>
            <div className="mlb-bracket-scoring" aria-label="MLB playoff bracket scoring">
              <span><b>WC</b><strong>+1</strong></span>
              <span><b>DS</b><strong>+2</strong></span>
              <span><b>LCS</b><strong>+4</strong></span>
              <span><b>WS</b><strong>+8</strong></span>
            </div>

            {([
              ["AL", "AMERICAN LEAGUE"],
              ["NL", "NATIONAL LEAGUE"],
            ] as const).map(([league, leagueLabel]) => (
              <section className="mlb-league-bracket" key={league} aria-label={`${leagueLabel} bracket`}>
                <header>
                  <strong>{leagueLabel}</strong>
                  <span>WC <b>→</b> DS <b>→</b> LCS</span>
                </header>
                <div className="mlb-league-bracket__viewport">
                  <div className="mlb-league-bracket__track">
                    {(["wild_card", "division_series", "championship_series"] as MlbPlayoffRound[]).map((round) => {
                      const nodes = hub.bracketTemplate.nodes.filter((node) => node.round === round && node.league === league);
                      if (!nodes.length) return null;
                      const roundLabel = round === "wild_card" ? "WILD CARD" : round === "division_series" ? "DIVISION SERIES" : `${league}CS`;
                      return (
                        <section className="mlb-bracket-stage" key={round}>
                          <header>
                            <strong>{roundLabel}</strong>
                            <small>+{nodes[0]?.points ?? 0}</small>
                          </header>
                          <div className="mlb-bracket-stage__nodes">
                            {nodes.map((node) => renderBracketNode(node, draft, true))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}

            {worldSeriesNode ? (
              <section className="mlb-world-series-stage" aria-label="World Series bracket pick">
                <header><strong>WORLD SERIES</strong><small>+{worldSeriesNode.points}</small></header>
                {renderBracketNode(worldSeriesNode, draft, true)}
              </section>
            ) : null}

            {!hub.bracketLocked ? (
              <div className="mlb-bracket-actions">
                <button
                  className="primary-action"
                  type="button"
                  disabled={!complete || (!previewMode && saving === "bracket")}
                  onClick={() => {
                    if (previewMode) setPreviewBracketSaved(true);
                    else void saveBracket(draft);
                  }}
                >
                  {previewBracketSaved
                    ? "BRACKET SAVED"
                    : saving === "bracket"
                      ? "SAVING BRACKET…"
                      : hub.ownBracket ? "UPDATE BRACKET" : "SUBMIT FULL BRACKET"}
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
                  <span>{index + 1}</span> {entry.display_name} <b>{entry.score}</b>
                </button>
              ))}
            </div>

            {viewed ? (
              <details className="surface-card mlb-race-bracket">
                <summary>
                  <span>VIEW {viewed.display_name.toUpperCase()}{viewed.is_current_user ? " · YOU" : ""} BRACKET</span>
                  <strong>{viewed.score} PTS</strong>
                </summary>
                <div className="mlb-race-bracket__body">
                  <div className="mlb-race-bracket__person">
                    <strong>{viewed.display_name}{viewed.is_current_user ? " · YOU" : ""}</strong>
                    <span>{viewed.score} PTS</span>
                  </div>
                  {renderRaceBracket(viewed.picks)}
                </div>
              </details>
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
          <div><p className="eyebrow">CURRENT ROUND PICKS</p><h2 id="mlb-round-picks-title">{MLB_ROUND_LABELS[hub.currentRound]}</h2></div>
          <small>SEPARATE FROM BRACKET</small>
        </header>

        {!roundSeries.length ? (
          <section className="surface-card mlb-state-card">
            <strong>Series picks are waiting on the field.</strong>
            <p>Each matchup locks independently before that series starts.</p>
          </section>
        ) : roundSeries.map((series) => {
          const selected = ownSeriesPicks.get(series.series_id) ?? "";
          const locked = series.starts_at ? Date.now() >= Date.parse(series.starts_at) : true;
          const scheduleLabel = series.series_score
            ? `${series.series_score}${series.winner_team_id ? " · FINAL" : ""}`
            : series.schedule.length
              ? series.schedule.join(" · ")
              : "Schedule coming with the official matchup.";

          return (
            <article className={`mlb-round-series-card${locked ? " is-locked" : ""}`} key={series.series_id}>
              <header>
                <strong>{series.label}</strong>
                <b className={`mlb-round-series-card__status${locked ? " is-locked" : ""}`}>
                  {series.status === "complete" ? "FINAL" : locked ? "LOCKED" : `LOCKS ${dateTime(series.starts_at).toUpperCase()}`}
                </b>
              </header>

              <div className="mlb-round-series-card__matchup">
                {([
                  [series.team_a_id, series.team_a_name],
                  [series.team_b_id, series.team_b_name],
                ] as const).map(([teamId, teamName]) => {
                  const asset = mlbTeamAssetByName(teamName);
                  const logo = mlbTeamLogoUrl(asset?.abbreviation, teamName);
                  const isSelected = selected === teamId;
                  return (
                    <button
                      key={teamId}
                      type="button"
                      className={`mlb-round-team${isSelected ? " is-selected" : ""}${series.winner_team_id && series.winner_team_id !== teamId ? " is-eliminated" : ""}`}
                      disabled={locked || (!previewMode && saving === series.series_id)}
                      aria-pressed={isSelected}
                      onClick={() => {
                        if (previewMode) {
                          setPreviewSeriesPicks((current) => ({ ...current, [series.series_id]: teamId }));
                        } else {
                          void saveSeriesPick(series.series_id, teamId);
                        }
                      }}
                    >
                      <span className={`mlb-round-team__mark${logo ? "" : " is-empty"}`} aria-hidden="true">
                        {logo ? <img src={logo} alt="" loading="lazy" /> : null}
                      </span>
                      <span className="mlb-round-team__copy">
                        <strong>{teamName}</strong>
                        <small>{isSelected ? "✓ YOUR PICK" : "PICK SERIES WINNER"}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              <footer>
                <span>{scheduleLabel}</span>
              </footer>
            </article>
          );
        })}
      </section>

      {error && !previewMode ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
