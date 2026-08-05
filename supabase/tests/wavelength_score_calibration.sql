\set ON_ERROR_STOP on
begin;

do $$
declare
  v_native integer;
  v_normalized integer;
begin
  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'find_leader',
    'play-official-score-v1',
    jsonb_build_object('eliminated_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','leader')),
    jsonb_build_object(
      'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','leader','f9','f10'),
      'leader_id', 'leader'
    )
  );
  if v_native <> 8 or v_normalized <> 80 then
    raise exception 'Find the Leader scoring changed: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v1',
    jsonb_build_object('choices', jsonb_build_array('a','b','c','d','wrong')),
    jsonb_build_object('correct_choices', jsonb_build_array('a','b','c','d','e'))
  );
  if v_native <> 4 or v_normalized <> 80 then
    raise exception 'Blind Resume scoring changed: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'wavelength',
    'play-official-score-v1',
    jsonb_build_object('guesses', jsonb_build_array('50','50','50','55')),
    jsonb_build_object('target', 75)
  );
  if v_native <> 80 or v_normalized <> 80 then
    raise exception 'historical Wavelength v1 changed: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'wavelength',
    'play-official-score-v2',
    jsonb_build_object('guesses', jsonb_build_array('50','50','50','55')),
    jsonb_build_object('target', 75)
  );
  if v_native <> 60 or v_normalized <> 60 then
    raise exception 'calibrated Wavelength miss should score 60: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'wavelength',
    'play-official-score-v2',
    jsonb_build_object('guesses', jsonb_build_array('50','60','70','75')),
    jsonb_build_object('target', 75)
  );
  if v_native <> 100 or v_normalized <> 100 then
    raise exception 'calibrated exact Wavelength answer should score 100: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'blind_rank_5',
    'play-official-score-v1',
    jsonb_build_object('ordered_ids', jsonb_build_array('a','b','c','d','e')),
    jsonb_build_object(
      'fighter_ids', jsonb_build_array('a','b','c','d','e'),
      'ratings', jsonb_build_object('a',100,'b',80,'c',60,'d',40,'e',20),
      'tolerance', 1
    )
  );
  if v_native <> 10 or v_normalized <> 100 then
    raise exception 'Blind Rank scoring changed: %, %', v_native, v_normalized;
  end if;

  select native_score, normalized_score
  into v_native, v_normalized
  from private.grade_daily_challenge(
    'keep_4_cut_4',
    'play-official-score-v1',
    jsonb_build_object('kept_ids', jsonb_build_array('a','b','c','d')),
    jsonb_build_object(
      'fighter_ids', jsonb_build_array('a','b','c','d','e','f','g','h'),
      'ratings', jsonb_build_object('a',100,'b',90,'c',80,'d',70,'e',60,'f',50,'g',40,'h',30),
      'tolerance', 1
    )
  );
  if v_native <> 16 or v_normalized <> 100 then
    raise exception 'Keep Cut scoring changed: %, %', v_native, v_normalized;
  end if;

  begin
    perform * from private.grade_daily_challenge(
      'blind_resume',
      'play-official-score-v2',
      jsonb_build_object('choices', jsonb_build_array('a','b','c','d','e')),
      jsonb_build_object('correct_choices', jsonb_build_array('a','b','c','d','e'))
    );
    raise exception 'Wavelength-only scoring version was accepted by Blind Resume';
  exception
    when others then
      if sqlerrm = 'Wavelength-only scoring version was accepted by Blind Resume' then
        raise;
      end if;
  end;
end
$$;

rollback;

\echo 'Wavelength score calibration proof passed.'
