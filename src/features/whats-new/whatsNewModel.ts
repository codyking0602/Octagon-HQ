export type WhatsNewLifecycle = "active" | "archive";

export type WhatsNewOrigin = "automatic" | "manual";

export type WhatsNewCategory =
  | "rankings"
  | "fighters"
  | "picks"
  | "games"
  | "challenges"
  | "community"
  | "app";

export type WhatsNewKind =
  | "new_fighter"
  | "ranking_movement"
  | "new_game"
  | "picks_event_completed"
  | "new_recap"
  | "fighters_to_watch"
  | "new_challenge"
  | "major_ranking_update"
  | "achievement"
  | "app_announcement"
  | "redesign"
  | "featured_content"
  | "poll"
  | "community_prompt"
  | "temporary_notice"
  | "weekly_summary"
  | "monthly_summary"
  | "rule_change";

export interface WhatsNewItem {
  id: string;
  sourceKey: string;
  kind: WhatsNewKind;
  category: WhatsNewCategory;
  origin: WhatsNewOrigin;
  title: string;
  summary: string;
  route: string | null;
  actionLabel: string | null;
  publishedAt: string;
  lifecycle: WhatsNewLifecycle;
  isRead: boolean;
}

export interface WhatsNewSnapshot {
  items: WhatsNewItem[];
  unreadCount: number;
  latestItemId: string | null;
}

const categoryLabels: Record<WhatsNewCategory, string> = {
  rankings: "Rankings",
  fighters: "Fighters",
  picks: "Picks",
  games: "Games",
  challenges: "Challenges",
  community: "Community",
  app: "Octagon HQ",
};

export function whatsNewCategoryLabel(category: WhatsNewCategory) {
  return categoryLabels[category];
}

export function formatWhatsNewAge(value: string, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
