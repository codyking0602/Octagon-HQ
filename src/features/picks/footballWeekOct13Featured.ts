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
        { text: "CJ Carr's timing and Notre Dame's passing rhythm face a BYU defense intent on closing intermediate windows and creating third-and-long. Bear Bachmeier's ability to escape and run adds a second challenge for the Irish's defensive front." },
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
        { text: "The central question is whether Notre Dame can keep Carr on schedule while containing Bachmeier without opening up its coverage. BYU's quarterback movement and the Irish's passing tempo create two very different ways to sustain drives." },
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
        { text: "Jordan Love's quick reads and vertical passing threaten a Dallas defense trying to contain explosive plays. Dak Prescott counters with CeeDee Lamb and George Pickens, whose contrasting routes will test Green Bay's coverage and the time its pass rush gives them." },
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
        { text: "Love's timing against Dallas's coverage discipline is matched by Prescott's protection battle with Green Bay's front. The game will turn on which offense creates downfield space without repeatedly putting its quarterback under immediate pressure." },
      ],
    },
  },
];
