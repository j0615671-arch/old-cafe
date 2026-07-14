// 카테고리 & 앱 설정 데이터 (메뉴/원두/주문/회원은 Supabase DB가 원본, js/utils.js 참고)

const CATEGORIES = [
  { id: 'coffee', name: '커피' },
  { id: 'tea', name: '티' },
  { id: 'ade', name: '에이드' },
  { id: 'dessert', name: '디저트' },
];

const ORDER_STATUSES = ['접수완료', '제조중', '제조완료', '픽업완료'];

// 카테고리별로 어떤 주문 옵션을 보여줄지 (디저트는 옵션 없음)
const MENU_OPTIONS = {
  coffee: { size: true, temperature: true, shot: true, syrup: true, bean: true },
  tea: { size: true, temperature: true },
  ade: { size: true },
};

const SIZE_OPTIONS = [
  { id: 'tall', name: '톨', priceDelta: 0 },
  { id: 'medium', name: '미디움', priceDelta: 500 },
  { id: 'large', name: '라지', priceDelta: 1000 },
];
const TEMPERATURE_OPTIONS = [
  { id: 'hot', name: 'HOT' },
  { id: 'ice', name: 'ICE' },
];
const SHOT_PRICE = 500;
const SYRUP_PRICE = 500;

const ORIGIN_FLAGS = { 콜롬비아: '🇨🇴', 브라질: '🇧🇷', 에티오피아: '🇪🇹', 과테말라: '🇬🇹', 케냐: '🇰🇪' };

// 도장 쿠폰: 주문 횟수 기반, 이 개수를 채우면 매장에서 무료 음료로 교환(실물 쿠폰처럼 직원 확인 방식이라 별도 사용 처리 로직 없음)
const STAMP_GOAL = 10;

