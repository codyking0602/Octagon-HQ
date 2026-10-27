-- Michel Pereira's UFC contract ended and he left the promotion in July 2026.
-- https://www.ufc.com/athlete/michel-pereira (Not Fighting)
-- https://www.mmafighting.com/ufc/499434/michel-pereira-removed-from-ufc-roster-after-loss-to-shara-bullet-in-baku
-- Exclude one unranked inactive fighter only from future UFC Wheel draws.
-- Retain identity, original grade and all historical picks/results.
do $preflight$
begin
  if (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8 then
    raise exception 'UFC source census advanced: re-audit before deactivating Michel Pereira';
  end if;
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='michel-pereira' and division='Middleweight'
      and display_name='Michel Pereira' and active
      and ranking is null and hidden_grade=74) <> 1 then
    raise exception 'Michel Pereira current unranked identity/grade precondition failed';
  end if;
end $preflight$;

update private.wheel_ufc_fighters
set active=false
where fighter_id='michel-pereira'
  and division='Middleweight'
  and active and ranking is null and hidden_grade=74;

do $postflight$
begin
  if (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 169
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8
     or (select count(*) from private.wheel_ufc_fighters
       where fighter_id='michel-pereira' and division='Middleweight'
         and not active and hidden_grade=74) <> 1 then
    raise exception 'Michel Pereira current eligibility postflight failed';
  end if;
end $postflight$;
