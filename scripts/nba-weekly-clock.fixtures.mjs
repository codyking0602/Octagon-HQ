import { test } from "node:test";
import assert from "node:assert/strict";
import { nbaWeeklyGate } from "./nba-weekly-clock.mjs";

test("late Tuesday GitHub schedule remains eligible to publish", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-10-27T15:41:19Z"), "schedule"),
    { run: true, publish: true });
});
test("Tuesday before 5 AM Central collects but does not publish", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-10-27T09:00:00Z"), "schedule"),
    { run: true, publish: false });
});
test("5 AM Central works in both daylight saving and standard time", () => {
  assert.equal(nbaWeeklyGate(new Date("2026-10-27T10:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-03T11:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-03T10:00:00Z")).publish, false);
});
test("weekday collection and weekend overdue recovery remain enabled", () => {
  assert.deepEqual(nbaWeeklyGate(new Date("2026-10-26T16:26:05Z")),
    {run:true,publish:false});
  assert.equal(nbaWeeklyGate(new Date("2026-10-31T16:00:00Z")).publish, true);
  assert.equal(nbaWeeklyGate(new Date("2026-11-01T17:00:00Z")).publish, true);
});
test("manual dispatch and repair-push recover immediately", () => {
  for (const event of ["workflow_dispatch", "push"])
    assert.deepEqual(nbaWeeklyGate(new Date("2026-10-26T02:00:00Z"), event),
      { run: true, publish: true });
});
