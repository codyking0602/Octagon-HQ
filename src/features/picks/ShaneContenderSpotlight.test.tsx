import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { shanesWatchlist } from "../home/shanesWatchlist";
import { MainEventSpotlight } from "./MainEventSpotlight";
import type { PickBout, PickEventSpotlight } from "./picksModel";

const bilalBout: PickBout = {
  boutId: "bilal-hasan-nilson-rojas",
  position: 4,
  weightClass: "Flyweight",
  redFighterSlug: "bilal-hasan",
  redFighterName: "Bilal Hasan",
  blueFighterSlug: "nilson-rojas",
  blueFighterName: "Nilson Rojas",
  redAmericanOdds: null,
  blueAmericanOdds: null,
  winnerFighterSlug: null,
};

const normalBout: PickBout = {
  boutId: "future-red-future-blue",
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

const normalSpotlight: PickEventSpotlight = {
  boutId: normalBout.boutId,
  preview: "A normal matchup without a Shane contender.",
  red: {
    fighterSlug: "future-red",
    record: "8-1-0",
    age: "27",
    height: "6' 0\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: [],
  },
  blue: {
    fighterSlug: "future-blue",
    record: "11-3-0",
    age: "31",
    height: "5' 10\"",
    reach: "72\"",
    stance: "Southpaw",
    edges: [],
  },
  watchSpotlights: [],
  source: "UFCStats",
  generatedAt: "2026-08-24T00:00:00.000Z",
};

const salkilldBout: PickBout = {
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

describe("Shane Contender Fight Spotlight treatment", () => {
  it("wires Bilal Hasan directly to an editorial Spotlight with his current Shane rank badge", () => {
    const bilal = shanesWatchlist.fighters.find((fighter) => fighter.id === "bilal-hasan");
    expect(bilal).toBeDefined();

    render(
      <MemoryRouter>
        <MainEventSpotlight bout={bilalBout} />
      </MemoryRouter>,
    );

    expect(screen.getByText("FIGHT SPOTLIGHT")).toBeInTheDocument();
    expect(screen.getByText("SHANE’S CONTENDER SERIES · #5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));

    expect(screen.getAllByText("SHANE’S CONTENDER SERIES · #5")).toHaveLength(2);
    expect(screen.getAllByText(/45-second Contender Series contract win/)).toHaveLength(2);
    expect(screen.getByText("7 KO/TKO wins in 9 fights")).toBeInTheDocument();
    expect(screen.getByText(bilal!.whyOnBoard)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VIEW SHANE’S SCOUTING PROFILE →" })).toHaveAttribute(
      "href",
      "/fighters-to-watch#bilal-hasan",
    );
  });

  it("does not add Shane treatment to a matchup with no fighter on the canonical board", () => {
    render(
      <MemoryRouter>
        <MainEventSpotlight bout={normalBout} spotlight={normalSpotlight} />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText("Shane King’s Contender Series fighters")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));
    expect(screen.queryByLabelText("Shane King’s Contender Series")).not.toBeInTheDocument();
  });

  it("is data-driven for another fighter already on Shane’s canonical board", () => {
    render(
      <MemoryRouter>
        <MainEventSpotlight bout={salkilldBout} />
      </MemoryRouter>,
    );

    expect(screen.getByText("SHANE’S CONTENDER SERIES · #2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /View matchup breakdown/i }));
    expect(screen.getAllByText("SHANE’S CONTENDER SERIES · #2")).toHaveLength(2);
  });
});
