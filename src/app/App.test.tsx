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

  it("renders uniform calculated boards with isolated Watch Moment actions", async () => {
    renderRoute("/rankings");

    expect(await screen.findByRole("heading", { name: "UFC All-Time P4P" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Jon Jones profile" })).toHaveAttribute(
      "href",
      "/fighters/jon-jones",
    );
    expect(screen.getByRole("link", { name: "View Matt Hughes profile" })).toBeInTheDocument();

    const watchMoment = screen.getByRole("link", {
      name: "Watch Jon Jones moment on YouTube",
    });
    expect(watchMoment).toHaveAttribute(
      "href",
      "https://youtube.com/shorts/yG-D2r6HVp4?is=fstX4Wc_rvCITSw0",
    );
    expect(watchMoment).toHaveAttribute("target", "_blank");

    fireEvent.change(screen.getByLabelText("Ranking board"), { target: { value: "women" } });
    expect(screen.getByRole("heading", { name: "UFC Women's All-Time" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Amanda Nunes profile" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "View Jon Jones profile" })).not.toBeInTheDocument();
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
