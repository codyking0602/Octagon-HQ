import { z } from "zod";
import fixtureJson from "./__fixtures__/v1-production-output-842ba06e.json";

const finiteNumber = z.number().finite();
const nonNegativeInteger = z.number().int().nonnegative();
const boardSchema = z.enum(["men", "women"]);

const weightsSchema = z
  .object({
    championship: finiteNumber,
    opponentQuality: finiteNumber,
    primeDominance: finiteNumber,
    longevity: finiteNumber,
  })
  .strict();

const visibleStatsSchema = z
  .object({
    ufcRecord: z.string(),
    titleFightWins: finiteNumber,
    adjustedTitleWins: finiteNumber,
    topFiveWins: finiteNumber,
    rankedWins: finiteNumber,
    finishRatePct: finiteNumber,
    primeRecord: z.string(),
    roundsWonPct: finiteNumber,
    activeEliteYears: finiteNumber,
    timesFinishedPrime: finiteNumber,
    throughPrimeUfcFights: finiteNumber,
  })
  .strict();

const penaltyEventSchema = z
  .object({
    fightId: z.string().nullable(),
    date: z.string().nullable(),
    opponent: z.string().nullable(),
    phase: z.string().nullable(),
    qualityTier: z.string().nullable(),
    elite: z.boolean(),
    finished: z.boolean(),
    upwardDivision: z.boolean(),
    competitive: z.boolean(),
    technicalException: z.boolean(),
    penaltyEligible: z.boolean(),
    methodCategory: z.string().nullable(),
    divisionContext: z.string().nullable(),
    overrideRule: z.string().nullable(),
    base: finiteNumber.nullable(),
    finishExtra: finiteNumber.nullable(),
    rawPenalty: finiteNumber.nullable(),
  })
  .strict();

const penaltyTraceSchema = z
  .object({
    reconstructedPenalty: finiteNumber,
    exposure: finiteNumber,
    severity: finiteNumber,
    frequency: finiteNumber,
    primeVolumeFloor: finiteNumber,
    preDivision: finiteNumber,
    divisionMultiplier: finiteNumber,
    divisionDiscountPct: finiteNumber,
    events: z.array(penaltyEventSchema),
  })
  .strict();

const fighterParityRowSchema = z
  .object({
    fighter: z.string().min(1),
    board: boardSchema,
    rank: z.number().int().positive(),
    categories: weightsSchema,
    modifiers: z
      .object({
        apex: finiteNumber,
        penalty: finiteNumber,
        eraDepth: finiteNumber,
      })
      .strict(),
    weighted: weightsSchema,
    totals: z
      .object({
        baseScore: finiteNumber,
        preEraDepthTotalScore: finiteNumber,
        modifierScore: finiteNumber,
        totalScore: finiteNumber,
      })
      .strict(),
    tieBreakers: z
      .object({
        totalScore: finiteNumber,
        championship: finiteNumber,
        opponentQuality: finiteNumber,
        fighter: z.string().min(1),
      })
      .strict(),
    ovr: z.number().int().min(0).max(99),
    visibleStats: visibleStatsSchema,
    penaltyTrace: penaltyTraceSchema,
  })
  .strict();

export const rankingParityFixtureSchema = z
  .object({
    schemaVersion: z.literal(1),
    source: z
      .object({
        repository: z.literal("codyking0602/ufc-goat-rankings"),
        commit: z.literal("842ba06ea09c4f40723226f4c4dfd35041cb3314"),
        captureEvent: z.literal("ufc-production-ranking-ready"),
        projectionGlobal: z.literal("UFC_CALCULATED_RANKING_PROJECTION"),
        factsVersion: z.string().min(1),
        categoryCalculatorVersion: z.string().min(1),
        rankingPipelineVersion: z.string().min(1),
        modelAsOfDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .strict(),
    contract: z
      .object({
        categoryMax: finiteNumber,
        weights: weightsSchema,
        ovr: z
          .object({
            floor: finiteNumber,
            ceiling: finiteNumber,
            curve: finiteNumber,
            leaderOnly99: z.boolean(),
            anchors: z
              .object({
                men: z
                  .object({ floorScore: finiteNumber, ceilingScore: finiteNumber })
                  .strict(),
                women: z
                  .object({ floorScore: finiteNumber, ceilingScore: finiteNumber })
                  .strict(),
              })
              .strict(),
          })
          .strict(),
        tieBreakOrder: z.tuple([
          z.literal("totalScore:desc"),
          z.literal("championship:desc"),
          z.literal("opponentQuality:desc"),
          z.literal("fighter:asc"),
        ]),
      })
      .strict(),
    counts: z
      .object({
        fighters: nonNegativeInteger,
        men: nonNegativeInteger,
        women: nonNegativeInteger,
      })
      .strict(),
    boards: z
      .object({
        men: z.array(z.string().min(1)),
        women: z.array(z.string().min(1)),
      })
      .strict(),
    fighters: z.array(fighterParityRowSchema),
  })
  .strict();

export type RankingParityFixture = z.infer<typeof rankingParityFixtureSchema>;
export type RankingParityFighter = RankingParityFixture["fighters"][number];

const fixtureInput: unknown = fixtureJson;

export const v1ProductionRankingParityFixture = rankingParityFixtureSchema.parse(fixtureInput);
