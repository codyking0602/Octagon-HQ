import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workerSource = readFileSync("worker/index.ts", "utf8");
const syncSource = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");

describe("official UFC source transport", () => {
  it("keeps the Worker limited to authenticated UFC.com HTML transport", () => {
    expect(workerSource).toContain('const UFC_SOURCE_PATH = "/picks";');
    expect(workerSource).toContain('request.headers.get("x-octagon-internal-action") === "ufc-source"');
    expect(workerSource).toContain("env.UFC_SOURCE_TRANSPORT_TOKEN");
    expect(workerSource).toContain('quickAction("content"');
    expect(workerSource).toContain('"X-Octagon-UFC-Source": "ufc.com"');
    expect(workerSource).toContain('const hostOk = url.protocol === "https:" && /^(?:www\\.)?ufc\\.com$/i.test(url.hostname);');
    expect(workerSource).not.toMatch(/cbssports\.com|mmamania\.com/i);
  });

  it("keeps event selection, parsing, and card ownership in Supabase", () => {
    expect(syncSource).toContain('const UFC_EVENT_INDEX_URL = "https://www.ufc.com/events";');
    expect(syncSource).toContain('const UFC_SOURCE_TRANSPORT_PATH = "/picks";');
    expect(syncSource).toContain('"X-Octagon-Internal-Action": "ufc-source"');
    expect(syncSource).toContain('response.headers.get("x-octagon-ufc-source") !== "ufc.com"');
    expect(syncSource).toContain("parseUfcEventPage");
    expect(syncSource).toContain("sourceChanges(ownerProbe.data, event, effectiveScope)");
    expect(syncSource).not.toContain("fetchExactCbsEvent");
    expect(syncSource).not.toContain("fetchExactMmaManiaEvent");
  });
});
