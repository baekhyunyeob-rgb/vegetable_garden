const FARM_CROPS_DB = [{"name":"녹두","cntntsNo":30702,"cat":"식량"},{"name":"들깨","cntntsNo":259524,"cat":"식량"},{"name":"벼 기계이앙재배","cntntsNo":30697,"cat":"식량"},{"name":"벼 직파재배","cntntsNo":30698,"cat":"식량"},{"name":"사료용벼","cntntsNo":259520,"cat":"식량"},{"name":"옥수수","cntntsNo":30709,"cat":"식량"},{"name":"참깨","cntntsNo":30714,"cat":"식량"},{"name":"콩(논재배)","cntntsNo":259521,"cat":"식량"},{"name":"팥","cntntsNo":30716,"cat":"식량"},{"name":"감자","cntntsNo":30699,"cat":"식량"},{"name":"강낭콩","cntntsNo":30700,"cat":"식량"},{"name":"고구마","cntntsNo":30701,"cat":"식량"},{"name":"들깨(잎)","cntntsNo":30607,"cat":"식량"},{"name":"들깨(종실)","cntntsNo":30703,"cat":"식량"},{"name":"땅콩","cntntsNo":30704,"cat":"식량"},{"name":"맥주보리","cntntsNo":30705,"cat":"식량"},{"name":"메밀","cntntsNo":30706,"cat":"식량"},{"name":"밀","cntntsNo":30707,"cat":"식량"},{"name":"수수","cntntsNo":30708,"cat":"식량"},{"name":"완두","cntntsNo":30710,"cat":"식량"},{"name":"유채","cntntsNo":30711,"cat":"식량"},{"name":"일반보리","cntntsNo":30712,"cat":"식량"},{"name":"조","cntntsNo":30713,"cat":"식량"},{"name":"콩","cntntsNo":30715,"cat":"식량"},{"name":"풋콩","cntntsNo":30717,"cat":"식량"},{"name":"느타리버섯","cntntsNo":30733,"cat":"약초버섯"},{"name":"양송이","cntntsNo":30735,"cat":"약초버섯"},{"name":"영지버섯","cntntsNo":30734,"cat":"약초버섯"},{"name":"팽이","cntntsNo":30736,"cat":"약초버섯"},{"name":"구기자","cntntsNo":30739,"cat":"약초버섯"},{"name":"길경(도라지)","cntntsNo":30740,"cat":"약초버섯"},{"name":"더덕(양유)","cntntsNo":30741,"cat":"약초버섯"},{"name":"두충","cntntsNo":30743,"cat":"약초버섯"},{"name":"산약(마)","cntntsNo":30747,"cat":"약초버섯"},{"name":"오미자","cntntsNo":30749,"cat":"약초버섯"},{"name":"천마","cntntsNo":30756,"cat":"약초버섯"},{"name":"황기","cntntsNo":30761,"cat":"약초버섯"},{"name":"가지","cntntsNo":30770,"cat":"채소"},{"name":"갓","cntntsNo":30595,"cat":"채소"},{"name":"결구상추","cntntsNo":30596,"cat":"채소"},{"name":"고들빼기","cntntsNo":30597,"cat":"채소"},{"name":"고사리","cntntsNo":30598,"cat":"채소"},{"name":"고추(꽈리고추 반촉성)","cntntsNo":30599,"cat":"채소"},{"name":"고추(보통재배)","cntntsNo":30600,"cat":"채소"},{"name":"고추(촉성재배)","cntntsNo":30601,"cat":"채소"},{"name":"곰취","cntntsNo":30602,"cat":"채소"},{"name":"근대","cntntsNo":30603,"cat":"채소"},{"name":"냉이","cntntsNo":30604,"cat":"채소"},{"name":"당근","cntntsNo":30605,"cat":"채소"},{"name":"두릅","cntntsNo":30606,"cat":"채소"},{"name":"딸기(사계성여름재배)","cntntsNo":30609,"cat":"채소"},{"name":"딸기(촉성재배)","cntntsNo":30610,"cat":"채소"},{"name":"마늘","cntntsNo":30611,"cat":"채소"},{"name":"마늘(잎마늘)","cntntsNo":30612,"cat":"채소"},{"name":"멜론","cntntsNo":30613,"cat":"채소"},{"name":"무","cntntsNo":30614,"cat":"채소"},{"name":"무(고랭지재배)","cntntsNo":30615,"cat":"채소"},{"name":"미나리","cntntsNo":30616,"cat":"채소"},{"name":"배추","cntntsNo":30618,"cat":"채소"},{"name":"배추(고랭지재배)","cntntsNo":30619,"cat":"채소"},{"name":"부추","cntntsNo":30620,"cat":"채소"},{"name":"브로콜리(녹색꽃양배추 고랭지재배)","cntntsNo":30621,"cat":"채소"},{"name":"브로콜리(평야지재배)","cntntsNo":30622,"cat":"채소"},{"name":"비트","cntntsNo":30623,"cat":"채소"},{"name":"상추","cntntsNo":30624,"cat":"채소"},{"name":"생강","cntntsNo":30625,"cat":"채소"},{"name":"셀러리(양미나리)","cntntsNo":30626,"cat":"채소"},{"name":"수박","cntntsNo":30627,"cat":"채소"},{"name":"시금치","cntntsNo":30628,"cat":"채소"},{"name":"신선초","cntntsNo":30629,"cat":"채소"},{"name":"쑥갓","cntntsNo":30630,"cat":"채소"},{"name":"아스파라거스","cntntsNo":30632,"cat":"채소"},{"name":"아욱","cntntsNo":30631,"cat":"채소"},{"name":"양배추","cntntsNo":30634,"cat":"채소"},{"name":"양파","cntntsNo":30633,"cat":"채소"},{"name":"연근","cntntsNo":30635,"cat":"채소"},{"name":"오이","cntntsNo":30636,"cat":"채소"},{"name":"적채","cntntsNo":30638,"cat":"채소"},{"name":"쪽파","cntntsNo":30639,"cat":"채소"},{"name":"참외","cntntsNo":30640,"cat":"채소"},{"name":"참취","cntntsNo":30641,"cat":"채소"},{"name":"청경채","cntntsNo":30643,"cat":"채소"},{"name":"치커리(쌈용, 잎치커리)","cntntsNo":258609,"cat":"채소"},{"name":"치커리(치콘,뿌리치커리)","cntntsNo":30644,"cat":"채소"},{"name":"컬리플라워(백색꽃양배추 고랭지재배)","cntntsNo":258607,"cat":"채소"},{"name":"토란","cntntsNo":30645,"cat":"채소"},{"name":"토마토,방울토마토","cntntsNo":30646,"cat":"채소"},{"name":"파","cntntsNo":30647,"cat":"채소"},{"name":"파드득나물","cntntsNo":258611,"cat":"채소"},{"name":"파슬리(향미나리)","cntntsNo":258608,"cat":"채소"},{"name":"파프리카","cntntsNo":30649,"cat":"채소"},{"name":"피망","cntntsNo":30650,"cat":"채소"},{"name":"호박","cntntsNo":30651,"cat":"채소"},{"name":"호박(늙은호박)","cntntsNo":30652,"cat":"채소"},{"name":"호박(단호박)","cntntsNo":30653,"cat":"채소"},{"name":"감귤(노지재배)","cntntsNo":30654,"cat":"과수"},{"name":"감귤(시설재배)","cntntsNo":30655,"cat":"과수"},{"name":"단감","cntntsNo":30656,"cat":"과수"},{"name":"매실","cntntsNo":30658,"cat":"과수"},{"name":"무화과(노지재배)","cntntsNo":30659,"cat":"과수"},{"name":"무화과(무가온 시설재배)","cntntsNo":30660,"cat":"과수"},{"name":"배","cntntsNo":30661,"cat":"과수"},{"name":"복숭아","cntntsNo":30662,"cat":"과수"},{"name":"블루베리","cntntsNo":258549,"cat":"과수"},{"name":"사과","cntntsNo":30663,"cat":"과수"},{"name":"살구","cntntsNo":30664,"cat":"과수"},{"name":"양앵두(체리)","cntntsNo":30665,"cat":"과수"},{"name":"유자","cntntsNo":30666,"cat":"과수"},{"name":"자두","cntntsNo":30667,"cat":"과수"},{"name":"참다래","cntntsNo":30668,"cat":"과수"},{"name":"포도(무가온)","cntntsNo":30669,"cat":"과수"},{"name":"포도(표준가온)","cntntsNo":258613,"cat":"과수"},{"name":"플럼코트","cntntsNo":258633,"cat":"과수"},{"name":"한라봉(부지화)","cntntsNo":30670,"cat":"과수"},{"name":"거베라","cntntsNo":30671,"cat":"화훼"},{"name":"국화","cntntsNo":30672,"cat":"화훼"},{"name":"글라디올러스","cntntsNo":30673,"cat":"화훼"},{"name":"금어초","cntntsNo":30674,"cat":"화훼"},{"name":"꽃도라지","cntntsNo":30675,"cat":"화훼"},{"name":"꽃해바라기","cntntsNo":30676,"cat":"화훼"},{"name":"덴드로비움","cntntsNo":30677,"cat":"화훼"},{"name":"산호수","cntntsNo":30678,"cat":"화훼"},{"name":"선인장","cntntsNo":30679,"cat":"화훼"},{"name":"수국","cntntsNo":30680,"cat":"화훼"},{"name":"스타티스","cntntsNo":30681,"cat":"화훼"},{"name":"시클라멘","cntntsNo":30682,"cat":"화훼"},{"name":"심비디움","cntntsNo":30683,"cat":"화훼"},{"name":"아이리스","cntntsNo":30684,"cat":"화훼"},{"name":"안개초","cntntsNo":30685,"cat":"화훼"},{"name":"오리엔탈나리(촉성재배)","cntntsNo":30686,"cat":"화훼"},{"name":"온시디움","cntntsNo":30687,"cat":"화훼"},{"name":"장미","cntntsNo":30688,"cat":"화훼"},{"name":"철쭉","cntntsNo":30689,"cat":"화훼"},{"name":"카네이션","cntntsNo":30690,"cat":"화훼"},{"name":"칼라","cntntsNo":30691,"cat":"화훼"},{"name":"칼랑코에","cntntsNo":30692,"cat":"화훼"},{"name":"튤립","cntntsNo":30693,"cat":"화훼"},{"name":"팔레놉시스","cntntsNo":30694,"cat":"화훼"},{"name":"포인세티아","cntntsNo":30695,"cat":"화훼"},{"name":"프리지아","cntntsNo":30696,"cat":"화훼"},{"name":"꿀벌","cntntsNo":30720,"cat":"축산"},{"name":"돼지(번식)","cntntsNo":30721,"cat":"축산"},{"name":"돼지(비육)","cntntsNo":258522,"cat":"축산"},{"name":"말","cntntsNo":258523,"cat":"축산"},{"name":"번식한우","cntntsNo":30729,"cat":"축산"},{"name":"번식흑염소","cntntsNo":258635,"cat":"축산"},{"name":"비육한우","cntntsNo":30730,"cat":"축산"},{"name":"비육흑염소","cntntsNo":30732,"cat":"축산"},{"name":"사슴","cntntsNo":258634,"cat":"축산"},{"name":"산란계","cntntsNo":30724,"cat":"축산"},{"name":"오리","cntntsNo":30725,"cat":"축산"},{"name":"육계","cntntsNo":30726,"cat":"축산"},{"name":"젖소(착유우)","cntntsNo":30727,"cat":"축산"},{"name":"토종닭","cntntsNo":30773,"cat":"축산"},{"name":"담근먹이 옥수수","cntntsNo":30763,"cat":"사료작물"},{"name":"동계 사료작물(곤포담근먹이)","cntntsNo":258480,"cat":"사료작물"},{"name":"동하계 사료작물 작부체계","cntntsNo":258612,"cat":"사료작물"},{"name":"볏짚(곤포담근먹이)","cntntsNo":258753,"cat":"사료작물"},{"name":"사료용 귀리","cntntsNo":258524,"cat":"사료작물"},{"name":"사료용 벼(총체벼)","cntntsNo":258525,"cat":"사료작물"},{"name":"사료용 보리(청보리)","cntntsNo":258526,"cat":"사료작물"},{"name":"사료용 호밀","cntntsNo":258527,"cat":"사료작물"},{"name":"수수,수단그라스 교잡종","cntntsNo":258528,"cat":"사료작물"},{"name":"이탈리안라이그라스","cntntsNo":30765,"cat":"사료작물"},{"name":"초지","cntntsNo":30766,"cat":"사료작물"},{"name":"트리티케일","cntntsNo":258529,"cat":"사료작물"}];

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
