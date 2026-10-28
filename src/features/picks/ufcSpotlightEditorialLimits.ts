/** Editorial limits for current and future UFC Picks fight spotlights. */
export const UFC_PREVIEW_WORD_LIMIT = 70;
export const UFC_PREVIEW_SENTENCE_LIMIT = 3;
export const UFC_EDGE_WORD_LIMIT = 8;

export function wordCount(value:string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}
export function previewSentences(value:string) {
  return value.trim().split(/(?<=[.!?])\s+(?=[A-Z“])/).filter(Boolean);
}
export function isConciseUfcEditorial(spotlight:{preview:string;red:{edges:string[]};blue:{edges:string[]}}) {
  return wordCount(spotlight.preview)>=20 && wordCount(spotlight.preview)<=UFC_PREVIEW_WORD_LIMIT
    && previewSentences(spotlight.preview).length<=UFC_PREVIEW_SENTENCE_LIMIT
    && [spotlight.red,spotlight.blue].every(f=>f.edges.length>0 && f.edges.length<=3
      && f.edges.every(edge=>wordCount(edge)<=UFC_EDGE_WORD_LIMIT && edge.length<=70));
}
/** Existing overlong published text gets a readable, factual display-only excerpt. */
export function conciseUfcPreview(value:string) {
  const sentences=previewSentences(value);
  const picked:string[]=[];
  for(const sentence of sentences.slice(0,UFC_PREVIEW_SENTENCE_LIMIT)) {
    if(wordCount([...picked,sentence].join(" "))>UFC_PREVIEW_WORD_LIMIT) break;
    picked.push(sentence);
  }
  if(picked.length) return picked.join(" ");
  const words=value.trim().split(/\s+/);
  return words.length>UFC_PREVIEW_WORD_LIMIT
    ? words.slice(0,UFC_PREVIEW_WORD_LIMIT).join(" ").replace(/[,:;]+$/,"")+"…"
    : value;
}
export function conciseUfcEdge(edge:string) {
  if(wordCount(edge)<=UFC_EDGE_WORD_LIMIT && edge.length<=70) return edge;
  const raw=edge.trim();
  const patterns:[RegExp,string][]=[
    [/submission.*(?:back.tak|threat)|back.tak.*submission|submission wins/i,"Submission grappling"],
    [/takedowns? per 15|chain.wrestling|wrestling pressure/i,"Wrestling pressure"],
    [/experience.*UFC|20 UFC fights|five.round.*experience/i,"Veteran experience"],
    [/height.*reach|reach.*height/i,"Height and reach"],
    [/southpaw.*strik/i,"Southpaw striking"],
    [/significant.strike.*volume|higher.*striking volume/i,"Striking volume"],
    [/five consecutive wins|five.fight surge/i,"Five-fight win streak"],
  ];
  for(const [pattern,label] of patterns) if(pattern.test(raw)) return label;
  const first=raw.split(/[,;:]/)[0].trim();
  if(wordCount(first)<=UFC_EDGE_WORD_LIMIT && first.length<=70) return first;
  return raw.split(/\s+/).slice(0,UFC_EDGE_WORD_LIMIT).join(" ").replace(/[,:;]+$/,"")+"…";
}
