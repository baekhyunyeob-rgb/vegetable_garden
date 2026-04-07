export default async function handler(req, res) {
  const { action, address, pnu } = req.query;
  const KEY = process.env.VWORLD_API_KEY;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  try {
    let url = '';

    if (action === 'geocode') {
      url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=parcel&key=${KEY}`;
    } else if (action === 'parcel') {
      url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${KEY}&attrFilter=pnu:=:${pnu}&format=json`;
    } else if (action === 'landinfo') {
      url = `https://api.vworld.kr/ned/data/getLandCharacteristics?key=${KEY}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1`;
    } else {
      return res.status(400).json({ error: 'invalid action' });
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
