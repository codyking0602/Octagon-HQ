import type { MillionaireFutureRewriteSeed } from "./millionaireEditorialFutureErrata";

/**
 * Future-only replacement Q8 candidates. All are editorial HOLD, despite
 * the included independently retrieved primary-source event summaries.
 * The published legacy Q8s are immutable. Q8 has zero lifelines / Stat Sheet.
 */
type Evidence = MillionaireFutureRewriteSeed["evidence"][number];
function q8(
  id: string,
  type: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  answer: string,
  explanation: string,
  evidence?: Evidence,
): MillionaireFutureRewriteSeed {
  return { id, type, prompt, choices, answer, explanation, statSheet: null, evidence: evidence ? [evidence] : [] };
}
export const MILLIONAIRE_FUTURE_Q8_REWRITES: Record<string, MillionaireFutureRewriteSeed> = {
  "nfl:0:7": q8(
    "millionaire-nfl-future-1975-hail-mary-q8", "iconic-play",
    "Who caught Roger Staubach's winning 1975 playoff Hail Mary against Minnesota?",
    ["Drew Pearson", "Tony Hill", "Bob Hayes", "Golden Richards"], "Drew Pearson",
    "Drew Pearson caught Staubach's 50-yard Hail Mary touchdown to defeat Minnesota in the 1975 season's divisional playoffs.",
    { authority: "NFL 100", url: "https://www.nfl.com/100/originals/100-greatest/detail.html?slug=plays-15", supportingDetail: "Official historical account describes the Dec. 28, 1975 pass caught by Pearson against Minnesota." },
  ),
  "nfl:1:7": q8(
    "millionaire-nfl-future-tracy-porter-two-playoffs-q8", "postseason-turnovers",
    "Which Saints cornerback intercepted BOTH Brett Favre in the NFC Championship and Peyton Manning in Super Bowl XLIV?",
    ["Tracy Porter", "Darren Sharper", "Roman Harper", "Malcolm Jenkins"], "Tracy Porter",
    "Tracy Porter intercepted Favre during the 2009 season's NFC title game and returned a Manning interception for a touchdown in Super Bowl XLIV.",
    { authority: "NFL", url: "https://www.nfl.com/news/louisiana-native-porter-seals-saints-super-bowl-win-with-int-09000d5d816473bd", supportingDetail: "NFL 2010 Super Bowl reporting describes Porter's interception of Manning and his postseason play." },
  ),
  "nfl:2:7": q8(
    "millionaire-nfl-future-bradshaw-super-bowl-xlvi-q8", "super-bowl-finish",
    "Which Giants running back scored the late go-ahead touchdown that the Patriots deliberately allowed in Super Bowl XLVI?",
    ["Ahmad Bradshaw", "Brandon Jacobs", "Danny Ware", "Andre Brown"], "Ahmad Bradshaw",
    "Ahmad Bradshaw scored on a six-yard run with 57 seconds remaining, despite trying to stop short as New England left the end zone open.",
    { authority: "NFL", url: "https://www.nfl.com/news/top-10-running-back-performances-in-the-last-10-super-bowls-0ap3000001098776", supportingDetail: "NFL recounts Bradshaw's final go-ahead Super Bowl XLVI touchdown and clock-management context." },
  ),
  "nfl:5:7": q8(
    "millionaire-nfl-future-larry-fitzgerald-ot-2015-q8", "playoff-finish",
    "Who scored Arizona's walk-off overtime touchdown against Green Bay in the 2015 season's NFC divisional playoffs?",
    ["Larry Fitzgerald", "John Brown", "Michael Floyd", "David Johnson"], "Larry Fitzgerald",
    "After a long catch-and-run on the first overtime drive, Larry Fitzgerald scored from five yards out on a shovel pass from Carson Palmer.",
    { authority: "NFL / Packers", url: "https://www.packers.com/news/packers-defense-had-its-chances-16708510", supportingDetail: "Packers' divisional-round recap describes Fitzgerald's overtime touchdown following his long catch-and-run." },
  ),
  "nfl:7:7": q8(
    "millionaire-nfl-future-vernon-davis-saints-2011-q8", "playoff-finish",
    "Who caught Alex Smith's winning touchdown with nine seconds left against New Orleans in the 2011 season's NFC playoffs?",
    ["Vernon Davis", "Michael Crabtree", "Delanie Walker", "Ted Ginn Jr."], "Vernon Davis",
    "Vernon Davis caught the winning touchdown pass from Alex Smith in San Francisco's January 2012 divisional-round victory.",
    { authority: "San Francisco 49ers", url: "https://www.49ers.com/news/49ers-top-100-games-history", supportingDetail: "Team history identifies Davis as the nine-seconds-remaining winning receiver." },
  ),
  "nfl:9:7": q8(
    "millionaire-nfl-future-timmy-smith-super-bowl-q8", "super-bowl-history",
    "Which Washington running back set the Super Bowl single-game rushing record with 204 yards in Super Bowl XXII?",
    ["Timmy Smith", "John Riggins", "Earnest Byner", "Ricky Ervins"], "Timmy Smith",
    "Timmy Smith rushed for a Super Bowl-record 204 yards and two touchdowns against Denver in Super Bowl XXII.",
    { authority: "NFL", url: "https://www.nfl.com/news/greatest-super-bowl-performances-running-backs-09000d5d806539a3", supportingDetail: "NFL official retrospective lists Smith's 204 yards and Super Bowl record." },
  ),
  "cfb:0:7": q8(
    "millionaire-cfb-future-2007-fiesta-rabb-q8", "bowl-iconic-play",
    "Who scored Boise State's tying touchdown on the hook-and-lateral in the final seconds of the 2007 Fiesta Bowl?",
    ["Jerard Rabb", "Drisan James", "Ian Johnson", "Jared Zabransky"], "Jerard Rabb",
    "Jared Zabransky passed to Drisan James, who pitched to Jerard Rabb for a 50-yard tying touchdown against Oklahoma.",
    { authority: "College Football Hall of Fame", url: "https://www.cfbhall.com/news-and-happenings/blog/greatest-moments-in-college-football-boise-state-vs-oklahoma-2007-fiesta-bowl-game/", supportingDetail: "Hall history traces the 4th-and-18 hook-and-lateral from James to Rabb and his touchdown." },
  ),
  "cfb:1:7": q8(
    "millionaire-cfb-future-barry-sanders-2628-q8", "heisman-milestone",
    "Which Oklahoma State star rushed for 2,628 yards in the 1988 regular season on his way to the Heisman Trophy?",
    ["Barry Sanders", "Marcus Allen", "Mike Rozier", "Ricky Williams"], "Barry Sanders",
    "Barry Sanders rushed for 2,628 yards in 11 games at Oklahoma State during his historic 1988 Heisman season.",
    { authority: "Heisman Trust", url: "https://www.heisman.com/records-statistics/", supportingDetail: "Trust's season rushing leaders list Sanders with 2,628 rushing yards in 1988." },
  ),
  "cfb:2:7": q8(
    "millionaire-cfb-future-tcu-2010-patterson-q8", "bowl-coaching",
    "Who coached TCU to a 13-0 season capped by a Rose Bowl victory over Wisconsin after the 2010 season?",
    ["Gary Patterson", "Sonny Dykes", "Dennis Franchione", "Pat Fitzgerald"], "Gary Patterson",
    "Gary Patterson led TCU to 13-0 and a 21-19 victory over Wisconsin in the Rose Bowl.",
    { authority: "TCU Athletics", url: "https://gofrogs.com/news/2011/1/20/Patterson_Receives_National_Coaching_Honor", supportingDetail: "TCU's 2011 coaches award report names Patterson and the 13-0 Rose Bowl campaign." },
  ),
  "cfb:3:7": q8(
    "millionaire-cfb-future-blackmon-biletnikoff-q8", "college-receivers",
    "Which Oklahoma State receiver won the Biletnikoff Award in BOTH 2010 and 2011?",
    ["Justin Blackmon", "Dez Bryant", "James Washington", "Michael Crabtree"], "Justin Blackmon",
    "Justin Blackmon won consecutive Biletnikoff Awards while starring at Oklahoma State in 2010 and 2011.",
    { authority: "Oklahoma State Athletics", url: "https://okstate.com/sports/2015/3/17/GEN_2014010114", supportingDetail: "School Hall of Honor biography lists Blackmon's 2010 and 2011 Biletnikoff awards." },
  ),
  "cfb:4:7": q8(
    "millionaire-cfb-future-2010-auburn-byrum-q8", "title-winning-kick",
    "Who kicked Auburn's game-winning field goal against Oregon in the national championship game following the 2010 season?",
    ["Wes Byrum", "Daniel Carlson", "Cody Parkey", "Anders Carlson"], "Wes Byrum",
    "Wes Byrum made a 19-yard field goal as time expired to secure Auburn's 22-19 win over Oregon in January 2011.",
    { authority: "Auburn Athletics", url: "https://auburntigers.com/news/2011/01/10/tigers-are-bcs-national-champions", supportingDetail: "School's BCS final recap confirms Byrum's 19-yard winner on final play." },
  ),
  "cfb:5:7": q8(
    "millionaire-cfb-future-1993-auburn-bowden-q8", "undefeated-underdogs",
    "Who coached Auburn through its undefeated 11-0 season in 1993 despite NCAA postseason sanctions?",
    ["Terry Bowden", "Pat Dye", "Tommy Tuberville", "Gene Chizik"], "Terry Bowden",
    "In his first Auburn season, Terry Bowden coached the Tigers to 11-0 despite restrictions on postseason play and television.",
    { authority: "Auburn Athletics", url: "https://auburntigers.com/news/2020/05/1/auburns-perfect-1993-season", supportingDetail: "Official retrospective names Bowden and 1993 11-0 season while on probation." },
  ),
  "cfb:6:7": q8(
    "millionaire-cfb-future-colorado-mccartney-1990-q8", "title-coaching",
    "Who coached Colorado to its first national football championship for the 1990 season?",
    ["Bill McCartney", "Gary Barnett", "Rick Neuheisel", "Dan Hawkins"], "Bill McCartney",
    "Bill McCartney guided Colorado to its first national football title in 1990.",
    { authority: "Colorado Athletics", url: "https://cubuffs.com/honors/cu-athletic-hall-of-fame/bill-mccartney/63", supportingDetail: "University coaching biography names McCartney as the 1990 national champion." },
  ),
  "cfb:8:7": q8(
    "millionaire-cfb-future-1993-ward-heisman-nba-q8", "two-sport-careers",
    "Which 1993 Heisman winner later played professional basketball in the NBA instead of pursuing an NFL career?",
    ["Charlie Ward", "Chris Weinke", "Jameis Winston", "Danny Kanell"], "Charlie Ward",
    "Charlie Ward won the 1993 Heisman at Florida State and played in the NBA rather than the NFL.",
    { authority: "Heisman Trust", url: "https://www.heisman.com/heisman-winners/charlie-ward/", supportingDetail: "Trust's player profile confirms both the 1993 Heisman and his NBA career." },
  ),
  "cfb:9:7": q8(
    "millionaire-cfb-future-ringo-2022-title-q8", "national-championship-finish",
    "Who returned a late interception for a touchdown to seal Georgia's national championship win over Alabama in January 2022?",
    ["Kelee Ringo", "Nakobe Dean", "Lewis Cine", "Derion Kendrick"], "Kelee Ringo",
    "Kelee Ringo returned a Bryce Young pass 79 yards for a touchdown with 54 seconds remaining to seal Georgia's 33-18 victory.",
    { authority: "Georgia Athletics", url: "https://georgiadogs.com/news/2022/1/10/football-bulldogs-capture-national-title-with-33-18-win-over-alabama", supportingDetail: "UGA's game recap gives Ringo's 79-yard interception TD with 54 seconds remaining." },
  ),
  "ufc:0:7": q8(
    "millionaire-ufc-future-first-fight-gordeau-q8", "ufc-origins",
    "Who won the first bout in UFC history by stopping Teila Tuli at UFC 1 in 1993?",
    ["Gerard Gordeau", "Royce Gracie", "Ken Shamrock", "Patrick Smith"], "Gerard Gordeau",
    "Gerard Gordeau knocked out Teila Tuli in 26 seconds in the first fight on UFC 1's card.",
    { authority: "UFC official event", url: "https://www.ufc.com/event/ufc-1", supportingDetail: "The inaugural event results list Gordeau's KO of Tuli at 0:26, the promotion's opening bout." },
  ),
  "ufc:2:7": q8(
    "millionaire-ufc-future-korean-zombie-first-twister-q8", "submission-history",
    "Who earned the UFC's first-ever Twister submission by finishing Leonard Garcia in 2011?",
    ["Chan Sung Jung", "Bryce Mitchell", "Charles Oliveira", "Ryan Hall"], "Chan Sung Jung",
    "Chan Sung Jung, the Korean Zombie, submitted Leonard Garcia with the UFC's first Twister in March 2011.",
    { authority: "UFC", url: "https://www.ufc.com/news/chan-sung-jung-and-year-zombie", supportingDetail: "UFC account specifies Jung's first-ever Twister over Garcia on March 26, 2011." },
  ),
  "ufc:3:7": q8(
    "millionaire-ufc-future-253-blachowicz-q8", "vacant-title-fight",
    "Who defeated Dominick Reyes at UFC 253 to win the vacant light heavyweight championship?",
    ["Jan Błachowicz", "Glover Teixeira", "Jiri Prochazka", "Alex Pereira"], "Jan Błachowicz",
    "Jan Błachowicz defeated Dominick Reyes at UFC 253 to win the vacant light heavyweight title.",
    { authority: "UFC title lineage", url: "https://www.ufc.com/news/ufc-light-heavyweight-title-lineage-jones-cormier-blachowicz-teixeira-prochazka", supportingDetail: "Official lineage records Blachowicz taking the vacant belt from Reyes at UFC 253." },
  ),
  "ufc:4:7": q8(
    "millionaire-ufc-future-139-shogun-henderson-q8", "classic-fights",
    "Who defeated Mauricio 'Shogun' Rua by decision in their celebrated five-round UFC 139 main event?",
    ["Dan Henderson", "Forrest Griffin", "Jon Jones", "Lyoto Machida"], "Dan Henderson",
    "Dan Henderson defeated Mauricio Rua by unanimous decision after a five-round classic at UFC 139.",
    { authority: "UFC event coverage", url: "https://www.ufc.com/news/ufc-139-main-event-results-epic-henderson-ekes-rua-classic", supportingDetail: "Official report records Henderson's 48-47 unanimous decision over Rua." },
  ),
  "ufc:5:7": q8(
    "millionaire-ufc-future-216-interim-ferguson-q8", "submission-title-fight",
    "Who submitted Kevin Lee to win the interim UFC lightweight championship at UFC 216?",
    ["Tony Ferguson", "Justin Gaethje", "Dustin Poirier", "Eddie Alvarez"], "Tony Ferguson",
    "Tony Ferguson submitted Kevin Lee with a triangle choke in Round 3 at UFC 216.",
    { authority: "UFC 216 result", url: "https://www.ufc.com/news/ferguson-claims-interim-lightweight-belt-calls-out-mcgregor", supportingDetail: "Official fight account names Ferguson as winner over Lee by Round 3 submission for the interim belt." },
  ),
};
