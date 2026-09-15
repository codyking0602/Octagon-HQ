import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

export type FootballHomeSpotlightKind = "cfb" | "nfl";

export const FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS = {
  cfb: "football-player-spotlight-cfb",
  nfl: "football-player-spotlight-nfl",
} as const;

export const HOME_FEATURE_MEDIA_BUCKET = "home-feature-media";

export const FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATHS = {
  cfb: "football/player-spotlight-cfb",
  nfl: "football/player-spotlight-nfl",
} as const;

// Compatibility exports for older callers; new code should use the keyed maps above.
export const FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY = FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS.cfb;
export const FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH = FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATHS.cfb;

const mediaSchema = z.object({
  content_key: z.union([
    z.literal(FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS.cfb),
    z.literal(FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS.nfl),
  ]),
  photo_source: z.string().min(1),
  updated_at: z.string().min(1),
});

export interface HomeFeatureMedia {
  contentKey: (typeof FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS)[FootballHomeSpotlightKind];
  photoSource: string;
  updatedAt: string;
}

export interface HomeFeatureMediaRepository {
  loadFootballSpotlight: (kind: FootballHomeSpotlightKind) => Promise<HomeFeatureMedia | null>;
  saveFootballSpotlightPhoto: (
    kind: FootballHomeSpotlightKind,
    photoSource: string,
  ) => Promise<HomeFeatureMedia>;
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

export function createHomeFeatureMediaRepository(): HomeFeatureMediaRepository | null {
  const client = getSupabaseClient();
  if (!client) return null;

  return {
    async loadFootballSpotlight(kind) {
      const { data, error } = await client.rpc("get_home_feature_media", {
        p_content_key: FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS[kind],
      });
      if (error) throw new Error(error.message);
      return parseMedia(data);
    },

    async saveFootballSpotlightPhoto(kind, photoSource) {
      const { data, error } = await client.rpc("set_home_feature_media", {
        p_content_key: FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS[kind],
        p_photo_source: photoSource,
      });
      if (error) throw new Error(error.message);
      const parsed = parseMedia(data);
      if (!parsed) throw new Error("Home Spotlight photo was not saved.");
      return parsed;
    },
  };
}

export function useFootballHomeSpotlightPhotos(
  suppliedRepository?: HomeFeatureMediaRepository | null,
) {
  const [repository] = useState<HomeFeatureMediaRepository | null>(() => (
    suppliedRepository === undefined ? createHomeFeatureMediaRepository() : suppliedRepository
  ));
  const [photoSources, setPhotoSources] = useState<Record<FootballHomeSpotlightKind, string | null>>({
    cfb: null,
    nfl: null,
  });

  useEffect(() => {
    if (!repository) return undefined;
    let active = true;
    void Promise.all([
      repository.loadFootballSpotlight("cfb"),
      repository.loadFootballSpotlight("nfl"),
    ])
      .then(([cfb, nfl]) => {
        if (!active) return;
        setPhotoSources({
          cfb: cfb?.photoSource ?? null,
          nfl: nfl?.photoSource ?? null,
        });
      })
      .catch(() => {
        if (active) setPhotoSources({ cfb: null, nfl: null });
      });
    return () => {
      active = false;
    };
  }, [repository]);

  return photoSources;
}
