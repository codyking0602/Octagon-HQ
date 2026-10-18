import { useNavigate } from "react-router-dom";
import WhoAmIPage from "../play/WhoAmIPage";
import {
  createNbaWhoAmIAuthoredCasualRound,
  rememberNbaWhoAmIAuthoredCasualRound,
} from "../play/nbaWhoAmIAuthoredCasual";

export default function NbaWhoAmIPage() {
  const navigate = useNavigate();
  return (
    <WhoAmIPage
      sport="nba"
      onAllGames={() => navigate("/nba")}
      onRoundShown={rememberNbaWhoAmIAuthoredCasualRound}
      createRound={(exclusions) => createNbaWhoAmIAuthoredCasualRound(
        Math.random, exclusions.NBA,
      )}
    />
  );
}
