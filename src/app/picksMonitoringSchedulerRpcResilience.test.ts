import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const monitoringRunner = readFileSync(
  "supabase/functions/run-pick-monitoring/index.ts",
  "utf8",
);

describe("scheduled monitoring transient RPC resilience", () => {
  it("retries the exact canonical scheduler RPC once without a fallback credential or query path", () => {
    expect(monitoringRunner).toContain("const schedulerRpc = async (");
    expect(monitoringRunner).toContain("const first = await admin.rpc(functionName, args);");
    expect(monitoringRunner).toContain("if (!first.error) return first;");
    expect(monitoringRunner).toContain("return admin.rpc(functionName, args);");

    for (const functionName of [
      "authorize_pick_monitoring_scheduler",
      "dispatch_due_in_app_notifications",
      "get_pick_monitoring_event_state",
      "record_pick_monitoring_scheduler_decision",
    ]) {
      expect(monitoringRunner).toContain(`schedulerRpc("${functionName}"`);
    }

    expect(monitoringRunner).not.toContain("createClient(url, Deno.env.get(\"SUPABASE_SECRET_KEY\")");
    expect(monitoringRunner.match(/const admin = createClient/g) ?? []).toHaveLength(1);
  });
});
