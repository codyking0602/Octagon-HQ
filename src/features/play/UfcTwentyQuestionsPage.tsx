import { Navigate } from "react-router-dom";
import { getUfcTwentyQuestionsUniverse } from "../games/twentyQuestionsUfcAuthority";
import { createTwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import { useIdentity } from "../identity/IdentityProvider";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

function createUfcTwentyQuestionsRound() {
  return createTwentyQuestionsRound("ufc", getUfcTwentyQuestionsUniverse());
}

export default function UfcTwentyQuestionsPage() {
  const identity = useIdentity();

  if (!identity.ready) return null;
  if (identity.profile?.canControlPicks !== true) return <Navigate to="/play" replace />;

  return <TwentyQuestionsPage sport="ufc" createRound={createUfcTwentyQuestionsRound} />;
}
