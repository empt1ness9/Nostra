alter table public.lessons add column homework text not null default '', add column homework_done boolean not null default false;
alter table public.students add column parent_phone text not null default '', add column pay_scheme text not null default 'per_lesson';

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  tutor_id uuid not null default auth.uid(),
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.topics to authenticated;
grant all on public.topics to service_role;
alter table public.topics enable row level security;
create policy "view topics" on public.topics for select to authenticated using (public.can_access_student(student_id));
create policy "tutor writes topics" on public.topics for all to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid() and exists (select 1 from public.students s where s.id = student_id and s.tutor_id = auth.uid()));

create table public.tutor_settings (
  tutor_id uuid primary key default auth.uid(),
  bank text not null default '',
  pay_phone text not null default '',
  card text not null default '',
  pay_comment text not null default '',
  qr_path text not null default '',
  telegram text not null default '',
  default_minutes integer not null default 60,
  cancel_hours integer not null default 24,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.tutor_settings to authenticated;
grant all on public.tutor_settings to service_role;
alter table public.tutor_settings enable row level security;
create policy "own settings" on public.tutor_settings for all to authenticated using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy "linked see settings" on public.tutor_settings for select to authenticated using (
  exists (select 1 from public.students s where s.tutor_id = tutor_settings.tutor_id and auth.uid() in (s.student_user_id, s.parent_user_id)));

create or replace function public.student_mark_homework(_lesson uuid, _done boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.lessons l set homework_done = _done from public.students s
    where l.id = _lesson and s.id = l.student_id and auth.uid() in (s.student_user_id, s.tutor_id);
  if not found then raise exception 'Нельзя изменить'; end if;
end $$;
revoke execute on function public.student_mark_homework(uuid, boolean) from public, anon;
grant execute on function public.student_mark_homework(uuid, boolean) to authenticated;

create policy "qr upload own" on storage.objects for insert to authenticated with check (bucket_id = 'qr' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "qr update own" on storage.objects for update to authenticated using (bucket_id = 'qr' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "qr read linked" on storage.objects for select to authenticated using (
  bucket_id = 'qr' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.students s where s.tutor_id::text = (storage.foldername(name))[1] and auth.uid() in (s.student_user_id, s.parent_user_id))));