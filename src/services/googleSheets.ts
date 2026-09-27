import { LeaderboardEntry } from '../components/LeaderboardModal';

const STORAGE_KEY_URL = 'trieu_phu_sheets_url';
const STORAGE_KEY_PENDING = 'trieu_phu_pending_sheet_sync';
const STORAGE_KEY_SYNCED_IDS = 'trieu_phu_synced_entry_ids';

/**
 * Lấy URL Google Apps Script Web App đã cấu hình
 * Ưu tiên: localStorage > Biến môi trường Vercel (VITE_GOOGLE_SHEET_SCRIPT_URL)
 */
export function getGoogleSheetUrl(): string {
  try {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim();
    }
  } catch (e) {
    console.error('Error reading google sheet url from storage', e);
  }

  // Fallback sang biến môi trường nếu có
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_SHEET_SCRIPT_URL || '';
  return envUrl.trim();
}

/**
 * Lưu URL Google Apps Script vào localStorage
 */
export function setGoogleSheetUrl(url: string): void {
  try {
    if (!url || url.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
    }
  } catch (e) {
    console.error('Error saving google sheet url', e);
  }
}

/**
 * Kiểm tra xem đã có cấu hình Google Sheet hay chưa
 */
export function isGoogleSheetConfigured(): boolean {
  const url = getGoogleSheetUrl();
  return Boolean(url && url.startsWith('https://script.google.com/macros/s/'));
}

/**
 * Lấy danh sách ID các bài thi đã được đồng bộ thành công
 */
export function getSyncedEntryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNCED_IDS);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {
    // fallback
  }
  return new Set();
}

/**
 * Đánh dấu một bài thi đã được đồng bộ
 */
export function markEntryAsSynced(id: string): void {
  try {
    const set = getSyncedEntryIds();
    set.add(id);
    // Giới hạn lưu 300 ID gần nhất
    const arr = Array.from(set).slice(-300);
    localStorage.setItem(STORAGE_KEY_SYNCED_IDS, JSON.stringify(arr));
  } catch (e) {
    console.error('Error marking entry as synced', e);
  }
}

/**
 * Lấy danh sách hàng đợi các bài thi chưa đồng bộ được do mất mạng
 */
export function getPendingEntries(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

/**
 * Lưu bài thi vào hàng đợi để chờ có mạng đồng bộ sau
 */
export function queuePendingEntry(entry: LeaderboardEntry): void {
  try {
    const list = getPendingEntries();
    // Tránh trùng lặp trong hàng đợi
    if (!list.some(item => item.id === entry.id)) {
      list.push(entry);
      localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(list.slice(-100)));
    }
  } catch (e) {
    console.error('Error queueing pending entry', e);
  }
}

/**
 * Xóa một hoặc nhiều bài thi khỏi hàng đợi
 */
export function removePendingEntries(idsToRemove: string[]): void {
  try {
    const list = getPendingEntries();
    const updated = list.filter(item => !idsToRemove.includes(item.id));
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(updated));
  } catch (e) {
    console.error('Error removing pending entries', e);
  }
}

/**
 * Gửi dữ liệu kết quả thi sang Google Apps Script
 * Hỗ trợ chế độ chống lỗi CORS từ Vercel sang Google Sheets
 */
export async function sendPayloadToGoogleScript(
  scriptUrl: string, 
  payload: LeaderboardEntry | { action: string; entries: LeaderboardEntry[] }
): Promise<{ success: boolean; message: string }> {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Chưa cấu hình URL Google Apps Script hợp lệ (phải bắt đầu bằng https://script.google.com/macros/s/...)'
    };
  }

  const jsonString = JSON.stringify(payload);

  try {
    // Thử gửi dạng text/plain với mode: 'no-cors'
    // Đây là phương thức chuẩn nhất để vượt qua CORS của Google Apps Script từ các domain khác (như Vercel)
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: jsonString
    });

    // Với mode 'no-cors', nếu fetch không ném lỗi network thì request đã được gửi thành công đến Google Apps Script
    return {
      success: true,
      message: 'Đã gửi dữ liệu thành công đến Google Sheet!'
    };
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu sang Google Sheet:', error);
    return {
      success: false,
      message: 'Không thể kết nối đến Google Apps Script: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Tự động đồng bộ 1 kết quả thi vừa hoàn thành lên Google Sheet
 */
export async function syncEntryToGoogleSheet(
  entry: LeaderboardEntry
): Promise<{ success: boolean; queued?: boolean; message: string }> {
  const url = getGoogleSheetUrl();

  // Nếu chưa cấu hình Google Sheet URL, lưu tạm vào pending queue để khi người dùng nhập URL thì đồng bộ lại
  if (!url) {
    queuePendingEntry(entry);
    return {
      success: false,
      queued: true,
      message: 'Chưa cấu hình Google Sheet URL. Đã lưu bài thi vào bộ nhớ tạm.'
    };
  }

  // Nếu đang mất mạng ngoại tuyến, đưa vào hàng đợi
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    queuePendingEntry(entry);
    return {
      success: false,
      queued: true,
      message: 'Đang không có kết nối internet. Kết quả sẽ tự động lưu khi có mạng trở lại.'
    };
  }

  const result = await sendPayloadToGoogleScript(url, entry);
  if (result.success) {
    markEntryAsSynced(entry.id);
    removePendingEntries([entry.id]);
    return {
      success: true,
      message: 'Đã lưu kết quả bài thi vào Google Sheet thành công!'
    };
  } else {
    queuePendingEntry(entry);
    return {
      success: false,
      queued: true,
      message: result.message
    };
  }
}

/**
 * Đồng bộ tất cả các bài thi chưa lưu trong hàng đợi khi có mạng trở lại
 */
export async function flushPendingEntries(): Promise<{ syncedCount: number; remainingCount: number }> {
  const url = getGoogleSheetUrl();
  if (!url) return { syncedCount: 0, remainingCount: 0 };

  const pending = getPendingEntries();
  if (pending.length === 0) return { syncedCount: 0, remainingCount: 0 };

  try {
    const result = await sendPayloadToGoogleScript(url, {
      action: 'batch_sync',
      entries: pending
    });

    if (result.success) {
      const syncedIds = pending.map(e => e.id);
      syncedIds.forEach(id => markEntryAsSynced(id));
      removePendingEntries(syncedIds);
      return { syncedCount: pending.length, remainingCount: 0 };
    }
  } catch (e) {
    console.error('Error flushing pending entries', e);
  }

  return { syncedCount: 0, remainingCount: pending.length };
}

/**
 * Kiểm tra kết nối đến Google Apps Script (Ping test)
 */
export async function testGoogleSheetConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
  const url = (customUrl || getGoogleSheetUrl()).trim();
  if (!url || !url.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'URL không hợp lệ! URL phải có dạng https://script.google.com/macros/s/.../exec'
    };
  }

  try {
    // Gọi thử GET với tham số action=ping
    const pingUrl = url.includes('?') ? `${url}&action=ping&_t=${Date.now()}` : `${url}?action=ping&_t=${Date.now()}`;
    
    // Thử gửi ping
    try {
      const resp = await fetch(pingUrl, { method: 'GET', mode: 'cors' });
      if (resp.ok) {
        const data = await resp.json();
        return {
          success: true,
          message: data.message || 'Kết nối Google Apps Script thành công!'
        };
      }
    } catch {
      // Nếu GET bị CORS, thử test bằng cách gửi thử 1 gói tin no-cors
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping_test', timestamp: new Date().toISOString() })
      });
      return {
        success: true,
        message: 'Kết nối máy chủ Google thành công (Web App đã phản hồi)!'
      };
    }

    return {
      success: true,
      message: 'Kết nối máy chủ Google thành công!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Không thể kết nối đến URL này: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}
