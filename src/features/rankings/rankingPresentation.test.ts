import { describe, expect, it } from "vitest";
import { allTime } from "./rankingModel";
import { resolveProfileWatchAction } from "./rankingPresentation";

describe("ranking profile watch actions", () => {
  const actions = allTime.map((fighter) => ({ fighter, action: resolveProfileWatchAction(fighter.slug) }));

  it("resolves every ranked fighter to a signature fight", () => {
    expect(actions.filter(({ action }) => action?.source === "signature")).toHaveLength(allTime.length);
    expect(actions.filter(({ action }) => action?.source === "watchMoment")).toHaveLength(0);
    expect(actions.filter(({ action }) => action === null)).toHaveLength(0);
  });

  it("uses locked signature fight URLs for representative fighters", () => {
    expect(resolveProfileWatchAction("jon-jones")).toMatchObject({
      label: "Watch Signature Fight",
      source: "signature",
      url: "https://ufcfightpass.com/search?query=Jon%20Jones%20vs%20Ciryl%20Gane%20UFC",
    });
    expect(resolveProfileWatchAction("georges-st-pierre")?.url).toBe(
      "https://ufcfightpass.com/search?query=Georges%20St-Pierre%20vs%20Matt%20Hughes%20UFC",
    );
    expect(resolveProfileWatchAction("kamaru-usman")?.url).toBe(
      "https://ufcfightpass.com/search?query=Kamaru%20Usman%20vs%20Tyron%20Woodley%20UFC",
    );
    expect(resolveProfileWatchAction("israel-adesanya")?.url).toBe(
      "https://ufcfightpass.com/search?query=Israel%20Adesanya%20vs%20Robert%20Whittaker%20UFC",
    );
    expect(resolveProfileWatchAction("amanda-nunes")?.url).toBe(
      "https://ufcfightpass.com/search?query=Amanda%20Nunes%20vs%20Miesha%20Tate%20UFC",
    );
    expect(resolveProfileWatchAction("charles-oliveira")?.url).toBe(
      "https://ufcfightpass.com/search?query=Charles%20Oliveira%20vs%20Dustin%20Poirier%20UFC",
    );
    expect(resolveProfileWatchAction("carla-esparza")?.url).toBe(
      "https://ufcfightpass.com/search?query=Carla%20Esparza%20vs%20Rose%20Namajunas%20UFC",
    );
  });
});
