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

-- Extend the one canonical generalized Daily grader with official Who Am I scoring.
-- This enables publication only; rotation activation remains a separate Stage 11 slice.
create or replace function private.grade_daily_challenge(
  p_game_type text,
  p_scoring_version text,
  p_submission jsonb,
  p_grading_evidence jsonb
)
returns table (
  native_score integer,
  normalized_score integer,
  public_result jsonb,
  grading_snapshot jsonb
)
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_board text[];
  v_submitted text[];
  v_expected text[];
  v_cuts text[];
  v_guesses text[];
  v_leader text;
  v_target integer;
  v_tolerance integer;
  v_count integer := 0;
  v_i integer;
  v_j integer;
  v_left_rating integer;
  v_right_rating integer;
  v_pick_count integer;
  v_total integer := 0;
  v_distance integer;
  v_value integer;
  v_status text;
  v_values jsonb;
  v_selections jsonb;
  v_answers jsonb;
  v_answer jsonb;
  v_choice text;
  v_revealed_count integer;
  v_points integer;
  v_slot_eligible_ids jsonb;
  v_slot_allowed text[];
  v_format_id text;
  v_outcome text;
  v_hidden_subject text;
  v_recovery_choices text[];
  v_recovery_guesses text[];
  v_base_score integer;
begin
  if p_game_type = 'wavelength' then
    if p_scoring_version not in ('play-official-score-v1', 'play-official-score-v2') then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_game_type = 'blind_resume' then
    if p_scoring_version not in ('play-official-score-v1', 'play-official-score-v3') then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;

  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'daily submission and grading evidence must be objects';
  end if;

  if p_game_type = 'find_leader' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'candidate_ids',
      'Find the Leader candidate ids',
      10,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'eliminated_ids',
      'Find the Leader eliminated ids',
      null,
      true
    );
    v_leader := p_grading_evidence->>'leader_id';

    if v_leader is null or not (v_leader = any(v_board)) then
      raise exception 'Find the Leader grading evidence is invalid';
    end if;
    if coalesce(array_length(v_submitted, 1), 0) < 1
      or array_length(v_submitted, 1) > 9 then
      raise exception 'Find the Leader completion must contain one through nine eliminations';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
    ) then
      raise exception 'Find the Leader submission contains an unknown fighter';
    end if;

    if v_leader = any(v_submitted) then
      if v_submitted[array_length(v_submitted, 1)] <> v_leader then
        raise exception 'Find the Leader run must end when the leader is eliminated';
      end if;
      native_score := array_length(v_submitted, 1);
    else
      if array_length(v_submitted, 1) <> 9 then
        raise exception 'Find the Leader perfect run must eliminate all nine non-leaders';
      end if;
      native_score := 10;
    end if;

    normalized_score := native_score * 10;
    public_result := jsonb_build_object(
      'eliminated_ids', to_jsonb(v_submitted),
      'perfect', native_score = 10
    );

  elsif p_game_type = 'blind_resume' then
    v_expected := private.daily_challenge_text_array(
      p_grading_evidence->'correct_choices',
      'Blind Resume correct choices',
      5,
      false
    );

    if p_scoring_version = 'play-official-score-v3' then
      v_answers := p_submission->'answers';
      if jsonb_typeof(v_answers) <> 'array' or jsonb_array_length(v_answers) <> 5 then
        raise exception 'Blind Resume V3 answers must contain exactly five rounds';
      end if;
      v_selections := '[]'::jsonb;

      for v_i in 0..4 loop
        v_answer := v_answers->v_i;
        if jsonb_typeof(v_answer) <> 'object' then
          raise exception 'Blind Resume V3 answer % must be an object', v_i + 1;
        end if;
        v_choice := nullif(trim(v_answer->>'choice'), '');
        if v_choice is null then
          raise exception 'Blind Resume V3 answer % is missing a choice', v_i + 1;
        end if;
        if coalesce(v_answer->>'revealed_count', '') !~ '^[0-9]+$' then
          raise exception 'Blind Resume V3 answer % has an invalid reveal count', v_i + 1;
        end if;
        v_revealed_count := (v_answer->>'revealed_count')::integer;
        if v_revealed_count not in (2, 4, 6, 8) then
          raise exception 'Blind Resume V3 reveal count must be 2, 4, 6, or 8';
        end if;

        if v_choice = v_expected[v_i + 1] then
          v_count := v_count + 1;
          v_points := case v_revealed_count
            when 2 then 20
            when 4 then 19
            when 6 then 18
            else 17
          end;
        else
          v_points := case v_revealed_count
            when 2 then 2
            when 4 then 4
            when 6 then 6
            else 8
          end;
        end if;

        v_total := v_total + v_points;
        v_selections := v_selections || jsonb_build_array(jsonb_build_object(
          'choice', v_choice,
          'revealed_count', v_revealed_count,
          'correct', v_choice = v_expected[v_i + 1],
          'points', v_points
        ));
      end loop;

      native_score := v_count;
      normalized_score := v_total;
      public_result := jsonb_build_object(
        'answers', v_selections,
        'correct_picks', v_count,
        'points', v_total
      );
    else
      v_submitted := private.daily_challenge_text_array(
        p_submission->'choices',
        'Blind Resume choices',
        5,
        false
      );

      for v_i in 1..5 loop
        if v_submitted[v_i] = v_expected[v_i] then
          v_count := v_count + 1;
        end if;
      end loop;

      native_score := v_count;
      normalized_score := v_count * 20;
      public_result := jsonb_build_object(
        'choices', to_jsonb(v_submitted),
        'correct_picks', v_count
      );
    end if;

  elsif p_game_type = 'wavelength' then
    v_guesses := private.daily_challenge_text_array(
      p_submission->'guesses',
      'Wavelength guesses',
      4,
      false
    );

    if coalesce(p_grading_evidence->>'target', '') !~ '^[0-9]+$' then
      raise exception 'Wavelength target is invalid';
    end if;
    v_target := (p_grading_evidence->>'target')::integer;
    if v_target < 1 or v_target > 100 then
      raise exception 'Wavelength target must be from 1 through 100';
    end if;

    for v_i in 1..4 loop
      if v_guesses[v_i] !~ '^[0-9]+$'
        or v_guesses[v_i]::integer < 1
        or v_guesses[v_i]::integer > 100 then
        raise exception 'Wavelength guesses must be integers from 1 through 100';
      end if;
    end loop;

    if p_scoring_version = 'play-official-score-v2' then
      native_score := greatest(0, 100 - (2 * abs(v_guesses[4]::integer - v_target)));
    else
      native_score := greatest(0, 100 - abs(v_guesses[4]::integer - v_target));
    end if;
    normalized_score := native_score;
    public_result := jsonb_build_object(
      'guesses', to_jsonb(v_guesses),
      'distance', abs(v_guesses[4]::integer - v_target)
    );

  elsif p_game_type = 'blind_rank_5' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'fighter_ids',
      'Blind Rank fighter ids',
      5,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'ordered_ids',
      'Blind Rank ordered ids',
      5,
      true
    );

    if jsonb_typeof(p_grading_evidence->'ratings') <> 'object'
      or private.jsonb_object_length(p_grading_evidence->'ratings') <> 5 then
      raise exception 'Blind Rank ratings are invalid';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
        or not ((p_grading_evidence->'ratings') ? submitted)
    ) then
      raise exception 'Blind Rank submission does not match the official board';
    end if;

    v_tolerance := coalesce((p_grading_evidence->>'tolerance')::integer, 1);
    if v_tolerance < 0 then
      raise exception 'Blind Rank tolerance is invalid';
    end if;

    for v_i in 1..4 loop
      for v_j in (v_i + 1)..5 loop
        v_left_rating := (p_grading_evidence->'ratings'->>v_submitted[v_i])::integer;
        v_right_rating := (p_grading_evidence->'ratings'->>v_submitted[v_j])::integer;
        if v_left_rating >= v_right_rating - v_tolerance then
          v_count := v_count + 1;
        end if;
      end loop;
    end loop;

    native_score := v_count;
    normalized_score := v_count * 10;
    public_result := jsonb_build_object(
      'ordered_ids', to_jsonb(v_submitted),
      'correct_comparisons', v_count
    );

  elsif p_game_type = 'keep_4_cut_4' then
    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'fighter_ids',
      'Keep 4 Cut 4 fighter ids',
      8,
      true
    );
    v_submitted := private.daily_challenge_text_array(
      p_submission->'kept_ids',
      'Keep 4 Cut 4 kept ids',
      4,
      true
    );

    if jsonb_typeof(p_grading_evidence->'ratings') <> 'object'
      or private.jsonb_object_length(p_grading_evidence->'ratings') <> 8 then
      raise exception 'Keep 4 Cut 4 ratings are invalid';
    end if;
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
        or not ((p_grading_evidence->'ratings') ? submitted)
    ) then
      raise exception 'Keep 4 Cut 4 submission does not match the official board';
    end if;

    select array_agg(board_id order by ordinality)
    into v_cuts
    from unnest(v_board) with ordinality as board(board_id, ordinality)
    where not (board_id = any(v_submitted));

    v_tolerance := coalesce((p_grading_evidence->>'tolerance')::integer, 1);
    if v_tolerance < 0 then
      raise exception 'Keep 4 Cut 4 tolerance is invalid';
    end if;

    for v_i in 1..4 loop
      for v_j in 1..4 loop
        v_left_rating := (p_grading_evidence->'ratings'->>v_submitted[v_i])::integer;
        v_right_rating := (p_grading_evidence->'ratings'->>v_cuts[v_j])::integer;
        if v_left_rating >= v_right_rating - v_tolerance then
          v_count := v_count + 1;
        end if;
      end loop;
    end loop;

    native_score := v_count;
    normalized_score := round(v_count * 100.0 / 16.0)::integer;
    public_result := jsonb_build_object(
      'kept_ids', to_jsonb(v_submitted),
      'correct_comparisons', v_count
    );

  elsif p_game_type = 'hit_the_number' then
    if coalesce(p_grading_evidence->>'pick_count', '') !~ '^[0-9]+$' then
      raise exception 'Hit the Number pick count is invalid';
    end if;
    v_pick_count := (p_grading_evidence->>'pick_count')::integer;
    if v_pick_count < 4 or v_pick_count > 7 then
      raise exception 'Hit the Number pick count must be from 4 through 7';
    end if;
    if coalesce(p_grading_evidence->>'target', '') !~ '^[0-9]+$' then
      raise exception 'Hit the Number target is invalid';
    end if;
    v_target := (p_grading_evidence->>'target')::integer;
    if v_target <= 0 then
      raise exception 'Hit the Number target must be positive';
    end if;

    v_board := private.daily_challenge_text_array(
      p_grading_evidence->'fighter_ids',
      'Hit the Number fighter ids',
      null,
      true
    );
    if coalesce(array_length(v_board, 1), 0) < v_pick_count then
      raise exception 'Hit the Number official board is too small';
    end if;
    v_submitted := private.daily_challenge_text_array(
      p_submission->'selected_ids',
      'Hit the Number selected ids',
      v_pick_count,
      true
    );
    if exists (
      select 1
      from unnest(v_submitted) submitted
      where not (submitted = any(v_board))
    ) then
      raise exception 'Hit the Number submission contains an ineligible fighter';
    end if;

    v_format_id := nullif(trim(p_grading_evidence->>'format_id'), '');
    v_slot_eligible_ids := p_grading_evidence->'slot_eligible_ids';
    if v_slot_eligible_ids is not null then
      if jsonb_typeof(v_slot_eligible_ids) <> 'array' then
        raise exception 'Hit the Number slot eligibility is invalid';
      end if;
      if jsonb_array_length(v_slot_eligible_ids) > 0 then
        if jsonb_array_length(v_slot_eligible_ids) <> v_pick_count then
          raise exception 'Hit the Number slot eligibility must match the pick count';
        end if;
        for v_i in 1..v_pick_count loop
          v_slot_allowed := private.daily_challenge_text_array(
            v_slot_eligible_ids->(v_i - 1),
            'Hit the Number slot eligibility',
            null,
            true
          );
          if coalesce(array_length(v_slot_allowed, 1), 0) = 0
            or not (v_submitted[v_i] = any(v_slot_allowed)) then
            raise exception 'Invalid Hit the Number role assignment at slot %', v_i;
          end if;
        end loop;
      elsif v_format_id in ('one-from-each', 'build-the-team') then
        raise exception 'Hit the Number constrained format is missing slot eligibility';
      end if;
    elsif v_format_id in ('one-from-each', 'build-the-team') then
      raise exception 'Hit the Number constrained format is missing slot eligibility';
    end if;

    v_values := p_grading_evidence->'values';
    if jsonb_typeof(v_values) <> 'object' then
      raise exception 'Hit the Number grading values are invalid';
    end if;

    for v_i in 1..v_pick_count loop
      if not (v_values ? v_submitted[v_i])
        or coalesce(v_values->>v_submitted[v_i], '') !~ '^[0-9]+$' then
        raise exception 'Hit the Number selected value is invalid';
      end if;
      v_value := (v_values->>v_submitted[v_i])::integer;
      v_total := v_total + v_value;
    end loop;

    v_distance := abs(v_target - v_total);
    v_status := case
      when v_total = v_target then 'perfect'
      when v_total > v_target then 'bust'
      else 'under'
    end;

    native_score := v_total;
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(100, round(75 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
      else greatest(
        0,
        least(100, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
    end;

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'fighterId', submitted.fighter_id,
          'value', (v_values->>submitted.fighter_id)::integer
        )
        order by submitted.ordinality
      ),
      '[]'::jsonb
    )
    into v_selections
    from unnest(v_submitted) with ordinality as submitted(fighter_id, ordinality);

    public_result := jsonb_build_object(
      'status', v_status,
      'target', v_target,
      'total', v_total,
      'distance', v_distance,
      'selections', v_selections
    );

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

    if coalesce(p_submission->>'revealed_count', '') !~ '^[0-9]+  end if;

  grading_snapshot := p_grading_evidence;
  return next;
end;
$$;
 then
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
      select 1 from unnest(v_submitted) submitted
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
        select 1 from unnest(v_recovery_choices) choice
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
        select 1 from unnest(v_recovery_guesses) guess
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

  grading_snapshot := p_grading_evidence;
  return next;
end;
$$;
