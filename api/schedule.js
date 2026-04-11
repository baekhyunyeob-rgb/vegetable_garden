export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query?.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  
  // REST 샘플 URL 방식으로 시도
  const url = `http://api.nongsaro.go.kr/service/farmWorkingPlanNew/workScheduleEraInfoJsonLst?apiKey=${KEY}&cntntsNo=${cntntsNo}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible)',
        'Referer': 'http://api.nongsaro.go.kr/',
        'Accept': 'application/xml',
      }
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(text);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
