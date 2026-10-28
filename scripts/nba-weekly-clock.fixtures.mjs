import { test } from "node:test";
import assert from "node:assert/strict";
import { nbaWeeklyGate } from "./nba-weekly-clock.mjs";

test("late Monday GitHub schedule remains eligible to publish", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-11-02T16:41:19Z"), "schedule"),
    { run: true, publish: true });
});
test("Monday before 8 AM Central collects but does not publish", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-11-02T13:00:00Z"), "schedule"),
    { run: true, publish: false });
});
test("8 AM Central works in both daylight saving and standard time", () => {
  assert.equal(nbaWeeklyGate(new Date("2026-10-26T13:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-02T14:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-02T13:00:00Z")).publish, false);
});
test("weekday collection and weekend overdue recovery remain enabled", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-10-26T11:26:05Z")),
    {run:true,publish:false});
  assert.equal(nbaWeeklyGate(new Date("2026-10-31T16:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-01T17:00:00Z")).publish, true);
});
test("manual dispatch and repair-push recover immediately", () => {
  for (const event of ["workflow_dispatch", "push"])
    assert.deepEqual(nbaWeeklyGate(new Date("2026-10-26T02:00:00Z"), event),
      { run: true, publish: true });
});
