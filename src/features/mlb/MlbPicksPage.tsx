import { useEffect, useMemo, useRef, useState } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { MLB_ROUND_LABELS } from "./mlbPlayoffsConfig";
import {
  bracketComplete,
  bracketGuideNodes,
  firstBracketGuideNode,
  nextBracketGuideNode,
  nodeParticipants,
  previousBracketGuideNode,
  sanitizeBracketPicks,
} from "./mlbBracket";
import type { MlbBracketEntry, MlbBracketNode, MlbPlayoffSeries, MlbRoundPickEntry, MlbTeam } from "./mlbPlayoffsRepository";
import { MLB_OWNER_PREVIEW_CHAMPIONSHIP, MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import MlbChampionshipSummary from "./MlbChampionshipSummary";
import { MLB_CHAMPIONSHIP_SCORING, formatChampionshipPoints } from "./mlbChampionship";
import { mlbTeamAssetByName, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import { useMlbChampionship } from "./useMlbChampionship";
import "../../styles/mlb-playoffs.css";

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

function roundLabel(node: MlbBracketNode) {
  if (node.round === "wild_card") return "WILD CARD";
  if (node.round === "division_series") return node.league === "AL" ? "ALDS" : "NLDS";
  if (node.round === "championship_series") return node.league === "AL" ? "ALCS" : "NLCS";
  return "WORLD SERIES";
}

function miniNodeLabel(node: MlbBracketNode) {
  if (node.round === "wild_card") return node.label.split("·").at(-1)?.trim() ?? "WC";
  if (node.round === "division_series") return node.label.split("·").at(-1)?.trim() ?? "DS";
  return roundLabel(node);
}

function focusZone(node: MlbBracketNode | null) {
  if (!node || node.round === "world_series") return "ws";
  const league = node.league?.toLowerCase() ?? "ws";
  const round = node.round === "wild_card"
    ? "wc"
    : node.round === "division_series"
      ? "ds"
      : "lcs";
  return `${league}-${round}`;
}

function TeamMark({ team, compact = false }: { team: MlbTeam; compact?: boolean }) {
  const logo = team.logo_url ?? mlbTeamLogoUrl(team.abbreviation, team.name);
  return (
    <span className={`mlb-bracket-team-mark${compact ? " is-compact" : ""}`} aria-hidden="true">
      {logo ? <img src={logo} alt="" loading="lazy" /> : <b>{team.abbreviation.slice(0, 2)}</b>}
    </span>
  );
}


const MLB_ROUND_ORDER = ["wild_card", "division_series", "championship_series", "world_series"] as const;

function ordinalPlace(rank: number, tied = false) {
  const mod100 = rank % 100;
  const suffix = mod100 >= 11 && mod100 <= 13
    ? "TH"
    : rank % 10 === 1 ? "ST"
      : rank % 10 === 2 ? "ND"
        : rank % 10 === 3 ? "RD"
          : "TH";
  return `${tied ? "T-" : ""}${rank}${suffix}`;
}

function moneylineLabel(value: number | null | undefined) {
  if (value == null) return "TBD";
  return value > 0 ? `+${value}` : String(value);
}

function seriesLengthLabel(round: MlbBracketNode["round"]) {
  if (round === "wild_card") return "BEST OF 3";
  if (round === "division_series") return "BEST OF 5";
  return "BEST OF 7";
}

function roundDisplayLabel(round: MlbBracketNode["round"]) {
  if (round === "wild_card") return "WILD CARD";
  if (round === "division_series") return "DIVISION SERIES";
  if (round === "championship_series") return "LCS";
  return "WORLD SERIES";
}

export default function MlbPicksPage() {
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading, error, saving, saveBracket, saveSeriesPick } = useMlbPlayoffs(signedIn);
  const { championship: liveChampionship, error: championshipError } = useMlbChampionship(signedIn);
  const previewMode = identity.profile?.canControlPicks === true && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const championship = previewMode ? MLB_OWNER_PREVIEW_CHAMPIONSHIP : liveChampionship;

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [viewedProfileId, setViewedProfileId] = useState("");
  const [editingBracket, setEditingBracket] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState("");
  const [reviewExisting, setReviewExisting] = useState(false);
  const [previewBracketSaved, setPreviewBracketSaved] = useState(false);
  const [selectedRoundProfileId, setSelectedRoundProfileId] = useState("");
  const [standingsTab, setStandingsTab] = useState<"standings" | "rounds">("standings");
  const [previewSeriesPicks, setPreviewSeriesPicks] = useState<Record<string, string>>(() => Object.fromEntries(
    MLB_OWNER_PREVIEW_HUB.ownRoundPicks.map((pick) => [pick.series_id, pick.winner_team_id]),
  ));
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!hub) return;
    const initialDraft = hub.ownBracket ?? {};
    setDraft(initialDraft);
    const own = hub.brackets.find((entry) => entry.is_current_user);
    const preferred = own?.profile_id ?? hub.brackets[0]?.profile_id ?? "";
    setViewedProfileId((current) => hub.brackets.some((entry) => entry.profile_id === current) ? current : preferred);

    const complete = bracketComplete(hub.bracketTemplate, initialDraft);
    if (hub.fieldReady && !hub.bracketLocked && !complete) {
      const first = firstBracketGuideNode(hub.bracketTemplate, initialDraft, false);
      setReviewExisting(false);
      setActiveNodeId(first?.id ?? "");
      setEditingBracket(Boolean(first));
    }
  }, [hub]);

  const bracketViewers = useMemo(() => {
    if (!hub || !identity.profile) return [];
    const own = hub.brackets.find((entry) => entry.is_current_user);
    const rest = hub.brackets.filter((entry) => !entry.is_current_user);
    if (own) return [own, ...rest];

    const currentUser: MlbBracketEntry = {
      profile_id: identity.profile.id,
      display_name: identity.profile.displayName,
      score: hub.ownBracketScore,
      is_current_user: true,
      picks: hub.ownBracket ?? {},
    };
    return [currentUser, ...rest];
  }, [hub, identity.profile]);

  const winners = useMemo(
    () => new Map(hub?.series.filter((series) => series.winner_team_id).map((series) => [series.series_id, series.winner_team_id!]) ?? []),
    [hub?.series],
  );

  const viewed = bracketViewers.find((entry) => entry.profile_id === viewedProfileId) ?? bracketViewers[0] ?? null;
  const viewerIndex = viewed ? bracketViewers.findIndex((entry) => entry.profile_id === viewed.profile_id) : 0;
  const ownEntry = hub?.brackets.find((entry) => entry.is_current_user) ?? null;
  const ownRank = hub && ownEntry ? bracketRank(hub.brackets, ownEntry.profile_id) : null;
  const roundSeries = hub?.series.filter((series) => series.round === hub.currentRound) ?? [];
  const ownSeriesPicks = new Map(
    previewMode
      ? Object.entries(previewSeriesPicks)
      : hub?.ownRoundPicks.map((pick) => [pick.series_id, pick.winner_team_id]) ?? [],
  );

  const bracketStandings = useMemo(() => {
    const entries = (hub?.brackets ?? []).slice().sort((left, right) => (
      right.score - left.score
      || left.display_name.localeCompare(right.display_name)
    ));
    let priorScore: number | null = null;
    let priorRank = 0;
    const ranks = new Map<string, number>();
    entries.forEach((entry, index) => {
      const rank = priorScore === entry.score ? priorRank : index + 1;
      ranks.set(entry.profile_id, rank);
      priorScore = entry.score;
      priorRank = rank;
    });
    const rankCounts = new Map<number, number>();
    ranks.forEach((rank) => rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1));
    return entries.map((entry) => {
      const rank = ranks.get(entry.profile_id) ?? 0;
      return { entry, rank, tied: (rankCounts.get(rank) ?? 0) > 1 };
    });
  }, [hub?.brackets]);

  const championshipStandings = championship?.standings ?? [];
  const ownChampionship = championship?.own ?? null;
  const championshipPlayerCount = championshipStandings.length || Math.max(hub?.roundPickEntries.length ?? 0, bracketStandings.length);

  if (!signedIn) {
    return (
      <div className="page mlb-picks-page">
        <section className="page-heading"><p className="eyebrow">MLB PLAYOFFS · PICKS</p><h1>Playoff Picks</h1></section>
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
  const guideNodes = bracketGuideNodes(hub.bracketTemplate);
  const focusedNode = guideNodes.find((node) => node.id === activeNodeId) ?? null;
  const focusedIndex = focusedNode ? guideNodes.findIndex((node) => node.id === focusedNode.id) : -1;
  const focusedSiblings = focusedNode
    ? hub.bracketTemplate.nodes.filter((node) => node.round === focusedNode.round && node.league === focusedNode.league)
    : [];
  const focusedSiblingIndex = focusedNode ? focusedSiblings.findIndex((node) => node.id === focusedNode.id) : -1;
  const focusRow = focusedSiblings.length <= 1 ? "center" : focusedSiblingIndex === 0 ? "top" : "bottom";
  const displayedPicks = editingBracket
    ? draft
    : viewed?.is_current_user
      ? draft
      : viewed?.picks ?? draft;

  const stageNodes = (league: "AL" | "NL" | null, round: MlbBracketNode["round"]) => (
    hub.bracketTemplate.nodes.filter((node) => node.league === league && node.round === round)
  );

  const activateNode = (node: MlbBracketNode) => {
    if (hub.bracketLocked || !viewed?.is_current_user) return;
    const [left, right] = nodeParticipants(node, draft, hub.bracketTemplate);
    if (!left || !right) return;
    setReviewExisting(complete);
    setActiveNodeId(node.id);
    setEditingBracket(true);
  };

  const pickBracketWinner = (node: MlbBracketNode, teamId: string) => {
    const nextDraft = sanitizeBracketPicks(hub.bracketTemplate, { ...draft, [node.id]: teamId });
    setDraft(nextDraft);
    setPreviewBracketSaved(false);

    const next = nextBracketGuideNode(hub.bracketTemplate, nextDraft, node.id, reviewExisting);
    if (next) {
      setActiveNodeId(next.id);
      return;
    }

    setEditingBracket(false);
    setActiveNodeId("");
  };

  const startBracketGuide = () => {
    const review = complete;
    const first = firstBracketGuideNode(hub.bracketTemplate, draft, review);
    if (!first) return;
    const own = bracketViewers.find((entry) => entry.is_current_user);
    if (own) setViewedProfileId(own.profile_id);
    setReviewExisting(review);
    setActiveNodeId(first.id);
    setEditingBracket(true);
  };

  const showViewer = (offset: number) => {
    if (bracketViewers.length < 2 || editingBracket) return;
    const current = viewerIndex >= 0 ? viewerIndex : 0;
    const next = (current + offset + bracketViewers.length) % bracketViewers.length;
    setViewedProfileId(bracketViewers[next]!.profile_id);
  };

  const renderMiniNode = (node: MlbBracketNode) => {
    const [left, right] = nodeParticipants(node, displayedPicks, hub.bracketTemplate);
    const selected = displayedPicks[node.id];
    const officialWinner = winners.get(node.id) ?? null;
    const isActive = editingBracket && node.id === activeNodeId;
    const canActivate = !hub.bracketLocked && Boolean(viewed?.is_current_user) && Boolean(left && right);

    return (
      <button
        type="button"
        key={node.id}
        className={`mlb-bracket-mini-node${isActive ? " is-active" : ""}${officialWinner ? " is-final" : ""}`}
        disabled={!canActivate}
        onClick={() => activateNode(node)}
        aria-label={`${roundLabel(node)} ${left?.name ?? "TBD"} versus ${right?.name ?? "TBD"}`}
      >
        <small>{miniNodeLabel(node)}</small>
        {[left, right].map((team, index) => team ? (
          <span
            key={team.id}
            className={`mlb-bracket-mini-team${selected === team.id ? " is-picked" : ""}${officialWinner && officialWinner !== team.id ? " is-out" : ""}`}
          >
            <TeamMark team={team} compact />
            <b>{team.seed ?? "—"}</b>
            <strong>{team.abbreviation}</strong>
          </span>
        ) : (
          <span className="mlb-bracket-mini-team is-tbd" key={`${node.id}-${index}`}>
            <i />
            <b>—</b>
            <strong>TBD</strong>
          </span>
        ))}
      </button>
    );
  };

  const renderStage = (
    league: "AL" | "NL" | null,
    round: MlbBracketNode["round"],
    className: string,
    label: string,
  ) => {
    const nodes = stageNodes(league, round);
    if (!nodes.length) return null;
    return (
      <div className={`mlb-full-bracket__stage ${className}`}>
        <span className="mlb-full-bracket__stage-label">{label}</span>
        <div>{nodes.map(renderMiniNode)}</div>
      </div>
    );
  };

  const renderSeriesCard = (series: MlbPlayoffSeries) => {
    const selected = ownSeriesPicks.get(series.series_id) ?? "";
    const locked = series.starts_at ? Date.now() >= Date.parse(series.starts_at) : true;
    const completeSeries = series.status === "complete" || Boolean(series.winner_team_id);
    const assetA = mlbTeamAssetByName(series.team_a_name);
    const assetB = mlbTeamAssetByName(series.team_b_name);
    const logoA = mlbTeamLogoUrl(assetA?.abbreviation, series.team_a_name);
    const logoB = mlbTeamLogoUrl(assetB?.abbreviation, series.team_b_name);
    const abbrA = assetA?.abbreviation ?? series.team_a_name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
    const abbrB = assetB?.abbreviation ?? series.team_b_name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
    const oddsKnown = series.team_a_moneyline != null && series.team_b_moneyline != null;
    const lineLabel = oddsKnown
      ? `${abbrA} ${moneylineLabel(series.team_a_moneyline)} · ${abbrB} ${moneylineLabel(series.team_b_moneyline)}`
      : "ODDS TBD";
    const footerLabel = series.series_score
      ? `FINAL · ${series.series_score}`
      : locked
        ? "SERIES STARTED · PICK LOCKED"
        : dateTime(series.starts_at).toUpperCase();
    const statusLabel = completeSeries ? "FINAL" : locked ? "LOCKED" : "OPEN";

    return (
      <article className={`football-pick-game mlb-series-pick-card${locked ? " is-locked" : ""}`} key={series.series_id}>
        <header>
          <strong>{series.league ?? "MLB"} · {roundDisplayLabel(series.round)}</strong>
          <b className={`football-pick-game__status is-${completeSeries ? "final" : locked ? "locked" : "open"}`}>{statusLabel}</b>
        </header>
        <div className="football-pick-game__matchup">
          {([
            { id: series.team_a_id, name: series.team_a_name, logo: logoA, side: "away" as const },
            { id: series.team_b_id, name: series.team_b_name, logo: logoB, side: "home" as const },
          ]).map((team) => {
            const isSelected = selected === team.id;
            const eliminated = Boolean(series.winner_team_id && series.winner_team_id !== team.id);
            return (
              <button
                type="button"
                key={team.id}
                aria-pressed={isSelected}
                className={`football-pick-team is-${team.side}${isSelected ? " is-selected" : ""}${eliminated ? " is-eliminated" : ""}`}
                disabled={locked || completeSeries || (!previewMode && saving === series.series_id)}
                onClick={() => {
                  if (previewMode) {
                    setPreviewSeriesPicks((current) => ({ ...current, [series.series_id]: team.id }));
                  } else {
                    void saveSeriesPick(series.series_id, team.id);
                  }
                }}
              >
                <span className={`football-pick-team-mark${team.logo ? "" : " is-empty"}`} aria-hidden="true">
                  {team.logo ? <img src={team.logo} alt="" loading="lazy" /> : null}
                </span>
                <span className="football-pick-team-copy">
                  <strong>{team.name}</strong>
                  <small>{isSelected ? "✓ YOUR PICK" : "PICK SERIES WINNER"}</small>
                </span>
              </button>
            );
          })}
          <div className="football-pick-game__line">
            <small>SERIES ML</small>
            <strong>{lineLabel}</strong>
          </div>
        </div>
        <footer>
          <span>{footerLabel} · {seriesLengthLabel(series.round)}</span>
          {series.odds_source && !completeSeries ? <strong>{series.odds_source.toUpperCase()}</strong> : null}
        </footer>
      </article>
    );
  };

  return (
    <div className="page mlb-picks-page">
      <section id="mlb-bracket" className="mlb-bracket mlb-bracket--interactive" aria-labelledby="mlb-bracket-title">
        <header className="mlb-section-heading mlb-bracket__heading">
          <div><p className="eyebrow">2026 MLB PLAYOFFS</p><h2 id="mlb-bracket-title">Playoff bracket</h2></div>
          <small>{hub.bracketLocked ? "LOCKED" : hub.fieldReady ? `LOCKS ${dateTime(hub.bracketLockAt).toUpperCase()}` : "FIELD PENDING"}</small>
        </header>

        {!hub.fieldReady ? (
          <section className="surface-card mlb-state-card">
            <strong>Bracket is waiting on the field.</strong>
            <p>The official postseason teams will populate here when the field is set.</p>
          </section>
        ) : (
          <>
            <div className="surface-card mlb-bracket-shell">
              <div className="mlb-bracket-shell__person">
                <div>
                  <span>{editingBracket ? "BUILDING YOUR BRACKET" : viewed?.is_current_user ? "YOUR BRACKET" : "BRACKET"}</span>
                  <strong>{editingBracket ? identity.profile?.displayName : viewed?.display_name ?? identity.profile?.displayName}</strong>
                  <small>
                    {editingBracket
                      ? `${Math.max(0, focusedIndex + 1)} OF ${guideNodes.length} · ${roundLabel(focusedNode ?? guideNodes[0]!)}`
                      : viewed?.is_current_user
                        ? `${ownRank ? `#${ownRank} · ` : ""}${hub.ownBracketScore} PTS`
                        : `${viewed?.score ?? 0} PTS`}
                  </small>
                </div>

                {!editingBracket && bracketViewers.length > 1 ? (
                  <div className="mlb-bracket-shell__viewer-controls" aria-label="Browse submitted brackets">
                    <button type="button" onClick={() => showViewer(-1)} aria-label="Previous bracket">‹</button>
                    <span>{viewerIndex + 1} / {bracketViewers.length}</span>
                    <button type="button" onClick={() => showViewer(1)} aria-label="Next bracket">›</button>
                  </div>
                ) : null}
              </div>

              <div
                className={`mlb-full-bracket${editingBracket ? " is-guided" : ""}`}
                data-focus-zone={editingBracket ? focusZone(focusedNode) : "overview"}
                data-focus-row={editingBracket ? focusRow : "center"}
                onTouchStart={(event) => {
                  if (editingBracket) return;
                  swipeStartX.current = event.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (editingBracket || swipeStartX.current == null) return;
                  const end = event.changedTouches[0]?.clientX ?? swipeStartX.current;
                  const delta = end - swipeStartX.current;
                  swipeStartX.current = null;
                  if (Math.abs(delta) < 45) return;
                  showViewer(delta < 0 ? 1 : -1);
                }}
              >
                <div className="mlb-full-bracket__viewport">
                  <div className="mlb-full-bracket__canvas">
                    <svg className="mlb-full-bracket__lines" viewBox="0 0 700 360" aria-hidden="true">
                      <path d="M90 88 H180" />
                      <path d="M90 272 H180" />
                      <path d="M225 88 H257 V180 H292" />
                      <path d="M225 272 H257 V180 H292" />
                      <path d="M332 180 H350" />
                      <path d="M610 88 H520" />
                      <path d="M610 272 H520" />
                      <path d="M475 88 H443 V180 H408" />
                      <path d="M475 272 H443 V180 H408" />
                      <path d="M368 180 H350" />
                    </svg>

                    {renderStage("AL", "wild_card", "is-al-wc", "AL WC")}
                    {renderStage("AL", "division_series", "is-al-ds", "ALDS")}
                    {renderStage("AL", "championship_series", "is-al-lcs", "ALCS")}
                    {renderStage(null, "world_series", "is-ws", "WS")}
                    {renderStage("NL", "championship_series", "is-nl-lcs", "NLCS")}
                    {renderStage("NL", "division_series", "is-nl-ds", "NLDS")}
                    {renderStage("NL", "wild_card", "is-nl-wc", "NL WC")}
                  </div>
                </div>
              </div>

              {!editingBracket && bracketViewers.length > 1 ? (
                <div className="mlb-bracket-shell__dots" aria-hidden="true">
                  {bracketViewers.map((entry, index) => (
                    <span key={entry.profile_id} className={index === viewerIndex ? "is-active" : ""} />
                  ))}
                  <small>SWIPE BRACKETS</small>
                </div>
              ) : null}

              {editingBracket && focusedNode ? (() => {
                const [left, right] = nodeParticipants(focusedNode, draft, hub.bracketTemplate);
                const selected = draft[focusedNode.id];
                const previous = previousBracketGuideNode(hub.bracketTemplate, draft, focusedNode.id);

                return (
                  <div className="mlb-bracket-focus" aria-live="polite">
                    <div className="mlb-bracket-focus__topline">
                      <span>{focusedNode.league ? `${focusedNode.league} · ` : ""}{roundLabel(focusedNode)}</span>
                      <strong>{MLB_CHAMPIONSHIP_SCORING.bracketRound[focusedNode.round]} PT{MLB_CHAMPIONSHIP_SCORING.bracketRound[focusedNode.round] === 1 ? "" : "S"}</strong>
                    </div>
                    <div className="mlb-bracket-focus__teams">
                      {[left, right].map((team) => team ? (
                        <button
                          key={team.id}
                          type="button"
                          className={selected === team.id ? "is-selected" : ""}
                          aria-pressed={selected === team.id}
                          onClick={() => pickBracketWinner(focusedNode, team.id)}
                        >
                          <TeamMark team={team} />
                          <span><strong>{team.name}</strong><small>{team.seed ? `#${team.seed} · ` : ""}{team.league}</small></span>
                          <b>{selected === team.id ? "✓" : "PICK"}</b>
                        </button>
                      ) : null)}
                    </div>
                    <div className="mlb-bracket-focus__actions">
                      <button
                        type="button"
                        disabled={!previous}
                        onClick={() => previous && setActiveNodeId(previous.id)}
                      >← BACK</button>
                      <button type="button" onClick={() => {
                        setEditingBracket(false);
                        setActiveNodeId("");
                      }}>VIEW FULL BRACKET</button>
                    </div>
                  </div>
                );
              })() : null}

              {!editingBracket && viewed?.is_current_user && !hub.bracketLocked ? (
                <div className="mlb-bracket-shell__actions">
                  <button type="button" className="secondary-action" onClick={startBracketGuide}>
                    {complete ? "EDIT BRACKET" : "CONTINUE BRACKET"}
                  </button>
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
                        ? "SAVING…"
                        : hub.ownBracket ? "UPDATE BRACKET" : "SUBMIT BRACKET"}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>

      <details className="surface-card football-group-hub mlb-picks-group-hub" data-mlb-section="group">
        <summary className="football-group-hub__summary">
          <div className="football-group-hub__summary-copy">
            <span>PICKS &amp; STANDINGS</span>
            <small>
              {roundSeries.filter((series) => ownSeriesPicks.has(series.series_id)).length} / {roundSeries.length} SERIES PICKED
            </small>
          </div>
          <div className="football-group-hub__summary-meta">
            <strong>
              {ownChampionship
                ? `YOU · #${ownChampionship.overall_rank} · ${formatChampionshipPoints(ownChampionship.total_points)} PTS`
                : `${hub.ownBracketScore} PTS`}
            </strong>
            <small>{championshipPlayerCount} PLAYERS</small>
          </div>
        </summary>

        <div className="football-group-hub__body">
          {championship ? <MlbChampionshipSummary championship={championship} /> : null}

          <section className="football-group-hub__week mlb-group-picks" aria-label="Current round group picks">
            <details className="surface-card picks-group-progress" open>
              <summary>
                <span>GROUP PICKS</span>
                <strong>{MLB_ROUND_LABELS[hub.currentRound]}</strong>
              </summary>
              <div className="picks-group-progress__members">
                {(hub.roundPickEntries.length ? hub.roundPickEntries : bracketStandings.map(({ entry }) => ({
                  profile_id: entry.profile_id,
                  display_name: entry.display_name,
                  is_current_user: entry.is_current_user,
                  completed: 0,
                  total: roundSeries.length,
                  wins: 0,
                  losses: 0,
                  picks: {} as Record<string, string>,
                } satisfies MlbRoundPickEntry))).map((member) => {
                  const isSelected = selectedRoundProfileId === member.profile_id;
                  const laneStanding = championshipStandings.find((standing) => standing.profile_id === member.profile_id);
                  const memberPicks: Record<string, string> = member.is_current_user
                    ? Object.fromEntries(ownSeriesPicks)
                    : member.picks;
                  const revealedPicks = roundSeries.filter((series) => Boolean(memberPicks[series.series_id]));
                  const completeMember = member.total > 0 && member.completed === member.total;

                  return (
                    <div className="picks-group-progress__member" key={member.profile_id}>
                      <button
                        type="button"
                        className={`${member.is_current_user ? "is-current-user " : ""}${completeMember ? "is-complete" : ""}`}
                        aria-expanded={isSelected}
                        onClick={() => setSelectedRoundProfileId(isSelected ? "" : member.profile_id)}
                      >
                        <span className="picks-group-progress__member-status" aria-hidden="true">
                          {completeMember ? "✓" : member.display_name.trim().charAt(0).toUpperCase()}
                        </span>
                        <strong>{member.display_name}{member.is_current_user ? " · YOU" : ""}</strong>
                        <span className="football-group-live">
                          <b>
                            {laneStanding
                              ? `${formatChampionshipPoints(laneStanding.series_points)} / ${championship?.seriesMax ?? MLB_CHAMPIONSHIP_SCORING.seriesMax} · #${laneStanding.series_rank}`
                              : `${member.completed}/${member.total}`}
                          </b>
                          <small>{member.completed}/{member.total} SERIES</small>
                        </span>
                      </button>

                      {isSelected ? (
                        <section className="picks-group-progress__comparison" aria-label={`${member.display_name} series picks`}>
                          <header className="picks-group-progress__comparison-header">
                            <div>
                              <span>{member.display_name.toUpperCase()}'S PICKS</span>
                              <strong>
                                {laneStanding
                                  ? `SERIES PICKS · ${formatChampionshipPoints(laneStanding.series_points)} / ${championship?.seriesMax ?? MLB_CHAMPIONSHIP_SCORING.seriesMax} PTS`
                                  : `${member.completed}/${member.total} PICKED`}
                              </strong>
                            </div>
                          </header>
                          {!revealedPicks.length ? (
                            <div className="picks-group-progress__privacy">
                              <strong>PICKS HIDDEN</strong>
                              <p>Series picks reveal when each matchup locks.</p>
                            </div>
                          ) : (
                            <div className="picks-group-progress__comparison-list">
                              {revealedPicks.map((series, index) => {
                                const memberPickId = memberPicks[series.series_id] ?? "";
                                const myPickId = ownSeriesPicks.get(series.series_id) ?? "";
                                const memberPickName = memberPickId === series.team_a_id
                                  ? series.team_a_name
                                  : memberPickId === series.team_b_id ? series.team_b_name : "No pick";
                                const myPickName = myPickId === series.team_a_id
                                  ? series.team_a_name
                                  : myPickId === series.team_b_id ? series.team_b_name : "No pick";
                                const same = Boolean(memberPickId && myPickId && memberPickId === myPickId);
                                return (
                                  <article className={`picks-group-progress__fight ${same ? "is-same" : "is-different"}`} key={series.series_id}>
                                    <div className="picks-group-progress__matchup">
                                      <b>{index + 1}</b>
                                      <span>{series.team_a_name} vs {series.team_b_name}</span>
                                    </div>
                                    <div className="picks-group-progress__choices">
                                      <div>
                                        <small>{member.display_name}</small>
                                        <strong>{memberPickName}</strong>
                                      </div>
                                      <em>{same ? "SAME" : "DIFF"}</em>
                                      <div className="is-you">
                                        <small>YOU</small>
                                        <strong>{myPickName}</strong>
                                      </div>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </section>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </details>
          </section>

          <section className="football-group-hub__season" aria-label="MLB postseason championship standings">
            <section className="picks-history picks-season-section">
              <details className="surface-card picks-season-hub" open>
                <summary className="picks-season-hub__summary">
                  <div className="picks-season-hub__identity">
                    <span>{hub.season} MLB POSTSEASON</span>
                    <strong>{ownChampionship ? `${ownChampionship.overall_rank} OF ${championshipPlayerCount}` : `— OF ${championshipPlayerCount}`}</strong>
                    <small>
                      {ownChampionship
                        ? `${formatChampionshipPoints(ownChampionship.total_points)} / ${championship?.totalMax ?? 100} PTS · MLB CHAMPIONSHIP`
                        : "MLB CHAMPIONSHIP"}
                    </small>
                  </div>
                  <div className="picks-season-hub__meta">
                    <span>{championshipPlayerCount} PLAYERS</span>
                    <em>STANDINGS &amp; ROUNDS</em>
                  </div>
                </summary>

                <div className="picks-season-hub__body">
                  <div className="picks-season-tabs" role="tablist" aria-label="MLB postseason views">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={standingsTab === "standings"}
                      className={standingsTab === "standings" ? "is-active" : ""}
                      onClick={() => setStandingsTab("standings")}
                    >STANDINGS</button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={standingsTab === "rounds"}
                      className={standingsTab === "rounds" ? "is-active" : ""}
                      onClick={() => setStandingsTab("rounds")}
                    >ROUNDS</button>
                  </div>

                  {standingsTab === "standings" ? (
                    <section className="picks-season-standings" role="tabpanel" aria-label="MLB Championship standings">
                      <div className="picks-season-panel-heading">
                        <div><span>MLB CHAMPIONSHIP</span><strong>Postseason leaderboard</strong></div>
                        <small>100 PTS MAX</small>
                      </div>
                      {championshipStandings.length ? (
                        <div className="picks-season-standing-list">
                          {championshipStandings.map((entry) => {
                            const leaderScore = championshipStandings[0]?.total_points ?? 0;
                            const gap = Math.max(0, leaderScore - entry.total_points);
                            const progress = Math.min(100, Math.round((entry.total_points / (championship?.totalMax ?? 100)) * 100));
                            return (
                              <article
                                className={[
                                  "picks-season-standing",
                                  entry.overall_rank === 1 ? "is-leader" : "",
                                  entry.overall_rank === 2 ? "is-second" : "",
                                  entry.overall_rank === 3 ? "is-third" : "",
                                  entry.is_current_user ? "is-current-user" : "",
                                ].filter(Boolean).join(" ")}
                                key={entry.profile_id}
                              >
                                <div className="picks-season-standing__progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
                                <span className="picks-season-standing__rank">
                                  <b>{ordinalPlace(entry.overall_rank)}</b>
                                  {entry.overall_rank <= 3 ? <small>{entry.overall_rank === 1 ? "LEADER" : entry.overall_rank === 2 ? "2ND" : "3RD"}</small> : null}
                                </span>
                                <div className="picks-season-standing__identity">
                                  <div className="picks-season-standing__name">
                                    <strong>{entry.display_name}</strong>
                                    {entry.is_current_user ? <em>YOU</em> : null}
                                  </div>
                                  <small>SERIES #{entry.series_rank} · BRACKET #{entry.bracket_rank} · PLAY #{entry.play_rank}</small>
                                </div>
                                <div className="picks-season-standing__score mlb-championship-standing__score">
                                  <b>{formatChampionshipPoints(entry.total_points)} PTS</b>
                                  <em>{gap === 0 ? "LEADER" : `${formatChampionshipPoints(gap)} PTS BACK`}</em>
                                  <small>
                                    S {formatChampionshipPoints(entry.series_points)}/{championship?.seriesMax ?? 43}
                                    {" · "}B {formatChampionshipPoints(entry.bracket_points)}/{championship?.bracketMax ?? 32}
                                    {" · "}P {formatChampionshipPoints(entry.play_points)}/{championship?.playMax ?? 25}
                                  </small>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="surface-card football-picks-empty">
                          {championshipError ? "CHAMPIONSHIP STANDINGS UNAVAILABLE" : "CHAMPIONSHIP STANDINGS LOADING"}
                        </div>
                      )}
                    </section>
                  ) : (
                    <section className="mlb-postseason-rounds" role="tabpanel" aria-label="MLB bracket rounds">
                      <div className="picks-season-panel-heading">
                        <div><span>BRACKET ROUNDS</span><strong>One-time bracket scoring</strong></div>
                        <small>1 · 2 · 5 · 10</small>
                      </div>
                      {MLB_ROUND_ORDER.map((round) => {
                        const nodes = hub.bracketTemplate.nodes.filter((node) => node.round === round);
                        const pointsEach = MLB_CHAMPIONSHIP_SCORING.bracketRound[round];
                        const roundResults = hub.series.filter((series) => series.round === round && series.winner_team_id);
                        const roundRows = bracketStandings.map(({ entry }) => ({
                          entry,
                          score: roundResults.reduce((sum, series) => (
                            sum + (entry.picks[series.series_id] === series.winner_team_id ? pointsEach : 0)
                          ), 0),
                        })).sort((left, right) => right.score - left.score || left.entry.display_name.localeCompare(right.entry.display_name));
                        return (
                          <details className="mlb-round-archive" key={round} open={round === hub.currentRound ? true : undefined}>
                            <summary>
                              <div><span>{roundDisplayLabel(round)}</span><strong>{roundResults.length} / {nodes.length} FINAL</strong></div>
                              <small>+{pointsEach} EACH</small>
                            </summary>
                            <div>
                              {roundRows.map(({ entry, score }, index) => (
                                <span key={entry.profile_id} className={entry.is_current_user ? "is-you" : ""}>
                                  <b>{index + 1}</b>
                                  <strong>{entry.display_name}{entry.is_current_user ? " · YOU" : ""}</strong>
                                  <em>{score} PTS</em>
                                </span>
                              ))}
                            </div>
                          </details>
                        );
                      })}
                    </section>
                  )}
                </div>
              </details>
            </section>
          </section>
        </div>
      </details>

      <section id="mlb-round-picks" className="football-picks-slate football-picks-slate--current mlb-series-slate" data-mlb-section="current" aria-labelledby="mlb-round-picks-title">
        <header className="football-picks-section-header">
          <p className="eyebrow" id="mlb-round-picks-title">{MLB_ROUND_LABELS[hub.currentRound]} SERIES</p>
          <strong>{roundSeries.filter((series) => series.status !== "complete" && !series.winner_team_id).length} OPEN</strong>
        </header>
        {roundSeries.filter((series) => series.status !== "complete" && !series.winner_team_id).map(renderSeriesCard)}
        {!roundSeries.filter((series) => series.status !== "complete" && !series.winner_team_id).length ? (
          <div className="surface-card football-picks-empty">ALL SERIES IN THIS ROUND ARE FINAL</div>
        ) : null}

        {hub.series.some((series) => series.status === "complete" || series.winner_team_id) ? (
          <details className="football-picks-completed-drawer" data-mlb-subsection="completed">
            <summary>
              <span>COMPLETED SERIES</span>
              <strong>{hub.series.filter((series) => series.status === "complete" || series.winner_team_id).length} FINAL</strong>
            </summary>
            <div className="football-picks-completed-drawer__body">
              {hub.series.filter((series) => series.status === "complete" || series.winner_team_id).map(renderSeriesCard)}
            </div>
          </details>
        ) : null}
      </section>

      <details className="surface-card football-picks-grading mlb-picks-grading" data-mlb-section="grading">
        <summary><span>SCORING &amp; GRADING</span><strong>100-POINT CHAMPIONSHIP</strong></summary>
        <div className="football-picks-grading__body">
          <div className="football-picks-grading__scores mlb-championship-scoring__lanes" aria-label="MLB Championship scoring">
            <span><b>SERIES PICKS</b><strong>43</strong></span>
            <span><b>BRACKET</b><strong>32</strong></span>
            <span><b>PLAY</b><strong>25</strong></span>
            <span><b>TOTAL</b><strong>100</strong></span>
          </div>
          <section className="football-picks-grading__rule">
            <b>SERIES PICKS · 43 PTS</b>
            <p>WC +2 each · DS +4 · LCS +5 · World Series +9. Fresh series-winner picks lock independently.</p>
          </section>
          <section className="football-picks-grading__rule">
            <b>ONE-TIME BRACKET · 32 PTS</b>
            <p>WC +1 each · DS +2 · LCS +5 · World Series +10. Your full bracket locks before the postseason.</p>
          </section>
          <section className="football-picks-grading__rule">
            <b>PLAY · 25 PTS</b>
            <p>Ten challenges. Each awards 2.5 / 2 / 1.5 / 1 / 0.5 championship points for 1st through 5th. Ties split the occupied places.</p>
          </section>
        </div>
      </details>

      {error && !previewMode ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
