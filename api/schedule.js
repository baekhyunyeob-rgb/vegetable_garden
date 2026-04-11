const http = require('http');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const cntntsNo = req.query && req.query.cntntsNo;
  if (!cntntsNo) return res.status(400).json({ error: 'cntntsNo required' });

  const KEY = '20260409M8NZ3DE2W1X8T00CUUUHCA';
  const path = '/service/farmWorkingPlanNew/workScheduleEraInfoJsonLst?apiKey=' + KEY + '&cntntsNo=' + cntntsNo;

  console.log('Calling:', 'http://api.nongsaro.go.kr' + path);

  const request = http.request({
    hostname: 'api.nongsaro.go.kr',
    port: 80,
    path: path,
    method: 'GET',
    timeout: 10000,
  }, function(response) {
    console.log('Status:', response.statusCode);
    let data = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) { data += chunk; });
    response.on('end', function() {
      console.log('Data length:', data.length);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(data);
    });
  });

  request.on('error', function(e) {
    console.error('Request error:', e.message, e.code);
    res.status(500).json({ error: e.message, code: e.code });
  });

  request.on('timeout', function() {
    console.error('Request timeout');
    request.destroy();
    res.status(500).json({ error: 'timeout' });
  });

  request.end();
};
