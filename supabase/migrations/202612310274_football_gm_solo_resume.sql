-- Restore the latest unfinished solo GM run across app restarts and devices.

create or replace function public.load_my_latest_football_gm_run()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select run.state
  from private.football_gm_runs run
  where run.profile_id = auth.uid()
    and run.completed_at is null
    and coalesce(run.state ->> 'phase', '') <> 'final'
  order by run.updated_at desc
  limit 1;
$$;

revoke all on function public.load_my_latest_football_gm_run()
  from public, anon;
grant execute on function public.load_my_latest_football_gm_run()
  to authenticated;
