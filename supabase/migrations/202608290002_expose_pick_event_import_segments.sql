-- Enrich the existing owner and service projections with the import fields added
-- in 202608290001. Their original functions remain the sole core readers.
alter function public.get_pick_event_setup()
  rename to get_pick_event_setup_import_segments_core;
alter function public.get_pick_event_setup_import_segments_core()
  set schema private;
revoke all on function private.get_pick_event_setup_import_segments_core()
  from public, anon, authenticated;

create function public.get_pick_event_setup()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_draft_id uuid;
  v_prelims_starts_at timestamptz;
  v_bouts jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_value := private.get_pick_event_setup_import_segments_core();
  if v_value is null then return null; end if;
  v_draft_id := (v_value->>'draft_id')::uuid;

  select draft.prelims_starts_at
  into v_prelims_starts_at
  from public.pick_event_drafts draft
  where draft.draft_id = v_draft_id;

  select coalesce(jsonb_agg(
    item || jsonb_build_object(
      'card_segment', bout.card_segment,
      'segment_sequence', bout.segment_sequence
    )
    order by (item->>'position')::integer
  ), '[]'::jsonb)
  into v_bouts
  from jsonb_array_elements(v_value->'bouts') item
  join public.pick_event_draft_bouts bout
    on bout.draft_id = v_draft_id
   and bout.bout_id = item->>'bout_id';

  v_value := jsonb_set(
    v_value,
    '{prelims_starts_at}',
    coalesce(to_jsonb(v_prelims_starts_at), 'null'::jsonb),
    true
  );
  return jsonb_set(v_value, '{bouts}', v_bouts, true);
end;
$$;
revoke all on function public.get_pick_event_setup() from public, anon;
grant execute on function public.get_pick_event_setup() to authenticated;

alter function public.get_pick_monitoring_event_state()
  rename to get_pick_monitoring_event_state_import_segments_core;
alter function public.get_pick_monitoring_event_state_import_segments_core()
  set schema private;
revoke all on function private.get_pick_monitoring_event_state_import_segments_core()
  from public, anon, authenticated, service_role;

create function public.get_pick_monitoring_event_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_staged jsonb;
  v_current jsonb;
  v_draft_id uuid;
  v_event_id text;
  v_prelims_starts_at timestamptz;
  v_bouts jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  v_value := private.get_pick_monitoring_event_state_import_segments_core();
  v_staged := v_value->'staged';
  v_current := v_value->'current';

  if jsonb_typeof(v_staged) = 'object' then
    select draft.draft_id, draft.prelims_starts_at
    into v_draft_id, v_prelims_starts_at
    from public.pick_event_drafts draft
    where draft.state = 'staged'
      and draft.event_id = v_staged->>'event_id'
    order by draft.synced_at desc
    limit 1;

    if v_draft_id is not null then
      select coalesce(jsonb_agg(
        item || jsonb_build_object(
          'card_segment', bout.card_segment,
          'segment_sequence', bout.segment_sequence
        )
        order by ordinality
      ), '[]'::jsonb)
      into v_bouts
      from jsonb_array_elements(v_staged->'bouts') with ordinality source(item, ordinality)
      join public.pick_event_draft_bouts bout
        on bout.draft_id = v_draft_id
       and bout.bout_id = source.item->>'bout_id';

      v_staged := jsonb_set(
        v_staged,
        '{prelims_starts_at}',
        coalesce(to_jsonb(v_prelims_starts_at), 'null'::jsonb),
        true
      );
      v_staged := jsonb_set(v_staged, '{bouts}', v_bouts, true);
    end if;
  end if;

  if jsonb_typeof(v_current) = 'object' then
    v_event_id := v_current->>'event_id';
    select event.prelims_starts_at
    into v_prelims_starts_at
    from public.pick_events event
    where event.event_id = v_event_id;

    select coalesce(jsonb_agg(
      item || jsonb_build_object(
        'card_segment', bout.card_segment,
        'segment_sequence', bout.segment_sequence
      )
      order by ordinality
    ), '[]'::jsonb)
    into v_bouts
    from jsonb_array_elements(v_current->'bouts') with ordinality source(item, ordinality)
    join public.pick_bouts bout
      on bout.event_id = v_event_id
     and bout.bout_id = source.item->>'bout_id';

    v_current := jsonb_set(
      v_current,
      '{prelims_starts_at}',
      coalesce(to_jsonb(v_prelims_starts_at), 'null'::jsonb),
      true
    );
    v_current := jsonb_set(v_current, '{bouts}', v_bouts, true);
  end if;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;
revoke all on function public.get_pick_monitoring_event_state()
  from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_event_state() to service_role;
