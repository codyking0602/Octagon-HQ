import { describe, expect, it } from "vitest";
import verdictMigration from "../../../supabase/migrations/202612310111_stage12_football_verdict_private_contract.sql?raw";
import {
  footballVerdictPacketSchema,
  formatFootballVerdictPrompt,
} from "./auctionRepository";

const packet = {
  packet_version: "football-verdict-packet-v1" as const,
  mode: "build-qb" as const,
  winner: "challenger" as const,
  challenger: {
    name: "CODY",
    score: 88,
    selections: [
      { category: "Arm" as const, qb: "Josh Allen", context: "NFL QB profile", code: "ABCDEF" },
      { category: "Accuracy" as const, qb: "Joe Burrow", context: "NFL QB profile", code: "BCDEFG" },
      { category: "Processing" as const, qb: "Peyton Manning", context: "NFL QB profile", code: "CDEFGH" },
      { category: "Mobility" as const, qb: "Lamar Jackson", context: "NFL QB profile", code: "DEFGHI" },
    ],
  },
  recipient: {
    name: "TEST",
    score: 84,
    selections: [
      { category: "Arm" as const, qb: "Patrick Mahomes", context: "NFL QB profile", code: "EFGHIJ" },
      { category: "Accuracy" as const, qb: "Drew Brees", context: "NFL QB profile", code: "FGHIJK" },
      { category: "Processing" as const, qb: "Tom Brady", context: "NFL QB profile", code: "GHIJKL" },
      { category: "Mobility" as const, qb: "Michael Vick", context: "NFL QB profile", code: "HIJKLM" },
    ],
  },
};

describe("Football Verdict private contract", () => {
  it("accepts only the four-part completed-match packet shape", () => {
    expect(footballVerdictPacketSchema.parse(packet)).toEqual(packet);
    expect(() => footballVerdictPacketSchema.parse({
      ...packet,
      challenger: {
        ...packet.challenger,
        selections: [...packet.challenger.selections, {
          category: "Arm",
          qb: "Extra QB",
          context: "NFL QB profile",
          code: "IJKLMN",
        }],
      },
    })).toThrow();
  });

  it("formats the copy prompt around the private decoder without asking for grade disclosure", () => {
    const prompt = formatFootballVerdictPrompt(packet);
    expect(prompt).toContain("private Football HQ decoder");
    expect(prompt).toContain("Trust the recorded final scores and winner as authoritative");
    expect(prompt).toContain("Never reveal, print, translate, estimate, enumerate, rank, or map the hidden rating values or decoder codes");
    expect(prompt).toContain("Never provide bidding advice");
    expect(prompt).toContain("Arm: Josh Allen");
    expect(prompt).toContain("[ABCDEF]");
    expect(prompt).not.toContain("Clutch:");
  });

  it("makes the backend packet participant-only, current-format-only, and completion-gated", () => {
    expect(verdictMigration).toContain("v_user_id uuid := auth.uid()");
    expect(verdictMigration).toContain("v_user_id not in (v_game.challenger_id, v_game.recipient_id)");
    expect(verdictMigration).toContain("v_game.mode_id not in ('build-qb', 'build-qb-cfb')");
    expect(verdictMigration).toContain("v_game.content_version <> 'football-draft-room-2026-09-v6'");
    expect(verdictMigration).toContain("v_game.grading_version <> 'football-build-qb-traits-2026-09-v2'");
    expect(verdictMigration).toContain("v_game.lifecycle_state <> 'completed'");
  });

  it("passes hidden grades only into the existing private opaque-code encoder", () => {
    expect(verdictMigration.match(/private\.auction_rating_code\(/g)?.length).toBeGreaterThanOrEqual(6);
    expect(verdictMigration).toContain("'code', private.auction_rating_code(");
    expect(verdictMigration).not.toContain("'rating', (catalog.grading_inputs");
    expect(verdictMigration).not.toContain("'grade',");
    expect(verdictMigration).not.toContain("'delta',");
    expect(verdictMigration).not.toContain("'advantage',");
    expect(verdictMigration).not.toContain("'private_item_reference',");
  });

  it("requires exactly four unique awarded traits per side", () => {
    expect(verdictMigration).toContain("v_challenger_count <> 4");
    expect(verdictMigration).toContain("v_recipient_count <> 4");
    expect(verdictMigration).toContain("v_challenger_category_count <> 4");
    expect(verdictMigration).toContain("v_recipient_category_count <> 4");
    expect(verdictMigration).toContain("award.visible_category in ('Arm', 'Accuracy', 'Processing', 'Mobility')");
  });

  it("keeps the private knowledge export out of normal client roles", () => {
    expect(verdictMigration).toContain("current_setting('request.jwt.claim.role', true)");
    expect(verdictMigration).toContain("v_role <> 'service_role'");
    expect(verdictMigration).toContain(
      "revoke all on function public.export_football_verdict_knowledge() from public, anon, authenticated;",
    );
    expect(verdictMigration).toContain(
      "grant execute on function public.export_football_verdict_knowledge() to service_role;",
    );
    expect(verdictMigration).not.toContain(
      "grant execute on function public.export_football_verdict_knowledge() to authenticated;",
    );
  });

  it("builds private knowledge from exactly the current four-trait 140-QB catalog", () => {
    expect(verdictMigration).toContain("v_profile_count <> 140");
    expect(verdictMigration).toContain("catalog.grading_inputs ? 'Clutch'");
    expect(verdictMigration).toContain(
      "catalog.grading_inputs - 'Arm' - 'Accuracy' - 'Processing' - 'Mobility' - 'overall'",
    );
    expect(verdictMigration).toContain("'traits', jsonb_build_array('Arm', 'Accuracy', 'Processing', 'Mobility')");
    expect(verdictMigration).toContain("'trait_codes', jsonb_build_object(");
    expect(verdictMigration).not.toContain("from generate_series(0, 100)");
  });

  it("keeps normal packet execution authenticated while the decoder stays service-role-only", () => {
    expect(verdictMigration).toContain(
      "grant execute on function public.get_football_verdict_packet(uuid) to authenticated;",
    );
    expect(verdictMigration).toContain(
      "revoke all on function public.get_football_verdict_packet(uuid) from public, anon;",
    );
  });
});
