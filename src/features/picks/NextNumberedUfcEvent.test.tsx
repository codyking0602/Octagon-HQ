import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { NextNumberedUfcEvent, countdownUnits } from "./NextNumberedUfcEvent";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NextNumberedUfcEvent", () => {
  it("renders official matchup, date, countdown, and quiet status without a dead CTA", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ event: {
        name: "UFC 334", matchup: "Ciryl Gane vs. Josh Hokit",
        startsAt: "2099-11-15T02:00:00.000Z",
        venue: "Madison Square Garden", location: "New York",
        imageUrl: null,
      } }),
    })));
    render(<MemoryRouter><NextNumberedUfcEvent canControl={false} /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "UFC 334" })).toBeInTheDocument();
    expect(screen.getByText("Ciryl Gane vs. Josh Hokit")).toBeInTheDocument();
    expect(screen.getByText(/Madison Square Garden/)).toBeInTheDocument();
    expect(screen.getByText("COUNTDOWN TO FIGHT NIGHT")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
    expect(screen.getByText("Picks open closer to fight night")).toBeInTheDocument();
    expect(screen.queryByText("EVENT DETAILS")).not.toBeInTheDocument();
    expect(screen.queryByText("STAGE NEXT UFC EVENT")).not.toBeInTheDocument();
    expect(screen.queryByText("NO ACTIVE CARD")).not.toBeInTheDocument();
  });

  it("displays the approved current-event poster and survives image CDN failures", async () => {
    vi.spyOn(Date, "now").mockReturnValue(Date.parse("2026-10-31T23:00:00Z"));
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ event: {
        name: "UFC 334", matchup: "Ciryl Gane vs. Josh Hokit",
        startsAt: "2026-11-15T02:00:00.000Z",
        venue: "Madison Square Garden", location: "New York",
        imageUrl: null,
      } }),
    })));
    const { container } = render(<MemoryRouter><NextNumberedUfcEvent canControl={false} /></MemoryRouter>);
    await screen.findByRole("heading", { name: "UFC 334" });
    const first = container.querySelector<HTMLImageElement>(".ufc-next-event__poster");
    expect(first?.src).toContain("fighttime.ru/media/");
    expect(container.querySelector(".ufc-next-event__art")).toHaveClass("has-artwork");
    fireEvent.error(first!);
    await waitFor(() => expect(container.querySelector<HTMLImageElement>(".ufc-next-event__poster")?.src).toContain("ringside24.com/media/"));
    fireEvent.error(container.querySelector(".ufc-next-event__poster")!);
    await waitFor(() => expect(container.querySelector(".ufc-next-event__poster")).not.toBeInTheDocument());
    expect(container.querySelector(".ufc-next-event__art")).not.toHaveClass("has-artwork");
    expect(container.querySelector(".ufc-next-event__arena")).toBeInTheDocument();
    expect(screen.getByText("COUNTDOWN TO FIGHT NIGHT")).toBeInTheDocument();
  });

  it("keeps owner controls discreet and handles missing official data without fictional dates", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ event: null }) })));
    render(<MemoryRouter><NextNumberedUfcEvent canControl /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Event details are being updated. Check back soon.")).toBeInTheDocument());
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage Picks event setup" })).toHaveAttribute("href", "/picks/control#setup");
  });

  it("uses integer days, hours and minutes without going negative", () => {
    expect(countdownUnits("2026-11-14T03:02:00Z", Date.parse("2026-11-13T02:00:00Z"))).toEqual({
      days: "01", hours: "01", minutes: "02",
    });
    expect(countdownUnits("2026-11-13T02:00:00Z", Date.parse("2026-11-14T03:02:00Z"))).toEqual({
      days: "00", hours: "00", minutes: "00",
    });
    expect(countdownUnits("invalid", Date.now())).toBeNull();
  });
});
