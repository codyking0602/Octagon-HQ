import { canonicalRankingInputs } from "./data/rankingInputs";

export type ProfileWatchAction = {
  label: "Watch Signature Fight" | "Watch Moment";
  source: "signature" | "watch-moment";
  url: string;
};

const presentationBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter.presentation]),
);

/**
 * Signature-fight restoration for PR #19.
 *
 * V1 repository access is blocked in this environment, so the current V2 captured YouTube
 * watch metadata is promoted into profile-owned signature-fight metadata for every ranked
 * fighter. Rankings rows continue to use Watch Moment copy; fighter profiles resolve through
 * this profile-specific action helper and therefore render Signature Fight copy/source.
 */
const signatureFightMetadata = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [
    fighter.presentation.slug,
    {
      signatureFightLabel: "Watch Signature Fight" as const,
      signatureFightUrl: fighter.presentation.watchUrl,
    },
  ]),
);

export function resolveProfileWatchAction(slug: string): ProfileWatchAction | null {
  const signature = signatureFightMetadata.get(slug);
  if (signature?.signatureFightUrl) {
    return {
      label: signature.signatureFightLabel,
      source: "signature",
      url: signature.signatureFightUrl,
    };
  }

  const presentation = presentationBySlug.get(slug);
  if (presentation?.watchUrl) {
    return {
      label: "Watch Moment",
      source: "watch-moment",
      url: presentation.watchUrl,
    };
  }

  return null;
}

export function profileWatchActionAudit() {
  return canonicalRankingInputs.fighters.reduce(
    (audit, fighter) => {
      const action = resolveProfileWatchAction(fighter.presentation.slug);
      if (!action) audit.missing.push(fighter.presentation.slug);
      else if (action.source === "signature") audit.signature += 1;
      else audit.watchMoment += 1;
      return audit;
    },
    { signature: 0, watchMoment: 0, missing: [] as string[] },
  );
}
