-- Preserve the one canonical monitoring event projection while restoring the exact
-- Event Setup source URL after a draft becomes the published Picks card. Both manual
-- and scheduled checks consume this projection through run-pick-monitoring.

alter function public.get_pick_monitoring_event_state()
  rename to get_pick_monitoring_event_state_source_context_core;
alter function public.get_pick_monitoring_event_state_source_context_core()
  set schema private;
revoke all on function private.get_pick_monitoring_event_state_source_context_core()
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
  v_source_url text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  v_value := private.get_pick_monitoring_event_state_source_context_core();
  v_staged := v_value->'staged';
  v_current := v_value->'current';

  if jsonb_typeof(v_staged) = 'object' then
    select draft.source_url
      into v_source_url
    from public.pick_event_drafts draft
    where draft.state = 'staged'
      and draft.event_id = v_staged->>'event_id'
    order by draft.synced_at desc
    limit 1;

    if found then
      v_staged := jsonb_set(
        v_staged,
        '{source_url}',
        coalesce(to_jsonb(v_source_url), 'null'::jsonb),
        true
      );
    end if;
  end if;

  v_source_url := null;
  if jsonb_typeof(v_current) = 'object' then
    select draft.source_url
      into v_source_url
    from public.pick_event_drafts draft
    where draft.state = 'published'
      and draft.event_id = v_current->>'event_id'
    order by draft.published_at desc nulls last, draft.synced_at desc
    limit 1;

    if found then
      v_current := jsonb_set(
        v_current,
        '{source_url}',
        coalesce(to_jsonb(v_source_url), 'null'::jsonb),
        true
      );
    end if;
  end if;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;

revoke all on function public.get_pick_monitoring_event_state()
  from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_event_state()
  to service_role;

notify pgrst, 'reload schema';
