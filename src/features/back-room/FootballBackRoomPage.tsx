import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import { isFamilyFeudPrototypeOwner } from "../play/familyFeudPrototypeAccess";
import { isFootballWeeklyAuctionFinalPreviewOwner } from "../play/footballWeeklyAuctionFinalPreviewAccess";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { WeeklyChampionshipRecap } from "../play/WeeklyChampionshipRecap";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionActiveState,
} from "../play/footballWeeklyAuctionRepository";
import { FootballEntryTransition } from "./FootballEntryTransition";
import type { FootballEntryState } from "./footballEntrySession";

type WeeklyAuctionQuickState = Pick<
  FootballWeeklyAuctionActiveState,
  "bankroll" | "owned_count" | "submitted_today" | "previous_final" | "subject_key"
>;

function FootballWeeklyAuctionQuickAccess({ onOpen }: { onOpen: () => void }) {
  const identity = useIdentity();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [state, setState] = useState<WeeklyAuctionQuickState | null>(null);
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);

  useEffect(() => {
    let active = true;
    if (!signedIn || !repository) {
      setState(null);
      return () => { active = false; };
    }

    repository.load()
      .then((next) => {
        if (!active) return;
        setState(
          next.available && next.submitted_today && !next.previous_final
            ? next
            : null,
        );
      })
      .catch(() => {
        if (active) setState(null);
      });

    return () => { active = false; };
  }, [repository, signedIn]);

  if (!state) return null;

  return (
    <section className="football-weekly-auction-quick" aria-label="Weekly Auction quick access">
      <button type="button" onClick={onOpen}>
        <span>
          <small>WEEKLY AUCTION</small>
          <strong>EDIT BIDS</strong>
        </span>
        <b>{state.owned_count} {state.subject_key === "nfl-build-qb" ? "TRAIT" : "TEAM"}{state.owned_count === 1 ? "" : "S"} · {"$"}{state.bankroll} LEFT</b>
        <em>OPEN →</em>
      </button>
    </section>
  );
}

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

      <PlayLandingHeader sport="football" />
      <WeeklyChampionshipRecap sport="football" />
      <TodayChallengeHub sport="football" />
      <FootballWeeklyAuctionQuickAccess onOpen={() => navigate("/football/today?weekly=edit")} />
      <ChallengeCenter sport="football" />
      <PlayLandingGameLibrary sport="football"
        onNavigate={navigate}
        familyFeudVisible={isFamilyFeudPrototypeOwner(identity.profile)}
        weeklyAuctionFinalPreviewVisible={isFootballWeeklyAuctionFinalPreviewOwner(identity.profile)}
      />
    </div>
  );
}
