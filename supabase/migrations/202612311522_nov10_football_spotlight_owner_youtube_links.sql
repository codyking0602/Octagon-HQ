-- Owner-supplied replacement YouTube highlights for the already published Nov 10
-- CJ Carr and Arvell Reese Spotlights. Nothing else (art, scores, matchups,
-- editorial, selections, publish timestamps, or future weeks) may change.
-- Following the established audited one-time correction convention, temporarily
-- admit ONLY these two exact URLs, then restore the normal immutable guard.

create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $guard$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      if old.week_of = date '2026-11-10'
        and old.status = 'published'
        and current_setting('octagon.approved_nov10_highlight_correction', true) = 'cj-carr-arvell-reese'
        and old.choices->'cfb'->'player'->>'id' = 'cj-carr'
        and old.choices->'nfl'->'player'->>'id' = 'arvell-reese'
        and new.cfb_spotlight->>'highlight_url' = 'https://youtu.be/EKf2nz0fdGQ?is=7HlQG24sKkbJuH2y'
        and new.nfl_spotlight->>'highlight_url' = 'https://youtu.be/InGgY1vrEPQ?is=FsGCZCV_Psy-PPml'
        and (new.cfb_spotlight - 'highlight_url') is not distinct from (old.cfb_spotlight - 'highlight_url')
        and (new.nfl_spotlight - 'highlight_url') is not distinct from (old.nfl_spotlight - 'highlight_url')
        and (to_jsonb(new) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
           is not distinct from
            (to_jsonb(old) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
      then
        continue;
      end if;
      if (case when v_sport='cfb' then new.cfb_spotlight else new.nfl_spotlight end)
           is distinct from
         (case when v_sport='cfb' then old.cfb_spotlight else old.nfl_spotlight end)
        or (case when v_sport='cfb' then new.cfb_game_of_week else new.nfl_game_of_week end)
           is distinct from
           (case when v_sport='cfb' then old.cfb_game_of_week else old.nfl_game_of_week end)
        or new.choices->v_sport is distinct from old.choices->v_sport
        or new.proposals->v_sport is distinct from old.proposals->v_sport
        or ((new.production->v_sport) - 'published_at') is distinct from
           ((old.production->v_sport) - 'published_at') then
        raise exception 'Armed Football editorial % is immutable',v_sport;
      end if;
    end if;
  end loop;
  return new;
end;
$guard$;

do $correction$
declare
  v_before public.football_weekly_content_packages%rowtype;
  v_after public.football_weekly_content_packages%rowtype;
  v_cfb text := 'https://youtu.be/EKf2nz0fdGQ?is=7HlQG24sKkbJuH2y';
  v_nfl text := 'https://youtu.be/InGgY1vrEPQ?is=FsGCZCV_Psy-PPml';
begin
  select * into v_before
  from public.football_weekly_content_packages
  where week_of = date '2026-11-10'
  for update;
  if not found then return; end if; -- Empty fresh-CI database.

  if v_before.cfb_spotlight->>'highlight_url' = v_cfb
     and v_before.nfl_spotlight->>'highlight_url' = v_nfl then
    if (select count(*) from public.football_weekly_owner_corrections
        where week_of = date '2026-11-10' and sport in ('cfb','nfl')) <> 2 then
      raise exception 'Nov 10 links are already corrected but audit receipts are missing';
    end if;
    return; -- Idempotent replay only with both audit receipts present.
  end if;

  if v_before.status <> 'published'
    or v_before.choices->'cfb'->'player'->>'id' <> 'cj-carr'
    or v_before.choices->'nfl'->'player'->>'id' <> 'arvell-reese'
    or v_before.cfb_spotlight->>'name' <> 'CJ Carr'
    or v_before.nfl_spotlight->>'name' <> 'Arvell Reese'
    or v_before.cfb_spotlight->>'highlight_url' <> 'https://www.youtube.com/watch?v=2qfxJ3WRy9I'
    or v_before.nfl_spotlight->>'highlight_url' <> 'https://www.youtube.com/watch?v=znF3q5lZYC4'
    or v_before.production->'cfb'->>'ready_at' is null
    or v_before.production->'nfl'->>'ready_at' is null
    or v_before.production->'cfb'->>'published_at' is null
    or v_before.production->'nfl'->>'published_at' is null
    or v_before.production->'cfb'->'media_verification' is null
    or v_before.production->'nfl'->'media_verification' is null
    or exists(select 1 from public.football_weekly_owner_corrections
       where week_of = date '2026-11-10' and sport in ('cfb','nfl'))
  then
    raise exception 'Nov 10 video correction requires exact published approved selections and original links';
  end if;

  perform set_config('octagon.approved_nov10_highlight_correction','cj-carr-arvell-reese',true);
  update public.football_weekly_content_packages p
    set cfb_spotlight = jsonb_set(p.cfb_spotlight, '{highlight_url}', to_jsonb(v_cfb), false),
        nfl_spotlight = jsonb_set(p.nfl_spotlight, '{highlight_url}', to_jsonb(v_nfl), false),
        updated_at = now()
    where p.week_of = date '2026-11-10' and p.status = 'published'
    returning * into v_after;
  perform set_config('octagon.approved_nov10_highlight_correction','',true);
  if not found
    or v_after.cfb_spotlight->>'highlight_url' is distinct from v_cfb
    or v_after.nfl_spotlight->>'highlight_url' is distinct from v_nfl
    or (v_after.cfb_spotlight - 'highlight_url') is distinct from
        (v_before.cfb_spotlight - 'highlight_url')
    or (v_after.nfl_spotlight - 'highlight_url') is distinct from
        (v_before.nfl_spotlight - 'highlight_url')
    or (to_jsonb(v_after) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
       is distinct from (to_jsonb(v_before) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
  then
    raise exception 'Nov 10 highlight-only correction drifted from protected published state';
  end if;

  insert into public.football_weekly_owner_corrections
    (week_of,sport,approval,prior_state,corrected_state)
  values
    (date '2026-11-10','cfb',
      'Owner supplied replacement CJ Carr YouTube Spotlight URL on Nov 10, 2026',
      jsonb_build_object('spotlight',v_before.cfb_spotlight),
      jsonb_build_object('spotlight',v_after.cfb_spotlight)),
    (date '2026-11-10','nfl',
      'Owner supplied replacement Arvell Reese YouTube Spotlight URL on Nov 10, 2026',
      jsonb_build_object('spotlight',v_before.nfl_spotlight),
      jsonb_build_object('spotlight',v_after.nfl_spotlight));
end;
$correction$;

-- Restore the exact locked immutability policy before this migration commits.
create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $guard$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      if (case when v_sport='cfb' then new.cfb_spotlight else new.nfl_spotlight end)
           is distinct from
         (case when v_sport='cfb' then old.cfb_spotlight else old.nfl_spotlight end)
        or (case when v_sport='cfb' then new.cfb_game_of_week else new.nfl_game_of_week end)
           is distinct from
           (case when v_sport='cfb' then old.cfb_game_of_week else old.nfl_game_of_week end)
        or new.choices->v_sport is distinct from old.choices->v_sport
        or new.proposals->v_sport is distinct from old.proposals->v_sport
        or ((new.production->v_sport) - 'published_at') is distinct from
           ((old.production->v_sport) - 'published_at') then
        raise exception 'Armed Football editorial % is immutable',v_sport;
      end if;
    end if;
  end loop;
  return new;
end;
$guard$;
