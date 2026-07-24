import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "../../app/providers";
import { appRoutes } from "../../app/router";
import { OCTAGON_VERDICT_URL, matchupPrompt, whyPromptFor } from "./intelligence";
import { getFighter } from "../rankings/rankingModel";

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Octagon Verdict Intelligence flow", () => {
  it("keeps Intelligence in the header and out of primary navigation", async () => {
    renderRoute("/");
    expect(await screen.findByRole("link", { name: "Ask Octagon Verdict" })).toHaveAttribute("href", "/intelligence");

    const primary = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(primary).getAllByRole("link")).toHaveLength(4);
    ["Home", "Rankings", "Play", "Picks"].forEach((label) => expect(within(primary).getByRole("link", { name: label })).toBeInTheDocument());
    expect(within(primary).queryByText("Intelligence")).not.toBeInTheDocument();
    expect(within(primary).queryByText("War Room")).not.toBeInTheDocument();
  });

  it("opens Compare directly with the profile fighter selected and the opponent control focused", async () => {
    const router = renderRoute("/fighters/matt-hughes");
    fireEvent.click(await screen.findByRole("button", { name: "Compare" }));

    expect(await screen.findByRole("heading", { name: "Compare fighters" })).toBeInTheDocument();
    expect(screen.getByLabelText("First fighter")).toHaveDisplayValue("Matt Hughes");
    expect(screen.getByLabelText("Second fighter")).toHaveDisplayValue("Choose opponent");
    expect(screen.getByLabelText("Second fighter")).toHaveFocus();
    expect(router.state.location.pathname).toBe("/intelligence");
    expect(router.state.location.search).toBe("?mode=compare&fighter=matt-hughes");
  });

  it("pre-copies Ask Why using the fighter's current calculated rank", async () => {
    const originalClipboard = navigator.clipboard;
    const originalSecureContext = window.isSecureContext;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });

    const router = renderRoute("/fighters/matt-hughes");
    fireEvent.click(await screen.findByRole("button", { name: "Ask Why" }));

    expect(await screen.findByRole("heading", { name: "Why Matt Hughes ranks here" })).toBeInTheDocument();
    const expected = whyPromptFor(getFighter("matt-hughes")!);
    expect(writeText).toHaveBeenCalledWith(expected);
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(router.state.location.search).toBe("?mode=why&fighter=matt-hughes");

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: originalClipboard });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: originalSecureContext });
  });

  it("uses one tap to copy the short matchup and open Octagon Verdict", async () => {
    const originalClipboard = navigator.clipboard;
    const originalSecureContext = window.isSecureContext;
    const writeText = vi.fn().mockResolvedValue(undefined);
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });

    renderRoute("/intelligence?mode=compare&fighter=jon-jones");
    expect(await screen.findByRole("heading", { name: "Compare fighters" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Second fighter"), { target: { value: "georges-st-pierre" } });
    fireEvent.click(screen.getByRole("button", { name: "Copy & Open Verdict" }));

    const expected = matchupPrompt("Jon Jones", "Georges St-Pierre");
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expected));
    expect(open).toHaveBeenCalledWith(OCTAGON_VERDICT_URL, "_blank", "noopener,noreferrer");
    expect(screen.getByText(expected)).toBeInTheDocument();

    Object.defineProperty(navigator, "clipboard", { configurable: true, value: originalClipboard });
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: originalSecureContext });
  });

  it("keeps the generic page compact with four initial questions and a collapsed builder", async () => {
    renderRoute("/intelligence");
    expect(await screen.findByRole("link", { name: "Open Octagon Verdict" })).toHaveAttribute("href", OCTAGON_VERDICT_URL);
    expect(screen.getAllByRole("button", { name: /Copy$/ })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Show more questions" })).toBeInTheDocument();
    const builder = screen.getByText("Quick matchup builder").closest("details")!;
    expect(builder).not.toHaveAttribute("open");
  });
});
