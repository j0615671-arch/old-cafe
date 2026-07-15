// 카카오페이 결제 준비를 서버(Edge Function)에서만 처리.
// REST API 키가 브라우저에 절대 노출되지 않도록 이 함수 안에서만 사용함.
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
    const { amount, origin } = await req.json();
    if (!amount || !origin) return json({ error: '필수 값이 누락되었습니다.' }, 400);

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: '로그인이 필요합니다.' }, 401);

    const orderId = `kakao-${crypto.randomUUID()}`;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await admin.from('payments').insert({
      customer_id: user.id,
      order_id: orderId,
      amount,
      status: 'pending',
      provider: 'kakaopay',
    });

    const form = new URLSearchParams({
      cid: 'TC0ONETIME',
      partner_order_id: orderId,
      partner_user_id: user.id,
      item_name: '마일리지 충전',
      quantity: '1',
      total_amount: String(amount),
      tax_free_amount: '0',
      approval_url: `${origin}/mileage/kakao-success?orderId=${orderId}`,
      cancel_url: `${origin}/mileage/fail?message=${encodeURIComponent('결제를 취소했어요.')}`,
      fail_url: `${origin}/mileage/fail?message=${encodeURIComponent('결제에 실패했어요.')}`,
    });

    const kakaoRes = await fetch('https://kapi.kakao.com/v1/payment/ready', {
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
      return json({ error: kakaoData.msg || '카카오페이 결제 준비에 실패했습니다.' }, 400);
    }

    await admin.from('payments').update({ tid: kakaoData.tid }).eq('order_id', orderId);

    return json({ orderId, redirectUrl: kakaoData.next_redirect_pc_url });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
