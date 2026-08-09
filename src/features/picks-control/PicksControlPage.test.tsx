import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksControlPage from "./PicksControlPage";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

const owner = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
function gateway(profile: typeof owner | null = owner): IdentityGateway { return { getSession: async () => ({ userId: owner.id }), subscribe: () => () => undefined, loadProfile: async () => profile, signIn: async () => undefined, createProfile: async () => undefined, signOut: async () => undefined }; }

function event(status: "locked" | "complete" = "locked", resultStatus: PickControlEvent["bouts"][number]["resultStatus"] = "pending"): PickControlEvent {
  return { eventId: "ufc-control", name: "UFC Control", subtitle: "Alpha vs. Bravo", venue: "Arena", location: "Dallas", startsAt: "2099-08-09T04:00:00.000Z", locksAt: "2099-08-09T03:00:00.000Z", season: 2099, status, canLock: false, canComplete: status === "locked" && resultStatus !== "pending", canReorder: false, hasReorderHistory: false, recentCompletedEvents: [], bouts: [{ boutId: "alpha-bravo", locksAt: "2099-08-09T03:00:00.000Z", isLocked: true, canAdjustLock: false, position: 1, weightClass: "Lightweight", redFighterSlug: "alpha", redFighterName: "Alpha", blueFighterSlug: "bravo", blueFighterName: "Bravo", resultStatus, winnerFighterSlug: resultStatus === "red_win" ? "alpha" : resultStatus === "blue_win" ? "bravo" : null, resultRecordedAt: resultStatus === "pending" ? null : "2099-08-09T05:00:00.000Z", includedInPicks: true, canCancel: false, canRestore: false, canReplace: false, canRemoveFromPicks: false, canRestoreToPicks: false, canCorrectResult: resultStatus !== "pending", hasReplacementHistory: false, hasRemovalHistory: false, hasCorrectionHistory: false }] };
}

function repository(first: PickControlEvent, refreshed = first): PickControlRepository { return { loadControlEvent: vi.fn().mockResolvedValueOnce(first).mockResolvedValue(refreshed), lockEvent: vi.fn(), adjustLockTime: vi.fn(), adjustBoutLockTime: vi.fn(), setCancellation: vi.fn(), setBoutInclusion: vi.fn(), replaceFighter: vi.fn(), addBout: vi.fn(), reorderCard: vi.fn(), recordResult: vi.fn().mockResolvedValue(undefined), correctResult: vi.fn().mockResolvedValue(undefined), setWatchMoments: vi.fn().mockResolvedValue(undefined), completeEvent: vi.fn().mockResolvedValue(undefined) }; }
function renderPage(repo: PickControlRepository, profile: typeof owner | null = owner) { return render(<MemoryRouter><IdentityProvider gateway={gateway(profile)}><PicksControlPage repository={repo} now={Date.parse("2099-08-09T04:30:00.000Z")} /></IdentityProvider></MemoryRouter>); }

beforeEach(() => { vi.spyOn(window, "confirm").mockReturnValue(true); vi.spyOn(window, "prompt").mockReturnValue(null); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("Fight Night Control results lifecycle", () => {
  it("records an official result after confirmation", async () => {
    const repo = repository(event("locked", "pending"), event("locked", "red_win"));
    renderPage(repo);
    fireEvent.click(await screen.findByRole("button", { name: "RED WINNER Alpha" }));
    await waitFor(() => expect(repo.recordResult).toHaveBeenCalledWith("ufc-control", "alpha-bravo", "red_win"));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Are you sure"));
  });

  it("corrects a result with a generated factual audit description and no reason prompt", async () => {
    vi.mocked(window.prompt).mockReturnValue("BLUE");
    const repo = repository(event("complete", "red_win"), event("complete", "blue_win"));
    renderPage(repo);
    fireEvent.click(await screen.findByRole("button", { name: "CORRECT RESULT" }));
    await waitFor(() => expect(repo.correctResult).toHaveBeenCalledWith("ufc-control", expect.objectContaining({ boutId: "alpha-bravo" }), "blue_win", "Owner confirmed official result correction from Alpha to Bravo"));
    expect(window.prompt).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("recalculate automatically"));
  });

  it("publishes the supplied recap URL before completing the event", async () => {
    const repo = repository(event("locked", "red_win"), event("complete", "red_win"));
    renderPage(repo);
    fireEvent.change(await screen.findByRole("textbox", { name: "RECAP URL" }), { target: { value: "https://youtu.be/example" } });
    fireEvent.click(screen.getByRole("button", { name: "PUBLISH EVENT RECAP" }));
    await waitFor(() => expect(repo.completeEvent).toHaveBeenCalledWith("ufc-control"));
    expect(repo.setWatchMoments).toHaveBeenCalledWith("ufc-control", [{ title: "Alpha vs. Bravo", url: "https://youtu.be/example" }]);
    expect(vi.mocked(repo.setWatchMoments!).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(repo.completeEvent).mock.invocationCallOrder[0]);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("sends the recap notification to members"));
  });

  it("allows an intentional publish without a recap URL", async () => {
    const repo = repository(event("locked", "red_win"), event("complete", "red_win"));
    renderPage(repo);
    fireEvent.click(await screen.findByRole("button", { name: "PUBLISH EVENT RECAP" }));
    await waitFor(() => expect(repo.completeEvent).toHaveBeenCalledWith("ufc-control"));
    expect(repo.setWatchMoments).not.toHaveBeenCalled();
  });

  it("rejects an invalid recap URL before publishing", async () => {
    const repo = repository(event("locked", "red_win"), event("complete", "red_win"));
    renderPage(repo);
    fireEvent.change(await screen.findByRole("textbox", { name: "RECAP URL" }), { target: { value: "not-a-url" } });
    fireEvent.click(screen.getByRole("button", { name: "PUBLISH EVENT RECAP" }));
    expect(await screen.findByText("Enter a valid http or https recap URL, or leave the field blank.")).toBeInTheDocument();
    expect(repo.setWatchMoments).not.toHaveBeenCalled();
    expect(repo.completeEvent).not.toHaveBeenCalled();
  });

  it("keeps the owner surface private when signed out", async () => {
    const repo = repository(event());
    renderPage(repo, null);
    expect(await screen.findByRole("heading", { name: "Sign in to open Fight Night Control." })).toBeInTheDocument();
    expect(repo.loadControlEvent).not.toHaveBeenCalled();
  });
});