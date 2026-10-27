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
  // Replace Craig Morton trivia with the 2021-season AFC title overtime turnover.
  "nfl:3:7": q8(
    "millionaire-nfl-future-vonn-bell-bengals-afc-title-2022-q8", "afc-championship-turnovers",
    "Which Bengals safety intercepted Patrick Mahomes in overtime to set up Cincinnati's January 2022 AFC title victory?",
    ["Vonn Bell", "Jessie Bates III", "Mike Hilton", "Chidobe Awuzie"], "Vonn Bell",
    "Jessie Bates III tipped Mahomes' overtime pass, and Vonn Bell secured the interception. The turnover led to Evan McPherson's game-winning field goal as Cincinnati beat Kansas City 27–24.",
    { authority: "NFL", url: "https://amp.nfl.com/news/bengals-defense-never-batted-an-eye-chiefs-bell-mahomes-hubbard-bates", supportingDetail: "NFL confirms Bates deflected Mahomes' deep ball, Bell intercepted it in overtime, and Cincinnati won the AFC Championship 27–24." },
  ),
  // Replace 1983 draft trivia with a memorable Super Bowl LIV comeback.
  "nfl:4:7": q8(
    "millionaire-nfl-future-damien-williams-sb-liv-double-td-q8", "super-bowl-comebacks",
    "Which Chiefs running back scored BOTH a receiving touchdown and a rushing touchdown in the fourth quarter of Super Bowl LIV?",
    ["Damien Williams", "LeSean McCoy", "Darwin Thompson", "Anthony Sherman"], "Damien Williams",
    "Damien Williams caught Patrick Mahomes' go-ahead five-yard touchdown pass, then sealed Kansas City's 31–20 Super Bowl LIV win over San Francisco with a 38-yard rushing touchdown.",
    { authority: "Kansas City Chiefs", url: "https://www.chiefs.com/news/upon-further-review-10-quick-facts-following-the-chiefs-victory-in-super-bowl-li", supportingDetail: "Official Chiefs account confirms Williams caught a fourth-quarter TD pass and scored the late rushing TD in Super Bowl LIV." },
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
    "millionaire-cfb-future-bullard-2023-tcu-q8", "championship-defense",
    "Which Georgia defender intercepted two passes AND recovered a fumble against TCU in the January 2023 national championship?",
    ["Javon Bullard", "Kelee Ringo", "Malaki Starks", "Christopher Smith"], "Javon Bullard",
    "Javon Bullard accounted for all three TCU turnovers with two interceptions and a fumble recovery, earning defensive player of the game honors in Georgia's 65–7 title-game win.",
    { authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2023/1/26/ncg-recap-2023", supportingDetail: "CFP identifies Bullard as Defensive Player of the Game with two interceptions and a fumble recovery against TCU." },
  ),
  "ufc:0:7": q8(
    "millionaire-ufc-future-ngannou-rozenstruik-249-q8", "heavyweight-finishes",
    "Who knocked out Jairzinho Rozenstruik in only 20 seconds at UFC 249?",
    ["Francis Ngannou", "Derrick Lewis", "Curtis Blaydes", "Alexander Volkov"], "Francis Ngannou",
    "Francis Ngannou stopped Jairzinho Rozenstruik in only 20 seconds of Round 1 at UFC 249 in May 2020, halting the previously undefeated contender's rise.",
    { authority: "UFC official UFC 249 results", url: "https://www.ufc.com/news/ufc-249-results-ferguson-gaethje-cruz-cejudo", supportingDetail: "UFC records Ngannou's first-round knockout of Rozenstruik at 0:20." },
  ),
  "ufc:2:7": q8(
    "millionaire-ufc-future-poirier-saint-denis-299-q8", "lightweight-comebacks",
    "Who knocked out Benoit Saint Denis in Round 2 of their UFC 299 lightweight showdown?",
    ["Dustin Poirier", "Justin Gaethje", "Arman Tsarukyan", "Charles Oliveira"], "Dustin Poirier",
    "Dustin Poirier weathered Saint Denis' early pressure before scoring a knockout at 2:32 of Round 2 at UFC 299 in March 2024.",
    { authority: "UFC official UFC 299 results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-299-omalley-vs-vera-2", supportingDetail: "UFC records Poirier defeating Benoit Saint Denis by second-round KO at 2:32." },
  ),
  "ufc:3:7": q8(
    "millionaire-ufc-future-253-blachowicz-q8", "vacant-title-fight",
    "Who defeated Dominick Reyes at UFC 253 to win the vacant light heavyweight championship?",
    ["Jan Błachowicz", "Glover Teixeira", "Jiri Prochazka", "Alex Pereira"], "Jan Błachowicz",
    "Jan Błachowicz defeated Dominick Reyes at UFC 253 to win the vacant light heavyweight title.",
    { authority: "UFC title lineage", url: "https://www.ufc.com/news/ufc-light-heavyweight-title-lineage-jones-cormier-blachowicz-teixeira-prochazka", supportingDetail: "Official lineage records Blachowicz taking the vacant belt from Reyes at UFC 253." },
  ),
  "ufc:4:7": q8(
    "millionaire-ufc-future-machida-evans-98-q8", "light-heavyweight-history",
    "Who knocked out Rashad Evans in Round 2 at UFC 98 to win the light heavyweight championship?",
    ["Lyoto Machida", "Quinton Jackson", "Jon Jones", "Forrest Griffin"], "Lyoto Machida",
    "Lyoto Machida knocked out previously unbeaten champion Rashad Evans at 3:57 of Round 2 at UFC 98 in May 2009, beginning his reign as UFC light heavyweight champion.",
    { authority: "UFC light heavyweight title history", url: "https://www.ufc.com/news/10-best-light-heavyweight-title-fights", supportingDetail: "UFC confirms Machida's knockout of Evans at 3:57 of Round 2 to capture the title." },
  ),
  "ufc:5:7": q8(
    "millionaire-ufc-future-diaz-ferguson-279-q8", "late-submission-finishes",
    "Who submitted Tony Ferguson with a guillotine in Round 4 of the rearranged UFC 279 main event?",
    ["Nate Diaz", "Khamzat Chimaev", "Michael Chandler", "Justin Gaethje"], "Nate Diaz",
    "After a late main-event shuffle caused by Khamzat Chimaev missing weight, Nate Diaz submitted Tony Ferguson by guillotine at 2:52 of Round 4 in September 2022.",
    { authority: "UFC official UFC 279 results", url: "https://www.ufc.com/news/ufc-279-diaz-vs-ferguson-results-highlights-winner-interviews", supportingDetail: "UFC states Diaz defeated Ferguson with a Round 4 guillotine at 2:52, after the fight-week change of opponents." },
  ),

};
