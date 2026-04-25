// ══════════════════════════════════════════════
// data.js — 슬기로운 텃밭 생활
// 앱 상태 · 작물 DB · 내장 재배력
// ══════════════════════════════════════════════

// ── 텃밭 주요 작물 DB ──────────────────────────
// 중부지방 기준. 봄/가을 모두 가능한 작물은 두 항목으로 분리.
const GARDEN_CROPS = [
  // 봄 작물
  { name: '고추',         season: '봄',  icon: '🌶' },
  { name: '토마토',       season: '봄',  icon: '🍅' },
  { name: '방울토마토',   season: '봄',  icon: '🍅' },
  { name: '오이',         season: '봄',  icon: '🥒' },
  { name: '가지',         season: '봄',  icon: '🍆' },
  { name: '호박',         season: '봄',  icon: '🎃' },
  { name: '단호박',       season: '봄',  icon: '🎃' },
  { name: '수박',         season: '봄',  icon: '🍉' },
  { name: '참외',         season: '봄',  icon: '🍈' },
  { name: '고구마',       season: '봄',  icon: '🍠' },
  { name: '옥수수',       season: '봄',  icon: '🌽' },
  { name: '콩',           season: '봄',  icon: '🫘' },
  { name: '강낭콩',       season: '봄',  icon: '🫘' },
  { name: '들깨',         season: '봄',  icon: '🌿' },
  { name: '참깨',         season: '봄',  icon: '🌿' },
  { name: '생강',         season: '봄',  icon: '🌱' },
  { name: '토란',         season: '봄',  icon: '🌱' },
  { name: '감자(봄)',     season: '봄',  icon: '🥔' },
  { name: '상추(봄)',     season: '봄',  icon: '🥬' },
  { name: '열무(봄)',     season: '봄',  icon: '🥬' },
  { name: '시금치(봄)',   season: '봄',  icon: '🥬' },
  { name: '당근(봄)',     season: '봄',  icon: '🥕' },
  { name: '쑥갓(봄)',     season: '봄',  icon: '🌿' },
  { name: '아욱(봄)',     season: '봄',  icon: '🌿' },
  { name: '근대(봄)',     season: '봄',  icon: '🌿' },
  { name: '청경채(봄)',   season: '봄',  icon: '🥬' },
  { name: '브로콜리(봄)', season: '봄',  icon: '🥦' },
  { name: '양배추(봄)',   season: '봄',  icon: '🥬' },
  // 가을 작물
  { name: '배추',         season: '가을', icon: '🥬' },
  { name: '무',           season: '가을', icon: '🌱' },
  { name: '갓',           season: '가을', icon: '🌿' },
  { name: '쪽파',         season: '가을', icon: '🧅' },
  { name: '대파',         season: '가을', icon: '🧅' },
  { name: '마늘',         season: '가을', icon: '🧄' },
  { name: '양파',         season: '가을', icon: '🧅' },
  { name: '감자(가을)',   season: '가을', icon: '🥔' },
  { name: '상추(가을)',   season: '가을', icon: '🥬' },
  { name: '열무(가을)',   season: '가을', icon: '🥬' },
  { name: '시금치(가을)', season: '가을', icon: '🥬' },
  { name: '당근(가을)',   season: '가을', icon: '🥕' },
  { name: '쑥갓(가을)',   season: '가을', icon: '🌿' },
  { name: '아욱(가을)',   season: '가을', icon: '🌿' },
  { name: '근대(가을)',   season: '가을', icon: '🌿' },
  { name: '청경채(가을)', season: '가을', icon: '🥬' },
  { name: '브로콜리(가을)',season: '가을', icon: '🥦' },
  { name: '양배추(가을)', season: '가을', icon: '🥬' },
];

// ── 내장 재배력 ────────────────────────────────
// 출처: 농촌진흥청 농사로 텃밭가꾸기 재배캘린더 (중부지방 기준)
// https://nongsaro.go.kr > 생활문화 > 텃밭가꾸기 > 텃밭작물 재배캘린더
// 순: 상(1~10일) · 중(11~20일) · 하(21~말일)
const CROP_CALENDAR = {
  '고추':           { tasks: [{ name:'정식',      start:'5-상', end:'5-중'  },
                              { name:'웃거름',    start:'6-중', end:'7-중'  },
                              { name:'수확',      start:'7-상', end:'10-중' }]},
  '토마토':         { tasks: [{ name:'정식',      start:'5-상', end:'5-중'  },
                              { name:'곁순제거',  start:'5-하', end:'8-중'  },
                              { name:'수확',      start:'7-상', end:'9-중'  }]},
  '방울토마토':     { tasks: [{ name:'정식',      start:'5-상', end:'5-중'  },
                              { name:'곁순제거',  start:'5-하', end:'8-중'  },
                              { name:'수확',      start:'6-하', end:'9-중'  }]},
  '오이':           { tasks: [{ name:'정식',      start:'5-상', end:'5-중'  },
                              { name:'유인',      start:'5-하', end:'7-중'  },
                              { name:'수확',      start:'6-중', end:'8-중'  }]},
  '가지':           { tasks: [{ name:'정식',      start:'5-상', end:'5-중'  },
                              { name:'웃거름',    start:'6-중', end:'8-상'  },
                              { name:'수확',      start:'7-상', end:'10-상' }]},
  '호박':           { tasks: [{ name:'정식',      start:'4-하', end:'5-중'  },
                              { name:'유인',      start:'5-중', end:'7-상'  },
                              { name:'수확',      start:'6-하', end:'9-중'  }]},
  '단호박':         { tasks: [{ name:'정식',      start:'4-하', end:'5-중'  },
                              { name:'수확',      start:'7-상', end:'8-중'  }]},
  '수박':           { tasks: [{ name:'정식',      start:'5-중', end:'5-하'  },
                              { name:'수확',      start:'7-하', end:'8-중'  }]},
  '참외':           { tasks: [{ name:'정식',      start:'5-중', end:'5-하'  },
                              { name:'수확',      start:'7-중', end:'8-중'  }]},
  '고구마':         { tasks: [{ name:'순심기',    start:'5-중', end:'6-상'  },
                              { name:'덩굴뒤집기',start:'7-중', end:'8-중'  },
                              { name:'수확',      start:'9-중', end:'10-상' }]},
  '옥수수':         { tasks: [{ name:'파종',      start:'4-하', end:'5-중'  },
                              { name:'솎음',      start:'5-하', end:'6-상'  },
                              { name:'수확',      start:'7-중', end:'8-상'  }]},
  '콩':             { tasks: [{ name:'파종',      start:'5-중', end:'6-상'  },
                              { name:'북주기',    start:'6-하', end:'7-상'  },
                              { name:'수확',      start:'9-상', end:'10-상' }]},
  '강낭콩':         { tasks: [{ name:'파종',      start:'4-하', end:'5-중'  },
                              { name:'수확',      start:'6-하', end:'7-중'  }]},
  '들깨':           { tasks: [{ name:'정식',      start:'5-중', end:'6-상'  },
                              { name:'잎수확',    start:'6-하', end:'9-상'  },
                              { name:'종실수확',  start:'9-중', end:'10-중' }]},
  '참깨':           { tasks: [{ name:'파종',      start:'5-중', end:'5-하'  },
                              { name:'수확',      start:'8-중', end:'9-상'  }]},
  '생강':           { tasks: [{ name:'파종',      start:'5-상', end:'5-중'  },
                              { name:'수확',      start:'10-중',end:'11-상' }]},
  '토란':           { tasks: [{ name:'파종',      start:'4-중', end:'5-상'  },
                              { name:'수확',      start:'10-상',end:'10-하' }]},
  '감자(봄)':       { tasks: [{ name:'파종',      start:'3-하', end:'4-상'  },
                              { name:'북주기',    start:'5-상', end:'5-중'  },
                              { name:'수확',      start:'6-상', end:'6-하'  }]},
  '상추(봄)':       { tasks: [{ name:'파종·정식', start:'3-중', end:'4-중'  },
                              { name:'수확',      start:'4-하', end:'6-중'  }]},
  '열무(봄)':       { tasks: [{ name:'파종',      start:'3-중', end:'5-상'  },
                              { name:'수확',      start:'4-하', end:'6-상'  }]},
  '시금치(봄)':     { tasks: [{ name:'파종',      start:'3-상', end:'4-상'  },
                              { name:'수확',      start:'4-중', end:'5-중'  }]},
  '당근(봄)':       { tasks: [{ name:'파종',      start:'4-중', end:'5-중'  },
                              { name:'솎음',      start:'5-하', end:'6-상'  },
                              { name:'수확',      start:'7-중', end:'8-중'  }]},
  '쑥갓(봄)':       { tasks: [{ name:'파종',      start:'3-하', end:'5-상'  },
                              { name:'수확',      start:'4-하', end:'6-상'  }]},
  '아욱(봄)':       { tasks: [{ name:'파종',      start:'4-상', end:'5-상'  },
                              { name:'수확',      start:'5-중', end:'6-중'  }]},
  '근대(봄)':       { tasks: [{ name:'파종',      start:'4-상', end:'5-상'  },
                              { name:'수확',      start:'5-중', end:'7-상'  }]},
  '청경채(봄)':     { tasks: [{ name:'파종',      start:'4-상', end:'5-상'  },
                              { name:'수확',      start:'5-상', end:'6-상'  }]},
  '브로콜리(봄)':   { tasks: [{ name:'정식',      start:'4-상', end:'4-중'  },
                              { name:'수확',      start:'5-하', end:'6-하'  }]},
  '양배추(봄)':     { tasks: [{ name:'정식',      start:'3-중', end:'4-상'  },
                              { name:'수확',      start:'5-중', end:'6-중'  }]},
  // 가을
  '배추':           { tasks: [{ name:'모종심기',  start:'8-하', end:'9-상'  },
                              { name:'웃거름',    start:'9-중', end:'9-하'  },
                              { name:'수확',      start:'11-상',end:'11-하' }]},
  '무':             { tasks: [{ name:'파종',      start:'8-하', end:'9-상'  },
                              { name:'솎음',      start:'9-중', end:'9-하'  },
                              { name:'수확',      start:'11-상',end:'11-하' }]},
  '갓':             { tasks: [{ name:'파종',      start:'8-하', end:'9-중'  },
                              { name:'수확',      start:'10-중',end:'11-중' }]},
  '쪽파':           { tasks: [{ name:'심기',      start:'8-하', end:'9-중'  },
                              { name:'수확',      start:'10-하',end:'11-중' }]},
  '대파':           { tasks: [{ name:'정식',      start:'9-상', end:'9-중'  },
                              { name:'수확',      start:'11-상',end:'11-하' }]},
  '마늘':           { tasks: [{ name:'파종',      start:'9-하', end:'10-중' },
                              { name:'웃거름',    start:'다음해3월', end:'다음해4월'},
                              { name:'수확',      start:'다음해6상', end:'다음해6중'}]},
  '양파':           { tasks: [{ name:'정식',      start:'10-상',end:'10-중' },
                              { name:'웃거름',    start:'다음해3월', end:'다음해4월'},
                              { name:'수확',      start:'다음해6중', end:'다음해6하'}]},
  '감자(가을)':     { tasks: [{ name:'파종',      start:'7-하', end:'8-상'  },
                              { name:'수확',      start:'10-하',end:'11-하' }]},
  '상추(가을)':     { tasks: [{ name:'파종·정식', start:'8-중', end:'9-상'  },
                              { name:'수확',      start:'9-하', end:'10-하' }]},
  '열무(가을)':     { tasks: [{ name:'파종',      start:'8-상', end:'9-상'  },
                              { name:'수확',      start:'9-상', end:'10-상' }]},
  '시금치(가을)':   { tasks: [{ name:'파종',      start:'9-상', end:'10-상' },
                              { name:'수확',      start:'10-중',end:'11-중' }]},
  '당근(가을)':     { tasks: [{ name:'파종',      start:'7-중', end:'8-중'  },
                              { name:'솎음',      start:'8-하', end:'9-상'  },
                              { name:'수확',      start:'10-중',end:'11-중' }]},
  '쑥갓(가을)':     { tasks: [{ name:'파종',      start:'8-하', end:'9-중'  },
                              { name:'수확',      start:'9-하', end:'10-하' }]},
  '아욱(가을)':     { tasks: [{ name:'파종',      start:'8-중', end:'9-상'  },
                              { name:'수확',      start:'9-중', end:'10-중' }]},
  '근대(가을)':     { tasks: [{ name:'파종',      start:'8-중', end:'9-상'  },
                              { name:'수확',      start:'9-하', end:'10-하' }]},
  '청경채(가을)':   { tasks: [{ name:'파종',      start:'8-하', end:'9-중'  },
                              { name:'수확',      start:'9-하', end:'10-중' }]},
  '브로콜리(가을)': { tasks: [{ name:'정식',      start:'8-중', end:'9-상'  },
                              { name:'수확',      start:'10-하',end:'11-하' }]},
  '양배추(가을)':   { tasks: [{ name:'정식',      start:'8-중', end:'9-상'  },
                              { name:'수확',      start:'11-상',end:'11-하' }]},
};

// ── 앱 상태 ────────────────────────────────────
const STATE = {
  currentTab: 'my-farm',
  farm: {
    lands:        [],   // [{ jibun, jimok, areaSqm, areaPyeong, pnu }]
    crops:        [],   // [{ jibun, name, season, area, unit }]
    pendingCrops: [],
    currentParcel: null,
  },
  journal: {
    entries: {},        // { 'YYYY-MM-DD': [{ cropName, task, note, weather }] }
  },
};

const WORK_TYPES = ['파종','정식','시비','방제','관수','제초','수확',
                    '곁순제거','유인','솎음','북주기','기타'];

// ── localStorage ───────────────────────────────
function saveState() {
  localStorage.setItem('tg_farm',    JSON.stringify(STATE.farm));
  localStorage.setItem('tg_journal', JSON.stringify(STATE.journal));
}
function loadState() {
  try {
    const farm    = localStorage.getItem('tg_farm');
    const journal = localStorage.getItem('tg_journal');
    if (farm)    STATE.farm    = JSON.parse(farm);
    if (journal) STATE.journal = JSON.parse(journal);
  } catch(e) { console.warn('상태 불러오기 실패', e); }
}

// ── 날짜 유틸 ──────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function pad(n) { return String(n).padStart(2,'0'); }
function formatDateShort(s) { const [,m,d]=s.split('-'); return `${+m}.${+d}`; }

// "5-상" → { month, day }  /  "다음해~" → null
function parseEra(str) {
  if (!str || str.startsWith('다음해')) return null;
  const [m, e] = str.split('-');
  return { month: parseInt(m), day: e==='상'?5 : e==='중'?15 : 25 };
}

// 오늘(month, day)이 과업 기간 안인지
function isTaskActive(task, month, day) {
  const s = parseEra(task.start);
  const e = parseEra(task.end);
  if (!s || !e) return false;
  const cur = month*100+day, b = s.month*100+s.day, en = e.month*100+e.day;
  return b<=en ? (cur>=b && cur<=en) : (cur>=b || cur<=en);
}

// 과업 시작까지 남은 일수 (양수 = 아직 안 왔음)
function daysUntilTask(task, month, day) {
  const s = parseEra(task.start);
  if (!s) return null;
  const today = new Date(new Date().getFullYear(), month-1, day);
  const start = new Date(new Date().getFullYear(), s.month-1, s.day);
  return Math.ceil((start - today) / 86400000);
}
