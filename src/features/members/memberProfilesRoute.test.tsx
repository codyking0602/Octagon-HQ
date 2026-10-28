import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";

afterEach(cleanup);

describe("Member Profiles routing", () => {
  it("supports the direct member directory route with an honest signed-out state", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/members"] });
    render(<AppProviders><RouterProvider router={router} /></AppProviders>);
    expect(await screen.findByRole("heading", { name: "Member Profiles" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in to view the member directory" })).toBeInTheDocument();
  });

  it("supports direct member profile routes without exposing a fake public profile", async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ["/members/SHANE"] });
    render(<AppProviders><RouterProvider router={router} /></AppProviders>);
    expect(await screen.findByRole("heading", { name: "Sign in to view member profiles" })).toBeInTheDocument();
    expect(screen.queryByText("SHANE", { exact: true })).not.toBeInTheDocument();
  });
});
