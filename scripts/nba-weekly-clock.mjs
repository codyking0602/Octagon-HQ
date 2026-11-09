#!/usr/bin/env node
/** GitHub cron may be delayed or dropped entirely. Scheduled and independent
 * workflow_run recovery use the actual Central calendar day/hour; manual/push
 * recovery is permitted immediately. Publication remains idempotent. */
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function nbaWeeklyGate(now = new Date(), event = "schedule") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago", weekday: "short", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const field = name => parts.find(p => p.type === name)?.value;
  const day = field("weekday");
  const hour = Number(field("hour"));
  const publish = event === "workflow_dispatch" || event === "push"
    || (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day) && hour >= 8);
  return { run: true, publish };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const gate = nbaWeeklyGate(new Date(), process.env.GITHUB_EVENT_NAME ?? "schedule");
  if (!process.env.GITHUB_OUTPUT) throw Error("Missing GITHUB_OUTPUT");
  fs.appendFileSync(process.env.GITHUB_OUTPUT,
    `run=${gate.run}\npublish=${gate.publish}\n`);
  console.log(`NBA weekly: collect=${gate.run}, publish=${gate.publish}`);
}
