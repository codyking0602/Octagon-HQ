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
  // Replace arcane Craig Morton multi-franchise trivia with an unforgettable 2011-season playoff moment.
  "nfl:3:7": q8(
    "millionaire-nfl-future-demaryius-tebow-2012-ot-q8", "playoff-walkoffs",
    "Which Broncos receiver caught Tim Tebow's 80-yard walk-off touchdown on the FIRST play of overtime against Pittsburgh in January 2012?",
    ["Demaryius Thomas", "Eric Decker", "Eddie Royal", "Brandon Lloyd"], "Demaryius Thomas",
    "Demaryius Thomas caught an 80-yard pass from Tim Tebow on the first overtime play in the January 8, 2012 AFC wild-card game, giving Denver a 29–23 victory over Pittsburgh.",
    { authority: "Denver Broncos", url: "https://www.denverbroncos.com/news/broncos-advance-with-postseason-thriller-6775656", supportingDetail: "Official Broncos recap confirms Tebow-to-Thomas, an 80-yard touchdown on the first play of overtime, and a 29–23 win." },
  ),
  // Replace sixth-QB-of-the-1983-draft trivia with a famous Super Bowl LI finish.
  "nfl:4:7": q8(
    "millionaire-nfl-future-james-white-super-bowl-li-ot-q8", "super-bowl-walkoffs",
    "Which Patriots running back scored the overtime touchdown that completed the 28–3 comeback against Atlanta in Super Bowl LI?",
    ["James White", "LeGarrette Blount", "Dion Lewis", "Rex Burkhead"], "James White",
    "James White scored on a two-yard touchdown run on New England's first overtime drive to beat Atlanta 34–28 in Super Bowl LI on February 5, 2017.",
    { authority: "New England Patriots", url: "https://www.patriots.com/press-room/super-bowl-li", supportingDetail: "Official Patriots Super Bowl LI recap identifies White's two-yard overtime winner in the 34–28 comeback." },
  ),
  "nfl:0:7": q8(
    "millionaire-nfl-future-dejean-super-bowl-lix-q8", "super-bowl-pick-six",
    "Which Eagles rookie cornerback intercepted Patrick Mahomes for a touchdown in Super Bowl LIX?",
    ["Cooper DeJean", "Quinyon Mitchell", "Darius Slay", "C.J. Gardner-Johnson"], "Cooper DeJean",
    "Cooper DeJean scored on a 38-yard interception return against Kansas City in the Eagles' 40–22 Super Bowl LIX victory on February 9, 2025.",
    { authority: "NFL", url: "https://www.nfl.com/_amp/eagles-birthday-boy-cooper-dejean-super-bowl-pick-six-still-doesnt-feel-real", supportingDetail: "NFL confirms the rookie cornerback's 38-yard pick-six against Mahomes in Super Bowl LIX." },
  ),
  "nfl:1:7": q8(
    "millionaire-nfl-future-tracy-porter-two-playoffs-q8", "postseason-turnovers",
    "Which Saints cornerback intercepted BOTH Brett Favre in the NFC Championship and Peyton Manning in Super Bowl XLIV?",
    ["Tracy Porter", "Darren Sharper", "Roman Harper", "Malcolm Jenkins"], "Tracy Porter",
    "Tracy Porter intercepted Favre during the 2009 season's NFC title game and returned a Manning interception for a touchdown in Super Bowl XLIV.",
    { authority: "NFL", url: "https://www.nfl.com/news/louisiana-native-porter-seals-saints-super-bowl-win-with-int-09000d5d816473bd", supportingDetail: "NFL 2010 Super Bowl reporting describes Porter's interception of Manning and his postseason play." },
  ),
  "nfl:2:7": q8(
    "millionaire-nfl-future-hubbard-ravens-fumble-q8", "playoff-turning-points",
    "Which Bengals defender returned a Ravens goal-line fumble 98 yards for a touchdown in the January 2023 playoffs?",
    ["Sam Hubbard", "Logan Wilson", "Trey Hendrickson", "Joseph Ossai"], "Sam Hubbard",
    "Sam Hubbard scooped up a fumble forced by Logan Wilson and returned it 98 yards in the fourth quarter of Cincinnati's 24–17 wild-card victory over Baltimore.",
    { authority: "NFL", url: "https://www.nfl.com/news/bengals-sam-hubbard-on-game-winning-fumble-return-you-can-t-replicate-a-feeling-", supportingDetail: "NFL recaps Wilson's forced fumble and Hubbard's 98-yard touchdown against Baltimore." },
  ),
  "nfl:5:7": q8(
    "millionaire-nfl-future-larry-fitzgerald-ot-2015-q8", "playoff-finish",
    "Who scored Arizona's walk-off overtime touchdown against Green Bay in the 2015 season's NFC divisional playoffs?",
    ["Larry Fitzgerald", "John Brown", "Michael Floyd", "David Johnson"], "Larry Fitzgerald",
    "After a long catch-and-run on the first overtime drive, Larry Fitzgerald scored from five yards out on a shovel pass from Carson Palmer.",
    { authority: "NFL / Packers", url: "https://www.packers.com/news/packers-defense-had-its-chances-16708510", supportingDetail: "Packers' divisional-round recap describes Fitzgerald's overtime touchdown following his long catch-and-run." },
  ),
  "nfl:6:7": q8(
    "millionaire-nfl-future-2001-tuck-rule-woodson-q8", "playoff-controversy",
    "Which Raiders defender knocked the ball from Tom Brady on the controversial Tuck Rule play in the 2001 season's AFC divisional playoff?",
    ["Charles Woodson", "Greg Biekert", "Eric Allen", "Rod Woodson"], "Charles Woodson",
    "Charles Woodson dislodged the ball and Greg Biekert recovered, but the replay ruling overturned the fumble. New England tied the game and won 16-13 in overtime.",
    { authority: "New England Patriots", url: "https://www.patriots.com/news/patriots-earn-spot-in-afc-championship-game-120896", supportingDetail: "Patriots' Jan. 2002 game report identifies Woodson forcing the would-be fumble, reversal under the Tuck Rule, and overtime win." },
  ),
  "nfl:7:7": q8(
    "millionaire-nfl-future-vernon-davis-saints-2011-q8", "playoff-finish",
    "Who caught Alex Smith's winning touchdown with nine seconds left against New Orleans in the 2011 season's NFC playoffs?",
    ["Vernon Davis", "Michael Crabtree", "Delanie Walker", "Ted Ginn Jr."], "Vernon Davis",
    "Vernon Davis caught the winning touchdown pass from Alex Smith in San Francisco's January 2012 divisional-round victory.",
    { authority: "San Francisco 49ers", url: "https://www.49ers.com/news/49ers-top-100-games-history", supportingDetail: "Team history identifies Davis as the nine-seconds-remaining winning receiver." },
  ),
  "nfl:9:7": q8(
    "millionaire-nfl-future-noah-brown-hail-mary-q8", "late-game-heaves",
    "Which Washington receiver caught Jayden Daniels' tipped, game-winning Hail Mary against Chicago in October 2024?",
    ["Noah Brown", "Terry McLaurin", "Zach Ertz", "Luke McCaffrey"], "Noah Brown",
    "Noah Brown secured the deflected 52-yard touchdown pass as time expired on October 27, 2024, giving the Commanders an 18–15 victory over the Bears.",
    { authority: "NFL", url: "https://www.nfl.com/news/bears-cb-tyrique-stevenson-taunts-commanders-fans-during-final-play-hail-mary", supportingDetail: "NFL describes the tipped Daniels pass that Brown caught to defeat Chicago." },
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
    "millionaire-cfb-future-matthew-golden-peach-2025-q8", "playoff-overtime",
    "Which Texas receiver caught Quinn Ewers' fourth-and-13 touchdown pass in overtime against Arizona State in January 2025?",
    ["Matthew Golden", "Gunnar Helm", "Isaiah Bond", "DeAndre Moore Jr."], "Matthew Golden",
    "Matthew Golden caught a 28-yard fourth-and-13 touchdown from Quinn Ewers in the first overtime of the January 2025 Peach Bowl. Texas won 39–31 in double overtime.",
    { authority: "Texas Athletics", url: "https://texaslonghorns.com/news/2025/1/22/no-4-3-3-footballs-ewers-named-to-davey-o-brien-postseason-great-8", supportingDetail: "Texas confirms Golden's 28-yard first-OT conversion and double-overtime win." },
  ),
  "cfb:5:7": q8(
    "millionaire-cfb-future-rod-moore-2023-game-q8", "rivalry-clinchers",
    "Which Michigan defender intercepted Kyle McCord with 25 seconds left to seal the 2023 win over Ohio State?",
    ["Rod Moore", "Will Johnson", "Mike Sainristil", "Junior Colson"], "Rod Moore",
    "Michigan safety Rod Moore picked off Ohio State quarterback Kyle McCord with 25 seconds remaining on November 25, 2023, sealing a 30–24 win. Will Johnson also intercepted McCord earlier in the game.",
    { authority: "Michigan Athletics", url: "https://mgoblue.com/news/2023/11/25/football-corum-late-game-heroics-lift-michigan-to-another-victory-over-no-2-ohio-state", supportingDetail: "Michigan's official recap names Rod Moore's interception at 25 seconds remaining; the 30–24 win secured Big Ten East title." },
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
    "millionaire-ufc-future-prochazka-teixeira-275-q8", "fifth-round-comebacks",
    "Who submitted Glover Teixeira with only 28 seconds left at UFC 275 to claim the light heavyweight title?",
    ["Jiří Procházka", "Jan Błachowicz", "Jamahal Hill", "Magomed Ankalaev"], "Jiří Procházka",
    "Jiří Procházka applied a rear-naked choke at 4:32 of Round 5 against Glover Teixeira at UFC 275 in Singapore, winning the light heavyweight championship.",
    { authority: "UFC", url: "https://www.ufc.com/news/ufc-275-teixeira-vs-prochazka-fight-results-highlights-winner-interviews-singapore?language_content_entity=fr", supportingDetail: "UFC 275 records Procházka's submission at 4:32 of Round 5." },
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
    "millionaire-ufc-future-aspinall-pavlovich-295-q8", "interim-heavyweight-title",
    "Who knocked out Sergei Pavlovich in 69 seconds to win the interim UFC heavyweight title at UFC 295?",
    ["Tom Aspinall", "Ciryl Gane", "Stipe Miocic", "Curtis Blaydes"], "Tom Aspinall",
    "Tom Aspinall knocked out Sergei Pavlovich at 1:09 of the opening round of their UFC 295 bout in November 2023 to win the interim heavyweight championship.",
    { authority: "UFC", url: "https://www.ufc.com/event/ufc-295", supportingDetail: "UFC 295 results record Aspinall's first-round knockout over Pavlovich for the interim heavyweight title." },
  ),
};
