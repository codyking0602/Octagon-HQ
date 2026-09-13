-- Stage 13 Trio calibration: preserve room-level strength while guaranteeing meaningful
-- quality spread inside each six-package auction board. Player grades and final grading
-- remain unchanged; only package construction is recalibrated.

create or replace function private.draft_room_trio_slot_combo(
  p_profile text,
  p_slot integer
)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_slot not between 1 and 6 then
    raise exception 'Trio strength slot must be between 1 and 6';
  end if;

  if p_profile = 'Loaded' then
    return case p_slot
      when 1 then array['Elite','Elite','Elite']::text[]
      when 2 then array['Elite','Elite','Great']::text[]
      when 3 then array['Elite','Great','Great']::text[]
      when 4 then array['Elite','Great','Good']::text[]
      when 5 then array['Great','Great','Good']::text[]
      else array['Great','Average','Average']::text[]
    end;
  elsif p_profile = 'Strong' then
    return case p_slot
      when 1 then array['Elite','Elite','Great']::text[]
      when 2 then array['Elite','Great','Great']::text[]
      when 3 then array['Elite','Great','Good']::text[]
      when 4 then array['Great','Great','Great']::text[]
      when 5 then array['Great','Good','Good']::text[]
      else array['Good','Average','Average']::text[]
    end;
  elsif p_profile = 'Balanced' then
    return case p_slot
      when 1 then array['Elite','Great','Great']::text[]
      when 2 then array['Elite','Good','Good']::text[]
      when 3 then array['Great','Great','Good']::text[]
      when 4 then array['Great','Good','Average']::text[]
      when 5 then array['Good','Good','Average']::text[]
      else array['Good','Average','Average']::text[]
    end;
  elsif p_profile = 'Gritty' then
    return case p_slot
      when 1 then array['Elite','Great','Good']::text[]
      when 2 then array['Great','Good','Average']::text[]
      when 3 then array['Good','Good','Good']::text[]
      when 4 then array['Good','Good','Average']::text[]
      when 5 then array['Good','Average','Average']::text[]
      else array['Good','Average','Average']::text[]
    end;
  end if;

  raise exception 'Unknown Trio room profile: %', p_profile;
end;
$$;

revoke all on function private.draft_room_trio_slot_combo(text,integer) from public, anon, authenticated;

create or replace function private.generate_draft_room_trio_deck(
  p_auction_id uuid,
  p_mode_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_profile text;
  v_combo text[];
  v_permutation integer;
  v_qb_tier text;
  v_rb_tier text;
  v_wr_tier text;
  v_qb private.draft_room_trio_player_pool;
  v_rb private.draft_room_trio_player_pool;
  v_wr private.draft_room_trio_player_pool;
  v_position integer;
  v_strength_slot integer;
  v_slot_order integer[];
  v_item_reference text;
  v_display_label text;
  v_package_spread numeric;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.mode_id <> p_mode_id or p_mode_id not in ('trio-nfl', 'trio-cfb') then
    raise exception 'Trio deck generation requires the matching Draft Room game';
  end if;

  if exists (select 1 from private.auction_deck_entries deck where deck.auction_id = p_auction_id)
    or exists (select 1 from private.draft_room_trio_packages package where package.auction_id = p_auction_id)
  then
    raise exception 'Draft Room Trio deck is already fixed';
  end if;

  v_profile := private.draft_room_trio_room_profile(random());

  select array_agg(slot)
  into v_slot_order
  from (
    select slot
    from generate_series(1, 6) slot
    order by random()
  ) shuffled_slots;

  if array_length(v_slot_order, 1) <> 6 then
    raise exception 'Draft Room Trio strength-slot shuffle failed';
  end if;

  for v_position in 1..6 loop
    v_strength_slot := v_slot_order[v_position];
    v_combo := private.draft_room_trio_slot_combo(v_profile, v_strength_slot);
    v_permutation := floor(random() * 6)::integer + 1;

    if v_permutation = 1 then
      v_qb_tier := v_combo[1]; v_rb_tier := v_combo[2]; v_wr_tier := v_combo[3];
    elsif v_permutation = 2 then
      v_qb_tier := v_combo[1]; v_rb_tier := v_combo[3]; v_wr_tier := v_combo[2];
    elsif v_permutation = 3 then
      v_qb_tier := v_combo[2]; v_rb_tier := v_combo[1]; v_wr_tier := v_combo[3];
    elsif v_permutation = 4 then
      v_qb_tier := v_combo[2]; v_rb_tier := v_combo[3]; v_wr_tier := v_combo[1];
    elsif v_permutation = 5 then
      v_qb_tier := v_combo[3]; v_rb_tier := v_combo[1]; v_wr_tier := v_combo[2];
    else
      v_qb_tier := v_combo[3]; v_rb_tier := v_combo[2]; v_wr_tier := v_combo[1];
    end if;

    select player.* into v_qb
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'QB'
      and player.tier = v_qb_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.qb_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    select player.* into v_rb
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'RB'
      and player.tier = v_rb_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.rb_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    select player.* into v_wr
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'WR'
      and player.tier = v_wr_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.wr_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    if v_qb.player_reference is null or v_rb.player_reference is null or v_wr.player_reference is null then
      raise exception 'Draft Room Trio generation underfilled a requested tier';
    end if;

    v_item_reference := 'trio-' || v_position::text;
    v_display_label := case
      when p_mode_id = 'trio-cfb' then
        v_qb.display_name || ' · ' || v_qb.peak_team || ' ' || v_qb.peak_season::text || ' | '
        || v_rb.display_name || ' · ' || v_rb.peak_team || ' ' || v_rb.peak_season::text || ' | '
        || v_wr.display_name || ' · ' || v_wr.peak_team || ' ' || v_wr.peak_season::text
      else
        v_qb.display_name || ' | ' || v_rb.display_name || ' | ' || v_wr.display_name
    end;

    insert into private.draft_room_trio_packages (
      auction_id, deck_position, item_reference, room_profile,
      qb_reference, qb_display_name, qb_tier, qb_peak_team, qb_peak_season,
      rb_reference, rb_display_name, rb_tier, rb_peak_team, rb_peak_season,
      wr_reference, wr_display_name, wr_tier, wr_peak_team, wr_peak_season,
      display_label
    ) values (
      p_auction_id, v_position, v_item_reference, v_profile,
      v_qb.player_reference, v_qb.display_name, v_qb.tier, v_qb.peak_team, v_qb.peak_season,
      v_rb.player_reference, v_rb.display_name, v_rb.tier, v_rb.peak_team, v_rb.peak_season,
      v_wr.player_reference, v_wr.display_name, v_wr.tier, v_wr.peak_team, v_wr.peak_season,
      v_display_label
    );

    insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
    values (p_auction_id, v_position, v_item_reference);
  end loop;

  if (
    select count(distinct package.room_profile)
    from private.draft_room_trio_packages package
    where package.auction_id = p_auction_id
  ) <> 1 then
    raise exception 'Draft Room Trio room profile drifted within one game';
  end if;

  select
    max((qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 3.0)
      - min((qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 3.0)
  into v_package_spread
  from private.draft_room_trio_packages package
  join private.draft_room_trio_player_pool qb
    on qb.mode_id = p_mode_id and qb.position = 'QB' and qb.player_reference = package.qb_reference
  join private.draft_room_trio_player_pool rb
    on rb.mode_id = p_mode_id and rb.position = 'RB' and rb.player_reference = package.rb_reference
  join private.draft_room_trio_player_pool wr
    on wr.mode_id = p_mode_id and wr.position = 'WR' and wr.player_reference = package.wr_reference
  where package.auction_id = p_auction_id;

  if v_package_spread < 6 then
    raise exception 'Draft Room Trio package spread fell below calibration floor: %', v_package_spread;
  end if;
end;
$$;

revoke all on function private.generate_draft_room_trio_deck(uuid,text) from public, anon, authenticated;
