// 농사로 AJAX 콜백 페이지
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
  
  // 농사로에서 콜백으로 보내주는 데이터를 그대로 전달
  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
  });
  
  return res.status(200).send(body || req.query.data || '');
}
