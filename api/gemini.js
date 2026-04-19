export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  const { cropName } = req.body || {};
  if (!cropName) return res.status(400).json({ error: 'cropName required' });

  const prompt = `${cropName} 재배 월별 주요 작업 일정을 JSON 배열로만 답해줘. 마크다운 없이 순수 JSON만. 형식: [{"opertNm":"작업명","beginMon":시작월숫자,"beginEra":"상중하","endMon":종료월숫자,"endEra":"상중하"}]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    // JSON 파싱 시도
    const clean = text.replace(/```json|```/g, '').trim();
    const schedule = JSON.parse(clean);
    return res.status(200).json({ schedule });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
