export type MlbSeriesBreakdownRichTextPart = {
  text: string;
  href?: string;
  emphasis?: boolean;
};

export type MlbSeriesBreakdownDecision = {
  title: string;
  body: readonly MlbSeriesBreakdownRichTextPart[];
};

export type MlbSeriesBreakdownContent = {
  series: string;
  decisions: readonly [
    MlbSeriesBreakdownDecision,
    MlbSeriesBreakdownDecision,
    MlbSeriesBreakdownDecision,
  ];
  hqRead: string;
};

/**
 * The postseason hub intentionally features one full Series Breakdown at a time.
 * The 2026 Division Series feature is White Sox-Guardians: the AL Central race
 * continuing into October after a 7-6 season series separated by one total run.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  "al-ds-2": {
    series:
      "Chicago won the season series 7-6 and outscored Cleveland 58-57, but the Guardians took the AL Central by one game. Eleven of their 13 meetings were decided by three runs or fewer, so the division race is essentially continuing in October.",
    decisions: [
      {
        title: "The margins",
        body: [
          {
            text: "Seven of the 13 regular-season meetings were decided by one run, including four walk-offs. Late-game execution has separated these teams more than raw talent.",
          },
        ],
      },
      {
        title: "Chicago's pressure",
        body: [
          {
            text: "The White Sox swept Houston in the Wild Card round and repeatedly created early traffic. Cleveland's starters have to keep Chicago from turning another first inning into a chase game.",
          },
        ],
      },
      {
        title: "Cleveland's run prevention",
        body: [
          {
            text: "The Guardians won the division with pitching and late-inning control. In a matchup this tight, keeping free runners off base may matter more than trying to match Chicago swing for swing.",
          },
        ],
      },
    ],
    hqRead:
      "There was almost nothing between these clubs over 13 games: Chicago won seven, Cleveland won six, and the total run differential was one. Expect the AL Central race to keep looking like the AL Central race — close games, leverage late, and very little room for a bad inning.",
  },
};

export function resolveMlbSeriesBreakdownContent(seriesId: string, _previewMode: boolean) {
  return MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS[seriesId] ?? null;
}
