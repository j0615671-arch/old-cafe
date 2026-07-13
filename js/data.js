// 카테고리 & 기본 메뉴 데이터 (최초 1회 localStorage에 시드로 사용됨)

const CATEGORIES = [
  { id: 'coffee', name: '커피' },
  { id: 'tea', name: '티' },
  { id: 'ade', name: '에이드' },
  { id: 'dessert', name: '디저트' },
];

// ponytail: 실사 이미지는 loremflickr에서 받아 img/menus/에 저장해 고정함(원격 URL은 lock을 걸어도 시간 지나면
// 다른 사진으로 바뀔 수 있어서 로컬로 내려받아 안정화). 이미지 교체 시 img/menus/mN.jpg만 덮어쓰면 됨.
const DEFAULT_MENUS = [
  { id: 'm1', name: '아메리카노', category: 'coffee', price: 4000, image: '/img/menus/m1.jpg', description: '깊고 진한 에스프레소와 물의 조화.', soldOut: false },
  { id: 'm2', name: '카페라떼', category: 'coffee', price: 4500, image: '/img/menus/m2.jpg', description: '부드러운 우유와 에스프레소의 균형.', soldOut: false },
  { id: 'm3', name: '카푸치노', category: 'coffee', price: 4500, image: '/img/menus/m3.jpg', description: '풍성한 우유 거품이 올라간 클래식.', soldOut: false },
  { id: 'm4', name: '바닐라라떼', category: 'coffee', price: 5000, image: '/img/menus/m4.jpg', description: '달콤한 바닐라 시럽이 더해진 라떼.', soldOut: true },
  { id: 'm5', name: '캐모마일 티', category: 'tea', price: 4500, image: '/img/menus/m5.jpg', description: '은은한 꽃향으로 마음을 편안하게.', soldOut: false },
  { id: 'm6', name: '얼그레이 티', category: 'tea', price: 4500, image: '/img/menus/m6.jpg', description: '베르가못 향이 살아있는 홍차.', soldOut: false },
  { id: 'm7', name: '자몽 에이드', category: 'ade', price: 5500, image: '/img/menus/m7.jpg', description: '상큼한 자몽 과육이 가득.', soldOut: false },
  { id: 'm8', name: '레몬 에이드', category: 'ade', price: 5500, image: '/img/menus/m8.jpg', description: '새콤달콤 청량한 여름 음료.', soldOut: false },
  { id: 'm9', name: '치즈 케이크', category: 'dessert', price: 6500, image: '/img/menus/m9.jpg', description: '진한 크림치즈의 부드러운 맛.', soldOut: false },
  { id: 'm10', name: '초코 브라우니', category: 'dessert', price: 5500, image: '/img/menus/m10.jpg', description: '진한 초콜릿이 가득한 촉촉한 브라우니.', soldOut: false },
  { id: 'm11', name: '크루아상', category: 'dessert', price: 4000, image: '/img/menus/m11.jpg', description: '겹겹이 바삭한 프랑스식 페이스트리.', soldOut: false },
  { id: 'm12', name: '콜드브루', category: 'coffee', price: 4800, image: '/img/menus/m12.jpg', description: '저온으로 오래 우려낸 부드러운 커피.', soldOut: false },
];

// 원두 종류 (관리자에서 CRUD 가능, "오늘의 추천 원두"의 원본 데이터)
const DEFAULT_BEANS = [
  { id: 'b1', name: '콜롬비아 수프리모', origin: '콜롬비아', image: '/img/beans/colombia.jpg', note: '부드럽고 균형 잡힌 산미에 은은한 카라멜향.', menuId: 'm1' },
  { id: 'b2', name: '브라질 세하도', origin: '브라질', image: '/img/beans/brazil.jpg', note: '고소하고 묵직한 바디감, 낮은 산미로 우유와 잘 어울림.', menuId: 'm2' },
  { id: 'b3', name: '에티오피아 예가체프', origin: '에티오피아', image: '/img/beans/ethiopia.jpg', note: '화사한 꽃향과 밝은 산미가 특징인 커피의 고향 원두.', menuId: 'm3' },
  { id: 'b4', name: '과테말라 안티구아', origin: '과테말라', image: '/img/beans/guatemala.jpg', note: '초콜릿과 스파이시함이 어우러진 풍부한 풍미.', menuId: 'm4' },
  { id: 'b5', name: '케냐 AA', origin: '케냐', image: '/img/beans/kenya.jpg', note: '진한 베리류의 산미와 와인 같은 풍미가 매력적.', menuId: 'm12' },
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

const ORIGIN_FLAGS = { 콜롬비아: '🇨🇴', 브라질: '🇧🇷', 에티오피아: '🇪🇹', 과테말라: '🇬🇹', 케냐: '🇰🇪' };

