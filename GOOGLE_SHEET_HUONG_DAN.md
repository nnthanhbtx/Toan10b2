# HƯỚNG DẪN TỰ ĐỘNG LƯU KẾT QUẢ VỀ GOOGLE SHEET KHI DEPLOY LÊN VERCEL

Tài liệu này hướng dẫn cách kết nối trò chơi **Ai là triệu phú Toán 10 - Bài 2: Tập hợp và các phép toán trên tập hợp** với **Google Sheet**, giúp giáo viên và người quản trị tự động thu thập kết quả chơi của học sinh theo thời gian thực (real-time).

---

## 🚀 3 Bước Thiết Lập Cực Kỳ Nhanh Chóng

### Bước 1: Tạo Google Sheet và mở Apps Script
1. Truy cập [Google Sheets](https://sheets.new) để tạo một bảng tính mới. Đặt tên bảng tính (ví dụ: *Kết Quả Ai Là Triệu Phú Toán 10 - Bài 2*).
2. Trên thanh menu, chọn: **Tiện ích mở rộng** (Extensions) > **Apps Script**.

### Bước 2: Dán mã nguồn Apps Script
1. Xoá toàn bộ nội dung mẫu đang có trong file `Code.gs`.
2. Mở file `google-apps-script.gs` (nằm ngay trong thư mục gốc của dự án này), sao chép toàn bộ mã nguồn và dán vào `Code.gs`.
3. Nhấn biểu tượng **Lưu** (Ctrl + S hoặc ⌘ + S).

### Bước 3: Triển khai thành Web App (CỰC KỲ QUAN TRỌNG)
1. Ở góc trên bên phải, nhấn nút **Triển khai** (Deploy) > chọn **Bản triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Thiết lập các thông số như sau:
   - **Mô tả** (Description): `Ai Là Triệu Phú Toán 10 - Vercel API`
   - **Thực thi dưới dạng** (Execute as): Chọn **Tôi (tài khoản email của bạn)**
   - **Người có quyền truy cập** (Who has access): Chọn **Bất kỳ ai** (*Anyone*)  
     *(⚠️ Bắt buộc phải chọn "Bất kỳ ai" thì trang web trên Vercel mới có thể ghi điểm vào sheet mà không bị chặn xác thực!)*
4. Nhấn nút **Triển khai** (Deploy).
5. Google sẽ yêu cầu "Uỷ quyền truy cập" (Authorize access):
   - Chọn tài khoản Google của bạn.
   - Nhấn **Nâng cao** (Advanced) ở góc dưới > Nhấn **Đi tới (dự án của bạn) (không an toàn)**.
   - Nhấn **Cho phép** (Allow).
6. Google sẽ cung cấp **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/.../exec`). Hãy sao chép URL này!

---

## 🔗 Cách cấu hình vào Ứng dụng khi đưa lên Vercel

Có **2 cách** (bạn có thể dùng cả hai cách song song):

### Cách 1: Cấu hình trực tiếp trên giao diện web (Khuyên dùng - Nhanh nhất)
1. Mở ứng dụng (trên Vercel hoặc trình duyệt).
2. Nhấn vào nút **"Bảng Vàng"** (hoặc biểu tượng **Google Sheet** trên thanh menu).
3. Nhấn nút **"Cài đặt Google Sheet"**.
4. Dán **URL ứng dụng web** đã copy ở Bước 3 vào ô nhập liệu.
5. Nhấn **"Kiểm tra & Lưu"**.
6. Hệ thống sẽ lưu URL vào trình duyệt, từ lúc này mỗi khi học sinh hoàn thành bài thi hoặc bấm dừng cuộc chơi, dữ liệu sẽ **tự động 100%** gửi về Google Sheet!

### Cách 2: Thiết lập biến môi trường trên Vercel (Tự động cho tất cả học sinh)
Nếu bạn muốn tất cả học sinh khi truy cập vào link Vercel đều tự động lưu điểm về sheet chung mà không cần ai phải cấu hình gì:
1. Đăng nhập vào dashboard của **Vercel** > chọn dự án của bạn.
2. Vào tab **Settings** > chọn mục **Environment Variables**.
3. Thêm biến mới:
   - **Key**: `VITE_GOOGLE_SHEET_SCRIPT_URL`
   - **Value**: Dán URL Web App của bạn (`https://script.google.com/macros/s/.../exec`)
4. Nhấn **Save**.
5. Vào tab **Deployments** > nhấn biểu tượng 3 chấm ở bản build gần nhất > chọn **Redeploy**.

---

## 📊 Dữ liệu được ghi nhận vào Google Sheet gồm những gì?

Hệ thống sẽ tự động tạo bảng với 10 cột dữ liệu chuẩn xác:
1. **Thời gian nộp**: Ngày giờ nộp bài chính xác (giờ Việt Nam GMT+7).
2. **Họ và tên thí sinh**: Tên học sinh nhập trước khi bắt đầu.
3. **Lớp**: Lớp của học sinh (VD: 10A1, 10T,...).
4. **Điểm số**: Số câu trả lời đúng (trên thang 15 câu).
5. **Tiền thưởng**: Số tiền thưởng ảo tương ứng (VNĐ).
6. **Thời gian làm bài**: Thời lượng làm bài thực tế (phút:giây).
7. **Chủ đề**: Tên bộ câu hỏi đã làm.
8. **Kết quả**: 🏆 CHIẾN THẮNG / ⭐ Xuất sắc / 👍 Khá / Cần cố gắng.
9. **Hình thức kết thúc**: Vượt qua câu 15 / Dừng cuộc chơi / Sai câu hỏi.
10. **Mã bài thi (ID)**: Mã định danh chống trùng lặp dữ liệu.

---

## 🛡️ Tính năng nổi bật & Chống lỗi kết nối
- **Chống lỗi CORS trên trình duyệt**: Sử dụng giao thức gửi không chặn (no-cors) tương thích 100% với Google Apps Script.
- **Hàng đợi ngoại tuyến (Offline Queue)**: Nếu học sinh làm bài khi mất mạng wifi, kết quả được lưu tạm trên máy. Khi có mạng trở lại, ứng dụng tự động đồng bộ lại toàn bộ kết quả lên Google Sheet!
- **Chống ghi đè / ghi lặp**: Script tự động kiểm tra ID bài thi, ngăn chặn việc 1 kết quả bị lưu nhiều lần.
- **Khóa LockService**: Bảo đảm an toàn dữ liệu kể cả khi cả lớp 40 - 50 học sinh cùng nộp bài một lúc.
