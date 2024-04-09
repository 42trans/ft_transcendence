// const http = require('http');
// const fs = require('fs');
// const path = require('path');

// const hostname = '0.0.0.0'; // 外部からのアクセスを許可
// const port = 8180;

// const server = http.createServer((req, res) => {
//   if (req.url === '/mugiwara') {
//     // リクエストURLがルートの場合、three.htmlを提供
//     const filePath = path.join(__dirname, 'src', 'mugiwara', 'three.html');
//     fs.readFile(filePath, (err, content) => {
//       if (err) {
//         res.writeHead(500);
//         res.end(`Server Error: ${err.code}`);
//         return;
//       }
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(content, 'utf-8');
//     });
//   } else {
//     // ルート以外へのアクセスはNot Foundとする
//     res.writeHead(404);
//     res.end('Not Found');
//   }
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
