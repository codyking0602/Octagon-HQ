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
  source("identity-gonzalez-chiefs-retirement", "Kansas City Chiefs", "Tony Gonzalez Retires after 17-Remarkable Years", "https://www.chiefs.com/news/tony-gonzalez-retires-after-17-remarkable-years-12325106", "Tony Gonzalez high-school multi-sport profile, two-way football honors, Orange County athlete recognition, and signature goalpost dunk celebration."),
  source("identity-gonzalez-cal-hof", "California Golden Bears Athletics", "Tony Gonzalez - California Athletics Hall of Fame", "https://calbears.com/hof.aspx?hof=112", "Tony Gonzalez Cal football-and-basketball career, including his NCAA Tournament Sweet 16 run and Villanova game."),
  source("identity-gonzalez-pro-hof-draft", "Pro Football Hall of Fame", "Class of 2019 NFL Draft Spotlight: Tony Gonzalez", "https://www.profootballhof.com/news/class-of-2019-nfl-draft-spotlight-tony-gonzalez", "Tony Gonzalez being recruited to California for both football and basketball and his early two-sport college development."),
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
    subjectId: "nfl-tony-gonzalez",
    facts: [
      fact("three-sport-high-school-letterman", "high-school-three-sport-profile", "At Huntington Beach High School he lettered in football, basketball, and baseball.", ["identity-gonzalez-chiefs-retirement"], ["high-school", "multi-sport"]),
      fact("all-american-tight-end-linebacker", "high-school-two-way-all-american", "As a high-school senior he was a first-team All-American at both tight end and linebacker.", ["identity-gonzalez-chiefs-retirement"], ["high-school", "two-way"]),
      fact("shared-orange-county-award-with-tiger-woods", "shared-athlete-award-with-tiger-woods", "In 1994 he shared Orange County High School Athlete of the Year honors with golfer Tiger Woods.", ["identity-gonzalez-chiefs-retirement"], ["high-school", "multi-sport", "recognition"]),
      fact("cal-recruited-two-sports", "college-two-sport-recruiting", "California recruited him to play both basketball and football rather than forcing him to choose one sport before college.", ["identity-gonzalez-pro-hof-draft"], ["recruiting", "college", "multi-sport"]),
      fact("eighty-two-cal-basketball-games", "cal-basketball-career", "He played in 82 basketball games for Cal and started 16 of them while also building his football career.", ["identity-gonzalez-cal-hof"], ["college", "basketball", "multi-sport"]),
      fact("twenty-three-points-villanova-sweet-sixteen", "ncaa-tournament-breakthrough", "During Cal's 1997 NCAA Tournament run to the Sweet 16, he scored 23 points in the second-round win over Villanova.", ["identity-gonzalez-cal-hof"], ["college", "basketball", "iconic-moment"]),
      fact("goalpost-slam-dunk-celebration", "basketball-style-touchdown-celebration", "His football identity included a basketball crossover: he became known for slam-dunking the ball over the goalpost after touchdowns.", ["identity-gonzalez-chiefs-retirement"], ["style", "basketball", "visual-identity"]),
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
