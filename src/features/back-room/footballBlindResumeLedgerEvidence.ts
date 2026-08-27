import {
  footballBlindResumeEvidenceProfiles,
  validateFootballBlindResumeEvidenceProfile,
  type FootballBlindResumeEvidenceProfile,
} from "./footballBlindResumeEvidence";
import {
  footballBlindResumeEligibilityQuery,
} from "./footballComparisonLedgerAuthority";
import {
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";
import {
  resolveFootballSubjectReference,
} from "./footballSubjectRegistry";

function resolveBlindResumeProfileSubject(profile: FootballBlindResumeEvidenceProfile) {
  const pack = getFootballRankFivePack(profile.packId);
  const ratedItem = pack.items.find((item) => item.id === profile.subjectId);
  if (!ratedItem) return null;
  return resolveFootballSubjectReference(
    ratedItem.id,
    ratedItem.name,
    footballBlindResumeEligibilityQuery(profile.packId),
  );
}

/**
 * Blind Resume keeps its reviewed eight-row factual evidence packets, but the canonical registry now owns whether
 * the referenced player/coach/program/season identity is eligible to enter the casual matchup inventory.
 */
export function getFootballBlindResumeEvidenceProfilesForPack(
  packId: FootballRankFivePackId,
) {
  const seenCanonicalIds = new Set<string>();
  return footballBlindResumeEvidenceProfiles.filter((profile) => {
    if (profile.packId !== packId) return false;
    const subject = resolveBlindResumeProfileSubject(profile);
    if (!subject || seenCanonicalIds.has(subject.id)) return false;
    seenCanonicalIds.add(subject.id);
    return true;
  });
}

export function getFootballBlindResumeEvidenceProfile(
  packId: FootballRankFivePackId,
  subjectId: string,
) {
  const found = footballBlindResumeEvidenceProfiles.find(
    (profile) => profile.packId === packId && profile.subjectId === subjectId,
  );
  if (!found) {
    throw new Error(
      `Football Blind Resume has no factual evidence profile for ${packId}:${subjectId}.`,
    );
  }
  const validated = validateFootballBlindResumeEvidenceProfile(found);
  if (!resolveBlindResumeProfileSubject(validated)) {
    throw new Error(
      `Football Blind Resume factual evidence ${packId}:${subjectId} is outside the canonical casual-eligible ledger query.`,
    );
  }
  return validated;
}
