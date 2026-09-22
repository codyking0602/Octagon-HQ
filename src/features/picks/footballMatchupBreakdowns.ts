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

  {
    id: "2026-lsu-ole-miss",
    title: "LSU vs. Ole Miss",
    venue: "Vaught-Hemingway Stadium · Oxford",
    teams: [
      { name: "LSU", aliases: ["lsu", "lsu-tigers", "louisiana-state", "louisiana-state-tigers"] },
      { name: "Ole Miss", aliases: ["ole-miss", "ole-miss-rebels", "mississippi", "mississippi-rebels"] },
    ],
    setup: [
      "Lane Kiffin’s return to Oxford is the story before the ball is even kicked. He spent six seasons turning Ole Miss into a national contender, left for LSU, and now comes back to Vaught-Hemingway wearing purple and gold. There won’t be much warmth waiting for him. This is Ole Miss’ first chance to take a shot at its former coach, and Kiffin gets to walk back into the stadium he used to own with a top-10 LSU team on the opposite sideline.",
      "The matchup has plenty of substance beyond the emotion. LSU is averaging 48.0 points and 586.0 yards per game, while its defense has already produced 10 sacks and 17 tackles for loss. Ole Miss has explosive-play threats in Trinidad Chambliss and Deuce Alexander and should have one of the most charged home crowds of the season behind it. The question is whether the Rebels can turn that energy into early pressure, or whether LSU can absorb the opening punch and make the game about execution instead of emotion.",
    ],
    keyMatchups: [
      {
        title: "Sam Leavitt's ball security vs. Ole Miss' back end",
        body: "Leavitt has been the engine of LSU's offense, but Louisiana Tech also intercepted him three times in the first half before LSU pulled away. Oxford is a much harsher place to survive that kind of turnover stretch. Ole Miss needs to disguise enough coverage to make Leavitt hold the ball and give its rush time to affect the pocket.",
        edge: "Even",
      },
      {
        title: "Trinidad Chambliss + Deuce Alexander vs. LSU's secondary",
        body: "Chambliss opened the season with 336 passing yards and three touchdowns against Louisville, with Alexander supplying 159 yards and two long scores. LSU's answer is pressure: the Tigers have 10 sacks through two games and have consistently forced quarterbacks to speed up. Ole Miss needs explosives without turning every possession into a long protection test.",
        edge: "Even",
      },
      {
        title: "LSU's run game + Trey'Dez Green vs. Ole Miss' front",
        body: "LSU already has 456 rushing yards and eight rushing touchdowns, which gives Lane Kiffin a way to keep Leavitt out of obvious passing downs. Green adds the middle-of-the-field matchup that punishes linebackers for stepping downhill. Ole Miss has to win early downs without creating easy play-action windows behind them.",
        edge: "LSU",
      },
    ],
    pathsToWin: [
      {
        team: "LSU",
        body: "Keep Leavitt on schedule, lean on the run game and avoid the turnover sequence that made the Louisiana Tech game uncomfortable. Defensively, compress Chambliss before Alexander can uncover downfield and make Ole Miss sustain drives instead of living on explosives.",
      },
      {
        team: "Ole Miss",
        body: "Win the turnover margin and make LSU play from third-and-long. Offensively, use Chambliss' movement and Deuce Alexander's vertical ability to punish LSU before the pass rush arrives, while Kewan Lacy gives the Rebels enough balance to keep the Tigers from teeing off.",
      },
    ],
    playersToWatch: [
      {
        team: "LSU",
        players: [
          { name: "Sam Leavitt", position: "QB", body: "He has 574 passing yards and nine total touchdowns through two games, but his response to the three-interception first half against Louisiana Tech is the part Ole Miss will test." },
          { name: "Trey'Dez Green", position: "TE", body: "LSU's leading receiver through two games at 162 yards. His size and middle-of-the-field value give Leavitt a high-percentage answer when Ole Miss brings pressure." },
          { name: "TJ Dottery", position: "LB", body: "LSU's early tackles leader sits at the center of a defense that has allowed only 221.5 yards per game and has been consistently disruptive behind the line." },
        ],
      },
      {
        team: "Ole Miss",
        players: [
          { name: "Trinidad Chambliss", position: "QB", body: "He has already shown he can carry the offense through the air, and LSU's pressure will force him to create without giving the Tigers easy negative plays." },
          { name: "Deuce Alexander", position: "WR", body: "Thirteen catches for 235 yards through two games. He is the Rebel most capable of flipping field position with one downfield win." },
          { name: "Jaylon Braxton", position: "CB", body: "The veteran corner is a key piece of the Ole Miss plan against an LSU offense that can attack with both size and speed. His ability to hold up outside gives the Rebels more freedom to pressure Leavitt." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "LSU OFFENSE vs. OLE MISS DEFENSE",
        edge: "LSU — SLIGHT",
        body: "LSU's balance is the separator: the Tigers can run, create quarterback movement and attack the middle with Green. Ole Miss can absolutely change the matchup with takeaways, but LSU has more ways to stay on schedule.",
      },
      {
        title: "OLE MISS OFFENSE vs. LSU DEFENSE",
        edge: "LSU — SLIGHT",
        body: "Chambliss and Alexander give Ole Miss real explosive-play answers, but LSU's combination of pressure production and early-down defense makes the Rebels prove they can protect long enough to use them.",
      },
    ],
  },
  {
    id: "2026-bills-lions",
    title: "Bills vs. Lions",
    venue: "Highmark Stadium · Orchard Park",
    teams: [
      { name: "Buffalo Bills", aliases: ["buffalo", "buffalo-bills", "bills"] },
      { name: "Detroit Lions", aliases: ["detroit", "detroit-lions", "lions"] },
    ],
    setup: [
      "Buffalo opens the new Highmark Stadium on Thursday night with both teams 1–0. The Bills arrive after Josh Allen accounted for four touchdowns in a 36–31 win at Houston, while Detroit survived New Orleans 31–30 in overtime.",
      "The short week puts two very different stress points in the spotlight. Buffalo wants Allen spreading the field to DJ Moore and Dalton Kincaid, while Detroit can make the game run through Jahmyr Gibbs after his 186 scrimmage-yard opener. The defense that tackles better in space and creates pressure without losing rush-lane discipline will control the matchup.",
    ],
    keyMatchups: [
      {
        title: "Josh Allen vs. Detroit's rush lanes",
        body: "Detroit has enough front talent to make protection difficult, but simply getting pressure is not enough against Allen. Aidan Hutchinson and the Lions have to squeeze the pocket without creating escape lanes that turn broken plays into explosives. Buffalo can make that even harder with quick game and Allen's designed movement.",
        edge: "Bills — slight",
      },
      {
        title: "Jahmyr Gibbs vs. Buffalo's second level",
        body: "Gibbs carried 29 times for 156 yards and two touchdowns in Week 1, then added five catches. Buffalo cannot treat him as only a run-game problem because his receiving usage can pull linebackers out of structure and create space elsewhere. The Bills need clean fits and gang tackling before Gibbs gets into open grass.",
        edge: "Lions — slight",
      },
      {
        title: "Detroit's pass game vs. Buffalo's secondary",
        body: "Houston threw for 274 yards and two touchdowns against Buffalo, while Detroit still has Amon-Ra St. Brown, Jameson Williams and Sam LaPorta around Jared Goff. The Bills' best answer is making Goff hold the ball long enough for Greg Rousseau and the front to arrive rather than asking the secondary to survive extended coverage.",
        edge: "Lions — slight",
      },
    ],
    pathsToWin: [
      {
        team: "Buffalo Bills",
        body: "Let Allen dictate the game with tempo, movement and matchup hunting instead of living in long-developing protection. Defensively, rally multiple bodies to Gibbs, keep Goff out of play-action rhythm and make Detroit string together long drives without free explosives.",
      },
      {
        team: "Detroit Lions",
        body: "Make Gibbs the foundation, stay ahead of the chains and use play action to attack Buffalo's secondary. On defense, rush Allen with discipline rather than chasing sacks, force Buffalo to earn third downs and keep his scramble game from becoming the answer whenever the first read is covered.",
      },
    ],
    playersToWatch: [
      {
        team: "Buffalo Bills",
        players: [
          { name: "Josh Allen", position: "QB", body: "He opened 2026 with 334 passing yards, two passing touchdowns and two rushing scores. Detroit has to defend the play after the play without giving him easy escape lanes." },
          { name: "DJ Moore", position: "WR", body: "Five catches for 100 yards and a touchdown in his Bills debut. His ability to win at multiple levels gives Allen another matchup piece Detroit has to account for outside the pocket." },
          { name: "Greg Rousseau", position: "EDGE", body: "Two sacks and two forced fumbles in Week 1, including the strip sack that sealed the game. Buffalo needs him affecting Goff before Detroit's route combinations fully develop." },
        ],
      },
      {
        team: "Detroit Lions",
        players: [
          { name: "Jahmyr Gibbs", position: "RB", body: "Detroit's opener ran through him: 156 rushing yards, two touchdowns and another 30 yards receiving. His versatility is the cleanest way to stress Buffalo on every down." },
          { name: "Amon-Ra St. Brown", position: "WR", body: "He caught both of Jared Goff's touchdown passes in Week 1 and remains Detroit's most reliable answer when the offense needs a conversion against tight coverage." },
          { name: "Aidan Hutchinson", position: "EDGE", body: "Detroit's best chance to disrupt Buffalo without sacrificing coverage numbers starts with Hutchinson creating pressure while keeping Allen contained." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "BILLS OFFENSE vs. LIONS DEFENSE",
        edge: "BILLS — SLIGHT",
        body: "Detroit's front can absolutely make this difficult, but Allen's ability to beat pressure with both his arm and legs gives Buffalo an extra answer when the original play breaks down.",
      },
      {
        title: "LIONS OFFENSE vs. BILLS DEFENSE",
        edge: "LIONS — SLIGHT",
        body: "Buffalo has disruptive front-line pieces, but Gibbs plus Detroit's receiving depth can stress the Bills horizontally and vertically. The matchup tilts toward Detroit if Goff consistently gets clean early-down looks.",
      },
    ],
  },,
  {
    id: "2026-oregon-usc",
    title: "Oregon vs. USC",
    venue: "L.A. Memorial Coliseum · Los Angeles",
    teams: [
      { name: "Oregon", aliases: ["oregon", "oregon-ducks", "ducks"] },
      { name: "USC", aliases: ["usc", "usc-trojans", "southern-california", "southern-california-trojans", "trojans"] },
    ],
    setup: [
      "No. 20 Oregon heads to Los Angeles for its Big Ten opener against No. 12 USC, which is already 4–0 and 1–0 in conference play. The Ducks are 2–1 after rebounding from a road loss at Oklahoma State with an 84–0 win over Portland State, while USC comes home after surviving Rutgers 42–35. Oregon has won the last four meetings, including 42–27 last season, so this is also USC's chance to flip a series that has leaned green lately.",
      "The matchup is built around two quarterbacks playing efficient football. Jayden Maiava leads the nation with 1,173 passing yards and 12 touchdowns through four games, while Dante Moore has thrown for 849 yards and nine scores without an interception. USC is averaging 43.0 points per game; Oregon is at 49.7. The deciding question is which defense can create enough negative plays to knock either offense off schedule without giving up explosives behind the pressure.",
    ],
    keyMatchups: [
      {
        title: "Dante Moore + Oregon's receivers vs. USC's secondary",
        body: "Moore has completed 68.5% of his passes with nine touchdowns and no interceptions, and Oregon has multiple vertical answers in Evan Stewart and Dakorien Moore. USC created two interceptions at Rutgers, but it also allowed five plays of at least 20 yards. The Trojans need to disguise coverage and make Moore hold the ball without giving Oregon clean one-on-one shots downfield.",
        edge: "Oregon — slight",
      },
      {
        title: "USC's run game vs. Oregon's front",
        body: "King Miller has 338 rushing yards and has topped 100 in consecutive games, while USC's backs averaged 6.7 yards per carry at Rutgers without a negative rush. Oregon is allowing only 110.7 rushing yards per game and 3.6 yards per carry. If the Ducks can win early downs with the front, they can take away the balance that keeps Maiava out of obvious passing situations.",
        edge: "Even",
      },
      {
        title: "Jayden Maiava vs. Oregon's coverage and pressure",
        body: "Maiava is completing 75.7% of his throws with 12 touchdowns and only one interception, and USC has enough receiving depth to attack every level. Oregon counters with five interceptions through three games and has held opposing quarterbacks to a 53.3% completion rate. The Ducks have only four sacks, so they may need coverage to buy the front enough time to affect Maiava.",
        edge: "USC — slight",
      },
    ],
    pathsToWin: [
      {
        team: "Oregon",
        body: "Keep Moore clean enough to attack USC's safeties, use Stewart and Dakorien Moore to force the field open and avoid the penalties that have already cost Oregon more than 70 yards per game. Defensively, stop Miller before USC can live in play action and make Maiava drive the field against tighter passing windows.",
      },
      {
        team: "USC",
        body: "Stay balanced and make Oregon defend every blade of grass. Miller's run game can keep the Ducks from turning the game into a pure pass-rush contest, while Maiava's efficiency gives USC answers when Oregon plays coverage. Defensively, the Trojans need takeaways or early-down disruption so Moore cannot repeatedly operate from clean second-and-manageable situations.",
      },
    ],
    playersToWatch: [
      {
        team: "Oregon",
        players: [
          { name: "Dante Moore", position: "QB", body: "He enters conference play with 849 passing yards, nine touchdowns and no interceptions. USC's best chance is forcing him to hold the ball and win after the first read is taken away." },
          { name: "Evan Stewart", position: "WR", body: "Oregon's leading receiver has 15 catches for 222 yards and two touchdowns. His ability to win vertically makes USC pay for leaning extra help toward the box." },
          { name: "Jett Washington", position: "DB", body: "He leads Oregon with two interceptions and becomes especially important against a USC passing game that has spread production across multiple receivers." },
        ],
      },
      {
        team: "USC",
        players: [
          { name: "Jayden Maiava", position: "QB", body: "Through four games he has 1,173 passing yards, 12 touchdowns and one interception while completing 75.7% of his passes. Oregon has not yet faced a passing game this efficient." },
          { name: "King Miller", position: "RB", body: "USC's leading rusher has 338 yards and three touchdowns, including back-to-back 100-yard games. His success determines whether Oregon can sell out to pressure Maiava." },
          { name: "Christian Pierce", position: "S", body: "He had 11 tackles, an interception and two pass breakups at Rutgers. USC needs that same range and tackling against Oregon's deep, spread-out receiving group." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "OREGON OFFENSE vs. USC DEFENSE",
        edge: "OREGON — SLIGHT",
        body: "USC has created timely takeaways, but Oregon's combination of Moore's ball security, multiple receiving threats and a functional run game gives the Ducks several ways to punish aggressive coverage.",
      },
      {
        title: "USC OFFENSE vs. OREGON DEFENSE",
        edge: "USC — SLIGHT",
        body: "Oregon's coverage numbers are strong, but Maiava's efficiency plus Miller's recent production makes USC difficult to push into one-dimensional football. The Ducks need their four-man rush to affect the pocket more consistently than it has through three games.",
      },
    ],
  },
  {
    id: "2026-raiders-saints",
    title: "Raiders vs. Saints",
    venue: "Caesars Superdome · New Orleans",
    teams: [
      { name: "Las Vegas Raiders", aliases: ["las-vegas-raiders", "las-vegas", "raiders", "lv-raiders", "lv"] },
      { name: "New Orleans Saints", aliases: ["new-orleans-saints", "new-orleans", "saints", "no-saints", "no"] },
    ],
    setup: [
      "Las Vegas brings a 2–0 record into New Orleans for the Saints' home opener, while New Orleans is 1–1 after rallying from a 14–3 deficit to beat Baltimore 24–17. There is also a coaching connection: Raiders head coach Klint Kubiak returns to the Superdome after serving as the Saints' offensive coordinator in 2024, the same season Las Vegas came to New Orleans and won 25–10.",
      "The early-season identities are already clear. Kirk Cousins has thrown six touchdown passes in two games and the Raiders are getting explosive production from Tre Tucker, while Tyler Shough has thrown for 662 yards through two games and just led a fourth-quarter comeback in Baltimore. Las Vegas wants the game controlled by its efficient passing attack and defense; New Orleans wants Shough, Chris Olave and Juwan Johnson creating enough chain-moving plays to keep the Raiders from dictating tempo.",
    ],
    keyMatchups: [
      {
        title: "Kirk Cousins + Tre Tucker vs. the Saints' secondary",
        body: "Cousins corrected the biggest Week 1 concern by attacking deeper against the Chargers, going 8-of-12 for 181 yards and three touchdowns on throws of 10-plus air yards. Tucker was the main beneficiary with five catches for 119 yards. New Orleans has to limit those explosives without giving Cousins easy underneath answers when it backs the safeties off.",
        edge: "Raiders — slight",
      },
      {
        title: "Ashton Jeanty vs. the Saints' front seven",
        body: "Jeanty has 150 rushing yards through two games but was held to 48 yards on 21 carries by the Chargers. New Orleans just tightened up against Baltimore and allowed only 40 rushing yards in the second half, with Pete Werner and the front playing faster as the game went on. The Saints can make Las Vegas much easier to defend if they keep the Raiders behind schedule on the ground.",
        edge: "Saints — slight",
      },
      {
        title: "Tyler Shough + Chris Olave vs. Las Vegas' pass defense",
        body: "Shough completed 27-of-34 for 252 yards and a touchdown in Baltimore, with Olave catching eight passes for 86 yards and the game-tying score. Las Vegas has opened 2–0 with a defense that is already producing top-10 results in multiple categories. New Orleans needs protection to hold up long enough for Olave and Juwan Johnson to work beyond the first window.",
        edge: "Even",
      },
    ],
    pathsToWin: [
      {
        team: "Las Vegas Raiders",
        body: "Let Cousins keep playing on time, use Tucker's speed to stretch the Saints vertically and make New Orleans defend the full route tree before leaning harder on Jeanty. Defensively, pressure Shough without opening easy scramble lanes and force the Saints to prove they can finish long drives rather than living on fourth-quarter explosives.",
      },
      {
        team: "New Orleans Saints",
        body: "Win early downs on defense so Cousins cannot live in favorable play-action situations, then make Las Vegas earn every explosive through tighter coverage. Offensively, keep Shough in rhythm with Olave and Johnson, use the backs as outlets against pressure and avoid falling into another early two-score hole.",
      },
    ],
    playersToWatch: [
      {
        team: "Las Vegas Raiders",
        players: [
          { name: "Kirk Cousins", position: "QB", body: "He has 413 passing yards and six touchdowns through two games, including three scores in each win. New Orleans has to disrupt his timing before the route concepts fully develop." },
          { name: "Tre Tucker", position: "WR", body: "Seven catches for 146 yards through two games, including 119 yards against the Chargers. His speed is the Raiders' cleanest way to punish a Saints defense that gets too aggressive underneath." },
          { name: "Maxx Crosby", position: "DE", body: "The centerpiece of the Raiders' front remains the player New Orleans must account for on every passing down. His ability to create pressure without extra rushers lets Las Vegas keep more bodies in coverage." },
        ],
      },
      {
        team: "New Orleans Saints",
        players: [
          { name: "Tyler Shough", position: "QB", body: "He has 662 passing yards through two games and completed 79.4% of his throws in the comeback win over Baltimore. This matchup tests whether that production can hold up against a defense playing with an early-season edge." },
          { name: "Chris Olave", position: "WR", body: "Eight catches for 86 yards and a touchdown in Week 2 showed how central he is to the Saints' passing game. New Orleans needs him creating separation before the Raiders' rush can arrive." },
          { name: "Pete Werner", position: "LB", body: "He led New Orleans with 11 tackles and a sack in Baltimore. His range is critical against Jeanty underneath and against the play-action concepts Kubiak uses to stress linebackers." },
        ],
      },
    ],
    unitEdges: [
      {
        title: "RAIDERS OFFENSE vs. SAINTS DEFENSE",
        edge: "RAIDERS — SLIGHT",
        body: "New Orleans showed it can tighten up after halftime, but Cousins' efficiency and Tucker's explosive start give Las Vegas a passing-game answer even when Jeanty is not controlling the ground game.",
      },
      {
        title: "SAINTS OFFENSE vs. RAIDERS DEFENSE",
        edge: "EVEN",
        body: "Shough and Olave have already shown enough production to move the ball against quality competition, but Las Vegas' defensive start makes this a much tougher protection and decision-making test than the raw passing totals suggest.",
      },
    ],
  }
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
