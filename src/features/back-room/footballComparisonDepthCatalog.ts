export type FootballComparisonDepthLeague = "NFL" | "CFB";

export type FootballComparisonDepthAssetSpec =
  | { kind: "nfl"; team: string; label: string }
  | { kind: "cfb"; teamId: number; label: string };

export interface FootballComparisonDepthItem {
  id: string;
  name: string;
  subtitle: string;
  league: FootballComparisonDepthLeague;
  rating: number;
  ratingBasis: string;
  asset: FootballComparisonDepthAssetSpec;
}

const nfl = (
  id: string,
  name: string,
  subtitle: string,
  rating: number,
  ratingBasis: string,
  team: string,
  label: string,
): FootballComparisonDepthItem => ({
  id,
  name,
  subtitle,
  league: "NFL",
  rating,
  ratingBasis,
  asset: { kind: "nfl", team, label },
});

const cfb = (
  id: string,
  name: string,
  subtitle: string,
  rating: number,
  ratingBasis: string,
  teamId: number,
  label: string,
): FootballComparisonDepthItem => ({
  id,
  name,
  subtitle,
  league: "CFB",
  rating,
  ratingBasis,
  asset: { kind: "cfb", teamId, label },
});

export const nflTightEnds = [
  nfl("tony-gonzalez", "Tony Gonzalez", "14× Pro Bowl · 15,127 receiving yards", 100, "Benchmark tight-end career with unmatched receiving volume, longevity and sustained elite play.", "kc", "Kansas City Chiefs"),
  nfl("rob-gronkowski", "Rob Gronkowski", "4× champion · 4× first-team All-Pro", 99, "Historic peak as a receiver/blocker with dominant postseason value; shorter career keeps him just off the benchmark.", "ne", "New England Patriots"),
  nfl("travis-kelce", "Travis Kelce", "3× champion · 7 straight 1,000-yard seasons", 98, "All-time receiving and postseason production with extraordinary modern longevity and a still-elite late prime.", "kc", "Kansas City Chiefs"),
  nfl("antonio-gates", "Antonio Gates", "116 receiving TD · 8× Pro Bowl", 95, "Elite scoring peak and long receiving dominance across multiple offensive eras.", "lac", "Chargers"),
  nfl("shannon-sharpe", "Shannon Sharpe", "3× champion · 4× first-team All-Pro", 93, "Era-shaping receiving tight end with major championship value and sustained All-Pro play.", "den", "Denver Broncos"),
  nfl("jason-witten", "Jason Witten", "1,228 catches · 11× Pro Bowl", 92, "Exceptional longevity, reliability and complete tight-end value without the same postseason peak as the top tier.", "dal", "Dallas Cowboys"),
  nfl("kellen-winslow-sr", "Kellen Winslow Sr.", "3× first-team All-Pro · Hall of Fame", 91, "Transformative receiving peak and positional influence despite a shorter career than later volume leaders.", "lac", "Chargers"),
  nfl("ozzie-newsome", "Ozzie Newsome", "662 catches · Hall of Fame", 90, "Long high-end receiving career that helped define the modern tight-end role.", "cle", "Cleveland Browns"),
  nfl("john-mackey", "John Mackey", "Hall of Fame · 3× first-team All-Pro", 89, "Explosive era-adjusted peak and enormous positional influence with limited modern-style volume.", "ind", "Baltimore / Indianapolis Colts franchise"),
  nfl("mike-ditka", "Mike Ditka", "Hall of Fame · champion", 88, "Dominant early positional peak and blocking/receiving influence that changed expectations for tight ends.", "chi", "Chicago Bears"),
  nfl("george-kittle", "George Kittle", "6× Pro Bowl · 2× first-team All-Pro", 87, "Elite two-way peak and efficiency with career longevity still short of the inner-circle veterans.", "sf", "San Francisco 49ers"),
  nfl("greg-olsen", "Greg Olsen", "3 straight 1,000-yard seasons", 84, "Long high-end receiving career with rare consistency across teams and offensive systems.", "car", "Carolina Panthers"),
  nfl("jimmy-graham", "Jimmy Graham", "89 receiving TD · 5× Pro Bowl", 83, "Elite scoring and receiving peak with less complete two-way value and a sharper late decline.", "no", "New Orleans Saints"),
  nfl("mark-andrews", "Mark Andrews", "first-team All-Pro · multiple Pro Bowls", 82, "High-end modern receiving peak and sustained red-zone value with an unfinished longevity case.", "bal", "Baltimore Ravens"),
  nfl("vernon-davis", "Vernon Davis", "7,562 yards · champion", 79, "Excellent athletic peak, long productive career and meaningful postseason contribution without sustained All-Pro dominance.", "sf", "San Francisco 49ers"),
  nfl("zach-ertz", "Zach Ertz", "champion · 800+ career catches", 77, "Long productive receiving career with a championship-defining catch and several top-tier seasons.", "phi", "Philadelphia Eagles"),
  nfl("eric-ebron", "Eric Ebron", "Pro Bowl season · 5,000+ receiving yards", 58, "Useful receiving career and one strong scoring peak, but inconsistent hands and limited sustained top-end value.", "ind", "Indianapolis Colts"),
  nfl("oj-howard", "O.J. Howard", "2017 first-round pick · 2,000+ career yards", 42, "Athletic flashes never developed into sustained starter-level production for a first-round tight end.", "tb", "Tampa Bay Buccaneers"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const nflDefensiveCareers = [
  nfl("lawrence-taylor", "Lawrence Taylor", "3× DPOY · 1986 MVP", 100, "Benchmark defensive career with unmatched peak disruption, awards and era-defining positional impact.", "nyg", "New York Giants"),
  nfl("reggie-white", "Reggie White", "2× DPOY · 198 career sacks", 99, "Historic pass-rush peak, extraordinary longevity and championship value across two franchises.", "phi", "Philadelphia Eagles"),
  nfl("aaron-donald", "Aaron Donald", "3× DPOY · 8× first-team All-Pro", 99, "Interior dominance at a nearly unmatched peak with elite postseason and championship impact.", "lar", "Los Angeles Rams"),
  nfl("ray-lewis", "Ray Lewis", "2× DPOY · 2× champion", 98, "Two-decade defensive centerpiece with elite peak, leadership and championship postseason value.", "bal", "Baltimore Ravens"),
  nfl("jj-watt", "J.J. Watt", "3× DPOY · 5× first-team All-Pro", 97, "One of the greatest defensive peaks ever, with injuries shortening the sustained-prime argument versus the very top.", "hou", "Houston Texans"),
  nfl("deion-sanders", "Deion Sanders", "1994 DPOY · 2× champion", 96, "Transformative coverage peak, turnover value and championship impact with rare cross-era positional dominance.", "dal", "Dallas Cowboys"),
  nfl("ed-reed", "Ed Reed", "2004 DPOY · 9× Pro Bowl", 96, "Historic range, ball production and postseason value at safety over a long elite prime.", "bal", "Baltimore Ravens"),
  nfl("bruce-smith", "Bruce Smith", "200 career sacks · 2× DPOY", 95, "All-time sack volume with elite longevity and repeated All-Pro dominance.", "buf", "Buffalo Bills"),
  nfl("myles-garrett", "Myles Garrett", "2× DPOY · 23-sack 2025 season", 95, "Two DPOYs, a record-setting 23-sack season and sustained elite disruption move an active career into the inner circle.", "cle", "Cleveland Browns"),
  nfl("ronnie-lott", "Ronnie Lott", "4× champion · 8× first-team All-Pro", 94, "Elite versatility, physical impact and championship play across the secondary.", "sf", "San Francisco 49ers"),
  nfl("joe-greene", "Mean Joe Greene", "2× DPOY · 4× champion", 94, "Centerpiece of a dynasty defense with elite interior dominance and historical positional impact.", "pit", "Pittsburgh Steelers"),
  nfl("dick-butkus", "Dick Butkus", "5× first-team All-Pro", 93, "Shorter career but extraordinary era dominance and positional reputation at linebacker.", "chi", "Chicago Bears"),
  nfl("tj-watt", "T.J. Watt", "DPOY · multiple sack titles", 93, "Sustained elite edge production, award-level peak and game-changing turnover/sack value with an active longevity case.", "pit", "Pittsburgh Steelers"),
  nfl("rod-woodson", "Rod Woodson", "DPOY · 71 interceptions", 92, "Rare longevity and versatility with elite cornerback peak and late-career safety value.", "pit", "Pittsburgh Steelers"),
  nfl("derrick-brooks", "Derrick Brooks", "DPOY · champion", 91, "Long elite coverage-linebacker prime with championship value and repeated first-team All-Pro seasons.", "tb", "Tampa Bay Buccaneers"),
  nfl("junior-seau", "Junior Seau", "12× Pro Bowl · 6× first-team All-Pro", 90, "Exceptional longevity, range and sustained high-end linebacker play without a championship finish.", "lac", "Chargers"),
  nfl("champ-bailey", "Champ Bailey", "12× Pro Bowl · 3× first-team All-Pro", 90, "Long shutdown-corner prime with elite man-coverage value and rare durability.", "den", "Denver Broncos"),
  nfl("brian-dawkins", "Brian Dawkins", "9× Pro Bowl · 4× first-team All-Pro", 89, "Complete safety career with elite versatility, longevity and emotional/physical impact.", "phi", "Philadelphia Eagles"),
  nfl("troy-polamalu", "Troy Polamalu", "DPOY · 2× champion", 89, "Unique playmaking peak and championship value with a slightly shorter sustained-prime window.", "pit", "Pittsburgh Steelers"),
  nfl("darrelle-revis", "Darrelle Revis", "4× first-team All-Pro · champion", 88, "One of the best pure coverage peaks ever, with strong but less extreme career longevity.", "nyj", "New York Jets"),
  nfl("michael-strahan", "Michael Strahan", "DPOY · 141.5 sacks", 87, "Long elite edge career with record-level peak production and a championship finish.", "nyg", "New York Giants"),
  nfl("terrell-suggs", "Terrell Suggs", "DPOY · 2× champion", 86, "Excellent longevity, pass-rush production and postseason value across a very long career.", "bal", "Baltimore Ravens"),
  nfl("von-miller", "Von Miller", "Super Bowl MVP · 2× champion", 86, "Elite peak pass rush and extraordinary postseason moments with a long high-end career.", "den", "Denver Broncos"),
  nfl("patrick-willis", "Patrick Willis", "5× first-team All-Pro", 85, "Short career but nearly uninterrupted elite linebacker play at his peak.", "sf", "San Francisco 49ers"),
  nfl("luke-kuechly", "Luke Kuechly", "DPOY · 5× first-team All-Pro", 85, "Exceptional peak instincts and coverage value with retirement limiting longevity.", "car", "Carolina Panthers"),
  nfl("richard-sherman", "Richard Sherman", "3× first-team All-Pro · champion", 84, "Elite shutdown peak and championship value with a shorter top-tier window than the highest-rated corners.", "sea", "Seattle Seahawks"),
  nfl("ndamukong-suh", "Ndamukong Suh", "3× first-team All-Pro · champion", 82, "Long disruptive interior career with an elite early peak and strong late postseason value.", "det", "Detroit Lions"),
  nfl("clay-matthews", "Clay Matthews", "6× Pro Bowl · champion", 78, "High-impact pass-rush peak and long useful career without sustained first-team All-Pro dominance.", "gb", "Green Bay Packers"),
  nfl("jadeveon-clowney", "Jadeveon Clowney", "3× Pro Bowl · long-term starter", 68, "Long useful defensive career and strong run defense, but never reached the elite pass-rush ceiling expected of a No. 1 pick.", "hou", "Houston Texans"),
  nfl("morris-claiborne", "Morris Claiborne", "No. 6 pick · 74 career starts", 48, "Starter-level stretches but injuries and inconsistency kept a top-six pick well below expected career value.", "dal", "Dallas Cowboys"),
  nfl("dion-jordan", "Dion Jordan", "No. 3 pick · 13 career starts", 18, "Top-three draft investment produced little sustained starting value or impact.", "mia", "Miami Dolphins"),
  nfl("vernon-gholston", "Vernon Gholston", "No. 6 pick · 0 career sacks", 8, "Three-year top-six-pick career without a sack is a recognizable bottom-of-scale defensive outcome.", "nyj", "New York Jets"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const nflQuarterbackSeasons = [
  nfl("tom-brady-2007", "Tom Brady", "2007 · 50 TD · 16–0 regular season", 100, "Historic efficiency and touchdown dominance on an undefeated regular-season team; Super Bowl loss is the only meaningful blemish.", "ne", "New England Patriots"),
  nfl("peyton-manning-2013", "Peyton Manning", "2013 · 5,477 yards · 55 TD", 100, "Record-setting passing production and MVP dominance with a Super Bowl appearance.", "den", "Denver Broncos"),
  nfl("dan-marino-1984", "Dan Marino", "1984 · 5,084 yards · 48 TD", 99, "Era-shattering passing season that reset the statistical ceiling and reached the Super Bowl.", "mia", "Miami Dolphins"),
  nfl("aaron-rodgers-2011", "Aaron Rodgers", "2011 · 45 TD · 122.5 rating", 99, "One of the most efficient MVP seasons ever with a 15–1 team record.", "gb", "Green Bay Packers"),
  nfl("patrick-mahomes-2022", "Patrick Mahomes", "2022 · MVP · Super Bowl champion", 98, "Elite volume, efficiency, MVP and championship performance in the same season.", "kc", "Kansas City Chiefs"),
  nfl("steve-young-1994", "Steve Young", "1994 · MVP · Super Bowl MVP", 97, "Era-leading efficiency, rushing value and a dominant championship finish.", "sf", "San Francisco 49ers"),
  nfl("peyton-manning-2004", "Peyton Manning", "2004 · 49 TD · 121.1 rating", 97, "Extraordinary efficiency and touchdown rate in an MVP season, discounted slightly for the playoff ending.", "ind", "Indianapolis Colts"),
  nfl("lamar-jackson-2019", "Lamar Jackson", "2019 · unanimous MVP · 43 total TD", 96, "Transformative dual-threat MVP season with league-leading scoring impact and a 14–2 team.", "bal", "Baltimore Ravens"),
  nfl("cam-newton-2015", "Cam Newton", "2015 · MVP · 45 total TD", 95, "Dominant dual-threat season that drove a 15–1 team to the Super Bowl.", "car", "Carolina Panthers"),
  nfl("kurt-warner-1999", "Kurt Warner", "1999 · MVP · Super Bowl MVP", 95, "Breakout MVP season with elite efficiency, huge scoring and a championship finish.", "lar", "Rams"),
  nfl("matthew-stafford-2025", "Matthew Stafford", "2025 · AP MVP", 94, "Late-career MVP peak with elite passing production and efficiency against a strong modern field.", "lar", "Los Angeles Rams"),
  nfl("matt-ryan-2016", "Matt Ryan", "2016 · MVP · Super Bowl appearance", 93, "Elite efficiency and explosive offense with an MVP and deep postseason run.", "atl", "Atlanta Falcons"),
  nfl("drew-brees-2011", "Drew Brees", "2011 · 5,476 yards · 46 TD", 92, "Record-level volume and elite efficiency in one of the best non-MVP passing seasons ever.", "no", "New Orleans Saints"),
  nfl("brett-favre-2009", "Brett Favre", "2009 · 33 TD · 7 INT", 89, "Remarkable late-career efficiency and a conference-title-game run without the MVP or title finish.", "min", "Minnesota Vikings"),
  nfl("carson-wentz-2017", "Carson Wentz", "2017 · 33 TD in 13 games", 84, "MVP-caliber regular-season impact on the eventual champion, but injury removed the postseason and capped the season value.", "phi", "Philadelphia Eagles"),
  nfl("jameis-winston-2019", "Jameis Winston", "2019 · 5,109 yards · 33 TD / 30 INT", 60, "Massive volume and explosive plays paired with extreme turnover cost make this a true middle-scale chaos season.", "tb", "Tampa Bay Buccaneers"),
  nfl("zach-wilson-2022", "Zach Wilson", "2022 · 1,688 yards · 6 TD / 7 INT", 28, "Poor efficiency and loss of the starting job on a competitive roster produce a clearly bad season.", "nyj", "New York Jets"),
  nfl("jamarcus-russell-2009", "JaMarcus Russell", "2009 · 3 TD / 11 INT · 50.0 rating", 10, "Extremely poor efficiency and production in a season that effectively ended his starting career.", "lv", "Raiders"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const nflTeamSeasons = [
  nfl("1972-miami-dolphins", "1972 Miami Dolphins", "17–0 · Super Bowl champion", 100, "Only perfect Super Bowl-era season, combining undefeated accomplishment with championship completion.", "mia", "Miami Dolphins"),
  nfl("1985-chicago-bears", "1985 Chicago Bears", "18–1 · Super Bowl champion", 99, "All-time defensive dominance, massive point differential and a nearly flawless championship run.", "chi", "Chicago Bears"),
  nfl("1989-san-francisco-49ers", "1989 San Francisco 49ers", "17–2 · Super Bowl champion", 99, "Elite offense and defense with one of the most dominant postseason runs ever.", "sf", "San Francisco 49ers"),
  nfl("1991-washington", "1991 Washington", "17–2 · Super Bowl champion", 98, "Historically dominant efficiency and point differential against a strong schedule, finished with the title.", "wsh", "Washington"),
  nfl("2007-new-england-patriots", "2007 New England Patriots", "18–1 · lost Super Bowl XLII", 98, "Historic regular-season dominance and offense; the championship-game loss prevents benchmark status.", "ne", "New England Patriots"),
  nfl("1996-green-bay-packers", "1996 Green Bay Packers", "16–3 · Super Bowl champion", 96, "Top-level offense, defense and special teams with a convincing championship finish.", "gb", "Green Bay Packers"),
  nfl("1998-denver-broncos", "1998 Denver Broncos", "17–2 · Super Bowl champion", 95, "Dominant repeat champion with elite rushing offense and a strong postseason run.", "den", "Denver Broncos"),
  nfl("1999-st-louis-rams", "1999 St. Louis Rams", "16–3 · Super Bowl champion", 95, "Explosive historically important offense paired with a championship-level defense and title.", "lar", "Rams"),
  nfl("2004-new-england-patriots", "2004 New England Patriots", "17–2 · Super Bowl champion", 94, "Back-to-back champion with elite balance and playoff wins over multiple top teams.", "ne", "New England Patriots"),
  nfl("2013-seattle-seahawks", "2013 Seattle Seahawks", "16–3 · Super Bowl champion", 94, "Generational pass defense and dominant Super Bowl performance against an elite offense.", "sea", "Seattle Seahawks"),
  nfl("2024-philadelphia-eagles", "2024 Philadelphia Eagles", "18–3 · Super Bowl champion", 94, "Elite roster balance and dominant postseason finish capped by a convincing championship win.", "phi", "Philadelphia Eagles"),
  nfl("2025-seattle-seahawks", "2025 Seattle Seahawks", "Super Bowl LX champion · beat New England 29–13", 93, "Championship season driven by a defense that delivered one of the strongest recent Super Bowl performances.", "sea", "Seattle Seahawks"),
  nfl("2016-new-england-patriots", "2016 New England Patriots", "17–2 · Super Bowl champion", 93, "Excellent regular-season dominance and an iconic championship comeback.", "ne", "New England Patriots"),
  nfl("2015-carolina-panthers", "2015 Carolina Panthers", "17–2 · lost Super Bowl 50", 90, "15–1 regular season and MVP-led dominance, discounted for the championship-game loss.", "car", "Carolina Panthers"),
  nfl("2011-philadelphia-eagles", "2011 Philadelphia Eagles", "8–8 · 'Dream Team'", 55, "Strong talent and underlying metrics never became consistent winning football, making this a famous middle-scale disappointment.", "phi", "Philadelphia Eagles"),
  nfl("2022-denver-broncos", "2022 Denver Broncos", "5–12 · preseason contender expectations", 38, "Elite-defense flashes could not offset one of the league's worst offenses and a major expectation collapse.", "den", "Denver Broncos"),
  nfl("2020-jacksonville-jaguars", "2020 Jacksonville Jaguars", "1–15", 18, "One opening-week win followed by fifteen straight losses and bottom-tier overall performance.", "jax", "Jacksonville Jaguars"),
  nfl("2017-cleveland-browns", "2017 Cleveland Browns", "0–16", 5, "Winless season with poor performance on both sides of the ball is a clear bottom-of-scale modern team season.", "cle", "Cleveland Browns"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const collegeHeadCoaches = [
  cfb("nick-saban-cfb", "Nick Saban", "7 national titles · Alabama / LSU", 100, "Benchmark modern college coaching career with unmatched titles, sustained contention and roster-cycle dominance.", 333, "Alabama"),
  cfb("urban-meyer-cfb", "Urban Meyer", "3 national titles · Florida / Ohio State", 97, "Championship peaks at two programs, elite winning percentage and major offensive influence.", 194, "Ohio State"),
  cfb("kirby-smart-cfb", "Kirby Smart", "2 national titles · Georgia", 96, "Sustained elite recruiting, defense and championship contention with a modern dynasty-level peak.", 61, "Georgia"),
  cfb("dabo-swinney-cfb", "Dabo Swinney", "2 national titles · Clemson", 94, "Built Clemson into a multi-title national power with a long playoff-era peak.", 228, "Clemson"),
  cfb("pete-carroll-cfb", "Pete Carroll", "2 national titles · USC", 93, "Shorter college tenure but extraordinary peak dominance, recruiting and national-title contention.", 30, "USC"),
  cfb("bob-stoops-cfb", "Bob Stoops", "2000 national title · 10 Big 12 titles", 92, "Long conference dominance, repeated title contention and excellent program stability.", 201, "Oklahoma"),
  cfb("mack-brown-cfb", "Mack Brown", "2005 national title · 280+ career wins", 90, "Elite Texas peak, major longevity and successful program building across multiple stops.", 251, "Texas"),
  cfb("jim-tressel-cfb", "Jim Tressel", "2002 national title · 6 Big Ten titles", 89, "Consistent championship contention and rivalry dominance over a strong decade at Ohio State.", 194, "Ohio State"),
  cfb("jim-harbaugh-cfb", "Jim Harbaugh", "2023 national title · Michigan", 88, "Turned Michigan into a national champion after a long build, with additional success at Stanford.", 130, "Michigan"),
  cfb("curt-cignetti-cfb", "Curt Cignetti", "2025 national title · 16–0 Indiana", 87, "Historic Indiana championship peak plus sustained winning at prior stops; shorter top-level tenure limits the all-time ceiling.", 84, "Indiana"),
  cfb("brian-kelly-cfb", "Brian Kelly", "300+ career wins · CFP/title-game appearances", 86, "Exceptional longevity and program elevation with repeated major-stage appearances but no top-division national title.", 87, "Notre Dame"),
  cfb("chris-petersen-cfb", "Chris Petersen", "2× unbeaten Boise State · CFP at Washington", 85, "Elite program building and tactical reputation across Boise State and Washington.", 68, "Boise State"),
  cfb("gary-patterson-cfb", "Gary Patterson", "181 wins · TCU", 84, "Transformed TCU across conference levels and sustained elite defensive/program performance.", 2628, "TCU"),
  cfb("kyle-whittingham-cfb", "Kyle Whittingham", "Utah icon · 2 Pac-12 titles", 83, "Exceptional longevity, development and overachievement while moving Utah into power-conference contention.", 254, "Utah"),
  cfb("mark-richt-cfb", "Mark Richt", "171 wins · 2 SEC titles", 82, "Long high-level consistency and program stability without a national championship finish.", 61, "Georgia"),
  cfb("lincoln-riley-cfb", "Lincoln Riley", "multiple conference titles · 3 CFP trips", 81, "Elite quarterback/offensive development and early conference dominance, offset by defensive and postseason limitations.", 201, "Oklahoma"),
  cfb("dan-mullen-cfb", "Dan Mullen", "Mississippi State rise · SEC title-game trip at Florida", 74, "Strong offensive development and several high-end seasons without sustained championship contention.", 57, "Florida"),
  cfb("tom-herman-cfb", "Tom Herman", "AAC title · 4 winning seasons at Texas", 68, "Strong Houston peak and competent Texas tenure without developing into sustained national contention.", 251, "Texas"),
  cfb("charlie-strong-cfb", "Charlie Strong", "2 Louisville top-15 finishes · 16–21 at Texas", 56, "Excellent Louisville peak partially offsets a major failure to sustain winning at Texas.", 251, "Texas"),
  cfb("chad-morris-cfb", "Chad Morris", "4–18 at Arkansas", 22, "Offensive reputation did not translate to FBS head-coaching results, including a winless SEC tenure at Arkansas.", 8, "Arkansas"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const collegeProgramEras = [
  cfb("alabama-2009-2020", "Alabama 2009–2020", "6 national titles · 8 title-game appearances", 100, "Benchmark modern dynasty with unmatched championship volume, duration and week-to-week dominance.", 333, "Alabama"),
  cfb("georgia-2021-2024", "Georgia 2021–2024", "2 national titles · 4 elite seasons", 98, "Back-to-back titles and sustained top-tier dominance over a compact four-year run.", 61, "Georgia"),
  cfb("usc-2002-2008", "USC 2002–2008", "2 national titles · 7 straight top-4 finishes", 97, "Era-defining peak with championships, Heisman talent and extraordinary sustained national relevance.", 30, "USC"),
  cfb("miami-2000-2003", "Miami 2000–2003", "1 national title · 46–4", 96, "Overwhelming talent and peak dominance with a title and near-repeat during a short historic run.", 2390, "Miami"),
  cfb("clemson-2015-2020", "Clemson 2015–2020", "2 national titles · 6 straight CFP trips", 96, "Six-year playoff run with two titles and multiple historically elite teams.", 228, "Clemson"),
  cfb("ohio-state-2012-2024", "Ohio State 2012–2024", "2 national titles · sustained top-five contention", 95, "Rare floor of national relevance across coaching changes, capped by titles in 2014 and 2024.", 194, "Ohio State"),
  cfb("michigan-2021-2024", "Michigan 2021–2024", "2023 national title · 3 straight CFP trips", 94, "Three-year championship ascent plus a strong transition season created a compact elite run.", 130, "Michigan"),
  cfb("texas-2004-2009", "Texas 2004–2009", "2005 national title · 69–9", 93, "Six-year elite run with a championship, another title-game trip and sustained top-tier play.", 251, "Texas"),
  cfb("florida-2006-2009", "Florida 2006–2009", "2 national titles · Tebow era", 92, "Two titles and a dominant four-year peak with elite offense, defense and award-level talent.", 57, "Florida"),
  cfb("oklahoma-2000-2008", "Oklahoma 2000–2008", "2000 national title · 4 title-game appearances", 91, "Long conference domination and repeated championship contention with one title.", 201, "Oklahoma"),
  cfb("lsu-2003-2007", "LSU 2003–2007", "2 national titles", 90, "Two championships under two coaches in a five-year SEC peak.", 99, "LSU"),
  cfb("oregon-2009-2014", "Oregon 2009–2014", "2 title-game trips · 5 conference titles", 88, "Nationally defining offensive era with sustained elite records but no championship finish.", 2483, "Oregon"),
  cfb("boise-state-2006-2011", "Boise State 2006–2011", "73–6 · 2 BCS bowl wins", 84, "Extraordinary dominance and signature major-bowl wins outside the power-conference structure.", 68, "Boise State"),
  cfb("texas-2010-2016", "Texas 2010–2016", "46–42 · one 9-win season", 44, "A famous post-title collapse with repeated instability and only brief recovery flashes.", 251, "Texas"),
  cfb("nebraska-2015-2022", "Nebraska 2015–2022", "no ranked finishes · repeated losing seasons", 28, "Long stretch of recognizable underachievement without a conference title or sustained winning peak.", 158, "Nebraska"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const collegeQuarterbackDepth = [
  cfb("jake-fromm-career", "Jake Fromm", "Georgia · 36–7 as starter", 78, "Three strong seasons, an SEC title and a national-title-game trip without an individual award-level peak.", 61, "Georgia"),
  cfb("shea-patterson-career", "Shea Patterson", "Ole Miss / Michigan · 8,800+ pass yards", 68, "Productive multi-year starter career with limited championship or award-level impact.", 130, "Michigan"),
  cfb("christian-hackenberg-career", "Christian Hackenberg", "Penn State · 8,457 pass yards", 58, "Three-year starter with meaningful volume but declining efficiency and little team-level ceiling.", 213, "Penn State"),
  cfb("dj-uiagalelei-career", "DJ Uiagalelei", "Clemson / Oregon State / Florida State", 55, "Long starting career with flashes and volume but persistent inconsistency relative to elite expectations.", 228, "Clemson"),
  cfb("tate-martell-career", "Tate Martell", "Ohio State / Miami · 1 career start", 18, "High-profile recruit whose college career produced almost no sustained starting value.", 194, "Ohio State"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const collegeProgramDepth = [
  cfb("penn-state-program", "Penn State", "Since 2000 · multiple Big Ten titles / CFP-era contenders", 79, "Sustained modern relevance and strong peaks without a national championship since 2000.", 213, "Penn State"),
  cfb("wisconsin-program", "Wisconsin", "Since 2000 · 6 conference-title-game era peaks", 76, "Long consistency and player development with limited national-title ceiling.", 275, "Wisconsin"),
  cfb("tcu-program", "TCU", "Since 2000 · 2022 title-game run", 75, "Major rise across conferences with multiple elite seasons and a championship-game appearance.", 2628, "TCU"),
  cfb("tennessee-program", "Tennessee", "Since 2000 · early-2000s success + modern revival", 74, "Recognizable high-end peaks separated by a long period of instability and underachievement.", 2633, "Tennessee"),
  cfb("nebraska-program", "Nebraska", "Since 2000 · no national-title-game appearances", 58, "Strong early-2000s residue and fanbase stature offset by a prolonged modern decline.", 158, "Nebraska"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const collegeTeamSeasonDepth = [
  cfb("2025-indiana", "2025 Indiana", "16–0 · national champion", 99, "Perfect 16–0 championship season with wins over elite competition and one of the greatest turnarounds in sport history.", 84, "Indiana"),
  cfb("2022-tcu", "2022 TCU", "13–2 · national runner-up", 84, "Remarkable undefeated regular-season run and CFP semifinal win, discounted by multiple close escapes and the title-game blowout.", 2628, "TCU"),
  cfb("2014-florida-state", "2014 Florida State", "13–1 · CFP semifinalist", 82, "Undefeated regular season and defending-champion resilience, but repeated close calls and a decisive semifinal loss lower the dominance score.", 52, "Florida State"),
  cfb("2012-usc", "2012 USC", "7–6 · preseason No. 1", 48, "High-end talent and huge expectations collapsed into a six-loss season, making this a famous below-expectation team.", 30, "USC"),
  cfb("2010-texas", "2010 Texas", "5–7 · missed a bowl", 35, "One year after a title-game trip, Texas fell below .500 with major offensive regression.", 251, "Texas"),
  cfb("2022-texas-am", "2022 Texas A&M", "5–7 · preseason No. 6", 25, "Elite recruiting and preseason expectations produced a losing season and one of the era's clearest talent-to-results failures.", 245, "Texas A&M"),
] as const satisfies readonly FootballComparisonDepthItem[];

export const legacyCfbRatingBasis: Readonly<Record<string, string>> = {
  "cam-newton-2010": "One-year college career reached the absolute ceiling: Heisman, undefeated season, national title and extraordinary dual-threat dominance.",
  "joe-burrow-2019": "Historic final-season production, Heisman dominance and a 15–0 national championship run.",
  "vince-young-2005": "All-time dual-threat peak, undefeated championship finish and multi-year elite Texas career.",
  "tim-tebow-2007": "Heisman peak plus multi-year championship-era production and rare rushing/scoring value.",
  "lamar-jackson-2016": "Heisman peak and unprecedented rushing/passing production, with less team accomplishment than the very top careers.",
  "matt-leinart-2004": "Heisman winner and centerpiece of USC's dominant championship-era run with elite multi-year production.",
  "baker-mayfield-2017": "Heisman peak, elite efficiency and sustained conference-title contention across multiple seasons.",
  "trevor-lawrence-2018": "National-title freshman peak and extraordinary 34–2 starter record, balanced by fewer individual awards than peers above.",
  "marcus-mariota-2014": "Heisman winner with elite efficiency, dual-threat scoring and a national-title-game appearance.",
  "johnny-manziel-2012": "Transformative Heisman peak and huge production with less championship/team accomplishment than the inner-circle careers.",
  "colt-mccoy-2008": "Exceptional longevity, 45 wins and elite efficiency with a title-game trip but no Heisman or championship as starter.",
  "sam-bradford-2008": "Heisman peak and record-level passing production with strong team success but a shorter college runway.",
  "caleb-williams-2022": "Heisman-winning individual peak and elite playmaking across Oklahoma/USC without championship-level team accomplishment.",
  "bryce-young-2021": "Heisman peak, championship-game appearance and high-end efficiency over a shorter starting career.",
  "jameis-winston-2013": "Undefeated Heisman/national-title peak with a shorter career and less sustained dominance after the championship season.",
  "alabama-program": "Six national titles since 2000 plus unmatched sustained championship contention define the benchmark modern program.",
  "ohio-state-program": "Three national titles since 2000 and extraordinary year-to-year contention across multiple coaches.",
  "georgia-program": "Back-to-back titles and a sustained modern elite run overcome a slower first half of the 2000-present window.",
  "lsu-program": "Three national titles under multiple coaches with repeated elite peaks but less season-to-season consistency than the top three.",
  "clemson-program": "Two titles and a six-year CFP-era peak transformed the program into a modern national power.",
  "oklahoma-program": "One title, repeated title-game/CFP appearances and long conference dominance with limited championship conversion.",
  "usc-program": "Historically dominant 2000s peak with championships, offset by a long uneven stretch afterward.",
  "florida-program": "Two titles and multiple elite peaks, balanced by significant post-2010 volatility.",
  "texas-program": "2005 championship, another title-game trip and modern CFP return, offset by the long 2010s downturn.",
  "florida-state-program": "2013 title and multiple elite stretches with a pronounced late-2010s decline.",
  "michigan-program": "2023 championship and recent CFP peak add to strong long-term winning, despite a less dominant first two decades of the window.",
  "oregon-program": "Multiple title-game trips and sustained conference relevance without a national championship.",
  "auburn-program": "2010 championship, 2013 title-game trip and other high-end peaks with substantial volatility.",
  "miami-program": "2001 championship and historic early-2000s peak, followed by two decades without comparable national contention.",
  "notre-dame-program": "Strong sustained relevance and multiple playoff/title-game appearances without a modern national championship.",
  "2001-miami": "Undefeated champion with overwhelming talent, dominance and one of the strongest single-season résumés ever.",
  "2019-lsu": "15–0 champion with an elite schedule, record-setting offense and dominant postseason wins.",
  "2020-alabama": "13–0 champion with historic offensive efficiency against an all-power-conference schedule.",
  "2005-texas": "13–0 champion with elite balance and an iconic title-game win over another all-time team.",
  "2004-usc": "13–0 champion that combined sustained dominance with a lopsided national-title performance.",
  "2018-clemson": "15–0 champion with elite two-way play and a dominant title-game win over Alabama.",
  "2013-florida-state": "14–0 champion with massive point differential and elite talent, tested only late in the title game.",
  "2022-georgia": "15–0 repeat champion with dominant defense/offense balance and a historic title-game blowout.",
  "2008-florida": "13–1 champion with elite efficiency and a strong SEC/title-game path, docked for the regular-season loss.",
  "2010-auburn": "14–0 champion driven by an all-time quarterback season, with several close games lowering dominance slightly.",
  "2014-ohio-state": "14–1 champion with a third-string-QB postseason run and elite late-season peak.",
  "2023-michigan": "15–0 champion with elite defense and postseason wins over Alabama/Washington, balanced by a narrower offensive ceiling.",
  "2009-alabama": "14–0 champion and start of a dynasty, with excellent balance but less overwhelming efficiency than later all-time teams.",
  "2002-ohio-state": "14–0 champion with an iconic title win, but many close games reduce the dominance component.",
  "2000-oklahoma": "13–0 champion with excellent schedule accomplishment and defense, though less dominant statistically than later benchmarks.",
};

export const footballComparisonDepthItems = [
  ...nflTightEnds,
  ...nflDefensiveCareers,
  ...nflQuarterbackSeasons,
  ...nflTeamSeasons,
  ...collegeHeadCoaches,
  ...collegeProgramEras,
  ...collegeQuarterbackDepth,
  ...collegeProgramDepth,
  ...collegeTeamSeasonDepth,
] as const;
