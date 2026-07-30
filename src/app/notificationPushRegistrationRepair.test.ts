import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pushConnection = readFileSync(
  "src/features/notifications/notificationDevicePush.ts",
  "utf8",
);
const repairMigration = readFileSync(
  "supabase/migrations/202608200032_notification_push_registration_repair.sql",
  "utf8",
);
const deployWorkflow = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);

describe("notification push registration repair", () => {
  it("reuses a healthy existing subscription and replaces an incomplete one", () => {
    expect(pushConnection).toContain("usableExistingSubscription");
    expect(pushConnection).toContain("serializeNotificationPushSubscription(existing)");
    expect(pushConnection).toContain("await existing.unsubscribe().catch(() => false)");
    expect(pushConnection).toContain("return existing");
  });

  it("performs one controlled iPhone subscription repair before failing", () => {
    expect(pushConnection).toContain("await registration.update().catch(() => undefined)");
    expect(pushConnection).toContain("const stale = await registration.pushManager.getSubscription()");
    expect(pushConnection).toContain("if (stale) await stale.unsubscribe().catch(() => false)");
    expect(pushConnection.match(/createNotificationPushSubscription\(registration, publicKey\)/g))
      .toHaveLength(2);
    expect(pushConnection).not.toContain("localStorage");
    expect(pushConnection).not.toContain("setInterval");
  });

  it("refreshes only the canonical authenticated registration RPC boundary", () => {
    expect(repairMigration).toContain(
      "to_regprocedure('public.register_my_notification_push_subscription(text,text,text,text)')",
    );
    expect(repairMigration).toContain(
      "grant execute on function public.register_my_notification_push_subscription(text, text, text, text) to authenticated",
    );
    expect(repairMigration).toContain("notify pgrst, 'reload schema'");
    expect(repairMigration).not.toContain("create table");
    expect(repairMigration).not.toContain("create trigger");
    expect(repairMigration).not.toContain("cron.schedule");
  });

  it("keeps the existing Supabase deployment workflow as the only backend owner", () => {
    expect(deployWorkflow).toContain("supabase db push --linked");
    expect(deployWorkflow).toContain("Deploy notification push delivery function when present");
    expect(deployWorkflow).toContain("supabase functions deploy deliver-notification-push");
  });
});
