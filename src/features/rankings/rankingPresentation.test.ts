import { describe, expect, it } from "vitest";
import { allTime } from "./rankingModel";
import { profileSignatureFightUrls } from "./profileSignatureFightUrls";
import { resolveProfileWatchAction } from "./rankingPresentation";

describe("ranking profile watch actions", () => {
  const actions = allTime.map((fighter) => ({
    fighter,
    action: resolveProfileWatchAction(fighter.slug),
  }));

  it("restores a V1 signature fight for every ranked fighter", () => {
    expect(Object.keys(profileSignatureFightUrls)).toHaveLength(allTime.length);
    expect(actions.filter(({ action }) => action?.source === "signature")).toHaveLength(allTime.length);
    expect(actions.filter(({ action }) => action?.source === "watch-moment")).toHaveLength(0);
    expect(actions.filter(({ action }) => action === null)).toHaveLength(0);
  });

  it("never routes a signature-fight action to UFC Fight Pass search", () => {
    actions.forEach(({ action }) => {
      expect(action?.url).not.toContain("ufcfightpass.com");
      expect(action?.url).toMatch(/^https:\/\/(youtu\.be|www\.youtube\.com)\//);
    });
  });

  it("does not assign the same signature-fight destination to multiple fighters", () => {
    const ownersByUrl = new Map<string, string[]>();
    Object.entries(profileSignatureFightUrls).forEach(([slug, url]) => {
      ownersByUrl.set(url, [...(ownersByUrl.get(url) ?? []), slug]);
    });
    const duplicates = [...ownersByUrl.entries()].filter(([, slugs]) => slugs.length > 1);
    expect(duplicates).toEqual([]);
  });

  it("locks the corrected Matt Hughes destination separately from Shogun Rua", () => {
    const mattHughes = resolveProfileWatchAction("matt-hughes");
    const shogunRua = resolveProfileWatchAction("shogun-rua");

    expect(mattHughes).toMatchObject({
      label: "Watch Signature Fight",
      source: "signature",
      url: "https://youtu.be/W7StRPCtF-E?is=W9q0sloxVcyJN5XW",
    });
    expect(shogunRua?.url).toBe(
      "https://youtu.be/08YmP1EM2ms?is=gQIDS9i91zPsk3kX",
    );
    expect(mattHughes?.url).not.toBe(shogunRua?.url);
  });

  it("uses the locked V1 destinations for representative fighters", () => {
    expect(resolveProfileWatchAction("jon-jones")).toMatchObject({
      label: "Watch Signature Fight",
      source: "signature",
      url: "https://youtu.be/ILOnZDCbmKM?is=YBFWXqGDjc9mpcjR",
    });
    expect(resolveProfileWatchAction("georges-st-pierre")?.url).toBe(
      "https://youtu.be/4BCLM2kLh9I?is=F6TfTvsJpzKshLPK",
    );
    expect(resolveProfileWatchAction("alex-pantoja")?.url).toBe(
      "https://youtu.be/7sj-snC5qWk?is=_DkasmmAc4OA-IDR",
    );
    expect(resolveProfileWatchAction("amanda-nunes")?.url).toBe(
      "https://youtu.be/qwPBPiUzgag?is=pTBaihmA06TEDxKo",
    );
  });
});
