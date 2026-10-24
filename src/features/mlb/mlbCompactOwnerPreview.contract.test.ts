import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync("src/features/home/HomePage.tsx", "utf8");
const mlb = readFileSync("src/features/mlb/MlbHomeHq.tsx", "utf8");
const spotlight = readFileSync("src/features/mlb/MlbPlayerSpotlight.tsx", "utf8");
const championship = readFileSync("src/features/home/OwnerChampionshipHome.tsx", "utf8");
const css = readFileSync("src/styles/mlb-playoffs.css", "utf8");

describe("MLB compact public Home", () => {
  it("makes the compact MLB design public while keeping preview data privileged", () => {
    expect(homepage).toContain("const compactMlbPreview = true;");
    expect(homepage).toContain("const compactFootballPreview = true;");
    expect(homepage).toContain("previewMode={identity.profile?.canControlPicks === true}");
    expect(homepage).toContain('compactPreview={compactMlbPreview}');
    expect(mlb).toContain('compactPreview ? " mlb-hq--compact-preview" : ""');
  });

  it("preserves legacy MLB card and the public concise presentation", () => {
    expect(mlb).toContain('className="home-event-card__picks-grid"');
    expect(mlb).toContain('className="mlb-hq__compact-picks"');
    expect(mlb).toContain('postseasonWinRate === null ? "RESULTS PENDING"');
    expect(mlb).toContain("mlbPostseasonPickRecord");
    expect(mlb).toContain('mlbCompactSeriesStatus(spotlightSeries)');
    expect(mlb).toContain('className="home-weekly-games-row"');
    expect(mlb).toContain('challengePlayable ? "PLAY →" : "VIEW →"');
    expect(mlb).not.toContain('className="mlb-hq__header-round"');
    expect(mlb).toContain('to="/mlb/picks#mlb-bracket"');
    expect(mlb).toContain('to={challengePlayable ? featuredChallenge?.route ?? "/mlb" : "/mlb"}');
    expect(mlb).toContain('to={`/mlb/series/${spotlightSeries.series_id}`}');
    expect(mlb).toContain('VIEW ALL SERIES →');
  });

  it("keeps real spotlight data, four stats, the profile and highlight links", () => {
    expect(spotlight).toContain('className="mlb-player-spotlight__name-link"');
    expect(spotlight).toContain('mlb-player-spotlight__profile-media');
    expect(spotlight).toContain("player.stats.map");
    expect(spotlight).toContain("player.highlightUrl");
  });

  it("shows compact and neutral MLB championship to everyone", () => {
    expect(championship).toContain('compactMlbPreview = false');
    expect(championship).toContain('home-champ-preview--compact-mlb');
    expect(championship).toContain('mlb?.own?.series_rank');
    expect(championship).toContain('mlb?.own?.bracket_rank');
    expect(championship).toContain('mlb?.own?.play_rank');
    expect(css).toContain('.home-sport-hq--mlb.mlb-hq--compact-preview');
    expect(css).toContain('background: #1b1d20;');
    expect(css).toContain(".mlb-hq--compact-preview .mlb-player-spotlight__profile-media::after");
    expect(css).toContain("box-shadow: none;");
    expect(css).toContain(".mlb-hq--compact-preview .football-hq-game-row");
  });
});
