-- MagazinIshy-GH (מגזין מהמרחב הפנימי): articles composed from a merhav case (three lenses + synthesis).
-- Shared project cultura-GH: every object of this app carries the ishy prefix. Reads merhav_* only.
create table if not exists public.ishy_articles (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references public.merhav_cases(id) on delete set null,
  case_code   text,
  case_title  text,
  content     jsonb not null default '{}'::jsonb,
  share       jsonb not null default '{}'::jsonb,
  model       text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);
comment on table public.ishy_articles is 'MagazinIshy-GH: one article per generation from a merhav case. Writes via ishy-compose only.';
create index if not exists ishy_articles_created_idx on public.ishy_articles (created_at desc);
create index if not exists ishy_articles_case_idx on public.ishy_articles (case_id);
alter table public.ishy_articles enable row level security;
create policy ishy_articles_public_read on public.ishy_articles for select to anon, authenticated using (published);
