-- Keep the existing Best CFB Teams Draft Room on its original 132 approved seasons.
-- Weekly Auction expansion rows share the grading table but must not enter Draft Room board generation.

do $guard$
declare
  v_signature constant regprocedure := 'private.generate_draft_room_cfb_best_teams_deck(uuid)'::regprocedure;
  v_definition text;
  v_next text;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  v_next := v_definition;

  v_next := replace(
    v_next,
    'from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where conference_bucket<>''Notre Dame'') c',
    'from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where season_reference like ''cfb-best-%'' and conference_bucket<>''Notre Dame'') c'
  );

  v_next := replace(
    v_next,
    'from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where conference_bucket not in (''Notre Dame'',v_one)) c',
    'from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where season_reference like ''cfb-best-%'' and conference_bucket not in (''Notre Dame'',v_one)) c'
  );

  v_next := replace(
    v_next,
    'where season.conference_bucket=v_context' || chr(10) ||
    '        and not (season.season_reference=any(v_refs))',
    'where season.conference_bucket=v_context' || chr(10) ||
    '        and season.season_reference like ''cfb-best-%''' || chr(10) ||
    '        and not (season.season_reference=any(v_refs))'
  );

  if v_next = v_definition then
    raise exception 'Best CFB Teams original-pool guard did not patch the generator';
  end if;

  if (length(v_next) - length(replace(v_next, 'season.season_reference like ''cfb-best-%''', '')))
      / length('season.season_reference like ''cfb-best-%''') < 2 then
    raise exception 'Best CFB Teams ranked pool guard was not applied to both selection paths';
  end if;

  execute v_next;
end
$guard$;

do $contract$
declare
  v_definition text;
begin
  select pg_get_functiondef('private.generate_draft_room_cfb_best_teams_deck(uuid)'::regprocedure::oid)
  into v_definition;

  if position(
    'where season_reference like ''cfb-best-%'' and conference_bucket<>''Notre Dame'''
    in v_definition
  ) = 0 then
    raise exception 'Best CFB Teams primary conference pool is not restricted to original seasons';
  end if;

  if position(
    'where season_reference like ''cfb-best-%'' and conference_bucket not in (''Notre Dame'',v_one)'
    in v_definition
  ) = 0 then
    raise exception 'Best CFB Teams split conference pool is not restricted to original seasons';
  end if;

  if (length(v_definition) - length(replace(v_definition, 'season.season_reference like ''cfb-best-%''', '')))
      / length('season.season_reference like ''cfb-best-%''') < 2 then
    raise exception 'Best CFB Teams season selection is not restricted to original seasons';
  end if;
end
$contract$;
