import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_foundation.sql",
  "utf8",
);
const shell = readFileSync("src/app/AppShell.tsx", "utf8");
const providers = readFileSync("src/app/providers.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const page = readFileSync(
  "src/features/notifications/NotificationCenterPage.tsx",
  "utf8",
);
const provider = readFileSync(
  "src/features/notifications/NotificationProvider.tsx",
  "utf8",
);
const repository = readFileSync(
  "src/features/notifications/notificationRepository.ts",
  "utf8",
);
const contract = readFileSync("docs/notification-foundation.md", "utf8");

describe("notification foundation", () => {
  it("owns one private profile-targeted notification system", () => {
    expect(migration).toContain("create table if not exists private.notification_groups");
    expect(migration).toContain("create table if not exists private.notification_events");
    expect(migration).toContain("create table if not exists private.notification_owner");
    expect(migration).toContain("alter table private.notification_groups enable row level security");
    expect(migration).toContain("revoke all on private.notification_groups from public, anon, authenticated");
    expect(migration).not.toContain("grant select on private.notification_groups to authenticated");
    expect(providers).toContain("<NotificationProvider>");
    expect(contract).toContain("No feature may build a separate notification center");
  });

  it("aggregates repeated unread activity without duplicate source events", () => {
    expect(migration).toContain("constraint notification_events_recipient_source_unique unique");
    expect(migration).toContain("constraint notification_groups_recipient_aggregation_unique unique");
    expect(migration).toContain("then least(private.notification_groups.aggregate_count + 1, 9999)");
    expect(migration).toContain("else 1");
    expect(migration).toContain("read_at = null");
    expect(integrationSql).toContain("unread notifications did not aggregate into one counted row");
    expect(integrationSql).toContain("source-key idempotency changed the notification group");
    expect(integrationSql).toContain("a read aggregate did not reopen with a fresh count");
    expect(page).toContain("×{item.aggregateCount}");
    expect(contract).toContain("You were mentioned ×2");
  });

  it("enforces Cody-only operational notifications", () => {
    expect(migration).toContain("operational notifications are restricted to the owner account");
    expect(migration).toContain("create or replace function public.publish_owner_notification");
    expect(migration).toContain("owner notification publisher accepts operational alerts only");
    expect(migration).toContain("create or replace function public.set_notification_owner");
    expect(integrationSql).toContain("Cody-only operational notification accepted a non-owner recipient");
    expect(integrationSql).toContain("owner-only operational alert leaked into another profile snapshot");
    expect(contract).toContain("Cody-only operational alerts");
    expect(contract).toContain("A notification never applies a card change");
  });

  it("keeps one flat list with individual and all-read actions", () => {
    expect(page).toContain('className="notification-list"');
    expect(page).toContain("Mark as read");
    expect(page).toContain("Mark all as read");
    expect(page).not.toContain("Needs attention");
    expect(page).not.toContain("Recent activity");
    expect(contract).toContain("The center is one chronological list");
    expect(contract).toContain("not split into \"Needs attention\" and \"Recent activity\"");
    expect(migration).toContain("create or replace function public.mark_notification_read");
    expect(migration).toContain("create or replace function public.mark_all_notifications_read");
  });

  it("replaces only the What's New header shortcut and preserves Home and Octagon Verdict", () => {
    const notificationAction = shell.indexOf("<NotificationHeaderAction />");
    const askAction = shell.indexOf('to="/intelligence"');

    expect(notificationAction).toBeGreaterThan(-1);
    expect(notificationAction).toBeLessThan(askAction);
    expect(shell).not.toContain("<WhatsNewHeaderAction />");
    expect(shell).toContain('aria-label="Ask Octagon Verdict"');
    expect(home).toContain("<WhatsNewPreview />");
    expect(router).toContain('path: "notifications"');
    expect(router).toContain('path: "whats-new"');
    expect(contract).toContain("question-mark Octagon Verdict action remains unchanged");
  });

  it("uses authenticated RPCs and profile-scoped Realtime without fallbacks", () => {
    expect(repository).toContain('client.rpc("get_notification_snapshot"');
    expect(repository).toContain('client.rpc("mark_notification_read"');
    expect(repository).toContain('client.rpc("mark_all_notifications_read"');
    expect(repository).toContain(".channel(`notifications:${profileId}`");
    expect(repository).toContain('event: "notification_changed"');
    expect(provider).toContain("repository.subscribe(profileId");
    expect(provider).toContain('window.addEventListener("focus"');
    expect(provider).toContain('document.addEventListener("visibilitychange"');
    expect(provider).not.toContain("localStorage");
    expect(provider).not.toContain("setInterval");
    expect(migration).toContain("realtime.topic() = 'notifications:' || auth.uid()::text");
    expect(integrationSql).toContain("profile-scoped notification Realtime policy is missing");
  });

  it("keeps publishers service-only and personal state private", () => {
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("to service_role");
    expect(migration).toContain("to authenticated");
    expect(integrationSql).toContain("authenticated role can read private notification tables directly");
    expect(integrationSql).toContain("authenticated role can publish notifications");
    expect(integrationSql).toContain("anonymous role can read or mutate personal notifications");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
