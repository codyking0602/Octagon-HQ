import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import webPush from "npm:web-push@3.6.7";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

const deliveryHeader = "x-octagon-push-token";
const appOrigin = Deno.env.get("OCTAGON_APP_ORIGIN") ?? "https://octagon.hq-app.workers.dev";
const corsHeaders = {
  "Access-Control-Allow-Origin": appOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA,
  },
});

const errorResponse = (status: number, code: string, message: string) => json({
  code,
  message,
  deployment_sha: DEPLOYED_SOURCE_SHA,
}, status);

const asRecord = (value: unknown): Record<string, unknown> | null => (
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
);

interface PushConfiguration {
  configured: boolean;
  public_key: string | null;
  private_key: string | null;
  subject: string | null;
}

interface DeliveryClaim {
  delivery_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  id: string;
  title: string;
  summary: string;
  route: string;
  category: string;
  kind: string;
  aggregate_count: number;
  latest_event_at: string;
}

function parseConfiguration(value: unknown): PushConfiguration | null {
  const row = asRecord(value);
  if (!row) return null;
  return {
    configured: row.configured === true,
    public_key: typeof row.public_key === "string" ? row.public_key : null,
    private_key: typeof row.private_key === "string" ? row.private_key : null,
    subject: typeof row.subject === "string" ? row.subject : null,
  };
}

function parseClaim(value: unknown) {
  const row = asRecord(value);
  const notificationRow = asRecord(row?.notification);
  const deliveriesRaw = Array.isArray(row?.deliveries) ? row.deliveries : [];
  const notification: NotificationPayload | null = notificationRow
    && typeof notificationRow.id === "string"
    && typeof notificationRow.title === "string"
    && typeof notificationRow.summary === "string"
    && typeof notificationRow.route === "string"
      ? {
          id: notificationRow.id,
          title: notificationRow.title,
          summary: notificationRow.summary,
          route: notificationRow.route,
          category: typeof notificationRow.category === "string" ? notificationRow.category : "",
          kind: typeof notificationRow.kind === "string" ? notificationRow.kind : "",
          aggregate_count: Number(notificationRow.aggregate_count) || 1,
          latest_event_at: typeof notificationRow.latest_event_at === "string"
            ? notificationRow.latest_event_at
            : new Date().toISOString(),
        }
      : null;

  const deliveries = deliveriesRaw.flatMap((entry): DeliveryClaim[] => {
    const delivery = asRecord(entry);
    if (
      !delivery
      || typeof delivery.delivery_id !== "string"
      || typeof delivery.endpoint !== "string"
      || typeof delivery.p256dh !== "string"
      || typeof delivery.auth !== "string"
    ) return [];
    return [{
      delivery_id: delivery.delivery_id,
      endpoint: delivery.endpoint,
      p256dh: delivery.p256dh,
      auth: delivery.auth,
    }];
  });

  return { notification, deliveries };
}

async function ensurePushConfiguration(admin: ReturnType<typeof createClient>) {
  const current = await admin.rpc("get_notification_push_configuration");
  if (current.error) throw new Error("Push configuration could not be read.");
  let configuration = parseConfiguration(current.data);

  if (!configuration?.configured) {
    const generated = webPush.generateVAPIDKeys();
    const configured = await admin.rpc("configure_notification_push", {
      p_public_key: generated.publicKey,
      p_private_key: generated.privateKey,
      p_subject: appOrigin,
    });
    if (configured.error) throw new Error("Push configuration could not be created.");
    configuration = parseConfiguration(configured.data);
  }

  if (
    !configuration?.configured
    || !configuration.public_key
    || !configuration.private_key
    || !configuration.subject
  ) throw new Error("Push configuration is incomplete.");

  return configuration as Required<PushConfiguration>;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return errorResponse(405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  let input: Record<string, unknown> = {};
  try {
    input = asRecord(await request.json()) ?? {};
  } catch {
    // Empty input is handled below.
  }

  if (input.mode === "deployment-info") {
    return json({ deployment_sha: DEPLOYED_SOURCE_SHA });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    return errorResponse(503, "PUSH_NOT_CONFIGURED", "Device notification delivery is not configured.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (input.mode === "configuration") {
    try {
      const configuration = await ensurePushConfiguration(admin);
      return json({
        public_key: configuration.public_key,
        deployment_sha: DEPLOYED_SOURCE_SHA,
      });
    } catch {
      return errorResponse(503, "PUSH_CONFIGURATION_FAILED", "Device notification setup is temporarily unavailable.");
    }
  }

  if (input.mode !== "deliver" || typeof input.notification_id !== "string") {
    return errorResponse(400, "INVALID_REQUEST", "A valid push delivery request is required.");
  }

  const token = request.headers.get(deliveryHeader) ?? "";
  const authorized = await admin.rpc("authorize_notification_push_delivery", { p_token: token });
  if (authorized.error || authorized.data !== true) {
    return errorResponse(401, "DELIVERY_AUTH_REQUIRED", "Push delivery authorization required.");
  }

  let configuration: Required<PushConfiguration>;
  try {
    configuration = await ensurePushConfiguration(admin);
  } catch {
    return errorResponse(503, "PUSH_CONFIGURATION_FAILED", "Device notification delivery is temporarily unavailable.");
  }

  const claimed = await admin.rpc("claim_notification_push_delivery", {
    p_notification_id: input.notification_id,
  });
  if (claimed.error) {
    return errorResponse(503, "PUSH_CLAIM_FAILED", "Push delivery could not be claimed safely.");
  }

  const { notification, deliveries } = parseClaim(claimed.data);
  if (!notification || deliveries.length === 0) {
    return json({
      status: "noop",
      delivered: 0,
      failed: 0,
      deployment_sha: DEPLOYED_SOURCE_SHA,
    });
  }

  webPush.setVapidDetails(
    configuration.subject,
    configuration.public_key,
    configuration.private_key,
  );

  const payload = JSON.stringify({
    notification_id: notification.id,
    title: notification.title,
    summary: notification.summary,
    route: notification.route.startsWith("/") ? notification.route : "/notifications",
    category: notification.category,
    kind: notification.kind,
    aggregate_count: notification.aggregate_count,
    latest_event_at: notification.latest_event_at,
    icon: "https://codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png",
  });

  let delivered = 0;
  let failed = 0;

  await Promise.all(deliveries.map(async (delivery) => {
    try {
      const response = await webPush.sendNotification({
        endpoint: delivery.endpoint,
        keys: {
          p256dh: delivery.p256dh,
          auth: delivery.auth,
        },
      }, payload, {
        TTL: 86_400,
        urgency: "high",
      });

      delivered += 1;
      await admin.rpc("record_notification_push_delivery", {
        p_delivery_id: delivery.delivery_id,
        p_success: true,
        p_http_status: Number(response?.statusCode) || 201,
        p_error_message: null,
      });
    } catch (cause) {
      failed += 1;
      const error = asRecord(cause);
      const statusCode = typeof error?.statusCode === "number" ? error.statusCode : null;
      const message = typeof error?.message === "string"
        ? error.message
        : "Web Push provider rejected the delivery.";
      await admin.rpc("record_notification_push_delivery", {
        p_delivery_id: delivery.delivery_id,
        p_success: false,
        p_http_status: statusCode,
        p_error_message: message,
      });
    }
  }));

  return json({
    status: failed === 0 ? "delivered" : delivered > 0 ? "partial" : "failed",
    delivered,
    failed,
    deployment_sha: DEPLOYED_SOURCE_SHA,
  }, failed > 0 && delivered === 0 ? 502 : 200);
});
