import { eventNumber, fighterMatch, normalizeText, withinCalendarBoundary } from "./normalization.ts";

export interface NormalizedUfcEvent { canonicalEventKey:string; promotion:"UFC"; eventType:"numbered"|"fight-night"; eventNumber:string; eventName:string; headliners:string[]; startsAt:string; localEventDate:string; venue:string; city:string; region:string; country:string; canonicalUrl:string; extractionEvidence:string[] }
export interface NormalizedArticleEvent { canonicalUrl:string; articleTitle:string; explicitEventName:string; eventNumber:string; headliners:string[]; explicitEventDates:string[]; publicationDates:string[]; venueSignals:string[]; locationSignals:string[]; cardSections:string[]; bouts:Array<{section:string;red_fighter_name:string;blue_fighter_name:string;weight_class:string}>; extractionEvidence:string[] }
export interface IdentityResult { accepted:boolean; confidence:number; matchedSignals:string[]; conflicts:string[]; normalizedUfcEvent:NormalizedUfcEvent; normalizedArticleEvent:NormalizedArticleEvent; reason:string }

export function matchSourceIdentity(ufc:NormalizedUfcEvent, article:NormalizedArticleEvent):IdentityResult {
  const signals:string[] = [], conflicts:string[] = [];
  const plausible = article.cardSections.length > 0 && article.bouts.length >= 4 && article.bouts.length <= 20;
  if (!plausible) conflicts.push("implausible-or-unsectioned-card");
  if (!/^https:\/\/(?:www\.)?mmamania\.com\//i.test(article.canonicalUrl)) conflicts.push("non-mma-mania-url");
  if (ufc.eventNumber && article.eventNumber && ufc.eventNumber !== article.eventNumber) conflicts.push(`event-number:${article.eventNumber}!=${ufc.eventNumber}`);
  const expectedDay = ufc.localEventDate || ufc.startsAt.slice(0,10);
  if (article.explicitEventDates.length && !article.explicitEventDates.some((day) => withinCalendarBoundary(day, expectedDay))) conflicts.push(`event-date:${article.explicitEventDates.join(",")}!=${expectedDay}`);
  const articleNames = [...article.headliners, ...article.bouts.slice(0,1).flatMap((bout) => [bout.red_fighter_name,bout.blue_fighter_name])];
  const fullMatches = ufc.headliners.filter((name) => articleNames.some((candidate) => fighterMatch(name,candidate))).length;
  const surnameMatches = ufc.headliners.filter((name) => articleNames.some((candidate) => fighterMatch(name,candidate,true))).length;
  if (ufc.headliners.length === 2 && surnameMatches === 0) conflicts.push("neither-headliner-matches");
  const exactNumber = Boolean(ufc.eventNumber && article.eventNumber === ufc.eventNumber);
  if (exactNumber) signals.push("exact-event-number");
  if (fullMatches === 2) signals.push("both-headliners"); else if (fullMatches === 1) signals.push("one-headliner");
  const dateMatch = article.explicitEventDates.some((day) => withinCalendarBoundary(day,expectedDay)); if (dateMatch) signals.push("event-date");
  const placeText = normalizeText([...article.venueSignals,...article.locationSignals].join(" "));
  const places = [ufc.venue,ufc.city,ufc.country].filter((place) => normalizeText(place).length > 2 && placeText.includes(normalizeText(place)));
  if (places.length) signals.push("location");
  if (article.explicitEventName && normalizeText(article.explicitEventName).includes(normalizeText(ufc.eventName))) signals.push("event-branding");
  const numberedAccepted = ufc.eventType === "numbered" && exactNumber && plausible;
  const fightNightAccepted = ufc.eventType === "fight-night" && plausible && (fullMatches === 2 && (dateMatch || places.length > 0) || surnameMatches === 2 && dateMatch && places.length > 0);
  const accepted = conflicts.length === 0 && (numberedAccepted || fightNightAccepted);
  const confidence = Math.max(0, Math.min(100, (plausible?15:0)+(exactNumber?45:0)+(fullMatches*15)+(dateMatch?15:0)+(places.length?10:0)));
  return { accepted, confidence, matchedSignals:signals, conflicts, normalizedUfcEvent:ufc, normalizedArticleEvent:article, reason: accepted ? `Accepted deterministically: ${signals.join(", ")}.` : conflicts.length ? `Rejected: ${conflicts.join(", ")}.` : "Rejected: required deterministic identity signals were absent." };
}
