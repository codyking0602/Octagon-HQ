import { z } from "zod";
import type { PickSetupBout, PickSetupSourcePreview, PickSetupSpotlight } from "./pickSetupModel";

export type UfcPrepStatus = "ready" | "review-needed" | "blocked";
export type UfcPrepEventKind = "fight-night" | "numbered";
export type UfcPrepCardScope = "main" | "main-prelims";
export type UfcPrepBoutSection = "main-event" | "main" | "prelim";

export interface UfcPrepBout {
  boutId: string;
  position: number;
  section: UfcPrepBoutSection;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
}

export interface UfcPrepAsset {
  fighterSlug: string;
  fighterName: string;
  thumbReady: boolean;
  spotlightReady: boolean;
  thumbPath: string;
  spotlightPath: string;
}

export interface UfcPickPrep {
  prepId: string;
  sourceEventKey: string;
  sourceUrl: string;
  eventId: string;
  eventName: string;
  eventKind: UfcPrepEventKind;
  cardScope: UfcPrepCardScope;
  startsAt: string;
  status: UfcPrepStatus;
  preparedAt: string;
  verifiedAt: string;
  updatedAt: string;
  verificationNotes: string[];
  bouts: UfcPrepBout[];
  spotlights: PickSetupSpotlight[];
  assets: UfcPrepAsset[];
}

const prepBoutSchema = z.object({
  bout_id: z.string().min(1),
  position: z.number().int().positive(),
  section: z.enum(["main-event", "main", "prelim"]),
  weight_class: z.string(),
  red_fighter_slug: z.string().min(1),
  red_fighter_name: z.string().min(1),
  blue_fighter_slug: z.string().min(1),
  blue_fighter_name: z.string().min(1),
});

const prepFighterSchema = z.object({
  fighter_slug: z.string().min(1),
  record: z.string().min(1),
  age: z.string().min(1),
  height: z.string().min(1),
  reach: z.string().min(1),
  stance: z.string().min(1),
  edges: z.array(z.string().min(3)).min(1).max(3),
});

const prepSpotlightSchema = z.object({
  bout_id: z.string().min(1),
  preview: z.string().min(20),
  red: prepFighterSchema,
  blue: prepFighterSchema,
  watch_spotlights: z.array(z.object({
    fighter_slug: z.string().min(1),
    url: z.string().url(),
  })).max(2).default([]),
  source: z.literal("UFCStats"),
  generated_at: z.string().min(10),
});

const prepAssetSchema = z.object({
  fighter_slug: z.string().min(1),
  fighter_name: z.string().min(1),
  thumb_ready: z.boolean(),
  spotlight_ready: z.boolean(),
  thumb_path: z.string().default(""),
  spotlight_path: z.string().default(""),
});

const prepSchema = z.object({
  prep_id: z.string().uuid(),
  source_event_key: z.string().min(1),
  source_url: z.string().url(),
  event_id: z.string().min(1),
  event_name: z.string().min(1),
  event_kind: z.enum(["fight-night", "numbered"]),
  card_scope: z.enum(["main", "main-prelims"]),
  starts_at: z.string().min(10),
  status: z.enum(["ready", "review-needed", "blocked"]),
  prepared_at: z.string().min(10),
  verified_at: z.string().min(10),
  updated_at: z.string().min(10),
  verification_notes: z.array(z.string()).default([]),
  bouts: z.array(prepBoutSchema).min(1),
  spotlights: z.array(prepSpotlightSchema).default([]),
  assets: z.array(prepAssetSchema).default([]),
});

function mapSpotlight(value: z.infer<typeof prepSpotlightSchema>): PickSetupSpotlight {
  const fighter = (item: z.infer<typeof prepFighterSchema>) => ({
    fighterSlug: item.fighter_slug,
    record: item.record,
    age: item.age,
    height: item.height,
    reach: item.reach,
    stance: item.stance,
    edges: item.edges,
  });
  return {
    boutId: value.bout_id,
    preview: value.preview,
    red: fighter(value.red),
    blue: fighter(value.blue),
    watchSpotlights: value.watch_spotlights.map((watch) => ({
      fighterSlug: watch.fighter_slug,
      url: watch.url,
    })),
    source: value.source,
    generatedAt: value.generated_at,
  };
}

export function mapUfcPickPrep(value: unknown): UfcPickPrep | null {
  if (!value) return null;
  const parsed = prepSchema.parse(value);
  return {
    prepId: parsed.prep_id,
    sourceEventKey: parsed.source_event_key,
    sourceUrl: parsed.source_url,
    eventId: parsed.event_id,
    eventName: parsed.event_name,
    eventKind: parsed.event_kind,
    cardScope: parsed.card_scope,
    startsAt: parsed.starts_at,
    status: parsed.status,
    preparedAt: parsed.prepared_at,
    verifiedAt: parsed.verified_at,
    updatedAt: parsed.updated_at,
    verificationNotes: parsed.verification_notes,
    bouts: parsed.bouts.map((bout) => ({
      boutId: bout.bout_id,
      position: bout.position,
      section: bout.section,
      weightClass: bout.weight_class,
      redFighterSlug: bout.red_fighter_slug,
      redFighterName: bout.red_fighter_name,
      blueFighterSlug: bout.blue_fighter_slug,
      blueFighterName: bout.blue_fighter_name,
    })),
    spotlights: parsed.spotlights.map(mapSpotlight),
    assets: parsed.assets.map((asset) => ({
      fighterSlug: asset.fighter_slug,
      fighterName: asset.fighter_name,
      thumbReady: asset.thumb_ready,
      spotlightReady: asset.spotlight_ready,
      thumbPath: asset.thumb_path,
      spotlightPath: asset.spotlight_path,
    })),
  };
}

function pairKey(redSlug: string, blueSlug: string) {
  return [redSlug, blueSlug].sort().join("::");
}

function boutLabel(bout: PickSetupBout | UfcPrepBout) {
  return `${bout.redFighterName} vs. ${bout.blueFighterName}`;
}

export function preparedSpotlightForBout(prep: UfcPickPrep | null, bout: PickSetupBout) {
  if (!prep) return null;
  return prep.spotlights.find((spotlight) => (
    spotlight.boutId === bout.boutId
    && spotlight.red.fighterSlug === bout.redFighterSlug
    && spotlight.blue.fighterSlug === bout.blueFighterSlug
  )) ?? null;
}

export function preparedMainEventSpotlight(prep: UfcPickPrep | null, bouts: PickSetupBout[]) {
  if (!prep) return null;
  const prepMain = prep.bouts.find((bout) => bout.section === "main-event") ?? prep.bouts[0];
  if (!prepMain) return null;
  const draftBout = bouts.find((bout) => (
    pairKey(bout.redFighterSlug, bout.blueFighterSlug)
      === pairKey(prepMain.redFighterSlug, prepMain.blueFighterSlug)
  ));
  return draftBout ? preparedSpotlightForBout(prep, draftBout) : null;
}

export function compareUfcPrepToSource(prep: UfcPickPrep | null, preview: PickSetupSourcePreview | null) {
  if (!prep || !preview) return [];
  const changes: string[] = [];
  if (prep.sourceUrl.replace(/\/+$/, "") !== preview.sourceUrl.replace(/\/+$/, "")) {
    changes.push("EVENT SOURCE CHANGED SINCE PREP");
  }

  const prepared = new Map(prep.bouts.map((bout) => [pairKey(bout.redFighterSlug, bout.blueFighterSlug), bout]));
  const current = new Map(preview.event.bouts.map((bout) => [pairKey(bout.redFighterSlug, bout.blueFighterSlug), bout]));

  for (const [key, bout] of prepared) {
    if (!current.has(key)) changes.push(`REMOVED SINCE PREP: ${boutLabel(bout)}`);
  }
  for (const [key, bout] of current) {
    if (!prepared.has(key)) changes.push(`ADDED SINCE PREP: ${boutLabel(bout)}`);
  }

  if (!changes.some((change) => change.startsWith("REMOVED") || change.startsWith("ADDED"))) {
    const preparedOrder = prep.bouts.map((bout) => pairKey(bout.redFighterSlug, bout.blueFighterSlug)).join("|");
    const currentOrder = preview.event.bouts.map((bout) => pairKey(bout.redFighterSlug, bout.blueFighterSlug)).join("|");
    if (preparedOrder !== currentOrder) changes.push("FIGHT ORDER CHANGED SINCE PREP");
  }

  return changes;
}

export function prepAssetSummary(prep: UfcPickPrep | null) {
  if (!prep) return { thumbReady: 0, thumbTotal: 0, spotlightReady: 0, spotlightTotal: 0 };
  const mainCardSlugs = new Set(
    prep.bouts
      .filter((bout) => bout.section === "main-event" || bout.section === "main")
      .flatMap((bout) => [bout.redFighterSlug, bout.blueFighterSlug]),
  );
  return {
    thumbReady: prep.assets.filter((asset) => asset.thumbReady).length,
    thumbTotal: prep.assets.length,
    spotlightReady: prep.assets.filter((asset) => mainCardSlugs.has(asset.fighterSlug) && asset.spotlightReady).length,
    spotlightTotal: prep.assets.filter((asset) => mainCardSlugs.has(asset.fighterSlug)).length,
  };
}
