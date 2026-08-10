import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MainEventSpotlight } from "./MainEventSpotlight";
import type { PickBout, PickEventSpotlight } from "./picksModel";

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

const futureBout: PickBout = {
  boutId: "main-future-red-future-blue",
  position: 3,
  weightClass: "Featherweight",
  redFighterSlug: "future-red",
  redFighterName: "Future Red",
  blueFighterSlug: "future-blue",
  blueFighterName: "Future Blue",
  redAmericanOdds: null,
  blueAmericanOdds: null,
  winnerFighterSlug: null,
};

const generated: PickEventSpotlight = {
  boutId: futureBout.boutId,
  preview: "Future Red brings the higher striking volume while Future Blue answers with the stronger wrestling rate and takedown defense.",
  red: {
    fighterSlug: "future-red",
    record: "8-1-0",
    age: "27",
    height: "6' 0\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: ["5.1 significant strikes landed/min", '3\" reach advantage'],
  },
  blue: {
    fighterSlug: "future-blue",
    record: "11-3-0",
    age: "31",
    height: "5' 10\"",
    reach: "72\"",
    stance: "Southpaw",
    edges: ["3.2 takedowns per 15 min", "79% takedown defense"],
  },
  watchSpotlights: [
    { fighterSlug: "future-red", url: "https://youtu.be/future-red" },
    { fighterSlug: "future-blue", url: "https://youtu.be/future-blue" },
  ],
  source: "UFCStats",
  generatedAt: "2026-08-10T00:00:00.000Z",
};

afterEach(cleanup);

describe("MainEventSpotlight", () => {
  it("keeps the legacy Gamrot-Salkilld breakdown when no generated package exists", () => {
    const { container } = render(<MainEventSpotlight bout={bout} />);

    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));

    const dialog = screen.getByRole("dialog", { name: "Mateusz Gamrot vs. Quillan Salkilld" });
    const modal = dialog.closest(".main-event-spotlight-modal");
    expect(modal?.parentElement).toBe(document.body);
    expect(container.querySelector(".main-event-spotlight-modal")).toBeNull();
    expect(screen.getByText("9-4 UFC")).toBeInTheDocument();
    expect(screen.getByText("Chain wrestling and mat returns")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GAMROT SPOTLIGHT ↗" })).toHaveAttribute(
      "href",
      "https://youtu.be/a6B2uVbD10U?si=9V8KK6f6uNN65g-L",
    );
  });

  it("renders the complete generated package for any selected fight", () => {
    render(<MainEventSpotlight bout={futureBout} spotlight={generated} />);

    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));

    expect(screen.getByRole("dialog", { name: "Future Red vs. Future Blue" })).toBeInTheDocument();
    expect(screen.getByText("FIGHT SPOTLIGHT · FEATHERWEIGHT")).toBeInTheDocument();
    expect(screen.getByText(generated.preview)).toBeInTheDocument();
    expect(screen.getByText("TALE OF THE TAPE")).toBeInTheDocument();
    expect(screen.getByText("8-1-0")).toBeInTheDocument();
    expect(screen.getByText("11-3-0")).toBeInTheDocument();
    expect(screen.getByText("MATCHUP EDGES")).toBeInTheDocument();
    expect(screen.getByText("5.1 significant strikes landed/min")).toBeInTheDocument();
    expect(screen.getByText("3.2 takedowns per 15 min")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RED SPOTLIGHT ↗" })).toHaveAttribute("href", "https://youtu.be/future-red");
    expect(screen.getByRole("link", { name: "BLUE SPOTLIGHT ↗" })).toHaveAttribute("href", "https://youtu.be/future-blue");
  });
});
