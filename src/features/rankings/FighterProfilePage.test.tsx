import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";
import { categoryBoard } from "./rankingControls";
import { categoryDisplayRating } from "./rankingDisplay";
import { getFighter } from "./rankingModel";

afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<AppProviders><RouterProvider router={router} /></AppProviders>);
  return router;
}

describe("fighter profile hybrid cards", () => {
  it("keeps the fighter photo clean and moves identity and share outside it", async () => {
    renderRoute("/fighters/jon-jones");
    const photo = await screen.findByLabelText("Jon Jones clean fighter photo");
    expect(within(photo).queryByText("Jon Jones")).not.toBeInTheDocument();
    expect(within(photo).queryByText("OVR")).not.toBeInTheDocument();
    expect(within(photo).queryByText("22-1, 1 NC")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Jon Jones" })).not.toBe(photo);
    expect(screen.getByText("#1 UFC All-Time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  it("renders action links and calculated six-stat resume", async () => {
    renderRoute("/fighters/jon-jones");
    expect(await screen.findByRole("link", { name: "Compare" })).toHaveAttribute("href", "/intelligence?compare=jon-jones");
    expect(screen.getByRole("link", { name: "Ask Why" })).toHaveAttribute("href", "#why-ranked-here");
    expect(screen.getByRole("link", { name: "Watch Signature Fight" })).toHaveAttribute("target", "_blank");
    ["UFC record", "UFC title-fight wins", "Top-5 wins", "Prime UFC record", "Rounds won", "Active elite years"].forEach((label) => expect(screen.getAllByText(label).length).toBeGreaterThan(0));
  });

  it("uses category leaderboard display ratings and expands only one category", async () => {
    renderRoute("/fighters/jon-jones");
    await screen.findByRole("heading", { name: "Jon Jones" });
    const fighter = getFighter("jon-jones")!;
    const expected = categoryDisplayRating("men", "championship", fighter);
    const rank = categoryBoard("men", "championship").findIndex((row) => row.slug === fighter.slug) + 1;
    const champ = screen.getByRole("button", { name: new RegExp(`Championship Resume\\s+${expected}#${rank}`) });
    fireEvent.click(champ);
    expect(champ).toHaveAttribute("aria-expanded", "true");
    const opponent = screen.getByRole("button", { name: /Opponent Quality Wins/ });
    fireEvent.click(opponent);
    expect(champ).toHaveAttribute("aria-expanded", "false");
    expect(opponent).toHaveAttribute("aria-expanded", "true");
  });

  it("removes raw model mechanics and special-cases Jon Jones as a board number one", async () => {
    renderRoute("/fighters/jon-jones");
    await screen.findByRole("heading", { name: "Jon Jones" });
    expect(screen.queryByText(/Key Judgment Calls/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Model \d/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/division multiplier|era-depth|raw score|weighted score|Peak Apex \+/i)).not.toBeInTheDocument();
    expect(screen.getByText(/He cannot rank higher/)).toBeInTheDocument();
    expect(screen.queryByText(/fighters above Jon Jones/i)).not.toBeInTheDocument();
  });

  it("renders profiles outside the original small scaffold with a watch moment fallback", async () => {
    renderRoute("/fighters/matt-hughes");
    expect(await screen.findByRole("heading", { name: "Matt Hughes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch Moment" })).toHaveAttribute("target", "_blank");
  });
});
