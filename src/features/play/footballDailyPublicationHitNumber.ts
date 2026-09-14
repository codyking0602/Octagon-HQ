import {
  createFootballHitTheNumberPlan,
  footballHitTheNumberActiveProgressionSlot,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberProgressionSlotSubjectIds,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  type FootballHitTheNumberPlan,
} from "../back-room/footballHitTheNumberModel";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

function dailyLeague(day: string) {
  return stableLineupHash(`${FOOTBALL_DAILY_RUNTIME_VERSION}|hit-the-number|${day}`) % 2 === 0 ? "NFL" : "CFB";
}

function buildDailyHitTheNumberPlan(day: string, scheduleVersion: string) {
  const desiredLeague = dailyLeague(day);
  for (let attempt = 0; attempt < 128; attempt += 1) {
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|hit-the-number|${scheduleVersion}|${day}|${attempt}`;
    const plan = createFootballHitTheNumberPlan(seed, "random-pool");
    if (plan.league !== desiredLeague) continue;
    if (plan.subjectIds.length !== footballHitTheNumberRandomPoolSize(plan.pickCount)) continue;
    const values = plan.subjectIds.map((id) => footballHitTheNumberValue(id, plan.metricId));
    if (values.every((value) => Number.isFinite(value))) return { plan, values };
  }
  throw new Error("Football Hit the Number could not build the official capped board.");
}

function hitTheNumberPublicState(
  plan: FootballHitTheNumberPlan,
  selectedIds: readonly string[],
  complete = false,
) {
  const activeSlot = complete ? null : footballHitTheNumberActiveProgressionSlot(plan, selectedIds);
  const availableIds = complete
    ? [...plan.subjectIds]
    : activeSlot
      ? footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedIds)
      : [...plan.subjectIds];
  return {
    complete,
    selected_ids: [...selectedIds],
    available_subject_ids: availableIds,
    active_slot: activeSlot ? { ...activeSlot, index: selectedIds.length } : null,
  };
}

function buildHitTheNumberSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const { plan, values } = buildDailyHitTheNumberPlan(day, scheduleVersion);
  const candidates = plan.subjectIds.map((id) => {
    const subject = getFootballHitTheNumberSubject(id);
    if (!subject) throw new Error(`Football Hit the Number subject ${id} is unavailable.`);
    return { id: subject.id, name: subject.name, subtitle: subject.subtitle };
  });
  const valueMap = Object.fromEntries(plan.subjectIds.map((id, index) => [id, values[index]]));
  return {
    setupKey: `${FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${plan.metricId}:${plan.pickCount}`,
    contentVersion: FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      league: plan.league,
      metric_id: plan.metricId,
      metric_label: plan.metricLabel,
      domain_label: plan.domainLabel,
      configuration_label: plan.configurationLabel,
      format_id: plan.formatId,
      target: plan.target,
      pick_count: plan.pickCount,
      slots: plan.slots,
      candidates,
      initial_state: hitTheNumberPublicState(plan, []),
    },
    revealSetup: { target: plan.target, values: valueMap },
    privateSetupEvidence: {
      fighter_ids: [...plan.subjectIds],
      pick_count: plan.pickCount,
      plan,
      progression_slot_subject_ids: footballHitTheNumberProgressionSlotSubjectIds(plan),
    },
    privateGradingEvidence: {
      fighter_ids: [...plan.subjectIds],
      target: plan.target,
      pick_count: plan.pickCount,
      values: valueMap,
    },
  };
}

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "hit_the_number") throw new Error("Football Hit the Number publication runtime received the wrong game type.");
  return persistenceSetup(gameType, day, scheduleVersion, buildHitTheNumberSetup(day, scheduleVersion));
}
