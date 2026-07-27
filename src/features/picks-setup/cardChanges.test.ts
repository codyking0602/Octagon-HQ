import { describe, expect, it } from "vitest";
import { sourceChanges } from "../../../supabase/functions/sync-next-ufc-event/cardChanges";

const metadata = {
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  starts_at: "2026-08-01T19:00:00.000Z",
  locks_at: "2026-08-01T19:00:00.000Z",
  source_url: "https://www.mmamania.com/ufc-fight-cards/446488/latest-ufc-belgrade-fight-card",
};

function bout(
  bout_id: string,
  red_fighter_name: string,
  blue_fighter_name: string,
  weight_class = "Heavyweight",
) {
  return { bout_id, red_fighter_name, blue_fighter_name, weight_class };
}

describe("Event Setup card changes", () => {
  it("does not report accent or reversed-corner duplicates as added and removed", () => {
    const current = {
      ...metadata,
      bouts: [
        bout("main-event-uros-medic-daniel-rodriguez", "Uroš Medić", "Daniel Rodriguez", "Welterweight"),
        bout("main-mar-tybura-aleksandar-rakic", "Aleksandar Rakić", "Marcin Tybura"),
      ],
    };
    const source = {
      ...metadata,
      bouts: [
        bout("main-event-uros-medic-daniel-rodriguez", "Uros Medic", "Daniel Rodriguez", "Welterweight"),
        bout("main-marcin-tybura-aleksandar-rakic", "Marcin Tybura", "Aleksandar Rakic"),
      ],
    };

    const changes = sourceChanges(current, source, "main");

    expect(changes.join(" ")).not.toMatch(/Added|Removed/);
    expect(changes.join(" ")).not.toMatch(/Uro[sš] Medi[cć].*(?:Added|Removed)|(?:Added|Removed).*Uro[sš] Medi[cć]/i);
    expect(changes.join(" ")).not.toMatch(/Tybura.*Raki[cć].*(?:Added|Removed)|(?:Added|Removed).*Tybura.*Raki[cć]/i);
  });

  it("ignores a source-only rematch marker in the comparison identity", () => {
    const current = {
      ...metadata,
      bouts: [bout("main-jan-blachowicz-bogdan-guskov", "Jan Błachowicz", "Bogdan Guskov", "Light Heavyweight")],
    };
    const source = {
      ...metadata,
      bouts: [bout("main-jan-blachowicz-bogdan-guskov", "Jan Blachowicz", "Bogdan Guskov 2", "Light Heavyweight")],
    };

    expect(sourceChanges(current, source, "main")).toEqual([]);
  });

  it("keeps a real opponent replacement visible", () => {
    const current = {
      ...metadata,
      bouts: [bout("main-jan-blachowicz-navajo-stirling", "Jan Błachowicz", "Navajo Stirling", "Light Heavyweight")],
    };
    const source = {
      ...metadata,
      bouts: [bout("main-jan-blachowicz-bogdan-guskov", "Jan Błachowicz", "Bogdan Guskov", "Light Heavyweight")],
    };

    const changes = sourceChanges(current, source, "main");

    expect(changes).toEqual(expect.arrayContaining([
      expect.stringContaining("Added main card: Jan Błachowicz vs. Bogdan Guskov."),
      expect.stringContaining("Removed main card: Jan Błachowicz vs. Navajo Stirling."),
    ]));
  });
});
