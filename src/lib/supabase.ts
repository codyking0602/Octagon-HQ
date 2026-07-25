import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const SUPABASE_BROWSER_CONFIG = {
  url: "https://rvbspcjvebgwqzssayts.supabase.co",
  publishableKey: "sb_publishable_tF2qJZwwHISdJm9Oai85Xg_i7qvuuT9",
} as const;

const configSchema = z.object({
  url: z.string().url().refine((value) => !value.includes("your-project-id")),
  publishableKey: z.string().startsWith("sb_publishable_").min(1),
});

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const parsed = configSchema.safeParse(SUPABASE_BROWSER_CONFIG);

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
