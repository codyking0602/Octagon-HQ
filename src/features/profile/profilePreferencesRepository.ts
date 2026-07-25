import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";

const preferencesRowSchema = z.object({
  favorite_fighter_slug: z.string().nullable(),
});

export interface ProfilePreferencesRepository {
  loadFavoriteFighter: () => Promise<string | null>;
  saveFavoriteFighter: (fighterSlug: string | null) => Promise<string | null>;
}

async function requireRpcSuccess<T>(request: PromiseLike<{ data: T; error: { message?: string } | null }>) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || "Octagon HQ could not update that profile preference.");
  return data;
}

function favoriteSlug(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  return preferencesRowSchema.parse(raw).favorite_fighter_slug;
}

export function createProfilePreferencesRepository(): ProfilePreferencesRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadFavoriteFighter() {
      const data = await requireRpcSuccess(client.rpc("get_my_profile_preferences"));
      return favoriteSlug(data);
    },

    async saveFavoriteFighter(fighterSlug) {
      const data = await requireRpcSuccess(client.rpc("set_my_favorite_fighter", {
        p_fighter_slug: fighterSlug ?? "",
      }));
      return favoriteSlug(data);
    },
  };
}
