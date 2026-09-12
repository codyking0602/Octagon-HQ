import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export const FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY = "football-player-spotlight";
export const HOME_FEATURE_MEDIA_BUCKET = "home-feature-media";
export const FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH = "football/player-spotlight.jpg";

const mediaSchema = z.object({
  content_key: z.literal(FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY),
  photo_source: z.string().min(1),
  updated_at: z.string().min(1),
});

export interface HomeFeatureMedia {
  contentKey: typeof FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY;
  photoSource: string;
  updatedAt: string;
}

export interface HomeFeatureMediaRepository {
  loadFootballSpotlight: () => Promise<HomeFeatureMedia | null>;
  saveFootballSpotlightPhoto: (photo: Blob) => Promise<HomeFeatureMedia>;
}

function parseMedia(value: unknown): HomeFeatureMedia | null {
  if (value == null) return null;
  const parsed = mediaSchema.parse(value);
  return {
    contentKey: parsed.content_key,
    photoSource: parsed.photo_source,
    updatedAt: parsed.updated_at,
  };
}

function versionedPublicUrl(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

export function createHomeFeatureMediaRepository(): HomeFeatureMediaRepository | null {
  const client = getSupabaseClient();
  if (!client) return null;

  return {
    async loadFootballSpotlight() {
      const { data, error } = await client.rpc("get_home_feature_media", {
        p_content_key: FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY,
      });
      if (error) throw new Error(error.message);
      return parseMedia(data);
    },

    async saveFootballSpotlightPhoto(photo) {
      if (!/^image\/(jpeg|png|webp)$/i.test(photo.type)) {
        throw new Error("Home Spotlight storage only accepts JPG, PNG, or WebP images.");
      }

      const bucket = client.storage.from(HOME_FEATURE_MEDIA_BUCKET);
      const { error: uploadError } = await bucket.upload(
        FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH,
        photo,
        {
          cacheControl: "0",
          contentType: photo.type,
          upsert: true,
        },
      );
      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = bucket.getPublicUrl(FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH).data.publicUrl;
      if (!publicUrl) throw new Error("Home Spotlight storage did not return a public photo URL.");

      const photoSource = versionedPublicUrl(publicUrl);
      const { data, error } = await client.rpc("set_home_feature_media", {
        p_content_key: FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY,
        p_photo_source: photoSource,
      });
      if (error) throw new Error(error.message);

      const parsed = parseMedia(data);
      if (!parsed) throw new Error("Home Spotlight photo was not saved.");
      return parsed;
    },
  };
}

export function useFootballHomeSpotlightPhoto(
  suppliedRepository?: HomeFeatureMediaRepository | null,
) {
  const [repository] = useState<HomeFeatureMediaRepository | null>(() => (
    suppliedRepository === undefined ? createHomeFeatureMediaRepository() : suppliedRepository
  ));
  const [photoSource, setPhotoSource] = useState<string | null>(null);

  useEffect(() => {
    if (!repository) return undefined;
    let active = true;
    void repository.loadFootballSpotlight()
      .then((media) => {
        if (active) setPhotoSource(media?.photoSource ?? null);
      })
      .catch(() => {
        if (active) setPhotoSource(null);
      });
    return () => {
      active = false;
    };
  }, [repository]);

  return photoSource;
}
