-- Allow CFB Weekly Auction players who already own more than the three scoring
-- teams to keep bidding with their remaining bankroll.
--
-- The generalized completion helper introduced for NFL Build a QB incorrectly
-- rejected p_owned > p_required even though "needed" was already clamped to 0.
-- CFB intentionally allows players to win more than three teams; only the best
-- three count. This restores the original CFB behavior without weakening the
-- bankroll/path-to-completion guard for players still below the requirement.

create or replace function private.football_weekly_auction_bids_preserve_required_completion(
  p_bankroll integer,
  p_required integer,
  p_owned integer,
  p_bids integer[]
)
returns boolean
language sql
immutable
set search_path=''
as $$
  with normalized as (
    select greatest(p_required-p_owned,0) as needed,
           coalesce((select sum(value) from unnest(p_bids) value),0)::integer as committed
  )
  select
    p_bankroll>=0
    and p_required>=0
    and p_owned>=0
    and not exists(select 1 from unnest(p_bids) value where value<0)
    and normalized.committed<=p_bankroll
    and (
      normalized.needed<=1
      or not exists (
        select 1
        from generate_series(1,normalized.needed-1) as possible_wins
        where (
          select coalesce(sum(value),0)
          from (
            select value
            from unnest(p_bids) value
            order by value desc
            limit possible_wins
          ) ranked_bids
        ) > p_bankroll-(normalized.needed-possible_wins)
      )
    )
  from normalized;
$$;

revoke all on function private.football_weekly_auction_bids_preserve_required_completion(
  integer,integer,integer,integer[]
) from public,anon,authenticated;

do $weekly_auction_owned_overflow_contract$
begin
  if not private.football_weekly_auction_bids_preserve_required_completion(
    9,3,4,array[9,0,0]
  ) then
    raise exception 'Weekly Auction must allow a four-team owner to use the full remaining bankroll';
  end if;

  if not private.football_weekly_auction_bids_preserve_completion(
    9,4,9,0,0
  ) then
    raise exception 'CFB Weekly Auction wrapper must allow bidding after the third team';
  end if;

  if private.football_weekly_auction_bids_preserve_required_completion(
    9,3,-1,array[1,0,0]
  ) then
    raise exception 'Weekly Auction completion helper must reject negative owned counts';
  end if;

  if private.football_weekly_auction_bids_preserve_required_completion(
    9,3,4,array[10,0,0]
  ) then
    raise exception 'Weekly Auction completion helper must still enforce remaining bankroll';
  end if;
end
$weekly_auction_owned_overflow_contract$;
