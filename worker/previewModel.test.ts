import { describe, expect, it } from "vitest";
import {
  resolveRichPreview,
  type RankingPreviewCatalog,
} from "./previewModel";

const catalog: RankingPreviewCatalog = {
  version: 1,
  fighters: [
    {
      slug: "jon-jones",
      displayName: "Jon Jones",
      board: "men",
      rank: 1,
      ovr: 99,
      division: "Light Heavyweight / Heavyweight",
      oneLiner: "The UFC-only GOAT benchmark.",
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
};

describe("resolveRichPreview", () => {
  it("builds a fighter preview from the canonical ranking catalog", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/jon-jones"),
      catalog,
    );

    expect(preview).toMatchObject({
      kind: "fighter",
      title: "Jon Jones | UFC GOAT #1 | Octagon HQ",
      canonicalPath: "/fighters/jon-jones",
    });
    expect(preview.description).toContain("99 OVR");
    expect(preview.images[0]?.path).toBe("/assets/fighters/jon-jones.webp");
  });

  it("preserves comparison orientation and exposes both fighters", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?compareLeft=georges-st-pierre&compareRight=jon-jones"),
      catalog,
    );

    expect(preview.kind).toBe("comparison");
    expect(preview.title).toBe("Georges St-Pierre vs. Jon Jones | Octagon HQ");
    expect(preview.canonicalPath).toBe(
      "/rankings?compareLeft=georges-st-pierre&compareRight=jon-jones",
    );
    expect(preview.images.map((image) => image.path)).toEqual([
      "/assets/fighters/georges-st-pierre.webp",
      "/assets/fighters/jon-jones.webp",
    ]);
  });

  it("builds a direct ranking preview", () => {
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?fighter=jon-jones"),
      catalog,
    );

    expect(preview.kind).toBe("ranking");
    expect(preview.title).toContain("UFC GOAT #1");
    expect(preview.canonicalPath).toBe("/rankings?fighter=jon-jones");
  });

  it("falls back safely for unknown fighters and malformed comparisons", () => {
    expect(resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/not-real"),
      catalog,
    ).kind).toBe("default");
    expect(resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?compareLeft=jon-jones&compareRight=jon-jones"),
      catalog,
    ).kind).toBe("default");
  });

  it("normalizes accented or punctuated variants in preview copy", () => {
    const accentedCatalog: RankingPreviewCatalog = {
      ...catalog,
      fighters: [{
        ...catalog.fighters[0],
        oneLiner: "The G.O.A.T. résumé case.",
      }],
    };
    const preview = resolveRichPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/jon-jones"),
      accentedCatalog,
    );

    expect(preview.description).toContain("GOAT resume");
    expect(preview.description).not.toMatch(/G\.O\.A\.T\.|résumé|resumé/i);
  });
});
