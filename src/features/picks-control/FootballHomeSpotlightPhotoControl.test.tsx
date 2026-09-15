import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeFeatureMediaRepository } from "../home/homeFeatureMedia";
import FootballHomeSpotlightPhotoControl from "./FootballHomeSpotlightPhotoControl";

describe("FootballHomeSpotlightPhotoControl", () => {
  it("loads separate CFB and NFL upload slots and persists each photo to its own key", async () => {
    const cfbUploadedPhotoSource = "https://example.supabase.co/storage/v1/object/public/home-feature-media/football/player-spotlight-cfb?v=2";
    const nflUploadedPhotoSource = "https://example.supabase.co/storage/v1/object/public/home-feature-media/football/player-spotlight-nfl?v=3";
    const repository: HomeFeatureMediaRepository = {
      loadFootballSpotlight: vi.fn().mockImplementation(async (kind) => ({
        contentKey: kind === "cfb"
          ? "football-player-spotlight-cfb"
          : "football-player-spotlight-nfl",
        photoSource: `https://example.com/current-${kind}.webp`,
        updatedAt: "2026-09-15T00:00:00Z",
      })),
      saveFootballSpotlightPhoto: vi.fn().mockImplementation(async (kind, photoSource) => ({
        contentKey: kind === "cfb"
          ? "football-player-spotlight-cfb"
          : "football-player-spotlight-nfl",
        photoSource,
        updatedAt: "2026-09-15T00:01:00Z",
      })),
    };
    const uploadPhoto = vi.fn().mockImplementation(async (_file, kind) => (
      kind === "cfb" ? cfbUploadedPhotoSource : nflUploadedPhotoSource
    ));
    render(
      <FootballHomeSpotlightPhotoControl repository={repository} uploadPhoto={uploadPhoto} />,
    );

    expect(await screen.findByAltText("Current CFB Football Home Player Spotlight"))
      .toHaveAttribute("src", "https://example.com/current-cfb.webp");
    expect(await screen.findByAltText("Current NFL Football Home Player Spotlight"))
      .toHaveAttribute("src", "https://example.com/current-nfl.webp");
    expect(repository.loadFootballSpotlight).toHaveBeenCalledWith("cfb");
    expect(repository.loadFootballSpotlight).toHaveBeenCalledWith("nfl");

    const cfbInput = screen.getByLabelText("Upload CFB Player Spotlight photo");
    const cfbFile = new File(["portrait"], "drew.jpg", { type: "image/jpeg" });
    fireEvent.change(cfbInput, { target: { files: [cfbFile] } });

    await waitFor(() => expect(uploadPhoto).toHaveBeenCalledWith(cfbFile, "cfb"));
    await waitFor(() => expect(repository.saveFootballSpotlightPhoto)
      .toHaveBeenCalledWith("cfb", cfbUploadedPhotoSource));
    expect(await screen.findByText("CFB Football Home Spotlight photo updated.")).toBeInTheDocument();
    expect(screen.getByAltText("Current CFB Football Home Player Spotlight"))
      .toHaveAttribute("src", cfbUploadedPhotoSource);

    const nflInput = screen.getByLabelText("Upload NFL Player Spotlight photo");
    const nflFile = new File(["portrait"], "josh.jpg", { type: "image/jpeg" });
    fireEvent.change(nflInput, { target: { files: [nflFile] } });

    await waitFor(() => expect(uploadPhoto).toHaveBeenCalledWith(nflFile, "nfl"));
    await waitFor(() => expect(repository.saveFootballSpotlightPhoto)
      .toHaveBeenCalledWith("nfl", nflUploadedPhotoSource));
    expect(await screen.findByText("NFL Football Home Spotlight photo updated.")).toBeInTheDocument();
    expect(screen.getByAltText("Current NFL Football Home Player Spotlight"))
      .toHaveAttribute("src", nflUploadedPhotoSource);
  });
});
