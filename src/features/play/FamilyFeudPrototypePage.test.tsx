import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import FamilyFeudPrototypePage from "./FamilyFeudPrototypePage";

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
  afterEach(() => {
    document.body.classList.remove("family-feud-prototype-active");
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
