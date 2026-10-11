/** Recover a dedicated season label from older immutable Daily setups.
 * The source still identifies the full player/team season; no scoring changes.
 */
export function footballDailyFindLeaderIdentity(
  name: string,
  storedDisplayName?: unknown,
  storedSeason?: unknown,
) {
  const suffix = name.match(/^(.*) (\d{4})$/);
  const prefix = name.match(/^(\d{4}) (.*)$/);
  const season = typeof storedSeason === "number" && Number.isInteger(storedSeason)
    ? storedSeason
    : suffix ? Number(suffix[2]) : prefix ? Number(prefix[1]) : null;
  const displayName = typeof storedDisplayName === "string" && storedDisplayName.trim()
    ? storedDisplayName
    : suffix ? suffix[1]! : prefix ? prefix[2]! : name;
  return { displayName, ...(season !== null ? { season } : {}) };
}
