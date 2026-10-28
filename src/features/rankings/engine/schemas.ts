import { z } from "zod";

const finiteNumber = z.number().finite();
const nonNegativeNumber = finiteNumber.nonnegative();

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const rankingBoardSchema = z.enum(["men", "women"]);
export const scoringDispositionSchema = z.enum([
  "count-win",
  "count-loss",
  "count-draw",
  "excluded-no-contest",
  "technical-exception",
]);
export const officialResultSchema = z.enum(["win", "loss", "draw", "no-contest"]);

export const auditedRoundsSchema = z
  .object({
    status: z.enum(["audited", "unavailable"]),
    won: nonNegativeNumber,
    lost: nonNegativeNumber,
    drawn: nonNegativeNumber,
  })
  .strict();

export const lossClassificationSchema = z
  .object({
    competitive: z.boolean().optional(),
    divisionContext: z.enum(["home", "upward"]).optional(),
    overrideRule: z.string().nullable().optional(),
  })
  .strict();

export const ufcBonusTypeSchema = z.enum([
  "fight-of-the-night",
  "performance-of-the-night",
  "knockout-of-the-night",
  "submission-of-the-night",
]);

const verifiedBooleanFactSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("verified"), value: z.boolean() }).strict(),
  z.object({ status: z.literal("unavailable") }).strict(),
]);

const verifiedBonusFactSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("verified"),
      values: z.array(ufcBonusTypeSchema),
    })
    .strict()
    .superRefine((value, context) => {
      if (new Set(value.values).size !== value.values.length) {
        context.addIssue({ code: "custom", message: "UFC fight bonuses must be unique." });
      }
    }),
  z.object({ status: z.literal("unavailable") }).strict(),
]);

const verifiedFinishFactSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("verified"),
      round: z.number().int().min(1).max(5),
      timeSeconds: z.number().int().min(0).max(300),
    })
    .strict(),
  z.object({ status: z.literal("not-applicable") }).strict(),
  z.object({ status: z.literal("unavailable") }).strict(),
]);

const verifiedKnockdownFactSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("verified"),
      for: z.number().int().nonnegative(),
      against: z.number().int().nonnegative(),
    })
    .strict(),
  z.object({ status: z.literal("unavailable") }).strict(),
]);

/**
 * Optional audited facts that are not required by the ranking score itself but
 * can power UFC-only products such as Hit the Number and Find the Leader.
 *
 * Once a fight has been audited into this block, every supported fact is
 * explicit. `verified: 0` / `verified: []` is real zero; `unavailable` is never
 * silently interpreted as zero. UFCStats remains the single evidence provider.
 */
export const canonicalFightSupplementalFactsSchema = z
  .object({
    source: z
      .object({
        provider: z.literal("ufcstats"),
        eventId: z.string().min(1),
        fightId: z.string().min(1),
        checkedAt: isoDateSchema,
      })
      .strict(),
    mainEvent: verifiedBooleanFactSchema,
    bonuses: verifiedBonusFactSchema,
    finish: verifiedFinishFactSchema,
    knockdowns: verifiedKnockdownFactSchema,
  })
  .strict();

export const canonicalFightSchema = z
  .object({
    id: z.string().min(1),
    date: isoDateSchema,
    opponent: z.string().min(1),
    division: z.string().min(1).nullable().optional(),
    officialResult: officialResultSchema,
    scoringDisposition: scoringDispositionSchema,
    methodCategory: z.string().min(1),
    qualityTier: z.string().min(1),
    championshipType: z.string().min(1),
    championshipEligible: z.boolean().optional(),
    championshipOpponentStrength: finiteNumber.nullable().optional(),
    championshipManualCredit: finiteNumber.nullable().optional(),
    rounds: auditedRoundsSchema,
    lossClassification: lossClassificationSchema.optional(),
    supplementalFacts: canonicalFightSupplementalFactsSchema.optional(),
  })
  .strict();

export const fighterEraWindowSchema = z
  .object({
    start: isoDateSchema,
    end: isoDateSchema.nullable(),
  })
  .strict();

export const championshipInputSchema = z
  .object({
    fighter: z.string().min(1),
    benchmarkCredit: finiteNumber.positive(),
    inputs: z.array(
      z
        .object({
          finalAdjustedCredit: finiteNumber,
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const opponentQualityInputSchema = z
  .object({
    fighter: z.string().min(1),
    benchmarkCredit: finiteNumber.positive(),
    fighterAdjustment: finiteNumber.optional(),
    inputs: z.array(
      z
        .object({
          finalCredit: finiteNumber,
          date: isoDateSchema.optional(),
          opponent: z.string().min(1),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const apexInputSchema = z
  .object({
    fighter: z.string().min(1),
    performances: z
      .array(
        z
          .object({
            fightId: z.string().min(1),
            rating: finiteNumber,
          })
          .passthrough(),
      )
      .length(2),
    components: z
      .object({
        twoPerformanceStrength: finiteNumber,
        proof: finiteNumber,
        bestFighterClaim: finiteNumber,
        aura: finiteNumber,
      })
      .strict(),
    notes: z.string().nullable().optional(),
  })
  .passthrough();

export const primeDominanceInputSchema = z
  .object({
    fighter: z.string().min(1),
    fights: z.array(canonicalFightSchema),
    window: fighterEraWindowSchema,
  })
  .strict();

export const longevityInputSchema = z
  .object({
    fighter: z.string().min(1),
    fights: z.array(canonicalFightSchema),
    window: fighterEraWindowSchema,
    modelAsOfDate: isoDateSchema,
    statusMultiplier: finiteNumber.positive(),
    divisionMultiplier: finiteNumber.positive(),
  })
  .strict();

export const lossContextInputSchema = z
  .object({
    fighter: z.string().min(1),
    fights: z.array(canonicalFightSchema),
    window: fighterEraWindowSchema,
    divisionMultiplier: finiteNumber.positive(),
  })
  .strict();

export const eraDepthInputSchema = z
  .object({
    fighter: z.string().min(1),
    depthIndex: finiteNumber.nullable(),
    approvedAdjustment: finiteNumber.nullable().optional(),
  })
  .strict();

export type RankingBoard = z.infer<typeof rankingBoardSchema>;
export type UfcBonusType = z.infer<typeof ufcBonusTypeSchema>;
export type CanonicalFightSupplementalFacts = z.infer<typeof canonicalFightSupplementalFactsSchema>;
export type CanonicalFight = z.infer<typeof canonicalFightSchema>;
export type FighterEraWindow = z.infer<typeof fighterEraWindowSchema>;
export type ChampionshipInput = z.infer<typeof championshipInputSchema>;
export type OpponentQualityInput = z.infer<typeof opponentQualityInputSchema>;
export type ApexInput = z.infer<typeof apexInputSchema>;
export type PrimeDominanceInput = z.infer<typeof primeDominanceInputSchema>;
export type LongevityInput = z.infer<typeof longevityInputSchema>;
export type LossContextInput = z.infer<typeof lossContextInputSchema>;
export type EraDepthInput = z.infer<typeof eraDepthInputSchema>;
