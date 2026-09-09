import { z } from "zod";
import expansionJson from "../../../data/generated/ufc/factual-expansion-v1.json";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const resultSchema = z.enum(["win", "loss", "draw", "no-contest"]);
const methodCategorySchema = z.enum(["ko-tko", "submission", "decision", "other"]);

const factualFightSchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  opponent: z.string().min(1),
  division: z.string().min(1),
  result: resultSchema,
  methodCategory: methodCategorySchema,
  titleFight: z.boolean(),
  interimTitleFight: z.boolean(),
}).strict();

const expansionSchema = z.object({
  schemaVersion: z.literal(1),
  targetTotalSubjects: z.number().int().positive(),
  rankedSubjectCountAtGeneration: z.number().int().nonnegative(),
  expansionSubjectCount: z.number().int().nonnegative(),
  recognizabilityTier: z.literal("A"),
  policy: z.object({
    recognizabilityTier: z.literal("A"),
    modernActivityYear: z.number().int(),
    minimumModernShare: z.number().min(0).max(1),
    maximumLegacySubjects: z.number().int().nonnegative(),
  }).strict(),
  provenance: z.object({
    provider: z.literal("ufcstats"),
    core: z.object({
      repository: z.string().min(1),
      commit: z.string().regex(/^[a-f0-9]{40}$/),
      refreshedAt: isoDate,
      files: z.array(z.string().min(1)).min(1),
    }).strict(),
  }).strict(),
  subjects: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    recognizabilityTier: z.literal("A"),
    legacyA: z.boolean(),
    primaryDivision: z.string().min(1),
    secondaryDivisions: z.array(z.string().min(1)),
    activeFrom: isoDate,
    activeTo: isoDate,
    fights: z.array(factualFightSchema).min(1),
  }).strict()),
}).strict();

export const ufcFactualExpansion = expansionSchema.parse(expansionJson);

export type UfcFactualFight = z.infer<typeof factualFightSchema>;
export type UfcFactualSubject = {
  id: string;
  name: string;
  slug: string;
  scope: "ranked-core" | "recognizable-expansion";
  recognizabilityTier: "A" | null;
  primaryDivision: string;
  secondaryDivisions: readonly string[];
  activeFrom: string;
  activeTo: string;
  fights: readonly UfcFactualFight[];
};

function normalizeMethodCategory(value: string): UfcFactualFight["methodCategory"] {
  const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("ko") || normalized.includes("tko")) return "ko-tko";
  if (normalized.includes("sub")) return "submission";
  if (normalized.includes("dec")) return "decision";
  return "other";
}

function isTitleFight(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === "normal"
    || normalized === "interim"
    || normalized.includes("title")
    || normalized.includes("champion")
    || normalized.includes("undisputed");
}

function rankedSubjects(): UfcFactualSubject[] {
  return canonicalRankingInputs.fighters.map((fighter) => {
    const dates = fighter.facts.fights.map((fight) => fight.date).sort();
    return {
      id: `ufc:${fighter.presentation.slug}`,
      name: fighter.fighter,
      slug: fighter.presentation.slug,
      scope: "ranked-core",
      recognizabilityTier: null,
      primaryDivision: fighter.facts.identity.primaryDivision,
      secondaryDivisions: fighter.facts.identity.secondaryDivisions,
      activeFrom: dates[0]!,
      activeTo: dates.at(-1)!,
      fights: fighter.facts.fights.map((fight) => ({
        id: fight.id,
        date: fight.date,
        opponent: fight.opponent,
        division: fight.division ?? fighter.facts.identity.primaryDivision,
        result: fight.officialResult,
        methodCategory: normalizeMethodCategory(fight.methodCategory),
        titleFight: isTitleFight(fight.championshipType),
        interimTitleFight: fight.championshipType.toLowerCase().includes("interim"),
      })),
    };
  });
}

function expansionSubjects(): UfcFactualSubject[] {
  return ufcFactualExpansion.subjects.map((subject) => ({
    ...subject,
    scope: "recognizable-expansion",
  }));
}

function normalizeIdentity(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function buildLedger() {
  const subjects = [...rankedSubjects(), ...expansionSubjects()];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const identities = new Set<string>();
  for (const subject of subjects) {
    const identity = normalizeIdentity(subject.name);
    if (ids.has(subject.id)) throw new Error(`Duplicate UFC factual subject id ${subject.id}.`);
    if (slugs.has(subject.slug)) throw new Error(`Duplicate UFC factual subject slug ${subject.slug}.`);
    if (identities.has(identity)) throw new Error("Duplicate UFC factual subject identity.");
    ids.add(subject.id);
    slugs.add(subject.slug);
    identities.add(identity);
  }
  if (subjects.length !== ufcFactualExpansion.targetTotalSubjects) {
    throw new Error(`UFC factual ledger has ${subjects.length} subjects; expected ${ufcFactualExpansion.targetTotalSubjects}.`);
  }
  return subjects;
}

/**
 * Canonical UFC factual subject universe for factual Games. Ranked fighters are
 * projected from the ranking ledger; recognizable non-ranked subjects are sourced
 * from the same pinned UFCStats evidence pipeline without becoming ranking inputs.
 */
export const ufcFactualLedgerSubjects: readonly UfcFactualSubject[] = buildLedger();

export function getUfcFactualSubject(subjectId: string) {
  return ufcFactualLedgerSubjects.find((subject) => subject.id === subjectId) ?? null;
}
