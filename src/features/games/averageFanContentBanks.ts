import { queryFootballSubjects, type FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { ufcFactualLedgerSubjects, type UfcFactualSubject } from "../back-room/ufcFactualLedger";
import { stableLineupHash } from "../play/lineupModel";
import {
  AVERAGE_FAN_SUBJECTS,
  assertAverageFanQuestion,
  type AverageFanGrade,
  type AverageFanQuestion,
  type AverageFanSport,
  type AverageFanSubject,
} from "./averageFanEngine";

export const AVERAGE_FAN_BANK_TARGETS = {
  nfl: 220,
  cfb: 220,
  ufc: 440,
} as const;

export const AVERAGE_FAN_FINAL_TARGETS = {
  nfl: 15,
  cfb: 15,
  ufc: 30,
} as const;

const FOOTBALL_GRADE_TARGETS: Record<AverageFanGrade, number> = {
  1: 40,
  2: 40,
  3: 40,
  4: 40,
  5: 45,
};

const UFC_GRADE_TARGETS: Record<AverageFanGrade, number> = {
  1: 80,
  2: 80,
  3: 80,
  4: 80,
  5: 90,
};

const NFL_TEAM_NAMES: Readonly<Record<string, string>> = {
  ARI: "Arizona Cardinals", ATL: "Atlanta Falcons", BAL: "Baltimore Ravens", BUF: "Buffalo Bills",
  CAR: "Carolina Panthers", CHI: "Chicago Bears", CIN: "Cincinnati Bengals", CLE: "Cleveland Browns",
  DAL: "Dallas Cowboys", DEN: "Denver Broncos", DET: "Detroit Lions", GB: "Green Bay Packers",
  HOU: "Houston Texans", IND: "Indianapolis Colts", JAX: "Jacksonville Jaguars", KC: "Kansas City Chiefs",
  LAC: "Los Angeles Chargers", LAR: "Los Angeles Rams", LV: "Las Vegas Raiders", MIA: "Miami Dolphins",
  MIN: "Minnesota Vikings", NE: "New England Patriots", NO: "New Orleans Saints", NYG: "New York Giants",
  NYJ: "New York Jets", PHI: "Philadelphia Eagles", PIT: "Pittsburgh Steelers", SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers", TEN: "Tennessee Titans", WAS: "Washington Commanders",
};

const FOOTBALL_POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "K", "P"] as const;

function unique(values: readonly string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function stableOffset(key: string, length: number) {
  return length ? stableLineupHash(key) % length : 0;
}

function normalizeAcceptedValue(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function peerValues(
  values: readonly string[],
  acceptedAnswers: string | readonly string[],
  key: string,
  count = 2,
) {
  const accepted = new Set(
    (typeof acceptedAnswers === "string" ? [acceptedAnswers] : acceptedAnswers)
      .map(normalizeAcceptedValue),
  );
  const pool = unique(values)
    .filter((value) => !accepted.has(normalizeAcceptedValue(value)))
    .sort();
  if (pool.length < count) {
    throw new Error(`Average Fan content bank does not have enough peers for ${key}.`);
  }
  const start = stableOffset(key, pool.length);
  const picked: string[] = [];
  for (let step = 0; picked.length < count && step < pool.length * 2; step += 1) {
    const value = pool[(start + step) % pool.length]!;
    if (!picked.includes(value)) picked.push(value);
  }
  return picked;
}

function aliasesForNumber(value: number) {
  return [String(value), `No. ${value}`, `#${value}`];
}

function numericMisses(value: number, candidates: readonly number[]) {
  const answer = String(value);
  const misses = unique(candidates.map((candidate) => String(candidate)))
    .filter((candidate) => candidate !== answer);
  if (misses.length < 2) {
    for (let delta = 1; misses.length < 2; delta += 1) {
      const candidate = String(value + delta);
      if (candidate !== answer && !misses.includes(candidate)) misses.push(candidate);
    }
  }
  return misses.slice(0, 2);
}

function shortQuestion(seed: {
  id: string;
  sport: AverageFanSport;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  prompt: string;
  answer: string;
  aliases?: readonly string[];
  explanation: string;
  fanMisses: readonly string[];
  difficultyNudge?: number;
  protectedFinal?: boolean;
}) {
  return assertAverageFanQuestion({
    ...seed,
    aliases: seed.aliases ?? [],
    format: "short-answer",
    contentType: "evergreen",
    difficultyNudge: seed.difficultyNudge ?? 0,
    fanMisses: seed.fanMisses.slice(0, 3),
    protectedFinal: seed.protectedFinal ?? false,
  });
}

function choiceQuestion(seed: {
  id: string;
  sport: AverageFanSport;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  prompt: string;
  answer: string;
  aliases?: readonly string[];
  wrongChoices: readonly string[];
  explanation: string;
  difficultyNudge?: number;
  protectedFinal?: boolean;
}) {
  const wrong = unique(seed.wrongChoices).filter((choice) => choice !== seed.answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error(`Average Fan choice question ${seed.id} needs two wrong choices.`);
  return assertAverageFanQuestion({
    id: seed.id,
    sport: seed.sport,
    grade: seed.grade,
    subject: seed.subject,
    format: "three-choice",
    prompt: seed.prompt,
    answer: seed.answer,
    aliases: seed.aliases ?? [],
    choices: [seed.answer, wrong[0]!, wrong[1]!] as [string, string, string],
    explanation: seed.explanation,
    contentType: "evergreen",
    difficultyNudge: seed.difficultyNudge ?? 0,
    protectedFinal: seed.protectedFinal ?? false,
  });
}

function trueFalseQuestion(seed: {
  id: string;
  sport: AverageFanSport;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  prompt: string;
  answer: boolean;
  explanation: string;
  difficultyNudge?: number;
}) {
  return assertAverageFanQuestion({
    id: seed.id,
    sport: seed.sport,
    grade: seed.grade,
    subject: seed.subject,
    format: "true-false",
    prompt: seed.prompt,
    answer: seed.answer ? "True" : "False",
    aliases: [],
    explanation: seed.explanation,
    contentType: "evergreen",
    difficultyNudge: seed.difficultyNudge ?? 0,
    protectedFinal: false,
  });
}

type KnowledgeFact = {
  id: string;
  grade: AverageFanGrade;
  prompt: string;
  answer: string;
  wrong: readonly [string, string];
  explanation: string;
};

type NflTrueFalseFact = {
  id: string;
  grade: AverageFanGrade;
  subject: "Players" | "Teams" | "NFL History" | "X’s & O’s";
  prompt: string;
  answer: boolean;
  explanation: string;
};

const NFL_XO_FACTS: readonly KnowledgeFact[] = [
  { id: "center-snap", grade: 1, prompt: "Which position normally snaps the ball to begin an offensive play?", answer: "Center", wrong: ["Guard", "Tight end"], explanation: "The center snaps the football to the quarterback or another back to start the play." },
  { id: "nickel", grade: 1, prompt: "What nickname is used for a defense with five defensive backs?", answer: "Nickel", wrong: ["Dime", "Goal line"], explanation: "Nickel personnel uses five defensive backs." },
  { id: "dime", grade: 2, prompt: "What nickname is used for a defense with six defensive backs?", answer: "Dime", wrong: ["Nickel", "Bear"], explanation: "Dime personnel uses six defensive backs." },
  { id: "blitz", grade: 1, prompt: "What is it called when a defense sends extra rushers after the quarterback?", answer: "Blitz", wrong: ["Spy", "Contain"], explanation: "A blitz commits additional defenders to the pass rush." },
  { id: "play-action", grade: 2, prompt: "What play concept begins with a fake handoff before the quarterback attempts a pass?", answer: "Play action", wrong: ["Screen pass", "Draw"], explanation: "Play action uses a run fake to influence defenders before a pass." },
  { id: "shotgun", grade: 1, prompt: "What formation places the quarterback several yards behind the center for the snap?", answer: "Shotgun", wrong: ["I formation", "Goal line"], explanation: "In shotgun, the quarterback receives a longer snap while aligned behind the center." },
  { id: "screen", grade: 3, prompt: "What pass concept commonly lets the rush come upfield before throwing short to a receiver with blockers in front?", answer: "Screen pass", wrong: ["Fade", "Hail Mary"], explanation: "A screen invites pressure and then releases the ball short behind the rush." },
  { id: "draw", grade: 3, prompt: "What run concept initially looks like a pass before the ball carrier takes the handoff?", answer: "Draw", wrong: ["Counter", "Jet sweep"], explanation: "A draw play sells pass before developing as a run." },
  { id: "rpo", grade: 2, prompt: "What does RPO stand for in football?", answer: "Run-pass option", wrong: ["Reverse-pass option", "Run-protection order"], explanation: "RPO stands for run-pass option." },
  { id: "cover-2", grade: 3, prompt: "How many deep defenders are responsible for the primary deep halves in a basic Cover 2 shell?", answer: "2", wrong: ["1", "3"], explanation: "Cover 2 divides the deep field primarily between two safeties." },
  { id: "cover-3", grade: 3, prompt: "How many primary deep zones are used in a basic Cover 3?", answer: "3", wrong: ["2", "4"], explanation: "Cover 3 divides the deep field into three zones." },
  { id: "cover-4", grade: 4, prompt: "What common coverage nickname is also used for Cover 4?", answer: "Quarters", wrong: ["Cloud", "Robber"], explanation: "Cover 4 is commonly called quarters because four defenders divide the deep field." },
  { id: "qb-spy", grade: 4, prompt: "What defensive assignment designates a player to track a mobile quarterback?", answer: "Quarterback spy", wrong: ["Bracket", "Contain rush"], explanation: "A quarterback spy mirrors the quarterback rather than immediately committing elsewhere." },
  { id: "slot", grade: 2, prompt: "Where does a slot receiver typically align?", answer: "Inside the outside receiver", wrong: ["Behind the quarterback", "On the defensive line"], explanation: "The slot is the space inside an outside receiver and outside the offensive line." },
  { id: "edge-rusher", grade: 2, prompt: "Which defender is primarily associated with rushing from the outside edge of the formation?", answer: "Edge rusher", wrong: ["Free safety", "Center"], explanation: "Edge rushers attack from the outside of the offensive front." },
  { id: "mike", grade: 3, prompt: "In common defensive terminology, what does the “Mike” usually identify?", answer: "Middle linebacker", wrong: ["Nickel corner", "Strong safety"], explanation: "Mike is a common label for the middle linebacker." },
  { id: "safety-score", grade: 1, prompt: "How many points is a safety worth?", answer: "2", wrong: ["1", "3"], explanation: "A safety scores two points for the defense." },
  { id: "turnover-on-downs", grade: 1, prompt: "What happens when an offense fails to convert on fourth down and the play does not otherwise change possession?", answer: "Turnover on downs", wrong: ["Automatic punt", "Replay fourth down"], explanation: "The opponent takes possession at the dead-ball spot after a failed fourth-down attempt." },
  { id: "false-start", grade: 2, prompt: "How many yards is the standard penalty for a false start?", answer: "5", wrong: ["10", "15"], explanation: "A false start is a five-yard penalty." },
  { id: "offensive-holding", grade: 3, prompt: "How many yards is the standard NFL penalty for offensive holding?", answer: "10", wrong: ["5", "15"], explanation: "Offensive holding normally carries a 10-yard penalty in the NFL." },
  { id: "11-personnel", grade: 5, prompt: "What personnel grouping uses one running back and one tight end?", answer: "11 personnel", wrong: ["12 personnel", "21 personnel"], explanation: "The first digit counts running backs and the second counts tight ends: 11 personnel uses one of each." },
  { id: "12-personnel", grade: 5, prompt: "What personnel grouping uses one running back and two tight ends?", answer: "12 personnel", wrong: ["11 personnel", "22 personnel"], explanation: "12 personnel uses one running back and two tight ends." },
  { id: "trips", grade: 5, prompt: "What formation term describes three eligible receivers aligned to the same side?", answer: "Trips", wrong: ["Twins", "Empty"], explanation: "Trips commonly describes a three-receiver surface to one side." },
  { id: "mesh", grade: 5, prompt: "Which passing concept is built around shallow crossing routes that pass close to one another?", answer: "Mesh", wrong: ["Four verts", "Smash"], explanation: "Mesh uses intersecting shallow crossers to stress man and zone coverage." },
  { id: "flood", grade: 5, prompt: "Which passing concept commonly stretches one side of a zone defense at multiple depths?", answer: "Flood", wrong: ["Dagger", "Wham"], explanation: "Flood places receivers at different levels on the same side to high-low zone defenders." },
  { id: "zone-blitz", grade: 5, prompt: "What pressure concept can send a linebacker or defensive back while dropping a defensive lineman into coverage?", answer: "Zone blitz", wrong: ["Prevent defense", "Cover zero"], explanation: "A zone blitz exchanges rush and coverage responsibilities while keeping zone structure behind the pressure." },
  { id: "touchdown-points", grade: 1, prompt: "How many points is a touchdown worth before the try?", answer: "6", wrong: ["3", "7"], explanation: "A touchdown is worth six points before the extra-point or two-point try." },
  { id: "field-goal-points", grade: 1, prompt: "How many points is a successful field goal worth?", answer: "3", wrong: ["2", "6"], explanation: "A successful field goal scores three points." },
  { id: "kneel", grade: 1, prompt: "What play is commonly used by an offense to safely run out the clock at the end of a game?", answer: "Quarterback kneel", wrong: ["Hail Mary", "Onside kick"], explanation: "A quarterback kneel is commonly used to drain the remaining clock safely." },
  { id: "spike", grade: 1, prompt: "What does a quarterback commonly do immediately after the snap to stop the clock?", answer: "Spike the ball", wrong: ["Take a knee", "Throw a screen"], explanation: "An immediate spike is a legal incomplete forward pass used to stop the clock." },

  { id: "audible", grade: 2, prompt: "What is an audible?", answer: "A play change at the line of scrimmage", wrong: ["A defensive substitution", "A replay challenge"], explanation: "An audible changes the called play or assignment before the snap." },
  { id: "hard-count", grade: 2, prompt: "What is a hard count designed to make the defense do?", answer: "Jump early", wrong: ["Call timeout", "Drop into zone"], explanation: "A hard count varies the quarterback's cadence to try to draw defenders offside." },
  { id: "motion", grade: 2, prompt: "What is pre-snap motion?", answer: "An eligible player moving before the snap", wrong: ["The quarterback scrambling", "A lineman pulling after the snap"], explanation: "Pre-snap motion sends an eligible player across or around the formation before the ball is snapped." },
  { id: "checkdown", grade: 2, prompt: "What is a checkdown in the passing game?", answer: "A short outlet option", wrong: ["A deep post route", "A quarterback sneak"], explanation: "A checkdown is a shorter outlet target used when deeper reads are unavailable." },

  { id: "bootleg", grade: 3, prompt: "What quarterback action usually defines a bootleg?", answer: "Rolling away from the run fake", wrong: ["Taking a straight drop", "Pitching an option immediately"], explanation: "A bootleg moves the quarterback outside after selling action in another direction." },
  { id: "jet-sweep", grade: 3, prompt: "Which run concept gives or pitches the ball to a receiver already moving across the formation at the snap?", answer: "Jet sweep", wrong: ["Quarterback sneak", "Power dive"], explanation: "A jet sweep uses fast horizontal motion to get the ball carrier to the edge." },
  { id: "bunch", grade: 3, prompt: "What formation term describes three receivers aligned close together?", answer: "Bunch", wrong: ["Empty", "Wishbone"], explanation: "A bunch set clusters multiple receivers tightly to create traffic and leverage." },
  { id: "press", grade: 3, prompt: "What coverage technique places a defensive back tight to a receiver at the line of scrimmage?", answer: "Press coverage", wrong: ["Off coverage", "Prevent coverage"], explanation: "Press coverage challenges a receiver at or near the line of scrimmage." },

  { id: "bracket", grade: 4, prompt: "What does bracket coverage usually mean?", answer: "Two defenders combining on one receiver", wrong: ["A seven-man blitz", "A four-deep zone"], explanation: "Bracket coverage uses two defenders to constrain one receiving threat." },
  { id: "robber", grade: 4, prompt: "What does a 'robber' defender typically do in coverage?", answer: "Drops into an intermediate zone to jump routes", wrong: ["Rushes off the edge every snap", "Plays a deep outside quarter"], explanation: "A robber defender reads the quarterback and looks to cut off intermediate throws." },
  { id: "stunt", grade: 4, prompt: "What is a defensive-line stunt or twist?", answer: "Rushers exchanging paths after the snap", wrong: ["Safeties swapping deep halves", "Receivers switching sides before the snap"], explanation: "A stunt has pass rushers cross or exchange gaps to stress protection rules." },
  { id: "contain", grade: 4, prompt: "What is the main goal of edge contain?", answer: "Keep the ball carrier or quarterback from escaping outside", wrong: ["Force every play up the middle before the snap", "Double-team the slot receiver"], explanation: "Contain protects the outside edge and turns the play back toward pursuit." },
  { id: "inside-zone", grade: 4, prompt: "What run concept asks blockers to work zone combinations while the back reads interior gaps?", answer: "Inside zone", wrong: ["Jet sweep", "Quarterback draw"], explanation: "Inside zone uses zone blocking with the runner reading the interior flow." },
  { id: "outside-zone", grade: 4, prompt: "What run concept stretches the defense laterally while the back reads for a cut?", answer: "Outside zone", wrong: ["Power", "Trap"], explanation: "Outside zone creates horizontal stretch before the runner chooses a crease." },
  { id: "hot-route", grade: 4, prompt: "What is a hot route?", answer: "A quick answer built into a pass play against pressure", wrong: ["A deep route run only from the slot", "A route used only in the red zone"], explanation: "A hot route gives the quarterback and receiver a fast response to an unblocked or extra rusher." },
  { id: "leverage", grade: 4, prompt: "In coverage, what does inside or outside leverage describe?", answer: "A defender's alignment relative to the receiver", wrong: ["The offensive line's snap count", "The punt returner's depth"], explanation: "Leverage describes where a defender positions himself relative to a receiver and the space he wants to deny." },

  { id: "wham", grade: 5, prompt: "What blocking concept uses a tight end or back to trap an interior defensive lineman from the side?", answer: "Wham", wrong: ["Outside zone", "Reach block"], explanation: "A wham block lets an interior defender penetrate before a tight end or back blocks him from an unexpected angle." },
  { id: "scrape-exchange", grade: 5, prompt: "What option-defense exchange has an edge defender crash inside while a linebacker replaces him outside?", answer: "Scrape exchange", wrong: ["Zone blitz", "Bracket coverage"], explanation: "A scrape exchange changes the usual option responsibilities by having the linebacker replace the crashing edge defender." },
  { id: "smash", grade: 5, prompt: "Which passing concept commonly pairs a short hitch with a corner route on the same side?", answer: "Smash", wrong: ["Mesh", "Four verts"], explanation: "Smash stresses a cornerback with a short route underneath and a corner route over the top." },
  { id: "dagger", grade: 5, prompt: "Which passing concept commonly pairs a vertical clear-out with a deep in-breaking route behind it?", answer: "Dagger", wrong: ["Flood", "Wham"], explanation: "Dagger uses a vertical route to clear space for a deep dig or in-breaker." },
  { id: "power", grade: 5, prompt: "Which classic run scheme usually features a pulling backside guard leading through the point of attack?", answer: "Power", wrong: ["Outside zone", "Draw"], explanation: "Power football traditionally uses down blocks plus a pulling guard through the designed gap." },
];

const NFL_TRUE_FALSE_FACTS: readonly NflTrueFalseFact[] = [
  { id: "four-downs", grade: 1, subject: "X’s & O’s", prompt: "An NFL offense normally gets four downs to gain 10 yards for a new first down.", answer: true, explanation: "The offense normally has four downs to gain the 10 yards needed for a new series." },
  { id: "deion-two-champs", grade: 2, subject: "Players", prompt: "Deion Sanders won Super Bowls with both the 49ers and Cowboys.", answer: true, explanation: "Deion Sanders won Super Bowl XXIX with San Francisco and Super Bowl XXX with Dallas." },
  { id: "peyton-two-teams", grade: 3, subject: "Players", prompt: "Peyton Manning won Super Bowls as the starting quarterback for two different franchises.", answer: true, explanation: "Manning won Super Bowl XLI with Indianapolis and Super Bowl 50 with Denver." },
  { id: "two-forward-passes", grade: 4, subject: "X’s & O’s", prompt: "An offense can throw two forward passes on the same play as long as both are released behind the line of scrimmage.", answer: false, explanation: "An NFL play can include only one forward pass." },
  { id: "fourth-down-fumble", grade: 5, subject: "X’s & O’s", prompt: "On fourth down, an offensive teammate may recover a fumble but cannot advance it beyond the spot of the fumble.", answer: true, explanation: "On fourth down, only the player who fumbled may recover and advance his own fumble; a teammate's recovery returns the ball to the fumble spot." },
];

const NFL_PLAYER_FACTS: readonly KnowledgeFact[] = [
  { id: "beast-mode", grade: 1, prompt: "Which running back is famously nicknamed 'Beast Mode'?", answer: "Marshawn Lynch", wrong: ["Adrian Peterson", "LeSean McCoy"], explanation: "Marshawn Lynch became famous under the Beast Mode nickname." },
  { id: "megatron", grade: 1, prompt: "Which Lions wide receiver is famously nicknamed 'Megatron'?", answer: "Calvin Johnson", wrong: ["Julio Jones", "Larry Fitzgerald"], explanation: "Calvin Johnson became one of Detroit's defining stars under the Megatron nickname." },
  { id: "gronk", grade: 1, prompt: "Which dominant tight end became universally known as 'Gronk'?", answer: "Rob Gronkowski", wrong: ["Travis Kelce", "Tony Gonzalez"], explanation: "Rob Gronkowski became one of the NFL's most recognizable tight ends under the Gronk nickname." },
  { id: "sweetness", grade: 1, prompt: "Which Hall of Fame running back was nicknamed 'Sweetness'?", answer: "Walter Payton", wrong: ["Barry Sanders", "Emmitt Smith"], explanation: "Chicago Bears legend Walter Payton was famously nicknamed Sweetness." },
  { id: "prime-time", grade: 1, prompt: "Which Hall of Fame defensive back was nicknamed 'Prime Time'?", answer: "Deion Sanders", wrong: ["Darrell Green", "Rod Woodson"], explanation: "Deion Sanders built his football persona around the Prime Time nickname." },
  { id: "sheriff", grade: 1, prompt: "Which quarterback was widely nicknamed 'The Sheriff'?", answer: "Peyton Manning", wrong: ["Brett Favre", "Drew Brees"], explanation: "Peyton Manning was widely known as The Sheriff." },

  { id: "lamar-mvp", grade: 2, prompt: "Which Ravens quarterback won the 2019 NFL MVP award?", answer: "Lamar Jackson", wrong: ["Patrick Mahomes", "Josh Allen"], explanation: "Lamar Jackson won the 2019 NFL MVP award in his second season." },
  { id: "mahomes-mvp", grade: 2, prompt: "Which Chiefs quarterback won NFL MVP in the 2018 season?", answer: "Patrick Mahomes", wrong: ["Tom Brady", "Drew Brees"], explanation: "Patrick Mahomes won the 2018 NFL MVP award after his first season as Kansas City's full-time starter." },
  { id: "henry-2020", grade: 2, prompt: "Which running back rushed for more than 2,000 yards in the 2020 season?", answer: "Derrick Henry", wrong: ["Dalvin Cook", "Nick Chubb"], explanation: "Derrick Henry rushed for 2,027 yards in 2020." },
  { id: "moss-23", grade: 2, prompt: "Which receiver caught 23 touchdown passes in the 2007 season?", answer: "Randy Moss", wrong: ["Terrell Owens", "Marvin Harrison"], explanation: "Randy Moss caught 23 touchdown passes for New England in 2007." },
  { id: "brady-50", grade: 2, prompt: "Which quarterback became the first to throw 50 touchdown passes in one NFL season?", answer: "Tom Brady", wrong: ["Peyton Manning", "Dan Marino"], explanation: "Tom Brady threw 50 touchdown passes in 2007." },
  { id: "revis-island", grade: 2, prompt: "Which shutdown cornerback became synonymous with the nickname 'Revis Island'?", answer: "Darrelle Revis", wrong: ["Champ Bailey", "Richard Sherman"], explanation: "Darrelle Revis' man-coverage reputation inspired the Revis Island nickname." },

  { id: "brady-199", grade: 3, prompt: "Which quarterback was selected 199th overall in the 2000 NFL Draft?", answer: "Tom Brady", wrong: ["Drew Brees", "Kurt Warner"], explanation: "New England selected Tom Brady with pick No. 199 in the 2000 NFL Draft." },
  { id: "rodgers-24", grade: 3, prompt: "Which future Packers MVP slid to No. 24 overall in the 2005 NFL Draft?", answer: "Aaron Rodgers", wrong: ["Alex Smith", "Jason Campbell"], explanation: "Green Bay selected Aaron Rodgers 24th overall in 2005." },
  { id: "emmitt-record", grade: 3, prompt: "Who finished his career with an NFL-record 18,355 rushing yards?", answer: "Emmitt Smith", wrong: ["Walter Payton", "Barry Sanders"], explanation: "Emmitt Smith finished his career with 18,355 rushing yards." },
  { id: "rice-record", grade: 3, prompt: "Who finished his career with an NFL-record 22,895 receiving yards?", answer: "Jerry Rice", wrong: ["Larry Fitzgerald", "Terrell Owens"], explanation: "Jerry Rice finished his career with 22,895 receiving yards." },
  { id: "dickerson-2105", grade: 3, prompt: "Who rushed for 2,105 yards in the 1984 season?", answer: "Eric Dickerson", wrong: ["Adrian Peterson", "Barry Sanders"], explanation: "Eric Dickerson rushed for 2,105 yards in 1984." },
  { id: "josh-allen-2024-mvp", grade: 3, prompt: "Which Bills quarterback won the AP NFL MVP award for the 2024 season?", answer: "Josh Allen", wrong: ["Lamar Jackson", "Joe Burrow"], explanation: "Josh Allen was named AP NFL MVP for the 2024 season." },

  { id: "oj-2000", grade: 4, prompt: "Who became the NFL's first 2,000-yard rusher in 1973?", answer: "O. J. Simpson", wrong: ["Eric Dickerson", "Jim Brown"], explanation: "O. J. Simpson rushed for 2,003 yards in 1973." },
  { id: "van-brocklin-554", grade: 4, prompt: "Who threw for 554 yards in a 1951 game, setting the NFL single-game passing record?", answer: "Norm Van Brocklin", wrong: ["Y. A. Tittle", "Otto Graham"], explanation: "Norm Van Brocklin threw for 554 yards in 1951." },
  { id: "rice-sb23", grade: 4, prompt: "Who had 215 receiving yards and won MVP in Super Bowl XXIII?", answer: "Jerry Rice", wrong: ["John Taylor", "Cris Collinsworth"], explanation: "Jerry Rice caught 11 passes for 215 yards and won Super Bowl XXIII MVP." },
  { id: "saquon-2005", grade: 4, prompt: "Which running back rushed for 2,005 yards in the 2024 regular season?", answer: "Saquon Barkley", wrong: ["Derrick Henry", "Jahmyr Gibbs"], explanation: "Saquon Barkley rushed for 2,005 yards for Philadelphia in the 2024 regular season." },
  { id: "peyton-55", grade: 4, prompt: "Which quarterback threw 55 touchdown passes in the 2013 season?", answer: "Peyton Manning", wrong: ["Tom Brady", "Drew Brees"], explanation: "Peyton Manning threw 55 touchdown passes for Denver in 2013." },
  { id: "marino-5000", grade: 4, prompt: "Which quarterback became the first NFL player to pass for 5,000 yards in a season?", answer: "Dan Marino", wrong: ["Dan Fouts", "Warren Moon"], explanation: "Dan Marino passed for 5,084 yards in 1984." },

  { id: "warner-414", grade: 5, prompt: "Which quarterback threw for 414 yards in Super Bowl XXXIV?", answer: "Kurt Warner", wrong: ["Steve McNair", "Brett Favre"], explanation: "Kurt Warner threw for 414 yards in the Rams' Super Bowl XXXIV victory." },
  { id: "emmitt-double-mvp", grade: 5, prompt: "Who won both NFL MVP and Super Bowl XXVIII MVP for the 1993 season?", answer: "Emmitt Smith", wrong: ["Troy Aikman", "Steve Young"], explanation: "Emmitt Smith won the 1993 NFL MVP award and Super Bowl XXVIII MVP." },
  { id: "rice-22-td", grade: 5, prompt: "Which receiver caught 22 touchdown passes during the strike-shortened 1987 season?", answer: "Jerry Rice", wrong: ["Sterling Sharpe", "Mark Clayton"], explanation: "Jerry Rice caught 22 touchdown passes in 1987." },
  { id: "tomlinson-31", grade: 5, prompt: "Which running back scored 31 rushing-and-receiving touchdowns in the 2006 season?", answer: "LaDainian Tomlinson", wrong: ["Shaun Alexander", "Priest Holmes"], explanation: "LaDainian Tomlinson scored 28 rushing and three receiving touchdowns in 2006." },
  { id: "hurts-sb59", grade: 5, prompt: "Which quarterback won Super Bowl LIX MVP after rushing for 72 yards against Kansas City?", answer: "Jalen Hurts", wrong: ["Patrick Mahomes", "Saquon Barkley"], explanation: "Jalen Hurts won Super Bowl LIX MVP and rushed for 72 yards in Philadelphia's win." },
  { id: "dickerson-rookie", grade: 5, prompt: "Which running back rushed for 1,808 yards as a rookie in 1983?", answer: "Eric Dickerson", wrong: ["Earl Campbell", "Barry Sanders"], explanation: "Eric Dickerson rushed for 1,808 yards in his 1983 rookie season." },
];

const NFL_TEAM_FACTS: readonly KnowledgeFact[] = [
  { id: "lambeau", grade: 1, prompt: "Which NFL team plays its home games at Lambeau Field?", answer: "Green Bay Packers", wrong: ["Chicago Bears", "Minnesota Vikings"], explanation: "Lambeau Field is the longtime home of the Green Bay Packers." },
  { id: "arrowhead", grade: 1, prompt: "Which NFL team plays at Arrowhead Stadium?", answer: "Kansas City Chiefs", wrong: ["Denver Broncos", "Las Vegas Raiders"], explanation: "Arrowhead Stadium is the home of the Kansas City Chiefs." },
  { id: "terrible-towel", grade: 1, prompt: "Which NFL team is famous for the Terrible Towel?", answer: "Pittsburgh Steelers", wrong: ["Cleveland Browns", "Baltimore Ravens"], explanation: "The Terrible Towel is one of the Pittsburgh Steelers' signature traditions." },
  { id: "who-dat", grade: 1, prompt: "Which NFL team is associated with the 'Who Dat?' chant?", answer: "New Orleans Saints", wrong: ["Atlanta Falcons", "Carolina Panthers"], explanation: "Who Dat is a signature New Orleans Saints chant." },
  { id: "dawg-pound", grade: 1, prompt: "Which fan base is associated with the 'Dawg Pound'?", answer: "Cleveland Browns", wrong: ["Cincinnati Bengals", "Detroit Lions"], explanation: "The Dawg Pound is a famous Cleveland Browns fan identity." },

  { id: "steel-curtain", grade: 2, prompt: "The 'Steel Curtain' defense is associated with which franchise?", answer: "Pittsburgh Steelers", wrong: ["Dallas Cowboys", "Miami Dolphins"], explanation: "The Steel Curtain was the nickname of Pittsburgh's dominant 1970s defense." },
  { id: "legion-boom", grade: 2, prompt: "The 'Legion of Boom' secondary belonged to which team?", answer: "Seattle Seahawks", wrong: ["San Francisco 49ers", "Denver Broncos"], explanation: "Seattle's championship-era secondary was nicknamed the Legion of Boom." },
  { id: "purple-people-eaters", grade: 2, prompt: "The 'Purple People Eaters' defensive line belonged to which franchise?", answer: "Minnesota Vikings", wrong: ["Detroit Lions", "Baltimore Colts"], explanation: "Minnesota's feared defensive front was known as the Purple People Eaters." },
  { id: "greatest-show", grade: 2, prompt: "The 'Greatest Show on Turf' nickname belongs to which team era?", answer: "St. Louis Rams", wrong: ["Indianapolis Colts", "Minnesota Vikings"], explanation: "The high-powered St. Louis Rams offense became known as the Greatest Show on Turf." },
  { id: "monsters-midway", grade: 2, prompt: "Which franchise is historically known as the 'Monsters of the Midway'?", answer: "Chicago Bears", wrong: ["Green Bay Packers", "New York Giants"], explanation: "The Monsters of the Midway nickname is historically tied to the Chicago Bears." },

  { id: "orange-crush", grade: 3, prompt: "The 'Orange Crush' defense is associated with which franchise?", answer: "Denver Broncos", wrong: ["Cleveland Browns", "Cincinnati Bengals"], explanation: "Denver's celebrated late-1970s defense was known as the Orange Crush." },
  { id: "hogs", grade: 3, prompt: "The offensive line nicknamed 'The Hogs' is associated with which franchise?", answer: "Washington", wrong: ["Dallas Cowboys", "New York Giants"], explanation: "Washington's dominant offensive line of the 1980s and early 1990s was known as The Hogs." },
  { id: "doomsday", grade: 3, prompt: "The 'Doomsday Defense' nickname is most associated with which franchise?", answer: "Dallas Cowboys", wrong: ["Miami Dolphins", "Pittsburgh Steelers"], explanation: "Doomsday Defense became a defining nickname for Dallas' championship-era defenses." },
  { id: "sacksonville", grade: 3, prompt: "Which team had a 2017 defense nicknamed 'Sacksonville'?", answer: "Jacksonville Jaguars", wrong: ["Tennessee Titans", "Carolina Panthers"], explanation: "Jacksonville's 2017 defense became known as Sacksonville." },
  { id: "no-fly-zone", grade: 3, prompt: "The 'No Fly Zone' secondary was a signature of which mid-2010s team?", answer: "Denver Broncos", wrong: ["Seattle Seahawks", "Baltimore Ravens"], explanation: "Denver's championship-era secondary in the mid-2010s was nicknamed the No Fly Zone." },

  { id: "broncos-back-to-back", grade: 4, prompt: "Which franchise won back-to-back Super Bowls XXXII and XXXIII?", answer: "Denver Broncos", wrong: ["Green Bay Packers", "Dallas Cowboys"], explanation: "Denver won consecutive championships after the 1997 and 1998 seasons." },
  { id: "cowboys-three-four", grade: 4, prompt: "Which team won three Super Bowls in four seasons during the 1990s?", answer: "Dallas Cowboys", wrong: ["San Francisco 49ers", "Buffalo Bills"], explanation: "Dallas won Super Bowls XXVII, XXVIII, and XXX." },
  { id: "ravens-2000", grade: 4, prompt: "Which franchise won Super Bowl XXXV behind its famous 2000 defense?", answer: "Baltimore Ravens", wrong: ["Tennessee Titans", "New York Giants"], explanation: "Baltimore's dominant 2000 defense helped carry the Ravens to the Super Bowl XXXV title." },
  { id: "bears-only-loss", grade: 4, prompt: "Which team handed the 1985 Bears their only regular-season loss?", answer: "Miami Dolphins", wrong: ["Green Bay Packers", "New York Giants"], explanation: "Miami defeated Chicago on Monday Night Football for the Bears' only regular-season loss in 1985." },
  { id: "eagles-lix", grade: 4, prompt: "Which franchise stopped Kansas City from winning a third straight championship by winning Super Bowl LIX?", answer: "Philadelphia Eagles", wrong: ["Buffalo Bills", "San Francisco 49ers"], explanation: "Philadelphia beat Kansas City 40-22 in Super Bowl LIX." },

  { id: "bills-four-straight", grade: 5, prompt: "Which franchise reached four consecutive Super Bowls from the 1990 through 1993 seasons?", answer: "Buffalo Bills", wrong: ["Denver Broncos", "Minnesota Vikings"], explanation: "Buffalo became the first and only franchise to appear in four straight Super Bowls." },
  { id: "vikings-four-losses", grade: 5, prompt: "Which franchise reached four Super Bowls in the 1970s but lost all four?", answer: "Minnesota Vikings", wrong: ["Miami Dolphins", "Oakland Raiders"], explanation: "Minnesota reached Super Bowls IV, VIII, IX, and XI and lost each one." },
  { id: "broncos-three-losses", grade: 5, prompt: "Which franchise lost Super Bowls XXI, XXII, and XXIV before later winning back-to-back titles?", answer: "Denver Broncos", wrong: ["Buffalo Bills", "Minnesota Vikings"], explanation: "Denver lost three Super Bowls in four seasons before winning consecutive titles in the late 1990s." },
  { id: "chiefs-title-gap", grade: 5, prompt: "Which franchise ended a 50-season championship drought by winning Super Bowl LIV?", answer: "Kansas City Chiefs", wrong: ["San Francisco 49ers", "Philadelphia Eagles"], explanation: "Kansas City won Super Bowl LIV, its first Super Bowl championship since Super Bowl IV." },
  { id: "niners-five-zero", grade: 5, prompt: "Which franchise won each of its first five Super Bowl appearances?", answer: "San Francisco 49ers", wrong: ["Dallas Cowboys", "Pittsburgh Steelers"], explanation: "San Francisco started 5-0 in Super Bowls." },
];

const NFL_HISTORY_FACTS: readonly KnowledgeFact[] = [
  { id: "sb1", grade: 1, prompt: "Which team won the first Super Bowl?", answer: "Green Bay Packers", wrong: ["Kansas City Chiefs", "Dallas Cowboys"], explanation: "Green Bay beat Kansas City 35-10 in the first Super Bowl." },
  { id: "perfect", grade: 1, prompt: "Which franchise completed the famous perfect 1972 season?", answer: "Miami Dolphins", wrong: ["Pittsburgh Steelers", "Dallas Cowboys"], explanation: "Miami finished the 1972 season undefeated and won Super Bowl VII." },
  { id: "lombardi", grade: 1, prompt: "The Super Bowl trophy is named for which legendary coach?", answer: "Vince Lombardi", wrong: ["Don Shula", "Tom Landry"], explanation: "The NFL championship trophy was named the Vince Lombardi Trophy in 1970." },
  { id: "helmet", grade: 1, prompt: "Who made the famous Helmet Catch for the Giants in Super Bowl XLII?", answer: "David Tyree", wrong: ["Plaxico Burress", "Victor Cruz"], explanation: "David Tyree pinned Eli Manning's pass against his helmet on the Giants' winning drive." },
  { id: "immaculate", grade: 1, prompt: "Which Steelers player made the Immaculate Reception?", answer: "Franco Harris", wrong: ["Lynn Swann", "John Stallworth"], explanation: "Franco Harris scored on the Immaculate Reception in the 1972 AFC Divisional Playoff." },
  { id: "brady-comeback", grade: 1, prompt: "Which quarterback led New England's comeback from 28-3 down in Super Bowl LI?", answer: "Tom Brady", wrong: ["Matt Ryan", "Jimmy Garoppolo"], explanation: "Tom Brady led New England past Atlanta 34-28 in the first overtime Super Bowl." },

  { id: "the-catch", grade: 2, prompt: "Joe Montana's touchdown pass to Dwight Clark in the 1981 NFC Championship became known by what nickname?", answer: "The Catch", wrong: ["The Drive", "The Miracle"], explanation: "Montana-to-Clark against Dallas became one of the NFL's defining playoff plays: The Catch." },
  { id: "beast-quake", grade: 2, prompt: "Which running back's playoff touchdown run became known as Beast Quake?", answer: "Marshawn Lynch", wrong: ["Shaun Alexander", "Adrian Peterson"], explanation: "Marshawn Lynch's tackle-breaking touchdown against New Orleans became Beast Quake." },
  { id: "philly-special", grade: 2, prompt: "Which Eagles quarterback caught a touchdown on the Philly Special in Super Bowl LII?", answer: "Nick Foles", wrong: ["Carson Wentz", "Donovan McNabb"], explanation: "Nick Foles caught Trey Burton's touchdown pass on the Philly Special." },
  { id: "butler", grade: 2, prompt: "Who intercepted Russell Wilson at the goal line to seal Super Bowl XLIX?", answer: "Malcolm Butler", wrong: ["Darrelle Revis", "Devin McCourty"], explanation: "Malcolm Butler intercepted Wilson in the final minute to preserve New England's win." },
  { id: "namath", grade: 2, prompt: "Which quarterback famously guaranteed the Jets would win Super Bowl III?", answer: "Joe Namath", wrong: ["Johnny Unitas", "Len Dawson"], explanation: "Joe Namath guaranteed a Jets victory before their upset of Baltimore." },
  { id: "triplets", grade: 2, prompt: "Which running back joined Troy Aikman and Michael Irvin as the Cowboys' 1990s 'Triplets'?", answer: "Emmitt Smith", wrong: ["Tony Dorsett", "Herschel Walker"], explanation: "Aikman, Smith and Irvin powered Dallas' 1990s championship teams." },

  { id: "wide-right", grade: 3, prompt: "Which Bills kicker's miss created the 'Wide Right' ending to Super Bowl XXV?", answer: "Scott Norwood", wrong: ["Steve Christie", "Gary Anderson"], explanation: "Scott Norwood's 47-yard attempt went wide right as Buffalo lost 20-19." },
  { id: "the-drive", grade: 3, prompt: "Which quarterback led the 98-yard march remembered as 'The Drive' in the 1986 AFC Championship?", answer: "John Elway", wrong: ["Bernie Kosar", "Dan Marino"], explanation: "John Elway led Denver 98 yards to tie Cleveland late in regulation." },
  { id: "minneapolis", grade: 3, prompt: "Who caught the pass and scored on the Minneapolis Miracle?", answer: "Stefon Diggs", wrong: ["Adam Thielen", "Kyle Rudolph"], explanation: "Stefon Diggs turned the final pass into the game-winning Minneapolis Miracle touchdown." },
  { id: "music-city", grade: 3, prompt: "Who scored the touchdown on the Music City Miracle?", answer: "Kevin Dyson", wrong: ["Frank Wycheck", "Eddie George"], explanation: "Kevin Dyson took the lateral down the sideline for the Music City Miracle touchdown." },
  { id: "first-ot", grade: 3, prompt: "Which Super Bowl was the first to go to overtime?", answer: "Super Bowl LI", wrong: ["Super Bowl XLIX", "Super Bowl LII"], explanation: "New England's comeback against Atlanta in Super Bowl LI produced the first overtime in Super Bowl history." },
  { id: "first-wild-card", grade: 3, prompt: "Which franchise became the first wild-card team to win a Super Bowl?", answer: "Oakland Raiders", wrong: ["Dallas Cowboys", "Pittsburgh Steelers"], explanation: "Oakland won Super Bowl XV after entering the playoffs as a wild card." },

  { id: "randle-el", grade: 4, prompt: "Which Steelers receiver threw a touchdown pass to Hines Ward in Super Bowl XL?", answer: "Antwaan Randle El", wrong: ["Santonio Holmes", "Cedrick Wilson"], explanation: "Antwaan Randle El hit Hines Ward for a 43-yard touchdown." },
  { id: "hester", grade: 4, prompt: "Who returned the opening kickoff of Super Bowl XLI for a touchdown?", answer: "Devin Hester", wrong: ["Dante Hall", "Desmond Howard"], explanation: "Devin Hester opened Super Bowl XLI with a 92-yard kickoff-return touchdown." },
  { id: "holmes", grade: 4, prompt: "Which Steelers receiver made the toe-tap game-winning touchdown catch in Super Bowl XLIII?", answer: "Santonio Holmes", wrong: ["Hines Ward", "Nate Washington"], explanation: "Santonio Holmes caught Ben Roethlisberger's late touchdown in the corner of the end zone." },
  { id: "porter", grade: 4, prompt: "Who intercepted Peyton Manning and returned it for a touchdown late in Super Bowl XLIV?", answer: "Tracy Porter", wrong: ["Darren Sharper", "Jabari Greer"], explanation: "Tracy Porter's pick-six helped seal New Orleans' Super Bowl XLIV victory." },
  { id: "marcus-allen", grade: 4, prompt: "Which Raiders running back scored on a famous 74-yard run in Super Bowl XVIII?", answer: "Marcus Allen", wrong: ["Bo Jackson", "Roger Craig"], explanation: "Marcus Allen reversed field and broke a 74-yard touchdown run in Super Bowl XVIII." },
  { id: "hardman-lviii", grade: 4, prompt: "Who caught the game-winning touchdown in overtime of Super Bowl LVIII?", answer: "Mecole Hardman", wrong: ["Travis Kelce", "Rashee Rice"], explanation: "Mecole Hardman caught Patrick Mahomes' game-winning 3-yard touchdown pass in overtime." },

  { id: "first-sb-touchdown", grade: 5, prompt: "Who caught the first touchdown pass in Super Bowl history?", answer: "Max McGee", wrong: ["Boyd Dowler", "Jim Taylor"], explanation: "Max McGee caught Bart Starr's 37-yard touchdown pass for the first touchdown in Super Bowl history." },
  { id: "dungy", grade: 5, prompt: "Who became the first Black head coach to win a Super Bowl?", answer: "Tony Dungy", wrong: ["Lovie Smith", "Mike Tomlin"], explanation: "Tony Dungy coached Indianapolis to victory in Super Bowl XLI." },
  { id: "first-mnf", grade: 5, prompt: "Which two teams played in the first Monday Night Football game in 1970?", answer: "Cleveland Browns and New York Jets", wrong: ["Dallas Cowboys and Washington", "Green Bay Packers and Chicago Bears"], explanation: "Cleveland hosted the New York Jets in the first Monday Night Football game." },
  { id: "sb-name", grade: 5, prompt: "Which championship game was the first for which the 'Super Bowl' name was officially recognized?", answer: "Super Bowl III", wrong: ["Super Bowl I", "Super Bowl V"], explanation: "The Super Bowl title was officially recognized for the game played in January 1969." },
  { id: "butler-target", grade: 5, prompt: "Which Seahawks receiver was the intended target on Malcolm Butler's goal-line interception in Super Bowl XLIX?", answer: "Ricardo Lockette", wrong: ["Doug Baldwin", "Jermaine Kearse"], explanation: "Russell Wilson's pass was intended for Ricardo Lockette when Malcolm Butler jumped the route." },
  { id: "music-city-lateral", grade: 5, prompt: "Which Titans tight end threw the lateral across the field on the Music City Miracle?", answer: "Frank Wycheck", wrong: ["Kevin Dyson", "Lorenzo Neal"], explanation: "Frank Wycheck took the handoff and threw the lateral to Kevin Dyson on the Music City Miracle." },
];

type NflFinalFact = KnowledgeFact & {
  subject: "Players" | "Teams" | "NFL History" | "X’s & O’s";
};

const NFL_FINAL_FACTS: readonly NflFinalFact[] = [
  { id: "howley", grade: 5, subject: "Players", prompt: "Name the only player to win Super Bowl MVP while playing for the losing team.", answer: "Chuck Howley", wrong: ["Bob Lilly", "Randy White"], explanation: "Dallas linebacker Chuck Howley won Super Bowl V MVP even though the Cowboys lost to Baltimore." },
  { id: "doug-williams", grade: 5, subject: "Players", prompt: "Which quarterback became the first Black starting quarterback to win a Super Bowl and was named Super Bowl XXII MVP?", answer: "Doug Williams", wrong: ["Warren Moon", "Steve McNair"], explanation: "Doug Williams led Washington to the Super Bowl XXII title and won game MVP." },
  { id: "steve-young-six", grade: 5, subject: "Players", prompt: "Which quarterback threw six touchdown passes in Super Bowl XXIX?", answer: "Steve Young", wrong: ["Joe Montana", "Troy Aikman"], explanation: "Steve Young threw six touchdown passes in San Francisco's Super Bowl XXIX victory." },
  { id: "terrell-davis-three", grade: 5, subject: "Players", prompt: "Which running back scored three rushing touchdowns and won MVP in Super Bowl XXXII?", answer: "Terrell Davis", wrong: ["John Elway", "Dorsey Levens"], explanation: "Terrell Davis scored three rushing touchdowns and earned Super Bowl XXXII MVP." },

  { id: "bucs-home", grade: 5, subject: "Teams", prompt: "Which franchise became the first to play in and win a Super Bowl in its home stadium?", answer: "Tampa Bay Buccaneers", wrong: ["Los Angeles Rams", "Miami Dolphins"], explanation: "Tampa Bay won Super Bowl LV at Raymond James Stadium." },
  { id: "bears-46", grade: 5, subject: "Teams", prompt: "Which franchise rode the famous '46 defense' to a Super Bowl XX championship?", answer: "Chicago Bears", wrong: ["New York Giants", "Pittsburgh Steelers"], explanation: "The 1985 Chicago Bears used Buddy Ryan's 46 defense on the way to winning Super Bowl XX." },
  { id: "raiders-three-cities", grade: 5, subject: "Teams", prompt: "Which franchise reached the Super Bowl while based in Oakland, then Los Angeles, then Oakland again?", answer: "Raiders", wrong: ["Rams", "Chargers"], explanation: "The Raiders reached Super Bowls from Oakland, then Los Angeles, and later Oakland again." },
  { id: "ravens-two-qbs", grade: 5, subject: "Teams", prompt: "Which franchise won its first two Super Bowls with Trent Dilfer and Joe Flacco as its starting quarterbacks?", answer: "Baltimore Ravens", wrong: ["Tampa Bay Buccaneers", "New York Giants"], explanation: "Baltimore won Super Bowl XXXV with Trent Dilfer and Super Bowl XLVII with Joe Flacco." },

  { id: "mike-jones", grade: 5, subject: "NFL History", prompt: "Who made the tackle at the one-yard line on the final play of Super Bowl XXXIV?", answer: "Mike Jones", wrong: ["Aeneas Williams", "London Fletcher"], explanation: "Rams linebacker Mike Jones tackled Kevin Dyson just short of the goal line to end Super Bowl XXXIV." },
  { id: "jacoby-jones", grade: 5, subject: "NFL History", prompt: "Who opened the second half of Super Bowl XLVII with a 108-yard kickoff-return touchdown?", answer: "Jacoby Jones", wrong: ["Devin Hester", "Ted Ginn Jr."], explanation: "Jacoby Jones returned the second-half kickoff 108 yards for Baltimore." },
  { id: "stallworth-73", grade: 5, subject: "NFL History", prompt: "Which Steelers receiver caught a 73-yard touchdown from Terry Bradshaw in Super Bowl XIV?", answer: "John Stallworth", wrong: ["Lynn Swann", "Franco Harris"], explanation: "John Stallworth's 73-yard touchdown catch was a defining play in Pittsburgh's Super Bowl XIV win." },
  { id: "harrison-100", grade: 5, subject: "NFL History", prompt: "Who returned an interception 100 yards for a touchdown in Super Bowl XLIII?", answer: "James Harrison", wrong: ["Troy Polamalu", "Ike Taylor"], explanation: "James Harrison's 100-yard interception return closed the first half of Super Bowl XLIII." },

  { id: "mills", grade: 5, subject: "X’s & O’s", prompt: "Which passing concept commonly pairs a post route with a deep dig underneath it?", answer: "Mills", wrong: ["Mesh", "Smash"], explanation: "The Mills concept combines a post route with a deep in-breaking dig to stress a safety." },
  { id: "cover-zero", grade: 5, subject: "X’s & O’s", prompt: "What coverage family typically has no deep safety help and uses man coverage across the board?", answer: "Cover 0", wrong: ["Cover 2", "Cover 4"], explanation: "Cover 0 is a man-coverage pressure structure with no dedicated deep safety." },
  { id: "tampa-two", grade: 5, subject: "X’s & O’s", prompt: "In a classic Tampa 2, which defender is asked to carry the deep middle between the two safeties?", answer: "Middle linebacker", wrong: ["Nickel corner", "Defensive end"], explanation: "The middle linebacker drops deeper than in a standard Cover 2 to help close the middle of the field." },
];

const CFB_TRADITION_FACTS: readonly KnowledgeFact[] = [
  { id: "the-game", grade: 1, prompt: "Which two programs play the rivalry commonly called “The Game”?", answer: "Michigan and Ohio State", wrong: ["Alabama and Auburn", "Texas and Oklahoma"], explanation: "Michigan and Ohio State meet in the rivalry known as The Game." },
  { id: "iron-bowl", grade: 1, prompt: "Which two programs play the Iron Bowl?", answer: "Alabama and Auburn", wrong: ["Georgia and Florida", "Ole Miss and Mississippi State"], explanation: "The Iron Bowl is Alabama versus Auburn." },
  { id: "red-river", grade: 1, prompt: "Which programs play the Red River rivalry?", answer: "Texas and Oklahoma", wrong: ["USC and UCLA", "Iowa and Iowa State"], explanation: "Texas and Oklahoma meet in the Red River rivalry." },
  { id: "army-navy", grade: 1, prompt: "Which service academies play the Army–Navy Game?", answer: "Army and Navy", wrong: ["Army and Air Force", "Navy and Air Force"], explanation: "The Army–Navy Game matches the U.S. Military Academy and U.S. Naval Academy." },
  { id: "egg-bowl", grade: 2, prompt: "Which two programs play the Egg Bowl?", answer: "Ole Miss and Mississippi State", wrong: ["Alabama and Auburn", "Clemson and South Carolina"], explanation: "The Egg Bowl is Ole Miss versus Mississippi State." },
  { id: "paul-bunyan", grade: 3, prompt: "Michigan and Michigan State play for which trophy?", answer: "Paul Bunyan Trophy", wrong: ["Little Brown Jug", "Old Oaken Bucket"], explanation: "Michigan and Michigan State compete for the Paul Bunyan Trophy." },
  { id: "axe", grade: 2, prompt: "Minnesota and Wisconsin play for which trophy?", answer: "Paul Bunyan's Axe", wrong: ["Floyd of Rosedale", "Heartland Trophy"], explanation: "Minnesota and Wisconsin compete for Paul Bunyan's Axe." },
  { id: "cy-hawk", grade: 2, prompt: "Which two programs play for the Cy-Hawk Trophy?", answer: "Iowa and Iowa State", wrong: ["Iowa and Minnesota", "Iowa State and Kansas State"], explanation: "The Cy-Hawk Trophy belongs to the Iowa–Iowa State rivalry." },
  { id: "palmetto", grade: 2, prompt: "Which two programs meet in South Carolina's Palmetto Bowl rivalry?", answer: "Clemson and South Carolina", wrong: ["Georgia and Georgia Tech", "Florida and Florida State"], explanation: "Clemson and South Carolina meet in the Palmetto Bowl rivalry." },
  { id: "bedlam", grade: 2, prompt: "Which two programs are associated with the Bedlam rivalry?", answer: "Oklahoma and Oklahoma State", wrong: ["Oklahoma and Texas", "Oklahoma State and Texas Tech"], explanation: "Bedlam traditionally refers to Oklahoma versus Oklahoma State." },
  { id: "howards-rock", grade: 3, prompt: "Which program is associated with Howard's Rock?", answer: "Clemson", wrong: ["Auburn", "Tennessee"], explanation: "Clemson players touch Howard's Rock before running down the hill into Memorial Stadium." },
  { id: "jump-around", grade: 2, prompt: "Which program is famous for “Jump Around” between the third and fourth quarters at home games?", answer: "Wisconsin", wrong: ["Iowa", "Nebraska"], explanation: "Wisconsin's Camp Randall crowd is famous for Jump Around between the third and fourth quarters." },
  { id: "white-out", grade: 1, prompt: "Which program is most associated with the stadium “White Out” tradition?", answer: "Penn State", wrong: ["Michigan", "Notre Dame"], explanation: "Penn State's White Out is a signature Beaver Stadium tradition." },
  { id: "script-ohio", grade: 2, prompt: "Which school's marching band performs Script Ohio?", answer: "Ohio State", wrong: ["Michigan", "USC"], explanation: "The Ohio State University Marching Band is famous for Script Ohio." },
  { id: "midnight-yell", grade: 2, prompt: "Which school is known for Midnight Yell?", answer: "Texas A&M", wrong: ["Texas", "LSU"], explanation: "Midnight Yell is a longstanding Texas A&M tradition." },
  { id: "ralphie", grade: 2, prompt: "Which program's live buffalo mascot is named Ralphie?", answer: "Colorado", wrong: ["Buffalo", "Wyoming"], explanation: "Ralphie is the live buffalo mascot associated with Colorado." },
  { id: "sooner-schooner", grade: 2, prompt: "Which program is associated with the Sooner Schooner?", answer: "Oklahoma", wrong: ["Oklahoma State", "Texas Tech"], explanation: "The Sooner Schooner is an Oklahoma game-day tradition." },
  { id: "renegade", grade: 3, prompt: "Chief Osceola and Renegade are associated with which program?", answer: "Florida State", wrong: ["Florida", "Miami"], explanation: "Florida State's pregame tradition features Chief Osceola and Renegade." },
  { id: "sailgating", grade: 4, prompt: "Which program is famous for “sailgating” to games on the Tennessee River?", answer: "Tennessee", wrong: ["Kentucky", "Arkansas"], explanation: "Fans can arrive by boat near Tennessee's Neyland Stadium, a tradition known as sailgating." },
  { id: "victory-bell", grade: 3, prompt: "USC and UCLA compete for which rivalry trophy?", answer: "Victory Bell", wrong: ["Jeweled Shillelagh", "Stanford Axe"], explanation: "USC and UCLA play for the Victory Bell." },
  { id: "floyd-rosedale", grade: 5, prompt: "Iowa and Minnesota play for which trophy?", answer: "Floyd of Rosedale", wrong: ["Heartland Trophy", "Little Brown Jug"], explanation: "Iowa and Minnesota compete for Floyd of Rosedale." },
  { id: "old-oaken-bucket", grade: 5, prompt: "Indiana and Purdue play for which trophy?", answer: "Old Oaken Bucket", wrong: ["Old Brass Spittoon", "Illibuck"], explanation: "Indiana and Purdue compete for the Old Oaken Bucket." },
  { id: "jeweled-shillelagh", grade: 5, prompt: "Notre Dame and USC play for which trophy?", answer: "Jeweled Shillelagh", wrong: ["Victory Bell", "Legends Trophy"], explanation: "Notre Dame and USC compete for the Jeweled Shillelagh." },
  { id: "stanford-axe", grade: 5, prompt: "Stanford and California play for which trophy?", answer: "Stanford Axe", wrong: ["Territorial Cup", "Victory Bell"], explanation: "Stanford and Cal compete for the Stanford Axe." },
  { id: "golden-boot", grade: 5, prompt: "LSU and Arkansas play for which trophy?", answer: "Golden Boot", wrong: ["Magnolia Bowl Trophy", "Tiger Rag"], explanation: "LSU and Arkansas compete for the Golden Boot." },
];

const UFC_IQ_FACTS: readonly KnowledgeFact[] = [
  { id: "title-rounds", grade: 1, prompt: "How many rounds is a standard UFC championship bout scheduled for?", answer: "5", wrong: ["3", "7"], explanation: "UFC championship bouts are scheduled for five rounds." },
  { id: "standard-rounds", grade: 1, prompt: "How many rounds is a standard non-title UFC bout usually scheduled for?", answer: "3", wrong: ["2", "5"], explanation: "Most non-title UFC bouts are scheduled for three rounds." },
  { id: "round-length", grade: 1, prompt: "How long is a standard UFC round?", answer: "5 minutes", wrong: ["3 minutes", "10 minutes"], explanation: "Standard UFC rounds are five minutes long." },
  { id: "ten-point-must", grade: 1, prompt: "What scoring system is used for UFC rounds?", answer: "10-point must system", wrong: ["Five-point must system", "Rally scoring"], explanation: "UFC judging uses the 10-point must system." },
  { id: "round-winner", grade: 2, prompt: "Under the 10-point must system, how many points does the round winner normally receive?", answer: "10", wrong: ["9", "11"], explanation: "The winner of a round normally receives 10 points." },
  { id: "tko", grade: 1, prompt: "What abbreviation is used for a technical knockout?", answer: "TKO", wrong: ["SUB", "DEC"], explanation: "TKO stands for technical knockout." },
  { id: "submission", grade: 1, prompt: "What result is recorded when a fighter taps or verbally concedes to a hold?", answer: "Submission", wrong: ["Decision", "No contest"], explanation: "A tap or verbal concession to a legal hold produces a submission result." },
  { id: "unanimous", grade: 2, prompt: "What type of decision occurs when all three judges pick the same winner?", answer: "Unanimous decision", wrong: ["Split decision", "Majority draw"], explanation: "A unanimous decision means all three judges scored the fight for the same fighter." },
  { id: "split", grade: 2, prompt: "What type of decision occurs when two judges pick one fighter and the third picks the other?", answer: "Split decision", wrong: ["Unanimous decision", "Technical decision"], explanation: "A split decision has two judges for one fighter and one judge for the other." },
  { id: "majority", grade: 3, prompt: "What type of decision occurs when two judges pick the same winner and the third scores the fight a draw?", answer: "Majority decision", wrong: ["Split decision", "Unanimous decision"], explanation: "A majority decision has two cards for the winner and one draw." },
  { id: "rear-naked", grade: 2, prompt: "A rear-naked choke is what type of finishing technique?", answer: "Submission", wrong: ["Kick", "Takedown"], explanation: "A rear-naked choke is a submission hold." },
  { id: "guillotine", grade: 2, prompt: "A guillotine is what type of finishing technique?", answer: "Submission", wrong: ["Elbow strike", "Sweep"], explanation: "A guillotine is a choke submission." },
  { id: "armbar", grade: 2, prompt: "An armbar primarily attacks which joint?", answer: "Elbow", wrong: ["Knee", "Ankle"], explanation: "An armbar hyperextends the elbow joint." },
  { id: "triangle", grade: 3, prompt: "Which body part is primarily used to form a triangle choke around an opponent?", answer: "Legs", wrong: ["Forearms", "Shoulders"], explanation: "A triangle choke uses the legs to trap the opponent's neck and an arm." },
  { id: "kimura", grade: 4, prompt: "A kimura primarily attacks which joint?", answer: "Shoulder", wrong: ["Knee", "Wrist"], explanation: "A kimura is a shoulder lock." },
  { id: "double-leg", grade: 2, prompt: "What wrestling takedown attacks both of an opponent's legs?", answer: "Double-leg takedown", wrong: ["Arm drag", "Hip toss"], explanation: "A double-leg takedown attacks both legs." },
  { id: "sprawl", grade: 2, prompt: "What defensive movement is commonly used to stop a wrestling shot by driving the hips back and down?", answer: "Sprawl", wrong: ["Shrimp", "Granby roll"], explanation: "A sprawl is a fundamental defense against takedown shots." },
  { id: "southpaw", grade: 2, prompt: "Which side is forward in a standard southpaw stance?", answer: "Right side", wrong: ["Left side", "Neither side"], explanation: "A southpaw stance places the right hand and right foot forward." },
  { id: "orthodox", grade: 2, prompt: "Which side is forward in a standard orthodox stance?", answer: "Left side", wrong: ["Right side", "Neither side"], explanation: "An orthodox stance places the left hand and left foot forward." },
  { id: "clinch", grade: 1, prompt: "What term describes close-range grappling while both fighters are standing?", answer: "Clinch", wrong: ["Guard", "Mount"], explanation: "The clinch is close-range standing grappling." },
  { id: "ground-pound", grade: 1, prompt: "What term describes striking an opponent while the fight is on the ground?", answer: "Ground-and-pound", wrong: ["Wall-and-stall", "Lay-and-pray"], explanation: "Ground-and-pound refers to striking from a grounded grappling position." },
  { id: "mount", grade: 3, prompt: "What grappling position has the top fighter sitting over the opponent's torso with both legs outside?", answer: "Mount", wrong: ["Closed guard", "North-south"], explanation: "Mount is a dominant top position over the opponent's torso." },
  { id: "guard", grade: 3, prompt: "What grappling term describes a bottom fighter using the legs to control or attack an opponent?", answer: "Guard", wrong: ["Mount", "Back control"], explanation: "Guard is a bottom grappling position built around leg control." },
  { id: "underhook", grade: 4, prompt: "What clinch control is created by placing an arm underneath an opponent's arm?", answer: "Underhook", wrong: ["Overhand", "Whizzer kick"], explanation: "An underhook places the arm underneath the opponent's arm to gain upper-body control." },
  { id: "jab", grade: 1, prompt: "Which straight punch is normally thrown with the lead hand?", answer: "Jab", wrong: ["Cross", "Uppercut"], explanation: "The jab is the standard lead-hand straight punch." },
  { id: "cross", grade: 2, prompt: "Which straight punch is normally thrown with the rear hand?", answer: "Cross", wrong: ["Jab", "Lead hook"], explanation: "The cross is the standard rear-hand straight punch." },
  { id: "whizzer", grade: 5, prompt: "In wrestling-heavy MMA terminology, what is another common name for an overhook used to counter grappling?", answer: "Whizzer", wrong: ["Underhook", "Body lock"], explanation: "A whizzer is an overhook commonly used to counter takedown and clinch control." },
  { id: "half-guard", grade: 5, prompt: "What guard position has the bottom fighter trapping one of the top fighter's legs?", answer: "Half guard", wrong: ["Full mount", "Side control"], explanation: "In half guard, the bottom fighter controls one of the top fighter's legs." },
  { id: "body-triangle", grade: 5, prompt: "What back-control configuration locks the legs around an opponent's torso in a figure-four shape?", answer: "Body triangle", wrong: ["Closed guard", "Seatbelt grip"], explanation: "A body triangle uses a figure-four leg lock around the torso during back control." },
  { id: "feint", grade: 5, prompt: "What striking term describes a fake attack used to draw a defensive reaction?", answer: "Feint", wrong: ["Frame", "Scramble"], explanation: "A feint is a false attack or movement used to provoke a reaction." },
  { id: "switch-stance", grade: 5, prompt: "What does a fighter do when switching stance?", answer: "Changes which side is forward", wrong: ["Changes weight class", "Moves from standing to guard"], explanation: "Switching stance changes the lead side, such as moving between orthodox and southpaw." },
  { id: "single-leg", grade: 3, prompt: "What wrestling takedown attacks one of an opponent\'s legs?", answer: "Single-leg takedown", wrong: ["Double-leg takedown", "Hip toss"], explanation: "A single-leg takedown attacks one leg and works to finish from that control." },
  { id: "side-control", grade: 3, prompt: "What top grappling position places a fighter across the opponent\'s torso after passing the legs?", answer: "Side control", wrong: ["Closed guard", "Back control"], explanation: "Side control is a dominant top position across the opponent\'s torso after the legs have been passed." },
  { id: "teep", grade: 3, prompt: "What striking term is commonly used for a push kick that helps manage distance?", answer: "Teep", wrong: ["Spinning backfist", "Overhand"], explanation: "A teep is a push kick commonly used to control range and disrupt forward movement." },
  { id: "level-change", grade: 4, prompt: "What wrestling movement lowers a fighter\'s level to threaten or enter a takedown?", answer: "Level change", wrong: ["Switch step", "Hip escape"], explanation: "A level change lowers the hips and body position to set up a wrestling entry." },
  { id: "back-hooks", grade: 4, prompt: "In back control, what are the legs called when they are inserted inside an opponent\'s thighs?", answer: "Hooks", wrong: ["Frames", "Posts"], explanation: "Hooks use the feet and legs inside the opponent\'s thighs to help secure back control." },
  { id: "rear-body-lock", grade: 4, prompt: "What clinch control wraps the arms around an opponent\'s waist or hips from behind?", answer: "Rear body lock", wrong: ["Front headlock", "Double collar tie"], explanation: "A rear body lock controls the opponent from behind with the arms locked around the waist or hips." },
  { id: "calf-kick", grade: 4, prompt: "A calf kick is aimed primarily at which area?", answer: "Lower leg", wrong: ["Ribs", "Forearm"], explanation: "A calf kick targets the lower leg around the calf rather than the thigh or upper body." },
  { id: "hip-escape", grade: 5, prompt: "What grappling movement is also commonly called a shrimp?", answer: "Hip escape", wrong: ["Granby roll", "Technical stand-up"], explanation: "The hip escape, often called a shrimp, creates space by moving the hips away from pressure." },
  { id: "frame", grade: 5, prompt: "What grappling term describes using the forearm or other skeletal structure to create and maintain space?", answer: "Frame", wrong: ["Hook", "Whizzer"], explanation: "A frame uses skeletal structure, often the forearm, to manage distance and resist pressure." },
  { id: "pummeling", grade: 5, prompt: "What clinch drill or exchange involves fighting for inside arm position and underhooks?", answer: "Pummeling", wrong: ["Shrimping", "Posting"], explanation: "Pummeling is the hand-and-arm battle for inside position and underhooks in the clinch." },
  { id: "cage-cutting", grade: 5, prompt: "What striking-footwork concept limits an opponent\'s escape routes instead of simply following them around the cage?", answer: "Cage cutting", wrong: ["Level changing", "Wall walking"], explanation: "Cage cutting uses angles and positioning to reduce an opponent\'s available space and exits." },
];

function knowledgeQuestions(
  sport: AverageFanSport,
  subject: AverageFanSubject,
  prefix: string,
  facts: readonly KnowledgeFact[],
) {
  return facts.map((fact, index) => (
    index % 4 === 0
      ? choiceQuestion({
          id: `${prefix}:${fact.id}:choice`,
          sport,
          grade: fact.grade,
          subject,
          prompt: fact.prompt,
          answer: fact.answer,
          wrongChoices: fact.wrong,
          explanation: fact.explanation,
          difficultyNudge: fact.grade >= 4 ? 1 : fact.grade === 1 ? -1 : 0,
        })
      : shortQuestion({
          id: `${prefix}:${fact.id}:short`,
          sport,
          grade: fact.grade,
          subject,
          prompt: fact.prompt,
          answer: fact.answer,
          explanation: fact.explanation,
          fanMisses: fact.wrong,
          difficultyNudge: fact.grade >= 4 ? 1 : fact.grade === 1 ? -1 : 0,
        })
  ));
}

function footballPlayers(league: "NFL" | "CFB") {
  return queryFootballSubjects({ league, kind: "player-career" })
    .filter((subject) => subject.name && subject.position)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function displayNflTeam(code: string) {
  return NFL_TEAM_NAMES[code] ?? code;
}

function footballCandidates(league: "NFL" | "CFB") {
  const sport: AverageFanSport = league === "NFL" ? "nfl" : "cfb";
  const players = footballPlayers(league).filter((player) => league !== "NFL" || player.casualEligible);
  const playerNames = players.map((player) => player.name);
  const schools = unique(players.map((player) => player.school ?? ""));
  const nflTeams = unique(players.flatMap((player) => (player.franchises ?? []).map(displayNflTeam)));
  const programs = league === "CFB"
    ? queryFootballSubjects({ league: "CFB", kind: "program" }).sort((a, b) => a.id.localeCompare(b.id))
    : [];
  const conferences = unique(programs.map((program) => program.conference ?? ""));
  const questions: AverageFanQuestion[] = [];

  for (const [index, player] of players.entries()) {
    const position = player.position!;
    const wrongPositions = peerValues(FOOTBALL_POSITIONS, position, `${player.id}:position`);
    const playerSubject = "Players" as AverageFanSubject;

    questions.push(shortQuestion({
      id: `average-fan:${sport}:g1:${player.id}:position`,
      sport,
      grade: 1,
      subject: playerSubject,
      prompt: `What position did ${player.name} play?`,
      answer: position,
      explanation: `${player.name} played ${position}.`,
      fanMisses: wrongPositions,
      difficultyNudge: -1,
    }));

    const tfTrue = index % 2 === 0;
    const tfPosition = tfTrue ? position : wrongPositions[0]!;
    questions.push(trueFalseQuestion({
      id: `average-fan:${sport}:g2:${player.id}:position-tf`,
      sport,
      grade: 2,
      subject: playerSubject,
      prompt: `${player.name} played ${tfPosition}.`,
      answer: tfTrue,
      explanation: `${player.name} is listed as a ${position}.`,
      difficultyNudge: 0,
    }));

    if (league === "NFL" && player.school) {
      const wrongSchools = peerValues(schools, player.school, `${player.id}:school`);
      questions.push(choiceQuestion({
        id: `average-fan:nfl:g2:${player.id}:school`,
        sport: "nfl",
        grade: 2,
        subject: playerSubject,
        prompt: `Which college did ${player.name} enter the NFL from?`,
        answer: player.school,
        wrongChoices: wrongSchools,
        explanation: `${player.name} entered the NFL from ${player.school}.`,
      }));
    }

    if (league === "NFL") {
      const teams = unique((player.franchises ?? []).map(displayNflTeam));
      if (teams.length) {
        const answer = teams[0]!;
        const wrongTeams = peerValues(nflTeams, teams, `${player.id}:team`);
        questions.push(shortQuestion({
          id: `average-fan:nfl:g3:${player.id}:team`,
          sport: "nfl",
          grade: 3,
          subject: "Teams",
          prompt: teams.length === 1
            ? `Which NFL team did ${player.name} play for?`
            : `Name one NFL team ${player.name} played for.`,
          answer,
          aliases: teams.slice(1),
          explanation: `${player.name}'s NFL career included ${teams.join(", ")}.`,
          fanMisses: wrongTeams,
        }));
      }

      if (player.draftYear != null) {
        const misses = [player.draftYear - 1, player.draftYear + 1].map(String);
        questions.push(shortQuestion({
          id: `average-fan:nfl:g3:${player.id}:draft-year`,
          sport: "nfl",
          grade: 3,
          subject: "NFL History",
          prompt: `In what year was ${player.name} drafted into the NFL?`,
          answer: String(player.draftYear),
          explanation: `${player.name} entered the NFL through the ${player.draftYear} draft.`,
          fanMisses: misses,
        }));
      }

      if (player.draftYear != null && player.draftPick != null) {
        const pick = player.draftPick;
        const misses = numericMisses(pick, [Math.max(1, pick - 1), pick + 1, pick + 5]);
        questions.push(shortQuestion({
          id: `average-fan:nfl:g4:${player.id}:draft-pick`,
          sport: "nfl",
          grade: 4,
          subject: "NFL History",
          prompt: `What overall pick was ${player.name} in the ${player.draftYear} NFL Draft?`,
          answer: String(pick),
          aliases: aliasesForNumber(pick).slice(1),
          explanation: `${player.name} was selected No. ${pick} overall in the ${player.draftYear} NFL Draft.`,
          fanMisses: misses,
          difficultyNudge: 1,
        }));

        if (player.school) {
          const wrongNames = peerValues(playerNames, player.name, `${player.id}:identity`);
          questions.push(shortQuestion({
            id: `average-fan:nfl:g5:${player.id}:draft-identity`,
            sport: "nfl",
            grade: 5,
            subject: "NFL History",
            prompt: `Which player from ${player.school} was selected No. ${pick} overall in the ${player.draftYear} NFL Draft?`,
            answer: player.name,
            explanation: `${player.name}, from ${player.school}, was the No. ${pick} pick in ${player.draftYear}.`,
            fanMisses: wrongNames,
            difficultyNudge: 2,
          }));
          questions.push(shortQuestion({
            id: `average-fan:nfl:final:${player.id}:draft`,
            sport: "nfl",
            grade: 5,
            subject: "NFL History",
            prompt: `Name the ${position} from ${player.school} who went No. ${pick} overall in the ${player.draftYear} NFL Draft.`,
            answer: player.name,
            explanation: `${player.name} matched that draft slot and college profile.`,
            fanMisses: wrongNames,
            difficultyNudge: 3,
            protectedFinal: true,
          }));
        }
      }
    } else {
      if (player.school) {
        questions.push(choiceQuestion({
          id: `average-fan:cfb:g3:${player.id}:school-position`,
          sport: "cfb",
          grade: 3,
          subject: "Players",
          prompt: `What position did ${player.name} play at ${player.school}?`,
          answer: position,
          wrongChoices: wrongPositions,
          explanation: `${player.name} played ${position} at ${player.school}.`,
        }));
      }

      if (player.heismanWinner) {
        questions.push(trueFalseQuestion({
          id: `average-fan:cfb:g3:${player.id}:heisman`,
          sport: "cfb",
          grade: 3,
          subject: "CFB History",
          prompt: `${player.name} won the Heisman Trophy.`,
          answer: true,
          explanation: `${player.name} won the Heisman Trophy.`,
        }));
      }

      if (player.draftYear != null && player.draftPick != null && player.school) {
        const wrongNames = peerValues(playerNames, player.name, `${player.id}:cfb-draft-identity`);
        questions.push(shortQuestion({
          id: `average-fan:cfb:g4:${player.id}:draft-pick`,
          sport: "cfb",
          grade: 4,
          subject: "CFB History",
          prompt: `Which ${player.school} player was selected No. ${player.draftPick} overall in the ${player.draftYear} NFL Draft?`,
          answer: player.name,
          explanation: `${player.name} was selected No. ${player.draftPick} overall in ${player.draftYear} after playing at ${player.school}.`,
          fanMisses: wrongNames,
          difficultyNudge: 1,
        }));
        questions.push(shortQuestion({
          id: `average-fan:cfb:g5:${player.id}:draft-identity`,
          sport: "cfb",
          grade: 5,
          subject: "CFB History",
          prompt: `Name the ${position} from ${player.school} who became the No. ${player.draftPick} pick in the ${player.draftYear} NFL Draft.`,
          answer: player.name,
          explanation: `${player.name} matches that college, position, and draft slot.`,
          fanMisses: wrongNames,
          difficultyNudge: 2,
        }));
        questions.push(shortQuestion({
          id: `average-fan:cfb:final:${player.id}:draft`,
          sport: "cfb",
          grade: 5,
          subject: "CFB History",
          prompt: `Which ${player.school} ${position} was taken No. ${player.draftPick} overall in the ${player.draftYear} NFL Draft?`,
          answer: player.name,
          explanation: `${player.name} matched that college résumé and exact draft slot.`,
          fanMisses: wrongNames,
          difficultyNudge: 3,
          protectedFinal: true,
        }));
      } else if (player.school && (player.heismanWinner || player.nationalChampion)) {
        const wrongNames = peerValues(playerNames, player.name, `${player.id}:cfb-final`);
        questions.push(shortQuestion({
          id: `average-fan:cfb:final:${player.id}:resume`,
          sport: "cfb",
          grade: 5,
          subject: "CFB History",
          prompt: `Which ${position} from ${player.school} matches this résumé: ${player.heismanWinner ? "Heisman Trophy winner" : "national champion"}?`,
          answer: player.name,
          explanation: `${player.name} is the matching ${player.school} ${position} in HQ's canonical registry.`,
          fanMisses: wrongNames,
          difficultyNudge: 3,
          protectedFinal: true,
        }));
      }
    }
  }

  if (league === "CFB") {
    for (const [index, program] of programs.entries()) {
      if (!program.conference) continue;
      const conferenceSeason = program.conferenceSeason ?? 2025;
      const wrongConferences = peerValues(conferences, program.conference, `${program.id}:conference`);
      questions.push(shortQuestion({
        id: `average-fan:cfb:g1:${program.id}:conference`,
        sport: "cfb",
        grade: 1,
        subject: "Programs",
        prompt: `For the ${conferenceSeason} season, which conference was ${program.name} in?`,
        answer: program.conference,
        explanation: `${program.name} was in the ${program.conference} for the ${conferenceSeason} season.`,
        fanMisses: wrongConferences,
        difficultyNudge: -1,
      }));
      const tfTrue = index % 2 === 0;
      const shownConference = tfTrue ? program.conference : wrongConferences[0]!;
      questions.push(trueFalseQuestion({
        id: `average-fan:cfb:g2:${program.id}:conference-tf`,
        sport: "cfb",
        grade: 2,
        subject: "Programs",
        prompt: `${program.name} was in the ${shownConference} for the ${conferenceSeason} season.`,
        answer: tfTrue,
        explanation: `${program.name} is listed in the ${program.conference}.`,
      }));
      const wrongPrograms = peerValues(
        programs
          .filter((candidate) => candidate.conference && candidate.conference !== program.conference)
          .map((candidate) => candidate.name),
        program.name,
        `${program.id}:program-choice`,
      );
      questions.push(choiceQuestion({
        id: `average-fan:cfb:g3:${program.id}:conference-program`,
        sport: "cfb",
        grade: 3,
        subject: "Programs",
        prompt: `Which of these programs was in the ${program.conference} for the ${conferenceSeason} season?`,
        answer: program.name,
        wrongChoices: wrongPrograms,
        explanation: `${program.name} is listed in the ${program.conference}.`,
      }));
    }
  }

  if (league === "NFL") {
    questions.push(...knowledgeQuestions("nfl", "Players", "average-fan:nfl:00-player", NFL_PLAYER_FACTS));
    questions.push(...knowledgeQuestions("nfl", "Teams", "average-fan:nfl:00-team", NFL_TEAM_FACTS));
    questions.push(...knowledgeQuestions("nfl", "X’s & O’s", "average-fan:nfl:00-xo", NFL_XO_FACTS));
    questions.push(...knowledgeQuestions("nfl", "NFL History", "average-fan:nfl:00-history", NFL_HISTORY_FACTS));
    questions.push(...NFL_FINAL_FACTS.map((fact) => shortQuestion({
      id: `average-fan:nfl:final-authored:${fact.id}`,
      sport: "nfl",
      grade: 5,
      subject: fact.subject,
      prompt: fact.prompt,
      answer: fact.answer,
      explanation: fact.explanation,
      fanMisses: fact.wrong,
      difficultyNudge: 3,
      protectedFinal: true,
    })));
  } else {
    questions.push(...knowledgeQuestions("cfb", "Traditions", "average-fan:cfb:tradition", CFB_TRADITION_FACTS));
  }

  return questions;
}

function formatDivision(value: string) {
  return value
    .replace(/^women-s-/, "Women's ")
    .replace(/^womens-/, "Women's ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function methodLabel(method: string) {
  if (method === "ko-tko") return "KO/TKO";
  if (method === "submission") return "submission";
  if (method === "decision") return "decision";
  return "other";
}

function ufcCandidates() {
  const fighters = [...ufcFactualLedgerSubjects].sort((a, b) => a.id.localeCompare(b.id));
  const fighterNames = fighters.map((fighter) => fighter.name);
  const divisions = unique(fighters.map((fighter) => formatDivision(fighter.primaryDivision)));
  const questions: AverageFanQuestion[] = [];

  for (const [index, fighter] of fighters.entries()) {
    const primaryDivision = formatDivision(fighter.primaryDivision);
    const wrongDivisions = peerValues(divisions, primaryDivision, `${fighter.id}:division`);
    questions.push(shortQuestion({
      id: `average-fan:ufc:g1:${fighter.id}:division`,
      sport: "ufc",
      grade: 1,
      subject: "Fighters",
      prompt: `Which UFC division is ${fighter.name} primarily associated with?`,
      answer: primaryDivision,
      explanation: `${fighter.name}'s primary UFC division is ${primaryDivision}.`,
      fanMisses: wrongDivisions,
      difficultyNudge: -1,
    }));

    const tfTrue = index % 2 === 0;
    const shownDivision = tfTrue ? primaryDivision : wrongDivisions[0]!;
    questions.push(trueFalseQuestion({
      id: `average-fan:ufc:g2:${fighter.id}:division-tf`,
      sport: "ufc",
      grade: 2,
      subject: "Fighters",
      prompt: `${fighter.name} is primarily associated with the UFC ${shownDivision} division.`,
      answer: tfTrue,
      explanation: `${fighter.name}'s primary UFC division is ${primaryDivision}.`,
    }));

    const wins = fighter.fights.filter((fight) => fight.result === "win");
    const recognizableFight = wins[stableOffset(`${fighter.id}:win`, Math.max(1, wins.length))] ?? fighter.fights[0];
    if (recognizableFight) {
      const acceptedOpponents = (wins.length ? wins : fighter.fights).map((fight) => fight.opponent);
      const wrongOpponents = peerValues(fighterNames, acceptedOpponents, `${fighter.id}:opponent`);
      questions.push(choiceQuestion({
        id: `average-fan:ufc:g3:${fighter.id}:opponent`,
        sport: "ufc",
        grade: 3,
        subject: "Fights",
        prompt: wins.length
          ? `Which of these fighters did ${fighter.name} defeat in the UFC?`
          : `Which of these fighters did ${fighter.name} face in the UFC?`,
        answer: recognizableFight.opponent,
        wrongChoices: wrongOpponents,
        explanation: `${fighter.name} ${recognizableFight.result === "win" ? "defeated" : "faced"} ${recognizableFight.opponent} in the UFC.`,
      }));
    }

    const methodWins = wins.filter((fight) => fight.methodCategory !== "other");
    const methodFight = methodWins[stableOffset(`${fighter.id}:method`, Math.max(1, methodWins.length))];
    if (methodFight) {
      const sameMethodOpponents = wins
        .filter((fight) => fight.methodCategory === methodFight.methodCategory)
        .map((fight) => fight.opponent);
      const answer = sameMethodOpponents[0]!;
      const wrongOpponents = peerValues(fighterNames, sameMethodOpponents, `${fighter.id}:method-opponent`);
      questions.push(shortQuestion({
        id: `average-fan:ufc:g4:${fighter.id}:method-win`,
        sport: "ufc",
        grade: 4,
        subject: "Fights",
        prompt: `Name one opponent ${fighter.name} beat by ${methodLabel(methodFight.methodCategory)} in the UFC.`,
        answer,
        aliases: sameMethodOpponents.slice(1),
        explanation: `${fighter.name}'s UFC ledger includes a ${methodLabel(methodFight.methodCategory)} win over ${answer}.`,
        fanMisses: wrongOpponents,
        difficultyNudge: 1,
      }));
    }

    const debutYear = Number(fighter.activeFrom.slice(0, 4));
    if (Number.isFinite(debutYear)) {
      questions.push(shortQuestion({
        id: `average-fan:ufc:g5:${fighter.id}:debut-year`,
        sport: "ufc",
        grade: 5,
        subject: "Fighters",
        prompt: `In what year did ${fighter.name}'s UFC career begin?`,
        answer: String(debutYear),
        explanation: `${fighter.name}'s UFC career began in ${debutYear}.`,
        fanMisses: [String(debutYear - 1), String(debutYear + 1)],
        difficultyNudge: 2,
      }));
    }

    const titleFights = fighter.fights.filter((fight) => fight.titleFight);
    if (titleFights.length) {
      const titleFight = titleFights[titleFights.length - 1]!;
      const titleYear = Number(titleFight.date.slice(0, 4));
      const wrongNames = peerValues(fighterNames, fighter.name, `${fighter.id}:title-identity`);
      questions.push(shortQuestion({
        id: `average-fan:ufc:g4:${fighter.id}:title-count`,
        sport: "ufc",
        grade: 4,
        subject: "Championships",
        prompt: `How many UFC title fights did ${fighter.name} have?`,
        answer: String(titleFights.length),
        explanation: `${fighter.name} had ${titleFights.length} UFC title fights.`,
        fanMisses: unique([Math.max(0, titleFights.length - 1), titleFights.length + 1].map(String)),
        difficultyNudge: 1,
      }));
      questions.push(shortQuestion({
        id: `average-fan:ufc:g5:${fighter.id}:title-identity`,
        sport: "ufc",
        grade: 5,
        subject: "Championships",
        prompt: `Which fighter had a UFC title fight against ${titleFight.opponent} in ${titleYear} and recorded a ${titleFight.result}?`,
        answer: fighter.name,
        explanation: `${fighter.name} had that UFC title-fight result against ${titleFight.opponent} in ${titleYear}.`,
        fanMisses: wrongNames,
        difficultyNudge: 2,
      }));
      questions.push(shortQuestion({
        id: `average-fan:ufc:final:${fighter.id}:title`,
        sport: "ufc",
        grade: 5,
        subject: "Championships",
        prompt: `Name the fighter who recorded a ${titleFight.result} against ${titleFight.opponent} in a UFC title fight in ${titleYear}.`,
        answer: fighter.name,
        explanation: `${fighter.name} matches that opponent, title-fight context, year, and result.`,
        fanMisses: wrongNames,
        difficultyNudge: 3,
        protectedFinal: true,
      }));
    } else if (fighter.fights.length >= 5) {
      const fight = fighter.fights[fighter.fights.length - 1]!;
      const year = Number(fight.date.slice(0, 4));
      const wrongNames = peerValues(fighterNames, fighter.name, `${fighter.id}:final-fight`);
      questions.push(shortQuestion({
        id: `average-fan:ufc:final:${fighter.id}:fight`,
        sport: "ufc",
        grade: 5,
        subject: "Fights",
        prompt: `Which fighter recorded a ${fight.result} against ${fight.opponent} in a UFC bout in ${year}?`,
        answer: fighter.name,
        explanation: `${fighter.name} matches that opponent, year, and result in HQ's UFC factual ledger.`,
        fanMisses: wrongNames,
        difficultyNudge: 3,
        protectedFinal: true,
      }));
    }
  }

  questions.push(...knowledgeQuestions("ufc", "Octagon IQ", "average-fan:ufc:iq", UFC_IQ_FACTS));
  return questions;
}

function balancedTake(
  candidates: readonly AverageFanQuestion[],
  target: number,
  subjects: readonly AverageFanSubject[],
) {
  const bySubject = new Map(subjects.map((subject) => [
    subject,
    candidates.filter((question) => question.subject === subject).sort((a, b) => a.id.localeCompare(b.id)),
  ] as const));
  const offsets = new Map(subjects.map((subject) => [subject, 0]));
  const selected: AverageFanQuestion[] = [];

  while (selected.length < target) {
    let progressed = false;
    for (const subject of subjects) {
      if (selected.length >= target) break;
      const queue = bySubject.get(subject) ?? [];
      const offset = offsets.get(subject) ?? 0;
      const next = queue[offset];
      if (!next) continue;
      offsets.set(subject, offset + 1);
      selected.push(next);
      progressed = true;
    }
    if (!progressed) {
      throw new Error(`Average Fan content bank has only ${selected.length} eligible questions for a target of ${target}.`);
    }
  }
  return selected;
}

function buildBank(
  sport: AverageFanSport,
  candidates: readonly AverageFanQuestion[],
  gradeTargets: Record<AverageFanGrade, number>,
  finalTarget: number,
) {
  const subjects = AVERAGE_FAN_SUBJECTS[sport] as readonly AverageFanSubject[];
  const ordinary = ([1, 2, 3, 4, 5] as const).flatMap((grade) => balancedTake(
    candidates.filter((question) => !question.protectedFinal && question.grade === grade),
    gradeTargets[grade],
    subjects,
  ));
  const finals = balancedTake(
    candidates.filter((question) => question.protectedFinal),
    finalTarget,
    subjects,
  );
  const bank = [...ordinary, ...finals];
  const ids = new Set(bank.map((question) => question.id));
  if (ids.size !== bank.length) throw new Error(`Average Fan ${sport} bank contains duplicate ids.`);
  return bank;
}

export const averageFanNflQuestionBank = buildBank(
  "nfl",
  footballCandidates("NFL"),
  FOOTBALL_GRADE_TARGETS,
  AVERAGE_FAN_FINAL_TARGETS.nfl,
);

export const averageFanCfbQuestionBank = buildBank(
  "cfb",
  footballCandidates("CFB"),
  FOOTBALL_GRADE_TARGETS,
  AVERAGE_FAN_FINAL_TARGETS.cfb,
);

export const averageFanUfcQuestionBank = buildBank(
  "ufc",
  ufcCandidates(),
  UFC_GRADE_TARGETS,
  AVERAGE_FAN_FINAL_TARGETS.ufc,
);

export const AVERAGE_FAN_CONTENT_BANKS = {
  nfl: averageFanNflQuestionBank,
  cfb: averageFanCfbQuestionBank,
  ufc: averageFanUfcQuestionBank,
} as const;

export function averageFanBankSummary(sport: AverageFanSport) {
  const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
  return {
    total: bank.length,
    finals: bank.filter((question) => question.protectedFinal).length,
    formats: Object.fromEntries(
      ["short-answer", "three-choice", "true-false"].map((format) => [
        format,
        bank.filter((question) => question.format === format).length,
      ]),
    ),
    grades: Object.fromEntries(
      [1, 2, 3, 4, 5].map((grade) => [
        grade,
        bank.filter((question) => question.grade === grade && !question.protectedFinal).length,
      ]),
    ),
    subjects: Object.fromEntries(
      (AVERAGE_FAN_SUBJECTS[sport] as readonly string[]).map((subject) => [
        subject,
        bank.filter((question) => question.subject === subject).length,
      ]),
    ),
    currentEvents: bank.filter((question) => question.contentType === "current-event").length,
  };
}
