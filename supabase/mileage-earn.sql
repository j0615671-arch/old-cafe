-- 일반 주문 시 결제 금액의 5%를 마일리지로 자동 적립
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.
-- 적립률(0.05)은 js/data.js의 MILEAGE_EARN_RATE와 값을 맞춰야 해요.

create or replace function public.create_order_and_earn_mileage(p_items jsonb, p_total integer)
returns public.orders
language plpgsql security definer as $$
declare
  v_earn integer;
  v_order public.orders;
begin
  v_earn := round(p_total * 0.05);

  insert into public.orders (customer_id, items, total, status, payment_method)
  values (auth.uid(), p_items, p_total, '접수완료', 'card')
  returning * into v_order;

  update public.profiles set mileage_balance = mileage_balance + v_earn where id = auth.uid();

  return v_order;
end;
$$;
