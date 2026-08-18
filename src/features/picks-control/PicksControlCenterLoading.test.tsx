import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickSetupDraft } from "../picks-setup/pickSetupModel";
import type { PickSetupRepository } from "../picks-setup/pickSetupRepository";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";
import PicksControlCenterPage from "./PicksControlCenterPage";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: owner.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => owner,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function controlRepository(loadControlEvent: PickControlRepository["loadControlEvent"]): PickControlRepository {
  return {
    loadControlEvent,
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function setupRepository(loadDraft: PickSetupRepository["loadDraft"]): PickSetupRepository {
  return {
    loadDraft,
    syncNextEvent: vi.fn().mockResolvedValue(undefined),
    previewSource: vi.fn(),
    applySourcePreview: vi.fn().mockResolvedValue(undefined),
    updateMetadata: vi.fn().mockResolvedValue(undefined),
    saveBout: vi.fn().mockResolvedValue(undefined),
    removeBout: vi.fn().mockResolvedValue(undefined),
    reorderBouts: vi.fn().mockResolvedValue(undefined),
    publishDraft: vi.fn().mockResolvedValue(undefined),
    discardDraft: vi.fn().mockResolvedValue(undefined),
  };
}

afterEach(cleanup);

describe("Picks Control Center loading ownership", () => {
  it("does not mount a hidden Open Picks loader or expose Event Setup before canonical state resolves", async () => {
    const controlLoad = deferred<PickControlEvent | null>();
    const draftLoad = deferred<PickSetupDraft | null>();
    const loadControlEvent = vi.fn(() => controlLoad.promise);
    const loadDraft = vi.fn(() => draftLoad.promise);

    render(
      <MemoryRouter initialEntries={["/picks/control"]}>
        <IdentityProvider gateway={gateway()}>
          <PicksControlCenterPage
            controlRepository={controlRepository(loadControlEvent)}
            setupRepository={setupRepository(loadDraft)}
            monitoringRepository={null}
          />
        </IdentityProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(loadControlEvent).toHaveBeenCalledTimes(1);
      expect(loadDraft).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("LOADING CONTROL CENTER")).toBeInTheDocument();
    expect(screen.queryByText(/Loading Open Picks/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "OPEN EVENT SETUP" })).not.toBeInTheDocument();

    controlLoad.resolve(null);
    expect(await screen.findByText("CHECKING NEXT EVENT")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "OPEN EVENT SETUP" })).not.toBeInTheDocument();

    draftLoad.resolve(null);
    expect(await screen.findByRole("link", { name: "OPEN EVENT SETUP" })).toHaveAttribute("href", "#setup");
    expect(screen.getByRole("region", { name: "Event setup" })).toBeInTheDocument();
    expect(loadControlEvent).toHaveBeenCalledTimes(1);
    expect(loadDraft).toHaveBeenCalledTimes(1);
  });
});
