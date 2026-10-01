import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import { ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import { stableLineupHash } from "../play/lineupModel";
import { BAR_TRIVIA_CURRENT_EVENT_QUESTIONS } from "../play/barTriviaCurrentEvents";
import type { BarTriviaQuestion } from "./barTriviaEngine";
import { BAR_TRIVIA_QUESTION_BANK } from "../play/barTriviaQuestionBank";
import {
  AVERAGE_FAN_PLAYABLE_GRADES,
  AVERAGE_FAN_SUBJECTS,
  assertAverageFanQuestion,
  type AverageFanGrade,
  type AverageFanPlayableGrade,
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

export const AVERAGE_FAN_CURRENT_EVENT_POOL_TARGETS = {
  nfl: 10,
  cfb: 10,
  ufc: 10,
} as const;

const FOOTBALL_GRADE_TARGETS: Record<AverageFanPlayableGrade, number> = {
  2: 40,
  3: 40,
  4: 40,
  5: 85,
};

const UFC_GRADE_TARGETS: Record<AverageFanPlayableGrade, number> = {
  2: 80,
  3: 80,
  4: 80,
  5: 170,
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
  count = 3,
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

function knowledgeChoiceWrongChoices(fact: KnowledgeFact) {
  const authored = unique(fact.wrong)
    .filter((choice) => normalizeAcceptedValue(choice) !== normalizeAcceptedValue(fact.answer));
  const normalized = new Set(authored.map(normalizeAcceptedValue));
  if (authored.length !== 3 || normalized.size !== 3) {
    throw new Error(`Average Fan four-choice fact ${fact.id} must author exactly three unique distractors.`);
  }
  return authored;
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

function fourChoiceOrder(
  questionId: string,
  answer: string,
  wrongChoices: readonly string[],
): [string, string, string, string] {
  const wrong = unique(wrongChoices).filter((choice) => choice !== answer).slice(0, 3);
  if (wrong.length !== 3) throw new Error(`Average Fan choice question ${questionId} needs three wrong choices.`);
  const choices = [answer, wrong[0]!, wrong[1]!, wrong[2]!] as [string, string, string, string];
  const offset = stableOffset(`${questionId}:choice-order`, choices.length);
  return choices.map((_, index) => choices[(index + offset) % choices.length]!) as [string, string, string, string];
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
  return assertAverageFanQuestion({
    id: seed.id,
    sport: seed.sport,
    grade: seed.grade,
    subject: seed.subject,
    format: "four-choice",
    prompt: seed.prompt,
    answer: seed.answer,
    aliases: seed.aliases ?? [],
    choices: fourChoiceOrder(seed.id, seed.answer, seed.wrongChoices),
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
  aliases?: readonly string[];
  wrong: readonly [string, string] | readonly [string, string, string];
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
  { id: "center-snap", grade: 1, prompt: "Which position normally snaps the ball to begin an offensive play?", answer: "Center", wrong: ["Guard", "Tight end", "Tackle"], explanation: "The center snaps the football to the quarterback or another back to start the play." },
  { id: "nickel", grade: 1, prompt: "What nickname is used for a defense with five defensive backs?", answer: "Nickel", wrong: ["Dime", "Goal line"], explanation: "Nickel personnel uses five defensive backs." },
  { id: "dime", grade: 2, prompt: "What nickname is used for a defense with six defensive backs?", answer: "Dime", wrong: ["Nickel", "Bear"], explanation: "Dime personnel uses six defensive backs." },
  { id: "blitz", grade: 1, prompt: "What is it called when a defense sends extra rushers after the quarterback?", answer: "Blitz", wrong: ["Spy", "Contain", "Stunt"], explanation: "A blitz commits additional defenders to the pass rush." },
  { id: "play-action", grade: 2, prompt: "What play concept begins with a fake handoff before the quarterback attempts a pass?", answer: "Play action", wrong: ["Screen pass", "Draw"], explanation: "Play action uses a run fake to influence defenders before a pass." },
  { id: "shotgun", grade: 1, prompt: "What formation places the quarterback several yards behind the center for the snap?", answer: "Shotgun", wrong: ["I formation", "Goal line"], explanation: "In shotgun, the quarterback receives a longer snap while aligned behind the center." },
  { id: "screen", grade: 3, prompt: "What pass concept commonly lets the rush come upfield before throwing short to a receiver with blockers in front?", answer: "Screen pass", wrong: ["Fade", "Hail Mary", "Slant"], explanation: "A screen invites pressure and then releases the ball short behind the rush." },
  { id: "draw", grade: 3, prompt: "What run concept initially looks like a pass before the ball carrier takes the handoff?", answer: "Draw", wrong: ["Counter", "Jet sweep"], explanation: "A draw play sells pass before developing as a run." },
  { id: "rpo", grade: 2, prompt: "What does RPO stand for in football?", answer: "Run-pass option", wrong: ["Reverse-pass option", "Run-protection order"], explanation: "RPO stands for run-pass option." },
  { id: "cover-2", grade: 3, prompt: "How many deep defenders are responsible for the primary deep halves in a basic Cover 2 shell?", answer: "2", wrong: ["1", "3", "4"], explanation: "Cover 2 divides the deep field primarily between two safeties." },
  { id: "cover-3", grade: 3, prompt: "How many primary deep zones are used in a basic Cover 3?", answer: "3", wrong: ["2", "4"], explanation: "Cover 3 divides the deep field into three zones." },
  { id: "cover-4", grade: 4, prompt: "What common coverage nickname is also used for Cover 4?", answer: "Quarters", wrong: ["Cloud", "Robber"], explanation: "Cover 4 is commonly called quarters because four defenders divide the deep field." },
  { id: "qb-spy", grade: 4, prompt: "What defensive assignment designates a player to track a mobile quarterback?", answer: "Quarterback spy", wrong: ["Bracket", "Contain rush", "Robber"], explanation: "A quarterback spy mirrors the quarterback rather than immediately committing elsewhere." },
  { id: "slot", grade: 2, prompt: "Where does a slot receiver typically align?", answer: "Inside the outside receiver", wrong: ["Behind the quarterback", "On the defensive line"], explanation: "The slot is the space inside an outside receiver and outside the offensive line." },
  { id: "edge-rusher", grade: 2, prompt: "Which defender is primarily associated with rushing from the outside edge of the formation?", answer: "Edge rusher", wrong: ["Free safety", "Center"], explanation: "Edge rushers attack from the outside of the offensive front." },
  { id: "mike", grade: 3, prompt: "In common defensive terminology, what does the “Mike” usually identify?", answer: "Middle linebacker", wrong: ["Nickel corner", "Strong safety", "Outside linebacker"], explanation: "Mike is a common label for the middle linebacker." },
  { id: "safety-score", grade: 1, prompt: "How many points is a safety worth?", answer: "2", wrong: ["1", "3"], explanation: "A safety scores two points for the defense." },
  { id: "turnover-on-downs", grade: 1, prompt: "What happens when an offense fails to convert on fourth down and the play does not otherwise change possession?", answer: "Turnover on downs", wrong: ["Automatic punt", "Replay fourth down"], explanation: "The opponent takes possession at the dead-ball spot after a failed fourth-down attempt." },
  { id: "false-start", grade: 2, prompt: "How many yards is the standard penalty for a false start?", answer: "5", wrong: ["10", "15", "20"], explanation: "A false start is a five-yard penalty." },
  { id: "offensive-holding", grade: 3, prompt: "How many yards is the standard NFL penalty for offensive holding?", answer: "10", wrong: ["5", "15"], explanation: "Offensive holding normally carries a 10-yard penalty in the NFL." },
  { id: "11-personnel", grade: 5, prompt: "What personnel grouping uses one running back and one tight end?", answer: "11 personnel", wrong: ["12 personnel", "21 personnel"], explanation: "The first digit counts running backs and the second counts tight ends: 11 personnel uses one of each." },
  { id: "12-personnel", grade: 5, prompt: "What personnel grouping uses one running back and two tight ends?", answer: "12 personnel", wrong: ["11 personnel", "22 personnel", "21 personnel"], explanation: "12 personnel uses one running back and two tight ends." },
  { id: "trips", grade: 5, prompt: "What formation term describes three eligible receivers aligned to the same side?", answer: "Trips", wrong: ["Twins", "Empty"], explanation: "Trips commonly describes a three-receiver surface to one side." },
  { id: "mesh", grade: 5, prompt: "Which passing concept is built around shallow crossing routes that pass close to one another?", answer: "Mesh", wrong: ["Four verts", "Smash"], explanation: "Mesh uses intersecting shallow crossers to stress man and zone coverage." },
  { id: "flood", grade: 5, prompt: "Which passing concept commonly stretches one side of a zone defense at multiple depths?", answer: "Flood", wrong: ["Dagger", "Smash", "Mesh"], explanation: "Flood places receivers at different levels on the same side to high-low zone defenders." },
  { id: "zone-blitz", grade: 5, prompt: "What pressure concept can send a linebacker or defensive back while dropping a defensive lineman into coverage?", answer: "Zone blitz", wrong: ["Prevent defense", "Cover zero"], explanation: "A zone blitz exchanges rush and coverage responsibilities while keeping zone structure behind the pressure." },
  { id: "touchdown-points", grade: 1, prompt: "How many points is a touchdown worth before the try?", answer: "6", wrong: ["3", "7"], explanation: "A touchdown is worth six points before the extra-point or two-point try." },
  { id: "field-goal-points", grade: 1, prompt: "How many points is a successful field goal worth?", answer: "3", wrong: ["2", "6", "1"], explanation: "A successful field goal scores three points." },
  { id: "kneel", grade: 1, prompt: "What play is commonly used by an offense to safely run out the clock at the end of a game?", answer: "Quarterback kneel", wrong: ["Hail Mary", "Onside kick"], explanation: "A quarterback kneel is commonly used to drain the remaining clock safely." },
  { id: "spike", grade: 1, prompt: "What does a quarterback commonly do immediately after the snap to stop the clock?", answer: "Spike the ball", wrong: ["Take a knee", "Throw a screen"], explanation: "An immediate spike is a legal incomplete forward pass used to stop the clock." },

  { id: "audible", grade: 2, prompt: "What is an audible?", answer: "A play change at the line of scrimmage", wrong: ["A defensive substitution", "A replay challenge", "A timeout called by the quarterback"], explanation: "An audible changes the called play or assignment before the snap." },
  { id: "hard-count", grade: 2, prompt: "What is a hard count designed to make the defense do?", answer: "Jump early", wrong: ["Call timeout", "Drop into zone"], explanation: "A hard count varies the quarterback's cadence to try to draw defenders offside." },
  { id: "motion", grade: 2, prompt: "What is pre-snap motion?", answer: "An eligible player moving before the snap", wrong: ["The quarterback scrambling", "A lineman pulling after the snap"], explanation: "Pre-snap motion sends an eligible player across or around the formation before the ball is snapped." },
  { id: "checkdown", grade: 2, prompt: "What is a checkdown in the passing game?", answer: "A short outlet option", wrong: ["A deep post route", "A quarterback sneak", "A screen pass"], explanation: "A checkdown is a shorter outlet target used when deeper reads are unavailable." },

  { id: "bootleg", grade: 3, prompt: "What quarterback action usually defines a bootleg?", answer: "Rolling away from the run fake", wrong: ["Taking a straight drop", "Pitching an option immediately"], explanation: "A bootleg moves the quarterback outside after selling action in another direction." },
  { id: "jet-sweep", grade: 3, prompt: "Which run concept gives or pitches the ball to a receiver already moving across the formation at the snap?", answer: "Jet sweep", wrong: ["Quarterback sneak", "Power dive"], explanation: "A jet sweep uses fast horizontal motion to get the ball carrier to the edge." },
  { id: "bunch", grade: 3, prompt: "What formation term describes three receivers aligned close together?", answer: "Bunch", wrong: ["Empty", "Wishbone", "Pistol"], explanation: "A bunch set clusters multiple receivers tightly to create traffic and leverage." },
  { id: "press", grade: 3, prompt: "What coverage technique places a defensive back tight to a receiver at the line of scrimmage?", answer: "Press coverage", wrong: ["Off coverage", "Prevent coverage"], explanation: "Press coverage challenges a receiver at or near the line of scrimmage." },

  { id: "bracket", grade: 4, prompt: "What does bracket coverage usually mean?", answer: "Two defenders combining on one receiver", wrong: ["A seven-man blitz", "A four-deep zone"], explanation: "Bracket coverage uses two defenders to constrain one receiving threat." },
  { id: "robber", grade: 4, prompt: "What does a 'robber' defender typically do in coverage?", answer: "Drops into an intermediate zone to jump routes", wrong: ["Rushes off the edge every snap", "Plays a deep outside quarter", "Plays man coverage on the slot receiver"], explanation: "A robber defender reads the quarterback and looks to cut off intermediate throws." },
  { id: "stunt", grade: 4, prompt: "What is a defensive-line stunt or twist?", answer: "Rushers exchanging paths after the snap", wrong: ["Safeties swapping deep halves", "Receivers switching sides before the snap"], explanation: "A stunt has pass rushers cross or exchange gaps to stress protection rules." },
  { id: "contain", grade: 4, prompt: "What is the main goal of edge contain?", answer: "Keep the ball carrier or quarterback from escaping outside", wrong: ["Force every play up the middle before the snap", "Double-team the slot receiver"], explanation: "Contain protects the outside edge and turns the play back toward pursuit." },
  { id: "inside-zone", grade: 4, prompt: "What run concept asks blockers to work zone combinations while the back reads interior gaps?", answer: "Inside zone", wrong: ["Jet sweep", "Quarterback draw", "Power"], explanation: "Inside zone uses zone blocking with the runner reading the interior flow." },
  { id: "outside-zone", grade: 4, prompt: "What run concept stretches the defense laterally while the back reads for a cut?", answer: "Outside zone", wrong: ["Power", "Trap"], explanation: "Outside zone creates horizontal stretch before the runner chooses a crease." },
  { id: "hot-route", grade: 4, prompt: "What is a hot route?", answer: "A quick answer built into a pass play against pressure", wrong: ["A deep route run only from the slot", "A route used only in the red zone"], explanation: "A hot route gives the quarterback and receiver a fast response to an unblocked or extra rusher." },
  { id: "leverage", grade: 4, prompt: "In coverage, what does inside or outside leverage describe?", answer: "A defender's alignment relative to the receiver", wrong: ["The offensive line's snap count", "The punt returner's depth", "The defender's depth from the line of scrimmage"], explanation: "Leverage describes where a defender positions himself relative to a receiver and the space he wants to deny." },

  { id: "wham", grade: 5, prompt: "What blocking concept uses a tight end or back to trap an interior defensive lineman from the side?", answer: "Wham", wrong: ["Outside zone", "Reach block"], explanation: "A wham block lets an interior defender penetrate before a tight end or back blocks him from an unexpected angle." },
  { id: "scrape-exchange", grade: 5, prompt: "What option-defense exchange has an edge defender crash inside while a linebacker replaces him outside?", answer: "Scrape exchange", wrong: ["Zone blitz", "Bracket coverage"], explanation: "A scrape exchange changes the usual option responsibilities by having the linebacker replace the crashing edge defender." },
  { id: "smash", grade: 5, prompt: "Which passing concept commonly pairs a short hitch with a corner route on the same side?", answer: "Smash", wrong: ["Mesh", "Four verts", "Flood"], explanation: "Smash stresses a cornerback with a short route underneath and a corner route over the top." },
  { id: "dagger", grade: 5, prompt: "Which passing concept commonly pairs a vertical clear-out with a deep in-breaking route behind it?", answer: "Dagger", wrong: ["Flood", "Wham"], explanation: "Dagger uses a vertical route to clear space for a deep dig or in-breaker." },
  { id: "power", grade: 5, prompt: "Which classic run scheme usually features a pulling backside guard leading through the point of attack?", answer: "Power", wrong: ["Outside zone", "Draw"], explanation: "Power football traditionally uses down blocks plus a pulling guard through the designed gap." },
];

const NFL_TRUE_FALSE_FACTS: readonly NflTrueFalseFact[] = [
  { id: "four-downs", grade: 1, subject: "X’s & O’s", prompt: "An NFL offense normally gets four downs to gain 10 yards for a new first down.", answer: true, explanation: "The offense normally has four downs to gain the 10 yards needed for a new series." },
  { id: "brady-two-teams", grade: 1, subject: "Players", prompt: "Tom Brady played NFL games for both the Patriots and Buccaneers.", answer: true, explanation: "Brady spent his NFL career with New England and Tampa Bay." },
  { id: "pick-six", grade: 1, subject: "X’s & O’s", prompt: "A pick-six is an interception returned for a touchdown.", answer: true, explanation: "Pick-six is the common nickname for an interception returned for six points." },

  { id: "deion-two-champs", grade: 2, subject: "Players", prompt: "Deion Sanders won Super Bowls with both the 49ers and Cowboys.", answer: true, explanation: "Deion Sanders won Super Bowl XXIX with San Francisco and Super Bowl XXX with Dallas." },
  { id: "rice-only-niners", grade: 2, subject: "Players", prompt: "Jerry Rice played his entire NFL career for the 49ers.", answer: false, explanation: "Rice starred for San Francisco but also played for the Raiders and Seahawks." },
  { id: "merger-1970", grade: 2, subject: "NFL History", prompt: "The AFL-NFL merger took full effect for the 1970 season.", answer: true, explanation: "The merged league's conference structure began with the 1970 season." },

  { id: "peyton-two-teams", grade: 3, subject: "Players", prompt: "Peyton Manning won Super Bowls as the starting quarterback for two different franchises.", answer: true, explanation: "Manning won Super Bowl XLI with Indianapolis and Super Bowl 50 with Denver." },
  { id: "warner-drafted", grade: 3, subject: "Players", prompt: "Kurt Warner entered the NFL as a drafted player.", answer: false, explanation: "Kurt Warner went undrafted before becoming an NFL and Super Bowl MVP." },
  { id: "romo-drafted", grade: 3, subject: "Players", prompt: "Tony Romo was selected in the NFL Draft.", answer: false, explanation: "Tony Romo entered the NFL as an undrafted free agent." },

  { id: "two-forward-passes", grade: 4, subject: "X’s & O’s", prompt: "An offense can throw two forward passes on the same play as long as both are released behind the line of scrimmage.", answer: false, explanation: "An NFL play can include only one forward pass." },
  { id: "terrell-davis-first-round", grade: 4, subject: "Players", prompt: "Terrell Davis was a first-round NFL Draft pick.", answer: false, explanation: "Denver selected Terrell Davis in the sixth round of the 1995 NFL Draft." },
  { id: "gates-college-football", grade: 4, subject: "Players", prompt: "Antonio Gates played college football before becoming an NFL tight end.", answer: false, explanation: "Antonio Gates played college basketball at Kent State and did not play college football." },

  { id: "fourth-down-fumble", grade: 5, subject: "X’s & O’s", prompt: "On fourth down, only the offensive player who fumbled may recover and advance that fumble.", answer: true, explanation: "On fourth down, the fumbler is the only offensive player allowed to recover and advance the fumble; a teammate's recovery makes the ball dead." },
  { id: "moon-cfl", grade: 5, subject: "Players", prompt: "Warren Moon began his professional football career in the CFL before starring in the NFL.", answer: true, explanation: "Moon starred for Edmonton in the CFL before beginning his NFL career with Houston." },
  { id: "elway-colts", grade: 5, subject: "NFL History", prompt: "John Elway was drafted by the Baltimore Colts before his rights were traded to Denver.", answer: true, explanation: "Baltimore selected Elway first overall in 1983 and later traded his rights to the Broncos." },

  { id: "lions-thanksgiving", grade: 1, subject: "Teams", prompt: "The Detroit Lions traditionally host an NFL game on Thanksgiving Day.", answer: true, explanation: "Detroit has been one of the NFL's traditional Thanksgiving hosts since the 1930s." },
  { id: "sb1-los-angeles", grade: 1, subject: "NFL History", prompt: "The first Super Bowl was played in Los Angeles.", answer: true, explanation: "The first AFL-NFL World Championship Game was played at the Los Angeles Memorial Coliseum." },

  { id: "texans-2002", grade: 2, subject: "Teams", prompt: "The Houston Texans began NFL play in 2002.", answer: true, explanation: "Houston joined the NFL as an expansion franchise for the 2002 season." },

  { id: "cardinals-arizona", grade: 3, subject: "Teams", prompt: "The Cardinals franchise has played its entire NFL history in Arizona.", answer: false, explanation: "The Cardinals previously played in Chicago and St. Louis before moving to Arizona." },
  { id: "music-city-kickoff", grade: 3, subject: "NFL History", prompt: "The Music City Miracle happened on a kickoff return.", answer: true, explanation: "Tennessee's famous lateral play came on a late kickoff return against Buffalo." },

  { id: "ravens-browns-history", grade: 4, subject: "Teams", prompt: "The Baltimore Ravens officially inherited the original Cleveland Browns' historical records when the franchise moved in 1996.", answer: false, explanation: "Cleveland retained the Browns' name, colors and historical records; Baltimore began a new Ravens history." },
  { id: "immaculate-round", grade: 4, subject: "NFL History", prompt: "The Immaculate Reception happened in an AFC Championship Game.", answer: false, explanation: "The Immaculate Reception came in the 1972 AFC Divisional Playoff against Oakland." },

  { id: "seahawks-two-conferences", grade: 5, subject: "Teams", prompt: "The Seattle Seahawks have played regular seasons as members of both the AFC and NFC.", answer: true, explanation: "Seattle began in the NFC in 1976, moved to the AFC in 1977, and returned to the NFC in 2002." },
];

const NFL_PLAYER_FACTS: readonly KnowledgeFact[] = [
  { id: "beast-mode", grade: 1, prompt: "Which running back is famously nicknamed 'Beast Mode'?", answer: "Marshawn Lynch", wrong: ["Adrian Peterson", "LeSean McCoy", "Derrick Henry"], explanation: "Marshawn Lynch became famous under the Beast Mode nickname." },
  { id: "megatron", grade: 1, prompt: "Which Lions wide receiver is famously nicknamed 'Megatron'?", answer: "Calvin Johnson", wrong: ["Julio Jones", "Larry Fitzgerald"], explanation: "Calvin Johnson became one of Detroit's defining stars under the Megatron nickname." },
  { id: "gronk", grade: 1, prompt: "Which dominant tight end became universally known as 'Gronk'?", answer: "Rob Gronkowski", wrong: ["Travis Kelce", "Tony Gonzalez"], explanation: "Rob Gronkowski became one of the NFL's most recognizable tight ends under the Gronk nickname." },
  { id: "sweetness", grade: 1, prompt: "Which Hall of Fame running back was nicknamed 'Sweetness'?", answer: "Walter Payton", wrong: ["Barry Sanders", "Emmitt Smith", "Earl Campbell"], explanation: "Chicago Bears legend Walter Payton was famously nicknamed Sweetness." },
  { id: "prime-time", grade: 1, prompt: "Which Hall of Fame defensive back was nicknamed 'Prime Time'?", answer: "Deion Sanders", wrong: ["Darrell Green", "Rod Woodson"], explanation: "Deion Sanders built his football persona around the Prime Time nickname." },
  { id: "sheriff", grade: 1, prompt: "Which quarterback was widely nicknamed 'The Sheriff'?", answer: "Peyton Manning", wrong: ["Brett Favre", "Drew Brees"], explanation: "Peyton Manning was widely known as The Sheriff." },

  { id: "lamar-mvp", grade: 2, prompt: "Which Ravens quarterback won the 2019 NFL MVP award?", answer: "Lamar Jackson", wrong: ["Patrick Mahomes", "Josh Allen", "Russell Wilson"], explanation: "Lamar Jackson won the 2019 NFL MVP award in his second season." },
  { id: "mahomes-mvp", grade: 2, prompt: "Which Chiefs quarterback won NFL MVP in the 2018 season?", answer: "Patrick Mahomes", wrong: ["Tom Brady", "Drew Brees"], explanation: "Patrick Mahomes won the 2018 NFL MVP award after his first season as Kansas City's full-time starter." },
  { id: "henry-2020", grade: 2, prompt: "Which running back rushed for more than 2,000 yards in the 2020 season?", answer: "Derrick Henry", wrong: ["Dalvin Cook", "Nick Chubb"], explanation: "Derrick Henry rushed for 2,027 yards in 2020." },
  { id: "moss-23", grade: 2, prompt: "Which receiver caught 23 touchdown passes in the 2007 season?", answer: "Randy Moss", wrong: ["Terrell Owens", "Marvin Harrison", "Jerry Rice"], explanation: "Randy Moss caught 23 touchdown passes for New England in 2007." },
  { id: "brady-50", grade: 2, prompt: "Which quarterback became the first to throw 50 touchdown passes in one NFL season?", answer: "Tom Brady", wrong: ["Peyton Manning", "Dan Marino"], explanation: "Tom Brady threw 50 touchdown passes in 2007." },
  { id: "revis-island", grade: 2, prompt: "Which shutdown cornerback became synonymous with the nickname 'Revis Island'?", answer: "Darrelle Revis", wrong: ["Champ Bailey", "Richard Sherman"], explanation: "Darrelle Revis' man-coverage reputation inspired the Revis Island nickname." },

  { id: "brady-199", grade: 3, prompt: "Which quarterback was selected 199th overall in the 2000 NFL Draft?", answer: "Tom Brady", wrong: ["Drew Brees", "Kurt Warner", "Peyton Manning"], explanation: "New England selected Tom Brady with pick No. 199 in the 2000 NFL Draft." },
  { id: "rodgers-24", grade: 3, prompt: "Which future Packers MVP slid to No. 24 overall in the 2005 NFL Draft?", answer: "Aaron Rodgers", wrong: ["Alex Smith", "Jason Campbell"], explanation: "Green Bay selected Aaron Rodgers 24th overall in 2005." },
  { id: "emmitt-record", grade: 3, prompt: "Who finished his career with an NFL-record 18,355 rushing yards?", answer: "Emmitt Smith", wrong: ["Walter Payton", "Barry Sanders"], explanation: "Emmitt Smith finished his career with 18,355 rushing yards." },
  { id: "rice-record", grade: 3, prompt: "Who finished his career with an NFL-record 22,895 receiving yards?", answer: "Jerry Rice", wrong: ["Larry Fitzgerald", "Terrell Owens", "Randy Moss"], explanation: "Jerry Rice finished his career with 22,895 receiving yards." },
  { id: "dickerson-2105", grade: 3, prompt: "Who rushed for 2,105 yards in the 1984 season?", answer: "Eric Dickerson", wrong: ["Adrian Peterson", "Barry Sanders"], explanation: "Eric Dickerson rushed for 2,105 yards in 1984." },
  { id: "josh-allen-2024-mvp", grade: 3, prompt: "Which Bills quarterback won the AP NFL MVP award for the 2024 season?", answer: "Josh Allen", wrong: ["Lamar Jackson", "Joe Burrow"], explanation: "Josh Allen was named AP NFL MVP for the 2024 season." },

  { id: "aaron-donald-2020-dpoy", grade: 4, prompt: "Which Rams defensive tackle won his third AP Defensive Player of the Year award for the 2020 season?", answer: "Aaron Donald", wrong: ["Chris Jones", "Fletcher Cox", "T. J. Watt"], explanation: "Aaron Donald won AP Defensive Player of the Year for the third time for the 2020 season." },
  { id: "puka-2023-rookie", grade: 4, prompt: "Which Rams receiver set the NFL rookie receiving-yards record with 1,486 yards in the 2023 season?", answer: "Puka Nacua", wrong: ["Ja'Marr Chase", "Justin Jefferson"], explanation: "Puka Nacua set the NFL rookie receiving-yards record with 1,486 yards in 2023." },
  { id: "oj-2000", grade: 4, prompt: "Who became the NFL's first 2,000-yard rusher in 1973?", answer: "O. J. Simpson", wrong: ["Eric Dickerson", "Jim Brown"], explanation: "O. J. Simpson rushed for 2,003 yards in 1973." },
  { id: "van-brocklin-554", grade: 4, prompt: "Who threw for 554 yards in a 1951 game, setting the NFL single-game passing record?", answer: "Norm Van Brocklin", wrong: ["Y. A. Tittle", "Otto Graham", "Dan Marino"], explanation: "Norm Van Brocklin threw for 554 yards in 1951." },
  { id: "rice-sb23", grade: 4, prompt: "Who had 215 receiving yards and won MVP in Super Bowl XXIII?", answer: "Jerry Rice", wrong: ["John Taylor", "Cris Collinsworth"], explanation: "Jerry Rice caught 11 passes for 215 yards and won Super Bowl XXIII MVP." },
  { id: "saquon-2005", grade: 4, prompt: "Which running back rushed for 2,005 yards in the 2024 regular season?", answer: "Saquon Barkley", wrong: ["Derrick Henry", "Jahmyr Gibbs"], explanation: "Saquon Barkley rushed for 2,005 yards for Philadelphia in the 2024 regular season." },
  { id: "peyton-55", grade: 4, prompt: "Which quarterback threw 55 touchdown passes in the 2013 season?", answer: "Peyton Manning", wrong: ["Tom Brady", "Drew Brees", "Patrick Mahomes"], explanation: "Peyton Manning threw 55 touchdown passes for Denver in 2013." },
  { id: "marino-5000", grade: 4, prompt: "Which quarterback became the first NFL player to pass for 5,000 yards in a season?", answer: "Dan Marino", wrong: ["Dan Fouts", "Warren Moon"], explanation: "Dan Marino passed for 5,084 yards in 1984." },

  { id: "cooper-kupp-2021-opoy", grade: 5, prompt: "Which Rams receiver won AP Offensive Player of the Year for the 2021 season and Super Bowl LVI MVP?", answer: "Cooper Kupp", wrong: ["Odell Beckham Jr.", "Davante Adams"], explanation: "Cooper Kupp won 2021 AP Offensive Player of the Year and was named Super Bowl LVI MVP." },
  { id: "joe-burrow-2024-comeback", grade: 5, prompt: "Which quarterback won AP Comeback Player of the Year for the 2024 season?", answer: "Joe Burrow", wrong: ["Sam Darnold", "Kirk Cousins", "Tua Tagovailoa"], explanation: "Joe Burrow won the AP Comeback Player of the Year award for the 2024 season." },
  { id: "warner-414", grade: 5, prompt: "Which quarterback threw for 414 yards in Super Bowl XXXIV?", answer: "Kurt Warner", wrong: ["Steve McNair", "Brett Favre"], explanation: "Kurt Warner threw for 414 yards in the Rams' Super Bowl XXXIV victory." },
  { id: "emmitt-double-mvp", grade: 5, prompt: "Who won both NFL MVP and Super Bowl XXVIII MVP for the 1993 season?", answer: "Emmitt Smith", wrong: ["Troy Aikman", "Steve Young"], explanation: "Emmitt Smith won the 1993 NFL MVP award and Super Bowl XXVIII MVP." },
  { id: "rice-22-td", grade: 5, prompt: "Which receiver caught 22 touchdown passes during the strike-shortened 1987 season?", answer: "Jerry Rice", wrong: ["Sterling Sharpe", "Mark Clayton", "Randy Moss"], explanation: "Jerry Rice caught 22 touchdown passes in 1987." },
  { id: "tomlinson-31", grade: 5, prompt: "Which running back scored 31 rushing-and-receiving touchdowns in the 2006 season?", answer: "LaDainian Tomlinson", wrong: ["Shaun Alexander", "Priest Holmes"], explanation: "LaDainian Tomlinson scored 28 rushing and three receiving touchdowns in 2006." },
  { id: "hurts-sb59", grade: 5, prompt: "Which quarterback won Super Bowl LIX MVP in 2025 after rushing for 72 yards against Kansas City?", answer: "Jalen Hurts", wrong: ["Patrick Mahomes", "Saquon Barkley"], explanation: "Jalen Hurts won Super Bowl LIX MVP and rushed for 72 yards in Philadelphia's win." },
  { id: "dickerson-rookie", grade: 5, prompt: "Which running back rushed for 1,808 yards as a rookie in 1983?", answer: "Eric Dickerson", wrong: ["Earl Campbell", "Barry Sanders", "Adrian Peterson"], explanation: "Eric Dickerson rushed for 1,808 yards in his 1983 rookie season." },

  { id: "donald-position", grade: 1, prompt: "Aaron Donald starred primarily at which position in the NFL?", answer: "Defensive tackle", wrong: ["Linebacker", "Cornerback"], explanation: "Donald was a dominant interior defensive lineman, primarily at defensive tackle." },
  { id: "jefferson-griddy", grade: 1, prompt: "Which star receiver helped make the “Griddy” touchdown celebration famous in the NFL?", answer: "Justin Jefferson", wrong: ["Cooper Kupp", "Davante Adams"], explanation: "Justin Jefferson helped popularize the Griddy celebration in the NFL." },
  { id: "mahomes-drafted-chiefs", grade: 1, prompt: "Which team drafted Patrick Mahomes in 2017?", answer: "Kansas City Chiefs", wrong: ["Chicago Bears", "Houston Texans", "Buffalo Bills"], explanation: "Kansas City selected Mahomes 10th overall in the 2017 NFL Draft." },

  { id: "peterson-2012-mvp", grade: 2, prompt: "Which running back won the 2012 AP NFL MVP after rushing for 2,097 yards?", answer: "Adrian Peterson", wrong: ["Chris Johnson", "Jamaal Charles"], explanation: "Adrian Peterson won the 2012 AP NFL MVP after rushing for 2,097 yards." },
  { id: "odell-catch", grade: 2, prompt: "Which receiver made the famous one-handed touchdown catch against Dallas in 2014?", answer: "Odell Beckham Jr.", wrong: ["Dez Bryant", "Antonio Brown"], explanation: "Odell Beckham Jr.'s one-handed touchdown catch against the Cowboys became an instant NFL highlight." },

  { id: "kupp-triple-crown", grade: 3, prompt: "Which receiver won the receiving triple crown in 2021 by leading the NFL in catches, yards and receiving touchdowns?", answer: "Cooper Kupp", wrong: ["Davante Adams", "Justin Jefferson", "Deebo Samuel"], explanation: "Cooper Kupp led the league in receptions, receiving yards and receiving touchdowns in 2021." },

  { id: "jamal-lewis-295", grade: 4, prompt: "Which Ravens running back rushed for 295 yards in a 2003 game against Cleveland?", answer: "Jamal Lewis", wrong: ["Priest Holmes", "Corey Dillon"], explanation: "Jamal Lewis rushed for 295 yards against Cleveland in 2003, then an NFL single-game record." },
  { id: "ed-reed-2004-dpoy", grade: 4, prompt: "Which Ravens safety won AP Defensive Player of the Year for the 2004 season?", answer: "Ed Reed", wrong: ["Brian Dawkins", "Troy Polamalu"], explanation: "Ed Reed won the 2004 AP Defensive Player of the Year award." },

  { id: "desmond-howard-sb-mvp", grade: 5, prompt: "Which return specialist won Super Bowl XXXI MVP for Green Bay?", answer: "Desmond Howard", wrong: ["Antonio Freeman", "Andre Rison", "Brett Favre"], explanation: "Desmond Howard's return game, including a kickoff-return touchdown, earned him Super Bowl XXXI MVP." },
  { id: "larry-brown-sb-mvp", grade: 5, prompt: "Which Cowboys cornerback won Super Bowl XXX MVP after intercepting two passes?", answer: "Larry Brown", wrong: ["Deion Sanders", "Darren Woodson"], explanation: "Larry Brown intercepted two passes and was named Super Bowl XXX MVP." },
  { id: "dorsett-99-yard", grade: 5, prompt: "Who became the first player to score on a 99-yard rushing touchdown in NFL history?", answer: "Tony Dorsett", wrong: ["Walter Payton", "Eric Dickerson"], explanation: "Tony Dorsett broke a 99-yard touchdown run for Dallas against Minnesota." },
  { id: "tj-watt-225", grade: 5, prompt: "Who tied Michael Strahan's single-season sack record with 22.5 sacks in 2021?", answer: "T. J. Watt", wrong: ["Myles Garrett", "Aaron Donald", "Micah Parsons"], explanation: "T. J. Watt recorded 22.5 sacks for Pittsburgh in 2021." },
  { id: "chris-johnson-scrimmage", grade: 5, prompt: "Which running back set the single-season yards-from-scrimmage record with 2,509 in 2009?", answer: "Chris Johnson", wrong: ["Marshall Faulk", "LaDainian Tomlinson"], explanation: "Chris Johnson totaled 2,509 yards from scrimmage for Tennessee in 2009." },
];

const NFL_TEAM_FACTS: readonly KnowledgeFact[] = [
  { id: "lambeau", grade: 1, prompt: "Which NFL team plays its home games at Lambeau Field?", answer: "Green Bay Packers", wrong: ["Chicago Bears", "Minnesota Vikings", "Detroit Lions"], explanation: "Lambeau Field is the longtime home of the Green Bay Packers." },
  { id: "arrowhead", grade: 1, prompt: "Which NFL team plays at Arrowhead Stadium?", answer: "Kansas City Chiefs", wrong: ["Denver Broncos", "Las Vegas Raiders"], explanation: "Arrowhead Stadium is the home of the Kansas City Chiefs." },
  { id: "terrible-towel", grade: 1, prompt: "Which NFL team is famous for the Terrible Towel?", answer: "Pittsburgh Steelers", wrong: ["Cleveland Browns", "Baltimore Ravens"], explanation: "The Terrible Towel is one of the Pittsburgh Steelers' signature traditions." },
  { id: "who-dat", grade: 1, prompt: "Which NFL team is associated with the 'Who Dat?' chant?", answer: "New Orleans Saints", wrong: ["Atlanta Falcons", "Carolina Panthers", "Tampa Bay Buccaneers"], explanation: "Who Dat is a signature New Orleans Saints chant." },
  { id: "dawg-pound", grade: 1, prompt: "Which fan base is associated with the 'Dawg Pound'?", answer: "Cleveland Browns", wrong: ["Cincinnati Bengals", "Detroit Lions"], explanation: "The Dawg Pound is a famous Cleveland Browns fan identity." },

  { id: "steel-curtain", grade: 2, prompt: "The 'Steel Curtain' defense is associated with which franchise?", answer: "Pittsburgh Steelers", wrong: ["Dallas Cowboys", "Miami Dolphins"], explanation: "The Steel Curtain was the nickname of Pittsburgh's dominant 1970s defense." },
  { id: "legion-boom", grade: 2, prompt: "The 'Legion of Boom' secondary belonged to which team?", answer: "Seattle Seahawks", wrong: ["San Francisco 49ers", "Denver Broncos", "Arizona Cardinals"], explanation: "Seattle's championship-era secondary was nicknamed the Legion of Boom." },
  { id: "purple-people-eaters", grade: 2, prompt: "The 'Purple People Eaters' defensive line belonged to which franchise?", answer: "Minnesota Vikings", wrong: ["Detroit Lions", "Baltimore Colts"], explanation: "Minnesota's feared defensive front was known as the Purple People Eaters." },
  { id: "greatest-show", grade: 2, prompt: "The 'Greatest Show on Turf' nickname belongs to which team era?", answer: "St. Louis Rams", wrong: ["Indianapolis Colts", "Minnesota Vikings"], explanation: "The high-powered St. Louis Rams offense became known as the Greatest Show on Turf." },
  { id: "monsters-midway", grade: 2, prompt: "Which franchise is historically known as the 'Monsters of the Midway'?", answer: "Chicago Bears", wrong: ["Green Bay Packers", "New York Giants", "Detroit Lions"], explanation: "The Monsters of the Midway nickname is historically tied to the Chicago Bears." },

  { id: "orange-crush", grade: 3, prompt: "The 'Orange Crush' defense is associated with which franchise?", answer: "Denver Broncos", wrong: ["Cleveland Browns", "Cincinnati Bengals"], explanation: "Denver's celebrated late-1970s defense was known as the Orange Crush." },
  { id: "hogs", grade: 3, prompt: "The offensive line nicknamed 'The Hogs' is associated with which franchise?", answer: "Washington", wrong: ["Dallas Cowboys", "New York Giants"], explanation: "Washington's dominant offensive line of the 1980s and early 1990s was known as The Hogs." },
  { id: "doomsday", grade: 3, prompt: "The 'Doomsday Defense' nickname is most associated with which franchise?", answer: "Dallas Cowboys", wrong: ["Miami Dolphins", "Pittsburgh Steelers", "Minnesota Vikings"], explanation: "Doomsday Defense became a defining nickname for Dallas' championship-era defenses." },
  { id: "sacksonville", grade: 3, prompt: "Which team had a 2017 defense nicknamed 'Sacksonville'?", answer: "Jacksonville Jaguars", wrong: ["Tennessee Titans", "Carolina Panthers"], explanation: "Jacksonville's 2017 defense became known as Sacksonville." },
  { id: "no-fly-zone", grade: 3, prompt: "The 'No Fly Zone' secondary was a signature of which mid-2010s team?", answer: "Denver Broncos", wrong: ["Seattle Seahawks", "Baltimore Ravens"], explanation: "Denver's championship-era secondary in the mid-2010s was nicknamed the No Fly Zone." },

  { id: "broncos-back-to-back", grade: 4, prompt: "Which franchise won back-to-back Super Bowls XXXII and XXXIII?", answer: "Denver Broncos", wrong: ["Green Bay Packers", "Dallas Cowboys", "San Francisco 49ers"], explanation: "Denver won consecutive championships after the 1997 and 1998 seasons." },
  { id: "cowboys-three-four", grade: 4, prompt: "Which team won three Super Bowls in four seasons during the 1990s?", answer: "Dallas Cowboys", wrong: ["San Francisco 49ers", "Buffalo Bills"], explanation: "Dallas won Super Bowls XXVII, XXVIII, and XXX." },
  { id: "ravens-2000", grade: 4, prompt: "Which franchise won Super Bowl XXXV behind its famous 2000 defense?", answer: "Baltimore Ravens", wrong: ["Tennessee Titans", "New York Giants"], explanation: "Baltimore's dominant 2000 defense helped carry the Ravens to the Super Bowl XXXV title." },
  { id: "bears-only-loss", grade: 4, prompt: "Which team handed the 1985 Bears their only regular-season loss?", answer: "Miami Dolphins", wrong: ["Green Bay Packers", "New York Giants", "Dallas Cowboys"], explanation: "Miami defeated Chicago on Monday Night Football for the Bears' only regular-season loss in 1985." },
  { id: "eagles-lix", grade: 4, prompt: "Which franchise stopped Kansas City from winning a third straight championship by winning Super Bowl LIX in 2025?", answer: "Philadelphia Eagles", wrong: ["Buffalo Bills", "San Francisco 49ers"], explanation: "Philadelphia beat Kansas City 40-22 in Super Bowl LIX." },

  { id: "bills-four-straight", grade: 5, prompt: "Which franchise reached four consecutive Super Bowls from the 1990 through 1993 seasons?", answer: "Buffalo Bills", wrong: ["Denver Broncos", "Minnesota Vikings"], explanation: "Buffalo became the first and only franchise to appear in four straight Super Bowls." },
  { id: "vikings-four-losses", grade: 5, prompt: "Which franchise lost Super Bowls IV, VIII, IX, and XI?", answer: "Minnesota Vikings", wrong: ["Miami Dolphins", "Oakland Raiders", "Buffalo Bills"], explanation: "Minnesota reached Super Bowls IV, VIII, IX, and XI and lost each one." },
  { id: "broncos-three-losses", grade: 5, prompt: "Which franchise lost Super Bowls XXI, XXII, and XXIV before later winning back-to-back titles?", answer: "Denver Broncos", wrong: ["Buffalo Bills", "Minnesota Vikings"], explanation: "Denver lost three Super Bowls in four seasons before winning consecutive titles in the late 1990s." },
  { id: "chiefs-title-gap", grade: 5, prompt: "Which franchise ended a 50-season championship drought by winning Super Bowl LIV in 2020?", answer: "Kansas City Chiefs", wrong: ["San Francisco 49ers", "Philadelphia Eagles"], explanation: "Kansas City won Super Bowl LIV, its first Super Bowl championship since Super Bowl IV." },
  { id: "niners-five-zero", grade: 5, prompt: "Which franchise won each of its first five Super Bowl appearances?", answer: "San Francisco 49ers", wrong: ["Dallas Cowboys", "Pittsburgh Steelers", "New England Patriots"], explanation: "San Francisco started 5-0 in Super Bowls." },

  { id: "americas-team", grade: 1, prompt: "Which franchise is famously nicknamed “America's Team”?", answer: "Dallas Cowboys", wrong: ["Pittsburgh Steelers", "New England Patriots"], explanation: "The Dallas Cowboys have long been known as America's Team." },
  { id: "bills-mafia", grade: 1, prompt: "“Bills Mafia” is the fanbase nickname of which team?", answer: "Buffalo Bills", wrong: ["Detroit Lions", "Cincinnati Bengals"], explanation: "Bills Mafia is the widely used nickname for Buffalo's fanbase." },
  { id: "skol-vikings", grade: 1, prompt: "Which team is known for the “Skol” chant?", answer: "Minnesota Vikings", wrong: ["Green Bay Packers", "Seattle Seahawks", "Buffalo Bills"], explanation: "Skol is a signature Minnesota Vikings chant." },
  { id: "fly-eagles-fly", grade: 1, prompt: "“Fly, Eagles Fly” is the fight song of which NFL franchise?", answer: "Philadelphia Eagles", wrong: ["New York Giants", "New York Jets"], explanation: "Fly, Eagles Fly is the Philadelphia Eagles' fight song." },

  { id: "saints-superdome", grade: 2, prompt: "Which NFL team plays its home games in the Superdome in New Orleans?", answer: "New Orleans Saints", wrong: ["Atlanta Falcons", "Tampa Bay Buccaneers"], explanation: "The New Orleans Saints play their home games in the Superdome." },
  { id: "bengals-who-dey", grade: 2, prompt: "“Who Dey” is the signature chant of which team?", answer: "Cincinnati Bengals", wrong: ["Cleveland Browns", "New Orleans Saints", "Buffalo Bills"], explanation: "Who Dey is the Cincinnati Bengals' signature chant." },
  { id: "seahawks-12s", grade: 2, prompt: "Which franchise calls its fanbase the “12s”?", answer: "Seattle Seahawks", wrong: ["Denver Broncos", "Los Angeles Chargers"], explanation: "Seattle has long celebrated its fans as the 12s." },
  { id: "rams-st-louis", grade: 2, prompt: "Which current Los Angeles team played in St. Louis from 1995 through 2015?", answer: "Los Angeles Rams", wrong: ["Los Angeles Chargers", "Las Vegas Raiders"], explanation: "The Rams played in St. Louis before returning to Los Angeles in 2016." },

  { id: "six-super-bowls", grade: 3, prompt: "Which two franchises were the first pair to reach six Super Bowl victories?", answer: "Pittsburgh Steelers and New England Patriots", wrong: ["Dallas Cowboys and San Francisco 49ers", "Green Bay Packers and New York Giants", "Denver Broncos and Kansas City Chiefs"], explanation: "Pittsburgh reached six Super Bowl wins first, and New England later matched that total." },
  { id: "85-bears", grade: 3, prompt: "Which team is remembered for the dominant 1985 defense and the “Super Bowl Shuffle”?", answer: "Chicago Bears", wrong: ["New York Giants", "Washington"], explanation: "The 1985 Chicago Bears went 15–1 and won Super Bowl XX." },
  { id: "2005-steelers-six-seed", grade: 3, prompt: "Which team became the first No. 6 playoff seed to win the Super Bowl?", answer: "Pittsburgh Steelers", wrong: ["Green Bay Packers", "New York Giants"], explanation: "Pittsburgh entered the 2005 playoffs as the AFC's sixth seed and won Super Bowl XL." },
  { id: "02-bucs-defense", grade: 3, prompt: "Derrick Brooks, Warren Sapp, John Lynch and Ronde Barber anchored which championship defense in 2002?", answer: "Tampa Bay Buccaneers", wrong: ["Baltimore Ravens", "Oakland Raiders", "Pittsburgh Steelers"], explanation: "Those stars led Tampa Bay's dominant defense to a Super Bowl XXXVII title." },

  { id: "84-49ers-18-wins", grade: 4, prompt: "Which team became the first in NFL history to win 18 games in one season, including the playoffs?", answer: "San Francisco 49ers", wrong: ["Chicago Bears", "Pittsburgh Steelers"], explanation: "The 1984 49ers finished 18–1 and won Super Bowl XIX." },
  { id: "04-steelers-streak-snappers", grade: 4, prompt: "Which 2004 team beat the reigning champion Patriots and unbeaten Eagles in back-to-back weeks?", answer: "Pittsburgh Steelers", wrong: ["Baltimore Ravens", "Indianapolis Colts"], explanation: "Pittsburgh ended New England's long winning streak, then beat 7–0 Philadelphia the next week." },
  { id: "11-packers-13-0", grade: 4, prompt: "Which defending Super Bowl champion opened the 2011 season 13–0 before finishing 15–1?", answer: "Green Bay Packers", wrong: ["New Orleans Saints", "New England Patriots", "Indianapolis Colts"], explanation: "Green Bay began 13–0 and finished the 2011 regular season 15–1." },
  { id: "17-eagles-backup-qb", grade: 4, prompt: "Which team won Super Bowl LII after losing starting quarterback Carson Wentz late in the regular season?", answer: "Philadelphia Eagles", wrong: ["Minnesota Vikings", "Los Angeles Rams"], explanation: "Nick Foles took over for the injured Wentz and led Philadelphia to the title." },

  { id: "98-vikings-only-loss", grade: 5, prompt: "Which team handed the 15–1 Minnesota Vikings their only regular-season loss in 1998?", answer: "Tampa Bay Buccaneers", wrong: ["Green Bay Packers", "Atlanta Falcons"], explanation: "Tampa Bay beat Minnesota 27–24 in Week 9." },
  { id: "99-jaguars-titans", grade: 5, prompt: "Jacksonville went 14–2 in 1999, then lost the AFC Championship. Which team handed the Jaguars all three of their losses that season, including the playoffs?", answer: "Tennessee Titans", wrong: ["Baltimore Ravens", "Miami Dolphins", "Indianapolis Colts"], explanation: "Tennessee beat Jacksonville twice in the regular season and again in the AFC title game." },
  { id: "browns-1-31", grade: 5, prompt: "Which franchise went a combined 1–31 across the 2016 and 2017 regular seasons?", answer: "Cleveland Browns", wrong: ["Detroit Lions", "Jacksonville Jaguars"], explanation: "Cleveland went 1–15 in 2016 and 0–16 in 2017." },
  { id: "bucs-26-loss-streak", grade: 5, prompt: "Which expansion franchise began its history with 26 consecutive losses across the 1976 and 1977 seasons?", answer: "Tampa Bay Buccaneers", wrong: ["Seattle Seahawks", "New Orleans Saints"], explanation: "The expansion Buccaneers lost their first 26 regular-season games." },
  { id: "2010-packers-road-run", grade: 5, prompt: "Which team won three straight NFC road playoff games after the 2010 season before winning Super Bowl XLV?", answer: "Green Bay Packers", wrong: ["New York Giants", "Pittsburgh Steelers", "Seattle Seahawks"], explanation: "Green Bay won at Philadelphia, Atlanta and Chicago before beating Pittsburgh in the Super Bowl." },
];

const NFL_HISTORY_FACTS: readonly KnowledgeFact[] = [
  { id: "sb1", grade: 1, prompt: "Which team won the first Super Bowl?", answer: "Green Bay Packers", wrong: ["Kansas City Chiefs", "Dallas Cowboys", "Oakland Raiders"], explanation: "Green Bay beat Kansas City 35-10 in the first Super Bowl." },
  { id: "perfect", grade: 1, prompt: "Which franchise completed the famous perfect 1972 season?", answer: "Miami Dolphins", wrong: ["Pittsburgh Steelers", "Dallas Cowboys"], explanation: "Miami finished the 1972 season undefeated and won Super Bowl VII." },
  { id: "lombardi", grade: 1, prompt: "The Super Bowl trophy is named for which legendary coach?", answer: "Vince Lombardi", wrong: ["Don Shula", "Tom Landry"], explanation: "The NFL championship trophy was named the Vince Lombardi Trophy in 1970." },
  { id: "helmet", grade: 1, prompt: "Who made the famous Helmet Catch for the Giants in Super Bowl XLII?", answer: "David Tyree", wrong: ["Plaxico Burress", "Victor Cruz", "Mario Manningham"], explanation: "David Tyree pinned Eli Manning's pass against his helmet on the Giants' winning drive." },
  { id: "immaculate", grade: 1, prompt: "Which Steelers player made the Immaculate Reception?", answer: "Franco Harris", wrong: ["Lynn Swann", "John Stallworth"], explanation: "Franco Harris scored on the Immaculate Reception in the 1972 AFC Divisional Playoff." },
  { id: "brady-comeback", grade: 1, prompt: "Which quarterback led New England's comeback from 28-3 down in Super Bowl LI?", answer: "Tom Brady", wrong: ["Matt Ryan", "Jimmy Garoppolo"], explanation: "Tom Brady led New England past Atlanta 34-28 in the first overtime Super Bowl." },

  { id: "the-catch", grade: 2, prompt: "Joe Montana's touchdown pass to Dwight Clark in the 1981 NFC Championship became known by what nickname?", answer: "The Catch", wrong: ["The Drive", "The Miracle", "The Immaculate Reception"], explanation: "Montana-to-Clark against Dallas became one of the NFL's defining playoff plays: The Catch." },
  { id: "beast-quake", grade: 2, prompt: "Which running back's playoff touchdown run became known as Beast Quake?", answer: "Marshawn Lynch", wrong: ["Shaun Alexander", "Adrian Peterson"], explanation: "Marshawn Lynch's tackle-breaking touchdown against New Orleans became Beast Quake." },
  { id: "philly-special", grade: 2, prompt: "Which Eagles quarterback caught a touchdown on the Philly Special in Super Bowl LII?", answer: "Nick Foles", wrong: ["Carson Wentz", "Donovan McNabb"], explanation: "Nick Foles caught Trey Burton's touchdown pass on the Philly Special." },
  { id: "butler", grade: 2, prompt: "Who intercepted Russell Wilson at the goal line to seal Super Bowl XLIX?", answer: "Malcolm Butler", wrong: ["Darrelle Revis", "Devin McCourty", "Brandon Browner"], explanation: "Malcolm Butler intercepted Wilson in the final minute to preserve New England's win." },
  { id: "namath", grade: 2, prompt: "Which quarterback famously guaranteed the Jets would win Super Bowl III?", answer: "Joe Namath", wrong: ["Johnny Unitas", "Len Dawson"], explanation: "Joe Namath guaranteed a Jets victory before their upset of Baltimore." },
  { id: "triplets", grade: 2, prompt: "Which running back joined Troy Aikman and Michael Irvin as the Cowboys' 1990s 'Triplets'?", answer: "Emmitt Smith", wrong: ["Tony Dorsett", "Herschel Walker"], explanation: "Aikman, Smith and Irvin powered Dallas' 1990s championship teams." },

  { id: "wide-right", grade: 3, prompt: "Which Bills kicker's miss created the 'Wide Right' ending to Super Bowl XXV?", answer: "Scott Norwood", wrong: ["Steve Christie", "Gary Anderson", "Adam Vinatieri"], explanation: "Scott Norwood's 47-yard attempt went wide right as Buffalo lost 20-19." },
  { id: "the-drive", grade: 3, prompt: "Which quarterback led the 98-yard march remembered as 'The Drive' in the 1986 AFC Championship?", answer: "John Elway", wrong: ["Bernie Kosar", "Dan Marino"], explanation: "John Elway led Denver 98 yards to tie Cleveland late in regulation." },
  { id: "minneapolis", grade: 3, prompt: "Who caught the pass and scored on the Minneapolis Miracle?", answer: "Stefon Diggs", wrong: ["Adam Thielen", "Kyle Rudolph"], explanation: "Stefon Diggs turned the final pass into the game-winning Minneapolis Miracle touchdown." },
  { id: "music-city", grade: 3, prompt: "Who scored the touchdown on the Music City Miracle?", answer: "Kevin Dyson", wrong: ["Frank Wycheck", "Eddie George", "Derrick Mason"], explanation: "Kevin Dyson took the lateral down the sideline for the Music City Miracle touchdown." },
  { id: "first-ot", grade: 3, prompt: "Which Super Bowl was the first to go to overtime?", answer: "Super Bowl LI", wrong: ["Super Bowl XLIX", "Super Bowl LII"], explanation: "New England's comeback against Atlanta in Super Bowl LI produced the first overtime in Super Bowl history." },
  { id: "first-wild-card", grade: 3, prompt: "Which franchise became the first wild-card team to win a Super Bowl?", answer: "Oakland Raiders", wrong: ["Dallas Cowboys", "Pittsburgh Steelers"], explanation: "Oakland won Super Bowl XV after entering the playoffs as a wild card." },

  { id: "randle-el", grade: 4, prompt: "Which Steelers receiver threw a touchdown pass to Hines Ward in Super Bowl XL in 2006?", answer: "Antwaan Randle El", wrong: ["Santonio Holmes", "Cedrick Wilson", "Nate Washington"], explanation: "Antwaan Randle El hit Hines Ward for a 43-yard touchdown." },
  { id: "hester", grade: 4, prompt: "Who returned the opening kickoff of Super Bowl XLI in 2007 for a touchdown?", answer: "Devin Hester", wrong: ["Dante Hall", "Desmond Howard"], explanation: "Devin Hester opened Super Bowl XLI with a 92-yard kickoff-return touchdown." },
  { id: "holmes", grade: 4, prompt: "Which Steelers receiver made the toe-tap game-winning touchdown catch in Super Bowl XLIII in 2009?", answer: "Santonio Holmes", wrong: ["Hines Ward", "Nate Washington"], explanation: "Santonio Holmes caught Ben Roethlisberger's late touchdown in the corner of the end zone." },
  { id: "porter", grade: 4, prompt: "Who intercepted Peyton Manning and returned it for a touchdown late in Super Bowl XLIV in 2010?", answer: "Tracy Porter", wrong: ["Darren Sharper", "Jabari Greer", "Roman Harper"], explanation: "Tracy Porter's pick-six helped seal New Orleans' Super Bowl XLIV victory." },
  { id: "marcus-allen", grade: 4, prompt: "Which Raiders running back scored on a famous 74-yard run in Super Bowl XVIII?", answer: "Marcus Allen", wrong: ["Bo Jackson", "Roger Craig"], explanation: "Marcus Allen reversed field and broke a 74-yard touchdown run in Super Bowl XVIII." },
  { id: "hardman-lviii", grade: 4, prompt: "Who caught the game-winning touchdown in overtime of Super Bowl LVIII in 2024?", answer: "Mecole Hardman", wrong: ["Travis Kelce", "Rashee Rice"], explanation: "Mecole Hardman caught Patrick Mahomes' game-winning 3-yard touchdown pass in overtime." },

  { id: "first-sb-touchdown", grade: 5, prompt: "Who caught the first touchdown pass in Super Bowl history?", answer: "Max McGee", wrong: ["Boyd Dowler", "Jim Taylor", "Paul Hornung"], explanation: "Max McGee caught Bart Starr's 37-yard touchdown pass for the first touchdown in Super Bowl history." },
  { id: "dungy", grade: 5, prompt: "Who became the first Black head coach to win a Super Bowl in 2007?", answer: "Tony Dungy", wrong: ["Lovie Smith", "Mike Tomlin"], explanation: "Tony Dungy coached Indianapolis to victory in Super Bowl XLI." },
  { id: "first-mnf", grade: 5, prompt: "Which two teams played in the first Monday Night Football game in 1970?", answer: "Cleveland Browns and New York Jets", wrong: ["Dallas Cowboys and Washington", "Green Bay Packers and Chicago Bears"], explanation: "Cleveland hosted the New York Jets in the first Monday Night Football game." },
  { id: "sb-name", grade: 5, prompt: "Which championship game was the first for which the 'Super Bowl' name was officially recognized?", answer: "Super Bowl III", wrong: ["Super Bowl I", "Super Bowl V", "Super Bowl IV"], explanation: "The Super Bowl title was officially recognized for the game played in January 1969." },
  { id: "butler-target", grade: 5, prompt: "Which Seahawks receiver was the intended target on Malcolm Butler's goal-line interception in Super Bowl XLIX in 2015?", answer: "Ricardo Lockette", wrong: ["Doug Baldwin", "Jermaine Kearse"], explanation: "Russell Wilson's pass was intended for Ricardo Lockette when Malcolm Butler jumped the route." },
  { id: "music-city-lateral", grade: 5, prompt: "Which Titans tight end threw the lateral across the field on the Music City Miracle?", answer: "Frank Wycheck", wrong: ["Kevin Dyson", "Lorenzo Neal"], explanation: "Frank Wycheck took the handoff and threw the lateral to Kevin Dyson on the Music City Miracle." },

  { id: "bart-starr-first-two", grade: 1, prompt: "Which quarterback led Green Bay to victories in Super Bowls I and II?", answer: "Bart Starr", wrong: ["Joe Namath", "Len Dawson", "Daryle Lamonica"], explanation: "Bart Starr quarterbacked Green Bay to wins in the first two Super Bowls and was MVP of both." },
  { id: "packers-super-bowl-31", grade: 1, prompt: "Which team won Super Bowl XXXI with Brett Favre at quarterback?", answer: "Green Bay Packers", wrong: ["New England Patriots", "Denver Broncos"], explanation: "Green Bay beat New England in Super Bowl XXXI." },
  { id: "saints-first-title", grade: 1, prompt: "Which franchise won its first Super Bowl after the 2009 season?", answer: "New Orleans Saints", wrong: ["Atlanta Falcons", "Carolina Panthers"], explanation: "New Orleans beat Indianapolis in Super Bowl XLIV for the franchise's first championship." },

  { id: "tuck-rule-raiders", grade: 2, prompt: "The famous Tuck Rule playoff game matched New England against which team?", answer: "Oakland Raiders", wrong: ["Pittsburgh Steelers", "New York Jets", "Indianapolis Colts"], explanation: "New England beat Oakland in the snowy 2001 AFC Divisional playoff known for the Tuck Rule decision." },
  { id: "ice-bowl-teams", grade: 2, prompt: "Which two teams played in the 1967 NFL Championship game known as the Ice Bowl?", answer: "Green Bay Packers and Dallas Cowboys", wrong: ["Green Bay Packers and Chicago Bears", "Dallas Cowboys and Cleveland Browns"], explanation: "Green Bay defeated Dallas in the frigid 1967 NFL Championship Game at Lambeau Field." },
  { id: "shula-perfect", grade: 2, prompt: "Which head coach led Miami through its perfect 1972 season?", answer: "Don Shula", wrong: ["Tom Landry", "Chuck Noll"], explanation: "Don Shula coached the 1972 Dolphins to the NFL's only perfect season through the Super Bowl." },

  { id: "double-doink", grade: 3, prompt: "Which team was eliminated by the Eagles after the famous “Double Doink” field-goal miss in the 2018 playoffs?", answer: "Chicago Bears", wrong: ["Minnesota Vikings", "Dallas Cowboys", "Los Angeles Rams"], explanation: "Chicago's potential game-winning field goal hit the upright and crossbar against Philadelphia." },
  { id: "13-seconds", grade: 3, prompt: "The famous “13 Seconds” finish in the 2021 playoffs came in Chiefs vs. which team?", answer: "Buffalo Bills", wrong: ["Cincinnati Bengals", "Tennessee Titans"], explanation: "Kansas City tied Buffalo in the final 13 seconds before winning in overtime." },
  { id: "mile-high-miracle", grade: 3, prompt: "Which team pulled off the “Mile High Miracle” against Denver in the 2012 playoffs?", answer: "Baltimore Ravens", wrong: ["New England Patriots", "Indianapolis Colts"], explanation: "Joe Flacco's late deep touchdown to Jacoby Jones forced overtime for Baltimore." },

  { id: "holy-roller", grade: 4, prompt: "The 1978 “Holy Roller” play that helped prompt a rule change came in a Raiders game against which team?", answer: "San Diego Chargers", wrong: ["Denver Broncos", "Kansas City Chiefs", "Seattle Seahawks"], explanation: "Oakland's chaotic late fumble sequence against San Diego led to a rule limiting who can advance a teammate's fumble late in a game." },
  { id: "miracle-meadowlands", grade: 4, prompt: "Who returned Joe Pisarcik's fumble for the winning touchdown in the 1978 “Miracle at the Meadowlands”?", answer: "Herm Edwards", wrong: ["Bill Bergey", "Ron Jaworski"], explanation: "Herm Edwards scooped the late Giants fumble and scored for Philadelphia." },
  { id: "freezer-bowl", grade: 4, prompt: "Which two teams played the 1981 AFC Championship known as the “Freezer Bowl”?", answer: "Cincinnati Bengals and San Diego Chargers", wrong: ["Cincinnati Bengals and Pittsburgh Steelers", "San Diego Chargers and Miami Dolphins"], explanation: "Cincinnati beat San Diego in brutally cold conditions at Riverfront Stadium." },

  { id: "the-fumble", grade: 5, prompt: "Which Browns running back lost the famous late fumble near Denver's goal line in the 1987 AFC Championship Game?", answer: "Earnest Byner", wrong: ["Kevin Mack", "Ozzie Newsome", "Bernie Kosar"], explanation: "Earnest Byner's late fumble became known simply as The Fumble." },
  { id: "ghost-to-post", grade: 5, prompt: "Which Raiders tight end made the deep overtime catch remembered as “Ghost to the Post” in the 1977 playoffs?", answer: "Dave Casper", wrong: ["Raymond Chester", "Cliff Branch"], explanation: "Dave Casper's long overtime reception set up the winning score against Baltimore." },
  { id: "epic-in-miami", grade: 5, prompt: "Which team beat Miami 41–38 in overtime in the 1981 playoff classic known as the “Epic in Miami”?", answer: "San Diego Chargers", wrong: ["Oakland Raiders", "Cincinnati Bengals"], explanation: "San Diego survived the Dolphins in a 41–38 overtime divisional playoff." },
  { id: "oilers-bills-comeback-qb", grade: 5, prompt: "Which Bills quarterback led the 32-point comeback against Houston in the 1992 playoffs?", answer: "Frank Reich", wrong: ["Jim Kelly", "Doug Flutie", "Joe Ferguson"], explanation: "Backup Frank Reich led Buffalo from a 35–3 deficit to an overtime win." },
];

type NflFinalFact = KnowledgeFact & {
  subject: "Players" | "Teams" | "NFL History" | "X’s & O’s";
  aliases?: readonly string[];
};

const NFL_FINAL_FACTS: readonly NflFinalFact[] = [
  { id: "howley", grade: 5, subject: "Players", prompt: "Name the only player to win Super Bowl MVP while playing for the losing team.", answer: "Chuck Howley", aliases: ["Howley"], wrong: ["Bob Lilly", "Randy White"], explanation: "Dallas linebacker Chuck Howley won Super Bowl V MVP even though the Cowboys lost to Baltimore." },
  { id: "doug-williams", grade: 5, subject: "Players", prompt: "Which quarterback became the first Black starting quarterback to win a Super Bowl and was named Super Bowl XXII MVP?", answer: "Doug Williams", aliases: ["Williams"], wrong: ["Warren Moon", "Steve McNair"], explanation: "Doug Williams led Washington to the Super Bowl XXII title and won game MVP." },
  { id: "steve-young-six", grade: 5, subject: "Players", prompt: "Which quarterback threw six touchdown passes in Super Bowl XXIX?", answer: "Steve Young", aliases: ["Young"], wrong: ["Joe Montana", "Troy Aikman"], explanation: "Steve Young threw six touchdown passes in San Francisco's Super Bowl XXIX victory." },
  { id: "terrell-davis-three", grade: 5, subject: "Players", prompt: "Which running back scored three rushing touchdowns and won MVP in Super Bowl XXXII?", answer: "Terrell Davis", aliases: ["Davis"], wrong: ["John Elway", "Dorsey Levens"], explanation: "Terrell Davis scored three rushing touchdowns and earned Super Bowl XXXII MVP." },

  { id: "bucs-home", grade: 5, subject: "Teams", prompt: "Which franchise became the first to play in and win a Super Bowl in its home stadium in 2021?", answer: "Tampa Bay Buccaneers", aliases: ["Buccaneers", "Bucs", "Tampa Bay"], wrong: ["Los Angeles Rams", "Miami Dolphins"], explanation: "Tampa Bay won Super Bowl LV at Raymond James Stadium." },
  { id: "bears-46", grade: 5, subject: "Teams", prompt: "Which franchise rode the famous '46 defense' to a Super Bowl XX championship?", answer: "Chicago Bears", aliases: ["Bears", "Chicago"], wrong: ["New York Giants", "Pittsburgh Steelers"], explanation: "The 1985 Chicago Bears used Buddy Ryan's 46 defense on the way to winning Super Bowl XX." },
  { id: "raiders-three-cities", grade: 5, subject: "Teams", prompt: "Which franchise reached the Super Bowl while based in Oakland, then Los Angeles, then Oakland again?", answer: "Raiders", aliases: ["Oakland Raiders", "Los Angeles Raiders"], wrong: ["Rams", "Chargers"], explanation: "The Raiders reached Super Bowls from Oakland, then Los Angeles, and later Oakland again." },
  { id: "ravens-two-qbs", grade: 5, subject: "Teams", prompt: "Which franchise won its first two Super Bowls with Trent Dilfer and Joe Flacco as its starting quarterbacks?", answer: "Baltimore Ravens", aliases: ["Ravens", "Baltimore"], wrong: ["Tampa Bay Buccaneers", "New York Giants"], explanation: "Baltimore won Super Bowl XXXV with Trent Dilfer and Super Bowl XLVII with Joe Flacco." },

  { id: "mike-jones", grade: 5, subject: "NFL History", prompt: "Who made the tackle at the one-yard line on the final play of Super Bowl XXXIV?", answer: "Mike Jones", aliases: ["Jones"], wrong: ["Aeneas Williams", "London Fletcher"], explanation: "Rams linebacker Mike Jones tackled Kevin Dyson just short of the goal line to end Super Bowl XXXIV." },
  { id: "jacoby-jones", grade: 5, subject: "NFL History", prompt: "Who opened the second half of Super Bowl XLVII in 2013 with a 108-yard kickoff-return touchdown?", answer: "Jacoby Jones", aliases: ["Jones"], wrong: ["Devin Hester", "Ted Ginn Jr."], explanation: "Jacoby Jones returned the second-half kickoff 108 yards for Baltimore." },
  { id: "stallworth-73", grade: 5, subject: "NFL History", prompt: "Which Steelers receiver caught a 73-yard touchdown from Terry Bradshaw in Super Bowl XIV?", answer: "John Stallworth", aliases: ["Stallworth"], wrong: ["Lynn Swann", "Franco Harris"], explanation: "John Stallworth's 73-yard touchdown catch was a defining play in Pittsburgh's Super Bowl XIV win." },
  { id: "harrison-100", grade: 5, subject: "NFL History", prompt: "Who returned an interception 100 yards for a touchdown in Super Bowl XLIII?", answer: "James Harrison", aliases: ["Harrison"], wrong: ["Troy Polamalu", "Ike Taylor"], explanation: "James Harrison's 100-yard interception return closed the first half of Super Bowl XLIII." },

  { id: "mills", grade: 5, subject: "X’s & O’s", prompt: "Which passing concept commonly pairs a post route with a deep dig underneath it?", answer: "Mills", aliases: ["Mills concept"], wrong: ["Mesh", "Smash"], explanation: "The Mills concept combines a post route with a deep in-breaking dig to stress a safety." },
  { id: "cover-zero", grade: 5, subject: "X’s & O’s", prompt: "What coverage family typically has no deep safety help and uses man coverage across the board?", answer: "Cover 0", aliases: ["Cover zero"], wrong: ["Cover 2", "Cover 4"], explanation: "Cover 0 is a man-coverage pressure structure with no dedicated deep safety." },
  { id: "tampa-two", grade: 5, subject: "X’s & O’s", prompt: "In a classic Tampa 2, which defender is asked to carry the deep middle between the two safeties?", answer: "Middle linebacker", aliases: ["Mike linebacker", "Mike"], wrong: ["Nickel corner", "Defensive end"], explanation: "The middle linebacker drops deeper than in a standard Cover 2 to help close the middle of the field." },
];

const CFB_TRADITION_FACTS: readonly KnowledgeFact[] = [
  { id: "the-game", grade: 1, prompt: "Which two programs play the rivalry commonly called “The Game”?", answer: "Michigan and Ohio State", wrong: ["Alabama and Auburn", "Texas and Oklahoma", "Florida and Georgia"], explanation: "Michigan and Ohio State meet in the rivalry known as The Game." },
  { id: "iron-bowl", grade: 1, prompt: "Which two programs play the Iron Bowl?", answer: "Alabama and Auburn", wrong: ["Georgia and Florida", "Ole Miss and Mississippi State"], explanation: "The Iron Bowl is Alabama versus Auburn." },
  { id: "red-river", grade: 1, prompt: "Which programs play the Red River rivalry?", answer: "Texas and Oklahoma", wrong: ["USC and UCLA", "Iowa and Iowa State"], explanation: "Texas and Oklahoma meet in the Red River rivalry." },
  { id: "army-navy", grade: 1, prompt: "Which service academies play the Army–Navy Game?", answer: "Army and Navy", wrong: ["Army and Air Force", "Navy and Air Force"], explanation: "The Army–Navy Game matches the U.S. Military Academy and U.S. Naval Academy." },
  { id: "egg-bowl", grade: 2, prompt: "Which two programs play the Egg Bowl?", answer: "Ole Miss and Mississippi State", wrong: ["Alabama and Auburn", "Clemson and South Carolina", "Arkansas and LSU"], explanation: "The Egg Bowl is Ole Miss versus Mississippi State." },
  { id: "paul-bunyan", grade: 3, prompt: "Michigan and Michigan State play for which trophy?", answer: "Paul Bunyan Trophy", wrong: ["Little Brown Jug", "Old Oaken Bucket", "Floyd of Rosedale"], explanation: "Michigan and Michigan State compete for the Paul Bunyan Trophy." },
  { id: "axe", grade: 2, prompt: "Minnesota and Wisconsin play for which trophy?", answer: "Paul Bunyan's Axe", wrong: ["Floyd of Rosedale", "Heartland Trophy", "Old Oaken Bucket"], explanation: "Minnesota and Wisconsin compete for Paul Bunyan's Axe." },
  { id: "cy-hawk", grade: 2, prompt: "Which two programs play for the Cy-Hawk Trophy?", answer: "Iowa and Iowa State", wrong: ["Iowa and Minnesota", "Iowa State and Kansas State", "Iowa and Wisconsin"], explanation: "The Cy-Hawk Trophy belongs to the Iowa–Iowa State rivalry." },
  { id: "palmetto", grade: 2, prompt: "Which two programs meet in South Carolina's Palmetto Bowl rivalry?", answer: "Clemson and South Carolina", wrong: ["Georgia and Georgia Tech", "Florida and Florida State", "Kentucky and Louisville"], explanation: "Clemson and South Carolina meet in the Palmetto Bowl rivalry." },
  { id: "bedlam", grade: 2, prompt: "Which two programs are associated with the Bedlam rivalry?", answer: "Oklahoma and Oklahoma State", wrong: ["Oklahoma and Texas", "Oklahoma State and Texas Tech"], explanation: "Bedlam traditionally refers to Oklahoma versus Oklahoma State." },
  { id: "howards-rock", grade: 3, prompt: "Which program is associated with Howard's Rock?", answer: "Clemson", wrong: ["Auburn", "Tennessee"], explanation: "Clemson players touch Howard's Rock before running down the hill into Memorial Stadium." },
  { id: "jump-around", grade: 2, prompt: "Which program is famous for “Jump Around” between the third and fourth quarters at home games?", answer: "Wisconsin", wrong: ["Iowa", "Nebraska"], explanation: "Wisconsin's Camp Randall crowd is famous for Jump Around between the third and fourth quarters." },
  { id: "white-out", grade: 1, prompt: "Which program is most associated with the stadium “White Out” tradition?", answer: "Penn State", wrong: ["Michigan", "Notre Dame", "Ohio State"], explanation: "Penn State's White Out is a signature Beaver Stadium tradition." },
  { id: "script-ohio", grade: 2, prompt: "Which school's marching band performs Script Ohio?", answer: "Ohio State", wrong: ["Michigan", "USC"], explanation: "The Ohio State University Marching Band is famous for Script Ohio." },
  { id: "midnight-yell", grade: 2, prompt: "Which school is known for Midnight Yell?", answer: "Texas A&M", wrong: ["Texas", "LSU"], explanation: "Midnight Yell is a longstanding Texas A&M tradition." },
  { id: "ralphie", grade: 2, prompt: "Which program's live buffalo mascot is named Ralphie?", answer: "Colorado", wrong: ["Buffalo", "Wyoming"], explanation: "Ralphie is the live buffalo mascot associated with Colorado." },
  { id: "sooner-schooner", grade: 2, prompt: "Which program is associated with the Sooner Schooner?", answer: "Oklahoma", wrong: ["Oklahoma State", "Texas Tech", "Nebraska"], explanation: "The Sooner Schooner is an Oklahoma game-day tradition." },
  { id: "renegade", grade: 3, prompt: "Chief Osceola and Renegade are associated with which program?", answer: "Florida State", wrong: ["Florida", "Miami"], explanation: "Florida State's pregame tradition features Chief Osceola and Renegade." },
  { id: "sailgating", grade: 4, prompt: "Which program is famous for “sailgating” to games on the Tennessee River?", answer: "Tennessee", wrong: ["Kentucky", "Arkansas"], explanation: "Fans can arrive by boat near Tennessee's Neyland Stadium, a tradition known as sailgating." },
  { id: "victory-bell", grade: 3, prompt: "USC and UCLA compete for which rivalry trophy?", answer: "Victory Bell", wrong: ["Jeweled Shillelagh", "Stanford Axe", "Old Oaken Bucket"], explanation: "USC and UCLA play for the Victory Bell." },
  { id: "floyd-rosedale", grade: 5, prompt: "Iowa and Minnesota play for which trophy?", answer: "Floyd of Rosedale", wrong: ["Heartland Trophy", "Little Brown Jug", "Paul Bunyan's Axe"], explanation: "Iowa and Minnesota compete for Floyd of Rosedale." },
  { id: "old-oaken-bucket", grade: 5, prompt: "Indiana and Purdue play for which trophy?", answer: "Old Oaken Bucket", wrong: ["Old Brass Spittoon", "Illibuck", "Little Brown Jug"], explanation: "Indiana and Purdue compete for the Old Oaken Bucket." },
  { id: "jeweled-shillelagh", grade: 5, prompt: "Notre Dame and USC play for which trophy?", answer: "Jeweled Shillelagh", wrong: ["Victory Bell", "Legends Trophy", "Paul Bunyan Trophy"], explanation: "Notre Dame and USC compete for the Jeweled Shillelagh." },
  { id: "stanford-axe", grade: 5, prompt: "Stanford and California play for which trophy?", answer: "Stanford Axe", wrong: ["Territorial Cup", "Victory Bell", "Paul Bunyan's Axe"], explanation: "Stanford and Cal compete for the Stanford Axe." },
  { id: "golden-boot", grade: 5, prompt: "LSU and Arkansas play for which trophy?", answer: "Golden Boot", wrong: ["Magnolia Bowl Trophy", "Tiger Rag", "Floyd of Rosedale"], explanation: "LSU and Arkansas compete for the Golden Boot." },
];

type CfbCuratedGradeFiveFact = KnowledgeFact & {
  subject: "Players" | "Programs" | "Traditions" | "CFB History";
};

const CFB_CURATED_GRADE_FIVE_FACTS: readonly CfbCuratedGradeFiveFact[] = [
  { id: "burrow-2019-sixty-td", grade: 5, subject: "Players", prompt: "Which LSU quarterback threw 60 touchdown passes during the 2019 national-championship season?", answer: "Joe Burrow", wrong: ["Tua Tagovailoa", "Trevor Lawrence", "Jalen Hurts"], explanation: "Joe Burrow threw 60 touchdown passes during LSU's 15-0 championship season in 2019." },
  { id: "elliott-2014-title-rushing", grade: 5, subject: "Players", prompt: "Which Ohio State running back rushed for 246 yards against Oregon in the national championship game after the 2014 season?", answer: "Ezekiel Elliott", wrong: ["Carlos Hyde", "J. K. Dobbins"], explanation: "Ezekiel Elliott rushed for 246 yards and four touchdowns in Ohio State's championship win over Oregon." },
  { id: "watson-2016-title-420", grade: 5, subject: "Players", prompt: "Which Clemson quarterback threw for 420 yards in the national championship win over Alabama after the 2016 season?", answer: "Deshaun Watson", wrong: ["Tajh Boyd", "Kelly Bryant"], explanation: "Deshaun Watson threw for 420 yards and three touchdowns as Clemson beat Alabama for the title." },
  { id: "daniels-2023-heisman", grade: 5, subject: "Players", prompt: "Which LSU quarterback won the 2023 Heisman Trophy after accounting for 50 touchdowns that season?", answer: "Jayden Daniels", wrong: ["Bo Nix", "Michael Penix Jr.", "Caleb Williams"], explanation: "Jayden Daniels won the 2023 Heisman after throwing 40 touchdown passes and rushing for 10 scores." },
  { id: "hunter-biletnikoff-bednarik", grade: 5, subject: "Players", prompt: "Which Colorado star won both the Biletnikoff Award and the Bednarik Award in 2024?", answer: "Travis Hunter", wrong: ["Tetairoa McMillan", "Will Johnson"], explanation: "Travis Hunter won the 2024 Biletnikoff Award as the top receiver and the Bednarik Award as the top defensive player." },
  { id: "bennett-double-cfp-mvp", grade: 5, subject: "Players", prompt: "Which Georgia quarterback was the offensive MVP of both the Orange Bowl semifinal and the national championship game during the 2021 title run?", answer: "Stetson Bennett", wrong: ["JT Daniels", "Jake Fromm"], explanation: "Stetson Bennett earned offensive MVP honors in Georgia's CFP semifinal win over Michigan and its championship win over Alabama." },
  { id: "renfrow-title-catch", grade: 5, subject: "Players", prompt: "Who caught Clemson's game-winning touchdown with one second left against Alabama in the 2016 season's CFP title game?", answer: "Hunter Renfrow", wrong: ["Mike Williams", "Artavis Scott", "Jordan Leggett"], explanation: "Hunter Renfrow caught Deshaun Watson's two-yard touchdown with one second left to give Clemson the national title." },
  { id: "wuerffel-heisman-title", grade: 5, subject: "Players", prompt: "Which Florida quarterback won the 1996 Heisman Trophy and then led the Gators to the national championship?", answer: "Danny Wuerffel", wrong: ["Rex Grossman", "Jesse Palmer"], explanation: "Danny Wuerffel won the 1996 Heisman Trophy and quarterbacked Florida to its first national championship." },

  { id: "ohio-state-four-seed", grade: 5, subject: "Programs", prompt: "Which program became the first No. 4 seed to win the College Football Playoff, beating Alabama and Oregon after the 2014 season?", answer: "Ohio State", wrong: ["TCU", "Florida State"], explanation: "Ohio State entered the inaugural CFP as the No. 4 seed, beat Alabama in the semifinal, and defeated Oregon for the title." },
  { id: "tennessee-first-bcs", grade: 5, subject: "Programs", prompt: "Which program won the first BCS National Championship Game after the 1998 season?", answer: "Tennessee", wrong: ["Florida State", "Nebraska", "Ohio State"], explanation: "Tennessee beat Florida State in the Fiesta Bowl to win the first BCS national championship." },
  { id: "utah-sugar-alabama", grade: 5, subject: "Programs", prompt: "Which program completed a 13-0 season by beating Alabama in the Sugar Bowl after the 2008 season?", answer: "Utah", wrong: ["Boise State", "TCU"], explanation: "Utah finished 13-0 after defeating Alabama 31-17 in the Sugar Bowl." },

  { id: "little-brown-jug", grade: 5, subject: "Traditions", prompt: "Michigan and Minnesota play for which rivalry trophy?", answer: "Little Brown Jug", wrong: ["Paul Bunyan Trophy", "Heartland Trophy", "Old Oaken Bucket"], explanation: "Michigan and Minnesota compete for the Little Brown Jug." },
  { id: "old-brass-spittoon", grade: 5, subject: "Traditions", prompt: "Indiana and Michigan State play for which rivalry trophy?", answer: "Old Brass Spittoon", wrong: ["Old Oaken Bucket", "Land Grant Trophy", "Paul Bunyan Trophy"], explanation: "Indiana and Michigan State compete for the Old Brass Spittoon." },
  { id: "illibuck", grade: 5, subject: "Traditions", prompt: "Illinois and Ohio State play for which rivalry trophy?", answer: "Illibuck", wrong: ["Illini-Buckeye Cup", "Victory Bell", "Old Brass Spittoon"], explanation: "Illinois and Ohio State compete for the Illibuck trophy." },

  { id: "stanford-usc-2007", grade: 5, subject: "CFB History", prompt: "Which powerhouse did Stanford upset 24-23 in 2007 during Jim Harbaugh's first season as head coach?", answer: "USC", wrong: ["Oregon", "UCLA"], explanation: "Stanford stunned USC 24-23 at the Los Angeles Memorial Coliseum in 2007." },
  { id: "watts-jackson-2015", grade: 5, subject: "CFB History", prompt: "Who scored Michigan State's winning touchdown on the botched-punt return against Michigan in 2015?", answer: "Jalen Watts-Jackson", wrong: ["LJ Scott", "Aaron Burbridge", "Connor Cook"], explanation: "Jalen Watts-Jackson returned the mishandled punt for the game-winning touchdown as time expired." },
  { id: "kick-six-chris-davis", grade: 5, subject: "CFB History", prompt: "Who returned Alabama's missed field goal for Auburn's Kick Six touchdown in 2013?", answer: "Chris Davis", wrong: ["Tre Mason", "Ricardo Louis"], explanation: "Chris Davis returned the missed field goal for the walk-off touchdown that gave Auburn the 2013 Iron Bowl." },
];

const UFC_IQ_FACTS: readonly KnowledgeFact[] = [
  { id: "title-rounds", grade: 1, prompt: "How many rounds is a standard UFC championship bout scheduled for?", answer: "5", wrong: ["3", "7", "4"], explanation: "UFC championship bouts are scheduled for five rounds." },
  { id: "standard-rounds", grade: 1, prompt: "How many rounds is a standard non-title UFC bout usually scheduled for?", answer: "3", wrong: ["2", "5"], explanation: "Most non-title UFC bouts are scheduled for three rounds." },
  { id: "round-length", grade: 1, prompt: "How long is a standard UFC round?", answer: "5 minutes", wrong: ["3 minutes", "10 minutes"], explanation: "Standard UFC rounds are five minutes long." },
  { id: "ten-point-must", grade: 1, prompt: "What scoring system is used for UFC rounds?", answer: "10-point must system", wrong: ["Five-point must system", "Rally scoring"], explanation: "UFC judging uses the 10-point must system." },
  { id: "round-winner", grade: 2, prompt: "Under the 10-point must system, how many points does the round winner normally receive?", answer: "10", wrong: ["9", "11", "8"], explanation: "The winner of a round normally receives 10 points." },
  { id: "tko", grade: 1, prompt: "What abbreviation is used for a technical knockout?", answer: "TKO", wrong: ["SUB", "DEC"], explanation: "TKO stands for technical knockout." },
  { id: "submission", grade: 1, prompt: "What result is recorded when a fighter taps or verbally concedes to a hold?", answer: "Submission", wrong: ["Decision", "No contest"], explanation: "A tap or verbal concession to a legal hold produces a submission result." },
  { id: "unanimous", grade: 2, prompt: "What type of decision occurs when all three judges pick the same winner?", answer: "Unanimous decision", wrong: ["Split decision", "Majority draw"], explanation: "A unanimous decision means all three judges scored the fight for the same fighter." },
  { id: "split", grade: 2, prompt: "What type of decision occurs when two judges pick one fighter and the third picks the other?", answer: "Split decision", wrong: ["Unanimous decision", "Technical decision", "Majority decision"], explanation: "A split decision has two judges for one fighter and one judge for the other." },
  { id: "majority", grade: 3, prompt: "What type of decision occurs when two judges pick the same winner and the third scores the fight a draw?", answer: "Majority decision", wrong: ["Split decision", "Unanimous decision"], explanation: "A majority decision has two cards for the winner and one draw." },
  { id: "rear-naked", grade: 2, prompt: "A rear-naked choke is what type of finishing technique?", answer: "Submission", wrong: ["Kick", "Takedown"], explanation: "A rear-naked choke is a submission hold." },
  { id: "guillotine", grade: 2, prompt: "A guillotine is what type of finishing technique?", answer: "Submission", wrong: ["Elbow strike", "Sweep"], explanation: "A guillotine is a choke submission." },
  { id: "armbar", grade: 2, prompt: "An armbar primarily attacks which joint?", answer: "Elbow", wrong: ["Knee", "Ankle", "Shoulder"], explanation: "An armbar hyperextends the elbow joint." },
  { id: "triangle", grade: 3, prompt: "Which body part is primarily used to form a triangle choke around an opponent?", answer: "Legs", wrong: ["Forearms", "Shoulders"], explanation: "A triangle choke uses the legs to trap the opponent's neck and an arm." },
  { id: "kimura", grade: 4, prompt: "A kimura primarily attacks which joint?", answer: "Shoulder", wrong: ["Knee", "Wrist"], explanation: "A kimura is a shoulder lock." },
  { id: "double-leg", grade: 2, prompt: "What wrestling takedown attacks both of an opponent's legs?", answer: "Double-leg takedown", wrong: ["Arm drag", "Hip toss"], explanation: "A double-leg takedown attacks both legs." },
  { id: "sprawl", grade: 2, prompt: "What defensive movement is commonly used to stop a wrestling shot by driving the hips back and down?", answer: "Sprawl", wrong: ["Shrimp", "Granby roll", "Sit-out"], explanation: "A sprawl is a fundamental defense against takedown shots." },
  { id: "southpaw", grade: 2, prompt: "Which side is forward in a standard southpaw stance?", answer: "Right side", wrong: ["Left side", "Neither side"], explanation: "A southpaw stance places the right hand and right foot forward." },
  { id: "orthodox", grade: 2, prompt: "Which side is forward in a standard orthodox stance?", answer: "Left side", wrong: ["Right side", "Neither side"], explanation: "An orthodox stance places the left hand and left foot forward." },
  { id: "clinch", grade: 1, prompt: "What term describes close-range grappling while both fighters are standing?", answer: "Clinch", wrong: ["Guard", "Mount"], explanation: "The clinch is close-range standing grappling." },
  { id: "ground-pound", grade: 1, prompt: "What term describes striking an opponent while the fight is on the ground?", answer: "Ground-and-pound", wrong: ["Wall-and-stall", "Lay-and-pray", "Dirty boxing"], explanation: "Ground-and-pound refers to striking from a grounded grappling position." },
  { id: "mount", grade: 3, prompt: "What grappling position has the top fighter sitting over the opponent's torso with both legs outside?", answer: "Mount", wrong: ["Closed guard", "North-south"], explanation: "Mount is a dominant top position over the opponent's torso." },
  { id: "guard", grade: 3, prompt: "What grappling term describes a bottom fighter using the legs to control or attack an opponent?", answer: "Guard", wrong: ["Mount", "Back control"], explanation: "Guard is a bottom grappling position built around leg control." },
  { id: "underhook", grade: 4, prompt: "What clinch control is created by placing an arm underneath an opponent's arm?", answer: "Underhook", wrong: ["Overhand", "Whizzer kick"], explanation: "An underhook places the arm underneath the opponent's arm to gain upper-body control." },
  { id: "jab", grade: 1, prompt: "Which straight punch is normally thrown with the lead hand?", answer: "Jab", wrong: ["Cross", "Uppercut", "Hook"], explanation: "The jab is the standard lead-hand straight punch." },
  { id: "cross", grade: 2, prompt: "Which straight punch is normally thrown with the rear hand?", answer: "Cross", wrong: ["Jab", "Lead hook"], explanation: "The cross is the standard rear-hand straight punch." },
  { id: "whizzer", grade: 5, prompt: "In wrestling-heavy MMA terminology, what is another common name for an overhook used to counter grappling?", answer: "Whizzer", wrong: ["Underhook", "Body lock"], explanation: "A whizzer is an overhook commonly used to counter takedown and clinch control." },
  { id: "half-guard", grade: 5, prompt: "What guard position has the bottom fighter trapping one of the top fighter's legs?", answer: "Half guard", wrong: ["Full mount", "Side control"], explanation: "In half guard, the bottom fighter controls one of the top fighter's legs." },
  { id: "body-triangle", grade: 5, prompt: "What back-control configuration locks the legs around an opponent's torso in a figure-four shape?", answer: "Body triangle", wrong: ["Closed guard", "Seatbelt grip", "Hooks"], explanation: "A body triangle uses a figure-four leg lock around the torso during back control." },
  { id: "feint", grade: 5, prompt: "What striking term describes a fake attack used to draw a defensive reaction?", answer: "Feint", wrong: ["Frame", "Scramble"], explanation: "A feint is a false attack or movement used to provoke a reaction." },
  { id: "switch-stance", grade: 5, prompt: "What does a fighter do when switching stance?", answer: "Changes which side is forward", wrong: ["Changes weight class", "Moves from standing to guard"], explanation: "Switching stance changes the lead side, such as moving between orthodox and southpaw." },
  { id: "single-leg", grade: 3, prompt: "What wrestling takedown attacks one of an opponent\'s legs?", answer: "Single-leg takedown", wrong: ["Double-leg takedown", "Hip toss"], explanation: "A single-leg takedown attacks one leg and works to finish from that control." },
  { id: "side-control", grade: 3, prompt: "What top grappling position places a fighter across the opponent\'s torso after passing the legs?", answer: "Side control", wrong: ["Closed guard", "Back control", "Half guard"], explanation: "Side control is a dominant top position across the opponent\'s torso after the legs have been passed." },
  { id: "teep", grade: 3, prompt: "What striking term is commonly used for a push kick that helps manage distance?", answer: "Teep", wrong: ["Spinning backfist", "Overhand"], explanation: "A teep is a push kick commonly used to control range and disrupt forward movement." },
  { id: "level-change", grade: 4, prompt: "What wrestling movement lowers a fighter\'s level to threaten or enter a takedown?", answer: "Level change", wrong: ["Switch step", "Hip escape"], explanation: "A level change lowers the hips and body position to set up a wrestling entry." },
  { id: "back-hooks", grade: 4, prompt: "In back control, what are the legs called when they are inserted inside an opponent\'s thighs?", answer: "Hooks", wrong: ["Frames", "Posts"], explanation: "Hooks use the feet and legs inside the opponent\'s thighs to help secure back control." },
  { id: "rear-body-lock", grade: 4, prompt: "What clinch control wraps the arms around an opponent\'s waist or hips from behind?", answer: "Rear body lock", wrong: ["Front headlock", "Double collar tie", "Double underhooks"], explanation: "A rear body lock controls the opponent from behind with the arms locked around the waist or hips." },
  { id: "calf-kick", grade: 4, prompt: "A calf kick is aimed primarily at which area?", answer: "Lower leg", wrong: ["Ribs", "Forearm"], explanation: "A calf kick targets the lower leg around the calf rather than the thigh or upper body." },
  { id: "hip-escape", grade: 5, prompt: "What grappling movement is also commonly called a shrimp?", answer: "Hip escape", wrong: ["Granby roll", "Technical stand-up"], explanation: "The hip escape, often called a shrimp, creates space by moving the hips away from pressure." },
  { id: "frame", grade: 5, prompt: "What grappling term describes using the forearm or other skeletal structure to create and maintain space?", answer: "Frame", wrong: ["Hook", "Whizzer"], explanation: "A frame uses skeletal structure, often the forearm, to manage distance and resist pressure." },
  { id: "pummeling", grade: 5, prompt: "What clinch drill or exchange involves fighting for inside arm position and underhooks?", answer: "Pummeling", wrong: ["Shrimping", "Posting", "Hand fighting"], explanation: "Pummeling is the hand-and-arm battle for inside position and underhooks in the clinch." },
  { id: "cage-cutting", grade: 5, prompt: "What striking-footwork concept limits an opponent\'s escape routes instead of simply following them around the cage?", answer: "Cage cutting", aliases: ["Cutting off", "Cutting off the cage", "Cut off the cage"], wrong: ["Level changing", "Wall walking"], explanation: "Cage cutting uses angles and positioning to reduce an opponent\'s available space and exits." },
];

const UFC_HISTORY_FACTS: readonly KnowledgeFact[] = [
  { id: "ufc1-winner", grade: 1, prompt: "Who won the UFC 1 tournament?", answer: "Royce Gracie", wrong: ["Ken Shamrock", "Gerard Gordeau", "Dan Severn"], explanation: "Royce Gracie won the inaugural UFC tournament in 1993." },
  { id: "ufc1-one-glove", grade: 2, prompt: "Which UFC 1 fighter famously entered the Octagon wearing one boxing glove?", answer: "Art Jimmerson", wrong: ["Kevin Rosier", "Gerard Gordeau"], explanation: "Art Jimmerson wore one red boxing glove against Royce Gracie at UFC 1." },
  { id: "ufc1-headkick", grade: 3, prompt: "Who scored the first head-kick knockout in UFC history?", answer: "Gerard Gordeau", wrong: ["Vitor Belfort", "Marco Ruas"], explanation: "Gerard Gordeau stopped Teila Tuli with the UFC's first head-kick knockout." },
  { id: "ufc3-winner", grade: 4, prompt: "Which alternate won the unusual UFC 3 tournament after fighting only once?", answer: "Steve Jennum", wrong: ["Kimo Leopoldo", "Ken Shamrock"], explanation: "Steve Jennum entered late as an alternate and won UFC 3 after one fight." },
  { id: "ufc4-final", grade: 3, prompt: "Royce Gracie submitted which wrestler to win the UFC 4 tournament?", answer: "Dan Severn", wrong: ["Ken Shamrock", "Oleg Taktarov", "Kimo Leopoldo"], explanation: "Gracie submitted Dan Severn in the UFC 4 tournament final." },
  { id: "ufc5-winner", grade: 4, prompt: "Who won the UFC 5 tournament?", answer: "Dan Severn", wrong: ["Oleg Taktarov", "Ken Shamrock"], explanation: "Dan Severn submitted Dave Beneteau to win UFC 5." },
  { id: "ufc6-winner", grade: 4, prompt: "Who won the UFC 6 tournament by submitting Tank Abbott in the final?", answer: "Oleg Taktarov", wrong: ["Dan Severn", "Ken Shamrock"], explanation: "Oleg Taktarov submitted Tank Abbott to win UFC 6." },
  { id: "first-wheel-kick", grade: 2, prompt: "Who scored the UFC's first spinning wheel-kick knockout?", answer: "Edson Barboza", wrong: ["Stephen Thompson", "Yair Rodriguez"], explanation: "Edson Barboza knocked out Terry Etim with a spinning wheel kick at UFC 142." },
  { id: "gonzaga-crocop", grade: 2, prompt: "Who knocked out Mirko Cro Cop with a head kick at UFC 70?", answer: "Gabriel Gonzaga", wrong: ["Fabricio Werdum", "Junior dos Santos", "Cheick Kongo"], explanation: "Gabriel Gonzaga shocked Cro Cop with a first-round head-kick knockout." },
  { id: "fox-first", grade: 2, prompt: "Who knocked out Cain Velasquez in the UFC's first fight broadcast live on FOX?", answer: "Junior dos Santos", wrong: ["Brock Lesnar", "Alistair Overeem"], explanation: "Junior dos Santos stopped Velasquez to win the heavyweight title in 2011." },
  { id: "sterling-dq-title", grade: 2, prompt: "Who won the UFC bantamweight title by disqualification after Petr Yan landed an illegal knee at UFC 259?", answer: "Aljamain Sterling", wrong: ["Cory Sandhagen", "Henry Cejudo"], explanation: "Petr Yan was disqualified for an illegal knee to Aljamain Sterling at UFC 259." },
  { id: "jones-hamill", grade: 3, prompt: "Jon Jones' lone official UFC loss came by disqualification against whom?", answer: "Matt Hamill", wrong: ["Alexander Gustafsson", "Daniel Cormier"], explanation: "Jones was disqualified against Matt Hamill in 2009." },
  { id: "mcgregor-alvarez", grade: 2, prompt: "Whom did Conor McGregor defeat to become the UFC's first simultaneous two-division champion?", answer: "Eddie Alvarez", wrong: ["Jose Aldo", "Nate Diaz", "Chad Mendes"], explanation: "McGregor stopped Eddie Alvarez at UFC 205 to hold featherweight and lightweight gold simultaneously." },
  { id: "aldo-13", grade: 3, prompt: "How many seconds did Conor McGregor need to knock out Jose Aldo at UFC 194?", answer: "13", wrong: ["7", "21"], explanation: "McGregor stopped Aldo 13 seconds into their featherweight title fight." },
  { id: "edwards-usman-round", grade: 3, prompt: "Leon Edwards' famous head-kick knockout of Kamaru Usman at UFC 278 came in which round?", answer: "Round 5", wrong: ["Round 3", "Round 4"], explanation: "Edwards knocked out Usman late in Round 5 to win the welterweight title." },
  { id: "holloway-gaethje-time", grade: 4, prompt: "Max Holloway knocked out Justin Gaethje at UFC 300 in 2024 with how much time left in Round 5?", answer: "1 second", wrong: ["5 seconds", "10 seconds"], explanation: "Holloway's knockout came at 4:59 of Round 5." },
  { id: "lewis-volkov", grade: 3, prompt: "Derrick Lewis delivered his famous 'my balls was hot' interview after knocking out whom at UFC 229?", answer: "Alexander Volkov", wrong: ["Curtis Blaydes", "Travis Browne", "Francis Ngannou"], explanation: "Lewis stopped Alexander Volkov with 11 seconds left before the memorable interview." },
  { id: "barboza-etim", grade: 4, prompt: "Edson Barboza's spinning wheel-kick knockout at UFC 142 in 2012 came against whom?", answer: "Terry Etim", wrong: ["Ross Pearson", "Anthony Njokuani"], explanation: "Barboza knocked out Terry Etim with the UFC's first spinning wheel-kick finish." },
  { id: "belfort-19", grade: 5, prompt: "How old was Vitor Belfort when he won the UFC 12 heavyweight tournament?", answer: "19", wrong: ["21", "23"], explanation: "Vitor Belfort was 19 when he won the UFC 12 heavyweight tournament." },
  { id: "daley-koscheck", grade: 5, prompt: "Which UFC 113 fighter was released in 2010 after punching Josh Koscheck after the final bell?", answer: "Paul Daley", wrong: ["Thiago Alves", "Dan Hardy"], explanation: "Paul Daley struck Josh Koscheck after the horn and was released from the UFC." },
  { id: "taktarov-nine", grade: 5, prompt: "Oleg Taktarov's nine-second submission at UFC 6 came against whom?", answer: "Anthony Macias", wrong: ["Paul Varelans", "Dave Beneteau", "Tank Abbott"], explanation: "Taktarov submitted Anthony Macias in nine seconds at UFC 6." },
  { id: "first-170", grade: 5, prompt: "Laverne Clark faced whom in the UFC's first 170-pound bout at UFC 16?", answer: "Josh Stewart", wrong: ["Pat Miletich", "Mikey Burnett"], explanation: "UFC's official anniversary history identifies Clark vs. Josh Stewart at UFC 16 as its first 170-pound bout." },
  { id: "first-155", grade: 5, prompt: "Jens Pulver faced whom in the UFC's first 155-pound bout at UFC 26?", answer: "Joao Roque", wrong: ["Caol Uno", "John Lewis"], explanation: "UFC's official anniversary history identifies Pulver vs. Joao Roque at UFC 26 as its first 155-pound bout." },
  { id: "first-125", grade: 4, prompt: "Demetrious Johnson faced whom in one of the two bouts that launched the UFC flyweight division in 2012 at UFC on FX 2?", answer: "Ian McCall", wrong: ["Joseph Benavidez", "John Dodson"], explanation: "Johnson faced Ian McCall as the UFC introduced flyweight with a four-man tournament at UFC on FX 2." },
  { id: "first-fox-time", grade: 5, prompt: "How long did Junior dos Santos need to stop Cain Velasquez in the UFC's 2011 FOX debut?", answer: "64 seconds", wrong: ["48 seconds", "94 seconds", "75 seconds"], explanation: "Dos Santos stopped Velasquez 64 seconds into the first round." },
  { id: "silva-weidman", grade: 3, prompt: "Who ended Anderson Silva's 16-fight UFC winning streak at UFC 162?", answer: "Chris Weidman", wrong: ["Chael Sonnen", "Vitor Belfort"], explanation: "Chris Weidman knocked out Silva at UFC 162 after Silva had won 16 straight UFC fights." },
  { id: "serra-gsp", grade: 3, prompt: "Who upset Georges St-Pierre at UFC 69 to win the welterweight title?", answer: "Matt Serra", wrong: ["Matt Hughes", "Josh Koscheck"], explanation: "Matt Serra stopped St-Pierre in the first round at UFC 69 to win the welterweight championship." },
  { id: "holm-rousey", grade: 2, prompt: "Who knocked out Ronda Rousey with a head kick at UFC 193?", answer: "Holly Holm", wrong: ["Amanda Nunes", "Miesha Tate"], explanation: "Holly Holm stopped Rousey in Round 2 at UFC 193 to win the women's bantamweight title." },
  { id: "diaz-mcgregor", grade: 2, prompt: "Who handed Conor McGregor his first UFC loss by submission at UFC 196?", answer: "Nate Diaz", wrong: ["Dustin Poirier", "Chad Mendes", "Donald Cerrone"], explanation: "Nate Diaz submitted McGregor with a rear-naked choke in Round 2 at UFC 196." },
  { id: "rousey-carmouche", grade: 3, prompt: "Who did Ronda Rousey submit in the UFC's first women's bout?", answer: "Liz Carmouche", wrong: ["Miesha Tate", "Sara McMann"], explanation: "Rousey submitted Liz Carmouche at UFC 157 in the promotion's first women's bout." },
  { id: "usman-masvidal", grade: 4, prompt: "Kamaru Usman's knockout at UFC 261 in 2021 came against which challenger?", answer: "Jorge Masvidal", wrong: ["Colby Covington", "Gilbert Burns"], explanation: "Usman knocked out Jorge Masvidal in their welterweight title rematch at UFC 261." },
];

const UFC_FINAL_FACTS: readonly KnowledgeFact[] = [
  { id: "final-muscle-shark", grade: 5, prompt: "Which former UFC lightweight champion was known as 'The Muscle Shark'?", answer: "Sean Sherk", wrong: ["Jens Pulver", "Kenny Florian"], explanation: "Former lightweight champion Sean Sherk fought under the nickname The Muscle Shark." },
  { id: "final-maine-iac", grade: 5, prompt: "Which former two-time UFC heavyweight champion was nicknamed 'The Maine-iac'?", answer: "Tim Sylvia", wrong: ["Andrei Arlovski", "Josh Barnett"], explanation: "Two-time heavyweight champion Tim Sylvia was known as The Maine-iac." },
  { id: "final-dean-mean", grade: 5, prompt: "Which UFC light heavyweight was known as 'The Dean of Mean'?", answer: "Keith Jardine", wrong: ["Forrest Griffin", "Stephan Bonnar"], explanation: "Keith Jardine fought under the nickname The Dean of Mean." },
  { id: "final-mighty-mouse-defenses", grade: 5, prompt: "How many consecutive UFC title defenses did Demetrious Johnson record during his 2012–2018 flyweight reign?", answer: "11", wrong: ["9", "10"], explanation: "Johnson successfully defended the UFC flyweight title 11 consecutive times." },
  { id: "final-silva-reign", grade: 5, prompt: "How many days did Anderson Silva's UFC middleweight title reign from 2006 to 2013 last?", answer: "2,457 days", wrong: ["2,142 days", "2,237 days"], explanation: "Silva's middleweight title reign lasted a UFC-record 2,457 days." },
  { id: "final-masvidal-five", grade: 5, prompt: "Whom did Jorge Masvidal knock out in five seconds in 2019 for the fastest knockout in UFC history?", answer: "Ben Askren", wrong: ["Darren Till", "Nate Diaz"], explanation: "Masvidal knocked out Ben Askren with a flying knee five seconds into their UFC 239 fight." },
  { id: "final-tuf1", grade: 5, prompt: "Who defeated Stephan Bonnar by unanimous decision in the light heavyweight final of The Ultimate Fighter 1?", answer: "Forrest Griffin", wrong: ["Diego Sanchez", "Rashad Evans"], explanation: "Forrest Griffin defeated Stephan Bonnar in the historic TUF 1 light heavyweight final." },
  { id: "final-ufc217-rose", grade: 5, prompt: "Who stopped Joanna Jedrzejczyk at UFC 217 in 2017 to win the strawweight title?", answer: "Rose Namajunas", wrong: ["Jessica Andrade", "Claudia Gadelha"], explanation: "Rose Namajunas stopped Joanna Jedrzejczyk in the first round at UFC 217." },
  { id: "final-ufc217-gsp", grade: 5, prompt: "Whom did Georges St-Pierre submit at UFC 217 in 2017 to become middleweight champion?", answer: "Michael Bisping", wrong: ["Robert Whittaker", "Luke Rockhold"], explanation: "St-Pierre submitted Michael Bisping in Round 3 at UFC 217." },
  { id: "final-ufc217-tj", grade: 5, prompt: "Whom did TJ Dillashaw stop at UFC 217 in 2017 to regain the bantamweight title?", answer: "Cody Garbrandt", wrong: ["Dominick Cruz", "Renan Barao"], explanation: "Dillashaw stopped Cody Garbrandt in Round 2 at UFC 217." },
];


function knowledgeQuestions(
  sport: AverageFanSport,
  subject: AverageFanSubject,
  prefix: string,
  facts: readonly KnowledgeFact[],
) {
  return facts.map((fact, index) => (
    (index % 4 === 0
      || ((/\btroph(?:y|ies)\b/i.test(fact.prompt) || /^\d{4}$/.test(fact.answer.trim())) && fact.wrong.length === 3))
      ? choiceQuestion({
          id: `${prefix}:${fact.id}:choice`,
          sport,
          grade: fact.grade,
          subject,
          prompt: fact.prompt,
          answer: fact.answer,
          wrongChoices: knowledgeChoiceWrongChoices(fact),
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
          aliases: fact.aliases,
          explanation: fact.explanation,
          fanMisses: fact.wrong,
          difficultyNudge: fact.grade >= 4 ? 1 : fact.grade === 1 ? -1 : 0,
        })
  ));
}


function currentEventGrade(question: BarTriviaQuestion): AverageFanGrade {
  if (question.round === "round1") return 1;
  if (question.round === "round2") return 3;
  if (question.round === "round3") return 4;
  return 5;
}

function currentEventSubject(question: BarTriviaQuestion): AverageFanSubject {
  if (question.league === "nfl") {
    return ["Clutch Moments", "Milestones", "Coaching Debuts", "Comebacks"].includes(question.category)
      ? "Players"
      : "Teams";
  }
  if (question.league === "cfb") {
    return ["Milestones", "Weird Moments", "Defensive Takeovers", "Breakout Games"].includes(question.category)
      ? "Players"
      : "Programs";
  }
  if (question.category === "Title Fights") return "Championships";
  if (question.category === "TUF History") return "Fighters";
  return "Fights";
}

function currentEventCandidates(sport: Exclude<AverageFanSport, "mlb">) {
  return BAR_TRIVIA_CURRENT_EVENT_QUESTIONS
    .filter((question) => question.league === sport)
    .sort((a, b) => {
      const activeCompare = (b.activeFrom ?? "").localeCompare(a.activeFrom ?? "");
      return activeCompare || b.id.localeCompare(a.id);
    })
    .slice(0, AVERAGE_FAN_CURRENT_EVENT_POOL_TARGETS[sport])
    .map((question) => {
      const wrongChoices = question.choices.filter((choice) => choice !== question.answer);
      if (wrongChoices.length < 3) {
        throw new Error(`Average Fan current-event source ${question.id} does not have three distractors.`);
      }
      return assertAverageFanQuestion({
        id: sport === "nfl"
          ? `average-fan:nfl:00-current:${question.id}`
          : `average-fan:${sport}:current:${question.id}`,
        sport,
        grade: currentEventGrade(question),
        subject: currentEventSubject(question),
        format: "four-choice",
        prompt: question.prompt,
        answer: question.answer,
        aliases: [],
        choices: fourChoiceOrder(`average-fan:${sport}:current:${question.id}`, question.answer, wrongChoices),
        explanation: question.explanation,
        contentType: "current-event",
        activeFrom: question.activeFrom,
        expiresAt: question.expiresAt,
        difficultyNudge: question.round === "round1" ? -1 : question.round === "round2" ? 0 : 1,
        protectedFinal: false,
        sourceId: question.sourceId,
        sourceUrl: question.sourceUrl,
        verifiedAt: question.verifiedAt,
      });
    });
}

function nflKnowledgeQuestions(
  subject: AverageFanSubject,
  prefix: string,
  facts: readonly KnowledgeFact[],
) {
  return facts.map((fact, index) => (
    (index % 3 === 0
      || ((/\btroph(?:y|ies)\b/i.test(fact.prompt) || /^\d{4}$/.test(fact.answer.trim())) && fact.wrong.length === 3))
      ? choiceQuestion({
          id: `${prefix}:${fact.id}:choice`,
          sport: "nfl",
          grade: fact.grade,
          subject,
          prompt: fact.prompt,
          answer: fact.answer,
          wrongChoices: knowledgeChoiceWrongChoices(fact),
          explanation: fact.explanation,
          difficultyNudge: fact.grade >= 4 ? 1 : fact.grade === 1 ? -1 : 0,
        })
      : shortQuestion({
          id: `${prefix}:${fact.id}:short`,
          sport: "nfl",
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

const CFB_TRADITION_CATEGORY_HINTS = [
  "tradition", "rivalr", "troph", "mascot", "stadium", "fan culture", "cheer",
  "entrance", "band", "fight song", "tailgating", "gameday",
] as const;

const CFB_PLAYER_CATEGORY_HINTS = [
  "heisman", "player", "quarterback", "running back", "receiver", "championship star",
  "two-sport", "award",
] as const;

const CFB_PROGRAM_CATEGORY_HINTS = [
  "team identity", "program", "national championship", "championship history",
  "conference", "bowl game", "coaches", "coaching",
] as const;

function cfbAuthoredSubject(question: BarTriviaQuestion): AverageFanSubject {
  const category = question.category.toLocaleLowerCase();
  if (CFB_TRADITION_CATEGORY_HINTS.some((hint) => category.includes(hint))) return "Traditions";
  if (CFB_PLAYER_CATEGORY_HINTS.some((hint) => category.includes(hint))) return "Players";
  if (CFB_PROGRAM_CATEGORY_HINTS.some((hint) => category.includes(hint))) return "Programs";
  return "CFB History";
}

function cfbAuthoredGrade(question: BarTriviaQuestion): AverageFanGrade {
  if (question.round === "last-call") return 5;
  const bucket = stableOffset(question.id, 4);
  if (question.difficulty === "easy") return bucket === 0 ? 2 : 1;
  if (question.difficulty === "medium") return bucket < 2 ? 2 : 3;
  if (question.difficulty === "hard") return bucket < 2 ? 4 : 5;
  if (question.round === "round1") return bucket === 0 ? 2 : 1;
  if (question.round === "round2") return bucket < 2 ? 2 : 3;
  return bucket < 2 ? 4 : 5;
}

function authoredCfbQuestion(question: BarTriviaQuestion): AverageFanQuestion {
  const grade = cfbAuthoredGrade(question);
  const subject = cfbAuthoredSubject(question);
  const protectedFinal = question.round === "last-call";
  const wrongChoices = question.choices.filter((choice) => choice !== question.answer).slice(0, 3);
  const formatRoll = stableOffset(question.id + ":average-fan-format", 10);
  const common = {
    id: `average-fan:cfb:authored:${question.id}`,
    sport: "cfb" as const,
    grade,
    subject,
    answer: question.answer,
    aliases: [] as string[],
    explanation: question.explanation,
    contentType: question.contentType,
    activeFrom: question.activeFrom,
    expiresAt: question.expiresAt,
    difficultyNudge: grade >= 4 ? 1 : grade === 1 ? -1 : 0,
    protectedFinal,
    sourceId: question.sourceId,
    sourceUrl: question.sourceUrl,
    verifiedAt: question.verifiedAt,
  };

  const blankRecallNeedsChoices = /\btroph(?:y|ies)\b/i.test(question.prompt)
    || /^\d{4}$/.test(question.answer.trim());

  if (grade === 1 || formatRoll <= 3 || protectedFinal || blankRecallNeedsChoices) {
    return assertAverageFanQuestion({
      ...common,
      format: "four-choice",
      prompt: question.prompt,
      choices: fourChoiceOrder(`average-fan:cfb:authored:${question.id}`, question.answer, wrongChoices),
    });
  }
  return assertAverageFanQuestion({
    ...common,
    format: "short-answer",
    prompt: question.prompt,
    fanMisses: wrongChoices,
  });
}




const CFB_CURATED_TRUE_FALSE: readonly AverageFanQuestion[] = [
  ["00-smith-heisman-receiver", 4, "Players", "DeVonta Smith was the first wide receiver to win the Heisman Trophy since Desmond Howard.", true, "Smith won the 2020 Heisman; the previous wide receiver winner was Desmond Howard in 1991."],
  ["00-fsu-last-bcs-champ", 4, "Programs", "Florida State won the final BCS National Championship Game before the College Football Playoff era.", true, "Florida State beat Auburn for the 2013 national title in the final BCS championship game."],
  ["00-lsu-two-loss-champ", 4, "CFB History", "LSU won the 2007 BCS national championship after entering the title game with two losses.", true, "LSU finished 12–2 and beat Ohio State for the 2007 season's BCS national championship."],
  ["00-lamar-2016:heisman", 3, "CFB History", "Lamar Jackson won the Heisman Trophy for the 2016 season.", true, "Lamar Jackson won the 2016 Heisman Trophy at Louisville."],
  ["00-cfp-four-team", 3, "CFB History", "The College Football Playoff began as an eight-team playoff for the 2014 season.", false, "The CFP began with a four-team field for the 2014 season."],
  ["00a-smith-2020:heisman", 3, "CFB History", "DeVonta Smith won the 2020 Heisman Trophy.", true, "DeVonta Smith won the 2020 Heisman Trophy after his record-setting season at Alabama."],
  ["00b-mccaffrey-2015:heisman", 3, "CFB History", "Christian McCaffrey won the 2015 Heisman Trophy.", false, "Derrick Henry won the 2015 Heisman Trophy; Christian McCaffrey finished second."],
  ["01-cfp-first-number-one", 4, "CFB History", "Mississippi State was the first team ranked No. 1 by the College Football Playoff selection committee.", true, "Mississippi State held the first No. 1 ranking released by the CFP committee in 2014."],
  ["02-cfp-2021-cincinnati", 4, "Programs", "Cincinnati was the No. 1 seed in the four-team College Football Playoff after the 2021 season.", false, "Cincinnati made the field as the No. 4 seed; Alabama was No. 1."],
  ["03-champ-2003-split", 4, "CFB History", "The 2003 season ended with LSU and USC recognized by major selectors as national champions.", true, "LSU won the BCS title while USC finished No. 1 in the AP poll, producing a split championship."],
].map(([id, grade, subject, prompt, answer, explanation]) => assertAverageFanQuestion({
  id: `average-fan:cfb:authored:00-tf-${id}`,
  sport: "cfb",
  grade: grade as AverageFanGrade,
  subject: subject as AverageFanSubject,
  format: "true-false",
  prompt: prompt as string,
  answer: answer ? "True" : "False",
  aliases: [],
  explanation: explanation as string,
  contentType: "evergreen",
  difficultyNudge: 0,
  protectedFinal: false,
}));

const CFB_CURATED_FINALS: readonly AverageFanQuestion[] = [
  ["00-player-mendoza", "Players", "Before his Heisman-winning championship season at Indiana, Fernando Mendoza played for which school?", "California", ["Stanford", "UCLA", "Arizona State"], "Fernando Mendoza transferred from California to Indiana before his 2025 Heisman and national-title season."],
  ["01-player-woodson", "Players", "Which Tennessee quarterback finished behind Charles Woodson in the famous 1997 Heisman race?", "Peyton Manning", ["Tee Martin", "Danny Wuerffel", "Tim Couch"], "Peyton Manning finished second to Michigan's Charles Woodson in the 1997 Heisman voting."],
  ["02-player-newton", "Players", "Cam Newton completed Auburn's 2010 national-title season by beating which team in the BCS Championship Game?", "Oregon", ["TCU", "Stanford", "Alabama"], "Auburn beat Oregon 22–19 to finish Cam Newton's Heisman-winning season 14–0."],
  ["03-player-griffin", "Players", "Archie Griffin won his back-to-back Heisman Trophies in which two seasons?", "1974 and 1975", ["1973 and 1974", "1975 and 1976", "1972 and 1973"], "Ohio State running back Archie Griffin won the Heisman in 1974 and 1975."],

  ["00-program-indiana", "Programs", "Which program completed a 16–0 season by beating Miami for the 2025 national championship?", "Indiana", ["Oregon", "Ohio State", "Notre Dame"], "Indiana finished 16–0 and beat Miami 27–21 for the 2025 national championship."],
  ["01-program-texas-rose", "Programs", "Which program ended USC's 34-game winning streak in the 2006 Rose Bowl to win the national title?", "Texas", ["Oklahoma", "Ohio State", "Florida"], "Texas beat USC 41–38 in the Rose Bowl to win the 2005 national championship."],
  ["02-program-boise-fiesta", "Programs", "Which program used the hook-and-lateral and Statue of Liberty in its famous 2007 Fiesta Bowl upset of Oklahoma?", "Boise State", ["TCU", "Utah", "UCF"], "Boise State beat Oklahoma 43–42 in overtime in the 2007 Fiesta Bowl."],
  ["03-program-app-state", "Programs", "Which FCS program stunned No. 5 Michigan at the Big House in 2007?", "Appalachian State", ["James Madison", "North Dakota State", "Georgia Southern"], "Appalachian State beat Michigan 34–32 in one of college football's signature upsets."],

  ["00-tradition-kick-six", "Traditions", "The 2013 'Kick Six' decided which rivalry game?", "Iron Bowl", ["Egg Bowl", "Red River Rivalry", "Bedlam"], "Auburn's Kick Six beat Alabama in the 2013 Iron Bowl."],
  ["01-tradition-prayer", "Traditions", "Which Auburn receiver caught the deflected touchdown known as the Prayer at Jordan-Hare in 2013?", "Ricardo Louis", ["Sammie Coates", "Tre Mason", "Nick Marshall"], "Ricardo Louis caught the deflected fourth-down pass that beat Georgia in the 2013 Prayer at Jordan-Hare."],
  ["02-tradition-bluegrass", "Traditions", "Which LSU receiver caught the tipped final-play touchdown known as the Bluegrass Miracle in 2002?", "Devery Henderson", ["Michael Clayton", "Josh Reed", "Skyler Green"], "Devery Henderson caught the tipped 75-yard touchdown that gave LSU the Bluegrass Miracle win over Kentucky."],
  ["03-tradition-miracle-michigan", "Traditions", "Which Colorado quarterback threw the Hail Mary that became known as the Miracle at Michigan in 1994?", "Kordell Stewart", ["Rashaan Salaam", "Eric Bieniemy", "Darian Hagan"], "Kordell Stewart's final-play Hail Mary to Michael Westbrook beat Michigan in 1994."],

  ["00-history-2022-fiesta", "CFB History", "Which team beat Michigan 51–45 in the 2022 season's CFP semifinal at the Fiesta Bowl?", "TCU", ["Georgia", "Ohio State", "Alabama"], "TCU beat Michigan 51–45 in the Fiesta Bowl to reach the national championship game."],
  ["01-history-2017-rose", "CFB History", "Which team beat Oklahoma 54–48 in double overtime in the Rose Bowl CFP semifinal after the 2017 season?", "Georgia", ["Alabama", "Clemson", "Ohio State"], "Georgia beat Oklahoma 54–48 in double overtime in the Rose Bowl semifinal."],
  ["02-history-2018-tua", "CFB History", "Which freshman quarterback came off the bench and threw the overtime title-winning touchdown for Alabama against Georgia after the 2017 season?", "Tua Tagovailoa", ["Jalen Hurts", "Mac Jones", "Bryce Young"], "Tua Tagovailoa replaced Jalen Hurts and threw the overtime winner to DeVonta Smith."],
  ["03-history-2005-rose", "CFB History", "Which Texas quarterback scored the late fourth-down touchdown that beat USC in the 2006 Rose Bowl?", "Vince Young", ["Colt McCoy", "Matt Leinart", "Chris Simms"], "Vince Young's fourth-down touchdown gave Texas the 41–38 national-title win over USC."],
].map(([id, subject, prompt, answer, wrong, explanation]) => assertAverageFanQuestion({
  id: `average-fan:cfb:authored:cfb-final-${id}`,
  sport: "cfb",
  grade: 5,
  subject: subject as AverageFanSubject,
  format: "four-choice",
  prompt: prompt as string,
  answer: answer as string,
  aliases: [],
  choices: fourChoiceOrder(`average-fan:cfb:authored:cfb-final-${id}`, answer as string, wrong as string[]),
  explanation: explanation as string,
  contentType: "evergreen",
  difficultyNudge: 2,
  protectedFinal: true,
}));

function authoredCfbQuestions() {
  return [
    ...CFB_CURATED_TRUE_FALSE,
    ...CFB_CURATED_FINALS,
    ...CFB_CURATED_GRADE_FIVE_FACTS.map((fact, index) => (
      index % 3 === 0
        ? choiceQuestion({
            id: `average-fan:cfb:authored:00-g5:${fact.id}:choice`,
            sport: "cfb",
            grade: 5,
            subject: fact.subject,
            prompt: fact.prompt,
            answer: fact.answer,
            wrongChoices: knowledgeChoiceWrongChoices(fact),
            explanation: fact.explanation,
            difficultyNudge: 2,
          })
        : shortQuestion({
            id: `average-fan:cfb:authored:00-g5:${fact.id}:short`,
            sport: "cfb",
            grade: 5,
            subject: fact.subject,
            prompt: fact.prompt,
            answer: fact.answer,
            explanation: fact.explanation,
            fanMisses: fact.wrong,
            difficultyNudge: 2,
          })
    )),
    ...BAR_TRIVIA_QUESTION_BANK
      .filter((question) => question.league === "cfb" && question.contentType !== "current-event")
      .map(authoredCfbQuestion),
  ];
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
  const sport = league === "NFL" ? "nfl" as const : "cfb" as const;
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
      difficultyNudge: player.recognizabilityTier === "A" || player.recognizabilityTier === "B" ? -2 : -1,
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

      if (player.heismanWinner != null) {
        questions.push(trueFalseQuestion({
          id: `average-fan:cfb:g3:${player.id}:heisman`,
          sport: "cfb",
          grade: 3,
          subject: "CFB History",
          prompt: `${player.name} won the Heisman Trophy.`,
          answer: player.heismanWinner,
          explanation: player.heismanWinner
            ? `${player.name} won the Heisman Trophy.`
            : `${player.name} did not win the Heisman Trophy.`,
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
      }
    }
  }

  if (league === "CFB") {
    const seenConferenceProgramQuestions = new Set<string>();
    for (const [index, program] of programs.entries()) {
      if (!program.conference) continue;
      const conferenceSeason = program.conferenceSeason ?? 2025;
      const wrongConferences = peerValues(conferences, program.conference, `${program.id}:conference`);
      questions.push(choiceQuestion({
        id: `average-fan:cfb:g1:${program.id}:conference`,
        sport: "cfb",
        grade: 1,
        subject: "Programs",
        prompt: `For the ${conferenceSeason} season, which conference was ${program.name} in?`,
        answer: program.conference,
        wrongChoices: wrongConferences,
        explanation: `${program.name} was in the ${program.conference} for the ${conferenceSeason} season.`,
        difficultyNudge: program.recognizabilityTier === "A" || program.recognizabilityTier === "B" ? -2 : -1,
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
      const conferenceProgramKey = `${program.conference}:${conferenceSeason}`;
      if (!seenConferenceProgramQuestions.has(conferenceProgramKey)) {
        seenConferenceProgramQuestions.add(conferenceProgramKey);
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
          explanation: `${program.name} was in the ${program.conference} for the ${conferenceSeason} season.`,
        }));
      }
    }
  }

  if (league === "NFL") {
    questions.push(...nflKnowledgeQuestions("Players", "average-fan:nfl:00-player", NFL_PLAYER_FACTS));
    questions.push(...nflKnowledgeQuestions("Teams", "average-fan:nfl:00-team", NFL_TEAM_FACTS));
    questions.push(...nflKnowledgeQuestions("X’s & O’s", "average-fan:nfl:00-xo", NFL_XO_FACTS));
    questions.push(...nflKnowledgeQuestions("NFL History", "average-fan:nfl:00-history", NFL_HISTORY_FACTS));
    questions.push(...NFL_TRUE_FALSE_FACTS.map((fact) => trueFalseQuestion({
      id: `average-fan:nfl:00-0tf:${fact.id}`,
      sport: "nfl",
      grade: fact.grade,
      subject: fact.subject,
      prompt: fact.prompt,
      answer: fact.answer,
      explanation: fact.explanation,
      difficultyNudge: fact.grade >= 4 ? 1 : fact.grade === 1 ? -1 : 0,
    })));
    questions.push(...NFL_FINAL_FACTS.map((fact) => shortQuestion({
      id: `average-fan:nfl:final-authored:${fact.id}`,
      sport: "nfl",
      grade: 5,
      subject: fact.subject,
      prompt: fact.prompt,
      answer: fact.answer,
      aliases: fact.aliases,
      explanation: fact.explanation,
      fanMisses: fact.wrong,
      difficultyNudge: 3,
      protectedFinal: true,
    })));
  } else {
    questions.push(...knowledgeQuestions("cfb", "Traditions", "average-fan:cfb:tradition", CFB_TRADITION_FACTS));
  }

  questions.push(...currentEventCandidates(sport));
  return league === "CFB"
    ? [...authoredCfbQuestions(), ...questions]
    : questions;
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
    questions.push(choiceQuestion({
      id: `average-fan:ufc:g1:${fighter.id}:division`,
      sport: "ufc",
      grade: 1,
      subject: "Fighters",
      prompt: `Which UFC division is ${fighter.name} primarily associated with?`,
      answer: primaryDivision,
      wrongChoices: wrongDivisions,
      explanation: `${fighter.name}'s primary UFC division is ${primaryDivision}.`,
      difficultyNudge: fighter.scope === "recognizable-expansion" ? -2 : -1,
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
      const sameMethodOpponents = unique(
        wins
          .filter((fight) => fight.methodCategory === methodFight.methodCategory)
          .map((fight) => fight.opponent),
      );
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
        explanation: `${fighter.name} beat ${answer} by ${methodLabel(methodFight.methodCategory)} in the UFC.`,
        fanMisses: wrongOpponents,
        difficultyNudge: 1,
      }));
    }

    const uniqueWins = wins.filter(
      (fight, fightIndex) => wins.findIndex((candidate) => candidate.opponent === fight.opponent) === fightIndex,
    );
    if (uniqueWins.length >= 3) {
      const firstIndex = stableOffset(`${fighter.id}:g5-anchor-a`, uniqueWins.length);
      const anchors = [
        uniqueWins[firstIndex]!,
        uniqueWins[(firstIndex + 1) % uniqueWins.length]!,
        uniqueWins[(firstIndex + 2) % uniqueWins.length]!,
      ];
      const wrongNames = peerValues(fighterNames, fighter.name, `${fighter.id}:three-win-identity`);
      const modernAnchor = anchors.find((fight) => Number(fight.date.slice(0, 4)) >= 2010);
      const modernAnchorHint = modernAnchor
        ? `, including the win over ${modernAnchor.opponent} in ${modernAnchor.date.slice(0, 4)}`
        : "";
      questions.push(shortQuestion({
        id: `average-fan:ufc:g5:${fighter.id}:three-win-identity`,
        sport: "ufc",
        grade: 5,
        subject: "Fighters",
        prompt: `Which UFC fighter owns wins over ${anchors[0].opponent}, ${anchors[1].opponent}, and ${anchors[2].opponent}${modernAnchorHint}?`,
        answer: fighter.name,
        explanation: `${fighter.name} has UFC wins over all three opponents.`,
        fanMisses: wrongNames,
        difficultyNudge: 2,
      }));
    }

    const titleFights = fighter.fights.filter((fight) => fight.titleFight);
    if (titleFights.length) {
      const titleFight = titleFights[titleFights.length - 1]!;
      const wrongNames = peerValues(fighterNames, fighter.name, `${fighter.id}:title-identity`);
      const titleOpponents = unique(titleFights.map((fight) => fight.opponent));
      const wrongTitleOpponents = peerValues(fighterNames, titleOpponents, `${fighter.id}:title-opponent`);
      questions.push(shortQuestion({
        id: `average-fan:ufc:g4:${fighter.id}:title-opponent`,
        sport: "ufc",
        grade: 4,
        subject: "Championships",
        prompt: `Name one fighter ${fighter.name} faced in a UFC title fight.`,
        answer: titleOpponents[0]!,
        aliases: titleOpponents.slice(1),
        explanation: `${fighter.name}'s UFC title-fight opponents include ${titleOpponents.join(", ")}.`,
        fanMisses: wrongTitleOpponents,
        difficultyNudge: 1,
      }));
      questions.push(shortQuestion({
        id: `average-fan:ufc:g5:${fighter.id}:title-identity`,
        sport: "ufc",
        grade: 5,
        subject: "Championships",
        prompt: `Which fighter recorded a ${titleFight.result} against ${titleFight.opponent} in a UFC title fight on ${titleFight.date}?`,
        answer: fighter.name,
        explanation: `${fighter.name} had that UFC title-fight result against ${titleFight.opponent} on ${titleFight.date}.`,
        fanMisses: wrongNames,
        difficultyNudge: 2,
      }));
      const finalOtherOpponents = unique(fighter.fights.map((fight) => fight.opponent))
        .filter((opponent) => opponent !== titleFight.opponent)
        .slice(0, 2);
      const finalOpponentPhrase = finalOtherOpponents.length === 2
        ? ` and also fought ${finalOtherOpponents[0]} and ${finalOtherOpponents[1]}`
        : finalOtherOpponents.length === 1
          ? ` and also fought ${finalOtherOpponents[0]}`
          : "";
      questions.push(shortQuestion({
        id: `average-fan:ufc:final:${fighter.id}:title`,
        sport: "ufc",
        grade: 5,
        subject: "Championships",
        prompt: `Which UFC fighter faced ${titleFight.opponent} in a title fight${finalOpponentPhrase}?`,
        answer: fighter.name,
        explanation: `${fighter.name} faced ${titleFight.opponent} in a UFC title fight${finalOpponentPhrase}.`,
        fanMisses: wrongNames,
        difficultyNudge: 3,
        protectedFinal: true,
      }));
    } else if (fighter.fights.length >= 5) {
      const anchorA = fighter.fights[fighter.fights.length - 1]!;
      const anchorB = fighter.fights[Math.max(0, fighter.fights.length - 3)]!;
      const anchorC = fighter.fights[Math.max(0, fighter.fights.length - 5)]!;
      const wrongNames = peerValues(fighterNames, fighter.name, `${fighter.id}:final-fight`);
      questions.push(shortQuestion({
        id: `average-fan:ufc:final:${fighter.id}:fight`,
        sport: "ufc",
        grade: 5,
        subject: "Fights",
        prompt: `Which UFC fighter faced ${anchorA.opponent}, ${anchorB.opponent}, and ${anchorC.opponent}?`,
        answer: fighter.name,
        explanation: `${fighter.name} faced all three opponents in the UFC.`,
        fanMisses: wrongNames,
        difficultyNudge: 3,
        protectedFinal: true,
      }));
    }
  }

  questions.push(...knowledgeQuestions("ufc", "Octagon IQ", "average-fan:ufc:iq", UFC_IQ_FACTS));
  questions.push(...currentEventCandidates("ufc"));
  const authoredHistory = knowledgeQuestions("ufc", "Fights", "average-fan:ufc:authored-history", UFC_HISTORY_FACTS);
  const authoredChampionshipIds = new Set([
    "mcgregor-alvarez", "sterling-dq-title", "edwards-usman-round",
    "silva-weidman", "serra-gsp", "holm-rousey", "rousey-carmouche", "usman-masvidal",
  ]);
  questions.push(...authoredHistory.map((question) => {
    const factId = question.id.split(":").at(-2) ?? "";
    return authoredChampionshipIds.has(factId)
      ? assertAverageFanQuestion({ ...question, subject: "Championships" })
      : question;
  }));
  questions.push(...UFC_FINAL_FACTS.map((fact) => shortQuestion({
    id: `average-fan:ufc:final:authored:${fact.id}`,
    sport: "ufc",
    grade: 5,
    subject: "Fights",
    prompt: fact.prompt,
    answer: fact.answer,
    explanation: fact.explanation,
    fanMisses: fact.wrong,
    difficultyNudge: 3,
    protectedFinal: true,
  })));
  return questions;
}

function calibratedPlayableGrade(question: AverageFanQuestion): AverageFanPlayableGrade {
  if (question.protectedFinal) return 5;

  // Current events are fun, but even an "easy" weekly story can be niche. Keep them
  // out of the opening grade unless a future editor explicitly creates a Grade-2 gate.
  if (question.contentType === "current-event") {
    if (question.grade <= 1) return 3;
    if (question.grade === 2) return 3;
    if (question.grade === 3) return 4;
    return 5;
  }

  if (question.grade <= 1) return 2;
  if (question.grade === 2) return 3;
  if (question.grade === 3) return 4;
  return 5;
}

function calibratedPlayableQuestion(question: AverageFanQuestion) {
  const legacyGrade = question.grade;
  const grade = calibratedPlayableGrade(question);
  const misses = question.fanMisses ?? [];
  const blankRecallNeedsChoices = /\btroph(?:y|ies)\b/i.test(question.prompt)
    || /^\d{4}$/.test(question.answer.trim())
    || (
      legacyGrade >= 4
      && /\b(?:draft(?:ed)?|overall pick|pick number|yards?|touchdowns?|sacks?|interceptions?|seconds?|minutes?|score)\b/i.test(question.prompt)
    )
    || (
      legacyGrade === 5
      && /\b(?:against whom|which opponent|came against whom|who did .+ (?:beat|defeat|face))\b/i.test(question.prompt)
    );

  if (question.format === "short-answer" && blankRecallNeedsChoices && misses.length === 3) {
    return assertAverageFanQuestion({
      ...question,
      grade,
      format: "four-choice",
      choices: fourChoiceOrder(`${question.id}:calibrated-choice`, question.answer, misses),
      fanMisses: undefined,
    });
  }

  return assertAverageFanQuestion({ ...question, grade });
}

function balancedTake(
  candidates: readonly AverageFanQuestion[],
  target: number,
  subjects: readonly AverageFanSubject[],
  label: string,
) {
  const isNflOrdinary = /^nfl grade [1-5] evergreen$/.test(label);
  const isOpeningGrade = / grade 2 evergreen$/.test(label);
  const isNflUpperGrade = /^nfl grade [45] evergreen$/.test(label);
  const isCfbUpperGrade = /^cfb grade 5 evergreen$/.test(label);
  const isUfcUpperGrade = /^ufc grade [45] evergreen$/.test(label) || label === "ufc Finals";
  const latestPromptYear = (question: AverageFanQuestion) => {
    const years = [...question.prompt.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
    return years.length ? Math.max(...years) : null;
  };
  const eraRank = (question: AverageFanQuestion, modernThreshold: number) => {
    const year = latestPromptYear(question);
    if (year == null) return 1;
    return year >= modernThreshold ? 0 : 2;
  };
  const candidateOrder = (left: AverageFanQuestion, right: AverageFanQuestion) => {
    if (isOpeningGrade) {
      const difficultyCompare = left.difficultyNudge - right.difficultyNudge;
      if (difficultyCompare) return difficultyCompare;
      const leftShort = left.format === "short-answer" ? 1 : 0;
      const rightShort = right.format === "short-answer" ? 1 : 0;
      if (leftShort !== rightShort) return leftShort - rightShort;
    }
    if (isNflOrdinary) {
      const formatRank = (question: AverageFanQuestion) => question.format === "true-false" ? 0 : 1;
      const formatCompare = formatRank(left) - formatRank(right);
      if (formatCompare) return formatCompare;
      if (isNflUpperGrade) {
        const eraCompare = eraRank(left, 2000) - eraRank(right, 2000);
        if (eraCompare) return eraCompare;
      }
    }
    if (isCfbUpperGrade) {
      const eraCompare = eraRank(left, 2000) - eraRank(right, 2000);
      if (eraCompare) return eraCompare;
    }
    if (isUfcUpperGrade) {
      const eraCompare = eraRank(left, 2010) - eraRank(right, 2010);
      if (eraCompare) return eraCompare;
    }
    return left.id.localeCompare(right.id);
  };
  const selectionCandidates = (() => {
    if (!isCfbUpperGrade) return candidates;

    // Grade 5 should be hard because the knowledge is deep, not because the player
    // happened to play decades ago. Cap pre-2000 dated player identities so the
    // dated Player slice remains at least 65% modern while undated landmark/player
    // questions can still compete naturally.
    const playerCandidates = candidates.filter((question) => question.subject === "Players");
    const modernDated = playerCandidates.filter((question) => {
      const year = latestPromptYear(question);
      return year != null && year >= 2000;
    });
    const historicalDated = playerCandidates
      .filter((question) => {
        const year = latestPromptYear(question);
        return year != null && year < 2000;
      })
      .sort(candidateOrder);
    const historicalCap = Math.floor(modernDated.length * 0.35 / 0.65);
    const allowedHistorical = new Set(
      historicalDated.slice(0, historicalCap).map((question) => question.id),
    );

    return candidates.filter((question) => {
      if (question.subject !== "Players") return true;
      const year = latestPromptYear(question);
      return year == null || year >= 2000 || allowedHistorical.has(question.id);
    });
  })();

  const bySubject = new Map(subjects.map((subject) => [
    subject,
    selectionCandidates.filter((question) => question.subject === subject).sort(candidateOrder),
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
      throw new Error(`Average Fan ${label} has only ${selected.length} eligible questions for a target of ${target}.`);
    }
  }
  return selected;
}

function buildBank(
  sport: AverageFanSport,
  candidates: readonly AverageFanQuestion[],
  gradeTargets: Record<AverageFanPlayableGrade, number>,
  finalTarget: number,
) {
  const subjects = AVERAGE_FAN_SUBJECTS[sport] as readonly AverageFanSubject[];
  const playableCandidates = candidates.map(calibratedPlayableQuestion);
  const ordinary = AVERAGE_FAN_PLAYABLE_GRADES.flatMap((grade) => {
    const current = playableCandidates
      .filter((question) => (
        !question.protectedFinal
        && question.grade === grade
        && question.contentType === "current-event"
      ))
      .sort((a, b) => a.id.localeCompare(b.id));
    if (current.length > gradeTargets[grade]) {
      throw new Error(`Average Fan ${sport} grade ${grade} has too many current-event questions.`);
    }
    const evergreenTarget = gradeTargets[grade] - current.length;
    const evergreen = balancedTake(
      playableCandidates.filter((question) => (
        !question.protectedFinal
        && question.grade === grade
        && question.contentType === "evergreen"
      )),
      evergreenTarget,
      subjects,
      `${sport} grade ${grade} evergreen`,
    );
    return [...current, ...evergreen];
  });
  const finals = balancedTake(
    playableCandidates.filter((question) => question.protectedFinal),
    finalTarget,
    subjects,
    `${sport} Finals`,
  );
  const bank = [...ordinary, ...finals];
  const ids = new Set(bank.map((question) => question.id));
  if (ids.size !== bank.length) throw new Error(`Average Fan ${sport} bank contains duplicate ids.`);
  return bank;
}

const averageFanNflCandidates = footballCandidates("NFL").filter((question) => (
  question.contentType === "current-event"
  || question.id.startsWith("average-fan:nfl:00-")
  || question.id.startsWith("average-fan:nfl:final-authored:")
));

export const averageFanNflQuestionBank = buildBank(
  "nfl",
  averageFanNflCandidates,
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

export function averageFanBankSummary(sport: Exclude<AverageFanSport, "mlb">) {
  const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
  return {
    total: bank.length,
    finals: bank.filter((question) => question.protectedFinal).length,
    formats: Object.fromEntries(
      ["short-answer", "four-choice", "true-false"].map((format) => [
        format,
        bank.filter((question) => question.format === format).length,
      ]),
    ),
    grades: Object.fromEntries(
      AVERAGE_FAN_PLAYABLE_GRADES.map((grade) => [
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
