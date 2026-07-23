import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";

describe("Octagon HQ foundation", () => {
  it("opens on Home and keeps War Room undiscoverable", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/"] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(await screen.findByRole("heading", { name: "Welcome to Octagon HQ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your HQ" })).toBeInTheDocument();
    expect(screen.queryByText("War Room")).not.toBeInTheDocument();
  });

  it("loads a destination through its own route", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/play"] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(await screen.findByRole("heading", { name: "Play" })).toBeInTheDocument();
  });
});
