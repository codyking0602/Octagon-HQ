/**
 * October 31 UFC Picks: only actual square headshots supplied by ESPN or UFC.
 * Direct ESPN image IDs are documented in official athlete portraits. No
 * full-torso UFC promotional renders, cropped Spotlights or third-party images.
 * Missing = null, not a fallback to the legacy thumbnail file.
 *
 * A future official square portrait may be added only after verifying the
 * athlete and the actual image. Do NOT infer a filename from a fighter slug.
 */
export const OCT31_2026_UFC_EVENT_ID =
  "ufc-fight-night-renato-moicano-vs-tom-nolan-2026-10-31";

export const october31OfficialHeadshots: Readonly<Record<string, string>> = {
  "renato-moicano": "https://a.espncdn.com/i/headshots/mma/players/full/3028863.png",
  "tom-nolan": "https://a.espncdn.com/i/headshots/mma/players/full/5144007.png",
  "randy-brown": "https://a.espncdn.com/i/headshots/mma/players/full/3960071.png",
  "jacobe-smith": "https://a.espncdn.com/i/headshots/mma/players/full/5149961.png",
  "ode-osbourne": "https://a.espncdn.com/i/headshots/mma/players/full/4424224.png",
  "luana-santos": "https://a.espncdn.com/i/headshots/mma/players/full/5110469.png",
};

export const october31FighterSlugs = [
  "renato-moicano", "tom-nolan", "randy-brown", "jacobe-smith",
  "ode-osbourne", "cody-durden", "yana-santos", "luana-santos",
  "jean-paul-lebosnoyani", "farman-hasanov",
] as const;

/** undefined = another event; null = this fighter must display missing image. */
export function approvedUfcPicksHeadshot(eventId: string, fighterSlug: string): string | null | undefined {
  if (eventId !== OCT31_2026_UFC_EVENT_ID) return undefined;
  return october31OfficialHeadshots[fighterSlug] ?? null;
}
