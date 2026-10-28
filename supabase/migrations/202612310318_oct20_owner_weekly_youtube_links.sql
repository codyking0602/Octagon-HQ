-- Narrow Oct 20 owner-supplied YouTube correction for the ALREADY PUBLISHED
-- Bear Bachmeier (CFB) and Caleb Williams (NFL) weekly Spotlights.
-- No other editorial, result, image, selection, release gate or sport may change.
-- The existing armed-editorial guard is restored in the SAME migration transaction.
do $owner_highlights$
declare
  v_row public.football_weekly_content_packages%rowtype;
  v_changed integer;
  v_bear_url constant text := 'https://youtu.be/8YZfJ2YbOj4?is=jJPg92oyqhH7iEKH';
  v_caleb_url constant text := 'https://youtu.be/MXGpVJDv-LY?is=nAKHQAbxZfiq_fW_';
begin
  lock table public.football_weekly_content_packages in access exclusive mode;
  select * into v_row from public.football_weekly_content_packages
    where week_of=date '2026-10-20' for update;
  if not found then
    -- Empty migration test databases have no historic editorial package.
    return;
  end if;
  if v_row.cfb_spotlight->>'name' is distinct from 'Bear Bachmeier'
     or v_row.nfl_spotlight->>'name' is distinct from 'Caleb Williams'
     or v_row.choices->'cfb'->'player'->>'id' is distinct from 'bear-bachmeier'
     or v_row.choices->'nfl'->'player'->>'id' is distinct from 'caleb-williams'
     or v_row.production->'cfb'->>'ready_at' is null
     or v_row.production->'nfl'->>'ready_at' is null
     or v_row.status is distinct from 'published' then
    raise exception 'Oct 20 owner YouTube correction does not match approved published Spotlights';
  end if;
  if v_row.cfb_spotlight->>'highlight_url' not in
       ('https://www.youtube.com/watch?v=zX_CzDNg_74',v_bear_url)
     or v_row.nfl_spotlight->>'highlight_url' not in
       ('https://www.youtube.com/watch?v=THLXEdxS1hw',v_caleb_url) then
    raise exception 'Unexpected published highlight version, declining destructive replacement';
  end if;
  if v_row.cfb_spotlight->>'highlight_url' = v_bear_url
     and v_row.nfl_spotlight->>'highlight_url' = v_caleb_url then
    return;
  end if;
  -- Access-exclusive lock makes this strictly transactional: no external
  -- connection observes the guard disabled, and exceptions roll back DDL.
  alter table public.football_weekly_content_packages
    disable trigger guard_armed_football_editorial;
  update public.football_weekly_content_packages
    set cfb_spotlight=jsonb_set(v_row.cfb_spotlight,'{highlight_url}',to_jsonb(v_bear_url),false),
        nfl_spotlight=jsonb_set(v_row.nfl_spotlight,'{highlight_url}',to_jsonb(v_caleb_url),false),
        updated_at=now()
    where week_of=date '2026-10-20';
  get diagnostics v_changed = row_count;
  if v_changed <> 1 then
    raise exception 'Expected exactly one approved weekly package to be corrected';
  end if;
  alter table public.football_weekly_content_packages
    enable trigger guard_armed_football_editorial;
end
$owner_highlights$;
