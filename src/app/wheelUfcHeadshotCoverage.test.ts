import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310262_wheel_ufc_headshot_full_pool.sql",
  "utf8",
);

const auditedSlugs = [
  "aaron-pico",
  "abus-magomedov",
  "aiemann-zahabi",
  "alessandro-costa",
  "alexander-volkov",
  "alonzo-menifield",
  "amir-albazi",
  "ante-delija",
  "arman-tsarukyan",
  "arnold-allen",
  "asu-almabayev",
  "azamat-murzakanov",
  "brando-pericic",
  "bryce-mitchell",
  "caio-borralho",
  "carlos-prates",
  "carlos-ulberg",
  "charles-jourdain",
  "david-martinez",
  "david-onama",
  "diego-lopes",
  "farid-basharat",
  "gabriel-bonfim",
  "grant-dawson",
  "ignacio-bahamondes",
  "ikram-aliskerov",
  "jack-della-maddalena",
  "jamahal-hill",
  "jamall-emmers",
  "jean-silva",
  "jiri-prochazka",
  "joanderson-brito",
  "joaquin-buckley",
  "joe-pyfer",
  "kevin-vallejos",
  "kyoji-horiguchi",
  "manel-kape",
  "mario-pinto",
  "mauricio-ruffy",
  "melquizael-costa",
  "mike-malott",
  "mitch-raposo",
  "montel-jackson",
  "movsar-evloev",
  "muhammad-saidov",
  "nassourdine-imavov",
  "pat-sabatini",
  "patricio-pitbull",
  "pavel-andrusca",
  "rei-tsuruya",
  "rinat-fakhretdinov",
  "salahdine-parnasse",
  "sean-brady",
  "sergei-pavlovich",
  "shara-magomedov",
  "steve-garcia",
  "tagir-ulanbekov",
  "tim-elliott",
  "tofiq-musayev",
  "tom-nolan",
  "valter-walker",
  "vinicius-oliveira",
  "waldo-cortes-acosta",
  "yaroslav-amosov",
  "youssef-zalal",
  "zhang-mingyang"
];

describe("Wheel of UFC full-pool headshot coverage", () => {
  it("backfills every fighter found missing in the 170-fighter production audit", () => {
    expect(auditedSlugs).toHaveLength(66);
    for (const slug of auditedSlugs) {
      expect(migration).toContain(`'${slug}'`);
    }
    expect(migration).toContain("v_active <> 170");
    expect(migration).toContain("v_missing <> 0");
  });

  it("uses only the existing approved ESPN and UFC media authorities", () => {
    const urls = migration.match(/https:\/\/[^'\s]+/g) ?? [];
    expect(urls.length).toBeGreaterThanOrEqual(66);
    for (const url of urls) {
      expect(
        url.startsWith("https://a.espncdn.com/")
        || url.startsWith("https://www.espn.com/")
        || url.startsWith("https://ufc.com/")
        || url.startsWith("https://www.ufc.com/"),
      ).toBe(true);
    }
    expect(migration).toContain("'espn'");
    expect(migration).toContain("'ufc'");
  });

  it("repairs both the live roster authority and existing pick snapshots", () => {
    expect(migration).toContain("update private.wheel_ufc_fighters");
    expect(migration).toContain("update private.wheel_ufc_picks");
    expect(migration).toContain("insert into public.ufc_fighter_media");
  });

  it("keeps future Wheel media gaps synced from the canonical registry", () => {
    expect(migration).toContain("private.sync_wheel_ufc_headshot_from_media");
    expect(migration).toContain("after insert or update of photo_url on public.ufc_fighter_media");
    expect(migration).toContain("fighter.headshot_url is null");
    expect(migration).toContain("pick.headshot_url is null");
  });
});
