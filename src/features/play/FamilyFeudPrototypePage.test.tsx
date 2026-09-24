import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const identityHarness = vi.hoisted(() => ({
  profile: {
    id: "00000000-0000-4000-8000-000000000001",
    displayName: "CODY",
    initials: "C",
    canControlPicks: true,
  } as {
    id: string;
    displayName: string;
    initials: string;
    canControlPicks?: boolean;
  } | null,
}));

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    ready: true,
    profile: identityHarness.profile,
  }),
}));

import FamilyFeudPrototypePage from "./FamilyFeudPrototypePage";
import { isFamilyFeudPrototypeOwner } from "./familyFeudPrototypeAccess";
import { buildSportsFeudPack } from "./sportsFeudDailyBanks";

function renderFootball() {
  return render(
    <MemoryRouter initialEntries={["/football/sports-feud"]}>
      <FamilyFeudPrototypePage scope="football" />
    </MemoryRouter>,
  );
}

function renderUfcQaReplay() {
  return render(
    <MemoryRouter initialEntries={["/play/sports-feud/qa-replay"]}>
      <FamilyFeudPrototypePage scope="ufc" qaReplayDay="2026-09-24" />
    </MemoryRouter>,
  );
}

function submitMainAnswer(value: string) {
  const input = screen.getByLabelText("Your answer");
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest("form")!);
}

function settleMainReveal() {
  act(() => {
    vi.advanceTimersByTime(650);
  });
  act(() => {
    vi.advanceTimersByTime(650);
  });
}

function submitMainAndSettle(value: string) {
  submitMainAnswer(value);
  settleMainReveal();
}

function reachRoundTwo() {
  fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
  for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
    submitMainAndSettle(answer);
  }
  fireEvent.click(screen.getByRole("button", { name: "ROUND 2" }));
}

function reachFastMoney() {
  reachRoundTwo();
  for (const answer of ["Philip Rivers", "Tony Romo", "Joe Flacco"]) {
    submitMainAndSettle(answer);
  }
  fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
  fireEvent.click(screen.getByRole("button", { name: "START 50 SECONDS" }));
}

function submitFastMoneyAnswer(value: string) {
  const input = screen.getByLabelText("Fast Money answer");
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest("form")!);
}

function submitPerfectFastMoney() {
  for (const answer of [
    "Myles Garrett",
    "Tyreek Hill",
    "Cam Newton",
    "Derrick Henry",
    "Calvin Johnson",
  ]) {
    submitFastMoneyAnswer(answer);
  }
}

describe("Sports Feud private daily presentation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    identityHarness.profile = {
      id: "00000000-0000-4000-8000-000000000001",
      displayName: "CODY",
      initials: "C",
      canControlPicks: true,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.classList.remove("family-feud-prototype-active");
  });

  it("allows only the CODY owner profile into the prototype", () => {
    expect(isFamilyFeudPrototypeOwner(identityHarness.profile)).toBe(true);
    expect(isFamilyFeudPrototypeOwner({
      id: "00000000-0000-4000-8000-000000000002",
      displayName: "TEST",
      initials: "T",
      canControlPicks: true,
    })).toBe(false);
    expect(isFamilyFeudPrototypeOwner({
      id: "00000000-0000-4000-8000-000000000003",
      displayName: "CODY",
      initials: "C",
      canControlPicks: false,
    })).toBe(false);

    identityHarness.profile = {
      id: "00000000-0000-4000-8000-000000000002",
      displayName: "TEST",
      initials: "T",
      canControlPicks: true,
    };
    renderFootball();
    expect(screen.queryByRole("button", { name: "PLAY SPORTS FEUD" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass("family-feud-prototype-active");
  });

  it("replays the Sept. 24 UFC question set locally against the repaired bank", () => {
    const expected = buildSportsFeudPack("ufc", "2026-09-24");
    renderUfcQaReplay();

    expect(screen.getByText("UFC HQ · OWNER QA REPLAY")).toBeInTheDocument();
    expect(screen.getByText(/writes no Daily result or leaderboard score/i)).toBeInTheDocument();
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute(
      "data-qa-replay-day",
      "2026-09-24",
    );

    fireEvent.click(screen.getByRole("button", { name: "REPLAY SEPT 24 FEUD" }));
    expect(screen.getByText(expected.mainBoards[0]!.prompt)).toBeInTheDocument();
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "main");
  });

  it("uses production Daily Challenge language without preview-only controls", () => {
    renderFootball();
    expect(screen.getByText("FOOTBALL HQ · DAILY CHALLENGE")).toBeInTheDocument();
    expect(screen.queryByText(/PRIVATE PREVIEW/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TRY UFC VERSION/i)).not.toBeInTheDocument();
  });

  it("presents numbered four-answer tiles inside the immersive studio", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    expect(screen.getByText("WE ASKED FOOTBALL HQ")).toBeInTheDocument();
    expect(screen.getByText(/most electric Cowboys players of the 2020s/i)).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-answer-slot")).toHaveLength(4);
    expect(document.querySelectorAll(".feud-answer-slot > b")).toHaveLength(4);
    expect(document.querySelectorAll(".feud-fast-host-asset")).toHaveLength(1);
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "main");
    expect(document.querySelector('img[src="/assets/sports-feud-main-stage.png"]')).toBeInTheDocument();
    expect(document.querySelector(".feud-answer-board")).toBeInTheDocument();
    expect(document.querySelector(".feud-strikes")).toBeInTheDocument();
  });

  it("holds an accepted main answer in suspense before the tile reveal, then restores input", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    submitMainAnswer("Dak Prescott");

    const root = document.querySelector(".family-feud-prototype");
    expect(root).toHaveAttribute("data-main-reveal", "suspense");
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
    expect(screen.queryByText("Dak Prescott")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(root).toHaveAttribute("data-main-reveal", "correct");
    expect(screen.getByText("Dak Prescott")).toBeInTheDocument();
    expect(screen.getByText("Dak Prescott").closest(".feud-answer-slot")).toHaveClass("is-new-reveal");
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(root).toHaveAttribute("data-main-reveal", "idle");
    expect(screen.getByLabelText("Your answer")).toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("7");
  });

  it("slams a stage-level X on a wrong answer, increments the strike rail, then restores input", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    submitMainAnswer("DeMarcus Lawrence");
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(screen.getByLabelText("Strike")).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-strikes .is-on")).toHaveLength(1);
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(screen.queryByLabelText("Strike")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toBeInTheDocument();
  });

  it("asks for specificity on an ambiguous answer without striking or dropping the input", () => {
    renderFootball();
    reachRoundTwo();

    submitMainAnswer("Manning");

    expect(screen.getByText("BE MORE SPECIFIC")).toBeInTheDocument();
    expect(screen.getByLabelText("Your answer")).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-strikes .is-on")).toHaveLength(0);
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-main-reveal", "idle");
  });

  it("keeps the live board untouched and opens a separate accepted-answer panel after the round", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
      submitMainAndSettle(answer);
    }

    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(0);
    expect(document.querySelectorAll(".feud-answer-slot.is-missed")).toHaveLength(0);
    const results = screen.getByLabelText("Round 1 accepted answers");
    expect(results).toBeInTheDocument();
    expect(results).toHaveTextContent("CeeDee Lamb");
    expect(results).toHaveTextContent("Tony Pollard");
    expect(screen.getByText("3 STRIKES — BOARD CLOSED")).toBeInTheDocument();
    expect(screen.queryByText("ALSO ACCEPTED")).not.toBeInTheDocument();
  });

  it("keeps a lower-ranked accepted pick on the live board and shows the full bank separately", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    submitMainAnswer("Amari Cooper");
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-main-reveal", "suspense");

    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(screen.getByText("Amari Cooper")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");

    for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
      submitMainAndSettle(answer);
    }

    const board = document.querySelector(".feud-answer-board");
    expect(board).toHaveTextContent("Amari Cooper");
    expect(board).not.toHaveTextContent("CeeDee Lamb");
    expect(document.querySelectorAll(".feud-answer-slot.is-missed")).toHaveLength(0);

    const results = screen.getByLabelText("Round 1 accepted answers");
    expect(results).toHaveTextContent("CeeDee Lamb");
    expect(results).toHaveTextContent("Amari Cooper");
    expect(results.querySelectorAll(".feud-round-answer.is-found")).toHaveLength(1);
    expect(screen.queryByText("ALSO ACCEPTED")).not.toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");
  });

  it("does not replace four accepted Round 2 answers with a fake missed answer", () => {
    renderFootball();
    reachRoundTwo();

    for (const answer of ["Tom Brady", "Aaron Rodgers", "Drew Brees", "Peyton Manning"]) {
      submitMainAndSettle(answer);
    }

    const board = document.querySelector(".feud-answer-board");
    expect(board).toHaveTextContent("Tom Brady");
    expect(board).toHaveTextContent("Aaron Rodgers");
    expect(board).toHaveTextContent("Drew Brees");
    expect(board).toHaveTextContent("Peyton Manning");
    expect(board).not.toHaveTextContent("Patrick Mahomes");
    expect(document.querySelectorAll(".feud-answer-slot.is-missed")).toHaveLength(0);

    const results = screen.getByLabelText("Round 2 accepted answers");
    expect(results).toHaveTextContent("Patrick Mahomes");
    expect(results).toHaveTextContent("Peyton Manning");
    expect(screen.getByText("BOARD CLEARED")).toBeInTheDocument();
  });

  it("keeps Fast Money rapid-fire with the input available between answers and points hidden", () => {
    renderFootball();
    reachFastMoney();

    const initialInput = screen.getByLabelText("Fast Money answer");
    fireEvent.change(initialInput, { target: { value: "Myles Garrett" } });
    expect(initialInput).toHaveValue("Myles Garrett");
    fireEvent.submit(initialInput.closest("form")!);

    expect(screen.getByText("2 OF 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBe(initialInput);
    expect(screen.queryByText("+8")).not.toBeInTheDocument();
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "fast");
    expect(document.querySelector(".feud-fast-host-asset")).not.toBeInTheDocument();
  });

  it("accepts the broadened Fast Money pool and common short-name aliases", () => {
    renderFootball();
    reachFastMoney();

    submitFastMoneyAnswer("Myles Garrett");
    submitFastMoneyAnswer("Davante Adams");
    submitFastMoneyAnswer("Johnny Manziel");
    submitFastMoneyAnswer("Adrian");

    expect(screen.getByText("5 OF 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBeInTheDocument();
  });

  it("reveals Fast Money answers and scores sequentially with a running total", () => {
    renderFootball();
    reachFastMoney();
    submitPerfectFastMoney();

    const root = document.querySelector(".family-feud-prototype");
    expect(root).toHaveAttribute("data-scene", "reveal");
    expect(screen.queryByLabelText("Fast Money answer")).not.toBeInTheDocument();
    expect(screen.queryByText(/Myles Garrett/i)).not.toBeInTheDocument();
    expect(document.querySelector(".feud-fast-score-reveal")).not.toBeInTheDocument();
    expect(document.querySelector(".feud-fast-reveal-board")).toBeInTheDocument();
    expect(screen.getByLabelText("Running Fast Money total")).toHaveTextContent("0");

    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(screen.getByText(/Myles Garrett/i)).toBeInTheDocument();
    expect(document.querySelector(".feud-fast-reveal-row.is-current")).toHaveClass("is-revealed");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByLabelText("Running Fast Money total")).toHaveTextContent("8");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/must-watch TV/i)).toBeInTheDocument();
    expect(screen.queryByText("Tyreek Hill")).not.toBeInTheDocument();
    expect(document.querySelector(".feud-fast-reveal-row.is-current")).not.toHaveClass("is-revealed");

    act(() => {
      vi.advanceTimersByTime(650);
    });
    expect(screen.getByText("Tyreek Hill")).toBeInTheDocument();
    expect(document.querySelector(".feud-fast-reveal-row.is-current")).toHaveClass("is-revealed");
  });

  it("shows the HQ accepted-answer recap only after all five Fast Money scores finish revealing", () => {
    renderFootball();
    reachFastMoney();
    submitPerfectFastMoney();

    expect(screen.queryByText("HQ ANSWERS")).not.toBeInTheDocument();

    for (let step = 0; step < 9; step += 1) {
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    expect(screen.getByText("Calvin Johnson")).toBeInTheDocument();
    expect(document.querySelector(".feud-fast-reveal-row.is-current")).toHaveClass("is-revealed");
    expect(screen.queryByText("HQ ANSWERS")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.queryByText("HQ ANSWERS")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });

    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-scene", "fast-recap");
    expect(screen.getByText("HQ ANSWERS")).toBeInTheDocument();
    expect(screen.getByText("Myles Garrett")).toBeInTheDocument();
    expect(screen.getByText("T.J. Watt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "VIEW HQ SCORE" })).toBeInTheDocument();
  });
});
