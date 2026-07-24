import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider } from "./ChallengeProvider";
import FindLeaderChallengeRoute from "./FindLeaderChallengeRoute";
import { CHALLENGE_STORAGE_KEY, loadChallenges } from "./challengeRepository";
import PlayPage from "../play/PlayPage";
import { centralDay, dailyFindLeaderBoard } from "../play/findLeaderEngine";

const PROFILE_STORAGE_KEY = "octagon-hq:challenge-profile:v1";

function renderWithChallenges(element: ReactNode, path: string) {
  return render(
    <ChallengeProvider>
      <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
    </ChallengeProvider>,
  );
}

function leaderButton(container: HTMLElement, leaderName: string) {
  return [...container.querySelectorAll<HTMLButtonElement>(".find-card")]
    .find((button) => button.textContent?.includes(leaderName));
}

describe("Play Challenge Center flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("supports text sharing, freezes the board, and reveals both exact choice paths after completion", async () => {
    const day = centralDay();
    const board = dailyFindLeaderBoard(day)!;
    const leader = board.candidates.find((fighter) => fighter.id === board.leaderId)!;

    const creatorView = renderWithChallenges(<PlayPage />, `/play/find-leader?day=${day}`);
    fireEvent.click(leaderButton(creatorView.container, leader.name)!);
    fireEvent.click(screen.getByRole("button", { name: "CHALLENGE SOMEONE" }));

    expect(screen.getByRole("dialog", { name: "Challenge Someone" })).toBeTruthy();
    expect(screen.getByText("Send to an Octagon HQ profile or use your phone’s share sheet to text the exact challenge.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "TEXT / SHARE LINK" }));
    await waitFor(() => expect(navigator.share).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "SEND TO PROFILE" }));

    const sent = loadChallenges(window.localStorage);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.creatorId).toBe("cody-preview");
    expect(sent[0]?.recipientId).toBe("shane-preview");
    expect(sent[0]?.creatorResult).toEqual({
      score: 1,
      perfect: false,
      fatalId: leader.id,
      eliminated: [leader.id],
    });
    expect(sent[0]?.responderResult).toBeNull();
    expect(sent[0]?.completedAt).toBeNull();

    const storedSetup = sent[0]?.setup as unknown as {
      day: string;
      board: { leaderId: string; candidates: Array<{ id: string }> };
    };
    expect(storedSetup.day).toBe(board.day);
    expect(storedSetup.board.leaderId).toBe(board.leaderId);
    expect(storedSetup.board.candidates.map((fighter) => fighter.id))
      .toEqual(board.candidates.map((fighter) => fighter.id));

    creatorView.unmount();
    window.localStorage.setItem(PROFILE_STORAGE_KEY, "shane-preview");

    const recipientView = renderWithChallenges(
      <FindLeaderChallengeRoute />,
      `/play/find-leader?challenge=${sent[0]!.code}&day=${day}`,
    );

    expect(screen.getByText("Cody sent this exact board.")).toBeTruthy();
    const opened = loadChallenges(window.localStorage);
    expect(opened[0]?.openedAt).not.toBeNull();
    expect(opened[0]?.responderResult).toBeNull();

    fireEvent.click(leaderButton(recipientView.container, leader.name)!);
    const completed = loadChallenges(window.localStorage);
    expect(completed[0]?.responderResult).toEqual({
      score: 1,
      perfect: false,
      fatalId: leader.id,
      eliminated: [leader.id],
    });
    expect(completed[0]?.completedAt).not.toBeNull();

    recipientView.unmount();
    window.localStorage.setItem(PROFILE_STORAGE_KEY, "cody-preview");
    renderWithChallenges(<ChallengeCenter />, "/play");

    expect(screen.getByText(/Shane · Find the Leader/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "RESULTS" }));
    expect(screen.getByRole("dialog", { name: "Find the Leader" })).toBeTruthy();
    expect(screen.getByText("Tie game")).toBeTruthy();
    expect(screen.getAllByText("1/10")).toHaveLength(2);
    expect(screen.getAllByText("ELIMINATION ORDER")).toHaveLength(2);
    expect(screen.getAllByText("LEADER")).toHaveLength(2);
    expect(screen.getAllByText(leader.name).length).toBeGreaterThanOrEqual(2);
  });

  it("shows the shared All, Received, and Sent views for the active preview profile", () => {
    const rows = [{
      code: "CENTER01",
      gameId: "find-leader",
      gameVersion: "find-leader-v2",
      gameTitle: "Find the Leader",
      summary: "Who has the most UFC wins?",
      creatorId: "cody-preview",
      recipientId: "shane-preview",
      setup: { day: "2026-07-24" },
      creatorResult: { score: 8 },
      responderResult: null,
      createdAt: "2026-07-24T12:00:00.000Z",
      openedAt: null,
      completedAt: null,
      expiresAt: "2026-08-23T12:00:00.000Z",
    }];
    window.localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(rows));

    renderWithChallenges(<ChallengeCenter />, "/play");
    expect(screen.getByRole("tab", { name: "ALL 1" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "RECEIVED 0" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "SENT 1" })).toBeTruthy();
    expect(screen.getByText("WAITING")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("PREVIEWING AS"), { target: { value: "shane-preview" } });
    expect(screen.getByRole("tab", { name: "RECEIVED 1" })).toBeTruthy();
    expect(screen.getByText(/Cody · Find the Leader/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "PLAY" })).toBeTruthy();
  });
});
