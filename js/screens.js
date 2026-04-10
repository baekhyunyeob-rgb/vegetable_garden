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
      <div id="sheet-body" style="position:absolute;bottom:0;left:0;right:0;background:white;border-radius:16px 16px 0 0;max-height:80%;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 14px 40px;transition:transform 0.3s ease;transform:translateY(0);">
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

        <div style="font-size:11px;color:#999;margin-bottom:6px;">🌿 작물 등록</div>

        <div style="position:relative;margin-bottom:8px;">
          <div style="display:flex;gap:6px;align-items:center;">
            <input type="text" id="crop-search-input" placeholder="작물명 입력 (예: 고추)"
              oninput="onCropSearchInput(this.value)"
              style="flex:1;font-size:13px;padding:8px 10px;border:0.5px solid #ddd;border-radius:8px;" />
            <input type="number" id="crop-area-input" placeholder="면적"
              style="width:64px;font-size:13px;padding:8px;border:0.5px solid #ddd;border-radius:8px;" />
            <select id="crop-unit-select"
              style="border:0.5px solid #ddd;border-radius:8px;padding:8px 4px;font-size:11px;color:#666;">
              <option>평</option>
              <option>㎡</option>
            </select>
            <button onclick="addCropFromSearch()"
              style="background:#2E7D32;color:white;border:none;border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;flex-shrink:0;">추가</button>
          </div>
          <div id="crop-autocomplete" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:0.5px solid #ddd;border-radius:8px;z-index:200;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-height:180px;overflow-y:auto;margin-top:2px;"></div>
        </div>

        <div id="crop-list" style="margin-bottom:14px;"></div>

        <button class="btn-primary" style="margin:0;" onclick="confirmEntry()">등록 완료</button>
      </div>
    </div>
  `;

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
        <div style="display:flex;flex-wrap:wrap;gap:4px;cursor:pointer;" onclick="openEditSheet('${jibun}')">
          ${crops.map(c => `
            <span class="badge ${c.badgeClass || getCropBadgeClass(c.name)}">
              ${c.name} ${c.area || '?'}${c.unit || '평'}
            </span>
          `).join('')}
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
  if (!container) return;
  if (!window.kakao) {
    setTimeout(initKakaoMap, 500);
    return;
  }

  kakao.maps.load(() => {
    // 항상 새로 초기화 (시트가 닫혔다 열리면 컨테이너가 새로 생성됨)
    kakaoMap = null;
    kakaoMarker = null;
    parcelPolygon = null;

    const options = {
      center: new kakao.maps.LatLng(36.0776, 126.6914),
      level: 5,
    };
    kakaoMap = new kakao.maps.Map(container, options);
    kakaoGeocoder = new kakao.maps.services.Geocoder();
    kakaoMarker = new kakao.maps.Marker();
    setTimeout(function() { kakaoMap.relayout(); }, 300);
    setTimeout(function() { kakaoMap.relayout(); }, 800);

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
  STATE.farm.pendingCrops = [];
  renderCropList();
  setTimeout(() => { initSheetSwipe(); }, 100);
  setTimeout(() => { initKakaoMap(); }, 600);
}

function openEditSheet(jibun) {
  editingJibun = jibun;
  const crops = STATE.farm.crops.filter(c => c.jibun === jibun);
  STATE.farm.pendingCrops = crops.map(c => ({ ...c }));

  document.getElementById('sheet-title').textContent = jibun.split(' ').slice(-2).join(' ');
  document.getElementById('sheet-delete-btn').style.display = 'block';
  document.getElementById('jibun-input').value = jibun;
  document.getElementById('register-sheet').style.display = 'block';
  initSheetSwipe();

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

  setTimeout(function() { renderCropList(); }, 200);
}

function closeSheetOutside(e) {
  if (e.target.id === 'register-sheet') closeSheet();
}

function closeSheet() {
  document.getElementById('register-sheet').style.display = 'none';
  STATE.farm.pendingCrops = [];
}

// 바텀시트 스와이프 닫기
function initSheetSwipe() {
  const sheetBody = document.getElementById('sheet-body');
  if (!sheetBody) return;

  // 이전 이벤트 제거를 위해 복제
  const newBody = sheetBody.cloneNode(true);
  sheetBody.parentNode.replaceChild(newBody, sheetBody);
  const el = document.getElementById('sheet-body');

  let startY = 0;
  let currentY = 0;
  let startScrollTop = 0;
  let dragging = false;

  el.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
    startScrollTop = el.scrollTop;
    dragging = true;
    el.style.transition = 'none';
  }, { passive: true });

  el.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    // 스크롤이 맨 위이고 아래로 드래그할 때만 따라옴
    if (diff > 0 && startScrollTop === 0) {
      el.style.transform = 'translateY(' + diff + 'px)';
    }
  }, { passive: true });

  el.addEventListener('touchend', function(e) {
    if (!dragging) return;
    dragging = false;
    const diff = currentY - startY;
    el.style.transition = 'transform 0.3s ease';
    if (diff > 80 && startScrollTop === 0) {
      // 80px 이상 내리면 닫기
      el.style.transform = 'translateY(100%)';
      setTimeout(function() {
        closeSheet();
        el.style.transform = 'translateY(0)';
      }, 300);
    } else {
      // 원위치
      el.style.transform = 'translateY(0)';
    }
  }, { passive: true });
}

function onCropSearchInput(val) {
  const autoEl = document.getElementById('crop-autocomplete');
  if (!autoEl) return;
  const q = val.trim();
  if (!q) { autoEl.style.display = 'none'; return; }

  const matches = FARM_CROPS_DB.filter(function(c) {
    return c.name.includes(q);
  });

  if (!matches.length) { autoEl.style.display = 'none'; return; }

  autoEl.style.display = 'block';
  autoEl.innerHTML = matches.map(function(c) {
    return '<div onclick="selectCropFromAuto(\'' + c.name + '\')" ' +
      'style="padding:10px 12px;font-size:12px;cursor:pointer;border-bottom:0.5px solid #f0f0f0;" ' +
      'style="padding:10px 12px;font-size:12px;cursor:pointer;border-bottom:0.5px solid #f0f0f0;">' +
      '<span style="color:#111;">' + c.name + '</span>' +
      '<span style="font-size:10px;color:#999;margin-left:6px;">' + c.cat + '</span>' +
      '</div>';
  }).join('');
}

function selectCropFromAuto(name) {
  const input = document.getElementById('crop-search-input');
  const autoEl = document.getElementById('crop-autocomplete');
  if (input) input.value = name;
  if (autoEl) autoEl.style.display = 'none';
}

function addCropFromSearch() {
  const nameEl = document.getElementById('crop-search-input');
  const areaEl = document.getElementById('crop-area-input');
  const unitEl = document.getElementById('crop-unit-select');
  const autoEl = document.getElementById('crop-autocomplete');

  const name = nameEl ? nameEl.value.trim() : '';
  const area = areaEl ? areaEl.value.trim() : '';
  const unit = unitEl ? unitEl.value : '평';

  if (!name) { alert('작물명을 입력하세요'); return; }

  // DB에서 cntntsNo 찾기
  const found = FARM_CROPS_DB.find(function(c) { return c.name === name; });
  const cntntsNo = found ? found.cntntsNo : null;
  const cat = found ? found.cat : '기타';

  if (!STATE.farm.pendingCrops) STATE.farm.pendingCrops = [];

  // 중복 확인
  if (STATE.farm.pendingCrops.find(function(c) { return c.name === name; })) {
    alert('이미 추가된 작물이에요');
    return;
  }

  STATE.farm.pendingCrops.push({ name, area, unit, cat, cntntsNo });

  // 입력창 초기화
  if (nameEl) nameEl.value = '';
  if (areaEl) areaEl.value = '';
  if (autoEl) autoEl.style.display = 'none';

  renderCropList();
}

function renderCropList() {
  const listEl = document.getElementById('crop-list');
  if (!listEl) return;
  const crops = STATE.farm.pendingCrops || [];
  if (!crops.length) { listEl.innerHTML = ''; return; }

  listEl.innerHTML = '<div style="background:#f8f8f8;border-radius:8px;padding:10px;">' +
    crops.map(function(c, i) {
      return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
        '<span style="flex:1;font-size:12px;color:#111;">' + c.name + '</span>' +
        (c.cntntsNo ?
          '<span style="font-size:9px;color:#2E7D32;background:#EAF3DE;padding:2px 5px;border-radius:4px;">📅월력</span>' :
          '<span style="font-size:9px;color:#999;background:#f0f0f0;padding:2px 5px;border-radius:4px;">정보없음</span>') +
        '<input type="number" placeholder="면적" value="' + (c.area||'') + '"' +
        ' oninput="updatePendingArea2(' + i + ',this.value)"' +
        ' style="width:60px;font-size:12px;padding:5px;border:0.5px solid #ddd;border-radius:6px;" />' +
        '<select oninput="updatePendingUnit2(' + i + ',this.value)"' +
        ' style="border:0.5px solid #ddd;border-radius:6px;padding:5px 3px;font-size:11px;color:#666;">' +
        '<option' + (c.unit==='평'?' selected':'') + '>평</option>' +
        '<option' + (c.unit==='㎡'?' selected':'') + '>㎡</option>' +
        '</select>' +
        '<button onclick="removePendingCrop(' + i + ')" ' +
        'style="color:#E24B4A;background:none;border:none;font-size:14px;cursor:pointer;padding:0 4px;">×</button>' +
        '</div>';
    }).join('') +
    '</div>';
}

function updatePendingArea2(idx, val) {
  if (STATE.farm.pendingCrops && STATE.farm.pendingCrops[idx]) {
    STATE.farm.pendingCrops[idx].area = val;
  }
}
function updatePendingUnit2(idx, val) {
  if (STATE.farm.pendingCrops && STATE.farm.pendingCrops[idx]) {
    STATE.farm.pendingCrops[idx].unit = val;
  }
}
function removePendingCrop(idx) {
  if (STATE.farm.pendingCrops) {
    STATE.farm.pendingCrops.splice(idx, 1);
    renderCropList();
  }
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
      <div id="weather-week" style="display:flex;gap:4px;overflow-x:auto;"></div>
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
  loadWeather();
}

function getWeatherIcon(sky, pty) {
  if (pty === '1') return '🌧';
  if (pty === '2') return '🌨';
  if (pty === '3') return '❄️';
  if (sky === '1') return '☀️';
  if (sky === '3') return '⛅';
  if (sky === '4') return '☁️';
  return '🌤';
}

async function loadWeather() {
  const KEY = '58b48b0d19a525cf18e98d85a1b68cc560700393a7ed41f7538cc0758386b039';
  const nx = 54, ny = 89;
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  let yyyy = now.getFullYear();
  let mm = pad(now.getMonth()+1);
  let dd = pad(now.getDate());
  let baseDate = `${yyyy}${mm}${dd}`;
  const hours = now.getHours();
  const baseTimes = [2,5,8,11,14,17,20,23];
  let baseHour = baseTimes.filter(h => h <= hours).pop();
  if (baseHour === undefined) {
    const yesterday = new Date(now - 86400000);
    yyyy = yesterday.getFullYear();
    mm = pad(yesterday.getMonth()+1);
    dd = pad(yesterday.getDate());
    baseDate = `${yyyy}${mm}${dd}`;
    baseHour = 23;
  }
  const baseTime = pad(baseHour) + '00';

  try {
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KEY}&numOfRows=500&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
    const res = await fetch(url);
    const data = await res.json();
    const items = data.response.body.items.item;

    const byTime = {};
    items.forEach(item => {
      const key = item.fcstDate + item.fcstTime;
      if (!byTime[key]) byTime[key] = { date: item.fcstDate, time: item.fcstTime };
      byTime[key][item.category] = item.fcstValue;
    });
    const slots = Object.values(byTime).sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time));
    const nowStr = baseDate + pad(hours) + '00';
    const current = slots.find(s => s.date+s.time >= nowStr) || slots[0];

    if (current) {
      const icon = getWeatherIcon(current.SKY, current.PTY);
      const tmp = current.TMP || '--';
      const pop = current.POP || '0';
      const wsd = current.WSD || '--';
      const h = String(current.time).slice(0,2);
      document.getElementById('weather-today').innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:36px;">${icon}</span>
          <div>
            <div style="font-size:22px;font-weight:600;color:#111;">${tmp}°C</div>
            <div style="font-size:11px;color:#999;">강수확률 ${pop}% · 풍속 ${wsd}m/s</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:#999;">서천군</div>
          <div style="font-size:10px;color:#999;">${h}시 기준</div>
        </div>
      `;
    }

    // 6시간 간격 슬롯 필터링 (00, 06, 12, 18시)
    const graphSlots = slots.filter(s => ['0000','0600','1200','1800'].includes(s.time));
    const weekEl = document.getElementById('weather-week');
    if (weekEl && graphSlots.length > 0) {
      renderWeatherGraph(weekEl, graphSlots);
    }
  } catch(e) {
    console.error('날씨 로딩 오류:', e);
    const el = document.getElementById('weather-today');
    if (el) el.innerHTML = '<div style="font-size:12px;color:#ccc;">날씨 정보를 불러올 수 없어요</div>';
  }
}


function renderWeatherGraph(el, slots) {
  const temps = slots.map(s => parseFloat(s.TMP) || 0);
  const minT = Math.min(...temps) - 2;
  const maxT = Math.max(...temps) + 2;
  const range = maxT - minT || 1;

  const W = 320, H = 100, padL = 24, padR = 8, padT = 10, padB = 30;
  const gW = W - padL - padR;
  const gH = H - padT - padB;
  const n = slots.length;
  const xStep = gW / (n - 1);

  const xPos = (i) => padL + i * xStep;
  const yPos = (t) => padT + gH - ((t - minT) / range) * gH;

  // 선 path
  const linePath = slots.map((s, i) => {
    const x = xPos(i);
    const y = yPos(parseFloat(s.TMP) || 0);
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');

  // 채우기 path
  const fillPath = linePath
    + ' L' + xPos(n-1).toFixed(1) + ',' + (padT+gH)
    + ' L' + padL.toFixed(1) + ',' + (padT+gH) + ' Z';

  // 날짜 구분선
  let dateDividers = '';
  let prevDate = '';
  slots.forEach((s, i) => {
    if (s.date !== prevDate && i > 0) {
      const x = xPos(i).toFixed(1);
      dateDividers += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT+gH}" stroke="#eee" stroke-width="1" stroke-dasharray="3,2"/>`;
    }
    prevDate = s.date;
  });

  // 포인트 + 아이콘 + 라벨
  let points = '', labels = '', icons = '';
  slots.forEach((s, i) => {
    const x = xPos(i);
    const y = yPos(parseFloat(s.TMP) || 0);
    const h = String(s.time).slice(0,2);
    const icon = getWeatherIcon(s.SKY, s.PTY);
    const pop = parseInt(s.POP || 0);
    const isNewDay = i === 0 || s.date !== slots[i-1].date;
    const mm = s.date.slice(4,6), dd = s.date.slice(6,8);
    const label = isNewDay ? `${parseInt(mm)}/${parseInt(dd)}` : `${parseInt(h)}시`;
    const popColor = pop >= 60 ? '#378ADD' : pop >= 30 ? '#7BB8E8' : '#ccc';

    points += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#2E7D32"/>`;
    icons += `<text x="${x.toFixed(1)}" y="${(padT-2).toFixed(1)}" text-anchor="middle" font-size="12">${icon}</text>`;
    labels += `<text x="${x.toFixed(1)}" y="${(padT+gH+12).toFixed(1)}" text-anchor="middle" font-size="8" fill="#999">${label}</text>`;
    labels += `<text x="${x.toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="middle" font-size="8" fill="#2E7D32">${(parseFloat(s.TMP)||0).toFixed(0)}°</text>`;
    if (pop > 0) {
      labels += `<text x="${x.toFixed(1)}" y="${(padT+gH+22).toFixed(1)}" text-anchor="middle" font-size="7" fill="${popColor}">${pop}%</text>`;
    }
  });

  el.innerHTML = `
    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;">
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4CAF50" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#4CAF50" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${dateDividers}
        <path d="${fillPath}" fill="url(#tempGrad)"/>
        <path d="${linePath}" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        ${icons}
        ${points}
        ${labels}
      </svg>
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
  const myCrops = [...new Set(STATE.farm.crops.map(c => c.name))];

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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:12px;font-weight:500;">📋 내 작물 농사 정보</span>
        <span style="font-size:10px;color:#999;">농사로 제공</span>
      </div>
      ${myCrops.length === 0 ? `
        <div style="text-align:center;padding:20px 0;color:#ccc;font-size:12px;">
          내 텃밭에 작물을 등록하면<br>농사 정보를 바로 확인할 수 있어요
        </div>
      ` : `
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
          ${myCrops.map((name, i) => {
            const info = getNongsaroInfo(name);
            const badge = info.type === 'text' ? '📖' : info.type === 'file' ? '📥' : '—';
            return `<button onclick="showNongsaroInfo('${name}', ${i})" id="nc-btn-${i}"
              style="font-size:10px;padding:5px 10px;border-radius:10px;cursor:pointer;
                     border:0.5px solid ${i===0?'#2E7D32':'#eee'};
                     background:${i===0?'#2E7D32':'white'};
                     color:${i===0?'white':'#666'};">
              ${badge} ${name}
            </button>`;
          }).join('')}
        </div>
        <div id="nongsaro-content" style="min-height:60px;"></div>
      `}
    </div>

    <div class="card">
      <div style="font-size:12px;font-weight:500;margin-bottom:8px;">🔗 유용한 서비스</div>
      ${[
        {icon:'📷', cls:'li-green', name:'병해충 사진 진단',  desc:'농진청 AI · 촬영 즉시 진단·방제약 추천', url:'https://play.google.com/store/apps/details?id=com.nonghyupit.aipest'},
        {icon:'🌸', cls:'li-pink',  name:'식물 이름 찾기',   desc:'네이버 스마트렌즈 · 꽃·나무·잡초', url:'https://m.naver.com'},
        {icon:'💊', cls:'li-blue',  name:'농약안전정보 PSIS', desc:'작물별 등록농약 · 안전사용기준', url:'https://psis.rda.go.kr'},
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

  if (myCrops.length > 0) showNongsaroInfo(myCrops[0], 0);
}

let nongsaroCache = {};

async function showNongsaroInfo(cropName, idx) {
  document.querySelectorAll('[id^="nc-btn-"]').forEach(function(btn, i) {
    btn.style.background = i === idx ? '#2E7D32' : 'white';
    btn.style.color = i === idx ? 'white' : '#666';
    btn.style.borderColor = i === idx ? '#2E7D32' : '#eee';
  });

  const contentEl = document.getElementById('nongsaro-content');
  if (!contentEl) return;

  if (nongsaroCache[cropName]) {
    contentEl.innerHTML = nongsaroCache[cropName];
    return;
  }

  contentEl.innerHTML = '<div style="color:#999;font-size:11px;padding:10px 0;">정보 불러오는 중...</div>';

  const info = getNongsaroInfo(cropName);
  const fileSection = info.fileInfo ? buildFileSection(info.fileInfo) : '';
  let html = '';

  if (info.type === 'none') {
    html = renderNoneSection(cropName);
  } else if (info.type === 'file_only') {
    html = renderFileOnlySection(info.fileInfo);
  } else if (info.type === 'csv') {
    html = renderCsvSection(info.csvData) + fileSection;
  } else if (info.type === 'api') {
    try {
      html = await fetchApiSection(cropName) + fileSection;
    } catch(e) {
      html = '<div style="color:#ccc;font-size:11px;padding:10px 0;text-align:center;">정보를 불러올 수 없어요</div>';
    }
  }

  nongsaroCache[cropName] = html;
  contentEl.innerHTML = html;
}

function renderNoneSection(cropName) {
  return '<div style="background:#f8f8f8;border-radius:8px;padding:12px;text-align:center;">' +
    '<div style="font-size:13px;margin-bottom:4px;">😔</div>' +
    '<div style="font-size:12px;color:#666;margin-bottom:2px;">' + cropName + ' 농사 정보가 없어요</div>' +
    '<div style="font-size:10px;color:#bbb;">농사로에서 제공하지 않는 작물이에요</div></div>';
}

function renderFileOnlySection(fileInfo) {
  return '<div style="background:#EAF3DE;border-radius:8px;padding:12px;">' +
    '<div style="font-size:12px;font-weight:500;color:#27500A;margin-bottom:6px;">📥 ' + fileInfo.key + ' 농작업 일정</div>' +
    '<div style="font-size:11px;color:#555;margin-bottom:10px;line-height:1.6;">파종·시비·수확 등 월별 농작업 일정을<br>파일로 다운로드해서 확인할 수 있어요.</div>' +
    '<button onclick="window.open(\'' + getFileDownloadUrl(fileInfo.no) + '\')" ' +
    'style="width:100%;padding:9px;background:#2E7D32;color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer;font-weight:500;">' +
    '📥 농작업일정 (' + fileInfo.ext.toUpperCase() + ') 다운로드</button>' +
    '<div style="font-size:10px;color:#999;margin-top:6px;text-align:center;">한글뷰어 또는 PDF 앱 필요</div></div>';
}

function renderCsvSection(d) {
  let sections = '';
  (d.sections || []).slice(0, 2).forEach(function(s) {
    if (s.c) {
      sections += '<div style="margin-top:8px;">' +
        '<div style="font-size:10px;color:#2E7D32;font-weight:500;margin-bottom:2px;">' + s.t + '</div>' +
        '<div style="font-size:11px;color:#444;line-height:1.8;">' + s.c.slice(0, 300) + (s.c.length > 300 ? '...' : '') + '</div></div>';
    }
  });
  return '<div style="background:#EAF3DE;border-radius:8px;padding:12px;">' +
    '<div style="font-size:12px;font-weight:500;color:#27500A;margin-bottom:6px;">📖 ' + d.title + ' 재배 정보</div>' +
    '<div style="font-size:11px;color:#555;line-height:1.8;">' + d.summary + '</div>' +
    sections +
    '<div style="font-size:9px;color:#bbb;margin-top:8px;">출처: 농림수산식품교육문화정보원</div></div>';
}

async function fetchApiSection(cropName) {
  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  const url = 'http://api.nongsaro.go.kr/service/fildMnfct/fildMnfctList?apiKey=' + KEY +
    '&numOfRows=3&pageNo=1&sSeCode=335001&sType=sCntntsSj&sText=' + encodeURIComponent(cropName);
  const res = await fetch(url);
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  const items = xml.querySelectorAll('item');
  if (!items.length) return '<div style="color:#ccc;font-size:11px;padding:10px 0;text-align:center;">정보를 찾을 수 없어요</div>';
  const item = items[0];
  const title = (item.querySelector('cntntsSj') || {}).textContent || cropName;
  const cn = (item.querySelector('cn') || {}).textContent || '';
  const cntntsNo = ((item.querySelector('cntntsNo') || {}).textContent || '').trim();
  const tmp = document.createElement('div');
  tmp.innerHTML = cn;
  const fullText = tmp.textContent.trim();
  const preview = fullText.slice(0, 400);
  return '<div style="background:#EAF3DE;border-radius:8px;padding:12px;">' +
    '<div style="font-size:12px;font-weight:500;color:#27500A;margin-bottom:8px;">📖 ' + title.trim() + ' 재배 정보</div>' +
    '<div style="font-size:11px;color:#444;line-height:1.9;white-space:pre-wrap;">' + preview + (fullText.length > 400 ? '...' : '') + '</div>' +
    '<button onclick="window.open(\'https://www.nongsaro.go.kr/portal/ps/psb/psbk/fildMnfctDtl.ps?cntntsNo=' + cntntsNo + '\')\" ' +
    'style="width:100%;margin-top:10px;padding:8px;background:white;color:#2E7D32;border:0.5px solid #2E7D32;border-radius:8px;font-size:11px;cursor:pointer;">' +
    '농사로에서 전체 보기 ›</button></div>';
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

  ctxEl.innerHTML = ['☀️ 날씨', crops, workStr, '서천읍']
    .map(function(t){return '<span style="font-size:10px;color:#666;background:#f8f8f8;border-radius:4px;padding:2px 6px;">'+t+'</span>';}).join('');

  msgEl.textContent = 'AI 분석 중...';
  msgEl.style.color = '#999';
  actEl.innerHTML = '';

  const prompt = [
    '당신은 충남 서천군 귀농귀촌인을 위한 농업 도우미입니다.',
    '오늘 날짜: ' + today,
    '등록 작물: ' + crops,
    '오늘 재배력 작업: ' + workStr,
    '서천군 병해충 현황: 도열병 주의보 발령 중',
    '위 정보를 바탕으로 오늘 농업 활동에 대한 실용적인 조언을 2~3줄로 간결하게 한국어로 작성해 주세요.',
    '그리고 가장 필요한 행동 1~2개를 JSON 형식으로 추천해 주세요.',
    '형식: {"message":"조언내용","actions":[{"label":"버튼명","url":"연결URL"}]}',
    'URL은 실제 모바일 웹사이트 주소를 사용하세요. JSON만 출력하세요.'
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text).join('') || '';
    const bt = String.fromCharCode(96);
    const cleaned = text.replace(new RegExp(bt+bt+bt+'json','g'), '').replace(new RegExp(bt+bt+bt,'g'), '').trim();
    const parsed = JSON.parse(cleaned);
    msgEl.textContent = parsed.message;
    msgEl.style.color = '#111';
    timeEl.textContent = '방금';
    actEl.innerHTML = (parsed.actions || []).map(function(a) {
      return '<div class="link-row" onclick="window.open(\'' + a.url + '\')" style="border:0.5px solid #eee;border-radius:8px;padding:8px 10px;margin-bottom:4px;">' +
        '<div class="link-info"><div class="link-name">' + a.label + '</div></div>' +
        '<span class="link-arrow" style="color:#2E7D32;">›</span></div>';
    }).join('');
  } catch(e) {
    msgEl.textContent = 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    msgEl.style.color = '#999';
    console.error(e);
  }
}
