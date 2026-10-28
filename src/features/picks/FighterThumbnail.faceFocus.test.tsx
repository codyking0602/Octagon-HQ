import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FighterThumbnail } from "./FighterThumbnail";
import { approvedUfcPicksHeadshot, OCT31_2026_UFC_EVENT_ID, october31FighterSlugs, october31OfficialHeadshots } from "./officialUfcPicksHeadshots";

describe("October 31 UFC Picks actual official square headshots", () => {
  it("uses the same six verified ESPN MMA headshots", () => {
    expect(Object.values(october31OfficialHeadshots).filter((url) => url.startsWith("https://a.espncdn.com/"))).toHaveLength(6);
    for (const [slug, url] of Object.entries(october31OfficialHeadshots).filter(([, url]) => url.startsWith("https://a.espncdn.com/"))) {
      expect(url).toMatch(/^https:\/\/a\.espncdn\.com\/i\/headshots\/mma\/players\/full\/[0-9]+\.png$/);
      const { container } = render(<FighterThumbnail slug={slug} name={slug} officialHeadshot={approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, slug)} />);
      expect(container.querySelector("img.pick-fighter-thumbnail")?.getAttribute("src")).toBe(url);
      expect(container.querySelector(".pick-fighter-thumbnail--face-focus")).toBeNull();
    }
  });

  it("renders all four UFC-hosted official headshots, without stretching a wide photo", () => {
    const slugs = [
      "cody-durden", "yana-santos", "jean-paul-lebosnoyani", "farman-hasanov",
    ];
    for (const slug of slugs) {
      const url = approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, slug);
      expect(url).toMatch(/^https:\/\/ufc\.com\/images\/styles\/event_results_athlete_headshot\/s3\/20\d{2}-\d{2}\/[A-Z0-9_-]+\.png\?itok=/);
      const { container, unmount } = render(<FighterThumbnail slug={slug} name={slug} officialHeadshot={url} />);
      const img = container.querySelector("img.pick-fighter-thumbnail--ufc-headshot");
      expect(img?.getAttribute("src")).toBe(url);
      expect(container.querySelector(".pick-fighter-thumbnail--fallback")).toBeNull();
      unmount();
    }
    expect(Object.keys(october31OfficialHeadshots)).toHaveLength(10);
    expect(october31FighterSlugs.every((slug) => Boolean(approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, slug)))).toBe(true);
  });

  it("leaves genuinely unverified fighters blank without old local-image fallback", () => {
    expect(approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, "unverified-fighter")).toBeNull();
    const { container } = render(<FighterThumbnail slug="unverified-fighter" name="Unverified Fighter" officialHeadshot={null} />);
    expect(container.querySelector("img.pick-fighter-thumbnail")).toBeNull();
    expect(container.querySelector(".pick-fighter-thumbnail--fallback svg")).toBeNull();
  });

  it("does not change normal thumbnail selection for other events", () => {
    expect(approvedUfcPicksHeadshot("another-event", "cody-durden")).toBeUndefined();
    const { container } = render(<FighterThumbnail slug="cody-durden" name="Cody Durden" />);
    expect(container.querySelector("img.pick-fighter-thumbnail")).not.toBeNull();
  });
});
