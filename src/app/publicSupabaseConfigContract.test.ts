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
  "Your event recaps",
  "get_my_pick_history",
  "HOW SCORING WORKS",
  "Correct pick +4",
  "MAKE THIS MY UNDERDOG LOCK",
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
  "LOCK PICKS & BEGIN RESULTS",
  "COMPLETE EVENT",
  "get_pick_control_event",
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
    await writeFile(join(dist, "index.html"), '<script src="/assets/app.js"></script>');
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
