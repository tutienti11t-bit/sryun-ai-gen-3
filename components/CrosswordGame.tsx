
import React, { useState, useEffect, useRef } from 'react';
import { generateCrosswordData } from '../services/gemini';
import { CrosswordData, CrosswordClue } from '../types';

const CrosswordGame: React.FC<{ onComplete: (xp: number) => void, adminShowAnswer?: boolean }> = ({ onComplete, adminShowAnswer }) => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<CrosswordData | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [hintCells, setHintCells] = useState<string[]>([]); // Danh sách "row-col" của các ô gợi ý cố định
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [revealedWords, setRevealedWords] = useState<number[]>([]);
  const [errorCells, setErrorCells] = useState<string[]>([]); // "r-c"
  
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const startNewGame = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;
    setLoading(true);
    setTopic(finalTopic);
    const result = await generateCrosswordData(finalTopic);
    if (result && result.clues && result.clues.length > 0) {
      setData(result);
      const grid = Array(result.size).fill(null).map(() => Array(result.size).fill(''));
      const initialHintCells: string[] = [];

      // Điền các chữ cái gợi ý sẵn
      result.clues.forEach(clue => {
        const { row, col, direction, answer, hintIndices } = clue;
        (hintIndices || []).forEach(idx => {
          const r = direction === 'across' ? row : row + idx;
          const c = direction === 'across' ? col + idx : col;
          if (answer[idx]) {
            grid[r][c] = answer[idx].toUpperCase();
            initialHintCells.push(`${r}-${c}`);
          }
        });
      });

      setUserGrid(grid);
      setHintCells(initialHintCells);
      setSelectedClue(result.clues[0]);
      setRevealedWords([]);
      setErrorCells([]);
    } else {
      alert("Sryun không tạo được ô chữ lúc này, hãy thử lại chủ đề khác nhé!");
    }
    setLoading(false);
  };

  const handleInputChange = (r: number, c: number, val: string) => {
    // Không cho sửa nếu là ô gợi ý
    if (hintCells.includes(`${r}-${c}`)) return;

    const newVal = val.toUpperCase().slice(-1);
    // Deep copy grid to ensure state update triggers render correctly
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = newVal;
    setUserGrid(newGrid);

    // Xóa lỗi nếu có
    if (errorCells.includes(`${r}-${c}`)) {
      setErrorCells(prev => prev.filter(cell => cell !== `${r}-${c}`));
    }

    if (newVal && selectedClue) {
      focusNext(r, c);
    }
  };

  const focusNext = (r: number, c: number) => {
    if (!selectedClue) return;
    const { direction, row, col, answer } = selectedClue;
    const indexInWord = direction === 'across' ? c - col : r - row;
    
    if (indexInWord < answer.length - 1) {
      const nextR = direction === 'across' ? r : r + 1;
      const nextC = direction === 'across' ? c + 1 : c;
      inputRefs.current[`${nextR}-${nextC}`]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
    if (e.key === 'Backspace' && selectedClue) {
      // Nếu là ô gợi ý, không cho xóa mà nhảy về ô trước đó
      if (hintCells.includes(`${r}-${c}`) || !userGrid[r][c]) {
        const { direction, row, col } = selectedClue;
        const indexInWord = direction === 'across' ? c - col : r - row;
        
        if (indexInWord > 0) {
          const prevR = direction === 'across' ? r : r - 1;
          const prevC = direction === 'across' ? c - 1 : c;
          inputRefs.current[`${prevR}-${prevC}`]?.focus();
        }
        e.preventDefault();
      }
    }
  };

  const checkGame = () => {
    if (!data) return;
    let allCorrect = true;
    const newErrors: string[] = [];

    data.clues.forEach(clue => {
      const { row, col, direction, answer } = clue;
      for (let i = 0; i < answer.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        if (userGrid[r][c].toUpperCase() !== answer[i].toUpperCase()) {
          allCorrect = false;
          newErrors.push(`${r}-${c}`);
        }
      }
    });

    if (allCorrect) {
      setFinished(true);
      onComplete(150);
    } else {
      setErrorCells(newErrors);
      alert("Vẫn còn " + newErrors.length + " ô chưa đúng. Sryun đã đánh dấu cho bạn nhé!");
    }
  };

  const revealWord = () => {
    if (!selectedClue || revealedWords.includes(selectedClue.number)) return;
    
    if (!confirm("Sử dụng 50 XP để Sryun tiết lộ từ này?")) return;

    // Deep copy grid
    const newGrid = userGrid.map(row => [...row]);
    const newHints = [...hintCells];
    
    const { row, col, direction, answer } = selectedClue;
    for (let i = 0; i < answer.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      newGrid[r][c] = answer[i].toUpperCase();
      
      // Lock revealed cells
      const cellKey = `${r}-${c}`;
      if (!newHints.includes(cellKey)) {
        newHints.push(cellKey);
      }
    }
    
    setUserGrid(newGrid);
    setHintCells(newHints);
    setRevealedWords(prev => [...prev, selectedClue.number]);
    onComplete(-50);
  };

  const isCellInSelectedClue = (r: number, c: number) => {
    if (!selectedClue) return false;
    const { row, col, direction, answer } = selectedClue;
    if (direction === 'across') {
      return r === row && c >= col && c < col + answer.length;
    } else {
      return c === col && r >= row && r < row + answer.length;
    }
  };

  const isCellActive = (r: number, c: number) => {
    if (!data) return false;
    return data.clues.some(clue => {
      const { row, col, direction, answer } = clue;
      if (direction === 'across') {
        return r === row && c >= col && c < col + answer.length;
      } else {
        return c === col && r >= row && r < row + answer.length;
      }
    });
  };

  const getCellNumbers = (r: number, c: number) => {
    if (!data) return [];
    return data.clues.filter(clue => clue.row === r && clue.col === c).map(clue => clue.number);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fadeIn text-white">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧩</div>
        </div>
        <h3 className="text-xl font-black">Sryun đang kiến tạo ô chữ...</h3>
        <p className="text-slate-400 text-sm mt-2">Đang liên kết các từ vựng và tạo gợi ý thông minh.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl text-center max-w-lg mx-auto border-4 border-indigo-500 animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer-sweep"></div>
        <div className="text-8xl mb-8 animate-bounce">🏆</div>
        <h2 className="text-4xl font-black text-slate-800 mb-2">QUÁ ĐỈNH!</h2>
        <p className="text-slate-500 font-bold mb-8 italic">"Kiến thức của bạn thực sự đáng nể."</p>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-200 mb-10">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Thành tựu đạt được</div>
          <div className="text-4xl font-black text-emerald-700">+150 XP</div>
        </div>
        <button 
          onClick={() => { setData(null); setTopic(''); setFinished(false); }}
          className="w-full py-6 bg-slate-900 hover:bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
        >
          Chơi màn tiếp theo
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto space-y-8 text-center animate-fadeIn">
        <div className="glass p-12 rounded-[4rem] border border-white/10 shadow-xl text-white">
          <div className="text-7xl mb-8 animate-floating">🧩</div>
          <h2 className="text-3xl font-black mb-3">Crossword</h2>
          <p className="text-slate-400 text-sm mb-12 font-medium leading-relaxed px-4">Nhập chủ đề bất kỳ. Sryun sẽ tạo ô chữ đan xen với một vài chữ cái gợi ý sẵn giúp bạn dễ dàng bắt đầu!</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Inventions', 'Environment', 'Music', 'Education'].map(t => (
              <button 
                key={t}
                onClick={() => startNewGame(t)}
                className="px-4 py-2 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-white/10"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Chủ đề bạn muốn..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && startNewGame()}
              className="w-full px-8 py-5 rounded-[2rem] glass border-2 border-transparent focus:border-indigo-500 transition-all text-center text-lg font-black text-white outline-none"
            />
          </div>
          
          <button
            onClick={() => startNewGame()}
            disabled={!topic.trim()}
            className="w-full py-5 bg-white text-slate-900 hover:bg-indigo-50 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 disabled:opacity-30"
          >
            Bắt đầu giải mã
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 animate-fadeIn pb-20">
      {/* Grid Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Added overflow-x-auto for mobile and increased padding */}
        <div className="w-full overflow-x-auto pb-8 flex justify-center custom-scrollbar">
          <div 
            className="glass p-8 rounded-[3rem] shadow-2xl border border-white/20 inline-block relative min-w-max"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${data.size}, minmax(0, 1fr))`,
              gap: '16px' // TĂNG KHOẢNG CÁCH LÊN 16PX
            }}
          >
            {userGrid.map((row, r) => 
              row.map((cell, c) => {
                const active = isCellActive(r, c);
                const cellNumbers = getCellNumbers(r, c);
                const isSelected = isCellInSelectedClue(r, c);
                const isError = errorCells.includes(`${r}-${c}`);
                const isHint = hintCells.includes(`${r}-${c}`);

                return (
                  <div key={`${r}-${c}`} className="relative w-12 h-12 sm:w-16 sm:h-16">
                    {active ? (
                      <>
                        {cellNumbers.length > 0 && (
                          <span className="absolute -top-1.5 -left-1.5 text-[9px] sm:text-[10px] font-black bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded-full z-20 pointer-events-none border border-white/10">
                            {cellNumbers.join('/')}
                          </span>
                        )}
                        {isHint && (
                          <span className="absolute top-1 right-1 text-[8px] opacity-60 z-10 pointer-events-none text-slate-400">🔒</span>
                        )}
                        <input
                          ref={(el) => { inputRefs.current[`${r}-${c}`] = el; }}
                          type="text"
                          value={cell}
                          readOnly={isHint}
                          onFocus={() => {
                            const clue = data.clues.find(clue => {
                              const { row, col, direction, answer } = clue;
                              if (direction === 'across') return r === row && c >= col && c < col + answer.length;
                              return c === col && r >= row && r < row + answer.length;
                            });
                            if (clue) setSelectedClue(clue);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, r, c)}
                          onChange={(e) => handleInputChange(r, c, e.target.value)}
                          className={`w-full h-full text-center font-black text-2xl sm:text-3xl rounded-xl border-2 transition-all uppercase outline-none shadow-inner ${
                            isHint 
                              ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-default' 
                              : isSelected 
                                ? 'bg-indigo-600 text-white border-indigo-400 z-10 ring-4 ring-indigo-500/30' // BỎ SCALE, THÊM RING
                                : 'bg-white text-slate-800 border-white hover:border-indigo-200'
                          } ${isError ? 'bg-rose-100 border-rose-500 text-rose-600 animate-shake-lite' : ''}`}
                        />
                      </>
                    ) : (
                      // Empty/Blocked cells are invisible
                      <div className="w-full h-full opacity-0"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="mt-6 flex gap-4 w-full max-w-md">
          <button
            onClick={checkGame}
            className="flex-1 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>✔️</span> Nộp bài
          </button>
          <button
            onClick={revealWord}
            disabled={!selectedClue || revealedWords.includes(selectedClue!.number)}
            className="px-8 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <span>💡</span> Tiết lộ
          </button>
        </div>
      </div>

      {/* Clues Area */}
      <div className="w-full lg:w-96 space-y-8">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">GỢI Ý Ô CHỮ</h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
               <span className="text-[9px] font-black text-slate-400 uppercase">Gợi ý sẵn (🔒)</span>
            </div>
          </div>
          
          <div className="space-y-10 custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Hàng ngang (Across)
              </h4>
              <div className="space-y-3">
                {data.clues.filter(c => c.direction === 'across').map(clue => (
                  <button
                    key={clue.number}
                    onClick={() => {
                      setSelectedClue(clue);
                      inputRefs.current[`${clue.row}-${clue.col}`]?.focus();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 group ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'across'
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-slate-50 bg-slate-50 hover:border-indigo-100'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'across'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-400 group-hover:text-indigo-600'
                    }`}>
                      {clue.number}
                    </span>
                    <p className={`text-sm font-bold leading-relaxed pt-1 ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'across'
                        ? 'text-indigo-900'
                        : 'text-slate-500'
                    }`}>
                      {clue.clue}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full"></span> Hàng dọc (Down)
              </h4>
              <div className="space-y-3">
                {data.clues.filter(c => c.direction === 'down').map(clue => (
                  <button
                    key={clue.number}
                    onClick={() => {
                      setSelectedClue(clue);
                      inputRefs.current[`${clue.row}-${clue.col}`]?.focus();
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 group ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'down'
                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                        : 'border-slate-50 bg-slate-50 hover:border-rose-100'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'down'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-slate-400 group-hover:text-rose-600'
                    }`}>
                      {clue.number}
                    </span>
                    <p className={`text-sm font-bold leading-relaxed pt-1 ${
                      selectedClue?.number === clue.number && selectedClue?.direction === 'down'
                        ? 'text-rose-900'
                        : 'text-slate-500'
                    }`}>
                      {clue.clue}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white">
          <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Lời khuyên từ Sryun 🤖</h5>
          <p className="text-xs leading-relaxed opacity-80 italic">"Sryun đã điền sẵn một vài chữ cái quan trọng. Hãy dùng chúng làm bàn đạp để đoán ra các từ còn lại nhé!"</p>
        </div>
      </div>
    </div>
  );
};

export default CrosswordGame;
