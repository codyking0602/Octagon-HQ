// Read-only reconciliation ledger. A canonical identity observed in the DB is
// not automatically matched to a live source, and a source match is not a
// certification of playing ability, performance, or an overall rating.
const SPORTS = ["nfl","cfb","ufc"];
const VERIFIED = "matched";
const KNOWN_UNVERIFIED = new Set([
  "missing", "ambiguous", "coaching-source-needed",
  "unranked-not-verified-by-ranked-table",
]);

export function buildSourceCoverageLedger(identities, approvedCounts) {
  if(!Array.isArray(identities) || !approvedCounts ||
    SPORTS.some(sport=>!Number.isInteger(approvedCounts[sport]) || approvedCounts[sport]<0))
    throw new Error("Canonical identity observations and approved sport counts required");
  const bySport={};
  const unresolved=[];
  for(const sport of SPORTS){
    const items=identities.filter(row=>row?.sport===sport);
    if(items.length>approvedCounts[sport])
      throw new Error("Observed "+sport+" identities exceed approved population");
    const statusCounts={};
    let matched=0;
    for(const row of items){
      const status=String(row.sourceStatus??"unclassified");
      statusCounts[status]=(statusCounts[status]??0)+1;
      if(status===VERIFIED) {matched++;continue;}
      unresolved.push({
        sport,team:row.team??null,division:row.division??null,
        family:row.family??null,name:row.name??null,
        sourceStatus:status,
        sourceUrl:row.sourceUrl??null,
        sourcePlayerId:row.sourcePlayerId??null,
        transferCandidateTeam:row.transferCandidateTeam??null,
        transferCandidateId:row.transferCandidateId??null,
        reason:KNOWN_UNVERIFIED.has(status)?status:"unclassified-source-status",
      });
    }
    bySport[sport]={
      approved:approvedCounts[sport],
      presentInCollector:items.length,
      notYetPresentInCollector:approvedCounts[sport]-items.length,
      matchedToComparedSource:matched,
      sourceUnverified:items.length-matched,
      sourceStatusCounts:statusCounts,
      matchedToComparedSourcePct:approvedCounts[sport]
        ? Math.round(10000*matched/approvedCounts[sport])/100 : null,
      abilityMonitoringCertified:false,
      detailedReviewAvoidanceCertified:false,
    };
  }
  return {bySport,unresolved,matchedDoesNotCertifyAbility:true};
}
