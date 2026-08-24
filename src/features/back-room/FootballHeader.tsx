import { Link } from "react-router-dom";
import { useProfilePreferences } from "../profile/ProfilePreferencesProvider";
import type { FootballTeam } from "../profile/profilePreferencesRepository";

const TEAM_LABELS: Record<FootballTeam, string> = {
  cowboys: "Cowboys",
  longhorns: "Longhorns",
};

export function FootballTeamHelmet({ team }: { team: FootballTeam }) {
  return (
    <span className={`football-team-helmet football-team-helmet--${team}`} aria-hidden="true">
      <svg viewBox="0 0 64 52" role="img">
        <path d="M8 29C8 14 18 5 34 5c13 0 22 8 22 20v7H43l-5 10H22v-8H8Z" />
        <path d="M43 32h13v8H43Z" />
        <text x="31" y="28" textAnchor="middle">{team === "cowboys" ? "★" : "T"}</text>
      </svg>
    </span>
  );
}

export function FootballHeader() {
  const {
    footballTeam,
    setFootballTeam,
    savingFootballTeam,
    footballTeamConfigured,
  } = useProfilePreferences();

  const chooseTeam = (team: FootballTeam) => {
    if (team === footballTeam || savingFootballTeam) return;
    void setFootballTeam(team);
  };

  return (
    <header className="app-header app-header--football">
      <div className="football-header__brand">
        <small>OCTAGON HQ</small>
        <strong>FOOTBALL HQ</strong>
      </div>

      <div className="football-header__actions">
        <Link className="football-header__ufc" to="/play">Back to UFC</Link>
        {footballTeam ? (
          <details className="football-team-switcher">
            <summary aria-label={`Football team: ${TEAM_LABELS[footballTeam]}`}>
              <FootballTeamHelmet team={footballTeam} />
              <span className="football-team-switcher__label">
                <small>TEAM</small>
                <strong>{TEAM_LABELS[footballTeam]}</strong>
              </span>
              <span className="football-team-switcher__chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="football-team-switcher__menu">
              {(["cowboys", "longhorns"] as const).map((team) => (
                <button
                  key={team}
                  type="button"
                  disabled={!footballTeamConfigured || savingFootballTeam}
                  aria-pressed={footballTeam === team}
                  onClick={() => chooseTeam(team)}
                >
                  <FootballTeamHelmet team={team} />
                  <span>
                    <strong>{TEAM_LABELS[team]}</strong>
                    <small>{team === "cowboys" ? "NAVY · SILVER" : "BURNT ORANGE · CREAM"}</small>
                  </span>
                </button>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </header>
  );
}
