const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const createServer = () => {
  const server = http.createServer((req, res) => {
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(req.url.split('?')[0]);
    } catch (_e) {
      decodedUrl = req.url.split('?')[0];
    }

    let filePath = path.join(ROOT, decodedUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>404 Not Found</h1><p>File không tồn tại.</p>');
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Cổng ${PORT} đang bận, tự động chuyển sang cổng ${PORT + 1}...`);
      PORT += 1;
      setTimeout(() => startListening(server), 200);
    } else {
      console.error('Server error:', err);
    }
  });

  return server;
};

const startListening = (server) => {
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n🚀 Portfolio Dev Server đang chạy tại: \x1b[36m${url}\x1b[0m`);
    console.log(`👉 Nhấn Ctrl + C để dừng server.\n`);

    // Tự động mở trình duyệt
    const startCmd = process.platform === 'win32' ? `start ${url}` :
                     process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(startCmd, () => {});
  });
};

const server = createServer();
startListening(server);
