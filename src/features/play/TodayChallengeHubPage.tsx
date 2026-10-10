import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayV2Page from "./PlayV2Page";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "./PlayLandingPresentation";
import TodayChallengeHub from "./TodayChallengeHub";
import { WeeklyOverallChampionBanner } from "./WeeklyOverallChampionBanner";

export default function TodayChallengeHubPage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const [classic, setClassic] = useState(false);
  if (identity.status === "ready" && identity.profile?.canControlPicks === true && !classic) {
    return <PlayV2Page sport="ufc" onClassic={() => setClassic(true)} />;
  }

  return (
    <div className="page play-page today-challenge-hub-page">
      {identity.profile?.canControlPicks === true ? <button type="button" className="secondary-action" onClick={() => setClassic(false)}>OPEN PLAY 2.0 PREVIEW →</button> : null}
      <PlayLandingHeader sport="ufc" />
      {identity.status === "ready" && identity.profile?.id ? <WeeklyOverallChampionBanner sport="ufc" /> : null}

      <TodayChallengeHub />
      <ChallengeCenter />

      <PlayLandingGameLibrary sport="ufc" onNavigate={navigate} />
    </div>
  );
}
