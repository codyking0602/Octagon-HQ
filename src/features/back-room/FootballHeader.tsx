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
      <svg viewBox="0 0 92 68" role="img">
        <path
          className="football-team-helmet__shell"
          d="M8 39C8 18 24 5 47 5c19 0 32 10 36 29l-18 1c-3-8-10-12-20-12H33v22H18v-7H8Z"
        />
        <path
          className="football-team-helmet__lower"
          d="M33 42h29l4-9h16v7H71l-5 13H42v7H31Z"
        />
        <path
          className="football-team-helmet__facemask"
          d="M64 35h20v7H70m10-3v13H59m4-17-6 17H44"
        />
        <circle className="football-team-helmet__earhole" cx="48" cy="37" r="4.4" />
        {team === "cowboys" ? (
          <path
            className="football-team-helmet__mark football-team-helmet__mark--cowboys"
            d="m42 12 2.7 7.1 7.6.3-5.9 4.7 2.1 7.3-6.5-4.2-6.4 4.2 2-7.3-5.9-4.7 7.6-.3Z"
          />
        ) : (
          <path
            className="football-team-helmet__mark football-team-helmet__mark--longhorns"
            d="M27 16c3.1 4.8 7 7.7 11.8 8.8l3.7-3.2 3.7 3.2C51 23.7 55 20.8 58 16c-.6 6.2-3.5 10.8-8.7 13.5l-2.4 6.7-4.4-4.3-4.4 4.3-2.4-6.7C30.5 26.8 27.6 22.2 27 16Z"
          />
        )}
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
