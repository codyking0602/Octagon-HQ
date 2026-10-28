import { expandSportsFeudFamilies } from "./sportsFeudAuthoredHelpers";

const variants = (prompts: readonly string[], rankings: readonly (readonly string[])[], accepted: readonly string[]) =>
  prompts.map((prompt, index) => ({ prompt, answers: rankings[index], alsoAcceptedAnswers: accepted }));

export const NFL_SPORTS_FEUD_FAST_3 = expandSportsFeudFamilies("nfl-fast3", [
  {
    category: "coaches", entityKind: "person", collisionGroup: "coaches",
    prompts: variants(
      ["Name an NFL head coach who won multiple Super Bowls.","Name a head coach with more than one Super Bowl win.","Name a coach you remember lifting the Lombardi Trophy multiple times.","Name an NFL head coach whose résumé includes multiple Super Bowl titles.","Name a multiple-time Super Bowl-winning coach almost every NFL fan knows."],
      [["Bill Belichick","Andy Reid","Chuck Noll","Bill Walsh","Joe Gibbs","Tom Landry","Don Shula","Bill Parcells"],["Bill Belichick","Andy Reid","Chuck Noll","Bill Walsh","Joe Gibbs","Tom Landry","Bill Parcells","Don Shula"],["Bill Belichick","Andy Reid","Bill Walsh","Chuck Noll","Joe Gibbs","Tom Landry","Jimmy Johnson","Tom Coughlin"],["Bill Belichick","Andy Reid","Chuck Noll","Bill Walsh","Joe Gibbs","Tom Landry","Bill Parcells","Mike Shanahan"],["Bill Belichick","Andy Reid","Bill Walsh","Chuck Noll","Joe Gibbs","Tom Landry","Don Shula","Bill Parcells"]],
      ["George Seifert","Tom Coughlin","Mike Shanahan","Jimmy Johnson","Tom Flores"]),
    answers: ["Bill Belichick","Andy Reid","Bill Walsh","Chuck Noll","Joe Gibbs","Tom Landry","Don Shula","Bill Parcells"],
  },
  {
    category: "coaches", entityKind: "person", collisionGroup: "coaches",
    prompts: variants(
      ["Name an NFL coach known for offense.","Name a coach whose offensive system became part of his reputation.","Name an NFL coach you associate with creative play design.","Name an offensive-minded coach fans recognize quickly.","Name a coach whose teams are remembered for moving the ball."],
      [["Andy Reid","Bill Walsh","Sean McVay","Mike Shanahan","Kyle Shanahan","Sean Payton","Don Coryell","Mike Holmgren"],["Bill Walsh","Don Coryell","Mike Shanahan","Kyle Shanahan","Andy Reid","Sean McVay","Mike Holmgren","Sid Gillman"],["Andy Reid","Sean McVay","Kyle Shanahan","Sean Payton","Mike McDaniel","Bill Walsh","Mike Shanahan","Doug Pederson"],["Andy Reid","Sean McVay","Kyle Shanahan","Sean Payton","Bill Walsh","Mike Shanahan","Mike McDaniel","Bruce Arians"],["Andy Reid","Bill Walsh","Sean McVay","Mike Shanahan","Sean Payton","Mike Holmgren","Don Coryell","Mike Martz"]],
      ["Sid Gillman","Paul Brown","Mike Martz","Bruce Arians","Jon Gruden","Mike McDaniel","Doug Pederson","Kevin O'Connell"]),
    answers: ["Andy Reid","Bill Walsh","Sean McVay","Mike Shanahan","Kyle Shanahan","Mike Holmgren","Don Coryell","Sean Payton"],
  },
  {
    category: "coaches", entityKind: "person", collisionGroup: "coaches",
    prompts: variants(
      ["Name an NFL coach strongly associated with defense.","Name a coach whose teams were known for being hard to score on.","Name an NFL coach with a defensive identity.","Name a coach you would trust to build a tough defense.","Name a coach whose best teams were famous for physical defense."],
      [["Bill Belichick","Mike Tomlin","Bill Parcells","Tony Dungy","Pete Carroll","Bill Cowher","Buddy Ryan","Dick LeBeau"],["Bill Belichick","Tony Dungy","Pete Carroll","Mike Tomlin","Bill Parcells","Lovie Smith","Bill Cowher","Dick LeBeau"],["Bill Belichick","Mike Tomlin","Bill Parcells","Buddy Ryan","Dick LeBeau","Tony Dungy","Pete Carroll","Rex Ryan"],["Bill Belichick","Mike Tomlin","Bill Parcells","Tony Dungy","Pete Carroll","Bill Cowher","Wade Phillips","Dan Quinn"],["Mike Tomlin","Bill Cowher","Buddy Ryan","Bill Belichick","Pete Carroll","Mike Ditka","Bill Parcells","Dick LeBeau"]],
      ["Bill Cowher","Rex Ryan","Wade Phillips","Lovie Smith","Dan Quinn","George Allen","Marty Schottenheimer","Mike Ditka"]),
    answers: ["Bill Belichick","Mike Tomlin","Bill Parcells","Tony Dungy","Pete Carroll","Mike Ditka","Buddy Ryan","Dick LeBeau"],
  },
  {
    category: "rivalries", entityKind: "other", collisionGroup: "rivalries",
    prompts: variants(
      ["Name a famous NFL rivalry.","Name a divisional matchup with real bad blood.","Name an NFL game fans circle twice every season.","Name a rivalry where the records do not matter much.","Name an NFL rivalry a casual fan might recognize."],
      [["Packers-Bears","Cowboys-Eagles","Steelers-Ravens","49ers-Cowboys","Raiders-Chiefs","Giants-Eagles","Packers-Vikings","Jets-Patriots"],["Steelers-Ravens","Cowboys-Eagles","Raiders-Chiefs","Packers-Bears","Giants-Eagles","Saints-Falcons","Browns-Steelers","Bengals-Steelers"],["Cowboys-Eagles","Steelers-Ravens","Packers-Bears","Raiders-Chiefs","Packers-Vikings","Giants-Eagles","Chiefs-Broncos","Saints-Falcons"],["Packers-Bears","Steelers-Ravens","Cowboys-Eagles","Raiders-Chiefs","Browns-Steelers","Saints-Falcons","Giants-Eagles","Packers-Vikings"],["Packers-Bears","Cowboys-Eagles","Steelers-Ravens","49ers-Cowboys","Jets-Patriots","Raiders-Chiefs","Packers-Vikings","Patriots-Colts"]],
      ["Cowboys-Commanders","Patriots-Colts","49ers-Seahawks","Browns-Steelers","Saints-Falcons","Chiefs-Broncos","Bears-Vikings","Bengals-Steelers"]),
    answers: ["Packers-Bears","Cowboys-Eagles","Steelers-Ravens","49ers-Cowboys","Raiders-Chiefs","Giants-Eagles","Packers-Vikings","Jets-Patriots"],
  },
  {
    category: "venues", entityKind: "other", collisionGroup: "venues",
    prompts: variants(
      ["Name an NFL stadium known for being loud.","Name a stadium where a road quarterback can struggle to communicate.","Name an NFL venue famous for a hostile atmosphere.","Name a stadium you would expect on a loudest-in-the-NFL list.","Name a home field where crowd noise feels like a real advantage."],
      [["Arrowhead Stadium","Lumen Field","Superdome","Highmark Stadium","Lambeau Field","Lincoln Financial Field","U.S. Bank Stadium","Ford Field"],["Arrowhead Stadium","Lumen Field","Superdome","U.S. Bank Stadium","Highmark Stadium","Ford Field","Lincoln Financial Field","Lambeau Field"],["Lincoln Financial Field","Arrowhead Stadium","Lumen Field","Highmark Stadium","Superdome","Lambeau Field","M&T Bank Stadium","U.S. Bank Stadium"],["Arrowhead Stadium","Lumen Field","Superdome","Highmark Stadium","U.S. Bank Stadium","Ford Field","Lambeau Field","Lincoln Financial Field"],["Arrowhead Stadium","Lumen Field","Highmark Stadium","Superdome","Lambeau Field","Lincoln Financial Field","U.S. Bank Stadium","Ford Field"]],
      ["M&T Bank Stadium","Empower Field at Mile High"]),
    answers: ["Arrowhead Stadium","Lumen Field","Lambeau Field","Highmark Stadium","Superdome","Lincoln Financial Field","M&T Bank Stadium","U.S. Bank Stadium"],
  },
  {
    category: "history", entityKind: "other", collisionGroup: "super-bowls",
    prompts: variants(
      ["Name a famous Super Bowl matchup.","Name a Super Bowl pairing fans still remember.","Name a championship game that produced an iconic NFL moment.","Name a Super Bowl you would expect in an NFL history montage.","Name a Super Bowl matchup that became bigger than the final score."],
      [["Giants-Patriots","Patriots-Seahawks","49ers-Bengals","Steelers-Cowboys","Cowboys-Bills","Eagles-Patriots","Rams-Titans","Chiefs-49ers"],["Giants-Patriots","Patriots-Seahawks","Eagles-Patriots","Cowboys-Bills","Steelers-Cowboys","Chiefs-Eagles","49ers-Bengals","Chiefs-49ers"],["Giants-Patriots","Patriots-Seahawks","Rams-Titans","49ers-Bengals","Eagles-Patriots","Bills-Giants","Ravens-49ers","Colts-Saints"],["Giants-Patriots","Patriots-Seahawks","49ers-Bengals","Steelers-Cowboys","Eagles-Patriots","Cowboys-Bills","Rams-Titans","Chiefs-49ers"],["Giants-Patriots","Patriots-Seahawks","Eagles-Patriots","Chiefs-Eagles","Chiefs-49ers","Steelers-Cowboys","Cowboys-Bills","Rams-Titans"]],
      ["Chiefs-Eagles","Ravens-49ers","Colts-Saints","Broncos-Seahawks","Rams-Patriots","Bills-Giants","Bears-Patriots","Chiefs-Buccaneers"]),
    answers: ["Giants-Patriots","49ers-Bengals","Cowboys-Bills","Steelers-Cowboys","Patriots-Seahawks","Chiefs-49ers","Rams-Titans","Eagles-Patriots"],
  },
  {
    category: "awards", entityKind: "other", collisionGroup: "awards",
    prompts: variants(
      ["Name a major NFL award.","Name an NFL honor players dream about winning.","Name an award fans debate during the season.","Name an NFL award that can boost a player's legacy.","Name an individual honor announced around the end of an NFL season."],
      [["NFL MVP","Super Bowl MVP","Defensive Player of the Year","Offensive Player of the Year","Offensive Rookie of the Year","Defensive Rookie of the Year","Comeback Player of the Year","Walter Payton Man of the Year"],["NFL MVP","Super Bowl MVP","Defensive Player of the Year","Offensive Player of the Year","First-team All-Pro","Offensive Rookie of the Year","Defensive Rookie of the Year","Walter Payton Man of the Year"],["NFL MVP","Offensive Player of the Year","Defensive Player of the Year","Offensive Rookie of the Year","Defensive Rookie of the Year","Comeback Player of the Year","Super Bowl MVP","Walter Payton Man of the Year"],["NFL MVP","Super Bowl MVP","First-team All-Pro","Defensive Player of the Year","Offensive Player of the Year","Offensive Rookie of the Year","Defensive Rookie of the Year","Pro Bowl selection"],["NFL MVP","Offensive Player of the Year","Defensive Player of the Year","Offensive Rookie of the Year","Defensive Rookie of the Year","Comeback Player of the Year","Walter Payton Man of the Year","Art Rooney Sportsmanship Award"]],
      ["First-team All-Pro","Pro Bowl selection","Art Rooney Sportsmanship Award"]),
    answers: ["NFL MVP","Super Bowl MVP","Defensive Player of the Year","Offensive Player of the Year","Offensive Rookie of the Year","Defensive Rookie of the Year","Comeback Player of the Year","Walter Payton Man of the Year"],
  },
  {
    category: "players", entityKind: "person", collisionGroup: "tight-ends",
    prompts: variants(
      ["Name a famous NFL tight end.","Name a tight end whose career belongs in a legends conversation.","Name an NFL tight end who became a major receiving weapon.","Name a tight end almost every football fan recognizes.","Name a tight end whose highlights changed expectations for the position."],
      [["Travis Kelce","Rob Gronkowski","Tony Gonzalez","Antonio Gates","Jason Witten","Shannon Sharpe","George Kittle","Kellen Winslow"],["Tony Gonzalez","Rob Gronkowski","Travis Kelce","Antonio Gates","Jason Witten","Shannon Sharpe","Kellen Winslow","Ozzie Newsome"],["Travis Kelce","Rob Gronkowski","Tony Gonzalez","Antonio Gates","George Kittle","Kellen Winslow","Shannon Sharpe","Vernon Davis"],["Travis Kelce","Rob Gronkowski","Tony Gonzalez","George Kittle","Jason Witten","Antonio Gates","Shannon Sharpe","Mark Andrews"],["Rob Gronkowski","Travis Kelce","Kellen Winslow","Tony Gonzalez","Antonio Gates","George Kittle","Shannon Sharpe","Vernon Davis"]],
      ["Ozzie Newsome","Mike Ditka","John Mackey","Dave Casper","Mark Andrews","Zach Ertz","Dallas Clark","Vernon Davis"]),
    answers: ["Tony Gonzalez","Rob Gronkowski","Travis Kelce","Antonio Gates","Jason Witten","Shannon Sharpe","Kellen Winslow","George Kittle"],
  },
  {
    category: "players", entityKind: "person", collisionGroup: "kickers",
    prompts: variants(
      ["Name a famous NFL kicker.","Name a kicker you would trust with a game-winning field goal.","Name an NFL kicker fans recognize by name.","Name a kicker whose career included huge pressure kicks.","Name a kicker who became unusually famous for his position."],
      [["Adam Vinatieri","Justin Tucker","Morten Andersen","Sebastian Janikowski","Harrison Butker","Stephen Gostkowski","Robbie Gould","Jan Stenerud"],["Adam Vinatieri","Justin Tucker","Harrison Butker","Stephen Gostkowski","Robbie Gould","Morten Andersen","Matt Prater","Nick Folk"],["Justin Tucker","Adam Vinatieri","Sebastian Janikowski","Morten Andersen","Harrison Butker","Robbie Gould","Stephen Gostkowski","Matt Prater"],["Adam Vinatieri","Justin Tucker","Harrison Butker","Stephen Gostkowski","Robbie Gould","Morten Andersen","Matt Bryant","John Kasay"],["Justin Tucker","Adam Vinatieri","Sebastian Janikowski","Morten Andersen","Jan Stenerud","Lou Groza","Harrison Butker","Robbie Gould"]],
      ["Jan Stenerud","Lou Groza","Matt Prater","Harrison Butker","Nick Folk","Matt Bryant","John Kasay","Jason Elam","Gary Anderson"]),
    answers: ["Justin Tucker","Adam Vinatieri","Morten Andersen","Sebastian Janikowski","Jason Elam","Gary Anderson","Stephen Gostkowski","Robbie Gould"],
  },
  {
    category: "players", entityKind: "person", collisionGroup: "returners",
    prompts: variants(
      ["Name a famous NFL return specialist.","Name a player you would hate to kick or punt to.","Name an NFL player known for dangerous returns.","Name a returner who could flip field position in seconds.","Name a player whose special-teams highlights became part of his fame."],
      [["Devin Hester","Dante Hall","Brian Mitchell","Josh Cribbs","Cordarrelle Patterson","Deion Sanders","Desmond Howard","Tyreek Hill"],["Devin Hester","Dante Hall","Deion Sanders","Tyreek Hill","Cordarrelle Patterson","Josh Cribbs","Ted Ginn Jr.","Percy Harvin"],["Devin Hester","Dante Hall","Josh Cribbs","Cordarrelle Patterson","Deion Sanders","Tyreek Hill","Brian Mitchell","Desmond Howard"],["Devin Hester","Dante Hall","Tyreek Hill","Cordarrelle Patterson","Deion Sanders","Josh Cribbs","Leon Washington","Darren Sproles"],["Devin Hester","Dante Hall","Desmond Howard","Deion Sanders","Cordarrelle Patterson","Josh Cribbs","Brian Mitchell","Jacoby Jones"]],
      ["Gale Sayers","Billy Johnson","Mel Gray","Jacoby Jones","Leon Washington","Ted Ginn Jr.","Darren Sproles","Percy Harvin"]),
    answers: ["Devin Hester","Dante Hall","Brian Mitchell","Josh Cribbs","Cordarrelle Patterson","Deion Sanders","Tyreek Hill","Desmond Howard"],
  },
] as const);
