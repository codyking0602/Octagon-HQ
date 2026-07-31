export interface V2RankingRosterOverlay {
  additions: readonly unknown[];
  replacements: Readonly<Record<string, unknown>>;
  eraMembership: Readonly<
    Record<string, { primary: string; secondary: string | null }>
  >;
  modelAsOfDate?: string;
  factsVersion?: string | null;
  judgmentVersion?: string | null;
  eraLedgerVersion?: string | null;
  eraDepthVersion?: string | null;
  eraDepthResolutionVersion?: string | null;
}

/**
 * One V2-owned roster overlay for every ranking change after the sealed migration baseline.
 *
 * - Add new fighters in `additions`.
 * - Replace an existing fighter's complete canonical input through `replacements`.
 * - Add or update era membership in `eraMembership`.
 * - Advance the model date and version labels with the same reviewed change.
 *
 * The historical 80-fighter import is evidence only and is never regenerated from V1.
 */
export const v2RankingRoster: V2RankingRosterOverlay = {
  additions: [],
  replacements: {},
  eraMembership: {},
};
