export interface PickSetupBout {
  boutId: string;
  position: number;
  weightClass: string;
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  included: boolean;
}

export interface PickSetupDraft {
  draftId: string;
  source: string;
  sourceEventKey: string;
  sourceUrl: string | null;
  eventId: string;
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  startsAt: string | null;
  locksAt: string | null;
  season: number;
  state: "staged" | "published";
  syncedAt: string;
  updatedAt: string;
  warnings: string[];
  canPublish: boolean;
  bouts: PickSetupBout[];
}

export interface PickSetupMetadataPatch {
  event_id?: string;
  name?: string;
  subtitle?: string;
  venue?: string;
  location?: string;
  starts_at?: string;
  locks_at?: string;
  season?: number;
}

export interface PickSetupBoutInput {
  bout_id?: string;
  position: number;
  weight_class: string;
  red_fighter_slug?: string;
  red_fighter_name: string;
  blue_fighter_slug?: string;
  blue_fighter_name: string;
  included: boolean;
}
