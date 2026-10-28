import { useSearchParams } from "react-router-dom";
import MillionaireCasualPage from "../play/MillionaireCasualPage";

/** No official Daily backend or leaderboard writes during owner playtesting. */
export default function NbaMillionairePage() {
  const [params] = useSearchParams();
  return <MillionaireCasualPage scope="nba" dailyPreview={params.get("mode") === "daily"} />;
}
