// 카카오페이 결제 승인을 서버(Edge Function)에서만 처리.
// 승인 금액은 결제 준비 때 저장해둔 서버측 기록을 사용하며, 클라이언트가 보낸 값을 믿지 않음.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const KAKAO_REST_API_KEY = Deno.env.get('KAKAO_REST_API_KEY') ?? '';
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
    const { orderId, pgToken } = await req.json();
    if (!orderId || !pgToken) return json({ error: '필수 값이 누락되었습니다.' }, 400);

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: '로그인이 필요합니다.' }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: pending, error: pendingErr } = await admin
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('customer_id', user.id)
      .single();

    if (pendingErr || !pending) return json({ error: '결제 요청 기록을 찾을 수 없습니다.' }, 404);
    if (pending.status === 'confirmed') return json({ success: true, alreadyConfirmed: true });

    const form = new URLSearchParams({
      cid: 'TC0ONETIME',
      tid: pending.tid,
      partner_order_id: orderId,
      partner_user_id: user.id,
      pg_token: pgToken,
    });

    const kakaoRes = await fetch('https://kapi.kakao.com/v1/payment/approve', {
      method: 'POST',
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
    const kakaoData = await kakaoRes.json();

    if (!kakaoRes.ok) {
      await admin.from('payments').update({ status: 'failed' }).eq('order_id', orderId);
      return json({ error: kakaoData.msg || '결제 승인에 실패했습니다.' }, 400);
    }

    await admin.from('payments').update({ status: 'confirmed' }).eq('order_id', orderId);
    const { data: profile } = await admin.from('profiles').select('mileage_balance').eq('id', user.id).single();
    const newBalance = (profile?.mileage_balance ?? 0) + pending.amount;
    await admin.from('profiles').update({ mileage_balance: newBalance }).eq('id', user.id);

    return json({ success: true, mileageBalance: newBalance });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
