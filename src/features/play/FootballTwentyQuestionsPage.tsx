import { chooseTwentyQuestionsFootballLeague } from "../games/twentyQuestionsEngine";
import { getFootballTwentyQuestionsRuntimeUniverse } from "../games/twentyQuestionsFootballRuntimeAuthority";
import { createTwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

function createFootballTwentyQuestionsRound() {
  const random = Math.random;
  const league = chooseTwentyQuestionsFootballLeague(random);
  return createTwentyQuestionsRound(
    "football",
    getFootballTwentyQuestionsRuntimeUniverse(league),
    random,
  );
}

export default function FootballTwentyQuestionsPage() {
  return <TwentyQuestionsPage sport="football" createRound={createFootballTwentyQuestionsRound} />;
}
