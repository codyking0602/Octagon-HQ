-- Enrich the existing owner-only Event Setup projection with the import fields
-- added in 202608290001. The original projection remains the sole core reader.
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
