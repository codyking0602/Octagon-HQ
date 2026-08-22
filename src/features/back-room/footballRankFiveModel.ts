import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";

export const FOOTBALL_RANK_FIVE_GAME_ID = "football-rank-five";

export type FootballLeague = "NFL" | "CFB";

export type FootballRankFivePackId =
  | "nfl-quarterbacks"
  | "nfl-running-backs"
  | "nfl-head-coaches"
  | "college-quarterbacks"
  | "college-programs"
  | "college-team-seasons";

export interface FootballRankFiveItem {
  id: string;
  name: string;
  subtitle: string;
  league: FootballLeague;
  rating: number;
}

export interface FootballRankFivePack {
  id: FootballRankFivePackId;
  name: string;
  prompt: string;
  intro: string;
  items: readonly FootballRankFiveItem[];
}

export interface FootballRankFiveRun {
  pack: FootballRankFivePack;
  lineup: FootballRankFiveItem[];
  identity: PlayLineupIdentity;
}

const nflQuarterbacks: readonly FootballRankFiveItem[] = [
  { id: "tom-brady", name: "Tom Brady", subtitle: "7× Super Bowl champion", league: "NFL", rating: 100 },
  { id: "patrick-mahomes", name: "Patrick Mahomes", subtitle: "3× champion · 2× MVP", league: "NFL", rating: 99 },
  { id: "joe-montana", name: "Joe Montana", subtitle: "4× Super Bowl champion", league: "NFL", rating: 97 },
  { id: "peyton-manning", name: "Peyton Manning", subtitle: "5× MVP · 2× champion", league: "NFL", rating: 96 },
  { id: "aaron-rodgers", name: "Aaron Rodgers", subtitle: "4× MVP · Super Bowl champion", league: "NFL", rating: 94 },
  { id: "drew-brees", name: "Drew Brees", subtitle: "Super Bowl champion · 80,358 pass yards", league: "NFL", rating: 92 },
  { id: "dan-marino", name: "Dan Marino", subtitle: "1984 MVP · 3× All-Pro", league: "NFL", rating: 91 },
  { id: "john-elway", name: "John Elway", subtitle: "2× champion · 1987 MVP", league: "NFL", rating: 90 },
  { id: "brett-favre", name: "Brett Favre", subtitle: "3× MVP · Super Bowl champion", league: "NFL", rating: 89 },
  { id: "steve-young", name: "Steve Young", subtitle: "2× MVP · Super Bowl MVP", league: "NFL", rating: 88 },
  { id: "roger-staubach", name: "Roger Staubach", subtitle: "2× champion · 1971 MVP", league: "NFL", rating: 87 },
  { id: "kurt-warner", name: "Kurt Warner", subtitle: "2× MVP · Super Bowl MVP", league: "NFL", rating: 85 },
  { id: "ben-roethlisberger", name: "Ben Roethlisberger", subtitle: "2× Super Bowl champion", league: "NFL", rating: 84 },
  { id: "eli-manning", name: "Eli Manning", subtitle: "2× Super Bowl MVP", league: "NFL", rating: 82 },
  { id: "philip-rivers", name: "Philip Rivers", subtitle: "63,440 pass yards · 8× Pro Bowl", league: "NFL", rating: 79 },
];

const nflRunningBacks: readonly FootballRankFiveItem[] = [
  { id: "jim-brown", name: "Jim Brown", subtitle: "3× MVP · 8× rushing leader", league: "NFL", rating: 100 },
  { id: "barry-sanders", name: "Barry Sanders", subtitle: "1997 MVP · 10× Pro Bowl", league: "NFL", rating: 99 },
  { id: "walter-payton", name: "Walter Payton", subtitle: "1977 MVP · Super Bowl champion", league: "NFL", rating: 98 },
  { id: "emmitt-smith", name: "Emmitt Smith", subtitle: "All-time rushing leader · 3× champion", league: "NFL", rating: 97 },
  { id: "adrian-peterson", name: "Adrian Peterson", subtitle: "2012 MVP · 3× rushing leader", league: "NFL", rating: 95 },
  { id: "ladainian-tomlinson", name: "LaDainian Tomlinson", subtitle: "2006 MVP · 162 rushing TD", league: "NFL", rating: 94 },
  { id: "marshall-faulk", name: "Marshall Faulk", subtitle: "2000 MVP · Super Bowl champion", league: "NFL", rating: 93 },
  { id: "derrick-henry", name: "Derrick Henry", subtitle: "2,000-yard season · 2× rushing leader", league: "NFL", rating: 92 },
  { id: "eric-dickerson", name: "Eric Dickerson", subtitle: "Single-season rushing record", league: "NFL", rating: 91 },
  { id: "oj-simpson", name: "O.J. Simpson", subtitle: "1973 MVP · first 2,000-yard season", league: "NFL", rating: 90 },
  { id: "earl-campbell", name: "Earl Campbell", subtitle: "1979 MVP · 3× rushing leader", league: "NFL", rating: 88 },
  { id: "thurman-thomas", name: "Thurman Thomas", subtitle: "1991 MVP · 5× Pro Bowl", league: "NFL", rating: 87 },
  { id: "edgerrin-james", name: "Edgerrin James", subtitle: "2× rushing leader · Hall of Fame", league: "NFL", rating: 85 },
  { id: "frank-gore", name: "Frank Gore", subtitle: "16,000 rushing yards", league: "NFL", rating: 84 },
  { id: "marshawn-lynch", name: "Marshawn Lynch", subtitle: "Super Bowl champion · 2× rushing TD leader", league: "NFL", rating: 82 },
];

const nflHeadCoaches: readonly FootballRankFiveItem[] = [
  { id: "bill-belichick", name: "Bill Belichick", subtitle: "6× Super Bowl champion as head coach", league: "NFL", rating: 100 },
  { id: "andy-reid", name: "Andy Reid", subtitle: "3× champion · 300+ wins", league: "NFL", rating: 98 },
  { id: "mike-tomlin", name: "Mike Tomlin", subtitle: "Super Bowl champion · no losing seasons", league: "NFL", rating: 94 },
  { id: "john-harbaugh", name: "John Harbaugh", subtitle: "Super Bowl champion · 2× Coach of the Year", league: "NFL", rating: 92 },
  { id: "pete-carroll", name: "Pete Carroll", subtitle: "Super Bowl champion · 2 NFC titles", league: "NFL", rating: 91 },
  { id: "sean-mcvay", name: "Sean McVay", subtitle: "Super Bowl champion · 2 NFC titles", league: "NFL", rating: 90 },
  { id: "sean-payton", name: "Sean Payton", subtitle: "Super Bowl champion · 3× 13-win seasons", league: "NFL", rating: 89 },
  { id: "tom-coughlin", name: "Tom Coughlin", subtitle: "2× Super Bowl champion", league: "NFL", rating: 88 },
  { id: "tony-dungy", name: "Tony Dungy", subtitle: "Super Bowl champion · Hall of Fame", league: "NFL", rating: 87 },
  { id: "mike-shanahan", name: "Mike Shanahan", subtitle: "2× champion · 170 regular-season wins", league: "NFL", rating: 86 },
  { id: "bill-cowher", name: "Bill Cowher", subtitle: "Super Bowl champion · Hall of Fame", league: "NFL", rating: 85 },
  { id: "mike-holmgren", name: "Mike Holmgren", subtitle: "Super Bowl champion · 3 conference titles", league: "NFL", rating: 84 },
  { id: "mike-mccarthy", name: "Mike McCarthy", subtitle: "Super Bowl champion · 11 playoff trips", league: "NFL", rating: 83 },
  { id: "bruce-arians", name: "Bruce Arians", subtitle: "Super Bowl champion · 2× Coach of the Year", league: "NFL", rating: 82 },
  { id: "john-fox", name: "John Fox", subtitle: "2 conference titles with two franchises", league: "NFL", rating: 78 },
];

const collegeQuarterbacks: readonly FootballRankFiveItem[] = [
  { id: "cam-newton-2010", name: "Cam Newton", subtitle: "2010 · Heisman · 14–0 national champion", league: "CFB", rating: 100 },
  { id: "joe-burrow-2019", name: "Joe Burrow", subtitle: "2019 · Heisman · 60 pass TD", league: "CFB", rating: 99 },
  { id: "vince-young-2005", name: "Vince Young", subtitle: "2005 · 3,036 pass · 1,050 rush", league: "CFB", rating: 98 },
  { id: "tim-tebow-2007", name: "Tim Tebow", subtitle: "Heisman · 2× national champion", league: "CFB", rating: 97 },
  { id: "lamar-jackson-2016", name: "Lamar Jackson", subtitle: "2016 Heisman · 51 total TD", league: "CFB", rating: 95 },
  { id: "matt-leinart-2004", name: "Matt Leinart", subtitle: "2004 Heisman · national champion", league: "CFB", rating: 94 },
  { id: "baker-mayfield-2017", name: "Baker Mayfield", subtitle: "2017 Heisman · 198.9 passer rating", league: "CFB", rating: 93 },
  { id: "trevor-lawrence-2018", name: "Trevor Lawrence", subtitle: "34–2 as starter · national champion", league: "CFB", rating: 92 },
  { id: "marcus-mariota-2014", name: "Marcus Mariota", subtitle: "2014 Heisman · 58 total TD", league: "CFB", rating: 91 },
  { id: "johnny-manziel-2012", name: "Johnny Manziel", subtitle: "2012 Heisman · 5,116 total yards", league: "CFB", rating: 90 },
  { id: "colt-mccoy-2008", name: "Colt McCoy", subtitle: "45 career wins · 2008 Heisman runner-up", league: "CFB", rating: 89 },
  { id: "sam-bradford-2008", name: "Sam Bradford", subtitle: "2008 Heisman · 50 pass TD", league: "CFB", rating: 88 },
  { id: "caleb-williams-2022", name: "Caleb Williams", subtitle: "2022 Heisman · 52 total TD", league: "CFB", rating: 87 },
  { id: "bryce-young-2021", name: "Bryce Young", subtitle: "2021 Heisman · 4,872 pass yards", league: "CFB", rating: 86 },
  { id: "jameis-winston-2013", name: "Jameis Winston", subtitle: "2013 Heisman · 14–0 national champion", league: "CFB", rating: 85 },
];

const collegePrograms: readonly FootballRankFiveItem[] = [
  { id: "alabama-program", name: "Alabama", subtitle: "Since 2000 · 6 national titles", league: "CFB", rating: 100 },
  { id: "ohio-state-program", name: "Ohio State", subtitle: "Since 2000 · 3 national titles", league: "CFB", rating: 97 },
  { id: "georgia-program", name: "Georgia", subtitle: "Since 2000 · back-to-back titles", league: "CFB", rating: 96 },
  { id: "lsu-program", name: "LSU", subtitle: "Since 2000 · 3 national titles", league: "CFB", rating: 93 },
  { id: "clemson-program", name: "Clemson", subtitle: "Since 2000 · 2 national titles", league: "CFB", rating: 92 },
  { id: "oklahoma-program", name: "Oklahoma", subtitle: "Since 2000 · title + 4 CFP trips", league: "CFB", rating: 91 },
  { id: "usc-program", name: "USC", subtitle: "Since 2000 · dominant 2000s peak", league: "CFB", rating: 90 },
  { id: "florida-program", name: "Florida", subtitle: "Since 2000 · 2 national titles", league: "CFB", rating: 89 },
  { id: "texas-program", name: "Texas", subtitle: "Since 2000 · 2005 title + CFP return", league: "CFB", rating: 88 },
  { id: "florida-state-program", name: "Florida State", subtitle: "Since 2000 · 2013 national title", league: "CFB", rating: 87 },
  { id: "michigan-program", name: "Michigan", subtitle: "Since 2000 · 2023 national title", league: "CFB", rating: 86 },
  { id: "oregon-program", name: "Oregon", subtitle: "Since 2000 · 2 title-game trips", league: "CFB", rating: 84 },
  { id: "auburn-program", name: "Auburn", subtitle: "Since 2000 · 2010 national title", league: "CFB", rating: 83 },
  { id: "miami-program", name: "Miami", subtitle: "Since 2000 · 2001 national title", league: "CFB", rating: 82 },
  { id: "notre-dame-program", name: "Notre Dame", subtitle: "Since 2000 · sustained top-tier relevance", league: "CFB", rating: 80 },
];

const collegeTeamSeasons: readonly FootballRankFiveItem[] = [
  { id: "2001-miami", name: "2001 Miami", subtitle: "12–0 · national champion", league: "CFB", rating: 100 },
  { id: "2019-lsu", name: "2019 LSU", subtitle: "15–0 · national champion", league: "CFB", rating: 100 },
  { id: "2020-alabama", name: "2020 Alabama", subtitle: "13–0 · national champion", league: "CFB", rating: 99 },
  { id: "2005-texas", name: "2005 Texas", subtitle: "13–0 · national champion", league: "CFB", rating: 98 },
  { id: "2004-usc", name: "2004 USC", subtitle: "13–0 · national champion", league: "CFB", rating: 97 },
  { id: "2018-clemson", name: "2018 Clemson", subtitle: "15–0 · national champion", league: "CFB", rating: 96 },
  { id: "2013-florida-state", name: "2013 Florida State", subtitle: "14–0 · national champion", league: "CFB", rating: 95 },
  { id: "2022-georgia", name: "2022 Georgia", subtitle: "15–0 · national champion", league: "CFB", rating: 95 },
  { id: "2008-florida", name: "2008 Florida", subtitle: "13–1 · national champion", league: "CFB", rating: 93 },
  { id: "2010-auburn", name: "2010 Auburn", subtitle: "14–0 · national champion", league: "CFB", rating: 92 },
  { id: "2014-ohio-state", name: "2014 Ohio State", subtitle: "14–1 · national champion", league: "CFB", rating: 91 },
  { id: "2023-michigan", name: "2023 Michigan", subtitle: "15–0 · national champion", league: "CFB", rating: 90 },
  { id: "2009-alabama", name: "2009 Alabama", subtitle: "14–0 · national champion", league: "CFB", rating: 89 },
  { id: "2002-ohio-state", name: "2002 Ohio State", subtitle: "14–0 · national champion", league: "CFB", rating: 88 },
  { id: "2000-oklahoma", name: "2000 Oklahoma", subtitle: "13–0 · national champion", league: "CFB", rating: 87 },
];

export const footballRankFivePacks: readonly FootballRankFivePack[] = [
  {
    id: "nfl-quarterbacks",
    name: "NFL QB Careers",
    prompt: "Rank their NFL careers",
    intro: "One quarterback at a time. Lock him into #1 through #5 before you see who comes next.",
    items: nflQuarterbacks,
  },
  {
    id: "nfl-running-backs",
    name: "NFL RB Careers",
    prompt: "Rank their NFL careers",
    intro: "Career greatness only. Every placement locks before the next running back appears.",
    items: nflRunningBacks,
  },
  {
    id: "nfl-head-coaches",
    name: "NFL Head Coaches",
    prompt: "Rank their NFL coaching careers",
    intro: "Resume, peak, longevity and postseason success. Lock each coach before the next reveal.",
    items: nflHeadCoaches,
  },
  {
    id: "college-quarterbacks",
    name: "College QBs",
    prompt: "Rank their college careers",
    intro: "College only. Forget the NFL. Lock each quarterback before you see the next one.",
    items: collegeQuarterbacks,
  },
  {
    id: "college-programs",
    name: "Programs Since 2000",
    prompt: "Rank the programs since 2000",
    intro: "Titles, elite seasons, consistency and staying power since 2000. One program at a time.",
    items: collegePrograms,
  },
  {
    id: "college-team-seasons",
    name: "Legendary CFB Teams",
    prompt: "Rank these single-season teams",
    intro: "Judge only the season shown. Every slot locks before the next national champion appears.",
    items: collegeTeamSeasons,
  },
] as const;

export function getFootballRankFivePack(packId: FootballRankFivePackId) {
  const pack = footballRankFivePacks.find((row) => row.id === packId);
  if (!pack) throw new Error(`Unsupported Football Rank 5 pack: ${packId}`);
  return pack;
}

export function footballRankFivePackForSeed(
  seed: string,
  exclude?: FootballRankFivePackId,
) {
  const candidates = exclude && footballRankFivePacks.length > 1
    ? footballRankFivePacks.filter((pack) => pack.id !== exclude)
    : [...footballRankFivePacks];
  const random = seededLineupRandom(FOOTBALL_RANK_FIVE_GAME_ID, "pack", seed);
  return candidates[Math.floor(random() * candidates.length)]!;
}

export function buildFootballRankFiveLineup(
  packId: FootballRankFivePackId,
  seed: string,
) {
  const pack = getFootballRankFivePack(packId);
  const ordered = [...pack.items].sort((left, right) => right.rating - left.rating || left.name.localeCompare(right.name));
  const third = Math.floor(ordered.length / 3);
  const high = ordered.slice(0, third);
  const middle = ordered.slice(third, third * 2);
  const low = ordered.slice(third * 2);
  const random = seededLineupRandom(FOOTBALL_RANK_FIVE_GAME_ID, packId, seed);

  const highPick = shuffleLineup(high, random)[0]!;
  const middlePicks = shuffleLineup(middle, random).slice(0, 2);
  const lowPick = shuffleLineup(low, random)[0]!;
  const used = new Set([highPick.id, ...middlePicks.map((item) => item.id), lowPick.id]);
  const wildcard = shuffleLineup(ordered.filter((item) => !used.has(item.id)), random)[0]!;

  return shuffleLineup([highPick, ...middlePicks, lowPick, wildcard], random);
}

export function createFootballRankFiveRun(packId: FootballRankFivePackId): FootballRankFiveRun {
  const pack = getFootballRankFivePack(packId);
  const validItemIds = new Set(pack.items.map((item) => item.id));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_RANK_FIVE_GAME_ID,
    scopeId: packId,
    lineupSize: 5,
    attempts: 12,
    validItemIds,
    build: (seed) => {
      const lineup = buildFootballRankFiveLineup(packId, seed);
      return { value: lineup, itemIds: lineup.map((item) => item.id) };
    },
  });
  return { pack, lineup: selected.value, identity: selected.identity };
}

export function createRandomFootballRankFiveRun(exclude?: FootballRankFivePackId) {
  const packSeed = createReplaySeed(`${FOOTBALL_RANK_FIVE_GAME_ID}-pack`);
  const pack = footballRankFivePackForSeed(packSeed, exclude);
  return createFootballRankFiveRun(pack.id);
}
