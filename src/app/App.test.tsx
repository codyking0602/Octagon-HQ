import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";

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

  it("renders the real rankings board through its own route", async () => {
    renderRoute("/rankings");

    expect(await screen.findByRole("heading", { name: "Greatest UFC fighters" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Jon Jones/i })).toHaveAttribute("href", "/fighters/jon-jones");
    expect(screen.getByRole("link", { name: /Kamaru Usman/i })).toBeInTheDocument();
  });

  it("supports direct fighter profile routes", async () => {
    renderRoute("/fighters/jon-jones");

    expect(await screen.findByRole("heading", { name: "Jon Jones" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Category breakdown" })).toBeInTheDocument();
    expect(screen.getByText("WHY NOT RANKED HIGHER?")).toBeInTheDocument();
  });

  it("keeps unfinished destinations isolated", async () => {
    renderRoute("/play");
    expect(await screen.findByRole("heading", { name: "Play" })).toBeInTheDocument();
  });
});
