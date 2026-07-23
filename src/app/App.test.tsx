import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";

afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe("Octagon HQ V2", () => {
  it("opens on Home without temporary or restricted product copy", async () => {
    renderRoute("/");

    expect(await screen.findByRole("heading", { name: "Welcome to Octagon HQ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(screen.queryByText("V2")).not.toBeInTheDocument();
    expect(screen.queryByText("Foundation active", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByText("War Room")).not.toBeInTheDocument();
  });

  it("renders the compact calculated P4P board with abbreviated divisions", async () => {
    renderRoute("/rankings");

    expect(await screen.findByRole("heading", { name: "UFC All-Time P4P" })).toBeInTheDocument();
    expect(screen.getByText("The definitive pound-for-pound rankings.")).toBeInTheDocument();
    expect(screen.queryByText(/UFC-only/i)).not.toBeInTheDocument();

    const summary = screen.getByLabelText("P4P ranking summary");
    expect(summary).toHaveTextContent("65");

    const jonProfile = screen.getByRole("link", { name: "View Jon Jones profile" });
    expect(jonProfile).toHaveAttribute("href", "/fighters/jon-jones");
    expect(jonProfile).toHaveTextContent("22-1, 1 NC UFC · LHW / HW");
    expect(screen.getByRole("link", { name: "View Matt Hughes profile" })).toBeInTheDocument();

    const watchMoment = screen.getByRole("link", {
      name: "Watch Jon Jones moment on YouTube",
    });
    expect(watchMoment).toHaveAttribute(
      "href",
      "https://youtube.com/shorts/yG-D2r6HVp4?is=fstX4Wc_rvCITSw0",
    );
    expect(watchMoment).toHaveAttribute("target", "_blank");
  });

  it("switches among Women, Divisions, and Categories with direct ranking tabs", async () => {
    const router = renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });
    const tabs = within(screen.getByRole("navigation", { name: "Ranking boards" }));

    fireEvent.click(tabs.getByRole("button", { name: "Women" }));
    expect(screen.getByRole("heading", { name: "UFC Women's All-Time" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Jon Jones profile" })).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=women");

    fireEvent.click(tabs.getByRole("button", { name: "Divisions" }));
    expect(screen.getByRole("heading", { name: "Division Rankings" })).toBeInTheDocument();
    expect(screen.queryByText(/at least 10% of their calculated UFC resume/i)).not.toBeInTheDocument();
    const stipe = screen.getByRole("link", { name: "View Stipe Miocic profile" });
    expect(stipe).toHaveTextContent("14-5 UFC · #11 P4P");
    expect(stipe).not.toHaveTextContent("RESUME");
    expect(stipe).not.toHaveTextContent("100%");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=division&division=Heavyweight");

    fireEvent.click(tabs.getByRole("button", { name: "Categories" }));
    expect(screen.getByRole("heading", { name: "Category Leaders" })).toBeInTheDocument();
    const jon = screen.getByRole("link", { name: "View Jon Jones profile" });
    expect(jon).toHaveTextContent("CHAMP");
    expect(jon).not.toHaveTextContent("OVR");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=category&category=championship&gender=men");

    const categoryGender = within(screen.getByRole("group", { name: "Category leaderboard" }));
    fireEvent.click(categoryGender.getByRole("button", { name: "Women" }));
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Jon Jones profile" })).not.toBeInTheDocument();
  });

  it("restores V1 era descriptions and makes defining fights obviously actionable", async () => {
    renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });

    const eraSelect = screen.getByLabelText("Ranking era");
    fireEvent.change(eraSelect, {
      target: { value: "golden-age" },
    });

    expect(eraSelect).toHaveDisplayValue("Golden Age · 2011–2015");
    const eraCard = screen.getByLabelText("Golden Age context");
    expect(within(eraCard).getByText("Golden Age · 2011–2015")).toBeInTheDocument();
    expect(within(eraCard).getByText(/deep champion class, lighter divisions/i)).toBeInTheDocument();
    const definingFight = screen.getByRole("link", {
      name: "Watch defining fight: Jon Jones vs. Alexander Gustafsson I",
    });
    expect(definingFight).toHaveAttribute("target", "_blank");
    expect(definingFight).toHaveTextContent("Watch fight");
    expect(screen.getByRole("link", { name: "View Jon Jones profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Khabib Nurmagomedov profile" })).not.toBeInTheDocument();
  });

  it("keeps P4P and Women filters to an era row and a compact search row", async () => {
    renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });

    const search = screen.getByPlaceholderText("Search 65 fighters");
    fireEvent.change(search, { target: { value: "Matt Hughes" } });
    expect(screen.getByLabelText("P4P ranking summary")).toHaveTextContent("1");
    expect(screen.getByRole("link", { name: "View Matt Hughes profile" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear ranking filters" }));
    expect(search).toHaveValue("");
    expect(screen.getByLabelText("P4P ranking summary")).toHaveTextContent("65");
    expect(screen.queryByRole("button", { name: "Clear ranking filters" })).not.toBeInTheDocument();
  });

  it("supports direct contextual ranking URLs", async () => {
    renderRoute("/rankings?view=category&category=opponentQuality&gender=women");

    expect(await screen.findByRole("heading", { name: "Category Leaders" })).toBeInTheDocument();
    expect(screen.getByText("Opponent Quality Wins · Women")).toBeInTheDocument();
    const categoryGender = within(screen.getByRole("group", { name: "Category leaderboard" }));
    expect(categoryGender.getByRole("button", { name: "Women" })).toHaveClass("is-active");
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
  });

  it("renders the hybrid fighter profile without photo overlays or raw model mechanics", async () => {
    renderRoute("/fighters/jon-jones");

    expect(await screen.findByRole("heading", { name: "Jon Jones" })).toBeInTheDocument();
    const photoCard = screen.getByLabelText("Jon Jones profile photo");
    expect(photoCard).toHaveTextContent("");
    expect(screen.getByLabelText("99 overall rating")).toBeInTheDocument();
    expect(screen.getByText("22-1, 1 NC UFC")).toBeInTheDocument();
    expect(screen.getByText("LHW / HW")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share Jon Jones profile" })).toBeInTheDocument();

    const actions = within(screen.getByRole("navigation", { name: "Jon Jones profile actions" }));
    expect(actions.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/intelligence?mode=compare&fighter=jon-jones",
    );
    expect(actions.getByRole("link", { name: "Ask Why" })).toHaveAttribute("href", "#why-ranked-here");
    expect(actions.getByRole("link", { name: /Watch (Signature Fight|Moment)/ })).toHaveAttribute(
      "target",
      "_blank",
    );

    expect(screen.getByText("UFC Title-Fight Wins")).toBeInTheDocument();
    expect(screen.getByText("Top-5 Wins")).toBeInTheDocument();
    expect(screen.getByText("Prime UFC Record")).toBeInTheDocument();
    expect(screen.getByText("Active Elite Years")).toBeInTheDocument();

    const championship = screen.getByRole("button", { name: /Championship Resume/ });
    expect(championship).toHaveTextContent("99");
    fireEvent.click(championship);
    expect(screen.getByRole("heading", { name: "Championship Resume: 99 rating" })).toBeInTheDocument();
    expect(screen.getByText("Adjusted title wins")).toBeInTheDocument();

    expect(screen.queryByText("KEY JUDGMENT CALLS")).not.toBeInTheDocument();
    expect(screen.queryByText("Era depth")).not.toBeInTheDocument();
    expect(screen.queryByText(/division multiplier/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Model 101/i)).not.toBeInTheDocument();
    expect(screen.getByText(/He cannot rank higher/i)).toBeInTheDocument();
    expect(screen.queryByText(/fighters above Jon Jones/i)).not.toBeInTheDocument();
  });

  it("supports direct profiles outside the former ten-fighter scaffold", async () => {
    renderRoute("/fighters/matt-hughes");

    expect(await screen.findByRole("heading", { name: "Matt Hughes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How the résumé wins" })).toBeInTheDocument();
    expect(screen.getByText("WHY NOT RANKED HIGHER?")).toBeInTheDocument();
  });

  it("keeps unfinished destinations isolated", async () => {
    renderRoute("/play");
    expect(await screen.findByRole("heading", { name: "Play" })).toBeInTheDocument();
  });
});
