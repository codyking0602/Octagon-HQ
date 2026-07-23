import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

  it("renders the compact calculated P4P board with isolated Watch Moment actions", async () => {
    renderRoute("/rankings");

    expect(await screen.findByRole("heading", { name: "UFC All-Time P4P" })).toBeInTheDocument();
    expect(screen.getByText("The definitive pound-for-pound rankings.")).toBeInTheDocument();
    expect(screen.queryByText(/UFC-only/i)).not.toBeInTheDocument();

    const summary = screen.getByLabelText("P4P ranking summary");
    expect(summary).toHaveTextContent("65");
    expect(summary).toHaveTextContent("fighters");

    const jonProfile = screen.getByRole("link", { name: "View Jon Jones profile" });
    expect(jonProfile).toHaveAttribute("href", "/fighters/jon-jones");
    expect(jonProfile).toHaveTextContent("22-1, 1 NC · LHW / HW");
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

  it("switches among Women, Divisions, and Categories without changing route ownership", async () => {
    const router = renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });

    fireEvent.change(screen.getByLabelText("Ranking board"), { target: { value: "women" } });
    expect(screen.getByRole("heading", { name: "UFC Women's All-Time" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Jon Jones profile" })).not.toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=women");

    fireEvent.change(screen.getByLabelText("Ranking board"), { target: { value: "division" } });
    expect(screen.getByRole("heading", { name: "Heavyweight Rankings" })).toBeInTheDocument();
    expect(screen.getByText(/at least 10% of their calculated UFC resume/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Stipe Miocic profile" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=division&division=Heavyweight");

    fireEvent.change(screen.getByLabelText("Ranking board"), { target: { value: "category" } });
    expect(screen.getByRole("heading", { name: "Championship Resume Leaders" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Jon Jones profile" })).toBeInTheDocument();
    expect(router.state.location.search).toBe("?view=category&category=championship&gender=men");

    fireEvent.click(screen.getByRole("button", { name: "Women" }));
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Jon Jones profile" })).not.toBeInTheDocument();
  });

  it("filters by the pinned V1 eras while preserving all-time ranks", async () => {
    renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });

    fireEvent.change(screen.getByLabelText("Ranking era"), {
      target: { value: "golden-age" },
    });

    expect(screen.getByText(/Showing fighters assigned to Golden Age/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Jon Jones profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Khabib Nurmagomedov profile" })).not.toBeInTheDocument();
  });

  it("searches the active board and conditionally clears optional filters", async () => {
    renderRoute("/rankings");
    await screen.findByRole("heading", { name: "UFC All-Time P4P" });

    const search = screen.getByPlaceholderText("Search fighters");
    fireEvent.change(search, { target: { value: "Matt Hughes" } });
    expect(screen.getByLabelText("P4P ranking summary")).toHaveTextContent("1");
    expect(screen.getByRole("link", { name: "View Matt Hughes profile" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(search).toHaveValue("");
    expect(screen.getByLabelText("P4P ranking summary")).toHaveTextContent("65");
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("supports direct contextual ranking URLs", async () => {
    renderRoute("/rankings?view=category&category=opponentQuality&gender=women");

    expect(
      await screen.findByRole("heading", { name: "Opponent Quality Wins Leaders" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Women" })).toHaveClass("is-active");
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
  });

  it("supports direct profiles outside the former ten-fighter scaffold", async () => {
    renderRoute("/fighters/matt-hughes");

    expect(await screen.findByRole("heading", { name: "Matt Hughes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Category breakdown" })).toBeInTheDocument();
    expect(screen.getByText("WHY NOT RANKED HIGHER?")).toBeInTheDocument();
  });

  it("keeps unfinished destinations isolated", async () => {
    renderRoute("/play");
    expect(await screen.findByRole("heading", { name: "Play" })).toBeInTheDocument();
  });
});
