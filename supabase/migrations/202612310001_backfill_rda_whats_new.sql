-- Guarantee Rafael dos Anjos is announced in What's New as a newly added ranked fighter.
-- This is a one-time idempotent data repair because RDA is already present in the
-- current ranking comparison snapshot and therefore cannot be rediscovered as new.

-- Remove any RDA-specific ranking-movement/update noise and any source-SHA keyed
-- duplicate new-fighter announcement before publishing one stable historical item.
delete from private.whats_new_items
where source_key <> 'rankings:new-fighter:rafael-dos-anjos'
  and (
    source_key like 'rankings:new-fighter:%:rafael-dos-anjos'
    or source_key like 'rankings:movement:%:rafael-dos-anjos'
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
  'rankings:new-fighter:rafael-dos-anjos',
  'new_fighter',
  'fighters',
  'automatic',
  'Rafael dos Anjos joined the rankings',
  'Now ranked #29 on the UFC Men''s GOAT board.',
  '/fighters/rafael-dos-anjos',
  'VIEW FIGHTER',
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
