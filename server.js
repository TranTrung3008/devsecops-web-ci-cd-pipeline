const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Normalize URL to file path
  let safePath = path.normalize(decodeURI(req.url)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Không tìm thấy trang</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Lỗi máy chủ: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 Web Server đang chạy tại:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://127.0.0.1:${PORT}`);
  console.log(`Nhấn Ctrl + C để dừng máy chủ.`);
  console.log(`=================================================\n`);
});


// ==============================================================================
// MÃ THỬ NGHIỆM SAST: CÁC LỖ HỔNG BẢO MẬT KINH ĐIỂN (DEVSECOPS LAB)
// ==============================================================================

// LỖI 1 (CWE-95): Sử dụng hàm nguy hiểm eval() để thực thi code từ input người dùng
function calculateExpression(userInput) {
  // Lỗ hổng: Kẻ tấn công có thể chèn mã độc thực thi tùy ý trên máy chủ
  return eval(userInput);
}

// LỖI 2 (CWE-89): Ghép chuỗi trực tiếp vào câu lệnh SQL (SQL Injection)
function getUserData(userId) {
  // Lỗ hổng: Không tham số hóa (Parameterized Query) tạo cơ hội khai thác SQL Injection
  const sqlQuery = "SELECT * FROM users WHERE id = '" + userId + "' AND active = 1";
  return sqlQuery;
}