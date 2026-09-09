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

  source("identity-brady-mlb-draft", "MLB.com", "Tom Brady chose to go behind center, not the plate", "https://www.mlb.com/news/tom-brady-chose-to-go-behind-center-not-the-plate/c-66618020", "Tom Brady's Expos draft selection and decision to pursue football at Michigan."),
  source("identity-brady-nfl-michigan", "NFL.com", "Michigan experience sparked Brady's rise to stardom", "https://www.nfl.com/news/michigan-experience-sparked-brady-s-rise-to-stardom-09000d5d81c609ad", "Tom Brady's Michigan backup years, Drew Henson competition, and late-round NFL entry."),
  source("identity-brady-michigan-orange", "Michigan Athletics", "A Season of Firsts: Recalling U-M's 2000 Orange Bowl Victory", "https://mgoblue.com/news/2014/9/19/A_Season_of_Firsts_Recalling_U_M_s_2000_Orange_Bowl_Victory", "Tom Brady's Michigan captaincy and final college comeback."),
  source("identity-peyton-tennessee-roster", "Tennessee Athletics", "Peyton Manning - Football", "https://utsports.com/sports/football/roster/peyton-manning/15491", "Peyton Manning's high-school baseball background and true-freshman quarterback path after injuries ahead of him."),
  source("identity-peyton-academic-hof", "Tennessee Athletics", "Manning Selected for Academic All-America Hall of Fame", "https://utsports.com/news/2018/4/23/football-manning-selected-for-academic-all-america-hall-of-fame", "Peyton Manning's accelerated degree, academic recognition, and decision to return for his senior season."),
  source("identity-favre-southern-miss", "Southern Miss Athletics", "Brett Favre - M-Club Hall of Fame", "https://southernmiss.com/honors/southern-miss-m-club-hall-of-fame/brett-favre/204", "Brett Favre's father-coached wishbone background, overlooked recruitment, third-string breakthrough, car crash, surgery, and return."),
  source("identity-montana-notre-dame-heart", "Notre Dame Athletics", "Strong Of Heart: Joe Montana", "https://fightingirish.com/news/2011/02/23/strong-of-heart-joe-montana-2", "Joe Montana nearly leaving Notre Dame, 1976 shoulder injury, 1977 third-string comeback, and Chicken Soup Game."),
  source("identity-montana-nd-banquet", "Notre Dame Athletics", "Joe Montana Will Be The Guest Speaker For The 83rd University of Notre Dame Football Banquet", "https://fightingirish.com/joe-montana-will-be-the-guest-speaker-for-the-83rd-university-of-notre-dame-football-banquet/", "Joe Montana's 1977 national-title path, Purdue comeback, Houston comeback, and third-round draft position."),
  source("identity-rodgers-cal-bio", "California Athletics", "Aaron Rodgers Bio", "https://calbears.com/news/2013/4/17/208198625.aspx", "Aaron Rodgers' Butte College year, junior-college All-America production, and immediate Cal impact."),
  source("identity-rodgers-cal-discovery", "California Athletics", "Cal's Go To Guy", "https://calbears.com/news/2018/4/2/football-cals-go-to-guy", "Aaron Rodgers being discovered while Cal evaluated Butte teammate Garrett Cross."),
  source("identity-rodgers-packers-draft", "Green Bay Packers", "Rodgers' Agonizing Wait Comes To Happy End", "https://www.packers.com/news/rodgers-agonizing-wait-comes-to-happy-end-2458636", "Aaron Rodgers' lack of major high-school recruitment, Butte route, Cal discovery, and slide to the 24th pick."),
  source("identity-brown-syracuse-bio", "Syracuse Athletics", "Jim Brown Bio", "https://cuse.com/sports/2005/5/25/brownbio", "Jim Brown's four-sport Syracuse career and football/lacrosse Hall of Fame distinction."),
  source("identity-brown-high-school", "Syracuse Athletics", "Jim Brown to be Inducted into NYSPHSAA Hall of Fame", "https://cuse.com/news/2016/6/30/football-jim-brown-to-be-inducted-into-nysphsaa-hall-of-fame", "Jim Brown's extraordinary high-school basketball, football, lacrosse, and track profile."),
  source("identity-brown-army", "Syracuse Athletics", "Jim Brown Inducted into U.S. Army ROTC Hall of Fame", "https://cuse.com/news/2016/6/10/football-jim-brown-inducted-into-us-army-rotc-hall-of-fame", "Jim Brown's Army ROTC commission and Reserve service during his early NFL career."),
  source("identity-brown-acting", "Syracuse Athletics", "Jim Brown Named 2016 Arents Award Recipient", "https://cuse.com/news/2016/8/17/football-jim-brown-named-2016-arents-award-recipient", "Jim Brown retiring from football at age 30 and building an acting career."),
  source("identity-emmitt-florida-hof", "Florida Athletics", "Former Gator Emmitt Smith Enshrined into Pro Football Hall of Fame", "https://floridagators.com/news/2010/8/8/18476", "Emmitt Smith's Escambia background, Florida career, and 17th-overall draft selection."),
  source("identity-emmitt-florida-record", "Florida Athletics", "Emmitt Smith Sets NFL Rushing Record", "https://floridagators.com/news/2002/10/27/4825", "Emmitt Smith's high-school totals, three-year Florida record book, and later completion of his degree."),
  source("identity-emmitt-cowboys-moment", "Dallas Cowboys", "Doc of the Day: Emmitt Smith's Greatest Moment", "https://www.dallascowboys.com/news/doc-of-the-day-emmitt-smith-s-greatest-moment", "Emmitt Smith's 1993 contract holdout context and separated-shoulder performance against the Giants."),
  source("identity-lt-hof-spotlight", "Pro Football Hall of Fame", "Gold Jacket Spotlight: LaDainian Tomlinson Runs Idol's Handoff into NFL Stardom", "https://www.profootballhof.com/news/2025/03/gold-jacket-spotlight-ladainian-tomlinson-runs-idol%E2%80%99s-handoff-into-nfl-stardom/", "LaDainian Tomlinson's Emmitt Smith camp encounter, high-school position change, TCU position move, 406-yard game, and 2006 honors."),
  source("identity-moss-marshall-hof", "Marshall Athletics", "Randy Moss - Marshall Athletics Hall of Fame", "https://herdzone.com/honors/marshall-athletics-hall-of-fame/randy-moss/162", "Randy Moss' high-school multi-sport honors, Marshall title season, track career, and receiving breakthrough."),
  source("identity-moss-marshall-track", "Marshall Athletics", "Hall-Bound Moss Added to Legacy on Marshall Track Team", "https://herdzone.com/news/2018/8/4/word-on-the-herd-hall-bound-moss-added-to-legacy-on-marshall-track-team", "Randy Moss joining Marshall track immediately before the conference meet and winning sprint events."),
  source("identity-moss-pro-hof", "Pro Football Hall of Fame", "Randy Moss", "https://www.profootballhof.com/players/randy-moss", "Randy Moss' 21st-overall draft position and immediate NFL touchdown impact."),
  source("identity-owens-chattanooga", "Chattanooga Athletics", "Owens Inducted Into the SoCon Hall of Fame", "https://gomocs.com/news/2020/6/11/football-owens-inducted-into-the-socon-hall-of-fame", "Terrell Owens competing in football, basketball, and track at Chattanooga and helping the basketball program reach NCAA tournaments."),
  source("identity-owens-pro-hof", "Pro Football Hall of Fame", "Terrell Owens", "https://www.profootballhof.com/players/terrell-owens", "Terrell Owens' small-school third-round path and early career beside Jerry Rice."),
  source("identity-owens-nfl-enshrinement", "NFL.com", "The Real Terrell Owens: An insider's look at the Hall of Fame receiver", "https://www.nfl.com/news/the-real-terrell-owens", "Terrell Owens choosing to give his Hall of Fame speech at Chattanooga instead of Canton."),
  source("identity-mackey-pro-hof", "Pro Football Hall of Fame", "John Mackey", "https://www.profootballhof.com/players/john-mackey", "John Mackey's breakaway-speed tight-end identity, 1966 long touchdowns, and Super Bowl V touchdown."),
  source("identity-mackey-pro-hof-legacy", "Pro Football Hall of Fame", "John Mackey, 1941-2011", "https://www.profootballhof.com/news/john-mackey-1941-2011", "John Mackey's Syracuse running-back-to-tight-end path and role in changing how the position was used."),
  source("identity-mackey-nflpa-heroes", "NFLPA", "NFLPA Honors 60 Heroes", "https://nflpa.com/posts/nflpa-honors-60-heroes", "John Mackey's NFLPA presidency, Mackey v. NFL labor legacy, and the later 88 Plan named for him."),
  source("identity-joe-thomas-browns", "Cleveland Browns", "Joe Thomas - Offensive Tackle", "https://www.clevelandbrowns.com/team/history/hall-of-fame/joe-thomas", "Joe Thomas' 10,363-snap streak, 20 starting quarterbacks, and loyalty through Cleveland's difficult era."),
  source("identity-pace-ohio-state", "Ohio State Athletics", "Orlando Pace", "https://ohiostatebuckeyes.com/news/2007/6/27/orlando-pace?sidearmRedirect=true", "Orlando Pace starting immediately as a freshman, popularizing the pancake block, historic Lombardi Awards, Heisman finish, and first-overall draft selection."),
  source("identity-reggie-packers-100", "Green Bay Packers", "Reggie White named to NFL 100 All-Time Team", "https://www.packers.com/news/reggie-white-named-to-nfl-100-all-time-team", "Reggie White's ordained-minister identity, landmark 1993 free agency move, and Packers impact."),
  source("identity-reggie-packers-hof", "Green Bay Packers", "Packers Hall Of Fame To Induct Reggie White", "https://www.packers.com/news/packers-hall-of-fame-to-induct-reggie-white-2452048", "Reggie White's Minister of Defense identity, major free-agent signing, and Packers jersey retirement."),
  source("identity-butkus-illinois", "Illinois Athletics", "Dick Butkus - Hall of Fame", "https://fightingillini.com/honors/hall-of-fame/dick-butkus/14", "Dick Butkus' two-way center/linebacker role, Rose Bowl team, Heisman finish, and namesake linebacker award."),
  source("identity-butkus-bears-home", "Chicago Bears", "Butkus grateful to have played close to home", "https://www.chicagobears.com/news/butkus-grateful-to-have-played-close-to-home", "Dick Butkus' Chicago roots and decision between the NFL Bears and AFL Broncos."),
  source("identity-reed-miami", "University of Miami Athletics", "Edward Reed", "https://miamihurricanes.com/roster/edward-reed/", "Ed Reed's high-school multi-sport profile, Miami position move, track participation, and famous Boston College return."),
  source("identity-watt-wisconsin-journey", "Wisconsin Athletics", "Journey has shaped Watt on and off the field", "https://uwbadgers.com/news/2010/10/8/Journey_has_shaped_Watt_on_and_off_the_field", "J.J. Watt leaving Central Michigan, delivering pizzas, walking on at Wisconsin, gaining 40 pounds, and earning a scholarship before a regular-season snap."),
  source("identity-watt-wisconsin-hof", "Wisconsin Athletics", "UW Athletic Hall of Fame: J.J. Watt", "https://uwbadgers.com/news/2023/6/19/general-news-uw-athletic-hall-of-fame-j-j-watt-football", "J.J. Watt's hockey background and transition from Central Michigan tight end to Wisconsin defensive end."),
  source("identity-lombardi-fordham", "Fordham Athletics", "Vincent Lombardi - Hall of Fame", "https://fordhamsports.com/honors/hall-of-fame/vincent-lombardi/212/kiosk", "Vince Lombardi's Seven Blocks of Granite playing career, St. Cecilia teaching/coaching start, Army stop, and Giants-to-Packers path."),
  source("identity-lombardi-packers-guide", "Green Bay Packers", "2025 Green Bay Packers Media Guide - Vincent Thomas Lombardi", "https://static.www.nfl.com/league/apps/league-site/media-guides/2025/GB.pdf", "Vince Lombardi's post-Fordham law-school detour and teaching physics, chemistry, and Latin at St. Cecilia."),
  source("identity-shula-pro-hof", "Pro Football Hall of Fame", "Don Shula, 1930 - 2020", "https://www.profootballhof.com/news/don-shula-1930-2020", "Don Shula forging his parents' signatures to play high-school football, coaching high school, playing in the NFL, and becoming a head coach at 33."),
  source("identity-landry-pro-hof", "Pro Football Hall of Fame", "Tom Landry", "https://www.profootballhof.com/players/tom-landry", "Tom Landry's pro playing roles, Giants player-coach path, flex/multiple/shotgun innovations, and situation substitution."),
  source("identity-landry-cowboys", "Dallas Cowboys", "Ring of Honor: Tom Landry", "https://www.dallascowboys.com/news/ring-of-honor-tom-landry", "Tom Landry's trademark fedora, expansion-team beginning, and Cowboys innovation identity."),
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
  { subjectId: "nfl-patrick-mahomes", facts: [
    fact("father-major-league-pitcher", "baseball-family-background", "His father, Pat Mahomes, pitched in Major League Baseball for 11 seasons across six organizations.", ["identity-mahomes-texas-tech-baseball"], ["family", "baseball"]),
    fact("latroy-hawkins-godfather", "major-league-godfather", "Longtime Major League pitcher LaTroy Hawkins, a former teammate of his father, is his godfather.", ["identity-mahomes-texas-tech-2015-media", "identity-mahomes-mlb-baseball-past"], ["family", "baseball"]),
    fact("three-sport-high-school-star", "high-school-three-sport-profile", "At Whitehouse High School he starred in football, baseball, and basketball; as a senior he averaged 19 points and eight rebounds in basketball.", ["identity-mahomes-texas-tech-baseball"], ["high-school", "multi-sport"]),
    fact("sixteen-strikeout-no-hitter", "high-school-no-hitter", "As a high-school pitcher he threw a no-hitter with 16 strikeouts.", ["identity-mahomes-texas-tech-baseball"], ["high-school", "baseball"]),
    fact("tigers-2014-draft", "mlb-draft-choice", "The Detroit Tigers selected him in the 37th round of the 2014 MLB Draft before he chose the Texas Tech football-and-baseball path instead of signing.", ["identity-mahomes-texas-tech-baseball", "identity-mahomes-chiefs-two-sport-choice"], ["draft", "baseball"]),
    fact("texas-tech-two-sport", "college-two-sport-path", "He played both football and baseball at Texas Tech before committing full time to football after his freshman year.", ["identity-mahomes-chiefs-two-sport-choice"], ["college", "multi-sport"]),
    fact("major-league-clubhouse-childhood", "mlb-clubhouse-upbringing", "He grew up around Major League clubhouses, shagging fly balls as a preschooler and even receiving hitting advice from Alex Rodriguez.", ["identity-mahomes-mlb-baseball-past"], ["childhood", "baseball"]),
  ]},
  { subjectId: "barry-sanders", facts: [
    fact("senior-year-running-back-shot", "late-high-school-position-opportunity", "Wichita North did not give him his first real chance at running back until the fourth game of his senior season.", ["identity-barry-hof-born-to-run"], ["high-school", "position-path"]),
    fact("backed-up-thurman-thomas", "college-backup-to-thurman-thomas", "He spent his first two Oklahoma State seasons backing up future Hall of Famer Thurman Thomas.", ["identity-barry-osu-all-americans"], ["college", "teammate"]),
    fact("all-america-return-man", "college-return-specialist-breakthrough", "While still a backup tailback in 1987, he earned All-America recognition as a kickoff and punt returner.", ["identity-barry-osu-all-americans"], ["college", "special-teams"]),
    fact("1988-only-full-starting-season", "historic-lone-starting-season", "His 1988 Heisman season was his only complete year as Oklahoma State's starting tailback, and he established 34 NCAA records that season.", ["identity-barry-osu-all-americans"], ["college", "turning-point"]),
    fact("left-before-senior-season", "skipped-college-senior-season", "He left Oklahoma State for the NFL without playing his senior season.", ["identity-barry-osu-all-americans"], ["college", "career-path"]),
    fact("father-third-best-introduction", "hall-of-fame-father-introduction", "At his Pro Football Hall of Fame enshrinement, his father William introduced Barry as the third-best running back ever, behind Jim Brown and William himself.", ["identity-barry-hof-born-to-run"], ["family", "hall-of-fame"]),
    fact("osu-statue-and-ring", "oklahoma-state-campus-honor", "Oklahoma State unveiled a nine-foot statue of him in 2021 and made him one of the first two names in the Cowboy Football Ring of Honor.", ["identity-barry-osu-statue"], ["college", "legacy"]),
  ]},
  { subjectId: "nfl-jerry-rice", facts: [
    fact("brick-mason-family-work", "brick-masonry-upbringing", "As a child he spent summers helping his brick-mason father and caught bricks while working with his family.", ["identity-rice-upi-bricks"], ["childhood", "family", "work"]),
    fact("football-after-cutting-class", "high-school-football-discovery", "He did not start football until high school, when his speed drew attention after the principal chased him for cutting class.", ["identity-rice-nfl-appreciation"], ["high-school", "origin-story"]),
    fact("overlooked-by-big-programs", "small-school-recruiting-path", "Major Division I-A programs largely overlooked him, leaving Mississippi Valley State as the school that strongly pursued him.", ["identity-rice-hof-draft"], ["recruiting", "college"]),
    fact("cooley-scouted-basketball", "basketball-court-recruiting-evaluation", "Mississippi Valley State coach Archie Cooley evaluated him on a basketball court and decided the program had to recruit him.", ["identity-rice-hof-draft"], ["recruiting", "multi-sport"]),
    fact("eighteen-ncaa-records", "mississippi-valley-record-book", "He developed into a Mississippi Valley State star who set 18 NCAA Division I-AA records.", ["identity-rice-hof-draft"], ["college", "breakthrough"]),
    fact("49ers-traded-up", "san-francisco-draft-trade-up", "San Francisco traded up in the 1985 first round to draft him out of Mississippi Valley State.", ["identity-rice-nfl-appreciation"], ["draft", "career-turning-point"]),
    fact("edgewood-hill-workout", "signature-hill-training", "Roger Craig introduced him to the steep Edgewood Park hill workout that became a signature part of Rice's offseason conditioning.", ["identity-rice-49ers-hill"], ["training", "teammate"]),
  ]},
  { subjectId: "bill-belichick", facts: [
    fact("father-longtime-navy-coach", "navy-coaching-family", "His father, Steve Belichick, spent more than three decades coaching and scouting at the U.S. Naval Academy.", ["identity-belichick-wesleyan-hof", "identity-belichick-nfl-annapolis"], ["family", "navy", "coaching"]),
    fact("learned-film-from-father", "father-film-study-mentorship", "He learned to break down film from his father and remembers questioning him on the ride home from college football games about how he organized every substitution, penalty, and formation.", ["identity-belichick-nfl-scouting"], ["family", "film", "scouting"]),
    fact("father-scouting-methods-book", "family-scouting-method-legacy", "His father's 1962 book Football Scouting Methods became an influential part of the family's football identity and reflected the detailed scouting system Bill grew up around.", ["identity-belichick-nfl-scouting"], ["family", "scouting", "legacy"]),
    fact("preferred-lacrosse", "lacrosse-first-sport-preference", "Growing up in Annapolis, football was not his favorite sport; he preferred lacrosse.", ["identity-belichick-nfl-annapolis"], ["childhood", "lacrosse"]),
    fact("wesleyan-three-sport-captain", "wesleyan-multi-sport-profile", "At Wesleyan he lettered in football, lacrosse, and squash and captained the lacrosse team.", ["identity-belichick-wesleyan-alumni", "identity-belichick-wesleyan-hof"], ["college", "multi-sport", "lacrosse"]),
    fact("wesleyan-economics-major", "college-economics-major", "He majored in economics at Wesleyan.", ["identity-belichick-wesleyan-alumni"], ["college", "education"]),
    fact("colts-unpaid-to-twenty-five", "entry-level-nfl-origin", "His NFL career began with the 1975 Baltimore Colts at the lowest level of the staff: he initially worked for nothing, then was paid $25 a week after a few weeks of training camp.", ["identity-belichick-patriots-1975", "identity-belichick-wesleyan-hof"], ["coaching-path", "origin-story"]),
  ]},
  { subjectId: "nfl-jason-kelce", facts: [
    fact("preferred-walk-on-linebacker", "cincinnati-walk-on-origin", "He joined Cincinnati as a preferred walk-on after arriving as a linebacker without a Division I scholarship.", ["identity-kelce-nfl-brothers"], ["college", "walk-on"]),
    fact("scout-team-defensive-mvp", "cincinnati-scout-team-defense", "He was Cincinnati's Scout Team Defensive Player of the Year in 2006.", ["identity-kelce-cincinnati-roster"], ["college", "defense"]),
    fact("linebacker-fullback-offensive-line", "college-position-conversion", "At Cincinnati he moved from linebacker to fullback and ultimately to the offensive line.", ["identity-kelce-nfl-brothers"], ["college", "position-path"]),
    fact("high-school-linebacker-running-back", "high-school-two-way-profile", "At Cleveland Heights he was a league defensive MVP at linebacker with 105 senior tackles and also averaged 9.5 yards per carry as a running back.", ["identity-kelce-cincinnati-roster"], ["high-school", "two-way"]),
    fact("travis-followed-to-cincinnati", "brother-college-path", "Travis Kelce followed Jason's path to Cincinnati, where the brothers were Bearcats teammates.", ["identity-kelce-nfl-brothers", "identity-kelce-cincinnati-roster"], ["family", "college"]),
    fact("super-bowl-against-travis", "brothers-super-bowl-matchup", "He faced his brother Travis in Super Bowl LVII when Philadelphia played Kansas City.", ["identity-kelce-cincinnati-hof"], ["family", "iconic-moment"]),
    fact("new-heights-cohost", "new-heights-media-identity", "He co-hosts New Heights with his brother Travis Kelce.", ["identity-kelce-cincinnati-hof"], ["family", "media"]),
  ]},
  { subjectId: "nfl-aaron-donald", facts: [
    fact("father-morning-workouts", "childhood-weight-room-discipline", "His father Archie used morning weight workouts to give a young Aaron more discipline, beginning the training habit that became central to his identity.", ["identity-donald-nfl-family"], ["childhood", "family", "training"]),
    fact("brother-archie-toledo-linebacker", "football-playing-brother", "His older brother Archie played linebacker at Toledo.", ["identity-donald-pitt-roster"], ["family", "college"]),
    fact("high-school-offensive-guard", "high-school-two-way-line-play", "At Penn Hills he was known as a dominant defensive lineman but also started at offensive guard.", ["identity-donald-pitt-roster"], ["high-school", "two-way"]),
    fact("pitt-redshirt-plan-ended-in-practice", "freshman-scout-team-breakthrough", "Pitt planned to redshirt him as a freshman until his first padded scout-team work repeatedly disrupted the first-team offense because blockers could not contain him.", ["identity-donald-pitt-jersey"], ["college", "turning-point"]),
    fact("finished-pitt-degree", "parents-degree-promise", "Years into his NFL career he completed a Pitt bachelor's degree in communications because he had promised his parents he would finish it.", ["identity-donald-nfl-degree"], ["education", "family"]),
    fact("historic-pitt-donation", "pitt-giving-back", "He made a historic seven-figure gift to Pitt, the largest donation by a Pitt football letterman at the time, and the program's football performance center was named for him.", ["identity-donald-pitt-donation"], ["college", "off-field", "legacy"]),
  ]},
  { subjectId: "lawrence-taylor", facts: [
    fact("unc-1980-breakout", "unc-senior-defensive-takeover", "In 1980 at North Carolina he set the school record with 16 sacks, added 22 tackles for loss, and helped an 11-1 team win the ACC championship.", ["identity-taylor-unc-patterson"], ["college", "breakthrough"]),
    fact("game-saving-plays", "unc-game-saving-moments", "North Carolina credits him with game-saving defensive plays against both Texas Tech and Clemson during that 1980 season.", ["identity-taylor-unc-patterson"], ["college", "iconic-moment"]),
    fact("redefined-linebacker-attack", "linebacker-role-redefinition", "His speed-and-power attack style is credited with transforming outside-linebacker play from read-and-react toward aggressive attacking football.", ["identity-taylor-virginia-hof"], ["style", "legacy"]),
    fact("1988-torn-pectoral-game", "played-through-torn-pectoral", "In 1988 he played against New Orleans with a badly torn shoulder and pectoral area strapped in a harness and still produced seven tackles, three sacks, and two forced fumbles in a 13-12 Giants win.", ["identity-taylor-virginia-hof"], ["toughness", "iconic-moment"]),
  ]},
  { subjectId: "nfl-ray-lewis", facts: [
    fact("miami-last-scholarship", "final-miami-scholarship", "He received the final football scholarship Miami had available in its 1993 class.", ["identity-lewis-miami-hof"], ["recruiting", "college"]),
    fact("true-freshman-starter", "miami-immediate-starter", "He became a true-freshman starter at Miami and built a major program tackle résumé despite playing only three college seasons.", ["identity-lewis-miami-hof"], ["college", "breakthrough"]),
    fact("ravens-second-draft-pick", "ravens-franchise-origin", "He was the second draft choice in Baltimore Ravens franchise history, selected immediately after Jonathan Ogden in the 1996 first round.", ["identity-lewis-pro-hof"], ["draft", "franchise"]),
    fact("seventeen-years-one-raven", "one-franchise-career", "He played his entire 17-year NFL career with the Ravens.", ["identity-lewis-pro-hof"], ["career-path", "franchise"]),
    fact("foundation-and-ray-lewis-way", "baltimore-community-identity", "He founded the Ray Lewis 52 Foundation for disadvantaged youth, and Baltimore later renamed part of North Avenue 'Ray Lewis Way' in recognition of his charitable work.", ["identity-lewis-miami-community"], ["community", "off-field"]),
  ]},
  { subjectId: "deion-sanders", facts: [
    fact("three-sports-at-fsu", "florida-state-three-sport-freshman", "As a Florida State freshman he started at cornerback, played outfield for a nationally successful baseball team, and helped the track team win its conference championship.", ["identity-deion-fsu-hof"], ["college", "multi-sport"]),
    fact("high-school-all-state-three-sports", "high-school-three-sport-all-state", "At North Fort Myers High School he earned All-State recognition in football, baseball, and basketball.", ["identity-deion-espn-classic"], ["high-school", "multi-sport"]),
    fact("prime-time-nickname", "prime-time-identity", "He became known as 'Prime Time,' a nickname tied to the showmanship that followed him across sports.", ["identity-deion-espn-classic"], ["nickname", "media-identity"]),
    fact("drafted-by-falcons-and-yankees", "dual-pro-draft", "He was drafted professionally by both the Atlanta Falcons and the New York Yankees.", ["identity-deion-fsu-hof"], ["draft", "multi-sport"]),
    fact("four-major-league-clubs", "concurrent-major-league-career", "While building his NFL career he also played Major League Baseball for the Yankees, Braves, Reds, and Giants.", ["identity-deion-fsu-hof", "identity-deion-mlb-career"], ["baseball", "multi-sport"]),
    fact("same-day-nfl-nlcs-attempt", "same-day-two-sport-attempt", "In October 1992 he attempted to play an NFL game and an NLCS game on the same day.", ["identity-deion-mlb-career"], ["baseball", "iconic-moment"]),
    fact("world-series-and-super-bowl", "world-series-super-bowl-crossover", "He remains the only person to have played in both a World Series and a Super Bowl.", ["identity-deion-mlb-career"], ["multi-sport", "legacy"]),
  ]},
  { subjectId: "walter-payton", facts: [
    fact("drums-before-football", "music-before-football", "Before football became his focus, he preferred playing drums in the marching band and did not join organized high-school football until after his older brother Eddie moved on.", ["identity-payton-mississippi-encyclopedia"], ["high-school", "music", "family"]),
    fact("first-play-long-touchdown", "first-football-play-touchdown", "On his first play after joining the high-school football team, he ran 65 yards for a touchdown.", ["identity-payton-mississippi-encyclopedia"], ["high-school", "origin-story"]),
    fact("followed-eddie-to-jackson-state", "brother-college-path", "He followed his older brother Eddie to Jackson State.", ["identity-payton-mississippi-encyclopedia", "identity-payton-hof-bittersweet"], ["family", "college"]),
    fact("sec-recruiting-era", "segregation-era-recruiting-path", "He later wrote that major SEC programs such as Alabama, Mississippi State, and LSU did not recruit him in an era when those schools were only beginning to integrate their football programs, which helped shape his path to Jackson State.", ["identity-payton-bears-hbcu"], ["recruiting", "college"]),
    fact("sweetness-at-jackson-state", "sweetness-nickname-origin", "He acquired the nickname 'Sweetness' while at Jackson State.", ["identity-payton-hof-bittersweet"], ["nickname", "college"]),
    fact("communications-degree-fast", "accelerated-college-degree", "He earned a bachelor's degree in communications at Jackson State in three and a half years and began master's-level work.", ["identity-payton-hof-bittersweet"], ["education", "college"]),
  ]},
  { subjectId: "johnny-unitas", facts: [
    fact("steelers-cut-ninth-rounder", "pittsburgh-rejection", "Pittsburgh drafted him in the ninth round in 1955 but cut him before he threw a regular-season pass.", ["identity-unitas-pro-hof"], ["draft", "career-turning-point"]),
    fact("six-dollar-semi-pro", "bloomfield-rams-semi-pro", "After being cut, he played semi-pro football for the Bloomfield Rams for $6 a game.", ["identity-unitas-pro-hof", "identity-unitas-hof-high-tops"], ["career-path", "semi-pro"]),
    fact("construction-job", "construction-work-between-opportunities", "He worked construction to make ends meet while trying to keep his football career alive.", ["identity-unitas-hof-high-tops", "identity-unitas-la-times"], ["work", "career-path"]),
    fact("fan-letter-helped-colts-look", "fan-letter-baltimore-opportunity", "A fan's letter helped prompt Baltimore to take a look at him before the Colts brought him in for a tryout.", ["identity-unitas-la-times"], ["career-turning-point", "origin-story"]),
    fact("first-nfl-pass-pick-six", "first-pro-pass-interception-touchdown", "His first NFL pass was intercepted and returned for a touchdown.", ["identity-unitas-pro-hof"], ["career-start", "iconic-moment"]),
    fact("black-high-top-cleats", "iconic-high-top-shoes", "He kept wearing black high-top cleats into the 1970s even after low-cut white shoes had become the norm, making the footwear part of his signature image.", ["identity-unitas-hof-high-tops"], ["style", "visual-identity"]),
  ]},
  { subjectId: "bill-walsh", facts: [
    fact("average-end-and-boxer", "san-jose-state-playing-background", "At San Jose State he described himself as an average end and also boxed.", ["identity-walsh-nfl-obituary"], ["college", "multi-sport"]),
    fact("washington-high-football-and-swim", "high-school-coaching-origin", "He began his coaching career at Washington High School in Fremont, where he led both the football and swim teams.", ["identity-walsh-nfl-obituary"], ["coaching-path", "high-school"]),
    fact("marv-levy-first-college-job", "marv-levy-career-bridge", "Marv Levy hired him from the high-school ranks into his first college coaching job at California.", ["identity-walsh-nfl-obituary", "identity-walsh-nfl-bio"], ["coaching-path", "relationship"]),
    fact("offense-born-in-cincinnati", "cincinnati-west-coast-origin", "The passing system later called the West Coast offense was developed while he worked for Paul Brown in Cincinnati, not after he arrived in San Francisco.", ["identity-walsh-nfl-bio", "identity-walsh-ohio-river"], ["coaching", "innovation"]),
    fact("cook-injury-forced-redesign", "greg-cook-injury-offensive-pivot", "Greg Cook's career-changing shoulder injury pushed Walsh and the Bengals toward the short, high-percentage passing concepts that became the foundation of that offense.", ["identity-walsh-ohio-river"], ["coaching", "turning-point"]),
    fact("first-nfl-head-job-at-47", "late-head-coaching-breakthrough", "He did not receive his first NFL head-coaching job until age 47, when San Francisco hired him in 1979.", ["identity-walsh-pro-hof"], ["coaching-path", "career-turning-point"]),
    fact("two-fourteen-to-title", "49ers-three-year-turnaround", "He took over a 49ers team coming off a 2-14 season and delivered the franchise's first NFL championship within three years.", ["identity-walsh-pro-hof"], ["coaching", "turnaround"]),
    fact("influential-coaching-tree", "coaching-tree-legacy", "His staff became the root of an unusually influential coaching tree that included future head coaches such as Mike Holmgren, George Seifert, and Dennis Green.", ["identity-walsh-nfl-bio"], ["coaching", "relationships", "legacy"]),
  ]},

  { subjectId: "tom-brady", facts: [
    fact("expos-drafted-catcher", "baseball-draft-option", "The Montreal Expos selected him as a catcher in the 18th round of the 1995 MLB Draft before he chose Michigan football.", ["identity-brady-mlb-draft"], ["baseball", "draft"]),
    fact("backed-up-griese-title-team", "michigan-backup-to-griese", "He spent the 1997 national-championship season backing up Brian Griese at Michigan.", ["identity-brady-nfl-michigan"], ["college", "career-path"]),
    fact("henson-quarterback-competition", "michigan-henson-competition", "Even after becoming a starter, he had to keep competing for snaps with highly touted Drew Henson during his final Michigan seasons.", ["identity-brady-nfl-michigan"], ["college", "competition"]),
    fact("michigan-team-captain", "michigan-captaincy", "Michigan teammates elected him a captain for his final season, an honor he later described as especially meaningful.", ["identity-brady-michigan-orange"], ["college", "leadership"]),
    fact("pick-199-kept-four-qbs", "late-draft-roster-survival", "New England drafted him 199th overall in 2000 and kept him as a fourth quarterback on the roster as a rookie.", ["identity-brady-nfl-michigan"], ["draft", "career-start"]),
  ]},
  { subjectId: "peyton-manning", facts: [
    fact("high-school-all-state-shortstop", "prep-baseball-shortstop", "At Isidore Newman he also starred at shortstop and earned second-team all-state baseball honors.", ["identity-peyton-tennessee-roster"], ["high-school", "baseball"]),
    fact("freshman-path-through-two-injuries", "tennessee-depth-chart-injuries", "As a true freshman he moved into Tennessee's quarterback job after injuries first to Jerry Colquitt and then to baseball star Todd Helton.", ["identity-peyton-tennessee-roster"], ["college", "turning-point"]),
    fact("seven-one-freshman-starter", "freshman-starting-breakthrough", "He went 7-1 in eight starts as a true freshman and was named SEC Freshman of the Year.", ["identity-peyton-tennessee-roster"], ["college", "breakthrough"]),
    fact("degree-in-three-years", "accelerated-tennessee-degree", "He completed his Tennessee bachelor's degree in speech communication in three years.", ["identity-peyton-academic-hof"], ["education", "college"]),
    fact("returned-for-senior-season", "senior-year-return-decision", "Already a top NFL prospect and a college graduate, he chose to return to Tennessee for his senior season in 1997.", ["identity-peyton-academic-hof"], ["college", "career-decision"]),
  ]},
  { subjectId: "brett-favre", facts: [
    fact("father-coached-wishbone", "father-wishbone-background", "His father Irvin coached him in a wishbone offense at Hancock North Central that often asked him to throw only four or five times a game.", ["identity-favre-southern-miss"], ["family", "high-school"]),
    fact("little-known-recruit", "overlooked-high-school-quarterback", "That run-heavy high-school role left him little known as a quarterback recruit before Southern Miss signed him.", ["identity-favre-southern-miss"], ["recruiting", "high-school"]),
    fact("third-string-tulane-breakthrough", "third-string-college-breakthrough", "As a Southern Miss freshman he came off the bench as the third-string quarterback against Tulane and seized the opportunity that launched his college career.", ["identity-favre-southern-miss"], ["college", "turning-point"]),
    fact("car-crash-intestine-surgery", "1990-car-crash-surgery", "A serious 1990 car crash led to surgery that removed roughly 30 inches of his small intestine.", ["identity-favre-southern-miss"], ["adversity", "college"]),
    fact("returned-one-month-alabama", "post-crash-alabama-return", "One month after that crash and surgery, he returned to quarterback Southern Miss in a victory over Alabama.", ["identity-favre-southern-miss"], ["adversity", "comeback"]),
  ]},
  { subjectId: "joe-montana", facts: [
    fact("nearly-left-notre-dame", "notre-dame-early-doubt", "As a young Notre Dame backup he seriously considered leaving before academic adviser Mike DeCicco convinced him to stay.", ["identity-montana-notre-dame-heart"], ["college", "turning-point"]),
    fact("lost-season-shoulder-injury", "1976-shoulder-lost-season", "A shoulder injury cost him the 1976 season and left him third on Notre Dame's depth chart entering 1977.", ["identity-montana-notre-dame-heart"], ["college", "adversity"]),
    fact("purdue-comeback-won-job", "1977-purdue-breakthrough", "Called on with Notre Dame down 24-14 at Purdue in 1977, he produced 17 points in the final 11 minutes and took control of the starting job.", ["identity-montana-notre-dame-heart", "identity-montana-nd-banquet"], ["college", "comeback"]),
    fact("chicken-soup-game", "1979-cotton-bowl-flu-comeback", "In his final college game, the flu-stricken quarterback returned after being warmed with blankets and chicken soup and led a 34-12 comeback to beat Houston 35-34.", ["identity-montana-notre-dame-heart"], ["college", "iconic-moment"]),
    fact("third-round-pick-82", "third-round-draft-entry", "San Francisco selected him in the third round of the 1979 draft, 82nd overall.", ["identity-montana-nd-banquet"], ["draft", "career-start"]),
  ]},
  { subjectId: "nfl-aaron-rodgers", facts: [
    fact("no-major-high-school-recruitment", "high-school-recruiting-overlook", "He received no major college football recruitment out of high school and began at Butte College.", ["identity-rodgers-packers-draft"], ["recruiting", "junior-college"]),
    fact("butte-jc-all-american", "butte-junior-college-breakthrough", "In his only Butte College season he earned junior-college All-America honors after throwing 28 touchdowns and four interceptions.", ["identity-rodgers-cal-bio"], ["junior-college", "breakthrough"]),
    fact("discovered-on-tight-end-tape", "garrett-cross-recruiting-discovery", "Cal discovered him while evaluating film of his Butte teammate, tight end Garrett Cross.", ["identity-rodgers-cal-discovery", "identity-rodgers-packers-draft"], ["recruiting", "teammate"]),
    fact("nineteen-year-old-cal-breakthrough", "teenage-cal-breakthrough", "At 19, with almost no major-college experience, he immediately emerged as Cal's quarterback and set bowl passing records in the 2003 Insight Bowl.", ["identity-rodgers-cal-bio"], ["college", "breakthrough"]),
    fact("draft-day-slide-to-24", "2005-draft-wait", "After entering the 2005 draft with expectations of going near the top, he endured a long first-round wait before Green Bay selected him 24th.", ["identity-rodgers-packers-draft"], ["draft", "career-turning-point"]),
  ]},
  { subjectId: "jim-brown", facts: [
    fact("high-school-basketball-38-ppg", "prep-basketball-dominance", "In high school he was a multi-sport star who averaged roughly 38 points per game in basketball as a senior.", ["identity-brown-high-school"], ["high-school", "basketball"]),
    fact("syracuse-four-sport-letterman", "syracuse-four-sport-profile", "At Syracuse he lettered in football, lacrosse, basketball, and track.", ["identity-brown-syracuse-bio"], ["college", "multi-sport"]),
    fact("football-and-lacrosse-halls", "dual-sport-hall-of-fame", "He became a member of both the College and Pro Football Halls of Fame as well as the National Lacrosse Hall of Fame.", ["identity-brown-syracuse-bio"], ["multi-sport", "legacy"]),
    fact("army-rotc-officer", "army-reserve-service", "Syracuse Army ROTC commissioned him as a second lieutenant, and he served in the Army Reserve while beginning his NFL career.", ["identity-brown-army"], ["military", "off-field"]),
    fact("retired-at-30-for-acting", "early-retirement-acting-career", "He retired from football at age 30 while still at the top of the sport and built a substantial acting career.", ["identity-brown-acting"], ["career-decision", "acting"]),
  ]},
  { subjectId: "emmitt-smith", facts: [
    fact("escambia-8804-yards", "historic-high-school-rushing", "At Escambia High School he finished with 8,804 rushing yards and 106 touchdowns, among the highest prep totals of the era.", ["identity-emmitt-florida-record"], ["high-school", "breakthrough"]),
    fact("florida-58-school-records", "florida-record-book-takeover", "In only three seasons at Florida he established 58 school records.", ["identity-emmitt-florida-record"], ["college", "legacy"]),
    fact("returned-for-florida-degree", "returned-to-finish-degree", "Years after leaving for the NFL, he returned to Florida and completed his degree in 1996.", ["identity-emmitt-florida-record"], ["education", "college"]),
    fact("1993-contract-holdout", "super-bowl-champion-holdout", "He opened the 1993 season in a contract holdout while the defending champion Cowboys started 0-2 without him.", ["identity-emmitt-cowboys-moment"], ["career-decision", "turning-point"]),
    fact("separated-shoulder-giants", "1993-giants-injury-game", "In the 1993 regular-season finale against the Giants he played through a separated shoulder to help Dallas clinch the division and home-field advantage.", ["identity-emmitt-cowboys-moment"], ["toughness", "iconic-moment"]),
  ]},
  { subjectId: "ladainian-tomlinson", facts: [
    fact("emmitt-smith-youth-camp", "emmitt-smith-formative-encounter", "At a youth football camp, his idol Emmitt Smith unexpectedly handed him the ball for a rep and encouraged him, a moment Tomlinson later described as confidence-changing.", ["identity-lt-hof-spotlight"], ["childhood", "relationship"]),
    fact("fullback-linebacker-before-senior", "late-high-school-running-back-move", "He played fullback and linebacker through his junior high-school season before getting his first running-back start as a senior.", ["identity-lt-hof-spotlight"], ["high-school", "position-path"]),
    fact("six-touchdowns-first-rb-start", "first-running-back-start-breakout", "In that first high-school start at running back, he scored six touchdowns.", ["identity-lt-hof-spotlight"], ["high-school", "breakthrough"]),
    fact("tcu-fullback-to-tailback", "tcu-position-change", "TCU initially viewed him as a fullback before coach Dennis Franchione moved him to tailback.", ["identity-lt-hof-spotlight"], ["college", "position-path"]),
    fact("first-fbs-400-yard-game", "historic-406-yard-game", "At TCU he became the first major-college player to rush for 400 yards in a game, gaining 406 against UTEP.", ["identity-lt-hof-spotlight"], ["college", "iconic-moment"]),
  ]},
  { subjectId: "nfl-randy-moss", facts: [
    fact("wv-football-basketball-poy", "west-virginia-two-sport-player-of-year", "In high school he was named West Virginia player of the year in both football and basketball.", ["identity-moss-marshall-hof"], ["high-school", "multi-sport"]),
    fact("marshall-i-aa-title", "undefeated-marshall-title-season", "His first Marshall team went 15-0 and won the Division I-AA national championship while he caught 28 touchdown passes.", ["identity-moss-marshall-hof"], ["college", "breakthrough"]),
    fact("track-team-instant-champion", "marshall-sprint-crossover", "He joined Marshall's track team shortly before its conference meet and immediately won sprint events despite barely practicing with the team.", ["identity-moss-marshall-track"], ["college", "track"]),
    fact("marshall-i-a-transition-star", "marshall-level-transition", "When Marshall moved to Division I-A in 1997, he remained dominant and became a Heisman finalist rather than fading against the higher level.", ["identity-moss-marshall-hof"], ["college", "transition"]),
    fact("drafted-21st-then-17-td", "draft-slide-rookie-response", "Minnesota selected him 21st in the 1998 draft, and he answered with 17 touchdown catches as a rookie.", ["identity-moss-pro-hof"], ["draft", "career-start"]),
  ]},
  { subjectId: "nflverse-player-00-0012478", facts: [
    fact("chattanooga-three-sport", "college-three-sport-profile", "At Chattanooga he competed in football, men's basketball, and track and field.", ["identity-owens-chattanooga"], ["college", "multi-sport"]),
    fact("basketball-ncaa-tournaments", "chattanooga-basketball-success", "He helped Chattanooga basketball win Southern Conference regular-season and tournament titles and reach consecutive NCAA tournaments.", ["identity-owens-chattanooga"], ["college", "basketball"]),
    fact("little-known-third-rounder", "small-school-third-round-path", "San Francisco drafted him in the third round out of little-known Tennessee-Chattanooga in 1996.", ["identity-owens-pro-hof"], ["draft", "small-school"]),
    fact("developed-beside-jerry-rice", "early-career-rice-relationship", "He developed for most of his first eight San Francisco seasons alongside Jerry Rice.", ["identity-owens-pro-hof"], ["teammate", "career-start"]),
    fact("hall-speech-at-chattanooga", "alma-mater-enshrinement-choice", "When inducted into the Pro Football Hall of Fame, he chose to deliver his enshrinement speech at Chattanooga rather than attend the Canton ceremony.", ["identity-owens-nfl-enshrinement"], ["college", "hall-of-fame"]),
  ]},
  { subjectId: "john-mackey", facts: [
    fact("syracuse-running-back-to-tight-end", "college-position-conversion", "He played running back for two seasons at Syracuse before moving to tight end, the position he would later help redefine in the NFL.", ["identity-mackey-pro-hof-legacy"], ["college", "position-path"]),
    fact("redefined-tight-end-deep-threat", "tight-end-role-redefinition", "His breakaway speed helped change the tight end from primarily an extra blocker into a legitimate downfield receiving threat.", ["identity-mackey-pro-hof", "identity-mackey-pro-hof-legacy"], ["style", "legacy"]),
    fact("six-long-touchdowns-1966", "1966-long-touchdown-season", "In 1966, six of his nine touchdown catches came on plays of at least 51 yards.", ["identity-mackey-pro-hof"], ["career", "big-play"]),
    fact("super-bowl-v-deflection-touchdown", "super-bowl-v-75-yard-touchdown", "In Super Bowl V he caught a deflected Johnny Unitas pass and turned it into a 75-yard touchdown, then a Super Bowl record for touchdown-pass length.", ["identity-mackey-pro-hof"], ["iconic-moment", "super-bowl"]),
    fact("nflpa-president-mackey-v-nfl", "player-labor-leadership", "He served as NFLPA president and later became the lead named plaintiff in Mackey v. NFL, the antitrust case that helped break the Rozelle Rule's control over player movement.", ["identity-mackey-nflpa-heroes"], ["off-field", "labor", "legacy"]),
  ]},
  { subjectId: "nfl-joe-thomas", facts: [
    fact("ten-thousand-snap-streak", "historic-consecutive-snap-streak", "He played 10,363 consecutive offensive snaps, a streak the Browns describe as the longest believed in NFL history.", ["identity-joe-thomas-browns"], ["durability", "legacy"]),
    fact("twenty-starting-quarterbacks", "blocked-for-twenty-quarterbacks", "During one Cleveland career he blocked for 20 different starting quarterbacks.", ["identity-joe-thomas-browns"], ["teammates", "franchise"]),
    fact("stayed-through-losing-era", "cleveland-loyalty", "He stayed with Cleveland for all 11 seasons even though the Browns produced only one winning season during his career.", ["identity-joe-thomas-browns"], ["franchise", "career-decision"]),
    fact("ten-straight-pro-bowls", "decade-long-pro-bowl-opening", "He was selected to the Pro Bowl in each of his first 10 NFL seasons.", ["identity-joe-thomas-browns"], ["career", "consistency"]),
    fact("first-ballot-browns-tackle", "first-ballot-hall-entry", "His durability and dominance made him a first-ballot Pro Football Hall of Famer, only the seventh offensive tackle to receive that distinction at the time.", ["identity-joe-thomas-browns"], ["hall-of-fame", "legacy"]),
  ]},
  { subjectId: "nfl-orlando-pace", facts: [
    fact("started-first-day-freshman-camp", "immediate-ohio-state-starter", "He broke into Ohio State's starting lineup on the first day of preseason camp as a freshman and started every game of his three-year college career.", ["identity-pace-ohio-state"], ["college", "breakthrough"]),
    fact("pancake-block-famous", "pancake-block-identity", "His dominant style made the 'pancake block' famous, with Ohio State crediting him with 80 such blocks in his junior season.", ["identity-pace-ohio-state"], ["college", "style"]),
    fact("first-sophomore-lombardi", "historic-lombardi-award", "He became the first sophomore to win the Lombardi Award and then the first player to win it twice.", ["identity-pace-ohio-state"], ["college", "award"]),
    fact("fourth-in-heisman", "lineman-heisman-finish", "As a junior he finished fourth in Heisman voting, an exceptionally high finish for an offensive lineman.", ["identity-pace-ohio-state"], ["college", "award"]),
    fact("first-overall-1997", "offensive-lineman-first-overall", "He skipped his senior season and the St. Louis Rams selected him first overall in the 1997 NFL Draft.", ["identity-pace-ohio-state"], ["draft", "career-decision"]),
  ]},
  { subjectId: "nfl-reggie-white", facts: [
    fact("ordained-minister", "minister-before-pro-football", "He was an ordained minister, a real-life identity that became inseparable from his football nickname.", ["identity-reggie-packers-100"], ["faith", "off-field"]),
    fact("minister-of-defense", "minister-of-defense-nickname", "His combination of ministry and pass-rushing dominance produced the enduring nickname 'Minister of Defense.'", ["identity-reggie-packers-100", "identity-reggie-packers-hof"], ["nickname", "identity"]),
    fact("landmark-1993-free-agent", "free-agency-landmark", "His 1993 signing with Green Bay was the signature star move at the dawn of modern unrestricted NFL free agency.", ["identity-reggie-packers-100"], ["career-decision", "league-history"]),
    fact("packers-defense-immediate-rise", "green-bay-defensive-turnaround", "Green Bay's defense jumped from 23rd in the league before his arrival to No. 2 in his first Packers season.", ["identity-reggie-packers-hof"], ["team-impact", "turning-point"]),
    fact("packers-retired-92", "green-bay-number-retirement", "The Packers retired his No. 92 after his death, recognizing the unusually large impact of only six seasons in Green Bay.", ["identity-reggie-packers-hof"], ["legacy", "visual-identity"]),
  ]},
  { subjectId: "nfl-dick-butkus", facts: [
    fact("chicago-to-illinois-to-bears", "hometown-football-path", "His football path stayed close to home: Chicago high school, the University of Illinois, and then the Chicago Bears.", ["identity-butkus-bears-home"], ["hometown", "career-path"]),
    fact("two-way-center-linebacker", "illinois-two-way-star", "At Illinois he starred on both sides of the ball, playing center on offense and linebacker on defense.", ["identity-butkus-illinois"], ["college", "two-way"]),
    fact("third-1964-heisman", "linebacker-heisman-finish", "He finished third in the 1964 Heisman Trophy voting as a linebacker.", ["identity-butkus-illinois"], ["college", "award"]),
    fact("bears-and-broncos-drafted", "dual-league-draft-choice", "In 1965 both the NFL's Bears and the AFL's Denver Broncos drafted him, giving him a direct choice between rival leagues.", ["identity-butkus-bears-home"], ["draft", "career-decision"]),
    fact("award-bears-his-name", "butkus-award-namesake", "The major annual award for college football's top linebacker carries his name: the Butkus Award.", ["identity-butkus-illinois"], ["legacy", "award"]),
  ]},
  { subjectId: "nfl-ed-reed", facts: [
    fact("high-school-four-football-roles", "prep-multi-position-football", "In high school he contributed at defensive back and kick returner while also seeing time at running back and quarterback.", ["identity-reed-miami"], ["high-school", "position-path"]),
    fact("basketball-and-track-athlete", "prep-multi-sport-profile", "He averaged about 20 points per game in basketball and was a state-level track athlete in events ranging from the javelin to relays and jumps.", ["identity-reed-miami"], ["high-school", "multi-sport"]),
    fact("miami-track-participant", "college-track-crossover", "He also competed for Miami's track and field program while building his football career.", ["identity-reed-miami"], ["college", "track"]),
    fact("strong-to-free-safety", "miami-safety-position-move", "Miami moved him from strong safety to free safety for his senior season.", ["identity-reed-miami"], ["college", "position-path"]),
    fact("boston-college-lateral-return", "2001-boston-college-lateral", "Against Boston College in 2001, he took the ball from teammate Matt Walters after an interception and raced 80 yards for the clinching touchdown.", ["identity-reed-miami"], ["college", "iconic-moment"]),
  ]},
  { subjectId: "nfl-j-j-watt", facts: [
    fact("childhood-hockey", "competitive-hockey-background", "He played organized hockey from early childhood into his teens before football became his full focus.", ["identity-watt-wisconsin-hof"], ["childhood", "hockey"]),
    fact("central-michigan-tight-end", "college-tight-end-origin", "He began college on scholarship as a tight end at Central Michigan rather than as a defensive lineman.", ["identity-watt-wisconsin-journey", "identity-watt-wisconsin-hof"], ["college", "position-path"]),
    fact("left-scholarship-to-walk-on", "wisconsin-walk-on-gamble", "After one Central Michigan season he gave up his scholarship and starting role to pursue a walk-on opportunity at Wisconsin as a defensive end.", ["identity-watt-wisconsin-journey"], ["college", "career-decision"]),
    fact("pizza-delivery-and-forty-pounds", "transfer-year-transformation", "Between schools he took community-college classes, delivered pizzas, and trained from about 245 to 285 pounds before arriving at Wisconsin.", ["identity-watt-wisconsin-journey"], ["work", "training", "college"]),
    fact("scholarship-before-game-snap", "scout-team-scholarship-breakthrough", "His Wisconsin scout-team work was so strong that he earned a scholarship before playing a regular-season snap for the Badgers.", ["identity-watt-wisconsin-journey"], ["college", "breakthrough"]),
  ]},
  { subjectId: "vince-lombardi", facts: [
    fact("seven-blocks-of-granite", "fordham-seven-blocks", "At Fordham he played guard on the celebrated 'Seven Blocks of Granite' line.", ["identity-lombardi-fordham"], ["college", "playing-career"]),
    fact("brief-law-school-detour", "post-college-law-school", "After Fordham he briefly enrolled in law school before moving into teaching and coaching.", ["identity-lombardi-packers-guide"], ["education", "career-path"]),
    fact("taught-science-and-latin", "st-cecilia-teaching-identity", "At St. Cecilia High School he taught physics, chemistry, and Latin while coaching football and basketball.", ["identity-lombardi-packers-guide"], ["teaching", "coaching-path"]),
    fact("army-to-giants-apprenticeship", "pre-packers-coaching-path", "His path to Green Bay ran through assistant jobs at Fordham, Army under Red Blaik, and the New York Giants.", ["identity-lombardi-fordham"], ["coaching-path", "relationships"]),
    fact("returned-after-packers-retirement", "washington-coaching-return", "After retiring following the 1967 season, he returned to coaching with Washington rather than ending his career in Green Bay.", ["identity-lombardi-fordham"], ["coaching-path", "career-decision"]),
  ]},
  { subjectId: "don-shula", facts: [
    fact("forged-parents-signatures", "high-school-football-rebellion", "He forged his parents' signatures so he could play high-school football after they initially forbade it.", ["identity-shula-pro-hof"], ["high-school", "origin-story"]),
    fact("high-school-coach-before-nfl", "coached-before-playing-pro", "After college he spent a year coaching high-school football before the Cleveland Browns drafted him as a player.", ["identity-shula-pro-hof"], ["coaching-path", "career-start"]),
    fact("seven-year-nfl-defensive-back", "pro-playing-career", "Before becoming a famous coach, he played seven NFL seasons as a defensive back for Cleveland, Baltimore, and Washington.", ["identity-shula-pro-hof"], ["playing-career", "coaching-path"]),
    fact("head-coach-at-thirty-three", "youngest-head-coach-breakthrough", "Baltimore made him an NFL head coach at age 33, then the youngest head coach in league history.", ["identity-shula-pro-hof"], ["coaching-path", "breakthrough"]),
    fact("colts-before-dolphins", "two-franchise-head-coach-identity", "His head-coaching legacy began with seven winning seasons in Baltimore before the move to Miami that defined the rest of his career.", ["identity-shula-pro-hof"], ["coaching-path", "franchise"]),
  ]},
  { subjectId: "tom-landry", facts: [
    fact("pro-db-punter-returner", "multi-role-playing-career", "Before coaching, he played professionally as a defensive back, punter, and kick returner.", ["identity-landry-pro-hof"], ["playing-career", "multi-role"]),
    fact("giants-player-coach", "player-coach-transition", "The Giants made him a player-coach in 1954 and 1955 before he became a full-time defensive coach.", ["identity-landry-pro-hof"], ["coaching-path", "transition"]),
    fact("flex-defense-innovation", "flex-defense-identity", "He introduced the flex defense, one of the schematic ideas most closely associated with his coaching identity.", ["identity-landry-pro-hof", "identity-landry-cowboys"], ["coaching", "innovation"]),
    fact("revived-shotgun-and-substitution", "offensive-and-personnel-innovation", "He later revived the shotgun and helped popularize situational substitutions, continuing to change how teams organized offense and personnel.", ["identity-landry-pro-hof", "identity-landry-cowboys"], ["coaching", "innovation"]),
    fact("trademark-fedora", "sideline-fedora-identity", "His fedora became a trademark part of his sideline image during 29 seasons as the Cowboys' original head coach.", ["identity-landry-cowboys"], ["visual-identity", "coaching"]),
  ]},
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
