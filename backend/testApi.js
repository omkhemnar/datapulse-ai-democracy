const http = require('http');

const optionsGet = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/load-sample',
  method: 'GET'
};

const reqGet = http.request(optionsGet, (res) => {
  console.log('GET /api/load-sample:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d));
  
  if (res.statusCode === 200) {
    // Then test POST
    const data = JSON.stringify({ cluster: "Farmers" });
    const optionsPost = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/send-notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const reqPost = http.request(optionsPost, (res2) => {
      console.log('\nPOST /api/send-notifications:', res2.statusCode);
      res2.on('data', (d) => process.stdout.write(d));
    });
    
    reqPost.on('error', (e) => console.error(e));
    reqPost.write(data);
    reqPost.end();
  }
});

reqGet.on('error', (e) => console.error(e));
reqGet.end();
