import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OwnerTomorrowAverageFanPreviewEntry, { nextCentralDay } from "./OwnerTomorrowAverageFanPreviewEntry";
import { createOwnerAverageFanPreviewRepository } from "./todayChallengeRepository";

vi.mock("./todayChallengeRepository", async () => {
  const actual = await vi.importActual<typeof import("./todayChallengeRepository")>("./todayChallengeRepository");
  return {
    ...actual,
    createOwnerAverageFanPreviewRepository: vi.fn(),
  };
});

const mockedRepository = vi.mocked(createOwnerAverageFanPreviewRepository);

describe("owner tomorrow Average Fan preview entry", () => {
  it("computes the next Central calendar day without local-time drift", () => {
    expect(nextCentralDay("2026-10-01")).toBe("2026-10-02");
    expect(nextCentralDay("2026-12-31")).toBe("2027-01-01");
    expect(nextCentralDay("not-a-day")).toBeNull();
  });

  it("stays hidden for non-owner profiles without touching the preview backend", () => {
    const onNavigate = vi.fn();

    render(
      <OwnerTomorrowAverageFanPreviewEntry
        enabled={false}
        sport="ufc"
        centralDay="2026-10-01"
        onNavigate={onNavigate}
      />,
    );

    expect(screen.queryByRole("button", { name: /tomorrow’s average fan daily/i })).not.toBeInTheDocument();
    expect(mockedRepository).not.toHaveBeenCalled();
  });

  it("renders only when tomorrow resolves to the canonical Average Fan preview and opens the exact owner route", async () => {
    const onNavigate = vi.fn();
    mockedRepository.mockReturnValue({
      load: vi.fn().mockResolvedValue({
        gameType: "average_fan",
        progressRevision: 0,
      }),
      advance: vi.fn(),
    } as never);

    render(
      <OwnerTomorrowAverageFanPreviewEntry
        enabled
        sport="football"
        centralDay="2026-10-01"
        onNavigate={onNavigate}
      />,
    );

    const button = await screen.findByRole("button", { name: "Preview tomorrow’s Average Fan Daily" });
    expect(button).toHaveTextContent("Preview Tomorrow’s Game");
    expect(button).toHaveTextContent("FRI, OCT 2");

    fireEvent.click(button);
    expect(onNavigate).toHaveBeenCalledWith("/play/average-fan-preview?day=2026-10-02&sport=football");
  });

  it("stays hidden when tomorrow is not an Average Fan Daily", async () => {
    mockedRepository.mockReturnValue({
      load: vi.fn().mockRejectedValue(new Error("PREVIEW_DAY_NOT_AVERAGE_FAN")),
      advance: vi.fn(),
    } as never);

    render(
      <OwnerTomorrowAverageFanPreviewEntry
        enabled
        sport="ufc"
        centralDay="2026-10-01"
        onNavigate={vi.fn()}
      />,
    );

    await waitFor(() => expect(mockedRepository).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: /tomorrow’s average fan daily/i })).not.toBeInTheDocument();
  });
});
