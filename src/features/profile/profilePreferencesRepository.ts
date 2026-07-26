import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const preferencesRowSchema = z.object({
  favorite_fighter_slug: z.string().nullable(),
  avatar_photo_data: z.string().nullable().optional(),
});

export interface ProfilePreferencesRepository {
  loadFavoriteFighter: () => Promise<string | null>;
  saveFavoriteFighter: (fighterSlug: string | null) => Promise<string | null>;
  loadAvatarPhoto?: () => Promise<string | null>;
  saveAvatarPhoto?: (photoData: string | null) => Promise<string | null>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not update that profile preference.");
  return data;
}

function preferences(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return {
      favoriteFighterSlug: null,
      avatarPhotoData: null,
    };
  }
  const row = preferencesRowSchema.parse(raw);
  return {
    favoriteFighterSlug: row.favorite_fighter_slug,
    avatarPhotoData: row.avatar_photo_data ?? null,
  };
}

export function createProfilePreferencesRepository(): ProfilePreferencesRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  async function loadPreferences() {
    const data = await requireRpcSuccess(client.rpc("get_my_profile_preferences"));
    return preferences(data);
  }

  return {
    async loadFavoriteFighter() {
      return (await loadPreferences()).favoriteFighterSlug;
    },

    async saveFavoriteFighter(fighterSlug) {
      const data = await requireRpcSuccess(client.rpc("set_my_favorite_fighter", {
        p_fighter_slug: fighterSlug ?? "",
      }));
      return preferences(data).favoriteFighterSlug;
    },

    async loadAvatarPhoto() {
      return (await loadPreferences()).avatarPhotoData;
    },

    async saveAvatarPhoto(photoData) {
      const data = await requireRpcSuccess(client.rpc("set_my_avatar_photo", {
        p_avatar_photo_data: photoData ?? "",
      }));
      return preferences(data).avatarPhotoData;
    },
  };
}
