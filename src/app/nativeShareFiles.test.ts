import { describe, expect, it, vi } from "vitest";
import { shareCanonicalDestination } from "./nativeShare";

const destination = { kind: "picks-recap", eventId: "ufc-fight-night-belgrade" } as const;

describe("rich canonical recap sharing", () => {
  it("attaches the universal recap image when the device accepts files", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const file = new File(["poster"], "ufc-fight-night-recap.png", { type: "image/png" });

    await expect(shareCanonicalDestination({
      destination,
      title: "UFC Fight Night recap · Octagon HQ",
      text: "Must-watch moment: https://youtu.be/example",
      files: [file],
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      shareToken: "poster1",
      navigator: { share, canShare: () => true },
    })).resolves.toBe("shared");

    expect(share).toHaveBeenCalledWith({
      title: "UFC Fight Night recap · Octagon HQ",
      text: "Must-watch moment: https://youtu.be/example",
      url: "https://octagon.hq-app.workers.dev/picks?event=ufc-fight-night-belgrade&view=recap&share=poster1",
      files: [file],
    });
  });

  it("copies the watch link and permanent personalized recap destination together", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareCanonicalDestination({
      destination,
      title: "UFC Fight Night recap · Octagon HQ",
      text: "Must-watch moment: https://youtu.be/example",
      fallbackText: "Must-watch moment: https://youtu.be/example\nView your event recap:",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      shareToken: "poster2",
      navigator: { clipboard: { writeText } },
    })).resolves.toBe("copied");

    expect(writeText).toHaveBeenCalledWith(
      "Must-watch moment: https://youtu.be/example\nView your event recap:\nhttps://octagon.hq-app.workers.dev/picks?event=ufc-fight-night-belgrade&view=recap&share=poster2",
    );
  });
});
