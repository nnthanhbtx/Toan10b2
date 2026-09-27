import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Copy, 
  Check, 
  Link, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Database,
  CloudUpload,
  Info,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getGoogleSheetUrl, 
  setGoogleSheetUrl, 
  testGoogleSheetConnection, 
  getPendingEntries,
  flushPendingEntries,
  sendPayloadToGoogleScript,
  getSyncedEntryIds,
  markEntryAsSynced
} from '../services/googleSheets';
import { LeaderboardEntry } from './LeaderboardModal';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
}

export const APPS_SCRIPT_SOURCE_CODE = `/**
 * ==============================================================================
 * DỰ ÁN: AI LÀ TRIỆU PHÚ TOÁN 10 - BÀI 2: TẬP HỢP VÀ CÁC PHÉP TOÁN TRÊN TẬP HỢP
 * MÃ NGUỒN GOOGLE APPS SCRIPT ĐỒNG BỘ KẾT QUẢ VỀ GOOGLE SHEET TỰ ĐỘNG
 * ==============================================================================
 */

var SHEET_NAME = "Kết quả thi";

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

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#f8fafc");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    headerRange.setFontSize(11);
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);
    
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 80);
    sheet.setColumnWidth(4, 110);
    sheet.setColumnWidth(5, 140);
    sheet.setColumnWidth(6, 130);
    sheet.setColumnWidth(7, 280);
    sheet.setColumnWidth(8, 120);
    sheet.setColumnWidth(9, 140);
    sheet.setColumnWidth(10, 160);
  }
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
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
      
      if (existingIds[entryId]) {
        continue;
      }
      
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
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAdd.length, HEADERS.length).setValues(rowsToAdd);
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
      savedCount: rowsToAdd.length
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

function doGet(e) {
  if (e && e.parameter && (e.parameter.action === "ping" || e.parameter.check === "1")) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Kết nối Google Apps Script thành công!",
      sheetName: SHEET_NAME,
      time: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>Trạng thái kết nối Google Apps Script</title>' +
    '<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}' +
    '.box{background:#1e293b;border:2px solid #3b82f6;border-radius:16px;padding:32px;text-align:center;max-width:500px}' +
    '.tag{background:#10b981;color:white;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;display:inline-block;margin-bottom:12px}' +
    '</style></head><body><div class="box"><div class="tag">✓ HOẠT ĐỘNG TỐT</div>' +
    '<h2>Google Apps Script Đã Sẵn Sàng!</h2>' +
    '<p>Hệ thống tự động lưu điểm Ai Là Triệu Phú Toán 10 đang hoạt động ổn định.</p>' +
    '</div></body></html>';
    
  return HtmlService.createHtmlOutput(html)
    .setTitle("Ai Là Triệu Phú - Google Apps Script Status")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}`;

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  entries
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllMsg, setSyncAllMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'setup' | 'code' | 'sync'>('setup');

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getGoogleSheetUrl());
      setTestResult(null);
      setSyncAllMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = APPS_SCRIPT_SOURCE_CODE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSaveUrl = () => {
    const cleanUrl = urlInput.trim();
    setGoogleSheetUrl(cleanUrl);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleTestConnection = async () => {
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setTestResult({
        success: false,
        message: 'Vui lòng dán URL Google Apps Script Web App trước khi kiểm tra!'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testGoogleSheetConnection(cleanUrl);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      setGoogleSheetUrl(cleanUrl);
    }
  };

  const handleSyncAllEntries = async () => {
    const currentUrl = urlInput.trim() || getGoogleSheetUrl();
    if (!currentUrl) {
      setSyncAllMsg('⚠️ Vui lòng cấu hình URL Google Sheet trước!');
      return;
    }

    if (entries.length === 0) {
      setSyncAllMsg('ℹ️ Hiện chưa có bài thi nào trên Bảng Vàng để đồng bộ.');
      return;
    }

    setIsSyncingAll(true);
    setSyncAllMsg(null);

    try {
      // Gửi toàn bộ danh sách bài thi hiện có
      const result = await sendPayloadToGoogleScript(currentUrl, {
        action: 'batch_sync',
        entries: entries
      });

      if (result.success) {
        entries.forEach(e => markEntryAsSynced(e.id));
        await flushPendingEntries();
        setSyncAllMsg(`🎉 Đã đồng bộ thành công ${entries.length} bài thi lên Google Sheet!`);
      } else {
        setSyncAllMsg(`❌ ${result.message}`);
      }
    } catch (e) {
      setSyncAllMsg(`❌ Lỗi đồng bộ: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const pendingEntries = getPendingEntries();
  const syncedIds = getSyncedEntryIds();
  const syncedCount = entries.filter(e => syncedIds.has(e.id)).length;

  return (
    <motion.div
      id="google-sheet-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        id="google-sheet-modal-card"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] p-3.5 sm:p-6 w-full max-w-2xl max-h-[94vh] flex flex-col relative text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border border-emerald-300/40 flex-shrink-0">
              <FileSpreadsheet size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-400 uppercase tracking-wide">
                Đồng Bộ Google Sheet
              </h2>
              <p className="text-[10px] sm:text-xs text-emerald-300 font-medium truncate">
                Tự động lưu bảng điểm học sinh khi đưa app lên Vercel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex gap-1.5 my-3 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'setup' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link size={13} /> 1. Cài đặt URL
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'code' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Copy size={13} /> 2. Lấy mã Apps Script
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sync' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudUpload size={13} /> 3. Quản lý đồng bộ
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-4">
          {/* TAB 1: SETUP URL */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs leading-relaxed text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm mb-1">
                  <ShieldCheck size={16} /> Tự Động Lưu Thời Gian Thực
                </div>
                Mỗi khi học sinh hoàn thành bài thi (Thắng cuộc, dừng cuộc chơi hoặc trả lời sai), ứng dụng sẽ 
                <strong> tự động gửi ngay lập tức</strong> điểm số, thời gian, tên và lớp về Google Sheet của bạn mà không cần bất kỳ thao tác nào!
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
                  <Link size={13} className="text-emerald-400" /> URL Ứng Dụng Web (Google Apps Script)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUrl}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Check size={14} /> Lưu URL
                    </button>
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} /> Kiểm tra
                    </button>
                  </div>
                </div>
              </div>

              {/* Save toast */}
              {saveToast && (
                <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 size={15} /> Đã lưu URL thành công vào bộ nhớ ứng dụng!
                </div>
              )}

              {/* Test Connection Result */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                    : 'bg-red-950/60 border-red-500/50 text-red-200'
                }`}>
                  {testResult.success ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-bold">{testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại'}</div>
                    <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
                  </div>
                </div>
              )}

              {/* Quick instructions on Vercel deployment */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> Cách cài đặt tự động khi đưa app lên Vercel:
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5">
                  <p>
                    1. <strong>Tự động cho cả trường:</strong> Trên dashboard của Vercel &gt; Settings &gt; Environment Variables &gt; Thêm biến <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_GOOGLE_SHEET_SCRIPT_URL</code> với giá trị là link Apps Script của bạn.
                  </p>
                  <p>
                    2. <strong>Hoặc cài đặt trực tiếp tại đây:</strong> Bạn chỉ cần dán link vào ô trên và nhấn "Lưu URL", trình duyệt sẽ ghi nhớ và tự động gửi điểm!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE APPS SCRIPT */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Mã nguồn Google Apps Script (Code.gs):
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedCode 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode ? 'Đã sao chép mã!' : 'Sao chép toàn bộ mã'}
                </button>
              </div>

              {/* Steps guide */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 text-slate-200">
                <div className="font-bold text-emerald-400 mb-1">Các bước triển khai trên Google Sheets:</div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                  <span>Mở Google Sheets mới &gt; Menu: <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                  <span>Xoá hết code trong <code>Code.gs</code>, nhấn nút "Sao chép toàn bộ mã" ở trên và dán vào. Nhấn <strong>Lưu (Ctrl + S)</strong>.</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                  <span>
                    Bấm <strong>Triển khai (Deploy)</strong> &gt; <strong>Bản triển khai mới</strong> &gt; Chọn <strong>Ứng dụng web</strong>.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">!</span>
                  <span className="text-amber-300 font-medium">
                    Mục "Ai có quyền truy cập" (Who has access): Chọn <strong>Bất kỳ ai (Anyone)</strong>. Sau đó nhấn Triển khai và cấp quyền.
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">4</span>
                  <span>Copy URL kết thúc bằng <code>/exec</code> dán vào Tab 1 của ứng dụng.</span>
                </div>
              </div>

              {/* Code viewer box */}
              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-emerald-300 font-mono max-h-56 overflow-y-auto custom-scrollbar select-all">
                  {APPS_SCRIPT_SOURCE_CODE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC MANAGEMENT */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">Tổng bài thi trên máy</div>
                  <div className="text-lg font-black text-white mt-0.5">{entries.length}</div>
                </div>
                <div className="bg-slate-800/80 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-400">Đã lưu Google Sheet</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">{syncedCount}</div>
                </div>
                <div className="bg-slate-800/80 border border-amber-500/30 p-2.5 rounded-xl text-center">
                  <div className="text-[10px] text-amber-400">Chờ mạng gửi sau</div>
                  <div className="text-lg font-black text-amber-400 mt-0.5">{pendingEntries.length}</div>
                </div>
              </div>

              {/* Manual Batch Sync Button */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database size={14} className="text-emerald-400" /> Đồng bộ tất cả dữ liệu
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Gửi toàn bộ danh sách thí sinh trên Bảng Vàng vào Google Sheet
                    </div>
                  </div>

                  <button
                    onClick={handleSyncAllEntries}
                    disabled={isSyncingAll}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <CloudUpload size={14} className={isSyncingAll ? 'animate-bounce' : ''} />
                    {isSyncingAll ? 'Đang gửi...' : 'Đồng bộ ngay'}
                  </button>
                </div>

                {syncAllMsg && (
                  <div className="text-xs font-medium p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                    {syncAllMsg}
                  </div>
                )}
              </div>

              {/* Auto retry note */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-200 flex items-start gap-2">
                <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Cơ chế tự phục hồi ngoại tuyến:</strong> Khi học sinh làm bài không có mạng wifi hoặc kết nối chập chờn, kết quả được bảo toàn trong máy. Ngay khi có mạng trở lại, hệ thống sẽ tự động gửi bù toàn bộ kết quả lên Google Sheet mà không làm mất bài thi.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
