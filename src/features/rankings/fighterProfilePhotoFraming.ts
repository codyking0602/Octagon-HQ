import type { CSSProperties } from "react";

/**
 * Deliberately scoped hero crops. Unlisted fighter profiles retain their
 * existing contain presentation to avoid cutting off approved photography.
 * Positions are percentages of the image overflow inside the profile card.
 */
const focusedProfilePhotos: Readonly<Record<string, CSSProperties>> = {
  "ciryl-gane": { objectFit: "cover", objectPosition: "50% 40%" },
  "natalia-silva": { objectFit: "cover", objectPosition: "50% 5%" },
};

export function fighterProfilePhotoFraming(slug: string): CSSProperties | undefined {
  return focusedProfilePhotos[slug];
}
