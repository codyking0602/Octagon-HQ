// Gate source observations separately from action/regrade classification.
// A successful read-only scan can keep an observation, but an unresolved
// identity/source integrity finding must never be promoted as fully certified.
export function sourceReviewBlockers(evidence, findings) {
  if(!Array.isArray(evidence) || !Array.isArray(findings))
    throw new Error("Complete monitor evidence and findings required");
  const blockers=new Set();
  for(const entry of evidence) {
    if(entry.type==="flex-inheritance-blocker")
      blockers.add("invalid-flex-priority:"+entry.sport+":"+entry.team+":"+entry.player);
    if(entry.type==="source-integrity-review")
      blockers.add("source-integrity-review:"+String(entry.source??"unknown"));
    if(entry.type==="factual-correction" &&
       Array.isArray(entry.newUnauditedSchools) && entry.newUnauditedSchools.length)
      blockers.add("cfb-unaudited-live-ap-schools:"+entry.newUnauditedSchools.length);
  }
  const missing={nfl:0,cfb:0,ufc:0};
  const coaching={nfl:0,cfb:0};
  const unranked={ufc:0};
  const unknown={nfl:0,cfb:0,ufc:0};
  for(const finding of findings) {
    if(!Object.hasOwn(missing,finding.sport)) continue;
    const status=finding.sourceStatus;
    if(status==="missing" || status==="ambiguous") missing[finding.sport]++;
    else if(status==="coaching-source-needed" && Object.hasOwn(coaching,finding.sport))
      coaching[finding.sport]++;
    else if(status==="unranked-not-verified-by-ranked-table" && finding.sport==="ufc")
      unranked.ufc++;
    else if(status!=="matched") unknown[finding.sport]++;
  }
  for(const [sport,count] of Object.entries(missing))
    if(count) blockers.add(sport+"-unresolved-source-identities:"+count);
  for(const [sport,count] of Object.entries(coaching))
    if(count) blockers.add(sport+"-coaching-source-unverified:"+count);
  if(unranked.ufc) blockers.add("ufc-unranked-source-unverified:"+unranked.ufc);
  for(const [sport,count] of Object.entries(unknown))
    if(count) blockers.add(sport+"-unclassified-source-identities:"+count);
  return [...blockers].sort();
}
