Đi Chùa Online — bản tĩnh của cả site (trang chủ, bản đồ, các điểm đến, 6 chặng, giới thiệu, quyền riêng tư).

Chạy: mở terminal trong thư mục này rồi gõ một trong hai lệnh
  npx serve .
  python3 -m http.server 8000
rồi mở http://localhost:3000 (serve) hoặc http://localhost:8000 (python).

Không mở trực tiếp index.html bằng file:// — các đường dẫn của site cần một server tĩnh.
Bản tĩnh không có: âm thanh (lấy qua API), gửi event; mọi thứ khác chạy như thật.
