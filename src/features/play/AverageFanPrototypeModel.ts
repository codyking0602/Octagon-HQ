import {
  assertAverageFanQuestion,
  averageFanAnswersMatch,
  averageFanFanAnswer,
  type AverageFanFan,
  type AverageFanQuestion,
} from "../games/averageFanEngine";

export const AVERAGE_FAN_MONEY_LADDER = [
  1_000,
  2_000,
  5_000,
  10_000,
  25_000,
  50_000,
  100_000,
  175_000,
  300_000,
  500_000,
] as const;

function q(question: AverageFanQuestion) {
  return assertAverageFanQuestion(question);
}

export const AVERAGE_FAN_UFC_PREVIEW_BOARD = [
  q({
    id: "average-fan-preview-ufc-g1-fighters",
    sport: "ufc",
    grade: 1,
    subject: "Fighters",
    format: "short-answer",
    prompt: "Which UFC star is nicknamed “The Notorious”?",
    answer: "Conor McGregor",
    aliases: ["McGregor", "Conor"],
    explanation: "Conor McGregor has long fought under the nickname “The Notorious.”",
    contentType: "evergreen",
    difficultyNudge: -2,
    fanMisses: ["Sean O'Malley", "Dustin Poirier"],
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g1-octagon-iq",
    sport: "ufc",
    grade: 1,
    subject: "Octagon IQ",
    format: "true-false",
    prompt: "UFC fights are scored using the 10-point must system.",
    answer: "True",
    aliases: [],
    explanation: "UFC bouts use the 10-point must system under the Unified Rules.",
    contentType: "evergreen",
    difficultyNudge: -2,
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g2-championships",
    sport: "ufc",
    grade: 2,
    subject: "Championships",
    format: "three-choice",
    prompt: "A standard UFC championship fight is scheduled for how many rounds?",
    answer: "5",
    aliases: ["Five", "5 rounds", "Five rounds"],
    choices: ["3", "5", "7"],
    explanation: "UFC championship fights are scheduled for five rounds.",
    contentType: "evergreen",
    difficultyNudge: -1,
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g2-fighters",
    sport: "ufc",
    grade: 2,
    subject: "Fighters",
    format: "short-answer",
    prompt: "Which former UFC heavyweight champion is nicknamed “The Predator”?",
    answer: "Francis Ngannou",
    aliases: ["Ngannou", "Francis"],
    explanation: "Francis Ngannou is known by the nickname “The Predator.”",
    contentType: "evergreen",
    difficultyNudge: -1,
    fanMisses: ["Ciryl Gane", "Stipe Miocic"],
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g3-fights",
    sport: "ufc",
    grade: 3,
    subject: "Fights",
    format: "three-choice",
    prompt: "Who did Leon Edwards knock out with a head kick at UFC 278?",
    answer: "Kamaru Usman",
    aliases: ["Usman", "Kamaru"],
    choices: ["Kamaru Usman", "Colby Covington", "Belal Muhammad"],
    explanation: "Edwards stopped Kamaru Usman with a fifth-round head kick at UFC 278.",
    contentType: "evergreen",
    difficultyNudge: 0,
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g3-championships",
    sport: "ufc",
    grade: 3,
    subject: "Championships",
    format: "short-answer",
    prompt: "Who became the UFC's first simultaneous two-division champion?",
    answer: "Conor McGregor",
    aliases: ["McGregor", "Conor"],
    explanation: "McGregor held the featherweight and lightweight titles simultaneously after UFC 205.",
    contentType: "evergreen",
    difficultyNudge: 0,
    fanMisses: ["Daniel Cormier", "Henry Cejudo"],
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g4-octagon-iq",
    sport: "ufc",
    grade: 4,
    subject: "Octagon IQ",
    format: "short-answer",
    prompt: "In a southpaw stance, which side is forward?",
    answer: "Right",
    aliases: ["Right side", "Right hand", "Right foot", "Right hand and foot"],
    explanation: "A southpaw stance places the right hand and right foot forward, with the left side in the rear power position.",
    contentType: "evergreen",
    difficultyNudge: 1,
    fanMisses: ["Left", "Either side"],
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g4-fights",
    sport: "ufc",
    grade: 4,
    subject: "Fights",
    format: "three-choice",
    prompt: "Who did Alex Pereira defeat to win the UFC light heavyweight title at UFC 295?",
    answer: "Jiří Procházka",
    aliases: ["Jiri Prochazka", "Prochazka", "Jiří"],
    choices: ["Jiří Procházka", "Jamahal Hill", "Jan Blachowicz"],
    explanation: "Pereira stopped Jiří Procházka at UFC 295 to win the light heavyweight championship.",
    contentType: "evergreen",
    difficultyNudge: 1,
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g5-fighters",
    sport: "ufc",
    grade: 5,
    subject: "Fighters",
    format: "short-answer",
    prompt: "Who handed Israel Adesanya his first UFC loss?",
    answer: "Jan Blachowicz",
    aliases: ["Blachowicz", "Jan", "Jan Błachowicz"],
    explanation: "Jan Blachowicz defeated Adesanya by decision at UFC 259.",
    contentType: "evergreen",
    difficultyNudge: 2,
    fanMisses: ["Alex Pereira", "Robert Whittaker", "Yoel Romero"],
    protectedFinal: false,
  }),
  q({
    id: "average-fan-preview-ufc-g5-championships",
    sport: "ufc",
    grade: 5,
    subject: "Championships",
    format: "short-answer",
    prompt: "Who was the first fighter to hold UFC flyweight and bantamweight titles at the same time?",
    answer: "Henry Cejudo",
    aliases: ["Cejudo", "Henry"],
    explanation: "Henry Cejudo added the bantamweight title while already holding the flyweight championship.",
    contentType: "evergreen",
    difficultyNudge: 2,
    fanMisses: ["Demetrious Johnson", "Brandon Moreno", "T.J. Dillashaw"],
    protectedFinal: false,
  }),
] as const satisfies readonly AverageFanQuestion[];

export const AVERAGE_FAN_UFC_PREVIEW_FINAL = q({
  id: "average-fan-preview-ufc-final",
  sport: "ufc",
  grade: 5,
  subject: "Fights",
  format: "short-answer",
  prompt: "At UFC 300, who did Max Holloway knock out with one second remaining to win the BMF title?",
  answer: "Justin Gaethje",
  aliases: ["Gaethje", "Justin"],
  explanation: "Holloway knocked out Justin Gaethje at 4:59 of the fifth round at UFC 300.",
  contentType: "evergreen",
  difficultyNudge: 3,
  fanMisses: ["Dustin Poirier", "Charles Oliveira", "Michael Chandler"],
  protectedFinal: true,
});

export function averageFanMoneyLabel(value: number) {
  return "$" + value.toLocaleString("en-US");
}

export function averageFanGradeLabel(grade: number) {
  const suffix = grade === 1 ? "st" : grade === 2 ? "nd" : grade === 3 ? "rd" : "th";
  return grade + suffix + " Grade";
}


export function resolveAverageFanPreviewAnswer({
  question,
  fan,
  playerAnswer,
  saveAvailable,
}: {
  question: AverageFanQuestion;
  fan: AverageFanFan;
  playerAnswer: string;
  saveAvailable: boolean;
}) {
  const fanAnswer = averageFanFanAnswer(question, fan);
  const correct = averageFanAnswersMatch(question, playerAnswer);
  const saveConsumed = !correct && saveAvailable;
  const saved = saveConsumed && fanAnswer.correct;

  return {
    correct,
    fanAnswer,
    saveConsumed,
    saved,
  };
}
