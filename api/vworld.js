export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const address = searchParams.get('address') || '';
  const pnu = searchParams.get('pnu') || '';

  const KEY = process.env.VWORLD_API_KEY;
  const DOMAIN = 'https://kitchen-garden.vercel.app';

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json;charset=utf-8',
  };

  try {
    let url = '';

    if (action === 'geocode') {
      // 주소 → PNU + 좌표
      url = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(address)}&refine=true&simple=false&format=json&type=parcel&key=${KEY}`;

    } else if (action === 'parcel') {
      // PNU → 필지 경계 + 지목 + 공시지가
      url = `https://api.vworld.kr/req/data?service=data&request=GetFeature&data=LP_PA_CBND_BUBUN&key=${KEY}&domain=${DOMAIN}&attrFilter=pnu:=:${pnu}&format=json`;

    } else if (action === 'landinfo') {
      // PNU → 면적, 용도지역, 지형, 토지형상 (토지특성정보)
      url = `https://api.vworld.kr/ned/data/getLandCharacteristics?key=${KEY}&domain=${DOMAIN}&pnu=${pnu}&format=json&numOfRows=1&pageNo=1`;

    } else {
      return new Response(JSON.stringify({ error: 'invalid action' }), { status: 400, headers: cors });
    }

    const res = await fetch(url);
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}
