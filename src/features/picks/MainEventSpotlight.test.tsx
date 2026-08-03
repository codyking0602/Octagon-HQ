import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MainEventSpotlight } from "./MainEventSpotlight";
import type { PickBout } from "./picksModel";

const bout: PickBout = {
  boutId: "gamrot-salkilld",
  position: 1,
  weightClass: "Lightweight",
  redFighterSlug: "mateusz-gamrot",
  redFighterName: "Mateusz Gamrot",
  blueFighterSlug: "quillan-salkilld",
  blueFighterName: "Quillan Salkilld",
  redAmericanOdds: -300,
  blueAmericanOdds: 250,
  winnerFighterSlug: null,
};

afterEach(cleanup);

describe("MainEventSpotlight", () => {
  it("opens the Gamrot-Salkilld breakdown above app chrome with both fighter spotlights on one row", () => {
    const { container } = render(<MainEventSpotlight bout={bout} />);

    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));

    const dialog = screen.getByRole("dialog", { name: "Mateusz Gamrot vs. Quillan Salkilld" });
    const modal = dialog.closest(".main-event-spotlight-modal");

    expect(modal).not.toBeNull();
    expect(modal?.parentElement).toBe(document.body);
    expect(container.querySelector(".main-event-spotlight-modal")).toBeNull();
    expect(screen.getByText("9-4 UFC")).toBeInTheDocument();
    expect(screen.getByText("5-0 UFC")).toBeInTheDocument();
    expect(screen.getByText("Chain wrestling and mat returns")).toBeInTheDocument();
    expect(screen.getByText("First-round finishing threat")).toBeInTheDocument();

    const gamrotSpotlight = screen.getByRole("link", { name: "GAMROT SPOTLIGHT ↗" });
    const salkilldSpotlight = screen.getByRole("link", { name: "SALKILLD SPOTLIGHT ↗" });

    expect(gamrotSpotlight).toHaveAttribute(
      "href",
      "https://youtu.be/a6B2uVbD10U?si=9V8KK6f6uNN65g-L",
    );
    expect(salkilldSpotlight).toHaveAttribute(
      "href",
      "https://youtu.be/Kjq4Jz1XuiI?si=QJdJ5ozZpi-oUy4l",
    );
    expect(gamrotSpotlight.parentElement).toHaveStyle({
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    });
  });
});
