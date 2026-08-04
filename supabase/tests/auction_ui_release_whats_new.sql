begin;

do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from private.whats_new_items
  where source_key = 'games:release:auction';

  if v_count <> 1 then
    raise exception 'Expected exactly one canonical Auction release announcement, found %', v_count;
  end if;

  if not exists (
    select 1
    from private.whats_new_items
    where source_key = 'games:release:auction'
      and kind = 'new_game'
      and category = 'games'
      and title = 'Auction is now playable'
      and summary = 'Choose a UFC auction, bid privately, and build the stronger collection.'
      and route = '/play/auction'
      and action_label = 'PLAY AUCTION'
  ) then
    raise exception 'Auction release announcement does not match the approved public copy and route';
  end if;

  if exists (
    select 1
    from private.whats_new_items
    where kind = 'new_game'
      and source_key <> 'games:release:auction'
      and (
        source_key like 'games:new:%:auction'
        or lower(title) = 'auction is now playable'
      )
  ) then
    raise exception 'A duplicate Auction release announcement remains';
  end if;
end
$$;

rollback;
