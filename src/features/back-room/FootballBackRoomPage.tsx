import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";

function FootballEntryTransition({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="football-entry-transition" role="presentation">
      <video
        className="football-entry-transition__video"
        src="/assets/football/vince-young-championship-run.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={onComplete}
      />
    </div>
  );
}

export default function FootballBackRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const entryRequested = Boolean((location.state as { footballEntry?: boolean } | null)?.footballEntry);
  const showTransition = entryRequested;

  return (
    <div className="page football-room-page">
      {showTransition ? (
        <FootballEntryTransition onComplete={() => navigate("/football", { replace: true, state: null })} />
      ) : null}

      {!showTransition ? <FootballGamesEarlyAccessBanner /> : null}
      <PlayLandingHeader sport="football" />
      <TodayChallengeHub sport="football" />
      <ChallengeCenter sport="football" />
      <PlayLandingGameLibrary sport="football" onNavigate={navigate} />
    </div>
  );
}
