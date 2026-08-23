import type { FootballTeam } from "../profile/profilePreferencesModel";

export const FOOTBALL_TEAM_LABELS: Record<FootballTeam, string> = {
  cowboys: "Dallas Cowboys",
  longhorns: "Texas Longhorns",
};

export function FootballHelmet({
  team,
  className = "",
}: {
  team: FootballTeam;
  className?: string;
}) {
  return (
    <span className={`football-helmet football-helmet--${team}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <svg viewBox="0 0 72 58" role="img">
        <path className="football-helmet__shell" d="M12 37C12 18 24 8 42 8c14 0 24 7 28 19l-9 3v12H46l-4-7H27v12H14c-2-3-2-6-2-10Z" />
        <path className="football-helmet__edge" d="M46 42h15V30l9-3M27 35h15l4 7" />
        {team === "cowboys" ? (
          <path className="football-helmet__mark" d="m38 16 2.6 7.8h8.2l-6.6 4.8 2.5 7.8-6.7-4.8-6.7 4.8 2.5-7.8-6.6-4.8h8.2Z" />
        ) : (
          <path className="football-helmet__mark football-helmet__mark--horns" d="M25 23c4 0 7 2 10 6 2-5 4-8 7-8s5 3 7 8c3-4 6-6 10-6-2 5-6 9-11 10-2 1-4 4-6 8-2-4-4-7-6-8-5-1-9-5-11-10Z" />
        )}
      </svg>
    </span>
  );
}
