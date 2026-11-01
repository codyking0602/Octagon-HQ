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

  it("leaves every unapproved November 7 fighter blank, even if a legacy local or ESPN URL exists", () => {
    for (const slug of [
      "waldo-cortes-acosta", "johnny-walker", "tatiana-suarez",
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
