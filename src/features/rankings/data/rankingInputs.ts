import { z } from "zod";
import historicalMigrationSeedJson from "./generated/canonical-ranking-inputs-842ba06e.json";
import { v2RankingRoster } from "./v2RankingRoster";
import {
  apexInputSchema,
  canonicalFightSchema,
  championshipInputSchema,
  eraDepthInputSchema,
  fighterEraWindowSchema,
  isoDateSchema,
  opponentQualityInputSchema,
  rankingBoardSchema,
} from "../engine/schemas";

const finiteNumber = z.number().finite();
const nonNegativeInteger = z.number().int().nonnegative();

const presentationSchema = z
  .object({
    slug: z.string().min(1),
    primaryDivision: z.string().nullable(),
    secondaryDivision: z.string().nullable(),
    divisionLabel: z.string().min(1),
    resumeTag: z.string().min(1),
    oneLiner: z.string().min(1),
    whyRankedHere: z.string().min(1),
    whyNotHigher: z.string().min(1),
    finalTakeaway: z.string().min(1),
    keyJudgmentCalls: z.array(z.string().min(1)),
    photoUrl: z.string().nullable(),
    thumbUrl: z.string().nullable(),
    watchUrl: z.string().url().nullable().optional(),
    watchLabel: z.string().min(1).nullable().optional(),
    signatureFightUrl: z.string().url().nullable().optional(),
    signatureFightLabel: z.string().min(1).nullable().optional(),
  })
  .strict();

const canonicalFactsSchema = z
  .object({
    identity: z
      .object({
        primaryDivision: z.string(),
        secondaryDivisions: z.array(z.string()),
      })
      .strict(),
    primeWindow: z
      .object({
        startFightId: z.string().min(1),
        endFightId: z.string().nullable(),
        open: z.boolean(),
      })
      .strict(),
    gapCapMonths: finiteNumber.positive(),
    fights: z.array(canonicalFightSchema).min(1),
  })
  .strict();

const sharedEraSchema = z
  .object({
    window: fighterEraWindowSchema,
    statusMultiplier: finiteNumber.positive(),
    divisionMultiplier: finiteNumber.positive(),
  })
  .strict();

const rankingEraSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    years: z.string().min(1),
    startYear: z.number().int(),
    endYear: z.number().int().nullable(),
    description: z.string().min(1),
    definingFight: z.string().min(1),
    alternateFight: z.string().min(1).nullable(),
    fightUrl: z.string().url(),
    fightNote: z.string().min(1).nullable(),
  })
  .strict();

const eraMembershipSchema = z
  .object({
    primary: z.string().min(1),
    secondary: z.string().min(1).nullable(),
  })
  .strict();

const rankingInputFighterSchema = z
  .object({
    fighter: z.string().min(1),
    board: rankingBoardSchema,
    facts: canonicalFactsSchema,
    era: sharedEraSchema,
    judgments: z
      .object({
        championship: championshipInputSchema,
        opponentQuality: opponentQualityInputSchema,
        apex: apexInputSchema,
      })
      .strict(),
    eraDepth: eraDepthInputSchema,
    presentation: presentationSchema,
  })
  .strict()
  .superRefine((fighter, context) => {
    const ownedNames = [
      fighter.judgments.championship.fighter,
      fighter.judgments.opponentQuality.fighter,
      fighter.judgments.apex.fighter,
      fighter.eraDepth.fighter,
    ];
    if (ownedNames.some((name) => name !== fighter.fighter)) {
      context.addIssue({
        code: "custom",
        message: `Calculation inputs do not reconcile to ${fighter.fighter}.`,
      });
    }
    const fightIds = new Set(fighter.facts.fights.map((fight) => fight.id));
    if (!fightIds.has(fighter.facts.primeWindow.startFightId)) {
      context.addIssue({
        code: "custom",
        message: `Prime start fight is missing for ${fighter.fighter}.`,
      });
    }
    if (
      fighter.facts.primeWindow.endFightId &&
      !fightIds.has(fighter.facts.primeWindow.endFightId)
    ) {
      context.addIssue({
        code: "custom",
        message: `Prime end fight is missing for ${fighter.fighter}.`,
      });
    }
  });

const rankingFiltersSchema = z
  .object({
    eras: z.array(rankingEraSchema).min(1),
    eraMembership: z.record(z.string(), eraMembershipSchema),
  })
  .strict();

const rankingCountsSchema = z
  .object({
    fighters: nonNegativeInteger,
    men: nonNegativeInteger,
    women: nonNegativeInteger,
  })
  .strict();

const historicalMigrationSeedSchema = z
  .object({
    schemaVersion: z.literal(1),
    source: z
      .object({
        repository: z.literal("codyking0602/ufc-goat-rankings"),
        commit: z.literal("842ba06ea09c4f40723226f4c4dfd35041cb3314"),
        factsVersion: z.string().nullable(),
        judgmentVersion: z.string().nullable(),
        eraLedgerVersion: z.string().nullable(),
        eraDepthVersion: z.string().nullable(),
        eraDepthResolutionVersion: z.string().nullable(),
        modelAsOfDate: isoDateSchema,
      })
      .strict(),
    counts: rankingCountsSchema,
    filters: rankingFiltersSchema,
    fighters: z.array(rankingInputFighterSchema).min(1),
  })
  .strict();

export const rankingInputDatasetSchema = z
  .object({
    schemaVersion: z.literal(1),
    source: z
      .object({
        repository: z.literal("codyking0602/Octagon-HQ"),
        commit: z.literal("octagon-hq-ranking-inputs-v1"),
        modelAsOfDate: isoDateSchema,
        factsVersion: z.string().nullable(),
        judgmentVersion: z.string().nullable(),
        eraLedgerVersion: z.string().nullable(),
        eraDepthVersion: z.string().nullable(),
        eraDepthResolutionVersion: z.string().nullable(),
        historicalBaseline: z
          .object({
            repository: z.literal("codyking0602/ufc-goat-rankings"),
            commit: z.literal("842ba06ea09c4f40723226f4c4dfd35041cb3314"),
          })
          .strict(),
      })
      .strict(),
    counts: rankingCountsSchema,
    filters: rankingFiltersSchema,
    fighters: z.array(rankingInputFighterSchema).min(1),
  })
  .strict()
  .superRefine((dataset, context) => {
    const names = new Set(dataset.fighters.map((fighter) => fighter.fighter));
    const slugs = new Set(dataset.fighters.map((fighter) => fighter.presentation.slug));
    if (names.size !== dataset.fighters.length) {
      context.addIssue({ code: "custom", message: "Ranking input fighter names are not unique." });
    }
    if (slugs.size !== dataset.fighters.length) {
      context.addIssue({ code: "custom", message: "Ranking input fighter slugs are not unique." });
    }
    const men = dataset.fighters.filter((fighter) => fighter.board === "men").length;
    const women = dataset.fighters.filter((fighter) => fighter.board === "women").length;
    if (
      dataset.counts.fighters !== dataset.fighters.length ||
      dataset.counts.men !== men ||
      dataset.counts.women !== women
    ) {
      context.addIssue({ code: "custom", message: "Ranking input board counts do not reconcile." });
    }

    const eraIds = new Set(dataset.filters.eras.map((era) => era.id));
    const memberships = Object.entries(dataset.filters.eraMembership);
    if (memberships.length !== dataset.fighters.length) {
      context.addIssue({ code: "custom", message: "Era membership must cover all ranked fighters." });
    }
    memberships.forEach(([fighter, membership]) => {
      if (!names.has(fighter)) {
        context.addIssue({ code: "custom", message: `Era membership contains unknown fighter ${fighter}.` });
      }
      if (!eraIds.has(membership.primary) || (membership.secondary && !eraIds.has(membership.secondary))) {
        context.addIssue({ code: "custom", message: `Era membership is invalid for ${fighter}.` });
      }
      if (membership.primary === membership.secondary) {
        context.addIssue({ code: "custom", message: `Era membership repeats for ${fighter}.` });
      }
    });
  });

const seedInput: unknown = historicalMigrationSeedJson;
export const historicalRankingMigrationSeed = historicalMigrationSeedSchema.parse(seedInput);

function deriveCounts(fighters: readonly { board: "men" | "women" }[]) {
  const men = fighters.filter((fighter) => fighter.board === "men").length;
  const women = fighters.filter((fighter) => fighter.board === "women").length;
  return { fighters: fighters.length, men, women };
}

function v2Source() {
  return {
    repository: "codyking0602/Octagon-HQ" as const,
    commit: "octagon-hq-ranking-inputs-v1" as const,
    modelAsOfDate: v2RankingRoster.modelAsOfDate ?? historicalRankingMigrationSeed.source.modelAsOfDate,
    factsVersion: v2RankingRoster.factsVersion ?? historicalRankingMigrationSeed.source.factsVersion,
    judgmentVersion:
      v2RankingRoster.judgmentVersion ?? historicalRankingMigrationSeed.source.judgmentVersion,
    eraLedgerVersion:
      v2RankingRoster.eraLedgerVersion ?? historicalRankingMigrationSeed.source.eraLedgerVersion,
    eraDepthVersion:
      v2RankingRoster.eraDepthVersion ?? historicalRankingMigrationSeed.source.eraDepthVersion,
    eraDepthResolutionVersion:
      v2RankingRoster.eraDepthResolutionVersion ??
      historicalRankingMigrationSeed.source.eraDepthResolutionVersion,
    historicalBaseline: {
      repository: historicalRankingMigrationSeed.source.repository,
      commit: historicalRankingMigrationSeed.source.commit,
    },
  };
}

function composeDataset(useOverlay: boolean) {
  const baselineNames = new Set(
    historicalRankingMigrationSeed.fighters.map((fighter) => fighter.fighter),
  );
  const replacementEntries = useOverlay ? Object.entries(v2RankingRoster.replacements) : [];
  replacementEntries.forEach(([fighter]) => {
    if (!baselineNames.has(fighter)) {
      throw new Error(`V2 ranking replacement targets unknown baseline fighter ${fighter}.`);
    }
  });

  const replacements = new Map(replacementEntries);
  const baselineFighters = historicalRankingMigrationSeed.fighters.map(
    (fighter) => replacements.get(fighter.fighter) ?? fighter,
  );
  const fighters = useOverlay
    ? [...baselineFighters, ...v2RankingRoster.additions]
    : baselineFighters;
  const eraMembership = useOverlay
    ? {
        ...historicalRankingMigrationSeed.filters.eraMembership,
        ...v2RankingRoster.eraMembership,
      }
    : historicalRankingMigrationSeed.filters.eraMembership;

  return rankingInputDatasetSchema.parse({
    schemaVersion: 1,
    source: v2Source(),
    counts: deriveCounts(
      fighters as readonly { board: "men" | "women" }[],
    ),
    filters: {
      eras: historicalRankingMigrationSeed.filters.eras,
      eraMembership,
    },
    fighters,
  });
}

export const historicalRankingMigrationInputs = composeDataset(false);
export const canonicalRankingInputs = composeDataset(true);

export type RankingInputDataset = z.infer<typeof rankingInputDatasetSchema>;
export type RankingInputFighter = RankingInputDataset["fighters"][number];
export type RankingPresentation = z.infer<typeof presentationSchema>;
export type RankingEra = RankingInputDataset["filters"]["eras"][number];
