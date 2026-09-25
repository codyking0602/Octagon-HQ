import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MillionaireCasualPage from "../play/MillionaireCasualPage";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "owner", displayName: "Cody", initials: "CK", canControlPicks: true },
  }),
}));

afterEach(() => cleanup());

// Anything exercised here is owner-review content and must stay out of the production bank.
describe("MLB Millionaire owner run", () => {
  it("uses the live Millionaire wrapper with MLB playoff identity and no review language", () => {
    render(
      <MemoryRouter>
        <MillionaireCasualPage scope="mlb" />
      </MemoryRouter>,
    );

    expect(document.body.textContent).toContain("MLB PLAYOFF CHALLENGE");
    expect(document.body.textContent).toContain("MILLIONAIRE");
    expect(document.body.textContent).not.toMatch(/preview|demo|test|tuning|prototype/i);

    fireEvent.click(screen.getByRole("button", { name: /start game/i }));

    const stage = document.body.querySelector<HTMLImageElement>(".millionaire-stage-background");
    const host = document.body.querySelector<HTMLImageElement>(".millionaire-stage-host");
    expect(stage).toBeTruthy();
    expect(stage?.getAttribute("src")).toBe("/assets/millionaire/wide_cinematic_studio_shot_of_a_game_show_set_with.png");
    expect(host?.getAttribute("src")).toBe("/assets/millionaire/1mlb.webp");
    expect(document.body.querySelector(".millionaire-stage-host-slot--mlb")).toBeTruthy();
    expect(document.body.querySelector(".millionaire-shell--fixed-stage")).toBeTruthy();
    expect(document.body.textContent).toContain("MLB PLAYOFF CHALLENGE");
  });
});
