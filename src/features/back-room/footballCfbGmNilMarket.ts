/**
 * HISTORICAL REFERENCE ONLY. This original generic prominence/role estimator is
 * NOT USED to price any of the 468 live College GM prospects. The owner-preview
 * engine reads the complete first-party, player-specific NIL authority instead.
 *
 * College GM NIL market estimate, not reported contract compensation.
 * Deliberately separate from HQ grades and development probabilities.
 * Inputs are the manually audited 2026 CFB wheel role ranking, school context,
 * and independently chosen game-only player prominence anchors.
 * No external NIL published valuations or third-party market ranks.
 * Budget selection MUST NOT affect estimates.
 */
export type CfbGmNilFamily = "QB" | "RB" | "WR" | "TE" | "Front Seven" | "Secondary";
export type CfbGmNilInput = {
  schoolId:string;
  name:string;
  family:CfbGmNilFamily;
  positionRoleRank:number;
  apRank:number;
};
export type CfbGmNilEstimate = {
  year1:number; year2Baseline:number;
  estimated:true;
  basis:"market-prominence-anchor"|"position-role-and-school-market";
  confidence:"medium"|"low";
};
const normalize=(name:string)=>name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");
const round25=(v:number)=>Math.round(v/25_000)*25_000;
const base:Record<CfbGmNilFamily,number>={
  QB:1_500_000,RB:600_000,WR:845_000,TE:430_000,
  "Front Seven":870_000,Secondary:615_000,
};
// Market-prominence judgment anchors. These are game estimates, not private
// deal disclosures or claims of exact NIL compensation. Source notes and audit
// are in docs/cfb-gm-nil-market-methodology-2026-10-08.md.
export const CFB_GM_NIL_MARKET_ANCHORS: Readonly<Record<string,number>>=Object.freeze({
  "texas|archmanning":4_200_000,
  "ohio-state|jeremiahsmith":5_000_000,
  "oregon|dantemoore":4_500_000,
  "lsu|samleavitt":4_400_000,
  "ole-miss|trinidadchambliss":3_950_000,
  "notre-dame|cjcarr":3_050_000,
  "georgia|gunnerstockton":3_100_000,
  "texas|colinsimmons":2_350_000,
  "texas|camcoleman":1_975_000,
  "texas|ryanwingo":1_850_000,
  "indiana|nickmarsh":1_750_000,
  "alabama|keelonrussell":2_300_000,
  "oregon|dakorienmoore":1_650_000,
  "miami|darianmensah":4_350_000,
  "miami|malachitoney":2_925_000,
  "ohio-state|juliansayin":3_125_000,
  "missouri|ahmadhardy":1_925_000,
  "notre-dame|leonardmoore":1_725_000,
  "ole-miss|kewanlacy":1_775_000,
  "georgia|ellisrobinsoniv":1_625_000,
  "byu|ljmartin":1_825_000,
});
const roleScale=[1,.78,.66,.55,.47,.4,.35] as const;
function scale(rank:number) { return roleScale[Math.max(0,Math.min(6,Number.isFinite(rank)?Math.floor(rank):6))]!; }
export function cfbGmEstimateNil(player:CfbGmNilInput):CfbGmNilEstimate {
  const id=player.schoolId+"|"+normalize(player.name);
  const anchored=CFB_GM_NIL_MARKET_ANCHORS[id];
  const brand=player.apRank<=7?1.16:player.apRank<=16?1.04:.93;
  const roleValue=round25(base[player.family]*scale(player.positionRoleRank)*brand);
  const year1=Math.max(150_000,anchored??roleValue);
  // Baseline market inflation is distinct from eventual seeded player
  // progression and individual offseason retention negotiations.
  const year2Baseline=round25(year1*1.10);
  return {year1,year2Baseline,estimated:true,
    basis:anchored?"market-prominence-anchor":"position-role-and-school-market",
    confidence:anchored?"medium":"low"};
}
