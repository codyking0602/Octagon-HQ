import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FighterThumbnail } from "./FighterThumbnail";
import { approvedUfcPicksHeadshot, OCT31_2026_UFC_EVENT_ID, october31FighterSlugs, october31OfficialHeadshots } from "./officialUfcPicksHeadshots";

describe("October 31 UFC Picks actual official square headshots", () => {
  it("uses only direct ESPN MMA headshots for the six verified sources", () => {
    expect(Object.keys(october31OfficialHeadshots)).toHaveLength(6);
    for (const [slug, url] of Object.entries(october31OfficialHeadshots)) {
      expect(url).toMatch(/^https:\/\/a\.espncdn\.com\/i\/headshots\/mma\/players\/full\/[0-9]+\.png$/);
      const { container } = render(<FighterThumbnail slug={slug} name={slug} officialHeadshot={approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, slug)} />);
      expect(container.querySelector("img.pick-fighter-thumbnail")?.getAttribute("src")).toBe(url);
      expect(container.querySelector(".pick-fighter-thumbnail--face-focus")).toBeNull();
    }
  });

  it("leaves all unverified fighters blank regardless of old locally stored photos", () => {
    const missing = october31FighterSlugs.filter((slug) => !october31OfficialHeadshots[slug]);
    expect(missing).toEqual(["cody-durden", "yana-santos", "jean-paul-lebosnoyani", "farman-hasanov"]);
    for (const slug of missing) {
      const { container } = render(<FighterThumbnail slug={slug} name={slug} officialHeadshot={approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, slug)} />);
      expect(container.querySelector("img.pick-fighter-thumbnail")).toBeNull();
      expect(container.querySelector(".pick-fighter-thumbnail--fallback")).not.toBeNull();
      expect(container.querySelector(".pick-fighter-thumbnail--fallback svg")).toBeNull();
    }
  });

  it("does not change normal thumbnail selection for other events", () => {
    expect(approvedUfcPicksHeadshot("another-event", "cody-durden")).toBeUndefined();
    const { container } = render(<FighterThumbnail slug="cody-durden" name="Cody Durden" />);
    expect(container.querySelector("img.pick-fighter-thumbnail")).not.toBeNull();
  });
});
