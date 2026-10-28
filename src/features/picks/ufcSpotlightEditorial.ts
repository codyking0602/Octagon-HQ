/** UFC Picks editorial house style: compact analysis, never fabricated facts.
 * The source preparation must pass the guard. Display-time reduction handles
 * previously published verbose spotlights while retaining full source records. */
export const UFC_PREVIEW_MIN_WORDS = 45;
export const UFC_PREVIEW_MAX_WORDS = 65;
export const UFC_EDGE_MAX_WORDS = 9;
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
export function ufcEditorialIssues(preview: string, edges: readonly string[]) {
  const issues:string[] = [];
  const count=words(preview).length;
  const sentences=(preview.match(/[.!?](?=\s|$)/g)??[]).length;
  if(count<UFC_PREVIEW_MIN_WORDS||count>UFC_PREVIEW_MAX_WORDS||sentences>3||sentences<2)
    issues.push("Preview needs 2–3 sentences, 45–65 words");
  if(edges.length!==3 || new Set(edges.map(e=>e.trim().toLowerCase())).size!==edges.length)issues.push("Each fighter needs exactly three distinct matchup edges");
  for(const edge of edges) {
    if(words(edge).length>UFC_EDGE_MAX_WORDS || edge.length>65)
      issues.push("An edge exceeds 9 words or 65 characters");
  }
  return issues;
}
export function compactUfcPreview(preview: string): string {
  const sentences=preview.trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)??[];
  const selected:string[]=[];
  for(const sentence of sentences) {
    if(selected.length===3)break;
    const count=words([...selected,sentence].join(" ")).length;
    if(count<=UFC_PREVIEW_MAX_WORDS){selected.push(sentence);continue;}
    if(selected.length>=2)break;
    const clauses=sentence.split(/(?<=[;,])\s+/);
    let partial="";
    for(const clause of clauses){
      if(words([...selected,partial,clause].join(" ")).length>UFC_PREVIEW_MAX_WORDS)break;
      partial=partial ? partial+" "+clause : clause;
    }
    if(partial)selected.push(partial.replace(/[;,]$/,".") );
    break;
  }
  return selected.length ? selected.join(" ") : preview;
}
export function compactUfcEdge(edge:string):string {
  const clean=edge.trim().replace(/[.!]$/,"")
    .replace(/\s*\(about\s+([0-9.]+)\s+landed per minute\)/i," ($1/min)");
  if(words(clean).length<=UFC_EDGE_MAX_WORDS && clean.length<=65)return clean;
  const pieces=clean.split(/[,;]|\s+(?:against|including|with|and|where)\s+/i);
  const shorter=pieces.find(p=>words(p).length>1 && words(p).length<=UFC_EDGE_MAX_WORDS && p.length<=65);
  if(shorter)return shorter.trim();
  const cut=words(clean).slice(0,UFC_EDGE_MAX_WORDS).join(" ");
  return cut.replace(/\b(?:and|or|against|with|the|a)$/i,"").trim()+"…";
}
