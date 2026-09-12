import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, getPublicUrl, rpc, upload } = vi.hoisted(() => ({
  from: vi.fn(),
  getPublicUrl: vi.fn(),
  rpc: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  getSupabaseClient: () => ({
    rpc,
    storage: { from },
  }),
}));

import {
  createHomeFeatureMediaRepository,
  FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH,
  HOME_FEATURE_MEDIA_BUCKET,
} from "./homeFeatureMedia";

beforeEach(() => {
  vi.restoreAllMocks();
  from.mockReset();
  getPublicUrl.mockReset();
  rpc.mockReset();
  upload.mockReset();
  from.mockReturnValue({ upload, getPublicUrl });
  upload.mockResolvedValue({ data: { path: FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH }, error: null });
  getPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example.com/home-feature-media/football/player-spotlight.jpg" } });
});

describe("Home feature media repository", () => {
  it("uploads one canonical Spotlight asset and persists only its versioned public URL", async () => {
    vi.spyOn(Date, "now").mockReturnValue(123456);
    rpc.mockResolvedValue({
      data: {
        content_key: "football-player-spotlight",
        photo_source: "https://cdn.example.com/home-feature-media/football/player-spotlight.jpg?v=123456",
        updated_at: "2026-09-12T15:00:00Z",
      },
      error: null,
    });
    const repository = createHomeFeatureMediaRepository();
    const photo = new Blob(["photo"], { type: "image/jpeg" });

    await expect(repository?.saveFootballSpotlightPhoto(photo)).resolves.toEqual({
      contentKey: "football-player-spotlight",
      photoSource: "https://cdn.example.com/home-feature-media/football/player-spotlight.jpg?v=123456",
      updatedAt: "2026-09-12T15:00:00Z",
    });

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(HOME_FEATURE_MEDIA_BUCKET);
    expect(upload).toHaveBeenCalledWith(
      FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH,
      photo,
      {
        cacheControl: "0",
        contentType: "image/jpeg",
        upsert: true,
      },
    );
    expect(rpc).toHaveBeenCalledWith("set_home_feature_media", {
      p_content_key: "football-player-spotlight",
      p_photo_source: "https://cdn.example.com/home-feature-media/football/player-spotlight.jpg?v=123456",
    });
  });

  it("does not create a second persistence path when storage upload fails", async () => {
    upload.mockResolvedValue({ data: null, error: { message: "storage denied" } });
    const repository = createHomeFeatureMediaRepository();

    await expect(repository?.saveFootballSpotlightPhoto(
      new Blob(["photo"], { type: "image/jpeg" }),
    )).rejects.toThrow("storage denied");

    expect(rpc).not.toHaveBeenCalled();
  });
});
