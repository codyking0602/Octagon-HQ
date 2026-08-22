import {
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  formatFootballFact,
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStats";
import {
  getFootballRankFivePack,
  type FootballLeague,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 5;

export interface FootballBlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
}

export interface FootballBlindResumeFactStatSpec {
  factMetricId: FootballFactMetricId;
}

export type FootballBlindResumeStatSpec = FootballBlindResumeStat | FootballBlindResumeFactStatSpec;

export interface FootballBlindResumeMatchup {
  id: string;
  packId: FootballRankFivePackId;
  prompt: string;
  leftId: string;
  rightId: string;
  stats: readonly FootballBlindResumeStatSpec[];
}

export interface FootballBlindResumeRound extends Omit<FootballBlindResumeMatchup, "stats"> {
  stats: readonly FootballBlindResumeStat[];
  league: FootballLeague;
  leftName: string;
  rightName: string;
  leftSubtitle: string;
  rightSubtitle: string;
  leftRating: number;
  rightRating: number;
  winnerId: string;
}

export interface FootballBlindResumeRun {
  rounds: FootballBlindResumeRound[];
  identity: PlayLineupIdentity;
}

interface QualitativeResumeProfile {
  peak: string;
  body: string;
  hardware: string;
  signature: string;
}

const qualitativeProfiles: Readonly<Record<string, QualitativeResumeProfile>> = {
  "jerry-rice": {
    peak: "Elite production without sacrificing week-to-week consistency",
    body: "The longest truly dominant receiver runway",
    hardware: "Championship production matched the regular-season case",
    signature: "Volume, longevity and postseason value all at once",
  },
  "randy-moss": {
    peak: "Coverage-warping vertical dominance at his best",
    body: "Multiple elite peaks across very different offenses",
    hardware: "Individual dominance without the championship finish",
    signature: "The scariest touchdown ceiling in the matchup",
  },
  "terrell-owens": {
    peak: "Power, separation and scoring translated across teams",
    body: "A long superstar run with huge cumulative production",
    hardware: "Deep postseason moments without a ring",
    signature: "Portable dominance across several offenses",
  },
  "calvin-johnson": {
    peak: "A shorter supernova that broke normal coverage rules",
    body: "Less longevity than the other inner-circle receivers",
    hardware: "Team results never matched the individual peak",
    signature: "Peak physical mismatch and impossible-volume seasons",
  },
  "tony-gonzalez": {
    peak: "Elite receiving value sustained deep into his career",
    body: "The benchmark longevity case at tight end",
    hardware: "Individual résumé carries more weight than team hardware",
    signature: "Unmatched receiving runway for the position",
  },
  "rob-gronkowski": {
    peak: "Dominant receiver and blocker in the same package",
    body: "A shorter career with an outrageous prime",
    hardware: "Championship production is central to the case",
    signature: "Two-way peak plus postseason destruction",
  },
  "travis-kelce": {
    peak: "Historic receiving efficiency in the biggest games",
    body: "A long elite modern prime with rare durability",
    hardware: "Postseason volume and titles strengthen every layer",
    signature: "Playoff receiving production at a different scale",
  },
  "antonio-gates": {
    peak: "Red-zone dominance changed how defenses treated the position",
    body: "A long scoring-heavy receiving career",
    hardware: "Team success trails the individual production",
    signature: "Touchdown production and sustained receiving threat",
  },
  "lawrence-taylor": {
    peak: "A defensive peak that changed protection rules",
    body: "Sustained game-wrecking impact across a full prime",
    hardware: "Awards and championship value reinforce the eye test",
    signature: "Position-changing disruption from the edge",
  },
  "reggie-white": {
    peak: "Overwhelming pass rush with power that traveled across eras",
    body: "Historic production with exceptional longevity",
    hardware: "Individual dominance eventually paired with a title",
    signature: "Peak plus longevity without a soft phase",
  },
  "aaron-donald": {
    peak: "Interior disruption at a nearly unmatched level",
    body: "A compact career with almost no decline in elite status",
    hardware: "Major awards and a championship postseason peak",
    signature: "Doing edge-rusher damage from the interior",
  },
  "ray-lewis": {
    peak: "Complete middle-linebacker control of a defense",
    body: "Two-decade centerpiece with multiple elite phases",
    hardware: "Championship leadership and postseason value matter heavily",
    signature: "Longevity, leadership and title-level defensive command",
  },
  "bill-belichick": {
    peak: "The defining modern NFL dynasty peak",
    body: "Two decades of sustained championship contention",
    hardware: "The deepest postseason résumé in the matchup",
    signature: "Dynasty construction and week-to-week adaptability",
  },
  "vince-lombardi": {
    peak: "Shorter tenure with overwhelming championship conversion",
    body: "Less modern longevity but almost no wasted prime",
    hardware: "Titles define the entire coaching case",
    signature: "Era-defining dominance and postseason perfection",
  },
  "don-shula": {
    peak: "Elite teams across dramatically different NFL eras",
    body: "The ultimate longevity and wins case",
    hardware: "A perfect season anchors a massive résumé",
    signature: "Sustained winning across decades and roster cycles",
  },
  "andy-reid": {
    peak: "Late-career dynasty peak after years of prior contention",
    body: "Elite results across two franchises and multiple eras",
    hardware: "Championship volume transformed an already great résumé",
    signature: "Longevity plus offensive reinvention",
  },
  "tom-brady-2007": {
    peak: "An offense that made undefeated feel inevitable every week",
    body: "Regular-season dominance with one devastating final blemish",
    hardware: "Individual awards are elite; the title is missing",
    signature: "Touchdown explosion on a perfect regular season",
  },
  "peyton-manning-2013": {
    peak: "Record-book passing volume from opening week onward",
    body: "A full season of historic command and scoring",
    hardware: "MVP-level dominance reached the Super Bowl",
    signature: "The biggest pure passing production season of the group",
  },
  "dan-marino-1984": {
    peak: "Passing numbers that arrived years before the league was ready",
    body: "One season that reset the statistical ceiling",
    hardware: "MVP dominance with a Super Bowl trip",
    signature: "Era-adjusted shock value is almost impossible to match",
  },
  "aaron-rodgers-2011": {
    peak: "Efficiency and explosiveness with almost no weekly dip",
    body: "A near-perfect regular-season quarterback campaign",
    hardware: "MVP hardware without the postseason finish",
    signature: "Efficiency peak on a fifteen-win team",
  },
  "1972-miami-dolphins": {
    peak: "The one NFL season that finished completely perfect",
    body: "No bad week exists anywhere on the résumé",
    hardware: "Every team goal ended with a championship",
    signature: "Perfection is the trump card",
  },
  "1985-chicago-bears": {
    peak: "Defensive intimidation turned games into mismatches",
    body: "Near-perfect season with overwhelming point control",
    hardware: "Dominance carried cleanly through the Super Bowl",
    signature: "Perhaps the most frightening defense-season package",
  },
  "1989-san-francisco-49ers": {
    peak: "Elite offense and defense peaked together in January",
    body: "A complete roster with very few exploitable weaknesses",
    hardware: "The postseason run strengthened an already elite season",
    signature: "Two-way completeness plus a dominant title finish",
  },
  "1991-washington": {
    peak: "Efficiency and point differential were historically strong",
    body: "A wire-to-wire team with almost no close-call dependence",
    hardware: "The statistical case ended with a championship",
    signature: "Balance, efficiency and schedule-adjusted dominance",
  },
  "cam-newton-2010": {
    peak: "One-player offensive takeover on an unbeaten champion",
    body: "A single-season college résumé with no unfinished business",
    hardware: "Heisman and national title arrived together",
    signature: "Carry-job value on the sport's biggest stage",
  },
  "joe-burrow-2019": {
    peak: "Passing precision exploded against an elite schedule",
    body: "A perfect final season that kept getting better in postseason play",
    hardware: "Heisman and national title with decisive playoff wins",
    signature: "The cleanest modern passing-season résumé",
  },
  "vince-young-2005": {
    peak: "Dual-threat dominance culminated in an iconic title game",
    body: "An unbeaten season built around late-game control",
    hardware: "National title without the Heisman trophy",
    signature: "The championship-game carry is the separator",
  },
  "tim-tebow-2007": {
    peak: "Power-run and red-zone dominance from the quarterback spot",
    body: "A broader college career case than a one-season wonder",
    hardware: "Heisman plus championship participation across seasons",
    signature: "Career hardware and unmatched short-yardage value",
  },
  "nick-saban-cfb": {
    peak: "Multiple separate championship-caliber roster cycles",
    body: "The longest modern run of annual national relevance",
    hardware: "National titles are the foundation, not a side note",
    signature: "Dynasty maintenance across changing eras",
  },
  "urban-meyer-cfb": {
    peak: "Championship offenses at multiple powerhouse programs",
    body: "Shorter stops than Saban but elite winning almost everywhere",
    hardware: "Titles at two schools strengthen the portability case",
    signature: "Immediate program elevation and offensive influence",
  },
  "kirby-smart-cfb": {
    peak: "Georgia became the sport's most physically complete roster",
    body: "A shorter career that is already dynasty-level at its best",
    hardware: "Back-to-back championships drive the peak case",
    signature: "Modern recruiting and defensive machine-building",
  },
  "dabo-swinney-cfb": {
    peak: "Clemson repeatedly beat the sport's dominant dynasty",
    body: "A long playoff-era run from one program build",
    hardware: "Multiple titles validate the sustained contender window",
    signature: "Built a nontraditional superpower and kept it elite",
  },
  "alabama-program": {
    peak: "The sport's defining modern dynasty sits inside the window",
    body: "Elite relevance stretches across almost the entire century",
    hardware: "Championship volume overwhelms most comparisons",
    signature: "Sustained top-end dominance without a true peer",
  },
  "ohio-state-program": {
    peak: "National-title peaks arrived under multiple coaching staffs",
    body: "Almost no prolonged down period since 2000",
    hardware: "Titles pair with relentless major-bowl contention",
    signature: "The highest floor in the sport",
  },
  "georgia-program": {
    peak: "Recent championship peak is as strong as any program's",
    body: "The first half of the window built toward a dominant second half",
    hardware: "Multiple titles transformed a strong résumé into an elite one",
    signature: "Modern peak strength and roster dominance",
  },
  "lsu-program": {
    peak: "Several distinct title teams reached very different ceilings",
    body: "More volatility than the highest-floor programs",
    hardware: "Championship success under multiple head coaches matters",
    signature: "Multiple independent national-title peaks",
  },
  "alabama-2009-2020": {
    peak: "A dynasty with repeated teams that could claim all-time status",
    body: "More than a decade of title-or-bust expectations",
    hardware: "Championship volume defines the era",
    signature: "The benchmark modern dynasty",
  },
  "georgia-2021-2024": {
    peak: "Back-to-back champions with historically strong defense",
    body: "Compact era with almost no ordinary season",
    hardware: "Multiple titles in a four-year window",
    signature: "Concentrated dominance with a massive weekly floor",
  },
  "usc-2002-2008": {
    peak: "National glamour and elite talent translated every season",
    body: "Seven-year run with virtually permanent top-four relevance",
    hardware: "Titles and Heisman-level stars reinforce the peak",
    signature: "Sustained national dominance in a compact era",
  },
  "miami-2000-2003": {
    peak: "Roster talent and physical dominance were almost absurd",
    body: "Shorter era than the other dynasty candidates",
    hardware: "One title plus a near-repeat keeps the debate alive",
    signature: "Perhaps the highest pure talent concentration",
  },
};

const factualSignatureEdges: Readonly<Record<string, string>> = {
  "tom-brady": "Championship longevity",
  "peyton-manning": "Regular-season command",
  "joe-montana": "Postseason finishing",
  "drew-brees": "Volume + accuracy",
  "dan-marino": "Era-breaking passing peak",
  "jim-brown": "Era dominance",
  "barry-sanders": "Rushing peak + efficiency",
  "walter-payton": "Complete longevity",
  "emmitt-smith": "Volume + championship production",
  "2019-lsu": "Historic offense + elite schedule",
  "2020-alabama": "All-conference schedule dominance",
  "2005-texas": "Iconic title-game finish",
  "2004-usc": "Wire-to-wire No. 1 dominance",
  "2013-florida-state": "Unbeaten point-differential dominance",
};

function pairwise<T>(rows: readonly T[], build: (left: T, right: T) => FootballBlindResumeMatchup) {
  const matchups: FootballBlindResumeMatchup[] = [];
  for (let left = 0; left < rows.length; left += 1) {
    for (let right = left + 1; right < rows.length; right += 1) {
      matchups.push(build(rows[left], rows[right]));
    }
  }
  return matchups;
}

function factMatchups(
  packId: FootballRankFivePackId,
  prompt: string,
  subjectIds: readonly string[],
  metricIds: readonly FootballFactMetricId[],
) {
  return pairwise(subjectIds, (leftId, rightId) => ({
    id: `${packId}-${leftId}-v-${rightId}`,
    packId,
    prompt,
    leftId,
    rightId,
    stats: [
      ...metricIds.map((factMetricId) => ({ factMetricId } as FootballBlindResumeFactStatSpec)),
      {
        label: "Signature edge",
        valueA: factualSignatureEdges[leftId],
        valueB: factualSignatureEdges[rightId],
      },
    ],
  }));
}

function qualitativeMatchups(
  packId: FootballRankFivePackId,
  prompt: string,
  subjectIds: readonly string[],
) {
  const pack = getFootballRankFivePack(packId);
  return pairwise(subjectIds, (leftId, rightId) => {
    const left = pack.items.find((item) => item.id === leftId);
    const right = pack.items.find((item) => item.id === rightId);
    const leftProfile = qualitativeProfiles[leftId];
    const rightProfile = qualitativeProfiles[rightId];
    if (!left || !right || !leftProfile || !rightProfile) {
      throw new Error(`Football Blind Resume qualitative profile is incomplete for ${packId}: ${leftId} vs ${rightId}.`);
    }
    return {
      id: `${packId}-${leftId}-v-${rightId}`,
      packId,
      prompt,
      leftId,
      rightId,
      stats: [
        { label: "Résumé snapshot", valueA: left.subtitle, valueB: right.subtitle },
        { label: "Peak case", valueA: leftProfile.peak, valueB: rightProfile.peak },
        { label: "Body of work", valueA: leftProfile.body, valueB: rightProfile.body },
        { label: "Hardware / results", valueA: leftProfile.hardware, valueB: rightProfile.hardware },
        { label: "Signature edge", valueA: leftProfile.signature, valueB: rightProfile.signature },
      ],
    };
  });
}

const nflQuarterbackFactMatchups = factMatchups(
  "nfl-quarterbacks",
  "Which NFL quarterback résumé is greater?",
  ["tom-brady", "peyton-manning", "joe-montana", "drew-brees", "dan-marino"],
  [
    "nfl-career-passing-yards",
    "nfl-career-passing-touchdowns",
    "nfl-ap-mvp-awards",
    "nfl-super-bowl-titles",
  ],
);

const nflRunningBackFactMatchups = factMatchups(
  "nfl-running-backs",
  "Which NFL running back résumé is greater?",
  ["jim-brown", "barry-sanders", "walter-payton", "emmitt-smith"],
  [
    "nfl-career-rushing-yards",
    "nfl-career-rushing-touchdowns",
    "nfl-career-games",
    "nfl-ap-mvp-awards",
  ],
);

const collegeTeamSeasonFactMatchups = factMatchups(
  "college-team-seasons",
  "Which single-season team résumé is greater?",
  ["2019-lsu", "2020-alabama", "2005-texas", "2004-usc", "2013-florida-state"],
  ["cfb-team-points-per-game", "cfb-team-srs", "cfb-team-sos", "cfb-national-title"],
);

const qualitativeMatchupGroups = [
  qualitativeMatchups(
    "nfl-wide-receivers",
    "Which NFL wide receiver résumé is greater?",
    ["jerry-rice", "randy-moss", "terrell-owens", "calvin-johnson"],
  ),
  qualitativeMatchups(
    "nfl-tight-ends",
    "Which NFL tight end résumé is greater?",
    ["tony-gonzalez", "rob-gronkowski", "travis-kelce", "antonio-gates"],
  ),
  qualitativeMatchups(
    "nfl-defensive-players",
    "Which NFL defensive career résumé is greater?",
    ["lawrence-taylor", "reggie-white", "aaron-donald", "ray-lewis"],
  ),
  qualitativeMatchups(
    "nfl-head-coaches",
    "Which NFL head-coaching résumé is greater?",
    ["bill-belichick", "vince-lombardi", "don-shula", "andy-reid"],
  ),
  qualitativeMatchups(
    "nfl-qb-seasons",
    "Which single-season NFL quarterback résumé is greater?",
    ["tom-brady-2007", "peyton-manning-2013", "dan-marino-1984", "aaron-rodgers-2011"],
  ),
  qualitativeMatchups(
    "nfl-team-seasons",
    "Which single-season NFL team résumé is greater?",
    ["1972-miami-dolphins", "1985-chicago-bears", "1989-san-francisco-49ers", "1991-washington"],
  ),
  qualitativeMatchups(
    "college-quarterbacks",
    "Which college quarterback résumé is greater?",
    ["cam-newton-2010", "joe-burrow-2019", "vince-young-2005", "tim-tebow-2007"],
  ),
  qualitativeMatchups(
    "college-head-coaches",
    "Which college head-coaching résumé is greater?",
    ["nick-saban-cfb", "urban-meyer-cfb", "kirby-smart-cfb", "dabo-swinney-cfb"],
  ),
  qualitativeMatchups(
    "college-programs",
    "Which program has the stronger résumé since 2000?",
    ["alabama-program", "ohio-state-program", "georgia-program", "lsu-program"],
  ),
  qualitativeMatchups(
    "college-program-eras",
    "Which defined college program era is greater?",
    ["alabama-2009-2020", "georgia-2021-2024", "usc-2002-2008", "miami-2000-2003"],
  ),
] as const;

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = [
  ...nflQuarterbackFactMatchups,
  ...nflRunningBackFactMatchups,
  ...collegeTeamSeasonFactMatchups,
  ...qualitativeMatchupGroups.flat(),
] as const;

function resolveStat(
  matchup: FootballBlindResumeMatchup,
  stat: FootballBlindResumeStatSpec,
): FootballBlindResumeStat {
  if (!("factMetricId" in stat)) return stat;
  const left = getFootballFact(matchup.leftId, stat.factMetricId);
  const right = getFootballFact(matchup.rightId, stat.factMetricId);
  if (!left || !right) {
    throw new Error(
      `Football Blind Resume matchup ${matchup.id} is missing canonical fact ${stat.factMetricId}.`,
    );
  }
  return {
    label: left.definition.label,
    valueA: formatFootballFact(stat.factMetricId, left.fact.value),
    valueB: formatFootballFact(stat.factMetricId, right.fact.value),
  };
}

function resolveMatchup(matchup: FootballBlindResumeMatchup): FootballBlindResumeRound {
  const pack = getFootballRankFivePack(matchup.packId);
  const left = pack.items.find((item) => item.id === matchup.leftId);
  const right = pack.items.find((item) => item.id === matchup.rightId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} references an item outside ${matchup.packId}.`);
  }
  if (left.league !== right.league) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} mixes Football leagues.`);
  }
  return {
    ...matchup,
    stats: matchup.stats.map((stat) => resolveStat(matchup, stat)),
    league: left.league,
    leftName: left.name,
    rightName: right.name,
    leftSubtitle: left.subtitle,
    rightSubtitle: right.subtitle,
    leftRating: left.rating,
    rightRating: right.rating,
    winnerId: left.rating > right.rating ? left.id : right.id,
  };
}

export function resolvedFootballBlindResumeMatchups() {
  return footballBlindResumeMatchups.map(resolveMatchup);
}

const nflQuarterbackCareerIds = new Set(
  getFootballRankFivePack("nfl-quarterbacks").items.map((item) => item.id),
);

export function footballBlindResumeSubjectIdentityId(subjectId: string) {
  for (const careerId of nflQuarterbackCareerIds) {
    if (subjectId === careerId || subjectId.startsWith(`${careerId}-`)) return careerId;
  }
  return subjectId;
}

function distinctPackIds(matchups: readonly FootballBlindResumeRound[], league: FootballLeague) {
  return [...new Set(matchups.filter((matchup) => matchup.league === league).map((matchup) => matchup.packId))];
}

function selectNflPackIds(matchups: readonly FootballBlindResumeRound[], random: () => number) {
  const shuffled = shuffleLineup(distinctPackIds(matchups, "NFL"), random);
  const selected: FootballRankFivePackId[] = [];

  for (const packId of shuffled) {
    const overlapsQuarterbackIdentity =
      (packId === "nfl-quarterbacks" && selected.includes("nfl-qb-seasons"))
      || (packId === "nfl-qb-seasons" && selected.includes("nfl-quarterbacks"));
    if (overlapsQuarterbackIdentity) continue;
    selected.push(packId);
    if (selected.length === 3) break;
  }

  if (selected.length !== 3) {
    throw new Error("Football Blind Resume catalog cannot build three distinct NFL categories.");
  }
  return selected;
}

export function buildFootballBlindResumeRounds(seed: string) {
  const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed);
  const matchups = resolvedFootballBlindResumeMatchups();
  const nflPacks = selectNflPackIds(matchups, random);
  const cfbPacks = shuffleLineup(distinctPackIds(matchups, "CFB"), random).slice(0, 2);
  const packOrder = shuffleLineup([...nflPacks, ...cfbPacks], random);
  const selected: FootballBlindResumeRound[] = [];
  const usedIdentities = new Set<string>();

  for (const packId of packOrder) {
    const candidates = shuffleLineup(matchups.filter((matchup) => matchup.packId === packId), random);
    const matchup = candidates.find((candidate) => {
      const leftIdentity = footballBlindResumeSubjectIdentityId(candidate.leftId);
      const rightIdentity = footballBlindResumeSubjectIdentityId(candidate.rightId);
      return !usedIdentities.has(leftIdentity) && !usedIdentities.has(rightIdentity);
    }) ?? candidates[0];
    if (!matchup) continue;
    selected.push(matchup);
    usedIdentities.add(footballBlindResumeSubjectIdentityId(matchup.leftId));
    usedIdentities.add(footballBlindResumeSubjectIdentityId(matchup.rightId));
  }

  if (selected.length !== FOOTBALL_BLIND_RESUME_ROUNDS) {
    throw new Error("Football Blind Resume catalog cannot build five unique rounds.");
  }
  return selected;
}

export function createFootballBlindResumeRun(): FootballBlindResumeRun {
  const resolved = resolvedFootballBlindResumeMatchups();
  const validItemIds = new Set(resolved.map((matchup) => matchup.id));
  const validSubjectIds = new Set(
    resolved.flatMap((matchup) => [
      footballBlindResumeSubjectIdentityId(matchup.leftId),
      footballBlindResumeSubjectIdentityId(matchup.rightId),
    ]),
  );
  const selected = selectReplayLineup({
    gameId: FOOTBALL_BLIND_RESUME_GAME_ID,
    lineupSize: FOOTBALL_BLIND_RESUME_ROUNDS,
    attempts: 16,
    validItemIds,
    validFighterIds: validSubjectIds,
    build: (seed) => {
      const rounds = buildFootballBlindResumeRounds(seed);
      return {
        value: rounds,
        itemIds: rounds.map((round) => round.id),
        fighterIds: rounds.flatMap((round) => [
          footballBlindResumeSubjectIdentityId(round.leftId),
          footballBlindResumeSubjectIdentityId(round.rightId),
        ]),
      };
    },
  });
  return { rounds: selected.value, identity: selected.identity };
}

export function footballBlindResumeScore(correct: number) {
  return Math.max(0, Math.min(100, correct * 20));
}

export function footballBlindResumeTier(correct: number) {
  if (correct === 5) return "FRONT OFFICE SAVANT";
  if (correct === 4) return "ELITE BALL KNOWER";
  if (correct === 3) return "SOLID TAPE";
  if (correct === 2) return "GROUP CHAT GM";
  return "BACK TO THE FILM";
}
