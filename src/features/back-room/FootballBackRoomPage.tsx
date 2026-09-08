import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";

export default function FootballBackRoomPage() {
  const navigate = useNavigate();

  return (
    <div className="page football-room-page">
      <FootballGamesEarlyAccessBanner />
      <PlayLandingHeader sport="football" />
      <TodayChallengeHub sport="football" />
      <ChallengeCenter sport="football" />
      <PlayLandingGameLibrary sport="football" onNavigate={navigate} />
    </div>
  );
}
