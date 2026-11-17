-- Owner-approved Nov 17 Spotlight video links for the already armed CFB/NFL
-- weekly package. One exact, audited correction; no publication, ranking,
-- selection, asset, editorial, or other-week changes. Restore strict armed
-- immutability within this same migration transaction, as in Nov 10 correction.

create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $guard$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      if old.week_of = date '2026-11-17'
        and old.status in ('ready','published')
        and current_setting('octagon.approved_nov17_highlight_correction', true)
            = 'madsen-mccaffrey'
        and old.choices->'cfb'->'player'->>'id' = 'maddux-madsen'
        and old.choices->'nfl'->'player'->>'id' = 'christian-mccaffrey'
        and old.choices->'cfb'->'game'->>'id' = 'lsu-at-tennessee'
        and old.choices->'nfl'->'game'->>'id' = 'vikings-at-49ers'
        and new.cfb_spotlight->>'highlight_url'
            = 'https://youtu.be/KmDe2kNvaWg?is=q5CPe-Pysg_24vzw'
        and new.nfl_spotlight->>'highlight_url'
            = 'https://youtu.be/rqiN08mLDNQ?is=0fmZR7wvARvy0VLv'
        and (new.cfb_spotlight - 'highlight_url') is not distinct from
            (old.cfb_spotlight - 'highlight_url')
        and (new.nfl_spotlight - 'highlight_url') is not distinct from
            (old.nfl_spotlight - 'highlight_url')
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
  v_cfb text := 'https://youtu.be/KmDe2kNvaWg?is=q5CPe-Pysg_24vzw';
  v_nfl text := 'https://youtu.be/rqiN08mLDNQ?is=0fmZR7wvARvy0VLv';
begin
  select * into v_before from public.football_weekly_content_packages
  where week_of = date '2026-11-17' for update;
  if not found then return; end if; -- Empty fresh-database CI.

  if v_before.cfb_spotlight->>'highlight_url' = v_cfb
     and v_before.nfl_spotlight->>'highlight_url' = v_nfl then
    if (select count(*) from public.football_weekly_owner_corrections
        where week_of = date '2026-11-17' and sport in ('cfb','nfl')) <> 2 then
      raise exception 'Nov 17 links already corrected without two audit receipts';
    end if;
    return; -- Idempotent only with both audit receipts.
  end if;

  if v_before.status not in ('ready','published')
    or v_before.choices->'cfb'->'player'->>'id' <> 'maddux-madsen'
    or v_before.choices->'nfl'->'player'->>'id' <> 'christian-mccaffrey'
    or v_before.choices->'cfb'->'game'->>'id' <> 'lsu-at-tennessee'
    or v_before.choices->'nfl'->'game'->>'id' <> 'vikings-at-49ers'
    or v_before.cfb_spotlight->>'name' <> 'Maddux Madsen'
    or v_before.nfl_spotlight->>'name' <> 'Christian McCaffrey'
    or v_before.cfb_spotlight->>'highlight_url'
       <> 'https://www.youtube.com/watch?v=OfATPmYC0cM'
    or v_before.nfl_spotlight->>'highlight_url'
       <> 'https://www.youtube.com/watch?v=rqiN08mLDNQ'
    or v_before.production->'cfb'->>'ready_at' is null
    or v_before.production->'nfl'->>'ready_at' is null
    or v_before.production->'cfb'->'media_verification' is null
    or v_before.production->'nfl'->'media_verification' is null
    or exists (select 1 from public.football_weekly_owner_corrections
       where week_of = date '2026-11-17' and sport in ('cfb','nfl'))
  then
    raise exception 'Nov 17 correction requires exact owner-approved armed package and original URLs';
  end if;

  perform set_config('octagon.approved_nov17_highlight_correction','madsen-mccaffrey',true);
  update public.football_weekly_content_packages p
    set cfb_spotlight = jsonb_set(p.cfb_spotlight, '{highlight_url}', to_jsonb(v_cfb), false),
        nfl_spotlight = jsonb_set(p.nfl_spotlight, '{highlight_url}', to_jsonb(v_nfl), false),
        updated_at = now()
    where p.week_of = date '2026-11-17'
      and p.status in ('ready','published')
    returning * into v_after;
  perform set_config('octagon.approved_nov17_highlight_correction','',true);

  if not found
    or v_after.cfb_spotlight->>'highlight_url' is distinct from v_cfb
    or v_after.nfl_spotlight->>'highlight_url' is distinct from v_nfl
    or (v_after.cfb_spotlight - 'highlight_url') is distinct from
       (v_before.cfb_spotlight - 'highlight_url')
    or (v_after.nfl_spotlight - 'highlight_url') is distinct from
       (v_before.nfl_spotlight - 'highlight_url')
    or (to_jsonb(v_after) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
       is distinct from
       (to_jsonb(v_before) - 'cfb_spotlight' - 'nfl_spotlight' - 'updated_at')
  then
    raise exception 'Nov 17 video-only correction changed protected editorial fields';
  end if;

  insert into public.football_weekly_owner_corrections
    (week_of,sport,approval,prior_state,corrected_state)
  values
    (date '2026-11-17','cfb',
     'Owner supplied replacement Maddux Madsen Spotlight YouTube URL Nov 16, 2026',
     jsonb_build_object('spotlight',v_before.cfb_spotlight),
     jsonb_build_object('spotlight',v_after.cfb_spotlight)),
    (date '2026-11-17','nfl',
     'Owner confirmed Christian McCaffrey Spotlight YouTube URL Nov 16, 2026',
     jsonb_build_object('spotlight',v_before.nfl_spotlight),
     jsonb_build_object('spotlight',v_after.nfl_spotlight));
end;
$correction$;

-- Restore EXACT prior immutable guard before transaction commits.
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
