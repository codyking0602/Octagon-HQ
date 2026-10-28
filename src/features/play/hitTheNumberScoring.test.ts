import { describe, expect, it } from "vitest";
import { hitTheNumberScore } from "./hitTheNumberEngine";

describe("Hit the Number Bob Barker scoring", () => {
  it("keeps every legal under above every bust while preserving closeness inside each side", () => {
    const perfect = hitTheNumberScore({ status: "perfect", target: 45, distance: 0, pickCount: 6 });
    const lowestLegalUnder = hitTheNumberScore({ status: "under", target: 45, distance: 44, pickCount: 6 });
    const closestUnder = hitTheNumberScore({ status: "under", target: 45, distance: 1, pickCount: 6 });
    const closestBust = hitTheNumberScore({ status: "bust", target: 45, distance: 1, pickCount: 6 });
    const fartherBust = hitTheNumberScore({ status: "bust", target: 45, distance: 8, pickCount: 6 });

    expect(perfect).toBe(100);
    expect(lowestLegalUnder).toBe(51);
    expect(closestUnder).toBe(99);
    expect(closestBust).toBe(49);
    expect(fartherBust).toBe(41);
    expect(lowestLegalUnder).toBeGreaterThan(closestBust);
  });

  it("matches the approved target-45 calibration from today's UFC Daily", () => {
    expect(hitTheNumberScore({ status: "under", target: 45, distance: 10, pickCount: 6 })).toBe(89);
    expect(hitTheNumberScore({ status: "bust", target: 45, distance: 8, pickCount: 6 })).toBe(41);
  });

  it("is percentage-based across target sizes and independent of pick count", () => {
    const examples = [
      { target: 45, distance: 10, expected: 89 },
      { target: 450, distance: 100, expected: 89 },
      { target: 4_500, distance: 1_000, expected: 89 },
    ];

    for (const { target, distance, expected } of examples) {
      expect(hitTheNumberScore({ status: "under", target, distance, pickCount: 4 })).toBe(expected);
      expect(hitTheNumberScore({ status: "under", target, distance, pickCount: 6 })).toBe(expected);
    }

    expect(hitTheNumberScore({ status: "bust", target: 100, distance: 100, pickCount: 4 })).toBe(0);
    expect(hitTheNumberScore({ status: "bust", target: 500, distance: 500, pickCount: 6 })).toBe(0);
  });
});
