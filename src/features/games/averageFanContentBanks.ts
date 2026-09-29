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
  { id: "revis-island", grade: 3, prompt: "Which shutdown cornerback became synonymous with the nickname 'Revis Island'?", answer: "Darrelle Revis", wrong: ["Champ Bailey", "Richard Sherman"], explanation: "Darrelle Revis' man-coverage reputation inspired the 'Revis Island' nickname." },
  { id: "megatron", grade: 3, prompt: "Which Lions receiver was nicknamed 'Megatron'?", answer: "Calvin Johnson", wrong: ["Herman Moore", "Golden Tate"], explanation: "Calvin Johnson's size and athleticism helped make Megatron one of the NFL's best-known nicknames." },
  { id: "greatest-show", grade: 3, prompt: "Which quarterback was the centerpiece of the Rams offense nicknamed 'The Greatest Show on Turf'?", answer: "Kurt Warner", wrong: ["Marc Bulger", "Trent Green"], explanation: "Kurt Warner led the explosive Rams offense that won Super Bowl XXXIV." },
  { id: "peyton-denver", grade: 3, prompt: "Peyton Manning won Super Bowls as the starting quarterback for Indianapolis and which other team?", answer: "Denver Broncos", wrong: ["Tennessee Titans", "New York Giants"], explanation: "Manning won Super Bowl XLI with Indianapolis and Super Bowl 50 with Denver." },
  { id: "randle-el", grade: 4, prompt: "Which Steelers receiver threw a touchdown pass to Hines Ward in Super Bowl XL?", answer: "Antwaan Randle El", wrong: ["Santonio Holmes", "Cedrick Wilson"], explanation: "Antwaan Randle El hit Hines Ward for a 43-yard touchdown." },
  { id: "hester", grade: 4, prompt: "Who returned the opening kickoff of Super Bowl XLI for a touchdown?", answer: "Devin Hester", wrong: ["Dante Hall", "Desmond Howard"], explanation: "Devin Hester opened Super Bowl XLI with a 92-yard kickoff-return touchdown." },
  { id: "holmes", grade: 4, prompt: "Which Steelers receiver made the toe-tap game-winning touchdown catch in Super Bowl XLIII?", answer: "Santonio Holmes", wrong: ["Hines Ward", "Nate Washington"], explanation: "Santonio Holmes caught Ben Roethlisberger's late touchdown in the corner of the end zone." },
  { id: "first-wild-card", grade: 4, prompt: "Which franchise became the first wild-card team to win a Super Bowl?", answer: "Oakland Raiders", wrong: ["Dallas Cowboys", "Pittsburgh Steelers"], explanation: "Oakland won Super Bowl XV after entering the playoffs as a wild card." },
  { id: "first-ot", grade: 4, prompt: "Which Super Bowl was the first to go to overtime?", answer: "Super Bowl LI", wrong: ["Super Bowl XLIX", "Super Bowl LII"], explanation: "New England's comeback against Atlanta in Super Bowl LI produced the first overtime in Super Bowl history." },
  { id: "first-four", grade: 4, prompt: "Which franchise became the first to win four Super Bowls?", answer: "Pittsburgh Steelers", wrong: ["Dallas Cowboys", "San Francisco 49ers"], explanation: "Pittsburgh's Super Bowl XIV win made the Steelers the first franchise with four Super Bowl victories." },
  { id: "white-14", grade: 5, prompt: "Which Patriots running back set a Super Bowl record with 14 receptions in Super Bowl LI?", answer: "James White", wrong: ["Dion Lewis", "Kevin Faulk"], explanation: "James White caught 14 passes in New England's comeback win over Atlanta." },
  { id: "vinatieri", grade: 5, prompt: "Which kicker won Super Bowl XXXVI on a 48-yard field goal as time expired?", answer: "Adam Vinatieri", wrong: ["Mike Vanderjagt", "Stephen Gostkowski"], explanation: "Adam Vinatieri's 48-yarder gave New England a 20-17 win on the final play." },
  { id: "parker-75", grade: 5, prompt: "Which Steelers running back scored on a 75-yard run in Super Bowl XL?", answer: "Willie Parker", wrong: ["Jerome Bettis", "Franco Harris"], explanation: "Willie Parker broke a 75-yard touchdown run on the second play of the second half." },
  { id: "dungy", grade: 5, prompt: "Who became the first Black head coach to win a Super Bowl?", answer: "Tony Dungy", wrong: ["Lovie Smith", "Mike Tomlin"], explanation: "Tony Dungy coached Indianapolis to victory in Super Bowl XLI." },
  { id: "first-mnf", grade: 5, prompt: "Which two teams played in the first Monday Night Football game in 1970?", answer: "Cleveland Browns and New York Jets", wrong: ["Dallas Cowboys and Washington", "Green Bay Packers and Chicago Bears"], explanation: "Cleveland hosted the New York Jets in the first Monday Night Football game." },
  { id: "sb-name", grade: 5, prompt: "Which championship game was the first for which the 'Super Bowl' name was officially recognized?", answer: "Super Bowl III", wrong: ["Super Bowl I", "Super Bowl V"], explanation: "The Super Bowl title was officially recognized for the game played in January 1969." },
];

const NFL_FINAL_FACTS: readonly KnowledgeFact[] = [
  { id: "immaculate", grade: 5, prompt: "Final: Pittsburgh trailed Oakland on fourth down with seconds left in the 1972 playoffs. Who caught the deflection and scored on the Immaculate Reception?", answer: "Franco Harris", wrong: ["John Fuqua", "Lynn Swann"], explanation: "Franco Harris caught the deflection and scored the iconic playoff touchdown." },
  { id: "helmet", grade: 5, prompt: "Final: Which Giants receiver made the helmet-pinning catch that kept the winning drive alive against the unbeaten Patriots in Super Bowl XLII?", answer: "David Tyree", wrong: ["Plaxico Burress", "Amani Toomer"], explanation: "David Tyree's Helmet Catch set up the Giants' winning touchdown." },
  { id: "randle-el", grade: 5, prompt: "Final: In Super Bowl XL, which former college quarterback became the first wide receiver to throw a touchdown pass in a Super Bowl?", answer: "Antwaan Randle El", wrong: ["Hines Ward", "Santonio Holmes"], explanation: "Antwaan Randle El threw a 43-yard touchdown to Hines Ward." },
  { id: "vinatieri", grade: 5, prompt: "Final: Who kicked the 48-yard field goal on the final play of Super Bowl XXXVI to give New England its first championship?", answer: "Adam Vinatieri", wrong: ["Stephen Gostkowski", "Mike Vanderjagt"], explanation: "Adam Vinatieri's kick beat the Rams 20-17." },
  { id: "dungy", grade: 5, prompt: "Final: Which Colts coach became the first Black head coach to win a Super Bowl when Indianapolis won Super Bowl XLI?", answer: "Tony Dungy", wrong: ["Lovie Smith", "Jim Caldwell"], explanation: "Tony Dungy made history with Indianapolis' Super Bowl XLI victory." },
  { id: "wide-right", grade: 5, prompt: "Final: Buffalo's first Super Bowl ended 20-19 after which kicker's 47-yard attempt sailed wide right?", answer: "Scott Norwood", wrong: ["Steve Christie", "Matt Bahr"], explanation: "Scott Norwood's late attempt missed wide right in Super Bowl XXV." },
  { id: "butler", grade: 5, prompt: "Final: With Seattle one yard from a likely go-ahead touchdown in Super Bowl XLIX, which rookie cornerback intercepted Russell Wilson?", answer: "Malcolm Butler", wrong: ["Logan Ryan", "Darrelle Revis"], explanation: "Malcolm Butler jumped the route at the goal line to seal New England's win." },
  { id: "holmes", grade: 5, prompt: "Final: Which receiver got both feet down in the back corner of the end zone for Pittsburgh's winning touchdown in Super Bowl XLIII?", answer: "Santonio Holmes", wrong: ["Hines Ward", "Nate Washington"], explanation: "Santonio Holmes' late touchdown catch beat Arizona." },
  { id: "elway", grade: 5, prompt: "Final: Which quarterback led the 98-yard fourth-quarter march known as 'The Drive' in the 1986 AFC Championship?", answer: "John Elway", wrong: ["Bernie Kosar", "Dan Marino"], explanation: "John Elway led Denver 98 yards to tie Cleveland before the Broncos won in overtime." },
  { id: "beast-quake", grade: 5, prompt: "Final: Which running back's 67-yard playoff touchdown against New Orleans became known as Beast Quake?", answer: "Marshawn Lynch", wrong: ["Shaun Alexander", "Thomas Rawls"], explanation: "Marshawn Lynch broke tackle after tackle on the run remembered as Beast Quake." },
  { id: "philly-special", grade: 5, prompt: "Final: Who threw the touchdown pass to Nick Foles on the Philly Special in Super Bowl LII?", answer: "Trey Burton", wrong: ["Corey Clement", "Nelson Agholor"], explanation: "Trey Burton took the pitch and threw to Foles." },
  { id: "first-wild-card", grade: 5, prompt: "Final: Which franchise became the first wild-card team to win the Super Bowl, beating Philadelphia in Super Bowl XV?", answer: "Oakland Raiders", wrong: ["Dallas Cowboys", "Los Angeles Rams"], explanation: "Oakland became the first wild-card Super Bowl champion." },
  { id: "white", grade: 5, prompt: "Final: Which Patriots running back caught a Super Bowl-record 14 passes and scored 20 points in the 28-3 comeback?", answer: "James White", wrong: ["Dion Lewis", "Danny Woodhead"], explanation: "James White produced 14 catches and 20 points in Super Bowl LI." },
  { id: "first-mnf", grade: 5, prompt: "Final: Joe Namath's Jets visited which team in the first Monday Night Football game in 1970?", answer: "Cleveland Browns", wrong: ["Baltimore Colts", "Kansas City Chiefs"], explanation: "The Cleveland Browns hosted the New York Jets in the first Monday Night Football game." },
  { id: "first-four", grade: 5, prompt: "Final: Which franchise became the first in NFL history to win four Super Bowls when it beat the Rams in Super Bowl XIV?", answer: "Pittsburgh Steelers", wrong: ["Dallas Cowboys", "San Francisco 49ers"], explanation: "Pittsburgh's Super Bowl XIV victory gave the franchise its fourth title." },
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
  const players = footballPlayers(league);
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
          explanation: `${player.name}'s canonical NFL career includes ${teams.join(", ")}.`,
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
    questions.push(...knowledgeQuestions("nfl", "X’s & O’s", "average-fan:nfl:xo", NFL_XO_FACTS));
    questions.push(...knowledgeQuestions("nfl", "NFL History", "average-fan:nfl:history", NFL_HISTORY_FACTS));
    questions.push(...NFL_FINAL_FACTS.map((fact) => shortQuestion({
      id: `average-fan:nfl:final-authored:${fact.id}`,
      sport: "nfl",
      grade: 5,
      subject: "NFL History",
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
