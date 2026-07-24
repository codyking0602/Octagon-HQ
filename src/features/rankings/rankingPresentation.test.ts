import { describe, expect, it } from "vitest";
import { allTime } from "./rankingModel";
import { profileSignatureFightUrls } from "./profileSignatureFightUrls";
import { resolveProfileWatchAction } from "./rankingPresentation";

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

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

  it("audits live YouTube titles against the assigned fighter", async () => {
    const entries = Object.entries(profileSignatureFightUrls);
    const failures: Array<{ slug: string; url: string; title?: string; status?: number; error?: string }> = [];

    for (let start = 0; start < entries.length; start += 10) {
      const batch = entries.slice(start, start + 10);
      await Promise.all(
        batch.map(async ([slug, url]) => {
          try {
            const endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
            const response = await fetch(endpoint);
            if (!response.ok) {
              failures.push({ slug, url, status: response.status });
              return;
            }
            const metadata = (await response.json()) as { title?: string };
            const title = metadata.title ?? "";
            const surname = slug.split("-").at(-1) ?? slug;
            if (!normalized(title).includes(normalized(surname))) {
              failures.push({ slug, url, title });
            }
          } catch (error) {
            failures.push({ slug, url, error: error instanceof Error ? error.message : String(error) });
          }
        }),
      );
    }

    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  }, 60_000);

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
