-- 마일리지 충전(토스페이먼츠) + 마일리지로 주문 결제 기능
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.

-- 1. 마일리지 잔액 컬럼
alter table public.profiles add column if not exists mileage_balance integer not null default 0;

-- 2. 결제 내역 테이블 (토스페이먼츠 연동 결제 기록)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  order_id text not null unique,
  amount integer not null,
  status text not null default 'pending', -- pending | confirmed | failed
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
drop policy if exists "payments_select_own_or_admin" on public.payments;
create policy "payments_select_own_or_admin" on public.payments for select
  using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments for insert
  with check (customer_id = auth.uid());
-- status 변경(confirm)은 Edge Function이 service role로 처리하므로 별도 update 정책 없음(클라이언트는 못 바꿈)

-- 3. 주문 테이블에 결제 수단 구분 컬럼 추가
alter table public.orders add column if not exists payment_method text not null default 'card';

-- 4. 마일리지로 주문 결제 (잔액 확인 + 차감 + 주문 생성을 한 번에, 원자적으로 처리)
create or replace function public.pay_with_mileage(p_items jsonb, p_total integer)
returns public.orders
language plpgsql security definer as $$
declare
  v_balance integer;
  v_order public.orders;
begin
  select mileage_balance into v_balance from public.profiles where id = auth.uid() for update;
  if v_balance is null or v_balance < p_total then
    raise exception '마일리지가 부족합니다';
  end if;

  update public.profiles set mileage_balance = mileage_balance - p_total where id = auth.uid();

  insert into public.orders (customer_id, items, total, status, payment_method)
  values (auth.uid(), p_items, p_total, '접수완료', 'mileage')
  returning * into v_order;

  return v_order;
end;
$$;
