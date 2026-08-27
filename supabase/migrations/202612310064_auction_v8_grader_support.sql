-- V8 kept the canonical grader-v3 contract but the grader itself still accepted
-- only the v7 content-version pairing. Extend that one existing owner to v8.
do $$
declare
  v_definition text;
  v_expected text;
  v_required_tail text;
begin
  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);

  v_expected := 'v_game.content_version = ''ufc-auction-2026-08-v7''';
  if position(v_expected in v_definition) = 0 then
    raise exception 'Auction v8 grader owner drifted: grader-v3 version pairing';
  end if;
  v_definition := replace(
    v_definition,
    v_expected,
    'v_game.content_version in (''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')'
  );

  v_required_tail := E'''ufc-auction-2026-08-v7''\n    ) then 3';
  if position(v_required_tail in v_definition) = 0 then
    raise exception 'Auction v8 grader owner drifted: standard selection count';
  end if;
  v_definition := replace(
    v_definition,
    v_required_tail,
    E'''ufc-auction-2026-08-v7'',\n      ''ufc-auction-2026-08-v8''\n    ) then 3'
  );

  execute v_definition;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  if position(
    'v_game.content_version in (''ufc-auction-2026-08-v7'', ''ufc-auction-2026-08-v8'')',
    v_definition
  ) = 0 then
    raise exception 'Auction v8 grader did not retain the grader-v3 version pairing';
  end if;

  if position(E'''ufc-auction-2026-08-v8''\n    ) then 3', v_definition) = 0 then
    raise exception 'Auction v8 grader did not retain the standard three-selection contract';
  end if;
end;
$$;

comment on function private.grade_auction(uuid) is
  'Canonical Auction grader. V1-v6 preserve their historical grading contracts; v7-v8 use private grader v3 with whole-number final scores. V8 differs from v7 only in Ultimate Fighter catalog eligibility.';
