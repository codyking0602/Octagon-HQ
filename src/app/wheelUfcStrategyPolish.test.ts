import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310261_wheel_ufc_strategy_polish.sql",
  "utf8",
);
const page = readFileSync("src/features/back-room/UfcWheelPage.tsx", "utf8");
const styles = readFileSync("src/styles/ufc-wheel.css", "utf8");
const repository = readFileSync("src/features/play/wheelUfcRepository.ts", "utf8");

describe("Wheel of UFC strategy + UI polish", () => {
  it("removes the hidden six-candidate cap while keeping grades private", () => {
    expect(migration).toContain("create or replace function private.get_wheel_ufc_candidates");
    expect(migration).not.toContain("limit 6");
    expect(migration).not.toContain("'hidden_grade'");
  });

  it("persists the category that produced each new pick for later matchup analysis", () => {
    expect(migration).toContain("add column if not exists spin_category text");
    expect(migration).toContain("wheel_ufc_capture_spin_source");
    expect(migration).toContain("'spin_category', pick.spin_category");
    expect(repository).toContain("spin_category: categorySchema.nullable()");
  });

  it("exposes only safe eligible counts for strategic division choice", () => {
    expect(migration).toContain("wheel_ufc_eligible_slot_counts");
    expect(migration).toContain("'eligible_counts'");
    expect(repository).toContain("eligible_counts:");
    expect(page).toContain("eligible");
  });

  it("uses one visible label per weighted category and collapses the full roster during play", () => {
    expect(page).toContain('categoryId === "UNRANKED"');
    expect(page).toContain('"COUNTRY"');
    expect(page).toContain('"VETERAN"');
    expect(page).toContain("39 * Math.sin(radians)");
    expect(styles).toContain("z-index: 3");
    expect(page).toContain("VIEW FULL ROSTERS");
    expect(page).toContain("CompactRosterSnapshot");
    expect(page).toContain('state.phase === "spin" ? (');
  });

  it("keeps the post-spin decision compact and only shows eligibility counts when they differ", () => {
    expect(page).toContain("ufc-wheel-spin-pill");
    expect(page).not.toContain("ufc-wheel-category-badge");
    expect(page).toContain("new Set(eligibleCounts).size > 1");
    expect(page).toContain("showEligibleCounts ? (");
    expect(styles).toContain(".ufc-wheel-picker__spin-header");
  });

  it("keeps individual grades in the UFC final and adds division-by-division context without red-heavy grade rows", () => {
    expect(page).toContain("HQ ${Number(pick.revealed_grade).toFixed(1)}");
    expect(page).toContain("showDelta={revealDone}");
    expect(page).toContain("Biggest edge");
    expect(page).toContain("won ${Math.max(creatorDivisionWins, recipientDivisionWins)} of 8 divisions");
    expect(styles).toContain("color: #9fb0ba");
    expect(styles).toContain("color: #b8c5cd");
  });

  it("repairs the four missing headshots seen in the launch matchup", () => {
    for (const fighter of ["michael-morales", "josh-hokit", "tatsuro-taira", "lerone-murphy"]) {
      expect(migration).toContain(fighter);
    }
    expect(migration).toContain("a.espncdn.com/i/headshots/mma/players/full/4869426.png");
    expect(migration).toContain("a.espncdn.com/i/headshots/mma/players/full/4049391.png");
    expect(migration).toContain("a.espncdn.com/i/headshots/mma/players/full/4917772.png");
    expect(migration).toContain("a.espncdn.com/i/headshots/mma/players/full/4576101.png");
  });
});
