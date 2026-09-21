import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
} from "../home/footballPlayerSpotlightSchedule";
import type { HomeFeatureMediaRepository } from "../home/homeFeatureMedia";
import FootballHomeSpotlightPhotoControl from "./FootballHomeSpotlightPhotoControl";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("FootballHomeSpotlightPhotoControl", () => {
  it("shows CURRENT and NEXT pairs and preloads next CFB/NFL photos without replacing current media", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T18:00:00Z"));

    const nextPair = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS[1];
    const currentSources = {
      cfb: "https://example.com/drew.webp",
      nfl: "https://example.com/josh.webp",
    };
    const nextSources = {
      cfb: "https://example.com/trinidad.webp",
      nfl: "https://example.com/dak.webp",
    };
    const repository: HomeFeatureMediaRepository = {
      loadFootballSpotlight: vi.fn().mockImplementation(async (pairId, kind) => ({
        contentKey: `${pairId}-${kind}`,
        photoSource: pairId === FOOTBALL_BASE_SPOTLIGHT_PAIR_ID ? currentSources[kind] : "",
        updatedAt: "2026-09-21T00:00:00Z",
      })),
      saveFootballSpotlightPhoto: vi.fn().mockImplementation(async (pairId, kind, photoSource) => ({
        contentKey: `${pairId}-${kind}`,
        photoSource,
        updatedAt: "2026-09-21T00:01:00Z",
      })),
    };
    const uploadPhoto = vi.fn().mockImplementation(async (_file, pairId, kind) => (
      pairId === nextPair.id ? nextSources[kind] : currentSources[kind]
    ));

    render(<FootballHomeSpotlightPhotoControl repository={repository} uploadPhoto={uploadPhoto} />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("DREW MESTEMAKER")).toBeInTheDocument();
    expect(screen.getByText("JOSH ALLEN")).toBeInTheDocument();
    expect(screen.getByText("TRINIDAD CHAMBLISS")).toBeInTheDocument();
    expect(screen.getByText("DAK PRESCOTT")).toBeInTheDocument();
    expect(screen.getByAltText("CURRENT CFB Football Home Player Spotlight"))
      .toHaveAttribute("src", currentSources.cfb);
    expect(screen.getByAltText("CURRENT NFL Football Home Player Spotlight"))
      .toHaveAttribute("src", currentSources.nfl);

    const trinidadFile = new File(["portrait"], "trinidad.jpg", { type: "image/jpeg" });
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Upload NEXT CFB Player Spotlight photo"), {
        target: { files: [trinidadFile] },
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(uploadPhoto).toHaveBeenCalledWith(trinidadFile, nextPair.id, "cfb");
    expect(repository.saveFootballSpotlightPhoto)
      .toHaveBeenCalledWith(nextPair.id, "cfb", nextSources.cfb);
    expect(screen.getByAltText("NEXT CFB Football Home Player Spotlight"))
      .toHaveAttribute("src", nextSources.cfb);

    const dakFile = new File(["portrait"], "dak.jpg", { type: "image/jpeg" });
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Upload NEXT NFL Player Spotlight photo"), {
        target: { files: [dakFile] },
      });
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(uploadPhoto).toHaveBeenCalledWith(dakFile, nextPair.id, "nfl");
    expect(repository.saveFootballSpotlightPhoto)
      .toHaveBeenCalledWith(nextPair.id, "nfl", nextSources.nfl);
    expect(screen.getByAltText("NEXT NFL Football Home Player Spotlight"))
      .toHaveAttribute("src", nextSources.nfl);

    expect(screen.getByAltText("CURRENT CFB Football Home Player Spotlight"))
      .toHaveAttribute("src", currentSources.cfb);
    expect(screen.getByAltText("CURRENT NFL Football Home Player Spotlight"))
      .toHaveAttribute("src", currentSources.nfl);
  });
});
