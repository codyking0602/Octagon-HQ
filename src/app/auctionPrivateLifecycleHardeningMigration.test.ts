import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hardeningMigration = readFileSync(
  "supabase/migrations/202608210003_auction_private_lifecycle_hardening.sql",
  "utf8",
);
const hardeningSql = readFileSync(
  "supabase/tests/auction_private_lifecycle_hardening.sql",
  "utf8",
);
const auctionContract = readFileSync("docs/auction-game.md", "utf8");

describe("Auction private lifecycle hardening", () => {
  it("keeps prepared Auctions challenger-only and removes abandoned drafts from client reads", () => {
    expect(hardeningMigration).toContain(
      "auction.lifecycle_state = 'prepared' and auth.uid() = auction.challenger_id",
    );
    expect(hardeningMigration).toContain(
      "auction.lifecycle_state in ('sent', 'active', 'completed', 'cancelled', 'declined')",
    );
    expect(hardeningMigration).not.toContain(
      "auction.lifecycle_state in ('sent', 'active', 'completed', 'cancelled', 'declined', 'abandoned')",
    );
    expect(hardeningSql).toContain("recipient read an unsent prepared Auction");
    expect(hardeningSql).toContain("abandoned prepared Auction remained client-readable");
  });

  it("rejects NULL cancellation audits and unequal completed results without a winner", () => {
    expect(hardeningMigration).toContain("cancelled_by is not null");
    expect(hardeningMigration).toContain("winner_profile_id is not null");
    expect(hardeningSql).toContain(
      "cancelled Auction without cancellation audit was accepted",
    );
    expect(hardeningSql).toContain(
      "unequal completed scores without a winner were accepted",
    );
  });

  it("uses one explicit lifecycle graph and freezes every terminal row", () => {
    expect(hardeningMigration).toContain(
      "old.lifecycle_state = 'prepared' and new.lifecycle_state in ('sent', 'abandoned')",
    );
    expect(hardeningMigration).toContain(
      "old.lifecycle_state = 'sent' and new.lifecycle_state in ('active', 'declined')",
    );
    expect(hardeningMigration).toContain(
      "old.lifecycle_state = 'active' and new.lifecycle_state in ('completed', 'cancelled')",
    );
    expect(hardeningMigration).toContain("if new is distinct from old then");
    expect(hardeningMigration).toContain("Linked Auction challenge cannot change");
    expect(hardeningMigration).toContain("Auction version snapshot cannot change");
    expect(hardeningSql).toContain("active Auction regressed to sent");
    expect(hardeningSql).toContain("terminal Auction bankroll remained mutable");
    expect(hardeningSql).toContain("declined Auction was not terminal");
  });

  it("does not expose pending bid presence after a terminal state", () => {
    expect(hardeningMigration).toContain(
      "when auction.lifecycle_state in ('prepared', 'sent', 'active') then exists",
    );
    expect(hardeningMigration).toContain("else false");
    expect(hardeningSql).toContain("cancelled Auction leaked pending bid presence");
  });

  it("replaces the ten remaining micro-PRs with five coherent delivery PRs", () => {
    expect(auctionContract).toContain(
      "six feature PRs total: the completed public-contract PR plus five remaining delivery PRs",
    );
    for (const heading of [
      "### PR 2 — Backend foundation",
      "### PR 3 — Playable server engine",
      "### PR 4 — Complete gameplay UI",
      "### PR 5 — Real content and grading",
      "### PR 6 — Notifications and release proof",
    ]) {
      expect(auctionContract).toContain(heading);
    }
    expect(auctionContract).not.toMatch(/### PR (?:7|8|9|10|11|12) —/);
  });
});
