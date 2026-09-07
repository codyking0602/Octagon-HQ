import {
  chooseTwentyQuestionsFootballLeague,
  chooseTwentyQuestionsSubject,
  type TwentyQuestionsSport,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";
import { getFootballTwentyQuestionsUniverse } from "./twentyQuestionsFootballAuthority";
import { getUfcTwentyQuestionsUniverse } from "./twentyQuestionsUfcAuthority";

export interface TwentyQuestionsRound {
  sport: TwentyQuestionsSport;
  universe: TwentyQuestionsUniverse;
  hiddenSubject: TwentyQuestionsSubject;
}

export function createTwentyQuestionsRound(
  sport: TwentyQuestionsSport,
  random: () => number = Math.random,
): TwentyQuestionsRound {
  const universe = sport === "ufc"
    ? getUfcTwentyQuestionsUniverse()
    : getFootballTwentyQuestionsUniverse(chooseTwentyQuestionsFootballLeague(random));
  return {
    sport,
    universe,
    hiddenSubject: chooseTwentyQuestionsSubject(universe.subjects, random),
  };
}
