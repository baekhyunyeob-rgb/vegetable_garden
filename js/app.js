// ── 앱 초기화 ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAll();
  registerSW();
});

// ── 탭 전환 ────────────────────────────────────────
function switchTab(tabId) {
  STATE.currentTab = tabId;

  // 화면 전환
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${tabId}`)?.classList.add('active');

  // 탭 버튼 강조
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event?.currentTarget?.classList.add('active');

  // 헤더 업데이트
  const headers = {
    'my-farm': ['내 텃밭 등록', ''],
    'today':   ['오늘의 정보', todayMeta()],
    'work':    ['농작업', ''],
    'ai':      ['AI 추천', ''],
  };
  const [title, sub] = headers[tabId] || ['', ''];
  document.getElementById('header-title').textContent = title;
  document.getElementById('header-sub').textContent = sub;
}

function todayMeta() {
  const d = new Date();
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getMonth()+1}.${d.getDate()} ${days[d.getDay()]} · 서천읍`;
}

// ── 전체 렌더링 ─────────────────────────────────────
function renderAll() {
  renderMyFarm();
  renderToday();
  renderWork();
  renderAI();
}

// ── Service Worker ──────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  }
}
