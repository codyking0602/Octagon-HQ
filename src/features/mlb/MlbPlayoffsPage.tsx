import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  formatChampionshipPoints,
  type MlbChampionship,
} from "./mlbChampionship";
import {
  MLB_OWNER_PREVIEW_CHAMPIONSHIP,
  MLB_OWNER_PREVIEW_HUB,
  MLB_OWNER_PREVIEW_PLAY_LEADERBOARD,
} from "./mlbOwnerPreview";
import {
  loadMlbPlayChallengeOverview,
  loadMlbPlayPreviewResult,
  type MlbPlayChallengeLeaderboardEntry,
  type MlbPlayChallengeOverview,
} from "./mlbPlayChallenge";
import { useMlbChampionship } from "./useMlbChampionship";
import { useMlbPlayoffs } from "./useMlbPlayoffs";
import { millionaireMoneyLabel, millionaireTimeLabel } from "../play/MillionaireCasualModel";
import { mlbMillionaireProductionRun } from "./mlbMillionaireProduction";
import "../../styles/play-landing-shared.css";
import "../../styles/today-challenge-hub.css";
import "../../styles/daily-leaderboard-result-page.css";
import "../../styles/mlb-playoffs.css";

function challengeDateLabel(day: string | null | undefined) {
  if (!day) return "POSTSEASON";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`)).toUpperCase();
}

function previewOverview(
  challengeKey: string,
  displayName: string,
  initials: string,
): MlbPlayChallengeOverview {
  const own = loadMlbPlayPreviewResult(challengeKey);
  if (!own) {
    return {
      unlocked: false,
      playerCount: 0,
      ownResult: null,
      entries: [],
    };
  }

  const current: MlbPlayChallengeLeaderboardEntry = {
    rank: 1,
    profileId: "preview-current-user",
    displayName,
    initials,
    avatarPhotoData: null,
    ...own,
    isCurrentUser: true,
  };

  const sorted = [
    current,
    ...MLB_OWNER_PREVIEW_PLAY_LEADERBOARD.filter((entry) => !entry.isCurrentUser),
  ].sort((left, right) => (
    right.rawScore - left.rawScore
    || Date.parse(left.completedAt) - Date.parse(right.completedAt)
    || left.displayName.localeCompare(right.displayName)
  ));

  let previousScore: number | null = null;
  let previousRank = 0;
  const ranked = sorted.map((entry, index) => {
    const rank = previousScore === entry.rawScore ? previousRank : index + 1;
    previousScore = entry.rawScore;
    previousRank = rank;
    return { ...entry, rank };
  });

  return {
    unlocked: true,
    playerCount: ranked.length,
    ownResult: own,
    entries: ranked,
  };
}

function gameRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const games = Array.isArray(detail.games) ? detail.games : [];
  return games.map((value, index) => {
    const game = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const score = Number(game.score ?? 0);
    const perfect = game.perfect === true;
    const inferredSafe = perfect ? 9 : Math.max(0, Math.round(score / 10) - 1);
    return {
      game: Number(game.game ?? index + 1),
      score,
      perfect,
      safeCount: Number(game.safe_count ?? inferredSafe),
      fatalName: typeof game.fatal_name === "string" ? game.fatal_name : null,
    };
  });
}

function wavelengthRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const rounds = Array.isArray(entry.resultDetail.rounds) ? entry.resultDetail.rounds : [];
  return rounds.map((value, index) => {
    const round = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const guesses = Array.isArray(round.guesses)
      ? round.guesses.filter((guess): guess is number => typeof guess === "number")
      : [];
    return {
      round: Number(round.round ?? index + 1),
      score: Number(round.score ?? 0),
      target: Number(round.target ?? 0),
      finalGuess: Number(round.final_guess ?? guesses.at(-1) ?? 0),
      guesses,
    };
  });
}

function whoAmIRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const rounds = Array.isArray(entry.resultDetail.rounds) ? entry.resultDetail.rounds : [];
  return rounds.map((value, index) => {
    const round = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const identity = round.identity && typeof round.identity === "object" && !Array.isArray(round.identity)
      ? round.identity as Record<string, unknown>
      : {};
    return {
      round: Number(round.round ?? index + 1),
      score: Number(round.score ?? 0),
      outcome: String(round.outcome ?? ""),
      cluesUsed: Number(round.revealed_count ?? 0),
      wrongGuesses: Number(round.wrong_guesses ?? 0),
      recoveryMisses: Number(round.recovery_wrong_guesses ?? 0),
      identityName: String(identity.name ?? "Identity revealed"),
    };
  });
}

function blindResumeRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const rounds = Array.isArray(entry.resultDetail.rounds) ? entry.resultDetail.rounds : [];
  return rounds.map((value, index) => {
    const round = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const playerA = round.player_a && typeof round.player_a === "object" && !Array.isArray(round.player_a)
      ? round.player_a as Record<string, unknown>
      : {};
    const playerB = round.player_b && typeof round.player_b === "object" && !Array.isArray(round.player_b)
      ? round.player_b as Record<string, unknown>
      : {};
    const winnerId = String(round.winner_id ?? "");
    const pickedId = String(round.picked_id ?? "");
    const winnerName = String((winnerId === playerA.id ? playerA : playerB).name ?? "Winner");
    const pickedName = String((pickedId === playerA.id ? playerA : playerB).name ?? "Pick");
    return {
      round: Number(round.round ?? index + 1),
      correct: round.correct === true,
      points: Number(round.points ?? 0),
      revealedCount: Number(round.revealed_count ?? 0),
      winnerName,
      pickedName,
    };
  });
}

function hitTheNumberRows(entry: MlbPlayChallengeLeaderboardEntry) {
  const games = Array.isArray(entry.resultDetail.games) ? entry.resultDetail.games : [];
  return games.map((value, index) => {
    const game = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const selections = Array.isArray(game.selections)
      ? game.selections.map((selection) => (
          selection && typeof selection === "object" && !Array.isArray(selection)
            ? selection as Record<string, unknown>
            : {}
        ))
      : [];
    return {
      game: Number(game.game ?? index + 1),
      metricLabel: String(game.metric_label ?? "Home Runs"),
      configurationLabel: String(game.configuration_label ?? ""),
      target: Number(game.target ?? 0),
      total: Number(game.total ?? 0),
      distance: Number(game.distance ?? 0),
      status: String(game.status ?? "under"),
      score: Number(game.score ?? 0),
      selections: selections.map((selection) => ({
        name: String(selection.name ?? "Pick"),
        value: Number(selection.value ?? 0),
      })),
    };
  });
}

function sportsFeudSummary(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const mainBoards = Array.isArray(detail.main_boards) ? detail.main_boards : [];
  const fastMoney = detail.fast_money && typeof detail.fast_money === "object" && !Array.isArray(detail.fast_money)
    ? detail.fast_money as Record<string, unknown>
    : {};
  const boards = mainBoards.map((value, index) => {
    const board = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
    const found = Array.isArray(board.found_answers)
      ? board.found_answers.filter((name): name is string => typeof name === "string")
      : [];
    const answers = Array.isArray(board.board_answers)
      ? board.board_answers.map((answer, answerIndex) => {
          const row = answer && typeof answer === "object" && !Array.isArray(answer)
            ? answer as Record<string, unknown>
            : {};
          return {
            rank: answerIndex + 1,
            name: String(row.name ?? ""),
            points: Number(row.points ?? 0),
            found: row.found === true,
          };
        })
      : [];
    return {
      round: Number(board.round ?? index + 1),
      prompt: String(board.prompt ?? ""),
      points: Number(board.points ?? 0),
      strikes: Number(board.strikes ?? 0),
      found,
      answers,
    };
  });
  const results = Array.isArray(fastMoney.results)
    ? fastMoney.results.map((value, index) => {
        const row = value && typeof value === "object" && !Array.isArray(value)
          ? value as Record<string, unknown>
          : {};
        return {
          index: index + 1,
          prompt: String(row.prompt ?? ""),
          answer: String(row.submitted_answer ?? "NO ANSWER"),
          points: Number(row.points ?? 0),
        };
      })
    : [];
  return {
    mainPoints: Number(entry.publicResult.main_points ?? boards.reduce((sum, board) => sum + board.points, 0)),
    fastPoints: Number(entry.publicResult.fast_money_points ?? fastMoney.points ?? 0),
    boards,
    results,
  };
}

function millionaireResultSummary(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const publicResult = entry.publicResult;
  return {
    outcome: String(detail.outcome ?? publicResult.outcome ?? "lost"),
    finalMoney: Number(detail.final_money ?? publicResult.final_money ?? 0),
    completedQuestions: Number(detail.completed_questions ?? publicResult.completed_questions ?? 0),
    firstMissQuestion: detail.first_miss_question == null ? null : Number(detail.first_miss_question),
    lifelinesUsed: Number(detail.lifelines_used ?? publicResult.lifelines_used ?? 0),
    timeRemainingMs: Number(detail.time_remaining_ms ?? publicResult.time_remaining_ms ?? 0),
  };
}

function inferredLegacyMillionaireFirstMiss(entry: MlbPlayChallengeLeaderboardEntry) {
  const summary = millionaireResultSummary(entry);
  if (summary.firstMissQuestion) return summary.firstMissQuestion;
  if (summary.outcome !== "lost") return null;
  const inferredBase = entry.rawScore + (summary.lifelinesUsed * 2);
  const survivalCorrect = (inferredBase - 20 - (summary.completedQuestions * 5)) / 5;
  if (!Number.isInteger(survivalCorrect) || survivalCorrect < 0 || survivalCorrect > 7) return null;
  return survivalCorrect + 1;
}

function millionaireQuestionRows(
  entry: MlbPlayChallengeLeaderboardEntry,
  challengeKey: string,
  challengeDate: string,
) {
  const run = mlbMillionaireProductionRun(challengeKey, challengeDate);
  if (!run) return [];

  const rows = run.map((question, index) => ({
    index,
    prompt: question.prompt,
    choices: question.choices,
    selectedChoiceIds: [] as string[],
    correctChoiceId: question.correctChoiceId,
    explanation: question.explanation,
    lifelines: [] as string[],
    status: "unreached" as "correct" | "wrong" | "walked-away" | "timeout" | "unreached" | "detail-unavailable",
  }));

  const actions = Array.isArray(entry.resultDetail.action_history)
    ? entry.resultDetail.action_history.filter((value): value is Record<string, unknown> => (
        Boolean(value) && typeof value === "object" && !Array.isArray(value)
      ))
    : [];

  if (actions.length) {
    let currentIndex = 0;
    let doubleDipActive = false;
    let doubleDipMisses = 0;

    for (const action of actions) {
      if (currentIndex >= rows.length) break;
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
        break;
      }

      if (type === "timeout") {
        row.status = "timeout";
        break;
      }

      if (type !== "answer") continue;

      const choiceId = String(action.choice_id ?? "");
      if (choiceId) row.selectedChoiceIds.push(choiceId);
      const correct = choiceId === row.correctChoiceId;

      if (correct) {
        row.status = "correct";
        currentIndex += 1;
        doubleDipActive = false;
        doubleDipMisses = 0;
        continue;
      }

      if (doubleDipActive && doubleDipMisses === 0) {
        row.status = "wrong";
        doubleDipMisses = 1;
        continue;
      }

      row.status = "wrong";
      currentIndex += 1;
      doubleDipActive = false;
      doubleDipMisses = 0;
    }

    return rows;
  }

  const summary = millionaireResultSummary(entry);
  if (summary.outcome === "won") {
    rows.forEach((row) => {
      row.status = "correct";
      row.selectedChoiceIds = [row.correctChoiceId];
    });
    return rows;
  }
  if (summary.outcome === "walked-away" && summary.completedQuestions === 7) {
    rows.slice(0, 7).forEach((row) => {
      row.status = "correct";
      row.selectedChoiceIds = [row.correctChoiceId];
    });
    rows[7]!.status = "walked-away";
    return rows;
  }

  const firstMiss = inferredLegacyMillionaireFirstMiss(entry);
  if (firstMiss) {
    rows.slice(0, firstMiss - 1).forEach((row) => {
      row.status = "correct";
      row.selectedChoiceIds = [row.correctChoiceId];
    });
    rows[firstMiss - 1]!.status = "wrong";
    rows.slice(firstMiss).forEach((row) => { row.status = "detail-unavailable"; });
  }
  return rows;
}

function averageFanResultSummary(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const publicResult = entry.publicResult;
  const resolved = Array.isArray(detail.resolved)
    ? detail.resolved.filter((value): value is Record<string, unknown> => (
        Boolean(value) && typeof value === "object" && !Array.isArray(value)
      ))
    : [];
  const finalQuestion = detail.final_question && typeof detail.final_question === "object" && !Array.isArray(detail.final_question)
    ? detail.final_question as Record<string, unknown>
    : {};
  return {
    boardScore: Number(detail.board_score ?? publicResult.board_score ?? 0),
    boardClears: Number(detail.board_clears ?? publicResult.board_clears ?? 0),
    saves: Number(detail.saves ?? publicResult.saves ?? 0),
    finalOutcome: String(detail.final_outcome ?? publicResult.final_outcome ?? ""),
    fan: String(detail.fan ?? publicResult.fan ?? "").toUpperCase(),
    resolved,
    finalQuestion,
    finalPlayerAnswer: String(detail.final_player_answer ?? ""),
  };
}

function barTriviaResultSummary(entry: MlbPlayChallengeLeaderboardEntry) {
  const detail = entry.resultDetail;
  const publicResult = entry.publicResult;
  return {
    correctCount: Number(detail.correct_count ?? publicResult.correct_count ?? 0),
    bestStreak: Number(detail.best_streak ?? publicResult.best_streak ?? 0),
    wager: Number(detail.wager ?? publicResult.wager ?? 0),
    doubleRound: String(detail.double_round ?? publicResult.double_round ?? "round2"),
  };
}

function MlbPlayResultDetail({
  entry,
  challengeTitle,
  challengeKey,
  challengeDate,
  onClose,
}: {
  entry: MlbPlayChallengeLeaderboardEntry;
  challengeTitle: string;
  challengeKey: string;
  challengeDate: string;
  onClose: () => void;
}) {
  const games = gameRows(entry);
  const wavelengthRounds = wavelengthRows(entry);
  const whoAmIRounds = whoAmIRows(entry);
  const blindResumeRounds = blindResumeRows(entry);
  const isWavelength = entry.gameType === "wavelength";
  const isMillionaire = entry.gameType === "millionaire";
  const isWhoAmI = entry.gameType === "who_am_i";
  const isBlindResume = entry.gameType === "blind_resume";
  const isHitTheNumber = entry.gameType === "hit_the_number";
  const isSportsFeud = entry.gameType === "sports_feud";
  const isBarTrivia = entry.gameType === "bar_trivia";
  const isAverageFan = entry.gameType === "average_fan";
  const millionaire = millionaireResultSummary(entry);
  const millionaireQuestions = millionaireQuestionRows(entry, challengeKey, challengeDate);
  const millionaireLegacyDetailLimited = isMillionaire
    && !Array.isArray(entry.resultDetail.action_history)
    && millionaire.outcome === "lost";
  const millionaireLegacyFirstMiss = millionaireLegacyDetailLimited
    ? inferredLegacyMillionaireFirstMiss(entry)
    : null;
  const millionaireLegacyRecoveryCorrect = millionaireLegacyFirstMiss
    ? Math.max(0, millionaire.completedQuestions - (millionaireLegacyFirstMiss - 1))
    : 0;
  const millionaireLegacyRecoveryTotal = millionaireLegacyFirstMiss
    ? Math.max(0, 8 - millionaireLegacyFirstMiss)
    : 0;
  const hitTheNumberGames = hitTheNumberRows(entry);
  const sportsFeud = sportsFeudSummary(entry);
  const barTrivia = barTriviaResultSummary(entry);
  const averageFan = averageFanResultSummary(entry);

  return (
    <div
      className="today-hub-official-result mlb-play-result-detail"
      role="dialog"
      aria-label={`${entry.displayName} MLB Play result`}
    >
      <header className="today-hub-official-result__header">
        <button type="button" onClick={onClose}>← LEADERBOARD</button>
        <span className="today-hub-official-result__identity">
          <span className="today-hub-official-result__avatar" aria-hidden="true">
            {entry.avatarPhotoData ? <img src={entry.avatarPhotoData} alt="" /> : <b>{entry.initials}</b>}
          </span>
          <span className="today-hub-official-result__identity-copy">
            <strong>{entry.displayName}</strong>
            <small>#{entry.rank} · {entry.rawScore}/100</small>
          </span>
        </span>
      </header>

      <div className="today-hub-official-result__body">
        <section className="mlb-play-result-card">
          {!isSportsFeud ? (
            <div>
              <p className="eyebrow">MLB PLAYOFF CHALLENGE</p>
              <h2>{challengeTitle}</h2>
              <span>FINAL SCORE</span>
              <strong>{entry.rawScore}<small>/100</small></strong>
            </div>
          ) : null}

          {isMillionaire ? (
            <>
              <div className="mlb-play-result-card__games">
                <article>
                  <span>FINAL MONEY</span>
                  <strong>{millionaireMoneyLabel(millionaire.finalMoney)}</strong>
                  <small>{millionaire.completedQuestions} / 8 QUESTIONS CORRECT</small>
                </article>
                <article>
                  <span>RUN DETAILS</span>
                  <strong>{millionaire.lifelinesUsed}<small> LIFELINES</small></strong>
                  <small>{millionaireTimeLabel(millionaire.timeRemainingMs)} REMAINING · {millionaire.outcome.replace("-", " ").toUpperCase()}</small>
                </article>
              </div>
              {millionaireQuestions.length ? (
                <section className="mlb-millionaire-recap">
                  <header>
                    <span>QUESTION RECAP</span>
                    <h3>How the run unfolded</h3>
                  </header>
                  <div className="mlb-millionaire-recap__questions">
                    {millionaireQuestions
                      .filter((row) => row.status !== "detail-unavailable")
                      .map((row) => {
                        const selected = row.selectedChoiceIds
                          .map((id) => row.choices.find((choice) => choice.id === id)?.text ?? id)
                          .join(" → ");
                        const correct = row.choices.find((choice) => choice.id === row.correctChoiceId)?.text ?? row.correctChoiceId;
                        const statusLabel = row.status === "correct"
                          ? "CORRECT"
                          : row.status === "wrong"
                            ? "MISS"
                            : row.status === "walked-away"
                              ? "WALKED"
                              : row.status === "timeout"
                                ? "TIME"
                                : "UNREACHED";
                        const expandable = row.status !== "unreached";
                        const summary = (
                          <>
                            <b>Q{row.index + 1}</b>
                            <span><strong>{row.prompt}</strong></span>
                            <em>{statusLabel}</em>
                          </>
                        );
                        if (!expandable) {
                          return <div className="mlb-millionaire-recap__row is-unreached" key={row.index}>{summary}</div>;
                        }
                        return (
                          <details
                            className={`mlb-millionaire-recap__row is-${row.status}`}
                            key={row.index}
                            open={row.status === "wrong"}
                          >
                            <summary>{summary}</summary>
                            <div className="mlb-millionaire-recap__detail">
                              <div className="mlb-millionaire-recap__choices">
                                {row.choices.map((choice, choiceIndex) => {
                                  const picked = row.selectedChoiceIds.includes(choice.id);
                                  const isCorrect = choice.id === row.correctChoiceId;
                                  return (
                                    <div
                                      className={[
                                        picked ? "is-selected" : "",
                                        isCorrect ? "is-correct" : "",
                                        picked && !isCorrect ? "is-wrong" : "",
                                      ].filter(Boolean).join(" ")}
                                      key={choice.id}
                                    >
                                      <b>{["A", "B", "C", "D"][choiceIndex] ?? choice.id}</b>
                                      <span>{choice.text}</span>
                                      <em>{isCorrect ? "CORRECT" : picked ? "PICKED" : ""}</em>
                                    </div>
                                  );
                                })}
                              </div>
                              {row.lifelines.length ? (
                                <div className="mlb-millionaire-recap__tags">
                                  {row.lifelines.map((value) => <span key={value}>{value.replace(/[-_]/g, " ").toUpperCase()}</span>)}
                                </div>
                              ) : null}
                              {row.explanation ? <p>{row.explanation}</p> : null}
                              {!selected && row.status === "wrong" ? <small>Historical pick was not stored.</small> : null}
                              {row.status === "wrong" && correct ? <small>ANSWER · {correct}</small> : null}
                            </div>
                          </details>
                        );
                      })}
                  </div>
                  {millionaireLegacyDetailLimited && millionaireLegacyFirstMiss ? (
                    <div className="mlb-millionaire-recap__legacy">
                      <span>RECOVERY</span>
                      <strong>{millionaireLegacyRecoveryCorrect} / {millionaireLegacyRecoveryTotal} correct after the first miss</strong>
                      <p>Individual recovery answers were not stored for this earlier run.</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </>
          ) : isWavelength && wavelengthRounds.length ? (
            <div className="mlb-play-result-card__games">
              {wavelengthRounds.map((round) => (
                <article key={round.round}>
                  <span>GAME {round.round}</span>
                  <strong>{round.score}<small>/100</small></strong>
                  <small>HIDDEN {round.target} · FINAL {round.finalGuess}</small>
                  {round.guesses.length ? <small>PATH {round.guesses.join(" → ")}</small> : null}
                </article>
              ))}
            </div>
          ) : isWhoAmI && whoAmIRounds.length ? (
            <div className="mlb-play-result-card__games">
              {whoAmIRounds.map((round) => (
                <article key={round.round}>
                  <span>ROUND {round.round}</span>
                  <strong>{round.score}<small>/100</small></strong>
                  <small>{round.identityName.toUpperCase()} · {round.cluesUsed} CLUES · {round.outcome.replace("_", " ").toUpperCase()}</small>
                  {round.wrongGuesses || round.recoveryMisses
                    ? <small>{round.wrongGuesses} NATURAL MISSES · {round.recoveryMisses} RECOVERY MISSES</small>
                    : null}
                </article>
              ))}
            </div>
          ) : isBlindResume && blindResumeRounds.length ? (
            <div className="mlb-play-result-card__games">
              {blindResumeRounds.map((round) => (
                <article key={round.round}>
                  <span>ROUND {round.round}</span>
                  <strong>+{round.points}</strong>
                  <small>{round.correct ? "CORRECT" : "MISS"} · {round.revealedCount} STATS SHOWN</small>
                  <small>PICK {round.pickedName.toUpperCase()} · WINNER {round.winnerName.toUpperCase()}</small>
                </article>
              ))}
            </div>
          ) : isHitTheNumber && hitTheNumberGames.length ? (
            <div className="mlb-play-result-card__games">
              {hitTheNumberGames.map((game) => (
                <article key={game.game}>
                  <span>GAME {game.game} · {game.metricLabel.toUpperCase()}</span>
                  <strong>{game.score}<small>/100</small></strong>
                  <small>
                    {game.status === "perfect"
                      ? `PERFECT · ${game.total.toLocaleString()} / ${game.target.toLocaleString()}`
                      : game.status === "bust"
                        ? `BUST · ${game.total.toLocaleString()} / ${game.target.toLocaleString()}`
                        : `${game.distance.toLocaleString()} UNDER · ${game.total.toLocaleString()} / ${game.target.toLocaleString()}`}
                  </small>
                  {game.configurationLabel ? <small>{game.configurationLabel.toUpperCase()}</small> : null}
                  {game.selections.length ? (
                    <small>
                      {game.selections.map((selection) => `${selection.name.toUpperCase()} ${selection.value.toLocaleString()}`).join(" · ")}
                    </small>
                  ) : null}
                </article>
              ))}
            </div>
          ) : isSportsFeud ? (
            <div className="leaderboard-game-result leaderboard-game-result--feud">
              <section className="leaderboard-game-result__hero">
                <div>
                  <span>SPORTS FEUD</span>
                  <strong>{entry.rawScore}</strong>
                  <small>HQ SCORE</small>
                </div>
                <dl>
                  <div><dt>Main boards</dt><dd>{sportsFeud.mainPoints} / 60</dd></div>
                  <div><dt>Fast Money</dt><dd>{sportsFeud.fastPoints} / 40</dd></div>
                  <div>
                    <dt>Time left</dt>
                    <dd>{Math.max(0, Math.ceil(Number(entry.publicResult.fast_money_time_remaining_ms ?? 0) / 1000))}s</dd>
                  </div>
                </dl>
              </section>

              <div className="leaderboard-game-result__boards">
                {sportsFeud.boards.map((board) => (
                  <section className="leaderboard-feud-board" key={board.round}>
                    <header>
                      <div>
                        <span>MAIN BOARD {board.round}</span>
                        <h3>{board.prompt}</h3>
                      </div>
                      <div>
                        <strong>{board.points}/30</strong>
                        <small>{board.strikes} STRIKES</small>
                      </div>
                    </header>
                    <div className="leaderboard-feud-board__answers">
                      {board.answers.map((answer) => (
                        <div
                          className={answer.found ? "is-found" : "is-missed"}
                          key={answer.rank}
                        >
                          <b>{answer.rank}</b>
                          <span><strong>{answer.name}</strong></span>
                          <em>{answer.points}</em>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <section className="leaderboard-fast-money">
                <header>
                  <div><span>FAST MONEY</span><h3>Five answers. One clock.</h3></div>
                  <strong>{sportsFeud.fastPoints}/40</strong>
                </header>
                <div>
                  {sportsFeud.results.map((row) => (
                    <article key={row.index}>
                      <b>{row.index}</b>
                      <div>
                        <small>{row.prompt}</small>
                        <strong>{row.answer}</strong>
                      </div>
                      <span><strong>{row.points} PTS</strong></span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : isBarTrivia ? (
            <div className="mlb-play-result-card__games">
              <article>
                <span>QUESTIONS</span>
                <strong>{barTrivia.correctCount}<small>/10</small></strong>
                <small>BEST STREAK · {barTrivia.bestStreak}</small>
              </article>
              <article>
                <span>LAST CALL</span>
                <strong>{barTrivia.wager}<small> PT WAGER</small></strong>
                <small>{barTrivia.doubleRound.replace("round", "ROUND ").toUpperCase()} · DOUBLE ROUND</small>
              </article>
            </div>
          ) : isAverageFan ? (
            <>
              <div className="mlb-play-result-card__games">
                <article>
                  <span>BOARD</span>
                  <strong>{averageFan.boardScore}<small>/90</small></strong>
                  <small>{averageFan.boardClears} / 8 CLEARS · {averageFan.saves} SAVES</small>
                </article>
                <article>
                  <span>FINAL</span>
                  <strong>{averageFan.finalOutcome ? averageFan.finalOutcome.replace("-", " ").toUpperCase() : "—"}</strong>
                  <small>FAN · {averageFan.fan || "—"}</small>
                </article>
              </div>
              {averageFan.resolved.length ? (
                <div className="mlb-play-result-card__games">
                  {averageFan.resolved.map((row, index) => (
                    <article key={String(row.id ?? index)}>
                      <span>Q{Number(row.order ?? index + 1)} · GRADE {Number(row.grade ?? 0)} · {String(row.subject ?? "")}</span>
                      <strong>{row.correct === true ? "CORRECT" : row.saved === true ? "SAVED" : "MISS"}</strong>
                      <small>{String(row.prompt ?? "")}</small>
                      <small>PLAYER · {String(row.player_answer ?? "—")}</small>
                      <small>FAN · {String(row.fan_answer ?? "—")}</small>
                      <small>ANSWER · {String(row.correct_answer ?? "—")}</small>
                      {row.peek_used === true || row.copied === true || row.save_consumed === true
                        ? <small>{[
                            row.peek_used === true ? "PEEK" : "",
                            row.copied === true ? "COPY" : "",
                            row.save_consumed === true ? (row.saved === true ? "SAVE WORKED" : "SAVE USED") : "",
                          ].filter(Boolean).join(" · ")}</small>
                        : null}
                    </article>
                  ))}
                </div>
              ) : null}
              {Object.keys(averageFan.finalQuestion).length ? (
                <div className="mlb-play-result-card__games">
                  <article>
                    <span>FINAL · {String(averageFan.finalQuestion.subject ?? "")}</span>
                    <strong>{averageFan.finalOutcome.replace("-", " ").toUpperCase()}</strong>
                    <small>{String(averageFan.finalQuestion.prompt ?? "")}</small>
                    {averageFan.finalPlayerAnswer ? <small>PLAYER · {averageFan.finalPlayerAnswer}</small> : null}
                    <small>ANSWER · {String(averageFan.finalQuestion.correct_answer ?? "—")}</small>
                  </article>
                </div>
              ) : null}
            </>
          ) : games.length ? (
            <div className="mlb-play-result-card__games">
              {games.map((game) => (
                <article key={game.game}>
                  <span>GAME {game.game}</span>
                  <strong>{game.score}<small>/100</small></strong>
                  <small>
                    {game.perfect
                      ? "9 SAFE · PERFECT BOARD"
                      : `${game.safeCount} SAFE · LEADER PICKED${game.fatalName ? ` · ${game.fatalName}` : ""}`}
                  </small>
                </article>
              ))}
            </div>
          ) : null}

          <p>
            {isMillionaire
              ? "Reach Q8 clean: walk with 90, miss for 85, or hit for 100 before 2-point lifeline deductions. After an earlier miss, recovery scoring continues through Q8."
              : isWavelength
                ? "The challenge score is the average of both Wavelength games."
                : isWhoAmI
                  ? "The challenge score is the average of both Who Am I rounds."
                  : isBlindResume
                    ? "The challenge score is the total earned across all five Blind Resume rounds."
                    : isHitTheNumber
                      ? "The challenge score is the average of both Hit the Number games."
                      : isSportsFeud
                        ? `The challenge score is ${sportsFeud.mainPoints}/60 from the two main boards plus ${sportsFeud.fastPoints}/40 from Fast Money.`
                        : isAverageFan
                          ? "Average Fan keeps the board score when you walk, adds 10 for a correct Final, and subtracts 10 for a Final miss."
                          : "The challenge score is the average of both Find the Leader boards."}
          </p>
        </section>
      </div>
    </div>
  );
}

function MlbPlayStandings({ championship }: { championship: MlbChampionship | null }) {
  const standings = useMemo(() => {
    if (!championship) return [];
    return [...championship.standings].sort((left, right) => (
      left.play_rank - right.play_rank
      || right.play_points - left.play_points
      || left.display_name.localeCompare(right.display_name)
    ));
  }, [championship]);

  const rankCounts = useMemo(() => {
    const counts = new Map<number, number>();
    standings.forEach((entry) => counts.set(entry.play_rank, (counts.get(entry.play_rank) ?? 0) + 1));
    return counts;
  }, [standings]);

  return (
    <section className="mlb-play-standings" aria-label="MLB Play standings">
      <header>
        <div>
          <p className="eyebrow">PLAY STANDINGS</p>
          <h2>Postseason challenge race</h2>
        </div>
        <span>25 PTS</span>
      </header>

      {standings.length ? (
        <div className="mlb-play-standings__rows">
          {standings.map((entry) => (
            <div
              className={`mlb-play-standings__row${entry.is_current_user ? " is-current" : ""}`}
              key={entry.profile_id}
            >
              <b>{rankCounts.get(entry.play_rank)! > 1 ? `T-${entry.play_rank}` : `#${entry.play_rank}`}</b>
              <strong>{entry.display_name}</strong>
              <span>
                <b>{formatChampionshipPoints(entry.play_points)}</b>
                <small>/ {championship?.playMax ?? 25}</small>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="today-hub-empty">Play standings will populate when the postseason challenges begin.</p>
      )}

      <footer>16 CHALLENGES · PLACEMENT POINTS FEED THE MLB CHAMPIONSHIP</footer>
    </section>
  );
}

export default function MlbPlayoffsPage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const signedIn = Boolean(identity.profile);
  const { hub: liveHub, loading } = useMlbPlayoffs(signedIn);
  const { championship: liveChampionship } = useMlbChampionship(signedIn);
  const previewMode = identity.profile?.canControlPicks === true
    && (!liveHub || !liveHub.fieldReady);
  const hub = previewMode ? MLB_OWNER_PREVIEW_HUB : liveHub;
  const championship = previewMode ? MLB_OWNER_PREVIEW_CHAMPIONSHIP : liveChampionship;
  const challenge = hub?.featuredChallenge ?? null;
  const challengePlayable = challenge?.ready === true && challenge?.is_live === true;

  const carouselRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<"challenge" | "leaderboard">("challenge");
  const [overview, setOverview] = useState<MlbPlayChallengeOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!challenge || !identity.profile || !challengePlayable) {
      setOverview(null);
      return;
    }

    if (previewMode) {
      setOverview(previewOverview(challenge.id, identity.profile.displayName, identity.profile.initials));
      return;
    }

    let active = true;
    setOverviewLoading(true);
    void loadMlbPlayChallengeOverview(hub?.season ?? 2026, challenge.id)
      .then((next) => {
        if (active) setOverview(next);
      })
      .catch(() => {
        if (active) setOverview(null);
      })
      .finally(() => {
        if (active) setOverviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [challenge, challengePlayable, hub?.season, identity.profile, previewMode]);

  const selectedEntry = overview?.entries.find((entry) => entry.profileId === selectedProfileId) ?? null;
  const completed = Boolean(overview?.ownResult);

  const showPanel = (nextPanel: "challenge" | "leaderboard") => {
    const carousel = carouselRef.current;
    const targetLeft = carousel ? carousel.clientWidth * (nextPanel === "leaderboard" ? 1 : 0) : 0;
    if (carousel && typeof carousel.scrollTo === "function") {
      carousel.scrollTo({ left: targetLeft, behavior: "smooth" });
    } else if (carousel) {
      carousel.scrollLeft = targetLeft;
    }
    setPanel(nextPanel);
  };

  const updatePanelFromScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel?.clientWidth) return;
    const nextPanel = carousel.scrollLeft >= carousel.clientWidth / 2 ? "leaderboard" : "challenge";
    setPanel((current) => current === nextPanel ? current : nextPanel);
  };

  if (selectedEntry && challenge) {
    return (
      <MlbPlayResultDetail
        entry={selectedEntry}
        challengeTitle={challenge.title}
        challengeKey={challenge.id}
        challengeDate={challenge.date ?? ""}
        onClose={() => setSelectedProfileId(null)}
      />
    );
  }

  return (
    <div className="page mlb-play-page">
      <section className="play-landing-heading mlb-play-page__heading">
        <h1>Play</h1>
        <p>Postseason challenges.</p>
      </section>

      {challenge ? (
        <section className="today-hub mlb-play-hub" data-sport="mlb">
          <div
            className="today-hub__carousel"
            ref={carouselRef}
            onScroll={updatePanelFromScroll}
            aria-label="MLB Playoff Challenge and leaderboard"
          >
            <button
              className="today-hub-card"
              type="button"
              disabled={!challengePlayable}
              onClick={() => {
                if (challengePlayable) navigate(challenge.route);
              }}
            >
              <div className="today-hub-card__topline">
                <span>MLB PLAYOFF CHALLENGE</span>
                <b>{challengeDateLabel(challenge.date)}</b>
              </div>
              <div className="today-hub-card__body">
                <small>{completed && overview?.ownResult
                  ? `OFFICIAL RESULT · ${overview.ownResult.rawScore}`
                  : !challenge.is_live
                    ? `OPENS ${challengeDateLabel(challenge.date)}`
                    : !challenge.ready
                      ? "COMING SOON"
                      : "OFFICIAL PLAYOFF CHALLENGE"}</small>
                <h2>{challenge.title}</h2>
                <p>{challenge.description}</p>
              </div>
              <em>{challengePlayable
                ? completed ? "VIEW CHALLENGE" : "PLAY CHALLENGE"
                : "COMING SOON"} →</em>
              <span className="today-hub-card__swipe">SWIPE FOR CHALLENGE LEADERBOARD →</span>
            </button>

            <div className="today-hub-leaderboard">
              <header>
                <div>
                  <p className="eyebrow">CHALLENGE LEADERBOARD</p>
                  <h2>{challenge.title}</h2>
                </div>
                <span>{overview?.unlocked ? `${overview.playerCount} PLAYERS` : "LOCKED"}</span>
              </header>

              {!challengePlayable ? (
                <p className="today-hub-empty">This challenge unlocks on its scheduled date.</p>
              ) : overviewLoading && !overview ? (
                <p className="today-hub-empty">Loading challenge leaderboard…</p>
              ) : !overview?.unlocked ? (
                <p className="today-hub-empty">Finish this challenge to unlock the leaderboard and everyone’s completed result.</p>
              ) : overview.entries.length ? (
                <div className="today-hub-leaderboard__rows">
                  {overview.entries.map((entry) => (
                    <button
                      className={`today-hub-leaderboard__row${entry.isCurrentUser ? " is-current" : ""}`}
                      key={entry.profileId}
                      type="button"
                      aria-label={`View ${entry.displayName}'s challenge result`}
                      onClick={() => setSelectedProfileId(entry.profileId)}
                    >
                      <b>#{entry.rank}</b>
                      <strong>{entry.displayName}</strong>
                      <small>{entry.rawScore}</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="today-hub-empty">No completed results yet.</p>
              )}
              <small className="today-hub-leaderboard__swipe">← SWIPE FOR CHALLENGE</small>
            </div>
          </div>

          <div className="today-hub__pager" aria-label="MLB Play challenge carousel controls">
            <button
              className={panel === "challenge" ? "is-active" : ""}
              type="button"
              aria-label="Show challenge"
              aria-pressed={panel === "challenge"}
              onClick={() => showPanel("challenge")}
            >
              <span>GAME</span>
            </button>
            <button
              className={panel === "leaderboard" ? "is-active" : ""}
              type="button"
              aria-label="Show challenge leaderboard"
              aria-pressed={panel === "leaderboard"}
              onClick={() => showPanel("leaderboard")}
            >
              <span>LEADERBOARD</span>
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="today-hub-loading mlb-play-loading">
          <span />
          <strong>Loading MLB Play…</strong>
        </section>
      ) : (
        <section className="today-hub-gate mlb-play-loading">
          <div>
            <p className="eyebrow">MLB PLAYOFFS</p>
            <h2>Next challenge coming soon.</h2>
          </div>
        </section>
      )}

      <MlbPlayStandings championship={championship} />
    </div>
  );
}
