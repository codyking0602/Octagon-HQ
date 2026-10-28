begin;

do $$
declare
  v_item_count integer;
  v_legacy_count integer;
  v_seen_count integer;
  v_item record;
begin
  select count(*)::integer
    into v_item_count
  from private.whats_new_items
  where source_key = 'fighters-to-watch:new:gable-steveson';

  if v_item_count <> 1 then
    raise exception 'Gable production backfill did not create exactly one stable What''s New item';
  end if;

  select item.*
    into v_item
  from private.whats_new_items item
  where item.source_key = 'fighters-to-watch:new:gable-steveson';

  if v_item.kind <> 'fighters_to_watch'
    or v_item.category <> 'fighters'
    or v_item.origin <> 'automatic'
    or v_item.title <> 'Gable Steveson added to Fighters to Watch'
    or v_item.route <> '/fighters-to-watch'
    or v_item.action_label <> 'VIEW WATCHLIST' then
    raise exception 'Gable production backfill has incorrect canonical feed content';
  end if;

  select count(*)::integer
    into v_legacy_count
  from private.whats_new_items
  where kind = 'fighters_to_watch'
    and source_key <> 'fighters-to-watch:new:gable-steveson'
    and (
      source_key like 'fighters-to-watch:new:%:gable-steveson'
      or lower(title) like 'gable steveson%fighters to watch%'
    );

  if v_legacy_count <> 0 then
    raise exception 'Gable production backfill left a duplicate legacy feed item';
  end if;

  select count(*)::integer
    into v_seen_count
  from private.fighters_to_watch_whats_new_seen
  where watch_id = 'gable-steveson'
    and fighter_name = 'Gable Steveson';

  if v_seen_count <> 1 then
    raise exception 'Gable production backfill did not preserve durable seen-ID evidence';
  end if;
end;
$$;

rollback;
