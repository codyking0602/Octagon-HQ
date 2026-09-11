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
  r("cfb-deangelo-williams", "Memphis Athletics", "https://gotigersgo.com/news/2023/12/5/deangelo-williams-inducted-into-college-football-hall-of-fame", [
      f("career-rushing-yards", "I finished my Memphis career with 6,026 rushing yards.", ["college", "production"]),
      f("career-rushing-touchdowns", "I scored 55 career rushing touchdowns at Memphis.", ["college", "production"]),
      f("three-time-cusa-opoy", "I was a three-time Conference USA Offensive Player of the Year.", ["college", "award"])
    ]),
  r("cfb-dwayne-allen", "Clemson Athletics", "https://clemsontigers.com/sports/football/roster/player/dwayne-allen", [
      f("career-receiving-line", "I finished my Clemson career with 93 receptions for 1,079 yards and 12 touchdowns.", ["college", "production"]),
      f("career-games-starts", "I played in 41 career games at Clemson and started 33 of them.", ["college", "production"]),
      f("mackey-award-2011", "I won the 2011 John Mackey Award as the nation's top tight end.", ["college", "award"])
    ]),
  r("cfb-dwight-freeney", "Syracuse Athletics", "https://cuse.com/sports/football/roster/dwight-freeney/1511", [
      f("career-sacks", "I finished my Syracuse career with 34 sacks.", ["college", "production"]),
      f("career-tfl", "I recorded 50.5 career tackles for loss at Syracuse.", ["college", "production"]),
      f("career-forced-fumbles", "I forced a school-record 14 fumbles during my Syracuse career.", ["college", "production"])
    ]),
  r("cfb-earl-thomas", "Texas Athletics", "https://texaslonghorns.com/news/2010/1/8/010810aaa_149", [
      f("career-starts", "I started all 27 games of my Texas career.", ["college", "production"]),
      f("career-interceptions", "I finished my Texas career with 10 interceptions.", ["college", "production"]),
      f("career-pass-breakups", "I recorded 33 pass breakups during my Texas career.", ["college", "production"])
    ]),
  r("cfb-eric-weddle", "Utah Athletics", "https://utahutes.com/news/2026/1/14/eric-weddle-named-to-2026-college-football-hall-of-fame-class", [
      f("career-tackles", "I finished my Utah career with 277 tackles.", ["college", "production"]),
      f("career-interceptions", "I recorded 18 career interceptions at Utah.", ["college", "production"]),
      f("career-forced-fumbles", "I forced a school-record nine fumbles during my Utah career.", ["college", "production"])
    ]),
  r("cfb-gerald-mccoy", "Oklahoma Athletics", "https://soonersports.com/news/2009/12/15/208403217", [
      f("career-tfl", "I finished my Oklahoma career with 33.5 tackles for loss.", ["college", "production"]),
      f("career-sacks", "I recorded 14.5 career sacks at Oklahoma.", ["college", "production"]),
      f("consecutive-starts-dl", "I set an Oklahoma record for a defensive lineman with 38 consecutive starts.", ["college", "production"])
    ]),
  r("cfb-glenn-dorsey", "LSU Athletics", "https://lsusports.net/sports/fb/roster/player/glenn-dorsey", [
      f("2007-tackles", "I recorded 69 tackles during LSU's 2007 national-championship season.", ["college", "production"]),
      f("2007-sacks-tfl", "In 2007 I had seven sacks and 12.5 tackles for loss.", ["college", "production"]),
      f("2007-awards-sweep", "In 2007 I won the Lombardi, Outland, Lott and Nagurski awards.", ["college", "award"])
    ]),
  r("cfb-haloti-ngata", "Oregon Athletics", "https://goducks.com/news/2025/1/15/haloti-ngata-selected-to-2025-college-football-hall-of-fame-class", [
      f("career-tackles", "I finished my Oregon career with 151 tackles.", ["college", "production"]),
      f("career-tfl-sacks", "My Oregon career included 24.5 tackles for loss and 10 sacks.", ["college", "production"]),
      f("career-blocked-kicks", "I blocked seven kicks during my Oregon career.", ["college", "production"])
    ]),
  r("cfb-heath-miller", "Virginia Athletics", "https://virginiasports.com/news/2018/11/20/football-heath-miller-named-to-virginia-sports-hall-of-fame", [
      f("career-receptions", "I finished my Virginia career with 144 receptions.", ["college", "production"]),
      f("career-receiving-yards-touchdowns", "I had 1,703 receiving yards and 20 touchdown catches at Virginia.", ["college", "production"]),
      f("mackey-award-2004", "I won the 2004 John Mackey Award as the nation's top tight end.", ["college", "award"])
    ]),
  r("cfb-jake-long", "Minnesota Vikings", "https://www.vikings.com/news/5-things-to-know-about-vikings-new-t-jake-long-17867494", [
      f("career-starts", "I started 40 games at Michigan.", ["college", "production"]),
      f("two-time-all-american", "I was a two-time All-American at Michigan.", ["college", "award"]),
      f("two-time-big-ten-ol-year", "I won Big Ten Offensive Lineman of the Year in both 2006 and 2007.", ["college", "award"])
    ]),
  r("cfb-jamaal-charles", "Texas Sports Hall of Fame", "https://tshof.org/inductee/jamaal-charles/", [
      f("career-rushing-yards", "I finished my Texas career with 3,328 rushing yards.", ["college", "production"]),
      f("career-rushing-touchdowns", "I scored 36 career rushing touchdowns at Texas.", ["college", "production"]),
      f("2005-national-champion", "I was part of Texas' 2005 national championship team.", ["college", "championship"])
    ]),
  r("cfb-james-laurinaitis", "Ohio State Athletics", "https://ohiostatebuckeyes.com/news/2026/1/14/james-laurinaitis-to-be-inducted-into-college-football-hall-of-fame", [
      f("career-tackles", "I finished my Ohio State career with 375 tackles.", ["college", "production"]),
      f("career-tfl-sacks-interceptions", "My Ohio State career included 24.5 tackles for loss, 13 sacks and nine interceptions.", ["college", "production"]),
      f("nagurski-butkus-lott", "I won the Nagurski Award, Butkus Award and Lott IMPACT Trophy during my Ohio State career.", ["college", "award"])
    ]),
  r("cfb-jaylon-smith", "Notre Dame Athletics", "https://fightingirish.com/sports/football/roster/player/jaylon-smith", [
      f("2014-tackles", "I recorded 112 tackles for Notre Dame in 2014.", ["college", "production"]),
      f("2015-tackles-tfl", "I followed with 113 tackles and nine tackles for loss in 2015.", ["college", "production"]),
      f("butkus-award-2015", "I won the 2015 Butkus Award as the nation's top linebacker.", ["college", "award"])
    ]),
  r("cfb-jeff-okudah", "Ohio State Athletics", "https://ohiostatebuckeyes.com/sports/football/roster/okudah-jeff/449", [
      f("career-games-starts", "I played in 41 games at Ohio State and started 15.", ["college", "production"]),
      f("career-tackles", "I finished my Ohio State career with 88 tackles.", ["college", "production"]),
      f("career-passes-defended", "I recorded 21 career passes defended, including three interceptions.", ["college", "production"])
    ]),
  r("cfb-jeremy-shockey", "Miami Athletics", "https://miamihurricanes.com/roster/jeremy-shockey/", [
      f("career-receptions", "I caught 61 passes during my Miami career.", ["college", "production"]),
      f("career-receiving-yards", "I finished with 815 receiving yards at Miami.", ["college", "production"]),
      f("career-receiving-touchdowns", "I caught 10 touchdown passes in two seasons at Miami.", ["college", "production"])
    ]),
  r("cfb-jermaine-gresham", "Oklahoma Athletics", "https://soonersports.com/news/2009/11/27/208405708", [
      f("career-receptions", "I finished my Oklahoma career with 111 receptions.", ["college", "production"]),
      f("career-receiving-yards", "I had 1,629 career receiving yards at Oklahoma.", ["college", "production"]),
      f("career-receiving-touchdowns", "I scored 26 receiving touchdowns for Oklahoma.", ["college", "production"])
    ]),
  r("cfb-joe-alt", "Notre Dame Athletics", "https://fightingirish.com/news/2023/12/14/joe-alt-and-xavier-watts-earn-unanimous-all-america-status", [
      f("consecutive-starts", "I made 33 consecutive starts at left tackle for Notre Dame.", ["college", "production"]),
      f("unanimous-all-american-2023", "I was a unanimous first-team All-American in 2023.", ["college", "award"]),
      f("outland-lombardi-finalist", "I was a finalist for both the Outland Trophy and Lombardi Award in 2023.", ["college", "award"])
    ]),
  r("cfb-jordan-shipley", "Texas Athletics", "https://texaslonghorns.com/honors/hall-of-honor/jordan--shipley/930", [
      f("career-receptions", "I finished as Texas' career leader with 248 receptions.", ["college", "production"]),
      f("career-yards-touchdowns", "I had 3,191 receiving yards and 33 touchdown catches at Texas.", ["college", "production"]),
      f("career-games-starts", "I played in 53 career games at Texas and started 35.", ["college", "production"])
    ]),
  r("cfb-julius-peppers", "Carolina Panthers", "https://www.panthers.com/team/players-roster/julius-peppers/career", [
      f("career-sacks", "I finished my North Carolina career with 30.5 sacks.", ["college", "production"]),
      f("career-tfl", "I recorded 53 tackles for loss at North Carolina.", ["college", "production"]),
      f("bednarik-lombardi", "I won both the Bednarik Award and Lombardi Award as a junior.", ["college", "award"])
    ]),
  r("cfb-justin-blackmon", "Oklahoma State Athletics", "https://okstate.com/news/2024/12/10/cowboy-football-justin-blackmon-inducted-into-college-football-hall-of-fame", [
      f("career-receptions-yards", "I finished my Oklahoma State career with 253 receptions and 3,564 receiving yards.", ["college", "production"]),
      f("career-receiving-touchdowns", "I caught 40 career touchdown passes at Oklahoma State.", ["college", "production"]),
      f("two-biletnikoff-awards", "I became one of only two players ever to win the Biletnikoff Award twice.", ["college", "award"])
    ]),
  r("cfb-kellen-winslow-ii", "Miami Athletics", "https://miamihurricanes.com/news/2011/07/28/205547464-2/", [
      f("career-receptions", "I finished my Miami career with 119 receptions, a school record for a tight end at the time.", ["college", "production"]),
      f("career-receiving-yards", "I finished my Miami career with 1,365 receiving yards.", ["college", "production"]),
      f("mackey-award", "I won the 2003 John Mackey Award as the nation's top tight end.", ["college", "award"])
    ]),
  r("cfb-khalil-mack", "Buffalo Athletics", "https://ubbulls.com/news/2024/4/25/football-10-years-later-mack-is-proving-he-was-the-right-pick", [
      f("career-sacks", "I set Buffalo's career record with 28.5 sacks.", ["college", "production"]),
      f("career-tackles-for-loss", "I recorded 75 career tackles for loss, tying the NCAA record at the time.", ["college", "production"]),
      f("career-forced-fumbles", "I forced 16 career fumbles, an NCAA record at the time.", ["college", "production"])
    ]),
  r("cfb-lamichael-james", "Oregon Athletics", "https://goducks.com/honors/hall-of-fame/lamichael-james/1253", [
      f("career-rushing-yards", "I finished my Oregon career with 5,082 rushing yards.", ["college", "production"]),
      f("career-rushing-touchdowns", "I scored 53 rushing touchdowns at Oregon.", ["college", "production"]),
      f("three-conference-titles", "I helped Oregon win three straight Pac-10/Pac-12 championships.", ["college", "championship"])
    ]),
  r("cfb-luke-kuechly", "Boston College Athletics", "https://bceagles.com/sports/football/roster/l-kuechly/1595", [
      f("career-tackles", "I finished my Boston College career with 532 tackles.", ["college", "production"]),
      f("career-tackles-for-loss", "I recorded 44 tackles for loss in college.", ["college", "production"]),
      f("career-interceptions", "I intercepted seven passes during my Boston College career.", ["college", "production"])
    ]),
  r("cfb-malcolm-jenkins", "Ohio State Athletics", "https://ohiostatebuckeyes.com/honors/hall-of-fame-inductees/malcolm-jenkins/485", [
      f("career-starts-games", "I started 45 of 49 career games at Ohio State.", ["college", "production"]),
      f("career-tackles", "I recorded 196 career tackles at Ohio State.", ["college", "production"]),
      f("thorpe-award", "I won the 2008 Jim Thorpe Award as college football's top defensive back.", ["college", "award"])
    ]),
  r("cfb-manti-teo", "Notre Dame Athletics", "https://fightingirish.com/roster/manti-teo/", [
      f("career-tackles", "I finished my Notre Dame career with more than 400 tackles.", ["college", "production"]),
      f("senior-interceptions", "I intercepted seven passes during my senior season, an extraordinary total for a linebacker.", ["college", "production"]),
      f("senior-national-awards", "As a senior I won the Bednarik, Butkus, Lombardi, Lott and Nagurski awards.", ["college", "award"])
    ]),
  r("cfb-marqise-lee", "USC Athletics", "https://usctrojans.com/news/2014/5/9/Marqise_Lee_Marcus_Martin_Picked_On_Second_Day_Of_2014_NFL_Draft", [
      f("career-receptions", "I finished my USC career with 248 receptions.", ["college", "production"]),
      f("career-receiving-yards", "I set a USC career record with 3,655 receiving yards.", ["college", "production"]),
      f("career-receiving-touchdowns", "I caught 29 touchdown passes at USC.", ["college", "production"])
    ]),
  r("cfb-michael-huff", "Texas Athletics", "https://texaslonghorns.com/honors/hall-of-honor/michael-huff/877", [
      f("career-starts", "I started 50 of 51 career games at Texas.", ["college", "production"]),
      f("career-tackles", "I recorded 318 career tackles at Texas.", ["college", "production"]),
      f("thorpe-award", "I won the 2005 Jim Thorpe Award as the nation's top defensive back.", ["college", "award"])
    ]),
  r("cfb-morris-claiborne", "LSU Athletics", "https://lsusports.net/sports/fb/roster/season/2011/player/morris-claiborne", [
      f("career-games-starts", "I played 33 games at LSU and started 26 of them.", ["college", "production"]),
      f("career-interceptions", "I finished my LSU career with 11 interceptions.", ["college", "production"]),
      f("thorpe-award", "I won the 2011 Jim Thorpe Award as the nation's top defensive back.", ["college", "award"])
    ]),
  r("cfb-patrick-willis", "Ole Miss Athletics", "https://olemisssports.com/news/2024/8/3/ole-miss-football-legend-patrick-willis-enshrined-in-pro-football-hall-of-fame", [
      f("career-tackles", "I finished my Ole Miss career with 355 tackles.", ["college", "production"]),
      f("career-tackles-for-loss", "I recorded 33 career tackles for loss at Ole Miss.", ["college", "production"]),
      f("butkus-award", "I won the 2006 Butkus Award as the nation's top linebacker.", ["college", "award"])
    ]),
  r("cfb-paul-posluszny", "Penn State Athletics", "https://gopsusports.com/news/2024/01/8/posluszny-elected-to-college-football-hall-of-fame", [
      f("career-tackles", "I finished my Penn State career with 372 tackles.", ["college", "production"]),
      f("two-bednarik-awards", "I became just the second player to win the Bednarik Award twice.", ["college", "award"]),
      f("butkus-award", "I won the 2005 Butkus Award as the nation's top linebacker.", ["college", "award"])
    ]),
  r("cfb-peter-warrick", "Florida State Athletics", "https://seminoles.com/news/2026/1/14/peter-warrick-named-to-college-football-hall-of-fame", [
      f("career-receptions", "I finished my Florida State career with 207 receptions.", ["college", "production"]),
      f("career-receiving-yards", "I finished my Florida State career with 3,517 receiving yards.", ["college", "production"]),
      f("career-receiving-touchdowns", "I set Florida State's career record with 32 receiving touchdowns.", ["college", "production"])
    ]),
  r("cfb-rolando-mcclain", "Alabama Athletics", "https://rolltide.com/news/2009/12/8/Rolando_McClain_wins_2009_Butkus_Award", [
      f("senior-season-tackles", "I had 101 tackles during Alabama's 2009 championship season.", ["college", "production"]),
      f("senior-season-tfl-sacks", "That season I recorded 12.5 tackles for loss and four sacks.", ["college", "production"]),
      f("butkus-award", "I won the 2009 Butkus Award as the nation's top linebacker.", ["college", "award"])
    ]),
  r("cfb-ryan-broyles", "Las Vegas Raiders", "https://www.raiders.com/news/2012-draft-prospects-series-wide-receivers-7030625", [
      f("career-receptions", "I finished my Oklahoma career with 349 receptions, then an FBS record.", ["college", "production"]),
      f("career-receiving-yards", "I finished my Oklahoma career with 4,586 receiving yards.", ["college", "production"]),
      f("career-receiving-touchdowns", "I caught 45 touchdown passes at Oklahoma.", ["college", "production"])
    ]),
  r("cfb-sammy-watkins", "Clemson Athletics", "https://clemsontigers.com/all-americans", [
      f("career-receptions", "I finished my Clemson career with 240 receptions.", ["college", "production"]),
      f("career-receiving-yards", "I finished my Clemson career with 3,391 receiving yards.", ["college", "production"]),
      f("career-receiving-touchdowns", "I caught 27 touchdown passes at Clemson.", ["college", "production"])
    ]),
  r("cfb-sean-taylor", "Miami Athletics", "https://miamihurricanes.com/news/2011/07/28/205548328-2/", [
      f("career-interceptions", "I intercepted 14 passes during my Miami career.", ["college", "production"]),
      f("senior-interceptions", "I tied Miami's single-season record with 10 interceptions in 2003.", ["college", "production"]),
      f("big-east-defensive-player", "I was the 2003 Big East Defensive Player of the Year.", ["college", "award"])
    ]),
  r("cfb-tyrann-mathieu", "LSU Athletics", "https://lsusports.net/sports/fb/roster/season/2010/player/tyrann-mathieu", [
      f("career-tackles", "I recorded 133 tackles in only two seasons at LSU.", ["college", "production"]),
      f("career-forced-fumbles", "I forced a school-record 11 fumbles at LSU.", ["college", "production"]),
      f("bednarik-award", "I won the 2011 Bednarik Award as the nation's top defensive player.", ["college", "award"])
    ]),
  r("cfb-von-miller", "Texas A&M Athletics", "https://12thman.com/news/2010/12/07/big-12-sack-leader-miller-receives-butkus-award", [
      f("junior-sacks", "I led the nation with 17 sacks in 2009.", ["college", "production"]),
      f("senior-sacks", "I led the Big 12 in sacks again as a senior.", ["college", "production"]),
      f("butkus-award", "I won the 2010 Butkus Award as the nation's top linebacker.", ["college", "award"])
    ]),
  r("cfb-brian-urlacher", "New Mexico Athletics", "https://golobos.com/news/2017/01/09/brian-urlacher-named-to-nff-college-football-hall-of-fame", [
      f("career-tackles", "I finished my New Mexico career with 442 tackles.", ["college", "production"]),
      f("career-forced-fumbles", "I forced 11 fumbles during my New Mexico career.", ["college", "production"]),
      f("nfl-draft-2000", "I was selected ninth overall by the Chicago Bears in the 2000 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-chris-long", "Virginia Athletics", "https://virginiasports.com/news/2007/12/06/long-named-all-american-by-walter-camp-football-foundation", [
      f("senior-sacks", "I recorded 14 sacks during my senior season at Virginia.", ["college", "production"]),
      f("hendricks-award", "I won the 2007 Ted Hendricks Award as the nation's top defensive end.", ["college", "award"]),
      f("acc-defensive-player-of-year-2007", "I was the ACC Defensive Player of the Year in 2007.", ["college","award"])
    ]),
  r("cfb-derrick-johnson", "Texas Athletics", "https://texaslonghorns.com/sports/general/roster/derrick-johnson/5218", [
      f("career-tackles", "I finished my Texas career with 458 tackles.", ["college", "production"]),
      f("career-tackles-for-loss", "I set a Texas career record with 65 tackles for loss.", ["college", "production"]),
      f("nfl-draft-2005", "I was selected 15th overall by the Kansas City Chiefs in the 2005 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-eli-manning", "Ole Miss Athletics", "https://olemisssports.com/news/2024/8/4/football-ole-miss-greats-eli-manning-savante-stringfellow-inducted-into-mississippi-sports-hall-of-fame", [
      f("career-passing-yards", "I finished my Ole Miss career with a school-record 10,119 passing yards.", ["college", "production"]),
      f("career-passing-touchdowns", "I threw a school-record 81 career touchdown passes at Ole Miss.", ["college", "production"]),
      f("nfl-draft-2004", "I became the highest draft pick in Ole Miss history when I was selected first overall in 2004.", ["college","draft"])
    ]),
  r("cfb-jake-matthews", "Texas A&M Athletics", "https://12thman.com/news/2023/08/11/eight-named-to-athletics-2023-hall-of-fame-class", [
      f("consecutive-starts", "I finished my Texas A&M career with 46 consecutive starts.", ["college", "production"]),
      f("two-first-team-all-america", "I was a two-time first-team All-American at Texas A&M.", ["college", "award"]),
      f("jacobs-blocking-trophy-2013", "I won the SEC Jacobs Blocking Trophy in 2013.", ["college","award"])
    ]),
  r("cfb-joe-thomas", "Wisconsin Athletics", "https://uwbadgers.com/sports/2015/8/21/GEN_20140101585", [
      f("career-games-starts", "I appeared in 47 games at Wisconsin and started 38.", ["college", "production"]),
      f("outland-award", "I won the 2006 Outland Trophy as college football's top interior lineman.", ["college", "award"]),
      f("consensus-all-american-2006", "I was a consensus All-American in 2006.", ["college","award"])
    ]),
  r("cfb-john-henderson", "Tennessee Athletics", "https://utsports.com/sports/football/roster/john-henderson/14190", [
      f("career-sacks", "I finished my Tennessee career with 20.5 sacks.", ["college", "production"]),
      f("outland-award", "I won the 2000 Outland Trophy.", ["college", "award"]),
      f("career-tackles", "I finished my Tennessee career with 162 tackles.", ["college","production"])
    ]),
  r("nfl-ya-tittle", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/ya-tittle", [
      f("pro-bowls", "I was selected to seven Pro Bowls during my pro career.", ["playing-career", "award"]),
      f("all-nfl-selections", "I earned four All-NFL selections.", ["playing-career", "award"]),
      f("1962-touchdown-record", "I set an NFL single-season record with 33 touchdown passes in 1962.", ["playing-career", "production"]),
      f("1963-touchdown-record", "I broke my own record a year later with 36 touchdown passes.", ["playing-career", "production"]),
      f("three-giants-division-titles", "I led the Giants to division titles in 1961, 1962 and 1963.", ["playing-career", "championship"])
    ]),
  r("dick-butkus", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/dick-butkus", [
      f("career-games", "I played 119 NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 22 passes during my NFL career.", ["playing-career", "production"]),
      f("career-fumble-recoveries", "I recovered 27 fumbles during my NFL career.", ["playing-career", "production"])
    ]),
  r("nfl-andre-tippett", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/andre-tippett", [
      f("career-games", "I played 151 NFL games.", ["playing-career", "production"]),
      f("career-sacks", "I finished my NFL career with 100 sacks.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to five Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-bobby-bell", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/bobby-bell", [
      f("career-games", "I played 168 professional games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 26 passes during my pro career.", ["playing-career", "production"]),
      f("career-touchdowns", "I scored nine touchdowns during my pro career.", ["playing-career", "production"])
    ]),
  r("nfl-chris-hanburger", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/chris-hanburger", [
      f("career-games", "I played 187 NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 19 passes during my NFL career.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to nine Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-chuck-howley", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/chuck-howley", [
      f("career-games", "I played 180 regular-season NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 25 passes during my NFL career.", ["playing-career", "production"]),
      f("super-bowl-mvp", "I was named the MVP of Super Bowl V despite my team losing the game.", ["playing-career", "award"])
    ]),
  r("nfl-dave-robinson", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/dave-robinson", [
      f("career-games", "I played 155 regular-season NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 27 passes during my NFL career.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to three Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-dave-wilcox", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/dave-wilcox", [
      f("career-games", "I played 153 NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 14 passes during my NFL career.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to seven Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-harry-carson", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/harry-carson", [
      f("career-games", "I played 173 NFL games.", ["playing-career", "production"]),
      f("career-interceptions", "I intercepted 11 passes during my NFL career.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to nine Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-sam-huff", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/sam-huff", [
      f("career-interceptions", "I intercepted 30 passes during my NFL career.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to five Pro Bowls.", ["playing-career", "award"]),
      f("nfl-title-games", "I played in six NFL championship games.", ["playing-career", "championship"])
    ]),
  r("nfl-alex-karras", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/alex-karras", [
      f("career-games", "I played 161 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to four Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-bob-lilly", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/bob-lilly", [
      f("career-games", "I played 196 consecutive regular-season games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to 11 Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-carl-eller", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/carl-eller", [
      f("career-games", "I played 225 regular-season NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to six Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-charles-haley", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/charles-haley", [
      f("super-bowl-rings", "I became the first player in NFL history to win five Super Bowls.", ["playing-career", "award"]),
      f("pro-bowls", "I was selected to five Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-chris-doleman", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/chris-doleman", [
      f("career-games", "I played 232 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-claude-humphrey", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/claude-humphrey", [
      f("pro-bowls", "I was selected to six Pro Bowls.", ["playing-career", "award"]),
      f("all-nfl-selections", "I earned five All-NFL selections.", ["playing-career", "award"])
    ]),
  r("nfl-cliff-harris", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/cliff-harris", [
      f("career-games", "I played 141 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to six Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-cortez-kennedy", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/cortez-kennedy", [
      f("career-games", "I played 167 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-curley-culp", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/curley-culp", [
      f("career-games", "I played 179 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to six Pro Bowls or AFL All-Star games.", ["playing-career", "award"])
    ]),
  r("nfl-dan-hampton", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/dan-hampton", [
      f("pro-bowls", "I was selected to four Pro Bowls.", ["playing-career", "award"]),
      f("all-pro-selections", "I earned six first- or second-team All-Pro selections.", ["playing-career", "award"])
    ]),
  r("nfl-darrell-green", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/darrell-green", [
      f("career-games", "I played 295 regular-season NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to seven Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-dick-lebeau", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/dick-lebeau", [
      f("career-games", "I played 185 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to three consecutive Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-donnie-shell", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/donnie-shell", [
      f("career-games", "I played 201 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to five Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-elvin-bethea", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/elvin-bethea", [
      f("career-games", "I played 210 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-emmitt-thomas", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/emmitt-thomas", [
      f("career-games", "I played 181 NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to five Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-eric-allen", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/eric-allen", [
      f("career-games", "I played 217 regular-season NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to six Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-fred-dean", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/fred-dean", [
      f("career-games", "I played 141 regular-season NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to four Pro Bowls.", ["playing-career", "award"])
    ]),
  r("ozzie-newsome", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/ozzie-newsome", [
      f("career-games", "I played 198 consecutive NFL games.", ["playing-career", "production"]),
      f("pro-bowls", "I was selected to three Pro Bowls.", ["playing-career", "award"])
    ]),
  r("bear-bryant", "Alabama Athletics", "https://rolltide.com/news/2008/11/7/National_College_Football_Day", [
      f("career-wins", "I won 323 games during my college head-coaching career.", ["college", "coaching", "production"])
    ]),
  r("cfb-davante-adams", "Fresno State Athletics", "https://gobulldogs.com/news/2014/5/9/Davante_Adams_Drafted_in_Second_Round_by_Packers", [
      f("career-receptions", "I set a Fresno State career record with 233 receptions in only two playing seasons.", ["college", "production"]),
      f("nfl-draft-2014", "I was selected 53rd overall by the Green Bay Packers in the 2014 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-dez-bryant", "Oklahoma State Athletics", "https://okstate.com/news/2025/6/2/cowboy-football-dez-bryant-added-to-college-football-hall-of-fame-ballot", [
      f("career-receiving-line", "I finished my Oklahoma State career with 147 catches for 2,425 yards and 29 touchdowns.", ["college", "production"]),
      f("2008-receiving-production", "In 2008 I recorded 1,480 receiving yards and 19 receiving touchdowns.", ["college","production"])
    ]),
  r("cfb-jadeveon-clowney", "South Carolina Athletics", "https://gamecocksonline.com/sports/football/roster/player/jadeveon-clowney/", [
      f("career-tackles-for-loss", "I finished second in South Carolina history with 47 career tackles for loss.", ["college", "production"]),
      f("career-sacks", "I finished my South Carolina career with 24 sacks.", ["college","production"])
    ]),
  r("cfb-john-hannah", "Alabama Athletics", "https://rolltide.com/news/2015/8/20/Alabama_Football_Sports_Four_on_FWAA_75th_Anniversary_All_America_Team", [
      f("jacobs-trophy-1972", "I won the 1972 Jacobs Trophy as the SEC's best blocker.", ["college", "award"]),
      f("fwaa-all-american-1972", "I was a 1972 FWAA All-American.", ["college","award"])
    ]),
  r("cfb-lee-roy-selmon", "National Football Foundation", "https://footballfoundation.org/hof_search.aspx?hof=1956", [
      f("outland-lombardi-awards", "I won both the Outland Trophy and Lombardi Award at Oklahoma.", ["college", "award"]),
      f("two-national-championships", "I won two national championships at Oklahoma during my three seasons as a starter.", ["college","championship"])
    ]),
  r("tom-osborne", "Nebraska Athletics", "https://huskers.com/staff/tom-osborne", [
      f("career-wins", "I finished my Nebraska head-coaching career with 255 wins.", ["college", "coaching", "production"])
    ]),
  r("woody-hayes", "Ohio State Athletics", "https://ohiostatebuckeyes.com/news/2020/1/1/football-woody-hayes", [
      f("ohio-state-wins", "I won 205 games as Ohio State's head coach.", ["college", "coaching", "production"])
    ]),
  r("chuck-noll", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/chuck-noll", [
      f("career-coaching-wins", "I won 209 games as an NFL head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("don-shula", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/don-shula", [
      f("career-coaching-wins", "I retired with 347 career victories as an NFL head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("lawrence-taylor", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/lawrence-taylor", [
      f("pro-bowls", "I was selected to 10 Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-anthony-munoz", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/anthony-munoz", [
      f("consecutive-pro-bowls", "I was selected to 11 consecutive Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-bud-grant", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/bud-grant", [
      f("career-coaching-wins", "I won 168 games as a professional head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-chuck-bednarik", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/chuck-bednarik", [
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-derrick-thomas", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/derrick-thomas", [
      f("pro-bowls", "I was selected to nine straight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-don-coryell", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/don-coryell", [
      f("career-coaching-wins", "I won 114 games as an NFL head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-earl-curly-lambeau", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/earl-curly-lambeau", [
      f("career-coaching-wins", "I won 229 games as a professional head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-george-allen", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/george-allen", [
      f("regular-season-wins", "I won 116 regular-season games as an NFL head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-george-halas", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/george-halas", [
      f("career-coaching-wins", "I won 324 games as a professional head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-john-madden", "Pro Football Hall of Fame", "https://www.profootballhof.com/news/one-man-three-hall-worthy-careers-john-madden-1936-2021", [
      f("regular-season-record", "My NFL regular-season coaching record was 103-32-7.", ["playing-career", "coaching", "production"])
    ]),
  r("nfl-kevin-mawae", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/kevin-mawae", [
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-steve-hutchinson", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/steve-hutchinson", [
      f("pro-bowls", "I was selected to seven consecutive Pro Bowls.", ["playing-career", "award"])
    ]),
  r("nfl-trent-williams", "San Francisco 49ers", "https://www.49ers.com/news/kittle-mccaffrey-juszczyk-williams-gifford-weeks-moore-selected-to-2026-pro-bowl-games", [
      f("pro-bowls", "I earned my 12th career Pro Bowl selection for the 2025 season.", ["playing-career", "award"])
    ]),
  r("nfl-tyron-smith", "Dallas Cowboys", "https://www.dallascowboys.com/news/8-time-pro-bowl-left-tackle-tyron-smith-to-retire-with-cowboys", [
      f("pro-bowls", "I was selected to eight Pro Bowls.", ["playing-career", "award"])
    ]),
  r("paul-brown", "Pro Football Hall of Fame", "https://www.profootballhof.com/news/statue-of-hall-of-famer-paul-brown-unveiled-in-ohio-hometown", [
      f("career-coaching-wins", "I won 213 games as a professional head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("tom-landry", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/tom-landry", [
      f("career-coaching-wins", "I won 270 games as an NFL head coach.", ["playing-career", "coaching", "production"])
    ]),
  r("vince-lombardi", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/vince-lombardi", [
      f("career-coaching-record", "My professional head-coaching record was 105-35-6.", ["playing-career", "coaching", "production"])
    ]),
  r("bill-snyder-cfb", "Kansas State Athletics", "https://www.kstatesports.com/news/2018/12/2/football-bill-snyder-announces-retirement-from-kansas-state", [
      f("conference-titles", "I won two conference championships as Kansas State's head coach.", ["college","coaching","championship"])
    ]),
  r("bobby-bowden-cfb", "Florida State Athletics", "https://seminoles.com/honors/florida-state-athletics-hall-of-fame/bobby-bowden/220", [
      f("national-championships", "I won national championships at Florida State in 1993 and 1999.", ["college","coaching","championship"])
    ]),
  r("cfb-abdul-carter", "Penn State Athletics", "https://gopsusports.com/news/2025/04/24/carter-warren-selected-in-first-round-of-2025-nfl-draft", [
      f("nfl-draft-2025", "I was selected third overall by the New York Giants in the 2025 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-aidan-hutchinson", "Michigan Athletics", "https://mgoblue.com/sports/2018/6/11/michigan_national_football_league_draft_history", [
      f("nfl-draft-2022", "I was selected second overall by the Detroit Lions in the 2022 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-budda-baker", "Washington Athletics", "https://gohuskies.com/news/2017/4/28/football-king-baker-jones-selected-in-second-round-of-nfl-draft", [
      f("nfl-draft-2017", "I was selected 36th overall by the Arizona Cardinals in the 2017 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-champ-bailey", "Pro Football Hall of Fame", "https://www.profootballhof.com/players/champ-bailey", [
      f("nfl-draft-1999", "I was selected seventh overall by Washington in the 1999 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-cooper-dejean", "Iowa Athletics", "https://hawkeyesports.com/news/2024/04/26/dejean-selected-by-philadelphia-in-second-round-of-nfl-draft", [
      f("nfl-draft-2024", "I was selected 40th overall by the Philadelphia Eagles in the 2024 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-davey-obrien", "Pro Football Hall of Fame", "https://www.profootballhof.com/football-history/davey-obrien", [
      f("nfl-draft-1939", "I was selected fourth overall by the Philadelphia Eagles in the 1939 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-desean-jackson", "California Athletics", "https://calbears.com/sports/2008/4/26/207743905.aspx", [
      f("nfl-draft-2008", "I was selected 49th overall by the Philadelphia Eagles in the 2008 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-jj-watt", "Wisconsin Athletics", "https://uwbadgers.com/news/2011/4/29/Two_for_one_Watt_Carimi_go_in_first_round", [
      f("nfl-draft-2011", "I was selected 11th overall by the Houston Texans in the 2011 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-kayvon-thibodeaux", "Oregon Athletics", "https://goducks.com/news/2022/4/28/football-thibodeaux-goes-no-5-overall-to-giants", [
      f("nfl-draft-2022", "I was selected fifth overall by the New York Giants in the 2022 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-ladainian-tomlinson", "TCU Athletics", "https://gofrogs.com/news/2001/4/23/six_frogs_go_in_nfl_draft", [
      f("nfl-draft-2001", "I was selected fifth overall by the San Diego Chargers in the 2001 NFL Draft.", ["college","draft"])
    ]),
  r("cfb-micah-parsons", "Penn State Athletics", "https://gopsusports.com/news/2021/04/29/parsons-oweh-selected-in-the-first-round-of-the-nfl-draft", [
      f("nfl-draft-2021", "I was selected 12th overall by the Dallas Cowboys in the 2021 NFL Draft.", ["college","draft"])
    ]),
  r("dabo-swinney-cfb", "Clemson Athletics", "https://clemsontigers.com/staff/dabo", [
      f("national-championships", "I led Clemson to two national championships.", ["college","coaching","championship"])
    ]),
  r("pete-carroll-cfb", "USC Athletics", "https://usctrojans.com/news/2010/1/11/Pete_Carroll_Named_Head_Coach_Of_Seattle_Seahawks", [
      f("national-championships", "I led USC to national championships in 2003 and 2004.", ["college","coaching","championship"])
    ])
] as const;
