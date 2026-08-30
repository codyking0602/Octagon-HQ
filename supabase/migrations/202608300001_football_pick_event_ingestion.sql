-- Football is an additive event type inside the canonical Picks owner.
alter table public.pick_event_drafts add column if not exists sport text not null default 'mma';
alter table public.pick_event_drafts add column if not exists league text;
alter table public.pick_event_drafts add column if not exists event_kind text not null default 'fight_card';
alter table public.pick_events add column if not exists sport text not null default 'mma';
alter table public.pick_events add column if not exists league text;
alter table public.pick_events add column if not exists event_kind text not null default 'fight_card';

alter table public.pick_event_draft_bouts add column if not exists home_team_slug text;
alter table public.pick_event_draft_bouts add column if not exists away_team_slug text;
alter table public.pick_event_draft_bouts add column if not exists spread_home numeric(5,2);
alter table public.pick_event_draft_bouts add column if not exists spread_source text;
alter table public.pick_event_draft_bouts add column if not exists spread_updated_at timestamptz;
alter table public.pick_bouts add column if not exists home_team_slug text;
alter table public.pick_bouts add column if not exists away_team_slug text;
alter table public.pick_bouts add column if not exists frozen_spread_home numeric(5,2);
alter table public.pick_bouts add column if not exists spread_source text;
alter table public.pick_bouts add column if not exists spread_frozen_at timestamptz;

alter table public.pick_event_drafts add constraint pick_event_draft_sport check (sport in ('mma','football'));
alter table public.pick_events add constraint pick_event_sport check (sport in ('mma','football'));
alter table public.pick_event_draft_bouts add constraint pick_draft_football_spread_shape check (
  (home_team_slug is null and away_team_slug is null and spread_home is null and spread_source is null and spread_updated_at is null)
  or (home_team_slug is not null and away_team_slug is not null and home_team_slug <> away_team_slug
      and spread_home is not null and spread_source = 'the-odds-api' and spread_updated_at is not null)
);
alter table public.pick_bouts add constraint pick_football_spread_shape check (
  (home_team_slug is null and away_team_slug is null and frozen_spread_home is null and spread_source is null and spread_frozen_at is null)
  or (home_team_slug is not null and away_team_slug is not null and home_team_slug <> away_team_slug
      and frozen_spread_home is not null and spread_source = 'the-odds-api' and spread_frozen_at is not null)
);

-- Extend, rather than bypass, the sole staging owner.
alter function public.stage_pick_event_draft(jsonb) rename to stage_pick_event_draft_football_core;
alter function public.stage_pick_event_draft_football_core(jsonb) set schema private;
revoke all on function private.stage_pick_event_draft_football_core(jsonb) from public, anon, authenticated, service_role;

create function public.stage_pick_event_draft(p_payload jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_draft_id uuid;
  v_sport text := coalesce(nullif(trim(p_payload->>'sport'), ''), 'mma');
begin
  if v_sport not in ('mma','football') then raise exception 'unsupported Picks sport'; end if;
  if v_sport = 'football' and (
    nullif(trim(p_payload->>'league'),'') is null
    or p_payload->>'event_kind' not in ('game','slate')
    or jsonb_array_length(coalesce(p_payload->'bouts','[]'::jsonb)) < 1
  ) then raise exception 'football event metadata is incomplete'; end if;

  v_draft_id := private.stage_pick_event_draft_football_core(p_payload);
  update public.pick_event_drafts set sport=v_sport,
    league=nullif(trim(p_payload->>'league'),''), event_kind=coalesce(nullif(p_payload->>'event_kind',''),'fight_card')
  where draft_id=v_draft_id;

  if v_sport = 'football' then
    update public.pick_event_draft_bouts bout set
      home_team_slug=item.value->>'home_team_slug', away_team_slug=item.value->>'away_team_slug',
      spread_home=(item.value->>'spread_home')::numeric, spread_source=item.value->>'spread_source',
      spread_updated_at=(item.value->>'spread_updated_at')::timestamptz
    from jsonb_array_elements(p_payload->'bouts') item
    where bout.draft_id=v_draft_id and bout.bout_id=public.slugify_pick_text(item.value->>'bout_id');
    if exists (select 1 from public.pick_event_draft_bouts where draft_id=v_draft_id
      and (home_team_slug is null or away_team_slug is null or spread_home is null
        or spread_source <> 'the-odds-api' or spread_updated_at is null)) then
      raise exception 'football ATS metadata is incomplete';
    end if;
  end if;
  return v_draft_id;
end $$;
revoke all on function public.stage_pick_event_draft(jsonb) from public, anon, authenticated;
grant execute on function public.stage_pick_event_draft(jsonb) to service_role;

-- Publication remains owner-reviewed and atomically freezes the staged ATS line.
alter function public.publish_pick_event_draft(uuid) rename to publish_pick_event_draft_football_core;
alter function public.publish_pick_event_draft_football_core(uuid) set schema private;
revoke all on function private.publish_pick_event_draft_football_core(uuid) from public, anon, authenticated, service_role;

create function public.publish_pick_event_draft(p_draft_id uuid) returns public.pick_events
language plpgsql security definer set search_path = '' as $$
declare v_event public.pick_events; v_draft public.pick_event_drafts;
begin
  select * into v_draft from public.pick_event_drafts where draft_id=p_draft_id;
  v_event := private.publish_pick_event_draft_football_core(p_draft_id);
  update public.pick_events set sport=v_draft.sport, league=v_draft.league, event_kind=v_draft.event_kind
    where event_id=v_event.event_id returning * into v_event;
  if v_draft.sport = 'football' then
    update public.pick_bouts published set
      home_team_slug=draft.home_team_slug, away_team_slug=draft.away_team_slug,
      frozen_spread_home=draft.spread_home, spread_source=draft.spread_source,
      spread_frozen_at=now()
    from public.pick_event_draft_bouts draft
    where draft.draft_id=p_draft_id and published.event_id=v_event.event_id and published.bout_id=draft.bout_id;
  end if;
  return v_event;
end $$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

create function public.prevent_frozen_football_spread_changes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.frozen_spread_home is distinct from old.frozen_spread_home
    or new.spread_source is distinct from old.spread_source
    or new.spread_frozen_at is distinct from old.spread_frozen_at then
    raise exception 'published football spread is frozen';
  end if;
  return new;
end $$;
create trigger prevent_frozen_football_spread_changes before update of frozen_spread_home, spread_source, spread_frozen_at
on public.pick_bouts for each row when (old.frozen_spread_home is not null)
execute function public.prevent_frozen_football_spread_changes();
revoke all on function public.prevent_frozen_football_spread_changes() from public, anon, authenticated;
