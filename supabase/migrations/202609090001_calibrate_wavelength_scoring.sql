-- Calibrate Wavelength only while preserving every historical v1 result and all other game formulas.
-- New Wavelength setups publish play-official-score-v2; v1 remains readable for immutable history.
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
begin
  if p_game_type = 'wavelength' then
    if p_scoring_version not in ('play-official-score-v1', 'play-official-score-v2') then
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
      or jsonb_object_length(p_grading_evidence->'ratings') <> 5 then
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
      or jsonb_object_length(p_grading_evidence->'ratings') <> 8 then
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

  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;

  grading_snapshot := p_grading_evidence;
  return next;
end;
$$;
