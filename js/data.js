// 카테고리 & 기본 메뉴 데이터 (최초 1회 localStorage에 시드로 사용됨)

const CATEGORIES = [
  { id: 'coffee', name: '커피' },
  { id: 'tea', name: '티' },
  { id: 'ade', name: '에이드' },
  { id: 'dessert', name: '디저트' },
];

// ponytail: 실사 이미지는 loremflickr(키워드 기반 실제 사진, lock=고정 시드)로 대체. 자체 자산/CDN 붙이면 image 필드만 교체.
const DEFAULT_MENUS = [
  { id: 'm1', name: '아메리카노', category: 'coffee', price: 4000, image: 'https://loremflickr.com/320/320/black-coffee,cup?lock=102', description: '깊고 진한 에스프레소와 물의 조화.', soldOut: false },
  { id: 'm2', name: '카페라떼', category: 'coffee', price: 4500, image: 'https://loremflickr.com/320/320/latte,coffee?lock=2', description: '부드러운 우유와 에스프레소의 균형.', soldOut: false },
  { id: 'm3', name: '카푸치노', category: 'coffee', price: 4500, image: 'https://loremflickr.com/320/320/cappuccino?lock=3', description: '풍성한 우유 거품이 올라간 클래식.', soldOut: false },
  { id: 'm4', name: '바닐라라떼', category: 'coffee', price: 5000, image: 'https://loremflickr.com/320/320/vanilla,latte?lock=104', description: '달콤한 바닐라 시럽이 더해진 라떼.', soldOut: true },
  { id: 'm5', name: '캐모마일 티', category: 'tea', price: 4500, image: 'https://loremflickr.com/320/320/herbal-tea?lock=107', description: '은은한 꽃향으로 마음을 편안하게.', soldOut: false },
  { id: 'm6', name: '얼그레이 티', category: 'tea', price: 4500, image: 'https://loremflickr.com/320/320/blacktea,cup?lock=108', description: '베르가못 향이 살아있는 홍차.', soldOut: false },
  { id: 'm7', name: '자몽 에이드', category: 'ade', price: 5500, image: 'https://loremflickr.com/320/320/grapefruit,drink?lock=110', description: '상큼한 자몽 과육이 가득.', soldOut: false },
  { id: 'm8', name: '레몬 에이드', category: 'ade', price: 5500, image: 'https://loremflickr.com/320/320/lemon,glass?lock=220', description: '새콤달콤 청량한 여름 음료.', soldOut: false },
  { id: 'm9', name: '치즈 케이크', category: 'dessert', price: 6500, image: 'https://loremflickr.com/320/320/cheesecake?lock=9', description: '진한 크림치즈의 부드러운 맛.', soldOut: false },
  { id: 'm10', name: '초코 브라우니', category: 'dessert', price: 5500, image: 'https://loremflickr.com/320/320/brownie,chocolate?lock=10', description: '진한 초콜릿이 가득한 촉촉한 브라우니.', soldOut: false },
  { id: 'm11', name: '크루아상', category: 'dessert', price: 4000, image: 'https://loremflickr.com/320/320/croissant,bakery?lock=115', description: '겹겹이 바삭한 프랑스식 페이스트리.', soldOut: false },
  { id: 'm12', name: '콜드브루', category: 'coffee', price: 4800, image: 'https://loremflickr.com/320/320/coldbrew,coffee?lock=12', description: '저온으로 오래 우려낸 부드러운 커피.', soldOut: false },
];

const ORDER_STATUSES = ['접수완료', '제조중', '제조완료', '픽업완료'];

// 카테고리별로 어떤 주문 옵션을 보여줄지 (디저트는 옵션 없음)
const MENU_OPTIONS = {
  coffee: { size: true, temperature: true, shot: true, syrup: true },
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

