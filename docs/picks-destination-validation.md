# Picks destination validation

The canonical Picks event and recap URLs are consumed by the existing `PicksSeasonHub` owner.

Focused validation covers:

- known archived event resolution;
- exact recap requests;
- unknown and incomplete targets;
- unsupported view values;
- archive opening and Events-tab handoff;
- no browser-storage or duplicate navigation fallback.

The current active card remains owned by the main Picks screen and requires no second route or state owner.
