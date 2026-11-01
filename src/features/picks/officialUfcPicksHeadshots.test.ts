import { describe, expect, it } from "vitest";
import {
  approvedUfcPicksHeadshot,
  NOV07_2026_UFC_EVENT_ID,
  OCT31_2026_UFC_EVENT_ID,
} from "./officialUfcPicksHeadshots";

describe("event-specific verified UFC Picks headshot contract", () => {
  it("keeps the published October 31 official-only override intact", () => {
    expect(approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, "renato-moicano"))
      .toBe("https://a.espncdn.com/i/headshots/mma/players/full/3028863.png");
    expect(approvedUfcPicksHeadshot(OCT31_2026_UFC_EVENT_ID, "unverified-fighter"))
      .toBeNull();
  });

  it("uses the individually reviewed owner-supplied Johnny portrait, not the corrupted ESPN CDN", () => {
    expect(approvedUfcPicksHeadshot(NOV07_2026_UFC_EVENT_ID, "johnny-walker"))
      .toBe("/assets/fighters/johnny-walker-thumb.webp");
  });

  it("leaves all remaining unapproved November 7 fighters blank despite legacy local files", () => {
    for (const slug of [
      "waldo-cortes-acosta", "tatiana-suarez",
      "virna-jandiroba", "davey-grant", "elijah-smith",
      "seokhyeon-ko", "wellington-turman", "billy-elekana",
      "lucas-fernando", "mantas-kondratavicius", "andre-petroski",
    ]) {
      expect(approvedUfcPicksHeadshot(NOV07_2026_UFC_EVENT_ID, slug)).toBeNull();
    }
  });

  it("does not alter unrelated historical and future cards", () => {
    expect(approvedUfcPicksHeadshot("ufc-unrelated-event", "tatiana-suarez"))
      .toBeUndefined();
  });
});
