export interface EngagementUpdateDefinition {
  id: string;
  title: string;
  summary: string;
  route: string;
  actionLabel: string;
}

// App-level challenge formats belong here when they become a permanent feature.
// Personal profile-to-profile challenge deliveries stay private and are never
// published into the global What's New feed.
export const challengeUpdates: readonly EngagementUpdateDefinition[] = [];

// Add only meaningful, permanent badges or achievements that users can earn or
// collect in Octagon HQ. Minor stat labels and routine UI polish do not belong here.
export const achievementUpdates: readonly EngagementUpdateDefinition[] = [];
