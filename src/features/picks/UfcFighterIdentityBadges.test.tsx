import { describe, it, expect } from "vitest";
import { render,screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { UfcFighterIdentityBadges } from "./UfcFighterIdentityBadges";
import { shanesWatchlist } from "../home/shanesWatchlist";
import { getFighter } from "../rankings/rankingModel";
describe("UFC Picks independent fighter identity links",()=>{
  it("links an HQ-ranked fighter to their existing profile",()=>{
    const fighter=getFighter("jon-jones");
    expect(fighter).toBeDefined();
    render(<MemoryRouter><UfcFighterIdentityBadges slug="jon-jones" /></MemoryRouter>);
    expect(screen.getByRole("link",{name:/Jon Jones HQ Rankings profile/i}))
      .toHaveAttribute("href","/rankings?fighter=jon-jones");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("links the temporary SKCS test fighter to the existing scouting overlay",()=>{
    const fighter=shanesWatchlist.fighters.find(f=>f.id==="quillan-salkilld");
    expect(fighter?.rank).toBe(1);
    render(<MemoryRouter><UfcFighterIdentityBadges slug="quillan-salkilld" /></MemoryRouter>);
    expect(screen.getByRole("link",{name:/Quillan Salkilld SKCS scouting profile/i}))
      .toHaveAttribute("href","/fighters-to-watch#quillan-salkilld");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("adds no badge or invented link for an unlisted fighter",()=>{
    const {container}=render(<MemoryRouter><UfcFighterIdentityBadges slug="not-on-either-board" /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
  });
});
