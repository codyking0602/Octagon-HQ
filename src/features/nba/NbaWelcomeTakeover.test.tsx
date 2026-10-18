import { beforeEach,describe,expect,it,vi } from "vitest";
import { fireEvent,render,screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NbaWelcomeTakeover,nbaWelcomeKey,NBA_WELCOME_REOPEN_EVENT } from "./NbaWelcomeTakeover";
describe("NBA two-stage welcome",()=>{
  beforeEach(()=>{window.localStorage.clear();document.body.style.overflow=""});
  it("starts with approved artwork and a real CSS-rendered continue button",()=>{
    render(<MemoryRouter><NbaWelcomeTakeover profileId="owner" /></MemoryRouter>);
    expect(screen.getByRole("img")).toHaveAttribute("src","/assets/nba/basketball-welcome.png");
    expect(screen.getByRole("button",{name:/continue/i})).toBeInTheDocument();
    expect(screen.queryByText(/start with nba futures/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:/continue/i}));
    expect(screen.getAllByText(/NBA FUTURES/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button",{name:/open nba futures/i})).toBeInTheDocument();
  });
  it("acknowledges per profile and supports reviewing it again",()=>{
    const r=render(<MemoryRouter><NbaWelcomeTakeover profileId="owner" /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button",{name:/continue/i}));
    fireEvent.click(screen.getByRole("button",{name:/explore the hq later/i}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(nbaWelcomeKey("owner"))).toBe("dismissed");
    window.dispatchEvent(new Event(NBA_WELCOME_REOPEN_EVENT));
    expect(screen.getByRole("button",{name:/continue/i})).toBeInTheDocument();
    r.unmount();
    render(<MemoryRouter><NbaWelcomeTakeover profileId="other" /></MemoryRouter>);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
