import "./NbaHigherLowerLeaderboardResult.css";

type JsonRecord = Record<string, unknown>;
function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}
function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(record).filter(row => Object.keys(row).length > 0) : [];
}
export interface NbaHigherLowerOfficialDetail {
  /** The server must verify the viewer is entitled to this completed result. */
  unlocked: boolean;
  normalizedScore: number;
  answers: unknown;
  revealQuestions: unknown;
}
export interface NbaHigherLowerOfficialResultRow {
  id: string;
  number: number;
  metric: string;
  knownName: string;
  knownValue: string;
  knownContext: string;
  hiddenName: string;
  hiddenValue: string;
  hiddenContext: string;
  picked: "higher" | "lower";
  correctChoice: "higher" | "lower";
  correct: boolean;
}

/**
 * Completed, server-authorized leaderboard snapshots only. Never compute
 * other members' answers from the current Daily or an uncompleted browser run.
 * If the backend omits any reveal evidence, omit that row rather than guessing.
 */
export function nbaHigherLowerOfficialResultRows(
  detail: NbaHigherLowerOfficialDetail,
): NbaHigherLowerOfficialResultRow[] {
  if (!detail.unlocked) return [];
  const answers = records(detail.answers);
  const questions = records(detail.revealQuestions);
  if (answers.length !== 10 || questions.length !== 10) return [];
  const byId = new Map(questions.map(q => [String(q.id ?? ""), q]));
  const seen = new Set<string>();
  return answers.flatMap((answer, i) => {
    const id = String(answer.question_id ?? answer.questionId ?? "");
    if (!id || seen.has(id) || !byId.has(id)) return [];
    seen.add(id);
    const question = byId.get(id)!;
    const known = record(question.known);
    const hidden = record(question.hidden);
    const knownValue = Number(known.value);
    const hiddenValue = Number(hidden.value);
    const picked = String(answer.choice ?? "");
    const correctChoice = String(question.answer ?? "");
    if (!Number.isFinite(knownValue) || !Number.isFinite(hiddenValue)
      || knownValue === hiddenValue
      || !["higher", "lower"].includes(picked)
      || !["higher", "lower"].includes(correctChoice)
      || (hiddenValue > knownValue ? "higher" : "lower") !== correctChoice
      || !known.name || !hidden.name) return [];
    return [{
      id, number: i + 1, metric: String(question.metricLabel ?? question.metric_label ?? "NBA COMPARISON"),
      knownName: String(known.name), knownValue: String(known.formattedValue ?? knownValue),
      knownContext: String(known.context ?? ""),
      hiddenName: String(hidden.name), hiddenValue: String(hidden.formattedValue ?? hiddenValue),
      hiddenContext: String(hidden.context ?? ""),
      picked: picked as "higher" | "lower",
      correctChoice: correctChoice as "higher" | "lower",
      correct: picked === correctChoice,
    }];
  });
}

export function NbaHigherLowerLeaderboardResult({ detail }: { detail: NbaHigherLowerOfficialDetail }) {
  const rows = nbaHigherLowerOfficialResultRows(detail);
  if (!detail.unlocked) {
    return <p className="nba-hl-daily-result__notice">Complete the official challenge before its answers can be viewed.</p>;
  }
  const score = Number.isFinite(detail.normalizedScore)
    ? Math.min(100, Math.max(0, Math.round(detail.normalizedScore))) : 0;
  const correct = rows.filter(row => row.correct).length;
  return <section className="nba-hl-daily-result" aria-label="Completed NBA Higher or Lower daily result">
    <header className="nba-hl-daily-result__summary">
      <span>OFFICIAL DAILY · HIGHER OR LOWER</span>
      <strong>{score}<small>/100</small></strong>
      <p>{rows.length === 10 ? `${correct} OF 10 CORRECT` : "Partial reveal unavailable"}</p>
    </header>
    {rows.length === 10 ? <div className="nba-hl-daily-result__questions">
      {rows.map(row => <article className="nba-hl-daily-result__question" key={row.id}>
        <div className="nba-hl-daily-result__top">
          <span>Q{row.number} · {row.metric}</span>
          <em className={row.correct ? "is-correct" : "is-wrong"}>{row.correct ? "CORRECT" : "MISS"}</em>
        </div>
        <div className="nba-hl-daily-result__comparison">
          <div>
            <small>KNOWN</small><strong>{row.knownName}</strong><span>{row.knownValue}</span>
            <small>{row.knownContext}</small>
          </div>
          <div>
            <small>COMPARE</small><strong>{row.hiddenName}</strong><span>{row.hiddenValue}</span>
            <small>{row.hiddenContext}</small>
          </div>
        </div>
        <p>Picked <b>{row.picked.toUpperCase()}</b> · Correct <b>{row.correctChoice.toUpperCase()}</b></p>
      </article>)}
    </div> : <p className="nba-hl-daily-result__notice">The completed question-by-question breakdown is unavailable. The official score is preserved.</p>}
  </section>;
}
export default NbaHigherLowerLeaderboardResult;
