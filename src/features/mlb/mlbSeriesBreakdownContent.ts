export type MlbSeriesBreakdownDecision = {
  title: string;
  body: string;
};

export type MlbSeriesBreakdownPlayer = {
  teamId: string;
  name: string;
  role: string;
  body: string;
};

export type MlbSeriesBreakdownContent = {
  eyebrow: string;
  series: string;
  decisions: readonly [
    MlbSeriesBreakdownDecision,
    MlbSeriesBreakdownDecision,
    MlbSeriesBreakdownDecision,
  ];
  players: readonly [MlbSeriesBreakdownPlayer, MlbSeriesBreakdownPlayer];
  winPaths: Readonly<Record<string, readonly [string, string, string]>>;
  hqRead: string;
};

/**
 * The postseason hub intentionally features one full Series Breakdown at a time.
 * The 2026 Wild Card feature is Yankees-Red Sox, the rivalry rematch with the
 * strongest mix of current stakes, recognizable players, and postseason history.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  "al-wc-2": {
    eyebrow: "AL WILD CARD · RIVALRY REMATCH",
    series:
      "New York won the season series 7-6, including a 4-2 mark at Yankee Stadium, and eliminated Boston in last year's Wild Card Series. Both clubs finished among MLB's top five in team ERA, so this best-of-three can turn on one big swing or one bullpen mistake.",
    decisions: [
      {
        title: "Who lands the first punch?",
        body:
          "A three-game series makes Game 1 enormous. Both clubs have enough starting pitching to control a night, so early traffic and one crooked inning could decide who gets to dictate the rest of the series.",
      },
      {
        title: "Can Boston keep the ball in the park?",
        body:
          "New York leaned on home-run power in the season series. Boston's cleanest path is limiting free baserunners and making the Yankees create offense one base at a time.",
      },
      {
        title: "Who owns the late innings?",
        body:
          "Boston can shorten games with Aroldis Chapman and Garrett Whitlock, while New York has David Bednar at the back end. In a rivalry this tight, the seventh through ninth innings may be the whole series.",
      },
    ],
    players: [
      {
        teamId: "nyy",
        name: "Ben Rice",
        role: "YANKEES",
        body:
          "With Aaron Judge's health uncertain, Rice is the power bat Boston cannot let beat it. His ability to change a game with one swing gives New York a postseason centerpiece even if the lineup is not at full strength.",
      },
      {
        teamId: "bos",
        name: "Roman Anthony",
        role: "RED SOX",
        body:
          "Anthony gives Boston an on-base spark at the top of the lineup. If he reaches base consistently, the Red Sox can pressure New York before the Yankees' power has a chance to take over.",
      },
    ],
    winPaths: {
      nyy: [
        "Create early traffic and let the power bats do damage.",
        "Get length from the starters and hand Bednar a lead.",
        "Make Boston chase runs instead of playing from ahead.",
      ],
      bos: [
        "Win the on-base battle at the top of the order.",
        "Keep New York's home-run swings to solo shots.",
        "Reach Chapman and Whitlock with a late lead.",
      ],
    },
    hqRead:
      "New York has home field, the 7-6 season-series edge and last year's Wild Card win. Boston has enough pitching and late-inning strength to make every game uncomfortable. In a best-of-three, the safer expectation is not a runaway — it is three nights where one mistake can swing the rivalry.",
  },
};

export function resolveMlbSeriesBreakdownContent(seriesId: string, _previewMode: boolean) {
  return MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS[seriesId] ?? null;
}
