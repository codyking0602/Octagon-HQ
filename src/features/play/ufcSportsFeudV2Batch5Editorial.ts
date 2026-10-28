/** Source of truth for fifth-batch SEMANTIC topic groupings, not a live selector.
 * 'advance' means awaiting final fact/grade sign-off, NOT approved to publish.
 * A single family may contain several editorial boards but must occupy only one
 * slot during a future 20-appearance no-repeat cooldown.
 */
export type UfcFeudBatch5Decision = "advance" | "hold";
export interface UfcFeudBatch5EditorialEntry {
  readonly id: string;
  readonly semanticFamily: string;
  readonly decision: UfcFeudBatch5Decision;
  readonly reason: string;
}
export const UFC_SPORTS_FEUD_V2_BATCH5_EDITORIAL = [
  {
    "id": "ufc-v2-main5-dwcs-graduates",
    "semanticFamily": "contender-series-alumni",
    "decision": "advance",
    "reason": "Recognizable DWCS graduates; recheck every signed contract and aliases"
  },
  {
    "id": "ufc-v2-main5-ncaa-champs",
    "semanticFamily": "ncaa-division1-wrestling-champions",
    "decision": "advance",
    "reason": "Concrete NCAA championship result; corrected Kevin Jackson 1987 runner-up"
  },
  {
    "id": "ufc-v2-main5-military-vets",
    "semanticFamily": "military-veteran-fighters",
    "decision": "advance",
    "reason": "Official UFC coverage plus individual service histories"
  },
  {
    "id": "ufc-v2-main5-professional-boxers",
    "semanticFamily": "ufc-fighter-boxing-crossovers",
    "decision": "advance",
    "reason": "Verify sanctioned professional boxing bouts, not exhibitions"
  },
  {
    "id": "ufc-v2-main5-bareknuckle-alumni",
    "semanticFamily": "ufc-fighter-boxing-crossovers",
    "decision": "hold",
    "reason": "Shares the crossover recall task with conventional boxing; can be a later alternative"
  },
  {
    "id": "ufc-v2-main5-title-by-strikes",
    "semanticFamily": "undisputed-title-winning-finish-methods",
    "decision": "hold",
    "reason": "Too close to existing Main title-winning submission board"
  },
  {
    "id": "ufc-v2-main5-ufc-siblings",
    "semanticFamily": "ufc-family-siblings",
    "decision": "advance",
    "reason": "Official UFC sibling profiles; adopted siblings included"
  },
  {
    "id": "ufc-v2-fast5-japanese-fighters",
    "semanticFamily": "nationality-fighter-recognition",
    "decision": "advance",
    "reason": "Same recall task as four other new nationality boards"
  },
  {
    "id": "ufc-v2-fast5-korean-fighters",
    "semanticFamily": "nationality-fighter-recognition",
    "decision": "advance",
    "reason": "Same nationality recall family; never a different 20-appearance topic"
  },
  {
    "id": "ufc-v2-fast5-polish-fighters",
    "semanticFamily": "nationality-fighter-recognition",
    "decision": "advance",
    "reason": "Same nationality recall family; never a different 20-appearance topic"
  },
  {
    "id": "ufc-v2-fast5-chinese-fighters",
    "semanticFamily": "nationality-fighter-recognition",
    "decision": "advance",
    "reason": "Same nationality recall family; never a different 20-appearance topic"
  },
  {
    "id": "ufc-v2-fast5-french-fighters",
    "semanticFamily": "nationality-fighter-recognition",
    "decision": "advance",
    "reason": "Same nationality recall family; verify citizenship or representation"
  },
  {
    "id": "ufc-v2-fast5-us-host-states",
    "semanticFamily": "ufc-event-host-geography",
    "decision": "hold",
    "reason": "Overlaps existing event host country and venue question families"
  },
  {
    "id": "ufc-v2-fast5-historic-tv",
    "semanticFamily": "ufc-broadcast-distribution",
    "decision": "advance",
    "reason": "Historical carriers including 2026 Paramount+ and CBS"
  },
  {
    "id": "ufc-v2-fast5-scorecards",
    "semanticFamily": "ufc-judge-scorecard-details",
    "decision": "advance",
    "reason": "Concrete official judging record fields, not opinions"
  },
  {
    "id": "ufc-v2-fast5-film-study",
    "semanticFamily": "mma-scouting-criteria",
    "decision": "hold",
    "reason": "Unbounded qualitative things coaches might notice"
  },
  {
    "id": "ufc-v2-fast5-prior-sports",
    "semanticFamily": "mma-fighter-athletic-backgrounds",
    "decision": "hold",
    "reason": "Largely reuses existing combat discipline and training concepts"
  },
  {
    "id": "ufc-v2-fast5-fight-card-parts",
    "semanticFamily": "ufc-card-running-order",
    "decision": "hold",
    "reason": "Title fight is not a definite running-order slot; needs rewrite"
  },
  {
    "id": "ufc-v2-fast5-fighter-gear-care",
    "semanticFamily": "mma-training-gear",
    "decision": "hold",
    "reason": "Too generic and near-duplicates training equipment topic"
  },
  {
    "id": "ufc-v2-fast5-other-promotions",
    "semanticFamily": "mma-promotion-names",
    "decision": "advance",
    "reason": "Concrete MMA league names; not fighter names or crossover lists"
  },
  {
    "id": "ufc-v2-fast5-ufc-sponsors",
    "semanticFamily": "ufc-historical-commercial-partners",
    "decision": "hold",
    "reason": "Brand recognition feels promotional and partnership dates change"
  },
  {
    "id": "ufc-v2-fast5-ufc-programming",
    "semanticFamily": "ufc-original-fan-media-shows",
    "decision": "advance",
    "reason": "UFC-specific shows; distinct from event-brand broadcast types"
  }
] as const satisfies readonly UfcFeudBatch5EditorialEntry[];
