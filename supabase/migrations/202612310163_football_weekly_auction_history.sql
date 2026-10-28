-- Persistent Weekly Auction result history for the signed-in player.
-- Keeps the one-time final acknowledgement flow intact while allowing every
-- completed Weekly Auction result to be reopened from Football Play.

create or replace function public.get_my_football_weekly_auction_history()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid := auth.uid();
  v_history jsonb := '[]'::jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(now());

  select coalesce(
    jsonb_agg(
      private.football_weekly_auction_final_payload(result.week_start, v_profile)
      order by result.week_start desc
    ),
    '[]'::jsonb
  )
  into v_history
  from private.football_weekly_auction_results result
  where result.profile_id = v_profile;

  return v_history;
end;
$$;

revoke all on function public.get_my_football_weekly_auction_history()
  from public, anon;
grant execute on function public.get_my_football_weekly_auction_history()
  to authenticated;
