export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json;charset=utf-8');

  const KEY = process.env.AGRI_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'API key not configured' });

  // 군산시 개정면 관측소 코드 (서천 인근 최근접)
  const OBSR_SPOT_CODE = '054065A001';

  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });

  const url = `https://apis.data.go.kr/1390802/AgriWeather/WeatherObsrInfo/V4/InsttWeather/getWeatherTimeList4?serviceKey=${KEY}&Page_No=1&Page_Size=24&date_Time=${date}&obsr_Spot_Cd=${OBSR_SPOT_CODE}`;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // XML → JSON 파싱
    const items = [];
    const itemMatches = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

    itemMatches.forEach(function(item) {
      function val(tag) {
        const m = item.match(new RegExp('<' + tag + '>([^<]*)</' + tag + '>'));
        return m ? m[1].trim() : '';
      }
      items.push({
        dateTime:   val('date_Time'),
        tmprt:      val('tmprt_150'),     // 기온 (℃)
        hd:         val('hd_150'),        // 습도 (%)
        rn:         val('rn'),            // 강수량 (mm)
        wd:         val('wd_300'),        // 풍향 (°)
        arvlty:     val('arvlty_300'),    // 풍속 (m/s)
        srqty:      val('srqty'),         // 일사량
        soilMitr:   val('soil_Mitr_10'), // 토양수분 10cm
        soilTp:     val('udgr_Tp_10'),   // 토양온도 10cm
        dwcnTime:   val('dwcn_Time'),    // 이슬점 시간
      });
    });

    return res.status(200).json({
      spotCode: OBSR_SPOT_CODE,
      spotName: '군산시 개정면',
      date,
      items,
    });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
