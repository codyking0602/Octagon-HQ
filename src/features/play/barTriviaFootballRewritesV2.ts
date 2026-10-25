import type { BarTriviaQuestion } from "../games/barTriviaEngine";
/** Editorial replacement facts for future selections; original authored rows and old Daily snapshots are retained. */
type EditableFact = Pick<BarTriviaQuestion, "prompt" | "choices" | "answer" | "explanation" | "sourceId"> &
  { sourceUrl?: string; verifiedAt?: string };
const EDITS: Readonly<Record<string, EditableFact>> = {
  "nfl-r2-first-game-outside-na": {
    "prompt": "Which team defeated Miami in the first NFL regular-season game in London in 2007?",
    "choices": [
      "New York Giants",
      "New England Patriots",
      "Dallas Cowboys",
      "Seattle Seahawks"
    ],
    "answer": "New York Giants",
    "explanation": "The Giants beat Miami 13–10 at Wembley Stadium in October 2007.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-first-game-outside-na",
    "sourceUrl": "https://static.www.nfl.com/image/upload/v1677631524/gamecenter/10012007-1028-0387-6e9c-e5b757a1afa8.pdf",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-only-super-bowl-not-sellout": {
    "prompt": "Which Seahawks linebacker returned a Peyton Manning interception for a touchdown in Super Bowl XLVIII?",
    "choices": [
      "Malcolm Smith",
      "Bobby Wagner",
      "K.J. Wright",
      "Bruce Irvin"
    ],
    "answer": "Malcolm Smith",
    "explanation": "Malcolm Smith returned the pick 69 yards and was named Super Bowl MVP.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-only-super-bowl-not-sellout",
    "sourceUrl": "https://www.nfl.com/news/seahawks-crush-broncos-for-first-super-bowl-win-0ap2000000322949",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r2-first-soccer-kicker": {
    "prompt": "Which Broncos kicker hit a then-record 64-yard field goal in 2013?",
    "choices": [
      "Matt Prater",
      "Brandon McManus",
      "Jason Elam",
      "Sebastian Janikowski"
    ],
    "answer": "Matt Prater",
    "explanation": "Matt Prater hit from 64 yards against Tennessee in December 2013.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-first-soccer-kicker",
    "sourceUrl": "https://fantasy-www.nfl.com/news/matt-prater-breaks-field-goal-record-with-64-yarder-0ap2000000294584",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-first-black-pro": {
    "prompt": "Which coach became the first Black head coach to win a Super Bowl?",
    "choices": [
      "Tony Dungy",
      "Lovie Smith",
      "Mike Tomlin",
      "Art Shell"
    ],
    "answer": "Tony Dungy",
    "explanation": "Tony Dungy's Indianapolis Colts won Super Bowl XLI after the 2006 season.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-first-black-pro",
    "sourceUrl": "https://www.nfl.com/news/colts-announce-tony-dungy-diversity-fellowship-to-promote-diversity-in-nfl-coach",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-first-1000-rusher": {
    "prompt": "Which Hall of Fame running back rushed for a then-record 2,105 yards in 1984?",
    "choices": [
      "Eric Dickerson",
      "Walter Payton",
      "Barry Sanders",
      "O.J. Simpson"
    ],
    "answer": "Eric Dickerson",
    "explanation": "Eric Dickerson set the single-season rushing record with the Los Angeles Rams.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-first-1000-rusher",
    "sourceUrl": "https://www.nfl.com/news/minnesota-vikings-adrian-peterson-joins-the-2-000-yard-club-0ap1000000119412",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-regular-season-ot": {
    "prompt": "Who caught Aaron Rodgers' desperation Hail Mary against Detroit in December 2015?",
    "choices": [
      "Richard Rodgers",
      "Jordy Nelson",
      "Randall Cobb",
      "Davante Adams"
    ],
    "answer": "Richard Rodgers",
    "explanation": "Tight end Richard Rodgers caught the 61-yard winning pass in the Miracle in Motown.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-regular-season-ot",
    "sourceUrl": "https://www.nfl.com/news/packers-stun-lions-on-aaron-rodgers-hail-mary-td-0ap3000000593884",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r2-yellow-line": {
    "prompt": "Which Buffalo coach oversaw the high-tempo K-Gun offense during the team's four straight Super Bowl appearances?",
    "choices": [
      "Marv Levy",
      "Chuck Knox",
      "Wade Phillips",
      "Dick Jauron"
    ],
    "answer": "Marv Levy",
    "explanation": "Marv Levy coached Buffalo's early-1990s teams, known for Jim Kelly's no-huddle offense.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-yellow-line",
    "sourceUrl": "https://www.profootballhof.com/news/from-montreal-to-buffalo-marv-levy-s-pursuit-of-victory",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r2-do-your-job": {
    "prompt": "Who started at quarterback for New England when it finished 11–5 without injured Tom Brady in 2008?",
    "choices": [
      "Matt Cassel",
      "Brian Hoyer",
      "Jimmy Garoppolo",
      "Jacoby Brissett"
    ],
    "answer": "Matt Cassel",
    "explanation": "Matt Cassel replaced Tom Brady after the opening-game injury and led New England to 11 wins.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-do-your-job",
    "sourceUrl": "https://www.nfl.com/news/jimmy-garoppolo-s-four-game-stint-my-advice-for-patriots-qb-0ap3000000681781",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r1-duke-football": {
    "prompt": "Which NFL offense of the late 1990s and early 2000s was nicknamed 'The Greatest Show on Turf'?",
    "choices": [
      "St. Louis Rams",
      "Indianapolis Colts",
      "Kansas City Chiefs",
      "Minnesota Vikings"
    ],
    "answer": "St. Louis Rams",
    "explanation": "Kurt Warner's St. Louis Rams popularized that nickname during their high-scoring peak.",
    "sourceId": "football-bar-trivia-v2-nfl-r1-duke-football",
    "sourceUrl": "https://www.nfl.com/photos/greatest-show-on-turf-0ap2000000362117",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-gillette": {
    "prompt": "Which quarterback won MVP of Super Bowl XXXVI in New England's first championship?",
    "choices": [
      "Tom Brady",
      "Drew Bledsoe",
      "Kurt Warner",
      "Peyton Manning"
    ],
    "answer": "Tom Brady",
    "explanation": "Tom Brady led the Patriots' game-winning drive against the Rams.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-gillette",
    "sourceUrl": "https://www.nfl.com/news/super-bowl-mvps-where-was-each-award-winner-drafted-0ap3000000464583",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-att-stadium": {
    "prompt": "Which Cowboys legend made No. 22 famous as the NFL's all-time rushing leader?",
    "choices": [
      "Emmitt Smith",
      "Tony Dorsett",
      "Michael Irvin",
      "Troy Aikman"
    ],
    "answer": "Emmitt Smith",
    "explanation": "Emmitt Smith wore 22 and retired as the NFL's career rushing-yard leader.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-att-stadium",
    "sourceUrl": "https://www.dallascowboys.com/team/ROH-Emmitt-Smith",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-us-bank": {
    "prompt": "Which Vikings receiver famously pantomimed mooning Packers fans during a 2004-season playoff victory?",
    "choices": [
      "Randy Moss",
      "Cris Carter",
      "Stefon Diggs",
      "Justin Jefferson"
    ],
    "answer": "Randy Moss",
    "explanation": "Randy Moss' celebration at Lambeau Field became an infamous playoff moment.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-us-bank",
    "sourceUrl": "https://www.nfl.com/news/moss-returns-to-site-of-one-of-his-most-infamous-moments-09000d5d81b877ed",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-ford-field": {
    "prompt": "Which Lions receiver set the NFL single-season receiving yardage record in 2012?",
    "choices": [
      "Calvin Johnson",
      "Herman Moore",
      "Golden Tate",
      "Marvin Jones Jr."
    ],
    "answer": "Calvin Johnson",
    "explanation": "Calvin Johnson gained 1,964 receiving yards in 2012.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-ford-field",
    "sourceUrl": "https://www.nfl.com/news/calvin-johnson-single-season-receiving-record-bound-to-fall-at-some-point",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-lincoln-financial": {
    "prompt": "Which Eagles quarterback reached four straight NFC Championship Games from 2001 through 2004?",
    "choices": [
      "Donovan McNabb",
      "Nick Foles",
      "Randall Cunningham",
      "Michael Vick"
    ],
    "answer": "Donovan McNabb",
    "explanation": "Donovan McNabb led Philadelphia to four consecutive NFC title games from 2001 to 2004.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-lincoln-financial",
    "sourceUrl": "https://www.philadelphiaeagles.com/news/tuesday-timeout-forever-an-eagle-3572444",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-mercedes-falcons": {
    "prompt": "Which Falcons quarterback was named NFL MVP for the 2016 season?",
    "choices": [
      "Matt Ryan",
      "Michael Vick",
      "Chris Chandler",
      "Desmond Ridder"
    ],
    "answer": "Matt Ryan",
    "explanation": "Matt Ryan earned league MVP after leading Atlanta's high-scoring offense in 2016.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-mercedes-falcons",
    "sourceUrl": "https://www.nfl.com/news/matt-ryan-named-nfl-s-most-valuable-player-for-2016-0ap3000000782775",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-montana": {
    "prompt": "Who caught Joe Montana's late game-winning touchdown against Cincinnati in Super Bowl XXIII?",
    "choices": [
      "John Taylor",
      "Jerry Rice",
      "Dwight Clark",
      "Roger Craig"
    ],
    "answer": "John Taylor",
    "explanation": "John Taylor caught Montana's 10-yard pass with 34 seconds left.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-montana",
    "sourceUrl": "https://www.49ers.com/news/this-day-in-the-bay-49ers-defeat-cincinnati-bengals-in-super-bowl-xxiii",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-marino": {
    "prompt": "Which Dolphins running back helped introduce the Wildcat offense to NFL fans in a 2008 upset of New England?",
    "choices": [
      "Ronnie Brown",
      "Ricky Williams",
      "Reggie Bush",
      "Lamar Miller"
    ],
    "answer": "Ronnie Brown",
    "explanation": "Ronnie Brown rushed for four touchdowns and threw another in Miami's Wildcat breakout.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-marino",
    "sourceUrl": "https://www.miamidolphins.com/news/in-my-own-words-the-wildcat-ronnie-brown-vs-new-england-patriots",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-elway": {
    "prompt": "Which Broncos running back won MVP of Super Bowl XXXII against Green Bay?",
    "choices": [
      "Terrell Davis",
      "Clinton Portis",
      "John Elway",
      "Mike Anderson"
    ],
    "answer": "Terrell Davis",
    "explanation": "Terrell Davis scored three rushing touchdowns despite a migraine.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-elway",
    "sourceUrl": "https://www.nfl.com/author/terrell-davis-talent",
    "verifiedAt": "2026-10-25"
  },
  "nfl-easy2-brees": {
    "prompt": "Which Saints quarterback was MVP of the franchise's first Super Bowl victory after the 2009 season?",
    "choices": [
      "Drew Brees",
      "Aaron Brooks",
      "Teddy Bridgewater",
      "Jameis Winston"
    ],
    "answer": "Drew Brees",
    "explanation": "Drew Brees completed 32 passes in New Orleans' Super Bowl XLIV win.",
    "sourceId": "football-bar-trivia-v2-nfl-easy2-brees",
    "sourceUrl": "https://www.nfl.com/news/super-bowl-mvps-where-was-each-award-winner-drafted-0ap3000000464583",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-cardinals-cardinal-red": {
    "prompt": "Which quarterback led Arizona to the 2015 NFC Championship Game after joining the Cardinals in 2013?",
    "choices": [
      "Carson Palmer",
      "Kurt Warner",
      "Kyler Murray",
      "Matt Leinart"
    ],
    "answer": "Carson Palmer",
    "explanation": "Carson Palmer quarterbacked Arizona to a 13–3 record in the 2015 regular season.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-cardinals-cardinal-red",
    "sourceUrl": "https://www.azcardinals.com/legends/roster/carson-palmer",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r1-radio-helmet-team": {
    "prompt": "Which Cleveland Browns running back won three AP NFL MVP awards in the late 1950s and 1960s?",
    "choices": [
      "Jim Brown",
      "Leroy Kelly",
      "Marion Motley",
      "Nick Chubb"
    ],
    "answer": "Jim Brown",
    "explanation": "Jim Brown won AP MVP in 1957, 1958, and 1965.",
    "sourceId": "football-bar-trivia-v2-nfl-r1-radio-helmet-team",
    "sourceUrl": "https://www.pro-football-reference.com/awards/ap-nfl-mvp-award.htm",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-sb-li-ot-scorer": {
    "prompt": "Which Eagles defender recovered the late Tom Brady fumble caused by Brandon Graham in Super Bowl LII?",
    "choices": [
      "Derek Barnett",
      "Fletcher Cox",
      "Malcolm Jenkins",
      "Chris Long"
    ],
    "answer": "Derek Barnett",
    "explanation": "Derek Barnett secured Graham's strip-sack to help clinch Philadelphia's first Super Bowl win.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-sb-li-ot-scorer",
    "sourceUrl": "https://www.philadelphiaeagles.com/news/eagles-waive-derek-barnett",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-first-mnf-playbyplay": {
    "prompt": "Which Jets quarterback engineered the 2000 Monday Night Miracle comeback against Miami?",
    "choices": [
      "Vinny Testaverde",
      "Chad Pennington",
      "Boomer Esiason",
      "Mark Sanchez"
    ],
    "answer": "Vinny Testaverde",
    "explanation": "Vinny Testaverde led New York back from a 30–7 fourth-quarter deficit.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-first-mnf-playbyplay",
    "sourceUrl": "https://www.newyorkjets.com/news/oh-what-a-night-for-vinny-and-the-jets-2871170",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r2-first-regular-outside-us-city": {
    "prompt": "Which German city hosted the NFL's first regular-season game in Germany in 2022?",
    "choices": [
      "Munich",
      "Berlin",
      "Frankfurt",
      "Hamburg"
    ],
    "answer": "Munich",
    "explanation": "Tampa Bay defeated Seattle at Allianz Arena in Munich in November 2022.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-first-regular-outside-us-city",
    "sourceUrl": "https://www.nfl.com/news/nfl-commissioner-roger-goodell-says-league-is-working-very-hard-to-hold-a-game-in-berlin",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r2-first-regular-outside-na-city": {
    "prompt": "Which Chiefs quarterback threw six touchdown passes against Pittsburgh in a 2018 regular-season game?",
    "choices": [
      "Patrick Mahomes",
      "Alex Smith",
      "Matt Cassel",
      "Trent Green"
    ],
    "answer": "Patrick Mahomes",
    "explanation": "Patrick Mahomes threw six touchdowns as Kansas City beat Pittsburgh 42–37.",
    "sourceId": "football-bar-trivia-v2-nfl-r2-first-regular-outside-na-city",
    "sourceUrl": "https://www.nfl.com/news/patrick-mahomes-chiefs-offense-cover-for-woeful-defense-in-win-0ap3000000963252",
    "verifiedAt": "2026-10-25"
  },
  "nfl-r3-super-bowl-name-first-used": {
    "prompt": "Who won MVP of Super Bowl III after guaranteeing the Jets would beat the Colts?",
    "choices": [
      "Joe Namath",
      "Matt Snell",
      "Don Maynard",
      "Emerson Boozer"
    ],
    "answer": "Joe Namath",
    "explanation": "Joe Namath earned the Super Bowl III MVP award after New York's upset of Baltimore.",
    "sourceId": "football-bar-trivia-v2-nfl-r3-super-bowl-name-first-used",
    "sourceUrl": "https://www.nfl.com/news/five-unlikely-super-bowl-mvps-09000d5d8062d1a2",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-grove-walk-arch": {
    "prompt": "Which SEC opponent did Ole Miss upset in Oxford in 2014 as fans stormed the field?",
    "choices": [
      "Alabama",
      "Georgia",
      "LSU",
      "Florida"
    ],
    "answer": "Alabama",
    "explanation": "Ole Miss beat Alabama 23–17 in one of the Rebels' signature modern home victories.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-grove-walk-arch",
    "sourceUrl": "https://olemisssports.com/news/2014/10/4/Euphoria_Ole_Miss_Tops_No_1_Alabama_23_17",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-blue-installed": {
    "prompt": "Who coached Boise State to its famous overtime Fiesta Bowl upset of Oklahoma after the 2006 season?",
    "choices": [
      "Chris Petersen",
      "Dan Hawkins",
      "Bryan Harsin",
      "Dirk Koetter"
    ],
    "answer": "Chris Petersen",
    "explanation": "Chris Petersen was Boise State's head coach in the 2007 Fiesta Bowl.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-blue-installed",
    "sourceUrl": "https://broncosports.com/news/2026/10/1/in-their-words-the-2007-fiesta-bowl",
    "verifiedAt": "2026-10-25"
  },
  "cfb-final-1902-rose": {
    "prompt": "Which Trojan quarterback guided USC's back-to-back 2003 and 2004 AP national-title seasons?",
    "choices": [
      "Matt Leinart",
      "Carson Palmer",
      "Mark Sanchez",
      "John David Booty"
    ],
    "answer": "Matt Leinart",
    "explanation": "Matt Leinart was USC's starting quarterback for its 2003 and 2004 seasons.",
    "sourceId": "football-bar-trivia-v2-cfb-final-1902-rose",
    "sourceUrl": "https://usctrojans.com/honors/usc-athletics-hall-of-fame/matt-leinart/170",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-army-navy-first-site": {
    "prompt": "Which service academy snapped Notre Dame's 43-game winning streak in their series in 2007?",
    "choices": [
      "Navy",
      "Army",
      "Air Force",
      "Coast Guard"
    ],
    "answer": "Navy",
    "explanation": "Navy beat Notre Dame 46–44 in triple overtime in 2007.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-army-navy-first-site",
    "sourceUrl": "https://navysports.com/news/2007/11/3/navy_halts_a_43_game_losing_streak_and_wins_a_three_overtime_thriller_over_notre_dame.aspx",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-victory-bell-origin": {
    "prompt": "Which head coach led USC to its undefeated 2004-season BCS title?",
    "choices": [
      "Pete Carroll",
      "Lane Kiffin",
      "John Robinson",
      "Steve Sarkisian"
    ],
    "answer": "Pete Carroll",
    "explanation": "Pete Carroll coached USC's undefeated 2004 team that beat Oklahoma in the Orange Bowl.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-victory-bell-origin",
    "sourceUrl": "https://usctrojans.com/sports/football/roster/coaches/pete-carroll/343",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-victory-bell-paint": {
    "prompt": "Which UCLA quarterback led the Bruins to the 1998 Pac-10 title and Rose Bowl appearance?",
    "choices": [
      "Cade McNown",
      "Troy Aikman",
      "Josh Rosen",
      "Brett Hundley"
    ],
    "answer": "Cade McNown",
    "explanation": "Cade McNown led UCLA's 1998 team that reached the Rose Bowl.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-victory-bell-paint",
    "sourceUrl": "https://uclabruins.com/news/2020/03/11/mcnown-to-be-inducted-into-college-fb-hall-of-fame",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-2007-lsu-coach": {
    "prompt": "Which head coach won Clemson's first College Football Playoff title after the 2016 season?",
    "choices": [
      "Dabo Swinney",
      "Tommy Bowden",
      "Brent Venables",
      "Chad Morris"
    ],
    "answer": "Dabo Swinney",
    "explanation": "Dabo Swinney coached Clemson's title team that defeated Alabama in January 2017.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-2007-lsu-coach",
    "sourceUrl": "https://collegefootballplayoff.com/sports/2026/8/10/ncg-history",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-first-three-soph-heisman": {
    "prompt": "Who became Oklahoma's head coach after Bob Stoops retired in 2017?",
    "choices": [
      "Lincoln Riley",
      "Brent Venables",
      "Josh Heupel",
      "Mark Mangino"
    ],
    "answer": "Lincoln Riley",
    "explanation": "Lincoln Riley succeeded Stoops and led Oklahoma to multiple CFP appearances.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-first-three-soph-heisman",
    "sourceUrl": "https://soonersports.com/news/2017/6/7/211616668",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-2009-fiesta-undefeated": {
    "prompt": "Which two unbeaten schools met in the 2010 Fiesta Bowl following the 2009 season?",
    "choices": [
      "Boise State and TCU",
      "Utah and Boise State",
      "TCU and Cincinnati",
      "Boise State and Hawaii"
    ],
    "answer": "Boise State and TCU",
    "explanation": "Boise State defeated TCU 17–10 in the Fiesta Bowl on January 4, 2010.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-2009-fiesta-undefeated",
    "sourceUrl": "https://broncosports.com/news/2015/12/17/Bowl_Countdown_2010_Fiesta_Bowl",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-1990-split-title": {
    "prompt": "Which Colorado quarterback scored in the controversial 1990 Fifth Down game against Missouri?",
    "choices": [
      "Charles Johnson",
      "Kordell Stewart",
      "Darian Hagan",
      "Eric Bieniemy"
    ],
    "answer": "Charles Johnson",
    "explanation": "Charles Johnson plunged into the end zone on the mistakenly allowed fifth down.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-1990-split-title",
    "sourceUrl": "https://www.latimes.com/archives/la-xpm-1990-10-07-sp-3048-story.html",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-1991-split-title": {
    "prompt": "Which Washington quarterback helped lead the Huskies' unbeaten 1991 national-title season?",
    "choices": [
      "Billy Joe Hobert",
      "Mark Brunell",
      "Damon Huard",
      "Brock Huard"
    ],
    "answer": "Billy Joe Hobert",
    "explanation": "Billy Joe Hobert started for Washington during its 1991 championship run.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-1991-split-title",
    "sourceUrl": "https://static.gohuskies.com/old_site/pdf/m-footbl/03guide-heritage-misc.pdf",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-2003-split-title": {
    "prompt": "Who quarterbacked LSU's 2003-season BCS championship victory over Oklahoma?",
    "choices": [
      "Matt Mauck",
      "JaMarcus Russell",
      "Rohan Davey",
      "Matt Flynn"
    ],
    "answer": "Matt Mauck",
    "explanation": "Matt Mauck quarterbacked LSU in its 21–14 Sugar Bowl victory over Oklahoma.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-2003-split-title",
    "sourceUrl": "https://lsusports.net/news/2013/10/9/209278954",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r1-first-junior-heisman": {
    "prompt": "Which Auburn two-sport star won the Heisman Trophy in 1985?",
    "choices": [
      "Bo Jackson",
      "Cam Newton",
      "Pat Sullivan",
      "Herschel Walker"
    ],
    "answer": "Bo Jackson",
    "explanation": "Bo Jackson won the 1985 Heisman for Auburn before playing professional baseball and football.",
    "sourceId": "football-bar-trivia-v2-cfb-r1-first-junior-heisman",
    "sourceUrl": "https://auburntigers.com/news/2025/11/28/heisman-at-40-auburn-honors-bo-jacksons-1985-season",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r1-first-west-coast-heisman": {
    "prompt": "Which USC running back won the 2005 Heisman Trophy?",
    "choices": [
      "Reggie Bush",
      "LenDale White",
      "Marcus Allen",
      "Charles White"
    ],
    "answer": "Reggie Bush",
    "explanation": "Reggie Bush's 2005 Heisman Trophy was formally restored in 2024.",
    "sourceId": "football-bar-trivia-v2-cfb-r1-first-west-coast-heisman",
    "sourceUrl": "https://www.heisman.com/heisman-winners/reggie-bush/",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-last-ivy-heisman": {
    "prompt": "Which Notre Dame linebacker finished second to Johnny Manziel in the 2012 Heisman vote?",
    "choices": [
      "Manti Te'o",
      "Jaylon Smith",
      "Stephon Tuitt",
      "Michael Floyd"
    ],
    "answer": "Manti Te'o",
    "explanation": "Manti Te'o finished runner-up in the 2012 Heisman voting.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-last-ivy-heisman",
    "sourceUrl": "https://www.heisman.com/voting-records/",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r3-1969-texas-coach": {
    "prompt": "Which Texas running back won the Heisman Trophy in 1977?",
    "choices": [
      "Earl Campbell",
      "Ricky Williams",
      "Cedric Benson",
      "Jamaal Charles"
    ],
    "answer": "Earl Campbell",
    "explanation": "Earl Campbell won the 1977 Heisman for the Longhorns.",
    "sourceId": "football-bar-trivia-v2-cfb-r3-1969-texas-coach",
    "sourceUrl": "https://texaslonghorns.com/honors/hall-of-honor/earl-campbell/510",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-commonwealth-cup": {
    "prompt": "Which Virginia Tech coach led the Hokies to the 1999-season BCS title game?",
    "choices": [
      "Frank Beamer",
      "Bud Foster",
      "Justin Fuente",
      "Brent Pry"
    ],
    "answer": "Frank Beamer",
    "explanation": "Frank Beamer coached Virginia Tech and Michael Vick to the Sugar Bowl title game.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-commonwealth-cup",
    "sourceUrl": "https://hokiesports.com/news/2025/01/13/virginia-tech-football-beamer-honored-by-the-american-football-coaches-association",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-illibuck": {
    "prompt": "Which Illinois quarterback led the Illini to a 2007 upset at top-ranked Ohio State?",
    "choices": [
      "Juice Williams",
      "Kurt Kittner",
      "Nathan Scheelhaase",
      "Jeff George"
    ],
    "answer": "Juice Williams",
    "explanation": "Juice Williams ran and passed Illinois to a memorable win at Ohio State.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-illibuck",
    "sourceUrl": "https://fightingillini.com/news/2014/10/31/Juice_Williams_Live_Tweets_BTN_Replay_of_2007_Ohio_State_Win",
    "verifiedAt": "2026-10-25"
  },
  "cfb-r2-heartland-trophy": {
    "prompt": "Which Wisconsin running back rushed for 408 yards against Nebraska in 2014?",
    "choices": [
      "Melvin Gordon",
      "Jonathan Taylor",
      "Montee Ball",
      "James White"
    ],
    "answer": "Melvin Gordon",
    "explanation": "Melvin Gordon ran for 408 yards in just three quarters against Nebraska.",
    "sourceId": "football-bar-trivia-v2-cfb-r2-heartland-trophy",
    "sourceUrl": "https://uwbadgers.com/honors/uw-athletic-hall-of-fame/melvin-gordon/339",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-crimson-tide": {
    "prompt": "Who succeeded Nick Saban as Alabama's head football coach in 2024?",
    "choices": [
      "Kalen DeBoer",
      "Kirby Smart",
      "Lane Kiffin",
      "Dan Lanning"
    ],
    "answer": "Kalen DeBoer",
    "explanation": "Alabama hired Kalen DeBoer from Washington after Saban's retirement in January 2024.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-crimson-tide",
    "sourceUrl": "https://rolltide.com/news/2024/1/13/kalen-deboer-named-head-coach-of-alabama-football",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-buckeyes": {
    "prompt": "Which Ohio State quarterback started the Buckeyes' 2014-season national-title victory over Oregon?",
    "choices": [
      "Cardale Jones",
      "J.T. Barrett",
      "Braxton Miller",
      "Dwayne Haskins"
    ],
    "answer": "Cardale Jones",
    "explanation": "Cardale Jones started the title game following injuries to Braxton Miller and J.T. Barrett.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-buckeyes",
    "sourceUrl": "https://ohiostatebuckeyes.com/news/2015/1/13/national-champions-ohio-state-wins-first-college-football-playoff",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-wolverines": {
    "prompt": "Who coached Michigan to its undefeated 2023-season national championship?",
    "choices": [
      "Jim Harbaugh",
      "Lloyd Carr",
      "Sherrone Moore",
      "Brady Hoke"
    ],
    "answer": "Jim Harbaugh",
    "explanation": "Jim Harbaugh's Wolverines defeated Washington for the national championship in January 2024.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-wolverines",
    "sourceUrl": "https://mgoblue.com/news/2024/2/21/season-review-2023-michigan-football",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-fighting-irish": {
    "prompt": "Which Notre Dame receiver won the 1987 Heisman Trophy?",
    "choices": [
      "Tim Brown",
      "Golden Tate",
      "Michael Floyd",
      "Jeff Samardzija"
    ],
    "answer": "Tim Brown",
    "explanation": "Tim Brown won the 1987 Heisman as a Notre Dame wide receiver and returner.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-fighting-irish",
    "sourceUrl": "https://und.com/wp-content/uploads/2022/08/2022-ND-Football-Media-Guide.pdf",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-trojans": {
    "prompt": "Which USC running back won the 1979 Heisman Trophy?",
    "choices": [
      "Charles White",
      "Marcus Allen",
      "O.J. Simpson",
      "Reggie Bush"
    ],
    "answer": "Charles White",
    "explanation": "Charles White won the 1979 Heisman for USC.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-trojans",
    "sourceUrl": "https://usctrojans.com/honors/usc-athletics-hall-of-fame/charles-white/41",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-longhorns": {
    "prompt": "Which Texas running back won the 1998 Heisman Trophy?",
    "choices": [
      "Ricky Williams",
      "Cedric Benson",
      "Jamaal Charles",
      "Priest Holmes"
    ],
    "answer": "Ricky Williams",
    "explanation": "Ricky Williams won the 1998 Heisman after breaking the NCAA career rushing record.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-longhorns",
    "sourceUrl": "https://texaslonghorns.com/sports/general/roster/ricky-williams/5056",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-sooners": {
    "prompt": "Which Oklahoma quarterback won the 2018 Heisman Trophy?",
    "choices": [
      "Kyler Murray",
      "Baker Mayfield",
      "Jalen Hurts",
      "Sam Bradford"
    ],
    "answer": "Kyler Murray",
    "explanation": "Kyler Murray won the 2018 award for Oklahoma.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-sooners",
    "sourceUrl": "https://soonersports.com/sports/football/roster/kyler-murray/3464",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-cornhuskers": {
    "prompt": "Which Nebraska quarterback led consecutive national championship teams in the 1994 and 1995 seasons?",
    "choices": [
      "Tommie Frazier",
      "Eric Crouch",
      "Scott Frost",
      "Turner Gill"
    ],
    "answer": "Tommie Frazier",
    "explanation": "Tommie Frazier led Nebraska's dominant mid-1990s championship teams.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-cornhuskers",
    "sourceUrl": "https://huskers.com/sports/football/roster/season/1994/player/tommie-frazier/",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-nittany-lions": {
    "prompt": "Who coached Penn State to its 1986-season national championship win over Miami?",
    "choices": [
      "Joe Paterno",
      "James Franklin",
      "Bill O'Brien",
      "George Welsh"
    ],
    "answer": "Joe Paterno",
    "explanation": "Joe Paterno's Nittany Lions beat Miami 14–10 in the Fiesta Bowl.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-nittany-lions",
    "sourceUrl": "https://gopsusports.com/staff/joe-paterno",
    "verifiedAt": "2026-10-25"
  },
  "cfb-easy2-volunteers": {
    "prompt": "Which Tennessee quarterback won the 1997 SEC Championship before becoming an NFL star?",
    "choices": [
      "Peyton Manning",
      "Tee Martin",
      "Erik Ainge",
      "Hendon Hooker"
    ],
    "answer": "Peyton Manning",
    "explanation": "Peyton Manning led Tennessee to the 1997 SEC title in his senior season.",
    "sourceId": "football-bar-trivia-v2-cfb-easy2-volunteers",
    "sourceUrl": "https://utsports.com/sports/football/roster/peyton-manning/15491",
    "verifiedAt": "2026-10-25"
  }
};
export const FOOTBALL_BAR_TRIVIA_V2_REWRITES: Readonly<Record<string, EditableFact>> = EDITS;
export function applyFootballBarTriviaV2Rewrite(question: BarTriviaQuestion): BarTriviaQuestion {
  const replacement = FOOTBALL_BAR_TRIVIA_V2_REWRITES[question.id];
  if (!replacement) return question;
  return { ...question, ...replacement };
}
