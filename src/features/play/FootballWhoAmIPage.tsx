import { createFootballWhoAmIRound } from "../games/whoAmIAuthority";
import WhoAmIPage from "./WhoAmIPage";

export default function FootballWhoAmIPage() {
  return <WhoAmIPage sport="football" createRound={createFootballWhoAmIRound} />;
}
