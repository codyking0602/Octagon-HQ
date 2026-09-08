import {
  chooseTwentyQuestionsSubject,
  type TwentyQuestionsSport,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export interface TwentyQuestionsRound {
  sport: TwentyQuestionsSport;
  universe: TwentyQuestionsUniverse;
  hiddenSubject: TwentyQuestionsSubject;
}

export function createTwentyQuestionsRound(
  sport: TwentyQuestionsSport,
  universe: TwentyQuestionsUniverse,
  random: () => number = Math.random,
): TwentyQuestionsRound {
  return {
    sport,
    universe,
    hiddenSubject: chooseTwentyQuestionsSubject(universe.subjects, random),
  };
}
