/**
 * RELEASE HOLD — Cowboys/Eagles Millionaire editorial candidate.
 *
 * Intentionally NOT imported by any Daily publishing or routing module.
 * The canonical 2026-10-26 pack, proofs, completed attempts and standings
 * remain immutable. This run requires a separately approved future date,
 * publication version and release PR before it can be served.
 */
import {
  MILLIONAIRE_CHOICE_IDS,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import { assertMillionaireRun, type MillionaireRun } from "../games/millionaireEngine";
import { footballThemedMillionaireRunForDay } from "./footballTeamThemeDailyPacks";

type ModernQuestion = {
  readonly type: string;
  readonly prompt: string;
  readonly choices: readonly [string, string, string, string];
  readonly answer: string;
  readonly explanation: string;
  readonly statSheet: string | null;
};

// Q1–Q4 are inherited verbatim from the published October 26 board.
// The second half is centered on consequential and recognizable 2016–2023
// Cowboys moments rather than unfamiliar pre-2000 franchise trivia.
const MODERN_SECOND_HALF: readonly [
  ModernQuestion, ModernQuestion, ModernQuestion, ModernQuestion,
] = [
  {
    type: "defensive-records",
    prompt: "Which Cowboys cornerback led the NFL with 11 interceptions in the 2021 season?",
    choices: ["Trevon Diggs", "Anthony Brown", "Jourdan Lewis", "Byron Jones"],
    answer: "Trevon Diggs",
    explanation: "Trevon Diggs led the NFL with 11 interceptions in 2021, tying a Cowboys single-season record.",
    statSheet: "The Dallas cornerback returned two of his league-leading picks for touchdowns in 2021.",
  },
  {
    type: "rookie-awards",
    prompt: "Which Cowboys player edged teammate Ezekiel Elliott for the 2016 AP Offensive Rookie of the Year award?",
    choices: ["Tony Romo", "Dak Prescott", "Cole Beasley", "Dez Bryant"],
    answer: "Dak Prescott",
    explanation: "Dak Prescott won 2016 AP Offensive Rookie of the Year after replacing the injured Tony Romo, finishing ahead of teammate Ezekiel Elliott.",
    statSheet: "The winning quarterback started all 16 regular-season games as a fourth-round rookie.",
  },
  {
    type: "postseason-moments",
    prompt: "Which Cowboys kicker missed four extra-point attempts in Dallas's January 2023 playoff win over Tampa Bay?",
    choices: ["Dan Bailey", "Brandon Aubrey", "Brett Maher", "Kai Forbath"],
    answer: "Brett Maher",
    explanation: "Brett Maher missed his first four extra-point attempts in Dallas's 31–14 wild-card win over the Buccaneers, then converted his fifth.",
    statSheet: "Dallas won the wild-card game 31–14 despite the unprecedented run of missed extra points.",
  },
  {
    type: "cowboys-eagles-rivalry",
    prompt: "Which Cowboys receiver caught three touchdowns, including the overtime winner, against Philadelphia in December 2018?",
    choices: ["Dez Bryant", "Michael Gallup", "Cole Beasley", "Amari Cooper"],
    answer: "Amari Cooper",
    explanation: "Amari Cooper scored all three of his touchdowns in the fourth quarter and overtime as Dallas beat the Eagles 29–23 on December 9, 2018.",
    statSheet: null,
  },
];

export function cowboysEaglesMillionaireModernHeldCandidate(): MillionaireRun {
  const published = footballThemedMillionaireRunForDay("2026-10-26");
  if (!published) throw new Error("The published Cowboys/Eagles reference board is missing.");

  const run = published.map((question, index) => {
    // Never edit or recreate the four already-approved opening questions.
    if (index < 4) return question;
    const replacement = MODERN_SECOND_HALF[index - 4]!;
    const correctIndex = replacement.choices.indexOf(replacement.answer);
    if (correctIndex < 0) throw new Error("Held Millionaire answer is absent from choices.");
    const correctChoiceId = MILLIONAIRE_CHOICE_IDS[correctIndex]!;
    const wrongIds = MILLIONAIRE_CHOICE_IDS.filter(id => id !== correctChoiceId);
    return {
      ...question,
      id: `theme-cowboys-eagles-modern-held-2026-q${index + 1}`,
      type: replacement.type,
      prompt: replacement.prompt,
      choices: MILLIONAIRE_CHOICE_IDS.map((id, choiceIndex) => ({
        id,
        text: replacement.choices[choiceIndex]!,
      })) as unknown as MillionaireRuntimeQuestion["choices"],
      correctChoiceId,
      explanation: replacement.explanation,
      statSheet: index === 7 ? null : replacement.statSheet,
      fiftyFifty: {
        survivorChoiceIds: [correctChoiceId, wrongIds[0]!],
        removalChoiceIds: [wrongIds[1]!, wrongIds[2]!],
      },
    };
  }) as unknown as MillionaireRun;

  assertMillionaireRun(run);
  return run;
}
