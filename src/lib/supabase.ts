import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const configSchema = z.object({
  url: z.string().url(),
  publishableKey: z.string().min(1),
});

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const parsed = configSchema.safeParse({
    url: import.meta.env.VITE_SUPABASE_URL,
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });

  client = parsed.success
    ? createClient(parsed.data.url, parsed.data.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

  return client;
}
