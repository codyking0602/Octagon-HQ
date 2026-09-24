import type { TodayChallengeProjection } from "./todayChallengeRepository";
import "./DailyLeaderboardGameResult.css";

type JsonRecord = Record<string, unknown>;

type MillionaireQuestionResult = {
  index: number;
  prompt: string;
  choices: Array<{ id: string; text: string }>;
  selectedChoiceIds: string[];
  correctChoiceId: string | null;
  lifelines: string[];
  status: "correct" | "wrong" | "walked-away" | "timeout" | "unreached";
};

type FeudAnswerRow = {
  id: string;
  displayName: string;
  points: number;
  found: boolean;
  rank: number | null;
  acceptedVariant: boolean;
};

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is string => typeof row === "string")
    : [];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(ms: number) {
  const safe = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function lifelineLabel(value: string) {
  if (value === "fifty-fifty") return "50/50";
  if (value === "stat-sheet") return "STAT SHEET";
  if (value === "double-dip") return "DOUBLE DIP";
  return value.replace(/[-_]/g, " ").toUpperCase();
}

const MONEY_LADDER = [500, 1_000, 5_000, 10_000, 50_000, 100_000, 500_000, 1_000_000];

export function buildMillionaireLeaderboardQuestions(
  projection: TodayChallengeProjection,
  resultDetail: JsonRecord,
): MillionaireQuestionResult[] {
  const setupQuestions = records(projection.publicSetup.questions);
  const revealQuestions = new Map(
    records(projection.revealSetup?.questions).map((question) => [
      String(question.id ?? ""),
      String(question.correct_choice_id ?? ""),
    ]),
  );

  const rows: MillionaireQuestionResult[] = setupQuestions.map((question, index) => ({
    index,
    prompt: String(question.prompt ?? ""),
    choices: records(question.choices).map((choice) => ({
      id: String(choice.id ?? ""),
      text: String(choice.text ?? ""),
    })),
    selectedChoiceIds: [],
    correctChoiceId: revealQuestions.get(String(question.id ?? "")) || null,
    lifelines: [],
    status: "unreached",
  }));

  let currentIndex = 0;
  let doubleDipActive = false;
  let doubleDipMisses = 0;
  let settled = false;

  for (const action of records(resultDetail.action_history)) {
    if (settled || currentIndex >= rows.length) break;
    const row = rows[currentIndex]!;
    const type = String(action.type ?? "");

    if (type === "use_lifeline") {
      const lifeline = String(action.lifeline ?? "");
      if (lifeline && !row.lifelines.includes(lifeline)) row.lifelines.push(lifeline);
      if (lifeline === "double-dip") {
        doubleDipActive = true;
        doubleDipMisses = 0;
      }
      continue;
    }

    if (type === "walk_away") {
      row.status = "walked-away";
      settled = true;
      continue;
    }

    if (type === "timeout") {
      row.status = "timeout";
      settled = true;
      continue;
    }

    if (type !== "answer") continue;

    const choiceId = String(action.choice_id ?? "");
    if (choiceId) row.selectedChoiceIds.push(choiceId);
    const correct = Boolean(choiceId && row.correctChoiceId && choiceId === row.correctChoiceId);

    if (correct) {
      row.status = "correct";
      currentIndex += 1;
      doubleDipActive = false;
      doubleDipMisses = 0;
      continue;
    }

    if (doubleDipActive && doubleDipMisses === 0) {
      doubleDipMisses = 1;
      row.status = "wrong";
      continue;
    }

    row.status = "wrong";
    settled = true;
  }

  const result = projection.officialAttempt?.publicResult ?? {};
  const completedQuestions = Math.max(0, Math.min(rows.length, Number(result.completed_questions ?? 0)));
  for (let index = 0; index < completedQuestions; index += 1) {
    if (rows[index]?.status === "unreached") rows[index]!.status = "correct";
  }

  if (!settled && projection.officialAttempt) {
    const outcome = String(result.outcome ?? record(projection.publicState).status ?? "");
    const terminalIndex = Math.min(rows.length - 1, completedQuestions);
    const terminal = rows[terminalIndex];
    if (terminal && terminal.status === "unreached") {
      if (outcome === "walked-away") terminal.status = "walked-away";
      else if (outcome === "lost") terminal.status = "wrong";
    }
  }

  return rows;
}

function feudAnswerRows(board: JsonRecord): FeudAnswerRow[] {
  const revealed = records(board.answer_reveal);
  const rows: FeudAnswerRow[] = revealed.map((answer, index) => {
    const entity = record(answer.entity);
    return {
      id: String(entity.id ?? `answer-${index}`),
      displayName: String(entity.display_name ?? ""),
      points: Number(answer.points ?? 0),
      found: answer.found === true,
      rank: index + 1,
      acceptedVariant: false,
    };
  });

  const existingIds = new Set(rows.map((row) => row.id));
  for (const slot of records(board.slots)) {
    if (slot.found !== true) continue;
    const entity = record(slot.entity);
    const id = String(entity.id ?? "");
    if (!id || existingIds.has(id)) continue;
    rows.push({
      id,
      displayName: String(entity.display_name ?? ""),
      points: Number(slot.points ?? 0),
      found: true,
      rank: null,
      acceptedVariant: true,
    });
    existingIds.add(id);
  }

  return rows;
}

export function buildSportsFeudFastMoneyRows(
  projection: TodayChallengeProjection,
  resultDetail: JsonRecord,
) {
  const state = record(projection.publicState.fast_money);
  const rawByQuestion = new Map(
    records(resultDetail.fast_money_results).map((row) => [
      String(row.questionId ?? row.question_id ?? ""),
      String(row.submittedText ?? row.submitted_text ?? ""),
    ]),
  );

  return records(state.results).map((row) => {
    const questionId = String(row.question_id ?? "");
    const matchedAnswer = String(row.submitted_answer ?? "");
    const rawAnswer = rawByQuestion.get(questionId) || matchedAnswer;
    return {
      questionId,
      prompt: String(row.prompt ?? ""),
      rawAnswer,
      matchedAnswer,
      rank: Number(row.board_rank ?? 0),
      points: Number(row.points ?? 0),
    };
  });
}

function SportsFeudLeaderboardResult({
  projection,
  resultDetail,
}: {
  projection: TodayChallengeProjection;
  resultDetail: JsonRecord;
}) {
  const state = record(projection.publicState);
  const fast = record(state.fast_money);
  const boards = records(state.main_boards);
  const mainPoints = Number(state.main_points ?? projection.officialAttempt?.publicResult.main_points ?? 0);
  const fastPoints = Number(fast.points ?? projection.officialAttempt?.publicResult.fast_money_points ?? 0);
  const fastRows = buildSportsFeudFastMoneyRows(projection, resultDetail);
  const timeRemainingMs = Number(
    fast.time_remaining_ms
      ?? projection.officialAttempt?.publicResult.fast_money_time_remaining_ms
      ?? 0,
  );

  return (
    <div className="leaderboard-game-result leaderboard-game-result--feud">
      <section className="leaderboard-game-result__hero">
        <div>
          <span>SPORTS FEUD</span>
          <strong>{projection.officialAttempt?.normalizedScore ?? Number(state.hq_score ?? 0)}</strong>
          <small>HQ SCORE</small>
        </div>
        <dl>
          <div><dt>Main boards</dt><dd>{mainPoints} / 60</dd></div>
          <div><dt>Fast Money</dt><dd>{fastPoints} / 40</dd></div>
          <div><dt>Time left</dt><dd>{formatTime(timeRemainingMs)}</dd></div>
        </dl>
      </section>

      <div className="leaderboard-game-result__boards">
        {boards.map((board, boardIndex) => {
          const answers = feudAnswerRows(board);
          const foundPoints = answers.filter((answer) => answer.found).reduce((sum, answer) => sum + answer.points, 0);
          return (
            <section className="leaderboard-feud-board" key={String(board.id ?? boardIndex)}>
              <header>
                <div>
                  <span>MAIN BOARD {boardIndex + 1}</span>
                  <h3>{String(board.prompt ?? "")}</h3>
                </div>
                <div>
                  <strong>{foundPoints}/{Number(board.max_points ?? 30)}</strong>
                  <small>{Number(board.strikes ?? 0)} STRIKES</small>
                </div>
              </header>
              <div className="leaderboard-feud-board__answers">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={answer.found ? "is-found" : "is-missed"}
                  >
                    <b>{answer.rank ?? "✓"}</b>
                    <span>
                      <strong>{answer.displayName}</strong>
                      {answer.acceptedVariant ? <small>ACCEPTED ANSWER</small> : null}
                    </span>
                    <em>{answer.points}</em>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="leaderboard-fast-money">
        <header>
          <div><span>FAST MONEY</span><h3>Five answers. One clock.</h3></div>
          <strong>{fastPoints}/40</strong>
        </header>
        <div>
          {fastRows.map((row, index) => {
            const differs = row.rawAnswer.trim().toLocaleLowerCase() !== row.matchedAnswer.trim().toLocaleLowerCase();
            return (
              <article key={row.questionId || index}>
                <b>{index + 1}</b>
                <div>
                  <small>{row.prompt}</small>
                  <strong>{row.rawAnswer || "No answer"}</strong>
                  {differs ? <em>Matched: {row.matchedAnswer}</em> : null}
                </div>
                <span>
                  <small>{row.rank > 0 ? `#${row.rank}` : "—"}</small>
                  <strong>{row.points} PTS</strong>
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MillionaireLeaderboardResult({
  projection,
  resultDetail,
}: {
  projection: TodayChallengeProjection;
  resultDetail: JsonRecord;
}) {
  const result = projection.officialAttempt?.publicResult ?? {};
  const rows = buildMillionaireLeaderboardQuestions(projection, resultDetail);
  const score = projection.officialAttempt?.normalizedScore ?? Number(result.score ?? 0);
  const outcome = String(result.outcome ?? "lost");
  const finalMoney = Number(result.final_money ?? 0);
  const completedQuestions = Number(result.completed_questions ?? 0);
  const lifelinesUsed = Number(result.lifelines_used ?? 0);
  const timeRemainingMs = Number(result.time_remaining_ms ?? 0);

  return (
    <div className="leaderboard-game-result leaderboard-game-result--millionaire">
      <section className="leaderboard-game-result__hero">
        <div>
          <span>{outcome === "won" ? "MILLIONAIRE" : "FINAL RESULT"}</span>
          <strong>{score}</strong>
          <small>HQ SCORE</small>
        </div>
        <dl>
          <div><dt>Money</dt><dd>{formatMoney(finalMoney)}</dd></div>
          <div><dt>Questions correct</dt><dd>{completedQuestions} / 8</dd></div>
          <div><dt>Lifelines used</dt><dd>{lifelinesUsed}</dd></div>
          <div><dt>Time left</dt><dd>{formatTime(timeRemainingMs)}</dd></div>
        </dl>
      </section>

      <section className="leaderboard-millionaire-ladder">
        <header>
          <span>QUESTION LADDER</span>
          <h3>How the run unfolded</h3>
        </header>
        <div className="leaderboard-millionaire-ladder__rows">
          {rows.map((row) => {
            const money = MONEY_LADDER[row.index] ?? 0;
            const reached = row.status !== "unreached";
            const statusLabel = row.status === "correct"
              ? "CORRECT"
              : row.status === "wrong"
                ? "WRONG"
                : row.status === "walked-away"
                  ? "WALKED"
                  : row.status === "timeout"
                    ? "TIME"
                    : "UNREACHED";
            const summary = (
              <>
                <b>Q{row.index + 1}</b>
                <strong>{formatMoney(money)}</strong>
                <span className={`is-${row.status}`}>{statusLabel}</span>
              </>
            );

            if (!reached) {
              return <div className="leaderboard-millionaire-row is-unreached" key={row.index}>{summary}</div>;
            }

            return (
              <details
                className={`leaderboard-millionaire-row is-${row.status}`}
                key={row.index}
                open={row.status !== "correct"}
              >
                <summary>{summary}</summary>
                <div className="leaderboard-millionaire-row__detail">
                  <p>{row.prompt}</p>
                  {row.lifelines.length ? (
                    <div className="leaderboard-millionaire-row__lifelines">
                      {row.lifelines.map((lifeline) => <span key={lifeline}>{lifelineLabel(lifeline)}</span>)}
                    </div>
                  ) : null}
                  <div className="leaderboard-millionaire-row__choices">
                    {row.choices.map((choice) => {
                      const selected = row.selectedChoiceIds.includes(choice.id);
                      const correct = choice.id === row.correctChoiceId;
                      return (
                        <div
                          key={choice.id}
                          className={[
                            selected ? "is-selected" : "",
                            correct ? "is-correct" : "",
                            selected && !correct ? "is-wrong" : "",
                          ].filter(Boolean).join(" ")}
                        >
                          <b>{choice.id}</b>
                          <span>{choice.text}</span>
                          <em>{correct ? "CORRECT" : selected ? "PICKED" : ""}</em>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function DailyLeaderboardGameResult({
  projection,
  resultDetail,
}: {
  projection: TodayChallengeProjection;
  resultDetail: JsonRecord;
}) {
  if (projection.gameType === "sports_feud") {
    return <SportsFeudLeaderboardResult projection={projection} resultDetail={resultDetail} />;
  }
  if (projection.gameType === "millionaire") {
    return <MillionaireLeaderboardResult projection={projection} resultDetail={resultDetail} />;
  }
  return null;
}
