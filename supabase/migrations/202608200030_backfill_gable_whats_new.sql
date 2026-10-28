-- Guarantee the missed Gable Steveson Fighters to Watch announcement exists in production.
-- This is a one-time idempotent data repair. Future entries remain owned by the
-- canonical durable seen-ID synchronizer.

delete from private.whats_new_items
where kind = 'fighters_to_watch'
  and source_key <> 'fighters-to-watch:new:gable-steveson'
  and (
    source_key like 'fighters-to-watch:new:%:gable-steveson'
    or lower(title) like 'gable steveson%fighters to watch%'
  );

insert into private.whats_new_items (
  source_key,
  kind,
  category,
  origin,
  title,
  summary,
  route,
  action_label,
  published_at,
  created_at,
  updated_at
)
values (
  'fighters-to-watch:new:gable-steveson',
  'fighters_to_watch',
  'fighters',
  'automatic',
  'Gable Steveson added to Fighters to Watch',
  'Olympic wrestling with heavyweight explosiveness. He has the highest ceiling on the board.',
  '/fighters-to-watch',
  'VIEW WATCHLIST',
  now(),
  now(),
  now()
)
on conflict (source_key) do update
set kind = excluded.kind,
    category = excluded.category,
    origin = excluded.origin,
    title = excluded.title,
    summary = excluded.summary,
    route = excluded.route,
    action_label = excluded.action_label,
    published_at = excluded.published_at,
    updated_at = now();

insert into private.fighters_to_watch_whats_new_seen (
  watch_id,
  fighter_name,
  first_seen_sha,
  first_seen_at
)
values (
  'gable-steveson',
  'Gable Steveson',
  'fba223d1e485a64debaf3d873d45a14f45f68ad6',
  '2026-07-30T03:10:44Z'::timestamptz
)
on conflict (watch_id) do update
set fighter_name = excluded.fighter_name;

comment on table private.fighters_to_watch_whats_new_seen is
  'Durable historical evidence for Fighters to Watch IDs already synchronized or explicitly repaired into What''s New.';
