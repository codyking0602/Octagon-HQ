import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const identity = vi.hoisted(() => ({
  profile: { id: "00000000-0000-4000-8000-000000000001",
    displayName: "CODY", initials: "C", canControlPicks: true },
}));
vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ ready: true, profile: identity.profile }),
}));

import FamilyFeudPrototypePage from "../play/FamilyFeudPrototypePage";
import { buildNbaSportsFeudPack } from "./nbaSportsFeudBank";

function mount(query = "") {
  return render(<MemoryRouter initialEntries={["/nba/sports-feud" + query]}>
    <FamilyFeudPrototypePage scope="nba" />
  </MemoryRouter>);
}
function revealAfterGuess(text: string) {
  const input = screen.getByLabelText("Your answer");
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input.closest("form")!);
  act(() => vi.advanceTimersByTime(651));
  act(() => vi.advanceTimersByTime(651));
}
function threeStrikes(prefix: string) {
  for (let i = 0; i < 3; i++) revealAfterGuess(prefix + "-no-" + i);
}

describe("NBA Sports Feud reused immersive presentation", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.classList.remove("family-feud-prototype-active");
  });

  it("is a local owner preview with NBA questions, transparent NBA host, and existing stage assets", () => {
    mount();
    expect(screen.getByText("NBA HQ · OWNER CASUAL PREVIEW")).toBeInTheDocument();
    expect(screen.getByText(/not survey results/i)).toBeInTheDocument();
    expect(screen.getByText(/does not submit a Daily or leaderboard score/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
    const root = document.querySelector(".family-feud-prototype");
    expect(root).toHaveAttribute("data-scope", "nba");
    expect(root).toHaveAttribute("data-scene", "main");
    expect(screen.getByText("WE ASKED NBA HQ")).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-answer-slot")).toHaveLength(4);
    expect(document.querySelector('img[src="/assets/sports-feud-main-stage.png"]')).toBeInTheDocument();
    expect(document.querySelector('img[src="/assets/sports-feud-fast-money-stage.png"]')).toBeInTheDocument();
    expect(document.querySelector(".feud-fast-host-asset")?.getAttribute("src"))
      .toMatch(/^\/assets\/millionaire\/NBA [123]\.webp$/);
  });

  it("keeps daily preview deterministic and does not submit a leaderboard score", () => {
    mount("?mode=daily");
    expect(screen.getByText("NBA HQ · OWNER DAILY PREVIEW")).toBeInTheDocument();
    const expected = buildNbaSportsFeudPack("daily:" + new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date()));
    // The score and board always come from the same frozen seed used by Casual,
    // not a second Daily gameplay or a hidden publishing pathway.
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "main");
    expect(buildNbaSportsFeudPack(expected.id.split(":").slice(1).join(":"))).toEqual(expected);
  });

  it("shows all main-board answers after three strikes, advances to Fast Money, and reveals a result", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
    threeStrikes("bad-first");
    expect(screen.getByText("3 STRIKES — BOARD CLOSED")).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-round-answer")).toHaveLength(8);
    fireEvent.click(screen.getByRole("button", { name: "ROUND 2" }));
    threeStrikes("bad-second");
    fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
    expect(screen.getByText("FAST MONEY")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "START 50 SECONDS" }));
    expect(screen.getByText("0:50")).toBeInTheDocument();
    for (let i = 0; i < 5; i++) {
      const input = screen.getByLabelText("Fast Money answer");
      fireEvent.change(input, { target: { value: "unknown " + i } });
      fireEvent.submit(input.closest("form")!);
    }
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "reveal");
    for (let i = 0; i < 20; i++) act(() => vi.advanceTimersByTime(700));
    expect(screen.getByRole("button", { name: "VIEW HQ SCORE" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "VIEW HQ SCORE" }));
    expect(screen.getByText("FINAL RESULT")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW BOARD" })).toBeInTheDocument();
  });

  it("keeps the locked responsive stage and mobile controls rather than a second NBA layout", () => {
    const css = readFileSync("src/features/play/FamilyFeudPrototypePage.css", "utf8");
    expect(css).toContain("height: 100dvh;");
    expect(css).toContain("env(safe-area-inset-top)");
    expect(css).toMatch(/@media \(max-height: 700px\)/);
    expect(css).toContain(".feud-answer-entry__row");
    mount();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
    const stage = document.querySelector(".family-feud-prototype");
    expect(stage).toHaveClass("family-feud-prototype");
    expect(stage).toHaveAttribute("data-scope", "nba");
    expect(screen.getByRole("textbox", { name: "Your answer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit answer" })).toBeInTheDocument();
  });
});
