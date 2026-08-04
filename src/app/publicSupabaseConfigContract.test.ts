import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validatePublicSupabaseConfig } from "../../scripts/public-supabase-config.mjs";
import {
  requiredApplicationMarkers,
  requiredShareArtwork,
  verifyProductionArtifact,
} from "../../scripts/verify-production-artifact.mjs";

const hostname = "example-project.supabase.co";
const publishableKey = `sb_publishable_${"a".repeat(24)}`;
const valid = { url: `https://${hostname}`, publishableKey, expectedHostname: hostname };
const requiredMarkers = requiredApplicationMarkers.join(" ");
const workerMarkers = [
  "X-Octagon-Preview", "X-Octagon-Preview-Image", "og:title", "og:image:width",
  "twitter:card", "share-preview", "image/png", "get_rich_preview_data", "picks-recap",
  "major-ranking-update", "auction-result", "jon-jones",
].join(" ");

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
    await mkdir(join(dist, "assets"));
    await mkdir(join(dist, "assets/share"), { recursive: true });
    await mkdir(join(dist, "preview-data"), { recursive: true });
    await writeFile(join(dist, "index.html"), '<script src="/assets/app.js"></script>');
    await writeFile(
      join(dist, "assets/app.js"),
      `const url="https://${hostname}";const key="${publishableKey}";const markers="${requiredMarkers}";`,
    );
    await writeFile(join(dist, "_worker.js"), workerMarkers);
    await writeFile(join(dist, ".assetsignore"), "_worker.js\n");
    await writeFile(join(dist, "preview-data/rankings.json"), JSON.stringify({
      version: 2,
      fighters: [{ slug: "jon-jones", displayName: "Jon Jones", imagePath: "/jon.webp", rank: 1, ovr: 99 }],
      games: Array.from({ length: 7 }, (_, index) => ({ id: `game-${index}`, title: "Game", description: "Play", imagePath: "/game.svg" })),
      fighterAssets: { "jon-jones": "/jon.webp" },
    }));
    await Promise.all(requiredShareArtwork.map((name) => writeFile(join(dist, "assets/share", name), "<svg/>")));

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
