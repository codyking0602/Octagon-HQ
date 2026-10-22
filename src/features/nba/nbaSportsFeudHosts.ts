/**
 * Owner-approved NBA Sports Feud host uploads.
 * Source uploads on main: FC5D3A21-6F4B-47E0-AE5D-BDBAEEC73957.png, A2.webp, A3.webp.
 * Dedicated aliases retain their original encoded bytes (including transparency).
 * Keep Millionaire hosts and all Football/UFC host rotations unchanged.
 */
export const NBA_SPORTS_FEUD_HOSTS = [
  "/assets/sports-feud/nba-host-1.png",
  "/assets/sports-feud/nba-host-2.webp",
  "/assets/sports-feud/nba-host-3.webp",
] as const;

export function nbaSportsFeudHostAsset(appearanceIndex: number): string {
  const index = ((Math.trunc(appearanceIndex) % NBA_SPORTS_FEUD_HOSTS.length)
    + NBA_SPORTS_FEUD_HOSTS.length) % NBA_SPORTS_FEUD_HOSTS.length;
  return NBA_SPORTS_FEUD_HOSTS[index]!;
}
