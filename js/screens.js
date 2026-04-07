// ════════════════════════════════════════════════════
// 화면 1 — 내 텃밭
// ════════════════════════════════════════════════════

let selectedCatIdx = 0;
let editingJibun = null;

function renderMyFarm() {
  const el = document.getElementById('screen-my-farm');
  const hasCrops = STATE.farm.crops.length > 0;

  el.innerHTML = `
    <div id="farm-list-view">
      ${hasCrops ? renderFarmListHTML() : renderFarmEmptyHTML()}
    </div>

    <div style="height:70px;"></div>
    <div style="position:sticky;bottom:0;background:white;border-top:0.5px solid #eee;padding:10px 14px;">
      <button class="btn-primary" style="margin:0;" onclick="openRegisterSheet()">+ 텃밭 등록하기</button>
    </div>

    <!-- 등록/수정 시트 -->
    <div id="register-sheet" style="display:none;position:absolute;top:0;left:0;right:0;bottom:0;z-index:100;background:rgba(0,0,0,0.4);" onclick="closeSheetOutside(event)">
      <div id="sheet-body" style="position:absolute;bottom:0;left:0;right:0;background:white;border-radius:16px 16px 0 0;max-height:80%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 14px 40px;">
        <div style="width:36px;height:4px;background:#eee;border-radius:2px;margin:0 auto 16px;"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <span style="font-size:15px;font-weight:500;" id="sheet-title">텃밭 등록</span>
          <span id="sheet-delete-btn" style="display:none;font-size:12px;color:#E24B4A;cursor:pointer;" onclick="deleteLandEntry()">이 토지 삭제</span>
        </div>

        <div id="kakao-map" style="width:100%;height:160px;border-radius:10px;margin-bottom:14px;overflow:hidden;"></div>

        <div style="margin-bottom:14px;">
          <div style="font-size:11px;color:#999;margin-bottom:6px;">📍 토지 지번 (주소 입력 후 검색)</div>
          <div style="display:flex;gap:6px;margin-bottom:6px;">
            <input type="text" id="jibun-input" placeholder="예: 충남 서천군 서천읍 화금리 123-4" style="flex:1;" />
            <button onclick="searchAddress()" style="border:0.5px solid #2E7D32;border-radius:8px;padding:8px 10px;font-size:11px;color:#2E7D32;background:white;white-space:nowrap;flex-shrink:0;">검색</button>
          </div>
          <div style="display:flex;gap:6px;">
            <button onclick="findByGPS()" style="border:0.5px solid #2E7D32;border-radius:8px;padding:8px 10px;font-size:11px;color:#2E7D32;background:white;white-space:nowrap;flex-shrink:0;width:100%;">📡 GPS로 현재 위치 찾기</button>
          </div>
          <div style="font-size:10px;color:#bbb;margin-top:4px;">지번을 모르면 GPS 버튼을 눌러주세요</div>
          <div id="parcel-info" style="margin-top:6px;"></div>
        </div>

        <div style="font-size:11px;color:#999;margin-bottom:6px;">🌿 작물 선택</div>
        <div style="display:flex;gap:4px;margin-bottom:8px;" id="cat-tabs">
          ${CROP_CATEGORIES.map((cat, i) => `
            <button onclick="selectCatTab(${i})" id="cat-tab-${i}"
              style="flex:1;font-size:9px;padding:5px 2px;border-radius:12px;border:0.5px solid #eee;color:#999;background:white;white-space:nowrap;cursor:pointer;">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <div style="background:#f8f8f8;border-radius:8px;padding:8px;margin-bottom:8px;">
          <div id="crop-chips" style="display:flex;flex-wrap:wrap;gap:4px;"></div>
        </div>

        <div id="crop-inputs" style="margin-bottom:14px;"></div>

        <button class="btn-primary" style="margin:0;" onclick="confirmEntry()">등록 완료</button>
      </div>
    </div>
  `;

  selectCatTab(0);
}

function renderFarmEmptyHTML() {
  return `
    <div style="text-align:center;padding:60px 20px 20px;">
      <div style="font-size:40px;margin-bottom:12px;">🌱</div>
      <div style="font-size:14px;font-weight:500;color:#111;margin-bottom:6px;">아직 등록된 텃밭이 없어요</div>
      <div style="font-size:12px;color:#999;line-height:1.7;">토지와 작물을 등록하면<br>맞춤 농업 정보를 알려드려요</div>
    </div>
  `;
}

function renderFarmListHTML() {
  const byLand = {};
  STATE.farm.crops.forEach(c => {
    const key = c.jibun || '미지정';
    if (!byLand[key]) byLand[key] = [];
    byLand[key].push(c);
  });

  return Object.entries(byLand).map(([jibun, crops]) => {
    const shortJibun = jibun === '미지정' ? '미지정' : jibun.split(' ').slice(-2).join(' ');
    const totalArea = crops.reduce((s, c) => s + (parseFloat(c.area) || 0), 0);
    const unit = crops[0]?.unit || '평';
    return `
      <div style="background:white;border:0.5px solid #eee;border-radius:12px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span onclick="openEditSheet('${jibun}')" style="font-size:13px;font-weight:500;color:#111;cursor:pointer;flex:1;">${shortJibun}</span>
          <span style="font-size:11px;color:#999;margin-right:8px;">총 ${totalArea}${unit}</span>
          <button onclick="removeByJibun('${jibun}')" style="font-size:11px;color:#E24B4A;border:0.5px solid #E24B4A;border-radius:5px;padding:2px 8px;background:white;cursor:pointer;">삭제</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;" onclick="openEditSheet('${jibun}')" style="cursor:pointer;">
          ${crops.map(c => `
            <span class="badge ${c.badgeClass || getCropBadgeClass(c.name)}">
              ${c.name} ${c.area || '?'}${c.unit || '평'}
            </span>
          `).join('')}
        </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── 카카오맵 ────────────────────────────────────
let kakaoMap = null;
let kakaoMarker = null;
let kakaoGeocoder = null;

function initKakaoMap() {
  const container = document.getElementById('kakao-map');
  if (!container || !window.kakao) return;

  kakao.maps.load(() => {
    // 이미 초기화된 경우 relayout만
    if (kakaoMap) {
      kakaoMap.relayout();
      return;
    }

    const options = {
      center: new kakao.maps.LatLng(36.0776, 126.6914),
      level: 5,
    };
    kakaoMap = new kakao.maps.Map(container, options);
    kakaoGeocoder = new kakao.maps.services.Geocoder();
    kakaoMarker = new kakao.maps.Marker();

    // 지도 클릭 시 좌표 → 주소 변환
    kakao.maps.event.addListener(kakaoMap, 'click', function(mouseEvent) {
      const latlng = mouseEvent.latLng;
      kakaoGeocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const addr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          document.getElementById('jibun-input').value = addr;
          kakaoMarker.setPosition(latlng);
          kakaoMarker.setMap(kakaoMap);
        }
      });
    });
  }); // kakao.maps.load 끝
}

function searchAddress() {
  const keyword = document.getElementById('jibun-input')?.value.trim();
  if (!keyword) { alert('주소를 입력하세요'); return; }
  if (!kakaoGeocoder) return;

  kakaoGeocoder.addressSearch(keyword, function(result, status) {
    if (status === kakao.maps.services.Status.OK) {
      const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      kakaoMap.setCenter(coords);
      kakaoMap.setLevel(3);
      kakaoMarker.setPosition(coords);
      kakaoMarker.setMap(kakaoMap);
      document.getElementById('jibun-input').value = result[0].address_name;
      // 브이월드로 필지 정보 자동 조회
      fetchParcelInfo(result[0].address_name);
    } else {
      alert('주소를 찾을 수 없어요. 더 자세히 입력해보세요.');
    }
  });
}

// 브이월드 필지 정보 조회
async function fetchParcelInfo(address) {
  const infoEl = document.getElementById('parcel-info');
  if (!infoEl) return;
  infoEl.innerHTML = `<span style="font-size:10px;color:#999;">토지 정보 조회 중...</span>`;

  try {
    // 1단계: 주소 → PNU + 좌표
    const geoRes = await fetch(`/api/vworld?action=geocode&address=${encodeURIComponent(address)}`);
    const geoData = await geoRes.json();

    if (geoData.response?.status !== 'OK') {
      infoEl.innerHTML = `<span style="font-size:10px;color:#ccc;">토지 정보를 찾을 수 없어요</span>`;
      return;
    }

    const pnu = geoData.response.refined.structure.level4LC;
    const bonbun = geoData.response.refined.structure.level5;

    // PNU + 본번으로 19자리 PNU 구성
    const fullPnu = pnu + '1' + bonbun.padStart(4,'0') + '0000';

    // 2단계: 토지특성정보 (면적, 지목, 용도지역)
    const landRes = await fetch(`/api/vworld?action=landinfo&pnu=${fullPnu}`);
    const landData = await landRes.json();
    const fields = landData.landCharacteristicss?.field;

    if (!fields || !fields.length) {
      infoEl.innerHTML = `<span style="font-size:10px;color:#ccc;">토지 정보 없음</span>`;
      return;
    }

    // 가장 최근 연도 데이터
    const latest = fields.sort((a,b) => b.stdrYear - a.stdrYear)[0];
    const areaM2 = parseFloat(latest.lndpclAr);
    const areaPyeong = Math.round(areaM2 / 3.306);
    const jimok = latest.lndcgrCodeNm;
    const yongdo = latest.prposArea1Nm;
    const jiga = parseInt(latest.pblntfPclnd).toLocaleString();

    // STATE에 토지 정보 저장
    STATE.farm.currentParcel = { pnu: fullPnu, areaM2, areaPyeong, jimok, yongdo, jiga };

    infoEl.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
        <div style="background:#EAF3DE;border-radius:6px;padding:5px 10px;font-size:11px;">
          <span style="color:#999;font-size:10px;">면적 </span>
          <span style="color:#27500A;font-weight:500;">${areaM2}㎡ (약 ${areaPyeong}평)</span>
        </div>
        <div style="background:#EAF3DE;border-radius:6px;padding:5px 10px;font-size:11px;">
          <span style="color:#999;font-size:10px;">지목 </span>
          <span style="color:#27500A;font-weight:500;">${jimok}</span>
        </div>
        <div style="background:#EAF3DE;border-radius:6px;padding:5px 10px;font-size:11px;">
          <span style="color:#999;font-size:10px;">용도 </span>
          <span style="color:#27500A;font-weight:500;">${yongdo}</span>
        </div>
        <div style="background:#f8f8f8;border-radius:6px;padding:5px 10px;font-size:11px;">
          <span style="color:#999;font-size:10px;">공시지가 </span>
          <span style="color:#111;font-weight:500;">${jiga}원/㎡</span>
        </div>
      </div>
    `;

    // 3단계: 필지 경계선 카카오맵에 표시
    const parcelRes = await fetch(`/api/vworld?action=parcel&pnu=${fullPnu}`);
    const parcelData = await parcelRes.json();
    const features = parcelData.response?.result?.featureCollection?.features;
    if (features && features.length && kakaoMap) {
      drawParcelBoundary(features[0].geometry.coordinates);
    }

  } catch(e) {
    console.error('필지 정보 조회 오류:', e);
    infoEl.innerHTML = `<span style="font-size:10px;color:#ccc;">토지 정보 조회 실패</span>`;
  }
}

// 카카오맵에 필지 경계선 그리기
let parcelPolygon = null;
function drawParcelBoundary(coordinates) {
  if (parcelPolygon) parcelPolygon.setMap(null);
  const path = coordinates[0][0].map(c => new kakao.maps.LatLng(c[1], c[0]));
  parcelPolygon = new kakao.maps.Polygon({
    path,
    strokeWeight: 2,
    strokeColor: '#2E7D32',
    strokeOpacity: 0.9,
    fillColor: '#4CAF50',
    fillOpacity: 0.2,
  });
  parcelPolygon.setMap(kakaoMap);
}

function openRegisterSheet() {
  editingJibun = null;
  STATE.farm.pendingCrops = [];
  document.getElementById('sheet-title').textContent = '텃밭 등록';
  document.getElementById('sheet-delete-btn').style.display = 'none';
  document.getElementById('jibun-input').value = '';
  document.getElementById('register-sheet').style.display = 'block';
  selectCatTab(0);
  setTimeout(() => initKakaoMap(), 300);
}

function openEditSheet(jibun) {
  editingJibun = jibun;
  const crops = STATE.farm.crops.filter(c => c.jibun === jibun);
  STATE.farm.pendingCrops = crops.map(c => ({ ...c }));

  document.getElementById('sheet-title').textContent = jibun.split(' ').slice(-2).join(' ');
  document.getElementById('sheet-delete-btn').style.display = 'block';
  document.getElementById('jibun-input').value = jibun;
  document.getElementById('register-sheet').style.display = 'block';

  setTimeout(() => {
    initKakaoMap();
    // 기존 지번으로 지도 이동
    if (kakaoGeocoder) {
      kakaoGeocoder.addressSearch(jibun, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          kakaoMap.setCenter(coords);
          kakaoMap.setLevel(3);
          kakaoMarker.setPosition(coords);
          kakaoMarker.setMap(kakaoMap);
        }
      });
    }
  }, 100);

  const firstCatId = crops[0]?.category;
  const idx = CROP_CATEGORIES.findIndex(c => c.id === firstCatId);
  selectCatTab(idx >= 0 ? idx : 0);
}

function closeSheetOutside(e) {
  if (e.target.id === 'register-sheet') closeSheet();
}

function closeSheet() {
  document.getElementById('register-sheet').style.display = 'none';
  STATE.farm.pendingCrops = [];
}

function selectCatTab(idx) {
  selectedCatIdx = idx;
  document.querySelectorAll('[id^="cat-tab-"]').forEach((btn, i) => {
    btn.style.background = i === idx ? '#2E7D32' : 'white';
    btn.style.color = i === idx ? 'white' : '#999';
    btn.style.borderColor = i === idx ? '#2E7D32' : '#eee';
    btn.style.fontWeight = i === idx ? '500' : 'normal';
  });
  renderCropChips();
}

function renderCropChips() {
  const cat = CROP_CATEGORIES[selectedCatIdx];
  const chipsEl = document.getElementById('crop-chips');
  if (!chipsEl) return;
  if (!STATE.farm.pendingCrops) STATE.farm.pendingCrops = [];

  const selected = STATE.farm.pendingCrops
    .filter(c => c.category === cat.id).map(c => c.name);

  chipsEl.innerHTML = cat.crops.map(name => `
    <button onclick="toggleCrop('${name}','${cat.id}','${cat.badgeClass}')"
      style="font-size:10px;padding:4px 10px;border-radius:10px;cursor:pointer;margin:2px;
             border:0.5px solid ${selected.includes(name) ? '#2E7D32' : '#eee'};
             background:${selected.includes(name) ? '#2E7D32' : 'white'};
             color:${selected.includes(name) ? 'white' : '#666'};
             font-weight:${selected.includes(name) ? '500' : 'normal'};">
      ${name}
    </button>
  `).join('');

  renderCropInputs(cat);
}

function toggleCrop(name, catId, badgeClass) {
  if (!STATE.farm.pendingCrops) STATE.farm.pendingCrops = [];
  const idx = STATE.farm.pendingCrops.findIndex(c => c.name === name && c.category === catId);
  if (idx >= 0) {
    STATE.farm.pendingCrops.splice(idx, 1);
  } else {
    STATE.farm.pendingCrops.push({ name, category: catId, badgeClass, area: '', unit: '평' });
  }
  renderCropChips();
}

function renderCropInputs(cat) {
  const inputsEl = document.getElementById('crop-inputs');
  if (!inputsEl) return;
  const catCrops = (STATE.farm.pendingCrops || []).filter(c => c.category === cat.id);
  if (!catCrops.length) { inputsEl.innerHTML = ''; return; }

  inputsEl.innerHTML = `
    <div style="background:#f8f8f8;border-radius:8px;padding:10px;">
      ${catCrops.map(c => `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span class="badge ${c.badgeClass}" style="flex-shrink:0;min-width:44px;text-align:center;">${c.name}</span>
          <input type="number" placeholder="면적"
            value="${c.area}"
            onchange="updatePendingArea('${c.name}','${c.category}',this.value)"
            style="width:64px;padding:5px 8px;font-size:12px;" />
          <select onchange="updatePendingUnit('${c.name}','${c.category}',this.value)"
            style="border:0.5px solid #ddd;border-radius:6px;padding:5px;font-size:11px;color:#666;">
            <option ${c.unit==='평'?'selected':''}>평</option>
            <option ${c.unit==='㎡'?'selected':''}>㎡</option>
          </select>
        </div>
      `).join('')}
    </div>
  `;
}

function updatePendingArea(name, catId, val) {
  const c = (STATE.farm.pendingCrops || []).find(c => c.name === name && c.category === catId);
  if (c) c.area = val;
}
function updatePendingUnit(name, catId, val) {
  const c = (STATE.farm.pendingCrops || []).find(c => c.name === name && c.category === catId);
  if (c) c.unit = val;
}

function confirmEntry() {
  const jibun = document.getElementById('jibun-input')?.value.trim();
  if (!jibun) { alert('지번을 입력하세요'); return; }
  if (!STATE.farm.pendingCrops || !STATE.farm.pendingCrops.length) { alert('작물을 선택하세요'); return; }

  if (editingJibun) {
    STATE.farm.crops = STATE.farm.crops.filter(c => c.jibun !== editingJibun);
    STATE.farm.lands = STATE.farm.lands.filter(l => l.jibun !== editingJibun);
  }
  if (!STATE.farm.lands.find(l => l.jibun === jibun)) {
    STATE.farm.lands.push({ jibun, jimok: '밭' });
  }
  STATE.farm.pendingCrops.forEach(c => {
    STATE.farm.crops.push({ ...c, jibun });
  });

  STATE.farm.pendingCrops = [];
  editingJibun = null;
  saveState();
  closeSheet();
  renderMyFarm();
}

function removeByJibun(jibun) {
  if (!confirm(`${jibun.split(' ').slice(-2).join(' ')} 토지를 삭제할까요?`)) return;
  STATE.farm.crops = STATE.farm.crops.filter(c => (c.jibun || '미지정') !== jibun);
  STATE.farm.lands = STATE.farm.lands.filter(l => l.jibun !== jibun);
  saveState();
  renderMyFarm();
}

function deleteLandEntry() {
  if (!editingJibun) return;
  const name = editingJibun.split(' ').slice(-2).join(' ');
  if (!confirm(`${name} 토지를 삭제할까요?`)) return;
  STATE.farm.crops = STATE.farm.crops.filter(c => c.jibun !== editingJibun);
  STATE.farm.lands = STATE.farm.lands.filter(l => l.jibun !== editingJibun);
  saveState();
  closeSheet();
  renderMyFarm();
}

function findByGPS() {
  if (!navigator.geolocation) { alert('GPS를 지원하지 않는 기기입니다.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const coords = new kakao.maps.LatLng(latitude, longitude);

    if (kakaoMap) {
      kakaoMap.setCenter(coords);
      kakaoMap.setLevel(3);
      kakaoMarker.setPosition(coords);
      kakaoMarker.setMap(kakaoMap);
    }

    // 좌표 → 주소 변환
    if (kakaoGeocoder) {
      kakaoGeocoder.coord2Address(longitude, latitude, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          const addr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          document.getElementById('jibun-input').value = addr;
        }
      });
    } else {
      document.getElementById('jibun-input').value = `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    }
  }, () => alert('위치를 가져올 수 없습니다.'));
}

// ════════════════════════════════════════════════════
// 화면 2 — 오늘의 정보
// ════════════════════════════════════════════════════
function renderToday() {
  const el = document.getElementById('screen-today');
  el.innerHTML = `
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
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <button onclick="prevMonth()" style="font-size:20px;color:#2E7D32;background:none;border:none;cursor:pointer;padding:0 6px;">‹</button>
        <span style="font-size:13px;font-weight:500;">${year}년 ${month}월</span>
        <button onclick="nextMonth()" style="font-size:20px;color:#2E7D32;background:none;border:none;cursor:pointer;padding:0 6px;">›</button>
      </div>
      ${renderCalendar(year, month)}
    </div>

    <div class="card" id="work-input-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:500;">오늘 작업</span>
        <button onclick="addWorkLine()" class="btn-outline" style="width:auto;">+ 추가</button>
      </div>
      <div id="work-lines">
        <div style="border:0.5px solid #eee;border-radius:8px;padding:10px;color:#ccc;font-size:11px;">
          월력에서 날짜를 선택하세요
        </div>
      </div>
      <button class="btn-primary" id="work-save-btn" onclick="saveWork()" style="margin-top:8px;display:none;">저장</button>
    </div>

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
    const wIcon = isPast ? '☀️' : '🌤';
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

  const legend = `
    <div style="display:flex;gap:6px;margin-top:8px;padding-top:8px;border-top:0.5px solid #eee;flex-wrap:wrap;align-items:center;">
      ${STATE.farm.crops.slice(0,4).map(c => `<span class="badge ${c.badgeClass}" style="font-size:7px;">${c.name}</span>`).join('')}
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
    el.innerHTML = `<div style="border:0.5px solid #eee;border-radius:8px;padding:10px;color:#ccc;font-size:11px;">월력에서 날짜를 선택하세요</div>`;
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
  pendingWorks.push({ cropName: STATE.farm.crops[0].name, workType: '기타', detail: '', weather: '☀️', date: selectedWorkDate });
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

// ════════════════════════════════════════════════════
// 화면 4 — AI 추천
// ════════════════════════════════════════════════════
function renderAI() {
  const el = document.getElementById('screen-ai');
  el.innerHTML = `
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

  const crops = STATE.farm.crops.map(c => c.name).join('·') || '작물 미등록';
  const today = todayStr();
  const todayWorks = STATE.calendar.works[today] || [];
  const workStr = todayWorks.length ? todayWorks.map(w=>w.workType).join('·') : '작업 없음';

  ctxEl.innerHTML = [`☀️ 날씨`, crops, workStr, '서천읍']
    .map(t => `<span style="font-size:10px;color:#666;background:#f8f8f8;border-radius:4px;padding:2px 6px;">${t}</span>`).join('');

  msgEl.textContent = 'AI 분석 중...';
  msgEl.style.color = '#999';
  actEl.innerHTML = '';

  const prompt = `당신은 충남 서천군 귀농귀촌인을 위한 농업 도우미입니다.
오늘 날짜: ${today}
등록 작물: ${crops}
오늘 재배력 작업: ${workStr}
서천군 병해충 현황: 도열병 주의보 발령 중
위 정보를 바탕으로 오늘 농업 활동에 대한 실용적인 조언을 2~3줄로 간결하게 한국어로 작성해 주세요.
그리고 가장 필요한 행동 1~2개를 JSON 형식으로 추천해 주세요.
형식: {"message":"조언내용","actions":[{"label":"버튼명","url":"연결URL"}]}
URL은 실제 모바일 웹사이트 주소를 사용하세요. JSON만 출력하세요.`.trim();

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text).join('') || '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
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
