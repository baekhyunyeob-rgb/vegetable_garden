export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query?.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  // www.nongsaro.go.kr - Vercel에서 성공 확인됨!
  const url = `https://www.nongsaro.go.kr/portal/ps/psb/psbl/workScheduleInfo.ps?cntntsNo=${cntntsNo}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(text);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
