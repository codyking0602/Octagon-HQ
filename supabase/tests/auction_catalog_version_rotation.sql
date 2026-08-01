begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000c1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000c2';
  v_catalog_game constant uuid := '00000000-0000-0000-0000-0000000000c3';
  v_legacy_game constant uuid := '00000000-0000-0000-0000-0000000000c4';
  v_rejected boolean;
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-c1@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-c2@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (
    id,
    display_name,
    normalized_name,
    initials
  ) values
    (v_challenger, 'Catalog Challenger', 'CATALOG CHALLENGER', 'CC'),
    (v_recipient, 'Catalog Recipient', 'CATALOG RECIPIENT', 'CR');

  update private.auction_catalog_versions
  set is_preparation_version = false
  where content_version = 'fixture-2026-08-22-v1';

  update private.auction_catalog_versions
  set is_preparation_version = true
  where content_version = 'fixture-2026-08-22-v1';

  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.content_version = 'fixture-2026-08-22-v1'
      and version.is_preparation_version
  ) then
    raise exception 'reviewed preparation version could not rotate safely';
  end if;

  v_rejected := false;
  begin
    update private.auction_catalog_versions
    set rarity_version = 'changed'
    where content_version = 'fixture-2026-08-22-v1';
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'catalog version identity remained mutable';
  end if;

  v_rejected := false;
  begin
    delete from private.auction_catalog_versions
    where content_version = 'fixture-2026-08-22-v1';
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'catalog version was deletable';
  end if;

  insert into private.auction_games (
    id,
    challenger_id,
    recipient_id,
    mode_id,
    lifecycle_state,
    content_version,
    rarity_version,
    grading_version,
    tie_priority_profile_id,
    challenger_bankroll,
    recipient_bankroll
  ) values
    (v_catalog_game, v_challenger, v_recipient, 'strikers', 'abandoned', 'fixture-2026-08-22-v1', 'rarity-fixture-v1', 'grader-contract-v1', v_challenger, 40, 40),
    (v_legacy_game, v_challenger, v_recipient, 'strikers', 'abandoned', 'legacy-catalog-v1', 'legacy-rarity-v1', 'legacy-grader-v1', v_challenger, 40, 40);

  v_rejected := false;
  begin
    insert into private.auction_deck_entries (
      auction_id,
      deck_position,
      private_item_reference
    ) values (
      v_catalog_game,
      1,
      'not-in-the-pinned-catalog'
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'catalog-backed game accepted an unpinned deck item';
  end if;

  insert into private.auction_deck_entries (
    auction_id,
    deck_position,
    private_item_reference
  ) values (
    v_catalog_game,
    1,
    'strikers-item-1'
  );

  insert into private.auction_deck_entries (
    auction_id,
    deck_position,
    private_item_reference
  ) values (
    v_legacy_game,
    1,
    'legacy-private-fixture'
  );

  if not exists (
      select 1
      from private.auction_deck_entries deck
      where deck.auction_id = v_catalog_game
        and deck.private_item_reference = 'strikers-item-1'
    )
    or not exists (
      select 1
      from private.auction_deck_entries deck
      where deck.auction_id = v_legacy_game
        and deck.private_item_reference = 'legacy-private-fixture'
    )
  then
    raise exception 'catalog integrity hardening rejected a valid or legacy fixture';
  end if;
end;
$$;

rollback;
