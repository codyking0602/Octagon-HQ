import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "./PlayLandingPresentation";
import TodayChallengeHub from "./TodayChallengeHub";

export default function TodayChallengeHubPage() {
  const navigate = useNavigate();
  const identity = useIdentity();

  return (
    <div className="page play-page today-challenge-hub-page">
      <PlayLandingHeader sport="ufc" />

      <TodayChallengeHub />
      <ChallengeCenter />

      <PlayLandingGameLibrary
        sport="ufc"
        onNavigate={navigate}
        ownerAccess={identity.profile?.canControlPicks === true}
      />
    </div>
  );
}
