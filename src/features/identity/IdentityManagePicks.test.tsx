import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProfilePreferencesProvider } from "../profile/ProfilePreferencesProvider";
import { IdentityControl } from "./IdentityControl";
import { IdentityProvider } from "./IdentityProvider";
import type { IdentityGateway } from "./identityGateway";

const profileId = "11111111-1111-4111-8111-111111111111";

function gateway(canManagePicks: boolean): IdentityGateway {
  return {
    getSession: async () => ({ userId: profileId }),
    subscribe: () => () => undefined,
    loadProfile: async () => ({
      id: profileId,
      displayName: "CODY",
      initials: "CK",
      canManagePicks,
    }),
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function renderControl(canManagePicks: boolean) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={gateway(canManagePicks)}>
        <ProfilePreferencesProvider repository={null}>
          <IdentityControl />
        </ProfilePreferencesProvider>
      </IdentityProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

describe("Manage Picks profile entry", () => {
  it("shows the canonical Control Center setup route to the Picks owner", async () => {
    renderControl(true);

    fireEvent.click(await screen.findByRole("button", { name: "Open CODY profile menu" }));

    expect(screen.getByRole("link", { name: "MANAGE PICKS" })).toHaveAttribute(
      "href",
      "/picks/control#setup",
    );
  });

  it("does not expose Manage Picks to a non-owner profile named CODY", async () => {
    renderControl(false);

    fireEvent.click(await screen.findByRole("button", { name: "Open CODY profile menu" }));

    expect(screen.queryByRole("link", { name: "MANAGE PICKS" })).not.toBeInTheDocument();
  });
});
