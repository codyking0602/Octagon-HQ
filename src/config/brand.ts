export const brand = {
  name: "The HQ",
  logoUrl: "/assets/the-hq-app-icon-v2.png",
  fighterAssetBase: "/assets/fighters",
} as const;

export function fighterAsset(slug: string, kind: "thumb" | "profile" = "profile") {
  const suffix = kind === "thumb" ? "-thumb.webp" : ".webp";
  return `${brand.fighterAssetBase}/${slug}${suffix}`;
}
