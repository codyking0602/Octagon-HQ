-- Stage 11 Slice 4: allow Who Am I in the existing canonical Daily tables without
-- changing any active UFC or Football schedule.
do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select namespace.nspname, relation.relname, constraint_row.conname
    from pg_constraint constraint_row
    join pg_class relation on relation.oid = constraint_row.conrelid
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'private'
      and relation.relname in ('daily_challenge_setups', 'daily_challenges')
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%keep_4_cut_4%'
      and pg_get_constraintdef(constraint_row.oid) not like '%who_am_i%'
  loop
    execute format(
      'alter table %I.%I drop constraint %I',
      v_constraint.nspname,
      v_constraint.relname,
      v_constraint.conname
    );
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'private.daily_challenge_setups'::regclass
      and conname = 'daily_challenge_setups_supported_games_check'
  ) then
    alter table private.daily_challenge_setups
      add constraint daily_challenge_setups_supported_games_check
      check (game_type in (
        'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
        'keep_4_cut_4', 'hit_the_number', 'who_am_i'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'private.daily_challenges'::regclass
      and conname = 'daily_challenges_supported_games_check'
  ) then
    alter table private.daily_challenges
      add constraint daily_challenges_supported_games_check
      check (game_type in (
        'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
        'keep_4_cut_4', 'hit_the_number', 'who_am_i'
      ));
  end if;
end
$$;

-- Extend the latest historical-game delegate in place. The canonical
-- private.grade_daily_challenge wrapper must remain the sole grading entry point because it
-- owns Daily Double composition and delegates all ordinary game families here.
do $migration$
declare
  v_entry_signature constant regprocedure :=
    'private.grade_daily_challenge(text,text,jsonb,jsonb)'::regprocedure;
  v_delegate_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_entry_definition text;
  v_definition text;
  v_declaration_marker constant text := $old$
  v_format_id text;
begin
$old$;
  v_declaration_replacement constant text := $new$
  v_format_id text;
  v_outcome text;
  v_hidden_subject text;
  v_recovery_choices text[];
  v_recovery_guesses text[];
  v_base_score integer;
begin
$new$;
  v_branch_marker constant text := $old$
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$old$;
  v_branch_replacement constant text := $new$
  elsif p_game_type = 'who_am_i' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'subject_ids',
      'Who Am I subject ids',
      null,
      true
    );
    if coalesce(array_length(v_board, 1), 0) < 5 then
      raise exception 'Who Am I official subject pool is too small';
    end if;

    v_hidden_subject := nullif(trim(p_grading_evidence->>'hidden_subject_id'), '');
    if v_hidden_subject is null or not (v_hidden_subject = any(v_board)) then
      raise exception 'Who Am I hidden subject evidence is invalid';
    end if;

    if coalesce(p_submission->>'revealed_count', '') !~ '^[0-9]+$' then
      raise exception 'Who Am I revealed clue count is invalid';
    end if;
    v_revealed_count := (p_submission->>'revealed_count')::integer;
    v_base_score := case v_revealed_count
      when 2 then 100
      when 4 then 95
      when 6 then 90
      when 8 then 80
      when 10 then 70
      else null
    end;
    if v_base_score is null then
      raise exception 'Who Am I completion must use 2, 4, 6, 8, or 10 clues';
    end if;

    v_submitted := private.daily_challenge_text_array(
      coalesce(p_submission->'natural_guesses', '[]'::jsonb),
      'Who Am I natural guesses',
      null,
      true
    );
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
    ) then
      raise exception 'Who Am I natural guess contains an unknown subject';
    end if;

    v_outcome := nullif(trim(p_submission->>'outcome'), '');
    if v_outcome = 'natural' then
      if coalesce(array_length(v_submitted, 1), 0) < 1
        or v_submitted[array_length(v_submitted, 1)] <> v_hidden_subject then
        raise exception 'Who Am I natural completion must end on the hidden subject';
      end if;
      if coalesce(jsonb_array_length(coalesce(p_submission->'recovery_guesses', '[]'::jsonb)), 0) <> 0
        or coalesce(jsonb_array_length(coalesce(p_submission->'recovery_choices', '[]'::jsonb)), 0) <> 0 then
        raise exception 'Who Am I natural completion cannot contain Recovery Board evidence';
      end if;

      v_count := greatest(coalesce(array_length(v_submitted, 1), 0) - 1, 0);
      native_score := greatest(0, v_base_score - (v_count * 10));
      normalized_score := native_score;
      public_result := jsonb_build_object(
        'outcome', 'natural',
        'subject_id', v_hidden_subject,
        'revealed_count', v_revealed_count,
        'wrong_guesses', v_count,
        'recovery_misses', 0
      );

    elsif v_outcome in ('recovered', 'miss') then
      if v_revealed_count <> 10 then
        raise exception 'Who Am I Recovery Board requires all ten clues';
      end if;
      if v_hidden_subject = any(v_submitted) then
        raise exception 'Who Am I Recovery Board cannot follow a correct natural guess';
      end if;

      v_recovery_choices := private.daily_challenge_text_array(
        p_submission->'recovery_choices',
        'Who Am I Recovery Board choices',
        5,
        true
      );
      if not (v_hidden_subject = any(v_recovery_choices)) then
        raise exception 'Who Am I Recovery Board must contain the hidden subject';
      end if;
      if exists (
        select 1
        from unnest(v_recovery_choices) choice
        where not (choice = any(v_board))
          or choice = any(v_submitted)
      ) then
        raise exception 'Who Am I Recovery Board choices are invalid';
      end if;

      v_recovery_guesses := private.daily_challenge_text_array(
        p_submission->'recovery_guesses',
        'Who Am I Recovery guesses',
        null,
        true
      );
      if exists (
        select 1
        from unnest(v_recovery_guesses) guess
        where not (guess = any(v_recovery_choices))
      ) then
        raise exception 'Who Am I Recovery guess is not on the Recovery Board';
      end if;

      if v_outcome = 'recovered' then
        if coalesce(array_length(v_recovery_guesses, 1), 0) not in (1, 2)
          or v_recovery_guesses[array_length(v_recovery_guesses, 1)] <> v_hidden_subject then
          raise exception 'Who Am I recovered completion must find the hidden subject within two picks';
        end if;
        v_count := array_length(v_recovery_guesses, 1) - 1;
        native_score := case v_count when 0 then 45 else 30 end;
        normalized_score := native_score;
        public_result := jsonb_build_object(
          'outcome', 'recovered',
          'subject_id', v_hidden_subject,
          'revealed_count', 10,
          'wrong_guesses', coalesce(array_length(v_submitted, 1), 0),
          'recovery_misses', v_count
        );
      else
        if coalesce(array_length(v_recovery_guesses, 1), 0) <> 2
          or v_hidden_subject = any(v_recovery_guesses) then
          raise exception 'Who Am I miss requires two incorrect Recovery Board picks';
        end if;
        native_score := 0;
        normalized_score := 0;
        public_result := jsonb_build_object(
          'outcome', 'miss',
          'subject_id', v_hidden_subject,
          'revealed_count', 10,
          'wrong_guesses', coalesce(array_length(v_submitted, 1), 0),
          'recovery_misses', 2
        );
      end if;
    else
      raise exception 'unsupported Who Am I outcome %', coalesce(v_outcome, '<null>');
    end if;

  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$new$;
begin
  select pg_get_functiondef(v_entry_signature) into v_entry_definition;
  if position('grade_daily_challenge_pre_combo' in v_entry_definition) = 0 then
    raise exception 'Canonical Daily grader no longer delegates ordinary games to the expected owner.';
  end if;

  select pg_get_functiondef(v_delegate_signature) into v_definition;

  -- Idempotent replay: once the branch exists, preserve the already-patched delegate exactly.
  if position('elsif p_game_type = ''who_am_i'' then' in v_definition) > 0 then
    return;
  end if;

  if position(v_declaration_marker in v_definition) = 0 then
    raise exception 'Daily grader delegate declaration shape changed before Who Am I integration.';
  end if;
  if position(v_branch_marker in v_definition) = 0 then
    raise exception 'Daily grader delegate terminal branch changed before Who Am I integration.';
  end if;

  v_definition := replace(v_definition, v_declaration_marker, v_declaration_replacement);
  v_definition := replace(v_definition, v_branch_marker, v_branch_replacement);
  execute v_definition;

  select pg_get_functiondef(v_delegate_signature) into v_definition;
  if position('elsif p_game_type = ''who_am_i'' then' in v_definition) = 0
    or position('v_recovery_choices text[]' in v_definition) = 0 then
    raise exception 'Who Am I Daily grader patch did not apply exactly.';
  end if;

  select pg_get_functiondef(v_entry_signature) into v_entry_definition;
  if position('grade_daily_challenge_pre_combo' in v_entry_definition) = 0 then
    raise exception 'Who Am I integration replaced the canonical Daily grader wrapper.';
  end if;
end;
$migration$;
