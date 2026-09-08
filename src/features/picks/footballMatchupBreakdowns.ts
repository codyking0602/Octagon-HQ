import type { PickBout, PickEvent, PickWatchMoment } from "./picksModel";

export interface FootballMatchupTeam {
  name: string;
  aliases: string[];
}

export interface FootballMatchupKeyBattle {
  title: string;
  body: string;
  edge: string;
}

export interface FootballMatchupPathToWin {
  team: string;
  body: string;
}

export interface FootballMatchupPlayer {
  name: string;
  position: string;
  body: string;
}

export interface FootballMatchupPlayers {
  team: string;
  players: FootballMatchupPlayer[];
}

export interface FootballMatchupUnitEdge {
  title: string;
  edge: string;
  body: string;
}

export interface FootballMatchupBreakdown {
  id: string;
  title: string;
  venue: string;
  teams: [FootballMatchupTeam, FootballMatchupTeam];
  setup: string[];
  keyMatchups: FootballMatchupKeyBattle[];
  pathsToWin: [FootballMatchupPathToWin, FootballMatchupPathToWin];
  playersToWatch: [FootballMatchupPlayers, FootballMatchupPlayers];
  unitEdges: [FootballMatchupUnitEdge, FootballMatchupUnitEdge];
  videos?: PickWatchMoment[];
}

export const FOOTBALL_MATCHUP_BREAKDOWNS: FootballMatchupBreakdown[] = [
  {
    id: "2026-lsu-clemson",
    title: "LSU vs. Clemson",
    venue: "Tiger Stadium · Baton Rouge",
    teams: [
      { name: "LSU", aliases: ["lsu", "lsu-tigers", "louisiana-state", "louisiana-state-tigers"] },
      { name: "Clemson", aliases: ["clemson", "clemson-tigers"] },
    ],
    setup: [
      "A year after LSU went into Clemson and won 17–10, the rematch shifts to Baton Rouge — but both offenses look dramatically different.",
      "Lane Kiffin makes his LSU debut with Arizona State transfer Sam Leavitt, while Clemson turns to Christopher Vizzina and reunites Dabo Swinney with offensive coordinator Chad Morris. LSU owns the higher ceiling on paper; Clemson’s best route is making the game uncomfortable before the rebuilt LSU offense settles in.",
    ],
    keyMatchups: [
      {
        title: "Clemson’s OL vs. LSU’s pressure",
        body: "This is the pressure point of the game. Clemson enters with major experience questions up front, while LSU returns a defense built to speed quarterbacks up. If Blake Baker can consistently move Vizzina off his first read, Clemson will spend the night fighting uphill on obvious passing downs.",
        edge: "LSU",
      },
      {
        title: "Sam Leavitt + Lane Kiffin vs. Clemson’s pass rush",
        body: "LSU’s offense is new, but the fit makes sense. Kiffin can lean on RPOs, quick throws and abbreviated drops while Leavitt’s mobility gives the Tigers answers when structure breaks down. Clemson has to create pressure without selling out, or LSU will dictate the terms of the game.",
        edge: "LSU",
      },
      {
        title: "Clemson’s receivers vs. LSU’s corners",
        body: "Bryant Wesco Jr. and T.J. Moore give Clemson the explosive element it needs. LSU can counter with a talented corner group led by DJ Pickett and PJ Woodland. Clemson probably needs multiple chunk plays here rather than asking Vizzina to string together long drives against LSU’s pressure.",
        edge: "Even",
      },
    ],
    pathsToWin: [
      {
        team: "LSU",
        body: "Keep Leavitt out of difficult third downs, let Kiffin manufacture easy completions and make Clemson prove it can sustain drives against LSU’s front. LSU has the deeper margin for error; the biggest mistake would be gifting Clemson short fields and momentum.",
      },
      {
        team: "Clemson",
        body: "Turn it into a four-quarter grind. Clemson needs the defense to disrupt LSU’s timing early, steal a possession and hit Wesco or Moore for explosives when LSU pressures. Vizzina does not need to dominate — he needs protection long enough to punish aggressive coverage a few times.",
      },
    ],
    playersToWatch: [
      {
        team: "LSU",
        players: [
          { name: "Sam Leavitt", position: "QB", body: "The first look at Kiffin’s new offense. His mobility and quick decision-making are a natural fit for the system." },
          { name: "Trey’Dez Green", position: "TE", body: "A 6'7\" matchup problem who gives LSU an easy answer in the red zone and against isolated coverage." },
          { name: "Whit Weeks", position: "LB", body: "The tone-setter in the middle of a defense that should be aggressive against Clemson’s inexperienced protection." },
        ],
      },
      {
        team: "Clemson",
        players: [
          { name: "Christopher Vizzina", position: "QB", body: "The talent is real; the question is whether he can stay composed when LSU forces him off schedule in Baton Rouge." },
          { name: "Bryant Wesco Jr.", position: "WR", body: "Clemson’s best field-stretcher and the player most capable of flipping the game with one snap." },
          { name: "T.J. Moore", position: "WR", body: "Another vertical threat who already showed chemistry with Vizzina and can punish LSU if the Tigers overcommit to pressure." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "LSU OFFENSE vs. CLEMSON DEFENSE",
        edge: "LSU",
        body: "There are real unknowns with a new quarterback, staff and rebuilt line, but Kiffin’s quick-game structure and Leavitt’s fit give LSU more answers than Clemson’s front currently presents.",
      },
      {
        title: "CLEMSON OFFENSE vs. LSU DEFENSE",
        edge: "LSU — CLEAR",
        body: "A first-year starting quarterback and inexperienced offensive line facing a defense designed to create pressure is the larger matchup advantage in this game.",
      },
    ],
  },
  {
    id: "2026-louisville-ole-miss",
    title: "Louisville vs. Ole Miss",
    venue: "Nissan Stadium · Nashville",
    teams: [
      { name: "Louisville", aliases: ["louisville", "louisville-cardinals"] },
      { name: "Ole Miss", aliases: ["ole-miss", "ole-miss-rebels", "mississippi", "mississippi-rebels"] },
    ],
    setup: [
      "Ole Miss opens Pete Golding’s first full season as head coach after a 13-win CFP semifinal run, and the offense still has proven stars to build around in Trinidad Chambliss and Kewan Lacy.",
      "Louisville is coming off a 9–4 season with a defense that allowed only 303.1 yards per game, but its biggest variable is at quarterback: Ohio State transfer Lincoln Kienholz takes over Jeff Brohm’s offense with very little meaningful college passing experience. At a neutral site in Nashville, that contrast makes this a much more interesting opener than the rankings alone suggest.",
    ],
    keyMatchups: [
      {
        title: "Isaac Brown vs. the Ole Miss front",
        body: "Louisville’s cleanest path starts with Brown. He ran for 884 yards in only nine games last season and averaged 8.8 yards per carry. If he is creating explosives on early downs, Brohm can keep Kienholz out of obvious passing situations and shrink the game. Ole Miss has rebuilt pieces up front, but it also has enough depth to make Louisville earn those yards repeatedly.",
        edge: "Even",
      },
      {
        title: "Lincoln Kienholz vs. Ole Miss pressure",
        body: "Kienholz arrives from Ohio State after throwing only 14 passes in 2025. Brohm is excellent at building quarterback-friendly answers, but this is a difficult first assignment against an athletic SEC defense. Ole Miss wants to stop Brown early, create third-and-long and make Kienholz prove he can beat pressure from the pocket.",
        edge: "Ole Miss",
      },
      {
        title: "Chambliss + Lacy vs. Louisville’s defense",
        body: "This is strength on strength. Louisville allowed just 21.2 points and 4.7 yards per play last season, while Ole Miss returns a quarterback who threw for 3,937 yards with only three interceptions and a back who ran for 1,567 yards and 24 touchdowns. Clev Lubin and the Cardinals’ front have to disrupt timing before those two can put Ole Miss on schedule.",
        edge: "Ole Miss",
      },
    ],
    pathsToWin: [
      {
        team: "Louisville",
        body: "Make Isaac Brown the center of the game, stay ahead of the chains and let Brohm protect Kienholz with movement, play action and defined reads. Defensively, Louisville needs Clev Lubin and the front to create negative plays without opening easy explosives for Chambliss.",
      },
      {
        team: "Ole Miss",
        body: "Force Louisville into a quarterback game. If Ole Miss contains Brown on first and second down, the matchup tilts toward its defense. Offensively, lean on the proven Chambliss-Lacy combination, stay patient against Louisville’s disciplined defense and make the Cardinals defend the full width of the field.",
      },
    ],
    playersToWatch: [
      {
        team: "Louisville",
        players: [
          { name: "Lincoln Kienholz", position: "QB", body: "The new starter has the tools, but this is his first chance to show he can run Brohm’s offense against top-level pressure for four quarters." },
          { name: "Isaac Brown", position: "RB", body: "The engine of Louisville’s upset path. His explosiveness can change the math of the game before Ole Miss gets Kienholz into passing situations." },
          { name: "Clev Lubin", position: "DE", body: "The All-ACC edge defender produced 8.5 sacks and three forced fumbles last season. Louisville needs him affecting Chambliss without constant blitz help." },
        ],
      },
      {
        team: "Ole Miss",
        players: [
          { name: "Trinidad Chambliss", position: "QB", body: "He returns after throwing for 3,937 yards, 22 touchdowns and only three interceptions during Ole Miss’ breakthrough 2025 season." },
          { name: "Kewan Lacy", position: "RB", body: "One of the most productive backs in the country last year: 1,567 rushing yards and 24 touchdowns. Louisville cannot let him control early downs." },
          { name: "Suntarine Perkins", position: "LB", body: "A centerpiece of an Ole Miss defense that will be built around speed, pressure and forcing a new Louisville quarterback to make fast decisions." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "OLE MISS OFFENSE vs. LOUISVILLE DEFENSE",
        edge: "OLE MISS",
        body: "Louisville’s defense is good enough to make this difficult, but Chambliss and Lacy give Ole Miss proven high-end production at the two positions most capable of controlling the game.",
      },
      {
        title: "LOUISVILLE OFFENSE vs. OLE MISS DEFENSE",
        edge: "OLE MISS",
        body: "Brown gives Louisville a real weapon, but the quarterback uncertainty matters. Until Kienholz proves he can punish Ole Miss for loading up against the run, the Rebels own the more trustworthy side of this matchup.",
      },
    ],
  },
  {
    id: "2026-texas-ohio-state",
    title: "Texas vs. Ohio State",
    venue: "DKR-Texas Memorial Stadium · Austin",
    teams: [
      { name: "Texas", aliases: ["texas", "texas-longhorns", "longhorns"] },
      { name: "Ohio State", aliases: ["ohio-state", "ohio-state-buckeyes", "buckeyes"] },
    ],
    setup: [
      "The best game on the college board gets a third straight chapter. No. 1 Ohio State has won the last two meetings — 28–14 in the 2024 CFP semifinal and 14–7 in Columbus last season — but this one moves to Austin, where No. 5 Texas has won 21 of its last 22 games at DKR.",
      "Both teams opened 2026 by overwhelming overmatched opponents. Texas beat Texas State 59–7 behind 305 yards and four touchdowns from Arch Manning, while Ohio State rolled Ball State 56–3 with 671 total yards and only 165 allowed. There is very little hiding here: two veteran quarterbacks, elite perimeter talent and a game likely to swing on which offense handles the first real pressure of its season.",
    ],
    keyMatchups: [
      {
        title: "Julian Sayin + Jeremiah Smith vs. Texas’ secondary",
        body: "Ohio State’s most dangerous answer is also the most obvious one. Sayin opened the season with 320 passing yards and Smith immediately produced eight catches for 151 yards and two scores. Texas cannot treat Smith like a normal outside receiver; the Longhorns have to disrupt timing, change the picture after the snap and make Ohio State win repeatedly somewhere else.",
        edge: "OHIO STATE",
      },
      {
        title: "Arch Manning vs. Ohio State’s coverage discipline",
        body: "Manning looked comfortable in the opener, spreading the ball to eight receivers and creating explosives without having to carry the run game himself. Ohio State is the first defense that can make every window feel smaller. The key for Texas is patience: take the easy completion, use Manning’s legs when lanes open and avoid turning a close game with one forced throw.",
        edge: "EVEN",
      },
      {
        title: "Ryan Wingo + Cam Coleman vs. Ohio State’s corners",
        body: "Texas finally has the kind of two-receiver problem that can force Ohio State out of comfortable answers. Wingo went for 121 yards in the opener and Coleman scored twice in his Texas debut. If both consistently win isolated matchups, Ohio State has to devote extra help outside and Texas gets better numbers for the run game and middle-of-field throws.",
        edge: "TEXAS — SLIGHT",
      },
    ],
    pathsToWin: [
      {
        team: "Texas",
        body: "Make Ohio State defend every blade of grass without asking Manning to be a superhero. Texas needs efficient early-down throws, enough run-game success to keep play action alive and at least a few explosive wins from Wingo or Coleman. Defensively, limit Smith’s free releases and force Ohio State to string together long drives in a loud road environment.",
      },
      {
        team: "Ohio State",
        body: "Stay patient and make Texas prove it can cover the full Buckeye offense for four quarters. Sayin does not need to chase explosives if Texas sells out to erase Smith; take the underneath answers, let Bo Jackson and the backs punish lighter boxes and force Manning to answer drives against a defense that made this matchup miserable a year ago.",
      },
    ],
    playersToWatch: [
      {
        team: "Texas",
        players: [
          { name: "Arch Manning", position: "QB", body: "He gets the rematch at home after Texas managed only seven points in Columbus last season. His decision-making against Ohio State’s disguised coverages is the center of the game." },
          { name: "Ryan Wingo", position: "WR", body: "Seven catches for 121 yards and a touchdown in the opener. His ability to win outside can keep Ohio State from squeezing the middle of the field." },
          { name: "Rasheem Biles", position: "LB", body: "Texas forced three turnovers in Week 1, and Biles was involved in both an interception and a forced fumble. The Longhorns need that kind of disruptive second-level play against Ohio State." },
        ],
      },
      {
        team: "Ohio State",
        players: [
          { name: "Julian Sayin", position: "QB", body: "He was efficient in his first career start against Texas last year and enters the rematch after throwing for 320 yards in the opener. Austin is his first true road pressure test of 2026." },
          { name: "Jeremiah Smith", position: "WR", body: "The matchup stressor Texas has to solve first. He opened 2026 with 151 yards and two touchdowns and can change the game even when the defense is tilted toward him." },
          { name: "Bo Jackson", position: "RB", body: "His 65-yard touchdown highlighted an 83-yard opener. If Texas spends extra resources on Smith, Jackson has the burst to punish the lighter box immediately." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "TEXAS OFFENSE vs. OHIO STATE DEFENSE",
        edge: "TEXAS — SLIGHT",
        body: "Texas has more proven perimeter answers than it had in last season’s seven-point showing, and Manning now gets Ohio State in Austin. The margin is tiny because the Buckeyes are built to make quarterbacks earn every explosive play.",
      },
      {
        title: "OHIO STATE OFFENSE vs. TEXAS DEFENSE",
        edge: "OHIO STATE — SLIGHT",
        body: "Smith is the best individual matchup piece on the field, Sayin is already a proven high-efficiency starter and Ohio State can run the ball if Texas overcommits outside. Texas has enough speed to keep it close, but the Buckeyes have the cleaner set of answers.",
      },
    ],
  },
  {
    id: "2026-cowboys-giants",
    title: "Cowboys vs. Giants",
    venue: "MetLife Stadium · East Rutherford",
    teams: [
      { name: "Dallas Cowboys", aliases: ["dallas", "dallas-cowboys", "cowboys"] },
      { name: "New York Giants", aliases: ["new-york-giants", "ny-giants", "giants"] },
    ],
    setup: [
      "Dallas opens on Sunday night against a Giants team beginning the John Harbaugh era, and the matchup is much less familiar than the rivalry name suggests. The Cowboys return a 4,552-yard passer in Dak Prescott, a 1,201-yard rusher in Javonte Williams and two 1,000-yard receivers in George Pickens and CeeDee Lamb, while New York hands the offense fully to second-year quarterback Jaxson Dart.",
      "The tension is up front. Dallas rebuilt its defense around a heavier front featuring Quinnen Williams, Kenny Clark, Rashan Gary and Von Miller, but it will open without All-Pro left guard Tyler Smith, who is expected to miss at least four games after thumb surgery. That gives a Giants rush led by Brian Burns and Abdul Carter an immediate way to wreck the Cowboys’ biggest offensive advantage before Prescott can get to Lamb and Pickens.",
    ],
    keyMatchups: [
      {
        title: "Brian Burns + Abdul Carter vs. Dallas’ protection",
        body: "This became the defining matchup the moment Tyler Smith was ruled out. Burns finished 2025 with 16.5 sacks, Carter is entering Year 2 after flashing late as a rookie, and Dallas now asks T.J. Bass to step in next to Tyler Guyton. If New York can win with four rushers, it can keep extra bodies in coverage against the Cowboys’ receiver duo.",
        edge: "GIANTS",
      },
      {
        title: "CeeDee Lamb + George Pickens vs. the Giants’ corners",
        body: "Dallas still owns the cleanest offensive advantage in the game. Pickens produced 1,429 receiving yards last season and Lamb added 1,077, giving Prescott two receivers who can win at every level. Paulson Adebo, Greg Newsome II and Deonte Banks have enough talent to compete, but asking that group to survive isolated all night is a dangerous plan.",
        edge: "DALLAS",
      },
      {
        title: "Jaxson Dart’s movement vs. Dallas’ new front",
        body: "Dart’s legs are not a side note: he rushed for 487 yards and nine touchdowns as a rookie. Dallas wants Williams, Clark, Gary and Miller collapsing the pocket, but an undisciplined rush can turn into free first downs. The Cowboys need to compress the pocket without giving Dart escape lanes, especially on third down.",
        edge: "EVEN",
      },
    ],
    pathsToWin: [
      {
        team: "Dallas",
        body: "Protect Prescott well enough to let the skill talent decide the game. Dallas does not need a perfect offensive-line performance; it needs to avoid obvious passing downs, use Williams to keep the rush honest and force the Giants to choose between extra pressure and leaving Lamb or Pickens isolated. Defensively, make Dart win from the pocket instead of letting his legs create second-chance football.",
      },
      {
        team: "New York Giants",
        body: "Make the missing Dallas guard matter immediately. Harbaugh’s best path is a physical, low-chaos game where Burns and Carter create pressure without constant blitzing, the offense leans on its deep backfield and Dart gets defined throws to Malik Nabers and the tight ends. New York cannot let Dallas turn this into a clean-pocket passing contest.",
      },
    ],
    playersToWatch: [
      {
        team: "Dallas",
        players: [
          { name: "Dak Prescott", position: "QB", body: "He threw for 4,552 yards and 30 touchdowns last season. With Tyler Smith out, his ability to diagnose pressure and get the ball out on time matters even more than usual." },
          { name: "CeeDee Lamb", position: "WR", body: "The Giants have to decide how much attention they can devote to Lamb when Pickens is on the opposite side. If Lamb consistently gets single coverage, Dallas should keep going back to it." },
          { name: "Quinnen Williams", position: "DT", body: "The centerpiece of Dallas’ rebuilt interior front. His ability to create pressure without blitz help can keep a spy or extra defender available for Dart’s legs." },
        ],
      },
      {
        team: "New York Giants",
        players: [
          { name: "Jaxson Dart", position: "QB", body: "He accounted for 24 touchdowns as a rookie — 15 passing and nine rushing — and now opens Year 2 in Harbaugh’s offense. Dallas will try to make him stay on schedule from the pocket." },
          { name: "Malik Nabers", position: "WR", body: "New York’s most explosive receiver gives Dart a true coverage dictator. The Giants need him creating easy completions and at least one chunk play against a Dallas secondary that wants the new front to speed Dart up." },
          { name: "Brian Burns", position: "OLB", body: "His 16.5 sacks last season make him the Giant most capable of changing the entire protection plan. With Dallas already reshuffling at guard, Burns has to make Prescott uncomfortable early." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "DALLAS OFFENSE vs. GIANTS DEFENSE",
        edge: "DALLAS — SLIGHT",
        body: "Prescott, Lamb, Pickens and Williams give Dallas too many proven answers to hand New York the unit edge, but Tyler Smith’s absence is significant. The Giants’ pass rush can narrow what otherwise looks like a clear Cowboys advantage.",
      },
      {
        title: "GIANTS OFFENSE vs. DALLAS DEFENSE",
        edge: "DALLAS",
        body: "Dart’s mobility and Nabers’ explosiveness are real problems, but Dallas can attack them with a much deeper front than it had last season. If the Cowboys keep Dart contained and create pressure without over-blitzing, New York has to sustain long drives against a defense designed to win up front.",
      },
    ],
  },
];

function normalizeTeamToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function boutIncludesTeam(bout: PickBout, team: FootballMatchupTeam) {
  const boutTokens = [
    bout.redFighterSlug,
    bout.redFighterName,
    bout.blueFighterSlug,
    bout.blueFighterName,
    bout.homeTeamSlug ?? "",
    bout.awayTeamSlug ?? "",
  ].map(normalizeTeamToken);

  return team.aliases.some((alias) => boutTokens.includes(normalizeTeamToken(alias)));
}

export function footballMatchupBreakdownsForEvent(event: PickEvent | null) {
  if (event?.sport !== "football") return [];

  return FOOTBALL_MATCHUP_BREAKDOWNS.filter((breakdown) => event.bouts.some((bout) =>
    breakdown.teams.every((team) => boutIncludesTeam(bout, team)),
  ));
}
