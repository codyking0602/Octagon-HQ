-- Owner-preview NBA Futures refinement: only postseason outcomes, 30 wins, MVP and DPOY.
-- Preserve submitted drafts and previous JSON fields without requiring retired picks.
create or replace function public.nba_futures_complete(p_picks jsonb)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_picks is not null
    and (select count(*) from jsonb_object_keys(coalesce(p_picks->'winTotals','{}'::jsonb)))=30
    and jsonb_array_length(coalesce(p_picks->'playoffTeams','[]'::jsonb))=16
    and jsonb_array_length(coalesce(p_picks->'conferenceFinalists','[]'::jsonb))=4
    and jsonb_array_length(coalesce(p_picks->'finalsTeams','[]'::jsonb))=2
    and length(trim(coalesce(p_picks->>'champion','')))>0
    and length(trim(coalesce(p_picks->>'mvp','')))>0
    and length(trim(coalesce(p_picks->>'dpoy','')))>0;
$$;
revoke all on function public.nba_futures_complete(jsonb) from public,anon,authenticated;
