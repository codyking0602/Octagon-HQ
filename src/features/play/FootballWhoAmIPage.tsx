import { createFootballWhoAmIRound } from "../games/whoAmIAuthority";
import WhoAmIPage from "./WhoAmIPage";

export default function FootballWhoAmIPage() {
  return (
    <WhoAmIPage
      sport="football"
      createRound={(excludedSubjectIdsByLeague) => createFootballWhoAmIRound(Math.random, {
        NFL: excludedSubjectIdsByLeague.NFL,
        CFB: excludedSubjectIdsByLeague.CFB,
      })}
    />
  );
}
