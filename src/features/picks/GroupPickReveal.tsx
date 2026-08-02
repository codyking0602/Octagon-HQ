import { useId, useState } from "react";
import type { PickGroupPick } from "./picksModel";

interface GroupPickRevealProps {
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  picks: readonly PickGroupPick[];
}

type RevealGroupKey = "red" | "blue" | "missing";

export function GroupPickReveal({
  redFighterSlug,
  redFighterName,
  blueFighterSlug,
  blueFighterName,
  picks,
}: GroupPickRevealProps) {
  const [selectedGroupKey, setSelectedGroupKey] = useState<RevealGroupKey | null>(null);
  const detailId = useId();

  if (!picks.length) return null;

  const groups = [{
    key: "red" as const,
    label: redFighterName,
    members: picks.filter((pick) => pick.pickedFighterSlug === redFighterSlug),
  }, {
    key: "blue" as const,
    label: blueFighterName,
    members: picks.filter((pick) => pick.pickedFighterSlug === blueFighterSlug),
  }, {
    key: "missing" as const,
    label: "NO PICK",
    members: picks.filter((pick) => (
      pick.pickedFighterSlug !== redFighterSlug && pick.pickedFighterSlug !== blueFighterSlug
    )),
  }];
  const selectedGroup = groups.find((group) => group.key === selectedGroupKey) ?? null;

  return (
    <section className="picks-group-pick-reveal" aria-label="How everyone picked">
      <div className="picks-group-pick-reveal__heading">
        <span>HOW EVERYONE PICKED</span>
        <small>{picks.length} ENTERED</small>
      </div>

      <div className="picks-group-pick-reveal__split" aria-label="Group pick totals">
        {groups.map((group) => {
          const selected = group.key === selectedGroupKey;
          const count = group.members.length;
          return (
            <button
              type="button"
              className={selected ? "is-selected" : ""}
              aria-controls={detailId}
              aria-expanded={selected}
              aria-label={`${group.label}: ${count} ${count === 1 ? "pick" : "picks"}`}
              disabled={!count}
              key={group.key}
              onClick={() => setSelectedGroupKey(selected ? null : group.key)}
            >
              <span>{group.label}</span>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>

      {selectedGroup ? (
        <div className="picks-group-pick-reveal__detail" id={detailId}>
          <span>{selectedGroup.label}</span>
          <div>
            {selectedGroup.members.map((pick) => (
              <strong className={pick.isCurrentUser ? "is-current-user" : ""} key={pick.displayName}>
                {pick.displayName}{pick.isCurrentUser ? " · YOU" : ""}
              </strong>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
