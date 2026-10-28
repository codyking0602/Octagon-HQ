import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310134_restore_ufc_331_all_spotlights.sql",
  "utf8",
);

describe("UFC 331 live Spotlight repair", () => {
  it("restores every missing active fight without replacing the three already-live Spotlights", () => {
    for (const boutId of [
      "main-patricio-pitbull-dooho-choi",
      "main-alonzo-menifield-iwo-baraniewski",
      "prelim-marlon-vera-charles-jourdain",
      "prelim-tai-tuivasa-robelis-despaigne",
      "prelim-michael-aswell-jr-joosang-yoo",
    ]) {
      expect(migration).toContain(`"bout_id":"${boutId}"`);
    }

    expect(migration).toContain("not exists (");
    expect(migration).toContain("current->>'bout_id' = v_item->>'bout_id'");
    expect(migration).toContain("jsonb_array_length(v_spotlights) <> 8");
    expect(migration).toContain("private.pick_event_spotlight_is_valid(v_event_id, v_spotlights)");
  });
});
