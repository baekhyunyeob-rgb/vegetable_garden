// ══════════════════════════════════════════════
// app.js — 슬기로운 텃밭 생활
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAll();
  registerSW();
});

// ── 탭 전환 ────────────────────────────────────
function switchTab(tabId) {
  STATE.currentTab = tabId;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${tabId}`)?.classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  event?.currentTarget?.classList.add('active');

  const titles = {
    'my-farm': '내 텃밭',
    'today':   '오늘 할 일',
    'journal': '작업 일지',
    'info':    '정보 연결',
  };
  document.getElementById('header-title').textContent = titles[tabId] || '';
}

// ── 전체 렌더링 ─────────────────────────────────
function renderAll() {
  renderMyFarm();
  renderToday();
  renderJournal();
  renderInfo();
}

// ── Service Worker ──────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  }
}
