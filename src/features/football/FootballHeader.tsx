import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import type { FootballTeam } from "../profile/profilePreferencesModel";
import { FOOTBALL_TEAM_LABELS, FootballHelmet } from "./FootballHelmet";

export function FootballHeader() {
  const {
    footballTeam,
    savingFootballTeam,
    setFootballTeam,
  } = useProfilePreferences();
  const [switching, setSwitching] = useState(false);

  async function chooseTeam(team: FootballTeam) {
    if (team === footballTeam) {
      setSwitching(false);
      return;
    }
    const saved = await setFootballTeam(team);
    if (saved) setSwitching(false);
  }

  return (
    <header className="app-header football-header">
      <div className="football-header__left">
        <Link className="football-header__back" to="/play" aria-label="Back to UFC">
          <span aria-hidden="true">←</span>
          <small>BACK TO UFC</small>
        </Link>
        <strong className="football-header__title">FOOTBALL HQ</strong>
      </div>

      <div className="football-header__identity">
        {footballTeam ? (
          <button
            className="football-header__helmet-button"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={switching}
            aria-label={`Switch Football team. Current team: ${FOOTBALL_TEAM_LABELS[footballTeam]}`}
            onClick={() => setSwitching((value) => !value)}
          >
            <FootballHelmet team={footballTeam} />
          </button>
        ) : null}

        {switching && footballTeam ? (
          <div className="football-team-switcher" role="dialog" aria-label="Switch Football team">
            <p>YOUR FOOTBALL HQ</p>
            {(["cowboys", "longhorns"] as const).map((team) => (
              <button
                key={team}
                type="button"
                className={team === footballTeam ? "is-selected" : ""}
                disabled={savingFootballTeam}
                onClick={() => void chooseTeam(team)}
              >
                <FootballHelmet team={team} />
                <span>{FOOTBALL_TEAM_LABELS[team]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
