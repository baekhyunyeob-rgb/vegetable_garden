// ════════════════════════════════════════════════════
// 화면 1 — 내 텃밭
// ════════════════════════════════════════════════════
function renderMyFarm() {
  const el = document.getElementById('screen-my-farm');
  el.innerHTML = `

    <!-- ① 토지 -->
    <div class="card">
      <div class="section-row">
        <div class="section-num">1</div>
        <span class="section-title">토지</span>
        <div class="section-pill" id="land-pill">지번을 선택하세요</div>
      </div>

      <!-- 지도 영역 (카카오맵 예정) -->
      <div id="farm-map" style="width:100%;height:140px;background:#C8DFC8;border-radius:10px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:12px;color:#555;">지도 영역 (카카오맵 연동 예정)</span>
      </div>

      <!-- 지번 입력 + GPS -->
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <input type="text" id="jibun-input" placeholder="지번 입력 (예: 서천읍 화금리 123-4)" style="flex:1;" />
        <button onclick="findByGPS()" style="border:0.5px solid #2E7D32;border-radius:8px;padding:8px 10px;font-size:11px;color:#2E7D32;background:white;white-space:nowrap;">GPS</button>
      </div>

      <button class="btn-outline" onclick="addLand()" style="width:100%;">+ 토지 추가</button>

      <!-- 등록된 토지 목록 -->
      <div id="land-list"></div>
    </div>

    <hr class="divider">

    <!-- ② 작물 -->
    <div class="card">
      <div class="section-row">
        <div class="section-num">2</div>
        <span class="section-title">작물</span>
        <div class="section-pill" id="crop-pill">작물을 선택하세요</div>
      </div>

      <!-- 분류 탭 -->
      <div style="display:flex;gap:4px;margin-bottom:0;" id="cat-tabs">
        ${CROP_CATEGORIES.map((cat, i) => `
          <button onclick="selectCatTab(${i})"
            id="cat-tab-${i}"
            style="flex:1;font-size:9px;padding:5px 2px;border-radius:12px;border:0.5px solid #eee;color:#999;background:white;white-space:nowrap;cursor:pointer;">
            ${cat.label}
          </button>
        `).join('')}
      </div>

      <!-- 작물 팝업 -->
      <div id="crop-popup" style="background:#f8f8f8;border-radius:8px;padding:8px;margin-top:8px;display:none;">
        <div id="crop-chips" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;max-height:80px;overflow-y:auto;"></div>
        <div id="crop-inputs"></div>
      </div>
    </div>

    <!-- 선택 바 -->
    <button class="btn-primary" onclick="confirmCrops()">선택</button>

    <hr class="divider">

    <!-- ③ 경작 목록 -->
    <div class="card">
      <div class="section-row">
        <div class="section-num">3</div>
        <span class="section-title">경작 목록</span>
        <button onclick="editCropList()" style="margin-left:auto;font-size:10px;color:#2E7D32;border:0.5px solid #2E7D32;border-radius:5px;padding:2px 8px;background:white;cursor:pointer;">수정</button>
      </div>
      <div id="crop-list">
        <div style="font-size:11px;color:#ccc;text-align:center;padding:12px 0;">경작 목록이 없습니다</div>
      </div>
    </div>

    <!-- 확인 바 -->
    <button class="btn-primary" onclick="confirmFarm()">확인 →</button>
  `;

  renderLandList();
  renderCropList();
}

// 토지 추가
function addLand() {
  const input = document.getElementById('jibun-input');
  const jibun = input.value.trim();
  if (!jibun) { alert('지번을 입력하세요'); return; }

  STATE.farm.lands.push({
    jibun,
    area: null,   // 공간정보 API 자동조회 예정
    jimok: '밭',  // 자동조회 예정
  });
  input.value = '';
  saveState();
  renderLandList();
  updateLandPill();
}

function renderLandList() {
  const el = document.getElementById('land-list');
  if (!el) return;
  if (!STATE.farm.lands.length) { el.innerHTML = ''; return; }

  el.innerHTML = STATE.farm.lands.map((l, i) => `
    <div style="display:flex;align-items:center;gap:6px;background:#f8f8f8;border-radius:8px;padding:8px;margin-top:6px;">
      <div style="flex:1;">
        <div style="font-size:12px;font-weight:500;">${l.jibun}</div>
        <div style="font-size:10px;color:#999;margin-top:2px;">${l.area ? l.area + '㎡ (약 ' + sqmToPyeong(l.area) + '평)' : '면적 조회 중...'}</div>
      </div>
      <span class="badge badge-${l.jimok}">${l.jimok}</span>
      <button onclick="removeLand(${i})" style="font-size:10px;color:#ccc;border:none;background:none;cursor:pointer;">삭제</button>
    </div>
  `).join('');
}

function removeLand(i) {
  STATE.farm.lands.splice(i, 1);
  saveState();
  renderLandList();
  updateLandPill();
}

function updateLandPill() {
  const pill = document.getElementById('land-pill');
  if (!pill) return;
  if (!STATE.farm.lands.length) { pill.textContent = '지번을 선택하세요'; return; }
  pill.textContent = STATE.farm.lands.map(l => l.jibun.split(' ').slice(-1)[0]).join(' · ');
}

// 분류 탭 선택
let selectedCatIdx = 0;
function selectCatTab(idx) {
  selectedCatIdx = idx;
  document.querySelectorAll('[id^="cat-tab-"]').forEach((btn, i) => {
    btn.style.background = i === idx ? '#2E7D32' : 'white';
    btn.style.color = i === idx ? 'white' : '#999';
    btn.style.borderColor = i === idx ? '#2E7D32' : '#eee';
    btn.style.fontWeight = i === idx ? '500' : 'normal';
  });
  const popup = document.getElementById('crop-popup');
  popup.style.display = 'block';
  renderCropChips();
}

function renderCropChips() {
  const cat = CROP_CATEGORIES[selectedCatIdx];
  const chipsEl = document.getElementById('crop-chips');
  const inputsEl = document.getElementById('crop-inputs');

  // 이미 선택된 작물
  const selected = STATE.farm.crops
    .filter(c => c.category === cat.id)
    .map(c => c.name);

  chipsEl.innerHTML = cat.crops.map(name => `
    <button onclick="toggleCrop('${name}', '${cat.id}', '${cat.badgeClass}')"
      style="font-size:10px;padding:3px 8px;border-radius:10px;
             border:0.5px solid ${selected.includes(name) ? '#2E7D32' : '#eee'};
             background:${selected.includes(name) ? '#2E7D32' : 'white'};
             color:${selected.includes(name) ? 'white' : '#666'};
             font-weight:${selected.includes(name) ? '500' : 'normal'};
             cursor:pointer;">
      ${name}
    </button>
  `).join('');

  renderCropInputs(cat);
}

function toggleCrop(name, catId, badgeClass) {
  const idx = STATE.farm.crops.findIndex(c => c.name === name && c.category === catId);
  if (idx >= 0) {
    STATE.farm.crops.splice(idx, 1);
  } else {
    const jibun = STATE.farm.lands[0]?.jibun || '';
    STATE.farm.crops.push({ name, category: catId, badgeClass, area: '', unit: '평', jibun });
  }
  renderCropChips();
}

function renderCropInputs(cat) {
  const inputsEl = document.getElementById('crop-inputs');
  const catCrops = STATE.farm.crops.filter(c => c.category === cat.id);
  if (!catCrops.length) { inputsEl.innerHTML = ''; return; }

  inputsEl.innerHTML = catCrops.map((c, i) => `
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;">
      <span style="font-size:10px;color:#999;flex-shrink:0;">${i+1}.</span>
      <span class="badge ${c.badgeClass}" style="flex-shrink:0;">${c.name}</span>
      <input type="number" placeholder="면적"
        value="${c.area}"
        onchange="updateCropArea('${c.name}', '${c.category}', this.value)"
        style="width:60px;padding:4px 6px;font-size:11px;" />
      <select onchange="updateCropUnit('${c.name}', '${c.category}', this.value)"
        style="border:0.5px solid #ddd;border-radius:6px;padding:4px;font-size:10px;color:#666;">
        <option ${c.unit==='평'?'selected':''}>평</option>
        <option ${c.unit==='㎡'?'selected':''}>㎡</option>
      </select>
      <span style="flex:1;font-size:10px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${c.jibun ? c.jibun.split(' ').slice(-1)[0] : ''}
      </span>
    </div>
  `).join('');
}

function updateCropArea(name, catId, val) {
  const c = STATE.farm.crops.find(c => c.name === name && c.category === catId);
  if (c) c.area = val;
}
function updateCropUnit(name, catId, val) {
  const c = STATE.farm.crops.find(c => c.name === name && c.category === catId);
  if (c) c.unit = val;
}

function confirmCrops() {
  saveState();
  renderCropList();
  updateCropPill();
  document.getElementById('crop-popup').style.display = 'none';
}

function updateCropPill() {
  const pill = document.getElementById('crop-pill');
  if (!pill) return;
  if (!STATE.farm.crops.length) { pill.textContent = '작물을 선택하세요'; return; }
  pill.textContent = STATE.farm.crops.map(c => c.name).join(' · ');
}

function renderCropList() {
  const el = document.getElementById('crop-list');
  if (!el) return;

  // 지번별 그룹핑
  const byLand = {};
  STATE.farm.crops.forEach(c => {
    const key = c.jibun || '미지정';
    if (!byLand[key]) byLand[key] = [];
    byLand[key].push(c);
  });

  if (!Object.keys(byLand).length) {
    el.innerHTML = `<div style="font-size:11px;color:#ccc;text-align:center;padding:12px 0;">경작 목록이 없습니다</div>`;
    return;
  }

  el.innerHTML = Object.entries(byLand).map(([jibun, crops]) => {
    const totalArea = crops.reduce((s, c) => s + (parseFloat(c.area)||0), 0);
    const cropStr = crops.map(c => `${c.name} ${c.area||'?'}${c.unit}`).join(' · ');
    const shortJibun = jibun.split(' ').slice(-1)[0];
    return `
      <div style="display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:0.5px solid #eee;">
        <div style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${shortJibun}</div>
        <div style="font-size:10px;color:#999;white-space:nowrap;">${totalArea}평</div>
        <div style="font-size:10px;color:#2E7D32;white-space:nowrap;">${cropStr}</div>
        <div style="width:14px;height:14px;border-radius:3px;border:0.5px solid #ddd;flex-shrink:0;"></div>
      </div>
    `;
  }).join('');
}

function confirmFarm() {
  saveState();
  alert('등록 완료! 오늘의 정보를 확인하세요.');
  switchTab('today');
  document.querySelectorAll('.tab-btn')[1].classList.add('active');
  document.querySelectorAll('.tab-btn')[0].classList.remove('active');
}

function findByGPS() {
  if (!navigator.geolocation) { alert('GPS를 지원하지 않는 기기입니다.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    document.getElementById('jibun-input').value = `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }, () => alert('위치를 가져올 수 없습니다.'));
}

function editCropList() {
  renderCropChips();
  document.getElementById('crop-popup').style.display = 'block';
}

// ════════════════════════════════════════════════════
// 화면 2 — 오늘의 정보
// ════════════════════════════════════════════════════
function renderToday() {
  const el = document.getElementById('screen-today');
  el.innerHTML = `
    <!-- 날씨 카드 -->
    <div class="card">
      <div class="card-title">
        <span class="ct">날씨</span>
        <span class="ct-more" onclick="alert('농업기상 상세 준비중')">농업기상 상세 ›</span>
      </div>
      <div id="weather-today" style="display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;margin-bottom:10px;border-bottom:0.5px solid #eee;">
        <div style="font-size:13px;color:#999;">날씨 정보 로딩 중...</div>
      </div>
      <div id="weather-week" style="display:flex;gap:4px;"></div>
    </div>

    <!-- 가용자원 카드 -->
    <div class="card">
      <div class="card-title"><span class="ct">가용자원</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div onclick="alert('토질 상세 준비중')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">토질</div>
          <div style="font-size:14px;font-weight:500;">pH 5.8</div>
          <div style="font-size:10px;color:#2E7D32;margin-top:2px;">벼·채소 적합</div>
        </div>
        <div onclick="alert('지하수 상세 준비중')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">지하수</div>
          <div style="font-size:14px;font-weight:500;">-3.2m</div>
          <div style="font-size:10px;color:#185FA5;margin-top:2px;">평년 수준</div>
        </div>
        <div onclick="alert('병해충 상세 준비중')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">병해충</div>
          <div style="font-size:14px;font-weight:500;">주의 1건</div>
          <div style="font-size:10px;color:#B45309;margin-top:2px;">도열병 주의보</div>
        </div>
        <div onclick="alert('추후 결정')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">강수·관개</div>
          <div style="font-size:14px;font-weight:500;">—</div>
          <div style="font-size:10px;color:#999;margin-top:2px;">준비중</div>
        </div>
      </div>
    </div>

    <!-- 관련기관 카드 -->
    <div class="card">
      <div class="card-title"><span class="ct">관련 기관</span></div>
      ${[
        {badge:'충남농기원', cls:'#EAF3DE', tc:'#27500A', notice:'봄철 토양관리 기술지원 안내', date:'04.03', url:'https://www.cnnongup.kr'},
        {badge:'서천농기센', cls:'#E6F1FB', tc:'#0C447C', notice:'귀농인 병해충 방제 교육 신청', date:'04.02', url:'https://www.seocheon.go.kr'},
        {badge:'치유농업ON', cls:'#FAEEDA', tc:'#633806', notice:'2026 치유농업 체험프로그램 모집', date:'04.01', url:'https://www.chiyunongup.or.kr'},
        {badge:'서천군',    cls:'#EEEDFE', tc:'#3C3489', notice:'친환경농업 직불금 신청 안내', date:'04.01', url:'https://www.seocheon.go.kr'},
      ].map(o => `
        <div class="link-row" onclick="window.open('${o.url}')">
          <span style="font-size:9px;padding:2px 5px;border-radius:4px;font-weight:500;background:${o.cls};color:${o.tc};white-space:nowrap;width:58px;text-align:center;">${o.badge}</span>
          <span style="flex:1;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${o.notice}</span>
          <span style="font-size:10px;color:#999;white-space:nowrap;">${o.date}</span>
          <span class="link-arrow">›</span>
        </div>
      `).join('')}
    </div>
  `;
}

// ════════════════════════════════════════════════════
// 화면 3 — 농작업
// ════════════════════════════════════════════════════
function renderWork() {
  const el = document.getElementById('screen-work');
  const { year, month } = STATE.calendar;
  el.innerHTML = `
    <!-- 월력 -->
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <button onclick="prevMonth()" style="font-size:20px;color:#2E7D32;background:none;border:none;cursor:pointer;padding:0 6px;">‹</button>
        <span style="font-size:13px;font-weight:500;">${year}년 ${month}월</span>
        <button onclick="nextMonth()" style="font-size:20px;color:#2E7D32;background:none;border:none;cursor:pointer;padding:0 6px;">›</button>
      </div>
      ${renderCalendar(year, month)}
    </div>

    <!-- 오늘 작업 -->
    <div class="card" id="work-input-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:500;">오늘 작업</span>
        <button onclick="addWorkLine()" class="btn-outline" style="width:auto;">+ 추가</button>
      </div>
      <div id="work-lines">
        <div style="border:0.5px solid #eee;border-radius:8px;padding:10px;color:#ccc;font-size:11px;">
          월력에서 해당 작업을 선택하세요
        </div>
      </div>
      <button class="btn-primary" id="work-save-btn" onclick="saveWork()" style="margin-top:8px;display:none;">저장</button>
    </div>

    <!-- 평가 -->
    <div class="card" id="eval-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:500;">평가</span>
        <span style="font-size:11px;color:#2E7D32;font-weight:500;" id="eval-date">${todayStr().slice(5).replace('-','.')}</span>
      </div>
      <div id="eval-content">
        <div style="font-size:11px;color:#ccc;text-align:center;padding:10px 0;">작업 내용 없음</div>
      </div>
    </div>
  `;
}

function renderCalendar(year, month) {
  const firstDay = new Date(year, month-1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayY = today.getFullYear(), todayM = today.getMonth()+1, todayD = today.getDate();

  const dayLabels = '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px;">' +
    ['일','월','화','수','목','금','토'].map((d,i) =>
      `<div style="text-align:center;font-size:9px;color:${i===0?'#E24B4A':i===6?'#378ADD':'#999'};padding:2px 0;">${d}</div>`
    ).join('') + '</div>';

  let cells = '<div style="display:grid;grid-template-columns:repeat(7,1fr);">';
  for (let i = 0; i < firstDay; i++) cells += '<div style="min-height:44px;border:0.5px dashed transparent;"></div>';

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = (year===todayY && month===todayM && d===todayD);
    const isPast  = new Date(year,month-1,d) < new Date(todayY,todayM-1,todayD);
    const dow = new Date(year, month-1, d).getDay();
    const works = STATE.calendar.works[dateStr] || [];
    const wIcon = isPast ? '☀️' : '🌤'; // 실제는 API 연동

    cells += `
      <div onclick="selectDate('${dateStr}')"
        style="min-height:44px;padding:2px;border:0.5px dashed #eee;cursor:pointer;${isToday?'background:#F1F8E9;border-color:#2E7D32;':''}">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          ${isToday
            ? `<div style="width:15px;height:15px;border-radius:50%;background:#2E7D32;color:white;font-size:8px;display:flex;align-items:center;justify-content:center;">${d}</div>`
            : `<span style="font-size:9px;color:${dow===0?'#E24B4A':dow===6?'#378ADD':'#111'};">${d}</span>`
          }
          <span style="font-size:8px;">${wIcon}</span>
        </div>
        ${works.slice(0,2).map(w => `
          <div style="display:flex;align-items:center;gap:1px;margin-top:1px;overflow:hidden;">
            <span class="badge ${getCropBadgeClass(w.cropName)}" style="font-size:6px;padding:0 2px;">${w.cropName}</span>
            <span style="font-size:7px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"> ${w.workType}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  cells += '</div>';

  // 범례
  const legend = `
    <div style="display:flex;gap:6px;margin-top:8px;padding-top:8px;border-top:0.5px solid #eee;flex-wrap:wrap;align-items:center;">
      ${STATE.farm.crops.slice(0,4).map(c => `<div style="display:flex;align-items:center;gap:2px;"><span class="badge ${c.badgeClass}" style="font-size:7px;">${c.name}</span></div>`).join('')}
      <div style="margin-left:auto;font-size:9px;color:#999;">지난날 기록 · 이후 예보</div>
    </div>
  `;

  return dayLabels + cells + legend;
}

function prevMonth() {
  if (STATE.calendar.month === 1) { STATE.calendar.month = 12; STATE.calendar.year--; }
  else STATE.calendar.month--;
  renderWork();
}
function nextMonth() {
  if (STATE.calendar.month === 12) { STATE.calendar.month = 1; STATE.calendar.year++; }
  else STATE.calendar.month++;
  renderWork();
}

let selectedWorkDate = todayStr();
let pendingWorks = [];

function selectDate(dateStr) {
  selectedWorkDate = dateStr;
  pendingWorks = JSON.parse(JSON.stringify(STATE.calendar.works[dateStr] || []));
  renderWorkLines();
  renderEval(dateStr);
  document.getElementById('eval-date').textContent = dateStr.slice(5).replace('-','.');
}

function renderWorkLines() {
  const el = document.getElementById('work-lines');
  const saveBtn = document.getElementById('work-save-btn');
  if (!el) return;

  if (!pendingWorks.length) {
    el.innerHTML = `<div style="border:0.5px solid #eee;border-radius:8px;padding:10px;color:#ccc;font-size:11px;">월력에서 해당 작업을 선택하세요</div>`;
    if (saveBtn) saveBtn.style.display = 'none';
    return;
  }

  el.innerHTML = pendingWorks.map((w, i) => `
    <div style="display:flex;align-items:center;gap:5px;border:0.5px solid #eee;border-radius:8px;padding:7px 9px;margin-bottom:4px;">
      <span style="font-size:10px;color:#999;flex-shrink:0;">${i+1}.</span>
      <span class="badge ${getCropBadgeClass(w.cropName)}" style="font-size:9px;flex-shrink:0;">${w.cropName}</span>
      <span style="font-size:10px;color:#666;flex-shrink:0;">${w.workType}</span>
      <input type="text" placeholder="세부 내용"
        value="${w.detail||''}"
        onchange="pendingWorks[${i}].detail=this.value"
        style="flex:1;border:none;border-bottom:0.5px solid #eee;border-radius:0;padding:2px 4px;font-size:10px;" />
    </div>
  `).join('');
  if (saveBtn) saveBtn.style.display = 'block';
}

function addWorkLine() {
  if (!STATE.farm.crops.length) { alert('먼저 내 텃밭에서 작물을 등록하세요'); return; }
  pendingWorks.push({
    cropName: STATE.farm.crops[0].name,
    workType: '기타',
    detail: '',
    weather: '☀️',
    date: selectedWorkDate,
  });
  renderWorkLines();
  document.getElementById('work-save-btn').style.display = 'block';
}

function saveWork() {
  STATE.calendar.works[selectedWorkDate] = [...pendingWorks];
  saveState();
  renderWork();
  renderEval(selectedWorkDate);
  alert('저장됐습니다');
}

function renderEval(dateStr) {
  const el = document.getElementById('eval-content');
  if (!el) return;
  const works = STATE.calendar.works[dateStr] || [];
  if (!works.length) {
    el.innerHTML = `<div style="font-size:11px;color:#ccc;text-align:center;padding:10px 0;">작업 내용 없음</div>`;
    return;
  }
  el.innerHTML = works.map((w, i) => `
    <div style="display:flex;align-items:flex-start;gap:6px;padding:5px 0;border-bottom:0.5px solid #eee;">
      ${i===0 ? `
        <span class="badge ${getCropBadgeClass(w.cropName)}" style="flex-shrink:0;">${w.cropName}</span>
        <div style="flex:1;">
          <div style="font-size:11px;color:#111;">${w.workType}</div>
          <div style="font-size:9px;color:#999;margin-top:1px;">${w.weather} · 재배력</div>
        </div>
      ` : `
        <span style="font-size:10px;color:#999;flex-shrink:0;padding-top:1px;">${i+1}.</span>
        <span style="font-size:11px;color:#111;flex:1;">${w.detail || w.workType}</span>
      `}
    </div>
  `).join('');
}

// 월력 배지 탭 → 작업 입력
function tapBadge(cropName, workType, dateStr) {
  selectedWorkDate = dateStr;
  pendingWorks.push({ cropName, workType, detail: '', weather: '☀️', date: dateStr });
  renderWorkLines();
  document.getElementById('work-save-btn').style.display = 'block';
}

// ════════════════════════════════════════════════════
// 화면 4 — AI 추천
// ════════════════════════════════════════════════════
function renderAI() {
  const el = document.getElementById('screen-ai');
  el.innerHTML = `
    <!-- AI 추천 카드 -->
    <div class="card">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <div style="width:8px;height:8px;border-radius:50%;background:#2E7D32;"></div>
        <span style="font-size:12px;font-weight:500;">오늘의 AI 추천</span>
        <span style="font-size:10px;color:#999;margin-left:auto;" id="ai-time">분석 전</span>
      </div>
      <div id="ai-context" style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:8px;"></div>
      <div id="ai-message" style="font-size:12px;color:#555;line-height:1.7;margin-bottom:10px;min-height:60px;border:0.5px solid #eee;border-radius:8px;padding:10px;">
        아래 버튼을 눌러 오늘 상황에 맞는 추천을 받으세요.
      </div>
      <div id="ai-actions"></div>
      <button class="btn-outline" onclick="runAI()" style="width:100%;margin-top:8px;">↻ AI 분석 시작</button>
    </div>

    <!-- 기타 카드 -->
    <div class="card">
      <div style="font-size:12px;font-weight:500;margin-bottom:8px;">기타</div>
      ${[
        {icon:'📷', cls:'li-green', name:'병해충 사진 진단',  desc:'농진청 AI · 촬영 즉시 진단·방제약 추천', url:'https://play.google.com/store/apps/details?id=com.nonghyupit.aipest'},
        {icon:'🌸', cls:'li-pink',  name:'식물 이름 찾기',   desc:'네이버 스마트렌즈 · 꽃·나무·잡초', url:'https://m.naver.com'},
        {icon:'💊', cls:'li-blue',  name:'농약안전정보 PSIS', desc:'작물별 등록농약 · GLS 안전사용기준', url:'https://psis.rda.go.kr'},
        {icon:'🛒', cls:'li-amber', name:'서천 로컬푸드',    desc:'모바일 납품 신청', url:'https://www.seocheon.go.kr'},
        {icon:'🌾', cls:'li-teal',  name:'충남 온라인장터',   desc:'모바일 직거래 플랫폼', url:'https://market.chungnam.go.kr'},
        {icon:'👥', cls:'li-purple',name:'귀농귀촌 커뮤니티', desc:'서천 품앗이·정보 공유', url:'https://www.returnfarm.com'},
      ].map(l => `
        <div class="link-row" onclick="window.open('${l.url}')">
          <div class="link-icon ${l.cls}">${l.icon}</div>
          <div class="link-info">
            <div class="link-name">${l.name}</div>
            <div class="link-desc">${l.desc}</div>
          </div>
          <span class="link-arrow">›</span>
        </div>
      `).join('')}
    </div>
  `;
}

async function runAI() {
  const msgEl = document.getElementById('ai-message');
  const actEl = document.getElementById('ai-actions');
  const timeEl = document.getElementById('ai-time');
  const ctxEl  = document.getElementById('ai-context');

  // 컨텍스트 태그 구성
  const crops = STATE.farm.crops.map(c => c.name).join('·') || '작물 미등록';
  const today = todayStr();
  const todayWorks = STATE.calendar.works[today] || [];
  const workStr = todayWorks.length ? todayWorks.map(w=>w.workType).join('·') : '작업 없음';

  ctxEl.innerHTML = [
    `☀️ 날씨`, crops, workStr, '서천읍'
  ].map(t => `<span style="font-size:10px;color:#666;background:#f8f8f8;border-radius:4px;padding:2px 6px;">${t}</span>`).join('');

  msgEl.textContent = 'AI 분석 중...';
  msgEl.style.color = '#999';
  actEl.innerHTML = '';

  const prompt = `
당신은 충남 서천군 귀농귀촌인을 위한 농업 도우미입니다.
오늘 날짜: ${today}
등록 작물: ${crops}
오늘 재배력 작업: ${workStr}
서천군 병해충 현황: 도열병 주의보 발령 중

위 정보를 바탕으로 오늘 농업 활동에 대한 실용적인 조언을 2~3줄로 간결하게 한국어로 작성해 주세요.
그리고 가장 필요한 행동 1~2개를 JSON 형식으로 추천해 주세요.
형식: {"message":"조언내용","actions":[{"label":"버튼명","url":"연결URL"}]}
URL은 실제 모바일 웹사이트 주소를 사용하세요.
JSON만 출력하세요.
  `.trim();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text).join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    msgEl.textContent = parsed.message;
    msgEl.style.color = '#111';
    timeEl.textContent = '방금';

    actEl.innerHTML = (parsed.actions || []).map(a => `
      <div class="link-row" onclick="window.open('${a.url}')" style="border:0.5px solid #eee;border-radius:8px;padding:8px 10px;margin-bottom:4px;">
        <div class="link-info"><div class="link-name">${a.label}</div></div>
        <span class="link-arrow" style="color:#2E7D32;">›</span>
      </div>
    `).join('');

  } catch(e) {
    msgEl.textContent = 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    msgEl.style.color = '#999';
    console.error(e);
  }
}
