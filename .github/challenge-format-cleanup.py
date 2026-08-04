from pathlib import Path


def replace_block(path: str, start_marker: str, end_marker: str, replacement: str) -> None:
    file = Path(path)
    text = file.read_text()
    start = text.index(start_marker)
    end = text.index(end_marker, start) + len(end_marker)
    file.write_text(text[:start] + replacement + text[end:])


replace_block(
    "src/components/BottomNavigation.tsx",
    "        <NavLink\nkey={destination.to}",
    "        </NavLink>",
    '''        <NavLink
          key={destination.to}
          to={destination.to}
          end={destination.end}
          onClick={(event) => {
            if (location.pathname !== destination.to) return;
            event.preventDefault();
            scrollPageToTop("smooth");
          }}
          className={({ isActive }) => (isActive ? "bottom-nav__item is-active" : "bottom-nav__item")}
        >
          <span className="bottom-nav__indicator" aria-hidden="true" />
          <NavigationIcon name={destination.icon} />
          <span className="bottom-nav__label">{destination.label}</span>
          {destination.to === "/war-room" && warRoom.unreadCount > 0 ? (
            <b
              className="bottom-nav__badge"
              aria-label={`${unreadLabel} unread War Room message${warRoom.unreadCount === 1 ? "" : "s"}`}
            >
              {unreadLabel}
            </b>
          ) : null}
        </NavLink>''',
)

replace_block(
    "src/features/challenges/ChallengeMemberPicker.tsx",
    "        <input\nautoCapitalize=\"characters\"",
    "        />",
    '''        <input
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="SEARCH MEMBERS"
          value={query}
          onChange={(event) => setQuery(event.target.value.toUpperCase())}
        />''',
)
replace_block(
    "src/features/challenges/ChallengeMemberPicker.tsx",
    "        {options.map((member) => {\nconst normalizedName",
    "        })}",
    '''        {options.map((member) => {
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
        })}''',
)
replace_block(
    "src/features/challenges/ChallengeMemberPicker.tsx",
    "        {!options.length ? (\n<p className=\"challenge-member-picker__empty\">",
    "        ) : null}",
    '''        {!options.length ? (
          <p className="challenge-member-picker__empty">
            {query ? "No members match that search." : "No other Octagon HQ members are available yet."}
          </p>
        ) : null}''',
)

replace_block(
    "src/features/challenges/ChallengeProvider.tsx",
    "        <header>\n<div>\n  <p className=\"eyebrow\">GAME CHALLENGE</p>",
    "        </header>",
    '''        <header>
          <div>
            <p className="eyebrow">GAME CHALLENGE</p>
            <h2 id="challenge-dialog-title">Challenge Someone</h2>
            <p>Choose any Octagon HQ member below. Search is optional.</p>
          </div>
          <button type="button" className="challenge-dialog__close" aria-label="Close challenge dialog" onClick={onClose}>×</button>
        </header>''',
)
replace_block(
    "src/features/challenges/ChallengeProvider.tsx",
    "        <div className=\"challenge-dialog__summary\">\n<span>",
    "        </div>",
    '''        <div className="challenge-dialog__summary">
          <span><small>{draft.gameTitle}</small><strong>{draft.summary}</strong></span>
          <b>LOCKED</b>
        </div>''',
)
replace_block(
    "src/features/challenges/ChallengeProvider.tsx",
    "        <ChallengeMemberPicker\nmembers={members}",
    "        />",
    '''        <ChallengeMemberPicker
          members={members}
          recentNames={recentProfileNames}
          selectedName={selectedName}
          busy={busy}
          onSelect={(member) => void lookupProfile(member.displayName, member.avatarPhotoData)}
        />''',
)
replace_block(
    "src/features/challenges/ChallengeProvider.tsx",
    "        <footer>\n<button type=\"button\" disabled={busy}",
    "        </footer>",
    '''        <footer>
          <button type="button" disabled={busy} onClick={() => void shareExternally()}>TEXT / SHARE LINK</button>
          <button type="button" className="primary-action" disabled={!recipient || busy} onClick={() => void sendToProfile()}>
            {busy ? "SENDING…" : "SEND TO PROFILE"}
          </button>
        </footer>''',
)

center = Path("src/features/challenges/ChallengeCenter.tsx")
center.write_text(
    center.read_text().replace(
        "              );\n\n\n              return (",
        "              );\n\n              return (",
        1,
    ),
)

Path(".github/workflows/apply-challenge-format-cleanup.yml").unlink(missing_ok=True)
Path(".github/workflows/run-challenge-format-cleanup.yml").unlink(missing_ok=True)
Path(".github/challenge-format-cleanup.py").unlink(missing_ok=True)
Path(".format-trigger").unlink(missing_ok=True)
