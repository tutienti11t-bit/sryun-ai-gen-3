
import React, { useState, useEffect } from 'react';
import { generateQuizQuestions } from '../services/gemini';
import { QuizQuestion } from '../types';

interface GatewayTestProps {
  unit: number;
  onSuccess: (score: number) => void;
  onBack: () => void;
}

const GatewayTest: React.FC<GatewayTestProps> = ({ unit, onSuccess, onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const data = await generateQuizQuestions(`Unit ${unit} tiếng Anh lớp 10 (cả từ vựng và ngữ pháp) - 10 questions`);
      setQuestions(data.slice(0, 10));
      setIsLoading(false);
    };
    fetchQuestions();
  }, [unit]);

  const handleAnswer = (ans: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(ans);
    
    // Tính điểm ngầm, kết quả chỉ hiện ra khi finished = true
    if (ans === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setFinished(true);
      }
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
           <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Sryun đang chuẩn bị 10 thử thách...</p>
      </div>
    );
  }

  if (finished) {
    const passed = score >= 5;
    let resultEmoji = '🎉';
    let resultTitle = 'Tuyệt vời!';
    let resultColor = 'text-emerald-600';
    let resultBg = 'bg-emerald-50';

    if (score === 10) {
      resultEmoji = '👑';
      resultTitle = 'Xuất sắc!';
      resultColor = 'text-purple-600';
      resultBg = 'bg-purple-50';
    } else if (score >= 7) {
      resultEmoji = '✅';
      resultTitle = 'Đạt yêu cầu!';
      resultColor = 'text-emerald-600';
      resultBg = 'bg-emerald-50';
    } else if (score >= 5) {
      resultEmoji = '⚠️';
      resultTitle = 'Đã đạt chuẩn!';
      resultColor = 'text-amber-600';
      resultBg = 'bg-amber-50';
    } else {
      resultEmoji = '📚';
      resultTitle = 'Cần ôn tập kỹ hơn!';
      resultColor = 'text-rose-600';
      resultBg = 'bg-rose-50';
    }

    return (
      <div className="max-w-xl mx-auto text-center animate-fadeIn bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
        <div className="text-7xl mb-6">{resultEmoji}</div>
        <h2 className={`text-3xl font-black mb-2 ${resultColor}`}>{resultTitle}</h2>
        <p className="text-slate-500 font-bold mb-8">Bạn đạt được {score}/10 câu đúng.</p>
        
        {passed ? (
          <div className="space-y-6">
            <div className={`p-4 ${resultBg} ${resultColor} rounded-2xl font-black text-sm uppercase tracking-widest border border-current opacity-50`}>
              Bạn đã mở khóa Unit tiếp theo!
            </div>
            <button 
              onClick={() => onSuccess(score)}
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              Xác nhận & Hoàn tất
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest border border-rose-200">
              Bạn cần đạt ít nhất 5/10 để qua môn nhé!
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              Làm lại bài kiểm tra
            </button>
            <button 
              onClick={onBack}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:underline"
            >
              Quay lại ôn tập Unit
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">
            {currentIdx + 1}
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Đang làm bài kiểm tra</h4>
            <p className="text-xs font-bold text-slate-600">Tiến độ: {currentIdx + 1}/10</p>
          </div>
        </div>
        <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 leading-relaxed mb-10">
          {currentQ?.question}
        </h3>

        <div className="grid gap-3">
          {currentQ?.options.map((opt, i) => {
            let statusClass = "border-slate-100 hover:border-indigo-200 hover:bg-slate-50";
            if (selectedAnswer) {
              if (opt === currentQ.correctAnswer) statusClass = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100";
              else if (selectedAnswer === opt) statusClass = "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100";
              else statusClass = "opacity-40 grayscale border-slate-100";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={`w-full p-5 rounded-2xl border-2 text-left font-bold transition-all text-sm flex items-center gap-4 ${statusClass}`}
              >
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-100">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GatewayTest;
