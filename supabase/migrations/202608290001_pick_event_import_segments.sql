-- Preserve the canonical Event Setup owners while storing official card anchors
-- and deterministic segment order for future progressive per-fight deadlines.

alter table public.pick_event_drafts
  add column if not exists prelims_starts_at timestamptz;
alter table public.pick_events
  add column if not exists prelims_starts_at timestamptz;
alter table public.pick_event_draft_bouts
  add column if not exists card_segment text,
  add column if not exists segment_sequence smallint;
alter table public.pick_bouts
  add column if not exists card_segment text,
  add column if not exists segment_sequence smallint;

alter table public.pick_event_drafts
  drop constraint if exists pick_event_draft_prelims_before_main,
  add constraint pick_event_draft_prelims_before_main check (
    prelims_starts_at is null
    or starts_at is null
    or prelims_starts_at < starts_at
  );
alter table public.pick_events
  drop constraint if exists pick_event_prelims_before_main,
  add constraint pick_event_prelims_before_main check (
    prelims_starts_at is null or prelims_starts_at < starts_at
  );
alter table public.pick_event_draft_bouts
  drop constraint if exists pick_event_draft_bout_card_segment,
  add constraint pick_event_draft_bout_card_segment check (
    card_segment is null or card_segment in ('prelim', 'main')
  ),
  drop constraint if exists pick_event_draft_bout_segment_sequence_positive,
  add constraint pick_event_draft_bout_segment_sequence_positive check (
    segment_sequence is null or segment_sequence >= 1
  );
alter table public.pick_bouts
  drop constraint if exists pick_bout_card_segment,
  add constraint pick_bout_card_segment check (
    card_segment is null or card_segment in ('prelim', 'main')
  ),
  drop constraint if exists pick_bout_segment_sequence_positive,
  add constraint pick_bout_segment_sequence_positive check (
    segment_sequence is null or segment_sequence >= 1
  );

update public.pick_event_draft_bouts
set included = false
where bout_id like 'early-prelim-%';

with ranked as (
  select
    draft_id,
    bout_id,
    case when bout_id like 'prelim-%' then 'prelim' else 'main' end card_segment,
    row_number() over (
      partition by draft_id, case when bout_id like 'prelim-%' then 'prelim' else 'main' end
      order by position desc
    )::smallint segment_sequence
  from public.pick_event_draft_bouts
)
update public.pick_event_draft_bouts bout
set card_segment = ranked.card_segment,
    segment_sequence = ranked.segment_sequence
from ranked
where ranked.draft_id = bout.draft_id
  and ranked.bout_id = bout.bout_id;

with ranked as (
  select
    event_id,
    bout_id,
    case when bout_id like 'prelim-%' then 'prelim' else 'main' end card_segment,
    row_number() over (
      partition by event_id, case when bout_id like 'prelim-%' then 'prelim' else 'main' end
      order by position desc
    )::smallint segment_sequence
  from public.pick_bouts
)
update public.pick_bouts bout
set card_segment = ranked.card_segment,
    segment_sequence = ranked.segment_sequence
from ranked
where ranked.event_id = bout.event_id
  and ranked.bout_id = bout.bout_id;

create unique index if not exists pick_event_draft_bouts_segment_sequence_key
  on public.pick_event_draft_bouts(draft_id, card_segment, segment_sequence)
  where card_segment is not null and segment_sequence is not null;
create unique index if not exists pick_bouts_segment_sequence_key
  on public.pick_bouts(event_id, card_segment, segment_sequence)
  where card_segment is not null and segment_sequence is not null;

comment on column public.pick_event_drafts.prelims_starts_at is
  'Official UFC Prelims anchor for numbered events; NULL for main-card-only Fight Nights.';
comment on column public.pick_events.prelims_starts_at is
  'Official UFC Prelims anchor for numbered events; NULL for main-card-only Fight Nights.';
comment on column public.pick_event_draft_bouts.card_segment is
  'Importer-owned Picks segment: prelim or main. Early Prelims are never eligible.';
comment on column public.pick_event_draft_bouts.segment_sequence is
  'Chronological sequence inside card_segment, where 1 is the segment opener.';
comment on column public.pick_bouts.card_segment is
  'Importer-owned Picks segment: prelim or main. Early Prelims are never eligible.';
comment on column public.pick_bouts.segment_sequence is
  'Chronological sequence inside card_segment, where 1 is the segment opener.';

-- Wrap the existing sole stage owner instead of creating a second write path.
alter function public.stage_pick_event_draft(jsonb)
  rename to stage_pick_event_draft_import_core;
alter function public.stage_pick_event_draft_import_core(jsonb)
  set schema private;
revoke all on function private.stage_pick_event_draft_import_core(jsonb)
  from public, anon, authenticated, service_role;

create function public.stage_pick_event_draft(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft_id uuid;
  v_prelims_starts_at timestamptz := nullif(p_payload->>'prelims_starts_at', '')::timestamptz;
begin
  v_draft_id := private.stage_pick_event_draft_import_core(p_payload);

  if exists (
    select 1
    from jsonb_array_elements(coalesce(p_payload->'bouts', '[]'::jsonb)) item
    where coalesce((item->>'included')::boolean, true)
      and (
        item->>'bout_id' like 'early-prelim-%'
        or item->>'card_segment' not in ('prelim', 'main')
        or nullif(item->>'segment_sequence', '')::integer < 1
      )
  ) then
    raise exception 'Early Prelims or invalid segment metadata cannot be staged';
  end if;

  update public.pick_event_drafts draft
  set prelims_starts_at = v_prelims_starts_at
  where draft.draft_id = v_draft_id;

  update public.pick_event_draft_bouts bout
  set card_segment = null,
      segment_sequence = null
  where bout.draft_id = v_draft_id;

  with payload_bouts as (
    select value item
    from jsonb_array_elements(coalesce(p_payload->'bouts', '[]'::jsonb))
  )
  update public.pick_event_draft_bouts bout
  set card_segment = payload.item->>'card_segment',
      segment_sequence = (payload.item->>'segment_sequence')::smallint
  from payload_bouts payload
  where bout.draft_id = v_draft_id
    and bout.bout_id = public.slugify_pick_text(payload.item->>'bout_id');

  -- Existing owner workflows may stage legacy main-card payloads without the
  -- new fields. Derive the same metadata from the canonical bout id and the
  -- established headline-first position instead of adding another write path.
  with ranked as (
    select
      bout.draft_id,
      bout.bout_id,
      coalesce(
        bout.card_segment,
        case when bout.bout_id like 'prelim-%' then 'prelim' else 'main' end
      ) card_segment,
      row_number() over (
        partition by bout.draft_id, coalesce(
          bout.card_segment,
          case when bout.bout_id like 'prelim-%' then 'prelim' else 'main' end
        )
        order by bout.position desc
      )::smallint segment_sequence
    from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft_id
  )
  update public.pick_event_draft_bouts bout
  set card_segment = ranked.card_segment,
      segment_sequence = ranked.segment_sequence
  from ranked
  where ranked.draft_id = bout.draft_id
    and ranked.bout_id = bout.bout_id
    and (bout.card_segment is null or bout.segment_sequence is null);

  if exists (
    select 1
    from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft_id
      and bout.included
      and (bout.card_segment is null or bout.segment_sequence is null)
  ) then
    raise exception 'Every included staged fight requires segment metadata';
  end if;

  if exists (
    select 1
    from public.pick_event_draft_bouts bout
    where bout.draft_id = v_draft_id
      and bout.included
      and bout.card_segment = 'prelim'
  ) and v_prelims_starts_at is null then
    raise exception 'Numbered-event Prelims require an official start time';
  end if;

  return v_draft_id;
end;
$$;
revoke all on function public.stage_pick_event_draft(jsonb)
  from public, anon, authenticated;
grant execute on function public.stage_pick_event_draft(jsonb) to service_role;

-- Wrap the existing sole publication owner and copy import metadata only after
-- its established lifecycle and Picks-safety checks succeed.
alter function public.publish_pick_event_draft(uuid)
  rename to publish_pick_event_draft_import_core;
alter function public.publish_pick_event_draft_import_core(uuid)
  set schema private;
revoke all on function private.publish_pick_event_draft_import_core(uuid)
  from public, anon, authenticated, service_role;

create function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  update public.pick_event_draft_bouts bout
  set card_segment = null,
      segment_sequence = null
  where bout.draft_id = p_draft_id;

  -- Draft editing predates segment metadata. Recompute it from the current
  -- canonical order immediately before the sole publication owner validates
  -- and copies the card.
  with ranked as (
    select
      bout.draft_id,
      bout.bout_id,
      coalesce(
        bout.card_segment,
        case when bout.bout_id like 'prelim-%' then 'prelim' else 'main' end
      ) card_segment,
      row_number() over (
        partition by bout.draft_id, coalesce(
          bout.card_segment,
          case when bout.bout_id like 'prelim-%' then 'prelim' else 'main' end
        )
        order by bout.position desc
      )::smallint segment_sequence
    from public.pick_event_draft_bouts bout
    where bout.draft_id = p_draft_id
  )
  update public.pick_event_draft_bouts bout
  set card_segment = ranked.card_segment,
      segment_sequence = ranked.segment_sequence
  from ranked
  where ranked.draft_id = bout.draft_id
    and ranked.bout_id = bout.bout_id;

  if exists (
    select 1
    from public.pick_event_draft_bouts bout
    where bout.draft_id = p_draft_id
      and bout.included
      and (
        bout.bout_id like 'early-prelim-%'
        or bout.card_segment is null
        or bout.segment_sequence is null
      )
  ) then
    raise exception 'Published Picks cards cannot contain Early Prelims or missing segment metadata';
  end if;

  v_event := private.publish_pick_event_draft_import_core(p_draft_id);

  update public.pick_events event
  set prelims_starts_at = draft.prelims_starts_at
  from public.pick_event_drafts draft
  where draft.draft_id = p_draft_id
    and event.event_id = draft.event_id;

  update public.pick_bouts live_bout
  set card_segment = draft_bout.card_segment,
      segment_sequence = draft_bout.segment_sequence
  from public.pick_event_drafts draft
  join public.pick_event_draft_bouts draft_bout
    on draft_bout.draft_id = draft.draft_id
  where draft.draft_id = p_draft_id
    and live_bout.event_id = draft.event_id
    and live_bout.bout_id = draft_bout.bout_id;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event.event_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;
