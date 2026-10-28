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
  where source_key = 'fighters-to-watch:new:bilal-hasan';

  if v_item_count <> 1 then
    raise exception 'Bilal production backfill did not create exactly one stable What''s New item';
  end if;

  select item.*
    into v_item
  from private.whats_new_items item
  where item.source_key = 'fighters-to-watch:new:bilal-hasan';

  if v_item.kind <> 'fighters_to_watch'
    or v_item.category <> 'fighters'
    or v_item.origin <> 'automatic'
    or v_item.title <> 'Bilal Hasan added to Fighters to Watch'
    or v_item.summary <> 'New #5. His UFC debut is August 29 against Nilson Rojas, and we’re tracking every UFC fight from day one.'
    or v_item.route <> '/fighters-to-watch'
    or v_item.action_label <> 'VIEW WATCHLIST' then
    raise exception 'Bilal production backfill has incorrect canonical feed content';
  end if;

  select count(*)::integer
    into v_legacy_count
  from private.whats_new_items
  where kind = 'fighters_to_watch'
    and source_key <> 'fighters-to-watch:new:bilal-hasan'
    and (
      source_key like 'fighters-to-watch:new:%:bilal-hasan'
      or lower(title) like 'bilal hasan%fighters to watch%'
    );

  if v_legacy_count <> 0 then
    raise exception 'Bilal production backfill left a duplicate legacy feed item';
  end if;

  select count(*)::integer
    into v_seen_count
  from private.fighters_to_watch_whats_new_seen
  where watch_id = 'bilal-hasan'
    and fighter_name = 'Bilal Hasan';

  if v_seen_count <> 1 then
    raise exception 'Bilal production backfill did not preserve durable seen-ID evidence';
  end if;
end;
$$;

rollback;
