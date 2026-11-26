create or replace function public.set_my_account_type(_type text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if _type not in ('tutor','student','parent') then raise exception 'bad type'; end if;
  if exists (select 1 from public.students where tutor_id = auth.uid() or student_user_id = auth.uid() or parent_user_id = auth.uid()) then
    raise exception 'Тип аккаунта уже нельзя сменить';
  end if;
  delete from public.user_roles where user_id = auth.uid();
  insert into public.user_roles (user_id, role) values (auth.uid(), _type::app_role);
end $$;
revoke execute on function public.set_my_account_type(text) from public, anon;
grant execute on function public.set_my_account_type(text) to authenticated;

-- linked people can see each other's names
create policy "linked profiles" on public.profiles for select to authenticated using (
  exists (select 1 from public.students s where id in (s.tutor_id, s.student_user_id, s.parent_user_id)
    and auth.uid() in (s.tutor_id, s.student_user_id, s.parent_user_id)));