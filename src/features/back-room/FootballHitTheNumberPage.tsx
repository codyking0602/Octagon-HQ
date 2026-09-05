import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProfileChallengeMatch } from "../challenges/challengeRuntime";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import { GameResultActions } from "../play/GameResultActions";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  FOOTBALL_HIT_THE_NUMBER_GAME_ID,
  createFootballHitTheNumberPlan,
  createFootballHitTheNumberRun,
  footballHitTheNumberActiveProgressionSlot,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
  type FootballHitTheNumberBoardType,
  type FootballHitTheNumberPlan,
  type FootballHitTheNumberResult,
  type FootballHitTheNumberRun,
} from "./footballHitTheNumberModel";
import { footballHitTheNumberPeakSeasons } from "./footballHitTheNumberPeakSeasonContext";
import { footballSubjectAsset } from "./footballSubjectAssets";
import {
  asChallengeJson,
  challengeRecord,
  challengeString,
  footballChallengeUrl,
  footballCuratedIdentity,
} from "./footballChallengeRuntime";

const footballHitNumberTheme = {
  "--ufc-red-strong": "var(--football-accent)",
} as CSSProperties;

const selectedFootballCardStyle = {
  borderColor: "rgba(var(--football-accent-rgb), .7)",
  background: "rgba(var(--football-accent-rgb), .14)",
} as CSSProperties;

const activeFootballSlotStyle = {
  borderColor: "rgba(var(--football-accent-rgb), .78)",
  background: "rgba(var(--football-accent-rgb), .14)",
  boxShadow: "inset 3px 0 0 var(--football-accent)",
} as CSSProperties;

function resultTitle(result: FootballHitTheNumberResult) {
  if (result.status === "perfect") return "PERFECT";
  if (result.status === "bust") return "BUST";
  return `${formatDistance(result.distance)} OFF`;
}

function resultDetail(result: FootballHitTheNumberResult) {
  if (result.status === "perfect") return `You hit ${formatDistance(result.target)} exactly.`;
  if (result.status === "bust") return `You went over by ${formatDistance(result.distance)}.`;
  return `You finished ${formatDistance(result.distance)} below the target.`;
}

function formatDistance(value: number) {
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
}

function boardType(value: string | null): FootballHitTheNumberBoardType | null {
  return value === "open-roster" || value === "random-pool" ? value : null;
}

function isSlotProgression(plan: FootballHitTheNumberPlan) {
  return plan.formatId === "one-from-each" || plan.formatId === "build-the-team";
}

function choiceNoun(kind: string | undefined) {
  if (kind === "team-season" || kind === "program" || kind === "program-era") return "team";
  if (kind === "player-season" || kind === "player-career") return "player";
  return "pick";
}

function pluralChoiceNoun(noun: string) {
  return noun === "team" ? "teams" : noun === "player" ? "players" : "choices";
}

function subjectDisplayName(subject: NonNullable<ReturnType<typeof getFootballHitTheNumberSubject>>) {
  if (subject.kind !== "team-season" || subject.season == null) return subject.name;
  return subject.name.replace(new RegExp(`^${subject.season}\\s+`), "");
}

function subjectDisplaySubtitle(
  subject: NonNullable<ReturnType<typeof getFootballHitTheNumberSubject>>,
  metricId: FootballHitTheNumberPlan["metricId"],
) {
  if (subject.kind === "team-season" && subject.season != null) {
    return `${subject.season} season${subject.nationalChampion ? " · National champion" : ""}`;
  }
  if (subject.group === "cfb-player-peak" && metricId.startsWith("cfb-best-season-")) {
    const seasons = footballHitTheNumberPeakSeasons(subject.id, metricId);
    if (seasons.length > 0) {
      return `${subject.position ?? "Player"} · ${seasons.join("/")} peak college season${seasons.length > 1 ? "s" : ""}`;
    }
  }
  return subject.subtitle;
}

function activeProgressionSlot(plan: FootballHitTheNumberPlan, selectedSubjectIds: readonly string[]) {
  return footballHitTheNumberActiveProgressionSlot(plan, selectedSubjectIds);
}

function availableProgressionSubjectIds(plan: FootballHitTheNumberPlan, selectedSubjectIds: readonly string[]) {
  return footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedSubjectIds);
}

function resolveChallengeRun(
  seed: string | null,
  requestedBoardType: FootballHitTheNumberBoardType | null,
  challengeId: string,
): FootballHitTheNumberRun | null {
  if (!seed || !requestedBoardType) return null;
  try {
    const plan = createFootballHitTheNumberPlan(seed, requestedBoardType);
    return {
      plan,
      identity: footballCuratedIdentity(
        FOOTBALL_HIT_THE_NUMBER_GAME_ID,
        challengeId,
        [`${plan.domainId}:${plan.metricId}:${plan.formatId}:${plan.target}`],
        requestedBoardType,
        requestedBoardType === "random-pool" ? plan.subjectIds : [],
      ),
    };
  } catch {
    return null;
  }
}

function SubjectMark({ subjectId, className }: { subjectId: string; className: string }) {
  const asset = footballSubjectAsset(subjectId);
  const subject = getFootballHitTheNumberSubject(subjectId);
  if (!asset) {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{ display: "grid", placeItems: "center", background: "rgba(255,255,255,.05)", fontSize: ".58rem", fontWeight: 950 }}
      >
        {subject?.group.toUpperCase() ?? "FB"}
      </span>
    );
  }
  return (
    <img
      alt=""
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={asset.src}
      title={asset.label}
      style={{ objectFit: "contain", padding: 4, background: "rgba(255,255,255,.04)" }}
    />
  );
}

export default function FootballHitTheNumberPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { beginChallenge } = usePlayChallenges();
  const profileMatch = useProfileChallengeMatch("hit-the-number");
  const profileSetup = challengeRecord(profileMatch.challenge?.setup);
  const profileSeed = challengeString(profileSetup?.seed);
  const profileBoardType = boardType(challengeString(profileSetup?.boardType));
  const querySeed = searchParams.get("seed");
  const queryBoardType = boardType(searchParams.get("board"));
  const sharedChallengeId = profileMatch.challenge?.code ?? `shared:${querySeed ?? "unknown"}:${queryBoardType ?? "unknown"}`;
  const sharedRun = useMemo(() => (
    resolveChallengeRun(profileSeed, profileBoardType, sharedChallengeId)
      ?? resolveChallengeRun(querySeed, queryBoardType, sharedChallengeId)
  ), [profileSeed, profileBoardType, querySeed, queryBoardType, sharedChallengeId]);
  const [run, setRun] = useState<FootballHitTheNumberRun>(() => sharedRun ?? createFootballHitTheNumberRun());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<FootballHitTheNumberResult | null>(null);
  const [challengeStatus, setChallengeStatus] = useState("");
  const plan = run.plan;
  const selectionValid = footballHitTheNumberSelectionSatisfies(plan, selectedIds);
  const shared = run.identity.type === "curated";
  const slotProgression = isSlotProgression(plan);
  const activeSlot = activeProgressionSlot(plan, selectedIds);
  const availableSubjectIds = availableProgressionSubjectIds(plan, selectedIds);
  const displayedSubjectIds = result || !slotProgression ? plan.subjectIds : availableSubjectIds;
  const representativeSubject = getFootballHitTheNumberSubject(
    availableSubjectIds[0] ?? plan.subjectIds[0] ?? "",
  );
  const poolNoun = choiceNoun(representativeSubject?.kind);
  const poolPlural = pluralChoiceNoun(poolNoun);
  const ready = selectionValid;
  const fullButInvalid = selectedIds.length === plan.pickCount && !selectionValid;

  useEffect(() => {
    if (!sharedRun || run.identity.challengeId === sharedRun.identity.challengeId) return;
    setRun(sharedRun);
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
  }, [run.identity.challengeId, sharedRun]);

  function toggleSubject(subjectId: string) {
    if (result) return;
    setSelectedIds((current) => {
      if (current.includes(subjectId)) {
        if (slotProgression) {
          return current[current.length - 1] === subjectId ? current.slice(0, -1) : current;
        }
        return current.filter((id) => id !== subjectId);
      }
      if (current.length >= plan.pickCount) return current;
      if (slotProgression && !availableProgressionSubjectIds(plan, current).includes(subjectId)) return current;
      return [...current, subjectId];
    });
  }

  function rewindToSlot(slotIndex: number) {
    if (result || !slotProgression || slotIndex >= selectedIds.length) return;
    setSelectedIds((current) => current.slice(0, slotIndex));
  }

  function challengeResult(next: FootballHitTheNumberResult) {
    return {
      score: next.score,
      status: next.status,
      target: next.target,
      total: next.total,
      distance: next.distance,
      selections: next.selections.map((selection) => ({
        fighterId: selection.subjectId,
        name: getFootballHitTheNumberSubject(selection.subjectId)?.name ?? selection.subjectId,
        value: selection.value,
      })),
    };
  }

  function lockPicks() {
    if (!selectionValid || result) return;
    const next = gradeFootballHitTheNumberSelection(plan, selectedIds);
    const payload = challengeResult(next);
    recordLineupCompletion(run.identity, {
      ...payload,
      boardType: plan.boardType,
      league: plan.league,
      formatId: plan.formatId,
      domainId: plan.domainId,
      metricId: plan.metricId,
      selectedIds,
    });
    if (profileMatch.isRecipient && profileMatch.challenge?.responderResult === null) {
      profileMatch.submitResult(asChallengeJson(payload));
    }
    setResult(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setRun(createFootballHitTheNumberRun());
    setSelectedIds([]);
    setResult(null);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function replay() {
    if (shared) {
      setSelectedIds([]);
      setResult(null);
      setChallengeStatus("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      startNew();
    }
  }

  async function challengeSomeone() {
    if (!result) return;
    setChallengeStatus("");
    const status = await beginChallenge({
      gameId: "hit-the-number",
      gameVersion: "football-hit-the-number-v1",
      gameTitle: "Football Hit the Number",
      summary: `${plan.metricLabel} · target ${formatFootballHitTheNumberValue(plan, plan.target)}`,
      setup: asChallengeJson({
        seed: plan.seed,
        boardType: plan.boardType,
        target: plan.target,
        pickCount: plan.pickCount,
        metricId: plan.metricId,
        subjectIds: plan.subjectIds,
      }),
      creatorResult: asChallengeJson(challengeResult(result)),
      shareTitle: "Football Hit the Number Challenge",
      shareText: `I challenged you to the same Football Hit the Number board: pick ${plan.pickCount} and chase ${formatFootballHitTheNumberValue(plan, plan.target)} ${plan.metricLabel}.`,
      shareUrl: footballChallengeUrl("/football/hit-the-number", {
        seed: plan.seed,
        board: plan.boardType,
      }),
    });
    setChallengeStatus(status);
  }

  const resultActions = result ? (
    <GameResultActions
      onChallenge={() => void challengeSomeone()}
      onReplay={replay}
      onAllGames={() => navigate("/football")}
      replayLabel={shared ? "REPLAY CHALLENGE" : "NEW BOARD"}
      status={challengeStatus}
    />
  ) : null;

  return (
    <div
      className="page hit-number-page football-hit-number-page"
      data-challenge-id={run.identity.challengeId}
      data-format-id={plan.formatId}
      style={footballHitNumberTheme}
    >
      {profileMatch.creator ? (
        <section className="challenge-game-banner">
          <span>PROFILE CHALLENGE</span>
          <strong>{profileMatch.creator.displayName} sent this exact Football Hit the Number board.</strong>
          <small>Both locked totals reveal after you finish.</small>
        </section>
      ) : null}

      <section className="hit-number-heading" style={{ padding: "16px 14px 14px" }}>
        <button className="hit-number-back" type="button" onClick={() => navigate("/football")}>← ALL GAMES</button>
        <p className="eyebrow">HIT THE NUMBER</p>
        <div className="hit-number-target" aria-label={`Target ${formatFootballHitTheNumberValue(plan, plan.target)}`}>
          <span>TARGET</span>
          <strong style={{ fontSize: "clamp(3.2rem, 14vw, 5.4rem)" }}>{formatFootballHitTheNumberValue(plan, plan.target)}</strong>
          <small>{plan.metricLabel.toUpperCase()}</small>
        </div>
        <p className="hit-number-rule" style={{ marginTop: 10 }}>Get as close as possible without going over. Go over the target and you bust.</p>
        <div className="hit-number-meta" aria-label="Current challenge context" style={{ marginTop: 10 }}>
          <span>{plan.league}</span>
          {plan.configurationLabel ? <span>{plan.configurationLabel.toUpperCase()}</span> : null}
        </div>
      </section>

      {!result && !shared ? (
        <section
          className="hit-number-controls surface-card"
          aria-label="Hit the Number board controls"
          style={{ gridTemplateColumns: "1fr" }}
        >
          <button className="hit-number-new-board" type="button" onClick={startNew}>
            NEW BOARD
          </button>
        </section>
      ) : null}

      <div className="hit-number-play-area">
        <section className={`hit-number-selection surface-card${result ? " is-complete" : ""}`}>
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">YOUR PICKS</p>
              <h2>{selectedIds.length} / {plan.pickCount} selected</h2>
            </div>
            {!result ? (
              <span>{activeSlot ? `NOW: ${activeSlot.label.toUpperCase()}` : "Stats stay hidden until you lock."}</span>
            ) : null}
          </div>

          {slotProgression ? (
            <div className="hit-number-role-slots" data-testid="hit-number-role-slots">
              {plan.slots.map((slot, index) => {
                const subjectId = selectedIds[index] ?? null;
                const subject = subjectId ? getFootballHitTheNumberSubject(subjectId) : null;
                const value = result && subjectId ? footballHitTheNumberValue(subjectId, plan.metricId) : null;
                const active = !result && index === selectedIds.length;
                return (
                  <button
                    type="button"
                    className={`hit-number-role-slot${active ? " is-active" : ""}${subject ? " is-filled" : ""}`}
                    aria-label={`${slot.label}: ${subject?.name ?? "empty"}`}
                    aria-pressed={active}
                    disabled={Boolean(result) || (!subject && !active)}
                    onClick={() => rewindToSlot(index)}
                    key={slot.id}
                    style={active ? activeFootballSlotStyle : undefined}
                  >
                    <span className="hit-number-role-slot__index">{index + 1}</span>
                    {subject && subjectId ? (
                      <SubjectMark subjectId={subjectId} className="hit-number-role-slot__photo" />
                    ) : (
                      <span className="hit-number-role-slot__empty">+</span>
                    )}
                    <span className="hit-number-role-slot__copy">
                      <small>{slot.label}</small>
                      <strong style={{ whiteSpace: "normal", overflow: "visible", textOverflow: "clip", lineHeight: 1.15 }}>
                        {subject?.name ?? `Choose ${poolNoun}`}
                      </strong>
                    </span>
                    <span className="hit-number-role-slot__state">
                      {result
                        ? <strong className="hit-number-stat-value">{value != null ? formatFootballHitTheNumberValue(plan, value) : "—"}</strong>
                        : active
                          ? "CHOOSING"
                          : subject
                            ? "CHANGE"
                            : "UP NEXT"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="hit-number-slots" data-testid="hit-number-slots">
              {Array.from({ length: plan.pickCount }, (_, index) => {
                const subjectId = selectedIds[index];
                const subject = subjectId ? getFootballHitTheNumberSubject(subjectId) : null;
                const value = result && subjectId ? footballHitTheNumberValue(subjectId, plan.metricId) : null;
                return (
                  <div className={`hit-number-slot${subject ? " is-filled" : ""}`} key={index}>
                    <b>{index + 1}</b>
                    {subject && subjectId ? (
                      <>
                        <SubjectMark subjectId={subjectId} className="hit-number-slot__photo" />
                        <span>{subject.name}</span>
                        {result && value != null
                          ? <strong className="hit-number-stat-value">{formatFootballHitTheNumberValue(plan, value)}</strong>
                          : <small>SELECTED</small>}
                      </>
                    ) : (
                      <span className="hit-number-slot__empty">EMPTY</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {result ? (
            <div className={`hit-number-result is-${result.status}`}>
              <p>{resultTitle(result)}</p>
              <strong className="hit-number-result__total">{formatFootballHitTheNumberValue(plan, result.total)}</strong>
              <span>TOTAL · TARGET {formatFootballHitTheNumberValue(plan, result.target)}</span>
              <small>{resultDetail(result)}</small>
              <div className="hit-number-result__score" aria-label={`Score ${result.score} out of 100`}>
                <span>SCORE</span>
                <strong>{result.score}</strong>
                <small>/100</small>
              </div>
              {resultActions}
            </div>
          ) : null}
        </section>

        {!result ? (
          <div className={`hit-number-lock-dock${ready ? " is-ready" : ""}`}>
            <button
              className={`hit-number-lock${ready ? " is-ready" : ""}`}
              type="button"
              disabled={!ready}
              onClick={lockPicks}
              style={ready ? { boxShadow: "0 8px 24px rgba(var(--football-accent-rgb), .24)" } : undefined}
            >
              {ready
                ? `${selectedIds.length}/${plan.pickCount} SELECTED · LOCK PICKS`
                : fullButInvalid
                  ? `${selectedIds.length}/${plan.pickCount} SELECTED · FILL REQUIRED ROLES`
                  : `${selectedIds.length}/${plan.pickCount} SELECTED`}
            </button>
          </div>
        ) : null}

        <section className="hit-number-roster surface-card">
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">{result ? "POOL RESULTS" : `${poolNoun.toUpperCase()} POOL`}</p>
              <h2>{activeSlot && !result ? activeSlot.label : `${displayedSubjectIds.length} eligible ${poolPlural}`}</h2>
            </div>
            <span>
              {result
                ? "All values revealed"
                : activeSlot
                  ? `Choose one for this ${plan.formatId === "one-from-each" ? "era" : "tier"}`
                  : `Pick ${plan.pickCount} from this pool`}
            </span>
          </div>
          <div className="hit-number-fighter-grid" style={{ gridTemplateColumns: "1fr" }}>
            {displayedSubjectIds.map((subjectId) => {
              const subject = getFootballHitTheNumberSubject(subjectId)!;
              const selected = selectedIds.includes(subjectId);
              const value = result ? footballHitTheNumberValue(subjectId, plan.metricId) : null;
              return (
                <button
                  type="button"
                  className={`hit-number-fighter-card${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  disabled={Boolean(result)}
                  onClick={() => toggleSubject(subjectId)}
                  key={subjectId}
                  style={selected ? selectedFootballCardStyle : undefined}
                >
                  <SubjectMark subjectId={subjectId} className="hit-number-fighter-card__photo" />
                  <span>
                    <strong style={{ whiteSpace: "normal", overflow: "visible", textOverflow: "clip", lineHeight: 1.15 }}>
                      {subjectDisplayName(subject)}
                    </strong>
                    <small>{result && selected ? `YOUR PICK · ${subjectDisplaySubtitle(subject, plan.metricId)}` : subjectDisplaySubtitle(subject, plan.metricId)}</small>
                  </span>
                  <b>{result && value != null ? formatFootballHitTheNumberValue(plan, value) : selected ? "SELECTED" : "+"}</b>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
