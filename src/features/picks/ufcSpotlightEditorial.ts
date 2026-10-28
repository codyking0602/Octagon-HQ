import type { PickSpotlight } from "./spotlightModel";

/** Retain complete, sourced sentences without inventing new tactics. */
export function conciseFightPreview(value:string,maxWords=75):string {
  const text=value.trim().replace(/\s+/g," ");
  if(!text)return "";
  const sentences=text.match(/[^.!?]+[.!?]+(?:[’'”"])?|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)??[text];
  const kept:string[]=[];let words=0;
  for(const sentence of sentences) {
    const count=sentence.split(/\s+/).length;
    if(kept.length>=3 || (kept.length>0 && words+count>maxWords))break;
    kept.push(sentence);words+=count;
  }
  return kept.join(" ");
}
/** Short factual edge labels, retaining the authored factual premise. */
export function conciseMatchupEdge(value:string):string {
  const text=value.trim().replace(/[.!]+$/,"");
  if(text.split(/\s+/).length<=9&&text.length<=68)return text;
  const clause=text.split(/;|,| — | against /i)[0].trim();
  if(clause.split(/\s+/).length<=9&&clause.length<=68)return clause;
  const cut=clause.split(/\s+/).slice(0,8).join(" ").replace(/\b(and|with|for|the|against|of|per|including)$/i,"").trim();
  return cut===text?cut:cut+"…";
}
export function conciseUfcSpotlight<T extends PickSpotlight>(spotlight:T):T {
  return {...spotlight,preview:conciseFightPreview(spotlight.preview),
    red:{...spotlight.red,edges:spotlight.red.edges.slice(0,3).map(conciseMatchupEdge)},
    blue:{...spotlight.blue,edges:spotlight.blue.edges.slice(0,3).map(conciseMatchupEdge)}} as T;
}
export function spotlightWithinEditorialLimits(spotlight:PickSpotlight):boolean {
  return spotlight.preview.trim().length>=20
    && spotlight.preview.trim().split(/\s+/).length<=75
    && (spotlight.preview.match(/[.!?](?:\s|$)/g)?.length??0)<=3
    && [spotlight.red.edges,spotlight.blue.edges].every(edges=>edges.length<=3
      && edges.every(edge=>edge.length<=68&&edge.trim().split(/\s+/).length<=9));
}
