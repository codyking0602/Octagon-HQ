import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("scripts/verify-picks-scoring-live.mjs", "utf8");

describe("production Picks scoring lifecycle proof", () => {
  it("treats the canonical no-active-card response as a real lifecycle state", () => {
    expect(verifier).toContain("const hasCurrentEvent = event !== null;");
    expect(verifier).toContain("if (hasCurrentEvent) {");
    expect(verifier).toContain("else if (authenticatedEvent !== null)");
    expect(verifier).toContain('"the canonical no-active-card state"');
  });

  it("still verifies scoring and owner boundaries when no event is active", () => {
    expect(verifier).toContain('"Fight Night control owner boundary"');
    expect(verifier).toContain('"Event Setup owner boundary"');
    expect(verifier).toContain("const scoringSeason = hasCurrentEvent ? event.season : new Date().getUTCFullYear();");
    expect(verifier).toContain('"Picks scoring summary RPC"');
    expect(verifier).toContain('"correct", "incorrect", "pending", "events_entered", "base_points", "lock_bonus", "total_points"');
  });

  it("keeps event-specific group reveal and Underdog Lock checks when a card exists", () => {
    expect(verifier).toContain("event.bouts.some((bout) => bout.group_picks.length > 0)");
    expect(verifier).toContain('"Underdog Lock RPC"');
    expect(verifier).toContain("authenticatedEvent.event_id !== event.event_id");
  });
});
