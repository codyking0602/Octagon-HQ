import { describe, expect, it } from "vitest";
import {
  canonicalPreviewUrl,
  ensureDestinationPreview,
  previewCardFingerprint,
  previewCardImagePath,
  renderPreviewCardHtml,
} from "./previewCard";
import type { RichPreviewMetadata } from "./previewModel";

const fighterPreview: RichPreviewMetadata = {
  kind: "fighter",
  title: "Jon Jones | UFC Rank #1 | Octagon HQ",
  description: "Jon Jones is ranked #1 with a 99 OVR.",
  canonicalPath: "/fighters/jon-jones",
  images: [{
    path: "/assets/fighters/jon-jones.webp",
    alt: "Jon Jones",
  }],
};

const comparisonPreview: RichPreviewMetadata = {
  kind: "comparison",
  title: "Georges St-Pierre vs. Jon Jones | Octagon HQ",
  description: "#2 Georges St-Pierre (98 OVR) vs. #1 Jon Jones (99 OVR).",
  canonicalPath: "/rankings?compareLeft=georges-st-pierre&compareRight=jon-jones",
  images: [
    { path: "/assets/fighters/georges-st-pierre.webp", alt: "Georges St-Pierre" },
    { path: "/assets/fighters/jon-jones.webp", alt: "Jon Jones" },
  ],
};

describe("rendered rich preview cards", () => {
  it("renders one destination-specific 1200 by 630 fighter card", () => {
    const html = renderPreviewCardHtml(fighterPreview, "https://octagon.hq-app.workers.dev");

    expect(html).toContain('width=1200');
    expect(html).toContain('width:1200px;height:630px');
    expect(html).toContain("FIGHTER PROFILE");
    expect(html).toContain("JON JONES | UFC RANK #1");
    expect(html).toContain("jon-jones.webp");
    expect(html).not.toContain("app-icon.png");
  });

  it("composites both fighters into the same comparison card", () => {
    const html = renderPreviewCardHtml(comparisonPreview, "https://octagon.hq-app.workers.dev");

    expect(html).toContain("FIGHTER COMPARISON");
    expect(html).toContain("GEORGES ST-PIERRE VS. JON JONES");
    expect(html).toContain("georges-st-pierre.webp");
    expect(html).toContain("jon-jones.webp");
    expect(html).toContain("grid-template-columns:1fr 1fr");
  });

  it("places scores and the verdict directly on a completed-result card", () => {
    const result: RichPreviewMetadata = {
      kind: "game-result",
      title: "Find the Leader result | CODY wins | Octagon HQ",
      description: "CODY 8/10 vs. SHANE 6/10. CODY wins.",
      canonicalPath: "/play?challenge=AB12CD34",
      images: [{ path: "/assets/share/find-leader.svg", alt: "Find the Leader" }],
    };
    const html = renderPreviewCardHtml(result, "https://octagon.hq-app.workers.dev");

    expect(html).toContain("GAME RESULT");
    expect(html).toContain("CODY WINS");
    expect(html).toContain("CODY 8/10 vs. SHANE 6/10");
  });

  it("uses a versioned PNG URL whose fingerprint changes with visible data", () => {
    const first = previewCardImagePath(fighterPreview);
    const updated = previewCardImagePath({
      ...fighterPreview,
      description: "Jon Jones is ranked #1 with an updated 99 OVR profile.",
    });

    expect(first).toMatch(/^\/share-preview\/fighter-[0-9a-f]{8}\.png\?path=/);
    expect(first).not.toBe(updated);
    expect(previewCardFingerprint(fighterPreview)).toHaveLength(8);
  });

  it("removes the fresh share token from canonical metadata", () => {
    const url = canonicalPreviewUrl(new URL(
      "https://octagon.hq-app.workers.dev/fighters/jon-jones?share=fresh123",
    ));

    expect(url.toString()).toBe("https://octagon.hq-app.workers.dev/fighters/jon-jones");
  });

  it("never gives a recognized shared destination the generic app card", () => {
    const generic: RichPreviewMetadata = {
      kind: "default",
      title: "Octagon HQ",
      description: "Generic app preview.",
      canonicalPath: "/",
      images: [{ path: "/assets/app-icon.png", alt: "Octagon HQ" }],
    };

    const fighter = ensureDestinationPreview(
      new URL("https://octagon.hq-app.workers.dev/fighters/new-fighter?share=fresh123"),
      generic,
    );
    const comparison = ensureDestinationPreview(
      new URL("https://octagon.hq-app.workers.dev/rankings?compareLeft=jon-jones&compareRight=georges-st-pierre"),
      generic,
    );
    const recap = ensureDestinationPreview(
      new URL("https://octagon.hq-app.workers.dev/picks?event=ufc-400&view=recap"),
      generic,
    );
    const challenge = ensureDestinationPreview(
      new URL("https://octagon.hq-app.workers.dev/play?challenge=AB12CD34"),
      generic,
    );

    expect([fighter.kind, comparison.kind, recap.kind, challenge.kind]).toEqual([
      "fighter",
      "comparison",
      "picks-recap",
      "challenge",
    ]);
  });
});
