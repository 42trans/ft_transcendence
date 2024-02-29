const http = require('http');
const fs = require('fs');
const path = require('path');


const prom_client = require('prom-client')
const collectDefaultMetrics = prom_client.collectDefaultMetrics;
// メトリクス収集を開始
collectDefaultMetrics({ timeout: 5000 }); // メトリクスを5秒ごとに収集


const server = http.createServer(async (req, res) => {
  if (req.url === '/') {
    // ルートパスへのリクエストでindex.htmlを提供
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.url === '/metrics'){
    res.setHeader('Content-Type', prom_client.register.contentType);
    res.end(await prom_client.register.metrics());
  } else if (req.url.match('\.css$')) {
    // CSSファイルのリクエストに対する応答
    const cssPath = path.join(__dirname, 'public', req.url);
    const fileStream = fs.createReadStream(cssPath, "UTF-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    fileStream.pipe(res);
  } else if (req.url.match('\.gltf$')) {
    // GLTFファイルのリクエストに対する応答
    const gltfPath = path.join(__dirname, req.url); // あるいは正しいパスを設定する
    const fileStream = fs.createReadStream(gltfPath);
    res.writeHead(200, { "Content-Type": "model/gltf+json" });
    fileStream.pipe(res);
  } else if (req.url.match('\.bin$')) {
    // Serve BIN files (binary data)
    const binPath = path.join(__dirname, req.url);
    const fileStream = fs.createReadStream(binPath);
    res.writeHead(200, { "Content-Type": "application/octet-stream" });
    fileStream.pipe(res);
  } else if (req.url.match('\.png$')) {
    // Serve PNG image files
    const imagePath = path.join(__dirname, req.url);
    const fileStream = fs.createReadStream(imagePath);
    res.writeHead(200, { "Content-Type": "image/png" });
    fileStream.pipe(res);
  } else if (req.url === '/three.html') {
      fs.readFile(path.join(__dirname, 'three.html'), (err, content) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
  } else {
    // その他のリクエストは404として応答
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('No page found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
