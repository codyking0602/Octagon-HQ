import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { UfcFighterIdentityBadges } from "./UfcFighterIdentityBadges";
import { MainEventSpotlight } from "./MainEventSpotlight";
import type { PickBout } from "./picksModel";

afterEach(cleanup);
describe("Independent UFC SKCS and HQ profile badges", () => {
  it("opens SKCS scouting without selecting a fighter", () => {
    const select = vi.fn();
    render(<MemoryRouter><div>
      <button type="button" onClick={select}>Pick Quillan</button>
      <UfcFighterIdentityBadges slug="quillan-salkilld" />
    </div></MemoryRouter>);
    const badge = screen.getByRole("link", { name: /Open Quillan Salkilld SKCS scouting profile/ });
    expect(badge).toHaveTextContent("SKCS #1");
    expect(badge).toHaveAttribute("href", "/fighters-to-watch#quillan-salkilld");
    fireEvent.click(badge);
    expect(select).not.toHaveBeenCalled();
  });

  it("does not require a matchup breakdown to reach the scouting profile", () => {
    const bout: PickBout = {
      boutId: "jon-quillan-qa", position: 6, weightClass: "Lightweight",
      redFighterSlug: "jon-jones", redFighterName: "Jon Jones",
      blueFighterSlug: "quillan-salkilld", blueFighterName: "Quillan Salkilld",
      redAmericanOdds: null, blueAmericanOdds: null, winnerFighterSlug: null,
    };
    render(<MemoryRouter>
      <UfcFighterIdentityBadges slug="quillan-salkilld" />
      <MainEventSpotlight bout={bout} />
    </MemoryRouter>);
    expect(screen.getByRole("link", { name: /SKCS scouting profile/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /View matchup breakdown/ })).not.toBeInTheDocument();
  });

  it("has no badge without an existing canonical fighter record", () => {
    render(<MemoryRouter><UfcFighterIdentityBadges slug="unknown-qa-fighter" /></MemoryRouter>);
    expect(screen.queryByRole("navigation", { name: "Fighter profile links" })).not.toBeInTheDocument();
  });

  it("links HQ-ranked fighters directly to their existing ranking profile", () => {
    render(<MemoryRouter><UfcFighterIdentityBadges slug="jon-jones" /></MemoryRouter>);
    const badge = screen.getByRole("link", { name: /HQ Rankings profile/ });
    expect(badge).toHaveAttribute("href", "/fighters/jon-jones");
    expect(badge).toHaveTextContent(/HQ #/);
  });
});
