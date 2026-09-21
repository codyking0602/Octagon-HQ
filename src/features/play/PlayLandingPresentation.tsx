import type { ReactNode } from "react";
import { playGameDefinition, type PlayGameId, type PlaySport } from "./playRegistry";

export const PLAY_LANDING_COMMON_GAME_ORDER = [
  "find-leader",
  "wavelength",
  "blind-resume",
  "who-am-i",
  "hit-the-number",
] as const satisfies readonly PlayGameId[];

export const PLAY_LANDING_FOOTBALL_GAME_ORDER = [
  "find-leader",
  "wavelength",
  "who-am-i",
  "hit-the-number",
] as const satisfies readonly PlayGameId[];

export const PLAY_LANDING_UFC_STRATEGIC_GAME = "auction" as const satisfies PlayGameId;
export const PLAY_LANDING_FOOTBALL_STRATEGIC_GAME = "draft-room" as const satisfies PlayGameId;

export function playLandingGameIds(sport: PlaySport): readonly PlayGameId[] {
  if (sport === "ufc") return [PLAY_LANDING_UFC_STRATEGIC_GAME, ...PLAY_LANDING_COMMON_GAME_ORDER];
  return [PLAY_LANDING_FOOTBALL_STRATEGIC_GAME, ...PLAY_LANDING_FOOTBALL_GAME_ORDER];
}

export function playLandingDestination(sport: PlaySport, gameId: PlayGameId) {
  const game = playGameDefinition(gameId, sport);
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
  familyFeudVisible?: boolean;
  weeklyAuctionFinalPreviewVisible?: boolean;
};

export function PlayLandingGameLibrary({
  sport,
  onNavigate,
  footer,
  familyFeudVisible = false,
  weeklyAuctionFinalPreviewVisible = false,
}: PlayLandingGameLibraryProps) {
  const games = playLandingGameIds(sport)
    .map((gameId) => playGameDefinition(gameId, sport));
  const familyFeudRoute = sport === "ufc" ? "/play/sports-feud" : "/football/sports-feud";

  return (
    <section className="play-landing-library" data-sport={sport} aria-labelledby={`${sport}-all-games-title`}>
      <header className="play-landing-library__heading">
        <div>
          <p className="eyebrow">ALL GAMES</p>
          <h2 id={`${sport}-all-games-title`}>Pick a game</h2>
          <p>Quick games and blind tests, ready whenever the debate starts.</p>
        </div>
        <span>{games.length + (familyFeudVisible ? 1 : 0) + (sport === "football" && weeklyAuctionFinalPreviewVisible ? 1 : 0)} LIVE</span>
      </header>

      <div className="play-landing-library__grid" aria-label={`${sport === "ufc" ? "UFC" : "Football"} games`}>
        {familyFeudVisible ? (
          <button
            className="play-landing-game-card is-strategic"
            type="button"
            onClick={() => onNavigate(familyFeudRoute)}
          >
            <span className="play-landing-game-card__icon" aria-hidden="true">F</span>
            <span className="play-landing-game-card__status">OWNER PREVIEW</span>
            <strong>Sports Feud</strong>
            <small>Clear two answer boards, then race through five Fast Money prompts in 30 seconds.</small>
            <em>PLAY →</em>
          </button>
        ) : null}

        {sport === "football" && weeklyAuctionFinalPreviewVisible ? (
          <button
            className="play-landing-game-card is-strategic"
            type="button"
            onClick={() => onNavigate("/football/weekly-auction-final-preview")}
          >
            <span className="play-landing-game-card__icon" aria-hidden="true">🏆</span>
            <span className="play-landing-game-card__status">OWNER PREVIEW</span>
            <strong>CFB Final Results Preview</strong>
            <small>See the exact Weekly Auction final-results experience with sanitized sample standings and grades.</small>
            <em>PREVIEW →</em>
          </button>
        ) : null}

        {games.map((game) => {
          const strategic = (sport === "ufc" && game.id === PLAY_LANDING_UFC_STRATEGIC_GAME)
            || (sport === "football" && game.id === PLAY_LANDING_FOOTBALL_STRATEGIC_GAME);
          return (
            <button
              className={`play-landing-game-card${strategic ? " is-strategic" : ""}`}
              type="button"
              key={game.route}
              onClick={() => onNavigate(playLandingDestination(sport, game.id))}
            >
              <span className="play-landing-game-card__icon" aria-hidden="true">{game.icon}</span>
              <span className="play-landing-game-card__status">
                {game.availability === "preview" ? "OWNER PREVIEW" : "PLAY NOW"}
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
