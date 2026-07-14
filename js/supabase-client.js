// Supabase 프로젝트 연결. URL/publishable key는 공개 정보(anon 키와 동급, 접근 제어는 RLS가 담당).
const sb = supabase.createClient(
  'https://uokaxaxoieynryqmmtqh.supabase.co',
  'sb_publishable_faHa_MI9rQrp8jcPM_MkEg_eY6U4IbJ'
);
