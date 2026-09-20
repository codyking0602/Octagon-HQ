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

import FamilyFeudPrototypePage, { isFamilyFeudPrototypeOwner } from "./FamilyFeudPrototypePage";

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

describe("Family Feud playable prototype", () => {
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

  it("allows only the Cody owner profile into the prototype", () => {
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

  it("plays a correct board answer through the blind text matcher", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    expect(screen.getByText(/most passing TDs in the 2025 NFL season/i)).toBeInTheDocument();
    submitMainAnswer("Matthew Stafford");

    expect(screen.getByText("Matthew Stafford")).toBeInTheDocument();
    expect(screen.getByText("#1 — 30 POINTS")).toBeInTheDocument();
    expect(document.querySelector(".feud-main-score strong")).toHaveTextContent("30");
  });

  it("moves from two main boards into the separate Fast Money location", () => {
    renderFootball();
    fireEvent.click(screen.getByRole("button", { name: "START FEUD" }));

    submitMainAnswer("Patrick Mahomes");
    submitMainAnswer("Josh Allen");
    submitMainAnswer("Bo Nix");

    expect(screen.getByText("ROUND COMPLETE")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ROUND 2" }));
    expect(screen.getByText(/most rushing yards in the 2025 NFL season/i)).toBeInTheDocument();

    submitMainAnswer("Tom Brady");
    submitMainAnswer("Emmitt Smith");
    submitMainAnswer("Barry Sanders");

    fireEvent.click(screen.getByRole("button", { name: "GO TO FAST MONEY" }));
    expect(screen.getByText("YOU MADE THE FINALE")).toBeInTheDocument();
    expect(screen.getByText("0:30")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "START 30 SECONDS" }));
    expect(screen.getByText("1 OF 5")).toBeInTheDocument();
    expect(screen.getByLabelText("Fast Money answer")).toBeInTheDocument();
  });
});
