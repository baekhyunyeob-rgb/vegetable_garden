const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query && req.query.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  const path = '/service/farmWorkingPlanNew/workScheduleEraInfoJsonLst?apiKey=' + KEY + '&cntntsNo=' + encodeURIComponent(cntntsNo);

  const options = {
    hostname: 'api.nongsaro.go.kr',
    port: 80,
    path: path,
    method: 'GET',
  };

  // http로 시도 (농사로는 80포트)
  const http = require('http');
  const request = http.request(options, function(response) {
    let data = '';
    response.on('data', function(chunk) { data += chunk; });
    response.on('end', function() {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(data);
    });
  });

  request.on('error', function(e) {
    res.status(500).json({ error: e.message, code: e.code });
  });

  request.end();
};
