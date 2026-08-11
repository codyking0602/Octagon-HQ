import { afterEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({ rpc }),
}));

import { createPickControlRepository } from "./pickControlRepository";

afterEach(() => {
  rpc.mockReset();
});

describe("Picks event header repository ownership", () => {
  it("persists the storage path and natural dimensions through the existing Picks control repository", async () => {
    rpc.mockResolvedValue({ data: { event_id: "ufc-330" }, error: null });
    const repository = createPickControlRepository();

    await repository!.setEventHeader(
      "ufc-330",
      "ufc-330/selected-poster.webp",
      640,
      313,
    );

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("set_pick_event_header", {
      p_event_id: "ufc-330",
      p_storage_path: "ufc-330/selected-poster.webp",
      p_natural_width: 640,
      p_natural_height: 313,
    });
  });

  it("surfaces backend authorization or validation failures without a fallback write path", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "Fight Night Control owner access required" } });
    const repository = createPickControlRepository();

    await expect(repository!.setEventHeader("ufc-330", "ufc-330/poster.webp", 640, 313))
      .rejects.toThrow("Fight Night Control owner access required");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
