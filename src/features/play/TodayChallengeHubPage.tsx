import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "./PlayLandingPresentation";
import { isFamilyFeudPrototypeOwner } from "./familyFeudPrototypeAccess";
import TodayChallengeHub from "./TodayChallengeHub";
import { WeeklyChampionshipRecap } from "./WeeklyChampionshipRecap";
import { WeeklyChampionshipRecap } from "./WeeklyChampionshipRecap";

export default function TodayChallengeHubPage() {
  const navigate = useNavigate();
  const identity = useIdentity();

  return (
    <div className="page play-page today-challenge-hub-page">
      <PlayLandingHeader sport="ufc" />
      {identity.status === "ready" && identity.profile?.id ? <WeeklyChampionshipRecap sport="ufc" /> : null}

      <TodayChallengeHub />
      <ChallengeCenter />

      <PlayLandingGameLibrary sport="ufc"
        onNavigate={navigate}
        familyFeudVisible={isFamilyFeudPrototypeOwner(identity.profile)}
      />
    </div>
  );
}
