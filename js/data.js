// ── 앱 상태 ────────────────────────────────────────
const STATE = {
  currentTab: 'my-farm',
  farm: {           // 내 텃밭 데이터
    lands: [],      // [{jibun, jimok}]
    crops: [],      // [{jibun, category, name, area, unit}]
    pendingCrops: [], // 현재 입력 중인 작물 (임시)
    currentParcel: null, // 현재 조회된 필지 정보
  },
  calendar: {       // 농작업 데이터
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    works: {},      // {'YYYY-MM-DD': [{cropName, workType, detail, weather}]}
  },
};

// ── 작물 분류 ───────────────────────────────────────
const CROP_CATEGORIES = [
  {
    id: 'rice', label: '수도작', badgeClass: 'badge-rice',
    crops: ['벼', '찹쌀', '흑미', '밭벼'],
  },
  {
    id: 'veg', label: '채소', badgeClass: 'badge-veg',
    crops: ['고추', '배추', '마늘', '양파', '콩', '감자', '고구마', '상추', '참깨', '들깨', '오이', '토마토', '호박', '당근', '무'],
  },
  {
    id: 'tree', label: '수목', badgeClass: 'badge-tree',
    crops: ['감귤', '배', '사과', '복숭아', '유자', '밤나무', '대추', '모과', '감나무', '키위'],
  },
  {
    id: 'flower', label: '화훼·특용', badgeClass: 'badge-flower',
    crops: ['국화', '장미', '모시풀', '인삼', '황기', '당귀'],
  },
  {
    id: 'herb', label: '산채·약초', badgeClass: 'badge-herb',
    crops: ['고사리', '두릅', '도라지', '더덕', '취나물', '참나물', '산마늘'],
  },
];

// ── 작업 종류 ───────────────────────────────────────
const WORK_TYPES = ['파종', '정식', '시비', '방제', '관수', '제초', '수확', '기타'];

// ── localStorage 저장/불러오기 ──────────────────────
function saveState() {
  localStorage.setItem('farming_farm', JSON.stringify(STATE.farm));
  localStorage.setItem('farming_calendar', JSON.stringify(STATE.calendar));
}

function loadState() {
  try {
    const farm = localStorage.getItem('farming_farm');
    const cal  = localStorage.getItem('farming_calendar');
    if (farm) STATE.farm = JSON.parse(farm);
    if (cal)  STATE.calendar = JSON.parse(cal);
  } catch(e) {
    console.warn('상태 불러오기 실패', e);
  }
}

// ── 유틸 ───────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${m}.${d}`;
}

function getCropBadgeClass(cropName) {
  for (const cat of CROP_CATEGORIES) {
    if (cat.crops.includes(cropName)) return cat.badgeClass;
  }
  return 'badge-veg';
}

function sqmToPyeong(sqm) {
  return Math.round(sqm / 3.305785);
}
