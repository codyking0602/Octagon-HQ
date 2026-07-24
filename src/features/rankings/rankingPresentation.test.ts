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
    expect(resolveProfileWatchAction("shogun-rua")?.url).toBe(
      "https://youtu.be/08YmP1EM2ms?is=gQIDS9i91zPsk3kX",
    );
    expect(resolveProfileWatchAction("amanda-nunes")?.url).toBe(
      "https://youtu.be/qwPBPiUzgag?is=pTBaihmA06TEDxKo",
    );
  });
});
