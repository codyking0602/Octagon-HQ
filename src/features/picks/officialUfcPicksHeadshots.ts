/**
 * October 31 UFC Picks: only publisher-identified UFC/ESPN headshots.
 * ESPN's MMA headshot product and UFC's official transparent
 * event_results_athlete_headshot product are eligible; a UFC profile's
 * athlete_bio_full_body promotional image is not. UFC originals are 256x160
 * and fit the square Picks tile without stretching fighter faces. No
 * full-torso UFC promotional renders, cropped Spotlights or third-party images.
 * Missing = null, not a fallback to the legacy thumbnail file.
 *
 * A future official square portrait may be added only after verifying the
 * athlete and the actual image. Do NOT infer a filename from a fighter slug.
 */
export const OCT31_2026_UFC_EVENT_ID =
  "ufc-fight-night-renato-moicano-vs-tom-nolan-2026-10-31";

// November 7 remains fail-closed by default. The owner explicitly supplied a
// clean transparent 600×436 Johnny Walker portrait matching the official
// ESPN MMA athlete (3146944) after its public CDN PNG exhibited background
// corruption. Only that individually reviewed supplied cutout is allowlisted;
// do not fall back to older legacy images or the contaminated CDN file.
// All other fighters remain blank pending source and live-asset approval.
export const NOV07_2026_UFC_EVENT_ID =
  "ufc-fight-night-waldo-cortes-acosta-vs-johnny-walker-2026-11-07";

export const november07ReviewedHeadshots: Readonly<Record<string, string>> = {
  "johnny-walker": "/assets/fighters/johnny-walker-nov07-thumb.webp",
};

export const october31OfficialHeadshots: Readonly<Record<string, string>> = {
  "renato-moicano": "https://a.espncdn.com/i/headshots/mma/players/full/3028863.png",
  "tom-nolan": "https://a.espncdn.com/i/headshots/mma/players/full/5144007.png",
  "randy-brown": "https://a.espncdn.com/i/headshots/mma/players/full/3960071.png",
  "jacobe-smith": "https://a.espncdn.com/i/headshots/mma/players/full/5149961.png",
  "ode-osbourne": "https://a.espncdn.com/i/headshots/mma/players/full/4424224.png",
  "luana-santos": "https://a.espncdn.com/i/headshots/mma/players/full/5110469.png",
  "cody-durden": "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-07/DURDEN_CODY_07-11.png?itok=F8sg0X6W",
  "yana-santos": "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2025-10/SANTOS_YANA_10-04.png?itok=KtQbaZeq",
  "jean-paul-lebosnoyani": "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-02/LEBOSNOYANI_JEAN-PAUL_02-21.png?itok=SXcx7GgN",
  "farman-hasanov": "https://ufc.com/images/styles/event_results_athlete_headshot/s3/2026-06/HASANOV_FARMAN_06-27.png?itok=QHlSQYHc",
};

export const october31FighterSlugs = [
  "renato-moicano", "tom-nolan", "randy-brown", "jacobe-smith",
  "ode-osbourne", "cody-durden", "yana-santos", "luana-santos",
  "jean-paul-lebosnoyani", "farman-hasanov",
] as const;

/** undefined = another event; null = this fighter must display missing image. */
export function approvedUfcPicksHeadshot(eventId: string, fighterSlug: string): string | null | undefined {
  if (eventId === NOV07_2026_UFC_EVENT_ID) return november07ReviewedHeadshots[fighterSlug] ?? null;
  if (eventId !== OCT31_2026_UFC_EVENT_ID) return undefined;
  return october31OfficialHeadshots[fighterSlug] ?? null;
}
