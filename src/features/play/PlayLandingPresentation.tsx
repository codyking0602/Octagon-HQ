import type { ReactNode } from "react";
import { playGameDefinition, type PlayGameId, type PlaySport } from "./playRegistry";

export const PLAY_LANDING_COMMON_GAME_ORDER = [
  "find-leader",
  "wavelength",
  "blind-resume",
  "hit-the-number",
] as const satisfies readonly PlayGameId[];

export const PLAY_LANDING_FOOTBALL_GAME_ORDER = [
  "find-leader",
  "wavelength",
  "blind-rank",
  "keep-cut",
  "hit-the-number",
] as const satisfies readonly PlayGameId[];

export const PLAY_LANDING_UFC_STRATEGIC_GAME = "auction" as const satisfies PlayGameId;

export function playLandingGameIds(sport: PlaySport): readonly PlayGameId[] {
  return sport === "ufc"
    ? [PLAY_LANDING_UFC_STRATEGIC_GAME, ...PLAY_LANDING_COMMON_GAME_ORDER]
    : PLAY_LANDING_FOOTBALL_GAME_ORDER;
}

export function playLandingDestination(sport: PlaySport, gameId: PlayGameId) {
  const game = playGameDefinition(gameId, sport);
  const temporaryFootballComparison = sport === "football" && (gameId === "blind-rank" || gameId === "keep-cut");
  if (temporaryFootballComparison) return `${game.route}?mode=replayable`;
  return sport === "ufc" && gameId === "find-leader"
    ? `${game.route}?mode=replayable`
    : game.route;
}

export function PlayLandingHeader({ sport }: { sport: PlaySport }) {
  return (
    <section className="play-landing-heading" data-sport={sport}>
      <h1>Play</h1>
      <p>Daily games.</p>
    </section>
  );
}

type PlayLandingGameLibraryProps = {
  sport: PlaySport;
  onNavigate: (route: string) => void;
  footer?: ReactNode;
};

export function PlayLandingGameLibrary({ sport, onNavigate, footer }: PlayLandingGameLibraryProps) {
  const games = playLandingGameIds(sport).map((gameId) => playGameDefinition(gameId, sport));

  return (
    <section className="play-landing-library" data-sport={sport} aria-labelledby={`${sport}-all-games-title`}>
      <header className="play-landing-library__heading">
        <div>
          <p className="eyebrow">ALL GAMES</p>
          <h2 id={`${sport}-all-games-title`}>Pick a game</h2>
          <p>Quick games and blind tests, ready whenever the debate starts.</p>
        </div>
        <span>{games.length} LIVE</span>
      </header>

      <div className="play-landing-library__grid" aria-label={`${sport === "ufc" ? "UFC" : "Football"} games`}>
        {games.map((game) => {
          const strategic = sport === "ufc" && game.id === PLAY_LANDING_UFC_STRATEGIC_GAME;
          const temporaryFootballComparison = sport === "football" && (game.id === "blind-rank" || game.id === "keep-cut");
          return (
            <button
              className={`play-landing-game-card${strategic ? " is-strategic" : ""}`}
              type="button"
              key={game.route}
              onClick={() => onNavigate(playLandingDestination(sport, game.id))}
            >
              <span className="play-landing-game-card__icon" aria-hidden="true">{game.icon}</span>
              <span className="play-landing-game-card__status">
                {temporaryFootballComparison ? "TEMP CASUAL" : strategic ? "STRATEGY" : "PLAY NOW"}
              </span>
              <strong>{game.title}</strong>
              <small>{game.description}</small>
              <em>PLAY →</em>
            </button>
          );
        })}
      </div>
      {footer}
    </section>
  );
}
