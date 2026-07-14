-- 대시보드에서 직접 만든 계정에 프로필이 안 생기는 문제 수정
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.

-- 1. 앞으로 계정이 만들어질 때(사이트 가입이든 대시보드 직접 생성이든) 항상 프로필도 같이 생기도록
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2. 이미 만들어졌는데 프로필이 없는 기존 계정들 채워넣기 (대시보드로 만든 계정 포함)
insert into public.profiles (id, username, name, phone)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'phone'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3. 본인 계정을 관리자로 지정 (이메일을 본인 것으로 바꿔서 실행)
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = '본인이메일@example.com');
