-- 카카오페이 마일리지 충전 연동
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 안전합니다.

alter table public.payments add column if not exists provider text not null default 'toss';
alter table public.payments add column if not exists tid text;
