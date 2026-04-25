// ══════════════════════════════════════════════
// screens.js — 슬기로운 텃밭 생활
// ══════════════════════════════════════════════

// ── 전역 ───────────────────────────────────────
let editingJibun   = null;
let kakaoMap       = null;
let kakaoMarker    = null;
let kakaoGeocoder  = null;

// ══════════════════════════════════════════════
// 공통 유틸
// ══════════════════════════════════════════════
// 작물명에서 계절 추출: "상추(봄)" → "봄", "고추" → "봄"
function extractSeason(cropName) {
  if (cropName.includes('(가을)')) return '가을';
  return '봄';
}

function cropSeasonBadge(cropName) {
  const season = extractSeason(cropName);
  const styles = season === '가을'
    ? 'background:#E8F5E9;color:#1B5E20;border:0.5px solid #A5D6A7;'
    : 'background:#FFF3E0;color:#E65100;border:0.5px solid #FFCC80;';
  return `<span style="font-size:9px;padding:1px 5px;border-radius:4px;${styles}">${season}</span>`;
}

// ══════════════════════════════════════════════
// 1탭 — 내 텃밭
// ══════════════════════════════════════════════
function renderMyFarm() {
  const el = document.getElementById('screen-my-farm');
  const crops = STATE.farm.crops;

  el.innerHTML =
    '<div>' +
    (crops.length === 0
      ? '<div style="text-align:center;padding:16px 0;color:#bbb;font-size:12px;">' +
        '아직 등록된 텃밭이 없어요<br>' +
        '<span style="font-size:11px;">아래에서 토지와 작물을 등록해 보세요</span></div>'
      : renderFarmListHTML()
    ) +
    renderFarmFormHTML() +
    '</div>';

  setTimeout(initKakaoMap, 100);

  if (editingJibun) {
    document.getElementById('jibun-input').value = editingJibun;
    STATE.farm.pendingCrops = STATE.farm.crops
      .filter(c => c.jibun === editingJibun)
      .map(c => Object.assign({}, c));
    renderCropList();
  } else {
    STATE.farm.pendingCrops = [];
  }
}

function renderFarmFormHTML() {
  return `
  <div id="farm-form" style="margin-top:10px;background:white;border-radius:14px;
    border:0.5px solid #eee;overflow:hidden;">
    <div style="padding:14px 14px 0;">
      <div style="font-size:13px;font-weight:500;margin-bottom:12px;" id="form-title">
        ${editingJibun ? '✏️ 텃밭 수정' : '➕ 텃밭 등록'}
      </div>

      <!-- 지도 -->
      <div id="kakao-map" style="width:100%;height:170px;border-radius:10px;
        margin-bottom:10px;background:#e8f0e9;"></div>

      <!-- 주소 -->
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#999;margin-bottom:5px;">📍 토지 지번</div>
        <div style="display:flex;gap:6px;margin-bottom:6px;">
          <input type="text" id="jibun-input" placeholder="예: 충남 서천군 화금리 123-4"
            style="flex:1;" />
          <button onclick="searchAddress()"
            style="border:0.5px solid #2E7D32;border-radius:8px;padding:8px 10px;
            font-size:11px;color:#2E7D32;background:white;white-space:nowrap;cursor:pointer;">
            검색
          </button>
        </div>
        <button onclick="findByGPS()"
          style="width:100%;border:0.5px solid #2E7D32;border-radius:8px;padding:8px;
          font-size:11px;color:#2E7D32;background:white;cursor:pointer;">
          📡 GPS로 현재 위치 찾기
        </button>
        <div id="parcel-info" style="margin-top:5px;font-size:10px;color:#999;"></div>
      </div>

      <!-- 작물 -->
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#999;margin-bottom:5px;">🌿 작물 등록</div>
        <div style="position:relative;">
          <div style="display:flex;gap:5px;align-items:center;">
            <input type="text" id="crop-search-input" placeholder="작물명 (예: 고추)"
              oninput="onCropSearchInput(this.value)"
              style="flex:1;" />
            <input type="number" id="crop-area-input" placeholder="면적"
              style="width:60px;" />
            <select id="crop-unit-select"
              style="border:0.5px solid #ddd;border-radius:8px;padding:8px 3px;
              font-size:11px;color:#666;">
              <option>평</option><option>㎡</option>
            </select>
            <button onclick="addCropFromSearch()"
              style="background:#2E7D32;color:white;border:none;border-radius:8px;
              padding:8px 10px;font-size:12px;cursor:pointer;flex-shrink:0;">추가</button>
          </div>
          <div id="crop-autocomplete"
            style="display:none;position:absolute;top:100%;left:0;right:0;background:white;
            border:0.5px solid #ddd;border-radius:8px;z-index:200;
            box-shadow:0 4px 12px rgba(0,0,0,.1);max-height:180px;overflow-y:auto;margin-top:2px;">
          </div>
        </div>
        <div id="crop-list" style="margin-top:8px;"></div>
      </div>
    </div>

    <!-- 버튼 -->
    <div style="display:flex;gap:8px;padding:12px 14px;">
      ${editingJibun
        ? '<button onclick="deleteLandEntry()" style="flex:1;padding:11px;background:white;' +
          'color:#E24B4A;border:0.5px solid #E24B4A;border-radius:10px;font-size:13px;cursor:pointer;">삭제</button>'
        : ''}
      <button onclick="confirmEntry()"
        style="flex:2;padding:11px;background:#2E7D32;color:white;border:none;
        border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;">등록 완료</button>
    </div>
  </div>`;
}

function renderFarmListHTML() {
  const byLand = {};
  STATE.farm.crops.forEach(c => {
    if (!byLand[c.jibun]) byLand[c.jibun] = [];
    byLand[c.jibun].push(c);
  });

  return Object.entries(byLand).map(([jibun, crops], idx) => {
    const short = jibun.split(' ').slice(-2).join(' ');
    const land  = (STATE.farm.lands || []).find(l => l.jibun === jibun) || {};
    const meta  = [land.jimok, land.areaPyeong ? land.areaPyeong+'평' : '']
      .filter(Boolean).join(' ');

    const badges = crops.map(c =>
      `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;
        background:#f8f8f8;border:0.5px solid #eee;padding:2px 7px;border-radius:8px;
        white-space:nowrap;">
        ${c.name} ${cropSeasonBadge(c.name)}
        ${c.area ? '<span style="color:#999;">'+c.area+(c.unit||'평')+'</span>' : ''}
      </span>`
    ).join('');

    return `
    <div style="background:white;border-radius:12px;border:0.5px solid #eee;
      padding:10px 14px;margin-bottom:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
          <span style="font-size:10px;color:white;background:#2E7D32;border-radius:50%;
            width:16px;height:16px;display:inline-flex;align-items:center;
            justify-content:center;flex-shrink:0;">${idx+1}</span>
          <span style="font-size:13px;font-weight:500;">${short}</span>
          ${meta ? `<span style="font-size:10px;color:#999;">(${meta})</span>` : ''}
        </div>
        <button onclick="startEdit('${jibun}')"
          style="font-size:11px;color:#2E7D32;background:none;border:0.5px solid #2E7D32;
          border-radius:6px;padding:2px 8px;cursor:pointer;">수정</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;padding-left:20px;">${badges}</div>
    </div>`;
  }).join('');
}

function startEdit(jibun) {
  editingJibun = jibun;
  renderMyFarm();
  setTimeout(() => {
    document.getElementById('farm-form')?.scrollIntoView({ behavior:'smooth' });
  }, 200);
}

// ── 카카오맵 ────────────────────────────────────
function initKakaoMap() {
  const container = document.getElementById('kakao-map');
  if (!container) return;
  if (!window.kakao?.maps) { setTimeout(initKakaoMap, 300); return; }

  kakao.maps.load(() => {
    kakaoMap = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(36.0776, 126.6914), level: 5,
    });
    kakaoGeocoder = new kakao.maps.services.Geocoder();
    kakaoMarker   = new kakao.maps.Marker();

    kakao.maps.event.addListener(kakaoMap, 'click', e => {
      kakaoGeocoder.coord2Address(e.latLng.getLng(), e.latLng.getLat(), (res, st) => {
        if (st === kakao.maps.services.Status.OK) {
          const addr = res[0].road_address?.address_name || res[0].address.address_name;
          document.getElementById('jibun-input').value = addr;
          kakaoMarker.setPosition(e.latLng);
          kakaoMarker.setMap(kakaoMap);
        }
      });
    });

    if (editingJibun) {
      kakaoGeocoder.addressSearch(editingJibun, (res, st) => {
        if (st === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(res[0].y, res[0].x);
          kakaoMap.setCenter(coords); kakaoMap.setLevel(3);
          kakaoMarker.setPosition(coords); kakaoMarker.setMap(kakaoMap);
        }
      });
    }
  });
}

function searchAddress() {
  const kw = document.getElementById('jibun-input')?.value.trim();
  if (!kw || !kakaoGeocoder) return;
  kakaoGeocoder.addressSearch(kw, (res, st) => {
    if (st !== kakao.maps.services.Status.OK) { alert('주소를 찾을 수 없어요'); return; }
    document.getElementById('jibun-input').value = res[0].address_name;
    const coords = new kakao.maps.LatLng(res[0].y, res[0].x);
    kakaoMap.setCenter(coords); kakaoMap.setLevel(4);
    kakaoMarker.setPosition(coords); kakaoMarker.setMap(kakaoMap);
    fetchParcelInfo(res[0].address_name);
  });
}

function findByGPS() {
  if (!navigator.geolocation) { alert('GPS를 지원하지 않는 기기예요'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude:lat, longitude:lng } = pos.coords;
    if (!kakaoMap || !kakaoGeocoder) return;
    const coords = new kakao.maps.LatLng(lat, lng);
    kakaoMap.setCenter(coords); kakaoMap.setLevel(4);
    kakaoMarker.setPosition(coords); kakaoMarker.setMap(kakaoMap);
    kakaoGeocoder.coord2Address(lng, lat, (res, st) => {
      if (st === kakao.maps.services.Status.OK) {
        const addr = res[0].road_address?.address_name || res[0].address.address_name;
        document.getElementById('jibun-input').value = addr;
        fetchParcelInfo(addr);
      }
    });
  }, () => alert('위치 정보를 가져올 수 없어요'));
}

async function fetchParcelInfo(address) {
  const el = document.getElementById('parcel-info');
  if (!el) return;
  el.textContent = '토지 정보 조회 중...';
  try {
    const r1  = await fetch('/api/vworld?action=geocode&address=' + encodeURIComponent(address));
    const geo = await r1.json();
    const pnu = geo?.response?.refined?.structure?.level4LC;
    if (!pnu) { el.textContent = '필지 정보를 찾을 수 없어요'; return; }

    const r2   = await fetch('/api/vworld?action=landinfo&pnu=' + encodeURIComponent(pnu));
    const land = await r2.json();
    const item = land?.ladfrlVOList?.ladfrlVOList?.[0];
    if (!item) { el.textContent = '토지 정보 없음'; return; }

    const jimok      = item.lndcgrCodeNm || '';
    const areaSqm    = parseFloat(item.lndpclAr) || 0;
    const areaPyeong = Math.round(areaSqm / 3.305785);
    STATE.farm.currentParcel = { address, pnu, jimok, areaSqm, areaPyeong };

    el.innerHTML =
      `<span style="color:#2E7D32;font-weight:500;">${jimok}</span>` +
      ` · ${areaSqm.toLocaleString()}㎡ (${areaPyeong.toLocaleString()}평)`;
  } catch(e) {
    el.textContent = '토지 정보를 불러올 수 없어요';
  }
}

// ── 작물 검색·등록 ──────────────────────────────
function onCropSearchInput(val) {
  const autoEl = document.getElementById('crop-autocomplete');
  if (!autoEl) return;
  const q = val.trim();
  if (!q) { autoEl.style.display = 'none'; return; }

  const matches = GARDEN_CROPS.filter(c => c.name.includes(q));
  if (!matches.length) { autoEl.style.display = 'none'; return; }

  autoEl.style.display = 'block';
  autoEl.innerHTML = matches.map(c =>
    `<div onclick="selectCrop('${c.name}')"
      style="padding:9px 12px;font-size:12px;cursor:pointer;
      border-bottom:0.5px solid #f5f5f5;display:flex;align-items:center;gap:6px;">
      <span>${c.icon} ${c.name}</span>
      <span style="margin-left:auto;">${cropSeasonBadge(c.name)}</span>
    </div>`
  ).join('');
}

function selectCrop(name) {
  document.getElementById('crop-search-input').value = name;
  document.getElementById('crop-autocomplete').style.display = 'none';
}

function addCropFromSearch() {
  const nameEl = document.getElementById('crop-search-input');
  const areaEl = document.getElementById('crop-area-input');
  const unitEl = document.getElementById('crop-unit-select');
  const name   = nameEl?.value.trim();
  if (!name) { alert('작물명을 입력하세요'); return; }

  const found = GARDEN_CROPS.find(c => c.name === name);
  if (!found) { alert('목록에 없는 작물이에요'); return; }
  pushPendingCrop(name, areaEl?.value.trim(), unitEl?.value || '평');
  nameEl.value = ''; if (areaEl) areaEl.value = '';
}

function pushPendingCrop(name, area, unit) {
  if (!STATE.farm.pendingCrops) STATE.farm.pendingCrops = [];
  if (STATE.farm.pendingCrops.find(c => c.name === name)) {
    alert('이미 추가된 작물이에요'); return;
  }
  const season = extractSeason(name);
  STATE.farm.pendingCrops.push({ name, season, area: area||'', unit: unit||'평' });
  renderCropList();
}

// 계절은 작물명에 포함 — 별도 팝업 불필요

function renderCropList() {
  const listEl = document.getElementById('crop-list');
  if (!listEl) return;
  const crops = STATE.farm.pendingCrops || [];
  if (!crops.length) { listEl.innerHTML = ''; return; }

  listEl.innerHTML = `<div style="background:#f8f8f8;border-radius:8px;padding:8px;">` +
    crops.map((c, i) => `
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
        <span style="font-size:12px;flex:1;">${c.name}</span>
        ${cropSeasonBadge(c.name)}
        <input type="number" placeholder="면적" value="${c.area||''}"
          oninput="STATE.farm.pendingCrops[${i}].area=this.value"
          style="width:55px;font-size:11px;" />
        <select oninput="STATE.farm.pendingCrops[${i}].unit=this.value"
          style="border:0.5px solid #ddd;border-radius:6px;padding:4px 2px;font-size:10px;">
          <option${c.unit==='평'?' selected':''}>평</option>
          <option${c.unit==='㎡'?' selected':''}>㎡</option>
        </select>
        <button onclick="removePendingCrop(${i})"
          style="color:#E24B4A;background:none;border:none;font-size:14px;cursor:pointer;">×</button>
      </div>`
    ).join('') + '</div>';
}

function removePendingCrop(i) {
  STATE.farm.pendingCrops.splice(i, 1);
  renderCropList();
}

function confirmEntry() {
  const jibun = document.getElementById('jibun-input')?.value.trim();
  if (!jibun) { alert('지번을 입력하세요'); return; }
  if (!STATE.farm.pendingCrops?.length) { alert('작물을 추가하세요'); return; }

  if (editingJibun) {
    STATE.farm.crops = STATE.farm.crops.filter(c => c.jibun !== editingJibun);
    STATE.farm.lands = (STATE.farm.lands||[]).filter(l => l.jibun !== editingJibun);
  }
  if (!(STATE.farm.lands||[]).find(l => l.jibun === jibun)) {
    const p = STATE.farm.currentParcel || {};
    STATE.farm.lands = STATE.farm.lands || [];
    STATE.farm.lands.push({ jibun, pnu:p.pnu||null, jimok:p.jimok||'', areaSqm:p.areaSqm||null, areaPyeong:p.areaPyeong||null });
  }
  STATE.farm.pendingCrops.forEach(c =>
    STATE.farm.crops.push({ ...c, jibun })
  );
  STATE.farm.pendingCrops = [];
  editingJibun = null;
  saveState();
  renderMyFarm();
}

function deleteLandEntry() {
  if (!editingJibun) return;
  const short = editingJibun.split(' ').slice(-2).join(' ');
  if (!confirm(`${short} 토지를 삭제할까요?`)) return;
  STATE.farm.crops = STATE.farm.crops.filter(c => c.jibun !== editingJibun);
  STATE.farm.lands = (STATE.farm.lands||[]).filter(l => l.jibun !== editingJibun);
  editingJibun = null;
  saveState();
  renderMyFarm();
}

// ══════════════════════════════════════════════
// 2탭 — 오늘 할 일
// ══════════════════════════════════════════════
function renderToday() {
  const el = document.getElementById('screen-today');
  const crops = STATE.farm.crops;

  el.innerHTML = `
    <!-- 날씨 -->
    <div class="card">
      <div class="card-title">
        <span class="ct">🌤 오늘 날씨</span>
        <span class="ct-more" onclick="window.open('https://m.weather.naver.com')">
          상세 날씨 앱 ›
        </span>
      </div>
      <div id="weather-brief" style="font-size:12px;color:#999;">날씨 불러오는 중...</div>
    </div>

    <!-- 오늘 할 일 -->
    <div class="card">
      <div class="card-title">
        <span class="ct">📋 오늘 할 일</span>
        <span style="font-size:10px;color:#999;" id="today-date-label"></span>
      </div>
      <div id="today-tasks">
        ${crops.length === 0
          ? '<div style="text-align:center;padding:16px;color:#ccc;font-size:12px;">내 텃밭 탭에서 작물을 등록하면<br>오늘 할 일을 알려드려요</div>'
          : '<div style="font-size:12px;color:#ccc;text-align:center;padding:10px;">계산 중...</div>'
        }
      </div>
    </div>

    <!-- 7일 예정 -->
    <div class="card" id="upcoming-card" style="display:none;">
      <div class="card-title"><span class="ct">📅 7일 내 예정</span></div>
      <div id="upcoming-tasks"></div>
    </div>
  `;

  // 날짜 레이블
  const d = new Date();
  const days = ['일','월','화','수','목','금','토'];
  document.getElementById('today-date-label').textContent =
    `${d.getMonth()+1}.${d.getDate()} ${days[d.getDay()]}`;

  loadWeatherBrief();
  if (crops.length) renderTodayTasks();
}

async function loadWeatherBrief() {
  const el = document.getElementById('weather-brief');
  if (!el) return;
  const KEY = '58b48b0d19a525cf18e98d85a1b68cc560700393a7ed41f7538cc0758386b039';
  const nx = 54, ny = 89;
  const now = new Date();
  const pad2 = n => String(n).padStart(2,'0');
  const baseDate = `${now.getFullYear()}${pad2(now.getMonth()+1)}${pad2(now.getDate())}`;
  const hours = now.getHours();
  const baseTimes = [2,5,8,11,14,17,20,23];
  const baseHour  = baseTimes.filter(h => h <= hours).pop() ?? 23;
  const baseTime  = pad2(baseHour) + '00';

  try {
    const res  = await fetch(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KEY}&numOfRows=300&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`);
    const data = await res.json();
    const items = data.response.body.items.item;

    const byTime = {};
    items.forEach(item => {
      const key = item.fcstDate + item.fcstTime;
      if (!byTime[key]) byTime[key] = { date:item.fcstDate, time:item.fcstTime };
      byTime[key][item.category] = item.fcstValue;
    });

    const slots   = Object.values(byTime).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    const nowStr  = baseDate + pad2(hours) + '00';
    const current = slots.find(s => s.date+s.time >= nowStr) || slots[0];

    if (!current) { el.textContent = '날씨 정보 없음'; return; }

    const skyIcon = (sky, pty) => {
      if (pty==='1') return '🌧'; if (pty==='3') return '❄️';
      if (sky==='1') return '☀️'; if (sky==='3') return '⛅'; return '☁️';
    };
    const icon = skyIcon(current.SKY, current.PTY);
    const tmp  = current.TMP || '--';
    const pop  = current.POP || '0';
    const wsd  = current.WSD || '--';

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:32px;">${icon}</span>
        <div>
          <div style="font-size:20px;font-weight:600;color:#111;">${tmp}°C</div>
          <div style="font-size:11px;color:#999;">강수확률 ${pop}% · 풍속 ${wsd}m/s</div>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:10px;color:#bbb;">
          서천군<br>${String(current.time).slice(0,2)}시 기준
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = `<span style="font-size:12px;color:#ccc;">날씨 정보를 불러올 수 없어요
      <a href="https://m.weather.naver.com" style="color:#2E7D32;margin-left:6px;">앱 열기 ›</a></span>`;
  }
}

function renderTodayTasks() {
  const el = document.getElementById('today-tasks');
  if (!el) return;

  const now   = new Date();
  const month = now.getMonth() + 1;
  const day   = now.getDate();

  const todayItems    = [];
  const upcomingItems = [];

  STATE.farm.crops.forEach(crop => {
    const cal = CROP_CALENDAR[crop.name];
    if (!cal) return;

    cal.tasks.forEach(task => {
      if (isTaskActive(task, month, day)) {
        todayItems.push({ crop, task });
      } else {
        const d = daysUntilTask(task, month, day);
        if (d !== null && d > 0 && d <= 7) {
          upcomingItems.push({ crop, task, days: d });
        }
      }
    });
  });

  // 오늘 할 일
  if (!todayItems.length) {
    el.innerHTML = '<div style="font-size:12px;color:#bbb;text-align:center;padding:12px 0;">오늘 해당하는 농작업이 없어요</div>';
  } else {
    el.innerHTML = todayItems.map(({ crop, task }) => {
      const barColor = extractSeason(crop.name) === '가을' ? '#1B5E20' : '#E65100';
      return `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;
        border-bottom:0.5px solid #f5f5f5;">
        <div style="width:4px;height:36px;border-radius:2px;
          background:${barColor};flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:500;color:#111;">
            ${crop.name} · ${task.name}
          </div>
          <div style="font-size:10px;color:#999;margin-top:2px;">
            ${task.start} ~ ${task.end}
          </div>
        </div>
        <button onclick="openJournalEntry('${crop.name}','${task.name}')"
          style="font-size:10px;color:#2E7D32;background:#EAF3DE;border:none;
          border-radius:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;">
          기록 ›
        </button>
      </div>`;
    }).join('');
  }

  // 7일 예정
  if (upcomingItems.length) {
    document.getElementById('upcoming-card').style.display = 'block';
    document.getElementById('upcoming-tasks').innerHTML = upcomingItems.map(({ crop, task, days }) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;
        border-bottom:0.5px solid #f5f5f5;font-size:11px;">
        <span style="color:#2E7D32;font-weight:500;min-width:28px;">${days}일 후</span>
        <span style="flex:1;color:#444;">${crop.name} · ${task.name}</span>
        ${cropSeasonBadge(crop.name)}
      </div>`
    ).join('');
  }
}

// 2탭 → 3탭 기록 연결
function openJournalEntry(cropName, taskName) {
  switchTab('journal');
  setTimeout(() => showJournalPopup(cropName, taskName), 100);
}

// ══════════════════════════════════════════════
// 3탭 — 작업 일지
// ══════════════════════════════════════════════
let journalSearchQuery = '';

function renderJournal() {
  const el = document.getElementById('screen-journal');
  const allEntries = getAllJournalEntries();

  el.innerHTML = `
    <!-- 새 기록 버튼 -->
    <div style="display:flex;gap:8px;margin-bottom:10px;">
      <input type="text" id="journal-search" placeholder="🔍  작물명·작업명으로 검색"
        oninput="onJournalSearch(this.value)"
        style="flex:1;background:white;" />
      <button onclick="showJournalPopup()"
        style="background:#2E7D32;color:white;border:none;border-radius:8px;
        padding:0 14px;font-size:12px;cursor:pointer;white-space:nowrap;">
        + 기록
      </button>
    </div>

    <!-- 기록 목록 -->
    <div id="journal-list">
      ${renderJournalList(allEntries)}
    </div>
  `;
}

function getAllJournalEntries() {
  const entries = STATE.journal.entries || {};
  return Object.entries(entries)
    .sort(([a],[b]) => b.localeCompare(a))
    .flatMap(([date, items]) => items.map(item => ({ date, ...item })));
}

function renderJournalList(entries) {
  const q = journalSearchQuery.trim();
  const filtered = q
    ? entries.filter(e =>
        e.cropName?.includes(q) || e.task?.includes(q) || e.note?.includes(q))
    : entries;

  if (!filtered.length) {
    return '<div style="text-align:center;padding:24px;color:#ccc;font-size:12px;">' +
      (q ? `"${q}" 검색 결과 없음` : '아직 기록이 없어요<br>오늘 한 일을 기록해보세요') +
      '</div>';
  }

  // 날짜별 그룹
  const byDate = {};
  filtered.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });

  return Object.entries(byDate).map(([date, items]) => `
    <div class="card" style="margin-bottom:8px;">
      <div style="font-size:11px;color:#999;font-weight:500;margin-bottom:8px;">
        ${formatDateLabel(date)}
      </div>
      ${items.map((item, i) => `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;
          border-bottom:0.5px solid #f5f5f5;">
          <span style="font-size:16px;flex-shrink:0;">${item.weather||'☀️'}</span>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:500;color:#111;">
              ${item.cropName} · ${item.task}
            </div>
            ${item.note ? `<div style="font-size:11px;color:#666;margin-top:2px;">${item.note}</div>` : ''}
          </div>
          <button onclick="deleteJournalEntry('${date}',${i})"
            style="color:#ccc;background:none;border:none;font-size:13px;cursor:pointer;">×</button>
        </div>`
      ).join('')}
    </div>`
  ).join('');
}

function formatDateLabel(dateStr) {
  const [y,m,d] = dateStr.split('-');
  const dow = ['일','월','화','수','목','금','토'][new Date(+y,+m-1,+d).getDay()];
  const today = todayStr();
  const diff  = Math.round((new Date(+y,+m-1,+d) - new Date()) / 86400000);
  const rel   = dateStr === today ? '오늘' : diff === -1 ? '어제' : '';
  return `${+m}.${+d} ${dow}${rel ? ' · '+rel : ''}`;
}

function onJournalSearch(val) {
  journalSearchQuery = val;
  const entries = getAllJournalEntries();
  document.getElementById('journal-list').innerHTML = renderJournalList(entries);
}

function deleteJournalEntry(date, idx) {
  if (!STATE.journal.entries[date]) return;
  STATE.journal.entries[date].splice(idx, 1);
  if (!STATE.journal.entries[date].length) delete STATE.journal.entries[date];
  saveState();
  renderJournal();
}

// ── 기록 팝업 ──────────────────────────────────
function showJournalPopup(cropName, taskName) {
  const existing = document.getElementById('journal-popup');
  if (existing) existing.remove();

  const myCrops = [...new Set(STATE.farm.crops.map(c => c.name))];
  const cropOptions = myCrops.map(n =>
    `<option value="${n}"${n===cropName?' selected':''}>${n}</option>`
  ).join('');
  const taskOptions = WORK_TYPES.map(t =>
    `<option value="${t}"${t===taskName?' selected':''}>${t}</option>`
  ).join('');

  const el = document.createElement('div');
  el.id = 'journal-popup';
  el.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.45);
    z-index:500;display:flex;align-items:flex-end;`;
  el.innerHTML = `
    <div style="background:white;border-radius:20px 20px 0 0;padding:20px;
      width:100%;max-width:480px;margin:0 auto;">
      <div style="font-size:13px;font-weight:500;margin-bottom:14px;">📝 작업 기록</div>

      <!-- 작물 선택 -->
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#999;margin-bottom:4px;">작물</div>
        ${myCrops.length
          ? `<select id="jp-crop" style="width:100%;border:0.5px solid #ddd;border-radius:8px;
              padding:9px;font-size:12px;">${cropOptions}</select>`
          : `<div style="font-size:11px;color:#ccc;">내 텃밭에 작물을 먼저 등록하세요</div>`
        }
      </div>

      <!-- 작업 선택 (체크리스트) -->
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#999;margin-bottom:6px;">작업</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;" id="jp-task-chips">
          ${WORK_TYPES.map(t => `
            <button onclick="toggleTaskChip(this,'${t}')"
              data-task="${t}"
              style="padding:5px 10px;border-radius:16px;font-size:11px;cursor:pointer;
              background:${t===taskName?'#2E7D32':'white'};
              color:${t===taskName?'white':'#444'};
              border:0.5px solid ${t===taskName?'#2E7D32':'#ddd'};">
              ${t}
            </button>`).join('')}
        </div>
      </div>

      <!-- 날씨 -->
      <div style="margin-bottom:10px;">
        <div style="font-size:11px;color:#999;margin-bottom:6px;">날씨</div>
        <div style="display:flex;gap:8px;" id="jp-weather-chips">
          ${['☀️','⛅','☁️','🌧','🌨'].map((w,i) => `
            <button onclick="toggleWeatherChip(this,'${w}')"
              data-weather="${w}"
              style="font-size:20px;padding:4px 8px;border-radius:8px;cursor:pointer;
              background:${i===0?'#f0f8f0':'white'};
              border:0.5px solid ${i===0?'#2E7D32':'#eee'};">
              ${w}
            </button>`).join('')}
        </div>
      </div>

      <!-- 메모 -->
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;color:#999;margin-bottom:4px;">메모 <span style="color:#ccc;">(선택)</span></div>
        <input type="text" id="jp-note" placeholder="간단한 메모..."
          style="width:100%;box-sizing:border-box;" />
      </div>

      <!-- 버튼 -->
      <div style="display:flex;gap:8px;">
        <button onclick="document.getElementById('journal-popup').remove()"
          style="flex:1;padding:12px;background:white;color:#999;border:0.5px solid #eee;
          border-radius:10px;font-size:13px;cursor:pointer;">취소</button>
        <button onclick="saveJournalEntry()"
          style="flex:2;padding:12px;background:#2E7D32;color:white;border:none;
          border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;">저장</button>
      </div>
    </div>`;
  document.body.appendChild(el);

  // 첫 번째 날씨 기본 선택 상태로 초기화
  window._jpSelectedTask    = taskName || null;
  window._jpSelectedWeather = '☀️';
}

function toggleTaskChip(btn, task) {
  document.querySelectorAll('#jp-task-chips button').forEach(b => {
    b.style.background = 'white'; b.style.color = '#444';
    b.style.borderColor = '#ddd';
  });
  btn.style.background = '#2E7D32'; btn.style.color = 'white';
  btn.style.borderColor = '#2E7D32';
  window._jpSelectedTask = task;
}

function toggleWeatherChip(btn, weather) {
  document.querySelectorAll('#jp-weather-chips button').forEach(b => {
    b.style.background = 'white'; b.style.borderColor = '#eee';
  });
  btn.style.background = '#f0f8f0'; btn.style.borderColor = '#2E7D32';
  window._jpSelectedWeather = weather;
}

function saveJournalEntry() {
  const cropEl = document.getElementById('jp-crop');
  const noteEl = document.getElementById('jp-note');
  const crop   = cropEl?.value;
  const task   = window._jpSelectedTask;
  const note   = noteEl?.value.trim() || '';
  const weather= window._jpSelectedWeather || '☀️';

  if (!crop) { alert('작물을 선택하세요'); return; }
  if (!task) { alert('작업을 선택하세요'); return; }

  const date = todayStr();
  if (!STATE.journal.entries[date]) STATE.journal.entries[date] = [];
  STATE.journal.entries[date].unshift({ cropName:crop, task, note, weather });
  saveState();

  document.getElementById('journal-popup')?.remove();

  // 3탭에 있으면 목록 갱신
  if (STATE.currentTab === 'journal') renderJournal();
}

// ══════════════════════════════════════════════
// 4탭 — 정보 연결
// ══════════════════════════════════════════════
function renderInfo() {
  const el = document.getElementById('screen-info');

  el.innerHTML = `
    <!-- 재배력 참고자료 -->
    <div class="card">
      <div class="card-title"><span class="ct">📖 재배력 참고자료</span></div>
      ${[
        { icon:'🌿', cls:'li-green', name:'텃밭작물 재배캘린더 (봄)',
          desc:'농사로 · 중부지방 3~7월 기준', url:'https://www.nongsaro.go.kr/portal/ps/psz/psza/contentSub.ps?menuId=PS03172&sSeCode=335001&cntntsNo=200890' },
        { icon:'🍂', cls:'li-amber', name:'텃밭작물 재배캘린더 (가을)',
          desc:'농사로 · 중부지방 8~11월 기준', url:'https://www.nongsaro.go.kr/portal/ps/psz/psza/contentSub.ps?menuId=PS03172&sSeCode=335001&cntntsNo=202079' },
        { icon:'📋', cls:'li-teal',  name:'농작업일정 (작물별 상세)',
          desc:'농사로 · 작물별 월력 원문', url:'https://www.nongsaro.go.kr/portal/ps/psb/psbl/workScheduleLst.ps?menuId=PS00087' },
        { icon:'📚', cls:'li-blue',  name:'텃밭가꾸기 전체 가이드',
          desc:'농사로 · 선택재배·연작장해 등', url:'https://www.nongsaro.go.kr/portal/ps/psz/psza/contentMain.ps?menuId=PS03172' },
      ].map(l => linkRow(l)).join('')}
    </div>

    <!-- 유용한 기능 -->
    <div class="card">
      <div class="card-title"><span class="ct">🔧 유용한 기능</span></div>
      ${[
        { icon:'📷', cls:'li-green',  name:'병해충 사진 진단',
          desc:'농진청 AI · 촬영 즉시 진단·방제약 추천', url:'https://play.google.com/store/apps/details?id=com.nonghyupit.aipest' },
        { icon:'💊', cls:'li-blue',   name:'농약안전정보 PSIS',
          desc:'작물별 등록농약 · 안전사용기준', url:'https://psis.rda.go.kr' },
        { icon:'🌸', cls:'li-pink',   name:'식물 이름 찾기',
          desc:'네이버 스마트렌즈 · 꽃·나무·잡초', url:'https://m.naver.com' },
        { icon:'🌤', cls:'li-teal',   name:'상세 날씨 확인',
          desc:'기상청 공식 앱', url:'https://m.weather.naver.com' },
      ].map(l => linkRow(l)).join('')}
    </div>

    <!-- 관련기관 공지 -->
    <div class="card">
      <div class="card-title"><span class="ct">🏛 관련기관 공지</span></div>
      ${[
        { icon:'🏘', cls:'li-purple', name:'서천군 농업 공지',
          desc:'서천군청 · 농업지원 공지사항', url:'https://www.seocheon.go.kr/cop/bbs/BBSMSTR_000000000056/selectBoardList.do' },
        { icon:'🌾', cls:'li-green',  name:'서천 농업기술센터',
          desc:'영농기술·교육·지원사업 안내', url:'https://www.seocheon.go.kr/farm.do' },
        { icon:'🧪', cls:'li-teal',   name:'충남농업기술원',
          desc:'도 농업기술 공지사항', url:'https://cnnongup.chungnam.go.kr/board/B0013.cs?m=315' },
        { icon:'🛒', cls:'li-amber',  name:'서천 로컬푸드',
          desc:'모바일 납품 신청', url:'https://www.seocheon.go.kr' },
        { icon:'👥', cls:'li-purple', name:'귀농귀촌종합센터',
          desc:'귀농·귀촌 정보 및 커뮤니티', url:'https://www.returnfarm.com' },
      ].map(l => linkRow(l)).join('')}
    </div>
  `;
}

function linkRow({ icon, cls, name, desc, url }) {
  return `
  <div class="link-row" onclick="window.open('${url}')">
    <div class="link-icon ${cls}">${icon}</div>
    <div class="link-info">
      <div class="link-name">${name}</div>
      <div class="link-desc">${desc}</div>
    </div>
    <span class="link-arrow">›</span>
  </div>`;
}
