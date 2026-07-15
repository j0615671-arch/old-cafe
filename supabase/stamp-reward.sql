-- 도장 리워드로 무료 메뉴 주문하기
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.

alter table public.profiles add column if not exists stamp_rewards_used integer not null default 0;

-- 도장 10개(STAMP_GOAL, js/data.js와 값 맞춰야 함)마다 리워드 1개.
-- 아직 안 쓴 리워드가 있을 때만 할인 금액만큼 뺀 총액으로 주문 생성 + 사용 개수 1 증가.
create or replace function public.redeem_stamp_reward(p_items jsonb, p_total integer, p_discount integer)
returns public.orders
language plpgsql security definer as $$
declare
  v_order_count integer;
  v_rewards_earned integer;
  v_rewards_used integer;
  v_order public.orders;
begin
  select count(*) into v_order_count from public.orders where customer_id = auth.uid();
  v_rewards_earned := v_order_count / 10;

  select coalesce(stamp_rewards_used, 0) into v_rewards_used from public.profiles where id = auth.uid() for update;

  if v_rewards_used >= v_rewards_earned then
    raise exception '사용 가능한 도장 리워드가 없습니다';
  end if;

  update public.profiles set stamp_rewards_used = coalesce(stamp_rewards_used, 0) + 1 where id = auth.uid();

  insert into public.orders (customer_id, items, total, status, payment_method)
  values (auth.uid(), p_items, greatest(p_total - p_discount, 0), '접수완료', 'stamp_reward')
  returning * into v_order;

  return v_order;
end;
$$;
