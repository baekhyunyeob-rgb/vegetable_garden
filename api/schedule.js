export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query?.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  // JSP 샘플 페이지 URL - 농사로 서버 내부에서 렌더링
  const url = `http://api.nongsaro.go.kr/sample/rest/farmWorkingPlanNew/farmWorkingPlan_D.jsp?cntntsNo=${cntntsNo}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible)',
      }
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(text);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
