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
import type { MlbBracketEntry, MlbBracketNode, MlbTeam } from "./mlbPlayoffsRepository";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";
import { mlbTeamAssetByName, mlbTeamLogoUrl } from "./mlbTeamAssets";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
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

export default function MlbPicksPage() {
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading, error, saving, saveBracket, saveSeriesPick } = useMlbPlayoffs(signedIn);
  const previewMode = identity.profile?.canControlPicks === true && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [viewedProfileId, setViewedProfileId] = useState("");
  const [editingBracket, setEditingBracket] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState("");
  const [reviewExisting, setReviewExisting] = useState(false);
  const [previewBracketSaved, setPreviewBracketSaved] = useState(false);
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
                      <strong>{focusedNode.points} PT{focusedNode.points === 1 ? "" : "S"}</strong>
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

              <footer><span>{scheduleLabel}</span></footer>
            </article>
          );
        })}
      </section>

      {error && !previewMode ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
