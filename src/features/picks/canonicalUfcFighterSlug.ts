// One canonical identity owner for historic import/spelling variants.
// Prefer the published card identity for Picks storage; normalize only asset and
// Shane's Contender Series lookups, never silently rewrite an existing pick.
const knownVariants = new Map<string, string>([
  ["abdulrakhman-yakhyaev", "abdul-rakhman-yakhyaev"],
]);

export function canonicalUfcFighterSlug(slug: string): string {
  return knownVariants.get(slug) ?? slug;
}
