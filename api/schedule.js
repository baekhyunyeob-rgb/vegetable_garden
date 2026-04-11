import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query && req.query.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  const path = '/service/farmWorkingPlanNew/workScheduleEraInfoJsonLst?apiKey=' + KEY + '&cntntsNo=' + cntntsNo;

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.nongsaro.go.kr',
      port: 443,
      path: path,
      method: 'GET',
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.status(200).send(data);
        resolve();
      });
    });

    request.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    request.end();
  });
}
