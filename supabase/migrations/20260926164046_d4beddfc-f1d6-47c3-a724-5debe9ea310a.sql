create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.update_updated_at_column() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null, subheadline text, content text not null, source_url text,
  category text not null default 'World',
  published_at timestamptz not null default now(),
  status text not null default 'published',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "Public reads published" on public.articles for select to anon, authenticated using (status = 'published');
create policy "Admins read all" on public.articles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins insert" on public.articles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update" on public.articles for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins delete" on public.articles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger articles_updated before update on public.articles for each row execute function public.update_updated_at_column();

create table public.review_queue (
  id uuid primary key default gen_random_uuid(),
  title text not null, subheadline text, content text not null, source_url text unique,
  category text not null default 'World',
  published_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select, insert, update, delete on public.review_queue to authenticated;
grant all on public.review_queue to service_role;
alter table public.review_queue enable row level security;
create policy "Admins manage queue" on public.review_queue for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger review_queue_updated before update on public.review_queue for each row execute function public.update_updated_at_column();

create or replace function public.approve_draft(_id uuid) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  insert into public.articles (title, subheadline, content, source_url, category, published_at, status)
  select title, subheadline, content, source_url, category, now(), 'published' from public.review_queue where id=_id
  returning id into new_id;
  if new_id is null then raise exception 'Draft not found'; end if;
  delete from public.review_queue where id=_id;
  return new_id;
end; $$;
revoke execute on function public.approve_draft(uuid) from public, anon;
grant execute on function public.approve_draft(uuid) to authenticated;