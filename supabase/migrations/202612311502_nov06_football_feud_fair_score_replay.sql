-- November 6 NFL Daily Sports Feud: exact historical replay of Cody and Shane.
-- Keep original attempts, private grading evidence, action history, and the
-- sealed ranked publication immutable. Only add a signed editorial correction
-- and the corresponding completed-result public projection.
-- Ordered replay:
--   Cody: main 42, Fast Money 25 = 67 (original 58).
--   Shane: main 25, Fast Money 23 = 48 (original 34).
-- Each main board stops on its FOURTH valid answer; no fifth-guess stacking.
do $nov06_football_feud$
declare
  v_row record;
  v_target integer;
  v_main integer;
  v_fast integer;
  v_delta integer;
  v_main_delta integer;
  v_fast_delta integer;
  v_details jsonb;
  v_fast_results jsonb;
  v_revised_boards jsonb;
  v_first_board jsonb;
  v_second_board jsonb;
  v_existing integer;
  v_updated integer;
begin
  for v_row in
    select
      a.id attempt_id, p.display_name, a.native_score, a.normalized_score,
      dc.central_day, dc.schedule_version, pr.daily_challenge_id,
      pr.profile_id, pr.public_state, pr.submission_state,
      s.private_setup_evidence
    from private.daily_challenge_attempts a
    join private.daily_challenges dc on dc.id=a.daily_challenge_id
    join private.daily_challenge_setups s on s.id=dc.setup_id
    join private.daily_challenge_progress pr
      on pr.daily_challenge_id=dc.id and pr.profile_id=a.profile_id
    join public.profiles p on p.id=a.profile_id
    where dc.central_day=date '2026-11-06'
      and dc.game_type='sports_feud'
      and dc.schedule_version='football-daily-v22-higher-lower-oct27'
      and a.attempt_kind='official_first'
      and p.normalized_name in ('CODY','SHANE')
    order by p.normalized_name
  loop
    if v_row.private_setup_evidence#>>'{pack,mainBoards,0,id}'
         <> 'nfl-feud-r2-main-career-100-sacks'
       or v_row.private_setup_evidence#>>'{pack,mainBoards,1,id}'
         <> 'nfl-main-11-1'
       or v_row.public_state->>'phase' <> 'complete'
       or jsonb_array_length(v_row.submission_state#>'{engine_state,fastMoneyResults}')<>5
    then
      raise exception 'November 6 Feud board identity/answer count changed for %',v_row.display_name;
    end if;

    if v_row.display_name='CODY' then
      v_target:=67; v_main:=42; v_fast:=25;
      v_delta:=9; v_main_delta:=0; v_fast_delta:=9;
      if v_row.native_score<>58 or v_row.normalized_score<>58
         or v_row.submission_state#>>'{engine_state,mainBoards,0,attempts,1,submittedText}' <> 'Lawrence Taylor'
         or v_row.submission_state#>>'{engine_state,mainBoards,0,attempts,4,submittedText}' <> 'Von Miller'
         or v_row.submission_state#>>'{engine_state,mainBoards,1,attempts,3,submittedText}' <> 'San Francisco Cowboys'
         or v_row.submission_state#>>'{engine_state,mainBoards,1,attempts,4,submittedText}' <> 'Raiders Chiefs'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,0,submittedText}' <> 'Fire'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,submittedText}' <> 'Trade'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,4,submittedText}' <> 'Beer'
      then raise exception 'Cody Nov 6 original answer ledger differs from audited replay'; end if;
      v_details:=jsonb_build_object(
        'feud_main',jsonb_build_array(
          jsonb_build_object('board_id','nfl-feud-r2-main-career-100-sacks','answer','Lawrence Taylor',
            'accepted',true,'points',2,'matched','Lawrence Taylor'),
          jsonb_build_object('board_id','nfl-feud-r2-main-career-100-sacks','answer','Von Miller',
            'excluded',true,'points',0),
          jsonb_build_object('board_id','nfl-main-11-1','answer','San Francisco Cowboys',
            'accepted',true,'points',5,'matched','49ers-Cowboys'),
          jsonb_build_object('board_id','nfl-main-11-1','answer','Raiders Chiefs',
            'excluded',true,'points',0)
        ),
        'feud_fast',jsonb_build_array(
          jsonb_build_object('question_id','nfl-feud-r2-fast-blitz-package-types','answer','Fire',
            'points',1,'matched','Fire-zone blitz'),
          jsonb_build_object('question_id','nfl-feud-r2-fast-draft-room-events','answer','Trade',
            'points',7,'matched','Trade a pick'),
          jsonb_build_object('question_id','nfl-feud-r2-fast-tailgate-gear','answer','Beer',
            'points',1,'matched','Drinks')
        )
      );
    elsif v_row.display_name='SHANE' then
      v_target:=48; v_main:=25; v_fast:=23;
      v_delta:=14; v_main_delta:=6; v_fast_delta:=8;
      if v_row.native_score<>34 or v_row.normalized_score<>34
         or v_row.submission_state#>>'{engine_state,mainBoards,1,attempts,1,submittedText}' <> 'Dallas Cowboys - New York Giants'
         or v_row.submission_state#>>'{engine_state,mainBoards,1,attempts,2,submittedText}' <> 'New England- Giants'
         or v_row.submission_state#>>'{engine_state,mainBoards,1,attempts,3,submittedText}' <> 'Jets - Giants'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,1,submittedText}' <> 'Cowboys'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,submittedText}' <> 'Trade Up'
         or v_row.submission_state#>>'{engine_state,fastMoneyResults,4,submittedText}' <> 'Beer'
      then raise exception 'Shane Nov 6 original answer ledger differs from audited replay'; end if;
      v_details:=jsonb_build_object(
        'feud_main',jsonb_build_array(
          jsonb_build_object('board_id','nfl-main-11-1','answer','Dallas Cowboys - New York Giants',
            'accepted',true,'points',2,'matched','Cowboys-Giants'),
          jsonb_build_object('board_id','nfl-main-11-1','answer','New England- Giants',
            'accepted',true,'points',2,'matched','Patriots-Giants'),
          jsonb_build_object('board_id','nfl-main-11-1','answer','Jets - Giants',
            'accepted',true,'points',2,'matched','Jets-Giants')
        ),
        'feud_fast',jsonb_build_array(
          jsonb_build_object('question_id','nfl-feud-r2-fast-draft-room-events','answer','Trade Up',
            'points',7,'matched','Trade a pick'),
          jsonb_build_object('question_id','nfl-feud-r2-fast-tailgate-gear','answer','Beer',
            'points',1,'matched','Drinks')
        )
      );
    else
      raise exception 'Unexpected Nov 6 player: %',v_row.display_name;
    end if;

    select score_delta into v_existing
      from private.daily_challenge_score_corrections where attempt_id=v_row.attempt_id;
    if v_existing is not null and v_existing<>v_delta then
      raise exception 'Conflicting previously issued Nov 6 correction for %',v_row.display_name;
    end if;
    insert into private.daily_challenge_score_corrections(
      attempt_id,score_delta,main_points_delta,fast_money_points_delta,editorial_details,reason)
    values (v_row.attempt_id,v_delta,v_main_delta,v_fast_delta,v_details,
      'Nov 6 NFL Sports Feud fair-answer replay from preserved submission order; four main answers per board, correct NFL facts and synonyms.')
    on conflict (attempt_id) do nothing;

    select coalesce(jsonb_agg(
      case
        when x.value->>'question_id'='nfl-feud-r2-fast-blitz-package-types'
             and v_row.display_name='CODY'
          then x.value || jsonb_build_object(
            'points',1,'counted',true,'board_rank',null,'submitted_answer','Fire-zone blitz')
        when x.value->>'question_id'='nfl-feud-r2-fast-draft-room-events'
          then x.value || jsonb_build_object(
            'points',7,'counted',true,'board_rank',2,'submitted_answer','Trade a pick')
        when x.value->>'question_id'='nfl-feud-r2-fast-tailgate-gear'
          then x.value || jsonb_build_object(
            'points',1,'counted',true,'board_rank',null,'submitted_answer','Drinks')
        else x.value
      end order by x.ordinality),'[]'::jsonb)
      into v_fast_results
    from jsonb_array_elements(v_row.public_state#>'{fast_money,results}')
      with ordinality as x(value,ordinality);

    if jsonb_array_length(v_fast_results)<>5 then
      raise exception 'Nov 6 Feud public fast reveal changed for %',v_row.display_name;
    end if;


    -- Show the exact four successful answers and corrected strikes in the
    -- completed-game result. The original recorded_guesses and engine_state
    -- remain untouched, with editorial_details disclosing later excluded
    -- answers after each board was legally full.
    if v_row.public_state->>'editorial_correction'
         = '2026-11-06-verified-football-feud-replay' then
      v_revised_boards := v_row.public_state->'main_boards';
    else
      v_first_board := v_row.public_state#>'{main_boards,0}';
      v_second_board := v_row.public_state#>'{main_boards,1}';
      if v_row.display_name='CODY' then
        v_first_board := v_first_board || jsonb_build_object(
          'strikes',0,
          'slots',jsonb_build_array(
            v_first_board#>'{slots,0}',
            jsonb_build_object(
              'slot_index',1,'points',2,'found',true,'revealed',true,
              'entity',jsonb_build_object(
                'id','nfl-feud-r2-main-career-100-sacks:fair1',
                'display_name','Lawrence Taylor')),
            (v_first_board#>'{slots,1}') || jsonb_build_object('slot_index',2),
            (v_first_board#>'{slots,2}') || jsonb_build_object('slot_index',3)
          ));
        v_second_board := jsonb_set(
          v_second_board,'{answer_reveal,3,found}','true'::jsonb,false);
        v_second_board := v_second_board || jsonb_build_object(
          'strikes',0,
          'slots',jsonb_build_array(
            v_second_board#>'{slots,0}',
            v_second_board#>'{slots,1}',
            v_second_board#>'{slots,2}',
            jsonb_build_object('slot_index',3,'points',5,'found',true,
              'revealed',true,'entity',jsonb_build_object(
                'id','nfl-main-11-1:a4',
                'display_name','49ers-Cowboys'))
          ));
      else
        v_second_board := v_second_board || jsonb_build_object(
          'strikes',0,
          'slots',jsonb_build_array(
            v_second_board#>'{slots,0}',
            jsonb_build_object('slot_index',1,'points',2,'found',true,
              'revealed',true,'entity',jsonb_build_object(
                'id','nfl-main-11-1:fair1',
                'display_name','Cowboys-Giants')),
            jsonb_build_object('slot_index',2,'points',2,'found',true,
              'revealed',true,'entity',jsonb_build_object(
                'id','nfl-main-11-1:fair2',
                'display_name','Patriots-Giants')),
            jsonb_build_object('slot_index',3,'points',2,'found',true,
              'revealed',true,'entity',jsonb_build_object(
                'id','nfl-main-11-1:fair3',
                'display_name','Jets-Giants'))
          ));
      end if;
      v_revised_boards:=jsonb_build_array(v_first_board,v_second_board);
    end if;
    if jsonb_array_length(v_revised_boards)<>2 then
      raise exception 'Nov 6 Feud corrected board count differs for %',v_row.display_name;
    end if;

    update private.daily_challenge_progress pr set
      public_state=pr.public_state || jsonb_build_object(
        'hq_score',v_target,'raw_points',v_target,'main_points',v_main,
        'main_boards',v_revised_boards,
        'fast_money',(pr.public_state->'fast_money') ||
          jsonb_build_object('points',v_fast,'results',v_fast_results),
        'editorial_correction','2026-11-06-verified-football-feud-replay'
      ),
      updated_at=now()
    where pr.daily_challenge_id=v_row.daily_challenge_id
      and pr.profile_id=v_row.profile_id
      and (
        (pr.public_state->>'hq_score')::integer = v_row.native_score
        or (pr.public_state->>'hq_score')::integer = v_target
      );
    get diagnostics v_updated=row_count;
    if v_updated<>1 then raise exception 'Nov 6 Feud public result update was not unique for %',v_row.display_name; end if;
  end loop;
end
$nov06_football_feud$;
