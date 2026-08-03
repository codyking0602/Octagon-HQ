import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const controlPage = readFileSync(
  "src/features/picks-control/PicksControlPage.tsx",
  "utf8",
);
const controlCenter = readFileSync(
  "src/features/picks-control/PicksControlCenterPage.tsx",
  "utf8",
);
const repository = readFileSync(
  "src/features/picks-control/pickControlRepository.ts",
  "utf8",
);
const timing = readFileSync(
  "src/features/picks-control/progressiveLockTiming.ts",
  "utf8",
);
const styles = readFileSync("src/styles/picks-control.css", "utf8");

describe("owner progressive-lock controls", () => {
  it("offers the approved compact actions through the one canonical repository owner", () => {
    expect(controlPage).toContain('"+10 MIN"');
    expect(controlPage).toContain('"+20 MIN"');
    expect(controlPage).toContain('"SET TIME"');
    expect(controlPage.match(/repository\.adjustBoutLockTime!/g)).toHaveLength(3);
    expect(repository.match(/adjust_pick_bout_lock_time/g)).toHaveLength(1);
    expect(repository.match(/adjustBoutLockTime/g)?.length).toBeGreaterThanOrEqual(2);
    expect(controlPage).not.toContain("A fight cannot lock after the main-card start");
    expect(controlPage).not.toContain("proposed.getTime() > Date.parse(event.startsAt)");
  });

  it("keeps finality, pending state, result state, and backend acceptance authoritative", () => {
    expect(timing).toContain('event.status !== "upcoming"');
    expect(timing).toContain('bout.resultStatus !== "pending"');
    expect(timing).toContain("bout.isLocked === true");
    expect(timing).toContain("now >= deadline");
    expect(controlPage).toContain("DEADLINE FINAL");
    expect(controlPage).toContain("Once locked, the deadline is final");
    expect(controlPage).toContain("await action();");
    expect(controlPage).toContain("await loadEvent(event?.eventId);");
    expect(controlPage.indexOf("await action();")).toBeLessThan(
      controlPage.indexOf("await loadEvent(event?.eventId);"),
    );
  });

  it("updates only at meaningful warning boundaries without polling or a second interval", () => {
    expect(timing).toContain('return "LOCKS IN 10 MINUTES"');
    expect(timing).toContain('return "LOCKS IN 5 MINUTES"');
    expect(timing).toContain('return "LOCKS IN 1 MINUTE"');
    expect(controlCenter).toContain("nextProgressiveLockClockAt");
    expect(controlCenter).toContain("window.setTimeout");
    expect(controlCenter).toContain("window.clearTimeout");
    expect(controlCenter).not.toContain("setInterval");
    expect(controlCenter).not.toContain("loadControlEvent()");
  });

  it("keeps the three live-card actions usable at the 390px mobile contract", () => {
    expect(styles).toContain(".picks-control-lock-actions");
    expect(styles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(styles).toContain("min-height: 42px");
    expect(styles).toContain(".picks-control-lock-warning");
    expect(styles).toContain(".picks-control-lock-final");
  });
});
