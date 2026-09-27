import React, { useState } from 'react';
import { Code, Check, Copy } from 'lucide-react';

interface TikzRendererProps {
  code: string;
  title?: string;
}

export const TikzRenderer: React.FC<TikzRendererProps> = ({ code, title }) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine which diagram to render based on TikZ code content
  const renderSvg = () => {
    // 1. Trục số [-2; 5) (Set 2 Q11)
    if (code.includes('[-2; 5)') || (code.includes('-2') && code.includes('5') && code.includes('\\textbf{[}') && code.includes('\\textbf{)}'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          {/* Axis line */}
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          {/* Hatched region (-inf; -2) */}
          <rect x="30" y="38" width="130" height="24" fill="url(#hatch-slash)" />
          {/* Hatched region [5; +inf) */}
          <rect x="350" y="38" width="145" height="24" fill="url(#hatch-slash)" />

          {/* Active interval [-2; 5) */}
          <line x1="160" y1="50" x2="350" y2="50" stroke="#2563eb" strokeWidth="4" />

          {/* Bracket at -2: [ */}
          <path d="M 170 36 L 160 36 L 160 64 L 170 64" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="160" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">-2</text>

          {/* Bracket at 5: ) */}
          <path d="M 345 36 A 15 28 0 0 1 345 64" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <text x="350" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold" fontFamily="sans-serif">5</text>

          {/* Label */}
          <rect x="215" y="10" width="80" height="22" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
          <text x="255" y="26" textAnchor="middle" fill="#1d4ed8" fontSize="13" fontWeight="bold">[-2; 5)</text>
        </svg>
      );
    }

    // 2. Trục số [2; 7] (Set 2 Q8)
    if (code.includes('[2; 7]') || (code.includes('2') && code.includes('7') && code.includes('\\textbf{[}') && code.includes('\\textbf{]}'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash-2" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          <rect x="30" y="38" width="140" height="24" fill="url(#hatch-slash-2)" />
          <rect x="360" y="38" width="135" height="24" fill="url(#hatch-slash-2)" />

          <line x1="170" y1="50" x2="360" y2="50" stroke="#059669" strokeWidth="4" />

          {/* Bracket at 2: [ */}
          <path d="M 180 36 L 170 36 L 170 64 L 180 64" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="170" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">2</text>

          {/* Bracket at 7: ] */}
          <path d="M 350 36 L 360 36 L 360 64 L 350 64" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="360" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">7</text>

          <rect x="225" y="10" width="80" height="22" rx="4" fill="#ecfdf5" stroke="#a7f3d0" />
          <text x="265" y="26" textAnchor="middle" fill="#047857" fontSize="13" fontWeight="bold">[2; 7]</text>
        </svg>
      );
    }

    // 3. Trục số (-inf; 2) (Set 2 Q9)
    if (code.includes('(-\\infty; 2)') || (code.includes('2') && code.includes('(-3,0)') && code.includes('\\textbf{)}'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash-3" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          <rect x="290" y="38" width="205" height="24" fill="url(#hatch-slash-3)" />
          <line x1="30" y1="50" x2="290" y2="50" stroke="#0284c7" strokeWidth="4" />

          {/* Bracket at 2: ) */}
          <path d="M 285 36 A 15 28 0 0 1 285 64" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <text x="290" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">2</text>

          <rect x="110" y="10" width="100" height="22" rx="4" fill="#f0f9ff" stroke="#bae6fd" />
          <text x="160" y="26" textAnchor="middle" fill="#0369a1" fontSize="13" fontWeight="bold">(-∞; 2)</text>
        </svg>
      );
    }

    // 4. Trục số giao [1; 3] của [1; +inf) và (-inf; 3] (Set 3 Q8 & Q10)
    if (code.includes('[1; 3]') || (code.includes('1') && code.includes('3') && code.includes('\\textbf{[}') && code.includes('\\textbf{]}'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash-4" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          <rect x="30" y="38" width="160" height="24" fill="url(#hatch-slash-4)" />
          <rect x="340" y="38" width="155" height="24" fill="url(#hatch-slash-4)" />

          <line x1="190" y1="50" x2="340" y2="50" stroke="#7c3aed" strokeWidth="4" />

          {/* Bracket at 1: [ */}
          <path d="M 200 36 L 190 36 L 190 64 L 200 64" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="190" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">1</text>

          {/* Bracket at 3: ] */}
          <path d="M 330 36 L 340 36 L 340 64 L 330 64" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="340" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">3</text>

          <rect x="225" y="10" width="80" height="22" rx="4" fill="#f5f3ff" stroke="#ddd6fe" />
          <text x="265" y="26" textAnchor="middle" fill="#6d28d9" fontSize="13" fontWeight="bold">[1; 3]</text>
        </svg>
      );
    }

    // 5. Trục số phần bù C_R(-inf; -2) = [-2; +inf) (Set 3 Q11)
    if (code.includes('C_{\\mathbb{R}}(-\\infty; -2)') || (code.includes('-2') && code.includes('[-2; +\\infty)')) || (code.includes('-2') && code.includes('2.8,0'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash-5" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          <rect x="30" y="38" width="180" height="24" fill="url(#hatch-slash-5)" />
          <line x1="210" y1="50" x2="495" y2="50" stroke="#2563eb" strokeWidth="4" />

          {/* Bracket at -2: [ */}
          <path d="M 220 36 L 210 36 L 210 64 L 220 64" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="210" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">-2</text>

          <rect x="310" y="10" width="110" height="22" rx="4" fill="#eff6ff" stroke="#bfdbfe" />
          <text x="365" y="26" textAnchor="middle" fill="#1d4ed8" fontSize="13" fontWeight="bold">[-2; +∞)</text>
        </svg>
      );
    }

    // 6. Trục số hiệu B \ A = (3; +inf) (Set 3 Q15)
    if (code.includes('B \\setminus A') || (code.includes('(3; +\\infty)') && code.includes('5.8,0'))) {
      return (
        <svg viewBox="0 0 540 100" className="w-full max-w-lg h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hatch-slash-6" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <line x1="30" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="2" />
          <polygon points="505,50 495,45 495,55" fill="#334155" />
          <text x="515" y="54" fill="#64748b" fontSize="14" fontStyle="italic" fontFamily="serif">x</text>

          <rect x="30" y="38" width="250" height="24" fill="url(#hatch-slash-6)" />
          <line x1="280" y1="50" x2="495" y2="50" stroke="#ea580c" strokeWidth="4" />

          {/* Bracket at 3: ( */}
          <path d="M 285 36 A 15 28 0 0 0 285 64" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <text x="280" y="85" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">3</text>

          <rect x="350" y="10" width="100" height="22" rx="4" fill="#fff7ed" stroke="#fed7aa" />
          <text x="400" y="26" textAnchor="middle" fill="#c2410c" fontSize="13" fontWeight="bold">(3; +∞)</text>
        </svg>
      );
    }

    // 7. Biểu đồ Ven tập con T \subset S (Set 1 Q6)
    if (code.includes('T \\subset S') || (code.includes('ellipse') && code.includes('S') && code.includes('T'))) {
      return (
        <svg viewBox="0 0 360 200" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Universal set S */}
          <ellipse cx="180" cy="100" rx="140" ry="80" fill="#dbeafe" stroke="#2563eb" strokeWidth="2.5" />
          <text x="280" y="60" fill="#1e40af" fontSize="20" fontWeight="bold" fontFamily="serif">S</text>

          {/* Subset T */}
          <ellipse cx="150" cy="110" rx="75" ry="45" fill="#fef3c7" stroke="#d97706" strokeWidth="2.5" />
          <text x="150" y="116" textAnchor="middle" fill="#b45309" fontSize="18" fontWeight="bold" fontFamily="serif">T</text>

          {/* Bottom badge */}
          <rect x="130" y="170" width="100" height="24" rx="12" fill="#1e293b" />
          <text x="180" y="186" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold">T ⊂ S</text>
        </svg>
      );
    }

    // 8. Biểu đồ Ven hiệu A \ B (Set 4 Q1)
    if (code.includes('A \\setminus B') || (code.includes('circleA') && code.includes('Phần tô màu: $A \\setminus B$')) || code.includes('A \\setminus B')) {
      return (
        <svg viewBox="0 0 360 210" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="diff-mask">
              <rect x="0" y="0" width="360" height="210" fill="white" />
              <circle cx="215" cy="95" r="75" fill="black" />
            </mask>
          </defs>

          {/* Shaded A \ B */}
          <circle cx="145" cy="95" r="75" fill="#f59e0b" mask="url(#diff-mask)" />

          {/* Circle outlines */}
          <circle cx="145" cy="95" r="75" stroke="#1e293b" strokeWidth="2.5" fill="none" />
          <circle cx="215" cy="95" r="75" stroke="#1e293b" strokeWidth="2.5" fill="none" />

          {/* Set labels */}
          <text x="95" y="98" textAnchor="middle" fill="#78350f" fontSize="22" fontWeight="bold">A</text>
          <text x="260" y="98" textAnchor="middle" fill="#1e293b" fontSize="22" fontWeight="bold">B</text>

          {/* Legend badge */}
          <rect x="95" y="180" width="170" height="26" rx="13" fill="#1e293b" />
          <text x="180" y="197" textAnchor="middle" fill="#fef08a" fontSize="13" fontWeight="bold">
            Phần tô màu vàng: A \ B
          </text>
        </svg>
      );
    }

    // 9. Biểu đồ Ven giao A \cap B (Set 4 Q2)
    if (code.includes('A \\cap B') || (code.includes('circleA') && code.includes('$A \\cap B$'))) {
      return (
        <svg viewBox="0 0 360 210" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-a-clip">
              <circle cx="145" cy="95" r="75" />
            </clipPath>
          </defs>

          {/* Non-overlapping background */}
          <circle cx="145" cy="95" r="75" fill="#f1f5f9" />
          <circle cx="215" cy="95" r="75" fill="#f1f5f9" />

          {/* Shaded Intersection A \cap B */}
          <circle cx="215" cy="95" r="75" fill="#10b981" clipPath="url(#circle-a-clip)" />

          {/* Circle outlines */}
          <circle cx="145" cy="95" r="75" stroke="#1e293b" strokeWidth="2.5" fill="none" />
          <circle cx="215" cy="95" r="75" stroke="#1e293b" strokeWidth="2.5" fill="none" />

          <text x="95" y="98" textAnchor="middle" fill="#1e293b" fontSize="22" fontWeight="bold">A</text>
          <text x="260" y="98" textAnchor="middle" fill="#1e293b" fontSize="22" fontWeight="bold">B</text>
          <text x="180" y="98" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">A ∩ B</text>

          <rect x="110" y="180" width="140" height="26" rx="13" fill="#1e293b" />
          <text x="180" y="197" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="bold">
            Phần chung: A ∩ B
          </text>
        </svg>
      );
    }

    // 10. Biểu đồ Ven hợp A \cup B (Set 4 Q3)
    if (code.includes('A \\cup B') || code.includes('n(A \\cup B) = n(A) + n(B) - n(A \\cap B)')) {
      return (
        <svg viewBox="0 0 380 220" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shaded Union */}
          <circle cx="150" cy="90" r="70" fill="#bae6fd" />
          <circle cx="230" cy="90" r="70" fill="#bae6fd" />

          <circle cx="150" cy="90" r="70" stroke="#0284c7" strokeWidth="2.5" fill="none" />
          <circle cx="230" cy="90" r="70" stroke="#0284c7" strokeWidth="2.5" fill="none" />

          <text x="105" y="95" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="bold">A</text>
          <text x="275" y="95" textAnchor="middle" fill="#0369a1" fontSize="22" fontWeight="bold">B</text>
          <text x="190" y="95" textAnchor="middle" fill="#0c4a6e" fontSize="14" fontWeight="bold">A ∩ B</text>

          <rect x="30" y="175" width="320" height="30" rx="8" fill="#0f172a" />
          <text x="190" y="195" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">
            n(A ∪ B) = n(A) + n(B) - n(A ∩ B)
          </text>
        </svg>
      );
    }

    // 11. Biểu đồ Ven CLB Lịch sử (Set 4 Q5)
    if (code.includes('CLB: 12 bạn') || (code.includes('CĐ 1') && code.includes('CĐ 2'))) {
      return (
        <svg viewBox="0 0 380 230" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-clb-clip">
              <circle cx="150" cy="110" r="65" />
            </clipPath>
          </defs>

          {/* Universal Box */}
          <rect x="20" y="15" width="340" height="200" rx="12" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <text x="35" y="38" fill="#334155" fontSize="13" fontWeight="bold">CLB Lịch sử: 12 thành viên</text>

          {/* Circles */}
          <circle cx="150" cy="110" r="65" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
          <circle cx="230" cy="110" r="65" fill="#fce7f3" stroke="#db2777" strokeWidth="2" />

          {/* Overlap */}
          <circle cx="230" cy="110" r="65" fill="#ddd6fe" clipPath="url(#circle-clb-clip)" />

          {/* Values */}
          <text x="115" y="100" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">CĐ 1 (7)</text>
          <text x="115" y="125" textAnchor="middle" fill="#1e3a8a" fontSize="18" fontWeight="bold">3</text>

          <text x="190" y="105" textAnchor="middle" fill="#6b21a8" fontSize="11" fontWeight="bold">Cả 2</text>
          <text x="190" y="125" textAnchor="middle" fill="#581c87" fontSize="18" fontWeight="bold">4</text>

          <text x="265" y="100" textAnchor="middle" fill="#9d174d" fontSize="12" fontWeight="bold">CĐ 2 (7)</text>
          <text x="265" y="125" textAnchor="middle" fill="#831843" fontSize="18" fontWeight="bold">3</text>

          <rect x="250" y="180" width="100" height="24" rx="6" fill="#fef2f2" stroke="#fca5a5" />
          <text x="300" y="196" textAnchor="middle" fill="#dc2626" fontSize="12" fontWeight="bold">Vắng: 2</text>
        </svg>
      );
    }

    // 12. Biểu đồ Ven Thể thao Bóng đá & Cầu lông (Set 4 Q6)
    if (code.includes('Lớp 10A: 24 bạn') || (code.includes('Bóng đá') && code.includes('Cầu lông'))) {
      return (
        <svg viewBox="0 0 380 230" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-sport-clip">
              <circle cx="150" cy="110" r="65" />
            </clipPath>
          </defs>

          <rect x="20" y="15" width="340" height="200" rx="12" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <text x="35" y="38" fill="#334155" fontSize="13" fontWeight="bold">Lớp 10A: 24 bạn thi đấu</text>

          <circle cx="150" cy="110" r="65" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <circle cx="230" cy="110" r="65" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" />

          <circle cx="230" cy="110" r="65" fill="#fed7aa" clipPath="url(#circle-sport-clip)" />

          <text x="115" y="100" textAnchor="middle" fill="#15803d" fontSize="11" fontWeight="bold">Bóng đá (16)</text>
          <text x="115" y="125" textAnchor="middle" fill="#14532d" fontSize="18" fontWeight="bold">13</text>

          <text x="190" y="105" textAnchor="middle" fill="#c2410c" fontSize="11" fontWeight="bold">Cả 2 môn</text>
          <text x="190" y="125" textAnchor="middle" fill="#9a3412" fontSize="18" fontWeight="bold">3</text>

          <text x="265" y="100" textAnchor="middle" fill="#a16207" fontSize="11" fontWeight="bold">Cầu lông (11)</text>
          <text x="265" y="125" textAnchor="middle" fill="#713f12" fontSize="18" fontWeight="bold">8</text>

          <text x="190" y="195" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">
            16 + 11 - 24 = 3 (thi đấu cả 2 môn)
          </text>
        </svg>
      );
    }

    // 13. Biểu đồ Ven Phiên dịch tiếng Anh & Pháp (Set 4 Q8)
    if (code.includes('Tiếng Anh') && code.includes('Tiếng Pháp')) {
      return (
        <svg viewBox="0 0 380 210" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-trans-clip">
              <circle cx="150" cy="95" r="68" />
            </clipPath>
          </defs>

          <circle cx="150" cy="95" r="68" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
          <circle cx="230" cy="95" r="68" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />

          <circle cx="230" cy="95" r="68" fill="#f3e8ff" clipPath="url(#circle-trans-clip)" />

          <text x="110" y="85" textAnchor="middle" fill="#4338ca" fontSize="12" fontWeight="bold">Tiếng Anh (35)</text>
          <text x="110" y="112" textAnchor="middle" fill="#312e81" fontSize="18" fontWeight="bold">19</text>

          <text x="190" y="90" textAnchor="middle" fill="#7e22ce" fontSize="11" fontWeight="bold">Cả hai</text>
          <text x="190" y="112" textAnchor="middle" fill="#581c87" fontSize="18" fontWeight="bold">16</text>

          <text x="270" y="85" textAnchor="middle" fill="#be123c" fontSize="12" fontWeight="bold">Tiếng Pháp (30)</text>
          <text x="270" y="112" textAnchor="middle" fill="#881337" fontSize="18" fontWeight="bold">14</text>

          <rect x="70" y="175" width="240" height="26" rx="8" fill="#1e1b4b" />
          <text x="190" y="192" textAnchor="middle" fill="#c7d2fe" fontSize="12" fontWeight="bold">
            Tổng cộng: 19 + 16 + 14 = 49 người
          </text>
        </svg>
      );
    }

    // 14. Biểu đồ Ven Du lịch vịnh Hạ Long (Set 4 Q11)
    if (code.includes('Thiên Cung') && code.includes('Titop')) {
      return (
        <svg viewBox="0 0 380 210" className="w-full max-w-sm h-auto select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="circle-tour-clip">
              <circle cx="150" cy="95" r="68" />
            </clipPath>
          </defs>

          <circle cx="150" cy="95" r="68" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
          <circle cx="230" cy="95" r="68" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />

          <circle cx="230" cy="95" r="68" fill="#99f6e4" clipPath="url(#circle-tour-clip)" />

          <text x="110" y="85" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="bold">Thiên Cung (789)</text>
          <text x="110" y="112" textAnchor="middle" fill="#115e59" fontSize="18" fontWeight="bold">720</text>

          <text x="190" y="90" textAnchor="middle" fill="#065f46" fontSize="11" fontWeight="bold">Cả hai</text>
          <text x="190" y="112" textAnchor="middle" fill="#064e3b" fontSize="18" fontWeight="bold">69</text>

          <text x="270" y="85" textAnchor="middle" fill="#047857" fontSize="11" fontWeight="bold">Titop (690)</text>
          <text x="270" y="112" textAnchor="middle" fill="#064e3b" fontSize="18" fontWeight="bold">621</text>

          <rect x="70" y="175" width="240" height="26" rx="8" fill="#134e4a" />
          <text x="190" y="192" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontWeight="bold">
            Vừa Thiên Cung vừa Titop: 69 khách
          </text>
        </svg>
      );
    }

    // Default fallback: Standard generic Venn / Axis diagram
    return (
      <div className="text-xs text-slate-500 font-mono p-4 text-center">
        [TikZ Diagram: {title || 'Toán học 10'}]
      </div>
    );
  };

  return (
    <div className="my-3 flex flex-col items-center w-full">
      {/* Visual Canvas Container */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-slate-200/80 flex flex-col items-center justify-center w-full max-w-md mx-auto transition-all">
        {renderSvg()}
        
        {/* Sub-bar with title and toggle code button */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between w-full text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Đồ thị TikZ chuẩn SGK
          </span>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium px-2 py-0.5 rounded hover:bg-blue-50 transition-colors cursor-pointer"
            title="Xem mã nguồn TikZ LaTeX"
          >
            <Code size={13} />
            <span>{showCode ? 'Ẩn mã TikZ' : 'Mã TikZ'}</span>
          </button>
        </div>
      </div>

      {/* Code Drawer */}
      {showCode && (
        <div className="mt-2 w-full max-w-md bg-slate-950 rounded-xl p-3 border border-slate-800 text-left text-xs font-mono relative shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TikZ LaTeX Code</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-yellow-400 hover:text-yellow-300 font-medium bg-slate-900 px-2 py-1 rounded border border-yellow-500/30 transition-all cursor-pointer"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>
          <pre className="text-emerald-400 overflow-x-auto text-[11px] leading-relaxed whitespace-pre font-mono p-1">
            {code}
          </pre>
        </div>
      )}
    </div>
  );
};
