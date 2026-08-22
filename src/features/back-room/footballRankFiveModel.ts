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
  | "nfl-wide-receivers"
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
  ratingBasis?: string;
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
  { id: "tom-brady", name: "Tom Brady", subtitle: "7× Super Bowl champion", league: "NFL", rating: 100, ratingBasis: "Unmatched championship longevity with elite peak play across two franchises." },
  { id: "patrick-mahomes", name: "Patrick Mahomes", subtitle: "3× champion · 2× MVP", league: "NFL", rating: 99, ratingBasis: "Historic early-career peak, multiple MVPs and championships, with an unfinished longevity case." },
  { id: "joe-montana", name: "Joe Montana", subtitle: "4× Super Bowl champion", league: "NFL", rating: 97, ratingBasis: "Four-title peak with elite postseason efficiency and sustained championship-level play." },
  { id: "peyton-manning", name: "Peyton Manning", subtitle: "5× MVP · 2× champion", league: "NFL", rating: 96, ratingBasis: "Record MVP résumé, historic regular-season command and elite longevity with two titles." },
  { id: "aaron-rodgers", name: "Aaron Rodgers", subtitle: "4× MVP · Super Bowl champion", league: "NFL", rating: 94, ratingBasis: "All-time efficiency and MVP peak with less postseason team success than the top inner circle." },
  { id: "johnny-unitas", name: "Johnny Unitas", subtitle: "3× MVP · 3× champion", league: "NFL", rating: 93, ratingBasis: "Era-defining passing peak, three MVPs and championship success across a long elite run." },
  { id: "drew-brees", name: "Drew Brees", subtitle: "Super Bowl champion · 80,358 pass yards", league: "NFL", rating: 92, ratingBasis: "Historic volume and accuracy with a championship peak and exceptional sustained production." },
  { id: "dan-marino", name: "Dan Marino", subtitle: "1984 MVP · 3× All-Pro", league: "NFL", rating: 91, ratingBasis: "Revolutionary passing peak and elite production without the championship finish of peers above him." },
  { id: "john-elway", name: "John Elway", subtitle: "2× champion · 1987 MVP", league: "NFL", rating: 90, ratingBasis: "Long elite career, five Super Bowl trips and a championship closing peak." },
  { id: "brett-favre", name: "Brett Favre", subtitle: "3× MVP · Super Bowl champion", league: "NFL", rating: 89, ratingBasis: "Three straight MVPs, huge longevity and a title, balanced by more volatility than the top tier." },
  { id: "steve-young", name: "Steve Young", subtitle: "2× MVP · Super Bowl MVP", league: "NFL", rating: 88, ratingBasis: "Elite efficiency and MVP peak with a shorter full-time starting runway." },
  { id: "roger-staubach", name: "Roger Staubach", subtitle: "2× champion · 1971 MVP", league: "NFL", rating: 87, ratingBasis: "Elite era-adjusted efficiency, two titles and repeated contender-level seasons." },
  { id: "lamar-jackson", name: "Lamar Jackson", subtitle: "2× MVP · historic rushing QB", league: "NFL", rating: 87, ratingBasis: "Two-MVP peak and unique dual-threat value with the postseason résumé still developing." },
  { id: "kurt-warner", name: "Kurt Warner", subtitle: "2× MVP · Super Bowl MVP", league: "NFL", rating: 85, ratingBasis: "Two-MVP peak and multiple Super Bowl runs offset by a shorter, uneven middle of the career." },
  { id: "terry-bradshaw", name: "Terry Bradshaw", subtitle: "4× Super Bowl champion", league: "NFL", rating: 84, ratingBasis: "Four titles and major postseason value with less dominant regular-season efficiency than higher-rated peers." },
  { id: "ben-roethlisberger", name: "Ben Roethlisberger", subtitle: "2× Super Bowl champion", league: "NFL", rating: 84, ratingBasis: "Two titles, strong longevity and sustained contender play without an MVP-level peak." },
  { id: "troy-aikman", name: "Troy Aikman", subtitle: "3× Super Bowl champion", league: "NFL", rating: 83, ratingBasis: "Three-title dynasty quarterback with excellent postseason value but modest era-adjusted volume." },
  { id: "eli-manning", name: "Eli Manning", subtitle: "2× Super Bowl MVP", league: "NFL", rating: 82, ratingBasis: "Two exceptional championship runs and major longevity, balanced by middling regular-season efficiency." },
  { id: "russell-wilson", name: "Russell Wilson", subtitle: "Super Bowl champion · 9× Pro Bowl", league: "NFL", rating: 81, ratingBasis: "Long high-end peak, elite efficiency and a title with a later-career decline." },
  { id: "matt-ryan", name: "Matt Ryan", subtitle: "2016 MVP · 62,000+ pass yards", league: "NFL", rating: 80, ratingBasis: "MVP peak and major career production with limited postseason finishing success." },
  { id: "philip-rivers", name: "Philip Rivers", subtitle: "63,440 pass yards · 8× Pro Bowl", league: "NFL", rating: 79, ratingBasis: "Excellent longevity and production without an MVP, Super Bowl appearance or defining postseason run." },
  { id: "matthew-stafford", name: "Matthew Stafford", subtitle: "Super Bowl champion · 59,000+ pass yards", league: "NFL", rating: 79, ratingBasis: "High-end arm talent, major volume and a title, with fewer elite regular-season honors." },
  { id: "cam-newton", name: "Cam Newton", subtitle: "2015 MVP · Super Bowl appearance", league: "NFL", rating: 78, ratingBasis: "MVP peak and transformative rushing value with a shorter span of high-end passing play." },
  { id: "donovan-mcnabb", name: "Donovan McNabb", subtitle: "5 NFC title games · Super Bowl appearance", league: "NFL", rating: 76, ratingBasis: "Sustained contender quarterback with strong dual-threat value and no championship or MVP peak." },
  { id: "tony-romo", name: "Tony Romo", subtitle: "4× Pro Bowl · 97.1 career rating", league: "NFL", rating: 76, ratingBasis: "Excellent efficiency and high-end regular-season play limited by durability and postseason volume." },
  { id: "carson-palmer", name: "Carson Palmer", subtitle: "3× Pro Bowl · 46,000+ pass yards", league: "NFL", rating: 73, ratingBasis: "Long quality starter career with a late elite peak but limited postseason accomplishment." },
  { id: "joe-flacco", name: "Joe Flacco", subtitle: "Super Bowl MVP · 191 starts", league: "NFL", rating: 72, ratingBasis: "One historic title run and long starter durability with mostly average regular-season efficiency." },
  { id: "kirk-cousins", name: "Kirk Cousins", subtitle: "Long-term starter · multiple Pro Bowls", league: "NFL", rating: 68, ratingBasis: "Sustained above-average efficiency and production without a deep postseason or award peak." },
  { id: "derek-carr", name: "Derek Carr", subtitle: "4× Pro Bowl · long-term starter", league: "NFL", rating: 64, ratingBasis: "Durable productive starter career with limited top-end seasons and postseason success." },
  { id: "andy-dalton", name: "Andy Dalton", subtitle: "3× Pro Bowl · five playoff starts", league: "NFL", rating: 62, ratingBasis: "Long competent starter run and multiple winning seasons without elite peak or playoff wins." },
  { id: "jay-cutler", name: "Jay Cutler", subtitle: "35,000+ pass yards · 153 starts", league: "NFL", rating: 60, ratingBasis: "Long starter career with strong arm talent but middling efficiency and limited postseason value." },
  { id: "ryan-fitzpatrick", name: "Ryan Fitzpatrick", subtitle: "17 NFL seasons · 9 franchises", league: "NFL", rating: 58, ratingBasis: "Remarkable longevity and useful starter stretches without sustained contender-level performance." },
  { id: "carson-wentz", name: "Carson Wentz", subtitle: "2017 MVP-caliber start · 89 starts", league: "NFL", rating: 56, ratingBasis: "Brief elite-level peak followed by injuries and uneven play that shortened his high-end runway." },
  { id: "jameis-winston", name: "Jameis Winston", subtitle: "No. 1 pick · 5,000-yard season", league: "NFL", rating: 52, ratingBasis: "Big-volume peak and starting experience undermined by turnovers and limited sustained winning value." },
  { id: "marcus-mariota", name: "Marcus Mariota", subtitle: "2014 No. 2 pick · playoff win", league: "NFL", rating: 50, ratingBasis: "Functional starter peak and one playoff win without sustained above-average production." },
  { id: "sam-bradford", name: "Sam Bradford", subtitle: "2010 No. 1 pick · 83 starts", league: "NFL", rating: 48, ratingBasis: "Starter-level stretches and accuracy offset by injuries, low peak and limited team success." },
  { id: "mitchell-trubisky", name: "Mitchell Trubisky", subtitle: "No. 2 pick · Pro Bowl season", league: "NFL", rating: 43, ratingBasis: "One winning starter stretch but limited passing ceiling and short-lived starting value." },
  { id: "zach-wilson", name: "Zach Wilson", subtitle: "No. 2 pick · 33 starts", league: "NFL", rating: 26, ratingBasis: "High draft investment with poor efficiency and no sustained evidence of starting-caliber NFL play." },
  { id: "jamarcus-russell", name: "JaMarcus Russell", subtitle: "No. 1 pick · 25 starts", league: "NFL", rating: 14, ratingBasis: "Major draft bust with a short starting run, poor efficiency and little positive career value." },
  { id: "ryan-leaf", name: "Ryan Leaf", subtitle: "No. 2 pick · 14 TD / 36 INT", league: "NFL", rating: 8, ratingBasis: "Extremely short and ineffective career with a 4–17 starting record and severe turnover problems." },
  { id: "johnny-manziel", name: "Johnny Manziel", subtitle: "First-round pick · 8 starts", league: "NFL", rating: 6, ratingBasis: "Brief NFL career with minimal production and no sustained starting value." },
];

const nflRunningBacks: readonly FootballRankFiveItem[] = [
  { id: "jim-brown", name: "Jim Brown", subtitle: "3× MVP · 8× rushing leader", league: "NFL", rating: 100, ratingBasis: "Benchmark running back peak with unmatched era dominance, efficiency and repeated league-leading seasons." },
  { id: "barry-sanders", name: "Barry Sanders", subtitle: "1997 MVP · 10× Pro Bowl", league: "NFL", rating: 99, ratingBasis: "Historic rushing peak, efficiency and sustained elite production without championship support." },
  { id: "walter-payton", name: "Walter Payton", subtitle: "1977 MVP · Super Bowl champion", league: "NFL", rating: 98, ratingBasis: "Elite peak plus longevity, receiving value and all-around durability across a complete career." },
  { id: "emmitt-smith", name: "Emmitt Smith", subtitle: "All-time rushing leader · 3× champion", league: "NFL", rating: 97, ratingBasis: "Record-setting volume, elite durability and championship production over an exceptionally long peak." },
  { id: "adrian-peterson", name: "Adrian Peterson", subtitle: "2012 MVP · 3× rushing leader", league: "NFL", rating: 95, ratingBasis: "MVP peak and repeated rushing dominance with elite longevity across multiple roster contexts." },
  { id: "ladainian-tomlinson", name: "LaDainian Tomlinson", subtitle: "2006 MVP · 162 rushing TD", league: "NFL", rating: 94, ratingBasis: "Historic scoring peak, receiving value and sustained all-purpose dominance." },
  { id: "marshall-faulk", name: "Marshall Faulk", subtitle: "2000 MVP · Super Bowl champion", league: "NFL", rating: 93, ratingBasis: "MVP-level dual-threat peak central to an elite offense with strong sustained production." },
  { id: "derrick-henry", name: "Derrick Henry", subtitle: "2,000-yard season · 13,000+ rush yards", league: "NFL", rating: 92, ratingBasis: "Rare modern rushing dominance, major longevity and repeated league-leading production." },
  { id: "eric-dickerson", name: "Eric Dickerson", subtitle: "Single-season rushing record", league: "NFL", rating: 91, ratingBasis: "Record-setting peak and repeated rushing-title production with strong longevity." },
  { id: "oj-simpson", name: "O.J. Simpson", subtitle: "1973 MVP · first 2,000-yard season", league: "NFL", rating: 90, ratingBasis: "Historic era-adjusted rushing peak with a shorter elite runway than the very top careers." },
  { id: "earl-campbell", name: "Earl Campbell", subtitle: "1979 MVP · 3× rushing leader", league: "NFL", rating: 88, ratingBasis: "Brutal three-year peak and MVP dominance offset by a shorter prime and workload-driven decline." },
  { id: "curtis-martin", name: "Curtis Martin", subtitle: "14,101 rush yards · 5× Pro Bowl", league: "NFL", rating: 87, ratingBasis: "Exceptional durability and sustained high-level production with a late-career rushing title." },
  { id: "thurman-thomas", name: "Thurman Thomas", subtitle: "1991 MVP · 5× Pro Bowl", league: "NFL", rating: 87, ratingBasis: "MVP dual-threat peak and major role in four straight Super Bowl teams." },
  { id: "tony-dorsett", name: "Tony Dorsett", subtitle: "12,739 rush yards · champion", league: "NFL", rating: 86, ratingBasis: "Long high-end career with strong efficiency, receiving value and championship contribution." },
  { id: "marcus-allen", name: "Marcus Allen", subtitle: "1985 MVP · Super Bowl MVP", league: "NFL", rating: 86, ratingBasis: "MVP and Super Bowl MVP peak with elite versatility and unusual longevity." },
  { id: "edgerrin-james", name: "Edgerrin James", subtitle: "2× rushing leader · Hall of Fame", league: "NFL", rating: 85, ratingBasis: "Immediate elite peak, strong receiving value and long high-end production." },
  { id: "jerome-bettis", name: "Jerome Bettis", subtitle: "13,662 rush yards · champion", league: "NFL", rating: 84, ratingBasis: "Exceptional power-back longevity and volume with a championship finish." },
  { id: "terrell-davis", name: "Terrell Davis", subtitle: "1998 MVP · 2× champion", league: "NFL", rating: 84, ratingBasis: "One of the best short peaks ever, including MVP and postseason dominance, limited by career length." },
  { id: "frank-gore", name: "Frank Gore", subtitle: "16,000 rushing yards", league: "NFL", rating: 83, ratingBasis: "Extraordinary longevity and consistency without a league-MVP or dominant multi-year peak." },
  { id: "lesean-mccoy", name: "LeSean McCoy", subtitle: "2× All-Pro · 15,000+ scrimmage yards", league: "NFL", rating: 82, ratingBasis: "Elite open-field peak, receiving value and strong longevity across winning teams." },
  { id: "marshawn-lynch", name: "Marshawn Lynch", subtitle: "Super Bowl champion · 2× rushing TD leader", league: "NFL", rating: 82, ratingBasis: "Memorable power peak, championship value and multiple elite seasons with less career volume than higher tiers." },
  { id: "steven-jackson", name: "Steven Jackson", subtitle: "8 straight 1,000-yard seasons", league: "NFL", rating: 80, ratingBasis: "Sustained high-volume production on weak teams without major awards or postseason opportunity." },
  { id: "priest-holmes", name: "Priest Holmes", subtitle: "2002 rushing leader · 3× All-Pro", league: "NFL", rating: 79, ratingBasis: "Short but spectacular scoring and scrimmage-yard peak." },
  { id: "jamaal-charles", name: "Jamaal Charles", subtitle: "5.4 career yards per carry", league: "NFL", rating: 79, ratingBasis: "Elite efficiency and explosive peak limited by injuries and shorter volume." },
  { id: "shaun-alexander", name: "Shaun Alexander", subtitle: "2005 MVP · 100 rushing TD", league: "NFL", rating: 78, ratingBasis: "MVP scoring peak and strong prime with a relatively fast decline." },
  { id: "clinton-portis", name: "Clinton Portis", subtitle: "9,923 rush yards · 2× Pro Bowl", league: "NFL", rating: 77, ratingBasis: "Strong two-team prime, heavy workload and consistent production without elite awards." },
  { id: "tiki-barber", name: "Tiki Barber", subtitle: "10,449 rush yards · 15,000+ scrimmage", league: "NFL", rating: 76, ratingBasis: "Late-career all-purpose peak and major production without postseason or award dominance." },
  { id: "eddie-george", name: "Eddie George", subtitle: "10,441 rush yards · 4× Pro Bowl", league: "NFL", rating: 76, ratingBasis: "Durable workhorse peak and long starter value with middling efficiency." },
  { id: "ricky-williams", name: "Ricky Williams", subtitle: "2002 rushing leader", league: "NFL", rating: 74, ratingBasis: "Elite one-season peak and multiple productive years interrupted by availability gaps." },
  { id: "chris-johnson", name: "Chris Johnson", subtitle: "2,006-yard season", league: "NFL", rating: 73, ratingBasis: "Historic speed peak and one 2,000-yard season with a shorter elite window." },
  { id: "maurice-jones-drew", name: "Maurice Jones-Drew", subtitle: "2011 rushing leader · 3× Pro Bowl", league: "NFL", rating: 73, ratingBasis: "Compact elite peak, receiving value and strong efficiency without long longevity." },
  { id: "arian-foster", name: "Arian Foster", subtitle: "2010 rushing leader · 4× Pro Bowl", league: "NFL", rating: 72, ratingBasis: "High-end dual-threat peak with injuries limiting career length." },
  { id: "demarco-murray", name: "DeMarco Murray", subtitle: "2014 rushing leader · 3× Pro Bowl", league: "NFL", rating: 70, ratingBasis: "One dominant rushing-title season and several strong years without long sustained greatness." },
  { id: "mark-ingram", name: "Mark Ingram", subtitle: "12 NFL seasons · 3× Pro Bowl", league: "NFL", rating: 68, ratingBasis: "Long useful career with several strong seasons but no elite league-leading peak." },
  { id: "reggie-bush", name: "Reggie Bush", subtitle: "9,000+ scrimmage yards", league: "NFL", rating: 63, ratingBasis: "Valuable receiving and space-player career that never reached the expected feature-back peak." },
  { id: "david-johnson", name: "David Johnson", subtitle: "2016 All-Pro · 2,000+ scrimmage yards", league: "NFL", rating: 58, ratingBasis: "One elite all-purpose season followed by injuries and a steep decline." },
  { id: "eddie-lacy", name: "Eddie Lacy", subtitle: "2013 Offensive Rookie of the Year", league: "NFL", rating: 56, ratingBasis: "Strong first two seasons but a short effective career and rapid decline." },
  { id: "darren-mcfadden", name: "Darren McFadden", subtitle: "No. 4 pick · 7,500+ scrimmage yards", league: "NFL", rating: 52, ratingBasis: "Occasional high-end flashes but injuries and inconsistency prevented sustained starter value." },
  { id: "peyton-hillis", name: "Peyton Hillis", subtitle: "2010 1,600+ scrimmage yards", league: "NFL", rating: 48, ratingBasis: "One famous breakout season with little sustained production before or after it." },
  { id: "ron-dayne", name: "Ron Dayne", subtitle: "No. 11 pick · 3,722 rush yards", league: "NFL", rating: 44, ratingBasis: "Recognizable first-round career that never became a consistent feature-back success." },
  { id: "trent-richardson", name: "Trent Richardson", subtitle: "No. 3 pick · 3.3 career YPC", league: "NFL", rating: 20, ratingBasis: "High-profile top-three pick whose efficiency and career length were both far below starter expectations." },
  { id: "montee-ball", name: "Montee Ball", subtitle: "Second-round pick · 731 rush yards", league: "NFL", rating: 18, ratingBasis: "Decorated college star whose NFL career lasted only 21 games with minimal production." },
];

const nflWideReceivers: readonly FootballRankFiveItem[] = [
  { id: "jerry-rice", name: "Jerry Rice", subtitle: "22,895 receiving yards · 3× champion", league: "NFL", rating: 100, ratingBasis: "Benchmark receiver career: unmatched production, longevity, postseason value and elite peak." },
  { id: "randy-moss", name: "Randy Moss", subtitle: "15,292 yards · 156 receiving TD", league: "NFL", rating: 98, ratingBasis: "Transformative peak and touchdown production with multiple era-defining seasons." },
  { id: "terrell-owens", name: "Terrell Owens", subtitle: "15,934 yards · 153 receiving TD", league: "NFL", rating: 96, ratingBasis: "Massive peak, longevity and scoring production across multiple teams." },
  { id: "calvin-johnson", name: "Calvin Johnson", subtitle: "6× Pro Bowl · 1,964-yard season", league: "NFL", rating: 95, ratingBasis: "Shorter career offset by one of the most dominant receiver peaks ever." },
  { id: "larry-fitzgerald", name: "Larry Fitzgerald", subtitle: "17,492 yards · 1,432 catches", league: "NFL", rating: 93, ratingBasis: "Historic longevity, hands and postseason peak with sustained high-end production." },
  { id: "marvin-harrison", name: "Marvin Harrison", subtitle: "1,102 catches · 8× Pro Bowl", league: "NFL", rating: 92, ratingBasis: "Elite precision, sustained production and championship-era value over a long prime." },
  { id: "antonio-brown", name: "Antonio Brown", subtitle: "4× first-team All-Pro", league: "NFL", rating: 91, ratingBasis: "Historic six-year receiving peak and elite return value, with a shortened finish to the career." },
  { id: "julio-jones", name: "Julio Jones", subtitle: "13,000+ yards · 7× Pro Bowl", league: "NFL", rating: 90, ratingBasis: "Dominant efficiency and yardage peak with elite postseason production." },
  { id: "andre-johnson", name: "Andre Johnson", subtitle: "14,185 yards · 7× Pro Bowl", league: "NFL", rating: 89, ratingBasis: "Long elite peak and huge production despite inconsistent quarterback support." },
  { id: "tyreek-hill", name: "Tyreek Hill", subtitle: "8× Pro Bowl · champion", league: "NFL", rating: 88, ratingBasis: "Game-breaking peak, elite efficiency and championship value with strong modern-era production." },
  { id: "cris-carter", name: "Cris Carter", subtitle: "1,101 catches · 130 receiving TD", league: "NFL", rating: 88, ratingBasis: "Elite scoring, hands and longevity with a long sustained prime." },
  { id: "steve-smith-sr", name: "Steve Smith Sr.", subtitle: "14,731 yards · triple-crown season", league: "NFL", rating: 87, ratingBasis: "Explosive peak, unusual longevity and major production despite size and quarterback context." },
  { id: "isaac-bruce", name: "Isaac Bruce", subtitle: "15,208 yards · champion", league: "NFL", rating: 87, ratingBasis: "Huge career volume, excellent longevity and key championship production." },
  { id: "torry-holt", name: "Torry Holt", subtitle: "13,382 yards · 7× Pro Bowl", league: "NFL", rating: 86, ratingBasis: "Extremely consistent high-end prime and major production in an elite offense." },
  { id: "tim-brown", name: "Tim Brown", subtitle: "14,934 yards · 9× Pro Bowl", league: "NFL", rating: 85, ratingBasis: "Excellent longevity, versatility and sustained production over multiple eras." },
  { id: "reggie-wayne", name: "Reggie Wayne", subtitle: "14,345 yards · champion", league: "NFL", rating: 85, ratingBasis: "Long high-end prime, postseason volume and championship contribution." },
  { id: "deandre-hopkins", name: "DeAndre Hopkins", subtitle: "5× Pro Bowl · 3× All-Pro", league: "NFL", rating: 84, ratingBasis: "Elite contested-catch peak and sustained production across unstable quarterback situations." },
  { id: "mike-evans", name: "Mike Evans", subtitle: "11 straight 1,000-yard seasons · champion", league: "NFL", rating: 84, ratingBasis: "Exceptional consistency, scoring value and championship contribution." },
  { id: "hines-ward", name: "Hines Ward", subtitle: "1,000 catches · 2× champion", league: "NFL", rating: 83, ratingBasis: "Excellent longevity, blocking value and postseason résumé with a Super Bowl MVP." },
  { id: "anquan-boldin", name: "Anquan Boldin", subtitle: "13,779 yards · champion", league: "NFL", rating: 83, ratingBasis: "Physical consistency, longevity and strong postseason value across multiple teams." },
  { id: "davante-adams", name: "Davante Adams", subtitle: "3× first-team All-Pro", league: "NFL", rating: 83, ratingBasis: "Elite route-running and touchdown peak with sustained top-tier seasons." },
  { id: "chad-johnson", name: "Chad Johnson", subtitle: "11,059 yards · 6× Pro Bowl", league: "NFL", rating: 81, ratingBasis: "Excellent multi-year peak and production without major postseason success." },
  { id: "brandon-marshall", name: "Brandon Marshall", subtitle: "12,351 yards · 6× Pro Bowl", league: "NFL", rating: 80, ratingBasis: "High-volume peak across several teams with limited postseason opportunity." },
  { id: "aj-green", name: "A.J. Green", subtitle: "10,514 yards · 7× Pro Bowl", league: "NFL", rating: 79, ratingBasis: "Long Pro Bowl prime and strong production before injuries accelerated decline." },
  { id: "demaryius-thomas", name: "Demaryius Thomas", subtitle: "9,763 yards · champion", league: "NFL", rating: 78, ratingBasis: "Excellent peak in an elite offense with championship value and multiple dominant seasons." },
  { id: "dez-bryant", name: "Dez Bryant", subtitle: "3× Pro Bowl · 75 receiving TD", league: "NFL", rating: 77, ratingBasis: "Elite scoring peak and several dominant seasons with a shorter effective prime." },
  { id: "wes-welker", name: "Wes Welker", subtitle: "903 catches · 5× Pro Bowl", league: "NFL", rating: 76, ratingBasis: "Era-shaping slot production and sustained high-volume efficiency without a championship." },
  { id: "keenan-allen", name: "Keenan Allen", subtitle: "1,000+ catches · 6× Pro Bowl", league: "NFL", rating: 76, ratingBasis: "Long high-level route-running and volume production with limited postseason résumé." },
  { id: "roddy-white", name: "Roddy White", subtitle: "10,863 yards · 4× Pro Bowl", league: "NFL", rating: 74, ratingBasis: "Long productive prime and strong consistency without elite all-time awards." },
  { id: "odell-beckham-jr", name: "Odell Beckham Jr.", subtitle: "3× Pro Bowl · 5,000 yards in 54 games", league: "NFL", rating: 73, ratingBasis: "Explosive early-career peak and iconic production tempered by injuries and shortened prime." },
  { id: "jordy-nelson", name: "Jordy Nelson", subtitle: "72 receiving TD · champion", league: "NFL", rating: 73, ratingBasis: "Elite efficiency and scoring peak with strong postseason value but less career volume." },
  { id: "amari-cooper", name: "Amari Cooper", subtitle: "10,000+ yards · 5× Pro Bowl", league: "NFL", rating: 72, ratingBasis: "Long productive career across teams without a sustained top-five receiver peak." },
  { id: "santonio-holmes", name: "Santonio Holmes", subtitle: "Super Bowl MVP · 6,030 yards", league: "NFL", rating: 68, ratingBasis: "Strong starter peak and iconic postseason moment with modest career longevity." },
  { id: "plaxico-burress", name: "Plaxico Burress", subtitle: "8,499 yards · Super Bowl champion", league: "NFL", rating: 68, ratingBasis: "Long productive starter career with a defining championship contribution." },
  { id: "michael-thomas", name: "Michael Thomas", subtitle: "2019 OPOY · 149-catch season", league: "NFL", rating: 67, ratingBasis: "All-time short peak undermined by injuries that dramatically limited career volume." },
  { id: "percy-harvin", name: "Percy Harvin", subtitle: "Pro Bowl · Super Bowl champion", league: "NFL", rating: 62, ratingBasis: "Electric all-purpose peak and championship impact limited by health and longevity." },
  { id: "juju-smith-schuster", name: "JuJu Smith-Schuster", subtitle: "Pro Bowl season · champion", league: "NFL", rating: 60, ratingBasis: "Strong early production and useful championship role without sustained No. 1 receiver play." },
  { id: "braylon-edwards", name: "Braylon Edwards", subtitle: "2007 Pro Bowl · 39 receiving TD", league: "NFL", rating: 58, ratingBasis: "One elite breakout season and several useful years without sustained top-tier production." },
  { id: "josh-gordon", name: "Josh Gordon", subtitle: "2013 first-team All-Pro", league: "NFL", rating: 56, ratingBasis: "Historic one-season peak but severe availability issues erased long-term career value." },
  { id: "sammy-watkins", name: "Sammy Watkins", subtitle: "No. 4 pick · champion", league: "NFL", rating: 55, ratingBasis: "Useful starter and postseason contributor whose career never matched elite draft expectations." },
  { id: "kenny-golladay", name: "Kenny Golladay", subtitle: "2019 receiving TD leader", league: "NFL", rating: 49, ratingBasis: "Brief high-end Detroit peak followed by injuries and a rapid loss of production." },
  { id: "kelvin-benjamin", name: "Kelvin Benjamin", subtitle: "1,008-yard rookie season", league: "NFL", rating: 44, ratingBasis: "Promising start followed by declining efficiency and a short effective career." },
  { id: "tavon-austin", name: "Tavon Austin", subtitle: "No. 8 pick · return/utility role", league: "NFL", rating: 42, ratingBasis: "Long gadget-player career but little value as the featured receiver expected of a top-ten pick." },
  { id: "justin-blackmon", name: "Justin Blackmon", subtitle: "No. 5 pick · 20 career games", league: "NFL", rating: 28, ratingBasis: "Productive flashes but only 20 NFL games and 1,280 receiving yards left minimal career value." },
  { id: "corey-coleman", name: "Corey Coleman", subtitle: "No. 15 pick · 789 career yards", league: "NFL", rating: 20, ratingBasis: "First-round investment with only 61 catches and 789 yards over 27 games." },
  { id: "nkeal-harry", name: "N'Keal Harry", subtitle: "First-round pick · 714 career yards", league: "NFL", rating: 16, ratingBasis: "First-round receiver who never developed into a reliable NFL target." },
  { id: "charles-rogers", name: "Charles Rogers", subtitle: "No. 2 pick · 36 career catches", league: "NFL", rating: 12, ratingBasis: "Top-two draft pick with an extremely short, injury-limited and unproductive career." },
];

const nflHeadCoaches: readonly FootballRankFiveItem[] = [
  { id: "bill-belichick", name: "Bill Belichick", subtitle: "6× Super Bowl champion as head coach", league: "NFL", rating: 100, ratingBasis: "Benchmark modern coaching dynasty with unmatched playoff success and two decades of sustained contention." },
  { id: "vince-lombardi", name: "Vince Lombardi", subtitle: "5× NFL champion · 2× Super Bowl champion", league: "NFL", rating: 99, ratingBasis: "Era-defining championship peak with extraordinary winning percentage and postseason dominance." },
  { id: "don-shula", name: "Don Shula", subtitle: "328 regular-season wins · 2× champion", league: "NFL", rating: 98, ratingBasis: "All-time wins leader with extraordinary longevity, multiple eras of contention and a perfect season." },
  { id: "andy-reid", name: "Andy Reid", subtitle: "3× Super Bowl champion · 300+ combined wins", league: "NFL", rating: 98, ratingBasis: "Elite longevity across two franchises with three titles and sustained offensive innovation." },
  { id: "bill-walsh", name: "Bill Walsh", subtitle: "3× Super Bowl champion", league: "NFL", rating: 97, ratingBasis: "Dynasty peak, offensive innovation and major coaching-tree influence in a shorter head-coaching career." },
  { id: "chuck-noll", name: "Chuck Noll", subtitle: "4× Super Bowl champion", league: "NFL", rating: 96, ratingBasis: "Four-title dynasty architect with sustained roster-building and defensive/offensive adaptability." },
  { id: "tom-landry", name: "Tom Landry", subtitle: "250 regular-season wins · 2× champion", league: "NFL", rating: 95, ratingBasis: "Two decades of contention, innovation and exceptional longevity with five Super Bowl trips." },
  { id: "paul-brown", name: "Paul Brown", subtitle: "7× pro football champion", league: "NFL", rating: 94, ratingBasis: "Foundational innovator with dominant pre-Super Bowl and NFL success across multiple organizations." },
  { id: "joe-gibbs", name: "Joe Gibbs", subtitle: "3× Super Bowl champion", league: "NFL", rating: 93, ratingBasis: "Three titles with different starting quarterbacks and repeated elite postseason teams." },
  { id: "bill-parcells", name: "Bill Parcells", subtitle: "2× Super Bowl champion", league: "NFL", rating: 92, ratingBasis: "Two titles plus successful turnarounds across multiple franchises and roster cycles." },
  { id: "mike-tomlin", name: "Mike Tomlin", subtitle: "Super Bowl champion · no losing seasons", league: "NFL", rating: 90, ratingBasis: "Exceptional year-to-year floor, one title and sustained contention without a multi-title dynasty." },
  { id: "marty-schottenheimer", name: "Marty Schottenheimer", subtitle: "200 regular-season wins", league: "NFL", rating: 88, ratingBasis: "Elite long-term regular-season success across franchises, heavily discounted for limited postseason conversion." },
  { id: "john-harbaugh", name: "John Harbaugh", subtitle: "Super Bowl champion · 2× Coach of the Year", league: "NFL", rating: 87, ratingBasis: "Long stable contender run, title success and adaptability across major roster/offense changes." },
  { id: "pete-carroll", name: "Pete Carroll", subtitle: "Super Bowl champion · 2 NFC titles", league: "NFL", rating: 87, ratingBasis: "Built a dominant championship defense and sustained contender, with a strong but shorter NFL prime." },
  { id: "sean-mcvay", name: "Sean McVay", subtitle: "Super Bowl champion · 2 NFC titles", league: "NFL", rating: 86, ratingBasis: "Elite modern offensive peak, rapid roster-cycle adaptation and multiple Super Bowl runs." },
  { id: "sean-payton", name: "Sean Payton", subtitle: "Super Bowl champion · 3× 13-win seasons", league: "NFL", rating: 85, ratingBasis: "Long high-end offensive track record and a title with sustained contender seasons." },
  { id: "tom-coughlin", name: "Tom Coughlin", subtitle: "2× Super Bowl champion", league: "NFL", rating: 85, ratingBasis: "Two iconic title runs plus strong expansion-team building and long career value." },
  { id: "tony-dungy", name: "Tony Dungy", subtitle: "Super Bowl champion · Hall of Fame", league: "NFL", rating: 84, ratingBasis: "Excellent regular-season consistency, defensive influence and championship success." },
  { id: "mike-shanahan", name: "Mike Shanahan", subtitle: "2× champion · 170 regular-season wins", league: "NFL", rating: 84, ratingBasis: "Back-to-back titles, major offensive influence and long successful Denver run." },
  { id: "bill-cowher", name: "Bill Cowher", subtitle: "Super Bowl champion · Hall of Fame", league: "NFL", rating: 83, ratingBasis: "Consistent contender over 15 seasons with two Super Bowl trips and one title." },
  { id: "mike-holmgren", name: "Mike Holmgren", subtitle: "Super Bowl champion · 3 conference titles", league: "NFL", rating: 82, ratingBasis: "Title success and conference championships with two franchises plus major offensive influence." },
  { id: "mike-mccarthy", name: "Mike McCarthy", subtitle: "Super Bowl champion · 11 playoff trips", league: "NFL", rating: 80, ratingBasis: "Long winning tenure and a title with strong regular-season success, offset by postseason underachievement." },
  { id: "bruce-arians", name: "Bruce Arians", subtitle: "Super Bowl champion · 2× Coach of the Year", league: "NFL", rating: 77, ratingBasis: "Strong late-career peak, multiple turnarounds and a title with shorter total head-coaching longevity." },
  { id: "doug-pederson", name: "Doug Pederson", subtitle: "Super Bowl champion", league: "NFL", rating: 75, ratingBasis: "Championship peak and multiple playoff teams with uneven regular-season longevity." },
  { id: "dan-quinn", name: "Dan Quinn", subtitle: "Super Bowl appearance · multiple playoff teams", league: "NFL", rating: 74, ratingBasis: "Strong Atlanta peak and later turnaround value without a championship as head coach." },
  { id: "ron-rivera", name: "Ron Rivera", subtitle: "Super Bowl appearance · 2× Coach of the Year", league: "NFL", rating: 68, ratingBasis: "One elite Carolina peak and multiple successful seasons balanced by a sub-.500 overall record." },
  { id: "marvin-lewis", name: "Marvin Lewis", subtitle: "7 playoff appearances with Cincinnati", league: "NFL", rating: 67, ratingBasis: "Major franchise-floor improvement and longevity without a playoff win." },
  { id: "mike-vrabel", name: "Mike Vrabel", subtitle: "3 playoff trips · Coach of the Year", league: "NFL", rating: 67, ratingBasis: "Strong overachievement peak and division success in a relatively short head-coaching sample." },
  { id: "jeff-fisher", name: "Jeff Fisher", subtitle: "Super Bowl appearance · 173 wins", league: "NFL", rating: 63, ratingBasis: "Exceptional longevity and one title-game run balanced by a near-.500 career record." },
  { id: "rex-ryan", name: "Rex Ryan", subtitle: "2 AFC title games", league: "NFL", rating: 62, ratingBasis: "Excellent early defensive peak and two deep playoff runs followed by sustained decline." },
  { id: "jason-garrett", name: "Jason Garrett", subtitle: "3 playoff trips · 85 regular-season wins", league: "NFL", rating: 59, ratingBasis: "Long competent Dallas tenure with winning seasons but little postseason ceiling." },
  { id: "kliff-kingsbury", name: "Kliff Kingsbury", subtitle: "1 playoff appearance with Arizona", league: "NFL", rating: 55, ratingBasis: "Brief offensive flashes and one playoff season without sustained NFL head-coaching success." },
  { id: "adam-gase", name: "Adam Gase", subtitle: "32–48 head-coaching record", league: "NFL", rating: 44, ratingBasis: "One playoff season followed by repeated losing records and limited evidence of sustainable program building." },
  { id: "josh-mcdaniels", name: "Josh McDaniels", subtitle: "Two short head-coaching tenures", league: "NFL", rating: 40, ratingBasis: "Successful coordinator résumé did not translate to sustained head-coaching results in Denver or Las Vegas." },
  { id: "matt-patricia", name: "Matt Patricia", subtitle: "13–29–1 with Detroit", league: "NFL", rating: 28, ratingBasis: "Three losing seasons and significant regression left little positive head-coaching value." },
  { id: "nathaniel-hackett", name: "Nathaniel Hackett", subtitle: "4–11 with Denver", league: "NFL", rating: 20, ratingBasis: "Single abbreviated season with severe offensive underperformance and no sustained head-coaching value." },
  { id: "urban-meyer", name: "Urban Meyer", subtitle: "2–11 with Jacksonville", league: "NFL", rating: 12, ratingBasis: "Extremely short NFL tenure with poor results and no successful team-building evidence." },
  { id: "hue-jackson", name: "Hue Jackson", subtitle: "11–44–1 career record", league: "NFL", rating: 8, ratingBasis: "One of the lowest modern winning rates, including a 3–36–1 Cleveland tenure." },
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
    id: "nfl-wide-receivers",
    name: "NFL WR Careers",
    prompt: "Rank their NFL careers",
    intro: "Career greatness only. Peak, production and longevity all count before the next receiver appears.",
    items: nflWideReceivers,
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
