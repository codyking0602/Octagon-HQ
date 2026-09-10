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
  source("identity-layne-texas-baseball-hof", "Texas Athletics", "Layne, Street selected to National College Baseball Hall of Fame", "https://texaslonghorns.com/news/2026/6/22/layne-street-selected-to-national-college-baseball-hall-of-fame", "Bobby Layne's 35-3 Texas pitching record, perfect Southwest Conference mark, and two 1946 no-hitters."),
  source("identity-layne-texas-college-hof", "Texas Athletics", "College Football Hall of Fame", "https://texaslonghorns.com/sports/2013/7/21/FB_0721133239", "Bobby Layne's Texas two-sport identity, friendship with Doak Walker, and all-points Cotton Bowl performance."),
  source("identity-layne-texas-merchant-marine", "Texas Athletics", "Bill Little commentary: The quarterback's tale", "https://texaslonghorns.com/news/2007/11/1/110107aad_522", "Bobby Layne returning to Texas after a Merchant Marine stint."),
  source("identity-layne-pro-hof", "Pro Football Hall of Fame", "Bobby Layne", "https://www.profootballhof.com/players/bobby-layne", "Bobby Layne's Detroit relationship with Buddy Parker, Doak Walker championship connection, and trade to Parker's Steelers."),
  source("identity-brees-nbc-recruiting", "NBC Sports", "TRANSCRIPT - DREW BREES INTRODUCTORY CONFERENCE CALL", "https://www.nbcsports.com/pressbox/nfl/press-releases/transcript-drew-brees-introductory-conference-call", "Drew Brees' 16-0 Westlake state-title season and limited college recruitment."),
  source("identity-brees-saints-making-champion", "New Orleans Saints", "Drew Brees' Hall of Fame journey: Making a champion", "https://www.neworleanssaints.com/news/drew-brees-hall-of-fame-journey-making-a-champion-inside-stories", "Drew Brees' shoulder reconstruction and Tom House-assisted throwing-mechanics rebuild."),
  source("identity-brees-saints-lakeview", "New Orleans Saints", "Q&A with Drew Brees about playing 10 years in New Orleans", "https://www.neworleanssaints.com/news/q-a-with-drew-brees-about-playing-10-years-in-new-orleans-16931883", "Drew Brees' first New Orleans visit and the Lakeview wrong turn that shaped his connection to the city."),
  source("identity-brees-saints-hall-quotes", "New Orleans Saints", "9 quotes from Drew Brees' Saints Hall of Fame announcement", "https://www.neworleanssaints.com/news/9-quotes-drew-brees-quarterback-saints-hall-of-fame-announcement", "Drew Brees describing Sean Payton's plan to build the Saints offense around his strengths."),
  source("identity-tarkenton-pro-hof", "Pro Football Hall of Fame", "Fran Tarkenton", "https://www.profootballhof.com/players/fran-tarkenton", "Fran Tarkenton's expansion-Vikings debut, scrambling identity, and conflict with Norm Van Brocklin's traditional quarterback preferences."),
  source("identity-tarkenton-hof-spotlight", "Pro Football Hall of Fame", "Gold Jacket Spotlight: Fran Tarkenton scrambles into record book", "https://www.profootballhof.com/news/gold-jacket-spotlight-fran-tarkenton-scrambles-into-record-book", "Fran Tarkenton's minister-family upbringing and explanation that scrambling grew from self-preservation."),
  source("identity-tarkenton-nff", "National Football Foundation", "Fran Tarkenton", "https://footballfoundation.org/honors/hall-of-fame/fran-tarkenton/1778", "Fran Tarkenton's Georgia career and fourth-down 1959 Auburn touchdown that helped clinch the SEC title."),
  source("identity-warner-rams-road", "Los Angeles Rams", "Kurt Warner Reflects on Road to the Hall of Fame", "https://www.therams.com/news/kurt-warner-reflects-on-road-to-the-hall-of-fame-19119237", "Kurt Warner's one-college-start path, Packers cut, Hy-Vee job, Arena Football and NFL Europe route, and Trent Green injury opening."),
  source("identity-warner-cardinals-renaissance", "Arizona Cardinals", "Folktales: Renaissance Man", "https://www.azcardinals.com/news/longform/folktales-renaissance-man-kurt-warner-hall-of-fame-career", "Kurt Warner's Arizona displacement, retirement consideration, reclaimed starting job, and Super Bowl second act."),
  source("identity-baugh-pro-hof", "Pro Football Hall of Fame", "Sammy Baugh", "https://www.profootballhof.com/players/sammy-baugh", "Sammy Baugh's quarterback, defensive-back and punter roles and dry response after Washington's 73-0 title-game loss."),
  source("identity-baugh-hof-1943", "Pro Football Hall of Fame", "Analysis: An Appreciation of Sammy Baugh's Historic 1943 Season", "https://www.profootballhof.com/news/analysis-an-appreciation-of-sammy-baugh-s-historic-1943-season", "Sammy Baugh's four-touchdown, four-interception, 81-yard-punt game against Detroit in 1943."),
  source("identity-baugh-nff", "National Football Foundation", "Sammy Baugh", "https://footballfoundation.org/honors/hall-of-fame/sammy-baugh/1537", "Sammy Baugh's TCU career and 14-punt performance in the 1936 Sugar Bowl."),
  source("identity-baugh-nfl-ap", "NFL.com / Associated Press", "Baugh, member of inaugural Hall of Fame class, dies at 94", "https://www.nfl.com/news/baugh-member-of-inaugural-hall-of-fame-class-dies-at-94-09000d5d80d6988a", "Sammy Baugh's West Texas ranching and roping identity and 73-7 championship-loss quip."),
  source("identity-pr6-bart-starr", "Pro Football Hall of Fame", "Bart Starr", "https://www.profootballhof.com/players/bart-starr/", "Bart Starr research covering five distinctive identity concepts."),
  source("identity-pr6-cam-newton", "Auburn Athletics", "Cam Newton recalls 'magical' 2010 Auburn season", "https://auburntigers.com/news/2025/10/10/cam-newton-recalls-magical-2010-auburn-season", "Cam Newton research covering five distinctive identity concepts."),
  source("identity-pr6-dan-marino", "Pro Football Hall of Fame", "Dan Marino", "https://www.profootballhof.com/players/dan-marino/", "Dan Marino research covering five distinctive identity concepts."),
  source("identity-pr6-josh-allen", "Buffalo Bills", "Josh Allen's path from Firebaugh to Buffalo", "https://www.buffalobills.com/news/josh-allen-s-path-from-firebaugh-to-buffalo", "Josh Allen research covering five distinctive identity concepts."),
  source("identity-pr6-roger-staubach", "Pro Football Hall of Fame", "Roger Staubach", "https://www.profootballhof.com/players/roger-staubach/", "Roger Staubach research covering five distinctive identity concepts."),
  source("identity-pr6-adrian-peterson", "NFL.com", "Adrian Peterson profile", "https://www.nfl.com/players/adrian-peterson/", "Adrian Peterson research covering five distinctive identity concepts."),
  source("identity-pr6-earl-campbell", "Pro Football Hall of Fame", "Earl Campbell", "https://www.profootballhof.com/players/earl-campbell/", "Earl Campbell research covering five distinctive identity concepts."),
  source("identity-pr6-gale-sayers", "Pro Football Hall of Fame", "I Am Third", "https://www.profootballhof.com/news/i-am-third", "Gale Sayers research covering five distinctive identity concepts."),
  source("identity-pr6-marshall-faulk", "Pro Football Hall of Fame", "Marshall Faulk", "https://www.profootballhof.com/players/marshall-faulk/", "Marshall Faulk research covering five distinctive identity concepts."),
  source("identity-pr6-calvin-johnson", "Pro Football Hall of Fame", "Calvin Johnson", "https://www.profootballhof.com/players/calvin-johnson/", "Calvin Johnson research covering five distinctive identity concepts."),
  source("identity-pr6-alan-faneca", "Pro Football Hall of Fame", "Class of 2018 Finalist Spotlight: Alan Faneca", "https://www.profootballhof.com/news/class-of-2018-finalist-spotlight-alan-faneca", "Alan Faneca research covering five distinctive identity concepts."),
  source("identity-pr6-jonathan-ogden", "Pro Football Hall of Fame", "Jonathan Ogden", "https://www.profootballhof.com/players/jonathan-ogden/", "Jonathan Ogden research covering five distinctive identity concepts."),
  source("identity-pr6-trent-williams", "San Francisco 49ers", "49ers Acquire T Trent Williams", "https://www.49ers.com/news/49ers-trent-williams-trade-washington-redskins-2020-nfl-draft", "Trent Williams research covering five distinctive identity concepts."),
  source("identity-pr6-alan-page", "Pro Football Hall of Fame", "Alan Page", "https://www.profootballhof.com/players/alan-page/", "Alan Page research covering five distinctive identity concepts."),
  source("identity-pr6-joe-greene", "Pittsburgh Steelers", "Labriola on Their Life's Work", "https://www.steelers.com/news/labriola-on-their-life-s-work-14124166", "Joe Greene research covering five distinctive identity concepts."),
  source("identity-pr6-brian-urlacher", "Pro Football Hall of Fame", "Brian Urlacher", "https://www.profootballhof.com/players/brian-urlacher/", "Brian Urlacher research covering five distinctive identity concepts."),
  source("identity-pr6-charles-woodson", "Pro Football Hall of Fame", "Charles Woodson", "https://www.profootballhof.com/players/charles-woodson/", "Charles Woodson research covering five distinctive identity concepts."),
  source("identity-pr6-ronnie-lott", "Pro Football Hall of Fame", "Ronnie Lott", "https://www.profootballhof.com/players/ronnie-lott/", "Ronnie Lott research covering five distinctive identity concepts."),
  source("identity-pr6-andy-reid", "Kansas City Chiefs", "Andy Reid biography", "https://www.chiefs.com/team/coaches-roster/andy-reid", "Andy Reid research covering five distinctive identity concepts."),
  source("identity-pr6-chuck-noll", "Pro Football Hall of Fame", "Chuck Noll", "https://www.profootballhof.com/players/chuck-noll/", "Chuck Noll research covering five distinctive identity concepts."),
  source("identity-pr6-george-halas", "Pro Football Hall of Fame", "George Halas", "https://www.profootballhof.com/players/george-halas/", "George Halas research covering five distinctive identity concepts."),
  source("identity-pr6-jimmy-johnson", "Pro Football Hall of Fame", "Jimmy Johnson", "https://www.profootballhof.com/players/jimmy-johnson-coach/", "Jimmy Johnson research covering five distinctive identity concepts."),
  source("identity-pr6-pete-carroll", "Seattle Seahawks", "Pete Carroll biography", "https://www.seahawks.com/team/coaches-roster/pete-carroll", "Pete Carroll research covering five distinctive identity concepts."),
  source("identity-pr6-jim-kelly", "Pro Football Hall of Fame", "Jim Kelly", "https://www.profootballhof.com/players/jim-kelly/", "Jim Kelly research covering five distinctive identity concepts."),
  source("identity-pr6-joe-namath", "Pro Football Hall of Fame", "Joe Namath", "https://www.profootballhof.com/players/joe-namath/", "Joe Namath research covering five distinctive identity concepts."),
  source("identity-pr6-john-elway", "Pro Football Hall of Fame", "John Elway", "https://www.profootballhof.com/players/john-elway/", "John Elway research covering five distinctive identity concepts."),
  source("identity-pr6-lamar-jackson", "Baltimore Ravens", "Lamar Jackson biography", "https://www.baltimoreravens.com/team/players-roster/lamar-jackson/", "Lamar Jackson research covering five distinctive identity concepts."),
  source("identity-pr6-otto-graham", "Pro Football Hall of Fame", "Otto Graham", "https://www.profootballhof.com/players/otto-graham/", "Otto Graham research covering five distinctive identity concepts."),
  source("identity-pr6-sid-luckman", "Pro Football Hall of Fame", "Sid Luckman", "https://www.profootballhof.com/players/sid-luckman/", "Sid Luckman research covering five distinctive identity concepts."),
  source("identity-pr6-steve-young", "Pro Football Hall of Fame", "Steve Young", "https://www.profootballhof.com/players/steve-young/", "Steve Young research covering five distinctive identity concepts."),
  source("identity-pr6-terry-bradshaw", "Pro Football Hall of Fame", "Terry Bradshaw", "https://www.profootballhof.com/players/terry-bradshaw/", "Terry Bradshaw research covering five distinctive identity concepts."),
  source("identity-pr6-troy-aikman", "Pro Football Hall of Fame", "Troy Aikman", "https://www.profootballhof.com/players/troy-aikman/", "Troy Aikman research covering five distinctive identity concepts."),
  source("identity-pr6-doak-walker", "Pro Football Hall of Fame", "Doak Walker", "https://www.profootballhof.com/players/doak-walker/", "Doak Walker research covering five distinctive identity concepts."),
  source("identity-pr6-frank-gifford", "Pro Football Hall of Fame", "Frank Gifford", "https://www.profootballhof.com/players/frank-gifford/", "Frank Gifford research covering five distinctive identity concepts."),
  source("identity-pr6-harold-red-grange", "Pro Football Hall of Fame", "Harold Grange", "https://www.profootballhof.com/players/harold-grange/", "Harold 'Red' Grange research covering five distinctive identity concepts."),
  source("identity-pr6-marcus-allen", "Pro Football Hall of Fame", "Marcus Allen", "https://www.profootballhof.com/players/marcus-allen/", "Marcus Allen research covering five distinctive identity concepts."),
  source("identity-pr6-paul-hornung", "Pro Football Hall of Fame", "Paul Hornung", "https://www.profootballhof.com/players/paul-hornung/", "Paul Hornung research covering five distinctive identity concepts."),
  source("identity-pr6-reggie-bush", "USC Athletics", "Reggie Bush - USC Athletics", "https://usctrojans.com/sports/football/roster/reggie-bush/1683", "Reggie Bush research covering five distinctive identity concepts."),
  source("identity-pr6-tony-dorsett", "Pro Football Hall of Fame", "Tony Dorsett", "https://www.profootballhof.com/players/tony-dorsett/", "Tony Dorsett research covering five distinctive identity concepts."),
  source("identity-pr6-raymond-berry", "Pro Football Hall of Fame", "Raymond Berry", "https://www.profootballhof.com/players/raymond-berry/", "Raymond Berry research covering five distinctive identity concepts."),
  source("identity-pr6-chuck-bednarik", "Pro Football Hall of Fame", "Chuck Bednarik", "https://www.profootballhof.com/players/chuck-bednarik/", "Chuck Bednarik research covering five distinctive identity concepts."),
  source("identity-pr6-marshal-yanda", "Baltimore Ravens", "Marshal Yanda retirement profile", "https://www.baltimoreravens.com/news/marshal-yanda-announces-retirement", "Marshal Yanda research covering five distinctive identity concepts."),
  source("identity-pr6-tyron-smith", "Dallas Cowboys", "Tyron Smith biography", "https://www.dallascowboys.com/team/players-roster/tyron-smith/", "Tyron Smith research covering five distinctive identity concepts."),
  source("identity-pr6-emlen-tunnell", "Pro Football Hall of Fame", "Emlen Tunnell", "https://www.profootballhof.com/players/emlen-tunnell/", "Emlen Tunnell research covering five distinctive identity concepts."),
  source("identity-pr6-joe-gibbs", "Pro Football Hall of Fame", "Joe Gibbs", "https://www.profootballhof.com/players/joe-gibbs/", "Joe Gibbs research covering five distinctive identity concepts."),
  source("identity-pr6-paul-brown", "Pro Football Hall of Fame", "Paul Brown", "https://www.profootballhof.com/players/paul-brown/", "Paul Brown research covering five distinctive identity concepts."),
  source("identity-pr6-bronko-nagurski", "Pro Football Hall of Fame", "Bronko Nagurski", "https://www.profootballhof.com/players/bronko-nagurski/", "Bronko Nagurski research covering five distinctive identity concepts."),
  source("identity-pr6-eric-dickerson", "Pro Football Hall of Fame", "Eric Dickerson", "https://www.profootballhof.com/players/eric-dickerson/", "Eric Dickerson research covering five distinctive identity concepts."),
  source("identity-pr6-jim-thorpe", "Pro Football Hall of Fame", "Jim Thorpe", "https://www.profootballhof.com/players/jim-thorpe/", "Jim Thorpe research covering five distinctive identity concepts."),
  source("identity-pr6-o-j-simpson", "Pro Football Hall of Fame", "O.J. Simpson", "https://www.profootballhof.com/players/oj-simpson/", "O.J. Simpson research covering five distinctive identity concepts."),
  source("identity-pr6-don-hutson", "Pro Football Hall of Fame", "Don Hutson", "https://www.profootballhof.com/players/don-hutson/", "Don Hutson research covering five distinctive identity concepts."),
  source("identity-pr6-larry-fitzgerald", "Minnesota Vikings", "Larry Fitzgerald's Vikings roots", "https://www.vikings.com/news/larry-fitzgerald-vikings-ball-boy-dennis-green-cris-carter", "Larry Fitzgerald research covering five distinctive identity concepts."),
  source("identity-pr6-anthony-munoz", "Pro Football Hall of Fame", "Anthony Munoz", "https://www.profootballhof.com/players/anthony-munoz/", "Anthony Munoz research covering five distinctive identity concepts."),
  source("identity-pr6-kevin-mawae", "Pro Football Hall of Fame", "Kevin Mawae", "https://www.profootballhof.com/players/kevin-mawae/", "Kevin Mawae research covering five distinctive identity concepts."),
  source("identity-pr6-steve-hutchinson", "Pro Football Hall of Fame", "Steve Hutchinson", "https://www.profootballhof.com/players/steve-hutchinson/", "Steve Hutchinson research covering five distinctive identity concepts."),
  source("identity-pr6-bruce-smith", "Pro Football Hall of Fame", "Bruce Smith", "https://www.profootballhof.com/players/bruce-smith/", "Bruce Smith research covering five distinctive identity concepts."),
  source("identity-pr6-deacon-jones", "Pro Football Hall of Fame", "Deacon Jones", "https://www.profootballhof.com/players/deacon-jones/", "Deacon Jones research covering five distinctive identity concepts."),
  source("identity-pr6-sam-huff", "Pro Football Hall of Fame", "Sam Huff", "https://www.profootballhof.com/players/sam-huff/", "Sam Huff research covering five distinctive identity concepts."),
  source("identity-pr6-dick-night-train-lane", "Pro Football Hall of Fame", "Dick Night Train Lane", "https://www.profootballhof.com/players/dick-night-train-lane/", "Dick 'Night Train' Lane research covering five distinctive identity concepts."),
  source("identity-pr6-troy-polamalu", "Pittsburgh Steelers", "Troy Polamalu biography", "https://www.steelers.com/history/bios/polamalu-troy", "Troy Polamalu research covering five distinctive identity concepts."),
  source("identity-pr6-bill-parcells", "Pro Football Hall of Fame", "Bill Parcells", "https://www.profootballhof.com/players/bill-parcells/", "Bill Parcells research covering five distinctive identity concepts."),
  source("identity-pr6-earl-curly-lambeau", "Green Bay Packers", "Curly Lambeau history", "https://www.packers.com/history/hof/curly-lambeau", "Earl 'Curly' Lambeau research covering five distinctive identity concepts."),
  source("identity-pr6-john-madden", "Pro Football Hall of Fame", "John Madden", "https://www.profootballhof.com/players/john-madden/", "John Madden research covering five distinctive identity concepts."),
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
  { subjectId: "reggie-white", facts: [
    fact("ordained-minister", "minister-before-pro-football", "He was an ordained minister, a real-life identity that became inseparable from his football nickname.", ["identity-reggie-packers-100"], ["faith", "off-field"]),
    fact("minister-of-defense", "minister-of-defense-nickname", "His combination of ministry and pass-rushing dominance produced the enduring nickname 'Minister of Defense.'", ["identity-reggie-packers-100", "identity-reggie-packers-hof"], ["nickname", "identity"]),
    fact("landmark-1993-free-agent", "free-agency-landmark", "His 1993 signing with Green Bay was the signature star move at the dawn of modern unrestricted NFL free agency.", ["identity-reggie-packers-100"], ["career-decision", "league-history"]),
    fact("packers-defense-immediate-rise", "green-bay-defensive-turnaround", "Green Bay's defense jumped from 23rd in the league before his arrival to No. 2 in his first Packers season.", ["identity-reggie-packers-hof"], ["team-impact", "turning-point"]),
    fact("packers-retired-92", "green-bay-number-retirement", "The Packers retired his No. 92 after his death, recognizing the unusually large impact of only six seasons in Green Bay.", ["identity-reggie-packers-hof"], ["legacy", "visual-identity"]),
  ]},
  { subjectId: "dick-butkus", facts: [
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
  { subjectId: "nflverse-player-00-0027949", facts: [
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
  { subjectId: "nfl-bobby-layne", facts: [
    fact("texas-baseball-dominance", "texas-baseball-two-sport-star", "At Texas he was an elite right-handed baseball pitcher, compiling a 35-3 career record with a 28-0 Southwest Conference mark and two no-hitters in 1946.", ["identity-layne-texas-baseball-hof"], ["college", "baseball", "multi-sport"]),
    fact("cotton-bowl-all-points", "cotton-bowl-all-forty-points", "In Texas' 40-27 win over Missouri in the 1946 Cotton Bowl, he accounted for every Texas point by scoring four touchdowns, kicking four extra points, and passing for two more touchdowns.", ["identity-layne-texas-college-hof"], ["college", "iconic-moment", "scoring"]),
    fact("doak-walker-title-connection", "doak-walker-lifelong-football-partnership", "His friendship and Lions partnership with Doak Walker reached the 1953 NFL Championship Game, when Walker kicked the deciding extra point after Layne led a late 80-yard touchdown drive.", ["identity-layne-texas-college-hof", "identity-layne-pro-hof"], ["teammate", "championship", "relationship"]),
    fact("merchant-marine-return", "merchant-marine-college-interruption", "His Texas career was interrupted by a stint in the U.S. Merchant Marine before he returned to the Longhorns.", ["identity-layne-texas-merchant-marine"], ["college", "military", "career-path"]),
    fact("parker-detroit-to-pittsburgh", "buddy-parker-two-team-relationship", "He developed a close quarterback-coach relationship with Buddy Parker in Detroit, and after Parker left to coach Pittsburgh, Layne was traded to Parker's Steelers in 1958.", ["identity-layne-pro-hof"], ["coach", "relationship", "career-path"]),
  ]},
  { subjectId: "drew-brees", facts: [
    fact("westlake-underrecruited", "championship-qb-overlooked-recruit", "He led Westlake High School to a 16-0 Texas 5A state championship season but later recalled that Purdue and Kentucky were essentially the only major programs recruiting him.", ["identity-brees-nbc-recruiting"], ["high-school", "recruiting"]),
    fact("chargers-shoulder-destruction", "catastrophic-throwing-shoulder-injury", "His final game with San Diego left his throwing shoulder severely dislocated with a 360-degree labral tear and significant rotator-cuff damage.", ["identity-brees-saints-making-champion"], ["injury", "career-turning-point"]),
    fact("house-throwing-rebuild", "tom-house-throwing-rebuild", "During rehabilitation, throwing specialist Tom House helped him rebuild his throwing motion from the ground up rather than simply restore his old mechanics.", ["identity-brees-saints-making-champion"], ["rehab", "training", "mechanics"]),
    fact("lakeview-wrong-turn", "katrina-lakeview-calling", "On his first New Orleans visit, Sean Payton accidentally drove him through heavily damaged Lakeview near the 17th Street Canal levee breach; Brees later said the experience helped him and his wife see joining the Saints as part of the city's recovery.", ["identity-brees-saints-lakeview"], ["new-orleans", "career-decision", "community"]),
    fact("payton-built-around-brees", "payton-build-around-collaboration", "In their first substantive football meeting, Sean Payton drew concepts from Brees' San Diego offense and told him the Saints would build around what he did well, beginning an explicitly collaborative offensive partnership.", ["identity-brees-saints-hall-quotes"], ["coach", "relationship", "offense"]),
  ]},
  { subjectId: "nfl-fran-tarkenton", facts: [
    fact("minister-household", "ministers-son-strict-upbringing", "He grew up the son of a minister in a household heavily organized around church; he later recalled that he did not see his first movie until age 18.", ["identity-tarkenton-hof-spotlight"], ["childhood", "family"]),
    fact("five-touchdown-vikings-debut", "expansion-vikings-five-touchdown-debut", "In the expansion Vikings' first regular-season game, he came off the bench and accounted for five touchdowns: four passing and one rushing.", ["identity-tarkenton-pro-hof"], ["career-start", "iconic-moment"]),
    fact("scrambling-self-preservation", "scrambling-from-self-preservation", "He said his improvisational scrambling style developed partly from self-preservation, a practical response to avoiding pressure rather than a planned quarterback archetype.", ["identity-tarkenton-hof-spotlight"], ["style", "origin-story"]),
    fact("van-brocklin-scrambling-conflict", "van-brocklin-style-conflict", "His scrambling frequently frustrated Vikings coach Norm Van Brocklin, who preferred a more traditional pocket-oriented approach.", ["identity-tarkenton-pro-hof"], ["coach", "style", "relationship"]),
    fact("auburn-sec-clincher", "georgia-fourth-down-sec-clincher", "At Georgia in 1959, his fourth-down touchdown pass against Auburn completed a late 14-13 win and helped clinch the SEC championship.", ["identity-tarkenton-nff"], ["college", "iconic-moment"]),
  ]},
  { subjectId: "kurt-warner", facts: [
    fact("one-college-start-undrafted", "one-college-start-undrafted", "He spent most of his Northern Iowa career as a reserve, started for only one college season, and went undrafted in 1994.", ["identity-warner-rams-road"], ["college", "career-path"]),
    fact("packers-cut-to-hyvee", "hyvee-grocery-store-job", "After Green Bay cut him from a crowded quarterback room, he stocked shelves and bagged groceries at an Iowa Hy-Vee for about $5.50 an hour while continuing to pursue football.", ["identity-warner-rams-road"], ["work", "career-path"]),
    fact("arena-to-amsterdam", "arena-and-nfl-europe-route", "His route back toward the NFL ran through the Iowa Barnstormers of the Arena Football League and then the Amsterdam Admirals in NFL Europe.", ["identity-warner-rams-road"], ["arena-football", "nfl-europe", "career-path"]),
    fact("trent-green-injury-opening", "trent-green-injury-opening", "He entered the Rams' 1999 season as a backup and became the starter only after Trent Green suffered a major preseason knee injury.", ["identity-warner-rams-road"], ["career-start", "turning-point"]),
    fact("arizona-career-revival", "arizona-second-career-revival", "After being displaced again by a younger quarterback in Arizona and considering retirement, he reclaimed the starting job and led the Cardinals to the franchise's first Super Bowl appearance.", ["identity-warner-cardinals-renaissance"], ["comeback", "career-turning-point"]),
  ]},
  { subjectId: "nfl-sammy-baugh", facts: [
    fact("three-phase-star", "quarterback-defender-punter", "He was simultaneously a star passer, defensive back, and punter, a three-phase role fundamentally unlike the modern quarterback job.", ["identity-baugh-pro-hof"], ["multi-role", "defense", "special-teams"]),
    fact("four-td-four-int-eighty-one-punt", "four-touchdowns-four-interceptions-punt", "Against Detroit in 1943, he threw four touchdown passes, intercepted four passes on defense, and produced an 81-yard punt in the same game.", ["identity-baugh-hof-1943"], ["iconic-moment", "multi-role"]),
    fact("sugar-bowl-fourteen-punts", "sugar-bowl-punting-masterclass", "In TCU's 3-2 Sugar Bowl win over LSU, he punted 14 times for a 48-yard average and repeatedly pinned LSU near its own goal line.", ["identity-baugh-nff"], ["college", "special-teams"]),
    fact("west-texas-ranch", "west-texas-rancher-identity", "After football he spent much of his life on a 7,600-acre West Texas ranch, where he was known as an experienced rancher and roper.", ["identity-baugh-nfl-ap"], ["off-field", "ranching"]),
    fact("seventy-three-seven-answer", "seventy-three-zero-dry-humor", "After Washington's 73-0 championship loss to Chicago, he was asked whether a dropped potential touchdown would have changed the outcome and dryly answered that it would have made the score 73-7.", ["identity-baugh-pro-hof", "identity-baugh-nfl-ap"], ["personality", "iconic-moment"]),
  ]},
  { subjectId: "nfl-bart-starr", facts: [
    fact("alabama-back-injury", "alabama-injury-and-benching", "A back injury disrupted his Alabama career, and he later lost playing time in the Crimson Tide's run-heavy offense.", ["identity-pr6-bart-starr"]),
    fact("johnny-dee-tip", "johnny-dee-draft-tip", "Alabama basketball coach Johnny Dee helped put the overlooked quarterback on Green Bay scout Jack Vainisi's radar before the 1956 draft.", ["identity-pr6-bart-starr"]),
    fact("air-force-discharge", "air-force-discharge-back", "After his rookie NFL season he entered the Air Force but received a medical discharge because of the lingering back problem.", ["identity-pr6-bart-starr"]),
    fact("lombardi-revival", "lombardi-career-rescue", "His NFL future was uncertain until Vince Lombardi arrived in Green Bay in 1959 and made Starr's mechanics, ball handling, and decision-making central to the offense.", ["identity-pr6-bart-starr"]),
    fact("ice-bowl-sneak", "ice-bowl-sneak-call", "On the final drive of the Ice Bowl, Starr proposed the quarterback sneak to Vince Lombardi and scored the winning touchdown himself.", ["identity-pr6-bart-starr"]),
  ]},
  { subjectId: "cam-newton", facts: [
    fact("first-auburn-visit", "auburn-childhood-visit-connection", "He first visited Auburn as a high-school player in 2005 and later said the night-game atmosphere planted an early connection to the program.", ["identity-pr6-cam-newton"]),
    fact("florida-blinn-auburn", "florida-blinn-auburn-path", "His college path ran from Florida to Blinn College and then to Auburn rather than through a conventional single-program career.", ["identity-pr6-cam-newton"]),
    fact("blinn-title-reset", "blinn-junior-college-reset", "At Blinn College he rebuilt his football path and won a junior-college national championship before returning to the SEC.", ["identity-pr6-cam-newton"]),
    fact("december-auburn-return", "auburn-return-official-visit", "He returned to Auburn for an official visit in December 2009, drawn in part by proximity to his Atlanta-area roots and the veteran roster.", ["identity-pr6-cam-newton"]),
    fact("one-year-auburn", "one-year-auburn-window", "His entire Auburn playing career fit into the 2010 season, giving his college identity an unusually concentrated one-year peak.", ["identity-pr6-cam-newton"]),
  ]},
  { subjectId: "dan-marino", facts: [
    fact("pittsburgh-pitt", "pittsburgh-hometown-pitt", "A Pittsburgh native, he stayed home for college at Pitt and became one of the city's defining football quarterbacks before entering the NFL.", ["identity-pr6-dan-marino"]),
    fact("sherrill-motion", "do-not-change-throwing-motion", "Pitt coach Jackie Sherrill resisted changing Marino's naturally quick throwing motion, preserving the release that became a signature trait.", ["identity-pr6-dan-marino"]),
    fact("draft-slide", "1983-draft-slide", "In the celebrated 1983 quarterback draft class, he unexpectedly lasted until Miami selected him 27th overall.", ["identity-pr6-dan-marino"]),
    fact("shula-influence", "don-shula-career-influence", "Don Shula became the defining NFL coach of his career, building Miami's attack around Marino's unusually quick release and downfield passing.", ["identity-pr6-dan-marino"]),
    fact("achilles-return", "achilles-comeback-opener", "After rupturing his Achilles tendon in 1993, he returned the next season and immediately won a dramatic opening shootout against New England.", ["identity-pr6-dan-marino"]),
  ]},
  { subjectId: "nfl-josh-allen", facts: [
    fact("family-farm", "firebaugh-family-farm", "He grew up on his family's farm near Firebaugh, California, in a small Central Valley community far from a major recruiting pipeline.", ["identity-pr6-josh-allen"]),
    fact("recruiting-emails", "thousand-recruiting-emails-juco-path", "With little major-college interest, he and his family contacted a huge number of programs before he took a junior-college route at Reedley.", ["identity-pr6-josh-allen"]),
    fact("pretend-interviews", "childhood-pretend-interviews", "As a child he staged imaginary postgame interviews while playing sports around the family property.", ["identity-pr6-josh-allen"]),
    fact("multi-sport-firebaugh", "multi-sport-firebaugh-athlete", "At Firebaugh High he competed in football, basketball, and baseball rather than specializing early as a quarterback.", ["identity-pr6-josh-allen"]),
    fact("late-growth", "late-physical-development", "His major physical growth came relatively late, one reason his high-school recruiting profile did not resemble his eventual NFL frame.", ["identity-pr6-josh-allen"]),
  ]},
  { subjectId: "nfl-roger-staubach", facts: [
    fact("nmmi-prep", "nmmi-three-sport-prep-year", "Before Navy he spent a prep year at New Mexico Military Institute and competed in football, baseball, and basketball.", ["identity-pr6-roger-staubach"]),
    fact("navy-delay", "navy-service-delayed-nfl", "His Naval Academy commitment delayed the start of his NFL career for several years after Dallas drafted him.", ["identity-pr6-roger-staubach"]),
    fact("vietnam", "volunteered-vietnam-command", "During his Navy service he volunteered for duty in Vietnam and served as a supply officer there before joining the Cowboys.", ["identity-pr6-roger-staubach"]),
    fact("captain-comeback", "captain-comeback-identity", "His repeated late-game rallies with Dallas produced the enduring 'Captain Comeback' identity.", ["identity-pr6-roger-staubach"]),
    fact("hail-mary", "hail-mary-term-popularization", "His last-second 1975 playoff touchdown pass to Drew Pearson helped popularize the football term 'Hail Mary.'", ["identity-pr6-roger-staubach"]),
  ]},
  { subjectId: "nflverse-player-00-0021306", facts: [
    fact("all-day", "ad-all-day-nickname", "His father gave him the nickname 'AD' for 'All Day' because of the energy he showed as a child.", ["identity-pr6-adrian-peterson"]),
    fact("track-speed", "sprinter-speed-deeper-alignment", "He was an accomplished high-school sprinter, giving a track background to the breakaway speed paired with his power-running style.", ["identity-pr6-adrian-peterson"]),
    fact("draft-collarbone", "vikings-draft-collarbone-concern", "A collarbone injury became a major part of the uncertainty surrounding him before Minnesota selected him in the 2007 draft.", ["identity-pr6-adrian-peterson"]),
    fact("walkthrough-speed", "walkthrough-full-speed-habit", "Coaches and teammates repeatedly described him as unusually intense even in practices and walkthrough work.", ["identity-pr6-adrian-peterson"]),
    fact("acl-return", "acl-mcl-rapid-comeback", "He returned for the 2012 opener less than nine months after tearing the ACL and MCL in his left knee.", ["identity-pr6-adrian-peterson"]),
  ]},
  { subjectId: "earl-campbell", facts: [
    fact("tyler-rose", "tyler-rose-family-origin", "Raised in Tyler, Texas, he became inseparable from the 'Tyler Rose' identity tied to his East Texas roots.", ["identity-pr6-earl-campbell"]),
    fact("mother-recruiting", "mother-controlled-recruiting", "His mother Ann Campbell played a major role in controlling access to him during his heavily recruited high-school years.", ["identity-pr6-earl-campbell"]),
    fact("roof-promise", "roof-leak-promise-to-mother", "He has recalled wanting football success partly so he could improve the family's home after seeing his mother deal with a leaking roof.", ["identity-pr6-earl-campbell"]),
    fact("construction-summer", "summer-construction-before-heisman", "Even after becoming a college star, he spent a summer doing construction work rather than living like a campus celebrity.", ["identity-pr6-earl-campbell"]),
    fact("monday-night-breakout", "luv-ya-blue-monday-night-breakout", "His punishing Monday Night Football performance against Miami in 1978 became an early national image of Houston's 'Luv Ya Blue' era.", ["identity-pr6-earl-campbell"]),
  ]},
  { subjectId: "gale-sayers", facts: [
    fact("kansas-comet", "kansas-comet-nickname", "His speed at Kansas produced the enduring nickname 'Kansas Comet.'", ["identity-pr6-gale-sayers"]),
    fact("piccolo-roommates", "piccolo-interracial-roommates", "With the Bears, he and Brian Piccolo became among the NFL's early interracial roommate pairings and developed a close friendship.", ["identity-pr6-gale-sayers"]),
    fact("piccolo-rehab", "piccolo-knee-rehab-support", "Piccolo helped support Sayers during the difficult rehabilitation from his 1968 knee injury.", ["identity-pr6-gale-sayers"]),
    fact("halas-award", "halas-award-given-to-piccolo", "When Sayers received the George S. Halas Award for courage, he accepted it in Piccolo's honor and said the award belonged to his ill teammate.", ["identity-pr6-gale-sayers"]),
    fact("i-am-third", "i-am-third-brians-song", "His autobiography I Am Third and the Sayers-Piccolo friendship became the basis for the film Brian's Song.", ["identity-pr6-gale-sayers"]),
  ]},
  { subjectId: "marshall-faulk", facts: [
    fact("recruiting-snub", "running-back-recruiting-snub", "Major programs often projected him away from running back, helping steer him to San Diego State, which offered the position he wanted.", ["identity-pr6-marshall-faulk"]),
    fact("freshman-386", "freshman-386-yard-breakout", "As a freshman at San Diego State he rushed for 386 yards and seven touchdowns against Pacific in a nationally startling breakout.", ["identity-pr6-marshall-faulk"]),
    fact("trade-to-rams", "colts-rams-trade-turning-point", "Indianapolis traded him to St. Louis in 1999, placing him at the center of the offense that became the 'Greatest Show on Turf.'", ["identity-pr6-marshall-faulk"]),
    fact("rams-holdout", "rams-contract-holdout", "He initially held out after arriving in St. Louis while negotiating a new contract before joining the Rams' breakthrough season.", ["identity-pr6-marshall-faulk"]),
    fact("chess-piece", "greatest-show-chess-piece", "The Rams used him as both an elite runner and a major receiving weapon, making his movable backfield role central to the offense's identity.", ["identity-pr6-marshall-faulk"]),
  ]},
  { subjectId: "nflverse-player-00-0025389", facts: [
    fact("baseball-first", "baseball-first-love", "Baseball was an early athletic focus before football became the sport that defined him.", ["identity-pr6-calvin-johnson"]),
    fact("butterfingers", "butterfingers-early-nickname", "Before becoming an elite receiver, he carried the childhood nickname 'Butterfingers,' an ironic contrast with his later career.", ["identity-pr6-calvin-johnson"]),
    fact("megatron", "megatron-nickname-origin", "Lions teammate Roy Williams began calling him 'Megatron,' comparing his size and athletic ability to the Transformers character.", ["identity-pr6-calvin-johnson"]),
    fact("retired-thirty", "age-thirty-retirement", "He retired at age 30 after nine NFL seasons rather than extending a career built around extraordinary physical gifts.", ["identity-pr6-calvin-johnson"]),
    fact("foundation", "calvin-johnson-jr-foundation", "He established the Calvin Johnson Jr. Foundation to support youth and community initiatives in Georgia and Detroit.", ["identity-pr6-calvin-johnson"]),
  ]},
  { subjectId: "nfl-alan-faneca", facts: [
    fact("epilepsy", "teenage-epilepsy-diagnosis", "He was diagnosed with epilepsy as a teenager and continued into elite college and professional football while managing the condition.", ["identity-pr6-alan-faneca"]),
    fact("advocacy", "epilepsy-awareness-advocacy", "He used his platform to speak publicly about epilepsy and encourage young people living with the condition.", ["identity-pr6-alan-faneca"]),
    fact("discus", "high-school-discus", "He was also a high-school track athlete who competed in the discus before becoming known for offensive-line power.", ["identity-pr6-alan-faneca"]),
    fact("left-tackle-emergency", "guard-to-left-tackle-emergency", "Although a defining NFL guard, Pittsburgh trusted him to move to left tackle when injuries forced an emergency change.", ["identity-pr6-alan-faneca"]),
    fact("pulling-guard", "pulling-guard-identity", "His mobility made him especially recognizable as a pulling guard rather than only as a stationary power blocker.", ["identity-pr6-alan-faneca"]),
  ]},
  { subjectId: "nfl-jonathan-ogden", facts: [
    fact("shot-put", "ncaa-shot-put-champion", "At UCLA he became an NCAA indoor shot-put champion while also developing into an elite offensive tackle.", ["identity-pr6-jonathan-ogden"]),
    fact("first-raven", "first-ravens-draft-pick", "Baltimore made him the first draft selection in Ravens franchise history in 1996.", ["identity-pr6-jonathan-ogden"]),
    fact("newsome-choice", "newsome-over-lawrence-phillips", "Ozzie Newsome chose Ogden with the franchise's first pick rather than taking the more publicly discussed Lawrence Phillips.", ["identity-pr6-jonathan-ogden"]),
    fact("rookie-guard", "rookie-guard-to-left-tackle", "He began his NFL career at guard before moving outside to the left-tackle position that defined him.", ["identity-pr6-jonathan-ogden"]),
    fact("notebooks", "opponent-notebook-study", "He kept detailed notes on opponents and pass-rush tendencies, treating preparation as a repeatable study system.", ["identity-pr6-jonathan-ogden"]),
  ]},
  { subjectId: "nfl-trent-williams", facts: [
    fact("silverback-origin", "silverback-nickname-origin", "The nickname 'Silverback' grew from the gorilla comparison teammates attached to his rare size, power, and movement.", ["identity-pr6-trent-williams"]),
    fact("silverback-draft", "silverback-draft-announcement", "His 'Silverback' identity was already prominent enough by the draft that it followed him immediately into his professional career.", ["identity-pr6-trent-williams"]),
    fact("cancer", "scalp-cancer-diagnosis", "A growth on his scalp was ultimately diagnosed as a rare cancer, requiring major surgery and creating a football-and-life turning point.", ["identity-pr6-trent-williams"]),
    fact("medical-holdout", "medical-dispute-and-holdout", "His dissatisfaction with Washington's handling of the medical issue contributed to a prolonged holdout and eventual departure.", ["identity-pr6-trent-williams"]),
    fact("shanahan-reunion", "shanahan-reunion-in-san-francisco", "His trade to San Francisco reunited him with Kyle Shanahan, who had coached him earlier in Washington.", ["identity-pr6-trent-williams"]),
  ]},
  { subjectId: "nfl-alan-page", facts: [
    fact("hall-construction", "helped-build-hall-of-fame", "As a young construction worker he helped on the crew that built the Pro Football Hall of Fame building in Canton before later being enshrined there.", ["identity-pr6-alan-page"]),
    fact("law-school", "law-school-during-nfl-career", "He attended law school while still playing in the NFL, building a legal career in parallel with football.", ["identity-pr6-alan-page"]),
    fact("physics-math", "physics-math-football-thinking", "His academic interests in mathematics and science informed the analytical way he described line play and leverage.", ["identity-pr6-alan-page"]),
    fact("supreme-court", "minnesota-supreme-court-justice", "After football and private legal work, he served for more than two decades as a justice on the Minnesota Supreme Court.", ["identity-pr6-alan-page"]),
    fact("education-foundation", "page-education-foundation", "He and his wife Diane founded the Page Education Foundation, tying scholarship support to community service.", ["identity-pr6-alan-page"]),
  ]},
  { subjectId: "joe-greene", facts: [
    fact("mean-joe-name", "mean-joe-nickname-mean-green-link", "His 'Mean Joe' nickname was connected to North Texas' Mean Green identity, but the school's nickname was not created because of Greene.", ["identity-pr6-joe-greene"]),
    fact("field-work", "childhood-field-work", "He grew up doing demanding outdoor and field work, part of the physical background behind his football development.", ["identity-pr6-joe-greene"]),
    fact("scouting-phrase", "agile-mobile-hostile-scouting-description", "The memorable scouting phrase 'agile, mobile and hostile' became attached to the way evaluators described his rare movement and temperament for a defensive tackle.", ["identity-pr6-joe-greene"]),
    fact("coke", "coke-commercial", "A Coca-Cola commercial in which the intimidating defender softens toward a young fan made him a mainstream cultural figure beyond football.", ["identity-pr6-joe-greene"]),
    fact("persona-contrast", "mean-persona-teddy-bear-contrast", "Teammates and Steelers histories often contrasted the 'Mean Joe' playing persona with a much warmer off-field personality.", ["identity-pr6-joe-greene"]),
  ]},
  { subjectId: "nfl-brian-urlacher", facts: [
    fact("lobo-back", "lobo-back-hybrid-position", "New Mexico used him in the hybrid 'Lobo Back' role, combining safety, linebacker, and coverage responsibilities.", ["identity-pr6-brian-urlacher"]),
    fact("three-way", "three-way-college-player", "He contributed on defense, special teams, and offense at New Mexico rather than fitting one conventional college position.", ["identity-pr6-brian-urlacher"]),
    fact("red-zone", "red-zone-receiver-role", "New Mexico even used him as a red-zone receiving option on offense while he starred defensively.", ["identity-pr6-brian-urlacher"]),
    fact("draft-projections", "multiple-nfl-position-projections", "NFL evaluators debated whether his unusual college skill set fit best at safety or linebacker.", ["identity-pr6-brian-urlacher"]),
    fact("middle-linebacker", "outside-to-middle-linebacker-switch", "Chicago initially tried him outside before moving him to middle linebacker, where his speed became the defining feature of the Bears defense.", ["identity-pr6-brian-urlacher"]),
  ]},
  { subjectId: "nflverse-player-00-0018227", facts: [
    fact("hs-running-back", "high-school-star-running-back", "Before becoming a famous defensive back, he was a standout high-school running back as well as a defensive star.", ["identity-pr6-charles-woodson"]),
    fact("michigan-two-way", "michigan-two-way-role", "Michigan used him on defense, offense, and returns, making true two-way play central to his college identity.", ["identity-pr6-charles-woodson"]),
    fact("heisman-two-way", "two-way-heisman-identity", "His Heisman season was built around rare two-way and return-game contributions rather than a conventional offensive-only candidacy.", ["identity-pr6-charles-woodson"]),
    fact("punt-pose", "ohio-state-punt-return-pose", "His punt-return touchdown against Ohio State ended with a memorable sideline pose echoing Desmond Howard's earlier Heisman moment.", ["identity-pr6-charles-woodson"]),
    fact("tuck-rule", "tuck-rule-strip", "His apparent strip of Tom Brady in the 2001 AFC divisional game became inseparable from the famous Tuck Rule reversal.", ["identity-pr6-charles-woodson"]),
  ]},
  { subjectId: "ronnie-lott", facts: [
    fact("air-force-family", "air-force-family-childhood", "He grew up in an Air Force family and moved repeatedly during childhood before settling in California.", ["identity-pr6-ronnie-lott"]),
    fact("imaginary-practice", "imaginary-sports-practice-routine", "As a child he rehearsed imaginary game situations and sports moments on his own, a habit he later connected to preparation.", ["identity-pr6-ronnie-lott"]),
    fact("three-sport", "three-sport-eisenhower-athlete", "At Eisenhower High he starred across football, basketball, and baseball.", ["identity-pr6-ronnie-lott"]),
    fact("pinky", "pinky-amputation", "Rather than face a longer recovery after the 1985 season, he chose to have the tip of his injured left pinky amputated.", ["identity-pr6-ronnie-lott"]),
    fact("corner-to-safety", "cornerback-to-safety-evolution", "He entered the NFL as a cornerback before evolving into the safety role most associated with his hard-hitting career.", ["identity-pr6-ronnie-lott"]),
  ]},
  { subjectId: "andy-reid", facts: [
    fact("ppk", "punt-pass-kick-giant-kid", "At age 13 he appeared in the nationally televised Punt, Pass & Kick competition looking enormous beside other children his age.", ["identity-pr6-andy-reid"]),
    fact("byu-line", "byu-offensive-line-roots", "His football background was on the offensive line at BYU rather than at quarterback or another glamour position.", ["identity-pr6-andy-reid"]),
    fact("lavell-nudge", "lavell-edwards-coaching-nudge", "BYU coach LaVell Edwards helped steer him toward coaching after his playing days.", ["identity-pr6-andy-reid"]),
    fact("holmgren", "holmgren-byu-connection", "His relationship with Mike Holmgren traced through BYU before becoming central to Reid's entry into NFL coaching.", ["identity-pr6-andy-reid"]),
    fact("favre-coach", "unexpected-favre-quarterback-coach", "Green Bay eventually made the former offensive lineman Brett Favre's quarterbacks coach, an unusual position-room assignment on Reid's path to head coaching.", ["identity-pr6-andy-reid"]),
  ]},
  { subjectId: "chuck-noll", facts: [
    fact("messenger-guard", "messenger-guard-player-role", "As an NFL player he was used as a messenger guard, carrying play calls from the sideline into the huddle.", ["identity-pr6-chuck-noll"]),
    fact("teacher", "teacher-first-philosophy", "He consistently framed coaching as teaching, preferring instruction and preparation over theatrical motivation.", ["identity-pr6-chuck-noll"]),
    fact("discarded-playbook", "discarded-opponent-playbook", "Joe Greene recalled Noll discarding an opponent playbook rather than treating stolen information as the basis for preparation.", ["identity-pr6-chuck-noll"]),
    fact("emperor", "emperor-nickname", "Players came to call the reserved coach 'The Emperor,' reflecting his controlled, authoritative style.", ["identity-pr6-chuck-noll"]),
    fact("hobbies", "renaissance-man-hobbies", "Away from football he pursued interests ranging from classical music and wine to aviation and sailing.", ["identity-pr6-chuck-noll"]),
  ]},
  { subjectId: "nfl-george-halas", facts: [
    fact("yankees", "yankees-outfielder-before-nfl", "Before pro football became his life, he briefly played Major League Baseball as an outfielder for the New York Yankees.", ["identity-pr6-george-halas"]),
    fact("staley", "a-e-staley-team-origin", "He took charge of the A.E. Staley company team in Decatur before moving the club to Chicago and developing it into the Bears.", ["identity-pr6-george-halas"]),
    fact("founding-meeting", "nfl-founding-meeting", "He participated in the meetings that created the professional league that became the NFL.", ["identity-pr6-george-halas"]),
    fact("every-role", "bears-every-role", "Across the Bears' formative decades he functioned as player, coach, owner, organizer, and league-builder rather than fitting one modern job title.", ["identity-pr6-george-halas"]),
    fact("t-formation", "t-formation-modernization", "His Bears became central to the modern T-formation revolution that reshaped professional offense around the quarterback taking the snap under center.", ["identity-pr6-george-halas"]),
  ]},
  { subjectId: "nfl-jimmy-johnson-coach", facts: [
    fact("arkansas-jones", "arkansas-teammate-jerry-jones", "He and future Cowboys owner Jerry Jones were teammates on Arkansas' 1964 national-championship team.", ["identity-pr6-jimmy-johnson"]),
    fact("landry-replacement", "landry-replacement-after-sale", "When Jones bought the Cowboys in 1989, he hired his former Arkansas teammate to replace Tom Landry.", ["identity-pr6-jimmy-johnson"]),
    fact("walker-trade", "herschel-walker-conditional-pick-trick", "Dallas structured the Herschel Walker trade so roster cuts could convert conditional assets into a huge draft-pick haul, fueling Johnson's rebuild.", ["identity-pr6-jimmy-johnson"]),
    fact("draft-builder", "draft-obsession-team-builder", "He made draft evaluation and aggressive roster churn central to the rapid construction of Dallas' championship core.", ["identity-pr6-jimmy-johnson"]),
    fact("jones-split", "jones-split-after-dynasty", "Despite consecutive Super Bowl wins, tension with Jones ended the coaching partnership in 1994.", ["identity-pr6-jimmy-johnson"]),
  ]},
  { subjectId: "pete-carroll", facts: [
    fact("fake-spike", "jets-fake-spike-collapse", "His only Jets season is closely tied to the late collapse that followed Dan Marino's famous fake-spike touchdown against New York.", ["identity-pr6-pete-carroll"]),
    fact("win-forever", "buffalo-banners-win-forever-seed", "Early coaching experiences, including motivational language he encountered around the Buffalo program, helped seed the 'Win Forever' philosophy he later formalized.", ["identity-pr6-pete-carroll"]),
    fact("wooden-reset", "post-patriots-john-wooden-reset", "After New England fired him, he studied John Wooden and other leadership models while rebuilding his coaching philosophy before USC.", ["identity-pr6-pete-carroll"]),
    fact("always-compete", "always-compete-philosophy", "He made 'Always Compete' a daily organizing principle rather than treating competition as only a game-day idea.", ["identity-pr6-pete-carroll"]),
    fact("music-practice", "music-driven-practices", "His practices became known for loud music and an intentionally energetic atmosphere designed to keep players engaged.", ["identity-pr6-pete-carroll"]),
  ]},
  { subjectId: "nfl-jim-kelly", facts: [
    fact("shoulder", "career-threatening-college-shoulder-rebuild", "A severe throwing-shoulder separation ended his 1982 Miami season and required reconstruction that put his pro future in doubt.", ["identity-pr6-jim-kelly"]),
    fact("usfl", "usfl-over-bills-path", "Buffalo drafted him in 1983, but he chose the Houston Gamblers of the USFL and joined the Bills only after that league collapsed.", ["identity-pr6-jim-kelly"]),
    fact("run-shoot", "run-and-shoot-development", "He credited his Houston Gamblers coaches with developing him inside the Run and Shoot before his Buffalo career began.", ["identity-pr6-jim-kelly"]),
    fact("no-huddle", "buffalo-no-huddle-identity", "Buffalo's aggressive no-huddle attack gave him unusual control at the line and became one of the defining identities of his Bills teams.", ["identity-pr6-jim-kelly"]),
    fact("hunters-hope", "hunters-hope-foundation", "Jim and Jill Kelly founded Hunter's Hope after their son Hunter was diagnosed with Krabbe disease, focusing on families and newborn screening.", ["identity-pr6-jim-kelly"]),
  ]},
  { subjectId: "joe-namath", facts: [
    fact("beaver-falls", "beaver-falls-multisport-star", "At Beaver Falls High School he excelled in football, basketball, and baseball before choosing a college football path.", ["identity-pr6-joe-namath"]),
    fact("league-leverage", "rival-league-draft-leverage", "He was drafted by both the NFL Cardinals and AFL Jets and chose New York after a landmark contract offer.", ["identity-pr6-joe-namath"]),
    fact("knee", "knee-surgery-after-record-signing", "His famous Jets signing was followed almost immediately by knee surgery, making durability uncertainty part of his pro beginning.", ["identity-pr6-joe-namath"]),
    fact("broadway-joe", "broadway-joe-nickname-origin", "The 'Broadway Joe' identity grew from his New York setting and flamboyant public image soon after joining the Jets.", ["identity-pr6-joe-namath"]),
    fact("guarantee", "super-bowl-iii-guarantee", "Before Super Bowl III he publicly guaranteed the Jets would beat the heavily favored Colts, then delivered the upset.", ["identity-pr6-joe-namath"]),
  ]},
  { subjectId: "john-elway", facts: [
    fact("family-move", "family-move-for-passing-offense", "His family moved during high school in part because his coach father Jack Elway wanted him in a passing offense that better fit his quarterback development.", ["identity-pr6-john-elway"]),
    fact("twice-mlb", "twice-mlb-drafted", "Major League Baseball clubs drafted him twice, first out of high school and again while he was at Stanford.", ["identity-pr6-john-elway"]),
    fact("oneonta", "yankees-minor-league-success", "He spent the summer of 1982 playing minor-league baseball in the Yankees system and hit .318 for Oneonta.", ["identity-pr6-john-elway"]),
    fact("colts-leverage", "baseball-leverage-colts-trade", "His credible Yankees option strengthened his refusal to play for Baltimore after the Colts drafted him first overall, helping force a trade to Denver.", ["identity-pr6-john-elway"]),
    fact("helicopter", "super-bowl-helicopter-run", "His spinning, airborne scramble in Super Bowl XXXII became the signature image of Denver finally breaking through to a championship.", ["identity-pr6-john-elway"]),
  ]},
  { subjectId: "nflverse-player-00-0034796", facts: [
    fact("mother-trainer", "mother-first-football-trainer", "His mother Felicia Jones served as his earliest football trainer and remained unusually involved in his development.", ["identity-pr6-lamar-jackson"]),
    fact("mother-tackling", "mother-tackling-training", "She trained him to absorb contact by participating in tackling drills rather than insulating him from physical play.", ["identity-pr6-lamar-jackson"]),
    fact("bridge-beach", "bridge-and-beach-workouts", "His youth training included unconventional bridge and beach workouts that became part of the family-built development story.", ["identity-pr6-lamar-jackson"]),
    fact("qb-only", "quarterback-only-position-insistence", "Jackson and his mother consistently insisted he be evaluated as a quarterback rather than moved to another position because of his athleticism.", ["identity-pr6-lamar-jackson"]),
    fact("mother-draft", "mother-managed-draft-process", "His mother also handled much of his representation and draft process rather than following the standard major-agent route.", ["identity-pr6-lamar-jackson"]),
  ]},
  { subjectId: "nfl-otto-graham", facts: [
    fact("basketball-discovery", "basketball-scholarship-football-discovery", "He arrived at Northwestern primarily as a basketball recruit before his football ability emerged through campus competition.", ["identity-pr6-otto-graham"]),
    fact("three-sport", "three-sport-northwestern-athlete", "At Northwestern he competed in football, basketball, and baseball.", ["identity-pr6-otto-graham"]),
    fact("musician", "multi-instrument-musician", "He was also an accomplished musician who played multiple instruments, an unusual off-field identity for a star quarterback.", ["identity-pr6-otto-graham"]),
    fact("basketball-champion", "pro-basketball-champion-before-browns", "Before joining Cleveland football, he played professional basketball for the Rochester Royals and won an NBL championship.", ["identity-pr6-otto-graham"]),
    fact("coast-guard-coach", "coast-guard-academy-coaching", "After his playing career he spent years coaching and administering athletics at the U.S. Coast Guard Academy.", ["identity-pr6-otto-graham"]),
  ]},
  { subjectId: "nfl-sid-luckman", facts: [
    fact("tailback-switch", "columbia-tailback-to-t-quarterback", "He starred as a single-wing tailback at Columbia before George Halas converted him into the quarterback of Chicago's T formation.", ["identity-pr6-sid-luckman"]),
    fact("early-struggles", "early-t-formation-struggles", "The transition to the unfamiliar T-formation quarterback role produced early growing pains before the system transformed Chicago's offense.", ["identity-pr6-sid-luckman"]),
    fact("73-0", "seventy-three-zero-t-formation-showcase", "Chicago's 73-0 championship win over Washington became the most famous early showcase of the T formation he directed.", ["identity-pr6-sid-luckman"]),
    fact("seven-td", "seven-touchdown-passing-game", "He once threw seven touchdown passes in a single game, an extraordinary passing display for his era.", ["identity-pr6-sid-luckman"]),
    fact("merchant-marine", "merchant-marine-wartime-service", "He served in the U.S. Merchant Marine during World War II while his football career continued around wartime obligations.", ["identity-pr6-sid-luckman"]),
  ]},
  { subjectId: "steve-young", facts: [
    fact("eighth-string", "eighth-string-byu-rise", "He arrived at BYU buried deep on the quarterback depth chart before developing into the program's starter.", ["identity-pr6-steve-young"]),
    fact("brigham-descendant", "brigham-young-descendant", "He is a direct descendant of Brigham Young, giving his BYU identity an unusual family connection to the university's namesake.", ["identity-pr6-steve-young"]),
    fact("family-qbs", "family-byu-quarterback-legacy", "Quarterbacking at BYU became a family thread rather than an isolated stop in his football biography.", ["identity-pr6-steve-young"]),
    fact("usfl-contract", "landmark-usfl-contract", "He began his professional career with the Los Angeles Express on an enormous, heavily deferred USFL contract rather than entering the NFL immediately.", ["identity-pr6-steve-young"]),
    fact("law-degree", "law-degree-during-nfl-career", "He completed a law degree at BYU while still an active NFL quarterback.", ["identity-pr6-steve-young"]),
  ]},
  { subjectId: "nfl-terry-bradshaw", facts: [
    fact("javelin-training", "quarterback-javelin-training", "He used the javelin as a serious second sport, with throwing mechanics that complemented his quarterback arm strength.", ["identity-pr6-terry-bradshaw"]),
    fact("javelin-mark", "national-high-school-javelin-mark", "As a high-school athlete he threw the javelin 244 feet 11 inches, a nationally elite mark for the era.", ["identity-pr6-terry-bradshaw"]),
    fact("phil-robertson", "phil-robertson-depth-chart", "At Louisiana Tech he initially shared a quarterback depth chart with future Duck Dynasty figure Phil Robertson.", ["identity-pr6-terry-bradshaw"]),
    fact("coin-flip", "number-one-pick-coin-flip", "Pittsburgh's right to the first pick in the 1970 draft was determined by a coin flip with Chicago, leading to Bradshaw's selection.", ["identity-pr6-terry-bradshaw"]),
    fact("thomas-brady", "thomas-brady-surgery-alias", "During an elbow procedure he checked into a Louisiana hospital under the alias 'Thomas Brady,' decades before another famous NFL quarterback carried that name.", ["identity-pr6-terry-bradshaw"]),
  ]},
  { subjectId: "troy-aikman", facts: [
    fact("california-oklahoma", "california-to-oklahoma-sport-shift", "His family moved from California to Oklahoma during his youth, changing the setting of his multi-sport development.", ["identity-pr6-troy-aikman"]),
    fact("position-flexibility", "oklahoma-position-flexibility", "Oklahoma valued him as an athlete as well as a passer and considered how his skill set fit around the wishbone system.", ["identity-pr6-troy-aikman"]),
    fact("wishbone-transfer", "wishbone-mismatch-transfer", "A broken ankle and Oklahoma's wishbone direction helped push him toward transferring to a program built for his passing style.", ["identity-pr6-troy-aikman"]),
    fact("jimmy-recruiting", "jimmy-johnson-recruiting-connection", "Jimmy Johnson had recruited him earlier in Oklahoma before later becoming the Cowboys coach who selected him first overall.", ["identity-pr6-troy-aikman"]),
    fact("ucla-reinvention", "oklahoma-to-ucla-reinvention", "He rebuilt his college identity at UCLA as a polished pro-style passer after beginning in Oklahoma's option-oriented environment.", ["identity-pr6-troy-aikman"]),
  ]},
  { subjectId: "nfl-doak-walker", facts: [
    fact("concessions", "smu-concession-seller-childhood", "As a boy he sold concessions at SMU football games before becoming the player most associated with the school's rise in the late 1940s.", ["identity-pr6-doak-walker"]),
    fact("five-sport", "five-sport-high-school-athlete", "At Highland Park he competed across five sports, reflecting a broader athletic identity than football alone.", ["identity-pr6-doak-walker"]),
    fact("layne", "bobby-layne-lifelong-football-link", "His football relationship with Bobby Layne began at Highland Park and later continued with the Detroit Lions.", ["identity-pr6-doak-walker"]),
    fact("merchant-marine", "merchant-marine-college-interruption", "World War II service in the U.S. Merchant Marine interrupted his early college path.", ["identity-pr6-doak-walker"]),
    fact("house-doak-built", "house-that-doak-built", "His popularity helped make the expanded Cotton Bowl known as 'The House That Doak Built.'", ["identity-pr6-doak-walker"]),
  ]},
  { subjectId: "nfl-frank-gifford", facts: [
    fact("jc-usc", "junior-college-to-usc-path", "He reached USC only after beginning at Bakersfield Junior College, giving his college path a less direct start.", ["identity-pr6-frank-gifford"]),
    fact("offense-defense", "pro-bowl-offense-and-defense", "His versatility was unusual enough that he earned Pro Bowl recognition on both offense and defense during his NFL career.", ["identity-pr6-frank-gifford"]),
    fact("option-pass", "halfback-option-passer", "The Giants used his passing ability on halfback-option plays rather than treating him only as a runner and receiver.", ["identity-pr6-frank-gifford"]),
    fact("bednarik-hit", "bednarik-hit-hiatus", "Chuck Bednarik's famous 1960 hit left him with a severe concussion and led to a full-season absence before he returned.", ["identity-pr6-frank-gifford"]),
    fact("mnf", "monday-night-football-second-career", "After playing, he built a second national identity as a longtime voice of Monday Night Football.", ["identity-pr6-frank-gifford"]),
  ]},
  { subjectId: "nfl-harold-red-grange", facts: [
    fact("ice", "ice-delivery-summer-job", "He spent summers hauling heavy blocks of ice, a job that became part of the physical origin story around his Illinois football career.", ["identity-pr6-harold-red-grange"]),
    fact("michigan", "1924-michigan-breakout", "His explosive first quarter against Michigan in 1924 became the performance that turned him into a national sports celebrity.", ["identity-pr6-harold-red-grange"]),
    fact("ten-days", "ten-days-college-to-pro", "He moved from his final college game to a professional Bears appearance in roughly ten days, an almost immediate college-to-pro transition.", ["identity-pr6-harold-red-grange"]),
    fact("barnstorm", "nfl-barnstorming-attraction", "His post-college barnstorming tour drew huge crowds and helped professional football reach audiences far beyond its existing markets.", ["identity-pr6-harold-red-grange"]),
    fact("pyle", "early-player-agent-celebrity-brand", "Manager C.C. Pyle aggressively marketed him across football and endorsements, creating an early model of the athlete-as-national-brand.", ["identity-pr6-harold-red-grange"]),
  ]},
  { subjectId: "marcus-allen", facts: [
    fact("hs-qb-db", "high-school-quarterback-defensive-back", "At Lincoln High he starred at quarterback and defensive back rather than entering college with a settled running-back identity.", ["identity-pr6-marcus-allen"]),
    fact("recruited-db", "recruited-as-defensive-back", "USC initially recruited him as a defensive back before his offensive role expanded.", ["identity-pr6-marcus-allen"]),
    fact("charles-white", "charles-white-fullback-apprenticeship", "He spent time at fullback blocking for Charles White before becoming USC's featured tailback.", ["identity-pr6-marcus-allen"]),
    fact("sb-run", "super-bowl-reverse-field-run", "His long touchdown in Super Bowl XVIII featured a dramatic reversal of field and became the signature play of the Raiders' win.", ["identity-pr6-marcus-allen"]),
    fact("chiefs-second-act", "raiders-rift-to-chiefs-second-act", "A prolonged Raiders rift preceded a move to rival Kansas City, where he created a productive late-career second act.", ["identity-pr6-marcus-allen"]),
  ]},
  { subjectId: "nfl-paul-hornung", facts: [
    fact("three-sport", "three-sport-high-school-letterman", "He lettered in football, basketball, and baseball in high school before becoming identified almost entirely with football.", ["identity-pr6-paul-hornung"]),
    fact("bryant-choice", "bear-bryant-versus-notre-dame-choice", "He chose Notre Dame despite recruiting interest from Bear Bryant, placing a major career decision between two iconic college-football institutions.", ["identity-pr6-paul-hornung"]),
    fact("losing-heisman", "losing-team-heisman", "He won the Heisman Trophy on a Notre Dame team that finished 2-8, one of the award's strangest team-context stories.", ["identity-pr6-paul-hornung"]),
    fact("everything-role", "notre-dame-everything-role", "Notre Dame used him as quarterback, runner, passer, receiver, returner, and defensive back rather than in one fixed role.", ["identity-pr6-paul-hornung"]),
    fact("suspension", "1963-gambling-suspension-return", "The NFL suspended him for the 1963 season over gambling, and he returned to play afterward rather than ending his career.", ["identity-pr6-paul-hornung"]),
  ]},
  { subjectId: "nflverse-player-00-0024217", facts: [
    fact("alex-smith", "helix-teammate-alex-smith", "At Helix High School he shared a football team with future No. 1 NFL draft pick Alex Smith.", ["identity-pr6-reggie-bush"]),
    fact("bush-push", "bush-push", "The controversial push that helped Matt Leinart score at Notre Dame in 2005 became permanently known as the 'Bush Push.'", ["identity-pr6-reggie-bush"]),
    fact("heisman-restored", "heisman-vacated-and-restored", "His 2005 Heisman Trophy was vacated during the NCAA sanctions era and formally restored to him in 2024.", ["identity-pr6-reggie-bush"]),
    fact("texans", "texans-passed-at-number-one", "Houston held the first pick in 2006 but chose Mario Williams, leaving Bush to New Orleans at No. 2 after months of No. 1 speculation.", ["identity-pr6-reggie-bush"]),
    fact("katrina-arrival", "post-katrina-new-orleans-arrival", "He arrived in New Orleans in the first Saints draft after Hurricane Katrina, linking his rookie identity to the franchise's return to the city.", ["identity-pr6-reggie-bush"]),
  ]},
  { subjectId: "tony-dorsett", facts: [
    fact("late-rb", "late-high-school-running-back-switch", "He did not become a full-time running back until late in high school, after spending time in other roles.", ["identity-pr6-tony-dorsett"]),
    fact("local-pitt", "undersized-local-pitt-recruit", "Pitt took the local, undersized prospect when larger programs were less convinced he could become a major college feature back.", ["identity-pr6-tony-dorsett"]),
    fact("cowboys-trade", "cowboys-four-pick-trade-up", "Dallas traded four draft choices to move up and select him second overall in 1977.", ["identity-pr6-tony-dorsett"]),
    fact("landry-reluctance", "landry-rookie-starting-reluctance", "Tom Landry was initially reluctant to hand the rookie a full starting role, creating early tension around how quickly Dallas should feature him.", ["identity-pr6-tony-dorsett"]),
    fact("99-ten-men", "ninety-nine-yard-run-ten-men", "His NFL-record 99-yard touchdown against Minnesota came with only ten Cowboys on the field.", ["identity-pr6-tony-dorsett"]),
  ]},
  { subjectId: "nfl-raymond-berry", facts: [
    fact("special-shoes", "uneven-leg-special-shoes", "A leg-length difference led him to use specially built shoes, one of several physical obstacles he engineered around.", ["identity-pr6-raymond-berry"]),
    fact("father-coach", "father-coach-late-high-school-starter", "His father coached his high-school team, yet Berry did not become a regular starter until late in that prep career.", ["identity-pr6-raymond-berry"]),
    fact("twentieth-round", "twenty-round-college-longshot", "Baltimore selected him in the 20th round out of SMU, making his NFL entry an extreme long-shot draft story.", ["identity-pr6-raymond-berry"]),
    fact("route-moves", "eighty-eight-route-moves", "He cataloged dozens of precise route moves and releases, turning receiver technique into a meticulous personal system.", ["identity-pr6-raymond-berry"]),
    fact("wife-practice", "bad-ball-practice-wife", "He practiced difficult catches by having his wife throw intentionally poor passes so he could rehearse awkward ball locations.", ["identity-pr6-raymond-berry"]),
  ]},
  { subjectId: "nfl-chuck-bednarik", facts: [
    fact("b24", "wwii-b24-waist-gunner", "Before his football fame he flew combat missions in World War II as a B-24 waist gunner.", ["identity-pr6-chuck-bednarik"]),
    fact("concrete", "concrete-salesman-nickname", "His offseason work selling concrete helped produce the enduring nickname 'Concrete Charlie.'", ["identity-pr6-chuck-bednarik"]),
    fact("sixty-minute", "last-sixty-minute-man", "His ability to play both center and linebacker made him a symbol of the NFL's fading full-game two-way player era.", ["identity-pr6-chuck-bednarik"]),
    fact("gifford", "gifford-hit-iconic-image", "His 1960 hit on Frank Gifford became one of the most famous photographs and collisions in early NFL history.", ["identity-pr6-chuck-bednarik"]),
    fact("title-tackle", "1960-title-final-tackle", "He made the final tackle of the 1960 NFL Championship Game and stayed on top of the ball carrier as time expired.", ["identity-pr6-chuck-bednarik"]),
  ]},
  { subjectId: "nfl-marshal-yanda", facts: [
    fact("dairy-farm", "dairy-farm-work-routine", "He grew up working on an Iowa dairy farm, where physical chores became part of the work ethic he later associated with line play.", ["identity-pr6-marshal-yanda"]),
    fact("flag-contact", "quit-flag-football-to-hit", "As a young player he lost interest in flag football because he wanted the contact of the full game.", ["identity-pr6-marshal-yanda"]),
    fact("juco-iowa", "junior-college-to-last-minute-iowa", "His college path went through North Iowa Area Community College before a late opportunity took him to Iowa.", ["identity-pr6-marshal-yanda"]),
    fact("shoulder-switch", "shoulder-injury-position-switch", "An early NFL shoulder injury contributed to Baltimore moving him between tackle and guard before guard became his defining role.", ["identity-pr6-marshal-yanda"]),
    fact("ankle-walkoff", "fractured-ankle-walkoff", "He once finished a game and walked off under his own power despite having fractured his ankle, a story teammates repeatedly cite when describing his toughness.", ["identity-pr6-marshal-yanda"]),
  ]},
  { subjectId: "nfl-tyron-smith", facts: [
    fact("two-way-hs", "two-way-high-school-lineman", "At Rancho Verde High School he played on both the offensive and defensive lines.", ["identity-pr6-tyron-smith"]),
    fact("young-rookie", "twenty-year-old-lockout-rookie", "He entered the NFL at age 20 during the 2011 lockout, giving him an unusually compressed transition into professional line play.", ["identity-pr6-tyron-smith"]),
    fact("right-tackle", "college-and-rookie-right-tackle", "USC and Dallas initially used him at right tackle before he became one of the era's defining left tackles.", ["identity-pr6-tyron-smith"]),
    fact("houck-footwork", "hudson-houck-footwork-repetition", "Veteran line coach Hudson Houck drilled his footwork and hand placement through heavy repetition early in his Cowboys career.", ["identity-pr6-tyron-smith"]),
    fact("larry-allen", "larry-allen-rookie-mentorship", "Hall of Fame guard Larry Allen became an early Cowboys mentor and reference point for how Smith approached professional line play.", ["identity-pr6-tyron-smith"]),
  ]},
  { subjectId: "nfl-emlen-tunnell", facts: [
    fact("neck-rejections", "broken-neck-service-rejections", "A broken neck complicated his attempts to enter military service before the Coast Guard ultimately accepted him.", ["identity-pr6-emlen-tunnell"]),
    fact("rescues", "coast-guard-lifesaving-rescues", "During World War II Coast Guard service he performed lifesaving acts aboard ship, later earning formal recognition for heroism.", ["identity-pr6-emlen-tunnell"]),
    fact("draft-confusion", "college-status-draft-confusion", "His fragmented college and wartime path left his pro-football draft status unusually unclear.", ["identity-pr6-emlen-tunnell"]),
    fact("hitchhike", "hitchhike-giants-tryout", "He traveled to New York and personally asked the Giants for a tryout rather than arriving through a conventional draft route.", ["identity-pr6-emlen-tunnell"]),
    fact("pioneer", "first-black-giant-and-hall-pioneer", "He became the first Black player to play for the Giants and later the first Black player inducted into the Pro Football Hall of Fame.", ["identity-pr6-emlen-tunnell"]),
  ]},
  { subjectId: "joe-gibbs", facts: [
    fact("unpaid", "unpaid-volunteer-coaching-start", "His coaching career began with an unpaid graduate-assistant-style role rather than a prominent first job.", ["identity-pr6-joe-gibbs"]),
    fact("coryell", "don-coryell-protege", "He developed under Don Coryell, whose passing-game ideas became a major influence on Gibbs' own offense.", ["identity-pr6-joe-gibbs"]),
    fact("0-5", "zero-five-first-season-start", "Washington opened Gibbs' first season 0-5 before the team stabilized, an unglamorous beginning to his head-coaching career.", ["identity-pr6-joe-gibbs"]),
    fact("three-qbs", "three-super-bowls-three-quarterbacks", "He won Super Bowls with three different starting quarterbacks, making adaptability across offensive personnel a defining coaching trait.", ["identity-pr6-joe-gibbs"]),
    fact("nascar", "retired-to-build-nascar-team", "He left football after his first Washington run and built Joe Gibbs Racing into a championship NASCAR organization.", ["identity-pr6-joe-gibbs"]),
  ]},
  { subjectId: "paul-brown", facts: [
    fact("year-round", "year-round-professional-coaching", "He helped turn coaching into a year-round professional operation rather than a seasonal sideline job.", ["identity-pr6-paul-brown"]),
    fact("classroom", "classroom-notebooks-film-grading", "His teams used classroom meetings, notebooks, film study, and systematic grading with a level of organization that was unusual for the era.", ["identity-pr6-paul-brown"]),
    fact("messenger", "messenger-guard-playcalling", "He used messenger guards to carry play calls from the sideline to the quarterback.", ["identity-pr6-paul-brown"]),
    fact("helmet-radio", "early-radio-helmet-experiment", "His staff experimented with radio communication to a quarterback's helmet decades before modern helmet radios became standard.", ["identity-pr6-paul-brown"]),
    fact("integration", "pro-football-integration", "In 1946 his Browns signed Marion Motley and Bill Willis, helping reintegrate major professional football.", ["identity-pr6-paul-brown"]),
  ]},
  { subjectId: "nfl-bronko-nagurski", facts: [
    fact("name", "bronislau-to-bronko-name", "He was baptized Bronislau, with 'Bronko' becoming the easier form used around him.", ["identity-pr6-bronko-nagurski"]),
    fact("farm", "ukrainian-immigrant-farm-family", "He grew up in a Ukrainian immigrant family doing hard farm work in northern Minnesota and Canada.", ["identity-pr6-bronko-nagurski"]),
    fact("five-pos", "five-positions-one-college-game", "Minnesota used him at end, tackle, guard, halfback, and fullback during a 1929 game against Iowa.", ["identity-pr6-bronko-nagurski"]),
    fact("wrestling", "left-nfl-for-pro-wrestling", "After a salary dispute with the Bears, he left the NFL after 1937 and concentrated on professional wrestling.", ["identity-pr6-bronko-nagurski"]),
    fact("wartime-return", "wartime-nfl-comeback", "He returned to the Bears in 1943 during the wartime player shortage, first at tackle and later again at fullback.", ["identity-pr6-bronko-nagurski"]),
  ]},
  { subjectId: "eric-dickerson", facts: [
    fact("goggles", "prescription-sports-goggles", "His prescription sports goggles became one of the most recognizable visual signatures of 1980s football.", ["identity-pr6-eric-dickerson"]),
    fact("neck-roll", "neck-roll-full-pads-look", "He paired the goggles with a prominent neck roll and unusually full traditional padding.", ["identity-pr6-eric-dickerson"]),
    fact("mother-smu", "adoptive-mother-smu-influence", "He has credited his adoptive mother Viola as an important influence in his decision to attend SMU.", ["identity-pr6-eric-dickerson"]),
    fact("pony", "pony-express-backfield", "At SMU he shared carries with Craig James in the famous 'Pony Express' backfield.", ["identity-pr6-eric-dickerson"]),
    fact("halloween-trade", "halloween-three-way-trade", "His 1987 move from the Rams to Indianapolis came in a massive Halloween three-team trade involving Buffalo and a large package of players and draft picks.", ["identity-pr6-eric-dickerson"]),
  ]},
  { subjectId: "nfl-jim-thorpe", facts: [
    fact("bright-path", "wa-tho-huk-bright-path", "A member of the Sac and Fox Nation, he was also known by the Native name Wa-Tho-Huk, commonly translated as 'Bright Path.'", ["identity-pr6-jim-thorpe"]),
    fact("carlisle", "carlisle-multisport-development", "He developed into a national multi-sport star at the Carlisle Indian Industrial School.", ["identity-pr6-jim-thorpe"]),
    fact("olympics", "olympic-pentathlon-decathlon-double", "At the 1912 Stockholm Olympics he won both the pentathlon and decathlon.", ["identity-pr6-jim-thorpe"]),
    fact("baseball", "major-league-baseball-crossover", "He also played portions of six seasons in Major League Baseball.", ["identity-pr6-jim-thorpe"]),
    fact("apfa-president", "first-apfa-president-player", "When the American Professional Football Association formed in 1920, Thorpe became its first president while still an active player.", ["identity-pr6-jim-thorpe"]),
  ]},
  { subjectId: "nfl-oj-simpson", facts: [
    fact("jc", "junior-college-to-usc-route", "Before USC he spent two seasons at City College of San Francisco, giving his college path a junior-college beginning.", ["identity-pr6-o-j-simpson"]),
    fact("relay", "usc-world-record-relay", "At USC he ran on a 440-yard relay team that set a world record.", ["identity-pr6-o-j-simpson"]),
    fact("juice", "juice-electric-company-wordplay", "His nickname 'The Juice' inspired Buffalo's offensive line to be called 'The Electric Company' because it 'turned on the Juice.'", ["identity-pr6-o-j-simpson"]),
    fact("ucla-run", "usc-ucla-breakaway-touchdown", "His long fourth-quarter touchdown against UCLA in 1967 became one of the enduring images of his USC career.", ["identity-pr6-o-j-simpson"]),
    fact("hertz", "hertz-airport-running-commercials", "Hertz commercials showing him running through airports made his running image familiar to a national audience far beyond football.", ["identity-pr6-o-j-simpson"]),
  ]},
  { subjectId: "nfl-don-hutson", facts: [
    fact("baseball-walkon", "baseball-scholarship-football-walkon", "He arrived at Alabama on a baseball scholarship and joined the football team as a walk-on.", ["identity-pr6-don-hutson"]),
    fact("track", "alabama-antelope-track-speed", "He also sprinted for Alabama's track team, a speed background reflected in the 'Alabama Antelope' identity.", ["identity-pr6-don-hutson"]),
    fact("routes", "modern-route-innovation", "He helped pioneer sophisticated receiver routes, fakes, and change-of-direction techniques that became standard parts of pass receiving.", ["identity-pr6-don-hutson"]),
    fact("multi-role", "receiver-safety-kicker", "For Green Bay he starred at receiver while also playing defense and handling place-kicking duties.", ["identity-pr6-don-hutson"]),
    fact("29-quarter", "twenty-nine-point-quarter", "Against Detroit in 1945 he scored 29 points in one quarter through four touchdown catches and five extra points.", ["identity-pr6-don-hutson"]),
  ]},
  { subjectId: "nflverse-player-00-0022921", facts: [
    fact("green", "dennis-green-ballboy-to-draft", "Dennis Green knew him as a teenage Vikings ball boy and later, as Arizona's head coach, drafted him third overall.", ["identity-pr6-larry-fitzgerald"]),
    fact("father", "father-vikings-beat-reporter", "His father Larry Fitzgerald Sr. covered the Vikings as a sports journalist while the younger Fitzgerald grew up around the team.", ["identity-pr6-larry-fitzgerald"]),
    fact("carter", "cris-carter-youth-mentor", "Cris Carter befriended and trained him during those Vikings ball-boy years.", ["identity-pr6-larry-fitzgerald"]),
    fact("valley-forge", "valley-forge-academic-reset", "He spent a year at Valley Forge Military Academy as an academic and developmental bridge before enrolling at Pittsburgh.", ["identity-pr6-larry-fitzgerald"]),
    fact("raiders-call", "raiders-draft-call-before-cardinals", "Oakland called him while holding the second pick in the 2004 draft to say it was going another direction; Arizona selected him one pick later.", ["identity-pr6-larry-fitzgerald"]),
  ]},
  { subjectId: "nfl-anthony-munoz", facts: [
    fact("baseball", "usc-champion-baseball-pitcher", "He pitched for USC's 1978 NCAA championship baseball team while also playing football.", ["identity-pr6-anthony-munoz"]),
    fact("knees", "knee-injuries-rose-bowl-return", "Multiple knee injuries cost him most of his senior football season, but he returned for USC's Rose Bowl victory over unbeaten Ohio State.", ["identity-pr6-anthony-munoz"]),
    fact("draft-gamble", "paul-brown-medical-draft-gamble", "Cincinnati selected him third overall despite widespread concern that his knees made the pick a major medical gamble.", ["identity-pr6-anthony-munoz"]),
    fact("mother", "single-mother-five-children-upbringing", "He has credited his mother, who raised five children in Southern California, as a central influence on his life.", ["identity-pr6-anthony-munoz"]),
    fact("heritage", "primarily-hispanic-hall-first", "His Mexican-American heritage made his Hall of Fame induction historically significant for Hispanic representation in pro football.", ["identity-pr6-anthony-munoz"]),
  ]},
  { subjectId: "nfl-kevin-mawae", facts: [
    fact("military-brat", "military-brat-germany-louisiana", "He grew up in an Army family and lived in places including Germany, Kansas, and Louisiana during his father's military career.", ["identity-pr6-kevin-mawae"]),
    fact("positions", "four-line-spots-plus-tight-end", "LSU used him at center, guard, tackle, and even tight end before center became his defining NFL position.", ["identity-pr6-kevin-mawae"]),
    fact("ferro", "kenny-ferro-confidence", "He has credited high-school coach Kenny Ferro as one of the first coaches who convinced him he could become a major-college player.", ["identity-pr6-kevin-mawae"]),
    fact("brother-practice", "brother-opposite-line-lsu", "His brother John walked on at LSU as a defensive lineman, putting the brothers opposite one another in practice.", ["identity-pr6-kevin-mawae"]),
    fact("proposal", "lsu-fan-day-proposal", "He proposed to his future wife Tracy over the public-address system during LSU Fan Day in 1992.", ["identity-pr6-kevin-mawae"]),
  ]},
  { subjectId: "nfl-steve-hutchinson", facts: [
    fact("defense-switch", "defense-to-offensive-line-switch", "He spent his first fall at Michigan practicing on defense before bowl preparation revealed that offensive line was his better long-term position.", ["identity-pr6-steve-hutchinson"]),
    fact("walter-jones", "walter-jones-left-side-partnership", "In Seattle he formed a celebrated left-side tackle-guard partnership with Walter Jones.", ["identity-pr6-steve-hutchinson"]),
    fact("poison-pill", "poison-pill-contract-rule-change", "Minnesota's 2006 offer sheet used a 'poison pill' clause Seattle could not practically match, helping trigger a leaguewide end to that contract device.", ["identity-pr6-steve-hutchinson"]),
    fact("broken-leg", "broken-leg-to-start-streak", "A broken leg cost him most of 2002 before he returned to begin a long durability streak.", ["identity-pr6-steve-hutchinson"]),
    fact("no-sacks", "michigan-two-years-no-sack-allowed", "Michigan credited him with allowing no sacks over his final two college seasons.", ["identity-pr6-steve-hutchinson"]),
  ]},
  { subjectId: "bruce-smith", facts: [
    fact("basketball-first", "basketball-first-almost-quit-football", "Basketball was his first love, and he once quit football after an unpleasant early practice before his father made him return.", ["identity-pr6-bruce-smith"]),
    fact("late-start", "late-high-school-football-start", "He did not begin organized high-school football until his sophomore year.", ["identity-pr6-bruce-smith"]),
    fact("dual-sport", "dual-sport-scholarship-choice", "He had college opportunities in both basketball and football before choosing Virginia Tech football.", ["identity-pr6-bruce-smith"]),
    fact("vt-early", "virginia-tech-before-national-power", "He chose Virginia Tech before the program had become the sustained national power familiar to later fans.", ["identity-pr6-bruce-smith"]),
    fact("conditioning", "rookie-conditioning-transformation", "After reporting to Buffalo out of condition, he rebuilt his diet and cardio routine and reshaped his body for elite pass rushing.", ["identity-pr6-bruce-smith"]),
  ]},
  { subjectId: "nfl-deacon-jones", facts: [
    fact("deacon", "david-to-deacon-self-nickname", "Born David Jones, he adopted 'Deacon' himself because he wanted a distinctive name that contrasted with his aggressive football image.", ["identity-pr6-deacon-jones"]),
    fact("sack", "coined-football-sack-term", "He is credited with popularizing 'sack' as the term for tackling a quarterback behind the line of scrimmage.", ["identity-pr6-deacon-jones"]),
    fact("headslap", "head-slap-pass-rush", "His signature head-slap pass-rush technique became so notorious that later rule changes removed it from the game.", ["identity-pr6-deacon-jones"]),
    fact("fearsome", "fearsome-foursome-identity", "He was a central member of the Rams' 'Fearsome Foursome' defensive line.", ["identity-pr6-deacon-jones"]),
    fact("accidental", "accidental-scouting-film-discovery", "Rams scouts noticed him accidentally while evaluating another player on film, leading to a 14th-round draft selection.", ["identity-pr6-deacon-jones"]),
  ]},
  { subjectId: "nfl-sam-huff", facts: [
    fact("coal", "coal-mining-family-background", "He grew up in a West Virginia coal-mining community where many relatives worked in the mines and football offered another path.", ["identity-pr6-sam-huff"]),
    fact("twice-discovered", "twice-discovered-scouting-others", "At both the college-recruiting and pro-scouting stages, evaluators noticed Huff while primarily watching another player.", ["identity-pr6-sam-huff"]),
    fact("nearly-left", "nearly-left-giants-camp", "Frustrated by uncertainty over his role, he left Giants camp intending to go home before Vince Lombardi intercepted him and persuaded him to return.", ["identity-pr6-sam-huff"]),
    fact("beck-injury", "ray-beck-injury-middle-linebacker-opening", "An injury to Ray Beck created the opening that moved Huff into the middle-linebacker role that defined his career.", ["identity-pr6-sam-huff"]),
    fact("violent-world", "violent-world-media-profile", "A Time cover and the CBS documentary The Violent World of Sam Huff made him one of the era's first nationally famous defensive players.", ["identity-pr6-sam-huff"]),
  ]},
  { subjectId: "nfl-dick-night-train-lane", facts: [
    fact("scrapbook", "army-veteran-scrapbook-walkin", "After four years in the Army and a civilian aircraft-plant job, he walked into the Rams office with a scrapbook and asked for a tryout.", ["identity-pr6-dick-night-train-lane"]),
    fact("switch", "offense-to-defense-position-switch", "He arrived trying to make the Rams as an offensive end before moving to defensive back because established receivers blocked his path.", ["identity-pr6-dick-night-train-lane"]),
    fact("song", "night-train-song-nickname", "The 'Night Train' nickname came from the Jimmy Forrest recording he frequently played and teammate Tom Fears' association with the song.", ["identity-pr6-dick-night-train-lane"]),
    fact("rookie-record", "rookie-fourteen-interceptions", "As a rookie in 1952 he intercepted 14 passes in a 12-game regular season.", ["identity-pr6-dick-night-train-lane"]),
    fact("clothesline", "clothesline-tackling-style", "His high, forceful clothesline tackles became a defining part of his physical reputation and would not be legal under modern rules.", ["identity-pr6-dick-night-train-lane"]),
  ]},
  { subjectId: "nfl-troy-polamalu", facts: [
    fact("oregon-family", "oregon-relatives-name-change", "He moved from Southern California to Oregon to live with an aunt and uncle who became parental figures, and later legally incorporated the Polamalu family name he had already been using.", ["identity-pr6-troy-polamalu"]),
    fact("samoan", "american-samoan-heritage", "He has identified strongly with his Samoan heritage and family culture throughout his public life.", ["identity-pr6-troy-polamalu"]),
    fact("hair", "iconic-long-hair", "His exceptionally long hair, which he connected to Samoan heritage, became one of the NFL's most recognizable visual identifiers.", ["identity-pr6-troy-polamalu"]),
    fact("quiet-devil", "quiet-to-tasmanian-devil-persona", "Steelers accounts repeatedly contrasted his soft-spoken off-field personality with the explosive style that produced 'Tasmanian Devil' comparisons.", ["identity-pr6-troy-polamalu"]),
    fact("degree", "returned-usc-degree-promise", "He returned to USC to finish his degree, saying he wanted to fulfill a promise to the relatives who raised him.", ["identity-pr6-troy-polamalu"]),
  ]},
  { subjectId: "bill-parcells", facts: [
    fact("duane", "duane-to-bill-name-origin", "He was born Duane Charles Parcells but began going by Bill during high school after the name stuck socially.", ["identity-pr6-bill-parcells"]),
    fact("tuna", "big-tuna-nickname-origin", "The 'Big Tuna' nickname became one of the most durable labels of his coaching career.", ["identity-pr6-bill-parcells"]),
    fact("drafted", "drafted-never-played-nfl", "Detroit drafted him as a linebacker in 1964, but he never appeared in an NFL regular-season game.", ["identity-pr6-bill-parcells"]),
    fact("corcoran", "mickey-corcoran-lifelong-mentor", "He maintained a lifelong relationship with high-school basketball coach Mickey Corcoran, whom he viewed as an important mentor and confidant.", ["identity-pr6-bill-parcells"]),
    fact("earn-star", "earn-the-star-rookie-tradition", "As Cowboys coach he made rookies practice without the helmet star until he decided they had 'earned' it.", ["identity-pr6-bill-parcells"]),
  ]},
  { subjectId: "nfl-earl-curly-lambeau", facts: [
    fact("tonsillitis", "tonsillitis-ended-notre-dame-stay", "Severe tonsillitis cut short his time playing under Knute Rockne at Notre Dame and sent him back to Green Bay.", ["identity-pr6-earl-curly-lambeau"]),
    fact("packing", "indian-packing-job-team-origin", "After returning home he worked for the Indian Packing Company and helped organize the team whose employer supplied the Packers name.", ["identity-pr6-earl-curly-lambeau"]),
    fact("calhoun", "george-calhoun-cofounder", "He organized the original Green Bay club with newspaper editor George Calhoun, who handled important early publicity and organization.", ["identity-pr6-earl-curly-lambeau"]),
    fact("all-roles", "player-coach-captain-founder", "In Green Bay's early years he simultaneously served as founder, player, captain, and coach.", ["identity-pr6-earl-curly-lambeau"]),
    fact("pass", "pass-first-offensive-pioneer", "He became one of pro football's early coaches to treat the forward pass as a core offensive weapon rather than an emergency tactic.", ["identity-pr6-earl-curly-lambeau"]),
  ]},
  { subjectId: "nfl-john-madden", facts: [
    fact("injury-film", "injury-led-film-education", "A knee injury ended his Eagles playing hopes, and rehabilitation time studying film with Norm Van Brocklin became a formative football education.", ["identity-pr6-john-madden"]),
    fact("teacher", "teacher-before-famous-coach", "He earned teaching credentials and consistently described coaching and broadcasting as forms of teaching.", ["identity-pr6-john-madden"]),
    fact("coryell", "don-coryell-apprenticeship", "Before reaching the NFL he coached under offensive innovator Don Coryell at San Diego State.", ["identity-pr6-john-madden"]),
    fact("cruiser", "madden-cruiser-no-flying", "After he stopped flying, he traveled to broadcasts on the customized 'Madden Cruiser' bus.", ["identity-pr6-john-madden"]),
    fact("video-game", "video-game-eleven-on-eleven-insistence", "When Electronic Arts proposed a football game, he insisted it represent authentic 11-on-11 football rather than a simplified smaller format.", ["identity-pr6-john-madden"]),
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
