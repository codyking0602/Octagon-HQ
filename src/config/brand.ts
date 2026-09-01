export const brand = {
  name: "Octagon HQ",
  logoUrl: "/assets/the-hq-app-icon-v1.png",
  fighterAssetBase: "/assets/fighters",
} as const;

export function fighterAsset(slug: string, kind: "thumb" | "profile" = "profile") {
  const suffix = kind === "thumb" ? "-thumb.webp" : ".webp";
  return `${brand.fighterAssetBase}/${slug}${suffix}`;
}
