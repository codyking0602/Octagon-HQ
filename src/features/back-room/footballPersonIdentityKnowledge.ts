import type { FootballFactSource } from "./footballFactualStatsCore";
import { getFootballSubject } from "./footballSubjectRegistry";

export type FootballPersonIdentityKnowledgeClass = "distinctive-identity";
export type FootballPersonIdentityVerification = "verified";

/**
 * Source-backed person knowledge belongs to the canonical football back-room domain, not a game.
 * `conceptId` is deliberately separate from wording so one underlying idea cannot be counted
 * multiple times through paraphrases. Tags are open metadata discovered after research rather
 * than a checklist of required schema fields.
 */
export interface FootballPersonIdentityFact {
  factId: string;
  conceptId: string;
  knowledgeClass: FootballPersonIdentityKnowledgeClass;
  verification: FootballPersonIdentityVerification;
  value: string;
  sourceIds: readonly string[];
  tags?: readonly string[];
}

export interface FootballPersonIdentityKnowledgeRecord {
  subjectId: string;
  facts: readonly FootballPersonIdentityFact[];
}

const REVIEWED_ON = "2026-09-09";

const source = (
  id: string,
  publisher: string,
  title: string,
  url: string,
  coverage: string,
): FootballFactSource => ({ id, publisher, title, url, reviewedOn: REVIEWED_ON, coverage });

export const footballPersonIdentityKnowledgeSources: readonly FootballFactSource[] = [
  source("identity-mahomes-texas-tech-baseball", "Texas Tech Athletics", "Patrick Mahomes II - Baseball", "https://texastech.com/sports/baseball/roster/patrick-mahomes-ii/40", "Patrick Mahomes high-school multi-sport background, baseball draft, family baseball background, and prep accomplishments."),
  source("identity-mahomes-texas-tech-2015-media", "Texas Tech Athletics", "2015 Texas Tech Baseball Media Supplement", "https://texastech.com/documents/download/2016/6/8/BB2015MediaSupplement.pdf", "Patrick Mahomes family baseball relationships, including Pat Mahomes and godfather LaTroy Hawkins."),
  source("identity-mahomes-mlb-baseball-past", "MLB.com", "Patrick Mahomes' baseball past, explained", "https://www.mlb.com/news/patrick-mahomes-baseball-past-explained", "Patrick Mahomes childhood around Major League clubhouses and baseball development."),
  source("identity-mahomes-chiefs-two-sport-choice", "Kansas City Chiefs", "Chiefs QB Patrick Mahomes II's Father Proud of His Son's Gamble on Himself", "https://www.chiefs.com/news/chiefs-qb-patrick-mahomes-ii-s-father-proud-of-his-son-s-gamble-on-hims-18795781", "Patrick Mahomes choosing Texas Tech football and baseball, then committing full time to football."),
  source("identity-barry-osu-all-americans", "Oklahoma State Athletics", "OSU Football All-Americans", "https://okstate.com/news/2006/7/6/OSU_Football_All_Americans", "Barry Sanders as Thurman Thomas' backup, return specialist, 1988 starter, records, and early NFL departure."),
  source("identity-barry-hof-born-to-run", "Pro Football Hall of Fame", "Sanders: Born to Run", "https://www.profootballhof.com/news/sanders-born-to-run", "Barry Sanders high-school running-back opportunity and William Sanders' Hall of Fame introduction."),
  source("identity-barry-osu-statue", "Oklahoma State Athletics", "Barry Sanders Statue to be Unveiled Nov. 13", "https://okstate.com/news/2021/11/7/football-barry-sanders-statue-to-be-unveiled-nov-13", "Barry Sanders Oklahoma State statue, Ring of Honor, and No. 21 recognition."),
  source("identity-rice-upi-bricks", "United Press International", "San Francisco 49ers wide receiver Jerry Rice learned his craft the hard way", "https://www.upi.com/Archives/1986/01/08/San-Francisco-49ers-wide-receiver-Jerry-Rice-learned-his/8232505544400/", "Jerry Rice childhood work with his brick-mason father and catching bricks."),
  source("identity-rice-nfl-appreciation", "NFL.com", "There will never be another Jerry Rice", "https://www.nfl.com/news/there-will-never-be-another-jerry-rice-0ap3000000860774", "Jerry Rice high-school football origin and San Francisco draft trade-up."),
  source("identity-rice-hof-draft", "Pro Football Hall of Fame", "The Drafting of the 2010 Class - Jerry Rice", "https://www.profootballhof.com/news/the-drafting-of-the-2010-class-jerry-rice", "Jerry Rice recruiting path, Archie Cooley evaluation, and Mississippi Valley State records."),
  source("identity-rice-49ers-hill", "San Francisco 49ers", "Fitness Corner: Gore Running Uphill", "https://www.49ers.com/news/fitness-corner-gore-running-uphill-549387", "Jerry Rice learning and using the Edgewood Park hill workout with Roger Craig."),
  source("identity-belichick-wesleyan-hof", "Wesleyan University Athletics", "Bill Belichick '75", "https://athletics.wesleyan.edu/honors/hall-of-fame-inductees/bill-belichick-75/16?path=strengthc", "Bill Belichick's father coaching at Navy, three-sport Wesleyan career, and immediate post-college NFL entry."),
  source("identity-belichick-nfl-annapolis", "NFL.com", "Bill Belichick to receive key to City of Annapolis", "https://www.nfl.com/_amp/bill-belichick-to-receive-key-to-city-of-annapolis-0ap3000001105183", "Bill Belichick's Annapolis and Naval Academy upbringing, father's Navy tenure, early football education, and preference for lacrosse."),
  source("identity-belichick-nfl-scouting", "NFL.com", "Deep dive into the wild history of the high-stakes world of modern scouting", "https://www.nfl.com/news/the-history-of-scouting", "Bill Belichick learning film and scouting organization from his father Steve and Steve Belichick's scouting-method influence."),
  source("identity-belichick-wesleyan-alumni", "Wesleyan University", "Best of Wes: Alumni in Sports", "https://newsletter.blogs.wesleyan.edu/2020/04/18/best-of-wes-alumni-in-sports/", "Bill Belichick's economics major, three-sport letters, and lacrosse captaincy at Wesleyan."),
  source("identity-belichick-patriots-1975", "New England Patriots", "Bill Belichick Press Conference (Part two)", "https://www.patriots.com/news/bill-belichick-press-conference-part-two-120931", "Bill Belichick's unpaid start with the 1975 Baltimore Colts and subsequent $25-per-week pay."),
  source("identity-kelce-nfl-brothers", "NFL.com", "Super Kelce Bros: Jason, Travis shaped by Cleveland Heights, University of Cincinnati and Andy Reid", "https://www.nfl.com/news/super-kelce-bros-jason-travis-shaped-by-cleveland-heights-university-of-cincinna", "Jason Kelce preferred walk-on path, position changes, upbringing, and Travis Kelce following him to Cincinnati."),
  source("identity-kelce-cincinnati-roster", "University of Cincinnati Athletics", "Jason Kelce - 2009 Football Roster", "https://gobearcats.com/sports/football/roster/season/2009/player/jason-kelce", "Jason Kelce scout-team award, high-school linebacker/running-back production, and Travis as a Bearcats teammate."),
  source("identity-kelce-cincinnati-hof", "University of Cincinnati Athletics", "Jason Kelce Selected for Cincinnati Athletics' 50th Anniversary Hall of Fame Class", "https://gobearcats.com/news/2026/08/13/jason-kelce-selected-for-cincinnati-athletics-50th-anniversary-hall-of-fame-class", "Jason Kelce facing Travis in Super Bowl LVII and co-hosting New Heights."),
  source("identity-donald-nfl-family", "NFL.com", "Aaron Donald's family: Rams star changed, grew in chase for Super Bowl title", "https://www.nfl.com/news/aaron-donald-s-family-rams-star-changed-grew-in-chase-for-super-bowl-title", "Aaron Donald's father introducing disciplined morning weight training during childhood."),
  source("identity-donald-pitt-roster", "Pitt Athletics", "Aaron Donald - Football", "https://pittsburghpanthers.com/sports/football/roster/aaron-donald/1442", "Aaron Donald high-school offensive-guard experience and brother Archie playing linebacker at Toledo."),
  source("identity-donald-pitt-jersey", "Pitt Athletics", "Pitt to Retire Aaron Donald's No. 97 Jersey", "https://pittsburghpanthers.com/news/2025/9/22/football-97-announcement", "Aaron Donald's freshman scout-team practice changing Pitt's redshirt plan."),
  source("identity-donald-nfl-degree", "NFL.com", "Aaron Donald not concerned about being ready for start of season", "https://www.nfl.com/news/aaron-donald-not-concerned-about-being-ready-for-start-of-season", "Aaron Donald completing his Pitt communications degree to fulfill a promise to his parents."),
  source("identity-donald-pitt-donation", "University of Pittsburgh", "Pitt unveiled the new Aaron Donald Football Performance Center, supported by a historic gift", "https://www.pittwire.pitt.edu/pittwire/accolades-honors/aaron-donald-football-performance-center-unveiled-supported-historic-gift", "Aaron Donald's seven-figure Pitt gift and the football performance center named for him."),
  source("identity-taylor-unc-patterson", "University of North Carolina Athletics", "Lawrence Taylor - Patterson Medal Winners", "https://goheels.com/honors/hall-of-fame/lawrence-taylor/80", "Lawrence Taylor's 1980 UNC season and game-saving plays against Texas Tech and Clemson."),
  source("identity-taylor-virginia-hof", "Virginia Sports Hall of Fame", "Lawrence Taylor", "https://vasportshof.com/inductee/lawrence-taylor/", "Lawrence Taylor redefining linebacker attack style and playing through a torn shoulder/pectoral injury in 1988."),
  source("identity-lewis-miami-hof", "University of Miami Sports Hall of Fame", "Ray Lewis", "https://www.umsportshalloffame.com/ray-lewis.html", "Ray Lewis receiving Miami's final available 1993 scholarship and starting as a true freshman."),
  source("identity-lewis-pro-hof", "Pro Football Hall of Fame", "Class of 2018 Finalist Spotlight: Ray Lewis", "https://www.profootballhof.com/news/class-of-2018-finalist-spotlight-ray-lewis", "Ray Lewis as the Ravens' second-ever draft choice and a 17-year one-franchise player."),
  source("identity-lewis-miami-community", "University of Miami Athletics", "Super Bowl Champion Ray Lewis Joining ESPN", "https://miamihurricanes.com/news/2013/03/14/206758365-2/", "Ray Lewis' foundation, mentoring, and Baltimore's Ray Lewis Way honor for charitable work."),
  source("identity-deion-fsu-hof", "Florida State Athletics", "Deion Sanders - Florida State Athletics Hall of Fame", "https://seminoles.com/honors/florida-state-athletics-hall-of-fame/deion-sanders/99", "Deion Sanders competing in football, baseball, and track at Florida State and being drafted in both football and baseball."),
  source("identity-deion-mlb-career", "MLB.com", "Deion Sanders' baseball career", "https://www.mlb.com/reds/news/deion-sanders-baseball-career", "Deion Sanders' MLB career, same-day NFL/NLCS attempt, and World Series/Super Bowl distinction."),
  source("identity-deion-espn-classic", "ESPN", "Where Sanders goes, teams win", "https://www.espn.com/classic/biography/s/Sanders_Deion.html", "Deion Sanders high-school three-sport All-State background and Prime Time identity."),
  source("identity-payton-mississippi-encyclopedia", "Mississippi Encyclopedia", "Walter Payton", "https://mississippiencyclopedia.org/entries/walter-payton/", "Walter Payton preferring marching-band drums before football, following brother Eddie, and scoring on his first play."),
  source("identity-payton-bears-hbcu", "Chicago Bears", "Bears have unearthed star players from HBCUs", "https://www.chicagobears.com/news/bears-have-unearthed-star-players-from-hbcus", "Walter Payton choosing Jackson State amid limited SEC recruiting of Black players and earning a communications degree."),
  source("identity-payton-hof-bittersweet", "Pro Football Hall of Fame", "Bittersweet", "https://www.profootballhof.com/news/bittersweet", "Walter Payton following Eddie to Jackson State, earning his degree quickly, and acquiring the Sweetness nickname there."),
  source("identity-unitas-pro-hof", "Pro Football Hall of Fame", "Johnny Unitas", "https://www.profootballhof.com/players/johnny-unitas", "Johnny Unitas being cut by Pittsburgh, playing semi-pro for $6, earning a Colts tryout, and throwing a pick-six on his first NFL pass."),
  source("identity-unitas-hof-high-tops", "Pro Football Hall of Fame", "Top 10 Artifacts of Inspiration", "https://www.profootballhof.com/news/top-10-artifacts-of-inspiration", "Johnny Unitas construction work, semi-pro path, Colts contract, and iconic black high-top shoes."),
  source("identity-unitas-la-times", "Los Angeles Times", "A Crew Cut Above", "https://www.latimes.com/archives/la-xpm-2002-sep-12-sp-unitas12-story.html", "Johnny Unitas construction work and the fan letter that helped prompt his Baltimore opportunity."),
  source("identity-walsh-nfl-obituary", "NFL.com / Associated Press", "Hall of Fame coach Bill Walsh, who won three Super Bowls with the 49ers, dead at 75", "https://www.nfl.com/news/hall-of-fame-coach-bill-walsh-who-won-three-super-bowls-with-th-09000d5d8012ecbb", "Bill Walsh playing/boxing at San Jose State, starting at Washington High School, and being hired by Marv Levy."),
  source("identity-walsh-nfl-bio", "NFL.com", "Bill Walsh's bio", "https://www.nfl.com/news/bill-walsh-s-bio-09000d5d80086d95", "Bill Walsh's coaching path, Cincinnati offensive development, coaching tree, and late first NFL head-coaching opportunity."),
  source("identity-walsh-ohio-river", "NFL.com", "Chronicles of offensive football in the Ohio River region", "https://www.nfl.com/news/the-ohio-river-offense", "The Cincinnati origin and problem-solving evolution of Bill Walsh's offense later called the West Coast offense."),
  source("identity-walsh-pro-hof", "Pro Football Hall of Fame", "Bill Walsh", "https://www.profootballhof.com/players/bill-walsh", "Bill Walsh becoming an NFL head coach at 47 and taking a 2-14 49ers team to its first NFL title within three years."),
  source("identity-brady-patriots-draft", "New England Patriots", "Tom Brady - Draft Bio", "https://www.patriots.com/news/tom-brady-draft-bio-111106", "Tom Brady's Serra baseball path, Expos selection, Michigan redshirt/depth-chart path, Drew Henson split, and Orange Bowl finale."),
  source("identity-brady-patriots-bio", "New England Patriots", "Tom Brady Bio", "https://www.patriots.com/news/tom-brady-bio", "Tom Brady's Michigan backup role during the 1997 national championship season and high-school sports background."),
  source("identity-manning-tennessee-academic", "Tennessee Athletics", "Manning Selected for Academic All-America Hall of Fame", "https://utsports.com/news/2018/4/23/football-manning-selected-for-academic-all-america-hall-of-fame", "Peyton Manning's Academic All-America record, early graduation eligibility, senior-year return, and 1997 SEC title."),
  source("identity-manning-tennessee-hof", "Tennessee Athletics", "Manning Inducted into College Football Hall of Fame", "https://utsports.com/news/2017/12/5/manning-inducted-into-college-football-hall-of-fame", "Peyton Manning and Archie Manning becoming the first father-son player duo in the College Football Hall of Fame."),
  source("identity-rodgers-cal-bio", "California Athletics", "Aaron Rodgers Bio", "https://calbears.com/sports/2013/4/17/208198625.aspx", "Aaron Rodgers' Butte College season, transfer, Cal starting path, and Big Game performance."),
  source("identity-rodgers-nfl-draft", "NFL.com", "The inside story behind Aaron Rodgers' freefall at the 2005 NFL Draft", "https://www.nfl.com/news/the-inside-story-behind-aaron-rodgers-freefall-at-the-2005-nfl-draft", "Aaron Rodgers' long 2005 draft-room wait and Green Bay selection at No. 24."),
  source("identity-brees-nfl-texas", "NFL.com", "Drew Brees, Matthew Stafford show Texas influence on NFL", "https://www.nfl.com/news/drew-brees-matthew-stafford-show-texas-influence-on-nfl-0ap1000000058501", "Drew Brees' multi-sport background, Westlake career, 83-pass game, and Texas recruiting path."),
  source("identity-brees-purdue", "Purdue Athletics", "Drew Brees", "https://purduesports.com/drewbrees-drewbrees-html", "Drew Brees' Westlake record and Purdue-era Cool Brees and Hurricane Drew nicknames."),
  source("identity-montana-notre-dame-heart", "Notre Dame Athletics", "Strong of Heart: Joe Montana", "https://fightingirish.com/news/2011/02/23/strong-of-heart-joe-montana-2", "Joe Montana's homesick freshman year, seven-quarterback room, and depth-chart path."),
  source("identity-montana-notre-dame-comeback", "Notre Dame Athletics", "Fighting Irish host Wolverines", "https://fightingirish.com/news/2002/09/09/no-20-21-fighting-irish-host-no-7-6-wolverines", "Joe Montana's Comeback Kid identity and 1977 Purdue/Clemson comebacks."),
  source("identity-montana-notre-dame-cotton", "Notre Dame Athletics", "Montana tapped for Cotton Bowl Hall of Fame", "https://fightingirish.com/news/2010/01/02/haines-montana-tapped-for-cotton-bowl-hall-of-fame", "Joe Montana's 1978 Cotton Bowl national-title win and 1979 Chicken Soup Game comeback."),
  source("identity-marino-pitt-hof", "Pitt Athletics", "Dan Marino Elected to College Football Hall of Fame", "https://pittsburghpanthers.com/news/2002/5/7/Dan_Marino_Elected_to_College_Football_Hall_of_Fame", "Dan Marino's Pittsburgh upbringing, freshman breakthrough, and signature Pitt moments."),
  source("identity-marino-mlb", "MLB.com", "NFL, NBA players drafted by MLB teams", "https://www.mlb.com/news/nfl-nba-players-drafted-by-mlb-teams", "Dan Marino's high-school baseball performance and Kansas City Royals draft selection."),
  source("identity-elway-mlb", "MLB.com", "NFL, NBA players drafted by MLB teams", "https://www.mlb.com/news/nfl-nba-players-drafted-by-mlb-teams", "John Elway's Royals/Yankees draft history, Oneonta minor-league performance, and baseball leverage."),
  source("identity-elway-yankees", "MLB.com / New York Yankees", "All-time Yankees top draft picks", "https://www.mlb.com/yankees/news/all-time-yankees-top-draft-picks", "John Elway's 1981 Yankees selection and Class A Oneonta baseball season."),
  source("identity-emmitt-florida-great", "Florida Athletics", "Gator Greats: Emmitt Smith", "https://floridagators.com/news/2006/8/25/10799", "Emmitt Smith's too-small/too-slow skepticism and rapid Florida record-setting career."),
  source("identity-emmitt-florida-record", "Florida Athletics", "Emmitt Smith Sets NFL Rushing Record", "https://floridagators.com/news/2002/10/27/4825", "Emmitt Smith's Escambia high-school production and record-setting freshman arrival at Florida."),
  source("identity-emmitt-florida-early", "Florida Athletics", "Mullen's Message to Underclassmen: Get Educated on NFL Draft", "https://floridagators.com/news/2019/11/20/football-mullen-seeks-to-educate-gators-underclassmen", "Emmitt Smith becoming Florida's first early NFL Draft entrant when the underclassman rule changed."),
  source("identity-peterson-ou-awards", "Oklahoma Athletics", "Peterson named finalist", "https://soonersports.com/news/2004/12/4/208394881", "Adrian Peterson's A.D. nickname and freshman 100-yard streak."),
  source("identity-peterson-ou-freshman", "Oklahoma Athletics", "Peterson freshman season", "https://soonersports.com/news/2005/1/3/208393611", "Adrian Peterson's early depth-chart path and freshman breakthrough."),
  source("identity-peterson-ou-recruiting", "Oklahoma Athletics", "Oklahoma Football Signing Day", "https://soonersports.com/news/2004/2/5/208389424", "Adrian Peterson's multi-sport prep background and U.S. Army All-American commitment context."),
  source("identity-lt-tcu-legacy", "TCU Athletics", "Tomlinson's Legacy Lingers at TCU", "https://gofrogs.com/news/2014/10/2/Tomlinson_s_Legacy_Lingers_at_TCU", "LaDainian Tomlinson's Waco-to-TCU path, 406-yard game, and 2,000-yard season."),
  source("identity-lt-tcu-community", "TCU Athletics", "LT to be featured on 60 Minutes", "https://gofrogs.com/news/2007/12/8/LT_to_be_featured_on_60_Minutes", "LaDainian Tomlinson's Chargers ticket program and community work."),
  source("identity-lt-tcu-retirement", "TCU Athletics", "LT Announces Retirement From The NFL", "https://gofrogs.com/news/2012/6/18/LT_Announces_Retirement_From_The_NFL", "LaDainian Tomlinson's one-day Chargers retirement and TCU legacy."),
  source("identity-faulk-sdsu-history", "San Diego State Athletics", "A Look Back at This Week in Aztec Athletics History", "https://goaztecs.com/news/2020/09/14/a-look-back-at-this-week-in-aztec-athletics-history-3", "Marshall Faulk's third-string freshman start and 386-yard, seven-touchdown second game."),
  source("identity-faulk-sdsu-hof", "San Diego State Athletics", "Marshall Faulk - Aztec Hall of Fame Inductee", "https://goaztecs.com/news/1999/07/15/marshall-faulk-aztec-hall-of-fame-inductee", "Marshall Faulk's freshman national firsts, retired No. 28, and first-year Hall of Fame induction."),
  source("identity-brown-syracuse", "Syracuse Athletics", "Football Legend Jim Brown '57 Passes Away", "https://cuse.com/news/2023/5/19/football-legend-jim-brown-57-passes-away", "Jim Brown's five-sport high-school background, four-sport Syracuse career, lacrosse excellence, military service, and Amer-I-Can work."),
  source("identity-moss-marshall-hof", "Marshall Athletics", "Randy Moss - Marshall Athletics Hall of Fame", "https://herdzone.com/honors/marshall-athletics-hall-of-fame/randy-moss/162", "Randy Moss' high-school basketball/football honors, Marshall track titles, 15-0 championship season, and football awards."),
  source("identity-calvin-tech-hof", "Georgia Tech Athletics", "Hall of Fame Profile: Calvin Johnson", "https://ramblinwreck.com/news/2016/08/24/hall-of-fame-profile-calvin-johnson", "Calvin Johnson's 42-inch vertical, Butterfingers origin, hand training, and high-school growth spurt."),
  source("identity-calvin-tech-bio", "Georgia Tech Athletics", "Calvin Johnson", "https://ramblinwreck.com/calvin-johnson-2/", "Calvin Johnson's long baseball background and Georgia Tech baseball interest."),
  source("identity-owens-utc-socon", "Chattanooga Athletics", "Owens Inducted Into the SoCon Hall of Fame", "https://gomocs.com/news/2020/6/11/football-owens-inducted-into-the-socon-hall-of-fame", "Terrell Owens' three-sport college career, basketball championships, and Super Bowl injury return."),
  source("identity-owens-utc-hof", "Chattanooga Athletics", "Terrell Owens - Hall of Fame", "https://gomocs.com/honors/hall-of-fame/terrell-owens/88", "Terrell Owens' 20-game reception streak, basketball letters, and third-round draft path."),
  source("identity-fitzgerald-nfl-camp", "NFL.com", "Fitzgerald's star-studded camp preps players for NFL rigors", "https://www.nfl.com/news/fitzgerald-s-star-studded-camp-preps-players-for-nfl-rigors-09000d5d81900971", "Larry Fitzgerald's Vikings ball-boy background and exposure to Cris Carter and Randy Moss."),
  source("identity-fitzgerald-pitt-life", "Pitt Athletics", "NFL Network's A Football Life to feature Pitt star Larry Fitzgerald", "https://pittsburghpanthers.com/news/2017/11/8/nfl-networks-a-football-life-to-feature-pitt-star-larry-fitzgerald", "Larry Fitzgerald's Valley Forge Military Academy path, family loss, and off-field identity."),
  source("identity-fitzgerald-pitt-bio", "Pitt Athletics", "Larry Fitzgerald", "https://pittsburghpanthers.com/sports/general/roster/larry-fitzgerald/8662", "Larry Fitzgerald's breast-cancer awareness and international community work."),
  source("identity-mackey-hof", "Pro Football Hall of Fame", "John Mackey", "https://www.profootballhof.com/players/john-mackey", "John Mackey's running-back/fullback-to-tight-end path, long touchdowns, and Super Bowl V play."),
  source("identity-mackey-syracuse", "Syracuse Athletics", "Syracuse Legend John Mackey Passes Away", "https://cuse.com/news/2011/7/7/FB_0707110503", "John Mackey's Syracuse position background and the dementia struggle that helped inspire the 88 Plan."),
  source("identity-munoz-hof", "Pro Football Hall of Fame", "Anthony Munoz", "https://www.profootballhof.com/players/anthony-munoz", "Anthony Munoz's USC baseball championship role, knee injury, Rose Bowl return, and draft path."),
  source("identity-munoz-cfbhall", "National Football Foundation / College Football Hall of Fame", "Anthony Munoz - Hispanic Heritage Month", "https://www.cfbhall.com/news-and-happenings/blog/anthony-munoz-university-of-southern-california-usc-hispanic-heritage-month/", "Anthony Munoz's multisport background and transition from baseball toward football."),
  source("identity-thomas-wisconsin", "Wisconsin Athletics", "Joe Thomas", "https://uwbadgers.com/sports/2015/8/21/GEN_20140101585", "Joe Thomas' high-school multi-sport/two-way profile, Wisconsin TE/DE/OT path, and shot-put record."),
  source("identity-thomas-nfl-fishing", "NFL.com", "Draft roundup: Raiders take Russell No. 1", "https://www.nfl.com/news/draft-roundup-raiders-take-russell-no-1-09000d5d800218f6", "Joe Thomas spending 2007 draft day fishing instead of attending the New York ceremony."),
  source("identity-white-tennessee", "Tennessee Athletics", "Reggie White", "https://utsports.com/news/2003/8/15/Reggie_White", "Reggie White's ordained-minister identity, Chattanooga background, late prep publicity, and Tennessee breakthrough."),
  source("identity-white-tennessee-hof", "Tennessee Athletics", "White Prepares to Enter College Football Hall of Fame", "https://utsports.com/news/2003/8/7/White_Prepares_to_Enter_College_Football_Hall_Of_Fame.aspx", "Reggie White's Minister of Defense identity and Memphis Showboats path before the NFL."),
  source("identity-bruce-vt", "Virginia Tech Athletics", "Bruce Smith Named to College Football's All-Time All-America Team", "https://hokiesports.com/news/2019/12/26/bruce-smith-named-to-college-footballs-all-time-all-america-team", "Bruce Smith's late start in football, high-school rise, and unusual defensive-line speed."),
  source("identity-bruce-hof-speech", "Pro Football Hall of Fame", "Bruce Smith Enshrinement Speech Transcript", "https://www.profootballhof.com/news/bruce-smith-enshrinement-speech-transcript", "Bruce Smith's college conditioning transformation and signature training habits."),
  source("identity-greene-unt-origin", "North Texas Athletics", "The Origin Of The Mean Green", "https://meangreensports.com/sports/2018/7/6/trads-MeanGreen-html", "The verified distinction between North Texas' Mean Green nickname and Joe Greene's later Mean Joe nickname."),
  source("identity-greene-unt-hof", "North Texas Athletics", "Joe Greene - North Texas Athletics Hall of Fame", "https://meangreensports.com/honors/north-texas-athletics-hall-of-fame/joe-greene/2", "Joe Greene becoming North Texas' first first-round NFL draft pick."),
  source("identity-greene-steelers", "Pittsburgh Steelers", "Joe Greene", "https://www.steelers.com/history/bios/greene_joe", "Joe Greene's reaction to being drafted by Pittsburgh and role in the franchise culture change."),
  source("identity-greene-steelers-coke", "Pittsburgh Steelers", "Greene finally gets his award", "https://www.steelers.com/news/greene-finally-gets-his-award-1042395", "Joe Greene's iconic Coca-Cola commercial and advertising recognition."),
  source("identity-urlacher-unm", "University of New Mexico", "UNM's Brian Urlacher Inducted into Pro Football Hall of Fame", "https://news.unm.edu/news/unms-brian-urlacher-inducted-into-pro-football-hall-of-fame", "Brian Urlacher's Lobo Back role, three-way senior usage, and team-leading production."),
  source("identity-urlacher-nmaa", "New Mexico Activities Association", "Lovington High School Honors Brian Urlacher", "https://www.nmact.org/2019/10/lovington-high-school-honors-pro-football-hall-of-famer-brian-urlacher/", "Brian Urlacher's 14-0 Lovington title team and hometown field/facility legacy."),
  source("identity-butkus-illinois", "Illinois Athletics", "Illini Football Legend Dick Butkus Passes Away at 80", "https://fightingillini.com/news/2023/10/5/illini-football-legend-dick-butkus-passes-away-at-80", "Dick Butkus' Chicago/Illinois identity, two-way center-linebacker role, Rose Bowl team, and Heisman finish."),
  source("identity-butkus-illinois-number", "Illinois Athletics", "Football Retired Number - Dick Butkus", "https://fightingillini.com/sports/2016/9/14/football-retired-number-dick-butkus", "Dick Butkus' retired No. 50 and Butkus Award legacy."),
  source("identity-polamalu-usc-profile", "USC Athletics", "Sophomore Strong Safety Making The Most Of His Time At USC", "https://usctrojans.com/news/2000/9/25/Sophomore_Strong_Safety_Making_The_Most_Of_His_Time_At_USC_", "Troy Polamalu's Oregon State fandom, USC choice, and high-school two-way background."),
  source("identity-polamalu-usc-aa", "USC Athletics", "USC Safety Troy Polamalu Named All-American", "https://usctrojans.com/news/2001/11/28/usc_safety_troy_polamalu_named_all_american.aspx", "Troy Polamalu's special-teams and blocked-kick impact at USC."),
  source("identity-polamalu-usc-hof", "USC Athletics", "Troy Polamalu - USC Athletics Hall of Fame", "https://usctrojans.com/honors/usc-athletics-hall-of-fame/troy-polamalu/246", "Troy Polamalu's flowing-hair visual identity and shampoo advertising."),
  source("identity-reed-miami", "Miami Athletics", "Edward Reed", "https://miamihurricanes.com/roster/edward-reed/", "Ed Reed's safety-role change, injury toughness, Boston College lateral, special teams, and 2001 leadership."),
  source("identity-woodson-heisman", "Heisman Trophy Trust", "Charles Woodson", "https://www.heisman.com/heisman-winners/charles-woodson/", "Charles Woodson's Ohio Mr. Football background, Michigan dream-school path, offensive role, and two-way Heisman identity."),
  source("identity-woodson-hof", "Pro Football Hall of Fame", "Charles Woodson", "https://www.profootballhof.com/players/charles-woodson", "Charles Woodson entering Michigan's starting lineup as a freshman and high-school running-back identity."),
  source("identity-reid-byu", "BYU Athletics", "Andy Reid", "https://byucougars.com/sports/football/roster/player/andy-reid", "Andy Reid's high-school baseball, Glendale Junior College, BYU offensive-line, education, and graduate-assistant path."),
  source("identity-madden-hof", "Pro Football Hall of Fame", "One Man, Three Hall-Worthy Careers: John Madden", "https://www.profootballhof.com/news/one-man-three-hall-worthy-careers-john-madden-1936-2021", "John Madden's 21st-round Eagles selection, knee injury, Norm Van Brocklin film education, and teacher identity."),
  source("identity-madden-calpoly", "Cal Poly", "Remembering John Madden, Alumnus and Football Legend", "https://www.calpoly.edu/news/remembering-john-madden-alumnus-and-football-legend-dies-85", "John Madden's two-way line play, baseball background, and education degrees."),
  source("identity-shula-hof", "Pro Football Hall of Fame", "Don Shula 1930-2020", "https://www.profootballhof.com/news/don-shula-1930-2020", "Don Shula forging parental permission, early high-school coaching, seven-year defensive-back career, and age-33 head-coaching appointment."),
  source("identity-shula-browns", "Cleveland Browns", "Legendary Hall of Fame coach Don Shula began his playing career with the Browns", "https://www.clevelandbrowns.com/news/legendary-hall-of-fame-coach-don-shula-who-began-his-playing-career-with-the-bro", "Don Shula's Browns playing start and Ohio National Guard service during the Korean War era."),
] as const;

const fact = (
  factId: string,
  conceptId: string,
  value: string,
  sourceIds: readonly string[],
  tags: readonly string[] = [],
): FootballPersonIdentityFact => ({
  factId,
  conceptId,
  knowledgeClass: "distinctive-identity",
  verification: "verified",
  value,
  sourceIds,
  ...(tags.length ? { tags } : {}),
});

export const footballPersonIdentityKnowledgeRecords: readonly FootballPersonIdentityKnowledgeRecord[] = [
  {
    subjectId: "nfl-patrick-mahomes",
    facts: [
      fact("father-major-league-pitcher", "baseball-family-background", "His father, Pat Mahomes, pitched in Major League Baseball for 11 seasons across six organizations.", ["identity-mahomes-texas-tech-baseball"], ["family", "baseball"]),
      fact("latroy-hawkins-godfather", "major-league-godfather", "Longtime Major League pitcher LaTroy Hawkins, a former teammate of his father, is his godfather.", ["identity-mahomes-texas-tech-2015-media", "identity-mahomes-mlb-baseball-past"], ["family", "baseball"]),
      fact("three-sport-high-school-star", "high-school-three-sport-profile", "At Whitehouse High School he starred in football, baseball, and basketball; as a senior he averaged 19 points and eight rebounds in basketball.", ["identity-mahomes-texas-tech-baseball"], ["high-school", "multi-sport"]),
      fact("sixteen-strikeout-no-hitter", "high-school-no-hitter", "As a high-school pitcher he threw a no-hitter with 16 strikeouts.", ["identity-mahomes-texas-tech-baseball"], ["high-school", "baseball"]),
      fact("tigers-2014-draft", "mlb-draft-choice", "The Detroit Tigers selected him in the 37th round of the 2014 MLB Draft before he chose the Texas Tech football-and-baseball path instead of signing.", ["identity-mahomes-texas-tech-baseball", "identity-mahomes-chiefs-two-sport-choice"], ["draft", "baseball"]),
      fact("texas-tech-two-sport", "college-two-sport-path", "He played both football and baseball at Texas Tech before committing full time to football after his freshman year.", ["identity-mahomes-chiefs-two-sport-choice"], ["college", "multi-sport"]),
      fact("major-league-clubhouse-childhood", "mlb-clubhouse-upbringing", "He grew up around Major League clubhouses, shagging fly balls as a preschooler and even receiving hitting advice from Alex Rodriguez.", ["identity-mahomes-mlb-baseball-past"], ["childhood", "baseball"]),
    ],
  },
  {
    subjectId: "barry-sanders",
    facts: [
      fact("senior-year-running-back-shot", "late-high-school-position-opportunity", "Wichita North did not give him his first real chance at running back until the fourth game of his senior season.", ["identity-barry-hof-born-to-run"], ["high-school", "position-path"]),
      fact("backed-up-thurman-thomas", "college-backup-to-thurman-thomas", "He spent his first two Oklahoma State seasons backing up future Hall of Famer Thurman Thomas.", ["identity-barry-osu-all-americans"], ["college", "teammate"]),
      fact("all-america-return-man", "college-return-specialist-breakthrough", "While still a backup tailback in 1987, he earned All-America recognition as a kickoff and punt returner.", ["identity-barry-osu-all-americans"], ["college", "special-teams"]),
      fact("1988-only-full-starting-season", "historic-lone-starting-season", "His 1988 Heisman season was his only complete year as Oklahoma State's starting tailback, and he established 34 NCAA records that season.", ["identity-barry-osu-all-americans"], ["college", "turning-point"]),
      fact("left-before-senior-season", "skipped-college-senior-season", "He left Oklahoma State for the NFL without playing his senior season.", ["identity-barry-osu-all-americans"], ["college", "career-path"]),
      fact("father-third-best-introduction", "hall-of-fame-father-introduction", "At his Pro Football Hall of Fame enshrinement, his father William introduced Barry as the third-best running back ever, behind Jim Brown and William himself.", ["identity-barry-hof-born-to-run"], ["family", "hall-of-fame"]),
      fact("osu-statue-and-ring", "oklahoma-state-campus-honor", "Oklahoma State unveiled a nine-foot statue of him in 2021 and made him one of the first two names in the Cowboy Football Ring of Honor.", ["identity-barry-osu-statue"], ["college", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-jerry-rice",
    facts: [
      fact("brick-mason-family-work", "brick-masonry-upbringing", "As a child he spent summers helping his brick-mason father and caught bricks while working with his family.", ["identity-rice-upi-bricks"], ["childhood", "family", "work"]),
      fact("football-after-cutting-class", "high-school-football-discovery", "He did not start football until high school, when his speed drew attention after the principal chased him for cutting class.", ["identity-rice-nfl-appreciation"], ["high-school", "origin-story"]),
      fact("overlooked-by-big-programs", "small-school-recruiting-path", "Major Division I-A programs largely overlooked him, leaving Mississippi Valley State as the school that strongly pursued him.", ["identity-rice-hof-draft"], ["recruiting", "college"]),
      fact("cooley-scouted-basketball", "basketball-court-recruiting-evaluation", "Mississippi Valley State coach Archie Cooley evaluated him on a basketball court and decided the program had to recruit him.", ["identity-rice-hof-draft"], ["recruiting", "multi-sport"]),
      fact("eighteen-ncaa-records", "mississippi-valley-record-book", "He developed into a Mississippi Valley State star who set 18 NCAA Division I-AA records.", ["identity-rice-hof-draft"], ["college", "breakthrough"]),
      fact("49ers-traded-up", "san-francisco-draft-trade-up", "San Francisco traded up in the 1985 first round to draft him out of Mississippi Valley State.", ["identity-rice-nfl-appreciation"], ["draft", "career-turning-point"]),
      fact("edgewood-hill-workout", "signature-hill-training", "Roger Craig introduced him to the steep Edgewood Park hill workout that became a signature part of Rice's offseason conditioning.", ["identity-rice-49ers-hill"], ["training", "teammate"]),
    ],
  },
  {
    subjectId: "bill-belichick",
    facts: [
      fact("father-longtime-navy-coach", "navy-coaching-family", "His father, Steve Belichick, spent more than three decades coaching and scouting at the U.S. Naval Academy.", ["identity-belichick-wesleyan-hof", "identity-belichick-nfl-annapolis"], ["family", "navy", "coaching"]),
      fact("learned-film-from-father", "father-film-study-mentorship", "He learned to break down film from his father and remembers questioning him on the ride home from college football games about how he organized every substitution, penalty, and formation.", ["identity-belichick-nfl-scouting"], ["family", "film", "scouting"]),
      fact("father-scouting-methods-book", "family-scouting-method-legacy", "His father's 1962 book Football Scouting Methods became an influential part of the family's football identity and reflected the detailed scouting system Bill grew up around.", ["identity-belichick-nfl-scouting"], ["family", "scouting", "legacy"]),
      fact("preferred-lacrosse", "lacrosse-first-sport-preference", "Growing up in Annapolis, football was not his favorite sport; he preferred lacrosse.", ["identity-belichick-nfl-annapolis"], ["childhood", "lacrosse"]),
      fact("wesleyan-three-sport-captain", "wesleyan-multi-sport-profile", "At Wesleyan he lettered in football, lacrosse, and squash and captained the lacrosse team.", ["identity-belichick-wesleyan-alumni", "identity-belichick-wesleyan-hof"], ["college", "multi-sport", "lacrosse"]),
      fact("wesleyan-economics-major", "college-economics-major", "He majored in economics at Wesleyan.", ["identity-belichick-wesleyan-alumni"], ["college", "education"]),
      fact("colts-unpaid-to-twenty-five", "entry-level-nfl-origin", "His NFL career began with the 1975 Baltimore Colts at the lowest level of the staff: he initially worked for nothing, then was paid $25 a week after a few weeks of training camp.", ["identity-belichick-patriots-1975", "identity-belichick-wesleyan-hof"], ["coaching-path", "origin-story"]),
    ],
  },
  {
    subjectId: "nfl-jason-kelce",
    facts: [
      fact("preferred-walk-on-linebacker", "cincinnati-walk-on-origin", "He joined Cincinnati as a preferred walk-on after arriving as a linebacker without a Division I scholarship.", ["identity-kelce-nfl-brothers"], ["college", "walk-on"]),
      fact("scout-team-defensive-mvp", "cincinnati-scout-team-defense", "He was Cincinnati's Scout Team Defensive Player of the Year in 2006.", ["identity-kelce-cincinnati-roster"], ["college", "defense"]),
      fact("linebacker-fullback-offensive-line", "college-position-conversion", "At Cincinnati he moved from linebacker to fullback and ultimately to the offensive line.", ["identity-kelce-nfl-brothers"], ["college", "position-path"]),
      fact("high-school-linebacker-running-back", "high-school-two-way-profile", "At Cleveland Heights he was a league defensive MVP at linebacker with 105 senior tackles and also averaged 9.5 yards per carry as a running back.", ["identity-kelce-cincinnati-roster"], ["high-school", "two-way"]),
      fact("travis-followed-to-cincinnati", "brother-college-path", "Travis Kelce followed Jason's path to Cincinnati, where the brothers were Bearcats teammates.", ["identity-kelce-nfl-brothers", "identity-kelce-cincinnati-roster"], ["family", "college"]),
      fact("super-bowl-against-travis", "brothers-super-bowl-matchup", "He faced his brother Travis in Super Bowl LVII when Philadelphia played Kansas City.", ["identity-kelce-cincinnati-hof"], ["family", "iconic-moment"]),
      fact("new-heights-cohost", "new-heights-media-identity", "He co-hosts New Heights with his brother Travis Kelce.", ["identity-kelce-cincinnati-hof"], ["family", "media"]),
    ],
  },
  {
    subjectId: "nfl-aaron-donald",
    facts: [
      fact("father-morning-workouts", "childhood-weight-room-discipline", "His father Archie used morning weight workouts to give a young Aaron more discipline, beginning the training habit that became central to his identity.", ["identity-donald-nfl-family"], ["childhood", "family", "training"]),
      fact("brother-archie-toledo-linebacker", "football-playing-brother", "His older brother Archie played linebacker at Toledo.", ["identity-donald-pitt-roster"], ["family", "college"]),
      fact("high-school-offensive-guard", "high-school-two-way-line-play", "At Penn Hills he was known as a dominant defensive lineman but also started at offensive guard.", ["identity-donald-pitt-roster"], ["high-school", "two-way"]),
      fact("pitt-redshirt-plan-ended-in-practice", "freshman-scout-team-breakthrough", "Pitt planned to redshirt him as a freshman until his first padded scout-team work repeatedly disrupted the first-team offense because blockers could not contain him.", ["identity-donald-pitt-jersey"], ["college", "turning-point"]),
      fact("finished-pitt-degree", "parents-degree-promise", "Years into his NFL career he completed a Pitt bachelor's degree in communications because he had promised his parents he would finish it.", ["identity-donald-nfl-degree"], ["education", "family"]),
      fact("historic-pitt-donation", "pitt-giving-back", "He made a historic seven-figure gift to Pitt, the largest donation by a Pitt football letterman at the time, and the program's football performance center was named for him.", ["identity-donald-pitt-donation"], ["college", "off-field", "legacy"]),
    ],
  },
  {
    subjectId: "lawrence-taylor",
    facts: [
      fact("unc-1980-breakout", "unc-senior-defensive-takeover", "In 1980 at North Carolina he set the school record with 16 sacks, added 22 tackles for loss, and helped an 11-1 team win the ACC championship.", ["identity-taylor-unc-patterson"], ["college", "breakthrough"]),
      fact("game-saving-plays", "unc-game-saving-moments", "North Carolina credits him with game-saving defensive plays against both Texas Tech and Clemson during that 1980 season.", ["identity-taylor-unc-patterson"], ["college", "iconic-moment"]),
      fact("redefined-linebacker-attack", "linebacker-role-redefinition", "His speed-and-power attack style is credited with transforming outside-linebacker play from read-and-react toward aggressive attacking football.", ["identity-taylor-virginia-hof"], ["style", "legacy"]),
      fact("1988-torn-pectoral-game", "played-through-torn-pectoral", "In 1988 he played against New Orleans with a badly torn shoulder and pectoral area strapped in a harness and still produced seven tackles, three sacks, and two forced fumbles in a 13-12 Giants win.", ["identity-taylor-virginia-hof"], ["toughness", "iconic-moment"]),
    ],
  },
  {
    subjectId: "nfl-ray-lewis",
    facts: [
      fact("miami-last-scholarship", "final-miami-scholarship", "He received the final football scholarship Miami had available in its 1993 class.", ["identity-lewis-miami-hof"], ["recruiting", "college"]),
      fact("true-freshman-starter", "miami-immediate-starter", "He became a true-freshman starter at Miami and built a major program tackle résumé despite playing only three college seasons.", ["identity-lewis-miami-hof"], ["college", "breakthrough"]),
      fact("ravens-second-draft-pick", "ravens-franchise-origin", "He was the second draft choice in Baltimore Ravens franchise history, selected immediately after Jonathan Ogden in the 1996 first round.", ["identity-lewis-pro-hof"], ["draft", "franchise"]),
      fact("seventeen-years-one-raven", "one-franchise-career", "He played his entire 17-year NFL career with the Ravens.", ["identity-lewis-pro-hof"], ["career-path", "franchise"]),
      fact("foundation-and-ray-lewis-way", "baltimore-community-identity", "He founded the Ray Lewis 52 Foundation for disadvantaged youth, and Baltimore later renamed part of North Avenue 'Ray Lewis Way' in recognition of his charitable work.", ["identity-lewis-miami-community"], ["community", "off-field"]),
    ],
  },
  {
    subjectId: "deion-sanders",
    facts: [
      fact("three-sports-at-fsu", "florida-state-three-sport-freshman", "As a Florida State freshman he started at cornerback, played outfield for a nationally successful baseball team, and helped the track team win its conference championship.", ["identity-deion-fsu-hof"], ["college", "multi-sport"]),
      fact("high-school-all-state-three-sports", "high-school-three-sport-all-state", "At North Fort Myers High School he earned All-State recognition in football, baseball, and basketball.", ["identity-deion-espn-classic"], ["high-school", "multi-sport"]),
      fact("prime-time-nickname", "prime-time-identity", "He became known as 'Prime Time,' a nickname tied to the showmanship that followed him across sports.", ["identity-deion-espn-classic"], ["nickname", "media-identity"]),
      fact("drafted-by-falcons-and-yankees", "dual-pro-draft", "He was drafted professionally by both the Atlanta Falcons and the New York Yankees.", ["identity-deion-fsu-hof"], ["draft", "multi-sport"]),
      fact("four-major-league-clubs", "concurrent-major-league-career", "While building his NFL career he also played Major League Baseball for the Yankees, Braves, Reds, and Giants.", ["identity-deion-fsu-hof", "identity-deion-mlb-career"], ["baseball", "multi-sport"]),
      fact("same-day-nfl-nlcs-attempt", "same-day-two-sport-attempt", "In October 1992 he attempted to play an NFL game and an NLCS game on the same day.", ["identity-deion-mlb-career"], ["baseball", "iconic-moment"]),
      fact("world-series-and-super-bowl", "world-series-super-bowl-crossover", "He remains the only person to have played in both a World Series and a Super Bowl.", ["identity-deion-mlb-career"], ["multi-sport", "legacy"]),
    ],
  },
  {
    subjectId: "walter-payton",
    facts: [
      fact("drums-before-football", "music-before-football", "Before football became his focus, he preferred playing drums in the marching band and did not join organized high-school football until after his older brother Eddie moved on.", ["identity-payton-mississippi-encyclopedia"], ["high-school", "music", "family"]),
      fact("first-play-long-touchdown", "first-football-play-touchdown", "On his first play after joining the high-school football team, he ran 65 yards for a touchdown.", ["identity-payton-mississippi-encyclopedia"], ["high-school", "origin-story"]),
      fact("followed-eddie-to-jackson-state", "brother-college-path", "He followed his older brother Eddie to Jackson State.", ["identity-payton-mississippi-encyclopedia", "identity-payton-hof-bittersweet"], ["family", "college"]),
      fact("sec-recruiting-era", "segregation-era-recruiting-path", "He later wrote that major SEC programs such as Alabama, Mississippi State, and LSU did not recruit him in an era when those schools were only beginning to integrate their football programs, which helped shape his path to Jackson State.", ["identity-payton-bears-hbcu"], ["recruiting", "college"]),
      fact("sweetness-at-jackson-state", "sweetness-nickname-origin", "He acquired the nickname 'Sweetness' while at Jackson State.", ["identity-payton-hof-bittersweet"], ["nickname", "college"]),
      fact("communications-degree-fast", "accelerated-college-degree", "He earned a bachelor's degree in communications at Jackson State in three and a half years and began master's-level work.", ["identity-payton-hof-bittersweet"], ["education", "college"]),
    ],
  },
  {
    subjectId: "johnny-unitas",
    facts: [
      fact("steelers-cut-ninth-rounder", "pittsburgh-rejection", "Pittsburgh drafted him in the ninth round in 1955 but cut him before he threw a regular-season pass.", ["identity-unitas-pro-hof"], ["draft", "career-turning-point"]),
      fact("six-dollar-semi-pro", "bloomfield-rams-semi-pro", "After being cut, he played semi-pro football for the Bloomfield Rams for $6 a game.", ["identity-unitas-pro-hof", "identity-unitas-hof-high-tops"], ["career-path", "semi-pro"]),
      fact("construction-job", "construction-work-between-opportunities", "He worked construction to make ends meet while trying to keep his football career alive.", ["identity-unitas-hof-high-tops", "identity-unitas-la-times"], ["work", "career-path"]),
      fact("fan-letter-helped-colts-look", "fan-letter-baltimore-opportunity", "A fan's letter helped prompt Baltimore to take a look at him before the Colts brought him in for a tryout.", ["identity-unitas-la-times"], ["career-turning-point", "origin-story"]),
      fact("first-nfl-pass-pick-six", "first-pro-pass-interception-touchdown", "His first NFL pass was intercepted and returned for a touchdown.", ["identity-unitas-pro-hof"], ["career-start", "iconic-moment"]),
      fact("black-high-top-cleats", "iconic-high-top-shoes", "He kept wearing black high-top cleats into the 1970s even after low-cut white shoes had become the norm, making the footwear part of his signature image.", ["identity-unitas-hof-high-tops"], ["style", "visual-identity"]),
    ],
  },
  {
    subjectId: "bill-walsh",
    facts: [
      fact("average-end-and-boxer", "san-jose-state-playing-background", "At San Jose State he described himself as an average end and also boxed.", ["identity-walsh-nfl-obituary"], ["college", "multi-sport"]),
      fact("washington-high-football-and-swim", "high-school-coaching-origin", "He began his coaching career at Washington High School in Fremont, where he led both the football and swim teams.", ["identity-walsh-nfl-obituary"], ["coaching-path", "high-school"]),
      fact("marv-levy-first-college-job", "marv-levy-career-bridge", "Marv Levy hired him from the high-school ranks into his first college coaching job at California.", ["identity-walsh-nfl-obituary", "identity-walsh-nfl-bio"], ["coaching-path", "relationship"]),
      fact("offense-born-in-cincinnati", "cincinnati-west-coast-origin", "The passing system later called the West Coast offense was developed while he worked for Paul Brown in Cincinnati, not after he arrived in San Francisco.", ["identity-walsh-nfl-bio", "identity-walsh-ohio-river"], ["coaching", "innovation"]),
      fact("cook-injury-forced-redesign", "greg-cook-injury-offensive-pivot", "Greg Cook's career-changing shoulder injury pushed Walsh and the Bengals toward the short, high-percentage passing concepts that became the foundation of that offense.", ["identity-walsh-ohio-river"], ["coaching", "turning-point"]),
      fact("first-nfl-head-job-at-47", "late-head-coaching-breakthrough", "He did not receive his first NFL head-coaching job until age 47, when San Francisco hired him in 1979.", ["identity-walsh-pro-hof"], ["coaching-path", "career-turning-point"]),
      fact("two-fourteen-to-title", "49ers-three-year-turnaround", "He took over a 49ers team coming off a 2-14 season and delivered the franchise's first NFL championship within three years.", ["identity-walsh-pro-hof"], ["coaching", "turnaround"]),
      fact("influential-coaching-tree", "coaching-tree-legacy", "His staff became the root of an unusually influential coaching tree that included future head coaches such as Mike Holmgren, George Seifert, and Dennis Green.", ["identity-walsh-nfl-bio"], ["coaching", "relationships", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-tom-brady",
    facts: [
      fact("brady-expos-catcher", "brady-baseball-draft-path", "At Junipero Serra High School he played quarterback and catcher, and the Montreal Expos selected him in the 18th round of the 1995 MLB Draft.", ["identity-brady-patriots-draft"], ["high-school", "baseball", "draft"]),
      fact("brady-michigan-redshirt", "brady-redshirt-origin", "He redshirted his first season at Michigan in 1995.", ["identity-brady-patriots-draft"], ["college", "career-path"]),
      fact("brady-griese-backup", "brady-national-title-backup", "During Michigan's 1997 national-title season he was still Brian Griese's backup.", ["identity-brady-patriots-bio"], ["college", "teammate"]),
      fact("brady-henson-platoon", "brady-senior-quarterback-platoon", "As a senior in 1999 he shared early-game quarterback time with highly recruited sophomore Drew Henson before repeatedly finishing games.", ["identity-brady-patriots-draft"], ["college", "competition"]),
      fact("brady-orange-bowl-finale", "brady-college-finale", "He closed his Michigan career by throwing for 369 yards and four touchdowns in an overtime Orange Bowl win over Alabama.", ["identity-brady-patriots-draft"], ["college", "iconic-moment"]),
    ],
  },
  {
    subjectId: "nfl-peyton-manning",
    facts: [
      fact("manning-archie-family", "manning-football-family", "He arrived at Tennessee carrying a direct football-family identity as Archie Manning's son.", ["identity-manning-tennessee-hof"], ["family", "college"]),
      fact("manning-academic-all-america", "manning-academic-profile", "He earned Academic All-America recognition at Tennessee.", ["identity-manning-tennessee-academic"], ["college", "education"]),
      fact("manning-graduation-junior", "manning-early-graduation", "He accumulated enough credits to graduate by the end of his junior year.", ["identity-manning-tennessee-academic"], ["college", "education"]),
      fact("manning-returned-senior", "manning-bypassed-draft", "He passed on entering the NFL Draft after the 1996 season and returned to Tennessee for his senior year.", ["identity-manning-tennessee-academic"], ["college", "career-decision"]),
      fact("manning-father-son-hall", "manning-father-son-cfb-hall", "He and Archie Manning became the first father-son pair inducted into the College Football Hall of Fame as players.", ["identity-manning-tennessee-hof"], ["family", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-aaron-rodgers",
    facts: [
      fact("rodgers-butte-college", "rodgers-junior-college-path", "His major-college path began with one season at Butte College before he transferred to California.", ["identity-rodgers-cal-bio"], ["college", "recruiting"]),
      fact("rodgers-butte-mvp", "rodgers-juco-breakthrough", "Butte went 10-1, won its conference, finished No. 2 nationally among junior colleges, and he earned conference and region MVP recognition.", ["identity-rodgers-cal-bio"], ["college", "breakthrough"]),
      fact("rodgers-cal-week-five", "rodgers-midseason-starting-breakthrough", "At Cal he did not take over the starting job until the fifth game of his first season, then went 7-3 as the starter.", ["identity-rodgers-cal-bio"], ["college", "career-path"]),
      fact("rodgers-big-game-414", "rodgers-big-game-breakout", "In the 2003 Big Game against Stanford he generated 414 yards of total offense.", ["identity-rodgers-cal-bio"], ["college", "iconic-moment"]),
      fact("rodgers-draft-green-room", "rodgers-draft-day-slide", "At the 2005 NFL Draft he waited for hours in the green room before Green Bay selected him 24th overall.", ["identity-rodgers-nfl-draft"], ["draft", "career-turning-point"]),
    ],
  },
  {
    subjectId: "nfl-drew-brees",
    facts: [
      fact("brees-three-sport-youth", "brees-multi-sport-background", "Football was only one of his serious sports growing up; he also played baseball and basketball and once viewed baseball as a realistic college path.", ["identity-brees-nfl-texas"], ["high-school", "multi-sport", "baseball"]),
      fact("brees-westlake-unbeaten", "brees-westlake-run", "At Westlake High School he went 28-0-1 as the starting quarterback over his final two seasons and won a state championship as a senior.", ["identity-brees-purdue", "identity-brees-nfl-texas"], ["high-school", "team"]),
      fact("brees-eighty-three-passes", "brees-early-spread-volume", "One of his high-school games included 83 pass attempts, an unusually early example of the volume passing that later became common in Texas.", ["identity-brees-nfl-texas"], ["high-school", "style"]),
      fact("brees-texas-no-offer", "brees-underrecruited-texas", "Despite that production, the major Texas programs did not offer him a football scholarship, helping send him to Purdue.", ["identity-brees-nfl-texas"], ["recruiting", "college"]),
      fact("brees-college-nicknames", "brees-purdue-nicknames", "Purdue materials recorded the nicknames 'Cool Brees' and 'Hurricane Drew' during his college career.", ["identity-brees-purdue"], ["college", "nickname"]),
    ],
  },
  {
    subjectId: "nfl-joe-montana",
    facts: [
      fact("montana-seventh-string", "montana-freshman-depth-chart", "He arrived at Notre Dame as a skinny, homesick freshman in a seven-quarterback class and fell as low as seventh on the depth chart.", ["identity-montana-notre-dame-heart"], ["college", "career-path"]),
      fact("montana-homesick-transfer", "montana-freshman-homesickness", "Early uncertainty and homesickness were serious enough that leaving Notre Dame was part of his freshman adjustment story.", ["identity-montana-notre-dame-heart"], ["college", "turning-point"]),
      fact("montana-comeback-kid", "montana-comeback-identity", "His 'Comeback Kid' identity began taking shape with fourth-quarter comeback wins over Purdue and Clemson in 1977.", ["identity-montana-notre-dame-comeback"], ["college", "nickname", "iconic-moment"]),
      fact("montana-texas-title", "montana-cotton-bowl-title", "He helped Notre Dame upset No. 1 Texas in the Cotton Bowl to secure the 1977 national championship.", ["identity-montana-notre-dame-cotton"], ["college", "iconic-moment"]),
      fact("montana-chicken-soup", "montana-chicken-soup-game", "In the 1979 Cotton Bowl 'Chicken Soup Game,' he returned after battling illness and hypothermia to lead a 22-point fourth-quarter comeback over Houston.", ["identity-montana-notre-dame-cotton"], ["college", "toughness", "iconic-moment"]),
    ],
  },
  {
    subjectId: "dan-marino",
    facts: [
      fact("marino-oakland-neighborhood", "marino-hometown-pitt-path", "He grew up in Pittsburgh's Oakland neighborhood in the immediate shadow of the University of Pittsburgh and stayed home to play for Pitt.", ["identity-marino-pitt-hof"], ["childhood", "college"]),
      fact("marino-baseball-dominance", "marino-high-school-baseball", "At Central Catholic he was a high-level baseball player as well as a quarterback, going 23-0 as a pitcher and hitting above .500 as a senior.", ["identity-marino-mlb"], ["high-school", "baseball"]),
      fact("marino-royals-fourth-round", "marino-mlb-draft", "The Kansas City Royals selected him in the fourth round of the 1979 MLB Draft.", ["identity-marino-mlb"], ["draft", "baseball"]),
      fact("marino-freshman-injury-replacement", "marino-freshman-breakthrough", "As a Pitt true freshman he moved into the lineup after an injury to the starter and helped lead the Panthers to the Fiesta Bowl.", ["identity-marino-pitt-hof"], ["college", "turning-point"]),
      fact("marino-sugar-bowl-winner", "marino-sugar-bowl-moment", "His Pitt career included the late winning touchdown pass to John Brown in the 1982 Sugar Bowl, one of his signature college moments.", ["identity-marino-pitt-hof"], ["college", "iconic-moment"]),
    ],
  },
  {
    subjectId: "john-elway",
    facts: [
      fact("elway-royals-draft", "elway-first-mlb-draft", "The Kansas City Royals drafted him out of high school in the 18th round in 1979.", ["identity-elway-mlb"], ["high-school", "baseball", "draft"]),
      fact("elway-yankees-second-round", "elway-yankees-draft", "The New York Yankees selected him in the second round of the 1981 MLB Draft while he was at Stanford.", ["identity-elway-yankees"], ["college", "baseball", "draft"]),
      fact("elway-oneonta-season", "elway-minor-league-success", "In 42 games for Class A Oneonta he hit .318 with four home runs and 13 stolen bases.", ["identity-elway-yankees"], ["baseball", "career-path"]),
      fact("elway-returned-stanford", "elway-football-over-baseball", "He returned to Stanford football rather than continue immediately up the Yankees' minor-league ladder.", ["identity-elway-mlb"], ["college", "career-decision"]),
      fact("elway-baseball-leverage", "elway-colts-trade-leverage", "His legitimate baseball option gave him unusual leverage to refuse to play for Baltimore after the Colts drafted him first overall, leading to the trade to Denver.", ["identity-elway-mlb"], ["baseball", "draft", "career-turning-point"]),
    ],
  },
  {
    subjectId: "emmitt-smith",
    facts: [
      fact("emmitt-national-prep-star", "emmitt-high-school-national-profile", "At Escambia High School he became a national prep player of the year and one of the most productive high-school runners of his era.", ["identity-emmitt-florida-record"], ["high-school", "breakthrough"]),
      fact("emmitt-escambia-production", "emmitt-prep-production", "His prep career produced 8,804 rushing yards and 106 touchdowns, with 100-yard rushing games in 45 of 49 appearances.", ["identity-emmitt-florida-record"], ["high-school", "legacy"]),
      fact("emmitt-too-small-slow", "emmitt-size-speed-skepticism", "Even after that production, Florida's own retrospective notes that he was widely labeled 'too small' or 'too slow.'", ["identity-emmitt-florida-great"], ["recruiting", "identity"]),
      fact("emmitt-thousand-seven-games", "emmitt-freshman-speed-record", "At Florida he reached 1,000 rushing yards by his seventh game, earlier than any college freshman had done at the time.", ["identity-emmitt-florida-record"], ["college", "breakthrough"]),
      fact("emmitt-first-florida-early-entry", "emmitt-underclassman-draft-decision", "After his junior year he became the first Florida player to declare early for the NFL Draft when the league opened the traditional draft to underclassmen in 1990.", ["identity-emmitt-florida-early"], ["college", "career-decision"]),
    ],
  },
  {
    subjectId: "nfl-adrian-peterson",
    facts: [
      fact("peterson-ad-nickname", "peterson-all-day-nickname", "His 'A.D.' nickname comes from his father calling him 'All Day' because of his childhood energy.", ["identity-peterson-ou-awards"], ["childhood", "family", "nickname"]),
      fact("peterson-prep-multisport", "peterson-high-school-multisport", "He was a serious multi-sport high-school athlete who also competed in track and basketball.", ["identity-peterson-ou-recruiting"], ["high-school", "multi-sport"]),
      fact("peterson-army-commitment", "peterson-all-american-commitment", "He publicly committed to Oklahoma around the U.S. Army All-American game after scoring twice in the showcase.", ["identity-peterson-ou-recruiting"], ["recruiting", "college"]),
      fact("peterson-first-three-not-start", "peterson-freshman-depth-chart", "He did not start Oklahoma's first three games as a freshman; an injury ahead of him helped open the featured role.", ["identity-peterson-ou-freshman"], ["college", "career-path"]),
      fact("peterson-nine-straight-hundred", "peterson-freshman-rushing-streak", "That freshman season included an NCAA freshman record of nine consecutive 100-yard rushing games.", ["identity-peterson-ou-awards"], ["college", "breakthrough"]),
    ],
  },
  {
    subjectId: "nfl-ladainian-tomlinson",
    facts: [
      fact("lt-waco-to-tcu", "lt-local-college-path", "The Waco native stayed close to home for college at TCU and became the centerpiece of the program's late-1990s resurgence.", ["identity-lt-tcu-legacy"], ["recruiting", "college"]),
      fact("lt-406-six-touchdowns", "lt-utep-record-game", "Against UTEP in 1999 he rushed for 406 yards and six touchdowns in one game.", ["identity-lt-tcu-legacy"], ["college", "iconic-moment"]),
      fact("lt-first-tcu-two-thousand", "lt-tcu-two-thousand-first", "He became the first TCU player to post a 2,000-yard rushing season.", ["identity-lt-tcu-legacy"], ["college", "breakthrough"]),
      fact("lt-twenty-one-tickets", "lt-chargers-community-tickets", "His off-field routine with the Chargers included purchasing 21 tickets to each home game for children through his community program.", ["identity-lt-tcu-community"], ["community", "off-field"]),
      fact("lt-one-day-charger-retirement", "lt-retirement-franchise-choice", "At retirement he signed a one-day contract so he could retire as a Charger, while TCU's No. 5 remained a central symbol of his college legacy.", ["identity-lt-tcu-retirement"], ["career-decision", "legacy"]),
    ],
  },
  {
    subjectId: "marshall-faulk",
    facts: [
      fact("faulk-third-string-fumbles", "faulk-freshman-depth-chart", "San Diego State opened his freshman season with him third on the running-back depth chart after two early fumbles.", ["identity-faulk-sdsu-history"], ["college", "career-path"]),
      fact("faulk-386-seven", "faulk-pacific-breakout", "In the second game of his college career he erupted for 386 rushing yards and seven touchdowns in only three quarters against Pacific.", ["identity-faulk-sdsu-history"], ["college", "iconic-moment"]),
      fact("faulk-first-freshman-leader", "faulk-freshman-national-leader", "He became the first freshman to lead the nation in both rushing and scoring.", ["identity-faulk-sdsu-hof"], ["college", "breakthrough"]),
      fact("faulk-first-freshman-ap", "faulk-freshman-all-american-first", "He also became the first freshman running back named an Associated Press first-team All-American.", ["identity-faulk-sdsu-hof"], ["college", "legacy"]),
      fact("faulk-number-hall", "faulk-sdsu-campus-legacy", "San Diego State later retired his No. 28 and inducted him into its athletics hall of fame in his first year of eligibility.", ["identity-faulk-sdsu-hof"], ["college", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-jim-brown",
    facts: [
      fact("brown-five-sport-high-school", "brown-prep-multisport", "At Manhasset High School he competed in five sports and was a dominant basketball player as well as a football star.", ["identity-brown-syracuse"], ["high-school", "multi-sport"]),
      fact("brown-four-sport-syracuse", "brown-college-multisport", "At Syracuse he lettered in four sports: football, lacrosse, basketball, and track.", ["identity-brown-syracuse"], ["college", "multi-sport"]),
      fact("brown-lacrosse-great", "brown-lacrosse-identity", "His lacrosse career was elite enough that he is remembered as one of that sport's all-time greats as well as a football legend.", ["identity-brown-syracuse"], ["college", "lacrosse"]),
      fact("brown-army-rotc", "brown-military-service", "He participated in Army ROTC at Syracuse, was commissioned as a second lieutenant, and later served in the Army Reserve.", ["identity-brown-syracuse"], ["college", "military"]),
      fact("brown-amer-i-can", "brown-community-program", "In 1988 he founded the Amer-I-Can program, using a life-skills curriculum aimed at helping people in disadvantaged and high-risk communities.", ["identity-brown-syracuse"], ["community", "off-field"]),
    ],
  },
  {
    subjectId: "nfl-randy-moss",
    facts: [
      fact("moss-two-sport-state-star", "moss-high-school-two-sport", "He was an elite high-school basketball player as well as a football star, earning West Virginia state player-of-the-year recognition in both sports.", ["identity-moss-marshall-hof"], ["high-school", "multi-sport"]),
      fact("moss-marshall-track", "moss-college-sprint-titles", "At Marshall he also competed in track and won Southern Conference sprint titles in the 60 and 100 meters.", ["identity-moss-marshall-hof"], ["college", "track", "multi-sport"]),
      fact("moss-fifteen-zero-title", "moss-marshall-championship-arrival", "His first Marshall football team went 15-0 and won the Division I-AA national championship.", ["identity-moss-marshall-hof"], ["college", "team"]),
      fact("moss-twenty-nine-touchdowns", "moss-freshman-scoring-breakout", "That 1996 season included 29 receiving touchdowns, making his arrival at Marshall immediate and unmistakable.", ["identity-moss-marshall-hof"], ["college", "breakthrough"]),
      fact("moss-biletnikoff-warfield", "moss-college-award-profile", "In 1997 he won the Biletnikoff and Paul Warfield awards and was a Heisman finalist before entering the NFL.", ["identity-moss-marshall-hof"], ["college", "recognition"]),
    ],
  },
  {
    subjectId: "nfl-calvin-johnson",
    facts: [
      fact("calvin-forty-two-vertical", "calvin-tech-vertical", "On his first day in Georgia Tech's program he posted a 42-inch vertical jump, then a program record.", ["identity-calvin-tech-hof"], ["college", "athleticism"]),
      fact("calvin-butterfingers", "calvin-early-nickname", "As a young high-school receiver he was once nicknamed 'Butterfingers.'", ["identity-calvin-tech-hof"], ["high-school", "nickname"]),
      fact("calvin-blistered-hands", "calvin-hands-training", "He responded by repeatedly drilling his hands until they blistered, turning an early weakness into one of his defining strengths.", ["identity-calvin-tech-hof"], ["high-school", "training"]),
      fact("calvin-five-inch-growth", "calvin-high-school-growth", "He grew roughly five inches between his freshman and sophomore years of high school, changing his athletic profile dramatically.", ["identity-calvin-tech-hof"], ["high-school", "development"]),
      fact("calvin-baseball-choice", "calvin-baseball-background", "Baseball had been his longest-running sport; Georgia Tech's baseball staff was interested in him, but he chose not to add college baseball to football.", ["identity-calvin-tech-bio"], ["baseball", "college", "career-decision"]),
    ],
  },
  {
    subjectId: "nfl-terrell-owens",
    facts: [
      fact("owens-three-sport-utc", "owens-college-three-sport", "At Chattanooga he was a three-sport college athlete in football, men's basketball, and track and field.", ["identity-owens-utc-socon"], ["college", "multi-sport"]),
      fact("owens-basketball-titles", "owens-college-basketball", "He earned two basketball letters and played on teams that won Southern Conference regular-season and tournament championships and reached the NCAA tournament.", ["identity-owens-utc-socon", "identity-owens-utc-hof"], ["college", "basketball"]),
      fact("owens-twenty-game-streak", "owens-utc-reception-streak", "His football development at Chattanooga included a 20-game reception streak across the 1994 and 1995 seasons.", ["identity-owens-utc-hof"], ["college", "breakthrough"]),
      fact("owens-small-school-third-round", "owens-draft-path", "San Francisco found him at the smaller Chattanooga program and selected him in the third round of the 1996 NFL Draft.", ["identity-owens-utc-hof"], ["draft", "career-path"]),
      fact("owens-super-bowl-injury-return", "owens-injury-comeback", "In Super Bowl XXXIX he returned only seven weeks after suffering a broken leg and torn ankle ligaments and caught nine passes for 122 yards.", ["identity-owens-utc-socon"], ["toughness", "iconic-moment"]),
    ],
  },
  {
    subjectId: "nfl-larry-fitzgerald",
    facts: [
      fact("fitzgerald-vikings-ball-boy", "fitzgerald-nfl-ball-boy", "As a teenager he worked as a Minnesota Vikings ball boy, giving him an unusually close view of NFL preparation before college.", ["identity-fitzgerald-nfl-camp"], ["childhood", "work"]),
      fact("fitzgerald-carter-moss-mentors", "fitzgerald-receiver-mentorship", "That job let him study and build relationships with receivers including Cris Carter and Randy Moss.", ["identity-fitzgerald-nfl-camp"], ["relationships", "development"]),
      fact("fitzgerald-valley-forge", "fitzgerald-military-school-path", "Academic trouble sent him to Valley Forge Military Academy for a year before he reached Pitt.", ["identity-fitzgerald-pitt-life"], ["education", "college-path"]),
      fact("fitzgerald-mother-breast-cancer", "fitzgerald-family-community-driver", "His mother's death from breast cancer while he was young shaped long-running breast-cancer awareness and support work later in his life.", ["identity-fitzgerald-pitt-life", "identity-fitzgerald-pitt-bio"], ["family", "community"]),
      fact("fitzgerald-global-service", "fitzgerald-international-community", "His off-field identity includes extensive international service work, including hearing-aid missions and water and agriculture projects abroad.", ["identity-fitzgerald-pitt-bio"], ["community", "off-field"]),
    ],
  },
  {
    subjectId: "nfl-john-mackey",
    facts: [
      fact("mackey-syracuse-running-back", "mackey-college-position-path", "Syracuse used him as a running back before his pro career became synonymous with tight end.", ["identity-mackey-syracuse", "identity-mackey-hof"], ["college", "position-path"]),
      fact("mackey-colts-fullback-plan", "mackey-pro-position-choice", "When Baltimore drafted him, the Colts initially considered him as a fullback before settling him at tight end.", ["identity-mackey-hof"], ["career-path", "position-path"]),
      fact("mackey-six-long-touchdowns", "mackey-big-play-tight-end", "In 1966 he scored six touchdowns of at least 50 yards, an unusual big-play profile for the position in that era.", ["identity-mackey-hof"], ["style", "breakthrough"]),
      fact("mackey-super-bowl-deflection", "mackey-super-bowl-v-touchdown", "In Super Bowl V a deflected pass became a 75-yard Mackey touchdown, one of the game's signature plays.", ["identity-mackey-hof"], ["iconic-moment"]),
      fact("mackey-88-plan", "mackey-dementia-care-legacy", "His later dementia struggle helped inspire the NFL and NFLPA '88 Plan,' named for his jersey number, to assist former players with dementia-related care.", ["identity-mackey-syracuse"], ["off-field", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-anthony-munoz",
    facts: [
      fact("munoz-high-school-three-sport", "munoz-prep-multisport", "He was a high-school football, basketball, and baseball athlete before USC.", ["identity-munoz-cfbhall"], ["high-school", "multi-sport"]),
      fact("munoz-usc-baseball-title", "munoz-college-baseball-champion", "At USC he was good enough in baseball to pitch for the Trojans' 1978 national championship team.", ["identity-munoz-hof"], ["college", "baseball"]),
      fact("munoz-growth-to-football", "munoz-baseball-football-transition", "His physical growth increasingly pushed his athletic future from baseball toward football.", ["identity-munoz-cfbhall"], ["development", "career-path"]),
      fact("munoz-knee-rose-bowl-return", "munoz-knee-comeback", "A major knee injury cost him almost all of his final USC football season, but he returned for the Rose Bowl.", ["identity-munoz-hof"], ["college", "toughness"]),
      fact("munoz-bengals-draft-gamble", "munoz-draft-knee-risk", "Cincinnati still selected him third overall despite the knee concerns, a draft gamble that became central to his career story.", ["identity-munoz-hof"], ["draft", "career-turning-point"]),
    ],
  },
  {
    subjectId: "nfl-joe-thomas",
    facts: [
      fact("thomas-high-school-three-sport", "thomas-prep-multisport", "He was a three-sport high-school athlete in football, basketball, and track.", ["identity-thomas-wisconsin"], ["high-school", "multi-sport"]),
      fact("thomas-two-way-prep", "thomas-high-school-two-way", "His prep football identity was two-way: he earned major recognition at both offensive tackle and defensive end.", ["identity-thomas-wisconsin"], ["high-school", "two-way"]),
      fact("thomas-te-de-ot", "thomas-college-position-conversion", "Wisconsin initially used him as a blocking tight end, and he even started at defensive end in a bowl game before becoming an elite offensive tackle.", ["identity-thomas-wisconsin"], ["college", "position-path"]),
      fact("thomas-shot-put-record", "thomas-college-track", "He was also a nationally competitive shot-putter and set a Wisconsin indoor shot-put record.", ["identity-thomas-wisconsin"], ["college", "track", "multi-sport"]),
      fact("thomas-draft-day-fishing", "thomas-fishing-draft-day", "Rather than attend the 2007 NFL Draft in New York, he went fishing on Lake Michigan with his father and took Cleveland's No. 3 pick phone call from the boat.", ["identity-thomas-nfl-fishing"], ["draft", "family", "off-field"]),
    ],
  },
  {
    subjectId: "nfl-reggie-white",
    facts: [
      fact("white-ordained-teen", "white-teen-minister", "He became an ordained minister as a teenager, well before his NFL career.", ["identity-white-tennessee"], ["high-school", "faith"]),
      fact("white-minister-defense", "white-nickname-faith", "His faith and football identity combined in the nickname 'Minister of Defense.'", ["identity-white-tennessee-hof"], ["nickname", "faith"]),
      fact("white-late-prep-publicity", "white-high-school-breakthrough", "A Chattanooga-area high-school star, he did not receive major statewide publicity until relatively late in his senior season before his recruitment exploded.", ["identity-white-tennessee"], ["high-school", "recruiting"]),
      fact("white-four-sack-citadel", "white-tennessee-record-game", "At Tennessee he produced a four-sack game against The Citadel, then a school record.", ["identity-white-tennessee"], ["college", "iconic-moment"]),
      fact("white-memphis-showboats", "white-usfl-path", "Before joining Philadelphia he played two professional seasons for the Memphis Showboats of the USFL.", ["identity-white-tennessee-hof"], ["career-path", "usfl"]),
    ],
  },
  {
    subjectId: "nfl-bruce-smith",
    facts: [
      fact("bruce-late-football-start", "bruce-high-school-late-start", "He did not begin playing organized football until his sophomore year of high school.", ["identity-bruce-vt"], ["high-school", "origin-story"]),
      fact("bruce-all-state-senior", "bruce-rapid-prep-rise", "By his senior year he had developed quickly enough to become an all-state player.", ["identity-bruce-vt"], ["high-school", "breakthrough"]),
      fact("bruce-linebacker-speed", "bruce-defensive-line-speed", "At Virginia Tech his unusual speed for a defensive lineman became a defining part of how coaches and teammates described his game.", ["identity-bruce-vt"], ["college", "style"]),
      fact("bruce-conditioning-transformation", "bruce-college-body-transformation", "Early in college he weighed more than 300 pounds, then transformed his conditioning and playing weight dramatically.", ["identity-bruce-hof-speech"], ["college", "training"]),
      fact("bruce-stairmaster", "bruce-signature-conditioning", "His later training became famous for relentless conditioning work, including heavy StairMaster sessions.", ["identity-bruce-hof-speech"], ["training", "routine"]),
    ],
  },
  {
    subjectId: "nfl-joe-greene",
    facts: [
      fact("greene-mean-green-not-named-for-him", "greene-nickname-misconception", "North Texas' 'Mean Green' team nickname was not named for Joe Greene; it began as a cheer for the defense.", ["identity-greene-unt-origin"], ["college", "nickname"]),
      fact("greene-mean-joe-pro-origin", "greene-mean-joe-origin", "After Pittsburgh drafted him, local pro-football media adapted his college association with the Mean Green into the individual 'Mean Joe Greene' nickname.", ["identity-greene-unt-origin"], ["nickname", "career-path"]),
      fact("greene-first-unt-first-round", "greene-north-texas-draft-first", "In 1969 he became the first North Texas player ever selected in the first round of the NFL Draft.", ["identity-greene-unt-hof"], ["college", "draft"]),
      fact("greene-disappointed-steelers", "greene-steelers-culture-pivot", "He initially was disappointed that the struggling Steelers had drafted him, then became the central figure in the franchise's culture change.", ["identity-greene-steelers"], ["draft", "career-turning-point"]),
      fact("greene-coke-commercial", "greene-mainstream-commercial", "His 1979 Coca-Cola commercial, in which he tossed his jersey to a young fan, became an iconic piece of his public identity and won major advertising recognition.", ["identity-greene-steelers-coke"], ["media", "visual-identity"]),
    ],
  },
  {
    subjectId: "nfl-brian-urlacher",
    facts: [
      fact("urlacher-lovington-title", "urlacher-high-school-title", "At Lovington High School in New Mexico he helped lead a 14-0 state championship team.", ["identity-urlacher-nmaa"], ["high-school", "team"]),
      fact("urlacher-lobo-back", "urlacher-hybrid-college-role", "New Mexico built a hybrid 'Lobo Back' role around him rather than using him as a conventional linebacker.", ["identity-urlacher-unm"], ["college", "position-path"]),
      fact("urlacher-three-way-senior", "urlacher-defense-offense-returner", "As a senior he contributed on defense, at wide receiver, and as a punt returner.", ["identity-urlacher-unm"], ["college", "multi-role"]),
      fact("urlacher-led-tackles-touchdowns", "urlacher-two-way-team-leader", "That season he led New Mexico in tackles while also leading the team in touchdowns and punt-return average.", ["identity-urlacher-unm"], ["college", "breakthrough"]),
      fact("urlacher-lovington-field", "urlacher-hometown-legacy", "Lovington later named its football field for him, and he helped fund a major indoor facility at the school.", ["identity-urlacher-nmaa"], ["high-school", "community", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-dick-butkus",
    facts: [
      fact("butkus-chicago-illinois", "butkus-hometown-college-path", "A Chicago native, he stayed in-state to become one of the defining players in Illinois football history.", ["identity-butkus-illinois"], ["childhood", "college"]),
      fact("butkus-center-linebacker", "butkus-college-two-way", "Illinois used him as a two-way player at linebacker and center.", ["identity-butkus-illinois"], ["college", "two-way"]),
      fact("butkus-rose-bowl", "butkus-big-ten-rose-bowl", "He was a centerpiece of the 1963 Big Ten championship team that won the Rose Bowl.", ["identity-butkus-illinois"], ["college", "team"]),
      fact("butkus-heisman-third", "butkus-defensive-heisman-finish", "In 1964 a defensive player finished third in the Heisman Trophy voting with Butkus in that spot.", ["identity-butkus-illinois"], ["college", "recognition"]),
      fact("butkus-number-award", "butkus-linebacker-name-legacy", "Illinois retired his No. 50, and the annual Butkus Award later made his name the national shorthand for elite linebacker play.", ["identity-butkus-illinois-number"], ["college", "legacy"]),
    ],
  },
  {
    subjectId: "nfl-troy-polamalu",
    facts: [
      fact("polamalu-oregon-state-fan", "polamalu-childhood-college-choice", "He grew up rooting for Oregon State but ultimately chose USC.", ["identity-polamalu-usc-profile"], ["childhood", "recruiting"]),
      fact("polamalu-rb-safety", "polamalu-high-school-two-way", "In high school he earned all-state recognition on both sides of the ball as a running back and safety.", ["identity-polamalu-usc-profile"], ["high-school", "two-way"]),
      fact("polamalu-blocked-kicks", "polamalu-college-special-teams", "USC used him as more than a conventional safety; his college impact also included blocked kicks and major special-teams plays.", ["identity-polamalu-usc-aa"], ["college", "special-teams"]),
      fact("polamalu-flowing-hair", "polamalu-visual-identity", "His long, flowing hair became one of the most immediately recognizable visual identities in football.", ["identity-polamalu-usc-hof"], ["visual-identity", "style"]),
      fact("polamalu-shampoo-commercials", "polamalu-hair-advertising", "That hair identity crossed into mainstream advertising, including national shampoo commercials.", ["identity-polamalu-usc-hof"], ["media", "visual-identity"]),
    ],
  },
  {
    subjectId: "nfl-ed-reed",
    facts: [
      fact("reed-strong-to-free-safety", "reed-college-role-change", "Miami moved him from strong safety to free safety as a senior specifically to let him roam and affect more of the field.", ["identity-reed-miami"], ["college", "position-path"]),
      fact("reed-played-through-injuries", "reed-college-injury-toughness", "He played through a separated shoulder and injured ribs during his college career without missing the defining stretch of the season.", ["identity-reed-miami"], ["college", "toughness"]),
      fact("reed-boston-college-lateral", "reed-bc-lateral-touchdown", "Against Boston College in 2001 he took a teammate's interception via lateral and ran it 80 yards for the touchdown that sealed the game.", ["identity-reed-miami"], ["college", "iconic-moment"]),
      fact("reed-blocked-kicks", "reed-college-special-teams", "His college impact extended to blocked punts and field goals, not only interceptions.", ["identity-reed-miami"], ["college", "special-teams"]),
      fact("reed-heart-soul-2001", "reed-championship-leadership", "Miami described him as the heart-and-soul leader of the 2001 national championship team.", ["identity-reed-miami"], ["college", "leadership"]),
    ],
  },
  {
    subjectId: "nfl-charles-woodson",
    facts: [
      fact("woodson-ohio-mr-football", "woodson-high-school-running-back", "Before becoming a defensive icon he was Ohio's Mr. Football as a high-school running back.", ["identity-woodson-heisman", "identity-woodson-hof"], ["high-school", "position-path"]),
      fact("woodson-dreamed-michigan", "woodson-dream-school", "Michigan was the school he had wanted to attend, and he arrived with an immediate opportunity to play.", ["identity-woodson-heisman"], ["recruiting", "college"]),
      fact("woodson-started-game-two", "woodson-freshman-immediate-start", "He entered Michigan's starting lineup by the second game of his freshman season.", ["identity-woodson-hof"], ["college", "breakthrough"]),
      fact("woodson-carr-offense", "woodson-college-two-way-role", "Lloyd Carr later asked him to add an offensive role, leading to regular snaps as a receiver while he remained an elite cornerback.", ["identity-woodson-heisman"], ["college", "two-way"]),
      fact("woodson-two-way-heisman", "woodson-modern-two-way-heisman", "That legitimate offense-defense-special-teams identity culminated in him becoming the rare two-way player to win the Heisman Trophy in the modern two-platoon era.", ["identity-woodson-heisman"], ["college", "legacy"]),
    ],
  },
  {
    subjectId: "andy-reid",
    facts: [
      fact("reid-high-school-pitcher", "reid-prep-baseball", "In high school he was an all-league baseball pitcher as well as a football lineman.", ["identity-reid-byu"], ["high-school", "baseball", "multi-sport"]),
      fact("reid-glendale-junior-college", "reid-junior-college-path", "His college path started at Glendale Junior College rather than at BYU.", ["identity-reid-byu"], ["college", "career-path"]),
      fact("reid-glendale-inspirational", "reid-juco-recognition", "At Glendale he earned all-conference recognition and a team 'most inspirational' honor before transferring.", ["identity-reid-byu"], ["college", "leadership"]),
      fact("reid-byu-tackle-redshirt", "reid-byu-playing-path", "At BYU he played offensive tackle and had a medical-redshirt season.", ["identity-reid-byu"], ["college", "position-path"]),
      fact("reid-byu-graduate-assistant", "reid-coaching-origin", "His coaching career began at BYU as a graduate assistant under LaVell Edwards after completing his playing career and graduate education.", ["identity-reid-byu"], ["coaching-path", "relationship"]),
    ],
  },
  {
    subjectId: "nfl-john-madden",
    facts: [
      fact("madden-two-way-baseball", "madden-cal-poly-multisport", "At Cal Poly he played on both the offensive and defensive lines and also played baseball.", ["identity-madden-calpoly"], ["college", "multi-sport", "two-way"]),
      fact("madden-eagles-21st-round", "madden-draft-path", "Philadelphia selected him in the 21st round of the 1958 NFL Draft.", ["identity-madden-hof"], ["draft", "career-path"]),
      fact("madden-knee-ended-playing", "madden-playing-career-ending-injury", "A knee injury in training camp ended his playing career before it could become an NFL career.", ["identity-madden-hof"], ["injury", "career-turning-point"]),
      fact("madden-van-brocklin-film", "madden-film-study-origin", "During rehabilitation, quarterback Norm Van Brocklin pulled him into intensive film study, which Madden later described as one of the great educations of his football life.", ["identity-madden-hof"], ["coaching-path", "relationship", "film"]),
      fact("madden-education-degrees", "madden-teacher-identity", "He earned bachelor's and master's degrees in education, a background that fit the teacher identity he carried into coaching.", ["identity-madden-calpoly", "identity-madden-hof"], ["education", "coaching"]),
    ],
  },
  {
    subjectId: "don-shula",
    facts: [
      fact("shula-forged-signatures", "shula-secret-football-start", "His parents initially opposed football strongly enough that as a teenager he forged their signatures to get permission to play.", ["identity-shula-hof"], ["high-school", "family", "origin-story"]),
      fact("shula-high-school-coach-before-player", "shula-pre-nfl-coaching", "After John Carroll he spent a year coaching high-school football before the Cleveland Browns drafted him as a player.", ["identity-shula-hof"], ["coaching-path", "career-path"]),
      fact("shula-national-guard", "shula-military-service", "His early pro career was interrupted by Ohio National Guard service during the Korean War era.", ["identity-shula-browns"], ["military", "career-path"]),
      fact("shula-seven-year-defensive-back", "shula-player-before-coach", "Before becoming a coach he spent seven NFL seasons as a defensive back.", ["identity-shula-hof"], ["career-path", "position-path"]),
      fact("shula-youngest-head-coach", "shula-age-33-head-coach", "Baltimore hired him as its head coach at age 33, making him the youngest head coach in the NFL at the time.", ["identity-shula-hof"], ["coaching-path", "breakthrough"]),
    ],
  },
] as const;

const sourceById = new Map(footballPersonIdentityKnowledgeSources.map((item) => [item.id, item]));
const recordBySubjectId = new Map<string, FootballPersonIdentityKnowledgeRecord>();

function normalizedFactValue(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
}

for (const record of footballPersonIdentityKnowledgeRecords) {
  const canonicalSubject = getFootballSubject(record.subjectId);
  if (!canonicalSubject || canonicalSubject.id !== record.subjectId) {
    throw new Error(`Football person identity knowledge must use canonical subject id ${record.subjectId}.`);
  }
  if (recordBySubjectId.has(record.subjectId)) {
    throw new Error(`Duplicate football person identity knowledge record for ${record.subjectId}.`);
  }
  const factIds = new Set<string>();
  const conceptIds = new Set<string>();
  const normalizedValues = new Set<string>();
  for (const identityFact of record.facts) {
    if (!identityFact.factId.trim() || !identityFact.conceptId.trim() || !identityFact.value.trim()) {
      throw new Error(`Football person identity knowledge ${record.subjectId} contains an empty fact field.`);
    }
    if (factIds.has(identityFact.factId)) {
      throw new Error(`Football person identity knowledge ${record.subjectId} duplicates fact id ${identityFact.factId}.`);
    }
    if (conceptIds.has(identityFact.conceptId)) {
      throw new Error(`Football person identity knowledge ${record.subjectId} duplicates concept ${identityFact.conceptId}.`);
    }
    const normalizedValue = normalizedFactValue(identityFact.value);
    if (normalizedValues.has(normalizedValue)) {
      throw new Error(`Football person identity knowledge ${record.subjectId} duplicates fact wording ${identityFact.factId}.`);
    }
    if (!identityFact.sourceIds.length) {
      throw new Error(`Football person identity knowledge ${record.subjectId} fact ${identityFact.factId} has no provenance.`);
    }
    for (const sourceId of identityFact.sourceIds) {
      if (!sourceById.has(sourceId)) {
        throw new Error(`Football person identity knowledge ${record.subjectId} fact ${identityFact.factId} has unknown source ${sourceId}.`);
      }
    }
    factIds.add(identityFact.factId);
    conceptIds.add(identityFact.conceptId);
    normalizedValues.add(normalizedValue);
  }
  recordBySubjectId.set(record.subjectId, record);
}

export function getFootballPersonIdentityKnowledge(subjectId: string) {
  const canonicalSubjectId = getFootballSubject(subjectId)?.id ?? subjectId;
  return recordBySubjectId.get(canonicalSubjectId) ?? null;
}

export function getFootballPersonIdentityKnowledgeSource(sourceId: string) {
  return sourceById.get(sourceId) ?? null;
}

export function getFootballPersonIdentityFactSources(identityFact: FootballPersonIdentityFact) {
  return identityFact.sourceIds.map((sourceId) => sourceById.get(sourceId)!).filter(Boolean);
}
