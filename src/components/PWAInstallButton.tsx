import React, { useState } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running standalone, don't show
  if (isInstalled) {
    return null;
  }

  // Android / Chrome / Edge / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-yellow-400 active:scale-95 transition-all cursor-pointer border border-yellow-300"
        title="Cài đặt game về điện thoại để chơi không cần mạng"
      >
        <Download size={14} className="stroke-[2.5]" />
        <span>Cài app về máy</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-full bg-slate-800/90 border border-yellow-400/50 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-md"
          title="Hướng dẫn cài đặt lên iPhone/iPad"
        >
          <Smartphone size={14} className="text-yellow-400" />
          <span className="hidden xs:inline">Thêm vào MH chính</span>
          <span className="xs:hidden">Cài app</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-5 shadow-2xl border-2 border-yellow-500/60 text-white relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-base mb-3">
                <Smartphone size={20} />
                <span>Cài đặt trên iPhone / iPad</span>
              </div>
              
              <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <div className="flex items-start gap-2.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                  <div>
                    Nhấn vào nút <strong className="text-blue-300 inline-flex items-center gap-1"><Share size={13} /> Chia sẻ</strong> ở thanh công cụ trình duyệt Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                  <div>
                    Cuộn xuống và chọn <strong className="text-yellow-400 inline-flex items-center gap-1"><PlusSquare size={13} /> Thêm vào MH chính (Add to Home Screen)</strong>.
                  </div>
                </div>

                <p className="text-[11px] text-green-300 font-medium">
                  ✓ Sau khi thêm, bạn có thể mở chơi toàn màn hình bất cứ lúc nào ngay cả khi ngắt Wi-Fi / 4G!
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-yellow-500 hover:bg-yellow-400 py-2.5 text-xs font-bold text-slate-950 transition-colors uppercase tracking-wider"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers without beforeinstallprompt but installable
  return null;
};
