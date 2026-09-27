export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  solution: string;
  tikz?: string;
}

export interface QuestionSetInfo {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export const questionSetsData: QuestionSetInfo[] = [
  {
    id: 1,
    title: "Bộ đề 1: Khái niệm Tập hợp & Tập hợp con",
    description: "Kí hiệu ∈ và ∉, 2 cách xác định tập hợp, số phần tử n(S), tập rỗng ∅, tập con ⊂, số lượng tập con và hai tập hợp bằng nhau",
    questions: [
      {
        id: 1,
        question: "Để chỉ phần tử $a$ thuộc tập hợp $S$, trong toán học ta dùng kí hiệu:",
        options: [
          "$a \\in S$",
          "$a \\subset S$",
          "$a \\notin S$",
          "$S \\in a$"
        ],
        correctAnswerIndex: 0,
        solution: "Theo SGK Toán 10 trang 13: Để chỉ $a$ là một phần tử của tập hợp $S$, ta viết $a \\in S$ (đọc là '$a$ thuộc $S$'). Ngược lại, nếu $a$ không thuộc $S$ thì viết $a \\notin S$."
      },
      {
        id: 2,
        question: "Hai cách thông dụng để mô tả một tập hợp trong toán học là:",
        options: [
          "Liệt kê các phần tử của tập hợp hoặc chỉ ra tính chất đặc trưng cho các phần tử",
          "Lập bảng biến thiên hoặc vẽ đồ thị hàm số",
          "Vẽ hệ trục tọa độ Oxy hoặc đo khoảng cách hình học",
          "Dùng định lí Pythagore hoặc bảng số nguyên"
        ],
        correctAnswerIndex: 0,
        solution: "Theo SGK Toán 10 trang 13: Có thể mô tả một tập hợp bằng một trong hai cách: Cách 1: Liệt kê các phần tử của tập hợp; Cách 2: Chỉ ra tính chất đặc trưng cho các phần tử của tập hợp."
      },
      {
        id: 3,
        question: "Tập hợp không chứa phần tử nào được gọi là:",
        options: [
          "Tập rỗng, kí hiệu là $\\emptyset$",
          "Tập đơn tử, kí hiệu là $\\{0\\}$",
          "Tập vô hạn, kí hiệu là $\\infty$",
          "Tập nghịch đảo"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 13 nêu rõ: Tập hợp không chứa phần tử nào được gọi là tập rỗng, kí hiệu là $\\emptyset$. Chú ý: Tập $\\{0\\}$ có chứa 1 phần tử là số 0 nên không phải tập rỗng."
      },
      {
        id: 4,
        question: "Cho tập hợp $D = \\{n \\in \\mathbb{N} \\mid n$ là số nguyên tố, $5 < n < 20\\}$ (Ví dụ 1 SGK trang 13). Số phần tử $n(D)$ của tập hợp $D$ là:",
        options: [
          "$n(D) = 5$",
          "$n(D) = 4$",
          "$n(D) = 6$",
          "$n(D) = 7$"
        ],
        correctAnswerIndex: 0,
        solution: "Các số nguyên tố lớn hơn 5 và nhỏ hơn 20 là: $7, 11, 13, 17, 19$. Do đó $D = \\{7; 11; 13; 17; 19\\}$, suy ra số phần tử của tập hợp $D$ là $n(D) = 5$."
      },
      {
        id: 5,
        question: "Cho $S$ là tập nghiệm của phương trình $x^2 - 24x + 143 = 0$ (Luyện tập 1 SGK trang 13). Khẳng định nào sau đây là **SAI**?",
        options: [
          "$11 \\notin S$",
          "$13 \\in S$",
          "$n(S) = 2$",
          "$S = \\{11; 13\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Phương trình $x^2 - 24x + 143 = 0$ có biệt thức $\\Delta' = (-12)^2 - 143 = 144 - 143 = 1 > 0$. Hai nghiệm là $x = 12 - 1 = 11$ và $x = 12 + 1 = 13$. Do đó $S = \\{11; 13\\}$, có $n(S) = 2$. Vì $11$ là nghiệm nên khẳng định đúng là $11 \\in S$. Do đó phát biểu '$11 \\notin S$' là SAI."
      },
      {
        id: 6,
        question: "Khẳng định nào sau đây đúng về định nghĩa **tập hợp con** ($T \\subset S$)?",
        options: [
          "Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$",
          "Nếu có ít nhất một phần tử của $T$ là phần tử của $S$",
          "Nếu số phần tử của $T$ nhỏ hơn số phần tử của $S$",
          "Nếu $T$ và $S$ có chung ít nhất 2 phần tử"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 14: Nếu mọi phần tử của tập hợp $T$ đều là phần tử của tập hợp $S$ thì ta nói $T$ là một tập hợp con (tập con) của $S$ và viết là $T \\subset S$ (đọc là $T$ là tập con của $S$ hoặc $S$ chứa $T$).",
        tikz: "\\begin{tikzpicture}\n  \\draw[thick, fill=blue!10] (0,0) ellipse (2.2cm and 1.4cm);\n  \\node at (1.2, 0.7) {$S$};\n  \\draw[thick, fill=yellow!30] (-0.3,-0.1) ellipse (1.1cm and 0.7cm);\n  \\node at (-0.3,-0.1) {$T$};\n  \\node at (0, -1.8) {$T \\subset S$};\n\\end{tikzpicture}"
      },
      {
        id: 7,
        question: "Khẳng định nào sau đây là **quy ước chuẩn** trong lý thuyết tập hợp?",
        options: [
          "Tập rỗng $\\emptyset$ là tập con của mọi tập hợp",
          "Tập rỗng chứa phần tử là số $0$",
          "Mọi tập hợp đều chứa phần tử $\\emptyset$",
          "Tập rỗng không có bất kì tập hợp con nào"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 14 ghi rõ: Quy ước tập rỗng là tập con của mọi tập hợp, nghĩa là $\\emptyset \\subset S$ với mọi tập hợp $S$."
      },
      {
        id: 8,
        question: "Cho tập hợp $X = \\{a; b\\}$. Trong các cách viết sau, cách viết nào là **ĐÚNG** (Bài 1.12 SGK trang 19)?",
        options: [
          "$\\{a\\} \\subset X$",
          "$a \\subset X$",
          "$\\emptyset \\in X$",
          "$\\{a; b\\} \\in X$"
        ],
        correctAnswerIndex: 0,
        solution: "Theo quy ước kí hiệu (Bài 1.12 SGK trang 19): $a$ là phần tử nên viết $a \\in X$ (viết $a \\subset X$ sai). $\\{a\\}$ là tập hợp chứa phần tử $a$ nên viết $\\{a\\} \\subset X$ là ĐÚNG. Với tập rỗng ta viết $\\emptyset \\subset X$ (viết $\\emptyset \\in X$ sai)."
      },
      {
        id: 9,
        question: "Hai tập hợp $S$ và $T$ được gọi là **hai tập hợp bằng nhau** ($S = T$) khi và chỉ khi:",
        options: [
          "$S \\subset T$ và $T \\subset S$",
          "$n(S) = n(T)$",
          "$S$ và $T$ cùng có phần tử là các số tự nhiên",
          "$S \\subset T$ hoặc $T \\subset S$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 14: Hai tập hợp $S$ và $T$ được gọi là bằng nhau nếu mỗi phần tử của $T$ cũng là phần tử của $S$ và ngược lại. Điều kiện cần và đủ là $S \\subset T$ và $T \\subset S$."
      },
      {
        id: 10,
        question: "Cho các tập hợp $A = \\{2; 5\\}$, $B = \\{5; x\\}$, $C = \\{2; y\\}$. Để $A = B = C$ thì giá trị của $x$ và $y$ là (Bài 1.13 SGK trang 19):",
        options: [
          "$x = 2$ và $y = 5$",
          "$x = 5$ và $y = 2$",
          "$x = 0$ và $y = 0$",
          "$x = 2$ và $y = 2$"
        ],
        correctAnswerIndex: 0,
        solution: "Để $B = \\{5; x\\}$ bằng $A = \\{2; 5\\}$ thì $x = 2$. Để $C = \\{2; y\\}$ bằng $A = \\{2; 5\\}$ thì $y = 5$. Vậy $x = 2$ và $y = 5$."
      },
      {
        id: 11,
        question: "Cho tập hợp $A = \\{a; b; c\\}$. Tập $A$ có tất cả bao nhiêu tập hợp con (Câu 1.20 SGK trang 20)?",
        options: [
          "$8$",
          "$6$",
          "$4$",
          "$10$"
        ],
        correctAnswerIndex: 0,
        solution: "Tập hợp có $n$ phần tử thì có $2^n$ tập con. Với tập $A$ có 3 phần tử, số tập con là $2^3 = 8$ (gồm: $\\emptyset$; $\\{a\\}, \\{b\\}, \\{c\\}$; $\\{a; b\\}, \\{b; c\\}, \\{c; a\\}$; và $\\{a; b; c\\}$)."
      },
      {
        id: 12,
        question: "Cho tập hợp $A = \\{0; 4; 8; 12; 16\\}$. Cách viết nào sau đây thể hiện tập $A$ bằng cách **chỉ ra tính chất đặc trưng** (Bài 1.10 SGK trang 19)?",
        options: [
          "$A = \\{x \\in \\mathbb{N} \\mid x \\vdots 4, x \\le 16\\}$",
          "$A = \\{x \\in \\mathbb{Z} \\mid x \\vdots 2, x \\le 16\\}$",
          "$A = \\{x \\in \\mathbb{N}^* \\mid x \\vdots 4, x < 20\\}$",
          "$A = \\{4k \\mid k \\in \\mathbb{Z}\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Các phần tử $0, 4, 8, 12, 16$ là các số tự nhiên chia hết cho 4 và không vượt quá 16 ($x = 4k$ với $k \\in \\{0; 1; 2; 3; 4\\}$). Do đó $A = \\{x \\in \\mathbb{N} \\mid x \\vdots 4, x \\le 16\\}$."
      },
      {
        id: 13,
        question: "Trong các tập hợp sau, tập hợp nào là **tập rỗng** (Bài 1.11 SGK trang 19)?",
        options: [
          "$B = \\{x \\in \\mathbb{Z} \\mid x^2 - 6 = 0\\}$",
          "$A = \\{x \\in \\mathbb{R} \\mid x^2 - 6 = 0\\}$",
          "$C = \\{x \\in \\mathbb{Q} \\mid x^2 - 4 = 0\\}$",
          "$D = \\{x \\in \\mathbb{N} \\mid x \\le 0\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Phương trình $x^2 - 6 = 0 \\Leftrightarrow x = \\pm \\sqrt{6}$. Do $\\pm \\sqrt{6}$ là số vô tỉ nên không có nghiệm nào thuộc tập số nguyên $\\mathbb{Z}$, do đó $B = \\emptyset$. Ngược lại, $A = \\{-\\sqrt{6}; \\sqrt{6}\\} \\neq \\emptyset$; $C = \\{-2; 2\\} \\neq \\emptyset$; $D = \\{0\\} \\neq \\emptyset$."
      },
      {
        id: 14,
        question: "Cho $C$ là tập các hình bình hành có hai đường chéo vuông góc; $D$ là tập các hình vuông (Luyện tập 2 SGK trang 14). Mệnh đề nào sau đây là đúng?",
        options: [
          "$D \\subset C$",
          "$C \\subset D$",
          "$C = D$",
          "$C \\cap D = \\emptyset$"
        ],
        correctAnswerIndex: 0,
        solution: "Hình bình hành có hai đường chéo vuông góc chính là hình thoi. Vì mọi hình vuông đều là hình thoi nên mọi phần tử của $D$ đều thuộc $C$, nghĩa là $D \\subset C$. Ngược lại, không phải hình thoi nào cũng là hình vuông nên $C \\not\\subset D$."
      },
      {
        id: 15,
        question: "Cho tập hợp $S = \\{1; 2; 3; 4\\}$. Số tập hợp con gồm đúng 2 phần tử của $S$ là:",
        options: [
          "$6$",
          "$4$",
          "$8$",
          "$12$"
        ],
        correctAnswerIndex: 0,
        solution: "Các tập con có đúng 2 phần tử của $S$ là: $\\{1; 2\\}, \\{1; 3\\}, \\{1; 4\\}, \\{2; 3\\}, \\{2; 4\\}, \\{3; 4\\}$. Có tất cả 6 tập con thỏa mãn (ứng với tổ hợp $C_4^2 = 6$)."
      }
    ]
  },
  {
    id: 2,
    title: "Bộ đề 2: Các tập hợp số & Các tập con của số thực ℝ",
    description: "Mối quan hệ ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ, phân loại số hữu tỉ - vô tỉ, định nghĩa và kí hiệu khoảng, đoạn, nửa khoảng trên trục số",
    questions: [
      {
        id: 1,
        question: "Mối quan hệ bao hàm đúng giữa các tập hợp số $\\mathbb{N}, \\mathbb{Z}, \\mathbb{Q}, \\mathbb{R}$ là (SGK trang 15):",
        options: [
          "$\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$",
          "$\\mathbb{Z} \\subset \\mathbb{N} \\subset \\mathbb{Q} \\subset \\mathbb{R}$",
          "$\\mathbb{N} \\subset \\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{R}$",
          "$\\mathbb{R} \\subset \\mathbb{Q} \\subset \\mathbb{Z} \\subset \\mathbb{N}$"
        ],
        correctAnswerIndex: 0,
        solution: "Theo SGK Toán 10 trang 15: Mối quan hệ giữa các tập hợp số là: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$."
      },
      {
        id: 2,
        question: "Tập hợp các số hữu tỉ $\\mathbb{Q}$ bao gồm các số:",
        options: [
          "Viết được dưới dạng phân số $\\frac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$",
          "Số thập phân vô hạn không tuần hoàn",
          "Chỉ gồm các số nguyên dương và số 0",
          "Căn bậc hai số học của mọi số tự nhiên"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 15: Tập hợp các số hữu tỉ $\\mathbb{Q}$ gồm các số viết được dưới dạng phân số $\\frac{a}{b}$ với $a, b \\in \\mathbb{Z}, b \\neq 0$. Số hữu tỉ được biểu diễn dưới dạng số thập phân hữu hạn hoặc vô hạn tuần hoàn."
      },
      {
        id: 3,
        question: "Khẳng định nào sau đây là **ĐÚNG** về các số cụ thể (Ví dụ 4 SGK trang 15)?",
        options: [
          "$\\sqrt{2} \\in \\mathbb{R}$",
          "$3{,}274 \\notin \\mathbb{Q}$",
          "$\\frac{3}{4} \\in \\mathbb{Z}$",
          "$-\\sqrt{3} \\in \\mathbb{Q}$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 15: Số $\\sqrt{2}$ là số vô tỉ nên là số thực, $\\sqrt{2} \\in \\mathbb{R}$ là khẳng định đúng. Số $3{,}274 = \\frac{3274}{1000} \\in \\mathbb{Q}$; $\\frac{3}{4} \\notin \\mathbb{Z}$; $-\\sqrt{3}$ là số vô tỉ nên $-\\sqrt{3} \\notin \\mathbb{Q}$."
      },
      {
        id: 4,
        question: "Cho tập hợp $C = \\{-4; 0; 1; 2\\}$. Khẳng định nào sau đây là **SAI** (Luyện tập 3 SGK trang 15)?",
        options: [
          "$C \\subset \\mathbb{N}$",
          "$C \\subset \\mathbb{Z}$",
          "$C \\subset \\mathbb{R}$",
          "$C \\subset \\mathbb{Q}$"
        ],
        correctAnswerIndex: 0,
        solution: "Vì $-4 \\in C$ nhưng $-4$ là số nguyên âm, không phải là số tự nhiên ($-4 \\notin \\mathbb{N}$), do đó $C$ không phải là tập con của $\\mathbb{N}$. Khẳng định '$C \\subset \\mathbb{N}$' là SAI."
      },
      {
        id: 5,
        question: "Tập hợp các số thực $x$ thỏa mãn $a < x < b$ được gọi là:",
        options: [
          "Khoảng $(a; b)$",
          "Đoạn $[a; b]$",
          "Nửa khoảng $[a; b)$",
          "Nửa khoảng $(a; b]$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 16: Tập hợp $\\{x \\in \\mathbb{R} \\mid a < x < b\\}$ được gọi là khoảng $(a; b)$."
      },
      {
        id: 6,
        question: "Tập hợp các số thực $x$ thỏa mãn $a \\le x \\le b$ được gọi là:",
        options: [
          "Đoạn $[a; b]$",
          "Khoảng $(a; b)$",
          "Nửa khoảng $[a; b)$",
          "Đoạn mở $(a; b)$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 16: Đoạn $[a; b] = \\{x \\in \\mathbb{R} \\mid a \\le x \\le b\\}$. Cả hai đầu mút $a$ và $b$ đều thuộc đoạn này."
      },
      {
        id: 7,
        question: "Kí hiệu nào sau đây biểu diễn tập hợp $\\{x \\in \\mathbb{R} \\mid x \\ge a\\}$?",
        options: [
          "$[a; +\\infty)$",
          "$(a; +\\infty)$",
          "$(-\\infty; a]$",
          "$(-\\infty; a)$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 16: Nửa khoảng $[a; +\\infty) = \\{x \\in \\mathbb{R} \\mid x \\ge a\\}$. Đầu mút $a$ lấy ngoặc vuông vì có dấu bằng."
      },
      {
        id: 8,
        question: "Cho tập hợp $C = \\{x \\in \\mathbb{R} \\mid 2 \\le x \\le 7\\}$. Biểu diễn $C$ dưới dạng đoạn là (Ví dụ 5 SGK trang 16):",
        options: [
          "$[2; 7]$",
          "$(2; 7)$",
          "$[2; 7)$",
          "$(2; 7]$"
        ],
        correctAnswerIndex: 0,
        solution: "Vì $2 \\le x \\le 7$ nên cả hai đầu mút $2$ và $7$ đều thuộc tập hợp, do đó viết dưới dạng đoạn là $[2; 7]$.",
        tikz: "\\begin{tikzpicture}[x=0.7cm, y=0.7cm]\n  \\draw[->, >=stealth, thick] (0,0) -- (9,0) node[right] {$x$};\n  \\foreach \\x in {0.3,0.7,1.1,1.5,1.9} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\foreach \\x in {7.3,7.7,8.1,8.5} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (2,0) -- (7,0);\n  \\node[blue!80!black, font=\\bfseries] at (2,0) {\\textbf{[}};\n  \\node[below=3pt] at (2,0) {$2$};\n  \\node[blue!80!black, font=\\bfseries] at (7,0) {\\textbf{]}};\n  \\node[below=3pt] at (7,0) {$7$};\n  \\node at (4.5, 0.8) {$[2; 7]$};\n\\end{tikzpicture}"
      },
      {
        id: 9,
        question: "Cho tập hợp $D = \\{x \\in \\mathbb{R} \\mid x < 2\\}$. Biểu diễn tập $D$ dưới dạng khoảng là:",
        options: [
          "$(-\\infty; 2)$",
          "$(-\\infty; 2]$",
          "$(2; +\\infty)$",
          "$[2; +\\infty)$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 16: Tập hợp các số thực nhỏ hơn 2 là khoảng $(-\\infty; 2)$.",
        tikz: "\\begin{tikzpicture}[x=0.8cm, y=0.8cm]\n  \\draw[->, >=stealth, thick] (-3,0) -- (5,0) node[right] {$x$};\n  \\foreach \\x in {2.2,2.6,3.0,3.4,3.8,4.2,4.6} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (-3,0) -- (2,0);\n  \\node[blue!80!black, font=\\bfseries] at (2,0) {\\textbf{)}};\n  \\node[below=3pt] at (2,0) {$2$};\n  \\node at (-0.5, 0.8) {$(-\\infty; 2)$};\n\\end{tikzpicture}"
      },
      {
        id: 10,
        question: "Ghép cặp: Dòng nào sau đây thể hiện đúng quy ước biểu diễn tập hợp (Luyện tập 4 SGK trang 16)?",
        options: [
          "$x \\in (2; 5] \\Leftrightarrow 2 < x \\le 5$",
          "$x \\in [2; 5] \\Leftrightarrow 2 < x < 5$",
          "$x \\in [7; +\\infty) \\Leftrightarrow x > 7$",
          "$x \\in (7; 10) \\Leftrightarrow 7 \\le x \\le 10$"
        ],
        correctAnswerIndex: 0,
        solution: "Nửa khoảng $(2; 5]$ không lấy giá trị 2 (ngoặc tròn) và lấy giá trị 5 (ngoặc vuông), tương đương với bất đẳng thức $2 < x \\le 5$."
      },
      {
        id: 11,
        question: "Cho hình biểu diễn trên trục số với phần không bị gạch là các số $x$ thỏa mãn $[-2; 5)$ (Câu 1.23 SGK trang 20). Tập hợp đó là:",
        options: [
          "$\\{x \\in \\mathbb{R} \\mid -2 \\le x < 5\\}$",
          "$\\{x \\in \\mathbb{R} \\mid -2 < x \\le 5\\}$",
          "$\\{x \\in \\mathbb{R} \\mid -2 \\le x \\le 5\\}$",
          "$\\{x \\in \\mathbb{R} \\mid -2 < x < 5\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Kí hiệu $[-2; 5)$ có ngoặc vuông tại $-2$ (tức $x \\ge -2$) và ngoặc tròn tại $5$ (tức $x < 5$), biểu diễn tập hợp $\\{x \\in \\mathbb{R} \\mid -2 \\le x < 5\\}$.",
        tikz: "\\begin{tikzpicture}[x=0.8cm, y=0.8cm]\n  \\draw[->, >=stealth, thick] (-4.5,0) -- (6.5,0) node[right] {$x$};\n  \\foreach \\x in {-4.2,-3.8,-3.4,-3.0,-2.6,-2.2} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\foreach \\x in {5.2,5.6,6.0} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (-2,0) -- (5,0);\n  \\node[blue!80!black, font=\\bfseries] at (-2,0) {\\textbf{[}};\n  \\node[below=3pt] at (-2,0) {$-2$};\n  \\node[blue!80!black, font=\\bfseries] at (5,0) {\\textbf{)}};\n  \\node[below=3pt] at (5,0) {$5$};\n  \\node at (1.5, 0.8) {$[-2; 5)$};\n\\end{tikzpicture}"
      },
      {
        id: 12,
        question: "Tập hợp toàn bộ các số thực $\\mathbb{R}$ có thể viết dưới dạng khoảng là:",
        options: [
          "$(-\\infty; +\\infty)$",
          "$[-\\infty; +\\infty]$",
          "$[0; +\\infty)$",
          "$(-\\infty; 0]$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 16: Toàn bộ tập số thực $\\mathbb{R}$ được viết dưới dạng khoảng vô hạn $(-\\infty; +\\infty)$."
      },
      {
        id: 13,
        question: "Số các số nguyên $x$ thỏa mãn $x \\in [-3; 2)$ là:",
        options: [
          "$5$",
          "$4$",
          "$6$",
          "$3$"
        ],
        correctAnswerIndex: 0,
        solution: "Ta có $x \\in [-3; 2) \\Leftrightarrow -3 \\le x < 2$. Vì $x \\in \\mathbb{Z}$ nên $x \\in \\{-3; -2; -1; 0; 1\\}$. Có tất cả 5 số nguyên thỏa mãn."
      },
      {
        id: 14,
        question: "Cho tập hợp $A = \\{x \\in \\mathbb{Z} \\mid |x| < 4\\}$ (Bài 1.14 SGK trang 19). Tập $A$ có bao nhiêu phần tử?",
        options: [
          "$7$",
          "$8$",
          "$6$",
          "$9$"
        ],
        correctAnswerIndex: 0,
        solution: "Ta có $|x| < 4 \\Leftrightarrow -4 < x < 4$. Vì $x$ là số nguyên nên $x \\in \\{-3; -2; -1; 0; 1; 2; 3\\}$. Tập $A$ có $7$ phần tử."
      },
      {
        id: 15,
        question: "Cho nửa khoảng $A = [m; m + 3)$ và khoảng $B = (2; 6)$. Tìm điều kiện của tham số $m$ để $A \\subset B$:",
        options: [
          "$2 < m \\le 3$",
          "$2 \\le m \\le 3$",
          "$m > 2$",
          "$m \\le 3$"
        ],
        correctAnswerIndex: 0,
        solution: "Để $[m; m+3) \\subset (2; 6)$ thì: 1) Đầu mút trái: Vì $A$ lấy điểm $m$ còn $B$ không lấy điểm 2 nên phải có $m > 2$. 2) Đầu mút phải: Điểm $m + 3$ không thuộc $A$, nên $m + 3 \\le 6 \\Leftrightarrow m \\le 3$. Kết hợp lại ta được điều kiện: $2 < m \\le 3$."
      }
    ]
  },
  {
    id: 3,
    title: "Bộ đề 3: Các phép toán trên tập hợp (Giao, Hợp, Hiệu, Phần bù)",
    description: "Định nghĩa phép giao ∩, hợp ∪, hiệu \\, phần bù C, tính chất và các bài toán tìm giao/hợp/hiệu của các khoảng, đoạn trên ℝ",
    questions: [
      {
        id: 1,
        question: "Giao của hai tập hợp $S$ và $T$, kí hiệu là $S \\cap T$, là tập hợp gồm các phần tử:",
        options: [
          "Thuộc cả hai tập hợp $S$ và $T$",
          "Thuộc tập hợp $S$ hoặc thuộc tập hợp $T$",
          "Thuộc tập hợp $S$ nhưng không thuộc tập hợp $T$",
          "Không thuộc cả $S$ và $T$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 17: Tập hợp gồm các phần tử thuộc cả hai tập hợp $S$ và $T$ gọi là giao của hai tập hợp $S$ và $T$, kí hiệu là $S \\cap T = \\{x \\mid x \\in S$ và $x \\in T\\}$."
      },
      {
        id: 2,
        question: "Hợp của hai tập hợp $S$ và $T$, kí hiệu là $S \\cup T$, là tập hợp gồm các phần tử:",
        options: [
          "Thuộc tập hợp $S$ hoặc thuộc tập hợp $T$",
          "Thuộc cả hai tập hợp $S$ và $T$ đồng thời",
          "Thuộc tập hợp $S$ nhưng không thuộc $T$",
          "Thuộc $T$ nhưng không thuộc $S$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 17: Tập hợp gồm các phần tử thuộc tập hợp $S$ hoặc thuộc tập hợp $T$ gọi là hợp của hai tập hợp $S$ và $T$, kí hiệu $S \\cup T = \\{x \\mid x \\in S$ hoặc $x \\in T\\}$."
      },
      {
        id: 3,
        question: "Hiệu của hai tập hợp $S$ và $T$, kí hiệu là $S \\setminus T$, là tập hợp gồm các phần tử:",
        options: [
          "Thuộc $S$ nhưng không thuộc $T$",
          "Thuộc $T$ nhưng không thuộc $S$",
          "Thuộc cả $S$ và $T$",
          "Thuộc $S$ hoặc thuộc $T$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 18: Hiệu của hai tập hợp $S$ và $T$ là tập hợp gồm các phần tử thuộc $S$ nhưng không thuộc $T$, kí hiệu là $S \\setminus T = \\{x \\mid x \\in S$ và $x \\notin T\\}$."
      },
      {
        id: 4,
        question: "Khi $T$ là một tập con của $S$ ($T \\subset S$), hiệu $S \\setminus T$ được gọi là:",
        options: [
          "Phần bù của $T$ trong $S$, kí hiệu là $C_S T$",
          "Giao của $S$ và $T$",
          "Tập rỗng $\\emptyset$",
          "Phần bù của $S$ trong $T$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 18: Nếu $T \\subset S$ thì $S \\setminus T$ được gọi là phần bù của $T$ trong $S$, kí hiệu là $C_S T$. Chú ý $C_S S = \\emptyset$."
      },
      {
        id: 5,
        question: "Cho hai tập hợp $C = \\{4; 7; 27\\}$ và $D = \\{2; 4; 9; 27; 36\\}$ (Ví dụ 6a SGK trang 17). Giao $C \\cap D$ là:",
        options: [
          "$\\{4; 27\\}$",
          "$\\{2; 4; 7; 9; 27; 36\\}$",
          "$\\{7\\}$",
          "$\\{2; 9; 36\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Các phần tử chung của hai tập hợp $C$ và $D$ là $4$ và $27$. Do đó $C \\cap D = \\{4; 27\\}$."
      },
      {
        id: 6,
        question: "Cho hai tập hợp $C = \\{2; 3; 4; 7\\}$ và $D = \\{-1; 2; 3; 4; 6\\}$ (Ví dụ 7a SGK trang 17). Hợp $C \\cup D$ là:",
        options: [
          "$\\{-1; 2; 3; 4; 6; 7\\}$",
          "$\\{2; 3; 4\\}$",
          "$\\{7\\}$",
          "$\\{-1; 6\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Hợp $C \\cup D$ gồm các phần tử thuộc $C$ hoặc thuộc $D$, không lặp lại: $\\{-1; 2; 3; 4; 6; 7\\}$."
      },
      {
        id: 7,
        question: "Cho $D = \\{-2; 3; 5; 6\\}$ và $E = \\{2; 3; 5; 7\\}$ (Ví dụ 9a SGK trang 18). Hiệu $D \\setminus E$ là:",
        options: [
          "$\\{-2; 6\\}$",
          "$\\{2; 7\\}$",
          "$\\{3; 5\\}$",
          "$\\{-2; 2; 3; 5; 6; 7\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Các phần tử thuộc $D$ nhưng không thuộc $E$ là $-2$ và $6$. Do đó $D \\setminus E = \\{-2; 6\\}$."
      },
      {
        id: 8,
        question: "Cho hai tập hợp $E = [1; +\\infty)$ và $F = (-\\infty; 3]$ (Ví dụ 6b SGK trang 17). Xác định $E \\cap F$:",
        options: [
          "$[1; 3]$",
          "$(1; 3)$",
          "$(-\\infty; +\\infty)$",
          "$\\emptyset$"
        ],
        correctAnswerIndex: 0,
        solution: "Giao $E \\cap F$ gồm các số thực $x$ thỏa mãn đồng thời $x \\ge 1$ và $x \\le 3$, tức $1 \\le x \\le 3$. Do đó $E \\cap F = [1; 3]$.",
        tikz: "\\begin{tikzpicture}[x=0.8cm, y=0.8cm]\n  \\draw[->, >=stealth, thick] (-2,0) -- (6,0) node[right] {$x$};\n  \\foreach \\x in {-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\foreach \\x in {3.2,3.6,4.0,4.4,4.8,5.2,5.6} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (1,0) -- (3,0);\n  \\node[blue!80!black, font=\\bfseries] at (1,0) {\\textbf{[}};\n  \\node[below=3pt] at (1,0) {$1$};\n  \\node[blue!80!black, font=\\bfseries] at (3,0) {\\textbf{]}};\n  \\node[below=3pt] at (3,0) {$3$};\n  \\node at (2, 0.8) {$[1; 3]$};\n\\end{tikzpicture}"
      },
      {
        id: 9,
        question: "Cho hai tập hợp $E = (-1; 2]$ và $F = [0; 3]$ (Ví dụ 7b SGK trang 17). Xác định $E \\cup F$:",
        options: [
          "$(-1; 3]$",
          "$[0; 2]$",
          "$(-1; 0)$",
          "$(2; 3]$"
        ],
        correctAnswerIndex: 0,
        solution: "Hợp của hai tập hợp là tập các số thực thuộc $E$ hoặc $F$: $(-1; 2] \\cup [0; 3] = (-1; 3]$."
      },
      {
        id: 10,
        question: "Cho hai tập hợp $C = [1; 5]$ và $D = [-2; 3]$ (Luyện tập 5 SGK trang 17). Xác định tập hợp $C \\cap D$:",
        options: [
          "$[1; 3]$",
          "$[-2; 5]$",
          "$(3; 5]$",
          "$[-2; 1)$"
        ],
        correctAnswerIndex: 0,
        solution: "Biểu diễn trên trục số, phần chung của $[1; 5]$ và $[-2; 3]$ là các số thực $x$ thỏa mãn $1 \\le x \\le 3$. Do đó $C \\cap D = [1; 3]$.",
        tikz: "\\begin{tikzpicture}[x=0.7cm, y=0.7cm]\n  \\draw[->, >=stealth, thick] (-4,0) -- (7,0) node[right] {$x$};\n  \\foreach \\x in {-3.8,-3.4,-3.0,-2.6,-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\foreach \\x in {3.2,3.6,4.0,4.4,4.8,5.2,5.6,6.0,6.4} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (1,0) -- (3,0);\n  \\node[blue!80!black, font=\\bfseries] at (1,0) {\\textbf{[}};\n  \\node[below=3pt] at (1,0) {$1$};\n  \\node[blue!80!black, font=\\bfseries] at (3,0) {\\textbf{]}};\n  \\node[below=3pt] at (3,0) {$3$};\n  \\node at (2, 0.8) {$C \\cap D = [1; 3]$};\n\\end{tikzpicture}"
      },
      {
        id: 11,
        question: "Tìm phần bù của $(-\\infty; -2)$ trong $\\mathbb{R}$, tức $C_{\\mathbb{R}}(-\\infty; -2)$ (Luyện tập 7a SGK trang 18):",
        options: [
          "$[-2; +\\infty)$",
          "$(-2; +\\infty)$",
          "$(-\\infty; -2]$",
          "$(-\\infty; 2]$"
        ],
        correctAnswerIndex: 0,
        solution: "Phần bù của $(-\\infty; -2)$ trong $\\mathbb{R}$ là tập các số thực $x \\notin (-\\infty; -2)$, tức là $x \\ge -2$. Kí hiệu là nửa khoảng $[-2; +\\infty)$.",
        tikz: "\\begin{tikzpicture}[x=0.8cm, y=0.8cm]\n  \\draw[->, >=stealth, thick] (-5,0) -- (3,0) node[right] {$x$};\n  \\foreach \\x in {-4.8,-4.4,-4.0,-3.6,-3.2,-2.8,-2.4} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (-2,0) -- (2.8,0);\n  \\node[blue!80!black, font=\\bfseries] at (-2,0) {\\textbf{[}};\n  \\node[below=3pt] at (-2,0) {$-2$};\n  \\node at (0.5, 0.8) {$[-2; +\\infty)$};\n\\end{tikzpicture}"
      },
      {
        id: 12,
        question: "Xác định tập hợp $(-4; 1] \\cap [0; 3)$ (Bài 1.15a SGK trang 19):",
        options: [
          "$[0; 1]$",
          "$(-4; 3)$",
          "$(-4; 0)$",
          "$(1; 3)$"
        ],
        correctAnswerIndex: 0,
        solution: "Phần chung của hai tập hợp $(-4; 1]$ và $[0; 3)$ là các số thực $x$ thỏa mãn $-4 < x \\le 1$ và $0 \\le x < 3$, suy ra $0 \\le x \\le 1$. Do đó giao là đoạn $[0; 1]$."
      },
      {
        id: 13,
        question: "Xác định tập hợp $(0; 2] \\cup (-3; 1]$ (Bài 1.15b SGK trang 19):",
        options: [
          "$(-3; 2]$",
          "$(0; 1]$",
          "$(-3; 0)$",
          "$[1; 2]$"
        ],
        correctAnswerIndex: 0,
        solution: "Hợp $(0; 2] \\cup (-3; 1]$ gồm tất cả các số thuộc ít nhất một trong hai tập, tức là khoảng nửa đoạn $(-3; 2]$."
      },
      {
        id: 14,
        question: "Xác định tập hợp $(-2; 1] \\cap (1; +\\infty)$ (Bài 1.15c SGK trang 19):",
        options: [
          "$\\emptyset$",
          "$\\{1\\}$",
          "$(-2; +\\infty)$",
          "$(1; 1]$"
        ],
        correctAnswerIndex: 0,
        solution: "Tập hợp $(-2; 1]$ chỉ chứa các số $x \\le 1$, trong khi $(1; +\\infty)$ chỉ chứa các số $x > 1$. Không có số thực nào vừa $\\le 1$ vừa $> 1$. Do đó $(-2; 1] \\cap (1; +\\infty) = \\emptyset$."
      },
      {
        id: 15,
        question: "Cho $A = [-2; 3]$ và $B = (1; +\\infty)$ (Bài 1.25 SGK trang 21). Xác định hiệu $B \\setminus A$:",
        options: [
          "$(3; +\\infty)$",
          "$[3; +\\infty)$",
          "$(1; 3]$",
          "$[-2; 1]$"
        ],
        correctAnswerIndex: 0,
        solution: "Hiệu $B \\setminus A$ gồm các số thực thuộc $B = (1; +\\infty)$ nhưng không thuộc $A = [-2; 3]$. Vì $A$ chứa điểm $3$ nên các số thuộc $B$ mà không thuộc $A$ phải lớn hơn $3$ ($x > 3$). Do đó $B \\setminus A = (3; +\\infty)$.",
        tikz: "\\begin{tikzpicture}[x=0.8cm, y=0.8cm]\n  \\draw[->, >=stealth, thick] (-4,0) -- (6,0) node[right] {$x$};\n  \\foreach \\x in {-3.8,-3.4,-3.0,-2.6,-2.2,-1.8,-1.4,-1.0,-0.6,-0.2,0.2,0.6,1.0,1.4,1.8,2.2,2.6,3.0} {\n    \\draw[gray, thin] (\\x-0.15,-0.2) -- (\\x+0.15,0.2);\n  }\n  \\draw[line width=1.5pt, blue!80!black] (3,0) -- (5.8,0);\n  \\node[blue!80!black, font=\\bfseries] at (3,0) {\\textbf{(}};\n  \\node[below=3pt] at (3,0) {$3$};\n  \\node at (4.5, 0.8) {$B \\setminus A = (3; +\\infty)$};\n\\end{tikzpicture}"
      }
    ]
  },
  {
    id: 4,
    title: "Bộ đề 4: Biểu đồ Ven & Ứng dụng thực tiễn giải toán tập hợp",
    description: "Sử dụng biểu đồ Ven, công thức bao hàm loại trừ n(A ∪ B) = n(A) + n(B) - n(A ∩ B), giải bài toán thực tiễn CLB, thể thao, ngoại ngữ, du lịch",
    questions: [
      {
        id: 1,
        question: "Cho các tập hợp $A, B$ được minh hoạ bằng biểu đồ Ven. Phần tô màu gồm các điểm thuộc $A$ nhưng nằm ngoài $B$ là biểu diễn của tập hợp nào (Câu 1.21 SGK trang 20)?",
        options: [
          "$A \\setminus B$",
          "$A \\cap B$",
          "$A \\cup B$",
          "$B \\setminus A$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 20 (Câu 1.21): Phần hình phẳng nằm bên trong đường cong kín của $A$ và nằm ngoài đường cong kín của $B$ biểu diễn hiệu $A \\setminus B$.",
        tikz: "\\begin{tikzpicture}\n  \\def\\circleA{(-0.8,0) circle (1.5cm)}\n  \\def\\circleB{(0.8,0) circle (1.5cm)}\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[yellow!60!amber] \\circleA;\n  \\end{scope}\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[white] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.5,0) {\\textbf{A}};\n  \\node at (1.5,0) {\\textbf{B}};\n  \\node at (-0.8,-1.8) {Phần tô màu: $A \\setminus B$};\n\\end{tikzpicture}"
      },
      {
        id: 2,
        question: "Cho biểu đồ Ven của hai tập hợp $A$ và $B$. Vùng giao thoa (phần chung) giữa hai đường tròn biểu diễn cho phép toán nào?",
        options: [
          "$A \\cap B$",
          "$A \\cup B$",
          "$A \\setminus B$",
          "$C_B A$"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 17: Phần hình phẳng được bao quanh bởi cả hai đường tròn biểu diễn giao của hai tập hợp, kí hiệu là $A \\cap B$.",
        tikz: "\\begin{tikzpicture}\n  \\def\\circleA{(-0.8,0) circle (1.5cm)}\n  \\def\\circleB{(0.8,0) circle (1.5cm)}\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[green!40] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.5,0) {\\textbf{A}};\n  \\node at (1.5,0) {\\textbf{B}};\n  \\node at (0,0) {$A \\cap B$};\n\\end{tikzpicture}"
      },
      {
        id: 3,
        question: "Cho hai tập hợp hữu hạn $A$ và $B$. Công thức tính số phần tử của hợp $A \\cup B$ là (SGK trang 18):",
        options: [
          "$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$",
          "$n(A \\cup B) = n(A) + n(B) + n(A \\cap B)$",
          "$n(A \\cup B) = n(A) \\cdot n(B)$",
          "$n(A \\cup B) = n(A) + n(B)$ (luôn đúng)"
        ],
        correctAnswerIndex: 0,
        solution: "SGK Toán 10 trang 18: Do phần chung $A \\cap B$ bị đếm 2 lần khi lấy $n(A) + n(B)$, nên công thức đúng là: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.",
        tikz: "\\begin{tikzpicture}\n  \\def\\circleA{(-0.8,0) circle (1.5cm)}\n  \\def\\circleB{(0.8,0) circle (1.5cm)}\n  \\fill[cyan!30] \\circleA;\n  \\fill[cyan!30] \\circleB;\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.5,0) {\\textbf{A}};\n  \\node at (1.5,0) {\\textbf{B}};\n  \\node at (0,0) {$A \\cap B$};\n  \\node at (0,-1.8) {$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$};\n\\end{tikzpicture}"
      },
      {
        id: 4,
        question: "Khi hai tập hợp $A$ và $B$ không có phần tử chung ($A \\cap B = \\emptyset$), số phần tử $n(A \\cup B)$ bằng:",
        options: [
          "$n(A) + n(B)$",
          "$n(A) \\cdot n(B)$",
          "$0$",
          "$|n(A) - n(B)|$"
        ],
        correctAnswerIndex: 0,
        solution: "Khi $A \\cap B = \\emptyset$ thì $n(A \\cap B) = 0$. Thay vào công thức ta được $n(A \\cup B) = n(A) + n(B) - 0 = n(A) + n(B)$."
      },
      {
        id: 5,
        question: "Câu lạc bộ Lịch sử có 12 thành viên. Chuyên đề 1 có 7 bạn tham gia, Chuyên đề 2 có 7 bạn tham gia, trong đó có 4 bạn tham gia cả hai chuyên đề. Có bao nhiêu thành viên **vắng mặt trong cả hai chuyên đề** (Tình huống mở đầu SGK trang 12 & Ví dụ 8 trang 17)?",
        options: [
          "$2$ thành viên",
          "$1$ thành viên",
          "$3$ thành viên",
          "$4$ thành viên"
        ],
        correctAnswerIndex: 0,
        solution: "Số thành viên tham gia ít nhất một chuyên đề là $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = 7 + 7 - 4 = 10$ thành viên. Do CLB có 12 thành viên nên số thành viên vắng mặt cả hai chuyên đề là $12 - 10 = 2$ thành viên.",
        tikz: "\\begin{tikzpicture}\n  \\draw[thick, rounded corners=8pt] (-3,-2.2) rectangle (3,2);\n  \\node[above right] at (-3, 1.6) {CLB: 12 bạn};\n  \\def\\circleA{(-0.9,0) circle (1.3cm)}\n  \\def\\circleB{(0.9,0) circle (1.3cm)}\n  \\draw[thick, fill=blue!15] \\circleA;\n  \\draw[thick, fill=red!15] \\circleB;\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[purple!30] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.3,0.3) {\\small CĐ 1};\n  \\node at (-1.3,-0.2) {\\textbf{3}};\n  \\node at (0,0) {\\textbf{4}};\n  \\node at (1.3,0.3) {\\small CĐ 2};\n  \\node at (1.3,-0.2) {\\textbf{3}};\n  \\node at (2.2,-1.6) {Vắng: \\textbf{2}};\n\\end{tikzpicture}"
      },
      {
        id: 6,
        question: "Lớp 10A có 24 bạn tham gia thi đấu bóng đá và cầu lông, trong đó có 16 bạn thi đấu bóng đá và 11 bạn thi đấu cầu lông (giả sử các trận đấu không diễn ra đồng thời). Có bao nhiêu bạn **tham gia thi đấu cả bóng đá và cầu lông** (Vận dụng SGK trang 18)?",
        options: [
          "$3$ bạn",
          "$5$ bạn",
          "$2$ bạn",
          "$8$ bạn"
        ],
        correctAnswerIndex: 0,
        solution: "Gọi $A$ là tập các bạn thi bóng đá ($n(A) = 16$), $B$ là tập các bạn thi cầu lông ($n(B) = 11$). Số bạn tham gia ít nhất một môn là $n(A \\cup B) = 24$. Số bạn tham gia cả hai môn là: $n(A \\cap B) = n(A) + n(B) - n(A \\cup B) = 16 + 11 - 24 = 3$ bạn.",
        tikz: "\\begin{tikzpicture}\n  \\draw[thick, rounded corners=8pt] (-3.2,-2.2) rectangle (3.2,2);\n  \\node[above right] at (-3.2, 1.6) {Lớp 10A: 24 bạn};\n  \\def\\circleA{(-0.9,0) circle (1.3cm)}\n  \\def\\circleB{(0.9,0) circle (1.3cm)}\n  \\draw[thick, fill=green!15] \\circleA;\n  \\draw[thick, fill=yellow!15] \\circleB;\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[orange!30] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.3,0.3) {\\small Bóng đá};\n  \\node at (-1.3,-0.2) {\\textbf{13}};\n  \\node at (0,0) {\\textbf{3}};\n  \\node at (1.3,0.3) {\\small Cầu lông};\n  \\node at (1.3,-0.2) {\\textbf{8}};\n  \\node at (0,-1.7) {Cả hai môn: $16 + 11 - 24 = 3$};\n\\end{tikzpicture}"
      },
      {
        id: 7,
        question: "Trong bài toán thể thao lớp 10A ở trên, có bao nhiêu bạn **chỉ tham gia thi đấu bóng đá** mà không thi đấu cầu lông?",
        options: [
          "$13$ bạn",
          "$16$ bạn",
          "$8$ bạn",
          "$11$ bạn"
        ],
        correctAnswerIndex: 0,
        solution: "Số bạn chỉ thi đấu bóng đá là số phần tử của $A \\setminus B$: $n(A \\setminus B) = n(A) - n(A \\cap B) = 16 - 3 = 13$ bạn."
      },
      {
        id: 8,
        question: "Để phục vụ hội nghị quốc tế, ban tổ chức huy động 35 người phiên dịch tiếng Anh, 30 người phiên dịch tiếng Pháp, trong đó có 16 người phiên dịch được cả tiếng Anh và tiếng Pháp (Bài 1.16 SGK trang 19). Ban tổ chức đã huy động **tổng cộng bao nhiêu người** phiên dịch?",
        options: [
          "$49$ người",
          "$65$ người",
          "$51$ người",
          "$35$ người"
        ],
        correctAnswerIndex: 0,
        solution: "Tổng số phiên dịch viên được huy động là: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = 35 + 30 - 16 = 49$ người.",
        tikz: "\\begin{tikzpicture}\n  \\def\\circleA{(-1,0) circle (1.4cm)}\n  \\def\\circleB{(1,0) circle (1.4cm)}\n  \\draw[thick, fill=blue!15] \\circleA;\n  \\draw[thick, fill=red!15] \\circleB;\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[purple!30] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.5,0.4) {\\small Tiếng Anh};\n  \\node at (-1.5,-0.2) {\\textbf{19}};\n  \\node at (0,0) {\\textbf{16}};\n  \\node at (1.5,0.4) {\\small Tiếng Pháp};\n  \\node at (1.5,-0.2) {\\textbf{14}};\n  \\node at (0,-1.8) {Tổng cộng: $19 + 16 + 14 = 49$};\n\\end{tikzpicture}"
      },
      {
        id: 9,
        question: "Trong hội nghị quốc tế trên, có bao nhiêu người **chỉ phiên dịch được tiếng Anh** (Bài 1.16b SGK trang 19)?",
        options: [
          "$19$ người",
          "$35$ người",
          "$16$ người",
          "$14$ người"
        ],
        correctAnswerIndex: 0,
        solution: "Số người chỉ phiên dịch được tiếng Anh là: $n(A) - n(A \\cap B) = 35 - 16 = 19$ người."
      },
      {
        id: 10,
        question: "Trong hội nghị quốc tế trên, có bao nhiêu người **chỉ phiên dịch được tiếng Pháp** (Bài 1.16c SGK trang 19)?",
        options: [
          "$14$ người",
          "$30$ người",
          "$16$ người",
          "$15$ người"
        ],
        correctAnswerIndex: 0,
        solution: "Số người chỉ phiên dịch được tiếng Pháp là: $n(B) - n(A \\cap B) = 30 - 16 = 14$ người."
      },
      {
        id: 11,
        question: "Khảo sát $1\\,410$ khách du lịch thăm vịnh Hạ Long cho thấy có $789$ khách đến thăm động Thiên Cung, $690$ khách đến thăm đảo Titop. Toàn bộ khách phỏng vấn đã đến ít nhất một trong hai địa điểm. Hỏi có bao nhiêu khách **vừa đến thăm động Thiên Cung vừa đến thăm đảo Titop** (Bài 1.27 SGK trang 21)?",
        options: [
          "$69$ khách",
          "$99$ khách",
          "$120$ khách",
          "$49$ khách"
        ],
        correctAnswerIndex: 0,
        solution: "Gọi $A$ là tập khách thăm động Thiên Cung ($n(A) = 789$), $B$ là tập khách thăm đảo Titop ($n(B) = 690$). Vì toàn bộ khách đều đến ít nhất một nơi nên $n(A \\cup B) = 1\\,410$. Số khách đến cả hai nơi là: $n(A \\cap B) = n(A) + n(B) - n(A \\cup B) = 789 + 690 - 1\\,410 = 1\\,479 - 1\\,410 = 69$ khách.",
        tikz: "\\begin{tikzpicture}\n  \\def\\circleA{(-1.1,0) circle (1.5cm)}\n  \\def\\circleB{(1.1,0) circle (1.5cm)}\n  \\draw[thick, fill=cyan!15] \\circleA;\n  \\draw[thick, fill=emerald!15] \\circleB;\n  \\begin{scope}\n    \\clip \\circleA;\n    \\fill[teal!35] \\circleB;\n  \\end{scope}\n  \\draw[thick] \\circleA;\n  \\draw[thick] \\circleB;\n  \\node at (-1.6,0.4) {\\small Thiên Cung};\n  \\node at (-1.6,-0.2) {\\textbf{720}};\n  \\node at (0,0) {\\textbf{69}};\n  \\node at (1.6,0.4) {\\small Titop};\n  \\node at (1.6,-0.2) {\\textbf{621}};\n  \\node at (0,-1.9) {Tổng: $720 + 69 + 621 = 1\\,410$};\n\\end{tikzpicture}"
      },
      {
        id: 12,
        question: "Cho $A = \\{x \\in \\mathbb{N} \\mid x < 7\\}$ và $B = \\{1; 2; 3; 6; 7; 8\\}$ (Bài 1.24 SGK trang 21). Xác định tập hợp $A \\setminus B$:",
        options: [
          "$\\{0; 4; 5\\}$",
          "$\\{1; 2; 3; 6\\}$",
          "$\\{7; 8\\}$",
          "$\\{0; 1; 2; 3; 4; 5; 6\\}$"
        ],
        correctAnswerIndex: 0,
        solution: "Vì $x \\in \\mathbb{N}$ và $x < 7$ nên $A = \\{0; 1; 2; 3; 4; 5; 6\\}$. Các phần tử thuộc $A$ nhưng không thuộc $B = \\{1; 2; 3; 6; 7; 8\\}$ là $0, 4, 5$. Do đó $A \\setminus B = \\{0; 4; 5\\}$."
      },
      {
        id: 13,
        question: "Cho hai tập hợp $A = (4; 7]$ và $B = (-3; 5]$ (Bài 1.26c SGK trang 21). Xác định hiệu $A \\setminus B$:",
        options: [
          "$(5; 7]$",
          "$[5; 7]$",
          "$(4; 5]$",
          "$(-3; 4]$"
        ],
        correctAnswerIndex: 0,
        solution: "Hiệu $A \\setminus B$ gồm các số thực thuộc $(4; 7]$ nhưng không thuộc $(-3; 5]$. Các số không thuộc $(-3; 5]$ phải lớn hơn 5. Do đó phần còn lại là nửa khoảng $(5; 7]$."
      },
      {
        id: 14,
        question: "Cho $A = \\{x \\in \\mathbb{Z} \\mid (5x - 3x^2)(x^2 + 2x - 3) = 0\\}$ (Bài 1.14 SGK trang 19). Số phần tử của tập hợp $A$ là:",
        options: [
          "$3$",
          "$4$",
          "$2$",
          "$1$"
        ],
        correctAnswerIndex: 0,
        solution: "Giải phương trình tích: 1) $5x - 3x^2 = 0 \\Leftrightarrow x(5 - 3x) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\frac{5}{3}$. Do $x \\in \\mathbb{Z}$ nên chỉ lấy $x = 0$. 2) $x^2 + 2x - 3 = 0 \\Leftrightarrow (x - 1)(x + 3) = 0 \\Leftrightarrow x = 1$ hoặc $x = -3$ (đều là số nguyên). Vậy $A = \\{-3; 0; 1\\}$, số phần tử là $n(A) = 3$."
      },
      {
        id: 15,
        question: "Cho tập hợp $X$ gồm 10 phần tử phân biệt. Số tập hợp con của $X$ có **nhiều hơn 1 phần tử** là:",
        options: [
          "$1\\,013$",
          "$1\\,024$",
          "$1\\,023$",
          "$1\\,014$"
        ],
        correctAnswerIndex: 0,
        solution: "Tập hợp $10$ phần tử có tổng cộng $2^{10} = 1\\,024$ tập hợp con. Số tập con có không quá 1 phần tử gồm: 1 tập rỗng $\\emptyset$ (0 phần tử) và 10 tập con đơn tử (1 phần tử). Vậy số tập con có nhiều hơn 1 phần tử là $1\\,024 - (1 + 10) = 1\\,024 - 11 = 1\\,013$ tập con."
      }
    ]
  }
];
