import { describe, expect, it, vi } from "vitest";
import { shareAppLink, shareCanonicalDestination } from "./nativeShare";

const fighterDestination = { kind: "fighter", fighterSlug: "jon-jones" } as const;

describe("shareCanonicalDestination", () => {
  it("opens the platform share sheet with the exact canonical URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(shareCanonicalDestination({
      destination: fighterDestination,
      title: "Jon Jones · Octagon HQ",
      text: "View Jon Jones in Octagon HQ.",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev/other/path",
      navigator: { share },
    })).resolves.toBe("shared");

    expect(share).toHaveBeenCalledWith({
      title: "Jon Jones · Octagon HQ",
      text: "View Jon Jones in Octagon HQ.",
      url: "https://octagon.hq-app.workers.dev/fighters/jon-jones",
    });
  });

  it("copies only the exact destination URL when native sharing is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareCanonicalDestination({
      destination: { kind: "picks-recap", eventId: "ufc-325" },
      title: "UFC 325 recap",
      text: "Recap copy that should not replace the link.",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      navigator: { clipboard: { writeText } },
    })).resolves.toBe("copied");

    expect(writeText).toHaveBeenCalledWith(
      "https://octagon.hq-app.workers.dev/picks?event=ufc-325&view=recap",
    );
  });

  it("does not copy after the member cancels the native share sheet", async () => {
    const cancelled = new Error("Share cancelled");
    cancelled.name = "AbortError";
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareCanonicalDestination({
      destination: fighterDestination,
      title: "Jon Jones · Octagon HQ",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      navigator: {
        share: vi.fn().mockRejectedValue(cancelled),
        clipboard: { writeText },
      },
    })).resolves.toBe("cancelled");

    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to Copy Link when the native share sheet fails", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareCanonicalDestination({
      destination: {
        kind: "comparison",
        leftFighterSlug: "georges-st-pierre",
        rightFighterSlug: "anderson-silva",
      },
      title: "GSP vs. Anderson Silva",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      navigator: {
        share: vi.fn().mockRejectedValue(new Error("Share failed")),
        clipboard: { writeText },
      },
    })).resolves.toBe("copied");

    expect(writeText).toHaveBeenCalledWith(
      "https://octagon.hq-app.workers.dev/rankings?compareLeft=georges-st-pierre&compareRight=anderson-silva",
    );
  });

  it("reports unavailable when neither sharing nor clipboard is available", async () => {
    await expect(shareCanonicalDestination({
      destination: fighterDestination,
      title: "Jon Jones · Octagon HQ",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      navigator: {},
    })).resolves.toBe("unavailable");
  });
});

describe("shareAppLink", () => {
  it("shares an existing same-origin reproducible challenge URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(shareAppLink({
      url: "/play/wavelength?challenge=target-72",
      title: "Wavelength Challenge",
      text: "Can you beat my score?",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev/play",
      navigator: { share },
    })).resolves.toBe("shared");

    expect(share).toHaveBeenCalledWith({
      title: "Wavelength Challenge",
      text: "Can you beat my score?",
      url: "https://octagon.hq-app.workers.dev/play/wavelength?challenge=target-72",
    });
  });

  it("rejects cross-origin links", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareAppLink({
      url: "https://example.com/not-octagon-hq",
      title: "Wrong app",
    }, {
      appOrigin: "https://octagon.hq-app.workers.dev",
      navigator: { share, clipboard: { writeText } },
    })).resolves.toBe("unavailable");

    expect(share).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
