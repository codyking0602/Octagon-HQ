import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import type { FootballTeam } from "../profile/profilePreferencesModel";
import { FOOTBALL_TEAM_LABELS, FootballHelmet } from "./FootballHelmet";

export const FOOTBALL_TRANSITION_ASSET = "/assets/football/vince-young-transition.mp4";
export const FOOTBALL_TRANSITION_MS = 1900;

type EntryPhase = "checking" | "choice" | "transition";

export default function FootballEntryPage() {
  const navigate = useNavigate();
  const {
    footballTeam,
    loading,
    savingFootballTeam,
    error,
    setFootballTeam,
  } = useProfilePreferences();
  const [phase, setPhase] = useState<EntryPhase>("checking");

  useEffect(() => {
    if (loading || phase !== "checking") return;
    setPhase(footballTeam ? "transition" : "choice");
  }, [footballTeam, loading, phase]);

  const finishTransition = useCallback(() => {
    navigate("/football", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (phase !== "transition") return undefined;
    const timer = window.setTimeout(finishTransition, FOOTBALL_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [finishTransition, phase]);

  async function chooseTeam(team: FootballTeam) {
    const saved = await setFootballTeam(team);
    if (saved) setPhase("transition");
  }

  if (phase === "checking") {
    return <div className="football-entry football-entry--checking" aria-busy="true" aria-label="Loading Football HQ" />;
  }

  if (phase === "choice") {
    return (
      <div className="football-entry football-entry--choice">
        <section className="football-entry-choice" aria-labelledby="football-team-choice-title">
          <p className="eyebrow">WELCOME TO FOOTBALL HQ</p>
          <h1 id="football-team-choice-title">Choose your side.</h1>
          <p>Your choice sets the Football HQ accent and follows your profile across devices.</p>
          <div className="football-entry-choice__teams">
            {(["cowboys", "longhorns"] as const).map((team) => (
              <button
                key={team}
                type="button"
                disabled={savingFootballTeam}
                onClick={() => void chooseTeam(team)}
              >
                <FootballHelmet team={team} />
                <strong>{FOOTBALL_TEAM_LABELS[team]}</strong>
                <small>{team === "cowboys" ? "NAVY · SILVER" : "BURNT ORANGE · CREAM"}</small>
              </button>
            ))}
          </div>
          {error ? <p className="football-entry-choice__error" role="status">{error}</p> : null}
        </section>
      </div>
    );
  }

  return (
    <div className="football-entry football-entry--transition" aria-label="Entering Football HQ">
      <video
        className="football-entry__video"
        src={FOOTBALL_TRANSITION_ASSET}
        muted
        autoPlay
        playsInline
        preload="auto"
        onEnded={finishTransition}
        aria-hidden="true"
      />
      <div className="football-entry__shade" aria-hidden="true" />
    </div>
  );
}
