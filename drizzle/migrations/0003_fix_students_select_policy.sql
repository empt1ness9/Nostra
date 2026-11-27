drop policy if exists "view students" on public.students;
create policy "view students" on public.students
  for select to authenticated
  using (
    tutor_id = (select auth.uid())
    or student_user_id = (select auth.uid())
    or parent_user_id = (select auth.uid())
  );
create index if not exists students_student_user_id_idx on public.students (student_user_id);
create index if not exists students_parent_user_id_idx on public.students (parent_user_id);