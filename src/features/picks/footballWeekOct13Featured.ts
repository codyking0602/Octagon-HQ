import type { FootballMatchupBreakdown } from "./footballMatchupBreakdowns";

/** Owner-selected Oct 13 games, retaining genuine SeatGeek art as an external source link. */
export const FOOTBALL_OCTOBER_13_FEATURED: FootballMatchupBreakdown[] = [
  {
    id: "2026-oct13-nd-byu",
    title: "Notre Dame at BYU",
    venue: "LaVell Edwards Stadium · Provo, Utah",
    kickoffAt: "2026-10-17T23:30:00Z",
    headerAssetPath: "https://seatgeekimages.com/matchup/v3_4901d84e/5585/5570/600x450.jpg",
    teams: [
      { name: "Notre Dame", aliases: ["notre-dame", "notre-dame-fighting-irish", "fighting-irish"], rank: 2, record: "6–0", themeColor: "#0C2340", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png" },
      { name: "BYU", aliases: ["byu", "byu-cougars", "brigham-young", "brigham-young-cougars"], rank: 8, record: "5–0", themeColor: "#002E5D", logoUrl: "https://a.espncdn.com/i/teamlogos/ncaa/500/252.png" },
    ],
    compact: {
      rankingSource: "AP",
      setup: [
        { text: "No. 2 Notre Dame visits No. 8 BYU in a matchup of unbeaten teams at LaVell Edwards Stadium. The Irish are 6–0, the Cougars 5–0, and ESPN College GameDay returns to Provo for the first time since 2009. Saturday's 6:30 p.m. Central kickoff airs on ABC." },
      ],
      things: [
        { title: "Carr's timing vs. the BYU defense", body: [
          { text: "CJ Carr", emphasis: true },
          { text: " leads an Irish offense that scored 58 against Stanford. BYU can make this a real contest by denying easy throws and forcing Notre Dame to convert longer third downs. The Cougars' defense must play with discipline rather than sell out for splash plays." },
        ] },
        { title: "Bachmeier's dual threat", body: [
          { text: "Bear Bachmeier", emphasis: true },
          { text: " accounted for 329 passing yards and 109 rushing yards against Iowa State. His movement stresses the Irish defense, but Notre Dame cannot let scrambles turn broken-down plays into a string of drive-extending gains." },
        ] },
        { title: "A historic night in Provo", body: [
          { text: "BYU hasn't hosted College GameDay since 2009", emphasis: true },
          { text: ", and this is the Cougars' biggest home stage of the season. Notre Dame wants to start fast and keep the crowd out of it. BYU wants to use field position and an early defensive stop to make every possession feel consequential." },
        ] },
      ],
      bottomLine: [
        { text: "Notre Dame owns the stronger early-season résumé, but Bachmeier's mobility and a raucous Provo atmosphere make this anything but routine. Game graphic: " },
        { text: "SeatGeek", href: "https://seatgeek.com/" },
        { text: ". Matchup information: " },
        { text: "BYU Athletics", href: "https://byucougars.com/news/2026/10/12/byu-football-game-week-2026-notre-dame" },
        { text: "." },
      ],
    },
  },
  {
    id: "2026-oct13-cowboys-packers",
    title: "Cowboys at Packers",
    venue: "Lambeau Field · Green Bay, Wisconsin",
    kickoffAt: "2026-10-19T00:20:00Z",
    headerAssetPath: "https://seatgeekimages.com/matchup/v3_4901d84e/2066/2083/600x450.jpg",
    teams: [
      { name: "Dallas Cowboys", aliases: ["dallas", "dallas-cowboys", "cowboys"], logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png", themeColor: "#041E42" },
      { name: "Green Bay Packers", aliases: ["green-bay", "green-bay-packers", "packers"], logoUrl: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png", themeColor: "#203731" },
    ],
    compact: {
      leagueLabel: "NFL",
      setup: [
        { text: "Dallas heads to Lambeau Field for Sunday Night Football at 7:20 p.m. Central. Green Bay enters off a convincing win over Chicago, while the Cowboys are looking for a response after a Thursday loss to Tampa Bay. A familiar matchup now features a former Cowboys superstar on the Packers' injured list." },
      ],
      things: [
        { title: "Love's rhythm vs. Dallas' coverage", body: [
          { text: "Jordan Love", emphasis: true },
          { text: " threw for 367 yards and two touchdowns against Chicago. Dallas needs to interrupt his first reads and make Green Bay earn long drives without repeatedly surrendering early-down explosives." },
        ] },
        { title: "Prescott's targets vs. the Packers secondary", body: [
          { text: "Dak Prescott", emphasis: true },
          { text: " has CeeDee Lamb and George Pickens as two very different coverage problems. If the Cowboys cannot protect long enough to attack downfield, Green Bay can compress the field and make every possession tougher." },
        ] },
        { title: "The Parsons reunion, with a caveat", body: [
          { text: "Micah Parsons", emphasis: true },
          { text: " was traded from Dallas to Green Bay in 2025, but is not expected back from his ACL recovery for this matchup as of Monday's injury update. The game should be decided by the available fronts, not a presumed Parsons appearance." },
        ] },
      ],
      bottomLine: [
        { text: "Love's efficient passing game against Dallas' defensive discipline is the central matchup. Prescott needs enough protection to let the Cowboys' receiving talent change the contest. Game graphic: " },
        { text: "SeatGeek", href: "https://seatgeek.com/" },
        { text: "." },
      ],
    },
  },
];
