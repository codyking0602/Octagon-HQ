import type { UFCFeudDraft } from "./ufcSportsFeudV2DraftHelpers";
import { lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { UFC_SPORTS_FEUD_V2_MAIN_DRAFT } from "./ufcSportsFeudV2MainDraft";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH2 } from "./ufcSportsFeudV2MainBatch2";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH3 } from "./ufcSportsFeudV2MainBatch3";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH4 } from "./ufcSportsFeudV2MainBatch4";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5 } from "./ufcSportsFeudV2MainBatch5";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2MainBatch5Supplement";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH6 } from "./ufcSportsFeudV2MainBatch6";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH8 } from "./ufcSportsFeudV2MainBatch8";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH9 } from "./ufcSportsFeudV2MainBatch9";
import { UFC_SPORTS_FEUD_V2_MAIN_BATCH10 } from "./ufcSportsFeudV2MainBatch10";
import { UFC_SPORTS_FEUD_V2_FAST_DRAFT } from "./ufcSportsFeudV2FastDraft";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH2 } from "./ufcSportsFeudV2FastBatch2";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH3 } from "./ufcSportsFeudV2FastBatch3";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH4 } from "./ufcSportsFeudV2FastBatch4";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5 } from "./ufcSportsFeudV2FastBatch5";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT } from "./ufcSportsFeudV2FastBatch5Supplement";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH6 } from "./ufcSportsFeudV2FastBatch6";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH7 } from "./ufcSportsFeudV2FastBatch7";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH8 } from "./ufcSportsFeudV2FastBatch8";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH9 } from "./ufcSportsFeudV2FastBatch9";
import { UFC_SPORTS_FEUD_V2_FAST_BATCH10 } from "./ufcSportsFeudV2FastBatch10";
import { UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT, UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT } from "./ufcSportsFeudV2RetainedDraft";
import { UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES } from "./ufcSportsFeudV2LegacyRewriteCandidates";

/** This module is an editorial release gate. Neither list is imported by live Daily.
 * A first-pass advancing question is NOT equivalent to fact-checked approved.
 * No candidate becomes live merely because the staging total reaches a quota.
 */
export const UFC_V2_NEW_MAIN_DRAFTS: readonly UFCFeudDraft[] = [UFC_SPORTS_FEUD_V2_MAIN_DRAFT, UFC_SPORTS_FEUD_V2_MAIN_BATCH2, UFC_SPORTS_FEUD_V2_MAIN_BATCH3, UFC_SPORTS_FEUD_V2_MAIN_BATCH4, UFC_SPORTS_FEUD_V2_MAIN_BATCH5, UFC_SPORTS_FEUD_V2_MAIN_BATCH5_SUPPLEMENT, UFC_SPORTS_FEUD_V2_MAIN_BATCH6, UFC_SPORTS_FEUD_V2_MAIN_BATCH8, UFC_SPORTS_FEUD_V2_MAIN_BATCH9, UFC_SPORTS_FEUD_V2_MAIN_BATCH10].flat();
export const UFC_V2_NEW_FAST_DRAFTS: readonly UFCFeudDraft[] = [UFC_SPORTS_FEUD_V2_FAST_DRAFT, UFC_SPORTS_FEUD_V2_FAST_BATCH2, UFC_SPORTS_FEUD_V2_FAST_BATCH3, UFC_SPORTS_FEUD_V2_FAST_BATCH4, UFC_SPORTS_FEUD_V2_FAST_BATCH5, UFC_SPORTS_FEUD_V2_FAST_BATCH5_SUPPLEMENT, UFC_SPORTS_FEUD_V2_FAST_BATCH6, UFC_SPORTS_FEUD_V2_FAST_BATCH7, UFC_SPORTS_FEUD_V2_FAST_BATCH8, UFC_SPORTS_FEUD_V2_FAST_BATCH9, UFC_SPORTS_FEUD_V2_FAST_BATCH10].flat();

export const UFC_V2_HELD_IDS: ReadonlySet<string> = new Set([
  "ufc-v2-fast-faceoff-gestures",
  "ufc-v2-fast-retired-careers",
  "ufc-v2-fast-event-poster",
  "ufc-v2-fast-prefight-talk",
  "ufc-v2-main2-strikeforce-champions",
  "ufc-v2-main2-hof-fight-wing",
  "ufc-v2-fast2-combat-disciplines",
  "ufc-v2-fast2-ground-positions",
  "ufc-v2-fast2-postfight-requests",
  "ufc-v2-fast2-autograph-items",
  "ufc-v2-main3-ufc200-card",
  "ufc-v2-main3-tuf1-contestants",
  "ufc-v2-fast3-announcer-intro",
  "ufc-v2-fast3-fight-week-events",
  "ufc-v2-fast3-watch-devices",
  "ufc-v2-fast3-watch-places",
  "ufc-v2-fast3-fighter-travel",
  "ufc-v2-fast3-post-weighin-meals",
  "ufc-v2-fast3-crowd-cheers",
  "ufc-v2-fast3-between-fights-tv",
  "ufc-v2-fast3-first-minute",
  "ufc-v2-main4-anderson-silva-opponents",
  "ufc-v2-main4-bellator-ufc-veterans",
  "ufc-v2-fast4-crowd-boos",
  "ufc-v2-fast4-delay-causes",
  "ufc-v2-fast4-weight-class-switch",
  "ufc-v2-main5-bareknuckle-alumni",
  "ufc-v2-main5-title-by-strikes",
  "ufc-v2-fast5-us-host-states",
  "ufc-v2-fast5-film-study",
  "ufc-v2-fast5-prior-sports",
  "ufc-v2-fast5-fight-card-parts",
  "ufc-v2-fast5-fighter-gear-care",
  "ufc-v2-fast5-ufc-sponsors",
  "ufc-v2-main6-khabib-opponents",
  "ufc-v2-main6-ufc-fight-announcers",
  "ufc-v2-main6-legendary-venues",
  "ufc-v2-fast6-decision-announcements",
  "ufc-v2-fast6-mma-takedown-names",
  "ufc-v2-fast6-fight-clock-announcements",
  "ufc-v2-fast6-respect-after-bout",
  "ufc-v2-fast6-fan-postfight-check",
  "ufc-v2-fast6-arena-fan-gear",
  "ufc-v2-fast6-fight-night-roles",
  "ufc-v2-fast6-ufc-gym-promo",
  "ufc-v2-fast6-title-fight-honors",
  "ufc-v2-fast7-unretire-reasons",
  "ufc-v2-fast7-locker-mental-prep",
  "ufc-v2-fast7-doctor-no-clearance",
  "ufc-v2-fast7-big-card-promises",
  "ufc-v2-fast7-ufc-memory-shelf",
  "ufc-v2-fast7-ufc-fan-questions",
  "ufc-v2-fast7-title-shot-discussions",
  "ufc-v2-fast7-new-gym-first-day",
  "ufc-v2-fast8-fan-arena-facilities",
  "ufc-v2-fast8-sports-bar-etiquette",
  "ufc-v2-fast8-tattoo-placement",
  "ufc-v2-fast8-fan-favorites",
  "ufc-v2-fast8-ufc-marketing-places",
  "ufc-v2-fast8-cage-distractions",
  "ufc-v2-fast8-octagon-early-rules",
  "ufc-v2-fast8-mma-underdog-appeal",
  "ufc-v2-fast8-ufc-app-features",
  "ufc-v2-fast8-fighter-transport",
  "ufc-v2-fast8-gym-newcomer-concerns",
  "ufc-v2-fast8-mma-sparring-partners"
]);
// Only a complete reviewer fact/aliases signoff should add an ID here. The two
// lists intentionally start empty; staging is not production certification.
export const UFC_V2_APPROVED_MAIN_IDS: ReadonlySet<string> = new Set([]);
export const UFC_V2_APPROVED_FAST_IDS: ReadonlySet<string> = new Set([]);
const SEMANTIC_OVERRIDES: Readonly<Record<string,string>> = {
  // A ranked stats list and a legacy subjective list should not both ask
  // players to recall fundamentally the same pool of knockout/submission
  // specialists across one no-repeat cycle.
  "ufc-v2-retained-ufc-main-02-1": "ufc-knockout-identities",
  "ufc-v2-main9-ten-knockouts": "ufc-knockout-identities",
  "ufc-v2-retained-ufc-main-03-1": "ufc-submission-identities",
  "ufc-v2-main9-eight-submissions": "ufc-submission-identities",
  "ufc-v2-retained-ufc-main-04-1": "ufc-wrestling-identities",
  "ufc-v2-main10-career-takedowns": "ufc-wrestling-identities",
  "ufc-v2-main10-control-time": "ufc-wrestling-identities",
  "ufc-v2-retained-ufc-main-05-1": "ufc-striking-identities",
  "ufc-v2-main9-sig-strike-volume": "ufc-striking-identities",
  "ufc-v2-main9-twenty-wins": "ufc-career-volume-identities",
  "ufc-v2-main9-fight-appearances": "ufc-career-volume-identities",
  "ufc-v2-retained-ufc-fast2-06-1": "nationality-ufc-fighter-identities",
  "ufc-v2-retained-ufc-fast2-07-1": "nationality-ufc-fighter-identities",
  "ufc-v2-retained-ufc-fast3-08-1": "ufc-broadcast-personalities",
  "ufc-v2-retained-ufc-main-20-1": "ufc-fighter-culture",
  "ufc-v2-retained-ufc-fast5-05-1": "ufc-fighter-culture",
  "ufc-v2-main3-ufc100-card": "numbered-ufc-event-roster",
  "ufc-v2-main3-ufc300-card": "numbered-ufc-event-roster",
  "ufc-v2-main4-mcgregor-opponents": "named-ufc-fighter-opponents",
  "ufc-v2-main4-amanda-nunes-opponents": "named-ufc-fighter-opponents",
  "ufc-v2-main4-anderson-silva-opponents": "named-ufc-fighter-opponents",
  "ufc-v2-main6-khabib-opponents": "named-ufc-fighter-opponents",
  "ufc-v2-main3-ufc200-card": "numbered-ufc-event-roster",
  "ufc-v2-fast3-canadian-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast3-australia-nz-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast4-canadian-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast4-australia-nz-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast5-japanese-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast5-korean-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast5-polish-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast5-chinese-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-fast5-french-fighters": "nationality-ufc-fighter-identities",
  "ufc-v2-main2-wec-champions": "former-promotion-title-holders",
  "ufc-v2-main2-strikeforce-champions": "former-promotion-title-holders",
  "ufc-v2-main6-ufc-fight-announcers": "ufc-broadcast-personalities",
  "ufc-v2-main6-ex-fighter-analysts": "ufc-broadcast-personalities",
  "ufc-v2-fast3-fight-cancel": "fight-cancellation-causes",
  "ufc-v2-fast4-delay-causes": "fight-cancellation-causes",
  "ufc-v2-fast7-change-gym-reasons": "fighter-career-change",
  "ufc-v2-fast7-retirement-reasons": "fighter-retirement",
  "ufc-v2-fast7-unretire-reasons": "fighter-retirement"
};

export function ufcFeudSemanticFamily(question: {id:string;collisionGroup?:string;category:string}) {
  if (SEMANTIC_OVERRIDES[question.id]) return SEMANTIC_OVERRIDES[question.id]!;
  // Fighter nationality is one recall concept regardless of country label.
  if (/^ufc-v2-fast5-(japanese|korean|polish|chinese|french)-fighters$/.test(question.id))
    return "nationality-ufc-fighter-identities";
  return question.collisionGroup ?? question.category;
}
export function ufcV2ProvisionalInventory() {
  const newMain=UFC_V2_NEW_MAIN_DRAFTS.filter(q=>!UFC_V2_HELD_IDS.has(q.id));
  const newFast=UFC_V2_NEW_FAST_DRAFTS.filter(q=>!UFC_V2_HELD_IDS.has(q.id));
  // Legacy KEEP rows still require full fact/alias verification: estimates only.
  const potentialMain=[...newMain,...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT];
  const potentialFast=[...newFast,...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT];
  return {
    authoredNewMain: UFC_V2_NEW_MAIN_DRAFTS.length,
    authoredNewFast: UFC_V2_NEW_FAST_DRAFTS.length,
    stagedLegacyKeepMain: UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT.length,
    stagedLegacyKeepFast: UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT.length,
    unapprovedLegacyRewrites: UFC_SPORTS_FEUD_V2_LEGACY_REWRITE_CANDIDATES.length,
    provisionalMainRows: potentialMain.length,
    provisionalFastRows: potentialFast.length,
    provisionalMainFamilies: new Set(potentialMain.map(ufcFeudSemanticFamily)).size,
    provisionalFastFamilies: new Set(potentialFast.map(ufcFeudSemanticFamily)).size,
    heldNew: UFC_V2_HELD_IDS.size,
  };
}
const MS_PER_DAY=86400000;
const toDay=(d:Date)=>d.toISOString().slice(0,10);
export function ufcFeudAppearanceDatesInWindow(firstInclusive:string,lastExclusive:string) {
  const start=Date.parse(firstInclusive+"T00:00:00Z");
  const end=Date.parse(lastExclusive+"T00:00:00Z");
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)
    throw new Error("Invalid chronological UFC six-month window");
  const result:string[]=[];
  for(let time=start;time<end;time+=MS_PER_DAY){
    const day=toDay(new Date(time));
    if(lockedWeightedGameForDay("ufc",day)==="sports_feud") result.push(day);
  }
  return result;
}
export function ufcFeudSixMonthReleaseReadiness(
  firstInclusive="2026-10-24",lastExclusive="2027-04-24",
) {
  const days=ufcFeudAppearanceDatesInWindow(firstInclusive,lastExclusive);
  const inventory=ufcV2ProvisionalInventory();
  const needMain=days.length*2,needFast=days.length*5;
  // Counts come only from explicitly reviewer-approved IDs, never candidate totals.
  const mainApproved=[...UFC_V2_NEW_MAIN_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_MAIN_DRAFT]
    .filter(q=>UFC_V2_APPROVED_MAIN_IDS.has(q.id)&&!UFC_V2_HELD_IDS.has(q.id));
  const fastApproved=[...UFC_V2_NEW_FAST_DRAFTS,...UFC_SPORTS_FEUD_V2_RETAINED_FAST_DRAFT]
    .filter(q=>UFC_V2_APPROVED_FAST_IDS.has(q.id)&&!UFC_V2_HELD_IDS.has(q.id));
  const mainFamilies=new Set(mainApproved.map(ufcFeudSemanticFamily));
  const fastFamilies=new Set(fastApproved.map(ufcFeudSemanticFamily));
  const approvedMainFamilies=mainFamilies.size;
  const approvedFastFamilies=fastFamilies.size;
  const approvedUnionFamilies=new Set([...mainFamilies,...fastFamilies]).size;
  return {
    ...inventory,appearanceDates:days,appearanceCount:days.length,
    neededMainFamilies:needMain,neededFastFamilies:needFast,
    provisionalMainShortfall:Math.max(0,needMain-inventory.provisionalMainFamilies),
    provisionalFastShortfall:Math.max(0,needFast-inventory.provisionalFastFamilies),
    approvedMainFamilies,approvedFastFamilies,approvedUnionFamilies,
    ready:approvedMainFamilies>=needMain&&approvedFastFamilies>=needFast&&approvedUnionFamilies>=needMain+needFast,
  };
}
