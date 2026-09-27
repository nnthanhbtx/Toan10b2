import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div 
      id="offline-status-banner"
      className="fixed bottom-3 left-3 right-3 sm:right-auto sm:left-4 z-50 flex items-center justify-between sm:justify-start gap-2 rounded-xl bg-amber-600/95 text-amber-50 px-3.5 py-2 text-xs font-semibold shadow-2xl border border-amber-400/40 backdrop-blur-md animate-bounce sm:animate-none"
    >
      <div className="flex items-center gap-2">
        <WifiOff size={16} className="text-yellow-200 flex-shrink-0 animate-pulse" />
        <span>Chế độ Ngoại tuyến &bull; Bạn vẫn có thể chơi đầy đủ 100% không cần Wi-Fi!</span>
      </div>
    </div>
  );
};
