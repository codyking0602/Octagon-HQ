import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { PlayLandingGameLibrary, PlayLandingHeader } from "./PlayLandingPresentation";
import { isFamilyFeudPrototypeOwner } from "./familyFeudPrototypeAccess";
import TodayChallengeHub from "./TodayChallengeHub";

export default function TodayChallengeHubPage() {
  const navigate = useNavigate();

  return (
    <div className="page play-page today-challenge-hub-page">
      <PlayLandingHeader sport="ufc" />

      <TodayChallengeHub />
      <ChallengeCenter />

      <PlayLandingGameLibrary sport="ufc"
        onNavigate={navigate}
        familyFeudVisible={isFamilyFeudPrototypeOwner(identity.profile)}
      />
    </div>
  );
}
