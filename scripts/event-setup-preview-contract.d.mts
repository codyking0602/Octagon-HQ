export interface PreviewBout {
  bout_id: string;
  weight_class: string;
  red_fighter_name: string;
  blue_fighter_name: string;
}

export interface PreviewEvent {
  name: string;
  subtitle: string;
  venue: string;
  location: string;
  starts_at: string;
  locks_at: string;
  source_url: string;
  bouts: PreviewBout[];
}

export interface SourceIdentityDetails {
  conflicts: string[];
  normalizedUfcEvent: Record<string, unknown>;
  normalizedArticleEvent: Record<string, unknown>;
}

export interface SourceRolloverRejection {
  code: string;
  stage: string;
  safeDetails: SourceIdentityDetails;
}

export function assertCurrentEventPreview(event: PreviewEvent, now?: Date): void;
export function assertSafeEventSourceRollover(body: SourceRolloverRejection): void;
export function expectedSourceChanges(current: PreviewEvent, event: PreviewEvent): string[];
export function assertReportedSourceChanges(current: PreviewEvent, event: PreviewEvent, reported: string[]): void;
