// ═══════════════════════════════════════════════
// screens.js — 슬기로운 텃밭 생활
// ═══════════════════════════════════════════════

// ── 전역 변수 ───────────────────────────────────
let editingJibun = null;
let kakaoMap = null;
let kakaoMarker = null;
let kakaoGeocoder = null;
let parcelPolygon = null;
let selectedWorkDate = todayStr();
let pendingWorks = [];
let nongsaroCache = {};

// ── 팜맵 JSONP 직접 호출 ────────────────────────
function fetchFarmmapByPnu(pnu, callback) {
  const KEY = '5CruaVMo0Pnm2aKHdFL4';
  const DOMAIN = 'https://kitchen-garden.vercel.app';
  const cbName = 'farmmapCb_' + Date.now();

  window[cbName] = function(data) {
    delete window[cbName];
    document.getElementById('farmmap-script') && document.getElementById('farmmap-script').remove();
    callback(data);
  };

  const params = new URLSearchParams({
    apiKey: KEY,
    domain: DOMAIN,
    pnu: pnu,
    mapType: 'farmmap',
    columnType: 'KOR',
    apiVersion: 'v2',
    callback: cbName
  });

  const script = document.createElement('script');
  script.id = 'farmmap-script';
  script.src = 'https://agis.epis.or.kr/ASD/farmmapApi/getFarmmapDataSeachPnu.do?' + params;
  script.onerror = function() {
    delete window[cbName];
    callback(null);
  };
  document.head.appendChild(script);
}

// ══════════════════════════════════════════════
// 1. 내 텃밭 탭
// ══════════════════════════════════════════════

function renderMyFarm() {
  const el = document.getElementById('screen-my-farm');
  const crops = STATE.farm.crops;

  el.innerHTML =
    '<div>' +

    // ── 등록된 텃밭 목록 ──
    (crops.length === 0 ?
      '<div style="text-align:center;padding:10px 0 8px;color:#ccc;font-size:12px;">' +
      '아직 등록된 텃밭이 없어요<br>' +
      '<span style="font-size:11px;">토지와 작물을 등록하면 맞춤 농업 정보를 알려드려요</span>' +
      '</div>' :
      renderFarmListHTML()
    ) +

    // ── 등록/수정 폼 ──
    '<div id="farm-form" style="margin-top:12px;background:white;border-radius:14px;border:0.5px solid #eee;overflow:hidden;">' +
      '<div style="padding:14px 14px 0;">' +
        '<div style="font-size:13px;font-weight:500;margin-bottom:12px;" id="form-title">' +
          (editingJibun ? '✏️ 텃밭 수정' : '➕ 텃밭 등록') +
        '</div>' +

        // 지도
        '<div id="kakao-map" style="width:100%;height:180px;border-radius:10px;margin-bottom:12px;background:#e8f0e9;"></div>' +

        // 주소 입력
        '<div style="margin-bottom:10px;">' +
          '<div style="font-size:11px;color:#999;margin-bottom:5px;">📍 토지 지번</div>' +
          '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
            '<input type="text" id="jibun-input" placeholder="예: 충남 서천군 서천읍 화금리 123-4" style="flex:1;font-size:12px;padding:8px 10px;border:0.5px solid #ddd;border-radius:8px;" />' +
            '<button onclick="searchAddress()" style="border:0.5px solid #2E7D32;border-radius:8px;padding:8px 10px;font-size:11px;color:#2E7D32;background:white;white-space:nowrap;">검색</button>' +
          '</div>' +
          '<button onclick="findByGPS()" style="width:100%;border:0.5px solid #2E7D32;border-radius:8px;padding:8px;font-size:11px;color:#2E7D32;background:white;">📡 GPS로 현재 위치 찾기</button>' +
          '<div id="parcel-info" style="margin-top:6px;font-size:10px;color:#999;"></div>' +
        '</div>' +

        // 작물 등록
        '<div style="margin-bottom:10px;">' +
          '<div style="font-size:11px;color:#999;margin-bottom:5px;">🌿 작물 등록</div>' +
          '<div style="position:relative;">' +
            '<div style="display:flex;gap:5px;align-items:center;">' +
              '<input type="text" id="crop-search-input" placeholder="작물명 입력 (예: 고추)" oninput="onCropSearchInput(this.value)" style="flex:1;font-size:12px;padding:8px 10px;border:0.5px solid #ddd;border-radius:8px;" />' +
              '<input type="number" id="crop-area-input" placeholder="면적" style="width:60px;font-size:12px;padding:8px;border:0.5px solid #ddd;border-radius:8px;" />' +
              '<select id="crop-unit-select" style="border:0.5px solid #ddd;border-radius:8px;padding:8px 3px;font-size:11px;color:#666;">' +
                '<option>평</option><option>㎡</option>' +
              '</select>' +
              '<button onclick="addCropFromSearch()" style="background:#2E7D32;color:white;border:none;border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer;flex-shrink:0;">추가</button>' +
            '</div>' +
            '<div id="crop-autocomplete" style="display:none;position:absolute;top:100%;left:0;right:0;background:white;border:0.5px solid #ddd;border-radius:8px;z-index:200;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-height:160px;overflow-y:auto;margin-top:2px;"></div>' +
          '</div>' +
          '<div id="crop-list" style="margin-top:8px;"></div>' +
        '</div>' +
      '</div>' +

      // 버튼
      '<div style="display:flex;gap:8px;padding:12px 14px;">' +
        (editingJibun ?
          '<button onclick="deleteLandEntry()" style="flex:1;padding:11px;background:white;color:#E24B4A;border:0.5px solid #E24B4A;border-radius:10px;font-size:13px;cursor:pointer;">삭제</button>' : '') +
        '<button onclick="confirmEntry()" style="flex:2;padding:11px;background:#2E7D32;color:white;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;">등록 완료</button>' +
      '</div>' +
    '</div>' +

    '</div>';

  // 지도 초기화 (DOM 렌더링 후)
  setTimeout(function() { initKakaoMap(); }, 100);

  // 수정 모드면 기존 데이터 채우기
  if (editingJibun) {
    document.getElementById('jibun-input').value = editingJibun;
    STATE.farm.pendingCrops = STATE.farm.crops
      .filter(function(c) { return c.jibun === editingJibun; })
      .map(function(c) { return Object.assign({}, c); });
    renderCropList();
  } else {
    STATE.farm.pendingCrops = [];
  }
}

function renderFarmListHTML() {
  var byLand = {};
  STATE.farm.crops.forEach(function(c) {
    if (!byLand[c.jibun]) byLand[c.jibun] = [];
    byLand[c.jibun].push(c);
  });

  return Object.entries(byLand).map(function(entry, idx) {
    var jibun = entry[0];
    var crops = entry[1];
    var unit = crops[0] && crops[0].unit ? crops[0].unit : '평';
    var short = jibun.split(' ').slice(-2).join(' ');

    // 지목 정보 (STATE.farm.lands에서)
    var land = STATE.farm.lands && STATE.farm.lands.find(function(l) { return l.jibun === jibun; });
    var jimok = land && land.jimok ? land.jimok : '';
    var landArea = land && land.areaPyeong ? land.areaPyeong + '평' : '';
    var landInfo = jimok && landArea ? '(' + jimok + ' ' + landArea + ')' : jimok ? '(' + jimok + ')' : '';

    var badgeHtml = crops.map(function(c) {
      return '<span style="font-size:10px;background:#EAF3DE;color:#2E7D32;padding:2px 7px;border-radius:8px;white-space:nowrap;">' +
        c.name + ' ' + (c.area || '?') + (c.unit || '평') + '</span>';
    }).join('');

    return '<div style="background:white;border-radius:12px;border:0.5px solid #eee;padding:10px 14px;margin-bottom:8px;">' +
      // 1행: 번호+지번+지목 / 수정
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
        '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' +
          '<span style="font-size:10px;color:white;background:#2E7D32;border-radius:50%;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' + (idx+1) + '</span>' +
          '<span style="font-size:13px;font-weight:500;">' + short + '</span>' +
          (landInfo ? '<span style="font-size:10px;color:#999;">' + landInfo + '</span>' : '') +
        '</div>' +
        '<button onclick="startEdit(\'' + jibun + '\')" style="font-size:11px;color:#2E7D32;background:none;border:0.5px solid #2E7D32;border-radius:6px;padding:2px 8px;cursor:pointer;flex-shrink:0;">수정</button>' +
      '</div>' +
      // 2행: 작물 배지 (들여쓰기)
      '<div style="display:flex;flex-wrap:wrap;gap:4px;padding-left:20px;">' +
        badgeHtml +
      '</div>' +
    '</div>';
  }).join('');
}

function startEdit(jibun) {
  editingJibun = jibun;
  renderMyFarm();
  // 폼으로 스크롤
  setTimeout(function() {
    var form = document.getElementById('farm-form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  }, 200);
}

// ── 카카오맵 ────────────────────────────────────
function initKakaoMap() {
  var container = document.getElementById('kakao-map');
  if (!container) return;
  if (!window.kakao || !window.kakao.maps) {
    setTimeout(initKakaoMap, 300);
    return;
  }

  kakao.maps.load(function() {
    var options = {
      center: new kakao.maps.LatLng(36.0776, 126.6914),
      level: 5,
    };
    kakaoMap = new kakao.maps.Map(container, options);
    kakaoGeocoder = new kakao.maps.services.Geocoder();
    kakaoMarker = new kakao.maps.Marker();

    kakao.maps.event.addListener(kakaoMap, 'click', function(mouseEvent) {
      var latlng = mouseEvent.latLng;
      kakaoGeocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          var addr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name;
          document.getElementById('jibun-input').value = addr;
          kakaoMarker.setPosition(latlng);
          kakaoMarker.setMap(kakaoMap);
        }
      });
    });

    // 수정 모드면 기존 위치로 이동
    if (editingJibun && kakaoGeocoder) {
      kakaoGeocoder.addressSearch(editingJibun, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
          kakaoMap.setCenter(coords);
          kakaoMap.setLevel(3);
          kakaoMarker.setPosition(coords);
          kakaoMarker.setMap(kakaoMap);
        }
      });
    }
  });
}

function searchAddress() {
  var keyword = document.getElementById('jibun-input') && document.getElementById('jibun-input').value.trim();
  if (!keyword) { alert('주소를 입력하세요'); return; }
  if (!kakaoGeocoder) return;
  kakaoGeocoder.addressSearch(keyword, function(result, status) {
    if (status === kakao.maps.services.Status.OK) {
      document.getElementById('jibun-input').value = result[0].address_name;
      var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      kakaoMap.setCenter(coords);
      kakaoMap.setLevel(4);
      kakaoMarker.setPosition(coords);
      kakaoMarker.setMap(kakaoMap);
      fetchParcelInfo(result[0].address_name);
    } else {
      alert('주소를 찾을 수 없어요');
    }
  });
}

function findByGPS() {
  if (!navigator.geolocation) { alert('GPS를 지원하지 않는 기기예요'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    if (!kakaoMap || !kakaoGeocoder) return;
    var coords = new kakao.maps.LatLng(lat, lng);
    kakaoMap.setCenter(coords);
    kakaoMap.setLevel(4);
    kakaoMarker.setPosition(coords);
    kakaoMarker.setMap(kakaoMap);
    kakaoGeocoder.coord2Address(lng, lat, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        var addr = result[0].road_address
          ? result[0].road_address.address_name
          : result[0].address.address_name;
        document.getElementById('jibun-input').value = addr;
        fetchParcelInfo(addr);
      }
    });
  }, function() { alert('위치 정보를 가져올 수 없어요'); });
}

async function fetchParcelInfo(address) {
  var infoEl = document.getElementById('parcel-info');
  if (!infoEl) return;
  infoEl.textContent = '토지 정보 조회 중...';

  try {
    // 1단계: 주소 → 좌표+PNU
    var res1 = await fetch('/api/vworld?action=geocode&address=' + encodeURIComponent(address));
    if (!res1.ok) throw new Error('geocode 실패');
    var geo = await res1.json();

    var result = geo?.response?.result;
    if (!result || !result.point) { infoEl.textContent = '주소를 찾을 수 없어요'; return; }

    var pnu = result.refined?.extendedMap?.고유번호;
    if (!pnu) { infoEl.textContent = '필지 정보를 찾을 수 없어요'; return; }

    infoEl.textContent = '필지 정보 불러오는 중...';

    // 2단계: PNU → 토지임야정보 (면적·지목) — 브라우저에서 직접 호출
    var VWORLD_KEY = 'DFFEFE4F-4658-3690-98E8-5CE7D97D26C1';
    var DOMAIN = 'https://kitchen-garden.vercel.app';
    var landUrl = 'https://api.vworld.kr/ned/data/ladfrlList?key=' + VWORLD_KEY + '&pnu=' + encodeURIComponent(pnu) + '&format=json&domain=' + encodeURIComponent(DOMAIN);
    var res2 = await fetch(landUrl);
    if (!res2.ok) throw new Error('landinfo 실패');
    var land = await res2.json();

    var item = land?.ladfrlVOList?.ladfrlVOList?.[0];
    if (!item) { infoEl.textContent = '토지 정보 없음'; return; }

    var jimok   = item.lndcgrCodeNm || '';   // 지목명 (전·답·대·임야 등)
    var areaSqm = parseFloat(item.lndpclAr) || 0;  // 면적(㎡)
    var areaPyeong = Math.round(areaSqm / 3.305785);

    // STATE에 저장 (등록 완료 시 활용)
    STATE.farm.currentParcel = { address, pnu, jimok, areaSqm, areaPyeong };

    // 화면에 표시
    infoEl.innerHTML =
      '<span style="color:#2E7D32;font-weight:500;">' + jimok + '</span>' +
      ' · ' + areaSqm.toLocaleString() + '㎡ (' + areaPyeong.toLocaleString() + '평)' +
      '<span style="color:#bbb;"> · PNU: ' + pnu + '</span>';

  } catch(e) {
    console.warn('토지정보 조회 실패:', e);
    infoEl.textContent = '토지 정보를 불러올 수 없어요';
  }
}

// ── 작물 검색/등록 ──────────────────────────────
function onCropSearchInput(val) {
  var autoEl = document.getElementById('crop-autocomplete');
  if (!autoEl) return;
  var q = val.trim();
  if (!q) { autoEl.style.display = 'none'; return; }

  var matches = FARM_CROPS_DB.filter(function(c) { return c.name.includes(q); });
  if (!matches.length) { autoEl.style.display = 'none'; return; }

  autoEl.style.display = 'block';
  autoEl.innerHTML = matches.map(function(c) {
    return '<div onclick="selectCropFromAuto(\'' + c.name + '\')" ' +
      'style="padding:10px 12px;font-size:12px;cursor:pointer;border-bottom:0.5px solid #f0f0f0;">' +
      '<span style="color:#111;">' + c.name + '</span>' +
      '<span style="font-size:10px;color:#999;margin-left:6px;">' + c.cat + '</span>' +
      '</div>';
  }).join('');
}

function selectCropFromAuto(name) {
  var input = document.getElementById('crop-search-input');
  var autoEl = document.getElementById('crop-autocomplete');
  if (input) input.value = name;
  if (autoEl) autoEl.style.display = 'none';
}

function addCropFromSearch() {
  var nameEl = document.getElementById('crop-search-input');
  var areaEl = document.getElementById('crop-area-input');
  var unitEl = document.getElementById('crop-unit-select');
  var autoEl = document.getElementById('crop-autocomplete');

  var name = nameEl ? nameEl.value.trim() : '';
  var area = areaEl ? areaEl.value.trim() : '';
  var unit = unitEl ? unitEl.value : '평';

  if (!name) { alert('작물명을 입력하세요'); return; }

  var found = FARM_CROPS_DB.find(function(c) { return c.name === name; });
  var cntntsNo = found ? found.cntntsNo : null;
  var cat = found ? found.cat : '기타';

  if (!STATE.farm.pendingCrops) STATE.farm.pendingCrops = [];
  if (STATE.farm.pendingCrops.find(function(c) { return c.name === name; })) {
    alert('이미 추가된 작물이에요'); return;
  }

  STATE.farm.pendingCrops.push({ name: name, area: area, unit: unit, cat: cat, cntntsNo: cntntsNo });
  if (nameEl) nameEl.value = '';
  if (areaEl) areaEl.value = '';
  if (autoEl) autoEl.style.display = 'none';
  renderCropList();
}

function renderCropList() {
  var listEl = document.getElementById('crop-list');
  if (!listEl) return;
  var crops = STATE.farm.pendingCrops || [];
  if (!crops.length) { listEl.innerHTML = ''; return; }

  listEl.innerHTML = '<div style="background:#f8f8f8;border-radius:8px;padding:8px;">' +
    crops.map(function(c, i) {
      return '<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">' +
        '<span style="flex:1;font-size:12px;color:#111;">' + c.name + '</span>' +
        (c.cntntsNo ?
          '<span style="font-size:9px;color:#2E7D32;background:#EAF3DE;padding:2px 4px;border-radius:4px;">📅월력</span>' :
          '<span style="font-size:9px;color:#999;background:#f0f0f0;padding:2px 4px;border-radius:4px;">정보없음</span>') +
        '<input type="number" placeholder="면적" value="' + (c.area || '') + '"' +
        ' oninput="updatePendingArea2(' + i + ',this.value)"' +
        ' style="width:55px;font-size:11px;padding:4px;border:0.5px solid #ddd;border-radius:6px;" />' +
        '<select oninput="updatePendingUnit2(' + i + ',this.value)"' +
        ' style="border:0.5px solid #ddd;border-radius:6px;padding:4px 2px;font-size:10px;color:#666;">' +
        '<option' + (c.unit === '평' ? ' selected' : '') + '>평</option>' +
        '<option' + (c.unit === '㎡' ? ' selected' : '') + '>㎡</option>' +
        '</select>' +
        '<button onclick="removePendingCrop(' + i + ')" ' +
        'style="color:#E24B4A;background:none;border:none;font-size:14px;cursor:pointer;padding:0 2px;">×</button>' +
        '</div>';
    }).join('') +
    '</div>';
}

function updatePendingArea2(idx, val) {
  if (STATE.farm.pendingCrops && STATE.farm.pendingCrops[idx]) STATE.farm.pendingCrops[idx].area = val;
}
function updatePendingUnit2(idx, val) {
  if (STATE.farm.pendingCrops && STATE.farm.pendingCrops[idx]) STATE.farm.pendingCrops[idx].unit = val;
}
function removePendingCrop(idx) {
  if (STATE.farm.pendingCrops) { STATE.farm.pendingCrops.splice(idx, 1); renderCropList(); }
}

function confirmEntry() {
  var jibun = document.getElementById('jibun-input') && document.getElementById('jibun-input').value.trim();
  if (!jibun) { alert('지번을 입력하세요'); return; }
  if (!STATE.farm.pendingCrops || !STATE.farm.pendingCrops.length) { alert('작물을 추가하세요'); return; }

  if (editingJibun) {
    STATE.farm.crops = STATE.farm.crops.filter(function(c) { return c.jibun !== editingJibun; });
    STATE.farm.lands = STATE.farm.lands.filter(function(l) { return l.jibun !== editingJibun; });
  }
  if (!STATE.farm.lands.find(function(l) { return l.jibun === jibun; })) {
    var parcel = STATE.farm.currentParcel;
    STATE.farm.lands.push({
      jibun:      jibun,
      pnu:        parcel ? parcel.pnu        : null,
      jimok:      parcel ? parcel.jimok      : '',
      areaSqm:    parcel ? parcel.areaSqm    : null,
      areaPyeong: parcel ? parcel.areaPyeong : null,
    });
  }
  STATE.farm.pendingCrops.forEach(function(c) {
    STATE.farm.crops.push(Object.assign({}, c, { jibun: jibun }));
  });

  STATE.farm.pendingCrops = [];
  editingJibun = null;
  saveState();
  renderMyFarm();
}

function deleteLandEntry() {
  if (!editingJibun) return;
  if (!confirm(editingJibun.split(' ').slice(-2).join(' ') + ' 토지를 삭제할까요?')) return;
  STATE.farm.crops = STATE.farm.crops.filter(function(c) { return c.jibun !== editingJibun; });
  STATE.farm.lands = STATE.farm.lands.filter(function(l) { return l.jibun !== editingJibun; });
  editingJibun = null;
  saveState();
  renderMyFarm();
}

function removeByJibun(jibun) {
  if (!confirm(jibun.split(' ').slice(-2).join(' ') + ' 토지를 삭제할까요?')) return;
  STATE.farm.crops = STATE.farm.crops.filter(function(c) { return c.jibun !== jibun; });
  STATE.farm.lands = STATE.farm.lands.filter(function(l) { return l.jibun !== jibun; });
  saveState();
  renderMyFarm();
}

function renderToday() {
  const el = document.getElementById('screen-today');
  el.innerHTML = `
    <div class="card">
      <div class="card-title">
        <span class="ct">날씨</span>
        <span class="ct-more" onclick="toggleAgriWeather()">농업기상 상세 ›</span>
      </div>
      <div id="weather-today" style="display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;margin-bottom:6px;border-bottom:0.5px solid #eee;">
        <div style="font-size:13px;color:#999;">날씨 정보 로딩 중...</div>
      </div>
      <div id="weather-week" style="display:flex;gap:4px;overflow-x:auto;"></div>
    </div>

    <div class="card" id="agri-weather-card" style="display:none;">
      <div class="card-title">
        <span class="ct">농업기상 상세</span>
        <span style="font-size:10px;color:#999;">군산 개정면 (서천 인근)</span>
      </div>
      <div id="agri-weather-content">
        <div style="font-size:12px;color:#999;text-align:center;padding:10px;">로딩 중...</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="ct">가용자원</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div onclick="alert('토질 상세 준비중')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">토질</div>
          <div style="font-size:14px;font-weight:500;">—</div>
          <div style="font-size:10px;color:#999;margin-top:2px;">준비중</div>
        </div>
        <div onclick="alert('지하수 상세 준비중')" style="background:#f8f8f8;border-radius:8px;padding:10px;cursor:pointer;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">지하수</div>
          <div style="font-size:14px;font-weight:500;">—</div>
          <div style="font-size:10px;color:#999;margin-top:2px;">준비중</div>
        </div>
        <div id="agri-soil" style="background:#f8f8f8;border-radius:8px;padding:10px;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">토양수분</div>
          <div style="font-size:14px;font-weight:500;">—</div>
          <div style="font-size:10px;color:#999;margin-top:2px;">로딩 중</div>
        </div>
        <div id="agri-rain" style="background:#f8f8f8;border-radius:8px;padding:10px;">
          <div style="font-size:10px;color:#999;margin-bottom:4px;">일 강수량</div>
          <div style="font-size:14px;font-weight:500;">—</div>
          <div style="font-size:10px;color:#999;margin-top:2px;">로딩 중</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="ct">관련 기관</span></div>
      ${[
        {badge:'서천군', cls:'#EEEDFE', tc:'#3C3489', label:'공지사항', url:'https://www.seocheon.go.kr/cop/bbs/BBSMSTR_000000000056/selectBoardList.do'},
        {badge:'서천군', cls:'#EEEDFE', tc:'#3C3489', label:'일반공고', url:'https://seocheon.go.kr/kor/sub04_06_06.do'},
        {badge:'서천농기센', cls:'#E6F1FB', tc:'#0C447C', label:'공지사항', url:'https://www.seocheon.go.kr/farm.do'},
        {badge:'충남농기원', cls:'#EAF3DE', tc:'#27500A', label:'공지사항', url:'https://cnnongup.chungnam.go.kr/board/B0013.cs?m=315'},
        {badge:'치유농업ON', cls:'#FAEEDA', tc:'#633806', label:'홈페이지', url:'https://www.agrohealing.go.kr'},
      ].map(o => `
        <div class="link-row" onclick="window.open('${o.url}')">
          <span style="font-size:9px;padding:2px 5px;border-radius:4px;font-weight:500;background:${o.cls};color:${o.tc};white-space:nowrap;width:58px;text-align:center;">${o.badge}</span>
          <span style="flex:1;font-size:12px;color:#444;">${o.label}</span>
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
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
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
  // 재배력 배지 로드
  renderFarmScheduleBadges(STATE.calendar.year, STATE.calendar.month);
}

// ── 농업기상 상세 (군산 개정면 관측소) ──────────────────
let agriWeatherVisible = false;

function toggleAgriWeather() {
  var card = document.getElementById('agri-weather-card');
  if (!card) return;
  agriWeatherVisible = !agriWeatherVisible;
  card.style.display = agriWeatherVisible ? 'block' : 'none';
  if (agriWeatherVisible) loadAgriWeather();
}

async function loadAgriWeather() {
  var contentEl = document.getElementById('agri-weather-content');
  if (!contentEl) return;

  var today = todayStr();
  try {
    var res = await fetch('/api/agriweather?date=' + today);
    if (!res.ok) throw new Error('agriweather 오류');
    var data = await res.json();
    var items = data.items || [];

    if (!items.length) {
      contentEl.innerHTML = '<div style="font-size:11px;color:#ccc;text-align:center;padding:10px;">오늘 데이터 없음</div>';
      return;
    }

    // 06, 12, 18, 00시 4개 시간대만 필터
    var TARGET_HOURS = ['06:00', '12:00', '18:00', '00:00'];
    var slotItems = TARGET_HOURS.map(function(h) {
      return items.find(function(i) { return i.dateTime && i.dateTime.slice(11,16) === h; }) || null;
    }).filter(Boolean);

    // 가용 전체 데이터에서 요약값 계산
    var totalRain = items.reduce(function(s, i) { return s + (parseFloat(i.rn) || 0); }, 0);
    var temps = items.map(function(i) { return parseFloat(i.tmprt); }).filter(function(v) { return !isNaN(v); });
    var maxT = temps.length ? Math.max.apply(null, temps) : null;
    var minT = temps.length ? Math.min.apply(null, temps) : null;
    var latest = items.filter(function(i) { return i.tmprt; }).pop() || items[items.length-1];

    // 가용자원 카드 업데이트
    var soilEl = document.getElementById('agri-soil');
    if (soilEl && latest && latest.soilMitr) {
      soilEl.innerHTML =
        '<div style="font-size:10px;color:#999;margin-bottom:4px;">토양수분</div>' +
        '<div style="font-size:14px;font-weight:500;">' + parseFloat(latest.soilMitr).toFixed(1) + '%</div>' +
        '<div style="font-size:10px;color:#2E7D32;margin-top:2px;">10cm 깊이</div>';
    }
    var rainEl = document.getElementById('agri-rain');
    if (rainEl) {
      rainEl.innerHTML =
        '<div style="font-size:10px;color:#999;margin-bottom:4px;">일 강수량</div>' +
        '<div style="font-size:14px;font-weight:500;">' + totalRain.toFixed(1) + 'mm</div>' +
        '<div style="font-size:10px;color:' + (totalRain > 0 ? '#378ADD' : '#999') + ';margin-top:2px;">' +
        (totalRain > 0 ? '비 있음' : '강수 없음') + '</div>';
    }

    // 헤더: 오늘 최고/최저 요약
    var summaryHtml = '';
    if (maxT !== null && minT !== null) {
      summaryHtml =
        '<div style="display:flex;gap:12px;padding:8px 0 10px;border-bottom:0.5px solid #eee;margin-bottom:8px;">' +
        '<span style="font-size:11px;color:#666;">최고 <b style="color:#E24B4A;">' + maxT.toFixed(1) + '°</b></span>' +
        '<span style="font-size:11px;color:#666;">최저 <b style="color:#378ADD;">' + minT.toFixed(1) + '°</b></span>' +
        '<span style="font-size:11px;color:#666;">강수 <b>' + totalRain.toFixed(1) + 'mm</b></span>' +
        '</div>';
    }

    // 6시간 단위 테이블
    var def = function(v, unit, dec) {
      if (!v || v === '') return '—';
      var n = parseFloat(v);
      return isNaN(n) ? '—' : n.toFixed(dec !== undefined ? dec : 1) + (unit || '');
    };

    var tableHtml =
      '<table style="width:100%;font-size:10px;border-collapse:collapse;">' +
      '<thead><tr style="border-bottom:0.5px solid #eee;">' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:left;">시간</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">기온</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">강수</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">일사량</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">토양수분</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">토양온도</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">지표온도</th>' +
      '<th style="padding:3px 2px;color:#999;font-weight:400;text-align:center;">이슬(분)</th>' +
      '</tr></thead><tbody>' +
      slotItems.map(function(item) {
        var h = item.dateTime ? item.dateTime.slice(11,16) : '';
        return '<tr style="border-bottom:0.5px solid #f5f5f5;">' +
          '<td style="padding:4px 2px;color:#2E7D32;font-weight:500;">' + h + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.tmprt, '°') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;color:#378ADD;">' + def(item.rn, 'mm') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.srqty, '') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.soilMitr, '%') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.soilTp, '°') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.frfr_Tp, '°') + '</td>' +
          '<td style="padding:4px 2px;text-align:center;">' + def(item.dwcnTime, '', 0) + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>';

    contentEl.innerHTML =
      summaryHtml + tableHtml +
      '<div style="font-size:9px;color:#ccc;margin-top:6px;text-align:right;">출처: 농촌진흥청 군산 개정면 관측소</div>';

  } catch(e) {
    if (contentEl) contentEl.innerHTML = '<div style="font-size:11px;color:#ccc;text-align:center;padding:10px;">데이터를 불러올 수 없어요</div>';
    console.warn('농업기상 오류:', e);
  }
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
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${KEY}&numOfRows=1000&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;
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
  // 3일치 (12슬롯) 제한
  slots = slots.slice(0, 12);
  const n = slots.length;
  if (!n) return;

  const temps = slots.map(s => parseFloat(s.TMP) || 0);
  const minT = Math.min(...temps) - 2;
  const maxT = Math.max(...temps) + 2;
  const range = maxT - minT || 1;

  // 레이아웃
  const xStep = 28;
  const padL = 20, padR = 8;
  const W = padL + xStep * (n - 1) + padR;

  // 높이 구역 정의
  const iconY   = 14;   // 아이콘 중심
  const graphT  = 24;   // 그래프 상단
  const graphB  = 80;   // 그래프 하단
  const popY    = 90;   // 강수확률 텍스트
  const timeY   = 101;  // 시간 텍스트
  const dateH   = 16;   // 날짜 띠 높이
  const H       = timeY + dateH + 4;

  const gH = graphB - graphT;
  const xPos = (i) => padL + i * xStep;
  const yPos = (t) => graphT + gH - ((t - minT) / range) * gH;

  // 기온선
  const linePath = slots.map((s, i) => {
    const x = xPos(i), y = yPos(parseFloat(s.TMP) || 0);
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  const fillPath = linePath
    + ' L' + xPos(n-1).toFixed(1) + ',' + graphB
    + ' L' + padL.toFixed(1) + ',' + graphB + ' Z';

  // 날짜 띠 (교대 배경)
  let dateBands = '';
  let dateTexts = '';
  let dividers = '';
  let dayStarts = []; // [{i, date}]
  let prevDate = '';
  slots.forEach((s, i) => {
    if (s.date !== prevDate) {
      dayStarts.push({ i, date: s.date });
      prevDate = s.date;
    }
  });
  dayStarts.forEach((d, di) => {
    const x1 = xPos(d.i) - xStep/2;
    const nextI = dayStarts[di+1] ? dayStarts[di+1].i : n;
    const x2 = xPos(nextI-1) + xStep/2;
    const bw = x2 - x1;
    const bandY = timeY + 4;
    // 교대 배경
    const bgColor = di % 2 === 0 ? '#f0f4f0' : '#e8f0e8';
    dateBands += `<rect x="${x1.toFixed(1)}" y="${bandY}" width="${bw.toFixed(1)}" height="${dateH}" fill="${bgColor}" rx="3"/>`;
    // 날짜 텍스트
    const mm = parseInt(d.date.slice(4,6));
    const dd = parseInt(d.date.slice(6,8));
    const dow = ['일','월','화','수','목','금','토'][new Date(parseInt(d.date.slice(0,4)), mm-1, dd).getDay()];
    const cx = ((x1 + x2) / 2).toFixed(1);
    const dowColor = dow === '일' ? '#E24B4A' : dow === '토' ? '#378ADD' : '#333';
    dateTexts += `<text x="${cx}" y="${(bandY + dateH - 4).toFixed(1)}" text-anchor="middle" font-size="9" font-weight="600" fill="${dowColor}">${mm}/${dd} ${dow}</text>`;
    // 날짜 경계 점선 (첫날 제외)
    if (di > 0) {
      const dx = xPos(d.i) - xStep/2;
      dividers += `<line x1="${dx.toFixed(1)}" y1="${graphT}" x2="${dx.toFixed(1)}" y2="${timeY+4+dateH}" stroke="#ddd" stroke-width="0.5" stroke-dasharray="3,2"/>`;
    }
  });

  // 포인트 + 아이콘 + 기온 + 강수확률 + 시간
  let points = '', tempLabels = '', icons = '', popLabels = '', timeLabels = '';
  slots.forEach((s, i) => {
    const x = xPos(i);
    const y = yPos(parseFloat(s.TMP) || 0);
    const h = parseInt(String(s.time).slice(0,2));
    const icon = getWeatherIcon(s.SKY, s.PTY);
    const pop = parseInt(s.POP || 0);

    // 아이콘
    icons += `<text x="${x.toFixed(1)}" y="${iconY}" text-anchor="middle" font-size="12">${icon}</text>`;
    // 기온
    tempLabels += `<text x="${x.toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" font-size="8" fill="#2E7D32">${(parseFloat(s.TMP)||0).toFixed(0)}°</text>`;
    // 포인트
    points += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#2E7D32"/>`;
    // 강수확률 (30% 이상만)
    if (pop >= 30) {
      const popColor = pop >= 60 ? '#1565C0' : '#378ADD';
      popLabels += `<text x="${x.toFixed(1)}" y="${popY}" text-anchor="middle" font-size="8" fill="${popColor}">${pop}%</text>`;
    }
    // 시간 (6시, 12시, 18시만 — 0시 생략)
    if (h !== 0) {
      timeLabels += `<text x="${x.toFixed(1)}" y="${timeY}" text-anchor="middle" font-size="8" fill="#aaa">${h}시</text>`;
    }
  });

  el.innerHTML = `
    <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;">
        <defs>
          <linearGradient id="tempGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4CAF50" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#4CAF50" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${dateBands}
        ${dividers}
        <path d="${fillPath}" fill="url(#tempGrad2)"/>
        <path d="${linePath}" fill="none" stroke="#2E7D32" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${icons}
        ${points}
        ${tempLabels}
        ${popLabels}
        ${timeLabels}
        ${dateTexts}
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
  for (let i = 0; i < firstDay; i++) cells += '<div style="min-height:40px;border:0.5px dashed transparent;"></div>';

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = (year===todayY && month===todayM && d===todayD);
    const isPast  = new Date(year,month-1,d) < new Date(todayY,todayM-1,todayD);
    const dow = new Date(year, month-1, d).getDay();
    const works = STATE.calendar.works[dateStr] || [];
    const wIcon = isPast ? '☀️' : '🌤';
    cells += `
      <div onclick="selectDate('${dateStr}')" data-date="${dateStr}"
        style="min-height:40px;padding:2px;border:0.5px dashed #eee;cursor:pointer;${isToday?'background:#F1F8E9;border-color:#2E7D32;':''}">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          ${isToday
            ? `<div style="width:15px;height:15px;border-radius:50%;background:#2E7D32;color:white;font-size:8px;display:flex;align-items:center;justify-content:center;">${d}</div>`
            : `<span style="font-size:9px;color:${dow===0?'#E24B4A':dow===6?'#378ADD':'#111'};">${d}</span>`
          }
        </div>
        <div class="schedule-badges"></div>
        ${works.slice(0,1).map(w => `
          <div style="display:flex;align-items:center;gap:1px;margin-top:1px;overflow:hidden;">
            <span style="font-size:6px;color:#999;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${w.workType}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  cells += '</div>';

  const legend = "";
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

selectedWorkDate = todayStr();
pendingWorks = [];

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

nongsaroCache = {};

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

// ════════════════════════════════════════════════════
// 재배력 연동 (farmWorkingPlanNew)
// ════════════════════════════════════════════════════
const FARM_SCHEDULE_CACHE = {};
const CROP_COLORS = [
  {bg:'#C8E6C9', color:'#1B5E20'},
  {bg:'#BBDEFB', color:'#0D47A1'},
  {bg:'#FFE0B2', color:'#E65100'},
  {bg:'#F8BBD0', color:'#880E4F'},
  {bg:'#E1BEE7', color:'#4A148C'},
  {bg:'#B2EBF2', color:'#006064'},
  {bg:'#DCEDC8', color:'#33691E'},
  {bg:'#FFF9C4', color:'#F57F17'},
];

function getCropColor(idx) {
  return CROP_COLORS[idx % CROP_COLORS.length];
}

function shortenOpert(opertNm) {
  var map = [
    ['모기르기','육묘'], ['씨뿌림','파종'], ['파종','파종'],
    ['아주심기','정식'], ['정식','정식'], ['이앙','모내기'],
    ['모내기','모내기'], ['수확','수확'], ['수확할때','수확'],
    ['밑거름','밑거름'], ['웃거름','웃거름'], ['새끼칠거름','분얼'],
    ['이삭거름','이삭'], ['제초','제초'], ['방제','방제'],
    ['관수','관수'], ['물주기','관수'], ['물때기','물관리'],
    ['물걸러','물관리'], ['객토','객토'], ['퇴비','퇴비'],
    ['논갈이','경운'], ['토양','토양'], ['전정','전정'],
    ['가지치기','전정'], ['적과','적과'], ['수분','수분'],
    ['봉지','봉지'], ['적심','적심'],
  ];
  for (var i = 0; i < map.length; i++) {
    if (opertNm.includes(map[i][0])) return map[i][1];
  }
  return opertNm.slice(0, 3);
}

async function loadFarmSchedule(cntntsNo) {
  if (FARM_SCHEDULE_CACHE[cntntsNo]) return FARM_SCHEDULE_CACHE[cntntsNo];
  try {
    const url = '/api/schedule?cntntsNo=' + cntntsNo;
    const res = await fetch(url);
    const html = await res.text();

    // HTML 테이블 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = Array.from(doc.querySelectorAll('table tr')).slice(1); // 헤더 제외

    const schedule = [];
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length < 7) return;
      var infoType = cells[2] ? cells[2].textContent.trim() : '';
      if (!infoType.includes('생육과정')) return; // 주요농작업만
      var opertNm = cells[3] ? cells[3].textContent.trim() : '';
      var beginMon = parseInt((cells[4] ? cells[4].textContent.trim() : '0').replace('월','')) || 0;
      var beginEra = cells[5] ? cells[5].textContent.trim() : '';
      var endMon = parseInt((cells[6] ? cells[6].textContent.trim() : '0').replace('월','')) || 0;
      var endEra = cells[7] ? cells[7].textContent.trim() : '';
      if (!opertNm || !beginMon || !endMon) return;
      schedule.push({
        beginMon: beginMon,
        endMon: endMon,
        beginEra: beginEra,
        endEra: endEra,
        opertNm: shortenOpert(opertNm),
      });
    });

    FARM_SCHEDULE_CACHE[cntntsNo] = schedule;
    return schedule;
  } catch(e) {
    return [];
  }
}

function eraToDay(era) {
  if (era === '상') return 10;
  if (era === '중') return 20;
  return 28;
}

function isInSchedule(month, day, beginMon, beginEra, endMon, endEra) {
  var beginDay = eraToDay(beginEra);
  var endDay = eraToDay(endEra);
  var cur = month * 100 + day;
  var begin = beginMon * 100 + beginDay;
  var end = endMon * 100 + endDay;
  if (begin <= end) {
    return cur >= begin && cur <= end;
  } else {
    // 연도 넘어가는 경우 (예: 11월~2월)
    return cur >= begin || cur <= end;
  }
}

// 캘린더에 재배력 배지 추가
async function renderFarmScheduleBadges(year, month) {
  // cntntsNo 있는 작물만
  var crops = STATE.farm.crops.filter(function(c) { return c.cntntsNo; });
  var unique = [];
  var seen = {};
  crops.forEach(function(c) {
    if (!seen[c.cntntsNo]) { seen[c.cntntsNo] = true; unique.push(c); }
  });

  if (!unique.length) return;

  // 각 작물 일정 로드
  var schedules = await Promise.all(unique.map(function(c) {
    return loadFarmSchedule(c.cntntsNo);
  }));

  // 날짜별로 배지 삽입
  var lastDate = new Date(year, month, 0).getDate();
  for (var d = 1; d <= lastDate; d++) {
    var dateStr = year + '-' + String(month).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    var cell = document.querySelector('[data-date="' + dateStr + '"]');
    if (!cell) continue;

    var badgeContainer = cell.querySelector('.schedule-badges');
    if (!badgeContainer) continue;
    badgeContainer.innerHTML = '';

    unique.forEach(function(crop, idx) {
      var schedule = schedules[idx] || [];
      var color = getCropColor(idx);
      schedule.forEach(function(s) {
        if (isInSchedule(month, d, s.beginMon, s.beginEra, s.endMon, s.endEra)) {
          // 시작일에만 표시
          var startDay = eraToDay(s.beginEra);
          var isStart = (s.beginMon === month && d === startDay);
          if (!isStart) return;

          // 종료 시기 표시
          var eraLabel = {'상':'초','중':'중','하':'말'};
          var endLabel = s.endMon + '월' + (eraLabel[s.endEra] || s.endEra);
          var sameDay = (s.beginMon === s.endMon && s.beginEra === s.endEra);
          var label = sameDay ? s.opertNm : s.opertNm + '(~' + endLabel + ')';

          var badge = document.createElement('div');
          badge.style.cssText = 'font-size:6px;padding:0px 3px;border-radius:3px;margin-top:0;line-height:1.3;white-space:nowrap;overflow:hidden;display:inline-block;color:' + color.color + ';background:' + color.bg + ';cursor:pointer;font-weight:500;max-width:100%;text-overflow:ellipsis;';
          badge.textContent = label;
          badge.title = s.opertNm + ' (' + s.beginMon + '월' + s.beginEra + '~' + s.endMon + '월' + s.endEra + ')';
          badgeContainer.appendChild(badge);
        }
      });
    });
  }
}


// ── 팜맵 테스트 ─────────────────────────────────
function testFarmmap() {
  const pnu = '4477034036100410000';
  console.log('팜맵 JSONP 테스트 시작:', pnu);
  fetchFarmmapByPnu(pnu, function(data) {
    console.log('팜맵 응답:', JSON.stringify(data));
    if (data && data.output && data.output.farmmapData) {
      alert('팜맵 성공! 개수: ' + data.output.farmmapData.count);
    } else {
      alert('팜맵 응답: ' + JSON.stringify(data).slice(0, 200));
    }
  });
}
