-- Current source identity correction, no regrading or rankings edits.
-- UFC official: Muhammad "Kubik" Saidov is Dagestan, Russia (not Tajikistan).
-- UFC athlete page uses /athlete/muhammad-said, not /muhammad-saidov.
-- https://www.ufc.com.br/athlete/muhammad-said
-- https://www.ufc.com/news/official-weigh-results-ufc-abu-dhabi-ankalaev-guskov
-- Keep fighter_id='muhammad-saidov' and preexisting historical pick identities.
do $preflight$
begin
  if (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 168
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8 then
    raise exception 'UFC source population drift before Saidov country correction';
  end if;
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='muhammad-saidov' and display_name='Muhammad Saidov'
      and division='Light Heavyweight' and ranking=13 and active and not is_champion
      and country_code='TJ' and country_name='Tajikistan'
      and hidden_grade=74) <> 1 then
    raise exception 'Muhammad Saidov verified identity/prechange country no longer matches';
  end if;
  if exists (select 1 from private.ufc_fighter_identity_aliases
    where alias_key in ('muhammad said','mukhammad said')) then
    raise exception 'Muhammad Said athlete aliases already present; reconcile first';
  end if;
end $preflight$;

-- Existing canonical fighter id remains stable in all history and grading.
update private.wheel_ufc_fighters
set country_code='RU',country_name='Russia'
where fighter_id='muhammad-saidov' and division='Light Heavyweight'
  and country_code='TJ' and country_name='Tajikistan';

-- UFC official English/Arabic/Russian transliteration may omit '-ov'.
insert into private.ufc_fighter_identity_aliases(alias_key,canonical_key)
values ('muhammad said','muhammad saidov'),('mukhammad said','muhammad saidov');

do $postflight$
begin
  if (select count(*) from private.wheel_ufc_fighters
    where fighter_id='muhammad-saidov' and display_name='Muhammad Saidov'
      and division='Light Heavyweight' and ranking=13 and active
      and country_code='RU' and country_name='Russia'
      and hidden_grade=74) <> 1
     or (select count(*) from private.ufc_fighter_identity_aliases
       where canonical_key='muhammad saidov'
         and alias_key in ('muhammad said','mukhammad said')) <> 2
     or (select count(*) from private.wheel_ufc_fighters) <> 170
     or (select count(*) from private.wheel_ufc_fighters where active) <> 168
     or (select count(*) from private.wheel_ufc_fighters where active and ranking between 1 and 15) <> 120
     or (select count(*) from private.wheel_ufc_fighters where active and is_champion) <> 8 then
    raise exception 'Saidov country/source-alias postflight integrity failure';
  end if;
end $postflight$;
