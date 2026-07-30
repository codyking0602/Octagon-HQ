import { describe, expect, it } from "vitest";
import {
  dynamicPreviewRequest,
  resolveRichPreview,
  type RichPreviewCatalog,
} from "./previewModel";

const catalog: RichPreviewCatalog = {
  version: 2,
  fighters: [
    {
      slug: "jon-jones",
      displayName: "Jon Jones",
      board: "men",
      rank: 1,
      ovr: 99,
      division: "Light Heavyweight / Heavyweight",
      oneLiner: "The UFC-only benchmark.",
      imagePath: "/assets/fighters/jon-jones.webp",
    },
    {
      slug: "georges-st-pierre",
      displayName: "Georges St-Pierre",
      board: "men",
      rank: 2,
      ovr: 98,
      division: "Welterweight / Middleweight",
      oneLiner: "The complete champion case.",
      imagePath: "/assets/fighters/georges-st-pierre.webp",
    },
  ],
  games: [
    {
      id: "find-leader",
      title: "Find the Leader",
      description: "Leave the stat leader standing.",
      imagePath: "/assets/share/find-leader.svg",
    },
    {
      id: "blind-resume",
      title: "Blind Resume",
      description: "Choose the stronger UFC career five times.",
      imagePath: "/assets/share/blind-resume.svg",
    },
  ],
  fighterAssets: {
    "jon-jones": "/assets/fighters/jon-jones.webp",
    "georges-st-pierre": "/assets/fighters/georges-st-pierre.webp",
  },
};

describe("resolveRichPreview", () => {
  it("builds fighter, ranking, and oriented comparison previews", () => {
    const fighter = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/jon-jones"),
      catalog,
    );
    expect(fighter).toMatchObject({
      kind: "fighter",
      title: "Jon Jones | UFC Rank #1 | Octagon HQ",
      canonicalPath: "/fighters/jon-jones",
    });

    const ranking = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?fighter=jon-jones"),
      catalog,
    );
    expect(ranking.kind).toBe("ranking");

    const comparison = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?compareLeft=georges-st-pierre&compareRight=jon-jones"),
      catalog,
    );
    expect(comparison.title).toBe("Georges St-Pierre vs. Jon Jones | Octagon HQ");
    expect(comparison.images.map((image) => image.path)).toEqual([
      "/assets/fighters/georges-st-pierre.webp",
      "/assets/fighters/jon-jones.webp",
    ]);
  });

  it("identifies only exact dynamic preview requests", () => {
    expect(dynamicPreviewRequest(new URL(
      "https://octagon.hq-app.workers.dev/picks?event=ufc-400&view=recap",
    ))).toEqual({ kind: "picks-recap", key: "ufc-400" });
    expect(dynamicPreviewRequest(new URL(
      "https://octagon.hq-app.workers.dev/play?challenge=AB12CD34",
    ))).toEqual({ kind: "challenge", key: "AB12CD34" });
    expect(dynamicPreviewRequest(new URL(
      "https://octagon.hq-app.workers.dev/rankings?update=0123456789abcdef0123456789abcdef01234567",
    ))).toEqual({
      kind: "major-ranking-update",
      key: "0123456789abcdef0123456789abcdef01234567",
    });
    expect(dynamicPreviewRequest(new URL(
      "https://octagon.hq-app.workers.dev/play/find-leader?challenge=daily-2026-07-30",
    ))).toBeNull();
  });

  it("renders a reproducible game challenge without using the app logo", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/play/blind-resume?seed=locked-board"),
      catalog,
    );
    expect(preview.kind).toBe("challenge");
    expect(preview.title).toBe("Blind Resume challenge | Octagon HQ");
    expect(preview.images[0]?.path).toBe("/assets/share/blind-resume.svg");
  });

  it("renders completed matchup scores and verdicts", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/play?challenge=AB12CD34"),
      catalog,
      {
        kind: "game-result",
        game_id: "find-leader",
        game_title: "Find the Leader",
        summary: "Who can leave the leader standing?",
        creator_name: "CODY",
        responder_name: "SHANE",
        creator_score: "8/10",
        responder_score: "6/10",
        verdict: "CODY wins",
      },
    );
    expect(preview.kind).toBe("game-result");
    expect(preview.title).toContain("CODY wins");
    expect(preview.description).toContain("CODY 8/10 vs. SHANE 6/10");
    expect(preview.images[0]?.path).toBe("/assets/share/find-leader.svg");
  });

  it("renders Picks recap leaders and main-event fighters", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/picks?event=ufc-400&view=recap"),
      catalog,
      {
        kind: "picks-recap",
        event_id: "ufc-400",
        event_name: "UFC 400",
        subtitle: "Jones vs. St-Pierre",
        entrant_count: 4,
        leaders: [{
          display_name: "CODY",
          correct: 8,
          incorrect: 2,
          missing: 0,
          total_points: 35,
        }],
        main_event: {
          red_fighter_slug: "jon-jones",
          red_fighter_name: "Jon Jones",
          blue_fighter_slug: "georges-st-pierre",
          blue_fighter_name: "Georges St-Pierre",
        },
      },
    );
    expect(preview.kind).toBe("picks-recap");
    expect(preview.description).toContain("CODY won with 35 points (8-2)");
    expect(preview.images.map((image) => image.path)).toEqual([
      "/assets/fighters/jon-jones.webp",
      "/assets/fighters/georges-st-pierre.webp",
    ]);
  });

  it("renders major movement evidence with real fighter imagery", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?update=0123456789abcdef0123456789abcdef01234567"),
      catalog,
      {
        kind: "major-ranking-update",
        source_sha: "0123456789abcdef0123456789abcdef01234567",
        title: "The UFC rankings had a major shakeup",
        summary: "Six fighters moved three or more spots.",
        movement_count: 6,
        movements: [
          {
            fighter_slug: "jon-jones",
            fighter_name: "Jon Jones",
            board: "men",
            previous_rank: 4,
            current_rank: 1,
            movement: 3,
          },
          {
            fighter_slug: "georges-st-pierre",
            fighter_name: "Georges St-Pierre",
            board: "men",
            previous_rank: 5,
            current_rank: 2,
            movement: 3,
          },
        ],
      },
    );
    expect(preview.kind).toBe("major-ranking-update");
    expect(preview.description).toContain("Jon Jones #4 to #1");
    expect(preview.images).toHaveLength(2);
  });

  it("falls back safely and keeps the approved copy standard", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/not-real"),
      catalog,
    );
    expect(preview.kind).toBe("default");

    const fighter = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/jon-jones"),
      catalog,
    );
    expect(`${fighter.title} ${fighter.description}`).toContain("UFC Rank #1");
    expect(`${fighter.title} ${fighter.description}`).not.toMatch(/r[éÉ]sum[éÉ]/);
  });
});
