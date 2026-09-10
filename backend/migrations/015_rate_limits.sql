-- Somewhere to count requests.
--
-- Nothing in this API was rate limited: the sign-in endpoint took unlimited
-- password guesses against a known administrator address, and the public quote
-- and newsletter routes could be run in a loop by anyone.
--
-- Cloudflare's own edge rate limiter is bound to this Worker but does not
-- enforce on this account — it answers "allowed" however often it is asked —
-- so the count is kept here, where it can be verified.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

-- One statement, so two requests arriving together cannot both read the same
-- count and both decide they are under the limit.
create or replace function rate_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into rate_limits (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else rate_limits.count + 1
        end,
        window_start = case
          when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Keeps the table from growing forever; spent windows are of no interest.
create index if not exists rate_limits_window_start_idx on rate_limits (window_start);
