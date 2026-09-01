import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200008_whats_new_foundation.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_foundation.sql",
  "utf8",
);
const providers = readFileSync("src/app/providers.tsx", "utf8");
const shell = readFileSync("src/app/AppShell.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const provider = readFileSync(
  "src/features/whats-new/WhatsNewProvider.tsx",
  "utf8",
);
const repository = readFileSync(
  "src/features/whats-new/whatsNewRepository.ts",
  "utf8",
);
const contract = readFileSync("docs/whats-new-foundation.md", "utf8");

describe("What's New foundation", () => {
  it("stores canonical items and read cursors privately behind RPCs", () => {
    expect(migration).toContain("create table if not exists private.whats_new_items");
    expect(migration).toContain("create table if not exists private.whats_new_read_states");
    expect(migration).toContain("alter table private.whats_new_items enable row level security");
    expect(migration).toContain("revoke all on private.whats_new_items from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.get_whats_new_snapshot");
    expect(migration).toContain("create or replace function public.mark_whats_new_read");
    expect(migration).not.toContain("grant select on private.whats_new_items to authenticated");
  });

  it("enforces the 7-day active, 15-day visible lifecycle", () => {
    expect(migration).toContain("now() - interval '7 days'");
    expect(migration).toContain("now() - interval '15 days'");
    expect(migration).toContain("then 'active'");
    expect(migration).toContain("else 'archive'");
    expect(contract).toContain("Items are active for 7 days");
    expect(contract).toContain("Days 8–15 appear in Archive");
    expect(contract).toContain("Items older than 15 days are removed from the visible feed");
  });

  it("uses one idempotent service-only publishing boundary", () => {
    expect(migration).toContain("create or replace function public.publish_whats_new_item");
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("on conflict (source_key) do update");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("to authenticated;\n\ngrant execute on function public.publish_whats_new_item");
    expect(contract).toContain("the only general-purpose externally callable publishing boundary");
  });

  it("keeps the complete feed on Home after the header slot becomes notifications", () => {
    const notificationAction = shell.indexOf("<NotificationHeaderAction />");
    const askAction = shell.indexOf('to="/intelligence"');
    const yourHq = home.indexOf('id="your-hq-title"');
    const preview = home.indexOf("<WhatsNewPreview />");
    const event = home.indexOf("{currentEvent ? (");

    expect(notificationAction).toBeGreaterThan(-1);
    expect(notificationAction).toBeLessThan(askAction);
    expect(shell).not.toContain("<WhatsNewHeaderAction />");
    expect(preview).toBeLessThan(yourHq);
    expect(yourHq).toBeLessThan(event);
    expect(router).toContain('path: "whats-new"');
    expect(contract).toContain("Home owns the permanent What's New preview");
    expect(contract).toContain("continues to own the complete feed");
    expect(contract).toContain("not a bottom-navigation destination");
  });

  it("keeps one browser owner without storage or polling fallbacks", () => {
    expect(providers).toContain("<WhatsNewProvider>");
    expect(provider).toContain("useIdentity()");
    expect(provider).toContain("repository.subscribe");
    expect(provider).toContain('window.addEventListener("focus"');
    expect(provider).toContain('document.addEventListener("visibilitychange"');
    expect(provider).not.toContain("localStorage");
    expect(provider).not.toContain("setInterval");
    expect(repository).toContain('client.rpc("get_whats_new_snapshot"');
    expect(repository).toContain('.channel("whats-new:feed", { config: { private: true } })');
    expect(repository).toContain('event: "whats_new_changed"');
  });

  it("locks the agreed meaningful-item and noise rules", () => {
    expect(contract).toContain("movement of at least three ranking spots");
    expect(contract).toContain("a completed Picks event");
    expect(contract).toContain("a new Fighters to Watch entry");
    expect(contract).toContain("minor bug fixes");
    expect(contract).toContain("one-position ranking moves");
    expect(contract).toContain("technical deployment activity");
  });

  it("keeps rollback proof for lifecycle, unread state, privacy, and Realtime", () => {
    expect(integrationSql).toContain("source-key idempotency created a duplicate");
    expect(integrationSql).toContain("expired What''s New item remained visible after 15 days");
    expect(integrationSql).toContain("What''s New read cursor moved backward");
    expect(integrationSql).toContain("authenticated role can read private What''s New tables directly");
    expect(integrationSql).toContain("What''s New private Realtime policy is missing");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
