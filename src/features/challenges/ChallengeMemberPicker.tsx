import { useMemo, useState } from "react";
import type { MemberCardSummary } from "../members/memberProfilesModel";

function normalizeMemberName(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function challengeMemberOptions(
  members: readonly MemberCardSummary[],
  query: string,
  recentNames: readonly string[] = [],
) {
  const normalizedQuery = normalizeMemberName(query);
  const recentOrder = new Map(
    recentNames.map((name, index) => [normalizeMemberName(name), index]),
  );

  return members
    .filter((member) => !member.isCurrentUser)
    .filter((member) => (
      !normalizedQuery
      || normalizeMemberName(member.displayName).includes(normalizedQuery)
    ))
    .sort((left, right) => {
      const leftRecent = recentOrder.get(normalizeMemberName(left.displayName));
      const rightRecent = recentOrder.get(normalizeMemberName(right.displayName));
      if (leftRecent !== undefined || rightRecent !== undefined) {
        if (leftRecent === undefined) return 1;
        if (rightRecent === undefined) return -1;
        if (leftRecent !== rightRecent) return leftRecent - rightRecent;
      }
      return left.displayName.localeCompare(right.displayName);
    });
}

export function ChallengeMemberPicker({
  members,
  recentNames = [],
  selectedName = "",
  busy = false,
  onSelect,
}: {
  members: readonly MemberCardSummary[];
  recentNames?: readonly string[];
  selectedName?: string;
  busy?: boolean;
  onSelect: (member: MemberCardSummary) => void;
}) {
  const [query, setQuery] = useState("");
  const options = useMemo(
    () => challengeMemberOptions(members, query, recentNames),
    [members, query, recentNames],
  );
  const normalizedSelected = normalizeMemberName(selectedName);
  const recentSet = useMemo(
    () => new Set(recentNames.map(normalizeMemberName)),
    [recentNames],
  );

  return (
    <section className="challenge-member-picker" aria-label="Choose challenge opponent">
      <label className="challenge-member-picker__search">
        <span>CHOOSE MEMBER</span>
        <input
autoCapitalize="characters"
autoComplete="off"
placeholder="SEARCH MEMBERS"
value={query}
onChange={(event) => setQuery(event.target.value.toUpperCase())}
        />
      </label>

      <div className="challenge-dialog__profiles challenge-member-picker__list" role="listbox" aria-label="Octagon HQ members">
        {options.map((member) => {
const normalizedName = normalizeMemberName(member.displayName);
const selected = normalizedName === normalizedSelected;
return (
  <button
    className={selected ? "is-selected" : ""}
    type="button"
    role="option"
    aria-selected={selected}
    disabled={busy}
    key={member.displayName}
    onClick={() => onSelect(member)}
  >
    <i>
      {member.avatarPhotoData
        ? <img src={member.avatarPhotoData} alt={`${member.displayName} profile`} />
        : member.initials}
    </i>
    <span>
      <strong>{member.displayName}</strong>
      <small>{recentSet.has(normalizedName) ? "RECENT OPPONENT" : "OCTAGON HQ MEMBER"}</small>
    </span>
    <em aria-hidden="true" />
  </button>
);
        })}
        {!options.length ? (
<p className="challenge-member-picker__empty">
  {query ? "No members match that search." : "No other Octagon HQ members are available yet."}
</p>
        ) : null}
      </div>
    </section>
  );
}
