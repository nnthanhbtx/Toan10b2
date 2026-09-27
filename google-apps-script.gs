/**
 * ==============================================================================
 * DỰ ÁN: AI LÀ TRIỆU PHÚ TOÁN 10 - BÀI 2: TẬP HỢP VÀ CÁC PHÉP TOÁN TRÊN TẬP HỢP
 * MÃ NGUỒN GOOGLE APPS SCRIPT ĐỒNG BỘ KẾT QUẢ VỀ GOOGLE SHEET TỰ ĐỘNG
 * ==============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (3 BƯỚC):
 * 1. Mở bảng tính Google Sheets mới (hoặc có sẵn).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xoá hết mã mặc định trong Code.gs, dán toàn bộ mã nguồn bên dưới vào và nhấn Lưu (Ctrl + S).
 * 4. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải > chọn "Bản triển khai mới" (New deployment).
 *    - Loại: Chọn "Ứng dụng web" (Web app).
 *    - Mô tả: "Ai là triệu phú Toán 10".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me - tài khoản Google của bạn).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> **QUAN TRỌNG NHẤT** để Vercel gửi được dữ liệu.
 * 5. Nhấn "Triển khai" (Deploy), cấp quyền truy cập nếu Google hỏi.
 * 6. Sao chép "URL ứng dụng web" (có đuôi /exec) và dán vào ô Cài đặt Google Sheet trong ứng dụng (hoặc biến VITE_GOOGLE_SHEET_SCRIPT_URL trên Vercel).
 */

// Tên trang tính dùng để lưu kết quả
var SHEET_NAME = "Kết quả thi";

// Tiêu đề các cột trong Google Sheet
var HEADERS = [
  "Thời gian nộp",
  "Họ và tên thí sinh",
  "Lớp",
  "Điểm số (/15)",
  "Tiền thưởng (VNĐ)",
  "Thời gian làm bài",
  "Chủ đề bộ câu hỏi",
  "Kết quả",
  "Hình thức kết thúc",
  "Mã bài thi (ID)"
];

/**
 * Khởi tạo hoặc lấy trang tính, tự động tạo dòng tiêu đề đẹp nếu chưa có
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }
  
  // Kiểm tra nếu trang tính còn trống thì thêm tiêu đề
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    
    // Định dạng dòng tiêu đề chuyên nghiệp
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a"); // Xanh đen sang trọng
    headerRange.setFontColor("#f8fafc"); // Trắng sáng
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    headerRange.setFontSize(11);
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);
    
    // Căn độ rộng cơ bản các cột
    sheet.setColumnWidth(1, 160); // Thời gian
    sheet.setColumnWidth(2, 180); // Họ và tên
    sheet.setColumnWidth(3, 80);  // Lớp
    sheet.setColumnWidth(4, 110); // Điểm số
    sheet.setColumnWidth(5, 140); // Tiền thưởng
    sheet.setColumnWidth(6, 130); // Thời gian làm bài
    sheet.setColumnWidth(7, 280); // Chủ đề
    sheet.setColumnWidth(8, 120); // Kết quả
    sheet.setColumnWidth(9, 140); // Hình thức
    sheet.setColumnWidth(10, 160); // Mã ID
  }
  
  return sheet;
}

/**
 * Xử lý yêu cầu POST gửi từ Vercel / Web App
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Khóa trong 15 giây để chống xung đột ghi đồng thời khi nhiều học sinh nộp cùng lúc
  var hasLock = lock.tryLock(15000);
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Không nhận được dữ liệu (empty payload)"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    
    // Lấy danh sách ID đã có trong cột 10 để chống ghi trùng lặp
    var existingIds = {};
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var idValues = sheet.getRange(2, 10, lastRow - 1, 1).getValues();
      for (var i = 0; i < idValues.length; i++) {
        var id = String(idValues[i][0]).trim();
        if (id) existingIds[id] = true;
      }
    }
    
    var rowsToAdd = [];
    
    // Hỗ trợ cả 2 dạng: Gửi 1 bản ghi đơn hoặc gửi mảng nhiều bản ghi (batch sync)
    var entries = [];
    if (Array.isArray(data)) {
      entries = data;
    } else if (data.entries && Array.isArray(data.entries)) {
      entries = data.entries;
    } else {
      entries = [data];
    }
    
    for (var k = 0; k < entries.length; k++) {
      var item = entries[k];
      var entryId = String(item.id || item.entryId || ("ID_" + new Date().getTime() + "_" + k)).trim();
      
      // Bỏ qua nếu bản ghi này đã được lưu trước đó
      if (existingIds[entryId]) {
        continue;
      }
      
      // Chuyển đổi số giây thành định dạng mm:ss
      var formattedTime = "";
      if (typeof item.timeElapsed === "number") {
        var mins = Math.floor(item.timeElapsed / 60);
        var secs = item.timeElapsed % 60;
        formattedTime = (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
      } else {
        formattedTime = String(item.timeElapsed || "00:00");
      }
      
      var isVictory = item.isVictory || item.score === 15;
      var ketQua = isVictory ? "🏆 CHIẾN THẮNG" : (item.score >= 10 ? "⭐ Xuất sắc" : (item.score >= 5 ? "👍 Khá" : "Cần cố gắng"));
      
      var hinhThuc = item.isVoluntaryStop ? "Dừng cuộc chơi" : (isVictory ? "Vượt qua câu 15" : "Sai câu trả lời");
      
      // Lấy thời gian ghi nhận (GMT+7)
      var timestamp = item.date || Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
      
      var row = [
        timestamp,
        item.playerName || "Thí sinh ẩn danh",
        item.playerClass || "10",
        Number(item.score !== undefined ? item.score : 0),
        item.prizeWon || "0 VNĐ",
        formattedTime,
        item.topicTitle || "Toán 10 - Bài 2: Tập hợp và các phép toán trên tập hợp",
        ketQua,
        hinhThuc,
        entryId
      ];
      
      rowsToAdd.push(row);
      existingIds[entryId] = true;
    }
    
    if (rowsToAdd.length > 0) {
      // Ghi hàng loạt vào sheet để tối ưu tốc độ
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAdd.length, HEADERS.length).setValues(rowsToAdd);
      
      // Định dạng canh lề các cột mới ghi
      sheet.getRange(startRow, 1, rowsToAdd.length, 1).setHorizontalAlignment("center");
      sheet.getRange(startRow, 3, rowsToAdd.length, 1).setHorizontalAlignment("center");
      sheet.getRange(startRow, 4, rowsToAdd.length, 1).setHorizontalAlignment("center").setFontWeight("bold");
      sheet.getRange(startRow, 5, rowsToAdd.length, 1).setHorizontalAlignment("right");
      sheet.getRange(startRow, 6, rowsToAdd.length, 1).setHorizontalAlignment("center");
      sheet.getRange(startRow, 8, rowsToAdd.length, 1).setHorizontalAlignment("center");
      sheet.getRange(startRow, 9, rowsToAdd.length, 1).setHorizontalAlignment("center");
      sheet.getRange(startRow, 10, rowsToAdd.length, 1).setHorizontalAlignment("center");
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu " + rowsToAdd.length + " kết quả vào Google Sheet thành công!",
      savedCount: rowsToAdd.length,
      timestamp: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Lỗi xử lý: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * Xử lý yêu cầu GET: Kiểm tra kết nối từ ứng dụng (Ping test) hoặc mở trực tiếp trên trình duyệt
 */
function doGet(e) {
  // Nếu có tham số test/ping từ ứng dụng
  if (e && e.parameter && (e.parameter.action === "ping" || e.parameter.check === "1")) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Kết nối Google Apps Script thành công!",
      sheetName: SHEET_NAME,
      time: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Nếu người dùng bấm mở link trực tiếp trên trình duyệt
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>Trạng thái kết nối Google Apps Script</title>' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }' +
    '.card { background: #1e293b; border: 2px solid #3b82f6; border-radius: 16px; padding: 32px; max-width: 520px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }' +
    'h1 { color: #60a5fa; margin-top: 0; font-size: 22px; }' +
    'p { color: #cbd5e1; font-size: 14px; line-height: 1.6; }' +
    '.badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 16px; font-size: 13px; }' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="badge">✓ HOẠT ĐỘNG TỐT</div>' +
    '<h1>Google Apps Script Đã Sẵn Sàng!</h1>' +
    '<p>Ứng dụng <b>Ai Là Triệu Phú Toán 10 - Bài 2: Tập hợp</b> hiện có thể tự động gửi dữ liệu về Google Sheet này từ bất kỳ đâu (kể cả khi deploy trên Vercel).</p>' +
    '<p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Bạn có thể đóng tab này và dán URL vào phần cài đặt của ứng dụng.</p>' +
    '</div></body></html>';
    
  return HtmlService.createHtmlOutput(html)
    .setTitle("Ai Là Triệu Phú - Google Apps Script Status")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
