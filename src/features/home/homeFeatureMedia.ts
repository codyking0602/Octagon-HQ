import { useEffect, useState } from "react";
import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  type FootballSpotlightKind,
  type FootballSpotlightPhotoSources,
} from "./footballPlayerSpotlightSchedule";

export type FootballHomeSpotlightKind = FootballSpotlightKind;

export const FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS = {
  cfb: "football-player-spotlight-cfb",
  nfl: "football-player-spotlight-nfl",
} as const;

export const HOME_FEATURE_MEDIA_BUCKET = "home-feature-media";

export const FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATHS = {
  cfb: "football/player-spotlight-cfb",
  nfl: "football/player-spotlight-nfl",
} as const;

export function footballHomeSpotlightMediaKey(pairId: string, kind: FootballHomeSpotlightKind) {
  return pairId === FOOTBALL_BASE_SPOTLIGHT_PAIR_ID
    ? FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS[kind]
    : `football-player-spotlight-${pairId}-${kind}`;
}

export function footballHomeSpotlightStoragePath(pairId: string, kind: FootballHomeSpotlightKind) {
  return pairId === FOOTBALL_BASE_SPOTLIGHT_PAIR_ID
    ? FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATHS[kind]
    : `football/player-spotlight/${pairId}/${kind}`;
}

// Compatibility exports for older callers.
export const FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEY = FOOTBALL_HOME_SPOTLIGHT_MEDIA_KEYS.cfb;
export const FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH = FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATHS.cfb;

const allowedMediaKeys = new Set(
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.flatMap((pair) => ([
    footballHomeSpotlightMediaKey(pair.id, "cfb"),
    footballHomeSpotlightMediaKey(pair.id, "nfl"),
  ])),
);

const mediaSchema = z.object({
  content_key: z.string().min(1),
  photo_source: z.string().min(1),
  updated_at: z.string().min(1),
});

export interface HomeFeatureMedia {
  contentKey: string;
  photoSource: string;
  updatedAt: string;
}

export interface HomeFeatureMediaRepository {
  loadFootballSpotlight: (
    pairId: string,
    kind: FootballHomeSpotlightKind,
  ) => Promise<HomeFeatureMedia | null>;
  saveFootballSpotlightPhoto: (
    pairId: string,
    kind: FootballHomeSpotlightKind,
    photoSource: string,
  ) => Promise<HomeFeatureMedia>;
}

function parseMedia(value: unknown): HomeFeatureMedia | null {
  if (value == null) return null;
  const parsed = mediaSchema.parse(value);
  if (!allowedMediaKeys.has(parsed.content_key)) {
    throw new Error("Unsupported Football Home Spotlight media key.");
  }
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
    async loadFootballSpotlight(pairId, kind) {
      const { data, error } = await client.rpc("get_home_feature_media", {
        p_content_key: footballHomeSpotlightMediaKey(pairId, kind),
      });
      if (error) throw new Error(error.message);
      return parseMedia(data);
    },

    async saveFootballSpotlightPhoto(pairId, kind, photoSource) {
      const { data, error } = await client.rpc("set_home_feature_media", {
        p_content_key: footballHomeSpotlightMediaKey(pairId, kind),
        p_photo_source: photoSource,
      });
      if (error) throw new Error(error.message);
      const parsed = parseMedia(data);
      if (!parsed) throw new Error("Home Spotlight photo was not saved.");
      return parsed;
    },
  };
}

function emptyFootballSpotlightPhotos(): Record<string, Record<FootballHomeSpotlightKind, string | null>> {
  return Object.fromEntries(
    FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.map((pair) => [pair.id, {
      cfb: FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES[pair.id]?.cfb ?? null,
      nfl: FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES[pair.id]?.nfl ?? null,
    }]),
  );
}

export function useFootballHomeSpotlightPhotos(
  suppliedRepository?: HomeFeatureMediaRepository | null,
): FootballSpotlightPhotoSources {
  const [repository] = useState<HomeFeatureMediaRepository | null>(() => (
    suppliedRepository === undefined ? createHomeFeatureMediaRepository() : suppliedRepository
  ));
  const [photoSources, setPhotoSources] = useState<Record<string, Record<FootballHomeSpotlightKind, string | null>>>(
    emptyFootballSpotlightPhotos,
  );

  useEffect(() => {
    if (!repository) return undefined;
    let active = true;
    const requests = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.flatMap((pair) => ([
      repository.loadFootballSpotlight(pair.id, "cfb").then((media) => [pair.id, "cfb", media?.photoSource ?? null] as const),
      repository.loadFootballSpotlight(pair.id, "nfl").then((media) => [pair.id, "nfl", media?.photoSource ?? null] as const),
    ]));

    void Promise.all(requests)
      .then((entries) => {
        if (!active) return;
        const next = emptyFootballSpotlightPhotos();
        for (const [pairId, kind, photoSource] of entries) {
          if (photoSource) next[pairId]![kind] = photoSource;
        }
        setPhotoSources(next);
      })
      .catch(() => {
        if (active) setPhotoSources(emptyFootballSpotlightPhotos());
      });

    return () => {
      active = false;
    };
  }, [repository]);

  return photoSources;
}
