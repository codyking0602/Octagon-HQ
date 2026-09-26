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
 * Owner-only sample copy used to review the locked MLB Series Breakdown shell
 * before the real 2026 postseason field is published.
 *
 * Keep this content out of live-field mode. Once the field is final, real
 * series copy can be authored against the same structure without redesigning
 * the page.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  "al-wc-2": {
    eyebrow: "DESIGN PREVIEW · SAMPLE ANALYSIS",
    series:
      "Boston had New York's number for most of the regular season, but the Yankees closed the gap late. The matchup comes down to a clear contrast: Boston has the best single-game pitching weapon in Garrett Crochet and a more defined late-inning plan, while New York has the more dangerous power lineup and home field. In a three-game series, whichever team gets its preferred script first could control everything.",
    decisions: [
      {
        title: "Can New York solve Crochet?",
        body:
          "Crochet gives Boston a legitimate chance to seize Game 1. If New York makes him work, creates traffic and forces Boston into the bullpen early, the complexion of the series changes immediately.",
      },
      {
        title: "Who controls the late innings?",
        body:
          "Boston knows exactly how it wants to finish games, with Aroldis Chapman anchoring the back end. New York has more uncertainty there. If these games reach the sixth or seventh inning tight, bullpen usage could decide the series.",
      },
      {
        title: "Can Boston keep New York's power quiet?",
        body:
          "Aaron Judge headlines a lineup that can flip a game with one mistake. Boston does not have to shut the Yankees down completely; it has to avoid giving the middle of the order chances with runners on base.",
      },
    ],
    players: [
      {
        teamId: "nyy",
        name: "Aaron Judge",
        role: "YANKEES",
        body:
          "He changes the entire shape of New York's offense. If Boston can keep the bases empty in front of him and force other hitters to beat them, it dramatically lowers the danger level.",
      },
      {
        teamId: "bos",
        name: "Garrett Crochet",
        role: "RED SOX",
        body:
          "He is Boston's biggest advantage in the series. A dominant Game 1 start could put the Yankees under elimination pressure immediately and let Boston dictate its pitching plan from there.",
      },
    ],
    winPaths: {
      nyy: [
        "Make Crochet work and force an early pitching change.",
        "Create traffic for Judge and the power bats.",
        "Get enough length from the starters to protect the bullpen.",
      ],
      bos: [
        "Control Game 1 behind Crochet.",
        "Force New York into its bullpen early.",
        "Reach Chapman with a late lead.",
      ],
    },
    hqRead:
      "This feels like a series where Game 1 matters even more than usual. Boston has the pitcher most capable of taking over one game, while New York has the lineup most capable of turning one mistake into three runs. The thing to watch: can the Yankees make Crochet uncomfortable early? If not, Boston may get exactly the kind of short, pitching-driven series it wants.",
  },
};

export function resolveMlbSeriesBreakdownContent(seriesId: string, previewMode: boolean) {
  if (!previewMode) return null;
  return MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS[seriesId] ?? null;
}
