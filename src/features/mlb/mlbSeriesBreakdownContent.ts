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
 * The 2026 Wild Card feature is Yankees-Red Sox, the rivalry rematch with the
 * strongest mix of current stakes, recognizable players, and postseason history.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  "al-wc-2": {
    series:
      "New York won the season series 7-6 and eliminated Boston in last year's Wild Card Series. Both clubs finished among MLB's top five in team ERA, so this best-of-three can turn on only a handful of high-leverage at-bats.",
    decisions: [
      {
        title: "New York's power",
        body: [
          {
            text: "Ben Rice",
            href: "https://www.baseball-reference.com/players/r/ricebe01.shtml",
            emphasis: true,
          },
          {
            text: " gives the Yankees another bat that can change a game with one swing. Boston needs to keep traffic off the bases and make New York manufacture runs.",
          },
        ],
      },
      {
        title: "Boston at the top of the order",
        body: [
          {
            text: "Roman Anthony",
            href: "https://www.baseball-reference.com/players/a/anthoro01.shtml",
            emphasis: true,
          },
          {
            text: " getting on base changes the shape of Boston's offense and forces New York to pitch under pressure.",
          },
        ],
      },
      {
        title: "The late innings",
        body: [
          {
            text: "Both teams can shorten games with their bullpens. In a three-game series, one seventh- or eighth-inning mistake can decide the whole thing.",
          },
        ],
      },
    ],
    hqRead:
      "New York has home field and the recent rivalry edge, but Boston has enough pitching to keep every game tight. This feels much more like a series decided by a handful of high-leverage moments than one team simply overpowering the other.",
  },
};

export function resolveMlbSeriesBreakdownContent(seriesId: string, _previewMode: boolean) {
  return MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS[seriesId] ?? null;
}
