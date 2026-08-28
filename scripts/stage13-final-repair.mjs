import fs from "node:fs";

const path = "src/features/back-room/footballFactualStatsCore.ts";
const original = fs.readFileSync(path, "utf8");
const from = '  return projected.flatMap((record)=>{ const subjectId=canonicalFactSubjectId(record.subjectId); const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n';
const to = '  return projected.flatMap((record)=>{ const canonicalSubject=getFootballSubject(record.subjectId); if (!canonicalSubject) return []; const subjectId=canonicalSubject.id; const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n';

if (!original.includes(from)) {
  throw new Error(`Expected canonical gap-fill repair anchor missing in ${path}`);
}

fs.writeFileSync(path, original.replace(from, to));
console.log("Applied narrow Stage 13 canonical gap-fill repair.");
