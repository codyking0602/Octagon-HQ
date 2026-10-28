export interface PickEventMemberProgress {
  profileId: string;
  displayName: string;
  completed: number;
  total: number;
  hasUnderdogLock: boolean;
  underdogLockBoutId: string | null;
  underdogLockFighterSlug: string | null;
  isCurrentUser: boolean;
}
