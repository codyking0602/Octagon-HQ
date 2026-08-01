import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validatePublicSupabaseConfig } from "../../scripts/public-supabase-config.mjs";
import { verifyProductionArtifact } from "../../scripts/verify-production-artifact.mjs";

const hostname = "example-project.supabase.co";
const publishableKey = `sb_publishable_${"a".repeat(24)}`;
const valid = { url: `https://${hostname}`, publishableKey, expectedHostname: hostname };
const requiredMarkers = [
  "STANDINGS & EVENTS",
  "GROUP STANDINGS",
  "EVENT ARCHIVE",
  "OPEN FULL RECAP",
  "Event Standings",
  "get_my_pick_history",
  "SCORING & UNDERDOG LOCK RULES",
  "Correct pick +4",
  "LOCK FOR ",
  "MAIN EVENT SPOTLIGHT",
  "WATCH SPOTLIGHT",
  "pick-fighter-thumbnail",
  "get_my_event_underdog_lock",
  "set_my_event_underdog_lock",
  "PICKS LOCKED",
  "AWAITING RESULTS",
  "NOT PICKED",
  "VIEW FIGHT-BY-FIGHT RESULTS",
  "+400+",
  "HOW EVERYONE PICKED",
  "group_picks",
  "Fight Night Control",
  "ALL FIGHTS LOCK TOGETHER",
  "CHANGE LOCK TIME",
  "LOCK PICKS & BEGIN RESULTS",
  "COMPLETE EVENT",
  "get_pick_control_event",
  "adjust_pick_event_lock_time",
  "Event Setup",
  "SYNC NEXT UFC EVENT",
  "PUBLISH CARD",
  "get_pick_event_setup",
].join(" ");

const workerMarkers = [
  "X-Octagon-Preview",
  "X-Octagon-Preview-Image",
  "og:title",
  "og:image:width",
  "twitter:card",
  "share-preview",
  "image/png",
  "get_rich_preview_data",
  "picks-recap",
  "major-ranking-update",
  "jon-jones",
].join(" ");

const shareArtwork = [
  "find-leader.svg",
  "wavelength.svg",
  "blind-resume.svg",
  "blind-rank.svg",
  "keep-cut.svg",
  "better-than.svg",
  "picks-recap.svg",
  "ranking-update.svg",
];

describe("production Supabase browser configuration", () => {
  it.each([
    [{ ...valid, url: "" }, "required"],
    [{ ...valid, url: "https://your-project-id.supabase.co" }, "placeholder"],
    [{ ...valid, url: "not-a-url" }, "valid URL"],
    [{ ...valid, url: "https://other.supabase.co" }, "expected Supabase hostname"],
    [{ ...valid, publishableKey: "" }, "required"],
    [{ ...valid, publishableKey: "your-publishable-key" }, "placeholder"],
  ])("rejects invalid production input", (config, message) => {
    expect(() => validatePublicSupabaseConfig(config)).toThrow(message);
  });

  it("inspects the generated JavaScript, not only source configuration", async () => {
    const dist = await mkdtemp(join(tmpdir(), "octagon-artifact-"));
    await mkdir(join(dist, "assets", "share"), { recursive: true });
    await mkdir(join(dist, "preview-data"), { recursive: true });
    await writeFile(join(dist, "index.html"), '<script src="/assets/app.js"></script>');
    await writeFile(join(dist, "_worker.js"), workerMarkers);
    await writeFile(join(dist, ".assetsignore"), "_worker.js\n");
    await writeFile(
      join(dist, "preview-data", "rankings.json"),
      JSON.stringify({
        version: 2,
        fighters: [{ slug: "jon-jones", displayName: "Jon Jones", imagePath: "/jon.webp", rank: 1, ovr: 99 }],
        games: Array.from({ length: 6 }, (_, index) => ({
          id: `game-${index}`,
          title: `Game ${index}`,
          description: `Description ${index}`,
          imagePath: `/assets/share/game-${index}.svg`,
        })),
        fighterAssets: { "jon-jones": "/jon.webp" },
      }),
    );
    await Promise.all(shareArtwork.map((file) => writeFile(join(dist, "assets", "share", file), "<svg />")));
    await writeFile(
      join(dist, "assets/app.js"),
      `const url="https://${hostname}";const key="${publishableKey}";const markers="${requiredMarkers}";`,
    );

    await expect(verifyProductionArtifact({ dist, env: {
      VITE_SUPABASE_URL: valid.url,
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      VITE_EXPECTED_SUPABASE_HOSTNAME: hostname,
    } })).resolves.toMatchObject({ hostname });

    await writeFile(join(dist, "assets/app.js"), `const url="https://your-project-id.supabase.co";const key="${publishableKey}";`);
    await expect(verifyProductionArtifact({ dist, env: {
      VITE_SUPABASE_URL: valid.url,
      VITE_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      VITE_EXPECTED_SUPABASE_HOSTNAME: hostname,
    } })).rejects.toThrow("your-project-id");
  });
});
