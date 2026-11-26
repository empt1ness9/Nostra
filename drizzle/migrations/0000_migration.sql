create type public.app_role as enum ('tutor','student','parent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare r text := coalesce(new.raw_user_meta_data->>'account_type', 'tutor');
begin
  if r not in ('tutor','student','parent') then r := 'tutor'; end if;
  insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  insert into public.user_roles (user_id, role) values (new.id, r::app_role);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid(),
  name text not null,
  subject text not null default '',
  price integer not null default 0,
  phone text not null default '',
  color text not null default 'blue',
  topics_done integer not null default 0,
  topics_total integer not null default 0,
  student_user_id uuid,
  parent_user_id uuid,
  invite_code text not null unique default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.students to authenticated;
grant all on public.students to service_role;
alter table public.students enable row level security;

create or replace function public.can_access_student(_sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.students s where s.id = _sid
    and auth.uid() in (s.tutor_id, s.student_user_id, s.parent_user_id))
$$;

create policy "view students" on public.students for select to authenticated using (public.can_access_student(id));
create policy "tutor inserts" on public.students for insert to authenticated with check (tutor_id = auth.uid());
create policy "tutor updates" on public.students for update to authenticated using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "tutor deletes" on public.students for delete to authenticated using (tutor_id = auth.uid());

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null,
  title text not null default '',
  kind text not null default 'lesson',
  status text not null default 'planned',
  pay text not null default 'unpaid',
  created_at timestamptz not null default now()
);
create index on public.lessons (student_id);
grant select, insert, update, delete on public.lessons to authenticated;
grant all on public.lessons to service_role;
alter table public.lessons enable row level security;
create policy "view lessons" on public.lessons for select to authenticated using (public.can_access_student(student_id));
create policy "tutor inserts lessons" on public.lessons for insert to authenticated
  with check (tutor_id = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.tutor_id = auth.uid()));
create policy "tutor updates lessons" on public.lessons for update to authenticated using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "tutor deletes lessons" on public.lessons for delete to authenticated using (tutor_id = auth.uid());

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  sender_id uuid not null default auth.uid(),
  sender_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);
create index on public.messages (student_id, created_at);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "view messages" on public.messages for select to authenticated using (public.can_access_student(student_id));
create policy "send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.can_access_student(student_id));

-- profiles: own row, plus people linked through a student card
create policy "own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- link a student/parent account to a tutor's student card by code
create or replace function public.claim_invite(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid; r app_role;
begin
  select role into r from public.user_roles where user_id = auth.uid() limit 1;
  if r = 'student' then
    update public.students set student_user_id = auth.uid()
      where invite_code = upper(trim(_code)) and student_user_id is null returning id into sid;
  elsif r = 'parent' then
    update public.students set parent_user_id = auth.uid()
      where invite_code = upper(trim(_code)) and parent_user_id is null returning id into sid;
  end if;
  if sid is null then raise exception 'Код не найден или уже использован'; end if;
  return sid;
end $$;
revoke execute on function public.claim_invite(text) from public, anon;
grant execute on function public.claim_invite(text) to authenticated;

-- parent marks a held lesson as paid -> goes to tutor for confirmation
create or replace function public.parent_mark_paid(_lesson uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.lessons l set pay = 'pending'
    from public.students s
    where l.id = _lesson and s.id = l.student_id and s.parent_user_id = auth.uid() and l.pay = 'unpaid';
  if not found then raise exception 'Нельзя отметить это занятие'; end if;
end $$;
revoke execute on function public.parent_mark_paid(uuid) from public, anon;
grant execute on function public.parent_mark_paid(uuid) to authenticated;

alter publication supabase_realtime add table public.messages;