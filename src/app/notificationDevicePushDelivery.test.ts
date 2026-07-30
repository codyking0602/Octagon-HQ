import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200025_notification_device_push_delivery.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_device_push_delivery.sql",
  "utf8",
);
const edgeFunction = readFileSync(
  "supabase/functions/deliver-notification-push/index.ts",
  "utf8",
);
const serviceWorker = readFileSync("public/push-readiness-sw.js", "utf8");
const pushConnection = readFileSync(
  "src/features/notifications/notificationDevicePush.ts",
  "utf8",
);
const readiness = readFileSync(
  "src/features/notifications/notificationDeviceReadiness.ts",
  "utf8",
);
const repository = readFileSync(
  "src/features/notifications/notificationRepository.ts",
  "utf8",
);
const provider = readFileSync(
  "src/features/notifications/NotificationProvider.tsx",
  "utf8",
);
const page = readFileSync(
  "src/features/notifications/NotificationCenterPage.tsx",
  "utf8",
);
const deploymentWorkflow = readFileSync(
  ".github/workflows/deploy-supabase.yml",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-device-push-delivery.md",
  "utf8",
);

describe("notification device push delivery", () => {
  it("stores private per-device subscriptions and idempotent delivery claims", () => {
    expect(migration).toContain("create table if not exists private.notification_push_subscriptions");
    expect(migration).toContain("create table if not exists private.notification_push_deliveries");
    expect(migration).toContain("notification_id,\n    subscription_id,\n    notification_version");
    expect(migration).toContain("endpoint text not null unique");
    expect(migration).toContain("on delete cascade");
    expect(migration).toContain(
      "revoke all on private.notification_push_subscriptions from public, anon, authenticated",
    );
    expect(migration).toContain(
      "revoke all on private.notification_push_deliveries from public, anon, authenticated",
    );
    expect(integrationSql).toContain("the same notification version was claimed twice");
  });

  it("keeps browser access behind signed-in status and registration RPCs", () => {
    expect(migration).toContain("create or replace function public.get_my_notification_push_status");
    expect(migration).toContain(
      "create or replace function public.register_my_notification_push_subscription",
    );
    expect(migration).toContain(
      "create or replace function public.remove_my_notification_push_subscription",
    );
    expect(migration).toContain("v_profile_id uuid := auth.uid()");
    expect(repository).toContain('client.rpc("get_my_notification_push_status"');
    expect(repository).toContain('client.rpc("register_my_notification_push_subscription"');
    expect(repository).toContain('client.rpc("remove_my_notification_push_subscription"');
    expect(integrationSql).toContain("authenticated role can access private push storage directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });

  it("reuses canonical notification priority and adds no second scheduler", () => {
    expect(migration).toContain("after insert or update on private.notification_groups");
    expect(migration).toContain("new.priority <> 'push_candidate'");
    expect(migration).toContain("new.read_at is not null");
    expect(migration).toContain("new.latest_event_at is not distinct from old.latest_event_at");
    expect(migration).toContain("private.notification_push_deliveries");
    expect(migration).not.toContain("cron.schedule");
    expect(provider).not.toContain("setInterval");
    expect(contract).toContain("There is no second scheduler");
    expect(integrationSql).toContain("an in-app-only notification became push eligible");
  });

  it("keeps VAPID secrets and delivery authorization out of browser code", () => {
    expect(migration).toContain("octagon_web_push_public_key");
    expect(migration).toContain("octagon_web_push_private_key");
    expect(migration).toContain("octagon_notification_push_delivery_token");
    expect(migration).toContain("vault.decrypted_secrets");
    expect(migration).toContain("authorize_notification_push_delivery");
    expect(edgeFunction).toContain("webPush.generateVAPIDKeys()");
    expect(edgeFunction).toContain("x-octagon-push-token");
    expect(edgeFunction).toContain("authorize_notification_push_delivery");
    expect(edgeFunction).toContain("claim_notification_push_delivery");
    expect(edgeFunction).toContain("record_notification_push_delivery");
    expect(repository).toContain('functions.invoke("deliver-notification-push"');
    expect(repository).not.toContain("private_key");
    expect(pushConnection).not.toContain("private_key");
    expect(integrationSql).toContain(
      "authenticated role can access service-only push secrets or authorization",
    );
  });

  it("requests permission only from the member's explicit device action", () => {
    expect(pushConnection).toContain("Notification.requestPermission");
    expect(pushConnection).toContain("pushManager.subscribe");
    expect(pushConnection).toContain("applicationServerKey");
    expect(pushConnection).toContain("subscription.unsubscribe()");
    expect(readiness).not.toContain("Notification.requestPermission");
    expect(readiness).not.toContain("pushManager.subscribe");
    expect(provider).toContain("enableDevicePush");
    expect(provider).toContain("disableDevicePush");
    expect(page).toContain("TURN ON DEVICE NOTIFICATIONS");
    expect(page).toContain("TURN OFF DEVICE NOTIFICATIONS");
    expect(page).toContain("Share → Add to Home Screen");
    expect(repository).not.toContain("localStorage");
    expect(provider).not.toContain("localStorage");
  });

  it("shows push only when the app is hidden and routes notification clicks", () => {
    expect(serviceWorker).toContain('addEventListener("push"');
    expect(serviceWorker).toContain("visibilityState === \"visible\"");
    expect(serviceWorker).toContain("postMessage");
    expect(serviceWorker).toContain("showNotification");
    expect(serviceWorker).toContain('addEventListener("notificationclick"');
    expect(serviceWorker).toContain("existing.navigate(targetUrl)");
    expect(serviceWorker).toContain("clients.openWindow(targetUrl)");
    expect(provider).toContain("octagon-notification-push");
    expect(contract).toContain("instead of showing a duplicate operating-system alert");
  });

  it("cleans expired endpoints and preserves per-device independence", () => {
    expect(migration).toContain("p_http_status in (404, 410)");
    expect(migration).toContain("subscription.failure_count + 1 >= 5");
    expect(migration).toContain("enabled = case");
    expect(integrationSql).toContain("expired endpoint was not disabled safely");
    expect(integrationSql).toContain("expired endpoint could not be renewed");
    expect(integrationSql).toContain("signed-in device push removal was incomplete");
    expect(contract).toContain("It does not delete notification history or affect another device");
  });

  it("keeps exact-source deployment inside the canonical Supabase workflow", () => {
    expect(deploymentWorkflow).toContain("Deploy notification push delivery function when present");
    expect(deploymentWorkflow).toContain(
      "supabase functions deploy deliver-notification-push",
    );
    expect(deploymentWorkflow).toContain(
      'require_remote_migration "202608200025"',
    );
    expect(deploymentWorkflow).toContain("push-config-response.json");
    expect(deploymentWorkflow).toContain("DELIVERY_AUTH_REQUIRED");
    expect(deploymentWorkflow).toContain("$SOURCE_SHA");
    expect(contract).toContain("canonical Supabase deployment workflow remains the only backend deployment owner");
  });
});
