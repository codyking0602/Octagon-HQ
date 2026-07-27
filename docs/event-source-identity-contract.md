# Event source identity contract

UFC.com exclusively supplies event identity, time, venue, and location. MMA Mania
exclusively supplies sectioned bouts and their order. Adapters collect evidence in
the order structured data, embedded state, semantic markup, then visible text.
Publication/update timestamps are retained separately and are never event dates.

The identity engine rejects a different explicit UFC number, an explicit event
date more than one calendar day from UFC's date (the one-day allowance covers a
local/UTC boundary), a card with no recognized section or 4–20 bouts, a non-MMA
Mania URL, or an article matching neither headliner. A numbered event is accepted
only with its exact number and a plausible sectioned card. A Fight Night requires
both full headliners plus date or location; abbreviated first names require both
surnames, date, and location. Generic “UFC Fight Night” is never sufficient.

Preview only builds a reviewed payload. Apply remains separately hash protected,
and publish remains a distinct owner operation. The exact article URL participates
in the source hash and is persisted only when the reviewed payload is applied.
