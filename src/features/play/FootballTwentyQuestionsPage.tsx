import { chooseTwentyQuestionsFootballLeague } from "../games/twentyQuestionsEngine";
import { getFootballTwentyQuestionsUniverse } from "../games/twentyQuestionsFootballAuthority";
import { createTwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

function createFootballTwentyQuestionsRound() {
  const random = Math.random;
  const league = chooseTwentyQuestionsFootballLeague(random);
  return createTwentyQuestionsRound(
    "football",
    getFootballTwentyQuestionsUniverse(league),
    random,
  );
}

export default function FootballTwentyQuestionsPage() {
  return <TwentyQuestionsPage sport="football" createRound={createFootballTwentyQuestionsRound} />;
}
