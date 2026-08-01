import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { ProfilePreferencesProvider } from "../profile/ProfilePreferencesProvider";
import { IdentityControl } from "./IdentityControl";
import { IdentityProvider } from "./IdentityProvider";
import type { IdentityGateway } from "./identityGateway";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
});

function Providers({ children, gateway = null }: { children: React.ReactNode; gateway?: IdentityGateway | null }) {
  return (
    <MemoryRouter initialEntries={["/picks/monitoring"]}>
      <IdentityProvider gateway={gateway}>
        <ProfilePreferencesProvider repository={null}>
          {children}
        </ProfilePreferencesProvider>
      </IdentityProvider>
    </MemoryRouter>
  );
}

function RouteHarness() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <IdentityControl />
      <button type="button" onClick={() => navigate("/")}>MOVE HOME</button>
      <output data-testid="current-path">{location.pathname}</output>
    </>
  );
}

describe("IdentityControl", () => {
  it("portals the dialog to document.body and locks page scrolling", () => {
    const { container } = render(
      <Providers>
        <IdentityControl />
      </Providers>,
    );

    fireEvent.click(screen.getByRole("button", { name: /sign in to octagon hq/i }));

    const dialog = screen.getByRole("dialog", { name: /get into hq/i });
    expect(document.body.contains(dialog)).toBe(true);
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toHaveClass("identity-overlay--viewport");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /close profile dialog/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("returns to the route where sign-in was opened", async () => {
    let signedIn = false;
    const gateway: IdentityGateway = {
      getSession: async () => signedIn ? { userId: "11111111-1111-4111-8111-111111111111" } : null,
      subscribe: () => () => undefined,
      loadProfile: async () => ({
        id: "11111111-1111-4111-8111-111111111111",
        displayName: "CODY",
        initials: "CK",
      }),
      signIn: async () => {
        signedIn = true;
      },
      createProfile: async () => {
        signedIn = true;
      },
      signOut: async () => {
        signedIn = false;
      },
    };

    render(
      <Providers gateway={gateway}>
        <RouteHarness />
      </Providers>,
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /sign in to octagon hq/i })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: /sign in to octagon hq/i }));
    fireEvent.click(screen.getByRole("button", { name: "MOVE HOME" }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/");

    fireEvent.change(screen.getByPlaceholderText("CODY"), { target: { value: "CODY" } });
    fireEvent.change(screen.getByPlaceholderText("••••"), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: "ENTER HQ" }));

    await waitFor(() => expect(screen.getByTestId("current-path")).toHaveTextContent("/picks/monitoring"));
  });
});
