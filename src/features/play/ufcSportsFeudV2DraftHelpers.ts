import type { SportsFeudAuthoredAnswer, SportsFeudAuthoredQuestion } from "./sportsFeudBankTypes";

export interface UFCFeudDraft extends SportsFeudAuthoredQuestion {
  /** Official sources for historical boards; not used by the Daily publisher. */
  source?: readonly string[];
}
export interface UFCFeudDraftRow {
  id: string;
  lane: string;
  prompt: string;
  kind: "person" | "other";
  ranked: string;
  extras: string;
  aliases?: Readonly<Record<string, readonly string[]>>;
  source?: readonly string[];
}
const norm = (s: string) => s.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
export function makeUfcFeudDraft(rows: readonly UFCFeudDraftRow[]): readonly UFCFeudDraft[] {
  return rows.map(row => {
    const ranked = row.ranked.split("|").map(s => s.trim());
    if (ranked.length !== 8) throw new Error(row.id + " requires eight ranked answers");
    const rankedKeys = new Set(ranked.map(norm));
    if (rankedKeys.size !== 8) throw new Error(row.id + " has duplicate ranked answers");
    const extras = row.extras.split("|").map(s => s.trim()).filter(Boolean)
      .filter(s => !rankedKeys.has(norm(s)));
    const rankedAndExtras = [...ranked, ...extras];
    const ownerAliases = row.aliases ?? {};
    // Prevent one casual shorthand being attached to two independently scored
    // answers. Overlapping synonymous extras are merged into their owner.
    const aliasOwner = new Map<string, string>();
    for (const [name, aliases] of Object.entries(ownerAliases)) {
      if (!rankedAndExtras.includes(name)) throw new Error(row.id + " missing alias owner " + name);
      for (const alias of aliases) {
        const key = norm(alias), prior = aliasOwner.get(key);
        if (prior && prior !== name) throw new Error(row.id + " ambiguous alias " + alias);
        aliasOwner.set(key, name);
      }
    }
    const filtered = extras.filter(s => !aliasOwner.has(norm(s)) || aliasOwner.get(norm(s)) === s);
    const seen = new Set<string>();
    const make = (name: string): SportsFeudAuthoredAnswer => ({
      name,
      ...(ownerAliases[name]?.length ? { aliases: ownerAliases[name] } : {}),
    });
    const rankedAns = ranked.map(make);
    const also = filtered.filter(s => { const k = norm(s); if (seen.has(k)) return false; seen.add(k); return true; }).map(make);
    return {
      id: row.id, category: "ufc-feud-v2-" + row.lane,
      collisionGroup: "ufc-feud-v2-" + row.lane,
      prompt: row.prompt, entityKind: row.kind, answers: rankedAns,
      alsoAcceptedAnswers: also, ...(row.source?.length ? { source: row.source } : {}),
    };
  });
}
