import { createUfcWhoAmIRound } from "../games/whoAmIAuthority";
import WhoAmIPage from "./WhoAmIPage";

export default function UfcWhoAmIPage() {
  return <WhoAmIPage sport="ufc" createRound={createUfcWhoAmIRound} />;
}
