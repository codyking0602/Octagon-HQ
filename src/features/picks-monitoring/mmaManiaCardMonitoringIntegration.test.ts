import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMmaManiaCard } from "../../../supabase/functions/sync-next-ufc-event/mmaManiaCardParser";
import { selectAndSequenceImportedBouts } from "../../../supabase/functions/sync-next-ufc-event/importPolicy";
import { buildCardChangeFindings } from "./cardChangeApproval";

const fixture = readFileSync(
  "supabase/functions/sync-next-ufc-event/fixtures/ufc-330-replacement-card.html",
  "utf8",
);

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

describe("MMA Mania card parser to monitoring integration", () => {
  it("turns the current nine-fight UFC 330 source into one real missing-fight owner decision", () => {
    const parsed = parseMmaManiaCard(
      fixture,
      "https://www.mmamania.com/ufc-fight-cards/451594/ufc-330-fight-card-start-time-date-location-islam-makhachev-ian-machado-garry",
    );
    const sourceBouts = selectAndSequenceImportedBouts(parsed.bouts, "full").map((bout) => ({
      ...bout,
      bout_id: `${bout.card_segment}-${slug(bout.red_fighter_name)}-${slug(bout.blue_fighter_name)}`,
      red_fighter_slug: slug(bout.red_fighter_name),
      blue_fighter_slug: slug(bout.blue_fighter_name),
    }));
    const missing = sourceBouts.find((bout) => (
      bout.red_fighter_name === "Chidi Njokuani" && bout.blue_fighter_name === "Joel Alvarez"
    ));
    expect(missing).toBeDefined();
    expect(sourceBouts).toHaveLength(9);

    const canonicalBouts = sourceBouts.filter((bout) => bout.bout_id !== missing!.bout_id);
    const canonical = {
      event_id: "ufc-330",
      name: "UFC 330: Makhachev vs. Machado Garry",
      subtitle: "Makhachev vs. Machado Garry",
      venue: "Xfinity Mobile Arena",
      location: "Philadelphia, Pennsylvania",
      source_url: parsed.sourceUrl,
      starts_at: "2026-08-16T01:00:00.000Z",
      locks_at: "2026-08-15T23:00:00.000Z",
      bouts: canonicalBouts,
    };
    const source = {
      ...canonical,
      source_event_key: "ufc-330",
      source: "MMA Mania event + card",
      bouts: sourceBouts,
    };

    const findings = buildCardChangeFindings({
      identity: "ufc:ufc-330",
      kind: "current",
      eventId: canonical.event_id,
      canonical,
      source,
      scope: "full",
      detectedAt: "2026-08-14T01:00:00.000Z",
    });

    expect(canonicalBouts).toHaveLength(8);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      finding_type: "card_change",
      bout_id: missing!.bout_id,
      summary: "Add Chidi Njokuani vs. Joel Alvarez to Picks.",
      source_details: {
        change_field: "included_in_picks",
        approval_proposal: {
          action: "add_bout",
          red_fighter_name: "Chidi Njokuani",
          blue_fighter_name: "Joel Alvarez",
          card_segment: "prelim",
          segment_sequence: 4,
          expected_bout_ids: canonicalBouts.map((bout) => bout.bout_id),
        },
      },
    });
    expect(JSON.stringify(findings)).not.toMatch(/Mackahev.*over or under|Geoff Neal|Jose Ochoa/i);
  });
});
