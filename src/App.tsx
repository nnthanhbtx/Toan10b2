import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  HelpCircle, 
  Phone, 
  Users, 
  RotateCcw, 
  Lightbulb, 
  Trophy, 
  Medal, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  ChevronRight, 
  Award, 
  Sparkles, 
  ArrowLeft,
  Check,
  X,
  Clock,
  User,
  GraduationCap,
  ListChecks,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { questionSetsData, Question } from './data';
import { LeaderboardModal, LeaderboardEntry } from './components/LeaderboardModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TikzRenderer } from './components/TikzRenderer';
import { syncEntryToGoogleSheet, flushPendingEntries, isGoogleSheetConfigured } from './services/googleSheets';
import Latex from 'react-latex-next';

// --- Prize ladder constants ---
const PRIZE_LIST = [
  "100.000",
  "200.000",
  "300.000",
  "500.000",
  "1.000.000",   // Milestone 5
  "2.000.000",
  "3.600.000",
  "6.000.000",
  "10.000.000",
  "14.000.000",  // Milestone 10
  "22.000.000",
  "30.000.000",
  "40.000.000",
  "60.000.000",
  "85.000.000"   // Milestone 15
];

const SAFE_HAVEN_INDICES = [4, 9, 14]; // 0-indexed: 5th, 10th, 15th questions

// --- Tikz Component ---
const TikzComponent = ({ code }: { code: string }) => {
  return <TikzRenderer code={code} />;
};

// --- Web Audio API Engine ---
class AudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(frequency: number, type: OscillatorType, duration: number, volume = 0.1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback catch
    }
  }

  playHover() { 
    this.playTone(587.33, 'sine', 0.08, 0.03); 
  }

  playSelect() { 
    this.playTone(330, 'triangle', 0.4, 0.08); 
    setTimeout(() => this.playTone(392, 'triangle', 0.4, 0.08), 80);
  }

  playCorrect() {
    this.playTone(523.25, 'sine', 0.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.25, 0.1), 120); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 240); // G5
    setTimeout(() => this.playTone(1046.50, 'sine', 0.6, 0.12), 360); // C6
  }

  playWrong() {
    this.playTone(220, 'sawtooth', 0.4, 0.12);
    setTimeout(() => this.playTone(164.81, 'sawtooth', 0.6, 0.15), 180);
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.45, 0.1), i * 140);
    });
  }

  playMilestone() {
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.35, 0.1), i * 110);
    });
  }
}

const audio = new AudioEngine();

// --- Main App Component ---
export default function App() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'victory'>('intro');
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('tp_player_name') || '';
    } catch {
      return '';
    }
  });
  const [playerClass, setPlayerClass] = useState(() => {
    try {
      return localStorage.getItem('tp_player_class') || '';
    } catch {
      return '';
    }
  });
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0); // 0..3 or -1 for random
  
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(questionSetsData[0].questions);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showResultStatus, setShowResultStatus] = useState<'none' | 'correct' | 'wrong'>('none');
  
  const [lifelines, setLifelines] = useState({ fiftyFifty: true, askAudience: true, callFriend: true });
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  
  const [activeModal, setActiveModal] = useState<'none' | 'audience' | 'friend' | 'solution' | 'stopConfirm' | 'review' | 'ladder'>('none');
  const [audienceData, setAudienceData] = useState<number[]>([0, 0, 0, 0]);
  const [friendMessage, setFriendMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isVoluntaryStop, setIsVoluntaryStop] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Leaderboard State (Stores up to 100 most recent players)
  const MAX_LEADERBOARD_ENTRIES = 100;
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGoogleSheetModal, setShowGoogleSheetModal] = useState(false);
  const [sheetToast, setSheetToast] = useState<{ show: boolean; type: 'success' | 'info'; msg: string }>({ show: false, type: 'success', msg: '' });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('trieu_phu_toan10_leaderboard');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy dummy seeds and limit to 100 most recent
          return parsed.filter(item => !item.id.startsWith('172396000000')).slice(0, MAX_LEADERBOARD_ENTRIES);
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Clean fresh leaderboard with 0 entries
    return [];
  });

  // Tự động đồng bộ bù các bài thi chờ mạng khi kết nối internet hoạt động trở lại
  useEffect(() => {
    const handleNetworkRecovery = () => {
      flushPendingEntries().then(res => {
        if (res.syncedCount > 0) {
          setSheetToast({
            show: true,
            type: 'success',
            msg: `Đã tự động đồng bộ ${res.syncedCount} bài thi lên Google Sheet khi có mạng!`
          });
          setTimeout(() => setSheetToast({ show: false, type: 'success', msg: '' }), 4000);
        }
      });
    };

    window.addEventListener('online', handleNetworkRecovery);
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      handleNetworkRecovery();
    }

    return () => {
      window.removeEventListener('online', handleNetworkRecovery);
    };
  }, []);

  const saveRunToLeaderboard = (score: number, prize: string, isVictoryState: boolean, isStopState: boolean) => {
    const currentTopic = selectedSetIndex === -1 
      ? "🎲 Ngẫu nhiên (15 câu tổng hợp)" 
      : questionSetsData[selectedSetIndex]?.title || "Toán 10 - Bài 2: Tập hợp và các phép toán trên tập hợp";
    
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(),
      playerName: playerName.trim() || 'Thí sinh',
      playerClass: playerClass.trim() || '10',
      score,
      prizeWon: prize,
      timeElapsed,
      topicTitle: currentTopic,
      date: dateStr,
      isVictory: isVictoryState,
      isVoluntaryStop: isStopState
    };

    setLeaderboard(prev => {
      // Store up to 100 most recent players
      const updated = [newEntry, ...prev].slice(0, MAX_LEADERBOARD_ENTRIES);
      try {
        localStorage.setItem('trieu_phu_toan10_leaderboard', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Tự động lưu dữ liệu kết quả thi về Google Sheet (đặc biệt khi chạy trên Vercel)
    syncEntryToGoogleSheet(newEntry).then(res => {
      if (res.success) {
        setSheetToast({
          show: true,
          type: 'success',
          msg: '✓ Đã tự động lưu kết quả vào Google Sheet!'
        });
        setTimeout(() => setSheetToast({ show: false, type: 'success', msg: '' }), 4000);
      } else if (res.queued) {
        setSheetToast({
          show: true,
          type: 'info',
          msg: 'Đã lưu trên máy (chờ mạng để gửi lên Google Sheet).'
        });
        setTimeout(() => setSheetToast({ show: false, type: 'info', msg: '' }), 4000);
      }
    }).catch(err => {
      console.error('Lỗi tự động gửi Google Sheet:', err);
    });
  };

  const handleClearLeaderboard = () => {
    setLeaderboard([]);
    try {
      localStorage.setItem('trieu_phu_toan10_leaderboard', JSON.stringify([]));
      localStorage.removeItem('trieu_phu_toan10_leaderboard');
      localStorage.removeItem('trieu_phu_toan11_leaderboard');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    setLeaderboard(prev => {
      const updated = prev.filter(entry => entry.id !== entryId);
      try {
        localStorage.setItem('trieu_phu_toan10_leaderboard', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Unlock AudioContext on first touch / tap for iOS and Android
  useEffect(() => {
    const handleFirstTouch = () => {
      audio.init();
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });
    window.addEventListener('click', handleFirstTouch, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  const currentQ = activeQuestions[currentQIndex] || activeQuestions[0];

  // Global Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const toggleSound = () => {
    audio.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted) {
      audio.init();
      audio.playHover();
    }
  };

  // Helper to randomize options order while keeping the correct answer index synchronized
  const shuffleQuestion = (q: Question): Question => {
    const paired = q.options.map((opt, idx) => ({
      opt,
      isCorrect: idx === q.correctAnswerIndex
    }));
    for (let i = paired.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [paired[i], paired[j]] = [paired[j], paired[i]];
    }
    return {
      ...q,
      options: paired.map(p => p.opt),
      correctAnswerIndex: paired.findIndex(p => p.isCorrect)
    };
  };

  const startGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerClass.trim()) return;
    
    try {
      localStorage.setItem('tp_player_name', playerName.trim());
      localStorage.setItem('tp_player_class', playerClass.trim());
    } catch {
      // Ignore localStorage quotas
    }

    audio.init();
    audio.playWin();

    // Prepare questions set
    let rawQuestions: Question[];
    if (selectedSetIndex === -1) {
      // Randomly pool questions with progressive difficulty tiers
      const tier1 = questionSetsData.flatMap(s => s.questions.slice(0, 5)).sort(() => Math.random() - 0.5).slice(0, 5);
      const tier2 = questionSetsData.flatMap(s => s.questions.slice(5, 10)).sort(() => Math.random() - 0.5).slice(0, 5);
      const tier3 = questionSetsData.flatMap(s => s.questions.slice(10, 15)).sort(() => Math.random() - 0.5).slice(0, 5);
      rawQuestions = [...tier1, ...tier2, ...tier3];
    } else {
      rawQuestions = questionSetsData[selectedSetIndex]?.questions || questionSetsData[0].questions;
    }

    const preparedQuestions = rawQuestions.map(q => shuffleQuestion(q));

    setActiveQuestions(preparedQuestions);
    setGameState('playing');
    setTimeElapsed(0);
    setCurrentQIndex(0);
    setIsVoluntaryStop(false);
    setLifelines({ fiftyFifty: true, askAudience: true, callFriend: true });
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setShowResultStatus('none');
    setHiddenOptions([]);
    setActiveModal('none');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerLocked || hiddenOptions.includes(index)) return;
    
    audio.init();
    audio.playSelect();
    setSelectedAnswer(index);
    setIsAnswerLocked(true);

    // Wait 1.8 seconds before revealing result
    setTimeout(() => {
      if (index === currentQ.correctAnswerIndex) {
        audio.playCorrect();
        setShowResultStatus('correct');
        
        // Check milestone sounds
        if (SAFE_HAVEN_INDICES.includes(currentQIndex)) {
          setTimeout(() => audio.playMilestone(), 300);
        }

        // Wait before moving to next question
        setTimeout(() => {
          if (currentQIndex === 14) {
            audio.playWin();
            setGameState('victory');
            saveRunToLeaderboard(15, PRIZE_LIST[14], true, false);
          } else {
            setCurrentQIndex(prev => prev + 1);
            resetQuestionState();
          }
        }, 2200);
      } else {
        audio.playWrong();
        setShowResultStatus('wrong');
        const prize = currentQIndex >= 10 ? PRIZE_LIST[9] : (currentQIndex >= 5 ? PRIZE_LIST[4] : "0");
        setTimeout(() => {
          setGameState('gameover');
          saveRunToLeaderboard(currentQIndex, prize, false, false);
        }, 2200);
      }
    }, 1800);
  };

  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isAnswerLocked) return;
    audio.init();
    audio.playHover();
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
    
    const wrongOptions = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswerIndex);
    // Pick 2 random wrong options to hide
    wrongOptions.sort(() => Math.random() - 0.5);
    setHiddenOptions([wrongOptions[0], wrongOptions[1]]);
  };

  const useAskAudience = () => {
    if (!lifelines.askAudience || isAnswerLocked) return;
    audio.init();
    audio.playHover();
    setLifelines(prev => ({ ...prev, askAudience: false }));
    
    const data = [0, 0, 0, 0];
    const availableIndices = [0, 1, 2, 3].filter(i => !hiddenOptions.includes(i));
    
    // Give correct answer the majority percentage (55% to 85%)
    const correctPercent = Math.min(90, Math.max(50, Math.floor(Math.random() * 30) + 55));
    data[currentQ.correctAnswerIndex] = correctPercent;
    
    let remaining = 100 - correctPercent;
    const remainingWrongIndices = availableIndices.filter(i => i !== currentQ.correctAnswerIndex);
    
    remainingWrongIndices.forEach((idx, i) => {
      if (i === remainingWrongIndices.length - 1) {
        data[idx] = remaining;
      } else {
        const share = Math.floor(Math.random() * (remaining * 0.7));
        data[idx] = share;
        remaining -= share;
      }
    });
    
    setAudienceData(data);
    setActiveModal('audience');
  };

  const useCallFriend = () => {
    if (!lifelines.callFriend || isAnswerLocked) return;
    audio.init();
    audio.playHover();
    setLifelines(prev => ({ ...prev, callFriend: false }));
    
    const isCorrect = Math.random() < 0.85; // 85% accuracy
    const availableWrong = [0, 1, 2, 3].filter(i => i !== currentQ.correctAnswerIndex && !hiddenOptions.includes(i));
    const suggestedIndex = isCorrect || availableWrong.length === 0
      ? currentQ.correctAnswerIndex 
      : availableWrong[Math.floor(Math.random() * availableWrong.length)];
    
    const optionsText = ['A', 'B', 'C', 'D'];
    const friends = ['Bạn Nam', 'Bạn Linh', 'Bạn Tuấn', 'Bạn Mai'];
    const randomFriend = friends[Math.floor(Math.random() * friends.length)];
    
    setFriendMessage(
      `${randomFriend}: "Alo ${playerName || 'bạn'} à! Câu này mình vừa học bài Các số đặc trưng đo xu thế trung tâm xong. Mình tin chắc 90% đáp án đúng là ${optionsText[suggestedIndex]}. Chúc bạn thi tốt nhé!"`
    );
    setActiveModal('friend');
  };

  const handleStopGame = () => {
    const finalPrize = currentQIndex > 0 ? PRIZE_LIST[currentQIndex - 1] : "0";
    setIsVoluntaryStop(true);
    setActiveModal('none');
    setGameState('gameover');
    saveRunToLeaderboard(currentQIndex, finalPrize, false, true);
  };

  const restartGame = () => {
    setGameState('intro');
    resetQuestionState();
  };

  const getGuaranteedPrize = () => {
    if (gameState === 'victory') return PRIZE_LIST[14];
    if (isVoluntaryStop && currentQIndex > 0) return PRIZE_LIST[currentQIndex - 1];
    if (currentQIndex >= 10) return PRIZE_LIST[9]; // 14.000.000
    if (currentQIndex >= 5) return PRIZE_LIST[4];  // 1.000.000
    return "0";
  };

  const getFeedbackMessage = (score: number) => {
    if (score === 15) return "Xuất sắc tuyệt đỉnh! Chúc mừng bạn đã chinh phục 15 câu và trở thành Triệu phú Toán BTX môn Tập hợp & Các phép toán trên tập hợp!";
    if (score >= 11) return "Rất xuất sắc! Bạn nắm rất vững kiến thức về Tập hợp và chỉ còn chút xíu nữa là đạt đỉnh vinh quang!";
    if (score >= 5) return "Làm tốt lắm! Bạn đã vượt qua các mốc quan trọng. Hãy rèn luyện thêm về giao, hợp, hiệu và các khoảng, đoạn trên ℝ để bứt phá nhé!";
    return "Hãy tiếp tục cố gắng! Bạn liên hệ giáo viên dạy Toán (Mr Thanh btx) để được hỗ trợ và luyện tập thêm nhé!";
  };

  // --- RENDER SCREEN: INTRO ---
  if (gameState === 'intro') {
    return (
      <div className="min-h-dvh bg-[#020024] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans select-none pt-safe pb-safe">
        {/* Stage background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(9,9,121,0.5)_0%,rgba(2,0,36,1)_100%)] z-0"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] min-w-[280px] min-h-[280px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] min-w-[280px] min-h-[280px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* Top bar controls on Intro */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <button
            id="google-sheet-intro-btn"
            onClick={() => setShowGoogleSheetModal(true)}
            className="h-9 sm:h-11 px-2.5 sm:px-3 rounded-full bg-slate-800/80 border border-emerald-500/50 flex items-center gap-1.5 text-emerald-300 hover:bg-slate-700 active:scale-95 transition-all shadow-lg cursor-pointer text-xs font-bold"
            title="Cài đặt & Đồng bộ Google Sheet"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span className="hidden sm:inline">Google Sheet</span>
            <span className={`w-2 h-2 rounded-full ${isGoogleSheetConfigured() ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-amber-400'}`} />
          </button>
          <PWAInstallButton />
          <button
            id="sound-toggle-intro"
            onClick={toggleSound}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-800/80 border border-blue-400/40 flex items-center justify-center text-yellow-400 hover:bg-slate-700 active:scale-95 transition-all shadow-lg cursor-pointer"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/90 backdrop-blur-xl p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl z-10 border-2 border-yellow-500/50 w-full max-w-lg text-center relative"
        >
          {/* Logo Badge */}
          <div className="w-16 h-16 sm:w-22 sm:h-22 bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 rounded-full mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-3 sm:mb-4 border-3 sm:border-4 border-slate-900">
            <span className="text-2xl sm:text-4xl font-black text-slate-950">$</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-1 drop-shadow-sm uppercase tracking-wider">
            Ai Là Triệu Phú
          </h1>
          <h2 className="text-sm sm:text-xl font-bold text-blue-200 mb-2 uppercase tracking-wider">Toán 10 &bull; Bài 2: Tập Hợp</h2>
          
          <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black tracking-tight text-blue-300 mb-4 sm:mb-6 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-500/30">
            <span className="text-[10px] text-gray-400 uppercase font-normal tracking-wider">Thiết kế bởi:</span> 
            <span className="text-white">GV Mr Thanh</span>
            <span className="text-yellow-400">btx</span>
          </div>
          
          <form onSubmit={startGame} className="space-y-3.5 sm:space-y-4 text-left">
            <div>
              <label className="block text-xs uppercase font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <User size={14} className="text-yellow-400" /> Họ và tên học sinh
              </label>
              <input 
                id="player-name-input"
                type="text" 
                placeholder="Nhập họ và tên của bạn..." 
                required
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 border border-blue-400/40 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-yellow-400" /> Lớp học
              </label>
              <input 
                id="player-class-input"
                type="text" 
                placeholder="Nhập lớp (Ví dụ: 10A1)..." 
                required
                value={playerClass}
                onChange={e => setPlayerClass(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 border border-blue-400/40 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <BookOpen size={14} className="text-yellow-400" /> Chọn chủ đề bộ đề
              </label>
              <select
                id="dataset-select"
                value={selectedSetIndex}
                onChange={e => setSelectedSetIndex(Number(e.target.value))}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800/80 border border-blue-400/40 text-yellow-300 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all text-sm cursor-pointer"
              >
                {questionSetsData.map((set, idx) => (
                  <option key={set.id} value={idx} className="bg-slate-900 text-white">
                    {set.title}
                  </option>
                ))}
                <option value={-1} className="bg-slate-900 text-yellow-400 font-bold">
                  🎲 Ngẫu nhiên (Xáo trộn 15 câu từ tất cả chủ đề)
                </option>
              </select>
            </div>

            <button 
              id="start-game-button"
              type="submit"
              className="w-full mt-3 sm:mt-4 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 active:scale-[0.98] text-slate-950 font-black py-3 sm:py-3.5 px-6 rounded-xl shadow-[0_4px_0_0_#a16207] active:shadow-[0_0px_0_0_#a16207] transition-all text-base sm:text-lg flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              <Play fill="currentColor" size={18} /> Bắt đầu cuộc thi
            </button>

            <button
              id="open-leaderboard-intro-btn"
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="w-full mt-2 bg-slate-800/90 hover:bg-slate-700 active:scale-[0.98] text-yellow-400 border border-yellow-500/40 font-bold py-2.5 sm:py-3 px-4 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer shadow-md"
            >
              <Trophy size={16} className="text-yellow-400" /> Bảng Vàng Vinh Danh
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-around text-[11px] sm:text-xs text-blue-300/70">
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-400" /> 15 Câu hỏi</span>
            <span className="flex items-center gap-1"><HelpCircle size={12} className="text-yellow-400" /> 3 Quyền trợ giúp</span>
            <span className="flex items-center gap-1"><Trophy size={12} className="text-yellow-400" /> 3 Mốc thưởng</span>
          </div>
        </motion.div>

        {/* Modal: Leaderboard */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          entries={leaderboard}
          onClearHistory={handleClearLeaderboard}
          onDeleteEntry={handleDeleteEntry}
          onOpenGoogleSheet={() => setShowGoogleSheetModal(true)}
        />

        {/* Modal: Google Sheet */}
        <GoogleSheetModal
          isOpen={showGoogleSheetModal}
          onClose={() => setShowGoogleSheetModal(false)}
          entries={leaderboard}
        />

        {/* Offline indicator banner */}
        <OfflineIndicator />

        {/* Google Sheet Sync Toast */}
        <AnimatePresence>
          {sheetToast.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xl border flex items-center gap-2 ${
                sheetToast.type === 'success' 
                  ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                  : 'bg-blue-900/95 border-blue-400 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
              }`}
            >
              <FileSpreadsheet size={16} className={sheetToast.type === 'success' ? 'text-emerald-300' : 'text-blue-300'} />
              <span>{sheetToast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- RENDER SCREEN: GAMEOVER OR VICTORY ---
  if (gameState === 'gameover' || gameState === 'victory') {
    const isVictory = gameState === 'victory';
    const finalScore = isVictory ? 15 : currentQIndex;
    const prizeWon = getGuaranteedPrize();
    
    return (
      <div className="min-h-dvh bg-[#020024] flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans select-none pt-safe pb-safe">
        {/* Victory confetti animation */}
        {isVictory && (
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-wrap justify-center overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -50, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), rotate: 0 }}
                animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 700) + 50, rotate: 360 }}
                transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                className="w-2.5 h-2.5 absolute rounded-sm"
                style={{ backgroundColor: ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)] }}
              />
            ))}
          </div>
        )}
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(9,9,121,0.5)_0%,rgba(2,0,36,1)_100%)] z-0"></div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/90 backdrop-blur-xl p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl z-10 border-2 border-yellow-500/40 w-full max-w-2xl text-center relative"
        >
          <div className="mb-3 sm:mb-4 flex justify-center">
            {isVictory ? (
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                <Trophy size={40} className="text-yellow-400 animate-bounce sm:w-14 sm:h-14" />
              </div>
            ) : (
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(96,165,250,0.3)]">
                <Medal size={40} className="text-blue-400 sm:w-14 sm:h-14" />
              </div>
            )}
          </div>
          
          <h1 className="text-lg sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 mb-1.5 uppercase">
            {isVictory ? 'BẠN LÀ NHÀ TRIỆU PHÚ TOÁN BTX!' : (isVoluntaryStop ? 'BẠN ĐÃ DỪNG CUỘC CHƠI!' : 'KẾT THÚC CUỘC THI!')}
          </h1>
          
          <div className="text-sm sm:text-base text-blue-100 mb-1 font-semibold">
            Thí sinh: <span className="text-yellow-400">{playerName}</span> &bull; Lớp: <span className="text-yellow-400">{playerClass}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black tracking-tight text-blue-300 mb-4 sm:mb-6">
            <span className="text-[10px] text-gray-400 uppercase font-normal tracking-wider">Thiết kế bởi:</span> 
            <span className="text-white">GV Mr Thanh</span>
            <span className="text-yellow-400">btx</span>
          </div>

          {/* Stats & Prize Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-slate-800/80 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/20">
              <div className="text-[11px] sm:text-xs text-blue-300 mb-0.5 sm:mb-1 flex items-center justify-center gap-1">
                <ListChecks size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="truncate">Số câu đúng</span>
              </div>
              <div className="text-lg sm:text-3xl font-black text-white">{finalScore} / 15</div>
            </div>
            
            <div className="bg-slate-800/80 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/20">
              <div className="text-[11px] sm:text-xs text-blue-300 mb-0.5 sm:mb-1 flex items-center justify-center gap-1">
                <Award size={12} className="text-yellow-400 sm:w-3.5 sm:h-3.5" /> <span className="truncate">Tiền thưởng</span>
              </div>
              <div className="text-sm sm:text-2xl font-black text-yellow-400 truncate">{prizeWon} <span className="text-[10px] sm:text-xs font-normal">đ</span></div>
            </div>

            <div className="bg-slate-800/80 p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/20">
              <div className="text-[11px] sm:text-xs text-blue-300 mb-0.5 sm:mb-1 flex items-center justify-center gap-1">
                <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="truncate">Thời gian</span>
              </div>
              <div className="text-lg sm:text-3xl font-bold text-white">{formatTime(timeElapsed)}</div>
            </div>
          </div>
          
          {/* Feedback message */}
          <div className="bg-blue-950/70 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-500/30 mb-4 sm:mb-6">
            <p className="text-xs sm:text-base text-blue-100 font-medium leading-relaxed">
              {getFeedbackMessage(finalScore)}
            </p>
          </div>

          {/* Google Sheet Sync Status Bar */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              onClick={() => setShowGoogleSheetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 transition-all font-medium text-xs cursor-pointer shadow-sm"
              title="Xem trạng thái lưu Google Sheet"
            >
              <FileSpreadsheet size={14} className="text-emerald-400" />
              <span>{isGoogleSheetConfigured() ? '✓ Đã đồng bộ kết quả về Google Sheet' : '⚙️ Cài đặt tự động lưu Google Sheet'}</span>
              <ChevronRight size={13} className="text-slate-400" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 justify-center">
            <button 
              id="review-solutions-button"
              onClick={() => setActiveModal('review')}
              className="bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-yellow-400 border border-yellow-500/50 font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
            >
              <Lightbulb size={16} /> Xem lời giải
            </button>

            <button 
              id="open-leaderboard-gameover-btn"
              onClick={() => setShowLeaderboard(true)}
              className="bg-amber-950/60 hover:bg-amber-900/80 active:scale-[0.98] text-yellow-300 border border-yellow-400/50 font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer shadow-md"
            >
              <Trophy size={16} /> Bảng Vàng
            </button>

            <button 
              id="restart-game-button"
              onClick={restartGame}
              className="bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 active:scale-[0.98] text-white font-bold py-3 sm:py-3.5 px-3 sm:px-6 rounded-xl shadow-[0_4px_0_0_#1e3a8a] active:shadow-[0_0px_0_0_#1e3a8a] transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
            >
              <RotateCcw size={16} /> Chơi lại ván mới
            </button>
          </div>
        </motion.div>

        {/* Modal: Leaderboard */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          entries={leaderboard}
          onClearHistory={handleClearLeaderboard}
          onDeleteEntry={handleDeleteEntry}
          onOpenGoogleSheet={() => setShowGoogleSheetModal(true)}
        />

        {/* Modal: Google Sheet */}
        <GoogleSheetModal
          isOpen={showGoogleSheetModal}
          onClose={() => setShowGoogleSheetModal(false)}
          entries={leaderboard}
        />

        {/* Google Sheet Sync Toast */}
        <AnimatePresence>
          {sheetToast.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xl border flex items-center gap-2 ${
                sheetToast.type === 'success' 
                  ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                  : 'bg-blue-900/95 border-blue-400 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
              }`}
            >
              <FileSpreadsheet size={16} className={sheetToast.type === 'success' ? 'text-emerald-300' : 'text-blue-300'} />
              <span>{sheetToast.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Full review of questions and solutions */}
        <AnimatePresence>
          {activeModal === 'review' && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border-2 border-yellow-500/60 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[92vh] flex flex-col relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h3 className="text-base sm:text-xl font-bold text-yellow-400 flex items-center gap-2">
                    <BookOpen size={18} className="sm:w-5 sm:h-5" /> Tổng hợp đáp án & Lời giải
                  </h3>
                  <button 
                    onClick={() => setActiveModal('none')}
                    className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-3">
                  {activeQuestions.map((q, idx) => (
                    <div 
                      key={q.id || idx}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${idx < finalScore ? 'bg-green-950/30 border-green-500/40' : (idx === finalScore && !isVictory ? 'bg-red-950/30 border-red-500/40' : 'bg-slate-800/60 border-slate-700')}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] sm:text-xs font-black uppercase text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded-full border border-yellow-500/40">
                          Câu {idx + 1}
                        </span>
                        {idx < finalScore ? (
                          <span className="text-[11px] sm:text-xs text-green-400 font-bold flex items-center gap-1"><Check size={12} /> Đã trả lời đúng</span>
                        ) : (idx === finalScore && !isVictory ? (
                          <span className="text-[11px] sm:text-xs text-red-400 font-bold flex items-center gap-1"><X size={12} /> Trả lời sai tại đây</span>
                        ) : (
                          <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Chưa thi đấu</span>
                        ))}
                      </div>

                      <div className="text-white font-medium mb-2.5 text-sm sm:text-base leading-relaxed break-words">
                        <Latex>{q.question}</Latex>
                      </div>

                      {q.tikz && <TikzComponent code={q.tikz} />}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2.5 text-xs sm:text-sm">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx} 
                            className={`p-2 rounded-lg border flex items-start gap-2 ${optIdx === q.correctAnswerIndex ? 'bg-green-900/40 border-green-400 text-green-200 font-bold' : 'bg-slate-800/40 border-slate-700/60 text-slate-300'}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-yellow-400">
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <span className="break-words flex-1"><Latex>{opt}</Latex></span>
                            {optIdx === q.correctAnswerIndex && <Check size={14} className="ml-auto text-green-400 flex-shrink-0" />}
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-950/80 p-2.5 sm:p-3 rounded-xl border border-yellow-500/20 text-xs sm:text-sm text-yellow-100/90 leading-relaxed break-words">
                        <span className="font-bold text-yellow-400 mr-1.5 inline-flex items-center gap-1"><Lightbulb size={13} /> Lời giải:</span>
                        <Latex>{q.solution}</Latex>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-700 text-right">
                  <button 
                    onClick={() => setActiveModal('none')}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline indicator banner */}
        <OfflineIndicator />
      </div>
    );
  }

  // --- RENDER SCREEN: PLAYING ---
  return (
    <div className="min-h-dvh bg-[#020024] text-white font-sans overflow-hidden flex flex-col relative select-none pt-safe pb-safe pl-safe pr-safe">
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(9,9,121,0.5)_0%,rgba(2,0,36,1)_100%)] z-0"></div>
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] min-w-[280px] min-h-[280px] bg-blue-500/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] min-w-[280px] min-h-[280px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="relative z-10 w-full px-3 sm:px-6 md:px-8 py-2 sm:py-3 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-blue-500/30">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-tr from-yellow-400 via-amber-500 to-yellow-600 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white shadow-[0_0_12px_rgba(251,191,36,0.5)]">
            <span className="text-sm sm:text-lg font-black italic text-slate-950">TP</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base md:text-lg font-black bg-gradient-to-r from-yellow-300 via-yellow-400 to-white bg-clip-text text-transparent uppercase tracking-wider truncate">
              TRIỆU PHÚ TOÁN 10
            </h1>
            <p className="text-[10px] sm:text-xs text-blue-200 truncate">
              {playerName} ({playerClass})
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* PWA Install Button on mobile */}
          <div className="hidden sm:block">
            <PWAInstallButton />
          </div>

          {/* Leaderboard Opener Button */}
          <button
            id="playing-leaderboard-btn"
            onClick={() => setShowLeaderboard(true)}
            className="h-8 px-2 sm:h-10 sm:px-3 rounded-full border border-yellow-400/50 bg-slate-800/90 flex items-center gap-1 text-yellow-400 hover:bg-slate-700 active:scale-95 transition-all text-xs font-bold shadow-md"
            title="Xem Bảng Vàng Vinh Danh"
          >
            <Trophy size={14} className="text-yellow-400" />
            <span className="hidden sm:inline text-xs font-semibold">Bảng Vàng</span>
          </button>

          {/* Mobile Prize Ladder Opener Button */}
          <button
            id="mobile-ladder-btn"
            onClick={() => setActiveModal('ladder')}
            className="lg:hidden h-8 px-2 sm:h-10 sm:px-3 rounded-full border border-yellow-400/60 bg-yellow-950/40 flex items-center gap-1 text-yellow-300 hover:bg-yellow-900/60 active:scale-95 transition-all text-xs font-bold shadow-md"
            title="Xem bảng tiền thưởng"
          >
            <Award size={14} className="text-yellow-400" />
            <span className="text-[11px] sm:text-xs hidden xs:inline">{PRIZE_LIST[currentQIndex]}</span>
          </button>

          {/* Sound Toggle */}
          <button 
            id="sound-toggle-playing"
            onClick={toggleSound}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-blue-400/30 bg-slate-800/80 flex items-center justify-center text-yellow-400 hover:bg-slate-700 active:scale-95 transition-all shadow-md flex-shrink-0"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Lifelines Group */}
          <div className="flex space-x-1 sm:space-x-1.5">
            {/* 50:50 Lifeline */}
            <button 
              id="lifeline-fifty-fifty"
              disabled={!lifelines.fiftyFifty || isAnswerLocked}
              onClick={useFiftyFifty}
              title="Trợ giúp 50:50 (Loại bỏ 2 phương án sai)"
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center font-black text-[10px] sm:text-xs transition-all shadow-md ${lifelines.fiftyFifty ? 'border-yellow-400 bg-blue-950/80 text-yellow-400 hover:bg-blue-800 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-gray-600 bg-gray-900/80 text-gray-600 opacity-40 relative cursor-not-allowed'}`}
            >
              {!lifelines.fiftyFifty && <div className="absolute w-full h-[2px] bg-red-500 rotate-45"></div>}
              50:50
            </button>
            
            {/* Ask Audience Lifeline */}
            <button 
              id="lifeline-ask-audience"
              disabled={!lifelines.askAudience || isAnswerLocked}
              onClick={useAskAudience}
              title="Hỏi ý kiến khán giả trong trường quay"
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all shadow-md ${lifelines.askAudience ? 'border-yellow-400 bg-blue-950/80 text-yellow-400 hover:bg-blue-800 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-gray-600 bg-gray-900/80 text-gray-600 opacity-40 relative cursor-not-allowed'}`}
            >
              {!lifelines.askAudience && <div className="absolute w-full h-[2px] bg-red-500 rotate-45"></div>}
              <Users size={14} className="sm:w-4 sm:h-4" />
            </button>
            
            {/* Call Friend Lifeline */}
            <button 
              id="lifeline-call-friend"
              disabled={!lifelines.callFriend || isAnswerLocked}
              onClick={useCallFriend}
              title="Gọi điện thoại cho người thân / bạn học"
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all shadow-md ${lifelines.callFriend ? 'border-yellow-400 bg-blue-950/80 text-yellow-400 hover:bg-blue-800 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-gray-600 bg-gray-900/80 text-gray-600 opacity-40 relative cursor-not-allowed'}`}
            >
              {!lifelines.callFriend && <div className="absolute w-full h-[2px] bg-red-500 rotate-45"></div>}
              <Phone size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <div className="flex-1 relative z-10 flex flex-col lg:flex-row w-full overflow-hidden">
        
        {/* Left Side: Question and Answers Area */}
        <div className="flex-1 flex flex-col justify-between items-center px-3 sm:px-6 md:px-12 py-3 sm:py-6 space-y-3 sm:space-y-6 h-full overflow-y-auto">
          
          {/* Progress Banner & Current Prize Indicator */}
          <div className="flex items-center justify-between w-full max-w-3xl text-xs sm:text-sm">
            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-blue-900/40 px-2.5 sm:px-3.5 py-1 rounded-full border border-blue-400/40">
              <span className="text-yellow-400 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                CÂU {String(currentQIndex + 1).padStart(2, '0')} / 15
              </span>
              {SAFE_HAVEN_INDICES.includes(currentQIndex) && (
                <span className="text-[10px] bg-yellow-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                  MỐC 🏆
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-blue-400/30 text-xs font-mono text-yellow-400">
                <Clock size={13} /> {formatTime(timeElapsed)}
              </div>
              <div className="text-[11px] sm:text-xs text-yellow-300 font-bold bg-slate-900/70 px-2.5 sm:px-3 py-1 rounded-full border border-yellow-500/30">
                Thưởng: <span className="text-white font-extrabold">{PRIZE_LIST[currentQIndex]} đ</span>
              </div>
            </div>
          </div>

          {/* Question Box */}
          <motion.div 
            key={`q-${currentQIndex}`}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-3xl my-auto"
          >
            {/* Hexagon side connectors on desktop */}
            <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-[2px] bg-blue-400/80 shadow-[0_0_10px_#60a5fa]"></div>
            <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-[2px] bg-blue-400/80 shadow-[0_0_10px_#60a5fa]"></div>
            
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-2 border-blue-400/80 py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-10 text-center rounded-2xl sm:rounded-[32px] shadow-[0_0_35px_rgba(30,58,138,0.7)] relative overflow-hidden">
              <h2 className="text-base sm:text-lg md:text-2xl font-medium leading-relaxed drop-shadow-md text-slate-100 break-words">
                <Latex>{currentQ.question}</Latex>
              </h2>
              {currentQ.tikz && <TikzComponent code={currentQ.tikz} />}
            </div>
          </motion.div>

          {/* Answers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 w-full max-w-4xl pb-1">
            {currentQ.options.map((opt, idx) => {
              const optionLabels = ['A', 'B', 'C', 'D'];
              const isHidden = hiddenOptions.includes(idx);
              const isSelected = selectedAnswer === idx;
              const isCorrectAnswer = currentQ.correctAnswerIndex === idx;
              
              let wrapperClass = "group relative flex items-center w-full transition-all ";
              let lineClass = "hidden md:block absolute -left-4 w-6 h-[2px] z-10 transition-colors ";
              let btnClass = "w-full py-2.5 sm:py-3.5 px-3.5 sm:px-6 rounded-xl sm:rounded-full text-left transition-all text-sm sm:text-base md:text-lg relative z-20 flex items-center cursor-pointer ";
              
              if (isHidden) {
                wrapperClass += "opacity-0 pointer-events-none";
              } else if (!isAnswerLocked) {
                lineClass += "bg-blue-400 group-hover:bg-yellow-400";
                btnClass += "bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border border-blue-400/60 hover:bg-yellow-500 hover:border-white hover:text-black active:scale-[0.99] shadow-md hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]";
              } else if (isSelected && showResultStatus === 'none') {
                // Locked answer, awaiting reveal
                lineClass += "bg-yellow-400";
                btnClass += "bg-gradient-to-r from-yellow-500 to-yellow-600 border-2 border-white text-slate-950 font-bold shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-pulse";
              } else if (showResultStatus !== 'none') {
                if (isCorrectAnswer) {
                  lineClass += "bg-green-400";
                  btnClass += "bg-gradient-to-r from-green-600 to-green-500 border-2 border-white text-white shadow-[0_0_30px_rgba(34,197,94,0.7)] font-bold";
                } else if (isSelected && showResultStatus === 'wrong') {
                  lineClass += "bg-red-500";
                  btnClass += "bg-gradient-to-r from-red-600 to-red-500 border-2 border-white text-white shadow-[0_0_25px_rgba(239,68,68,0.7)]";
                } else {
                  lineClass += "bg-blue-950/40";
                  btnClass += "bg-blue-950/40 border border-blue-900/30 text-white/40 cursor-not-allowed";
                }
              }

              return (
                <motion.button
                  key={`opt-${idx}`}
                  id={`option-button-${idx}`}
                  disabled={isAnswerLocked || isHidden}
                  onClick={() => handleSelectAnswer(idx)}
                  onMouseEnter={() => !isAnswerLocked && audio.playHover()}
                  className={wrapperClass}
                  style={{
                    animation: (isSelected && showResultStatus === 'wrong') ? 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none'
                  }}
                >
                  <div className={lineClass}></div>
                  <div className={btnClass}>
                    <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-950/80 border border-blue-400/50 font-black text-xs sm:text-sm text-yellow-400 flex items-center justify-center mr-2.5 sm:mr-3 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-slate-950 group-hover:border-white">
                      {optionLabels[idx]}
                    </span>
                    <span className="font-medium break-words flex-1 leading-snug"><Latex>{opt}</Latex></span>
                    {showResultStatus !== 'none' && isCorrectAnswer && (
                      <Check size={18} className="ml-2 text-white flex-shrink-0" />
                    )}
                    {showResultStatus === 'wrong' && isSelected && (
                      <X size={18} className="ml-2 text-white flex-shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Bottom Bar within Play area: View Solution button if answered */}
          <div className="w-full max-w-4xl flex justify-between items-center pt-1">
            {showResultStatus !== 'none' ? (
              <motion.button
                id="view-detailed-solution-btn"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setActiveModal('solution')}
                className="flex items-center space-x-1.5 bg-blue-900/70 hover:bg-blue-800 border border-blue-400/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-yellow-300 hover:text-white transition-all cursor-pointer shadow-md text-xs sm:text-sm font-bold active:scale-95"
              >
                <Lightbulb size={15} className="text-yellow-400" />
                <span>Xem lời giải chi tiết</span>
              </motion.button>
            ) : (
              <div className="text-[10px] sm:text-xs text-blue-400/70 font-medium truncate">
                GV Mr Thanh btx &bull; Toán 10 Bài 2: Tập hợp & các phép toán trên tập hợp
              </div>
            )}

            <button
              id="stop-game-mobile-btn"
              onClick={() => setActiveModal('stopConfirm')}
              className="lg:hidden text-[11px] sm:text-xs text-red-300 hover:text-white border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all font-semibold"
            >
              Dừng chơi
            </button>
          </div>

        </div>
          
        {/* Right Side: Score Ladder (15 steps) on Desktop */}
        <div className="hidden lg:flex flex-1 bg-black/40 border-l border-blue-900/70 p-5 flex-col justify-between overflow-y-auto min-w-[280px] max-w-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-center text-blue-300/80 mb-2">
            Bảng Tiền Thưởng
          </div>

          <div className="space-y-1 flex flex-col-reverse h-full justify-end">
            {PRIZE_LIST.map((prize, i) => {
              const isCurrent = i === currentQIndex;
              const isPassed = i < currentQIndex;
              const isSafeHaven = SAFE_HAVEN_INDICES.includes(i);
              
              let itemClass = "flex items-center justify-between px-3 py-1 rounded-lg text-xs font-semibold transition-all ";
              let spanNumClass = "w-5 text-right mr-2 ";
              let spanLineClass = "flex-1 border-b mx-2 ";
              let spanPrizeClass = "font-mono ";
              
              if (isCurrent) {
                itemClass += "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.6)]";
                spanLineClass += "border-white/40";
                spanPrizeClass += "text-white font-black";
              } else if (isPassed) {
                itemClass += "text-amber-400 bg-amber-950/20";
                spanLineClass += "border-amber-400/20";
              } else if (isSafeHaven) {
                itemClass += "bg-white/10 text-white font-bold border border-white/20";
                spanLineClass += "border-white/30";
                spanPrizeClass += "text-yellow-300";
              } else {
                itemClass += "text-slate-500";
                spanNumClass += "text-slate-500";
                spanLineClass += "border-slate-800";
                spanPrizeClass += "italic";
              }

              return (
                <div key={i} className={itemClass}>
                  <span className={spanNumClass}>{i + 1}</span>
                  <span className={spanLineClass}></span>
                  <span className={spanPrizeClass}>{prize}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-blue-900/50">
            <button 
              id="stop-game-desktop-btn"
              onClick={() => setActiveModal('stopConfirm')}
              className="w-full py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer active:scale-95"
            >
              DỪNG CUỘC CHƠI & BẢO TOÀN THƯỞNG
            </button>
          </div>
        </div>
      </div>

      {/* Modals Overlay */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-900 border-2 border-blue-400/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-md relative max-h-[90vh] flex flex-col"
            >
              <button 
                id="modal-close-button"
                onClick={() => setActiveModal('none')}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
              >
                <X size={20} />
              </button>

              {/* Modal: Mobile Prize Ladder */}
              {activeModal === 'ladder' && (
                <div className="flex flex-col h-full overflow-hidden">
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={18} /> Bảng Tiền Thưởng (15 Mốc)
                  </h3>
                  <div className="space-y-1 overflow-y-auto my-2 flex-1 pr-1 flex flex-col-reverse justify-end max-h-[60vh]">
                    {PRIZE_LIST.map((prize, i) => {
                      const isCurrent = i === currentQIndex;
                      const isPassed = i < currentQIndex;
                      const isSafeHaven = SAFE_HAVEN_INDICES.includes(i);
                      
                      let itemClass = "flex items-center justify-between px-3 py-1 rounded-lg text-xs font-semibold ";
                      if (isCurrent) {
                        itemClass += "bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black";
                      } else if (isPassed) {
                        itemClass += "text-amber-400 bg-amber-950/30";
                      } else if (isSafeHaven) {
                        itemClass += "bg-white/10 text-yellow-300 font-bold border border-white/20";
                      } else {
                        itemClass += "text-slate-500";
                      }

                      return (
                        <div key={i} className={itemClass}>
                          <span className="w-5 text-right font-bold">{i + 1}</span>
                          <span className="flex-1 border-b border-slate-700 mx-2"></span>
                          <span className="font-mono">{prize} đ</span>
                          {isSafeHaven && <span className="ml-1.5 text-[10px]">⭐</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex gap-2">
                    <button 
                      onClick={() => setActiveModal('none')}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                    >
                      Đóng
                    </button>
                    <button 
                      onClick={() => {
                        setActiveModal('none');
                        setTimeout(() => setActiveModal('stopConfirm'), 100);
                      }}
                      className="flex-1 py-2 bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-500/40 rounded-xl text-xs font-bold"
                    >
                      Dừng chơi
                    </button>
                  </div>
                </div>
              )}

              {/* Modal: Ask Audience */}
              {activeModal === 'audience' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Users className="text-yellow-400" size={18} /> Khán giả trường quay
                  </h3>
                  <div className="flex h-36 sm:h-44 items-end justify-around gap-2 border-b border-slate-700 pb-2 pt-4">
                    {['A', 'B', 'C', 'D'].map((label, idx) => (
                      <div key={label} className="flex flex-col items-center w-10 sm:w-12">
                        <div className="text-[11px] sm:text-xs font-bold text-yellow-300 mb-1">{audienceData[idx]}%</div>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-md transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          style={{ height: `${Math.max(4, audienceData[idx] * 1.3)}px` }}
                        ></div>
                        <div className="mt-1.5 font-black text-white bg-slate-800 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-blue-400/40 text-xs sm:text-sm">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-200 mt-3 text-center leading-relaxed">
                    Số đông nghiêng về phương án có phần trăm cao nhất. Hãy cân nhắc kỹ trước khi chốt đáp án!
                  </p>
                </div>
              )}

              {/* Modal: Call a Friend */}
              {activeModal === 'friend' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Phone className="text-yellow-400" size={18} /> Gọi điện thoại người thân
                  </h3>
                  <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-400/40 text-blue-100 leading-relaxed text-xs sm:text-sm relative">
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-slate-700/60 text-xs font-bold text-yellow-400">
                      <GraduationCap size={15} /> Bạn học cùng lớp tư vấn:
                    </div>
                    {friendMessage}
                  </div>
                </div>
              )}

              {/* Modal: Solution */}
              {activeModal === 'solution' && (
                <div className="flex flex-col h-full">
                  <h3 className="text-base sm:text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" size={18} /> Lời giải chi tiết - Câu {currentQIndex + 1}
                  </h3>
                  <div className="bg-slate-800/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-blue-400/40 text-blue-100 leading-relaxed text-xs sm:text-sm max-h-64 sm:max-h-72 overflow-y-auto">
                    <div className="mb-2 font-semibold text-white break-words">
                      <Latex>{currentQ.question}</Latex>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 text-yellow-100 break-words">
                      <Latex>{currentQ.solution}</Latex>
                    </div>
                    {currentQ.tikz && <div className="mt-2"><TikzComponent code={currentQ.tikz} /></div>}
                  </div>
                </div>
              )}

              {/* Modal: Voluntary Stop Confirmation */}
              {activeModal === 'stopConfirm' && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="text-red-400" size={18} /> Xác nhận dừng cuộc chơi
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
                    Bạn đang ở câu số <strong className="text-white">{currentQIndex + 1}</strong>. Nếu dừng cuộc chơi ngay bây giờ, bạn sẽ bảo toàn được số tiền thưởng ở câu trước:
                  </p>
                  <div className="text-center bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-yellow-500/40 mb-4">
                    <span className="text-xl sm:text-2xl font-black text-yellow-400">
                      {currentQIndex > 0 ? PRIZE_LIST[currentQIndex - 1] : "0"} VNĐ
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveModal('none')}
                      className="flex-1 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                    >
                      Tiếp tục thi
                    </button>
                    <button 
                      onClick={handleStopGame}
                      className="flex-1 py-2 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-lg"
                    >
                      Dừng & Nhận thưởng
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Leaderboard during playing */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        entries={leaderboard}
        onClearHistory={handleClearLeaderboard}
        onDeleteEntry={handleDeleteEntry}
        onOpenGoogleSheet={() => setShowGoogleSheetModal(true)}
      />

      {/* Modal: Google Sheet */}
      <GoogleSheetModal
        isOpen={showGoogleSheetModal}
        onClose={() => setShowGoogleSheetModal(false)}
        entries={leaderboard}
      />

      {/* Offline indicator banner */}
      <OfflineIndicator />

      {/* Google Sheet Sync Toast */}
      <AnimatePresence>
        {sheetToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-2xl border flex items-center gap-2 ${
              sheetToast.type === 'success' 
                ? 'bg-emerald-900/95 border-emerald-400 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.4)]' 
                : 'bg-blue-900/95 border-blue-400 text-blue-100 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
            }`}
          >
            <FileSpreadsheet size={16} className={sheetToast.type === 'success' ? 'text-emerald-300' : 'text-blue-300'} />
            <span>{sheetToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shake animation stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </div>
  );
}
