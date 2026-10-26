-- Apply first-party UFC standard "All Rankings" factual moves verified Oct 26, 2026.
-- This is PLAYABLE Wheel of UFC eligibility data, not a report-only monitor.
-- 18 unambiguous rank updates + three confirmed departures from the ranked 15.
-- Fighter identities, active population, champions, hidden grades and historical picks
-- remain unchanged. Published source: https://www.ufc.com/rankings (October 20).
-- Official HW #12 is tied Tyrell Fortune / Derrick Lewis. Wheel currently
-- requires distinct #1-15 slots. Hold the Derrick Lewis #13=>#12 conflict for
-- a separate rules decision; do NOT silently manufacture a distinct rank.
create temporary table wheel_ufc_oct26_rank_corrections (
  division text not null,
  fighter_id text not null,
  previous_rank integer,
  new_rank integer,
  primary key (division, fighter_id)
) on commit drop;

insert into wheel_ufc_oct26_rank_corrections (division,fighter_id,previous_rank,new_rank) values
  ('Bantamweight','aiemann-zahabi',7,9),
  ('Bantamweight','bryce-mitchell',null,15),
  ('Bantamweight','deiveson-figueiredo',9,12),
  ('Bantamweight','marcus-mcghee',15,13),
  ('Bantamweight','marlon-vera',10,11),
  ('Bantamweight','payton-talbott',12,7),
  ('Bantamweight','raul-rosas-jr',11,10),
  ('Bantamweight','farid-basharat',13,null),

  ('Heavyweight','aleksandar-rakic',15,14),
  ('Heavyweight','mario-pinto',14,15),

  ('Light Heavyweight','alonzo-menifield',14,12),
  ('Light Heavyweight','azamat-murzakanov',8,7),
  ('Light Heavyweight','bogdan-guskov',11,10),
  ('Light Heavyweight','dominick-reyes',10,8),
  ('Light Heavyweight','muhammad-saidov',null,13),
  ('Light Heavyweight','reinier-de-ridder',null,14),
  ('Light Heavyweight','robert-whittaker',12,11),
  ('Light Heavyweight','jamahal-hill',7,null),
  ('Light Heavyweight','johnny-walker',13,null),

  ('Welterweight','joaquin-buckley',10,12),
  ('Welterweight','mike-malott',13,10);

do $preflight$
declare
  v_census integer;
  v_matching integer;
begin
  select count(*) into v_census from private.wheel_ufc_fighters where active;
  if v_census <> 170 then
    raise exception 'UFC active population changed: expected 170, found %',v_census;
  end if;
  if (select count(*) from wheel_ufc_oct26_rank_corrections) <> 21 then
    raise exception 'UFC correction ledger must contain exactly 21 distinct fighter/division rows';
  end if;
  select count(*) into v_matching
  from wheel_ufc_oct26_rank_corrections correction
  join private.wheel_ufc_fighters fighter
    on fighter.division=correction.division and fighter.fighter_id=correction.fighter_id
   and fighter.active and not fighter.is_champion
   and fighter.ranking is not distinct from correction.previous_rank;
  if v_matching <> 21 then
    raise exception 'UFC ranking authority drift: expected 21 verified before-values, matched %',v_matching;
  end if;
end;
$preflight$;

-- Clear affected ranks first to permit swaps without transient unique conflicts.
update private.wheel_ufc_fighters fighter
set ranking=null
from wheel_ufc_oct26_rank_corrections correction
where fighter.division=correction.division and fighter.fighter_id=correction.fighter_id
  and fighter.active;

update private.wheel_ufc_fighters fighter
set ranking=correction.new_rank,
    rankings_as_of=date '2026-10-20',
    ranking_source='ufc-all-rankings'
from wheel_ufc_oct26_rank_corrections correction
where fighter.division=correction.division and fighter.fighter_id=correction.fighter_id
  and fighter.active;

-- Do not rewrite completed match picks / historical categories or rankings.
do $postflight$
declare
  v_bad integer;
  v_mismatch integer;
begin
  select count(*) into v_mismatch
  from wheel_ufc_oct26_rank_corrections correction
  join private.wheel_ufc_fighters fighter
    on fighter.division=correction.division and fighter.fighter_id=correction.fighter_id
  where fighter.ranking is distinct from correction.new_rank
    or fighter.is_champion
    or fighter.rankings_as_of is distinct from date '2026-10-20';
  if v_mismatch <> 0 then
    raise exception 'UFC rank application had % incomplete rows',v_mismatch;
  end if;
  select count(*) into v_bad from (
    select division,
      count(*) filter (where is_champion) as champions,
      count(*) filter (where ranking is not null) as ranked,
      count(distinct ranking) as distinct_ranked,
      min(ranking) as min_rank,max(ranking) as max_rank
    from private.wheel_ufc_fighters where active group by division
  ) a where champions<>1 or ranked<>15 or distinct_ranked<>15 or min_rank<>1 or max_rank<>15;
  if v_bad <> 0 then
    raise exception 'UFC Wheel division category census failed in % divisions',v_bad;
  end if;
  if (select count(*) from private.wheel_ufc_fighters where active) <> 170 then
    raise exception 'UFC active population changed during ranking correction';
  end if;
end;
$postflight$;
