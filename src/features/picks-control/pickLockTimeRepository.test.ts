import { afterEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({ rpc }),
}));

import { createPickControlRepository } from "./pickControlRepository";

afterEach(() => rpc.mockReset());

describe("event-wide Picks deadline repository", () => {
  it("submits one proposed deadline, expected-current guard, and owner reason", async () => {
    rpc.mockResolvedValue({ data: { event_id: "ufc-control" }, error: null });
    const repository = createPickControlRepository();

    await repository!.adjustLockTime!(
      "ufc-control",
      "2026-08-01T16:30:00.000Z",
      "2026-08-01T16:00:00.000Z",
      "Main card broadcast moved",
    );

    expect(rpc).toHaveBeenCalledWith("adjust_pick_event_lock_time", {
      p_event_id: "ufc-control",
      p_locks_at: "2026-08-01T16:30:00.000Z",
      p_expected_locks_at: "2026-08-01T16:00:00.000Z",
      p_reason: "Main card broadcast moved",
    });
  });
});
