import type { CSSProperties, ReactNode } from "react";
import { footballSubjectAsset } from "./footballSubjectAssets";

export interface FootballHitNumberPresentationCandidate {
  id: string;
  name: string;
  subtitle: string;
}

export interface FootballHitNumberPresentationSlot {
  id: string;
  label: string;
}

export interface FootballHitNumberPresentationResult {
  status: "perfect" | "under" | "bust";
  target: number;
  total: number;
  distance: number;
  score: number;
}

export const footballHitNumberTheme = {
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

function resultTitle(result: FootballHitNumberPresentationResult, formatValue: (value: number) => string) {
  if (result.status === "perfect") return "PERFECT";
  if (result.status === "bust") return "BUST";
  return `${formatValue(result.distance)} OFF`;
}

function resultDetail(result: FootballHitNumberPresentationResult, formatValue: (value: number) => string) {
  if (result.status === "perfect") return `You hit ${formatValue(result.target)} exactly.`;
  if (result.status === "bust") return `You went over by ${formatValue(result.distance)}.`;
  return `You finished ${formatValue(result.distance)} below the target.`;
}

export function FootballHitNumberSubjectMark({ subjectId, className }: { subjectId: string; className: string }) {
  const asset = footballSubjectAsset(subjectId);
  if (!asset) {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{ display: "grid", placeItems: "center", background: "rgba(255,255,255,.05)", fontSize: ".58rem", fontWeight: 950 }}
      >
        FB
      </span>
    );
  }
  const lightBackplate = asset.darkSurfaceTreatment === "light-backplate";
  return (
    <img
      alt=""
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      src={asset.src}
      title={asset.label}
      style={{
        objectFit: "contain",
        padding: lightBackplate ? 3 : 4,
        background: lightBackplate ? "#fff" : "rgba(255,255,255,.04)",
        borderRadius: lightBackplate ? "50%" : undefined,
        boxShadow: lightBackplate ? "0 0 0 1px rgba(255,255,255,.28)" : undefined,
      }}
    />
  );
}

export function FootballHitTheNumberPresentation({
  target,
  metricLabel,
  league,
  configurationLabel,
  pickCount,
  candidates,
  selectedIds,
  slots = [],
  activeSlotIndex = null,
  availableIds,
  values,
  result,
  formatValue,
  onBack,
  onNewBoard,
  onToggle,
  onRewind,
  onLock,
  resultActions,
  busy = false,
}: {
  target: number;
  metricLabel: string;
  league: string;
  configurationLabel?: string | null;
  pickCount: number;
  candidates: readonly FootballHitNumberPresentationCandidate[];
  selectedIds: readonly string[];
  slots?: readonly FootballHitNumberPresentationSlot[];
  activeSlotIndex?: number | null;
  availableIds?: readonly string[] | null;
  values?: Readonly<Record<string, number>>;
  result?: FootballHitNumberPresentationResult | null;
  formatValue: (value: number) => string;
  onBack?: (() => void) | null;
  onNewBoard?: (() => void) | null;
  onToggle?: ((id: string) => void) | null;
  onRewind?: ((index: number) => void) | null;
  onLock?: (() => void) | null;
  resultActions?: ReactNode;
  busy?: boolean;
}) {
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const selected = new Set(selectedIds);
  const progression = slots.length > 0;
  const shownCandidates = result
    ? candidates
    : progression && availableIds
      ? candidates.filter((candidate) => availableIds.includes(candidate.id))
      : candidates;
  const ready = selectedIds.length === pickCount && activeSlotIndex == null;
  const poolNoun = "pick";

  return (
    <>
      <section className="hit-number-heading" style={{ padding: "16px 14px 14px" }}>
        {onBack ? <button className="hit-number-back" type="button" onClick={onBack}>← ALL GAMES</button> : null}
        <p className="eyebrow">HIT THE NUMBER</p>
        <div className="hit-number-target" aria-label={`Target ${formatValue(target)}`}>
          <span>TARGET</span>
          <strong style={{ fontSize: "clamp(3.2rem, 14vw, 5.4rem)" }}>{formatValue(target)}</strong>
          <small>{metricLabel.toUpperCase()}</small>
        </div>
        <p className="hit-number-rule" style={{ marginTop: 10 }}>Get as close as possible without going over. Go over the target and you bust.</p>
        <div className="hit-number-meta" aria-label="Current challenge context" style={{ marginTop: 10 }}>
          <span>{league}</span>
          {configurationLabel ? <span>{configurationLabel.toUpperCase()}</span> : null}
        </div>
      </section>

      {!result && onNewBoard ? (
        <section className="hit-number-controls surface-card" aria-label="Hit the Number board controls" style={{ gridTemplateColumns: "1fr" }}>
          <button className="hit-number-new-board" type="button" onClick={onNewBoard}>NEW BOARD</button>
        </section>
      ) : null}

      <div className="hit-number-play-area">
        <section className={`hit-number-selection surface-card${result ? " is-complete" : ""}`}>
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">YOUR PICKS</p>
              <h2>{selectedIds.length} / {pickCount} selected</h2>
            </div>
            {!result ? (
              <span>{activeSlotIndex != null && slots[activeSlotIndex]
                ? `NOW: ${slots[activeSlotIndex]!.label.toUpperCase()}`
                : "Stats stay hidden until you lock."}</span>
            ) : null}
          </div>

          {progression ? (
            <div className="hit-number-role-slots" data-testid="hit-number-role-slots">
              {slots.map((slot, index) => {
                const subjectId = selectedIds[index] ?? null;
                const subject = subjectId ? candidateById.get(subjectId) : null;
                const value = result && subjectId ? values?.[subjectId] : null;
                const active = !result && index === activeSlotIndex;
                return (
                  <button
                    type="button"
                    className={`hit-number-role-slot${active ? " is-active" : ""}${subject ? " is-filled" : ""}`}
                    aria-label={`${slot.label}: ${subject?.name ?? "empty"}`}
                    aria-pressed={active}
                    disabled={Boolean(result) || busy || (!subject && !active)}
                    onClick={() => onRewind?.(index)}
                    key={slot.id}
                    style={active ? activeFootballSlotStyle : undefined}
                  >
                    <span className="hit-number-role-slot__index">{index + 1}</span>
                    {subject && subjectId ? (
                      <FootballHitNumberSubjectMark subjectId={subjectId} className="hit-number-role-slot__photo" />
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
                        ? <strong className="hit-number-stat-value">{value != null ? formatValue(value) : "—"}</strong>
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
              {Array.from({ length: pickCount }, (_, index) => {
                const subjectId = selectedIds[index];
                const subject = subjectId ? candidateById.get(subjectId) : null;
                const value = result && subjectId ? values?.[subjectId] : null;
                return (
                  <div className={`hit-number-slot${subject ? " is-filled" : ""}`} key={index}>
                    <b>{index + 1}</b>
                    {subject && subjectId ? (
                      <>
                        <FootballHitNumberSubjectMark subjectId={subjectId} className="hit-number-slot__photo" />
                        <span>{subject.name}</span>
                        {result && value != null
                          ? <strong className="hit-number-stat-value">{formatValue(value)}</strong>
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
              <p>{resultTitle(result, formatValue)}</p>
              <strong className="hit-number-result__total">{formatValue(result.total)}</strong>
              <span>TOTAL · TARGET {formatValue(result.target)}</span>
              <small>{resultDetail(result, formatValue)}</small>
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
              disabled={!ready || busy || !onLock}
              onClick={onLock ?? undefined}
              style={ready ? { boxShadow: "0 8px 24px rgba(var(--football-accent-rgb), .24)" } : undefined}
            >
              {busy ? "LOCKING…" : ready ? `${selectedIds.length}/${pickCount} SELECTED · LOCK PICKS` : `${selectedIds.length}/${pickCount} SELECTED`}
            </button>
          </div>
        ) : null}

        <section className="hit-number-roster surface-card">
          <div className="hit-number-section-heading">
            <div>
              <p className="eyebrow">{result ? "POOL RESULTS" : "PICK POOL"}</p>
              <h2>{activeSlotIndex != null && slots[activeSlotIndex] && !result
                ? slots[activeSlotIndex]!.label
                : `${shownCandidates.length} eligible picks`}</h2>
            </div>
            <span>{result ? "All values revealed" : progression ? "Choose one for this slot" : `Pick ${pickCount} from this pool`}</span>
          </div>
          <div className="hit-number-fighter-grid" style={{ gridTemplateColumns: "1fr" }}>
            {shownCandidates.map((candidate) => {
              const isSelected = selected.has(candidate.id);
              const value = result ? values?.[candidate.id] : null;
              return (
                <button
                  type="button"
                  className={`hit-number-fighter-card${isSelected ? " is-selected" : ""}`}
                  aria-pressed={isSelected}
                  disabled={Boolean(result) || busy}
                  onClick={() => onToggle?.(candidate.id)}
                  key={candidate.id}
                  style={isSelected ? selectedFootballCardStyle : undefined}
                >
                  <FootballHitNumberSubjectMark subjectId={candidate.id} className="hit-number-fighter-card__photo" />
                  <span>
                    <strong style={{ whiteSpace: "normal", overflow: "visible", textOverflow: "clip", lineHeight: 1.15 }}>{candidate.name}</strong>
                    <small>{candidate.subtitle}</small>
                  </span>
                  <b>{result && value != null ? formatValue(value) : isSelected ? "SELECTED" : "+"}</b>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
