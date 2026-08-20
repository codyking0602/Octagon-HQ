begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_changed_rows integer;
  v_definition text;
begin
  if (select count(*) from private.auction_catalog_versions where is_preparation_version) <> 1
    or not exists (
      select 1
      from private.auction_catalog_versions
      where content_version = 'ufc-auction-2026-08-v5'
        and rarity_version = 'balanced-rarity-2026-08-v2'
        and grading_version = 'ufc-private-grader-2026-08-v2'
        and is_preparation_version
    )
  then
    raise exception 'v5 is not the single current Auction preparation snapshot';
  end if;

  if (select count(distinct mode_id) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v5') <> 14 then
    raise exception 'recognizability pass changed the current fourteen-mode catalog shape';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id in ('championship-performances', 'dominant-performances')
  ) then
    raise exception 'recognizability pass restored a retired performance mode';
  end if;

  if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v5')
    <> (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v4')
  then
    raise exception 'recognizability pass changed catalog row count';
  end if;

  if exists (
    select 1
    from private.auction_catalog v5
    join private.auction_catalog v4
      on v4.content_version = 'ufc-auction-2026-08-v4'
     and v4.mode_id = v5.mode_id
     and v4.item_reference = v5.item_reference
    where v5.content_version = 'ufc-auction-2026-08-v5'
      and (
        v5.rarity_band is distinct from v4.rarity_band
        or v5.generation_weight is distinct from v4.generation_weight
        or v5.private_generation_class is distinct from v4.private_generation_class
        or v5.grading_inputs is distinct from v4.grading_inputs
      )
  ) then
    raise exception 'PR2 changed scoring, rarity, or generation inputs';
  end if;

  select count(*) into v_changed_rows
  from private.auction_catalog v5
  join private.auction_catalog v4
    on v4.content_version = 'ufc-auction-2026-08-v4'
   and v4.mode_id = v5.mode_id
   and v4.item_reference = v5.item_reference
  where v5.content_version = 'ufc-auction-2026-08-v5'
    and (
      v5.display_label is distinct from v4.display_label
      or v5.display_description is distinct from v4.display_description
    );

  if v_changed_rows <> 15 then
    raise exception 'recognizability pass expected exactly 15 content-only replacements, found %', v_changed_rows;
  end if;

  if exists (
    select 1
    from private.auction_catalog v5
    join private.auction_catalog v4
      on v4.content_version = 'ufc-auction-2026-08-v4'
     and v4.mode_id = v5.mode_id
     and v4.item_reference = v5.item_reference
    where v5.content_version = 'ufc-auction-2026-08-v5'
      and (v5.display_label is distinct from v4.display_label or v5.display_description is distinct from v4.display_description)
      and v5.mode_id <> 'wars'
  ) then
    raise exception 'recognizability pass churned a category that was already above the content floor';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
      and display_label in (
        'Vicente Luque vs Bryan Barberena — UFC Fight Night 144',
        'Matt Brown vs Erick Silva — UFC Fight Night 40',
        'Josh Emmett vs Shane Burgos — UFC Vegas 3',
        'Mateusz Gamrot vs Arman Tsarukyan — UFC Vegas 57',
        'Matt Schnell vs Sumudaerji — UFC Long Island',
        'Nate Landwehr vs David Onama — UFC San Diego',
        'Pedro Munhoz vs Jimmie Rivera — UFC Fight Night 150'
      )
  ) then
    raise exception 'a reviewed deep-cut Wars row survived in v5';
  end if;

  if not exists (
    select 1 from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
      and display_label = 'Tony Ferguson vs Anthony Pettis — UFC 229'
  ) then
    raise exception 'Tony Ferguson vs Anthony Pettis recognizability boundary was lost';
  end if;

  if not exists (
    select 1 from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
      and display_label = 'Robbie Lawler vs Carlos Condit — UFC 195'
  ) or not exists (
    select 1 from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
      and display_label = 'Alex Pereira vs Khalil Rountree Jr. — UFC 307'
  ) or not exists (
    select 1 from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
      and display_label = 'Islam Makhachev vs Dustin Poirier — UFC 302'
  ) then
    raise exception 'recognizable replacement anchors are missing from Wars v5';
  end if;

  if exists (
    select display_label
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v5'
      and mode_id = 'wars'
    group by display_label
    having count(*) > 1
  ) then
    raise exception 'Wars v5 contains duplicate display labels';
  end if;

  if not exists (
    select 1 from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v4'
      and mode_id = 'wars'
      and item_reference = 'wars-26'
      and display_label = 'Vicente Luque vs Bryan Barberena — UFC Fight Night 144'
  ) then
    raise exception 'historical v4 Wars snapshot was mutated';
  end if;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  if v_definition not like '%ufc-auction-2026-08-v5%'
    or v_definition not like '%ufc-private-grader-2026-08-v2%'
  then
    raise exception 'canonical grader did not retain v2 grading while authorizing v5';
  end if;
end;
$$;

rollback;