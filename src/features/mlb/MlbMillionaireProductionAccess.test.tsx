import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MillionaireCasualPage from "../play/MillionaireCasualPage";
import { MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03 } from "./mlbMillionaireProduction";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "member", displayName: "Member", initials: "M", canControlPicks: false },
  }),
}));

afterEach(() => cleanup());

describe("MLB Millionaire production access", () => {
  it("lets a signed-in non-owner play the scheduled production run without opening Casual access", () => {
    render(
      <MemoryRouter>
        <MillionaireCasualPage
          scope="mlb"
          accessMode="production"
          runOverride={MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /start game/i }));

    expect(document.body.textContent).toContain(MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03[0]!.prompt);
    expect(document.body.querySelector(".millionaire-shell--mlb")).toBeTruthy();
    expect(document.body.querySelector(".millionaire-stage-background")?.getAttribute("src"))
      .toBe("/assets/millionaire/ABD98D28-955F-4D95-B067-89E3D512952C.png");
  });
});
