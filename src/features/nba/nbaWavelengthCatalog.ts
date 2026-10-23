/**
 * Editorial NBA Wavelength calibration bank. This is a comparison SCALE, not
 * a Who Am I question bank or a statistical ranker. Each row is rated only for
 * its named attribute; cultural and rivalry judgments are editorial opinions,
 * not substitutes for skill ratings. Stable NBA-era reference points intentionally include weak,
 * ordinary, strong, elite and iconic examples. No projected 2026 performance.
 */
export const NBA_WAVELENGTH_CATALOG_VERSION = "nba-wavelength-catalog-v1" as const;
export const NBA_WAVELENGTH_CALIBRATION_VERSION = "nba-wavelength-calibration-v1" as const;

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
  | "RIVALRY HEAT";
export type NbaWavelengthEra = "classic" | "eighties-nineties" | "two-thousands" | "modern";
export type NbaWavelengthTier = "low" | "developing" | "middle" | "strong" | "elite" | "iconic";

export interface NbaWavelengthCatalogClue {
  id: string;
  subject: string;
  category: NbaWavelengthCategory;
  text: string;
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
 * The wording carries the trait's evidence or limitation: do NOT blindly apply
 * an overall GOAT tier to shooting, passing, defense or playoff performance.
 * Subject identities are canonical across categories so a round cannot show
 * the same person twice under different traits.
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
];

export const nbaWavelengthClues: readonly NbaWavelengthCatalogClue[] = groups.flatMap(
  ({ category, prefix, rows }) => rows.map(([slug, subject, text, rating, era]) => ({
    id: "nba-wl-" + prefix + "-" + slug,
    subject,
    category,
    text,
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
