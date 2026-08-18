import { useState } from "react";

const thumbnailModules = import.meta.glob<{ default: string }>(
  "/public/assets/fighters/*-thumb.{webp,png,jpg,jpeg}",
  { eager: true, query: "?url" },
);

const thumbnailBySlug = new Map(
  Object.entries(thumbnailModules).map(([path]) => {
    const filename = path.split("/").at(-1) ?? "";
    return [filename.replace(/-thumb\.(webp|png|jpe?g)$/i, ""), path.replace(/^\/public/, "")] as const;
  }),
);

const thumbnailSlugAliases = new Map([
  ["jan-b-achowicz", "jan-blachowicz"],
  ["jan-błachowicz", "jan-blachowicz"],
]);

export function fighterThumbnailPath(slug: string) {
  const canonicalSlug = thumbnailSlugAliases.get(slug) ?? slug;
  return thumbnailBySlug.get(canonicalSlug) ?? null;
}

export function FighterThumbnail({ name, slug }: { name: string; slug: string }) {
  const source = fighterThumbnailPath(slug);
  const [failed, setFailed] = useState(false);

  if (!source || failed) {
    return (
      <span
        className="pick-fighter-thumbnail pick-fighter-thumbnail--fallback"
        aria-label={`${name} photo unavailable`}
        role="img"
      />
    );
  }

  return (
    <img
      className="pick-fighter-thumbnail"
      src={source}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
