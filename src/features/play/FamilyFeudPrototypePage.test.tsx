import { fireEvent, render, screen } from "@testing-library/react";
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

describe("Sports Feud V2 private prototype", () => {
  beforeEach(() => {
    identityHarness.profile = {
      id: "00000000-0000-4000-8000-000000000001",
      displayName: "CODY",
      initials: "C",
      canControlPicks: true,
    };
  });

  afterEach(() => {
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
    expect(screen.queryByRole("button", { name: "START FEUD" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveClass("family-feud-prototype-active");
  });

  it("presents the four-answer HQ-opinion board inside the immersive studio", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    expect(screen.getByText("WE ASKED FOOTBALL HQ")).toBeInTheDocument();
    expect(screen.getByText(/most electric Cowboys players of the 2020s/i)).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-answer-slot")).toHaveLength(4);
    expect(document.querySelector('img[src="/assets/sports-feud-main-stage.png"]')).toBeInTheDocument();
    expect(document.querySelector(".feud-answer-board")).toBeInTheDocument();
    expect(document.querySelector(".feud-strikes")).toBeInTheDocument();
  });

  it("accepts a lower-value good answer and banks its editorial point value", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    submitMainAnswer("Amari Cooper");

    expect(screen.getByText("Amari Cooper")).toBeInTheDocument();
    expect(screen.getByText("+4 HQ POINTS")).toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");
  });

  it("reveals key missed HQ answers after three strikes without subtracting banked points", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    submitMainAnswer("Amari Cooper");
    submitMainAnswer("DeMarcus Lawrence");
    submitMainAnswer("Zack Martin");
    submitMainAnswer("Dalton Schultz");

    expect(screen.getByText("3 STRIKES — BOARD CLOSED")).toBeInTheDocument();
    expect(screen.getByText(/4\/30 HQ points banked/i)).toBeInTheDocument();
    expect(screen.getByText("CeeDee Lamb")).toBeInTheDocument();
    expect(screen.getByText("Micah Parsons")).toBeInTheDocument();
    expect(screen.getByText("Dak Prescott")).toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("4");
  });

  it("moves through two boards into the 45-second hosted Fast Money studio", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    for (const answer of ["DeMarcus Lawrence", "Zack Martin", "Dalton Schultz"]) {
      submitMainAnswer(answer);
    }

    fireEvent.click(screen.getByRole("button", { name: "ROUND 2" }));
    expect(screen.getByText(/QBs from the 2010s would you want down 4 late/i)).toBeInTheDocument();

    for (const answer of ["Philip Rivers", "Tony Romo", "Joe Flacco"]) {
      submitMainAnswer(answer);
    }

    fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
    expect(screen.getByText("YOU MADE THE FINALE")).toBeInTheDocument();
    expect(screen.getByText("0:45")).toBeInTheDocument();
    const introHost = document.querySelector(".feud-fast-host-asset") as HTMLImageElement | null;
    expect(introHost).toBeInTheDocument();
    expect(introHost?.getAttribute("src")).toMatch(/^\/assets\/[123]nfl\.png$/);
    expect(document.querySelector('img[src="/assets/sports-feud-fast-money-stage.png"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START 45 SECONDS" }));
    expect(screen.getByText("1 OF 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBeInTheDocument();
    expect(screen.queryByText(/\+[0-9]+ HQ POINTS/)).not.toBeInTheDocument();
    expect(document.querySelector(".feud-fast-showdown .feud-fast-host-asset")).toBeInTheDocument();
    expect(document.querySelectorAll(".feud-fast-board-progress > div")).toHaveLength(5);
  });
});
