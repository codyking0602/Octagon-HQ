import { describe, expect, it } from "vitest";
import { hitTheNumberScore } from "./hitTheNumberEngine";

describe("Hit the Number Price Is Right scoring", () => {
  it("keeps every under-target result above every bust while preserving closeness inside each bucket", () => {
    const perfect = hitTheNumberScore({
      status: "perfect",
      target: 1_000,
      distance: 0,
      pickCount: 4,
    });
    const closestUnder = hitTheNumberScore({
      status: "under",
      target: 1_000,
      distance: 1,
      pickCount: 4,
    });
    const fartherUnder = hitTheNumberScore({
      status: "under",
      target: 93,
      distance: 20,
      pickCount: 7,
    });
    const farthestUnder = hitTheNumberScore({
      status: "under",
      target: 93,
      distance: 1_000,
      pickCount: 7,
    });
    const closestBust = hitTheNumberScore({
      status: "bust",
      target: 1_000,
      distance: 0.001,
      pickCount: 4,
    });
    const fartherBust = hitTheNumberScore({
      status: "bust",
      target: 93,
      distance: 20,
      pickCount: 7,
    });

    expect(perfect).toBe(100);
    expect(closestUnder).toBe(99);
    expect(fartherUnder).toBe(95);
    expect(farthestUnder).toBe(75);
    expect(closestBust).toBe(74);
    expect(fartherBust).toBe(70);
    expect(farthestUnder).toBeGreaterThan(closestBust);
    expect(closestUnder).toBeGreaterThan(fartherUnder);
    expect(closestBust).toBeGreaterThan(fartherBust);
  });

  it("keeps the 27 to 24 challenge result distinct", () => {
    const shane = hitTheNumberScore({ status: "under", target: 32, distance: 5, pickCount: 5 });
    const cody = hitTheNumberScore({ status: "under", target: 32, distance: 8, pickCount: 5 });

    expect(shane).toBe(96);
    expect(cody).toBe(94);
    expect(shane).toBeGreaterThan(cody);
  });
});
