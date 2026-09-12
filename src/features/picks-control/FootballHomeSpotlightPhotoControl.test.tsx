import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HomeFeatureMediaRepository } from "../home/homeFeatureMedia";
import FootballHomeSpotlightPhotoControl from "./FootballHomeSpotlightPhotoControl";

describe("FootballHomeSpotlightPhotoControl", () => {
  it("uploads the processed photo to media storage before persisting its public URL", async () => {
    const uploadedPhotoSource = "https://example.supabase.co/storage/v1/object/public/home-feature-media/football/player-spotlight?v=2";
    const repository: HomeFeatureMediaRepository = {
      loadFootballSpotlight: vi.fn().mockResolvedValue({
        contentKey: "football-player-spotlight",
        photoSource: "https://example.com/current.webp",
        updatedAt: "2026-09-12T00:00:00Z",
      }),
      saveFootballSpotlightPhoto: vi.fn().mockResolvedValue({
        contentKey: "football-player-spotlight",
        photoSource: uploadedPhotoSource,
        updatedAt: "2026-09-12T00:01:00Z",
      }),
    };
    const uploadPhoto = vi.fn().mockResolvedValue(uploadedPhotoSource);
    const { container } = render(
      <FootballHomeSpotlightPhotoControl repository={repository} uploadPhoto={uploadPhoto} />,
    );

    expect(await screen.findByAltText("Current Football Home Player Spotlight"))
      .toHaveAttribute("src", "https://example.com/current.webp");

    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    const file = new File(["portrait"], "kamario.jpg", { type: "image/jpeg" });
    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => expect(uploadPhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(repository.saveFootballSpotlightPhoto).toHaveBeenCalledWith(uploadedPhotoSource));
    expect(await screen.findByText("Football Home Spotlight photo updated.")).toBeInTheDocument();
    expect(screen.getByAltText("Current Football Home Player Spotlight"))
      .toHaveAttribute("src", uploadedPhotoSource);
  });
});
