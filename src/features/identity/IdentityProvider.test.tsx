import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider, useIdentity } from "./IdentityProvider";
import type { IdentityGateway, IdentitySession } from "./identityGateway";
import type { IdentityProfile } from "./identityModel";

afterEach(cleanup);

function Probe() {
  const identity = useIdentity();
  return (
    <div>
      <span data-testid="status">{identity.status}</span>
      <span data-testid="profile">{identity.profile?.displayName ?? "NONE"}</span>
      <button type="button" onClick={() => void identity.signIn("cody", "1234")}>LOGIN</button>
      <button type="button" onClick={() => void identity.createProfile("shane", "2468")}>CREATE</button>
      <button type="button" onClick={() => void identity.signOut()}>LOGOUT</button>
    </div>
  );
}

function fakeGateway() {
  let session: IdentitySession | null = null;
  let profile: IdentityProfile | null = null;
  let listener: (session: IdentitySession | null) => void = () => undefined;

  const gateway: IdentityGateway = {
    getSession: vi.fn(async () => session),
    subscribe: vi.fn((nextListener) => {
      listener = nextListener;
      return vi.fn();
    }),
    loadProfile: vi.fn(async () => profile),
    signIn: vi.fn(async (displayName, pin) => {
      expect(displayName).toBe("CODY");
      expect(pin).toBe("1234");
      session = { userId: "11111111-1111-4111-8111-111111111111" };
      profile = { id: session.userId, displayName: "CODY", initials: "C" };
      listener(session);
    }),
    createProfile: vi.fn(async (displayName, pin) => {
      expect(displayName).toBe("SHANE");
      expect(pin).toBe("2468");
      session = { userId: "22222222-2222-4222-8222-222222222222" };
      profile = { id: session.userId, displayName: "SHANE", initials: "S" };
      listener(session);
    }),
    signOut: vi.fn(async () => {
      session = null;
      profile = null;
      listener(null);
    }),
  };

  return gateway;
}

describe("canonical identity owner", () => {
  it("resolves once, normalizes login input, and publishes one cached profile", async () => {
    const gateway = fakeGateway();
    render(<IdentityProvider gateway={gateway}><Probe /></IdentityProvider>);

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("signed-out"));
    expect(gateway.subscribe).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "LOGIN" }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("CODY"));
    expect(screen.getByTestId("status")).toHaveTextContent("ready");
    expect(gateway.signIn).toHaveBeenCalledWith("CODY", "1234");

    fireEvent.click(screen.getByRole("button", { name: "LOGOUT" }));
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("signed-out"));
    expect(screen.getByTestId("profile")).toHaveTextContent("NONE");
  });

  it("creates a profile through the same owner instead of a second onboarding account", async () => {
    const gateway = fakeGateway();
    render(<IdentityProvider gateway={gateway}><Probe /></IdentityProvider>);
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("signed-out"));

    fireEvent.click(screen.getByRole("button", { name: "CREATE" }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("SHANE"));
    expect(gateway.createProfile).toHaveBeenCalledWith("SHANE", "2468");
  });

  it("finishes startup honestly when Supabase is not configured", () => {
    render(<IdentityProvider gateway={null}><Probe /></IdentityProvider>);
    expect(screen.getByTestId("status")).toHaveTextContent("unconfigured");
  });
});
