-- 관리자 전용 접근 잠금 설정
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다 (기존 정책을 지우고 다시 만듦).

-- 0. 대상 테이블의 기존 정책을 전부 지우고 깨끗하게 다시 설정
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('menus', 'beans', 'orders', 'app_settings', 'profiles')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- 1. profiles에 관리자 플래그 추가
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2. 본인이 스스로 is_admin을 바꿀 수 없게 방어 (관리자 지정은 SQL Editor에서만)
create or replace function public.prevent_is_admin_selfupdate()
returns trigger language plpgsql security definer as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.uid() = old.id then
    new.is_admin := old.is_admin;
  end if;
  return new;
end $$;

drop trigger if exists trg_prevent_is_admin_selfupdate on public.profiles;
create trigger trg_prevent_is_admin_selfupdate
before update on public.profiles
for each row execute function public.prevent_is_admin_selfupdate();

-- 3. 관리자 여부 판별 헬퍼
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 4. profiles: 본인 것만 조회 가능 (관리자 판별에 필요)
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());

-- 5. menus: 조회는 누구나(고객 화면용), 쓰기는 관리자만
alter table public.menus enable row level security;
create policy "menus_select_public" on public.menus for select using (true);
create policy "menus_insert_admin" on public.menus for insert with check (public.is_admin());
create policy "menus_update_admin" on public.menus for update using (public.is_admin()) with check (public.is_admin());
create policy "menus_delete_admin" on public.menus for delete using (public.is_admin());

-- 6. beans: menus와 동일
alter table public.beans enable row level security;
create policy "beans_select_public" on public.beans for select using (true);
create policy "beans_insert_admin" on public.beans for insert with check (public.is_admin());
create policy "beans_update_admin" on public.beans for update using (public.is_admin()) with check (public.is_admin());
create policy "beans_delete_admin" on public.beans for delete using (public.is_admin());

-- 7. orders: 본인 주문은 본인이 보고 생성, 전체 조회/상태 변경은 관리자만
alter table public.orders enable row level security;
create policy "orders_select_own_or_admin" on public.orders for select
  using (customer_id = auth.uid() or public.is_admin());
create policy "orders_insert_own" on public.orders for insert
  with check (customer_id = auth.uid());
create policy "orders_update_admin" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

-- 8. app_settings (오늘의 추천 원두/메뉴 설정): 조회는 공개, 쓰기는 관리자만
alter table public.app_settings enable row level security;
create policy "app_settings_select_public" on public.app_settings for select using (true);
create policy "app_settings_insert_admin" on public.app_settings for insert with check (public.is_admin());
create policy "app_settings_update_admin" on public.app_settings for update using (public.is_admin()) with check (public.is_admin());
create policy "app_settings_delete_admin" on public.app_settings for delete using (public.is_admin());

-- 9. 본인을 관리자로 지정하기 (이메일을 본인 계정으로 바꿔서 아래 한 줄만 따로 실행하세요)
-- update public.profiles set is_admin = true where id = (select id from auth.users where email = '본인이메일@example.com');
