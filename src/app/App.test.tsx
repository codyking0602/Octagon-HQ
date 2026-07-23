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

  it("renders all calculated men's and women's ranking boards", async () => {
    renderRoute("/rankings");

    expect(await screen.findByRole("heading", { name: "Greatest UFC fighters" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jon Jones/i })).toHaveAttribute("href", "/fighters/jon-jones");
    expect(screen.getByRole("link", { name: /Matt Hughes/i })).toBeInTheDocument();
    expect(screen.getByText("65", { selector: ".ranking-board-tabs span" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Women/ }));
    expect(screen.getByRole("link", { name: /Amanda Nunes/i })).toBeInTheDocument();
    expect(screen.getByText("15", { selector: ".ranking-board-tabs span" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Jon Jones/i })).not.toBeInTheDocument();
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
