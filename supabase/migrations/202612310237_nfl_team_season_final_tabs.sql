-- Standardize the NFL Team-Seasons final screen with the other Weekly Auctions.
-- Keep the all-card grade reveal (including all four Day 7 Wildcards), and also expose every player's effective
-- post-Wildcard collection so the final Collections tab is truthful.

create or replace function private.football_weekly_nfl_team_season_final_payload(
  p_week_start date,p_profile_id uuid
)
returns jsonb
language sql
stable security definer
set search_path=''
as $$
  with standings as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'rank',result.final_rank,
      'profile_id',result.profile_id,
      'display_name',profile.display_name,
      'final_score',result.final_score,
      'scoring_cost',result.scoring_cost,
      'owned_count',result.owned_count,
      'is_winner',result.is_winner,
      'is_current_user',result.profile_id=p_profile_id
    ) order by result.final_rank,profile.display_name),'[]'::jsonb) as payload
    from private.football_weekly_auction_results result
    join public.profiles profile on profile.id=result.profile_id
    where result.week_start=p_week_start
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'grade',item.hidden_grade,
      'winning_bid',effective.winning_bid,
      'source',effective.source,
      'counts',item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))
    ) order by
      (item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))) desc,
      item.hidden_grade desc,item.season_year desc),'[]'::jsonb) as payload
    from private.football_weekly_nfl_team_season_effective_collection(p_week_start,p_profile_id) effective
    join private.football_weekly_auction_items item
      on item.item_reference=effective.item_reference
    left join private.football_weekly_auction_results result
      on result.week_start=p_week_start and result.profile_id=p_profile_id
  ),
  final_collections as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',participant.profile_id,
      'display_name',profile.display_name,
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'grade',item.hidden_grade,
      'winning_bid',effective.winning_bid,
      'source',effective.source,
      'counts',item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))
    ) order by
      result.final_rank,
      (item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))) desc,
      item.hidden_grade desc,
      item.season_year desc
    ),'[]'::jsonb) as payload
    from private.football_weekly_auction_participants participant
    join public.profiles profile on profile.id=participant.profile_id
    join private.football_weekly_auction_results result
      on result.week_start=p_week_start
     and result.profile_id=participant.profile_id
    cross join lateral private.football_weekly_nfl_team_season_effective_collection(
      p_week_start,participant.profile_id
    ) effective
    join private.football_weekly_auction_items item
      on item.item_reference=effective.item_reference
    where participant.week_start=p_week_start
  ),
  all_item_rows as (
    select
      board.day_index,
      board.slot,
      item.item_reference,
      item.primary_name as team_name,
      item.team_code,
      item.season_year,
      item.display_label,
      item.hidden_grade as grade,
      coalesce(award.winning_bid,0)::integer as winning_bid,
      award.profile_id as winner_profile_id,
      profile.display_name as winner_display_name
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start
     and award.day_index=board.day_index
     and award.slot=board.slot
    left join public.profiles profile on profile.id=award.profile_id
    where board.week_start=p_week_start
      and board.day_index between 1 and 6
      and board.slot<=private.football_weekly_auction_cards_for_day(board.week_start,board.day_index)

    union all

    select
      7 as day_index,
      board.slot,
      item.item_reference,
      item.primary_name as team_name,
      item.team_code,
      item.season_year,
      item.display_label,
      item.hidden_grade as grade,
      0 as winning_bid,
      claim.profile_id as winner_profile_id,
      profile.display_name as winner_display_name
    from private.football_weekly_nfl_team_season_wildcard_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.item_reference
    left join private.football_weekly_nfl_team_season_wildcard_claims claim
      on claim.week_start=board.week_start
     and claim.item_reference=board.item_reference
    left join public.profiles profile on profile.id=claim.profile_id
    where board.week_start=p_week_start
  ),
  all_items as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',row.day_index,
      'slot',row.slot,
      'item_reference',row.item_reference,
      'team_name',row.team_name,
      'team_code',row.team_code,
      'season_year',row.season_year,
      'display_label',row.display_label,
      'grade',row.grade,
      'winning_bid',row.winning_bid,
      'winner_profile_id',row.winner_profile_id,
      'winner_display_name',row.winner_display_name
    ) order by row.day_index,row.slot),'[]'::jsonb) as payload
    from all_item_rows row
  ),
  mine as (
    select to_jsonb(result) as payload
    from private.football_weekly_auction_results result
    where result.week_start=p_week_start and result.profile_id=p_profile_id
  ),
  wildcard as (
    select private.football_weekly_nfl_team_season_wildcard_state(
      p_week_start,p_profile_id,(p_week_start+7)::timestamp at time zone 'America/Chicago'
    ) as payload
  )
  select jsonb_build_object(
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',p_week_start,
    'standings',standings.payload,
    'collection',collection.payload,
    'final_collections',final_collections.payload,
    'all_teams',all_items.payload,
    'wildcard',wildcard.payload,
    'my_result',coalesce(mine.payload,'{}'::jsonb)
  )
  from standings,collection,final_collections,all_items,wildcard
  left join mine on true;
$$;
revoke all on function private.football_weekly_nfl_team_season_final_payload(date,uuid)
  from public,anon,authenticated;

do $nfl_team_season_final_tabs_contract$
declare
  v_payload jsonb;
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='private'
      and p.proname='football_weekly_nfl_team_season_final_payload'
  ) then
    raise exception 'NFL Team-Seasons final payload is missing';
  end if;

  if position(
    '''final_collections'',final_collections.payload'
    in pg_get_functiondef(
      'private.football_weekly_nfl_team_season_final_payload(date,uuid)'::regprocedure
    )
  )=0 then
    raise exception 'NFL Team-Seasons final payload must expose every final collection';
  end if;
end;
$nfl_team_season_final_tabs_contract$;
