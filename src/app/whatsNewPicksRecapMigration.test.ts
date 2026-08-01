import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200010_whats_new_picks_recap.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_picks_recap.sql",
  "utf8",
);
const contract = readFileSync("docs/whats-new-foundation.md", "utf8");

describe("What's New Picks recap producer", () => {
  it("keeps one guarded external publisher and one private storage owner", () => {
    expect(migration).toContain("create or replace function private.upsert_whats_new_item");
    expect(migration).toContain("create or replace function public.publish_whats_new_item");
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("return private.upsert_whats_new_item(");
    expect(migration).toContain(") from public, anon, authenticated;");
    expect(migration).toContain(") to service_role;");
    expect(contract).toContain("only general-purpose externally callable publishing boundary");
    expect(contract).toContain("creates a second feed owner");
  });

  it("publishes from the canonical successful completion transition only", () => {
    expect(migration).toContain("create or replace function public.transition_pick_event");
    expect(migration).toContain("if v_target_status = 'locked' then");
    expect(migration).toContain("and bout.included_in_picks");
    expect(migration).toContain("and bout.result_status = 'pending'");
    expect(migration).toContain("set status = 'complete'");
    expect(migration.indexOf("set status = 'complete'")).toBeLessThan(
      migration.indexOf("perform private.upsert_whats_new_item("),
    );
    expect(contract).toContain("remains the sole Picks lifecycle owner");
  });

  it("creates one recap-ready item instead of duplicate completion noise", () => {
    expect(migration).toContain("'picks:recap:' || v_event.event_id");
    expect(migration).toContain("'new_recap'");
    expect(migration).toContain("'picks'");
    expect(migration).toContain("'automatic'");
    expect(migration).toContain("'The event is complete. Final standings and the full recap are now available in Picks.'");
    expect(migration).toContain("'/picks'");
    expect(migration).toContain("'VIEW RECAP'");
    expect(migration).toContain("v_event.completed_at");
    expect(migration).not.toContain("'picks_event_completed'");
    expect(contract).toContain("one recap-ready item instead of duplicate completion and recap cards");
  });

  it("keeps rollback proof for timing, idempotency, and privileges", () => {
    expect(integrationSql).toContain("locking a Picks event published a recap before completion");
    expect(integrationSql).toContain("did not use the canonical completion timestamp");
    expect(integrationSql).toContain("repeated completion created a duplicate Picks recap item");
    expect(integrationSql).toContain("authenticated role can execute the private What''s New storage owner");
    expect(integrationSql).toContain("authenticated role can execute the public What''s New publisher");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
