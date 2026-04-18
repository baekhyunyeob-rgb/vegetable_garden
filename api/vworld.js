export default async function handler(req, res) {
  const { action, address, pnu } = req.query;
  const KEY = process.env.VWORLD_API_KEY;
  const DOMAIN = 'https://kitchen-garden.vercel.app';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let url = '';

    if (action === 'geocode') {
      url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=parcel&key=${KEY}&domain=${encodeURIComponent(DOMAIN)}`;
    } else if (action === 'parcel') {
      url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${KEY}&attrFilter=pnu:=:${pnu}&format=json&domain=${encodeURIComponent(DOMAIN)}`;
    } else if (action === 'landinfo') {
      url = `https://api.vworld.kr/ned/data/ladfrlList?key=${KEY}&pnu=${pnu}&format=json&domain=${encodeURIComponent(DOMAIN)}`;
    } else {
      return res.status(400).json({ error: 'invalid action' });
    }

    console.log('Fetching URL:', url);

    const response = await fetch(url);
    const text = await response.text();

    console.log('Response status:', response.status);
    console.log('Response text:', text.substring(0, 200));

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(parseErr) {
      return res.status(500).json({ error: 'Parse failed', raw: text.substring(0, 500) });
    }

  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
