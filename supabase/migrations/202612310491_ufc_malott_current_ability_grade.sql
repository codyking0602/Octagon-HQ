-- Editorial UFC Wheel present-ability upgrade: Mike Malott 80.80 -> 86.00.
-- UFC confirms five straight wins, Oct 17 round-2 KO over Joaquin Buckley,
-- and Apr 18 round-3 finish of Gilbert Burns. Not a rankings-driven regrade.
-- https://www.ufc.com/index.php/news/ufc-edmonton-results-buckley-vs-malott
-- https://www.ufc.com/athlete/mike-malott
-- Prior completed wheel_ufc_picks snapshot hidden_grade/grade_version at pick time.
-- This revision applies only to new drafts; do not touch saved pick rows.
do $preflight$
begin
  if (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 168
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8 then
    raise exception 'UFC current roster census drift: block Malott grade update';
  end if;
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='mike-malott' and division='Welterweight'
      and display_name='Mike Malott' and active and not is_champion
      and ranking=10 and hidden_grade=80.80
      and grade_version='ufc-wheel-current-v3-anchor-audit-20261004') <> 1 then
    raise exception 'UFC Malott exact identity/rank/old ability preflight mismatch';
  end if;
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='joaquin-buckley' and division='Welterweight'
      and hidden_grade=84.50 and active) <> 1 then
    raise exception 'UFC peer ability calibration drift: Joaquin Buckley';
  end if;
end $preflight$;

update private.wheel_ufc_fighters
set hidden_grade=86.00,
    grade_version='ufc-wheel-malott-ability-2026-10-26-v1'
where fighter_id='mike-malott' and division='Welterweight'
  and active and ranking=10 and hidden_grade=80.80
  and grade_version='ufc-wheel-current-v3-anchor-audit-20261004';

do $postflight$
begin
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='mike-malott' and division='Welterweight'
      and ranking=10 and active and hidden_grade=86.00
      and grade_version='ufc-wheel-malott-ability-2026-10-26-v1') <> 1
     or (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 168
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8 then
    raise exception 'UFC Malott grade version postflight mismatch';
  end if;
end $postflight$;
