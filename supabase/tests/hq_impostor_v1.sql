begin;

do $$
declare
  v_topic_count integer;
  v_bad_difficulties integer;
  v_rls_count integer;
  v_clue text;
begin
  select count(*) into v_topic_count
  from private.hq_impostor_topics
  where active;
  if v_topic_count <> 32 then
    raise exception 'HQ Impostor v1 should seed 32 active topics, got %', v_topic_count;
  end if;

  select count(*) into v_bad_difficulties
  from (
    select difficulty, count(*) topic_count
    from private.hq_impostor_topics
    where active
    group by difficulty
    having count(*) <> 8
  ) bad;
  if v_bad_difficulties <> 0 then
    raise exception 'HQ Impostor v1 should own eight active topics per difficulty';
  end if;

  if to_regprocedure('public.get_my_hq_impostor()') is null
    or to_regprocedure('public.create_hq_impostor_event(text[])') is null
    or to_regprocedure('public.reveal_hq_impostor_assignment(uuid)') is null
    or to_regprocedure('public.submit_hq_impostor_clue(uuid,text)') is null
    or to_regprocedure('public.open_hq_impostor_board(uuid)') is null
    or to_regprocedure('public.submit_hq_impostor_vote(uuid,uuid,text)') is null then
    raise exception 'HQ Impostor public RPC contract is incomplete';
  end if;

  select count(*) into v_rls_count
  from pg_class relation
  join pg_namespace namespace on namespace.oid=relation.relnamespace
  where namespace.nspname='private'
    and relation.relname in (
      'hq_impostor_topics',
      'hq_impostor_events',
      'hq_impostor_participants',
      'hq_impostor_rounds',
      'hq_impostor_actions'
    )
    and relation.relrowsecurity;
  if v_rls_count <> 5 then
    raise exception 'All HQ Impostor private tables must have RLS enabled';
  end if;

  if has_table_privilege('anon','private.hq_impostor_topics','select')
    or has_table_privilege('authenticated','private.hq_impostor_topics','select')
    or has_table_privilege('anon','private.hq_impostor_events','select')
    or has_table_privilege('authenticated','private.hq_impostor_events','select')
    or has_table_privilege('anon','private.hq_impostor_actions','select')
    or has_table_privilege('authenticated','private.hq_impostor_actions','select') then
    raise exception 'HQ Impostor private state leaked direct table access';
  end if;

  if private.hq_impostor_edit_distance('stafford','staford') <> 1 then
    raise exception 'HQ Impostor typo matcher edit-distance helper is incorrect';
  end if;
  if not private.hq_impostor_guess_matches('nfl-qb-matthew-stafford','Matt Staffrd') then
    raise exception 'HQ Impostor should accept a reasonable one-character secret typo';
  end if;
  if private.hq_impostor_guess_matches('nfl-qb-matthew-stafford','Patrick Mahomes') then
    raise exception 'HQ Impostor secret matcher accepted the wrong identity';
  end if;

  v_clue := private.hq_impostor_validate_clue('nfl-qb-matthew-stafford','Super Bowl');
  if v_clue <> 'Super Bowl' then
    raise exception 'HQ Impostor rejected a valid two-word sports clue';
  end if;

  begin
    perform private.hq_impostor_validate_clue('nfl-qb-matthew-stafford','Stafford');
    raise exception 'HQ Impostor accepted the secret surname as a clue';
  exception
    when others then
      if sqlerrm = 'HQ Impostor accepted the secret surname as a clue' then
        raise;
      end if;
  end;

  begin
    perform private.hq_impostor_validate_clue('nfl-qb-matthew-stafford','sounds like Bradford');
    raise exception 'HQ Impostor accepted a phonetic giveaway';
  exception
    when others then
      if sqlerrm = 'HQ Impostor accepted a phonetic giveaway' then
        raise;
      end if;
  end;
end;
$$;

rollback;
