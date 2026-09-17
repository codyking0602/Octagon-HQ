import type { PlaySport } from "../play/playRegistry";

export const MILLIONAIRE_GAME_ID = "millionaire" as const;
export type MillionaireGameId = typeof MILLIONAIRE_GAME_ID;
export type MillionaireSport = PlaySport;

export const MILLIONAIRE_LEVELS = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"] as const;
export type MillionaireLevel = (typeof MILLIONAIRE_LEVELS)[number];

export const MILLIONAIRE_MONEY_BY_LEVEL = {
  Q1: 500,
  Q2: 1_000,
  Q3: 5_000,
  Q4: 10_000,
  Q5: 50_000,
  Q6: 100_000,
  Q7: 500_000,
  Q8: 1_000_000,
} as const satisfies Record<MillionaireLevel, number>;

export const MILLIONAIRE_CHOICE_IDS = ["A", "B", "C", "D"] as const;
export type MillionaireChoiceId = (typeof MILLIONAIRE_CHOICE_IDS)[number];

export interface MillionaireChoice {
  id: MillionaireChoiceId;
  text: string;
}

export interface MillionaireFiftyFiftyAuthority {
  survivorChoiceIds: readonly [MillionaireChoiceId, MillionaireChoiceId];
  removalChoiceIds: readonly [MillionaireChoiceId, MillionaireChoiceId];
}

export interface MillionaireLifelineCompatibility {
  fiftyFifty: boolean;
  statSheet: boolean;
  doubleDip: boolean;
  notes?: string;
}

export interface MillionaireSourceAuthority {
  label: string;
  authority: string;
  url?: string;
  verifiedAt: string;
  notes?: string;
}

export type MillionaireVerificationStatus = "unverified" | "verified" | "disputed";
export type MillionaireEditorialReviewStatus = "draft" | "reviewed" | "approved";
export type MillionaireFactualReviewStatus = "pending" | "verified" | "blocked";
export type MillionaireDifficultyReviewStatus = "pending" | "calibrated" | "blocked";
export type MillionairePublicationReviewStatus = "blocked" | "approved";

export interface MillionaireQuestionReview {
  editorial: MillionaireEditorialReviewStatus;
  factual: MillionaireFactualReviewStatus;
  difficulty: MillionaireDifficultyReviewStatus;
  publication: MillionairePublicationReviewStatus;
}

export interface MillionaireQuestionTags {
  primarySubject: string;
  subjects: readonly string[];
  eras: readonly string[];
  categories: readonly string[];
  teams?: readonly string[];
  divisions?: readonly string[];
}

export interface MillionaireQuestionAuthorityRecord {
  id: string;
  sport: MillionaireSport;
  level: MillionaireLevel;
  money: number;
  type: string;
  prompt: string;
  choices: readonly [MillionaireChoice, MillionaireChoice, MillionaireChoice, MillionaireChoice];
  correctChoiceId: MillionaireChoiceId;
  distractorRationale: Partial<Record<MillionaireChoiceId, string>>;
  explanation: string;
  statSheet: string | null;
  fiftyFifty: MillionaireFiftyFiftyAuthority;
  lifelineCompatibility: MillionaireLifelineCompatibility;
  sources: readonly MillionaireSourceAuthority[];
  verification: {
    status: MillionaireVerificationStatus;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  };
  tags: MillionaireQuestionTags;
  review: MillionaireQuestionReview;
}

export interface MillionaireRuntimeQuestion {
  id: string;
  sport: MillionaireSport;
  level: MillionaireLevel;
  money: number;
  type: string;
  prompt: string;
  choices: readonly [MillionaireChoice, MillionaireChoice, MillionaireChoice, MillionaireChoice];
  correctChoiceId: MillionaireChoiceId;
  explanation: string;
  statSheet: string | null;
  fiftyFifty: MillionaireFiftyFiftyAuthority;
  lifelineCompatibility: MillionaireLifelineCompatibility;
}

export interface MillionairePublicQuestion {
  id: string;
  sport: MillionaireSport;
  level: MillionaireLevel;
  money: number;
  type: string;
  prompt: string;
  choices: readonly [MillionaireChoice, MillionaireChoice, MillionaireChoice, MillionaireChoice];
}

function nonEmpty(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function sameMembers(actual: readonly string[], expected: readonly string[]) {
  if (actual.length !== expected.length) return false;
  const left = [...actual].sort();
  const right = [...expected].sort();
  return left.every((value, index) => value === right[index]);
}

export function millionaireLevelNumber(level: MillionaireLevel) {
  return MILLIONAIRE_LEVELS.indexOf(level) + 1;
}

export function validateMillionaireQuestion(question: MillionaireQuestionAuthorityRecord): string[] {
  const errors: string[] = [];
  const choiceIds = question.choices.map((choice) => choice.id);
  const uniqueChoiceIds = new Set(choiceIds);
  const correctExists = choiceIds.includes(question.correctChoiceId);
  const distractorIds = choiceIds.filter((id) => id !== question.correctChoiceId);
  const rationaleIds = Object.entries(question.distractorRationale)
    .filter(([, rationale]) => nonEmpty(rationale))
    .map(([id]) => id);
  const fiftyFiftySurvivors = [...question.fiftyFifty.survivorChoiceIds];
  const fiftyFiftyRemovals = [...question.fiftyFifty.removalChoiceIds];
  const levelNumber = MILLIONAIRE_LEVELS.indexOf(question.level) + 1;

  if (!nonEmpty(question.id)) errors.push("id must be non-empty");
  if (question.sport !== "ufc" && question.sport !== "football") errors.push("sport must be ufc or football");
  if (!MILLIONAIRE_LEVELS.includes(question.level)) errors.push("level must be Q1 through Q8");
  if (question.money !== MILLIONAIRE_MONEY_BY_LEVEL[question.level]) errors.push("money must match the locked level ladder");
  if (!nonEmpty(question.type)) errors.push("type must be non-empty");
  if (!nonEmpty(question.prompt)) errors.push("prompt must be non-empty");
  if (question.choices.length !== 4) errors.push("question must have exactly four choices");
  if (uniqueChoiceIds.size !== 4 || !sameMembers(choiceIds, MILLIONAIRE_CHOICE_IDS)) {
    errors.push("choices must use A, B, C, and D exactly once");
  }
  if (question.choices.some((choice) => !nonEmpty(choice.text))) errors.push("choice text must be non-empty");
  if (!correctExists) errors.push("correctChoiceId must identify exactly one choice");
  if (!sameMembers(rationaleIds, distractorIds)) errors.push("distractor rationale must cover exactly the three incorrect choices");
  if (!nonEmpty(question.explanation)) errors.push("explanation must be non-empty");

  if (levelNumber === 8) {
    if (question.statSheet !== null) errors.push("Q8 must not have a Stat Sheet");
    if (question.lifelineCompatibility.fiftyFifty || question.lifelineCompatibility.statSheet || question.lifelineCompatibility.doubleDip) {
      errors.push("Q8 must disable every lifeline");
    }
  } else {
    if (!nonEmpty(question.statSheet)) errors.push("Q1-Q7 must have a Stat Sheet");
    if (!question.lifelineCompatibility.statSheet) errors.push("Q1-Q7 must allow Stat Sheet");
  }

  if (fiftyFiftySurvivors.length !== 2 || new Set(fiftyFiftySurvivors).size !== 2) {
    errors.push("50/50 must define exactly two distinct survivors");
  }
  if (fiftyFiftyRemovals.length !== 2 || new Set(fiftyFiftyRemovals).size !== 2) {
    errors.push("50/50 must define exactly two distinct removals");
  }
  if (!fiftyFiftySurvivors.includes(question.correctChoiceId)) errors.push("50/50 survivors must include the correct choice");
  if (fiftyFiftyRemovals.includes(question.correctChoiceId)) errors.push("50/50 removals must not include the correct choice");
  if (!sameMembers([...fiftyFiftySurvivors, ...fiftyFiftyRemovals], choiceIds)) {
    errors.push("50/50 survivors and removals must partition all four choices");
  }

  if (question.sources.length === 0) errors.push("at least one source authority is required");
  if (question.sources.some((source) => !nonEmpty(source.label) || !nonEmpty(source.authority) || !nonEmpty(source.verifiedAt))) {
    errors.push("every source must include label, authority, and verifiedAt");
  }
  if (question.verification.status === "verified" && (!nonEmpty(question.verification.verifiedBy) || !nonEmpty(question.verification.verifiedAt))) {
    errors.push("verified questions must identify verifier and verification date");
  }

  if (!nonEmpty(question.tags.primarySubject)) errors.push("primarySubject tag is required");
  if (!question.tags.subjects.includes(question.tags.primarySubject)) errors.push("subjects must include primarySubject");
  if (question.tags.eras.length === 0) errors.push("at least one era tag is required");
  if (question.tags.categories.length === 0) errors.push("at least one category tag is required");

  return errors;
}

export function assertMillionaireQuestion(question: MillionaireQuestionAuthorityRecord) {
  const errors = validateMillionaireQuestion(question);
  if (errors.length > 0) throw new Error(`Invalid Millionaire question ${question.id || "<unknown>"}: ${errors.join("; ")}`);
  return question;
}

export function isMillionaireQuestionApproved(question: MillionaireQuestionAuthorityRecord) {
  return validateMillionaireQuestion(question).length === 0
    && question.verification.status === "verified"
    && question.review.editorial === "approved"
    && question.review.factual === "verified"
    && question.review.difficulty === "calibrated"
    && question.review.publication === "approved";
}

export function millionaireRuntimeQuestion(question: MillionaireQuestionAuthorityRecord): MillionaireRuntimeQuestion {
  assertMillionaireQuestion(question);
  return {
    id: question.id,
    sport: question.sport,
    level: question.level,
    money: question.money,
    type: question.type,
    prompt: question.prompt,
    choices: question.choices,
    correctChoiceId: question.correctChoiceId,
    explanation: question.explanation,
    statSheet: question.statSheet,
    fiftyFifty: question.fiftyFifty,
    lifelineCompatibility: question.lifelineCompatibility,
  };
}

export function millionairePublicQuestion(question: MillionaireRuntimeQuestion): MillionairePublicQuestion {
  return {
    id: question.id,
    sport: question.sport,
    level: question.level,
    money: question.money,
    type: question.type,
    prompt: question.prompt,
    choices: question.choices,
  };
}
