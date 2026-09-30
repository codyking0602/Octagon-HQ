import { stableLineupHash } from "../play/lineupModel";
import {
  isTriviaContentActive,
  type TriviaContentType,
} from "./triviaContentExpiry";

export const AVERAGE_FAN_GAME_ID = "average-fan" as const;
export const AVERAGE_FAN_CONTENT_VERSION = "average-fan-v1" as const;
export const AVERAGE_FAN_FANS = ["cody", "shane", "troy", "tyler", "lib"] as const;
export const AVERAGE_FAN_GRADES = [1, 2, 3, 4, 5] as const;
export const AVERAGE_FAN_FORMATS = ["short-answer", "four-choice", "true-false"] as const;

export type AverageFanFan = (typeof AVERAGE_FAN_FANS)[number];
export type AverageFanGrade = (typeof AVERAGE_FAN_GRADES)[number];
export type AverageFanQuestionFormat = (typeof AVERAGE_FAN_FORMATS)[number];
export type AverageFanSport = "nfl" | "cfb" | "ufc";

export const AVERAGE_FAN_SUBJECTS = {
  nfl: ["Players", "Teams", "NFL History", "X’s & O’s"],
  cfb: ["Players", "Programs", "Traditions", "CFB History"],
  ufc: ["Fighters", "Fights", "Championships", "Octagon IQ"],
} as const;

export type AverageFanSubject =
  | (typeof AVERAGE_FAN_SUBJECTS.nfl)[number]
  | (typeof AVERAGE_FAN_SUBJECTS.cfb)[number]
  | (typeof AVERAGE_FAN_SUBJECTS.ufc)[number];

export type AverageFanReportGrade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C";

export const AVERAGE_FAN_BASE_ACCURACY = {
  1: 93,
  2: 88,
  3: 82,
  4: 76,
  5: 70,
} as const satisfies Record<AverageFanGrade, number>;

export const AVERAGE_FAN_REPORT_GRADE_MODIFIER = {
  "A+": 10,
  A: 7,
  "A-": 4,
  "B+": 2,
  B: 0,
  "B-": -2,
  "C+": -5,
  C: -8,
} as const satisfies Record<AverageFanReportGrade, number>;

type ReportCards = {
  [S in AverageFanSport]: Record<
    AverageFanFan,
    Record<(typeof AVERAGE_FAN_SUBJECTS)[S][number], AverageFanReportGrade>
  >;
};

export const AVERAGE_FAN_REPORT_CARDS = {
  nfl: {
    cody: { Players: "A", Teams: "B+", "NFL History": "A-", "X’s & O’s": "B-" },
    shane: { Players: "A+", Teams: "B", "NFL History": "B+", "X’s & O’s": "C+" },
    troy: { Players: "B+", Teams: "A-", "NFL History": "B", "X’s & O’s": "A" },
    tyler: { Players: "B", Teams: "B+", "NFL History": "A", "X’s & O’s": "A-" },
    lib: { Players: "A-", Teams: "A", "NFL History": "C+", "X’s & O’s": "B" },
  },
  cfb: {
    cody: { Players: "A", Programs: "A-", Traditions: "B+", "CFB History": "B" },
    shane: { Players: "A+", Programs: "B+", Traditions: "B", "CFB History": "C+" },
    troy: { Players: "B+", Programs: "A", Traditions: "A-", "CFB History": "B" },
    tyler: { Players: "B", Programs: "A-", Traditions: "A+", "CFB History": "B+" },
    lib: { Players: "A-", Programs: "A", Traditions: "B+", "CFB History": "C+" },
  },
  ufc: {
    cody: { Fighters: "A", Fights: "A-", Championships: "A", "Octagon IQ": "B" },
    shane: { Fighters: "A+", Fights: "A", Championships: "A-", "Octagon IQ": "C+" },
    troy: { Fighters: "B+", Fights: "A", Championships: "B+", "Octagon IQ": "A-" },
    tyler: { Fighters: "A-", Fights: "B+", Championships: "A", "Octagon IQ": "B" },
    lib: { Fighters: "A", Fights: "B+", Championships: "B", "Octagon IQ": "C+" },
  },
} as const satisfies ReportCards;

export interface AverageFanQuestion {
  id: string;
  sport: AverageFanSport;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  format: AverageFanQuestionFormat;
  prompt: string;
  answer: string;
  aliases: readonly string[];
  choices?: readonly [string, string, string, string];
  explanation: string;
  contentType: TriviaContentType;
  activeFrom?: string;
  expiresAt?: string;
  difficultyNudge: number;
  fanMisses?: readonly string[];
  protectedFinal: boolean;
  sourceId?: string;
  sourceUrl?: string;
  verifiedAt?: string;
}

export interface AverageFanPublicQuestion {
  id: string;
  sport: AverageFanSport;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  format: AverageFanQuestionFormat;
  prompt: string;
  choices?: readonly [string, string, string, string];
}

export interface AverageFanFanAnswer {
  fan: AverageFanFan;
  answer: string;
  correct: boolean;
  accuracy: number;
}

export type AverageFanFinalOutcome = "walk-away" | "correct" | "wrong";

function nonEmpty(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function reportRow(sport: AverageFanSport, fan: AverageFanFan) {
  return AVERAGE_FAN_REPORT_CARDS[sport][fan] as Record<string, AverageFanReportGrade>;
}

function subjectList(sport: AverageFanSport) {
  return AVERAGE_FAN_SUBJECTS[sport] as readonly string[];
}

export function averageFanCenteredSubjectModifier(
  sport: AverageFanSport,
  fan: AverageFanFan,
  subject: AverageFanSubject,
) {
  const subjects = subjectList(sport);
  if (!subjects.includes(subject)) {
    throw new Error(`Average Fan subject ${subject} does not belong to ${sport}.`);
  }
  const row = reportRow(sport, fan);
  const raw = subjects.map((name) => AVERAGE_FAN_REPORT_GRADE_MODIFIER[row[name]!]);
  const mean = raw.reduce<number>((sum, value) => sum + value, 0) / raw.length;
  return AVERAGE_FAN_REPORT_GRADE_MODIFIER[row[subject]!] - mean;
}

export function averageFanFanAccuracy(
  question: Pick<AverageFanQuestion, "sport" | "grade" | "subject" | "difficultyNudge">,
  fan: AverageFanFan,
) {
  const base = AVERAGE_FAN_BASE_ACCURACY[question.grade];
  const subjectModifier = averageFanCenteredSubjectModifier(
    question.sport,
    fan,
    question.subject,
  );
  // difficultyNudge is difficulty-signed: +3 is harder, -3 is easier.
  const raw = base + subjectModifier - question.difficultyNudge;
  return Math.max(55, Math.min(98, raw));
}

export function averageFanAnswersMatch(
  question: Pick<AverageFanQuestion, "answer" | "aliases">,
  value: string,
) {
  const candidate = normalizeAnswer(value);
  return [question.answer, ...question.aliases]
    .some((accepted) => normalizeAnswer(accepted) === candidate);
}

export function validateAverageFanQuestion(question: AverageFanQuestion): string[] {
  const errors: string[] = [];
  const subjects = subjectList(question.sport);
  const aliases = question.aliases.map(normalizeAnswer);
  const normalizedAnswer = normalizeAnswer(question.answer);

  if (!nonEmpty(question.id)) errors.push("id must be non-empty");
  if (!subjects.includes(question.subject)) errors.push("subject must belong to the selected sport");
  if (!AVERAGE_FAN_GRADES.includes(question.grade)) errors.push("grade must be 1 through 5");
  if (!AVERAGE_FAN_FORMATS.includes(question.format)) errors.push("format is unsupported");
  if (!nonEmpty(question.prompt)) errors.push("prompt must be non-empty");
  if (!nonEmpty(question.answer)) errors.push("answer must be non-empty");
  if (!nonEmpty(question.explanation)) errors.push("explanation must be non-empty");
  if (!Number.isFinite(question.difficultyNudge) || question.difficultyNudge < -3 || question.difficultyNudge > 3) {
    errors.push("difficultyNudge must be between -3 and +3 percentage points");
  }
  if (new Set(aliases).size !== aliases.length) errors.push("aliases must be unique");
  if (aliases.includes(normalizedAnswer)) errors.push("aliases must not repeat the canonical answer");

  if (question.protectedFinal && question.grade !== 5) {
    errors.push("protected Final questions must be grade 5");
  }

  if (question.contentType === "current-event") {
    if (!nonEmpty(question.expiresAt)) {
      errors.push("current-event questions must include expiresAt");
    } else if (Number.isNaN(new Date(question.expiresAt!).getTime())) {
      errors.push("expiresAt must be a valid date");
    }
    if (question.activeFrom && Number.isNaN(new Date(question.activeFrom).getTime())) {
      errors.push("activeFrom must be a valid date");
    }
    if (question.activeFrom && question.expiresAt) {
      const starts = new Date(question.activeFrom).getTime();
      const expires = new Date(question.expiresAt).getTime();
      if (Number.isFinite(starts) && Number.isFinite(expires) && expires < starts) {
        errors.push("expiresAt must not be earlier than activeFrom");
      }
    }
  }

  if (question.format === "short-answer") {
    if (question.choices) errors.push("short-answer questions must not define choices");
    if (!question.fanMisses || question.fanMisses.length < 1 || question.fanMisses.length > 3) {
      errors.push("short-answer questions must author 1-3 plausible fan misses");
    } else {
      const misses = question.fanMisses.map(normalizeAnswer);
      if (new Set(misses).size !== misses.length) errors.push("fan misses must be unique");
      if (misses.some((miss) => miss === normalizedAnswer || aliases.includes(miss))) {
        errors.push("fan misses must not match an accepted answer");
      }
    }
  }

  if (question.format === "four-choice") {
    if (!question.choices || question.choices.length !== 4) {
      errors.push("four-choice questions must define exactly four choices");
    } else {
      const choices = question.choices.map(normalizeAnswer);
      if (new Set(choices).size !== 4) errors.push("four-choice choices must be unique");
      if (!choices.includes(normalizedAnswer)) {
        errors.push("four-choice choices must include the canonical answer");
      }
    }
    if (question.fanMisses?.length) errors.push("four-choice questions use authored choices instead of fanMisses");
  }

  if (question.format === "true-false") {
    if (question.choices) errors.push("true-false questions must not define choices");
    if (normalizedAnswer !== "true" && normalizedAnswer !== "false") {
      errors.push("true-false answer must be True or False");
    }
    if (question.fanMisses?.length) errors.push("true-false questions use the opposite truth value instead of fanMisses");
  }

  return errors;
}

export function assertAverageFanQuestion(question: AverageFanQuestion) {
  const errors = validateAverageFanQuestion(question);
  if (errors.length) {
    throw new Error(`Invalid Average Fan question ${question.id || "<unknown>"}: ${errors.join("; ")}`);
  }
  return question;
}

export function isAverageFanQuestionActive(
  question: Pick<AverageFanQuestion, "contentType" | "activeFrom" | "expiresAt">,
  now: Date | string = new Date(),
) {
  return isTriviaContentActive(question, now);
}

export function averageFanQuestionEligibleForBoard(
  question: AverageFanQuestion,
  now: Date | string = new Date(),
) {
  return !question.protectedFinal && isAverageFanQuestionActive(question, now);
}

export function averageFanQuestionEligibleForFinal(
  question: AverageFanQuestion,
  now: Date | string = new Date(),
) {
  return question.protectedFinal && isAverageFanQuestionActive(question, now);
}

export function averageFanPublicQuestion(question: AverageFanQuestion): AverageFanPublicQuestion {
  assertAverageFanQuestion(question);
  return {
    id: question.id,
    sport: question.sport,
    grade: question.grade,
    subject: question.subject,
    format: question.format,
    prompt: question.prompt,
    ...(question.choices ? { choices: question.choices } : {}),
  };
}

function deterministicUnit(...parts: string[]) {
  return stableLineupHash(parts.join("|")) / 4294967296;
}

function deterministicWrongAnswer(question: AverageFanQuestion, fan: AverageFanFan) {
  if (question.format === "true-false") {
    return normalizeAnswer(question.answer) === "true" ? "False" : "True";
  }

  const misses = question.format === "four-choice"
    ? question.choices!.filter((choice) => !averageFanAnswersMatch(question, choice))
    : question.fanMisses!;

  const index = Math.floor(
    deterministicUnit(AVERAGE_FAN_CONTENT_VERSION, "miss", question.id, fan) * misses.length,
  );
  return misses[index] ?? misses[0]!;
}

export function averageFanFanAnswer(
  question: AverageFanQuestion,
  fan: AverageFanFan,
): AverageFanFanAnswer {
  assertAverageFanQuestion(question);
  const accuracy = averageFanFanAccuracy(question, fan);
  const correct = deterministicUnit(
    AVERAGE_FAN_CONTENT_VERSION,
    "answer",
    question.id,
    fan,
  ) < accuracy / 100;

  return {
    fan,
    accuracy,
    correct,
    answer: correct ? question.answer : deterministicWrongAnswer(question, fan),
  };
}

export function scoreAverageFanBoard(unsavedMissQuestionNumbers: readonly number[]) {
  const misses = [...new Set(unsavedMissQuestionNumbers)].sort((a, b) => a - b);
  if (misses.some((value) => !Number.isInteger(value) || value < 1 || value > 10)) {
    throw new Error("Average Fan miss question numbers must be integers from 1 through 10.");
  }
  if (!misses.length) return 90;
  const raw = 64 + (2 * misses[0]!) - (5 * (misses.length - 1));
  return Math.max(0, Math.min(90, raw));
}

export function scoreAverageFanFinal(
  boardScore: number,
  outcome: AverageFanFinalOutcome,
) {
  const safeBoard = Math.max(0, Math.min(90, Math.round(boardScore)));
  if (outcome === "walk-away") return safeBoard;
  if (outcome === "correct") return Math.min(100, safeBoard + 10);
  return Math.max(0, safeBoard - 10);
}
