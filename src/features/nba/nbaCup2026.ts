/** Official 2026 Emirates NBA Cup groups (NBA.com, Oct 27, 2026). */
export type CupGroupId = "EA"|"EB"|"EC"|"WA"|"WB"|"WC";
export type CupGroupPicks = Partial<Record<CupGroupId,string>>;
export const CUP_GROUPS = [
  {id:"EA",conference:"East",name:"East Group A",teams:["DET","TOR","ORL","MIL","BKN"]},
  {id:"EB",conference:"East",name:"East Group B",teams:["NYK","CLE","PHI","MIA","IND"]},
  {id:"EC",conference:"East",name:"East Group C",teams:["BOS","ATL","CHA","CHI","WAS"]},
  {id:"WA",conference:"West",name:"West Group A",teams:["DEN","HOU","PHX","DAL","UTA"]},
  {id:"WB",conference:"West",name:"West Group B",teams:["OKC","MIN","LAC","NOP","MEM"]},
  {id:"WC",conference:"West",name:"West Group C",teams:["SAS","LAL","POR","GSW","SAC"]},
] as const;
export const CUP_POINTS = {groups:30,quarterfinals:20,semifinals:20,champion:30} as const;
export function validCupPicks(value:unknown):value is CupGroupPicks {
  if(!value||typeof value!=="object"||Array.isArray(value))return false;
  return Object.entries(value).every(([group,team])=>{
    const g=CUP_GROUPS.find(x=>x.id===group);
    return !!g && typeof team==="string" && g.teams.some(id=>id===team);
  });
}
export function cupPickCount(picks:CupGroupPicks) {
  return CUP_GROUPS.filter(g=>!!picks[g.id]).length;
}