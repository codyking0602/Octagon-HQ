import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/football-gm-mode.css";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { useIdentity } from "../identity/IdentityProvider";
import { PlayLandingGameLibrary, PlayLandingHeader } from "../play/PlayLandingPresentation";
import TodayChallengeHub from "../play/TodayChallengeHub";
import { WeeklyChampionshipRecap } from "../play/WeeklyChampionshipRecap";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionActiveState,
} from "../play/footballWeeklyAuctionRepository";
import { FootballEntryTransition } from "./FootballEntryTransition";
import { isWheelFootballGmPlaytester } from "./wheelFootballGmAccess";
import type { FootballEntryState } from "./footballEntrySession";

type WeeklyAuctionQuickState = Pick<
  FootballWeeklyAuctionActiveState,
  "bankroll" | "owned_count" | "submitted_today" | "subject_key"
>;

function FootballWeeklyAuctionQuickAccess({ onOpen }: { onOpen: () => void }) {
  const identity = useIdentity();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [state, setState] = useState<WeeklyAuctionQuickState | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const signedIn = identity.status === "ready" && Boolean(identity.profile?.id);

  useEffect(() => {
    let active = true;
    if (!signedIn || !repository) {
      setState(null);
      setHistoryCount(0);
      return () => { active = false; };
    }

    Promise.all([repository.load(), repository.loadHistory()])
      .then(([next, history]) => {
        if (!active) return;
        setState(next.available ? next : null);
        setHistoryCount(history.length);
      })
      .catch(() => {
        if (!active) return;
        setState(null);
        setHistoryCount(0);
      });

    return () => { active = false; };
  }, [repository, signedIn]);

  if ((!state || !state.submitted_today) && historyCount === 0) return null;

  return (
    <section className="football-weekly-auction-quick" aria-label="Weekly Auction quick access">
      <button type="button" onClick={onOpen}>
        <span>
          <small>WEEKLY AUCTION</small>
          <strong>AUCTION CENTER</strong>
        </span>
        <b>{state
          ? `${state.owned_count} ${state.subject_key === "nfl-build-qb" ? "TRAIT" : "TEAM"}${state.owned_count === 1 ? "" : "S"} · ${state.bankroll} LEFT`
          : `${historyCount} WEEK${historyCount === 1 ? "" : "S"} SAVED`}</b>
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
  const gmPlaytestVisible = isWheelFootballGmPlaytester(identity.profile);

  return (
    <div className="page football-room-page">
      {showTransition ? (
        <FootballEntryTransition
          surface="play"
          onComplete={() => navigate("/football", { replace: true, state: null })}
        />
      ) : null}

      <PlayLandingHeader sport="football" />
      {identity.status === "ready" && identity.profile?.id ? <WeeklyChampionshipRecap sport="football" /> : null}
      <TodayChallengeHub sport="football" />
      <FootballWeeklyAuctionQuickAccess onOpen={() => navigate("/football/weekly-auction")} />
      {gmPlaytestVisible ? (
        <section className="football-gm-entry" aria-label="GM Mode owner playtest">
          <button type="button" onClick={() => navigate("/football/gm-mode")}>
            <span className="football-gm-entry__mark" aria-hidden="true">GM</span>
            <span>
              <small>OWNER PLAYTEST</small>
              <strong>GM Mode</strong>
              <p>Build under a $155M cap, survive the offseason, and manage a three-year NFL window.</p>
            </span>
            <em>PLAY →</em>
          </button>
        </section>
      ) : null}
      <ChallengeCenter sport="football" />
      <PlayLandingGameLibrary sport="football" onNavigate={navigate} />
    </div>
  );
}
