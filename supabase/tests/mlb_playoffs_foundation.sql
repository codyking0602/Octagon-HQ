begin;

select plan(12);

select has_table('public', 'mlb_playoff_seasons', 'MLB season config exists');
select has_table('public', 'mlb_playoff_series', 'MLB playoff series exists');
select has_table('public', 'mlb_playoff_brackets', 'MLB full brackets exist');
select has_table('public', 'mlb_playoff_round_picks', 'MLB round picks exist');

select has_function('public', 'get_mlb_playoffs_hub', array['integer'], 'MLB hub RPC exists');
select has_function('public', 'save_mlb_playoff_bracket', array['integer','jsonb'], 'MLB bracket save RPC exists');
select has_function('public', 'save_mlb_series_pick', array['text','text'], 'MLB series pick save RPC exists');
select has_function('public', 'score_mlb_playoff_bracket', array['integer','jsonb'], 'MLB bracket scorer exists');

select is(
  (select public_enabled from public.mlb_playoff_seasons where season = 2026),
  false,
  '2026 MLB rollout is private by default'
);

select is(
  (select field_ready from public.mlb_playoff_seasons where season = 2026),
  false,
  '2026 MLB field is not invented before it is final'
);

select is(
  (select bracket_template = '{"teams":[],"nodes":[]}'::jsonb from public.mlb_playoff_seasons where season = 2026),
  true,
  '2026 bracket starts empty'
);

select is(
  (select featured_challenge ->> 'route' from public.mlb_playoff_seasons where season = 2026),
  '/mlb/challenge',
  'Featured Challenge uses a one-off MLB route'
);

select * from finish();
rollback;
