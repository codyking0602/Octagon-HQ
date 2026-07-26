import type { PickGroupPick } from "./picksModel";

interface GroupPickRevealProps {
  redFighterSlug: string;
  redFighterName: string;
  blueFighterSlug: string;
  blueFighterName: string;
  picks: readonly PickGroupPick[];
}

function selectedFighterName({
  pickedFighterSlug,
  redFighterSlug,
  redFighterName,
  blueFighterSlug,
  blueFighterName,
}: PickGroupPick & Omit<GroupPickRevealProps, "picks">) {
  if (pickedFighterSlug === redFighterSlug) return redFighterName;
  if (pickedFighterSlug === blueFighterSlug) return blueFighterName;
  return "NO PICK";
}

export function GroupPickReveal({
  redFighterSlug,
  redFighterName,
  blueFighterSlug,
  blueFighterName,
  picks,
}: GroupPickRevealProps) {
  if (!picks.length) return null;

  const redCount = picks.filter((pick) => pick.pickedFighterSlug === redFighterSlug).length;
  const blueCount = picks.filter((pick) => pick.pickedFighterSlug === blueFighterSlug).length;
  const missingCount = picks.length - redCount - blueCount;

  return (
    <section className="picks-group-pick-reveal" aria-label="How everyone picked">
      <div className="picks-group-pick-reveal__heading">
        <span>HOW EVERYONE PICKED</span>
        <small>{picks.length} ENTERED</small>
      </div>

      <div className="picks-group-pick-reveal__split" aria-label="Group pick totals">
        <div>
          <span>{redFighterName}</span>
          <strong>{redCount}</strong>
        </div>
        <div>
          <span>{blueFighterName}</span>
          <strong>{blueCount}</strong>
        </div>
        {missingCount ? (
          <div>
            <span>NO PICK</span>
            <strong>{missingCount}</strong>
          </div>
        ) : null}
      </div>

      <div className="picks-group-pick-reveal__members">
        {picks.map((pick) => (
          <div className={pick.isCurrentUser ? "is-current-user" : ""} key={pick.displayName}>
            <strong>{pick.displayName}</strong>
            <span>{selectedFighterName({
              ...pick,
              redFighterSlug,
              redFighterName,
              blueFighterSlug,
              blueFighterName,
            })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
