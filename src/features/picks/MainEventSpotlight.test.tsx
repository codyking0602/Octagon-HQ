import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MainEventSpotlight } from "./MainEventSpotlight";
import type { PickBout } from "./picksModel";

const bout: PickBout = {
  boutId: "medic-rodriguez",
  position: 1,
  weightClass: "Welterweight",
  redFighterSlug: "uros-medic",
  redFighterName: "Uroš Medić",
  blueFighterSlug: "daniel-rodriguez",
  blueFighterName: "Daniel Rodriguez",
  redAmericanOdds: -150,
  blueAmericanOdds: 130,
  winnerFighterSlug: null,
};

afterEach(cleanup);

describe("MainEventSpotlight", () => {
  it("portals the open matchup dialog to the viewport layer above app chrome", () => {
    const { container } = render(<MainEventSpotlight bout={bout} />);

    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));

    const dialog = screen.getByRole("dialog", { name: "Uroš Medić vs. Daniel Rodriguez" });
    const modal = dialog.closest(".main-event-spotlight-modal");

    expect(modal).not.toBeNull();
    expect(modal?.parentElement).toBe(document.body);
    expect(container.querySelector(".main-event-spotlight-modal")).toBeNull();
  });
});
