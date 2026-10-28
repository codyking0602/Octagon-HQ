import type { PickEvent } from "../picks/picksModel";
import { pickBoutLocked } from "../picks/picksModel";
import type { WhatsNewItem } from "../whats-new/whatsNewModel";
import type { YourHqNextAction } from "./yourHqModel";

export type UpNextKind = "picks" | "daily" | "challenge" | "recap" | "event";

export interface UpNextAction extends YourHqNextAction {
  kind: UpNextKind;
  kicker: string;
  startsAt?: string;
}

interface BuildUpNextActionInput {
  signedIn: boolean;
  picksEvent: PickEvent | null;
  selections: Readonly<Record<string, string>>;
  playedToday: boolean;
  currentStreak: number;
  dailyChallengeTitle?: string;
  dailyChallengeRoute?: string;
  challengeAction: YourHqNextAction | null;
  whatsNewItems: readonly WhatsNewItem[];
}

function urgentPicksAction(
  event: PickEvent | null,
  selections: Readonly<Record<string, string>>,
): UpNextAction | null {
  if (!event || event.status !== "upcoming") return null;

  const actionableBouts = event.bouts.filter((bout) => (
    bout.includedInPicks !== false
      && (bout.resultStatus ?? "pending") !== "cancelled"
      && !pickBoutLocked(event, bout)
  ));
  const needsAttention = actionableBouts.filter((bout) => (
    bout.repickRequired === true || !selections[bout.boutId]
  ));
  if (!needsAttention.length) return null;

  const repickCount = needsAttention.filter((bout) => bout.repickRequired === true).length;
  const count = needsAttention.length;
  return {
    kind: "picks",
    kicker: "UFC PICKS",
    title: repickCount > 0
      ? `${repickCount} pick${repickCount === 1 ? "" : "s"} need an update`
      : `${count} pick${count === 1 ? "" : "s"} still open`,
    description: `${event.name} is next. Finish the open picks before they lock.`,
    label: repickCount > 0 ? "UPDATE UFC PICKS" : "FINISH UFC PICKS",
    to: "/picks",
    startsAt: event.startsAt,
  };
}

function dailyAction({
  playedToday,
  currentStreak,
  dailyChallengeTitle = "Today’s Challenge",
  dailyChallengeRoute = "/play",
}: Pick<
  BuildUpNextActionInput,
  "playedToday" | "currentStreak" | "dailyChallengeTitle" | "dailyChallengeRoute"
>): UpNextAction | null {
  if (playedToday) return null;
  return {
    kind: "daily",
    kicker: "TODAY’S CHALLENGE",
    title: currentStreak > 0
      ? `Keep your ${currentStreak}-day streak alive`
      : "Your daily challenge is ready",
    description: `${dailyChallengeTitle} is waiting for you.`,
    label: "PLAY TODAY’S CHALLENGE",
    to: dailyChallengeRoute,
  };
}

export function newestUnreadResultOrRecap(items: readonly WhatsNewItem[]) {
  return items.find((item) => (
    !item.isRead
      && item.lifecycle === "active"
      && (item.kind === "picks_event_completed" || item.kind === "new_recap")
  )) ?? null;
}

export function buildUpNextAction(input: BuildUpNextActionInput): UpNextAction | null {
  if (input.signedIn) {
    const picks = urgentPicksAction(input.picksEvent, input.selections);
    if (picks) return picks;

    const daily = dailyAction(input);
    if (daily) return daily;

    if (input.challengeAction) {
      return {
        ...input.challengeAction,
        kind: "challenge",
        kicker: "FRIEND CHALLENGE",
      };
    }

    const recap = newestUnreadResultOrRecap(input.whatsNewItems);
    if (recap) {
      return {
        kind: "recap",
        kicker: "NEW RESULT",
        title: recap.title,
        description: recap.summary,
        label: recap.actionLabel ?? "VIEW NEW RECAP",
        to: "/whats-new",
      };
    }
  }

  if (input.picksEvent && input.picksEvent.status !== "complete") {
    return {
      kind: "event",
      kicker: "NEXT SCHEDULED EVENT",
      title: input.picksEvent.name,
      description: input.picksEvent.subtitle || "The next UFC Picks event is scheduled.",
      label: "VIEW UFC PICKS",
      to: "/picks",
      startsAt: input.picksEvent.startsAt,
    };
  }

  return null;
}
