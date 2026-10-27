import { footballNflTeamMediaId } from "../back-room/footballMediaIdentity";
import { footballTeamAssets } from "../back-room/footballSubjectAssets";
import { sportsReferenceTeamIdentity } from "../home/footballTeamSportsReference";

/**
 * NFL GOTW is published from owner-selected team names, not authored per-week
 * logo URLs. Resolve all 32 franchises through the same canonical identity and
 * team marks already used elsewhere in Football HQ.
 */
export function footballNflMatchupTeamLogoUrl(teamName: string): string | null {
  const team = sportsReferenceTeamIdentity(teamName, "NFL");
  const code = team?.aliases?.[0];
  return code ? footballTeamAssets[footballNflTeamMediaId(code)]?.src ?? null : null;
}
