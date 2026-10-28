import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608270001_picks_stale_draft_rollover.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/picks_stale_draft_rollover.sql",
  "utf8",
);
const ownerSuite = readFileSync(
  "supabase/tests/picks_owner_identity_projection.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/picks-setup/pickSetupRepository.ts",
  "utf8",
);

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("Picks stale draft rollover", () => {
  it("repairs only the existing setup projection and publish mutation", () => {
    expect(occurrences(migration, /create or replace function public\./g)).toBe(2);
    expect(migration).toContain("create or replace function public.get_pick_event_setup()");
    expect(migration).toContain("create or replace function public.publish_pick_event_draft");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("discard_stale_pick_event");
    expect(occurrences(repository, /\.rpc\("get_pick_event_setup"\)/g)).toBe(1);
    expect(occurrences(repository, /\.rpc\("publish_pick_event_draft"/g)).toBe(1);
  });

  it("hides completed and elapsed drafts while keeping future setup publishable", () => {
    expect(migration).toContain("draft.starts_at is null or draft.starts_at > now()");
    expect(migration).toContain("completed.event_id = draft.event_id");
    expect(migration).toContain("completed.status = 'complete'");
    expect(migration).toContain("and draft.starts_at > now()");
    expect(migration).toContain("and draft.locks_at > now()");
    expect(migration).toContain("PICKS LOCK TIME HAS PASSED");
  });

  it("fails closed when a stale draft id is submitted directly", () => {
    expect(migration).toContain("completed event drafts cannot be republished");
    expect(migration).toContain("event draft start time has passed");
    expect(migration).toContain("Picks lock time has passed");
    expect(integrationSql).toContain("completed event draft was republished");
    expect(integrationSql).toContain("elapsed event draft was published");
    expect(integrationSql).toContain("completed event history was removed");
  });

  it("runs the fresh-database proof through the existing Picks suite", () => {
    expect(integrationSql).toContain("future draft did not become the canonical Event Setup card");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(ownerSuite.trimEnd()).toMatch(/\\ir picks_stale_draft_rollover\.sql$/);
  });
});
