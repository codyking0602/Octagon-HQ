-- Week 2026-10-27 scores under 90% roster, 3% wins, 7% playoff finish.
begin;
do $gm$
declare
  v_state jsonb;
  v_score numeric;
begin
  v_state := jsonb_build_object(
    'seed', 'weekly-gm:2026-10-27:elite:test',
    'resolvedSeasons', jsonb_build_array(
      jsonb_build_object('year',1,'rawTeamGrade',93.3,'weakLinkPenalty',0,'teamGrade',93.3,'wins',16,'losses',1,'finish','Champion'),
      jsonb_build_object('year',2,'rawTeamGrade',91.1,'weakLinkPenalty',0,'teamGrade',91.1,'wins',14,'losses',3,'finish','Conference Championship'),
      jsonb_build_object('year',3,'rawTeamGrade',91.7,'weakLinkPenalty',0,'teamGrade',91.7,'wins',12,'losses',5,'finish','Conference Championship')
    )
  );
  v_score := private.football_weekly_gm_verified_score(v_state);
  if v_score <> 97.3 then raise exception 'Cody WR expected 97.3; got %',v_score; end if;
  v_state := jsonb_build_object(
    'seed', 'weekly-gm:2026-10-27:elite:test',
    'resolvedSeasons', jsonb_build_array(
      jsonb_build_object('year',1,'rawTeamGrade',89,'weakLinkPenalty',0,'teamGrade',89,'wins',12,'losses',5,'finish','Wild Card'),
      jsonb_build_object('year',2,'rawTeamGrade',91.4,'weakLinkPenalty',0,'teamGrade',91.4,'wins',15,'losses',2,'finish','Champion'),
      jsonb_build_object('year',3,'rawTeamGrade',92.7,'weakLinkPenalty',0,'teamGrade',92.7,'wins',14,'losses',3,'finish','Champion')
    )
  );
  v_score := private.football_weekly_gm_verified_score(v_state);
  if v_score <> 96.0 then raise exception 'Shane WR expected 96.0; got %',v_score; end if;

  -- Archived weeks remain under the exact original 90/10 formula.
  v_state := jsonb_set(v_state,'{seed}','"weekly-gm:2026-10-20:elite:test"'::jsonb);
  v_score := private.football_weekly_gm_verified_score(v_state);
  if v_score <> 96.2 then raise exception 'Historic score expected 96.2; got %',v_score; end if;
end;
$gm$;
rollback;
\echo 'Weekly GM 90/3/7 score verifier and historic preservation passed.'
