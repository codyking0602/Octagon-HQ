create table if not exists public.play_challenges (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  game_id text not null,
  game_version text not null,
  game_title text not null,
  summary text not null,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  play_url text not null default '',
  setup jsonb not null,
  creator_result jsonb not null,
  responder_result jsonb,
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  creator_hidden_at timestamptz,
  recipient_hidden_at timestamptz,
  constraint play_challenges_different_profiles check (creator_id <> recipient_id),
  constraint play_challenges_code_format check (code ~ '^[A-Z0-9]{8}$'),
  constraint play_challenges_game_id_length check (char_length(game_id) between 2 and 40),
  constraint play_challenges_game_version_length check (char_length(game_version) between 2 and 80),
  constraint play_challenges_game_title_length check (char_length(game_title) between 2 and 80),
  constraint play_challenges_summary_length check (char_length(summary) between 2 and 240),
  constraint play_challenges_play_url_length check (char_length(play_url) <= 1000),
  constraint play_challenges_setup_size check (octet_length(setup::text) <= 250000),
  constraint play_challenges_creator_result_size check (octet_length(creator_result::text) <= 150000),
  constraint play_challenges_responder_result_size check (responder_result is null or octet_length(responder_result::text) <= 150000)
);

create index if not exists play_challenges_creator_created_idx
  on public.play_challenges (creator_id, created_at desc);
create index if not exists play_challenges_recipient_created_idx
  on public.play_challenges (recipient_id, created_at desc);

alter table public.play_challenges enable row level security;
revoke all on public.play_challenges from public, anon, authenticated;

create or replace function public.list_my_play_challenges()
returns table (
  code text,
  game_id text,
  game_version text,
  game_title text,
  summary text,
  creator_id uuid,
  recipient_id uuid,
  play_url text,
  setup jsonb,
  creator_result jsonb,
  responder_result jsonb,
  created_at timestamptz,
  opened_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.code,
    c.game_id,
    c.game_version,
    c.game_title,
    c.summary,
    c.creator_id,
    c.recipient_id,
    c.play_url,
    c.setup,
    case
      when c.creator_id = auth.uid() or c.completed_at is not null then c.creator_result
      else null
    end as creator_result,
    case
      when c.completed_at is not null then c.responder_result
      else null
    end as responder_result,
    c.created_at,
    c.opened_at,
    c.completed_at,
    c.declined_at,
    c.expires_at
  from public.play_challenges c
  where (
      c.creator_id = auth.uid()
      and c.creator_hidden_at is null
    ) or (
      c.recipient_id = auth.uid()
      and c.recipient_hidden_at is null
    )
  order by c.created_at desc;
$$;

create or replace function public.create_play_challenge(
  p_recipient_id uuid,
  p_game_id text,
  p_game_version text,
  p_game_title text,
  p_summary text,
  p_play_url text,
  p_setup jsonb,
  p_creator_result jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_code text;
  v_attempt integer := 0;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;

  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code,
        game_id,
        game_version,
        game_title,
        summary,
        creator_id,
        recipient_id,
        play_url,
        setup,
        creator_result
      ) values (
        v_code,
        trim(p_game_id),
        trim(p_game_version),
        trim(p_game_title),
        trim(p_summary),
        v_creator_id,
        p_recipient_id,
        coalesce(trim(p_play_url), ''),
        p_setup,
        p_creator_result
      );
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  return v_code;
end;
$$;

create or replace function public.open_play_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.play_challenges
  set opened_at = coalesce(opened_at, now())
  where code = upper(trim(p_code))
    and recipient_id = auth.uid()
    and completed_at is null
    and declined_at is null
    and recipient_hidden_at is null;
  return found;
end;
$$;

create or replace function public.complete_play_challenge(p_code text, p_result jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.play_challenges
  set opened_at = coalesce(opened_at, now()),
      responder_result = p_result,
      completed_at = now()
  where code = upper(trim(p_code))
    and recipient_id = auth.uid()
    and completed_at is null
    and declined_at is null
    and recipient_hidden_at is null;
  return found;
end;
$$;

create or replace function public.dismiss_play_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.play_challenges
  set declined_at = case
        when recipient_id = auth.uid() and completed_at is null then coalesce(declined_at, now())
        else declined_at
      end,
      creator_hidden_at = case
        when creator_id = auth.uid() then coalesce(creator_hidden_at, now())
        else creator_hidden_at
      end,
      recipient_hidden_at = case
        when recipient_id = auth.uid() then coalesce(recipient_hidden_at, now())
        else recipient_hidden_at
      end
  where code = upper(trim(p_code))
    and (creator_id = auth.uid() or recipient_id = auth.uid());
  return found;
end;
$$;

revoke all on function public.list_my_play_challenges() from public, anon;
revoke all on function public.create_play_challenge(uuid, text, text, text, text, text, jsonb, jsonb) from public, anon;
revoke all on function public.open_play_challenge(text) from public, anon;
revoke all on function public.complete_play_challenge(text, jsonb) from public, anon;
revoke all on function public.dismiss_play_challenge(text) from public, anon;

grant execute on function public.list_my_play_challenges() to authenticated;
grant execute on function public.create_play_challenge(uuid, text, text, text, text, text, jsonb, jsonb) to authenticated;
grant execute on function public.open_play_challenge(text) to authenticated;
grant execute on function public.complete_play_challenge(text, jsonb) to authenticated;
grant execute on function public.dismiss_play_challenge(text) to authenticated;
