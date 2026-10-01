import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks";
import {
  AVERAGE_FAN_BOARD_QUESTION_COUNT,
  AVERAGE_FAN_PLAYABLE_GRADES,
  averageFanQuestionEligibleForBoard,
  averageFanQuestionEligibleForFinal,
  type AverageFanQuestion,
  type AverageFanSport,
} from "../games/averageFanEngine";
import { stableLineupHash } from "./lineupModel";

type AverageFanCasualSport = Exclude<AverageFanSport, "mlb">;

export interface AverageFanCasualBoard {
  sport: AverageFanCasualSport;
  questions: readonly AverageFanQuestion[];
  finalQuestion: AverageFanQuestion;
}

function deterministicRank(seed: string, question: AverageFanQuestion) {
  return stableLineupHash(`average-fan-casual-v1|${seed}|${question.id}`);
}

function rankCandidates(
  questions: readonly AverageFanQuestion[],
  seed: string,
) {
  return [...questions].sort((left, right) => (
    deterministicRank(seed, left) - deterministicRank(seed, right)
    || left.id.localeCompare(right.id)
  ));
}

export function buildAverageFanCasualBoard(
  sport: AverageFanCasualSport,
  seed: string,
  now: Date | string = new Date(),
): AverageFanCasualBoard {
  const bank = AVERAGE_FAN_CONTENT_BANKS[sport] as readonly AverageFanQuestion[];
  const boardEligible = bank.filter((question) => averageFanQuestionEligibleForBoard(question, now));
  const finalEligible = bank.filter((question) => averageFanQuestionEligibleForFinal(question, now));

  const currentEvent = rankCandidates(
    boardEligible.filter((question) => question.contentType === "current-event"),
    `${seed}|current-event`,
  )[0] ?? null;

  const boardPool = boardEligible.filter((question) => (
    question.contentType === "evergreen" || question.id === currentEvent?.id
  ));
  const selected: AverageFanQuestion[] = [];
  const subjectCounts = new Map<string, number>();

  for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
    const gradeSelected: AverageFanQuestion[] = [];
    if (currentEvent?.grade === grade) {
      gradeSelected.push(currentEvent);
      subjectCounts.set(
        currentEvent.subject,
        (subjectCounts.get(currentEvent.subject) ?? 0) + 1,
      );
    }

    while (gradeSelected.length < 2) {
      const candidates = rankCandidates(
        boardPool.filter((question) => (
          question.grade === grade
          && !gradeSelected.some((picked) => picked.id === question.id)
          && !selected.some((picked) => picked.id === question.id)
        )),
        `${seed}|grade-${grade}|pick-${gradeSelected.length}`,
      ).sort((left, right) => {
        const subjectDelta = (subjectCounts.get(left.subject) ?? 0)
          - (subjectCounts.get(right.subject) ?? 0);
        if (subjectDelta !== 0) return subjectDelta;

        const leftSubjectRepeat = gradeSelected.some((question) => question.subject === left.subject) ? 1 : 0;
        const rightSubjectRepeat = gradeSelected.some((question) => question.subject === right.subject) ? 1 : 0;
        if (leftSubjectRepeat !== rightSubjectRepeat) return leftSubjectRepeat - rightSubjectRepeat;

        if (grade <= 3) {
          const leftShortAnswer = left.format === "short-answer" ? 1 : 0;
          const rightShortAnswer = right.format === "short-answer" ? 1 : 0;
          if (leftShortAnswer !== rightShortAnswer) return leftShortAnswer - rightShortAnswer;
          const difficultyDelta = left.difficultyNudge - right.difficultyNudge;
          if (difficultyDelta !== 0) return difficultyDelta;
        }

        const leftFormatRepeat = gradeSelected.some((question) => question.format === left.format) ? 1 : 0;
        const rightFormatRepeat = gradeSelected.some((question) => question.format === right.format) ? 1 : 0;
        if (leftFormatRepeat !== rightFormatRepeat) return leftFormatRepeat - rightFormatRepeat;

        return deterministicRank(`${seed}|grade-${grade}`, left)
          - deterministicRank(`${seed}|grade-${grade}`, right)
          || left.id.localeCompare(right.id);
      });

      const next = candidates[0];
      if (!next) {
        throw new Error(`Average Fan ${sport} grade ${grade} cannot build two active Casual questions.`);
      }
      gradeSelected.push(next);
      subjectCounts.set(next.subject, (subjectCounts.get(next.subject) ?? 0) + 1);
    }

    selected.push(...gradeSelected);
  }

  if (selected.length !== AVERAGE_FAN_BOARD_QUESTION_COUNT || new Set(selected.map((question) => question.id)).size !== AVERAGE_FAN_BOARD_QUESTION_COUNT) {
    throw new Error("Average Fan Casual board must contain eight unique questions.");
  }

  const evergreenFinals = finalEligible.filter((question) => question.contentType === "evergreen");
  const finalQuestion = rankCandidates(
    evergreenFinals.length ? evergreenFinals : finalEligible,
    `${seed}|final`,
  )[0];
  if (!finalQuestion) {
    throw new Error(`Average Fan ${sport} does not have an active protected Final.`);
  }

  return { sport, questions: selected, finalQuestion };
}
