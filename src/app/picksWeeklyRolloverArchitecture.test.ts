import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const controlCenter = readFileSync(
  "src/features/picks-control/PicksControlCenterPage.tsx",
  "utf8",
);

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("Picks weekly rollover", () => {
  it("treats a completed card as history while making next-event setup available", () => {
    expect(controlCenter).toContain(
      'const activeEvent = event?.status === "complete" ? null : event;',
    );
    expect(controlCenter).toContain(
      'if (!eventState.value || eventState.value.status === "complete")',
    );
    expect(controlCenter).toContain("{activeEvent === null ? (");
    expect(controlCenter).toContain('label: staged ? "REVIEW & PUBLISH" : "OPEN EVENT SETUP"');
    expect(controlCenter).toContain('className={activeEvent ? "primary-action" : "secondary-action"}');
    expect(controlCenter).toContain('hidden={!identity.profile || event === null}');
  });

  it("preserves the canonical repositories and completed-event review path", () => {
    expect(occurrences(controlCenter, /controlRepository\.loadControlEvent\(eventId\)/g)).toBe(1);
    expect(occurrences(controlCenter, /setupRepository\.loadDraft\(\)/g)).toBe(1);
    expect(occurrences(controlCenter, /<PicksControlPage/g)).toBe(1);
    expect(occurrences(controlCenter, /<PicksSetupPage/g)).toBe(1);
    expect(controlCenter).not.toMatch(/getSupabaseClient|\.rpc\(|createClient|setInterval/);
    expect(occurrences(controlCenter, /window\.setTimeout/g)).toBe(1);
    expect(occurrences(controlCenter, /window\.clearTimeout/g)).toBe(1);
    expect(controlCenter).toContain("nextProgressiveLockClockAt");
  });
});
