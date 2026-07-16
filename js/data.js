// 카테고리 & 앱 설정 데이터 (메뉴/원두/주문/회원은 Supabase DB가 원본, js/utils.js 참고)

const CATEGORIES = [
  { id: 'coffee', name: '커피' },
  { id: 'tea', name: '티' },
  { id: 'ade', name: '에이드' },
  { id: 'dessert', name: '디저트' },
];

const ORDER_STATUSES = ['접수완료', '제조중', '제조완료', '픽업완료'];

// 다음 단계로 넘기는 버튼 문구 (관리자 화면)
const STATUS_NEXT_ACTION = { 접수완료: '제조 시작', 제조중: '제조완료 처리', 제조완료: '픽업완료 처리' };

// 지금 상태를 손님에게 보여줄 때 쓰는 문구 (고객 화면)
const STATUS_FRIENDLY_MESSAGE = {
  접수완료: '주문을 접수했어요',
  제조중: '지금 만들고 있어요',
  제조완료: '픽업할 준비가 됐어요',
  픽업완료: '픽업이 완료됐어요',
};

// 카테고리별로 어떤 주문 옵션을 보여줄지 (디저트는 옵션 없음)
const MENU_OPTIONS = {
  coffee: { size: true, temperature: true, shot: true, syrup: true, bean: true },
  tea: { size: true, temperature: true },
  ade: { size: true },
};

// 매장/포장은 카테고리 상관없이 모든 메뉴에 공통으로 붙는 선택지
const ORDER_TYPE_OPTIONS = [
  { id: 'takeout', name: '포장' },
  { id: 'dinein', name: '매장' },
];

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

// 일반 주문 시 결제 금액의 이만큼을 마일리지로 적립 (마일리지 결제·도장 리워드 주문은 적립 제외)
const MILEAGE_EARN_RATE = 0.05;

// 구독 회원 할인율 (구독 중이면 주문 금액에서 이만큼 할인)
const SUBSCRIPTION_DISCOUNT_RATE = 0.1;

