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

function renderFootball() {
  return render(
    <MemoryRouter initialEntries={["/football/sports-feud"]}>
      <FamilyFeudPrototypePage scope="football" />
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

function settleRoundResultReveal() {
  for (let step = 0; step < 4; step += 1) {
    act(() => {
      vi.advanceTimersByTime(320);
    });
  }
}

function reachRoundTwo() {
  fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));
  for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
    submitMainAndSettle(answer);
  }
  settleRoundResultReveal();
  fireEvent.click(screen.getByRole("button", { name: "ROUND 2" }));
}

function reachFastMoney() {
  reachRoundTwo();
  for (const answer of ["Philip Rivers", "Tony Romo", "Joe Flacco"]) {
    submitMainAndSettle(answer);
  }
  settleRoundResultReveal();
  fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
  fireEvent.click(screen.getByRole("button", { name: "START 45 SECONDS" }));
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

  it("shows board results without a separate also-accepted text pool", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
      submitMainAndSettle(answer);
    }

    expect(screen.queryByText("BOARD RESULTS")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(2);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(3);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(document.querySelectorAll(".feud-answer-slot.is-revealed")).toHaveLength(4);
    expect(screen.getByText("BOARD RESULTS")).toBeInTheDocument();
    expect(screen.getByText("3 STRIKES — BOARD CLOSED")).toBeInTheDocument();
    expect(screen.queryByText("ALSO ACCEPTED")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".feud-answer-slot.is-missed")).toHaveLength(4);
    expect(document.querySelectorAll(".feud-answer-slot.is-round-result-reveal")).toHaveLength(1);
  });

  it("reveals a lower-ranked accepted pick on the live board and keeps it in board results", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "PLAY SPORTS FEUD" }));

    submitMainAnswer("Amari Cooper");
    expect(document.querySelector(".family-feud-prototype")).toHaveAttribute("data-main-reveal", "suspense");
    expect(screen.queryByText("Amari Cooper")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(screen.getByText("Amari Cooper")).toBeInTheDocument();
    expect(screen.getByText("Amari Cooper").closest(".feud-answer-slot")).toHaveClass("is-new-reveal");

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(document.querySelectorAll(".feud-strikes .is-on")).toHaveLength(0);
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");

    for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
      submitMainAndSettle(answer);
    }
    settleRoundResultReveal();

    expect(screen.getByText("BOARD RESULTS")).toBeInTheDocument();
    const board = document.querySelector(".feud-answer-board");
    expect(board).toHaveTextContent("CeeDee Lamb");
    expect(board).toHaveTextContent("Micah Parsons");
    expect(board).toHaveTextContent("Dak Prescott");
    expect(board).toHaveTextContent("Trevon Diggs");
    expect(board).not.toHaveTextContent("Amari Cooper");
    expect(document.querySelectorAll(".feud-answer-slot.is-round-result-reveal")).toHaveLength(1);
    expect(screen.queryByText("ALSO ACCEPTED")).not.toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");
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
    expect(document.querySelector(".feud-fast-host-asset")).toBeInTheDocument();
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
