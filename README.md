# Game Cờ X-O (Tic-Tac-Toe) - Localhost Web

Trò chơi Cờ Caro X-O cổ điển với giao diện hiện đại, mượt mà bằng **HTML5**, **CSS3**, **JavaScript** và tích hợp sẵn **Web Server Localhost**.

---

## 🚀 Cách Chạy Trang Web Trên Localhost

Bạn có thể chạy trên `localhost` theo bất kỳ cách nào dưới đây:

### Cách 1: Bằng 1 cú nhấp chuột (Tiện nhất cho Windows)
- Nhấp đúp vào file **`start.bat`**.
- Hệ thống sẽ tự động bật server tại `http://localhost:3000` và tự mở trình duyệt cho bạn!

### Cách 2: Sử dụng lệnh Node.js (Terminal / CMD / PowerShell)
Mở cửa sổ dòng lệnh tại thư mục này và gõ:
```bash
npm start
```
*(hoặc `node server.js`)*
Sau đó truy cập trình duyệt theo địa chỉ: [**http://localhost:3000**](http://localhost:3000)

### Cách 3: Sử dụng Python
Nếu máy tính có cài Python, bạn cũng có thể gõ:
```bash
python -m http.server 3000
```
Sau đó truy cập: [**http://localhost:3000**](http://localhost:3000)

### Cách 4: Dùng Live Server (VS Code)
- Mở thư mục này trong Visual Studio Code.
- Nhấp chuột phải vào `index.html` và chọn **Open with Live Server** (cổng mặc định là `http://127.0.0.1:5500`).

---

## 🎮 Các Tính Năng Của Game

1. **3 Chế Độ Chơi:**
   - 👥 **2 Người:** Chơi trực tiếp đối kháng với bạn bè trên cùng máy.
   - 🤖 **Máy (Dễ):** Máy đánh ngẫu nhiên và chặn cơ bản.
   - 🧠 **Máy (Khó - Minimax AI):** Thuật toán trí tuệ nhân tạo tính toán tối ưu tất cả nước đi (không thể bị đánh bại).

2. **Âm Thanh & Hiệu Ứng:**
   - Âm thanh tích hợp tự sinh từ Web Audio API khi đánh cờ, hòa hoặc chiến thắng.
   - Pháo hoa chúc mừng (Confetti) bay rực rỡ khi thắng trận.
   - Hiệu ứng phát sáng các ô cờ tạo thành chuỗi thắng.

3. **Giao Diện:**
   - Bảng theo dõi điểm số (lưu vào bộ nhớ trình duyệt `localStorage`).
   - Chế độ Sáng / Tối (Dark / Light Theme).
   - Tương thích tốt trên máy tính và điện thoại.

---

## 📁 Cấu Trúc Dự Án

```
Đồ Án Chuyên Nghành/
├── index.html     # Giao diện chính của game
├── style.css      # CSS hiệu ứng giao diện, Dark/Light mode, Responsive
├── script.js      # Logic game, AI Minimax, âm thanh, hiệu ứng pháo hoa
├── server.js      # Máy chủ HTTP Localhost (Node.js thuần, không cần cài thư viện)
├── package.json   # Cấu hình dự án & lệnh "npm start"
├── start.bat      # File chạy nhanh 1-click cho Windows
└── README.md      # Hướng dẫn chi tiết
```
