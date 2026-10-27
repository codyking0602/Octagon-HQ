import type { CSSProperties } from "react";

/**
 * Profile-specific crop targets. Keep thumbnails and unrelated fighters untouched.
 * CSS object-fit: cover eliminates empty bands; the focal point protects faces and belts.
 */
const FIGHTER_PROFILE_FRAMING: Record<string, CSSProperties> = {
  "ciryl-gane": { objectFit: "cover", objectPosition: "51% 34%" },
  "natalia-silva": { objectFit: "cover", objectPosition: "50% 16%" },
};

export function fighterProfilePhotoFraming(slug: string): CSSProperties | undefined {
  return FIGHTER_PROFILE_FRAMING[slug];
}
