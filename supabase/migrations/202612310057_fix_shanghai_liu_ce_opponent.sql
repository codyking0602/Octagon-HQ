-- Correct the stale UFC Shanghai matchup using the existing approved fighter-replacement owner.
do $$
declare
  v_event_id text := 'ufc-fight-night-umar-nurmagomedov-vs-song-yadong-2026-08-29';
  v_bout_id text := 'main-liu-ce-junior-tafa';
  v_red_fighter_name text;
  v_red_fighter_slug text;
  v_blue_fighter_name text;
  v_blue_fighter_slug text;
begin
  select
    red_fighter_name,
    red_fighter_slug,
    blue_fighter_name,
    blue_fighter_slug
  into
    v_red_fighter_name,
    v_red_fighter_slug,
    v_blue_fighter_name,
    v_blue_fighter_slug
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id;

  -- Fresh validation databases do not contain the live event.
  if not found then
    return;
  end if;

  if v_red_fighter_name = 'Liu Ce'
    and v_red_fighter_slug = 'liu-ce'
    and v_blue_fighter_name = 'Levi Rodrigues Jr.'
    and v_blue_fighter_slug = 'levi-rodrigues-jr' then
    return;
  end if;

  if v_red_fighter_name is distinct from 'Liu Ce'
    or v_red_fighter_slug is distinct from 'liu-ce'
    or v_blue_fighter_name is distinct from 'Junior Tafa'
    or v_blue_fighter_slug is distinct from 'junior-tafa' then
    raise exception 'Unexpected Shanghai Liu Ce opponent: % / % vs % / %',
      v_red_fighter_name,
      v_red_fighter_slug,
      v_blue_fighter_name,
      v_blue_fighter_slug;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform public.approve_pick_fighter_replacement(
    v_event_id,
    v_bout_id,
    'blue',
    'liu-ce',
    'junior-tafa',
    'levi-rodrigues-jr',
    'Levi Rodrigues Jr.',
    'Junior Tafa withdrew; Levi Rodrigues Jr. is the confirmed replacement.'
  );
end;
$$;
