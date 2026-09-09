// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "./IdentityProvider";
import type { IdentityGateway } from "./identityGateway";
import type { IdentityProfile } from "./identityModel";
import { OwnerOnlyRoute } from "./OwnerOnlyRoute";

afterEach(cleanup);

const userId = "11111111-1111-4111-8111-111111111111";

function gatewayFor(profile: IdentityProfile): IdentityGateway {
  return {
    getSession: vi.fn(async () => ({ userId })),
    subscribe: vi.fn(() => vi.fn()),
    loadProfile: vi.fn(async () => profile),
    signIn: vi.fn(),
    createProfile: vi.fn(),
    signOut: vi.fn(),
  };
}

function renderAccess(path: string, fallback: string, canControlPicks: boolean) {
  const profile: IdentityProfile = {
    id: userId,
    displayName: canControlPicks ? "CODY" : "SHANE",
    initials: canControlPicks ? "C" : "S",
    canControlPicks,
  };

  render(
    <IdentityProvider gateway={gatewayFor(profile)}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path={path}
            element={(
              <OwnerOnlyRoute fallback={fallback}>
                <h1>Private Game</h1>
              </OwnerOnlyRoute>
            )}
          />
          <Route path={fallback} element={<h1>Public Play</h1>} />
        </Routes>
      </MemoryRouter>
    </IdentityProvider>,
  );
}

const ownerOnlyRoutes = [
  ["/play/20-questions", "/play"],
  ["/football/20-questions", "/football"],
  ["/play/who-am-i", "/play"],
  ["/football/who-am-i", "/football"],
] as const;

describe("OwnerOnlyRoute", () => {
  it.each(ownerOnlyRoutes)("redirects a non-owner from %s", async (path, fallback) => {
    renderAccess(path, fallback, false);
    expect(await screen.findByRole("heading", { name: "Public Play" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Private Game" })).not.toBeInTheDocument();
  });

  it.each(ownerOnlyRoutes)("keeps owner access to %s", async (path, fallback) => {
    renderAccess(path, fallback, true);
    expect(await screen.findByRole("heading", { name: "Private Game" })).toBeInTheDocument();
  });
});
