// Read-only execution health must never be confused with source certification
// or permission to publish a revised Wheel snapshot.
export function describeMonitoringOutcome({readiness,staged,decisions,ratingReviewDue}) {
  if (!readiness || !Array.isArray(readiness.blockers) || !staged?.stages ||
      !Array.isArray(decisions)) throw new Error("Complete monitoring classifications required");
  const openReviews=decisions.filter(x=>x.classification!=="no-meaningful-change");
  const stageStates=Object.fromEntries(
    Object.entries(staged.stages).map(([key,value])=>[key,{
      status:value.status,certified:value.certified===true,
    }]),
  );
  const snapEvaluable=staged.stages.performance?.jointlyEvaluable;
  const evidenceLimited=Number.isInteger(snapEvaluable)
    ?Math.max(0,594-snapEvaluable):null;
  const verifiedTeamAffiliations=decisions.filter(row=>row.sport==="nfl" &&
    row.signals?.some(s=>s.kind==="verified-mismatched-team-affiliation"));
  const uncertainRosters=decisions.filter(row=>row.sport==="nfl" &&
    row.signals?.some(s=>["roster-absence-not-proof-of-release",
      "baseline-roster-identity-missing",
      "possible-transfer-name-match-requires-espn-id"].includes(s.kind)));
  return {
    execution:{status:"completed",mode:"read-only",publicationAttempted:false},
    sourceQuality:{status:readiness.snapshotReady?"source-certified":"review-held-or-incomplete",
      stageStates},
    reviewExceptions:{status:openReviews.length||readiness.blockers.length?"open":"none",
      actionableFindings:openReviews.length,publicationHolds:readiness.blockers.length},
    publication:{status:readiness.snapshotReady?"snapshot-eligible":"withheld",
      eligible:readiness.snapshotReady,blockers:readiness.blockers},
    nflRatingEvidence:{cadence:"biweekly",due:ratingReviewDue===true,
      insufficientCombinedEvidence:evidenceLimited,
      policy:"retain-existing-grade-without-meaningful-evidence"},
    nflTransactions:{cadence:"weekly",providerIdMatchedTeamChangeCount:verifiedTeamAffiliations.length,
      pendingRosterIdentityReviewCount:uncertainRosters.length,
      mode:"factual-only-no-automatic-pool-or-rating-changes"},
  };
}
