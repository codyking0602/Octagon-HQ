begin;

do $wheel_oct14_contract$
declare
  v_ap integer;
  v_malformed integer;
  v_missing_media integer;
begin
  select count(*) into v_ap
  from private.wheel_football_ap_top_25
  where season = 2026 and poll_date = date '2026-10-11';
  if v_ap <> 25 then raise exception 'October 11 Wheel AP poll incomplete: %', v_ap; end if;

  with divisions as (
    select division,
      count(*) filter(where is_champion) champs,
      count(*) filter(where ranking is not null) ranked,
      count(distinct ranking) filter(where ranking is not null) distinct_ranked
    from private.wheel_ufc_fighters where active group by division
  )
  select count(*) into v_malformed
  from divisions where champs <> 1 or ranked <> 15 or distinct_ranked <> 15;
  if v_malformed <> 0 then raise exception 'UFC ranked divisions malformed: %', v_malformed; end if;

  select count(*) into v_missing_media
  from private.wheel_ufc_fighters
  where active and (headshot_url is null or btrim(headshot_url) = '');
  if v_missing_media <> 0 then raise exception 'UFC active fighters missing media URL: %', v_missing_media; end if;

  if private.wheel_ufc_ranking_label('payton-talbott','Bantamweight') <> '#7'
    or private.wheel_ufc_ranking_label('alex-pereira','Heavyweight') <> 'LHW #3'
    or private.wheel_ufc_ranking_label('johnny-walker','Heavyweight') <> 'UNRANKED'
  then raise exception 'October 10 UFC ranking display labels mismatched'; end if;
end;
$wheel_oct14_contract$;

rollback;
