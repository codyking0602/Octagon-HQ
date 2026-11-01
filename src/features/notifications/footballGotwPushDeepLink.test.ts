import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const source = readFileSync("public/push-readiness-sw.js", "utf8");
const origin = "https://octagon.hq-app.workers.dev";

function workerHarness() {
  const listeners: Record<string, (event: any) => void> = {};
  const navigation: string[] = [];
  const shown: Array<{ title: string; route: string }> = [];
  const client = {
    url: origin + "/football",
    navigate: async (url: string) => { navigation.push(url); },
    focus: async () => client,
  };
  const self = {
    location: { origin },
    clients: { matchAll: async () => [client] },
    addEventListener: (name: string, callback: (event: any) => void) => {
      listeners[name] = callback;
    },
    registration: {
      showNotification: async (title: string, options: { data: { route: string } }) => {
        shown.push({ title, route: options.data.route });
      },
    },
  };
  runInNewContext(source, { self, URL });

  return {
    navigation,
    shown,
    async tap(title: string, route: string) {
      const pending: Promise<unknown>[] = [];
      listeners.notificationclick!({
        notification: { title, data: { route }, close: () => undefined },
        waitUntil: (promise: Promise<unknown>) => { pending.push(promise); },
      });
      await Promise.all(pending);
    },
    async push(title: string, route: string) {
      const pending: Promise<unknown>[] = [];
      listeners.push!({
        data: { json: () => ({ title, route, notification_id: "gotw-test" }) },
        waitUntil: (promise: Promise<unknown>) => { pending.push(promise); },
      });
      await Promise.all(pending);
    },
  };
}

describe("Football GOTW phone notification tap", () => {
  it("repairs both already-shown one-hour GOTW alerts at tap time", async () => {
    const worker = workerHarness();
    await worker.tap("NFL Game of the Week starts soon", "/football");
    await worker.tap("CFB Game of the Week starts soon", "/football");
    expect(worker.navigation).toEqual([
      origin + "/football/picks?gotw=nfl",
      origin + "/football/picks?gotw=cfb",
    ]);
  });

  it("stores the correct destination on newly displayed GOTW alerts", async () => {
    const worker = workerHarness();
    await worker.push("NFL Game of the Week starts soon", "/football");
    await worker.push("CFB Game of the Week starts soon", "/football");
    expect(worker.shown.map((item) => item.route)).toEqual([
      "/football/picks?gotw=nfl", "/football/picks?gotw=cfb",
    ]);
  });

  it("leaves unrelated push destinations untouched", async () => {
    const worker = workerHarness();
    await worker.tap("Finish your Picks", "/football/picks");
    await worker.tap("Football Daily closes soon", "/football");
    expect(worker.navigation).toEqual([origin + "/football/picks", origin + "/football"]);
  });
});
