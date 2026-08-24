-- Correct the stale UFC Shanghai matchup using the existing approved fighter-replacement owner.
-- Fresh local databases do not contain this production event, so the correction is a no-op there.
do $$
declare
  v_blue_fighter_slug text;
begin
  select blue_fighter_slug
    into v_blue_fighter_slug
  from public.pick_bouts
  where event_id = 'ufc-fight-night-umar-nurmagomedov-vs-song-yadong-2026-08-29'
    and bout_id = 'main-liu-ce-junior-tafa';

  if found then
    if v_blue_fighter_slug = 'junior-tafa' then
      perform set_config('request.jwt.claim.role', 'service_role', true);
      perform public.approve_pick_fighter_replacement(
        'ufc-fight-night-umar-nurmagomedov-vs-song-yadong-2026-08-29',
        'main-liu-ce-junior-tafa',
        'blue',
        'liu-ce',
        'junior-tafa',
        'levi-rodrigues-jr',
        'Levi Rodrigues Jr.',
        'Junior Tafa withdrew; Levi Rodrigues Jr. is the confirmed replacement.'
      );
    elsif v_blue_fighter_slug <> 'levi-rodrigues-jr' then
      raise exception 'Unexpected Shanghai Liu Ce opponent: %', v_blue_fighter_slug;
    end if;
  end if;
end;
$$;
