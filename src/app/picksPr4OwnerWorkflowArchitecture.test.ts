import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const openDashboard = readFileSync("src/features/picks-control/OpenPicksDashboard.tsx", "utf8");
const resultsControl = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const repository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");
const playerPicks = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const monitoringPage = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const proposalBuilder = readFileSync("src/features/picks-monitoring/cardChangeApproval.ts", "utf8");
const canonicalMigration = readFileSync(
  "supabase/migrations/202609140001_canonical_pick_fight_change_semantics.sql",
  "utf8",
);

describe("Picks PR 4 finished owner workflow", () => {
  it("keeps one compact owner surface and confirmation-only audit descriptions", () => {
    expect(center).not.toContain("MANAGE OPEN PICKS");
    expect(center).toContain("OPEN PLAYER PICKS");
    for (const ownerSurface of [openDashboard, resultsControl]) {
      expect(ownerSurface).not.toMatch(/Why is |requires a reason|reason of at least/i);
    }
    expect(openDashboard).toContain("Owner confirmed fight removal from Picks");
    expect(openDashboard).toContain("Owner confirmed live fight order change");
    expect(resultsControl).toContain("Owner confirmed official result correction");
  });

  it("hides removed fights from ordinary owner and player cards", () => {
    expect(openDashboard).toContain("Boolean(bout?.includedInPicks)");
    expect(playerPicks).toContain(".filter((bout) => bout.includedInPicks !== false)");
  });

  it("exposes exactly one manual fight addition through the established repository", () => {
    expect(openDashboard).toContain("ADD FIGHT");
    expect(repository).toContain("approve_pick_bout_addition");
    expect(repository.match(/approve_pick_bout_addition/g)).toHaveLength(1);
    expect(repository).not.toContain("private.apply_pick_fight_change");
  });

  it("keeps detected additions inside the existing monitoring approval owner", () => {
    expect(proposalBuilder).toContain('action: "add_bout"');
    expect(monitoringPage).toContain("repository.approveFinding");
    expect(canonicalMigration).toContain("private.apply_pick_fight_change");
    expect(canonicalMigration).toContain("public.approve_pick_bout_addition");
  });

  it("preserves stable fight deadlines when card order changes", () => {
    expect(openDashboard).toContain("fight deadlines stay with their bouts");
    expect(openDashboard).not.toMatch(/position owns its deadline|APPLY ORDER \+ LOCKS/i);
    expect(canonicalMigration).toContain("locked or resulted fights must remain in their exact card slots");
    expect(canonicalMigration).toContain("v_card_order_changed := true");
  });
});
