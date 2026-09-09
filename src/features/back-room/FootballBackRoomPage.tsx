import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { FootballEntryTransition } from "./FootballEntryTransition";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";
import type { FootballEntryState } from "./footballEntrySession";

export default function FootballBackRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const identity = useIdentity();
  const entrySurface = (location.state as FootballEntryState | null)?.footballEntry;
  const entryRequested = entrySurface === "play";
  const showTransition = entryRequested;

  return (
    <div className="page football-room-page">
      {showTransition ? (
        <FootballEntryTransition
          surface="play"
          onComplete={() => navigate("/football", { replace: true, state: null })}
        />
      ) : null}

      {!showTransition ? <FootballGamesEarlyAccessBanner /> : null}
      <PlayLandingHeader sport="football" />
      <TodayChallengeHub sport="football" />
      <ChallengeCenter sport="football" />
      <PlayLandingGameLibrary
        sport="football"
        onNavigate={navigate}
        ownerAccess={identity.profile?.canControlPicks === true}
      />
    </div>
  );
}
