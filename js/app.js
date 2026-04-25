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

  // 농작업 탭일 때 작물 배지 표시
  const badgesEl = document.getElementById('header-badges');
  if (badgesEl) {
    if (tabId === 'work') {
      const unique = [];
      const seen = {};
      STATE.farm.crops.forEach(function(c) {
        if (!seen[c.name]) { seen[c.name] = true; unique.push(c); }
      });
      const COLORS = [
        {bg:'#C8E6C9',color:'#1B5E20'},{bg:'#BBDEFB',color:'#0D47A1'},
        {bg:'#FFE0B2',color:'#E65100'},{bg:'#F8BBD0',color:'#880E4F'},
        {bg:'#E1BEE7',color:'#4A148C'},{bg:'#B2EBF2',color:'#006064'},
        {bg:'#DCEDC8',color:'#33691E'},{bg:'#FFF9C4',color:'#F57F17'},
      ];
      badgesEl.innerHTML = unique.map(function(c, i) {
        // screens.js의 CROP_COLORS와 동일한 배열 사용 → 색상 통일
        var col = (typeof CROP_COLORS !== 'undefined' ? CROP_COLORS : [
          {bg:'#C8E6C9',color:'#1B5E20'},{bg:'#BBDEFB',color:'#0D47A1'},
          {bg:'#FFE0B2',color:'#E65100'},{bg:'#F8BBD0',color:'#880E4F'},
          {bg:'#E1BEE7',color:'#4A148C'},{bg:'#B2EBF2',color:'#006064'},
          {bg:'#DCEDC8',color:'#33691E'},{bg:'#FFF9C4',color:'#F57F17'},
        ])[i % 8];
        var srcIcon = c.cntntsNo ? ' 🌾'
          : (typeof AI_SCHEDULE_CACHE !== 'undefined' && AI_SCHEDULE_CACHE[c.name]) ? ' 🤖'
          : '';
        return '<span style="font-size:9px;padding:2px 6px;border-radius:8px;background:' + col.bg + ';color:' + col.color + ';white-space:nowrap;">' + c.name + srcIcon + '</span>';
      }).join('');
    } else {
      badgesEl.innerHTML = '';
    }
  }
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
