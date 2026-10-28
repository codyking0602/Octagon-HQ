create table private.auction_rating_code_secret (
  singleton boolean primary key default true check (singleton),
  secret bytea not null check (octet_length(secret) = 32),
  created_at timestamptz not null default now()
);

comment on table private.auction_rating_code_secret is
  'Private Auction-only secret used to derive opaque rating exchange codes. Never expose this row through a public RPC, client projection, or generated repository artifact.';

insert into private.auction_rating_code_secret (singleton, secret)
values (true, extensions.gen_random_bytes(32));

revoke all on table private.auction_rating_code_secret from public, anon, authenticated, service_role;

create or replace function private.auction_rating_code(p_rating numeric)
returns text
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_secret bytea;
  v_digest bytea;
  v_rating integer;
begin
  if p_rating is null
    or p_rating <> trunc(p_rating)
    or p_rating < 0
    or p_rating > 100
  then
    raise exception 'Auction rating code input must be a whole number from 0 through 100';
  end if;

  v_rating := p_rating::integer;

  select secret
  into strict v_secret
  from private.auction_rating_code_secret
  where singleton = true;

  v_digest := extensions.hmac(
    convert_to(v_rating::text, 'UTF8'),
    v_secret,
    'sha256'
  );

  return
    chr(65 + (get_byte(v_digest, 0) % 26)) ||
    chr(65 + (get_byte(v_digest, 1) % 26)) ||
    chr(65 + (get_byte(v_digest, 2) % 26)) ||
    chr(65 + (get_byte(v_digest, 3) % 26)) ||
    chr(65 + (get_byte(v_digest, 4) % 26)) ||
    chr(65 + (get_byte(v_digest, 5) % 26));
end;
$$;

comment on function private.auction_rating_code(numeric) is
  'Derives a stable opaque six-letter code for a private whole-number Auction rating. The mapping is environment-specific and must never be exposed to Auction participants.';

revoke all on function private.auction_rating_code(numeric) from public, anon, authenticated, service_role;

-- Fail closed if this environment-specific key happens to produce a collision
-- anywhere in the supported whole-number rating domain.
do $$
declare
  v_total integer;
  v_distinct integer;
  v_invalid integer;
begin
  select
    count(*),
    count(distinct code),
    count(*) filter (where code !~ '^[A-Z]{6}$')
  into v_total, v_distinct, v_invalid
  from (
    select private.auction_rating_code(rating) as code
    from generate_series(0, 100) as rating
  ) generated;

  if v_total <> 101 or v_distinct <> 101 or v_invalid <> 0 then
    raise exception 'Auction private rating code generation failed uniqueness or format validation';
  end if;
end;
$$;
