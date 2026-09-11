export interface FootballPersonResumeResearchRecord {
  subjectId: string;
  source: { publisher: string; title: string; url: string };
  facts: readonly { conceptId: string; value: string; tags: readonly string[] }[];
}

const f = (conceptId: string, value: string, tags: readonly string[]) => ({ conceptId, value, tags });
const r = (
  subjectId: string,
  publisher: string,
  url: string,
  facts: FootballPersonResumeResearchRecord["facts"],
): FootballPersonResumeResearchRecord => ({
  subjectId,
  source: { publisher, title: `Source-backed football résumé for ${subjectId}`, url },
  facts,
});

/**
 * Source-backed football résumé depth for canonical football identities.
 * These are reusable stage-scoped football facts, not Who Am I clue copy or roster ownership.
 */
export const footballPersonResumeResearch: readonly FootballPersonResumeResearchRecord[] = [
  r("cfb-aaron-ross", "Texas Athletics", "https://texaslonghorns.com/news/2007/2/12/021207aaa_476.aspx", [
      f("career-games", "I played in 51 career games at Texas.", ["college", "production"]),
      f("career-tackles-interceptions", "I finished my Texas career with 205 tackles, 33 pass breakups and 10 interceptions.", ["college", "production"]),
      f("thorpe-award-2006", "I won the 2006 Jim Thorpe Award as the nation's top defensive back.", ["college", "award"])
    ]),
  r("cfb-aj-hawk", "Ohio State Athletics", "https://ohiostatebuckeyes.com/honors/hall-of-fame-inductees/aj-hawk/174", [
      f("career-tackles", "I finished my Ohio State career with 394 tackles.", ["college", "production"]),
      f("career-tfl-sacks", "My Ohio State career included 41 tackles for loss and 15 sacks.", ["college", "production"]),
      f("lombardi-award-2005", "I won the 2005 Lombardi Award.", ["college", "award"])
    ]),
  r("cfb-alex-mack", "California Athletics", "https://calbears.com/sports/2009/4/25/207736116.aspx", [
      f("consecutive-starts", "I made 39 consecutive starts to close my California career.", ["college", "production"]),
      f("two-morris-trophies", "I won the Morris Trophy as the Pac-10's top offensive lineman in both 2007 and 2008.", ["college", "award"]),
      f("three-first-team-all-pac10", "I was a three-time first-team All-Pac-10 selection.", ["college", "award"])
    ]),
  r("cfb-barrett-jones", "National Football Foundation", "https://footballfoundation.org/sports/football/roster/barrett-jones/569", [
      f("outland-trophy-2011", "I won the 2011 Outland Trophy while playing left tackle.", ["college", "award"]),
      f("rimington-award-2012", "I won the 2012 Rimington Trophy as the nation's top center.", ["college", "award"]),
      f("three-national-titles-three-positions", "I won three BCS national championships at Alabama while starting at three different offensive-line positions.", ["college", "championship"])
    ]),
  r("cfb-brandin-cooks", "Oregon State Athletics", "https://osubeavers.com/sports/football/roster/brandin-cooks/2450", [
      f("2013-receptions", "I caught a Pac-12-record 128 passes in 2013.", ["college", "production"]),
      f("2013-receiving-yards", "I set a Pac-12 single-season record with 1,730 receiving yards in 2013.", ["college", "production"]),
      f("biletnikoff-2013", "I won the Biletnikoff Award as the nation's top receiver.", ["college", "award"])
    ]),
  r("cfb-brandon-scherff", "Iowa Athletics", "https://hawkeyesports.com/sports/football/roster/player/brandon-scherff", [
      f("career-starts", "I made 36 career starts at Iowa.", ["college", "production"]),
      f("outland-trophy-2014", "I won the 2014 Outland Trophy.", ["college", "award"]),
      f("big-ten-ol-year-2014", "I was the Big Ten's Offensive Lineman of the Year in 2014.", ["college", "award"])
    ]),
  r("cfb-braylon-edwards", "Michigan Athletics", "https://mgoblue.com/news/2017/4/27/kornacki_braylon_edwards_has_new_no_1", [
      f("career-receiving-triple", "I finished my Michigan career with 252 receptions, 3,541 receiving yards and 39 touchdown catches.", ["college", "production"]),
      f("2004-receiving-line", "As a senior in 2004, I caught 97 passes for 1,330 yards and 15 touchdowns.", ["college", "production"]),
      f("biletnikoff-2004", "I won the 2004 Biletnikoff Award as the nation's top receiver.", ["college", "award"])
    ]),
  r("cfb-brian-orakpo", "Texas Athletics", "https://texaslonghorns.com/sports/football/roster/brian-orakpo/748", [
      f("career-games-starts", "I played in 47 career games at Texas and started 21 of them.", ["college", "production"]),
      f("2008-sacks-tfl", "As a senior, I recorded 11.5 sacks and 19 tackles for loss.", ["college", "production"]),
      f("2008-major-awards", "In 2008 I won the Nagurski Trophy, Lombardi Award and Hendricks Award.", ["college", "award"])
    ]),
  r("cfb-bryant-mckinnie", "Miami Athletics", "https://miamihurricanes.com/sports/football/roster/player/bryant-mckinnie", [
      f("outland-2001", "I won the 2001 Outland Trophy.", ["college", "award"]),
      f("no-sacks-allowed", "I did not allow a quarterback sack during my college playing career.", ["college", "production"]),
      f("2001-national-champion", "I helped Miami win the 2001 national championship.", ["college", "championship"])
    ]),
  r("cfb-cedric-benson", "Texas Athletics", "https://texaslonghorns.com/honors/hall-of-honor/cedric-benson/848", [
      f("career-rushing-yards", "I finished my Texas career with 5,540 rushing yards.", ["college", "production"]),
      f("career-rushing-touchdowns", "I scored 64 career rushing touchdowns at Texas.", ["college", "production"]),
      f("doak-walker-2004", "I won the 2004 Doak Walker Award as the nation's top running back.", ["college", "award"])
    ]),
  r("cfb-chase-coffman", "Missouri Athletics", "https://mutigers.com/sports/football/roster/season/2007/player/chase-coffman", [
      f("career-receiving-line", "I finished my Missouri career with 247 receptions for 2,659 yards and 30 touchdowns.", ["college", "production"]),
      f("mackey-award-2008", "I won the 2008 John Mackey Award as the nation's top tight end.", ["college", "award"]),
      f("senior-receiving-line", "As a senior I caught 90 passes for 987 yards and 10 touchdowns despite missing two games.", ["college", "production"])
    ]),
  r("cfb-cj-mosley", "Alabama Athletics", "https://rolltide.com/news/2014/5/8/Two_Alabama_Players_Selected_in_First_Round_of_NFL_Draft", [
      f("career-tackles", "I finished my Alabama career with 319 tackles.", ["college", "production"]),
      f("career-tfl-sacks", "My Alabama career included 23 tackles for loss and 6.5 sacks.", ["college", "production"]),
      f("career-interceptions", "I intercepted five passes during my Alabama career.", ["college", "production"])
    ]),
  r("cfb-colt-brennan", "Hawaii Athletics", "https://hawaiiathletics.com/sports/football/roster/colt-brennan/7948", [
      f("career-passing-yards", "I finished my Hawaii career with 14,193 passing yards.", ["college", "production"]),
      f("career-passing-touchdowns", "I threw 131 career touchdown passes at Hawaii.", ["college", "production"]),
      f("2006-passing-line", "In 2006 I threw for 5,549 yards and 58 touchdowns.", ["college", "production"])
    ]),
  r("cfb-dallas-clark", "Iowa Athletics", "https://hawkeyesports.com/news/2022/09/01/dallas-clark-to-serve-as-honorary-captain", [
      f("career-receiving-line", "I caught 81 passes for 1,281 yards in just two seasons as an Iowa tight end.", ["college", "production"]),
      f("mackey-award-2002", "I won the 2002 John Mackey Award as the nation's top tight end.", ["college", "award"]),
      f("big-ten-title-2002", "I helped Iowa go 8-0 in Big Ten play and share the 2002 conference title.", ["college", "championship"])
    ]),
  r("cfb-dan-morgan", "Miami Athletics", "https://miamihurricanes.com/news/2011/07/28/205539681-2/", [
      f("career-tackles", "I finished as Miami's career tackles leader with 512.", ["college", "production"]),
      f("four-straight-100-tackle-seasons", "I became the first Miami player to record at least 100 tackles in four straight seasons.", ["college", "production"]),
      f("butkus-nagurski-bednarik-2000", "In 2000 I became the first player to win the Butkus, Nagurski and Bednarik awards in the same season.", ["college", "award"])
    ]),
  r("cfb-darqueze-dennard", "Michigan State Athletics", "https://msuspartans.com/honors/hall-of-fame/darqueze-dennard/181", [
      f("career-games-starts", "I played in 44 career games at Michigan State and started 40 of them.", ["college", "production"]),
      f("career-interceptions", "I finished my Michigan State career with 10 interceptions.", ["college", "production"]),
      f("thorpe-award-2013", "I won the 2013 Jim Thorpe Award as the nation's top defensive back.", ["college", "award"])
    ]),
  r("cfb-darren-sproles", "Kansas Sports Hall of Fame", "https://www.kshof.org/team/darren-sproles", [
      f("career-rushing-yards", "I finished my Kansas State career with a school-record 4,979 rushing yards.", ["college", "production"]),
      f("2003-rushing-yards", "I led the nation with 1,986 rushing yards in 2003.", ["college", "production"]),
      f("2003-big12-title-game", "I ran for 323 yards against No. 1 Oklahoma in the 2003 Big 12 Championship Game.", ["college", "production"])
    ]),
  r("cfb-david-decastro", "Stanford Athletics", "https://gostanford.com/news/2013/04/17/david-decastro-profile", [
      f("career-starts", "I started all 39 games of my Stanford career at right guard.", ["college", "production"]),
      f("unanimous-all-american-2011", "I was a unanimous first-team All-American in 2011.", ["college", "award"]),
      f("two-first-team-all-conference", "I earned first-team all-conference honors twice at Stanford.", ["college", "award"])
    ]),
  r("cfb-david-pollack", "Georgia Athletics", "https://georgiadogs.com/news/2020/3/11/football-david-pollack-elected-to-hall-of-fame", [
      f("career-sacks-tfl", "I finished my Georgia career with 36 sacks and 58.5 tackles for loss.", ["college", "production"]),
      f("three-time-all-american", "I was a three-time All-American at Georgia.", ["college", "award"]),
      f("2004-awards-sweep", "In 2004 I won the Lombardi Award, Bednarik Award, Lott Trophy and Hendricks Award.", ["college", "award"])
    ]),
  r("cfb-dbrickashaw-ferguson", "New York Jets", "https://www.newyorkjets.com/news/jets-sign-d-brickashaw-ferguson-2512595", [
      f("career-starts", "I started all 49 games I played at Virginia, a school record for an offensive lineman.", ["college", "production"]),
      f("first-team-all-american-2005", "I was a first-team All-American in 2005.", ["college", "award"]),
      f("four-bowl-starts", "I became the first Virginia player to start four bowl games at left tackle.", ["college", "championship"])
    ]),
] as const;
