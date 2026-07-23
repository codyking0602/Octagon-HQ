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

export const canonicalFightSchema = z
  .object({
    id: z.string().min(1),
    date: isoDateSchema,
    opponent: z.string().min(1),
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
  .strict();

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
  .strict();

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
  .strict();

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
export type CanonicalFight = z.infer<typeof canonicalFightSchema>;
export type FighterEraWindow = z.infer<typeof fighterEraWindowSchema>;
export type ChampionshipInput = z.infer<typeof championshipInputSchema>;
export type OpponentQualityInput = z.infer<typeof opponentQualityInputSchema>;
export type ApexInput = z.infer<typeof apexInputSchema>;
export type PrimeDominanceInput = z.infer<typeof primeDominanceInputSchema>;
export type LongevityInput = z.infer<typeof longevityInputSchema>;
export type LossContextInput = z.infer<typeof lossContextInputSchema>;
export type EraDepthInput = z.infer<typeof eraDepthInputSchema>;
