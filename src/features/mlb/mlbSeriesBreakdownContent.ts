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
 * The current Division Series feature is Braves-Dodgers: a sixth postseason
 * meeting after Atlanta won five of six head-to-head games in the 2026 regular season.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  "nl-ds-2": {
    series:
      "Atlanta won the 2026 season series 5-1, but this is a very different five-game setup. It is the sixth postseason meeting between the Braves and Dodgers, with Los Angeles holding a 3-2 edge in the previous five playoff series.",
    decisions: [
      {
        title: "Atlanta's short turnaround",
        body: [
          {
            text: "Chris Sale",
            href: "https://www.baseball-reference.com/players/s/salech01.shtml",
            emphasis: true,
          },
          {
            text: " was needed late in the Wild Card clincher, so Atlanta enters this round with less rest and fewer clean pitching choices than Los Angeles.",
          },
        ],
      },
      {
        title: "Los Angeles' rotation depth",
        body: [
          {
            text: "Tarik Skubal",
            href: "https://www.baseball-reference.com/players/s/skubata01.shtml",
            emphasis: true,
          },
          {
            text: " fronts a Dodgers rotation built to keep elite starters in nearly every game of a short series. Atlanta has to create damage before that depth can control the matchup.",
          },
        ],
      },
      {
        title: "Can the regular-season edge carry over?",
        body: [
          {
            text: "Atlanta went 5-1 against Los Angeles this season, a real matchup edge. The question is how much that still matters once rotations reset and every late inning becomes a leverage spot.",
          },
        ],
      },
    ],
    hqRead:
      "This is the Division Series matchup with the strongest mix of star power, recent head-to-head history and postseason history. Atlanta already proved it can beat Los Angeles this year; the Dodgers now get the rested, best-of-five version of the matchup.",
  },
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
