import { useState } from "react";
import { shanesWatchlist } from "../home/shanesWatchlist";
import { ShaneContenderBadge } from "./ShaneContenderSpotlight";

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

const remotePhotoBySlug = new Map([
  ["dan-hooker", "https://a.espncdn.com/i/headshots/mma/players/full/3109135.png"],
  ["salahdine-parnasse", "https://a.espncdn.com/i/headshots/mma/players/full/4312859.png"],
  ["fares-ziam", "https://a.espncdn.com/i/headshots/mma/players/full/4083018.png"],
  ["michael-page", "https://a.espncdn.com/i/headshots/mma/players/full/3022067.png"],
  ["michael-venom-page", "https://a.espncdn.com/i/headshots/mma/players/full/3022067.png"],
  ["nursulton-ruziboev", "https://a.espncdn.com/i/headshots/mma/players/full/4422103.png"],
  ["punahele-soriano", "https://a.espncdn.com/i/headshots/mma/players/full/4423214.png"],
  ["kurtis-campbell", "https://a.espncdn.com/i/headshots/mma/players/full/5310075.png"],
  ["trevor-peek", "https://a.espncdn.com/i/headshots/mma/players/full/5048900.png"],
  ["morgan-charriere", "https://a.espncdn.com/i/headshots/mma/players/full/4324622.png"],
  ["felipe-lima", "https://a.espncdn.com/i/headshots/mma/players/full/5101694.png"],
  ["losene-keita", "https://a.espncdn.com/i/headshots/mma/players/full/5192314.png"],
  ["muhammad-naimov", "https://a.espncdn.com/i/headshots/mma/players/full/4690540.png"],
]);

export function fighterRemotePhotoPath(slug: string) {
  const canonicalSlug = thumbnailSlugAliases.get(slug) ?? slug;
  return remotePhotoBySlug.get(canonicalSlug) ?? null;
}

export function fighterThumbnailPath(slug: string) {
  const canonicalSlug = thumbnailSlugAliases.get(slug) ?? slug;
  return fighterRemotePhotoPath(canonicalSlug) ?? thumbnailBySlug.get(canonicalSlug) ?? null;
}

export function FighterThumbnail({ name, slug }: { name: string; slug: string }) {
  const source = fighterThumbnailPath(slug);
  const [failed, setFailed] = useState(false);
  const shaneContender = shanesWatchlist.fighters.find((fighter) => fighter.id === slug) ?? null;

  const photo = !source || failed ? (
    <i
      className="pick-fighter-thumbnail pick-fighter-thumbnail--fallback"
      aria-label={`${name} photo unavailable`}
      role="img"
    >
      <svg viewBox="0 0 64 64" width="68%" height="68%" aria-hidden="true">
        <circle cx="32" cy="21" r="11" fill="currentColor" fillOpacity="0.56" />
        <path
          d="M12 57c1.4-13.2 8.1-20 20-20s18.6 6.8 20 20H12Z"
          fill="currentColor"
          fillOpacity="0.4"
        />
      </svg>
    </i>
  ) : (
    <img
      className="pick-fighter-thumbnail"
      src={source}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  if (!shaneContender) return photo;

  return (
    <span className="pick-fighter-thumbnail-wrap is-shane-contender">
      {photo}
      <ShaneContenderBadge fighters={[shaneContender]} />
    </span>
  );
}
