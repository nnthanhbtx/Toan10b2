import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Clock, 
  User, 
  Trash2, 
  X, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Flame,
  Search,
  BookOpen,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { getSyncedEntryIds, isGoogleSheetConfigured } from '../services/googleSheets';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  playerClass: string;
  score: number; // 0..15
  prizeWon: string;
  timeElapsed: number; // seconds
  topicTitle: string;
  date: string;
  isVictory: boolean;
  isVoluntaryStop?: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onClearHistory: () => void;
  onDeleteEntry?: (id: string) => void;
  onOpenGoogleSheet?: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onClearHistory,
  onDeleteEntry,
  onOpenGoogleSheet
}) => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'recent'>('ranking');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [deletedToast, setDeletedToast] = useState(false);

  if (!isOpen) return null;

  const isConfigured = isGoogleSheetConfigured();
  const syncedIds = getSyncedEntryIds();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter entries
  const filteredEntries = entries.filter(e => 
    e.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.playerClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.topicTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (activeTab === 'ranking') {
      // Sort by score desc, then time asc
      if (b.score !== a.score) return b.score - a.score;
      return a.timeElapsed - b.timeElapsed;
    } else {
      // Sort by date/id desc
      return Number(b.id) - Number(a.id);
    }
  });

  const totalPlays = entries.length;
  const victoriesCount = entries.filter(e => e.isVictory || e.score === 15).length;
  const avgScore = totalPlays > 0 ? (entries.reduce((acc, curr) => acc + curr.score, 0) / totalPlays).toFixed(1) : '0';

  const top1 = activeTab === 'ranking' && sortedEntries.length > 0 ? sortedEntries[0] : null;
  const top2 = activeTab === 'ranking' && sortedEntries.length > 1 ? sortedEntries[1] : null;
  const top3 = activeTab === 'ranking' && sortedEntries.length > 2 ? sortedEntries[2] : null;

  const handleExecuteClear = () => {
    onClearHistory();
    setShowConfirmClear(false);
    setDeletedToast(true);
    setTimeout(() => setDeletedToast(false), 2500);
  };

  return (
    <motion.div
      id="leaderboard-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        id="leaderboard-modal-card"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="bg-slate-900 border-2 border-yellow-500/60 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.25)] p-3.5 sm:p-6 w-full max-w-3xl max-h-[94vh] flex flex-col relative text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg border border-yellow-300/40 flex-shrink-0">
              <Trophy size={20} className="text-slate-950 fill-slate-950 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 uppercase tracking-wide">
                Bảng Vàng Vinh Danh
              </h2>
              <p className="text-[10px] sm:text-xs text-blue-300 font-medium truncate">
                Toán 10 &bull; Bài 2: Tập hợp và các phép toán &bull; 100 bài gần nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenGoogleSheet && (
              <button
                id="open-google-sheet-config-btn"
                onClick={onOpenGoogleSheet}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  isConfigured 
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/50 text-emerald-300' 
                    : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/50 text-amber-300'
                }`}
                title="Cài đặt & Đồng bộ Google Sheet"
              >
                <FileSpreadsheet size={13} className={isConfigured ? 'text-emerald-400' : 'text-amber-400'} />
                <span className="hidden sm:inline">Google Sheet</span>
                <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400'}`} />
              </button>
            )}

            {entries.length > 0 && !showConfirmClear && (
              <button
                id="header-clear-leaderboard-btn"
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold transition-all"
                title="Xoá toàn bộ lịch sử bảng vàng"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Xoá</span>
              </button>
            )}

            <button
              id="close-leaderboard-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toast alert on clear */}
        {deletedToast && (
          <div className="bg-green-600/90 text-white text-xs px-3 py-1.5 rounded-xl text-center my-2 font-bold flex items-center justify-center gap-1.5 border border-green-400 animate-fadeIn">
            <CheckCircle2 size={15} /> Đã xoá sạch lịch sử Bảng Vàng!
          </div>
        )}

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-2.5 sm:my-3">
          <div className="bg-slate-800/70 border border-yellow-500/20 p-1.5 sm:p-2.5 rounded-xl text-center">
            <div className="text-[9px] sm:text-xs text-slate-400 flex items-center justify-center gap-1">
              <User size={11} className="text-blue-400" /> <span className="truncate">Gần nhất</span>
            </div>
            <div className="text-sm sm:text-xl font-bold text-white mt-0.5">
              {totalPlays}<span className="text-[10px] sm:text-xs font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="bg-slate-800/70 border border-yellow-500/20 p-1.5 sm:p-2.5 rounded-xl text-center">
            <div className="text-[9px] sm:text-xs text-slate-400 flex items-center justify-center gap-1">
              <Sparkles size={11} className="text-yellow-400" /> <span className="truncate">15/15 câu</span>
            </div>
            <div className="text-sm sm:text-xl font-bold text-yellow-400 mt-0.5">{victoriesCount}</div>
          </div>
          <div className="bg-slate-800/70 border border-yellow-500/20 p-1.5 sm:p-2.5 rounded-xl text-center">
            <div className="text-[9px] sm:text-xs text-slate-400 flex items-center justify-center gap-1">
              <Award size={11} className="text-green-400" /> <span className="truncate">Điểm TB</span>
            </div>
            <div className="text-sm sm:text-xl font-bold text-green-400 mt-0.5">{avgScore} <span className="text-[9px] sm:text-xs font-normal text-slate-400">câu</span></div>
          </div>
        </div>

        {/* Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between mb-2.5 sm:mb-3">
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              id="tab-ranking-btn"
              onClick={() => setActiveTab('ranking')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'ranking' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Flame size={13} /> Xếp hạng
            </button>
            <button
              id="tab-recent-btn"
              onClick={() => setActiveTab('recent')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'recent' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar size={13} /> Gần đây
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="leaderboard-search-input"
              type="text"
              placeholder="Tìm tên, lớp, chủ đề..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 transition-all"
            />
          </div>
        </div>

        {/* Podium for Top 3 in Ranking tab when no search */}
        {activeTab === 'ranking' && !searchTerm && entries.length >= 3 && top1 && top2 && top3 && (
          <div className="bg-gradient-to-b from-blue-950/40 to-slate-800/40 border border-yellow-500/20 rounded-2xl p-2 sm:p-3 mb-2.5 sm:mb-3">
            <div className="text-[10px] sm:text-[11px] font-bold text-yellow-400 text-center uppercase tracking-wider mb-1.5 sm:mb-2 flex items-center justify-center gap-1">
              <Sparkles size={12} /> Top 3 Kỷ Lục Đỉnh Cao
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-end pt-1 pb-1 text-center">
              {/* Top 2 */}
              <div className="bg-slate-800/90 border border-slate-600/60 rounded-xl p-1.5 sm:p-2 flex flex-col items-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-300 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center shadow-md mb-0.5 sm:mb-1">
                  2
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white truncate max-w-full">{top2.playerName}</div>
                <div className="text-[9px] sm:text-[10px] text-blue-300">{top2.playerClass}</div>
                <div className="text-[11px] sm:text-xs font-black text-yellow-400 mt-0.5">{top2.score}/15</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{formatTime(top2.timeElapsed)}</div>
              </div>

              {/* Top 1 */}
              <div className="bg-gradient-to-b from-amber-950/80 to-slate-800 border-2 border-yellow-400 rounded-xl p-2 sm:p-2.5 flex flex-col items-center shadow-[0_0_20px_rgba(234,179,8,0.3)] relative -mt-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-300 animate-bounce text-xs sm:text-sm">
                  👑
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md mb-0.5 sm:mb-1 mt-0.5">
                  1
                </div>
                <div className="text-xs sm:text-sm font-black text-yellow-300 truncate max-w-full">{top1.playerName}</div>
                <div className="text-[9px] sm:text-xs text-blue-200">{top1.playerClass}</div>
                <div className="text-xs sm:text-sm font-black text-yellow-400 mt-0.5">{top1.score}/15</div>
                <div className="text-[9px] sm:text-[10px] text-amber-300/80 font-mono">{formatTime(top1.timeElapsed)}</div>
              </div>

              {/* Top 3 */}
              <div className="bg-slate-800/90 border border-amber-800/60 rounded-xl p-1.5 sm:p-2 flex flex-col items-center">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-600 text-white font-black text-[11px] sm:text-xs flex items-center justify-center shadow-md mb-0.5 sm:mb-1">
                  3
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white truncate max-w-full">{top3.playerName}</div>
                <div className="text-[9px] sm:text-[10px] text-blue-300">{top3.playerClass}</div>
                <div className="text-[11px] sm:text-xs font-black text-yellow-400 mt-0.5">{top3.score}/15</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{formatTime(top3.timeElapsed)}</div>
              </div>
            </div>
          </div>
        )}

        {/* List of Entries */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[42vh]">
          {sortedEntries.length === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm text-center">
              <Trophy size={32} className="text-slate-600 mb-2 stroke-1" />
              <p className="font-semibold text-slate-300">Chưa có lượt thi nào được ghi nhận.</p>
              <p className="text-[11px] text-slate-500 mt-1">Hãy bắt đầu thi đấu để ghi danh đầu tiên vào Bảng Vàng!</p>
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              const rank = index + 1;
              const isGold = activeTab === 'ranking' && rank === 1;
              const isSilver = activeTab === 'ranking' && rank === 2;
              const isBronze = activeTab === 'ranking' && rank === 3;
              const isPerfect = entry.score === 15;

              return (
                <div
                  key={entry.id || index}
                  className={`p-2 sm:p-3 rounded-xl border flex items-center gap-2 sm:gap-3 transition-all group ${
                    isGold 
                      ? 'bg-amber-950/40 border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.15)]' 
                      : isSilver 
                      ? 'bg-slate-800/80 border-slate-400/50' 
                      : isBronze 
                      ? 'bg-slate-800/80 border-amber-700/40' 
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Rank badge */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs sm:text-sm">
                    {activeTab === 'ranking' ? (
                      isGold ? (
                        <span className="w-full h-full rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center shadow font-black">1</span>
                      ) : isSilver ? (
                        <span className="w-full h-full rounded-lg bg-slate-300 text-slate-950 flex items-center justify-center shadow font-black">2</span>
                      ) : isBronze ? (
                        <span className="w-full h-full rounded-lg bg-amber-600 text-white flex items-center justify-center shadow font-black">3</span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">#{rank}</span>
                      )
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">#{sortedEntries.length - index}</span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-sm truncate">
                        {entry.playerName}
                      </span>
                      <span className="text-[9px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-500/30 flex-shrink-0">
                        {entry.playerClass}
                      </span>
                      {isPerfect && (
                        <span className="text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-yellow-500 text-slate-950 flex-shrink-0 flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> Triệu Phú
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-xs text-slate-400 mt-0.5 truncate">
                      <span className="truncate flex items-center gap-1">
                        <BookOpen size={10} className="text-yellow-400/80" /> {entry.topicTitle}
                      </span>
                      <span className="flex-shrink-0 hidden xs:inline">{entry.date}</span>
                      {syncedIds.has(entry.id) && (
                        <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30 flex-shrink-0">
                          ✓ Đã lưu Sheet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score & Prize */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs sm:text-sm font-black text-yellow-400">
                      {entry.score}/15 <span className="text-[9px] font-normal text-slate-300">câu</span>
                    </div>
                    <div className="text-[9px] sm:text-xs text-slate-300 font-mono flex items-center justify-end gap-1">
                      <Clock size={10} /> {formatTime(entry.timeElapsed)}
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold text-amber-300/90 truncate">
                      {entry.prizeWon} đ
                    </div>
                  </div>

                  {/* Individual Delete Button */}
                  {onDeleteEntry && (
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      title="Xoá kết quả này"
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 opacity-40 group-hover:opacity-100 transition-opacity ml-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Confirmation banner for clearing all */}
        {showConfirmClear && (
          <div className="mt-2.5 p-3 rounded-xl bg-red-950/80 border-2 border-red-500/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-2 text-red-200 text-xs text-center sm:text-left">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
              <span>Bạn có chắc chắn muốn xoá vĩnh viễn toàn bộ lịch sử Bảng Vàng không?</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="cancel-clear-btn"
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                id="execute-clear-btn"
                onClick={handleExecuteClear}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Trash2 size={13} /> Xoá toàn bộ
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2.5 sm:pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs mt-2">
          {!showConfirmClear && (
            <button
              id="request-clear-history-footer-btn"
              onClick={() => setShowConfirmClear(true)}
              className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 px-3 py-1.5 rounded-xl cursor-pointer"
              disabled={entries.length === 0}
            >
              <Trash2 size={13} /> Xoá lịch sử Bảng Vàng
            </button>
          )}

          <button
            id="close-leaderboard-bottom-btn"
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md ml-auto cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
