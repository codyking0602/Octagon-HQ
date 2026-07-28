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
    included_in_picks: true,
    can_cancel: false,
    can_restore: false,
    can_remove_from_picks: false,
    can_restore_to_picks: false,
    has_removal_history: false,
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
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      hasRemovalHistory: false,
    });
  });

  it("maps pre-lock cancel, restore, removal, and restoration capabilities and safely defaults older responses", () => {
    const controllable = mapPickControlEvent({
      ...payload,
      status: "upcoming",
      bouts: [{
        ...payload.bouts[0],
        result_status: "pending",
        winner_fighter_slug: null,
        result_recorded_at: null,
        can_cancel: true,
        can_restore: false,
        can_remove_from_picks: true,
        can_restore_to_picks: false,
        has_removal_history: true,
      }],
    });
    expect(controllable?.bouts[0]).toMatchObject({
      includedInPicks: true,
      canCancel: true,
      canRestore: false,
      canRemoveFromPicks: true,
      canRestoreToPicks: false,
      hasRemovalHistory: true,
    });

    const {
      included_in_picks: _included,
      can_cancel: _canCancel,
      can_restore: _canRestore,
      can_remove_from_picks: _canRemove,
      can_restore_to_picks: _canRestoreToPicks,
      has_removal_history: _hasRemovalHistory,
      ...olderBout
    } = payload.bouts[0];
    const {
      can_reorder: _canReorder,
      has_reorder_history: _hasReorderHistory,
      ...olderEvent
    } = payload;
    const older = mapPickControlEvent({ ...olderEvent, bouts: [olderBout] });
    expect(older).toMatchObject({ canReorder: false, hasReorderHistory: false });
    expect(older?.bouts[0]).toMatchObject({
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      hasRemovalHistory: false,
    });
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

describe("approved live fight inclusion control", () => {
  it("submits inclusion state, matchup identity, and reason to the canonical RPC", async () => {
    rpc.mockResolvedValue({ data: { event_id: "ufc-control" }, error: null });
    const repository = createPickControlRepository();
    const event = mapPickControlEvent({ ...payload, status: "upcoming" })!;

    await repository!.setBoutInclusion(
      event.eventId,
      event.bouts[0],
      false,
      "Bout stays on UFC event but leaves Picks",
    );

    expect(rpc).toHaveBeenCalledWith("approve_pick_bout_inclusion", {
      p_event_id: "ufc-control",
      p_bout_id: "red-blue",
      p_included_in_picks: false,
      p_expected_included_in_picks: true,
      p_expected_red_fighter_slug: "red-fighter",
      p_expected_blue_fighter_slug: "blue-fighter",
      p_reason: "Bout stays on UFC event but leaves Picks",
    });
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
