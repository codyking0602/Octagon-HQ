/**
 * Editorial NBA Wavelength calibration bank. This is a comparison SCALE, not
 * a Who Am I question bank or a statistical ranker. Each row is rated only for
 * its named attribute; cultural and rivalry judgments are editorial opinions,
 * not substitutes for skill ratings. Stable NBA-era reference points intentionally include weak,
 * ordinary, strong, elite and iconic examples. No projected 2026 performance.
 */
export const NBA_WAVELENGTH_CATALOG_VERSION = "nba-wavelength-catalog-v3" as const;
export const NBA_WAVELENGTH_CALIBRATION_VERSION = "nba-wavelength-calibration-v3" as const;

export type NbaWavelengthCategory =
  | "CAREER LEGACY"
  | "PEAK DOMINANCE"
  | "SCORING THREAT"
  | "OUTSIDE SHOOTING"
  | "PLAYMAKING"
  | "DEFENSIVE IMPACT"
  | "EXPLOSIVE ATHLETICISM"
  | "CLUTCH SHOTMAKING"
  | "PLAYOFF RÉSUMÉ"
  | "SHOWMANSHIP"
  | "VILLAIN REPUTATION"
  | "CULTURAL INFLUENCE"
  | "HOME-COURT HEAT"
  | "RIVALRY HEAT"
  | "BALL HANDLING"
  | "REBOUNDING"
  | "RIM PROTECTION"
  | "MIDRANGE TOUCH"
  | "AT-THE-RIM FINISHING"
  | "BASKETBALL IQ"
  | "TRASH TALK"
  | "NBA MOMENT IMPACT"
  | "FRANCHISE TRADITION"
  | "DRAFT HYPE"
  | "DUO IMPACT";
export type NbaWavelengthEra = "classic" | "eighties-nineties" | "two-thousands" | "modern";
export type NbaWavelengthTier = "low" | "developing" | "middle" | "strong" | "elite" | "iconic";

export interface NbaWavelengthCatalogClue {
  id: string;
  subject: string;
  category: NbaWavelengthCategory;
  /** Exactly one plainly rated attribute, used in gameplay and result reveals. */
  text: string;
  /** Context and rationale retained for editorial audits, never shown as a second clue. */
  editorialNote: string;
  rating: number;
  era: NbaWavelengthEra;
}

type SeedRow = readonly [slug: string, subject: string, text: string, rating: number, era: NbaWavelengthEra];
type SeedGroup = { category: NbaWavelengthCategory; prefix: string; rows: readonly SeedRow[] };
function group(category: NbaWavelengthCategory, prefix: string, rows: readonly SeedRow[]): SeedGroup {
  return { category, prefix, rows };
}

export const NBA_WAVELENGTH_CATEGORY_ANCHORS = [
  { category: "CAREER LEGACY", question: "How significant is this player's full NBA career legacy?", low: "Brief or marginal NBA footprint", middle: "Respected multi-year contributor", high: "Changed NBA history" },
  { category: "PEAK DOMINANCE", question: "At the player's best, how much could he control a game?", low: "Little game-changing peak", middle: "Credible NBA starter at peak", high: "Historically dominant peak" },
  { category: "SCORING THREAT", question: "How dangerous was this player as an individual scorer at his best?", low: "Rarely looked to score", middle: "Reliable NBA scoring option", high: "Historically unstoppable bucket-getter" },
  { category: "OUTSIDE SHOOTING", question: "How elite was this player's NBA jump-shooting and three-point threat?", low: "Defense deliberately leaves him open", middle: "Credible open-jumper threat", high: "Changed how defenses guard the perimeter" },
  { category: "PLAYMAKING", question: "How exceptional was this player's vision and creation for teammates?", low: "Little offensive orchestration", middle: "Can reliably set up teammates", high: "Historically great offensive architect" },
  { category: "DEFENSIVE IMPACT", question: "How much did this player's best defense disrupt opponents?", low: "Frequent defensive target", middle: "Sound positive team defender", high: "Entire opposing game plans revolve around him" },
  { category: "EXPLOSIVE ATHLETICISM", question: "At NBA peak, how extraordinary were this player's burst and above-the-rim explosion?", low: "Ground-bound", middle: "NBA-average burst and leaping", high: "Era-defining physical explosion" },
  { category: "CLUTCH SHOTMAKING", question: "How strong was this player's reputation for making difficult late-game baskets?", low: "Almost never trusted with a late shot", middle: "Some memorable late makes", high: "An all-time late-game shotmaking icon" },
  { category: "PLAYOFF RÉSUMÉ", question: "How accomplished is this player's NBA postseason body of work?", low: "Barely any meaningful playoff work", middle: "Some real postseason success", high: "Defining championship and Finals legacy" },

  { category: "SHOWMANSHIP", question: "How much deliberate flair and spectacle did this player bring to NBA games?", low: "Reserved and businesslike on court", middle: "Occasional expressive highlights", high: "Signature crowd-pleasing NBA performer" },
  { category: "VILLAIN REPUTATION", question: "How strongly was this player viewed as an on-court antagonist by opponents and their fans?", low: "Widely respected with little villain reputation", middle: "Polarizing competitive edge", high: "Defining NBA antagonist" },
  { category: "CULTURAL INFLUENCE", question: "How deeply did this player change NBA style, fan culture or the sport's wider reach?", low: "Little beyond-the-box-score influence", middle: "Recognizable influence on fan culture", high: "Changed basketball's global cultural identity" },
  { category: "HOME-COURT HEAT", question: "How intense and intimidating was this team's home crowd in the stated era?", low: "Quiet or limited home-crowd advantage", middle: "Noticeable playoff crowd energy", high: "One of the NBA's defining crowd atmospheres" },
  { category: "RIVALRY HEAT", question: "How fierce and historically charged was this specific NBA matchup in the stated period?", low: "Little established bad blood", middle: "Some heated head-to-head history", high: "Defining, deeply contentious rivalry" },

  { category: "BALL HANDLING", question: "At NBA peak, how skilled was this player at controlling the ball under pressure and beating a defender off the dribble?", low: "Limited dribble creation", middle: "Dependable NBA ball control", high: "Historic dribble control and creation" },
  { category: "REBOUNDING", question: "How strong was this player at securing NBA rebounds relative to the demands of his role?", low: "Little board impact for the role", middle: "Reliable rebounder for his role", high: "Era-defining rebound control" },
  { category: "RIM PROTECTION", question: "How effectively did this player deter or erase shots near the NBA basket at his best?", low: "Rarely deterred rim attempts", middle: "Situational help and contesting", high: "Historic paint deterrent and shot blocker" },
  { category: "MIDRANGE TOUCH", question: "At his best, how dangerous was this player's NBA midrange jump shot specifically?", low: "Little midrange jumper threat", middle: "Can punish space inside the arc", high: "Historic midrange specialist" },
  { category: "AT-THE-RIM FINISHING", question: "At peak NBA form, how effectively did this player turn drives and catches near the basket into scores?", low: "Limited close-range creation", middle: "Useful NBA finisher", high: "Historically unstoppable near the rim" },
  { category: "BASKETBALL IQ", question: "At NBA peak, how well did this player anticipate the game, read situations and make decisions?", low: "Frequently forced low-percentage decisions", middle: "Mostly sound situational reads", high: "Historic court awareness and decision-making" },
  { category: "TRASH TALK", question: "How intense and memorable was this player's NBA on-court verbal sparring and taunting?", low: "Rarely engaged in trash talk", middle: "Occasional competitive barbs", high: "Legendary NBA trash-talker" },
  { category: "NBA MOMENT IMPACT", question: "How much of a lasting mark did this specific NBA event leave on basketball history?", low: "Recognizable event with little league-wide legacy", middle: "Memorable NBA highlight or milestone", high: "Defining NBA moment" },
  { category: "FRANCHISE TRADITION", question: "How rich and established is this NBA franchise's overall historical identity, longevity and tradition?", low: "Shorter or thinner historical résumé", middle: "Recognizable multi-era identity", high: "Defining cornerstone of NBA history" },
  { category: "DRAFT HYPE", question: "Before his NBA debut, how intense were the expectations and attention surrounding this prospect?", low: "Little pre-draft fanfare", middle: "Credible first-round expectations", high: "Generational prospect anticipation" },
  { category: "DUO IMPACT", question: "How effective and memorable was this specific pair when sharing the NBA court in the stated seasons?", low: "Big names without cohesive success together", middle: "Good but limited partnership", high: "All-time NBA pairing" },
] as const satisfies readonly {
  category: NbaWavelengthCategory; question: string; low: string; middle: string; high: string;
}[];

export const NBA_WAVELENGTH_BANDS = [
  { tier: "low", min: 1, max: 19, meaning: "minimal case for this exact basketball trait" },
  { tier: "developing", min: 20, max: 39, meaning: "clearly below a reliable NBA standard for this trait" },
  { tier: "middle", min: 40, max: 59, meaning: "credible or ordinary NBA-level example" },
  { tier: "strong", min: 60, max: 79, meaning: "clearly good to very good, short of a signature historic standard" },
  { tier: "elite", min: 80, max: 91, meaning: "widely recognized signature NBA excellence" },
  { tier: "iconic", min: 92, max: 100, meaning: "era-defining or historical gold standard" },
] as const;

/**
 * Each seed's original evidence remains an internal editorial note. On-screen
 * language deliberately names a SINGLE trait, with no pre-rated judgment or
 * explanatory paragraph that reverses the direction of the user's guess.
 * Subject identities remain canonical across categories.
 */
const groups: readonly SeedGroup[] = [
  group("CAREER LEGACY", "legacy", [
    ["anthony-bennett", "Anthony Bennett", "Anthony Bennett — brief NBA tenure after going No. 1", 6, "modern"],
    ["hasheem-thabeet", "Hasheem Thabeet", "Hasheem Thabeet — short-lived career after a No. 2 selection", 10, "two-thousands"],
    ["michael-carter-williams", "Michael Carter-Williams", "Michael Carter-Williams — Rookie of the Year, then journeyman", 34, "modern"],
    ["jeremy-lin", "Jeremy Lin", "Jeremy Lin — Linsanity, then a long rotation career", 44, "modern"],
    ["shane-battier", "Shane Battier", "Shane Battier — trusted two-way role player on title teams", 61, "two-thousands"],
    ["jamal-crawford", "Jamal Crawford", "Jamal Crawford — long career and three Sixth Man awards", 65, "two-thousands"],
    ["andrew-iguodala", "Andre Iguodala", "Andre Iguodala — All-Star and 2015 Finals MVP", 75, "modern"],
    ["derozan", "DeMar DeRozan", "DeMar DeRozan — six-time All-Star and prolific scorer", 77, "modern"],
    ["derrick-rose", "Derrick Rose", "Derrick Rose — youngest MVP, peak shortened by injuries", 81, "two-thousands"],
    ["pau-gasol", "Pau Gasol", "Pau Gasol — two titles and six All-Star selections", 86, "two-thousands"],
    ["steve-nash", "Steve Nash", "Steve Nash — back-to-back regular-season MVPs", 89, "two-thousands"],
    ["dirk-nowitzki", "Dirk Nowitzki", "Dirk Nowitzki — 2011 title, MVP and signature fadeaway", 94, "two-thousands"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — five championships and sustained two-way excellence", 98, "two-thousands"],
    ["kareem-abdul-jabbar", "Kareem Abdul-Jabbar", "Kareem Abdul-Jabbar — six MVPs and six NBA titles", 99, "classic"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — six Finals MVPs and defining global impact", 100, "eighties-nineties"],
    ["lebron-james", "LeBron James", "LeBron James — historic longevity and four Finals MVPs", 100, "modern"],
  ]),
  group("PEAK DOMINANCE", "peak", [
    ["anthony-bennett", "Anthony Bennett", "Anthony Bennett — never established a reliable NBA peak", 7, "modern"],
    ["kwame-brown", "Kwame Brown", "Kwame Brown — limited offensive peak as starting big", 24, "two-thousands"],
    ["javale-mcgee", "JaVale McGee", "JaVale McGee — energetic rim-running rotation peak", 45, "modern"],
    ["tyson-chandler", "Tyson Chandler", "Tyson Chandler — Defensive Player of the Year at his peak", 64, "two-thousands"],
    ["kemba-walker", "Kemba Walker", "Kemba Walker — All-NBA scoring season in Charlotte", 72, "modern"],
    ["demarcus-cousins", "DeMarcus Cousins", "DeMarcus Cousins — dominant scoring and rebounding prime", 79, "modern"],
    ["paul-george", "Paul George", "Paul George — elite two-way wing and 2019 MVP finalist", 84, "modern"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — 2019 playoff takeover and elite defense", 92, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — unanimous 2016 MVP and transformative scoring peak", 97, "modern"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — consecutive MVP seasons", 97, "modern"],
    ["nikola-jokic", "Nikola Jokić", "Nikola Jokić — MVP-level offensive command as a center", 98, "modern"],
    ["hakeem-olajuwon", "Hakeem Olajuwon", "Hakeem Olajuwon — 1994 MVP, DPOY and Finals MVP", 98, "eighties-nineties"],
    ["shaq", "Shaquille O'Neal", "Shaquille O'Neal — overpowering three-peat Finals peak", 100, "two-thousands"],
    ["wilt-chamberlain", "Wilt Chamberlain", "Wilt Chamberlain — 100-point game and historic season averages", 100, "classic"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — scoring-title streak with elite defense", 100, "eighties-nineties"],
  ]),
  group("SCORING THREAT", "scoring", [
    ["ben-wallace", "Ben Wallace", "Ben Wallace — defense-first center with minimal scoring", 7, "two-thousands"],
    ["dennis-rodman", "Dennis Rodman", "Dennis Rodman — rebounding specialist, rarely a scoring option", 11, "eighties-nineties"],
    ["draymond-green", "Draymond Green", "Draymond Green — offense run through his passing, not points", 28, "modern"],
    ["bruce-bowen", "Bruce Bowen", "Bruce Bowen — defensive wing and corner-three role", 34, "two-thousands"],
    ["jrue-holiday", "Jrue Holiday", "Jrue Holiday — capable two-way scorer, not primary engine", 55, "modern"],
    ["kyle-kuzma", "Kyle Kuzma", "Kyle Kuzma — volume scoring in secondary roles", 62, "modern"],
    ["jamal-murray", "Jamal Murray", "Jamal Murray — big playoff scoring bursts", 76, "modern"],
    ["kyrie-irving", "Kyrie Irving", "Kyrie Irving — elite self-created shots and finishing", 88, "modern"],
    ["carmelo-anthony", "Carmelo Anthony", "Carmelo Anthony — isolation scoring and a scoring title", 91, "two-thousands"],
    ["james-harden", "James Harden", "James Harden — three straight scoring titles", 96, "modern"],
    ["kobe-bryant", "Kobe Bryant", "Kobe Bryant — 81-point night and difficult-shot scoring", 97, "two-thousands"],
    ["kevin-durant", "Kevin Durant", "Kevin Durant — four scoring titles with elite three-level touch", 98, "modern"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — ten scoring titles", 100, "eighties-nineties"],
    ["wilt-chamberlain", "Wilt Chamberlain", "Wilt Chamberlain — 50.4 points per game in 1961–62", 100, "classic"],
    ["shaq", "Shaquille O'Neal", "Shaquille O'Neal — unstoppable paint scoring in his prime", 97, "two-thousands"],
  ]),
  group("OUTSIDE SHOOTING", "shooting", [
    ["shaq", "Shaquille O'Neal", "Shaquille O'Neal — defenses did not fear the perimeter jumper", 3, "two-thousands"],
    ["ben-simmons", "Ben Simmons", "Ben Simmons — almost no three-point shooting threat", 6, "modern"],
    ["dennis-rodman", "Dennis Rodman", "Dennis Rodman — low-volume outside jumper", 13, "eighties-nineties"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — dominant downhill, inconsistent from deep", 31, "modern"],
    ["russell-westbrook", "Russell Westbrook", "Russell Westbrook — high-volume, inconsistent perimeter shooting", 40, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — dangerous scorer, not a pure-volume three-point sniper", 56, "modern"],
    ["demar-derozan", "DeMar DeRozan", "DeMar DeRozan — elite midrange, limited three-point volume", 59, "modern"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — efficient spot-up and pull-up jumper", 78, "modern"],
    ["dirk-nowitzki", "Dirk Nowitzki", "Dirk Nowitzki — elite shooting touch from a seven-footer", 90, "two-thousands"],
    ["peja-stojakovic", "Peja Stojaković", "Peja Stojaković — deep-range specialist and multi-time All-Star", 91, "two-thousands"],
    ["ray-allen", "Ray Allen", "Ray Allen — long-range shotmaking and huge career total", 96, "two-thousands"],
    ["reggie-miller", "Reggie Miller", "Reggie Miller — off-screen movement and big threes", 96, "eighties-nineties"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — 37-point quarter and quick-release threes", 97, "modern"],
    ["damian-lillard", "Damian Lillard", "Damian Lillard — deep pull-ups beyond the arc", 94, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — changed the geometry of the three-point line", 100, "modern"],
  ]),
  group("PLAYMAKING", "passing", [
    ["hassan-whiteside", "Hassan Whiteside", "Hassan Whiteside — finishing big, little passing creation", 8, "modern"],
    ["michael-porter-jr", "Michael Porter Jr.", "Michael Porter Jr. — more finisher than offensive initiator", 18, "modern"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — off-ball scoring over initiating assists", 25, "modern"],
    ["carmelo-anthony", "Carmelo Anthony", "Carmelo Anthony — isolation scoring over playmaking", 35, "two-thousands"],
    ["andrew-wiggins", "Andrew Wiggins", "Andrew Wiggins — secondary ball movement and wing scoring", 43, "modern"],
    ["bradley-beal", "Bradley Beal", "Bradley Beal — capable scoring-guard creation", 62, "modern"],
    ["jayson-tatum", "Jayson Tatum", "Jayson Tatum — evolved as a high-usage wing creator", 72, "modern"],
    ["draymond-green", "Draymond Green", "Draymond Green — elbow passing and short-roll decisions", 81, "modern"],
    ["chris-paul", "Chris Paul", "Chris Paul — assist-to-turnover control and pick-and-roll command", 94, "modern"],
    ["rajon-rondo", "Rajon Rondo", "Rajon Rondo — passing flair and multiple assist crowns", 91, "two-thousands"],
    ["steve-nash", "Steve Nash", "Steve Nash — orchestrated Phoenix's fast attacks", 97, "two-thousands"],
    ["jason-kidd", "Jason Kidd", "Jason Kidd — transition vision and assist production", 96, "two-thousands"],
    ["lebron-james", "LeBron James", "LeBron James — reads the entire floor from forward", 98, "modern"],
    ["nikola-jokic", "Nikola Jokić", "Nikola Jokić — center who runs an entire offense", 100, "modern"],
    ["magic-johnson", "Magic Johnson", "Magic Johnson — showtime transition passing and five titles", 100, "eighties-nineties"],
  ]),
  group("DEFENSIVE IMPACT", "defense", [
    ["trae-young", "Trae Young", "Trae Young — frequently targeted on defense", 8, "modern"],
    ["jordan-poole", "Jordan Poole", "Jordan Poole — offense-first guard with defensive limitations", 16, "modern"],
    ["lou-williams", "Lou Williams", "Lou Williams — bench scoring before defensive value", 26, "two-thousands"],
    ["steve-nash", "Steve Nash", "Steve Nash — elite offensive guard, not a stopper", 34, "two-thousands"],
    ["damian-lillard", "Damian Lillard", "Damian Lillard — tremendous offense with defensive trade-offs", 39, "modern"],
    ["demar-derozan", "DeMar DeRozan", "DeMar DeRozan — capable but not elite wing defense", 47, "modern"],
    ["andrew-wiggins", "Andrew Wiggins", "Andrew Wiggins — high-level defensive work in 2022 title run", 72, "modern"],
    ["mikal-bridges", "Mikal Bridges", "Mikal Bridges — long, disruptive perimeter wing", 79, "modern"],
    ["jrue-holiday", "Jrue Holiday", "Jrue Holiday — elite point-of-attack guard defender", 89, "modern"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — two Defensive Player of the Year awards", 94, "modern"],
    ["draymond-green", "Draymond Green", "Draymond Green — switchability and defensive quarterbacking", 94, "modern"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — sustained rim protection and elite positioning", 95, "two-thousands"],
    ["ben-wallace", "Ben Wallace", "Ben Wallace — four Defensive Player of the Year awards", 97, "two-thousands"],
    ["hakeem-olajuwon", "Hakeem Olajuwon", "Hakeem Olajuwon — elite shot blocking and mobility", 98, "eighties-nineties"],
    ["bill-russell", "Bill Russell", "Bill Russell — anchor of a historic defensive dynasty", 100, "classic"],
  ]),
  group("EXPLOSIVE ATHLETICISM", "explosion", [
    ["zach-randolph", "Zach Randolph", "Zach Randolph — crafty, ground-bound power game", 10, "two-thousands"],
    ["dirk-nowitzki", "Dirk Nowitzki", "Dirk Nowitzki — great footwork, not explosive leaping", 15, "two-thousands"],
    ["nikola-jokic", "Nikola Jokić", "Nikola Jokić — brilliant touch rather than vertical pop", 22, "modern"],
    ["luka-doncic", "Luka Dončić", "Luka Dončić — timing and deceleration over vertical explosion", 34, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — elite agility, average vertical power", 50, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — strong functional athleticism, measured explosiveness", 61, "modern"],
    ["paul-george", "Paul George", "Paul George — smooth open-court lift and burst", 78, "modern"],
    ["dwyane-wade", "Dwyane Wade", "Dwyane Wade — explosive first step and above-rim guard finishes", 88, "two-thousands"],
    ["derrick-rose", "Derrick Rose", "Derrick Rose — 2011 speed and above-rim guard finishing", 96, "two-thousands"],
    ["blake-griffin", "Blake Griffin", "Blake Griffin — Lob City rim attacks at his peak", 94, "modern"],
    ["ja-morant", "Ja Morant", "Ja Morant — extraordinary guard elevation in traffic", 94, "modern"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — coast-to-coast strides and rim force", 97, "modern"],
    ["vince-carter", "Vince Carter", "Vince Carter — legendary in-game dunks and leaping", 99, "two-thousands"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — hang time and explosive first step", 99, "eighties-nineties"],
    ["dominique-wilkins", "Dominique Wilkins", "Dominique Wilkins — relentless high-flying attacks", 98, "eighties-nineties"],
  ]),
  group("CLUTCH SHOTMAKING", "clutch", [
    ["ben-wallace", "Ben Wallace", "Ben Wallace — not a late-possession scoring option", 5, "two-thousands"],
    ["dennis-rodman", "Dennis Rodman", "Dennis Rodman — defensive and rebounding specialist", 9, "eighties-nineties"],
    ["rudy-gobert", "Rudy Gobert", "Rudy Gobert — finishes plays, not a pull-up closer", 17, "modern"],
    ["andre-drummond", "Andre Drummond", "Andre Drummond — not a designed late-clock shooter", 18, "modern"],
    ["aaron-gordon", "Aaron Gordon", "Aaron Gordon — valuable finisher, seldom final-shot creator", 40, "modern"],
    ["tyrese-maxey", "Tyrese Maxey", "Tyrese Maxey — dangerous late drives, developing closing résumé", 63, "modern"],
    ["jamal-murray", "Jamal Murray", "Jamal Murray — repeated high-pressure playoff jumpers", 82, "modern"],
    ["kyrie-irving", "Kyrie Irving", "Kyrie Irving — pivotal 2016 Finals Game 7 three", 94, "modern"],
    ["damian-lillard", "Damian Lillard", "Damian Lillard — iconic series-winning threes", 97, "modern"],
    ["reggie-miller", "Reggie Miller", "Reggie Miller — eight points in nine seconds at MSG", 97, "eighties-nineties"],
    ["ray-allen", "Ray Allen", "Ray Allen — 2013 Finals corner three", 94, "two-thousands"],
    ["kobe-bryant", "Kobe Bryant", "Kobe Bryant — difficult game-winners and fearless late volume", 96, "two-thousands"],
    ["lebron-james", "LeBron James", "LeBron James — many postseason buzzer-beaters", 96, "modern"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — 'The Shot' over Craig Ehlo and 1998 clincher", 100, "eighties-nineties"],
    ["robert-horry", "Robert Horry", "Robert Horry — reputation built on massive playoff shots", 98, "two-thousands"],
  ]),
  group("PLAYOFF RÉSUMÉ", "playoffs", [
    ["anthony-bennett", "Anthony Bennett", "Anthony Bennett — no meaningful postseason résumé", 3, "modern"],
    ["lamelo-ball", "LaMelo Ball", "LaMelo Ball — no playoff appearance through 2025", 8, "modern"],
    ["zach-lavine", "Zach LaVine", "Zach LaVine — limited postseason impact through 2025", 19, "modern"],
    ["demarcus-cousins", "DeMarcus Cousins", "DeMarcus Cousins — much weaker playoff résumé than regular-season peak", 28, "modern"],
    ["trae-young", "Trae Young", "Trae Young — memorable 2021 Eastern Conference finals run", 53, "modern"],
    ["chris-paul", "Chris Paul", "Chris Paul — multiple deep runs and a 2021 Finals trip", 71, "modern"],
    ["james-harden", "James Harden", "James Harden — long playoff career without a Finals title", 72, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — two Miami Finals trips", 82, "modern"],
    ["dirk-nowitzki", "Dirk Nowitzki", "Dirk Nowitzki — 2011 playoff championship breakthrough", 88, "two-thousands"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — two Finals MVPs with different teams", 92, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — four championships and 2022 Finals MVP", 96, "modern"],
    ["kobe-bryant", "Kobe Bryant", "Kobe Bryant — five NBA titles and two Finals MVPs", 97, "two-thousands"],
    ["lebron-james", "LeBron James", "LeBron James — ten Finals appearances and four titles", 98, "modern"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — six championships in six Finals appearances", 100, "eighties-nineties"],
    ["bill-russell", "Bill Russell", "Bill Russell — eleven NBA championships", 100, "classic"],
  ]),
  group("SHOWMANSHIP", "show", [
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — reserved on-court celebrations and an all-business style", 9, "modern"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — deliberately understated play and low-key celebrations", 14, "two-thousands"],
    ["jrue-holiday", "Jrue Holiday", "Jrue Holiday — quiet, no-frills two-way approach", 24, "modern"],
    ["demar-derozan", "DeMar DeRozan", "DeMar DeRozan — expressive footwork without a flashy public persona", 43, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — playoff theatrics, banter and dramatic shotmaking", 59, "modern"],
    ["dwyane-wade", "Dwyane Wade", "Dwyane Wade — acrobatic finishes and animated on-court celebrations", 72, "two-thousands"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — deep-three celebrations and his signature shimmy", 85, "modern"],
    ["jason-williams", "Jason Williams", "Jason Williams — behind-the-back and elbow-pass spectacle", 92, "two-thousands"],
    ["vince-carter", "Vince Carter", "Vince Carter — explosive dunk-contest showmanship carried into games", 95, "two-thousands"],
    ["magic-johnson", "Magic Johnson", "Magic Johnson — Showtime flair, no-look passes and infectious energy", 98, "eighties-nineties"],
    ["shaq", "Shaquille O'Neal", "Shaquille O'Neal — theatrical power dunks and crowd-working personality", 99, "two-thousands"],
  ]),
  group("VILLAIN REPUTATION", "villain", [
    ["boban-marjanovic", "Boban Marjanović", "Boban Marjanović — widely liked, friendly presence with little antagonist reputation", 6, "modern"],
    ["mike-conley", "Mike Conley", "Mike Conley — longtime sportsmanship reputation rather than on-court feuds", 11, "modern"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — stoic and respected, rarely cast as the opponent's villain", 18, "two-thousands"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — intense competitor but not known as a deliberate agitator", 27, "modern"],
    ["kobe-bryant", "Kobe Bryant", "Kobe Bryant — ruthless on-court swagger that opposing crowds loved to challenge", 57, "two-thousands"],
    ["rasheed-wallace", "Rasheed Wallace", "Rasheed Wallace — confrontational edge and famous technical-foul battles", 70, "two-thousands"],
    ["trae-young", "Trae Young", "Trae Young — embraced the Madison Square Garden antagonist role", 78, "modern"],
    ["patrick-beverley", "Patrick Beverley", "Patrick Beverley — relentless trash talk and deliberate defensive pestering", 85, "modern"],
    ["reggie-miller", "Reggie Miller", "Reggie Miller — taunting Knicks crowds and trading barbs with Spike Lee", 91, "eighties-nineties"],
    ["draymond-green", "Draymond Green", "Draymond Green — confrontations, technicals and an unmistakable antagonist role", 97, "modern"],
    ["bill-laimbeer", "Bill Laimbeer", "Bill Laimbeer — Bad Boys physicality made him an archetypal NBA villain", 100, "eighties-nineties"],
  ]),
  group("CULTURAL INFLUENCE", "culture", [
    ["rudy-gay", "Rudy Gay", "Rudy Gay — established NBA scorer without a defining influence on basketball culture", 9, "modern"],
    ["joe-johnson", "Joe Johnson", "Joe Johnson — respected isolation scorer with a relatively limited wider cultural imprint", 23, "two-thousands"],
    ["jamal-crawford", "Jamal Crawford", "Jamal Crawford — streetball-style handles and a cult following for four-point plays", 47, "two-thousands"],
    ["jason-williams", "Jason Williams", "Jason Williams — White Chocolate passing helped popularize flashy highlight basketball", 63, "two-thousands"],
    ["carmelo-anthony", "Carmelo Anthony", "Carmelo Anthony — signature isolation style and a recognizable off-court NBA identity", 73, "two-thousands"],
    ["jeremy-lin", "Jeremy Lin", "Jeremy Lin — Linsanity became a major Asian-American basketball cultural moment", 81, "modern"],
    ["vince-carter", "Vince Carter", "Vince Carter — iconic dunks helped shape a generation of young fans", 85, "two-thousands"],
    ["magic-johnson", "Magic Johnson", "Magic Johnson — Showtime helped make the NBA a major entertainment spectacle", 94, "eighties-nineties"],
    ["yao-ming", "Yao Ming", "Yao Ming — greatly expanded the NBA's cultural reach in China", 97, "two-thousands"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — transformed youth basketball aspirations with deep-range shooting", 98, "modern"],
    ["allen-iverson", "Allen Iverson", "Allen Iverson — fashion, braids and individual style profoundly shaped NBA culture", 99, "two-thousands"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — global sneaker culture and worldwide basketball identity", 100, "eighties-nineties"],
  ]),
  group("HOME-COURT HEAT", "crowd", [
    ["clippers-1990s", "Los Angeles Clippers (1990s Sports Arena)", "Los Angeles Clippers (1990s Sports Arena) — modest home buzz during long losing seasons", 22, "eighties-nineties"],
    ["nets-2002", "New Jersey Nets (2002–03 Meadowlands)", "New Jersey Nets (2002–03 Meadowlands) — Finals teams without the league's most feared crowd", 38, "two-thousands"],
    ["hawks-2015", "Atlanta Hawks (2015 playoffs)", "Atlanta Hawks (2015 playoffs) — lively crowds for a breakout top-seeded team", 46, "modern"],
    ["nets-brooklyn-early", "Brooklyn Nets (early Barclays Center era)", "Brooklyn Nets (early Barclays Center era) — new local identity still finding its home-court edge", 49, "modern"],
    ["mavericks-2011", "Dallas Mavericks (2011 title run)", "Dallas Mavericks (2011 title run) — raucous home support through a memorable Finals push", 76, "two-thousands"],
    ["heat-2013", "Miami Heat (2013 Finals)", "Miami Heat (2013 Finals) — loud, star-studded home games with enormous stakes", 79, "modern"],
    ["sixers-2019", "Philadelphia 76ers (2019 playoffs)", "Philadelphia 76ers (2019 playoffs) — hostile, high-pressure Philadelphia home crowd", 87, "modern"],
    ["celtics-garden", "Boston Celtics (TD Garden playoff nights)", "Boston Celtics (TD Garden playoff nights) — sustained, intense crowd pressure on visiting teams", 94, "modern"],
    ["thunder-2012", "Oklahoma City Thunder (2012 playoffs)", "Oklahoma City Thunder (2012 playoffs) — famously deafening atmosphere around a young Finals team", 96, "modern"],
    ["warriors-2015", "Golden State Warriors (2015 Oracle Arena)", "Golden State Warriors (2015 Oracle Arena) — Roaracle crowds at the height of the breakthrough", 99, "modern"],
    ["kings-2002", "Sacramento Kings (2002 ARCO Arena)", "Sacramento Kings (2002 ARCO Arena) — legendary cowbell-fueled playoff noise", 100, "two-thousands"],
  ]),
  group("RIVALRY HEAT", "rivalry", [
    ["hornets-pistons-2010s", "Charlotte Hornets vs Detroit Pistons (late 2010s)", "Charlotte Hornets vs Detroit Pistons (late 2010s) — regular opponents without a major historical feud", 3, "modern"],
    ["lakers-raptors-2010s", "Los Angeles Lakers vs Toronto Raptors (late 2010s)", "Los Angeles Lakers vs Toronto Raptors (late 2010s) — little sustained rivalry despite recognizable teams", 8, "modern"],
    ["magic-celtics-2009", "Orlando Magic vs Boston Celtics (2009–10 playoffs)", "Orlando Magic vs Boston Celtics (2009–10 playoffs) — two contentious postseason clashes without an enduring feud", 48, "two-thousands"],
    ["suns-mavs-2022", "Phoenix Suns vs Dallas Mavericks (2022 playoffs)", "Phoenix Suns vs Dallas Mavericks (2022 playoffs) — Game 7 humiliation sparked real short-term heat", 59, "modern"],
    ["heat-mavs-2006", "Miami Heat vs Dallas Mavericks (2006–11 Finals)", "Miami Heat vs Dallas Mavericks (2006–11 Finals) — championship rematches and years of lingering bitterness", 80, "two-thousands"],
    ["celtics-sixers", "Boston Celtics vs Philadelphia 76ers (historic)", "Boston Celtics vs Philadelphia 76ers (historic) — repeated postseason wars across multiple eras", 88, "classic"],
    ["knicks-pacers-1990s", "New York Knicks vs Indiana Pacers (1990s)", "New York Knicks vs Indiana Pacers (1990s) — Reggie Miller versus Madison Square Garden drama", 91, "eighties-nineties"],
    ["warriors-cavs-2015", "Golden State Warriors vs Cleveland Cavaliers (2015–18)", "Golden State Warriors vs Cleveland Cavaliers (2015–18) — four straight Finals and a defining 3–1 comeback", 94, "modern"],
    ["knicks-heat-1990s", "New York Knicks vs Miami Heat (1990s)", "New York Knicks vs Miami Heat (1990s) — physical playoff series and genuine mutual hostility", 96, "eighties-nineties"],
    ["bulls-pistons-1980s", "Chicago Bulls vs Detroit Pistons (late 1980s)", "Chicago Bulls vs Detroit Pistons (late 1980s) — Jordan Rules and bitter postseason battles", 99, "eighties-nineties"],
    ["celtics-lakers", "Boston Celtics vs Los Angeles Lakers (historic)", "Boston Celtics vs Los Angeles Lakers (historic) — the NBA's signature intergenerational rivalry", 100, "classic"],
  ]),
  group("BALL HANDLING", "handles", [
    ["rudy-gobert", "Rudy Gobert", "Rudy Gobert — mainly a screener and finisher, not a live-dribble creator", 6, "modern"],
    ["deandre-jordan", "DeAndre Jordan", "DeAndre Jordan — caught lobs rather than taking defenders off the dribble", 11, "modern"],
    ["andre-drummond", "Andre Drummond", "Andre Drummond — limited perimeter handle for a traditional center", 16, "modern"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — mostly quick catch-and-shoot actions rather than advanced dribbling", 33, "modern"],
    ["jaylen-brown", "Jaylen Brown", "Jaylen Brown — powerful downhill handle, but pressure has occasionally disrupted it", 53, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — measured drives using strength and reliable control", 62, "modern"],
    ["devin-booker", "Devin Booker", "Devin Booker — polished creation off the bounce as a scoring guard", 76, "modern"],
    ["jalen-brunson", "Jalen Brunson", "Jalen Brunson — tight footwork and ball protection in traffic", 87, "modern"],
    ["luka-doncic", "Luka Dončić", "Luka Dončić — changes pace to keep defenders off balance", 89, "modern"],
    ["chris-paul", "Chris Paul", "Chris Paul — elite handle and almost surgical control in pick-and-rolls", 94, "modern"],
    ["steve-nash", "Steve Nash", "Steve Nash — wove through defenses without losing his dribble", 95, "two-thousands"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — tight changes of direction into pull-up threes", 96, "modern"],
    ["jamal-crawford", "Jamal Crawford", "Jamal Crawford — signature shake-and-bake crossovers", 96, "two-thousands"],
    ["isiah-thomas", "Isiah Thomas", "Isiah Thomas — quick, creative handle through crowded 1980s defenses", 97, "eighties-nineties"],
    ["allen-iverson", "Allen Iverson", "Allen Iverson — iconic crossover and explosive dribble separation", 98, "two-thousands"],
    ["kyrie-irving", "Kyrie Irving", "Kyrie Irving — among the NBA's most intricate and controlled handles", 100, "modern"],
  ]),
  group("REBOUNDING", "boards", [
    ["trae-young", "Trae Young", "Trae Young — offense-first guard with limited rebounding impact", 9, "modern"],
    ["kyrie-irving", "Kyrie Irving", "Kyrie Irving — scoring guard who rarely controlled the glass", 19, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — contributed guard rebounds, not a major glass presence", 26, "modern"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — wing whose primary role rarely centered on boards", 29, "modern"],
    ["dwyane-wade", "Dwyane Wade", "Dwyane Wade — active rebounding for a shooting guard", 44, "two-thousands"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — physical wing who contributes timely rebounds", 52, "modern"],
    ["russell-westbrook", "Russell Westbrook", "Russell Westbrook — unusually aggressive guard rebounding in triple-double seasons", 77, "modern"],
    ["lebron-james", "LeBron James", "LeBron James — strong rebounding across multiple positions and eras", 80, "modern"],
    ["nikola-jokic", "Nikola Jokić", "Nikola Jokić — elite positioning and defensive rebound control", 92, "modern"],
    ["steven-adams", "Steven Adams", "Steven Adams — powerful box-outs and offensive rebound opportunities", 91, "modern"],
    ["kevin-love", "Kevin Love", "Kevin Love — huge Minnesota rebounding totals and outlet passes", 93, "modern"],
    ["andre-drummond", "Andre Drummond", "Andre Drummond — multiple rebounding titles and extraordinary volume", 95, "modern"],
    ["dwight-howard", "Dwight Howard", "Dwight Howard — five rebounding titles at his athletic peak", 96, "modern"],
    ["charles-barkley", "Charles Barkley", "Charles Barkley — relentless rebounding despite being undersized for a power forward", 98, "eighties-nineties"],
    ["dennis-rodman", "Dennis Rodman", "Dennis Rodman — seven straight rebounding titles and relentless positioning", 100, "eighties-nineties"],
    ["wilt-chamberlain", "Wilt Chamberlain", "Wilt Chamberlain — historic rebounding averages and totals", 100, "classic"],
  ]),
  group("RIM PROTECTION", "rim", [
    ["trae-young", "Trae Young", "Trae Young — undersized guard with little rim-protection role", 2, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — guard defense, not basket-level deterrence", 6, "modern"],
    ["james-harden", "James Harden", "James Harden — strong post resistance at times but not a shot-blocking anchor", 16, "modern"],
    ["demar-derozan", "DeMar DeRozan", "DeMar DeRozan — midrange offensive specialist, not a rim deterrent", 17, "modern"],
    ["jayson-tatum", "Jayson Tatum", "Jayson Tatum — helpful wing contests without anchoring the paint", 44, "modern"],
    ["aaron-gordon", "Aaron Gordon", "Aaron Gordon — athletic help defender, not a dedicated shot blocker", 55, "modern"],
    ["lebron-james", "LeBron James", "LeBron James — memorable chase-down blocks and timely help at his peak", 75, "modern"],
    ["myles-turner", "Myles Turner", "Myles Turner — repeated league-leading block totals", 89, "modern"],
    ["brook-lopez", "Brook Lopez", "Brook Lopez — elite drop-coverage rim deterrent in Milwaukee", 91, "modern"],
    ["jaren-jackson-jr", "Jaren Jackson Jr.", "Jaren Jackson Jr. — Defensive Player of the Year with explosive weak-side blocks", 93, "modern"],
    ["serge-ibaka", "Serge Ibaka", "Serge Ibaka — elite Thunder-era shot-blocking and weak-side contests", 95, "modern"],
    ["rudy-gobert", "Rudy Gobert", "Rudy Gobert — multiple Defensive Player of the Year awards as a paint anchor", 97, "modern"],
    ["dwight-howard", "Dwight Howard", "Dwight Howard — explosive three-time Defensive Player of the Year rim protection", 98, "modern"],
    ["ben-wallace", "Ben Wallace", "Ben Wallace — undersized center who anchored a championship defense", 98, "two-thousands"],
    ["dikembe-mutombo", "Dikembe Mutombo", "Dikembe Mutombo — four Defensive Player of the Year awards and signature blocks", 100, "eighties-nineties"],
    ["hakeem-olajuwon", "Hakeem Olajuwon", "Hakeem Olajuwon — all-time shot-blocking excellence with elite mobility", 100, "eighties-nineties"],
  ]),
  group("MIDRANGE TOUCH", "mid", [
    ["rudy-gobert", "Rudy Gobert", "Rudy Gobert — almost no offense built around midrange jumpers", 3, "modern"],
    ["deandre-jordan", "DeAndre Jordan", "DeAndre Jordan — dunk and lob specialist without a developed midrange jumper", 5, "modern"],
    ["ben-simmons", "Ben Simmons", "Ben Simmons — unwilling to take regular midrange jumpers", 12, "modern"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — dangerous downhill but uneven pull-up jumper", 27, "modern"],
    ["russell-westbrook", "Russell Westbrook", "Russell Westbrook — explosive drives, streaky pull-up midrange scoring", 42, "modern"],
    ["pascal-siakam", "Pascal Siakam", "Pascal Siakam — developed face-up midrange scoring and turnaround touch", 64, "modern"],
    ["brandon-ingram", "Brandon Ingram", "Brandon Ingram — consistent long-armed pull-up midrange shotmaker", 81, "modern"],
    ["jalen-brunson", "Jalen Brunson", "Jalen Brunson — footwork, stops and pivots into short jumpers", 87, "modern"],
    ["chris-paul", "Chris Paul", "Chris Paul — repeatedly punishes drop coverage from the elbows", 93, "modern"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — precise pull-ups and turnaround twos in playoff settings", 95, "modern"],
    ["devin-booker", "Devin Booker", "Devin Booker — modern star with a polished midrange scoring arsenal", 95, "modern"],
    ["demar-derozan", "DeMar DeRozan", "DeMar DeRozan — prolific free-throw-line and elbow shotmaking", 97, "modern"],
    ["dirk-nowitzki", "Dirk Nowitzki", "Dirk Nowitzki — near-unguardable one-legged fadeaway from midrange", 98, "two-thousands"],
    ["kevin-durant", "Kevin Durant", "Kevin Durant — towering, near-uncontestable pull-up jumper", 99, "modern"],
    ["kobe-bryant", "Kobe Bryant", "Kobe Bryant — signature contested fadeaways from the elbows", 99, "two-thousands"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — devastating late-career post-ups and turnaround jumpers", 100, "eighties-nineties"],
  ]),
  group("AT-THE-RIM FINISHING", "finish", [
    ["seth-curry", "Seth Curry", "Seth Curry — best known for shooting, not traffic finishes at the basket", 18, "modern"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — catch-and-shoot specialist with limited rim volume", 27, "modern"],
    ["trae-young", "Trae Young", "Trae Young — floaters compensate for difficulty finishing through size", 43, "modern"],
    ["bradley-beal", "Bradley Beal", "Bradley Beal — skilled driving guard without historic finishing volume", 64, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — creative touch and high-angle layups through traffic", 80, "modern"],
    ["tony-parker", "Tony Parker", "Tony Parker — famous teardrop floater and quick paint scoring", 86, "two-thousands"],
    ["russell-westbrook", "Russell Westbrook", "Russell Westbrook — ferocious downhill attacks, with some touch limitations", 87, "modern"],
    ["anthony-edwards", "Anthony Edwards", "Anthony Edwards — powerful acrobatic finishes above NBA defenders", 88, "modern"],
    ["ja-morant", "Ja Morant", "Ja Morant — fearless high-flying drives and acrobatic rim attacks", 92, "modern"],
    ["kyrie-irving", "Kyrie Irving", "Kyrie Irving — remarkable layup package with either hand", 94, "modern"],
    ["zion-williamson", "Zion Williamson", "Zion Williamson — overwhelming paint efficiency through strength and touch", 96, "modern"],
    ["dwyane-wade", "Dwyane Wade", "Dwyane Wade — repeated explosive slashes and elite craft at the basket", 96, "two-thousands"],
    ["charles-barkley", "Charles Barkley", "Charles Barkley — relentless power finishes through bigger defenders", 96, "eighties-nineties"],
    ["lebron-james", "LeBron James", "LeBron James — size, speed and touch at the rim in his athletic prime", 99, "modern"],
    ["shaq", "Shaquille O'Neal", "Shaquille O'Neal — overpowering deep catches and dunks", 100, "two-thousands"],
    ["giannis-antetokounmpo", "Giannis Antetokounmpo", "Giannis Antetokounmpo — length and strides make paint finishes almost unavoidable", 100, "modern"],
  ]),
  group("BASKETBALL IQ", "iq", [
    ["nick-young", "Nick Young", "Nick Young — infamous premature celebration on a missed three, alongside a shoot-first approach", 24, "modern"],
    ["jordan-poole", "Jordan Poole", "Jordan Poole — risky shot selection and turnovers despite scoring creativity", 32, "modern"],
    ["jr-smith", "J.R. Smith", "J.R. Smith — occasional costly late-game decisions despite elite scoring instincts", 40, "two-thousands"],
    ["kelly-oubre-jr", "Kelly Oubre Jr.", "Kelly Oubre Jr. — athletic scoring wing with a sometimes narrow offensive read", 45, "modern"],
    ["andre-drummond", "Andre Drummond", "Andre Drummond — rebounding specialist rather than an offense-organizing center", 49, "modern"],
    ["rudy-gobert", "Rudy Gobert", "Rudy Gobert — disciplined defensive positioning, less offensive decision-making range", 62, "modern"],
    ["klay-thompson", "Klay Thompson", "Klay Thompson — excellent off-ball reads, simpler passing decisions", 75, "modern"],
    ["derrick-white", "Derrick White", "Derrick White — smart rotations, quick reads and low-maintenance offense", 88, "modern"],
    ["tyrese-haliburton", "Tyrese Haliburton", "Tyrese Haliburton — anticipatory reads and high-level assist-to-turnover play", 92, "modern"],
    ["luka-doncic", "Luka Dončić", "Luka Dončić — manipulates help defenders and spots openings ahead of time", 94, "modern"],
    ["john-stockton", "John Stockton", "John Stockton — precise reads and disciplined pick-and-roll control", 96, "eighties-nineties"],
    ["rajon-rondo", "Rajon Rondo", "Rajon Rondo — read opponents' sets and organized playoff possessions", 97, "modern"],
    ["draymond-green", "Draymond Green", "Draymond Green — pre-rotations and split-second short-roll passing reads", 98, "modern"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — pristine positioning and consistently correct decisions", 99, "two-thousands"],
    ["chris-paul", "Chris Paul", "Chris Paul — meticulous game control and mismatch recognition", 100, "modern"],
    ["lebron-james", "LeBron James", "LeBron James — elite anticipation and the ability to read entire defenses", 100, "modern"],
  ]),
  group("TRASH TALK", "talk", [
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — quiet demeanor with little public on-court verbal sparring", 4, "modern"],
    ["mike-conley", "Mike Conley", "Mike Conley — sportsmanlike reputation with limited trash-talk persona", 9, "modern"],
    ["jrue-holiday", "Jrue Holiday", "Jrue Holiday — lets his defense do most of the talking", 15, "modern"],
    ["tim-duncan", "Tim Duncan", "Tim Duncan — low-volume, often understated competitive comments", 27, "two-thousands"],
    ["khris-middleton", "Khris Middleton", "Khris Middleton — reserved on-court presence despite big playoff moments", 30, "modern"],
    ["steph-curry", "Stephen Curry", "Stephen Curry — shimmy celebrations and occasional opponents' bench exchanges", 62, "modern"],
    ["anthony-edwards", "Anthony Edwards", "Anthony Edwards — playful but confident jawing at defenders", 75, "modern"],
    ["kevin-durant", "Kevin Durant", "Kevin Durant — frequent back-and-forth with opponents on the court", 77, "modern"],
    ["dillon-brooks", "Dillon Brooks", "Dillon Brooks — attention-grabbing opponent callouts and verbal feuds", 85, "modern"],
    ["draymond-green", "Draymond Green", "Draymond Green — nonstop arguing, needling and verbal confrontations", 92, "modern"],
    ["patrick-beverley", "Patrick Beverley", "Patrick Beverley — relentless chatter aimed at rattling scorers", 93, "modern"],
    ["reggie-miller", "Reggie Miller", "Reggie Miller — animated Knicks taunts, including exchanges with Spike Lee", 96, "eighties-nineties"],
    ["gary-payton", "Gary Payton", "Gary Payton — famous for nonstop jawing while guarding opposing stars", 99, "eighties-nineties"],
    ["michael-jordan", "Michael Jordan", "Michael Jordan — used pointed verbal challenges to fuel his matchups", 98, "eighties-nineties"],
    ["kevin-garnett", "Kevin Garnett", "Kevin Garnett — famous nonstop verbal intimidation on defense", 100, "two-thousands"],
    ["larry-bird", "Larry Bird", "Larry Bird — famously predicted and taunted opponents before big shots", 100, "classic"],
  ]),
  group("NBA MOMENT IMPACT", "moment", [
    ["rose-50-2018", "Derrick Rose's 50-point game (2018)", "Derrick Rose's 50-point game (2018) — emotional Minnesota comeback performance", 65, "modern"],
    ["lebron-toronto-2018", "LeBron James' Toronto fadeaways (2018)", "LeBron James' Toronto fadeaways (2018) — memorable playoff scoring against the Raptors", 76, "modern"],
    ["deandre-brandon-knight", "DeAndre Jordan's dunk over Brandon Knight (2013)", "DeAndre Jordan's dunk over Brandon Knight (2013) — viral lob finish", 78, "modern"],
    ["jeremy-lin-linsanity", "Jeremy Lin's Linsanity winner (2012)", "Jeremy Lin's Linsanity winner (2012) — late Toronto three capped a breakout run", 81, "modern"],
    ["jr-smith-clock", "J.R. Smith's 2018 Finals clock mistake", "J.R. Smith's 2018 Finals clock mistake — dribbled out the tie game without a shot", 85, "modern"],
    ["klay-37", "Klay Thompson's 37-point quarter (2015)", "Klay Thompson's 37-point quarter (2015) — an entire quarter without a missed field goal", 89, "modern"],
    ["ben-simmons-pass", "Ben Simmons' passed-up dunk (2021 playoffs)", "Ben Simmons' passed-up dunk (2021 playoffs) — defining decision during Philadelphia's collapse", 87, "modern"],
    ["curry-okc-2016", "Stephen Curry's OKC double-bang three (2016)", "Stephen Curry's OKC double-bang three (2016) — astonishing overtime winner from deep", 94, "modern"],
    ["lillard-wave", "Damian Lillard's wave goodbye (2019)", "Damian Lillard's wave goodbye (2019) — series-clinching deep three against Oklahoma City", 94, "modern"],
    ["vince-dunk-2000", "Vince Carter's 2000 dunk contest", "Vince Carter's 2000 dunk contest — the famous arm-in-rim and reverse dunks", 97, "two-thousands"],
    ["reggie-8-in-9", "Reggie Miller's 8 points in 9 seconds (1995)", "Reggie Miller's 8 points in 9 seconds (1995) — stunning Knicks comeback", 98, "eighties-nineties"],
    ["magic-center-1980", "Magic Johnson's Game 6 at center (1980 Finals)", "Magic Johnson's Game 6 at center (1980 Finals) — rookie title-clinching performance", 98, "classic"],
    ["kobe-81", "Kobe Bryant's 81-point night (2006)", "Kobe Bryant's 81-point night (2006) — historic outburst against Toronto", 99, "two-thousands"],
    ["kawhi-bounce", "Kawhi Leonard's four-bounce winner (2019)", "Kawhi Leonard's four-bounce winner (2019) — Game 7 buzzer beater against Philadelphia", 100, "modern"],
    ["ray-allen-shot", "Ray Allen's corner three (2013 Finals)", "Ray Allen's corner three (2013 Finals) — tied Game 6 and saved Miami's title bid", 100, "modern"],
    ["lebron-block", "LeBron James' chase-down block (2016 Finals)", "LeBron James' chase-down block (2016 Finals) — iconic Game 7 stop on Andre Iguodala", 100, "modern"],
    ["wemby-debut", "Victor Wembanyama's NBA debut (2023)", "Victor Wembanyama's NBA debut (2023) — first regular-season game against Dallas", 28, "modern"],
    ["lebron-debut", "LeBron James' NBA debut (2003)", "LeBron James' NBA debut (2003) — enormous spotlight on an 18-year-old in Sacramento", 48, "two-thousands"],
    ["first-in-season", "Lakers' first In-Season Tournament title (2023)", "Lakers' first In-Season Tournament title (2023) — a notable start to the new NBA event", 54, "modern"],
    ["booker-70", "Devin Booker's 70-point game (2017)", "Devin Booker's 70-point game (2017) — historic individual output in a Phoenix loss", 57, "modern"],
    ["wemby-five-by-five", "Victor Wembanyama's five-by-five (2024)", "Victor Wembanyama's five-by-five (2024) — rare rookie stat line with five each in five categories", 59, "modern"],
    ["curry-allstar", "Stephen Curry's 16 All-Star threes (2022)", "Stephen Curry's 16 All-Star threes (2022) — extraordinary shooting in an exhibition showcase", 61, "modern"],
    ["jordan-last-shot", "Michael Jordan's final Bulls shot (1998 Finals)", "Michael Jordan's final Bulls shot (1998 Finals) — championship-clinching jumper over Bryon Russell", 100, "eighties-nineties"],
  ]),
  group("FRANCHISE TRADITION", "franchise", [
    ["pelicans", "New Orleans Pelicans", "New Orleans Pelicans — comparatively young identity and limited deep playoff history", 9, "modern"],
    ["hornets", "Charlotte Hornets", "Charlotte Hornets — recognizable branding but few deep postseason runs", 16, "modern"],
    ["timberwolves", "Minnesota Timberwolves", "Minnesota Timberwolves — Garnett era and later resurgence, fewer historic titles", 23, "modern"],
    ["grizzlies", "Memphis Grizzlies", "Memphis Grizzlies — Grit and Grind built a strong modern identity", 29, "modern"],
    ["magic", "Orlando Magic", "Orlando Magic — Shaq, Penny and Dwight led memorable Finals-era teams", 42, "modern"],
    ["clippers", "Los Angeles Clippers", "Los Angeles Clippers — long struggle followed by Lob City and modern contenders", 43, "modern"],
    ["nets", "Brooklyn / New Jersey Nets", "Brooklyn / New Jersey Nets — ABA roots and two NBA Finals runs before Brooklyn", 51, "modern"],
    ["raptors", "Toronto Raptors", "Toronto Raptors — Canadian fanbase and the 2019 championship", 56, "modern"],
    ["cavaliers", "Cleveland Cavaliers", "Cleveland Cavaliers — LeBron era and the historic 2016 championship", 64, "modern"],
    ["nuggets", "Denver Nuggets", "Denver Nuggets — ABA roots, altitude identity and the 2023 championship", 67, "modern"],
    ["kings", "Sacramento Kings", "Sacramento Kings — Rochester title history and passionate early-2000s Sacramento teams", 69, "two-thousands"],
    ["mavericks", "Dallas Mavericks", "Dallas Mavericks — Dirk era and landmark 2011 championship", 74, "modern"],
    ["bucks", "Milwaukee Bucks", "Milwaukee Bucks — Kareem and Giannis eras with multiple title teams", 82, "modern"],
    ["rockets", "Houston Rockets", "Houston Rockets — Olajuwon back-to-back titles and several star eras", 84, "two-thousands"],
    ["pistons", "Detroit Pistons", "Detroit Pistons — Bad Boys and the 2004 title cemented tough-minded tradition", 86, "eighties-nineties"],
    ["heat", "Miami Heat", "Miami Heat — three championships under the Wade and LeBron eras", 87, "modern"],
    ["knicks", "New York Knicks", "New York Knicks — Madison Square Garden identity and decades of basketball history", 90, "eighties-nineties"],
    ["sixers", "Philadelphia 76ers", "Philadelphia 76ers — Wilt, Dr. J and Iverson across generations", 92, "classic"],
    ["spurs", "San Antonio Spurs", "San Antonio Spurs — five championships and enduring Duncan-Popovich culture", 94, "two-thousands"],
    ["bulls", "Chicago Bulls", "Chicago Bulls — six Jordan-era titles became a worldwide basketball identity", 97, "eighties-nineties"],
    ["warriors", "Golden State Warriors", "Golden State Warriors — original league roots and a modern dynasty", 98, "modern"],
    ["lakers", "Los Angeles Lakers", "Los Angeles Lakers — generations of champions from Mikan and Magic to Kobe and LeBron", 100, "classic"],
    ["celtics", "Boston Celtics", "Boston Celtics — Russell, Bird and modern championship eras", 100, "classic"],
  ]),
  group("DRAFT HYPE", "hype", [
    ["ben-wallace", "Ben Wallace", "Ben Wallace — undrafted in 1996 with little national draft buzz", 3, "two-thousands"],
    ["jeremy-lin", "Jeremy Lin", "Jeremy Lin — undrafted Harvard guard without major NBA draft hype", 5, "modern"],
    ["jimmy-butler", "Jimmy Butler", "Jimmy Butler — late first-round Marquette pick without superstar expectations", 16, "modern"],
    ["draymond-green", "Draymond Green", "Draymond Green — second-round Michigan State pick with limited lottery buzz", 22, "modern"],
    ["kawhi-leonard", "Kawhi Leonard", "Kawhi Leonard — well-regarded 2011 first-round prospect, not marketed as a sure superstar", 38, "modern"],
    ["donovan-mitchell", "Donovan Mitchell", "Donovan Mitchell — rising 2017 lottery guard, not a consensus top prospect", 44, "modern"],
    ["cj-mccollum", "CJ McCollum", "CJ McCollum — high-upside Lehigh scorer selected in the 2013 lottery", 53, "modern"],
    ["derrick-williams", "Derrick Williams", "Derrick Williams — high 2011 lottery expectations after Arizona stardom", 69, "modern"],
    ["anthony-bennett", "Anthony Bennett", "Anthony Bennett — surprise No. 1 selection with less consensus hype than other top picks", 62, "modern"],
    ["lamelo-ball", "LaMelo Ball", "LaMelo Ball — years of viral highlights and public anticipation before 2020 draft", 86, "modern"],
    ["yao-ming", "Yao Ming", "Yao Ming — enormous global interest as the 2002 No. 1 pick", 92, "two-thousands"],
    ["andrew-wiggins", "Andrew Wiggins", "Andrew Wiggins — 'Maple Jordan' expectations before his 2014 draft", 94, "modern"],
    ["greg-oden", "Greg Oden", "Greg Oden — consensus top-pick anticipation after dominating at Ohio State", 96, "modern"],
    ["anthony-davis", "Anthony Davis", "Anthony Davis — national-title big man seen as an elite 2012 prospect", 97, "modern"],
    ["zion-williamson", "Zion Williamson", "Zion Williamson — viral athletic phenomenon and near-universal 2019 No. 1 expectation", 99, "modern"],
    ["lebron-james", "LeBron James", "LeBron James — unprecedented high-school-to-NBA expectations", 100, "modern"],
    ["victor-wembanyama", "Victor Wembanyama", "Victor Wembanyama — described as a generational prospect before the 2023 draft", 100, "modern"],
  ]),
  group("DUO IMPACT", "duo", [
    ["lebron-westbrook", "LeBron James and Russell Westbrook (2021–23 Lakers)", "LeBron James and Russell Westbrook (2021–23 Lakers) — big expectations but awkward offensive fit", 21, "modern"],
    ["kobe-dwight", "Kobe Bryant and Dwight Howard (2012–13 Lakers)", "Kobe Bryant and Dwight Howard (2012–13 Lakers) — star pairing hurt by chemistry and injuries", 34, "modern"],
    ["harden-dwight", "James Harden and Dwight Howard (2013–16 Rockets)", "James Harden and Dwight Howard (2013–16 Rockets) — reached the West finals amid tensions", 62, "modern"],
    ["durant-kyrie", "Kevin Durant and Kyrie Irving (2020–22 Nets)", "Kevin Durant and Kyrie Irving (2020–22 Nets) — spectacular talent without a sustained deep run", 64, "modern"],
    ["embiid-harden", "Joel Embiid and James Harden (2022–23 76ers)", "Joel Embiid and James Harden (2022–23 76ers) — elite regular-season creation without conference-finals breakthrough", 67, "modern"],
    ["kobe-pau", "Kobe Bryant and Pau Gasol (2008–10 Lakers)", "Kobe Bryant and Pau Gasol (2008–10 Lakers) — three Finals and two straight championships", 93, "two-thousands"],
    ["giannis-middleton", "Giannis Antetokounmpo and Khris Middleton (2021 Bucks)", "Giannis Antetokounmpo and Khris Middleton (2021 Bucks) — key championship partnership", 87, "modern"],
    ["luka-kyrie", "Luka Dončić and Kyrie Irving (2024 Mavericks)", "Luka Dončić and Kyrie Irving (2024 Mavericks) — dynamic offensive pairing in a Finals run", 88, "modern"],
    ["jokic-murray", "Nikola Jokić and Jamal Murray (2023 Nuggets)", "Nikola Jokić and Jamal Murray (2023 Nuggets) — devastating pick-and-roll partnership on a title run", 93, "modern"],
    ["tatum-brown", "Jayson Tatum and Jaylen Brown (2024 Celtics)", "Jayson Tatum and Jaylen Brown (2024 Celtics) — two-way wings who won the NBA title together", 93, "modern"],
    ["nash-amare", "Steve Nash and Amar'e Stoudemire (2004–10 Suns)", "Steve Nash and Amar'e Stoudemire (2004–10 Suns) — electrifying Seven Seconds or Less pick-and-roll", 91, "two-thousands"],
    ["stockton-malone", "John Stockton and Karl Malone (1990s Jazz)", "John Stockton and Karl Malone (1990s Jazz) — enduring pick-and-roll duo with two Finals trips", 96, "eighties-nineties"],
    ["duncan-parker", "Tim Duncan and Tony Parker (2000s Spurs)", "Tim Duncan and Tony Parker (2000s Spurs) — core of multiple Spurs championships", 95, "two-thousands"],
    ["lebron-kyrie", "LeBron James and Kyrie Irving (2016 Cavaliers)", "LeBron James and Kyrie Irving (2016 Cavaliers) — complementary shot creation in a historic title comeback", 96, "modern"],
    ["lebron-wade", "LeBron James and Dwyane Wade (2012–13 Heat)", "LeBron James and Dwyane Wade (2012–13 Heat) — transition terror and consecutive championships", 98, "modern"],
    ["curry-klay", "Stephen Curry and Klay Thompson (2015–19 Warriors)", "Stephen Curry and Klay Thompson (2015–19 Warriors) — Splash Brothers spacing drove a dynasty", 99, "modern"],
    ["curry-durant", "Stephen Curry and Kevin Durant (2017–19 Warriors)", "Stephen Curry and Kevin Durant (2017–19 Warriors) — historically difficult duo to guard", 99, "modern"],
    ["jordan-pippen", "Michael Jordan and Scottie Pippen (1990s Bulls)", "Michael Jordan and Scottie Pippen (1990s Bulls) — six championships and defining two-way partnership", 100, "eighties-nineties"],
    ["shaq-kobe", "Shaquille O'Neal and Kobe Bryant (2000–02 Lakers)", "Shaquille O'Neal and Kobe Bryant (2000–02 Lakers) — three straight titles with overpowering complementary offense", 100, "two-thousands"],
  ]),
];


/**
 * One literal rating target per clue, matching the UFC/Football presentation.
 * Low numbers mean little strength on that POSITIVE attribute, never "very
 * unwilling" or "very bad". The contextual editorial notes stay separate.
 *
 * The category is already part of the final reveal, but the playing text
 * names it too, so a player never has to decode a second question below.
 */
const NBA_WAVELENGTH_POSITIVE_ATTRIBUTE: Record<NbaWavelengthCategory, string> = {
  "CAREER LEGACY": "NBA career legacy",
  "PEAK DOMINANCE": "dominance at his NBA peak",
  "SCORING THREAT": "NBA scoring ability",
  "OUTSIDE SHOOTING": "outside shooting ability",
  "PLAYMAKING": "NBA playmaking",
  "DEFENSIVE IMPACT": "NBA defensive impact",
  "EXPLOSIVE ATHLETICISM": "NBA explosiveness",
  "CLUTCH SHOTMAKING": "late-game shotmaking",
  "PLAYOFF RÉSUMÉ": "NBA playoff résumé",
  "SHOWMANSHIP": "on-court showmanship",
  "VILLAIN REPUTATION": "NBA villain reputation",
  "CULTURAL INFLUENCE": "influence on basketball culture",
  "HOME-COURT HEAT": "home-crowd atmosphere",
  "RIVALRY HEAT": "rivalry intensity",
  "BALL HANDLING": "ball-handling ability",
  "REBOUNDING": "NBA rebounding",
  "RIM PROTECTION": "rim protection",
  "MIDRANGE TOUCH": "midrange shooting ability",
  "AT-THE-RIM FINISHING": "finishing at the rim",
  "BASKETBALL IQ": "basketball decision-making",
  "TRASH TALK": "on-court trash talk",
  "NBA MOMENT IMPACT": "lasting impact on NBA history",
  "FRANCHISE TRADITION": "NBA franchise tradition",
  "DRAFT HYPE": "hype before the NBA draft",
  "DUO IMPACT": "impact as an NBA duo",
};

// Events, teams, and named rivalries are kept exactly identified, including
// their season/era, with a single attributed dimension instead of a second
// lower explanatory question.
const NBA_WAVELENGTH_NONPERSON_CATEGORIES: ReadonlySet<NbaWavelengthCategory> = new Set([
  "HOME-COURT HEAT",
  "RIVALRY HEAT",
  "NBA MOMENT IMPACT",
  "FRANCHISE TRADITION",
  "DUO IMPACT",
]);

export function nbaWavelengthCluePrompt(
  category: NbaWavelengthCategory,
  subject: string,
): string {
  const attribute = NBA_WAVELENGTH_POSITIVE_ATTRIBUTE[category];
  if (NBA_WAVELENGTH_NONPERSON_CATEGORIES.has(category)) {
    return subject + " — " + attribute;
  }
  const possessive = subject.endsWith("s") ? subject + "'" : subject + "'s";
  return possessive + " " + attribute;
}

export const nbaWavelengthClues: readonly NbaWavelengthCatalogClue[] = groups.flatMap(
  ({ category, prefix, rows }) => rows.map(([slug, subject, editorialNote, rating, era]) => ({
    id: "nba-wl-" + prefix + "-" + slug,
    subject,
    category,
    text: nbaWavelengthCluePrompt(category, subject),
    editorialNote,
    rating,
    era,
  })),
);

export function nbaWavelengthTier(rating: number): NbaWavelengthTier {
  return (NBA_WAVELENGTH_BANDS.find(band => rating >= band.min && rating <= band.max)?.tier ?? "middle") as NbaWavelengthTier;
}
export function nbaWavelengthClueDescriptor(category: string) {
  return NBA_WAVELENGTH_CATEGORY_ANCHORS.find(anchor => anchor.category === category)?.question
    ?? "Place this NBA reference on the HQ basketball scale.";
}
export function nbaWavelengthCategoryLabel(category: string) {
  return category;
}
