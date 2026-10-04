-- HQ Impostor v1: four-round asynchronous social deduction Featured Challenge.
-- Server owns topic secrecy, role assignment, timers, voting resolution, scoring,
-- standings, and result reveals. Browser access is RPC-only.

create table if not exists private.hq_impostor_topics (
  topic_key text primary key,
  sport text not null check (sport in ('NFL','CFB','UFC')),
  difficulty integer not null check (difficulty between 1 and 4),
  category text not null,
  secret_answer text not null,
  aliases text[] not null default '{}',
  banned_terms text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint hq_impostor_topic_key_length check (char_length(topic_key) between 3 and 100),
  constraint hq_impostor_category_length check (char_length(category) between 3 and 80),
  constraint hq_impostor_secret_length check (char_length(secret_answer) between 2 and 100)
);

create table if not exists private.hq_impostor_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  round_count integer not null default 4 check (round_count = 4),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint hq_impostor_event_completion_valid check (
    (status = 'active' and completed_at is null)
    or (status in ('completed','cancelled'))
  )
);

create table if not exists private.hq_impostor_participants (
  event_id uuid not null references private.hq_impostor_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  seat_order integer not null check (seat_order between 1 and 8),
  active_event boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id),
  unique (event_id, seat_order)
);

create unique index if not exists hq_impostor_one_active_event_per_profile
  on private.hq_impostor_participants(profile_id)
  where active_event;

create table if not exists private.hq_impostor_rounds (
  event_id uuid not null references private.hq_impostor_events(id) on delete cascade,
  round_no integer not null check (round_no between 1 and 4),
  topic_key text not null references private.hq_impostor_topics(topic_key) on delete restrict,
  impostor_profile_id uuid not null references public.profiles(id) on delete restrict,
  status text not null check (status in ('scheduled','clue','vote','resolved','forfeit','no_contest')),
  opens_at timestamptz not null,
  clue_lock_at timestamptz not null,
  vote_lock_at timestamptz not null,
  resolved_at timestamptz,
  result jsonb,
  primary key (event_id, round_no),
  constraint hq_impostor_round_window_valid check (
    opens_at < clue_lock_at and clue_lock_at < vote_lock_at
  )
);

create table if not exists private.hq_impostor_actions (
  event_id uuid not null,
  round_no integer not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  assignment_opened_at timestamptz,
  clue_deadline_at timestamptz,
  clue_text text,
  clue_submitted_at timestamptz,
  active boolean not null default true,
  board_opened_at timestamptz,
  vote_deadline_at timestamptz,
  vote_profile_id uuid references public.profiles(id) on delete restrict,
  vote_submitted_at timestamptz,
  secret_guess text,
  guess_correct boolean,
  result_seen_at timestamptz,
  score integer check (score between 0 and 100),
  score_breakdown jsonb,
  primary key (event_id, round_no, profile_id),
  foreign key (event_id, round_no)
    references private.hq_impostor_rounds(event_id, round_no) on delete cascade,
  constraint hq_impostor_clue_length check (clue_text is null or char_length(clue_text) between 1 and 32),
  constraint hq_impostor_guess_length check (secret_guess is null or char_length(secret_guess) between 1 and 100)
);

create index if not exists hq_impostor_participants_profile_event_idx
  on private.hq_impostor_participants(profile_id, event_id);
create index if not exists hq_impostor_actions_event_round_idx
  on private.hq_impostor_actions(event_id, round_no, profile_id);

alter table private.hq_impostor_topics enable row level security;
alter table private.hq_impostor_events enable row level security;
alter table private.hq_impostor_participants enable row level security;
alter table private.hq_impostor_rounds enable row level security;
alter table private.hq_impostor_actions enable row level security;

revoke all on private.hq_impostor_topics from public, anon, authenticated;
revoke all on private.hq_impostor_events from public, anon, authenticated;
revoke all on private.hq_impostor_participants from public, anon, authenticated;
revoke all on private.hq_impostor_rounds from public, anon, authenticated;
revoke all on private.hq_impostor_actions from public, anon, authenticated;

insert into private.hq_impostor_topics(topic_key,sport,difficulty,category,secret_answer,aliases,banned_terms)
values
  ('nfl-qb-matthew-stafford','NFL',1,'NFL Quarterbacks','Matthew Stafford',array['Stafford','Matt Stafford'],array['matthew','matt','stafford','m stafford','ms']),
  ('nfl-qb-patrick-mahomes','NFL',1,'NFL Quarterbacks','Patrick Mahomes',array['Mahomes','Patrick Mahomes II'],array['patrick','mahomes','pat mahomes','showtime','pm']),
  ('nfl-team-dallas-cowboys','NFL',1,'NFL Teams','Dallas Cowboys',array['Cowboys','The Cowboys'],array['dallas','cowboys','america''s team']),
  ('cfb-coach-nick-saban','CFB',1,'College Football Coaches','Nick Saban',array['Saban'],array['nick','saban','ns']),
  ('cfb-program-texas','CFB',1,'College Football Programs','Texas Longhorns',array['Texas','Longhorns','Texas Longhorns Football'],array['texas','longhorns','horns','ut']),
  ('cfb-program-alabama','CFB',1,'College Football Programs','Alabama Crimson Tide',array['Alabama','Crimson Tide','Bama'],array['alabama','crimson tide','bama']),
  ('ufc-fighter-conor-mcgregor','UFC',1,'UFC Fighters','Conor McGregor',array['McGregor','Conor'],array['conor','mcgregor','notorious','cm']),
  ('ufc-fighter-jon-jones','UFC',1,'UFC Fighters','Jon Jones',array['Jones','Jonny Bones Jones'],array['jon','jones','jonny bones','bones','jj']),

  ('nfl-qb-lamar-jackson','NFL',2,'NFL Quarterbacks','Lamar Jackson',array['Lamar','Lamar Jackson Jr.'],array['lamar','jackson','lj','lj8']),
  ('nfl-rb-derrick-henry','NFL',2,'NFL Running Backs','Derrick Henry',array['Henry','King Henry'],array['derrick','henry','king henry','dh']),
  ('nfl-team-pittsburgh-steelers','NFL',2,'NFL Teams','Pittsburgh Steelers',array['Steelers','The Steelers'],array['pittsburgh','steelers','steel curtain']),
  ('cfb-coach-kirby-smart','CFB',2,'College Football Coaches','Kirby Smart',array['Smart'],array['kirby','smart','ks']),
  ('cfb-player-travis-hunter','CFB',2,'College Football Players','Travis Hunter',array['Hunter'],array['travis','hunter','th']),
  ('cfb-program-lsu','CFB',2,'College Football Programs','LSU Tigers',array['LSU','Louisiana State','Tigers'],array['lsu','louisiana state']),
  ('ufc-fighter-israel-adesanya','UFC',2,'UFC Fighters','Israel Adesanya',array['Adesanya','Izzy'],array['israel','adesanya','izzy','last stylebender','stylebender','ia']),
  ('ufc-fighter-max-holloway','UFC',2,'UFC Fighters','Max Holloway',array['Holloway','Blessed'],array['max','holloway','blessed','mh']),

  ('nfl-qb-jared-goff','NFL',3,'NFL Quarterbacks','Jared Goff',array['Goff'],array['jared','goff','jg']),
  ('nfl-defense-micah-parsons','NFL',3,'NFL Defenders','Micah Parsons',array['Parsons'],array['micah','parsons','mp']),
  ('nfl-stadium-lambeau-field','NFL',3,'NFL Stadiums','Lambeau Field',array['Lambeau'],array['lambeau','lambeau field']),
  ('cfb-coach-lane-kiffin','CFB',3,'College Football Coaches','Lane Kiffin',array['Kiffin'],array['lane','kiffin','lk']),
  ('cfb-player-ashton-jeanty','CFB',3,'College Football Players','Ashton Jeanty',array['Jeanty'],array['ashton','jeanty','aj']),
  ('cfb-rivalry-red-river','CFB',3,'College Football Rivalries','Red River Rivalry',array['Red River','Red River Shootout','Red River Showdown'],array['red river','red river rivalry','red river shootout','red river showdown','rrr']),
  ('ufc-fighter-dustin-poirier','UFC',3,'UFC Fighters','Dustin Poirier',array['Poirier','The Diamond'],array['dustin','poirier','diamond','dp']),
  ('ufc-fighter-charles-oliveira','UFC',3,'UFC Fighters','Charles Oliveira',array['Oliveira','Do Bronx'],array['charles','oliveira','do bronx','co']),

  ('nfl-coach-dan-campbell','NFL',4,'NFL Head Coaches','Dan Campbell',array['Campbell'],array['dan','campbell','mcdc','dc']),
  ('nfl-qb-baker-mayfield','NFL',4,'NFL Quarterbacks','Baker Mayfield',array['Mayfield','Baker'],array['baker','mayfield','bm']),
  ('nfl-defense-maxx-crosby','NFL',4,'NFL Defenders','Maxx Crosby',array['Crosby','Maxx'],array['maxx','crosby','condor','mc']),
  ('cfb-coach-brian-kelly','CFB',4,'College Football Coaches','Brian Kelly',array['Kelly'],array['brian','kelly','bk']),
  ('cfb-player-michael-penix','CFB',4,'College Football Players','Michael Penix Jr.',array['Michael Penix','Penix','Penix Jr.'],array['michael','penix','mpj']),
  ('cfb-rivalry-iron-bowl','CFB',4,'College Football Rivalries','Iron Bowl',array['The Iron Bowl'],array['iron bowl']),
  ('ufc-fighter-robert-whittaker','UFC',4,'UFC Fighters','Robert Whittaker',array['Whittaker','Bobby Knuckles'],array['robert','whittaker','bobby knuckles','reaper','rw']),
  ('ufc-fighter-justin-gaethje','UFC',4,'UFC Fighters','Justin Gaethje',array['Gaethje','The Highlight'],array['justin','gaethje','highlight','jg'])
on conflict(topic_key) do update set
  sport=excluded.sport,
  difficulty=excluded.difficulty,
  category=excluded.category,
  secret_answer=excluded.secret_answer,
  aliases=excluded.aliases,
  banned_terms=excluded.banned_terms,
  active=true;

create or replace function private.hq_impostor_normalize_text(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select trim(regexp_replace(lower(p_value), '[^a-z0-9]+', ' ', 'g'));
$$;

create or replace function private.hq_impostor_compact_text(p_value text)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select regexp_replace(lower(p_value), '[^a-z0-9]+', '', 'g');
$$;

create or replace function private.hq_impostor_edit_distance(p_left text, p_right text)
returns integer
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  v_left text := p_left;
  v_right text := p_right;
  v_left_len integer := char_length(v_left);
  v_right_len integer := char_length(v_right);
  v_previous integer[];
  v_current integer[];
  v_i integer;
  v_j integer;
  v_cost integer;
begin
  if v_left = v_right then return 0; end if;
  if v_left_len = 0 then return v_right_len; end if;
  if v_right_len = 0 then return v_left_len; end if;

  select array_agg(value order by value)
    into v_previous
  from generate_series(0, v_right_len) value;

  for v_i in 1..v_left_len loop
    v_current := array[v_i];
    for v_j in 1..v_right_len loop
      v_cost := case
        when substring(v_left from v_i for 1) = substring(v_right from v_j for 1) then 0
        else 1
      end;
      v_current := array_append(
        v_current,
        least(
          v_previous[v_j + 1] + 1,
          v_current[v_j] + 1,
          v_previous[v_j] + v_cost
        )
      );
    end loop;
    v_previous := v_current;
  end loop;

  return v_previous[v_right_len + 1];
end;
$$;

create or replace function private.hq_impostor_guess_matches(p_topic_key text, p_guess text)
returns boolean
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_topic private.hq_impostor_topics%rowtype;
  v_guess text;
  v_candidate text;
  v_distance integer;
  v_limit integer;
begin
  select * into v_topic
  from private.hq_impostor_topics
  where topic_key = p_topic_key;
  if not found or trim(coalesce(p_guess,'')) = '' then return false; end if;

  v_guess := private.hq_impostor_compact_text(p_guess);
  if v_guess = '' then return false; end if;

  foreach v_candidate in array array_prepend(v_topic.secret_answer, v_topic.aliases) loop
    v_candidate := private.hq_impostor_compact_text(v_candidate);
    if v_guess = v_candidate then return true; end if;
    if abs(char_length(v_guess) - char_length(v_candidate)) <= 2 then
      v_limit := case
        when char_length(v_candidate) >= 10 then 2
        when char_length(v_candidate) >= 6 then 1
        else 0
      end;
      if v_limit > 0 then
        v_distance := private.hq_impostor_edit_distance(v_guess, v_candidate);
        if v_distance <= v_limit then return true; end if;
      end if;
    end if;
  end loop;
  return false;
end;
$$;

create or replace function private.hq_impostor_validate_clue(p_topic_key text, p_clue text)
returns text
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_topic private.hq_impostor_topics%rowtype;
  v_clue text := regexp_replace(trim(coalesce(p_clue,'')), '\s+', ' ', 'g');
  v_normal text;
  v_term text;
  v_word_count integer;
  v_terms text[];
begin
  select * into v_topic
  from private.hq_impostor_topics
  where topic_key = p_topic_key;
  if not found then raise exception 'HQ Impostor topic not found'; end if;

  if char_length(v_clue) < 1 or char_length(v_clue) > 32 then
    raise exception 'Clues must be 1-32 characters';
  end if;
  v_word_count := cardinality(regexp_split_to_array(v_clue, '\s+'));
  if v_word_count < 1 or v_word_count > 4 then
    raise exception 'Clues must be 1-4 words';
  end if;
  if v_clue ~* '(https?://|www\.)' then
    raise exception 'Links are not allowed in clues';
  end if;
  if v_clue ~* '\m(rhymes[[:space:]]+with|sounds[[:space:]]+like|spelled[[:space:]]+like)\M' then
    raise exception 'Spelling and phonetic hints are not allowed';
  end if;

  v_normal := private.hq_impostor_normalize_text(v_clue);
  v_terms := array_cat(v_topic.banned_terms, array[v_topic.secret_answer]);
  foreach v_term in array v_terms loop
    v_term := private.hq_impostor_normalize_text(v_term);
    if v_term <> '' and position(' ' || v_term || ' ' in ' ' || v_normal || ' ') > 0 then
      raise exception 'That clue gives away too much of the secret';
    end if;
  end loop;
  return v_clue;
end;
$$;

create or replace function private.hq_impostor_finish_event_if_ready(p_event_id uuid, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.hq_impostor_rounds
    where event_id=p_event_id
      and status not in ('resolved','forfeit','no_contest')
  ) then
    update private.hq_impostor_events
    set status='completed', completed_at=coalesce(completed_at,p_at)
    where id=p_event_id and status='active';

    update private.hq_impostor_participants
    set active_event=false
    where event_id=p_event_id;
  end if;
end;
$$;

create or replace function private.hq_impostor_notify_round_result(p_event_id uuid, p_round_no integer, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid;
begin
  for v_profile in
    select profile_id from private.hq_impostor_participants where event_id=p_event_id
  loop
    perform private.publish_notification_to_profile(
      v_profile,
      'hq-impostor:' || p_event_id::text || ':round:' || p_round_no::text || ':result:' || v_profile::text,
      'hq-impostor:' || p_event_id::text,
      'game_challenge_result_ready',
      'HQ Impostor reveal is ready',
      'Round ' || p_round_no::text || ' is resolved. See the votes, the Impostor, and the secret.',
      '/impostor',
      'SEE THE REVEAL',
      p_at
    );
  end loop;
end;
$$;

create or replace function private.hq_impostor_notify_round_open(p_event_id uuid, p_round_no integer, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid;
begin
  for v_profile in
    select profile_id from private.hq_impostor_participants where event_id=p_event_id
  loop
    perform private.publish_notification_to_profile(
      v_profile,
      'hq-impostor:' || p_event_id::text || ':round:' || p_round_no::text || ':open:' || v_profile::text,
      'hq-impostor:' || p_event_id::text,
      'game_challenge_received',
      case when p_round_no=4 then 'HQ Impostor finale is live' else 'HQ Impostor Round ' || p_round_no::text || ' is live' end,
      'Reveal your assignment, then lock one short clue before the round closes.',
      '/impostor',
      'PLAY ROUND ' || p_round_no::text,
      p_at
    );
  end loop;
end;
$$;

create or replace function private.hq_impostor_finalize_forfeit(p_event_id uuid, p_round_no integer, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_impostor uuid;
begin
  select impostor_profile_id into v_impostor
  from private.hq_impostor_rounds
  where event_id=p_event_id and round_no=p_round_no
  for update;

  update private.hq_impostor_actions
  set score = case
        when profile_id=v_impostor then 0
        when clue_submitted_at is not null then 100
        else 0
      end,
      score_breakdown = case
        when profile_id=v_impostor then jsonb_build_object('valid_clue',0,'forfeit_bonus',0,'total',0)
        when clue_submitted_at is not null then jsonb_build_object('valid_clue',20,'forfeit_bonus',80,'total',100)
        else jsonb_build_object('valid_clue',0,'forfeit_bonus',0,'total',0)
      end
  where event_id=p_event_id and round_no=p_round_no;

  update private.hq_impostor_rounds
  set status='forfeit', resolved_at=p_at,
      result=jsonb_build_object('outcome','forfeit','caught',true,'guess_correct',false)
  where event_id=p_event_id and round_no=p_round_no;

  perform private.hq_impostor_notify_round_result(p_event_id,p_round_no,p_at);
  perform private.hq_impostor_finish_event_if_ready(p_event_id,p_at);
end;
$$;

create or replace function private.hq_impostor_finalize_no_contest(p_event_id uuid, p_round_no integer, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.hq_impostor_actions
  set score=0,
      score_breakdown=jsonb_build_object('valid_clue',0,'no_contest',true,'total',0)
  where event_id=p_event_id and round_no=p_round_no;

  update private.hq_impostor_rounds
  set status='no_contest', resolved_at=p_at,
      result=jsonb_build_object('outcome','no_contest','caught',false,'guess_correct',false)
  where event_id=p_event_id and round_no=p_round_no;

  perform private.hq_impostor_notify_round_result(p_event_id,p_round_no,p_at);
  perform private.hq_impostor_finish_event_if_ready(p_event_id,p_at);
end;
$$;

create or replace function private.hq_impostor_finalize_vote(p_event_id uuid, p_round_no integer, p_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round private.hq_impostor_rounds%rowtype;
  v_topic private.hq_impostor_topics%rowtype;
  v_imp_votes integer:=0;
  v_max_votes integer:=0;
  v_leader_count integer:=0;
  v_caught boolean:=false;
  v_guess text;
  v_guess_submitted boolean:=false;
  v_guess_correct boolean:=false;
begin
  select * into v_round
  from private.hq_impostor_rounds
  where event_id=p_event_id and round_no=p_round_no
  for update;
  if not found or v_round.status <> 'vote' then return; end if;

  select * into v_topic from private.hq_impostor_topics where topic_key=v_round.topic_key;

  select count(*) into v_imp_votes
  from private.hq_impostor_actions
  where event_id=p_event_id and round_no=p_round_no and active
    and vote_profile_id=v_round.impostor_profile_id;

  select coalesce(max(votes),0) into v_max_votes
  from (
    select vote_profile_id,count(*)::integer votes
    from private.hq_impostor_actions
    where event_id=p_event_id and round_no=p_round_no and active and vote_profile_id is not null
    group by vote_profile_id
  ) counts;

  if v_max_votes > 0 then
    select count(*) into v_leader_count
    from (
      select vote_profile_id,count(*)::integer votes
      from private.hq_impostor_actions
      where event_id=p_event_id and round_no=p_round_no and active and vote_profile_id is not null
      group by vote_profile_id
    ) counts
    where votes=v_max_votes;
  end if;

  v_caught := v_max_votes > 0 and v_imp_votes=v_max_votes and v_leader_count=1;

  select secret_guess, (vote_submitted_at is not null and secret_guess is not null)
    into v_guess, v_guess_submitted
  from private.hq_impostor_actions
  where event_id=p_event_id and round_no=p_round_no and profile_id=v_round.impostor_profile_id;

  if v_guess_submitted then
    v_guess_correct := private.hq_impostor_guess_matches(v_round.topic_key,v_guess);
  end if;

  update private.hq_impostor_actions action
  set guess_correct = case when action.profile_id=v_round.impostor_profile_id then v_guess_correct else null end,
      score = case
        when not action.active or action.clue_submitted_at is null then 0
        when action.profile_id=v_round.impostor_profile_id then
          20 + case
            when v_guess_submitted and not v_caught then 80
            when v_guess_submitted and v_caught and v_guess_correct then 50
            else 0
          end
        else
          20
          + case when action.vote_profile_id=v_round.impostor_profile_id then 50 else 0 end
          + case when v_caught and not v_guess_correct then 30 else 0 end
      end,
      score_breakdown = case
        when not action.active or action.clue_submitted_at is null then jsonb_build_object('valid_clue',0,'total',0)
        when action.profile_id=v_round.impostor_profile_id then jsonb_build_object(
          'valid_clue',20,
          'survival',case when v_guess_submitted and not v_caught then 80 else 0 end,
          'recovery',case when v_guess_submitted and v_caught and v_guess_correct then 50 else 0 end,
          'total',20 + case
            when v_guess_submitted and not v_caught then 80
            when v_guess_submitted and v_caught and v_guess_correct then 50
            else 0
          end
        )
        else jsonb_build_object(
          'valid_clue',20,
          'correct_vote',case when action.vote_profile_id=v_round.impostor_profile_id then 50 else 0 end,
          'lockout',case when v_caught and not v_guess_correct then 30 else 0 end,
          'total',20
            + case when action.vote_profile_id=v_round.impostor_profile_id then 50 else 0 end
            + case when v_caught and not v_guess_correct then 30 else 0 end
        )
      end
  where action.event_id=p_event_id and action.round_no=p_round_no;

  update private.hq_impostor_rounds
  set status='resolved', resolved_at=p_at,
      result=jsonb_build_object(
        'outcome',case when v_caught then 'caught' else 'survived' end,
        'caught',v_caught,
        'guess_correct',v_guess_correct,
        'max_votes',v_max_votes
      )
  where event_id=p_event_id and round_no=p_round_no;

  perform private.hq_impostor_notify_round_result(p_event_id,p_round_no,p_at);
  perform private.hq_impostor_finish_event_if_ready(p_event_id,p_at);
end;
$$;

create or replace function private.maintain_hq_impostor_event(p_event_id uuid, p_at timestamptz default now())
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round record;
  v_impostor_active boolean;
  v_active_count integer;
  v_unfinished_count integer;
  v_waiting_votes integer;
begin
  perform pg_advisory_xact_lock(hashtextextended('hq-impostor:' || p_event_id::text,0));

  for v_round in
    select round_no,status,opens_at,clue_lock_at,vote_lock_at,impostor_profile_id
    from private.hq_impostor_rounds
    where event_id=p_event_id
    order by round_no
  loop
    if v_round.status='scheduled' and v_round.opens_at<=p_at and (
      v_round.round_no=1 or exists(
        select 1 from private.hq_impostor_rounds prior
        where prior.event_id=p_event_id and prior.round_no=v_round.round_no-1
          and prior.status in ('resolved','forfeit','no_contest')
      )
    ) then
      update private.hq_impostor_rounds
      set status='clue'
      where event_id=p_event_id and round_no=v_round.round_no and status='scheduled';
      get diagnostics v_unfinished_count = row_count;
      if v_unfinished_count > 0 then
        perform private.hq_impostor_notify_round_open(p_event_id,v_round.round_no,p_at);
      end if;
      v_round.status:='clue';
    end if;

    if v_round.status='clue' then
      update private.hq_impostor_actions
      set active=false
      where event_id=p_event_id and round_no=v_round.round_no
        and active
        and clue_submitted_at is null
        and (
          p_at>=v_round.clue_lock_at
          or (assignment_opened_at is not null and clue_deadline_at is not null and p_at>=clue_deadline_at)
        );

      select active and clue_submitted_at is not null
        into v_impostor_active
      from private.hq_impostor_actions
      where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_round.impostor_profile_id;

      if coalesce(v_impostor_active,false)=false and exists(
        select 1 from private.hq_impostor_actions
        where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_round.impostor_profile_id
          and not active
      ) then
        perform private.hq_impostor_finalize_forfeit(p_event_id,v_round.round_no,p_at);
        continue;
      end if;

      select count(*) into v_active_count
      from private.hq_impostor_actions
      where event_id=p_event_id and round_no=v_round.round_no and active and clue_submitted_at is not null;

      select count(*) into v_unfinished_count
      from private.hq_impostor_actions
      where event_id=p_event_id and round_no=v_round.round_no and active and clue_submitted_at is null;

      if p_at>=v_round.clue_lock_at or v_unfinished_count=0 then
        if v_active_count<3 then
          perform private.hq_impostor_finalize_no_contest(p_event_id,v_round.round_no,p_at);
          continue;
        end if;
        update private.hq_impostor_rounds
        set status='vote'
        where event_id=p_event_id and round_no=v_round.round_no and status='clue';
        v_round.status:='vote';
      end if;
    end if;

    if v_round.status='vote' then
      select count(*) into v_waiting_votes
      from private.hq_impostor_actions
      where event_id=p_event_id and round_no=v_round.round_no
        and active and clue_submitted_at is not null and vote_submitted_at is null
        and (
          board_opened_at is null
          or vote_deadline_at is null
          or p_at<vote_deadline_at
        );

      if p_at>=v_round.vote_lock_at or v_waiting_votes=0 then
        perform private.hq_impostor_finalize_vote(p_event_id,v_round.round_no,p_at);
      end if;
    end if;
  end loop;
end;
$$;

create or replace function private.hq_impostor_standings_json(p_event_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  with scores as (
    select
      participant.profile_id,
      profile.display_name,
      profile.initials,
      participant.seat_order,
      coalesce(sum(action.score),0)::integer total_score,
      coalesce(max(action.score) filter(where action.round_no=1),0)::integer r1,
      coalesce(max(action.score) filter(where action.round_no=2),0)::integer r2,
      coalesce(max(action.score) filter(where action.round_no=3),0)::integer r3,
      coalesce(max(action.score) filter(where action.round_no=4),0)::integer r4
    from private.hq_impostor_participants participant
    join public.profiles profile on profile.id=participant.profile_id
    left join private.hq_impostor_actions action
      on action.event_id=participant.event_id and action.profile_id=participant.profile_id
    where participant.event_id=p_event_id
    group by participant.profile_id,profile.display_name,profile.initials,participant.seat_order
  ), ranked as (
    select *, rank() over(order by total_score desc,r4 desc,r3 desc,r2 desc,r1 desc) as standing_rank
    from scores
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank',standing_rank,
    'profile_id',profile_id,
    'display_name',display_name,
    'initials',initials,
    'seat_order',seat_order,
    'total_score',total_score,
    'round_scores',jsonb_build_array(r1,r2,r3,r4)
  ) order by standing_rank,seat_order),'[]'::jsonb)
  from ranked;
$$;

create or replace function private.hq_impostor_state_json(p_event_id uuid, p_profile_id uuid, p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_event private.hq_impostor_events%rowtype;
  v_round private.hq_impostor_rounds%rowtype;
  v_action private.hq_impostor_actions%rowtype;
  v_topic private.hq_impostor_topics%rowtype;
  v_impostor_name text;
  v_current_round integer;
  v_is_terminal boolean;
  v_assignment_revealed boolean;
  v_show_board boolean;
  v_is_impostor boolean;
  v_phase text;
  v_members jsonb;
  v_standings jsonb;
  v_clues jsonb:=null;
  v_candidates jsonb:=null;
  v_votes jsonb:=null;
  v_scorecards jsonb:=null;
  v_result jsonb:=null;
  v_votes_locked integer:=0;
  v_active_count integer:=0;
begin
  select * into v_event from private.hq_impostor_events where id=p_event_id;
  if not found then raise exception 'HQ Impostor event not found'; end if;
  if not exists(select 1 from private.hq_impostor_participants where event_id=p_event_id and profile_id=p_profile_id) then
    raise exception 'You are not part of this HQ Impostor event';
  end if;

  select round.round_no into v_current_round
  from private.hq_impostor_rounds round
  join private.hq_impostor_actions action
    on action.event_id=round.event_id
   and action.round_no=round.round_no
   and action.profile_id=p_profile_id
  where round.event_id=p_event_id
    and round.status in ('resolved','forfeit','no_contest')
    and action.result_seen_at is null
  order by round.round_no
  limit 1;

  if v_current_round is null then
    select round_no into v_current_round
    from private.hq_impostor_rounds
    where event_id=p_event_id and status in ('clue','vote')
    order by round_no limit 1;
  end if;

  if v_current_round is null then
    select round_no into v_current_round
    from private.hq_impostor_rounds
    where event_id=p_event_id and status='scheduled'
    order by round_no limit 1;
  end if;

  if v_current_round is null then
    select round_no into v_current_round
    from private.hq_impostor_rounds
    where event_id=p_event_id and status in ('resolved','forfeit','no_contest')
    order by round_no desc limit 1;
  end if;

  select * into v_round
  from private.hq_impostor_rounds
  where event_id=p_event_id and round_no=v_current_round;
  select * into v_action
  from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_current_round and profile_id=p_profile_id;
  select * into v_topic from private.hq_impostor_topics where topic_key=v_round.topic_key;

  v_is_terminal := v_round.status in ('resolved','forfeit','no_contest');
  v_assignment_revealed := v_action.assignment_opened_at is not null or v_is_terminal;
  v_is_impostor := p_profile_id=v_round.impostor_profile_id;
  v_show_board := v_is_terminal or (v_round.status='vote' and v_action.board_opened_at is not null);

  select coalesce(jsonb_agg(jsonb_build_object(
    'profile_id',participant.profile_id,
    'display_name',profile.display_name,
    'initials',profile.initials,
    'seat_order',participant.seat_order,
    'is_current_user',participant.profile_id=p_profile_id
  ) order by participant.seat_order),'[]'::jsonb)
  into v_members
  from private.hq_impostor_participants participant
  join public.profiles profile on profile.id=participant.profile_id
  where participant.event_id=p_event_id;

  v_standings:=private.hq_impostor_standings_json(p_event_id);

  select count(*) into v_votes_locked
  from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_current_round and active and vote_submitted_at is not null;
  select count(*) into v_active_count
  from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_current_round and active and clue_submitted_at is not null;

  if v_show_board then
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',action.profile_id,
      'display_name',profile.display_name,
      'initials',profile.initials,
      'clue',action.clue_text,
      'active',action.active
    ) order by participant.seat_order),'[]'::jsonb)
    into v_clues
    from private.hq_impostor_actions action
    join private.hq_impostor_participants participant
      on participant.event_id=action.event_id and participant.profile_id=action.profile_id
    join public.profiles profile on profile.id=action.profile_id
    where action.event_id=p_event_id and action.round_no=v_current_round;
  end if;

  if v_round.status='vote' and v_action.board_opened_at is not null and v_action.active and v_action.vote_submitted_at is null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',action.profile_id,
      'display_name',profile.display_name,
      'initials',profile.initials
    ) order by participant.seat_order),'[]'::jsonb)
    into v_candidates
    from private.hq_impostor_actions action
    join private.hq_impostor_participants participant
      on participant.event_id=action.event_id and participant.profile_id=action.profile_id
    join public.profiles profile on profile.id=action.profile_id
    where action.event_id=p_event_id and action.round_no=v_current_round
      and action.active and action.clue_submitted_at is not null and action.profile_id<>p_profile_id;
  end if;

  if v_is_terminal then
    select display_name into v_impostor_name from public.profiles where id=v_round.impostor_profile_id;
    select coalesce(jsonb_agg(jsonb_build_object(
      'voter_profile_id',action.profile_id,
      'voter_display_name',voter.display_name,
      'target_profile_id',action.vote_profile_id,
      'target_display_name',target.display_name
    ) order by participant.seat_order),'[]'::jsonb)
    into v_votes
    from private.hq_impostor_actions action
    join private.hq_impostor_participants participant
      on participant.event_id=action.event_id and participant.profile_id=action.profile_id
    join public.profiles voter on voter.id=action.profile_id
    left join public.profiles target on target.id=action.vote_profile_id
    where action.event_id=p_event_id and action.round_no=v_current_round;

    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id',action.profile_id,
      'display_name',profile.display_name,
      'score',coalesce(action.score,0),
      'breakdown',coalesce(action.score_breakdown,'{}'::jsonb),
      'is_impostor',action.profile_id=v_round.impostor_profile_id
    ) order by participant.seat_order),'[]'::jsonb)
    into v_scorecards
    from private.hq_impostor_actions action
    join private.hq_impostor_participants participant
      on participant.event_id=action.event_id and participant.profile_id=action.profile_id
    join public.profiles profile on profile.id=action.profile_id
    where action.event_id=p_event_id and action.round_no=v_current_round;

    v_result:=coalesce(v_round.result,'{}'::jsonb) || jsonb_build_object(
      'secret_answer',v_topic.secret_answer,
      'impostor_profile_id',v_round.impostor_profile_id,
      'impostor_display_name',v_impostor_name,
      'impostor_guess',(select secret_guess from private.hq_impostor_actions where event_id=p_event_id and round_no=v_current_round and profile_id=v_round.impostor_profile_id),
      'votes',v_votes,
      'scorecards',v_scorecards
    );
  end if;

  v_phase:=case
    when v_event.status='completed' and v_is_terminal and v_action.result_seen_at is not null then 'event_complete'
    when v_round.status='scheduled' then 'waiting_round'
    when v_is_terminal then 'resolved'
    when not v_action.active then 'inactive'
    when v_round.status='clue' and v_action.assignment_opened_at is null then 'assignment'
    when v_round.status='clue' and v_action.clue_submitted_at is null then 'clue'
    when v_round.status='clue' then 'clue_locked'
    when v_round.status='vote' and v_action.board_opened_at is null then 'board_ready'
    when v_round.status='vote' and v_action.vote_submitted_at is null and (v_action.vote_deadline_at is null or p_at<v_action.vote_deadline_at) then 'vote'
    when v_round.status='vote' then 'vote_locked'
    else 'waiting'
  end;

  return jsonb_build_object(
    'available',true,
    'event',jsonb_build_object(
      'id',v_event.id,
      'status',v_event.status,
      'creator_id',v_event.creator_id,
      'is_creator',v_event.creator_id=p_profile_id,
      'created_at',v_event.created_at,
      'completed_at',v_event.completed_at,
      'round_count',v_event.round_count,
      'members',v_members,
      'standings',v_standings,
      'current_round',jsonb_build_object(
        'round_no',v_round.round_no,
        'is_final_round',v_round.round_no=4,
        'phase',v_phase,
        'round_status',v_round.status,
        'sport',v_topic.sport,
        'category',v_topic.category,
        'opens_at',v_round.opens_at,
        'clue_lock_at',v_round.clue_lock_at,
        'vote_lock_at',v_round.vote_lock_at,
        'assignment_revealed',v_assignment_revealed,
        'is_impostor',case when v_assignment_revealed then v_is_impostor else null end,
        'secret_answer',case when v_is_terminal or (v_action.assignment_opened_at is not null and not v_is_impostor) then v_topic.secret_answer else null end,
        'clue_deadline_at',v_action.clue_deadline_at,
        'my_clue',v_action.clue_text,
        'board_opened',v_action.board_opened_at is not null,
        'vote_deadline_at',v_action.vote_deadline_at,
        'my_vote_profile_id',v_action.vote_profile_id,
        'votes_locked_count',v_votes_locked,
        'active_count',v_active_count,
        'clues',v_clues,
        'vote_candidates',v_candidates,
        'result_acknowledged',v_action.result_seen_at is not null,
        'result',v_result
      )
    )
  );
end;
$$;

create or replace function private.get_my_hq_impostor(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_event_id uuid;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  select event.id into v_event_id
  from private.hq_impostor_events event
  join private.hq_impostor_participants participant on participant.event_id=event.id
  where participant.profile_id=v_profile and event.status='active'
  order by event.created_at desc limit 1;

  if v_event_id is null then
    select event.id into v_event_id
    from private.hq_impostor_events event
    join private.hq_impostor_participants participant on participant.event_id=event.id
    where participant.profile_id=v_profile
    order by event.created_at desc limit 1;
  end if;

  if v_event_id is null then
    return jsonb_build_object('available',true,'event',null);
  end if;

  perform private.maintain_hq_impostor_event(v_event_id,p_at);
  return private.hq_impostor_state_json(v_event_id,v_profile,p_at);
end;
$$;

create or replace function private.create_hq_impostor_event(p_member_names text[], p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator uuid:=auth.uid();
  v_creator_name text;
  v_event_id uuid;
  v_requested_count integer;
  v_resolved_count integer;
  v_round integer;
  v_topic_key text;
  v_impostor uuid;
  v_last_impostor uuid:=null;
  v_profile uuid;
  v_active_conflict text;
begin
  if v_creator is null then raise exception 'sign in required'; end if;
  select display_name into v_creator_name from public.profiles where id=v_creator;
  if v_creator_name is null then raise exception 'profile not found'; end if;

  v_requested_count:=coalesce(cardinality(p_member_names),0);
  if v_requested_count<3 or v_requested_count>7 then
    raise exception 'HQ Impostor requires 4-8 total players';
  end if;
  if (
    select count(distinct upper(regexp_replace(trim(name),'\s+',' ','g')))
    from unnest(p_member_names) name
  )<>v_requested_count then
    raise exception 'Choose each HQ member only once';
  end if;

  create temporary table if not exists pg_temp.hq_impostor_selected_profiles(
    ord integer primary key,
    profile_id uuid unique,
    display_name text
  ) on commit drop;
  truncate table pg_temp.hq_impostor_selected_profiles;

  insert into pg_temp.hq_impostor_selected_profiles(ord,profile_id,display_name)
  select requested.ord::integer, profile.id, profile.display_name
  from unnest(p_member_names) with ordinality requested(name,ord)
  join public.profiles profile
    on profile.normalized_name=upper(regexp_replace(trim(requested.name),'\s+',' ','g'))
  where profile.id<>v_creator;

  select count(*) into v_resolved_count from pg_temp.hq_impostor_selected_profiles;
  if v_resolved_count<>v_requested_count then
    raise exception 'One or more selected HQ members could not be found';
  end if;

  select profile.display_name into v_active_conflict
  from (
    select v_creator as profile_id
    union all
    select profile_id from pg_temp.hq_impostor_selected_profiles
  ) selected
  join public.profiles profile on profile.id=selected.profile_id
  join private.hq_impostor_participants participant on participant.profile_id=selected.profile_id and participant.active_event
  limit 1;
  if v_active_conflict is not null then
    raise exception '% is already in an active HQ Impostor event', v_active_conflict;
  end if;

  insert into private.hq_impostor_events(creator_id,created_at)
  values(v_creator,p_at)
  returning id into v_event_id;

  insert into private.hq_impostor_participants(event_id,profile_id,seat_order)
  values(v_event_id,v_creator,1);
  insert into private.hq_impostor_participants(event_id,profile_id,seat_order)
  select v_event_id,profile_id,ord+1
  from pg_temp.hq_impostor_selected_profiles
  order by ord;

  for v_round in 1..4 loop
    select topic_key into v_topic_key
    from private.hq_impostor_topics
    where active and difficulty=v_round
    order by random()
    limit 1;
    if v_topic_key is null then raise exception 'HQ Impostor is missing a difficulty % topic',v_round; end if;

    select candidate.profile_id into v_impostor
    from (
      select participant.profile_id,
        (select count(*) from private.hq_impostor_rounds prior
          where prior.event_id=v_event_id and prior.impostor_profile_id=participant.profile_id)::numeric prior_count
      from private.hq_impostor_participants participant
      where participant.event_id=v_event_id
    ) candidate
    order by -ln(greatest(random(),0.000000001))
      * (1 + candidate.prior_count*1.75 + case when candidate.profile_id=v_last_impostor then 3 else 0 end)
    limit 1;

    insert into private.hq_impostor_rounds(
      event_id,round_no,topic_key,impostor_profile_id,status,opens_at,clue_lock_at,vote_lock_at
    ) values (
      v_event_id,
      v_round,
      v_topic_key,
      v_impostor,
      case when v_round=1 then 'clue' else 'scheduled' end,
      p_at + ((v_round-1) * interval '1 day'),
      p_at + ((v_round-1) * interval '1 day') + interval '18 hours',
      p_at + (v_round * interval '1 day')
    );

    insert into private.hq_impostor_actions(event_id,round_no,profile_id)
    select v_event_id,v_round,participant.profile_id
    from private.hq_impostor_participants participant
    where participant.event_id=v_event_id;

    v_last_impostor:=v_impostor;
  end loop;

  for v_profile in
    select profile_id from private.hq_impostor_participants where event_id=v_event_id and profile_id<>v_creator
  loop
    perform private.publish_notification_to_profile(
      v_profile,
      'hq-impostor:' || v_event_id::text || ':round:1:open:' || v_profile::text,
      'hq-impostor:' || v_event_id::text,
      'game_challenge_received',
      'HQ Impostor is live',
      v_creator_name || ' started a four-round HQ Impostor event. Round 1 is open.',
      '/impostor',
      'PLAY ROUND 1',
      p_at
    );
  end loop;

  return private.hq_impostor_state_json(v_event_id,v_creator,p_at);
end;
$$;

create or replace function private.reveal_hq_impostor_assignment(p_event_id uuid, p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_round private.hq_impostor_rounds%rowtype;
  v_action private.hq_impostor_actions%rowtype;
  v_deadline timestamptz;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_hq_impostor_event(p_event_id,p_at);

  select round.* into v_round
  from private.hq_impostor_rounds round
  where round.event_id=p_event_id and round.status not in ('resolved','forfeit','no_contest')
  order by round.round_no limit 1;
  if not found or v_round.status<>'clue' or p_at<v_round.opens_at then
    raise exception 'The clue phase is not open';
  end if;

  select * into v_action from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile
  for update;
  if not found then raise exception 'You are not part of this HQ Impostor event'; end if;
  if not v_action.active then raise exception 'Your clue window has closed for this round'; end if;
  if p_at>=v_round.clue_lock_at then raise exception 'The clue phase has closed'; end if;

  if v_action.assignment_opened_at is null then
    v_deadline:=least(v_round.clue_lock_at,p_at+interval '3 minutes');
    update private.hq_impostor_actions
    set assignment_opened_at=p_at,clue_deadline_at=v_deadline
    where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile;
  end if;

  return private.hq_impostor_state_json(p_event_id,v_profile,p_at);
end;
$$;

create or replace function private.submit_hq_impostor_clue(p_event_id uuid, p_clue text, p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_round private.hq_impostor_rounds%rowtype;
  v_action private.hq_impostor_actions%rowtype;
  v_clue text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_hq_impostor_event(p_event_id,p_at);

  select round.* into v_round
  from private.hq_impostor_rounds round
  where round.event_id=p_event_id and round.status='clue'
  order by round.round_no limit 1;
  if not found then raise exception 'The clue phase is not open'; end if;

  select * into v_action from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile
  for update;
  if not found or not v_action.active then raise exception 'Your clue window has closed'; end if;
  if v_action.assignment_opened_at is null then raise exception 'Reveal your assignment before submitting a clue'; end if;
  if v_action.clue_submitted_at is not null then raise exception 'Your clue is already locked'; end if;
  if p_at>=least(v_round.clue_lock_at,v_action.clue_deadline_at) then
    raise exception 'Your three-minute clue window expired';
  end if;

  v_clue:=private.hq_impostor_validate_clue(v_round.topic_key,p_clue);
  update private.hq_impostor_actions
  set clue_text=v_clue,clue_submitted_at=p_at
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile;

  perform private.maintain_hq_impostor_event(p_event_id,p_at);
  return private.hq_impostor_state_json(p_event_id,v_profile,p_at);
end;
$$;

create or replace function private.open_hq_impostor_board(p_event_id uuid, p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_round private.hq_impostor_rounds%rowtype;
  v_action private.hq_impostor_actions%rowtype;
  v_deadline timestamptz;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_hq_impostor_event(p_event_id,p_at);

  select round.* into v_round
  from private.hq_impostor_rounds round
  where round.event_id=p_event_id and round.status='vote'
  order by round.round_no limit 1;
  if not found then raise exception 'The clue board is not ready'; end if;

  select * into v_action from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile
  for update;
  if not found then raise exception 'You are not part of this HQ Impostor event'; end if;
  if not v_action.active or v_action.clue_submitted_at is null then
    raise exception 'You missed the clue phase and cannot vote this round';
  end if;
  if p_at>=v_round.vote_lock_at then raise exception 'Voting has closed'; end if;

  if v_action.board_opened_at is null then
    v_deadline:=least(v_round.vote_lock_at,p_at+interval '5 minutes');
    update private.hq_impostor_actions
    set board_opened_at=p_at,vote_deadline_at=v_deadline
    where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile;
  end if;

  return private.hq_impostor_state_json(p_event_id,v_profile,p_at);
end;
$$;

create or replace function private.acknowledge_hq_impostor_result(
  p_event_id uuid,
  p_round_no integer,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $
declare
  v_profile uuid:=auth.uid();
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_hq_impostor_event(p_event_id,p_at);

  if not exists(
    select 1
    from private.hq_impostor_rounds round
    join private.hq_impostor_actions action
      on action.event_id=round.event_id
     and action.round_no=round.round_no
     and action.profile_id=v_profile
    where round.event_id=p_event_id
      and round.round_no=p_round_no
      and round.status in ('resolved','forfeit','no_contest')
  ) then
    raise exception 'That HQ Impostor result is not ready';
  end if;

  update private.hq_impostor_actions
  set result_seen_at=coalesce(result_seen_at,p_at)
  where event_id=p_event_id and round_no=p_round_no and profile_id=v_profile;

  return private.hq_impostor_state_json(p_event_id,v_profile,p_at);
end;
$;

create or replace function private.submit_hq_impostor_vote(
  p_event_id uuid,
  p_vote_profile_id uuid,
  p_secret_guess text default null,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_round private.hq_impostor_rounds%rowtype;
  v_action private.hq_impostor_actions%rowtype;
  v_guess text:=nullif(regexp_replace(trim(coalesce(p_secret_guess,'')),'\s+',' ','g'),'');
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_hq_impostor_event(p_event_id,p_at);

  select round.* into v_round
  from private.hq_impostor_rounds round
  where round.event_id=p_event_id and round.status='vote'
  order by round.round_no limit 1;
  if not found then raise exception 'Voting is not open'; end if;

  select * into v_action from private.hq_impostor_actions
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile
  for update;
  if not found or not v_action.active or v_action.clue_submitted_at is null then
    raise exception 'You are not eligible to vote this round';
  end if;
  if v_action.board_opened_at is null then raise exception 'Reveal the clue board before voting'; end if;
  if v_action.vote_submitted_at is not null then raise exception 'Your vote is already locked'; end if;
  if p_at>=least(v_round.vote_lock_at,v_action.vote_deadline_at) then
    raise exception 'Your five-minute voting window expired';
  end if;
  if p_vote_profile_id=v_profile then raise exception 'You cannot vote for yourself'; end if;
  if not exists(
    select 1 from private.hq_impostor_actions candidate
    where candidate.event_id=p_event_id and candidate.round_no=v_round.round_no
      and candidate.profile_id=p_vote_profile_id and candidate.active and candidate.clue_submitted_at is not null
  ) then raise exception 'That player is not on the active ballot'; end if;

  if v_profile=v_round.impostor_profile_id then
    if v_guess is null then raise exception 'The Impostor must lock a secret guess with the vote'; end if;
    if char_length(v_guess)>100 then raise exception 'Keep the secret guess under 100 characters'; end if;
  elsif v_guess is not null then
    raise exception 'Only the Impostor submits a secret guess';
  end if;

  update private.hq_impostor_actions
  set vote_profile_id=p_vote_profile_id,
      vote_submitted_at=p_at,
      secret_guess=case when profile_id=v_round.impostor_profile_id then v_guess else null end
  where event_id=p_event_id and round_no=v_round.round_no and profile_id=v_profile;

  perform private.maintain_hq_impostor_event(p_event_id,p_at);
  return private.hq_impostor_state_json(p_event_id,v_profile,p_at);
end;
$$;

create or replace function public.get_my_hq_impostor()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.get_my_hq_impostor(now());
$$;

create or replace function public.create_hq_impostor_event(p_member_names text[])
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.create_hq_impostor_event(p_member_names,now());
$$;

create or replace function public.reveal_hq_impostor_assignment(p_event_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.reveal_hq_impostor_assignment(p_event_id,now());
$$;

create or replace function public.submit_hq_impostor_clue(p_event_id uuid,p_clue text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.submit_hq_impostor_clue(p_event_id,p_clue,now());
$$;

create or replace function public.open_hq_impostor_board(p_event_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.open_hq_impostor_board(p_event_id,now());
$$;

create or replace function public.acknowledge_hq_impostor_result(p_event_id uuid,p_round_no integer)
returns jsonb
language sql
security invoker
set search_path = ''
as $
  select private.acknowledge_hq_impostor_result(p_event_id,p_round_no,now());
$;

create or replace function public.submit_hq_impostor_vote(p_event_id uuid,p_vote_profile_id uuid,p_secret_guess text default null)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.submit_hq_impostor_vote(p_event_id,p_vote_profile_id,p_secret_guess,now());
$$;

grant usage on schema private to authenticated;

revoke all on function private.hq_impostor_normalize_text(text) from public,anon,authenticated;
revoke all on function private.hq_impostor_compact_text(text) from public,anon,authenticated;
revoke all on function private.hq_impostor_edit_distance(text,text) from public,anon,authenticated;
revoke all on function private.hq_impostor_guess_matches(text,text) from public,anon,authenticated;
revoke all on function private.hq_impostor_validate_clue(text,text) from public,anon,authenticated;
revoke all on function private.hq_impostor_finish_event_if_ready(uuid,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_notify_round_result(uuid,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_notify_round_open(uuid,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_finalize_forfeit(uuid,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_finalize_no_contest(uuid,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_finalize_vote(uuid,integer,timestamptz) from public,anon,authenticated;
revoke all on function private.maintain_hq_impostor_event(uuid,timestamptz) from public,anon,authenticated;
revoke all on function private.hq_impostor_standings_json(uuid) from public,anon,authenticated;
revoke all on function private.hq_impostor_state_json(uuid,uuid,timestamptz) from public,anon,authenticated;
revoke all on function private.get_my_hq_impostor(timestamptz) from public,anon;
revoke all on function private.create_hq_impostor_event(text[],timestamptz) from public,anon;
revoke all on function private.reveal_hq_impostor_assignment(uuid,timestamptz) from public,anon;
revoke all on function private.submit_hq_impostor_clue(uuid,text,timestamptz) from public,anon;
revoke all on function private.open_hq_impostor_board(uuid,timestamptz) from public,anon;
revoke all on function private.acknowledge_hq_impostor_result(uuid,integer,timestamptz) from public,anon;
revoke all on function private.submit_hq_impostor_vote(uuid,uuid,text,timestamptz) from public,anon;

grant execute on function private.get_my_hq_impostor(timestamptz) to authenticated;
grant execute on function private.create_hq_impostor_event(text[],timestamptz) to authenticated;
grant execute on function private.reveal_hq_impostor_assignment(uuid,timestamptz) to authenticated;
grant execute on function private.submit_hq_impostor_clue(uuid,text,timestamptz) to authenticated;
grant execute on function private.open_hq_impostor_board(uuid,timestamptz) to authenticated;
grant execute on function private.acknowledge_hq_impostor_result(uuid,integer,timestamptz) to authenticated;
grant execute on function private.submit_hq_impostor_vote(uuid,uuid,text,timestamptz) to authenticated;

revoke all on function public.get_my_hq_impostor() from public,anon;
revoke all on function public.create_hq_impostor_event(text[]) from public,anon;
revoke all on function public.reveal_hq_impostor_assignment(uuid) from public,anon;
revoke all on function public.submit_hq_impostor_clue(uuid,text) from public,anon;
revoke all on function public.open_hq_impostor_board(uuid) from public,anon;
revoke all on function public.acknowledge_hq_impostor_result(uuid,integer) from public,anon;
revoke all on function public.submit_hq_impostor_vote(uuid,uuid,text) from public,anon;

grant execute on function public.get_my_hq_impostor() to authenticated;
grant execute on function public.create_hq_impostor_event(text[]) to authenticated;
grant execute on function public.reveal_hq_impostor_assignment(uuid) to authenticated;
grant execute on function public.submit_hq_impostor_clue(uuid,text) to authenticated;
grant execute on function public.open_hq_impostor_board(uuid) to authenticated;
grant execute on function public.acknowledge_hq_impostor_result(uuid,integer) to authenticated;
grant execute on function public.submit_hq_impostor_vote(uuid,uuid,text) to authenticated;

comment on table private.hq_impostor_topics is
  'Private authored HQ Impostor topic bank. Secrets and aliases are never exposed before the applicable player is entitled to see them.';
comment on function public.create_hq_impostor_event(text[]) is
  'Creates one four-round HQ Impostor Featured Challenge for 4-8 total players with server-owned balanced-but-nondeterministic Impostor assignments.';
comment on function public.reveal_hq_impostor_assignment(uuid) is
  'Starts that player''s three-minute clue clock and returns only the role/secret information that player may see.';
comment on function public.open_hq_impostor_board(uuid) is
  'Reveals the complete simultaneous clue board and starts that player''s five-minute voting clock.';
comment on function public.acknowledge_hq_impostor_result(uuid,integer) is
  'Marks one terminal round reveal as seen for the signed-in participant so asynchronous advancement can never skip the reveal.';
comment on function public.submit_hq_impostor_vote(uuid,uuid,text) is
  'Locks one vote; the Impostor must lock the final secret guess in the same request before any vote reveal.';
