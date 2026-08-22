-- Make trusted ESPN live state the automatic Fight Night lock authority while
-- preserving the existing Picks lock owner, owner override, and manual master lock.
--
-- The staged per-fight timestamps remain useful UFC schedule estimates. Once a
-- bout is attached to ESPN, an elapsed estimate alone must not lock member picks;
-- the trusted live/final transition does. Unattached bouts retain the legacy
-- deadline fallback so a provider mismatch never creates an unbounded open fight.

comment on column public.pick_bouts.locks_at is
  'Per-fight UFC schedule/deadline timestamp. For ESPN-attached Fight Night bouts it is presentation/owner-override timing only; trusted provider live/final state owns automatic locking. Unattached bouts retain deadline locking.';

create or replace function private.pick_bout_is_locked(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_event.status in ('locked', 'complete')
    or coalesce(p_bout.result_status, 'pending') <> 'pending'
    or (
      current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'on'
      and (
        (
          p_bout.live_status_provider is distinct from 'espn'
          and p_now >= coalesce(p_bout.locks_at, p_event.locks_at)
        )
        or (
          p_bout.live_status_provider = 'espn'
          and p_bout.live_status in ('live', 'final')
          and not exists (
            select 1
            from public.pick_card_change_actions action
            where action.event_id = p_event.event_id
              and action.bout_id = p_bout.bout_id
              and action.action_type = 'adjust_bout_lock_time'
              and p_bout.live_status_observed_at is not null
              and action.approved_at > p_bout.live_status_observed_at
              and nullif(action.after_state->>'locks_at', '')::timestamptz
                is not distinct from p_bout.locks_at
              and p_bout.locks_at is not null
              and p_now < p_bout.locks_at
          )
        )
      )
    );
$$;
revoke all on function private.pick_bout_is_locked(
  public.pick_events,public.pick_bouts,timestamptz
) from public, anon, authenticated;

-- Keep the existing owner RPC/query path and add only the provider attachment
-- needed by the owner UI to distinguish an ESPN-controlled estimate from a
-- legacy hard deadline.
create or replace function public.get_pick_control_event(
  p_event_id text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_bouts jsonb;
begin
  v_event := private.get_pick_control_event_live_state_core(p_event_id);
  if v_event is null then return null; end if;

  select coalesce(
    jsonb_agg(
      item.payload || jsonb_build_object(
        'live_status', bout.live_status,
        'live_status_provider', bout.live_status_provider
      )
      order by item.ordinality
    ),
    '[]'::jsonb
  )
  into v_bouts
  from jsonb_array_elements(coalesce(v_event->'bouts', '[]'::jsonb))
    with ordinality as item(payload, ordinality)
  join public.pick_bouts bout
    on bout.event_id = v_event->>'event_id'
   and bout.bout_id = item.payload->>'bout_id';

  return jsonb_set(v_event, '{bouts}', v_bouts, true);
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

comment on function public.get_pick_control_event(text) is
  'Canonical Fight Night owner control payload, including trusted provider state and provider attachment per bout.';

notify pgrst, 'reload schema';
