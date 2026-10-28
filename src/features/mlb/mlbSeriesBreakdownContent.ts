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
 * Keep published series analysis available after each round advances.
 * The current featured World Series is Rays-Brewers.
 */
export const MLB_OWNER_PREVIEW_SERIES_BREAKDOWNS: Readonly<Record<string, MlbSeriesBreakdownContent>> = {
  ws: {
    series:
      "For the first time, the World Series will crown either Tampa Bay or Milwaukee. The Brewers finished with MLB's best record at 103-59 and earned home field; the 98-win Rays survived a six-game ALCS against Cleveland. The Brewers won two of three meetings with Tampa Bay during the regular season.",
    decisions: [
      {
        title: "Home-field advantage",
        body: [
          { text: "Milwaukee opens with Games 1 and 2 at American Family Field and also hosts Games 6 and 7, if necessary. Its 103-win regular season secured that edge." },
        ],
      },
      {
        title: "Pitching versus pressure",
        body: [
          { text: "Tampa Bay's stingy pitching and defense face a Brewers offense built on walks, contact and constant traffic. Drew Rasmussen and Jacob Misiorowski are slated for Game 1." },
        ],
      },
      {
        title: "Young stars on the biggest stage",
        body: [
          { text: "Junior Caminero slugged 42 regular-season home runs and delivered a two-run ALCS Game 6 blast. Milwaukee counters with Jackson Chourio and a deep, balanced lineup." },
        ],
      },
    ],
    hqRead:
      "The Brewers have the regular-season résumé, rested rotation and home-field advantage. The Rays bring sharp run prevention, an October-tested bullpen and Caminero's power. Both are chasing the first championship in franchise history.",
  },
  "nl-cs": {
    series:
      "The National League's two 100-win clubs meet again for the pennant. Milwaukee won 103 games and took the 2026 head-to-head series 4-3, but Los Angeles swept the Brewers in last October's NLCS. Both earned this rematch with four-game Division Series wins.",
    decisions: [
      {
        title: "Home-field advantage",
        body: [
          {
            text: "Milwaukee finished with the best record in baseball and hosts the opening two games. That matters in a rematch where early momentum could reshape a seven-game series.",
          },
        ],
      },
      {
        title: "The rematch",
        body: [
          {
            text: "The Dodgers swept the Brewers in the 2025 NLCS. Milwaukee has the regular-season edge this year, so the question is whether its lineup can turn those narrow advantages into October wins.",
          },
        ],
      },
      {
        title: "Game 1 pitching",
        body: [
          {
            text: "Tarik Skubal starts for Los Angeles opposite Jacob Misiorowski for Milwaukee. The opener will set the tone before the series shifts west for Game 3.",
          },
        ],
      },
    ],
    hqRead:
      "The Brewers earned the home field and have the stronger regular-season résumé. The Dodgers bring the championship experience and won last year's matchup decisively. Milwaukee has to make this a different series early.",
  },
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
