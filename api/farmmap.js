export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  const KEY = process.env.FARMMAP_API_KEY;
  const DOMAIN = 'https://kitchen-garden.vercel.app';
  if (!KEY) return res.status(500).json({ error: 'API key not configured' });

  const { pnu, action } = req.query;
  if (!pnu) return res.status(400).json({ error: 'pnu required' });

  try {
    if (action === 'soil') {
      // 팜맵 토양검정 (공공데이터포털)
      const KEY2 = process.env.AGRI_API_KEY;
      const url = `https://apis.data.go.kr/B552895/rest/farmmap/getFarmmapSoilAnalysisService/getPnuBasedSoilAnalsInfo?serviceKey=${KEY2}&numOfRows=5&pageNo=1&type=json&pnuCode=${pnu}`;
      const r = await fetch(url);
      const text = await r.text();
      try { return res.status(200).json(JSON.parse(text)); }
      catch(e) { return res.status(200).json({ raw: text.slice(0,500) }); }
    }

    // 기본: PNU 기반 필지 정보
    const params = new URLSearchParams({
      apiKey: KEY,
      domain: DOMAIN,
      pnu: pnu,
      mapType: 'farmmap',
      columnType: 'KOR',
      apiVersion: 'v2',
      callback: 'cb'
    });

    const url = `https://agis.epis.or.kr/ASD/farmmapApi/getFarmmapDataSeachPnu.do?${params}`;
    console.log('Farmmap URL:', url);

    const r = await fetch(url, {
      headers: {
        'Referer': DOMAIN,
        'Origin': DOMAIN,
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const text = await r.text();
    console.log('Raw response:', text.slice(0, 500));

    // JSONP 응답에서 JSON 추출
    const match = text.match(/cb\s*\(([\s\S]*)\)/);
    if (match) {
      const data = JSON.parse(match[1]);
      const items = data?.output?.farmmapData?.data || [];
      // 필요한 필드만 추출
      const result = items.map(d => ({
        팜맵ID: d['팜맵ID'] || d.id,
        농경지분류: d['농경지분류'] || d.clsf_nm,
        농경지면적: d['농경지면적'] || d.area,
        대표지목: d['대표지목'] || d.ldcg_cd,
        법정동주소: d['법정동주소'] || d.stdg_addr,
        지적일치율: d['지적일치율'] || d.cad_con_ra,
        갱신일자: d['갱신일자'] || d.updt_ymd,
      }));
      return res.status(200).json({ ok: true, count: items.length, data: result });
    }

    // JSON 직접 응답인 경우
    try {
      return res.status(200).json(JSON.parse(text));
    } catch(e) {
      return res.status(200).json({ raw: text.slice(0, 1000) });
    }

  } catch(e) {
    console.error('Farmmap error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
