import { afterEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({ rpc }),
}));

import { createPickControlRepository, mapPickControlEvent } from "./pickControlRepository";

const payload = {
  event_id: "ufc-control",
  name: "UFC Control",
  subtitle: "Red vs. Blue",
  venue: "Test Arena",
  location: "Dallas, Texas",
  starts_at: "2026-08-01T02:00:00.000Z",
  locks_at: "2026-08-01T01:00:00.000Z",
  season: 2026,
  status: "locked",
  can_lock: false,
  can_complete: true,
  can_reorder: false,
  has_reorder_history: false,
  bouts: [{
    bout_id: "red-blue",
    position: 1,
    weight_class: "Lightweight",
    red_fighter_slug: "red-fighter",
    red_fighter_name: "Red Fighter",
    blue_fighter_slug: "blue-fighter",
    blue_fighter_name: "Blue Fighter",
    result_status: "red_win",
    winner_fighter_slug: "red-fighter",
    result_recorded_at: "2026-08-01T02:30:00.000Z",
    can_cancel: false,
    can_restore: false,
  }],
};

afterEach(() => {
  rpc.mockReset();
});

describe("Fight Night control mapping", () => {
  it("maps the owner-only operational projection", () => {
    const event = mapPickControlEvent(payload);

    expect(event).toMatchObject({
      eventId: "ufc-control",
      status: "locked",
      canLock: false,
      canComplete: true,
      canReorder: false,
      hasReorderHistory: false,
    });
    expect(event?.bouts[0]).toMatchObject({
      boutId: "red-blue",
      resultStatus: "red_win",
      winnerFighterSlug: "red-fighter",
      canCancel: false,
      canRestore: false,
    });
  });

  it("maps pre-lock cancel and restore capabilities and safely defaults older responses", () => {
    const cancellable = mapPickControlEvent({
      ...payload,
      status: "upcoming",
      bouts: [{
        ...payload.bouts[0],
        result_status: "pending",
        winner_fighter_slug: null,
        result_recorded_at: null,
        can_cancel: true,
        can_restore: false,
      }],
    });
    expect(cancellable?.bouts[0]).toMatchObject({ canCancel: true, canRestore: false });

    const {
      can_cancel: _canCancel,
      can_restore: _canRestore,
      ...olderBout
    } = payload.bouts[0];
    const {
      can_reorder: _canReorder,
      has_reorder_history: _hasReorderHistory,
      ...olderEvent
    } = payload;
    const older = mapPickControlEvent({ ...olderEvent, bouts: [olderBout] });
    expect(older).toMatchObject({ canReorder: false, hasReorderHistory: false });
    expect(older?.bouts[0]).toMatchObject({ canCancel: false, canRestore: false });
  });

  it("returns null when there is no active event", () => {
    expect(mapPickControlEvent(null)).toBeNull();
  });
});

describe("fighter replacement control projection", () => {
  it("maps owner replacement capability and history without audit details", () => {
    const event = mapPickControlEvent({
      ...payload,
      status: "upcoming",
      bouts: [{ ...payload.bouts[0], result_status: "pending", can_replace: true, has_replacement_history: true }],
    });
    expect(event?.bouts[0]).toMatchObject({ canReplace: true, hasReplacementHistory: true });
  });
});

describe("live fight reorder control", () => {
  it("maps server-owned reorder eligibility and history without audit evidence", () => {
    const event = mapPickControlEvent({
      ...payload,
      status: "upcoming",
      can_reorder: true,
      has_reorder_history: true,
    });

    expect(event).toMatchObject({ canReorder: true, hasReorderHistory: true });
    expect(event).not.toHaveProperty("reorderHistory");
  });

  it("submits the complete stale-state and proposed orders to the canonical RPC", async () => {
    rpc.mockResolvedValue({ data: { event_id: "ufc-control" }, error: null });
    const repository = createPickControlRepository();
    expect(repository).not.toBeNull();

    await repository!.reorderCard(
      "ufc-control",
      ["red-blue", "second-fight"],
      ["second-fight", "red-blue"],
      "Official UFC bout order updated",
    );

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("approve_pick_card_reorder", {
      p_event_id: "ufc-control",
      p_expected_bout_ids: ["red-blue", "second-fight"],
      p_proposed_bout_ids: ["second-fight", "red-blue"],
      p_reason: "Official UFC bout order updated",
    });
  });
});