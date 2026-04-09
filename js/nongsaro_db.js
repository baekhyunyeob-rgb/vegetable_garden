// 농사로 작물 DB + 우선순위 처리
// 1순위: 텃밭가꾸기 API (채소 텍스트) - 있으면 표시
// 2순위: CSV 공공데이터 (앱 내 텍스트) - 1순위 없으면 표시
// 3순위: 농작업일정 파일 (hwp/pdf) - 항상 같이 표시

// ── 1순위: 텃밭가꾸기 API 채소 목록 ──────────────
const FILD_MNFCT_CROPS = [
  '가지','갓','결구상추','고들빼기','고사리','고추','곰취','근대','냉이','당근',
  '두릅','딸기','마늘','멜론','무','미나리','배추','부추','브로콜리','비트',
  '상추','생강','셀러리','수박','시금치','신선초','쑥갓','아스파라거스','아욱',
  '양배추','양파','연근','오이','적채','쪽파','참외','참취','청경채','치커리',
  '컬리플라워','토란','토마토','파','파드득나물','파슬리','파프리카','피망','호박',
];

// ── 3순위: 농작업일정 파일 (항상 표시) ──────────────
const FILE_DOWNLOAD_CROPS = {
  '벼':    {no:30697,  ext:'hwpx'},
  '찹쌀':  {no:30697,  ext:'hwpx'},
  '흑미':  {no:30697,  ext:'hwpx'},
  '밭벼':  {no:30698,  ext:'hwpx'},
  '녹두':  {no:30702,  ext:'hwpx'},
  '사료용벼': {no:259520, ext:'pdf'},
  '옥수수': {no:30709, ext:'hwpx'},
  '참깨':  {no:30714,  ext:'hwpx'},
  '콩':    {no:30715,  ext:'hwpx'},
  '팥':    {no:30716,  ext:'hwpx'},
  '감자':  {no:30699,  ext:'hwpx'},
  '강낭콩': {no:30700, ext:'hwpx'},
  '고구마': {no:30701, ext:'hwpx'},
  '들깨':  {no:30703,  ext:'hwpx'},
  '땅콩':  {no:30704,  ext:'hwpx'},
  '메밀':  {no:30706,  ext:'hwpx'},
  '밀':    {no:30707,  ext:'hwpx'},
  '수수':  {no:30708,  ext:'hwpx'},
  '완두':  {no:30710,  ext:'hwp'},
  '유채':  {no:30711,  ext:'hwpx'},
  '풋콩':  {no:30717,  ext:'hwpx'},
  '감귤':  {no:30654,  ext:'hwpx'},
  '단감':  {no:30656,  ext:'hwpx'},
  '매실':  {no:30658,  ext:'hwpx'},
  '무화과': {no:30659, ext:'hwpx'},
  '배':    {no:30661,  ext:'hwpx'},
  '복숭아': {no:30662, ext:'hwpx'},
  '블루베리': {no:258549, ext:'hwpx'},
  '사과':  {no:30663,  ext:'hwp'},
  '살구':  {no:30664,  ext:'hwpx'},
  '유자':  {no:30666,  ext:'hwpx'},
  '자두':  {no:30667,  ext:'hwpx'},
  '참다래': {no:30668, ext:'hwpx'},
  '포도':  {no:30669,  ext:'hwpx'},
  '키위':  {no:30668,  ext:'hwpx'},
  '체리':  {no:30665,  ext:'hwpx'},
  '한라봉': {no:30670, ext:'hwpx'},
  '국화':  {no:30672,  ext:'hwp'},
  '장미':  {no:30688,  ext:'hwpx'},
  '튤립':  {no:30693,  ext:'hwpx'},
  '카네이션': {no:30690, ext:'hwpx'},
  '철쭉':  {no:30689,  ext:'hwpx'},
  '수국':  {no:30680,  ext:'hwpx'},
  '선인장': {no:30679, ext:'hwpx'},
};

// ── 우선순위 판단 함수 ────────────────────────────
function getNongsaroInfo(cropName) {
  const name = cropName.trim();

  // 3순위: 파일 (항상 확인)
  const fileKey = Object.keys(FILE_DOWNLOAD_CROPS).find(k =>
    name === k || name.includes(k) || k.includes(name)
  );
  const fileInfo = fileKey ? { key: fileKey, ...FILE_DOWNLOAD_CROPS[fileKey] } : null;

  // 1순위: 텃밭가꾸기 API
  if (FILD_MNFCT_CROPS.some(c => name === c || name.includes(c) || c.includes(name))) {
    return { type: 'api', name, fileInfo };
  }

  // 2순위: CSV 공공데이터
  const csvData = findCsvCrop(name);
  if (csvData) {
    return { type: 'csv', csvData, name, fileInfo };
  }

  // 파일만 있는 경우
  if (fileInfo) {
    return { type: 'file_only', name, fileInfo };
  }

  return { type: 'none', name };
}

function findCsvCrop(name) {
  if (typeof CSV_CROP_DB === 'undefined') return null;
  if (CSV_CROP_DB[name]) return CSV_CROP_DB[name];
  const key = Object.keys(CSV_CROP_DB).find(k => {
    const base = k.split('(')[0].trim();
    return base === name || name.includes(base) || base.includes(name);
  });
  return key ? CSV_CROP_DB[key] : null;
}

// ── 파일 다운로드 URL 생성 ────────────────────────
function getFileDownloadUrl(cntntsNo) {
  return `http://www.nongsaro.go.kr/portal/contentsFileDownload.do?cntntsNo=${cntntsNo}`;
}

function buildFileSection(fileInfo) {
  const url = getFileDownloadUrl(fileInfo.no);
  const div = document.createElement('div');
  div.style.cssText = 'margin-top:10px;padding:10px;background:#f8f8f8;border-radius:8px;';
  div.innerHTML = '<div style="font-size:10px;color:#999;margin-bottom:6px;">📎 농작업일정 참고자료</div>';
  const btn = document.createElement('button');
  btn.style.cssText = 'width:100%;padding:7px;background:white;color:#2E7D32;border:0.5px solid #2E7D32;border-radius:6px;font-size:11px;cursor:pointer;';
  btn.textContent = '📥 ' + fileInfo.key + ' 농작업일정 (' + fileInfo.ext.toUpperCase() + ') 받기';
  btn.onclick = function() { window.open(url); };
  div.appendChild(btn);
  return div.outerHTML;
}
