// 토스페이먼츠 결제 승인을 서버(Edge Function)에서만 처리.
// 시크릿 키가 브라우저에 절대 노출되지 않도록 이 함수 안에서만 사용함.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const { orderId, paymentKey, amount } = await req.json();
    if (!orderId || !paymentKey || !amount) return json({ error: '필수 값이 누락되었습니다.' }, 400);

    // 1. 요청자 신원 확인 (프론트에서 보낸 로그인 토큰 검증)
    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: '로그인이 필요합니다.' }, 401);

    // 2. 서버 권한(service role)으로 결제 대기 기록 조회 — 클라이언트가 보낸 금액을 그대로 믿지 않음
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: pending, error: pendingErr } = await admin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (pendingErr || !pending) return json({ error: '결제 요청 기록을 찾을 수 없습니다.' }, 404);
    if (pending.status === 'confirmed') return json({ success: true, alreadyConfirmed: true });
    if (pending.amount !== amount) return json({ error: '결제 금액이 일치하지 않습니다.' }, 400);

    // 3. 토스페이먼츠 결제 승인 API 호출 (시크릿 키는 여기서만 사용)
    const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${TOSS_SECRET_KEY}:`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });
    const tossData = await tossRes.json();

    if (!tossRes.ok) {
      await admin.from('payments').update({ status: 'failed' }).eq('order_id', orderId);
      return json({ error: tossData.message || '결제 승인에 실패했습니다.' }, 400);
    }

    // 4. 승인 성공 → 결제 상태 갱신 + 마일리지 적립
    await admin.from('payments').update({ status: 'confirmed' }).eq('order_id', orderId);
    const { data: profile } = await admin.from('profiles').select('mileage_balance').eq('id', user.id).single();
    const newBalance = (profile?.mileage_balance ?? 0) + amount;
    await admin.from('profiles').update({ mileage_balance: newBalance }).eq('id', user.id);

    return json({ success: true, mileageBalance: newBalance });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
