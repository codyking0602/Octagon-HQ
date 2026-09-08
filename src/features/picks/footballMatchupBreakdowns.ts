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
      { name: "Texas", aliases: ["texas", "texas-longhorns"] },
      { name: "Ohio State", aliases: ["ohio-state", "ohio-state-buckeyes"] },
    ],
    setup: [
      "For the third straight season, Texas and Ohio State meet with the national-title picture already in the background. Ohio State has won the last two, including last season’s 14–7 opener in Columbus, and now the rematch comes to Austin with both teams bringing much more experienced quarterbacks into the fight.",
      "The Week 1 tune-ups could not have looked much cleaner: Ohio State beat Ball State 56–3 behind 320 yards and three passing touchdowns from Julian Sayin, while Texas beat Texas State 59–7 as Arch Manning threw for 305 yards and four scores. The separator here is less about raw talent than which team can keep its quarterback on schedule when the opposing front finally creates real stress.",
    ],
    keyMatchups: [
      {
        title: "Jeremiah Smith vs. Texas’ coverage plan",
        body: "Smith needed only one half against Ball State to post eight catches, 151 yards and two touchdowns. Texas has enough talent to avoid simply living in double coverage, but every snap spent tilting a safety toward Smith changes the spacing for Sayin everywhere else. The Longhorns have to make Ohio State earn explosives rather than letting Smith dictate the shell before the snap.",
        edge: "Ohio State",
      },
      {
        title: "Texas’ protection vs. Ohio State’s front",
        body: "Texas rotated Dylan Sikorski and Laurence Seymore at left guard in the opener, and neither allowed a pressure, but Ohio State is a completely different test. Kenyatta Jackson Jr., Eddrick Houston and the Buckeyes’ rotating front can attack protections from multiple alignments. If Manning is consistently forced off his launch point, Texas loses the rhythm that made the opener look easy.",
        edge: "Even",
      },
      {
        title: "Ohio State’s run game vs. Texas’ front seven",
        body: "The Buckeyes finished with big rushing numbers against Ball State, but much of the damage came after a quiet first half and on two long second-half runs. Texas can counter with Colin Simmons, Rasheem Biles and a front that created negative plays and three takeaways in Week 1. Ohio State does not need to dominate the ground game, but it cannot become a one-dimensional Sayin-to-Smith offense.",
        edge: "Texas",
      },
    ],
    pathsToWin: [
      {
        team: "Texas",
        body: "Protect Manning well enough to keep the full Sarkisian menu available, stay balanced with Hollywood Smothers and make Ohio State defend Ryan Wingo and Cam Coleman across the field instead of squeezing every snap toward the box. Defensively, Texas has to affect Sayin with four and force the Buckeyes to finish long drives without giving Smith free access to explosives.",
      },
      {
        team: "Ohio State",
        body: "Make Texas prove its protection for four quarters. If the Buckeyes can create second-and-long and third-and-long without excessive blitzing, the secondary can play from leverage instead of reacting to Sarkisian’s motion. Offensively, feed Smith without forcing the ball, get Bo Jackson involved early and make Texas pay whenever it rotates extra help outside.",
      },
    ],
    playersToWatch: [
      {
        team: "Texas",
        players: [
          { name: "Arch Manning", position: "QB", body: "He gets another shot at the defense that held him to 170 passing yards in last season’s opener, this time after starting 2026 with 305 yards and four touchdowns." },
          { name: "Ryan Wingo", position: "WR", body: "Seven catches for 121 yards and a touchdown in Week 1. His ability to win outside keeps Ohio State from compressing the field around Manning." },
          { name: "Colin Simmons", position: "EDGE", body: "Texas’ premier edge threat is central to the plan against Sayin. The Longhorns need him creating pressure without forcing the secondary to live behind heavy blitz rates." },
        ],
      },
      {
        team: "Ohio State",
        players: [
          { name: "Julian Sayin", position: "QB", body: "He was sharp in the opener and is far more experienced than the quarterback who managed last year’s 14–7 win over Texas. Austin is the first real stress test of that growth." },
          { name: "Jeremiah Smith", position: "WR", body: "The most dangerous individual matchup on the field. Texas has contained his raw production in the previous meetings, but one missed leverage call can change the game." },
          { name: "Kenyatta Jackson Jr.", position: "DE", body: "Ohio State’s veteran edge defender is the player most capable of turning Texas’ protection questions into lost downs and speeding Manning up." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "TEXAS OFFENSE vs. OHIO STATE DEFENSE",
        edge: "EVEN",
        body: "Manning has more answers and a deeper receiving group than he did a year ago, but Ohio State still has the front and coverage talent to force Texas to execute through long possessions rather than living on easy explosives.",
      },
      {
        title: "OHIO STATE OFFENSE vs. TEXAS DEFENSE",
        edge: "OHIO STATE — SLIGHT",
        body: "Texas has enough speed to challenge the Buckeyes everywhere, but Sayin’s efficiency plus Smith’s ability to distort coverage gives Ohio State the one matchup that can force the defense to compromise before the ball is snapped.",
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
      "The NFC East opens under the Sunday-night lights with John Harbaugh making his Giants debut and Jaxson Dart beginning his second season as New York’s quarterback. The teams split last year’s series, and the Giants closed 2025 by beating Dallas 34–17 at MetLife with Dart accounting for 262 total yards and two passing touchdowns.",
      "Dallas enters with the more established passing-game core in Dak Prescott, CeeDee Lamb and George Pickens, but the matchup changed when All-Pro left guard Tyler Smith was ruled out for the opening stretch after thumb surgery. That puts the Cowboys’ biggest uncertainty directly across from the Giants’ biggest strength: a pressure group built around Brian Burns, Abdul Carter and Kayvon Thibodeaux.",
    ],
    keyMatchups: [
      {
        title: "Giants’ pass rush vs. Dallas’ protection",
        body: "This is the matchup New York has to own. T.J. Bass steps in for Tyler Smith while Burns, Carter and Thibodeaux can attack from enough alignments to make protection communication matter as much as individual blocking. Dallas can help with tempo, quick game and chips, but if New York gets home with four, the rest of the defensive plan becomes much easier.",
        edge: "Giants",
      },
      {
        title: "CeeDee Lamb + George Pickens vs. the Giants’ secondary",
        body: "New York upgraded the back end with Greg Newsome II and still has Deonte Banks, Paulson Adebo, Dru Phillips and a veteran safety group. That is real depth, but Dallas can force uncomfortable choices by moving Lamb inside and outside while Pickens stresses the boundary. The Giants cannot let their pass rush become an excuse for isolated coverage losses downfield.",
        edge: "Dallas — slight",
      },
      {
        title: "Jaxson Dart vs. Christian Parker’s new defense",
        body: "Dart’s movement is the variable Dallas cannot treat like a normal dropback offense. Parker’s new defense is more multiple, and the Cowboys rebuilt the middle around Quinnen Williams and Kenny Clark while adding Von Miller outside. The goal is to compress the pocket without opening escape lanes that turn third-and-long into first downs.",
        edge: "Dallas — slight",
      },
    ],
    pathsToWin: [
      {
        team: "Dallas Cowboys",
        body: "Protect Prescott with structure rather than asking the reshuffled line to survive endless true pass sets. Get Lamb and Pickens touches before the rush can arrive, make the Giants tackle in space and force Dart to play from obvious passing downs. Defensively, Dallas needs its veteran front to keep Dart contained instead of chasing sacks past the quarterback.",
      },
      {
        team: "New York Giants",
        body: "Make the Tyler Smith absence the center of the game. If the Giants can pressure Prescott with four, they can keep extra bodies in coverage and shrink the explosive windows for Lamb and Pickens. Offensively, Harbaugh needs movement, play action and Dart’s legs to keep Dallas from teeing off, with Malik Nabers becoming the field-tilter if his return-to-play workload allows it.",
      },
    ],
    playersToWatch: [
      {
        team: "Dallas Cowboys",
        players: [
          { name: "Dak Prescott", position: "QB", body: "The Giants’ front is designed to make him speed up. Dallas needs Prescott controlling protections and getting the ball to his matchup winners before pressure changes the down." },
          { name: "CeeDee Lamb", position: "WR", body: "The cleanest Dallas advantage is still moving Lamb around until New York reveals how it plans to match him. His alignment can dictate the coverage before Prescott ever takes the snap." },
          { name: "Quinnen Williams", position: "DT", body: "A centerpiece of Dallas’ rebuilt defense. His ability to collapse the pocket from the middle is the best way to disrupt Dart without creating easy scramble lanes off the edge." },
        ],
      },
      {
        team: "New York Giants",
        players: [
          { name: "Jaxson Dart", position: "QB", body: "He finished last season by beating Dallas at MetLife. Now the challenge is doing it against a substantially reworked defense while operating Harbaugh’s offense in a real regular-season game for the first time." },
          { name: "Malik Nabers", position: "WR", body: "His workload has been managed during the return from his knee injury, but if he is available at full speed he is the Giants’ best answer for creating explosives without asking Dart to hold the ball." },
          { name: "Abdul Carter", position: "OLB", body: "Dallas cannot devote every protection answer to Brian Burns. Carter’s burst gives New York another way to attack the reshuffled Cowboys line and force Prescott off his preferred timing." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "DALLAS OFFENSE vs. GIANTS DEFENSE",
        edge: "DALLAS — SLIGHT",
        body: "New York’s pass rush is good enough to wreck the matchup, especially without Tyler Smith, but Prescott throwing to Lamb and Pickens gives Dallas the more proven answers if the protection can survive long enough to use them.",
      },
      {
        title: "GIANTS OFFENSE vs. DALLAS DEFENSE",
        edge: "DALLAS",
        body: "Dart’s legs and Nabers’ explosiveness can stress the new scheme, but Dallas has the more proven front-line talent with Williams, Clark and Miller. The Giants need to create easy early-down offense before that group can dictate the game.",
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
