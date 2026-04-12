export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  const { op, ...params } = req.query;
  
  if (!op) return res.status(400).json({ error: 'op required' });

  const qs = new URLSearchParams({ apiKey: KEY, ...params }).toString();
  const url = `http://api.nongsaro.go.kr/sample/ajax/ajax_local_callback.jsp?cropEbook/${op}?${qs}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://api.nongsaro.go.kr',
        'Origin': 'https://api.nongsaro.go.kr',
        'User-Agent': 'Mozilla/5.0 (compatible)',
      }
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(text);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
