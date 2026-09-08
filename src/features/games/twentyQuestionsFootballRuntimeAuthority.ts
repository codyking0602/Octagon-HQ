import runtimeSnapshotJson from "./generated/twentyQuestionsFootballRuntime.json";
import type {
  TwentyQuestionsQuestion,
  TwentyQuestionsQuestionCost,
  TwentyQuestionsSubject,
  TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export const FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT = 100;
export const FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT = 20;
export const FOOTBALL_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT = 30;
export const FOOTBALL_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS = 360;

type FootballTwentyQuestionsLeague = "NFL" | "CFB";

type SnapshotSubject = {
  id: string;
  name: string;
  kind: "player" | "coach";
  league: FootballTwentyQuestionsLeague;
};

type SnapshotQuestion = {
  id: string;
  label: string;
  internalCost: number;
  answers: string;
};

type LeagueSnapshot = {
  league: FootballTwentyQuestionsLeague;
  sourceQuestionCount: number;
  subjects: SnapshotSubject[];
  questions: SnapshotQuestion[];
};

type RuntimeSnapshot = {
  version: number;
  categoryLimit: number;
  maxQuestions: number;
  NFL: LeagueSnapshot;
  CFB: LeagueSnapshot;
};

const runtimeSnapshot = runtimeSnapshotJson as unknown as RuntimeSnapshot;
const cache = new Map<FootballTwentyQuestionsLeague, TwentyQuestionsUniverse>();

function isQuestionCost(value: number): value is TwentyQuestionsQuestionCost {
  return value === 5 || value === 6 || value === 7 || value === 8;
}

function buildRuntimeUniverse(league: FootballTwentyQuestionsLeague): TwentyQuestionsUniverse {
  const snapshot = runtimeSnapshot[league];
  if (!snapshot || snapshot.league !== league) {
    throw new Error(`${league} 20 Questions runtime snapshot is unavailable.`);
  }
  if (runtimeSnapshot.categoryLimit !== FOOTBALL_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT) {
    throw new Error("Football 20 Questions runtime category limit is out of date.");
  }
  if (runtimeSnapshot.maxQuestions !== FOOTBALL_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS) {
    throw new Error("Football 20 Questions runtime maximum question count is out of date.");
  }

  const subjects: TwentyQuestionsSubject[] = snapshot.subjects.map((subject) => ({ ...subject }));
  const playerCount = subjects.filter((subject) => subject.kind === "player").length;
  const coachCount = subjects.filter((subject) => subject.kind === "coach").length;
  if (playerCount !== FOOTBALL_TWENTY_QUESTIONS_PLAYER_COUNT || coachCount !== FOOTBALL_TWENTY_QUESTIONS_COACH_COUNT) {
    throw new Error(`${league} 20 Questions runtime snapshot must contain 100 players and 20 head coaches.`);
  }
  if (new Set(subjects.map((subject) => subject.id)).size !== subjects.length) {
    throw new Error(`${league} 20 Questions runtime snapshot contains duplicate subject ids.`);
  }

  const subjectIndex = new Map(subjects.map((subject, index) => [subject.id, index]));
  const questions: TwentyQuestionsQuestion[] = snapshot.questions.map((question) => {
    if (!isQuestionCost(question.internalCost)) {
      throw new Error(`${league} 20 Questions runtime has an invalid score cost for ${question.id}.`);
    }
    if (question.answers.length !== subjects.length) {
      throw new Error(`${league} 20 Questions runtime answer map is incomplete for ${question.id}.`);
    }
    return {
      id: question.id,
      label: question.label,
      internalCost: question.internalCost,
      answer: (subjectId: string) => {
        const index = subjectIndex.get(subjectId);
        if (index == null) throw new Error(`Unknown ${league} 20 Questions subject: ${subjectId}`);
        return question.answers[index] === "1";
      },
    };
  });

  if (!questions.length || questions.length > FOOTBALL_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS) {
    throw new Error(`${league} 20 Questions runtime question bank is invalid.`);
  }

  return { league, subjects, questions };
}

export function getFootballTwentyQuestionsRuntimeUniverse(league: FootballTwentyQuestionsLeague) {
  const cached = cache.get(league);
  if (cached) return cached;
  const universe = buildRuntimeUniverse(league);
  cache.set(league, universe);
  return universe;
}
