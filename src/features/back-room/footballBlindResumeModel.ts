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

interface QualitativeResumeSubject {
  id: string;
  evidence: readonly [string, string, string, string, string];
}

interface QualitativeResumeGroup {
  packId: FootballRankFivePackId;
  prompt: string;
  subjects: readonly QualitativeResumeSubject[];
}

const QUALITATIVE_LABELS = [
  "Peak case",
  "Body of work",
  "Results case",
  "Context",
  "Signature edge",
] as const;

const qualitativeResumeGroups: readonly QualitativeResumeGroup[] = [
  {
    packId: "nfl-wide-receivers",
    prompt: "Which NFL wide receiver résumé is greater?",
    subjects: [
      { id: "jerry-rice", evidence: ["Dominance stayed elite in every kind of offense", "The benchmark receiving runway", "Postseason résumé strengthens the individual case", "Thrived before and after major offensive changes", "No tradeoff between peak, volume and longevity"] },
      { id: "randy-moss", evidence: ["Vertical peak forced defenses to redraw coverage", "Multiple superstar phases across different teams", "Deep postseason impact without the final team prize", "Quarterback and scheme changes barely reduced the threat", "The most frightening touchdown ceiling in the matchup"] },
      { id: "terrell-owens", evidence: ["Power, separation and scoring translated everywhere", "A long superstar run with huge cumulative value", "Big-stage production carried across franchises", "Produced through several quarterbacks and systems", "Portable dominance is the heart of the case"] },
      { id: "calvin-johnson", evidence: ["A supernova peak that broke normal coverage rules", "Shorter runway than the other inner-circle receivers", "Team results never matched the individual ceiling", "Produced through difficult offensive circumstances", "Peak physical mismatch is almost impossible to top"] },
    ],
  },
  {
    packId: "nfl-tight-ends",
    prompt: "Which NFL tight end résumé is greater?",
    subjects: [
      { id: "tony-gonzalez", evidence: ["Elite receiving value lasted deep into his career", "The benchmark longevity case at tight end", "Individual résumé carries more weight than team hardware", "Stayed productive across eras and quarterback changes", "Unmatched receiving runway for the position"] },
      { id: "rob-gronkowski", evidence: ["Dominant receiver and blocker in the same package", "A shorter career with an outrageous prime", "Championship production is central to the case", "Availability is the only real drag on the résumé", "Two-way peak plus postseason destruction"] },
      { id: "travis-kelce", evidence: ["Historic receiving efficiency in the biggest games", "A long elite modern prime with rare durability", "Postseason production strengthens every layer", "Played inside a great offense without disappearing into it", "Playoff receiving value at a different scale"] },
      { id: "antonio-gates", evidence: ["Red-zone dominance changed how defenses treated the position", "A long scoring-heavy receiving career", "Team success trails the individual production", "Transitioned from raw athlete to complete receiving threat", "Sustained touchdown pressure is the separator"] },
    ],
  },
  {
    packId: "nfl-defensive-players",
    prompt: "Which NFL defensive career résumé is greater?",
    subjects: [
      { id: "lawrence-taylor", evidence: ["A defensive peak that changed protection rules", "Sustained game-wrecking impact across a full prime", "Awards and championship value reinforce the eye test", "The league had to adapt structurally to his pressure", "Position-changing disruption from the edge"] },
      { id: "aaron-donald", evidence: ["Interior disruption reached an almost unmatched level", "A compact career with almost no decline in elite status", "Major awards and a championship postseason peak", "Created edge-rusher impact from a harder interior path", "Interior dominance is the unique trump card"] },
      { id: "ray-lewis", evidence: ["Complete middle-linebacker control of a defense", "A two-decade centerpiece with multiple elite phases", "Championship leadership and postseason value matter heavily", "Role evolved while the defense kept running through him", "Longevity plus defensive command"] },
      { id: "jj-watt", evidence: ["At his best he wrecked games from every front alignment", "Injuries interrupted an otherwise inner-circle prime", "Individual dominance carries more weight than team success", "Peak arrived without consistent contender-level support", "The short-window havoc case is overwhelming"] },
    ],
  },
  {
    packId: "nfl-head-coaches",
    prompt: "Which NFL head-coaching résumé is greater?",
    subjects: [
      { id: "bill-belichick", evidence: ["The defining modern dynasty peak", "Two decades of sustained championship contention", "The deepest postseason résumé in the matchup", "Repeatedly rebuilt around changing personnel and styles", "Dynasty construction plus week-to-week adaptability"] },
      { id: "vince-lombardi", evidence: ["Shorter tenure with overwhelming championship conversion", "Less modern longevity but almost no wasted prime", "Titles define the entire coaching case", "Dominance came in a compressed and unforgiving era", "Era-defining postseason authority"] },
      { id: "andy-reid", evidence: ["A late-career dynasty peak followed years of prior contention", "Elite results across two franchises and several eras", "Championship success transformed an already great résumé", "Offenses kept evolving with very different quarterbacks", "Longevity plus offensive reinvention"] },
      { id: "bill-walsh", evidence: ["A dynasty peak paired with transformational offensive design", "Shorter head-coaching runway than the longevity giants", "Championship conversion was elite at the peak", "Influence continued through an enormous coaching tree", "Scheme innovation and dynasty building reinforce each other"] },
    ],
  },
  {
    packId: "nfl-qb-seasons",
    prompt: "Which single-season NFL quarterback résumé is greater?",
    subjects: [
      { id: "aaron-rodgers-2011", evidence: ["Efficiency and explosiveness barely dipped all season", "The regular-season body of work was nearly spotless", "Individual hardware came without the postseason finish", "Played from ahead without becoming conservative", "Efficiency peak is the defining case"] },
      { id: "patrick-mahomes-2022", evidence: ["Elite volume and improvisation survived major offensive change", "Production stayed dominant from autumn through postseason", "The season ended with every major team goal achieved", "Lost a premier weapon and made the offense more complete", "Peak play and championship finishing arrived together"] },
      { id: "steve-young-1994", evidence: ["Passing efficiency and rushing value peaked together", "The full season was elite before the postseason surge", "The championship finish removes the biggest résumé objection", "Dual-threat value came before the modern spread era", "Efficiency plus title-game finishing"] },
      { id: "lamar-jackson-2019", evidence: ["A unique rushing and passing blend broke defensive rules", "Weekly dominance reshaped the entire offense", "Regular-season hardware is stronger than the playoff ending", "The scheme amplified him because his skill set made it possible", "Transformational dual-threat value"] },
    ],
  },
  {
    packId: "nfl-team-seasons",
    prompt: "Which single-season NFL team résumé is greater?",
    subjects: [
      { id: "1972-miami-dolphins", evidence: ["The one modern team season with no losing day", "No bad week exists anywhere on the résumé", "Every team goal ended with a championship", "Dominance matters, but perfection is the defining context", "Finishing the entire job is the trump card"] },
      { id: "1985-chicago-bears", evidence: ["Defensive intimidation turned games into mismatches", "Near-perfect season with overwhelming point control", "Dominance carried cleanly through the championship game", "The defense set the emotional and tactical terms every week", "Perhaps the most frightening defense-season package"] },
      { id: "1991-washington", evidence: ["Efficiency and point differential were historically strong", "A wire-to-wire team with little close-call dependence", "The statistical case ended with a championship", "Balance made it difficult to isolate one weak phase", "Complete schedule-adjusted dominance"] },
      { id: "1996-green-bay-packers", evidence: ["Elite offense, defense and special teams peaked together", "The team carried contender-level form through the full season", "A convincing championship finish validates the profile", "Few all-time teams were this complete across every phase", "Three-phase dominance is the separator"] },
    ],
  },
  {
    packId: "college-quarterbacks",
    prompt: "Which college quarterback résumé is greater?",
    subjects: [
      { id: "cam-newton-2010", evidence: ["One-player offensive takeover on an unbeaten champion", "A compressed college résumé with no unfinished business", "Individual and team hardware arrived together", "The supporting cast magnifies how much creation ran through him", "Carry-job value on the sport's biggest stage"] },
      { id: "joe-burrow-2019", evidence: ["Passing precision exploded against an elite schedule", "The final season kept improving as the stakes rose", "Individual hardware and the national title aligned", "A loaded offense still depended on elite quarterback execution", "The cleanest modern passing-season résumé"] },
      { id: "vince-young-2005", evidence: ["Dual-threat dominance culminated in an iconic title game", "The unbeaten run repeatedly leaned on late-game control", "The championship is stronger than the individual-award case", "His value grew when structure broke down", "The championship-game carry is the separator"] },
      { id: "tim-tebow-2007", evidence: ["Power-run and red-zone dominance came from the quarterback spot", "The broader college career extends beyond one peak season", "Individual hardware pairs with championship-era team success", "Role and supporting cast changed without erasing his identity", "Career hardware plus unmatched short-yardage value"] },
    ],
  },
  {
    packId: "college-head-coaches",
    prompt: "Which college head-coaching résumé is greater?",
    subjects: [
      { id: "nick-saban-cfb", evidence: ["Multiple separate championship-caliber roster cycles", "The longest modern run of annual national relevance", "National titles are the foundation, not a side note", "Adapted from defense-first football into the modern scoring era", "Dynasty maintenance across changing eras"] },
      { id: "urban-meyer-cfb", evidence: ["Championship offenses appeared at multiple powerhouse programs", "Shorter stops than the longevity benchmark but elite winning", "Titles at different schools strengthen the portability case", "Program elevation usually happened immediately", "Winning translated across conferences and styles"] },
      { id: "kirby-smart-cfb", evidence: ["Georgia became the sport's most physically complete roster", "A shorter career already contains a dynasty-level prime", "Championship repetition drives the peak case", "Recruiting and development created an unusually high floor", "Modern roster machine-building"] },
      { id: "dabo-swinney-cfb", evidence: ["Clemson repeatedly reached the sport's highest stage", "A long playoff-era run grew from one program build", "Multiple titles validate the sustained contender window", "Built outside the sport's traditional inner-circle powers", "Creating a new superpower is the signature achievement"] },
    ],
  },
  {
    packId: "college-programs",
    prompt: "Which program has the stronger résumé since 2000?",
    subjects: [
      { id: "alabama-program", evidence: ["The sport's defining modern dynasty sits inside the window", "Elite relevance stretches across almost the entire era", "Championship volume overwhelms most comparisons", "Success survived massive staff and roster turnover", "Sustained top-end dominance without a true peer"] },
      { id: "ohio-state-program", evidence: ["National-title peaks arrived under multiple coaching staffs", "Almost no prolonged down period appears in the window", "Major-stage success pairs with relentless contention", "Coaching transitions rarely lowered the program floor", "The highest year-to-year floor in the matchup"] },
      { id: "georgia-program", evidence: ["The recent championship peak rivals any program's", "The first half of the window built toward a dominant second half", "Repeated championships transformed the modern résumé", "Recruiting depth turned close seasons into sustained power", "Recent peak strength and roster dominance"] },
      { id: "lsu-program", evidence: ["Several distinct title teams reached very different ceilings", "More volatility than the highest-floor programs", "Championship success under different staffs matters heavily", "The program can spike to the top without long continuity", "Multiple independent national-title peaks"] },
    ],
  },
  {
    packId: "college-program-eras",
    prompt: "Which defined college program era is greater?",
    subjects: [
      { id: "alabama-2009-2020", evidence: ["Repeated teams in the run could claim all-time status", "Title-or-bust expectations lasted through several roster cycles", "Championship volume defines the era", "The style of play changed while the standard barely moved", "The benchmark modern dynasty"] },
      { id: "georgia-2021-2024", evidence: ["Back-to-back championship form came with historic defense", "Compact era with almost no ordinary season", "Repeated titles give the short run enormous weight", "Roster depth made attrition look almost irrelevant", "Concentrated dominance with a massive weekly floor"] },
      { id: "usc-2002-2008", evidence: ["National glamour and elite talent translated every season", "The run lived near the top for its entire span", "Titles and award-level stars reinforce the peak", "The program became the defining national brand of its moment", "Sustained dominance in a compact era"] },
      { id: "miami-2000-2003", evidence: ["Roster talent and physical dominance were almost absurd", "Shorter era than the other dynasty candidates", "A championship plus a near-repeat keeps the debate alive", "Future professional stars were stacked across the depth chart", "Perhaps the highest pure talent concentration"] },
    ],
  },
] as const;

const factualSignatureEdges: Readonly<Record<string, string>> = {
  "tom-brady": "Championship longevity",
  "peyton-manning": "Regular-season command",
  "joe-montana": "Postseason finishing",
  "drew-brees": "Volume plus accuracy",
  "dan-marino": "Era-breaking passing peak",
  "jim-brown": "Era dominance",
  "barry-sanders": "Rushing peak plus efficiency",
  "walter-payton": "Complete longevity",
  "emmitt-smith": "Volume plus championship production",
  "2019-lsu": "Historic offense plus elite schedule",
  "2020-alabama": "All-conference schedule dominance",
  "2005-texas": "Iconic title-game finish",
  "2004-usc": "Wire-to-wire dominance",
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
  return pairwise(subjectIds, (leftId, rightId) => {
    const leftEdge = factualSignatureEdges[leftId];
    const rightEdge = factualSignatureEdges[rightId];
    if (!leftEdge || !rightEdge) {
      throw new Error(`Football Blind Resume factual signature is incomplete for ${leftId} vs ${rightId}.`);
    }
    return {
      id: `${packId}-${leftId}-v-${rightId}`,
      packId,
      prompt,
      leftId,
      rightId,
      stats: [
        ...metricIds.map((factMetricId) => ({ factMetricId } as FootballBlindResumeFactStatSpec)),
        { label: "Signature edge", valueA: leftEdge, valueB: rightEdge },
      ],
    };
  });
}

function qualitativeMatchups(group: QualitativeResumeGroup) {
  return pairwise(group.subjects, (left, right) => ({
    id: `${group.packId}-${left.id}-v-${right.id}`,
    packId: group.packId,
    prompt: group.prompt,
    leftId: left.id,
    rightId: right.id,
    stats: QUALITATIVE_LABELS.map((label, index) => ({
      label,
      valueA: left.evidence[index],
      valueB: right.evidence[index],
    })),
  }));
}

const nflQuarterbackFactMatchups = factMatchups(
  "nfl-quarterbacks",
  "Which NFL quarterback résumé is greater?",
  ["tom-brady", "peyton-manning", "joe-montana", "drew-brees", "dan-marino"],
  ["nfl-career-passing-yards", "nfl-career-passing-touchdowns", "nfl-ap-mvp-awards", "nfl-super-bowl-titles"],
);

const nflRunningBackFactMatchups = factMatchups(
  "nfl-running-backs",
  "Which NFL running back résumé is greater?",
  ["jim-brown", "barry-sanders", "walter-payton", "emmitt-smith"],
  ["nfl-career-rushing-yards", "nfl-career-rushing-touchdowns", "nfl-career-games", "nfl-ap-mvp-awards"],
);

const collegeTeamSeasonFactMatchups = factMatchups(
  "college-team-seasons",
  "Which single-season team résumé is greater?",
  ["2019-lsu", "2020-alabama", "2005-texas", "2004-usc", "2013-florida-state"],
  ["cfb-team-points-per-game", "cfb-team-srs", "cfb-team-sos", "cfb-national-title"],
);

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = [
  ...nflQuarterbackFactMatchups,
  ...nflRunningBackFactMatchups,
  ...collegeTeamSeasonFactMatchups,
  ...qualitativeResumeGroups.flatMap(qualitativeMatchups),
] as const;

function resolveStat(matchup: FootballBlindResumeMatchup, stat: FootballBlindResumeStatSpec): FootballBlindResumeStat {
  if (!("factMetricId" in stat)) return stat;
  const left = getFootballFact(matchup.leftId, stat.factMetricId);
  const right = getFootballFact(matchup.rightId, stat.factMetricId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} is missing canonical fact ${stat.factMetricId}.`);
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
  if (left.rating === right.rating) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} has no canonical winner because its ratings are tied.`);
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
    });
    if (!matchup) {
      throw new Error(`Football Blind Resume catalog cannot build an identity-unique ${packId} round.`);
    }
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
