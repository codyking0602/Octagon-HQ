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

export function fighterThumbnailPath(slug: string) {
  return thumbnailBySlug.get(slug) ?? null;
}

export function FighterThumbnail({ name, slug }: { name: string; slug: string }) {
  const source = fighterThumbnailPath(slug);
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  if (!source || failed) {
    return <span className="pick-fighter-thumbnail pick-fighter-thumbnail--fallback" aria-hidden="true">{initials}</span>;
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
