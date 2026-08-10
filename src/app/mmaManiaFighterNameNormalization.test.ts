import { describe, expect, it } from "vitest";
import { sourceChangeDetails } from "../../supabase/functions/sync-next-ufc-event/cardChanges.ts";
import {
  canonicalFightPair,
  canonicalFighterDisplay,
} from "../../supabase/functions/sync-next-ufc-event/normalization.ts";

describe("MMA Mania fighter-name cleanup", () => {
  it("removes source-only championship, ranking, and correction annotations from display names", () => {
    expect(canonicalFighterDisplay("UFC Welterweight Champion Islam Makhachev"))
      .toBe("Islam Makhachev");
    expect(canonicalFighterDisplay("UFC Women’s Strawweight Champion Mackenzie Dern"))
      .toBe("Mackenzie Dern");
    expect(canonicalFighterDisplay("Joel Alvarez (not Geoff Neal)"))
      .toBe("Joel Alvarez");
    expect(canonicalFighterDisplay("No. 5 Sean Brady"))
      .toBe("Sean Brady");
  });

  it("keeps owner-cleaned fighter names equivalent to noisy source labels during monitoring", () => {
    const current = {
      name: "UFC 330",
      subtitle: "Islam Makhachev vs. Ian Machado Garry",
      venue: "Xfinity Mobile Arena",
      location: "Philadelphia, Pennsylvania",
      starts_at: "2026-08-15T22:00:00.000Z",
      prelims_starts_at: "2026-08-15T20:00:00.000Z",
      locks_at: "2026-08-15T22:00:00.000Z",
      source_url: "https://www.mmamania.com/ufc-fight-cards/451594/ufc-330-fight-card",
      bouts: [
        {
          bout_id: "main-event-islam-makhachev-ian-machado-garry",
          weight_class: "Welterweight",
          red_fighter_name: "Islam Makhachev",
          blue_fighter_name: "Ian Machado Garry",
        },
        {
          bout_id: "main-mackenzie-dern-gillian-robertson",
          weight_class: "Strawweight",
          red_fighter_name: "Mackenzie Dern",
          blue_fighter_name: "Gillian Robertson",
        },
        {
          bout_id: "main-chidi-njokuani-joel-alvarez",
          weight_class: "Lightweight",
          red_fighter_name: "Chidi Njokuani",
          blue_fighter_name: "Joel Alvarez",
        },
      ],
    };
    const source = {
      ...current,
      bouts: [
        {
          ...current.bouts[0],
          red_fighter_name: "UFC Welterweight Champion Islam Makhachev",
        },
        {
          ...current.bouts[1],
          red_fighter_name: "UFC Women’s Strawweight Champion Mackenzie Dern",
        },
        {
          ...current.bouts[2],
          blue_fighter_name: "Joel Alvarez (not Geoff Neal)",
        },
      ],
    };

    expect(canonicalFightPair(
      source.bouts[0].red_fighter_name,
      source.bouts[0].blue_fighter_name,
    )).toBe(canonicalFightPair(
      current.bouts[0].red_fighter_name,
      current.bouts[0].blue_fighter_name,
    ));
    expect(sourceChangeDetails(current, source, "main")).toEqual([]);
  });
});
