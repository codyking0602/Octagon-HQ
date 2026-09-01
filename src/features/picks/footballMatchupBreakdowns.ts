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
