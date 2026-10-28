-- Hit the Number Random Pool keeps every fighter value private until the official attempt exists.
-- The canonical service-only runtime projection then releases the already-materialized pool values
-- so the Daily result can show the same full-pool reveal as Casual without a client-side stat lookup.
do $migration$
declare
  v_signature regprocedure := to_regprocedure(
    'public.get_daily_challenge_runtime_context(uuid,uuid)'
  );
  v_definition text;
  v_old text := $old$'public_result', v_attempt.public_result$old$;
  v_new text := $new$'public_result',
        v_attempt.public_result
        || case
             when v_daily.game_type = 'hit_the_number'
               and v_setup.public_setup ->> 'boardType' = 'random-pool'
             then jsonb_build_object(
               'poolValues',
               v_setup.private_grading_evidence -> 'values'
             )
             else '{}'::jsonb
           end$new$;
begin
  if v_signature is null then
    raise exception 'canonical daily runtime context function is missing';
  end if;

  select pg_get_functiondef(v_signature)
  into v_definition;

  if position(v_old in v_definition) = 0 then
    raise exception 'canonical daily runtime context no longer matches the expected result projection';
  end if;

  v_definition := replace(v_definition, v_old, v_new);
  execute v_definition;

  select pg_get_functiondef(v_signature)
  into v_definition;

  if position('''poolValues''' in v_definition) = 0
    or position('''random-pool''' in v_definition) = 0
    or position('private_grading_evidence -> ''values''' in v_definition) = 0 then
    raise exception 'Hit the Number Random Pool reveal patch did not apply';
  end if;
end;
$migration$;
