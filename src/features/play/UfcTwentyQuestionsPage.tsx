import { getUfcTwentyQuestionsUniverse } from "../games/twentyQuestionsUfcAuthority";
import { createTwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

function createUfcTwentyQuestionsRound() {
  return createTwentyQuestionsRound("ufc", getUfcTwentyQuestionsUniverse());
}

export default function UfcTwentyQuestionsPage() {
  return <TwentyQuestionsPage sport="ufc" createRound={createUfcTwentyQuestionsRound} />;
}
