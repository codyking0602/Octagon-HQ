/** Six-month UFC Sports Feud review—these rows must not enter live Daily without certification. */
export const UFC_SPORTS_FEUD_SIX_MONTH_EDITORIAL = [
  {
    "id": "ufc-v2-main7-hof-contributors",
    "decision": "advance",
    "semanticFamily": "ufc-hall-contributor-honorees",
    "reason": "Official UFC Hall of Fame Contributor Wing roster; finite historical answer universe"
  },
  {
    "id": "ufc-v2-fast7-belt-design",
    "decision": "advance",
    "semanticFamily": "ufc-title-belt-appearance",
    "reason": "Concrete design details specific to the UFC title belt; belt version must be verified"
  },
  {
    "id": "ufc-v2-fast7-arena-amenities",
    "decision": "advance",
    "semanticFamily": "ufc-arena-guest-services",
    "reason": "Attendee services are intuitive but must not penalize legitimate arena-specific answers"
  },
  {
    "id": "ufc-v2-fast7-fan-access-passes",
    "decision": "hold",
    "semanticFamily": "ufc-event-worker-credentials",
    "reason": "Related to event jobs and backstage access; one semantic family, not fresh every appearance"
  },
  {
    "id": "ufc-v2-fast7-stream-troubleshooting",
    "decision": "advance",
    "semanticFamily": "ufc-digital-viewing-problems",
    "reason": "Clearly distinct technical errors while watching events; accessible Fast Money"
  },
  {
    "id": "ufc-v2-fast7-event-transport",
    "decision": "advance",
    "semanticFamily": "ufc-event-travel-modes",
    "reason": "Distinct fan logistics but generic; additional modes accepted"
  },
  {
    "id": "ufc-v2-fast7-premium-ticket",
    "decision": "hold",
    "semanticFamily": "ufc-event-ticket-selection",
    "reason": "Overlaps prior ticket shopping, event ticket details and spectator amenities"
  },
  {
    "id": "ufc-v2-fast7-mma-gyms",
    "decision": "hold",
    "semanticFamily": "ufc-famous-training-gyms",
    "reason": "Overlaps canonical legacy Main gym/team name board, keep as an alternate not extra semantic slot"
  },
  {
    "id": "ufc-v2-fast7-fight-night-schedule",
    "decision": "hold",
    "semanticFamily": "ufc-event-ticket-selection",
    "reason": "Overlaps existing planning/ticket shopping boards"
  },
  {
    "id": "ufc-v2-fast7-results-page",
    "decision": "hold",
    "semanticFamily": "ufc-broadcast-results-details",
    "reason": "Overlap UFC TV graphics and fight statistic boards"
  },
  {
    "id": "ufc-v2-fast7-belt-colors",
    "decision": "advance",
    "semanticFamily": "mma-martial-arts-rank-belt-colors",
    "reason": "Easy and concrete rank-colors recalled from combat-sport classes, subject to rule-set review"
  },
  {
    "id": "ufc-v2-fast7-international-paperwork",
    "decision": "hold",
    "semanticFamily": "ufc-fighter-travel-equipment",
    "reason": "Overlap packing and fight-week travel documentation"
  },
  {
    "id": "ufc-v2-fast7-fighter-replay",
    "decision": "hold",
    "semanticFamily": "ufc-fight-broadcast-moments",
    "reason": "Repeats broadcast/replay and crowd cheer recall task"
  },
  {
    "id": "ufc-v2-main8-pro-kickboxing",
    "decision": "hold",
    "semanticFamily": "ufc-fighters-professional-boxing-and-kickboxing-crossovers",
    "reason": "Factually promising, but same crossover-recall pattern as professional boxing and bare-knuckle candidates; use as alternative after athlete-by-athlete historical verification."
  },
  {
    "id": "ufc-v2-main8-grappling-world-titles",
    "decision": "advance",
    "semanticFamily": "ufc-fighters-international-grappling-world-honors",
    "reason": "Official UFC athlete biographies corroborate IBJJF and ADCC world accomplishments; every named fighter's exact event/title requires independent confirmation before release."
  }
] as const;
