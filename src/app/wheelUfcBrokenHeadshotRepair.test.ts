import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310263_wheel_ufc_broken_headshot_repair.sql",
  "utf8",
);

const repairs = [
  ["beneil-dariush", "3085551", "/assets/fighters/beneil-dariush-thumb.webp"],
  ["francisco-prado", "5123216", "/assets/fighters/francisco-prado-thumb.webp"],
  ["mick-parkin", "5060505", "/assets/fighters/mick-parkin-thumb.webp"],
  ["roberto-soldic", "4274796", "/assets/fighters/roberto-soldic-thumb.webp"],
  ["santiago-luna", "5307799", "/assets/fighters/santiago-luna-thumb.webp"],
  ["shavkat-rakhmonov", "4020699", "/assets/fighters/shavkat-rakhmonov-thumb.webp"],
] as const;

describe("Wheel of UFC broken headshot repair", () => {
  it("replaces all six missing local asset references with verified ESPN MMA media", () => {
    for (const [slug, espnId, brokenUrl] of repairs) {
      expect(migration).toContain(`'${slug}'`);
      expect(migration).toContain(`'${brokenUrl}'`);
      expect(migration).toContain(
        `https://a.espncdn.com/i/headshots/mma/players/full/${espnId}.png`,
      );
    }
  });

  it("repairs roster authority, existing pick snapshots, and the media registry", () => {
    expect(migration).toContain("insert into public.ufc_fighter_media");
    expect(migration).toContain("update private.wheel_ufc_fighters");
    expect(migration).toContain("update private.wheel_ufc_picks");
  });

  it("fails deployment if any of the six active fighters still uses the broken path", () => {
    expect(migration).toContain("fighter.headshot_url = repair.broken_url");
    expect(migration).toContain("fighter.headshot_url <> repair.photo_url");
    expect(migration).toContain("raise exception 'Wheel of UFC broken-headshot repair left % bad active rows'");
  });
});
