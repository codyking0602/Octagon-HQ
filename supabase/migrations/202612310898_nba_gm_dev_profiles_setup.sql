-- NBA GM: source-linked identity-specific baseline; all odds are editorial game assumptions.
-- Verified NBA birthdates (301) and existing six-skill/player flags are the inputs.
alter table private.nba_gm_dev_players add column if not exists development_profile jsonb;
with ages as (
 select id,overall,verified_birth_date,
  case when verified_birth_date is null then null else
   extract(year from age(date '2026-10-30',verified_birth_date))::integer end a,
  (select max(value::integer) from jsonb_each_text(skills)) peak,
  'availability-separate'=any(review_flags) risky
 from private.nba_gm_dev_players
)
update private.nba_gm_dev_players p set development_profile=jsonb_build_object(
 'breakoutPct',case when x.overall=99 then 0 else greatest(1,
  (case when x.a is null then 7 when x.a<=23 then 19 when x.a<=26 then 12
    when x.a<=29 then 7 when x.a<=32 then 3 else 1 end)
   -greatest(0,x.overall-88)*1.2 +case when x.peak>x.overall+7 then 2 else 0 end)::integer end,
 'improvePct',case when x.overall=99 then 0 else
   (case when x.a is null then 24 when x.a<=25 then 36 when x.a<=30 then 28
     when x.a<=34 then 18 else 10 end) end,
 'declinePct',(case when x.a is null then 29 when x.a<=25 then 16
   when x.a<=28 then 22 when x.a<=31 then 29 when x.a<=34 then 42 else 52 end)
   +case when x.risky then 7 else 0 end,
 'maxAnnualGain',least(99-x.overall,case when x.a is null then 3.0
  when x.a<=23 then 5.4 when x.a<=26 then 4.7 when x.a<=29 then 3.8
  when x.a<=32 then 3.0 else 1.5 end),
 'maxAnnualLoss',case when x.a is null then 4.2 when x.a>=35 then 5.8
  when x.a>=31 then 4.8 else 3.7 end,
 'careerHeadroom',least(99-x.overall,case when x.a is null then 5.0
  when x.a<=23 then 9.0 when x.a<=26 then 7.0 when x.a<=29 then 5.0
  when x.a<=32 then 3.0 else 1.0 end),
 'marketVariancePct',case when x.risky then 9 else 6 end,
 'sourceKind',case when x.verified_birth_date is null then 'missing-2025-26-nba-season'
  else 'pinned-2025-26-nba-api' end)
from ages x where p.id=x.id;
