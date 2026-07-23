export const brand = {
  name: "Octagon HQ",
  logoUrl: "https://codyking0602.github.io/ufc-goat-rankings/assets/app-icon.png",
  legacyFighterAssetBase: "https://codyking0602.github.io/ufc-goat-rankings/assets/fighters",
} as const;

export function fighterAsset(slug: string, kind: "thumb" | "profile" = "profile") {
  const suffix = kind === "thumb" ? "-thumb.webp" : ".webp";
  return `${brand.legacyFighterAssetBase}/${slug}${suffix}`;
}
