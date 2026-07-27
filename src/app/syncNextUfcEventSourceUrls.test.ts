import { describe, expect, it } from "vitest";
import { absoluteMmaManiaArticleUrl } from "../../supabase/functions/sync-next-ufc-event/sourceUrls";

describe("sync-next-ufc-event MMA Mania article discovery", () => {
  it("accepts the dated article links returned by the fight-card index", () => {
    const indexFixture = [
      "/ufc-fight-cards",
      "/2026/7/26/ufc-fight-night-fight-card-start-time-and-lineup",
    ];

    expect(indexFixture.map(absoluteMmaManiaArticleUrl).filter(Boolean)).toEqual([
      "https://www.mmamania.com/2026/7/26/ufc-fight-night-fight-card-start-time-and-lineup",
    ]);
  });

  it("rejects links outside MMA Mania", () => {
    expect(absoluteMmaManiaArticleUrl("https://notmmamania.com/2026/7/26/ufc-fight-card")).toBe("");
  });

  it("rejects MMA Mania index and utility pages", () => {
    expect(absoluteMmaManiaArticleUrl("https://www.mmamania.com/ufc-fight-cards/?output=1")).toBe("");
    expect(absoluteMmaManiaArticleUrl("https://www.mmamania.com/search?q=ufc")).toBe("");
  });
});
