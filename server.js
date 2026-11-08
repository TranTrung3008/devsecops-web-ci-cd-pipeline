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
// ====================================================================
// TEST CASE CỔNG 2: SAST (STATIC APPLICATION SECURITY TESTING)
// Tạo Route API nhận dữ liệu từ người dùng truyền vào eval()
// ====================================================================

// Route API tính toán: Nhận chuỗi từ req.query.formula và truyền thẳng vào eval()
// Hacker có thể gửi: http://localhost:3000/api/calc?formula=process.mainModule.require('child_process').execSync('id')
app.get('/api/calc', (req, res) => {
  const userFormula = req.query.formula;
  // LỖ HỔNG CODE INJECTION (CWE-95): Semgrep chắc chắn sẽ báo đỏ ở dòng này!
  const result = eval(userFormula);
  res.send("Kết quả: " + result);
});

// Route API tìm kiếm User: Ghép chuỗi SQL trực tiếp từ req.query.id
app.get('/api/user', (req, res) => {
  const userId = req.query.id;
  // LỖ HỔNG SQL INJECTION (CWE-89)
  const sql = "SELECT * FROM users WHERE id = '" + userId + "'";
  res.send("Truy vấn: " + sql);
});