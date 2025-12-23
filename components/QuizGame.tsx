
import React, { useState } from 'react';
import { generateQuizQuestions } from '../services/gemini';
import { QuizQuestion } from '../types';

const QUICK_TOPICS = [
  { label: 'Family Life', emoji: '🏠' },
  { label: 'Environment', emoji: '🌱' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Technology', emoji: '💻' },
  { label: 'Inventions', emoji: '💡' },
  { label: 'Grammar U1-3', emoji: '📝' }
];

const QuizGame: React.FC<{ onComplete: (xp: number) => void, adminShowAnswer?: boolean }> = ({ onComplete, adminShowAnswer }) => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const startQuiz = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic;
    if (!finalTopic.trim()) return;
    
    setLoading(true);
    setTopic(finalTopic);
    const data = await generateQuizQuestions(finalTopic);
    
    if (data && data.length > 0) {
      setQuestions(data);
      setCurrentIdx(0);
      setScore(0);
      setFinished(false);
      setWrongAttempts(0);
    } else {
      alert("Sryun không tạo được câu hỏi lúc này, hãy thử lại nhé!");
    }
    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    const isCorrect = answer === questions[currentIdx].correctAnswer;
    
    if (isCorrect) {
      setSelectedAnswer(answer);
      setScore(s => s + 1);
      setWrongAttempts(0);
      proceedToNext();
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setSelectedAnswer(questions[currentIdx].correctAnswer);
        setWrongAttempts(0);
        proceedToNext(true);
      } else {
        setSelectedAnswer(answer);
        setTimeout(() => setSelectedAnswer(null), 600);
      }
    }
  };

  const proceedToNext = (isAIAssisted: boolean = false) => {
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(c => c + 1);
        setSelectedAnswer(null);
        setWrongAttempts(0);
      } else {
        setFinished(true);
        onComplete(score * 20);
      }
    }, isAIAssisted ? 2000 : 800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fadeIn text-white">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🚀</div>
        </div>
        <h3 className="text-xl font-black mb-2">Đang nạp năng lượng...</h3>
        <p className="text-slate-400 font-medium text-sm text-center px-4">Sryun đang bứt tốc tạo 10 thử thách cho bạn!</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="glass p-10 rounded-[3.5rem] shadow-xl text-center max-w-lg mx-auto border border-white/10 animate-fadeIn text-white">
        <div className="text-7xl mb-6">🏁</div>
        <h2 className="text-3xl font-black mb-2">Về Đích!</h2>
        <p className="text-slate-400 font-bold mb-6">Chủ đề: {topic}</p>
        <div className="glass p-6 rounded-3xl border border-white/5 mb-8">
          <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Kết quả của bạn</div>
          <div className="text-4xl font-black text-indigo-400">{score}/{questions.length}</div>
          <div className="text-emerald-400 font-black mt-2 text-sm">+{score * 20} XP nhận được</div>
        </div>
        <button 
          onClick={() => { setQuestions([]); setTopic(''); }}
          className="w-full py-5 bg-white text-slate-900 hover:bg-indigo-50 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          Tiếp tục thử thách mới
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-8 text-center animate-fadeIn">
        <div className="glass p-12 rounded-[3.5rem] border border-white/10 shadow-sm text-white">
          <div className="text-6xl mb-6">⚡</div>
          <h2 className="text-3xl font-black mb-3">Quiz Tốc Độ</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">Chọn chủ đề bên dưới hoặc tự nhập để Sryun tạo Quiz ngay lập tức!</p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {QUICK_TOPICS.map((item) => (
              <button
                key={item.label}
                onClick={() => startQuiz(item.label)}
                className="px-5 py-3 glass hover:bg-indigo-600/20 border border-white/10 rounded-2xl transition-all flex items-center gap-2 group"
              >
                <span className="text-lg group-hover:scale-125 transition-transform">{item.emoji}</span>
                <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Hoặc nhập chủ đề khác..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] glass border-2 border-transparent focus:border-indigo-500 transition-all text-center text-lg font-black text-white outline-none"
              onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
            />
          </div>
          
          <button
            onClick={() => startQuiz()}
            disabled={!topic.trim()}
            className="w-full py-5 bg-white text-slate-900 hover:bg-indigo-50 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Bắt đầu ngay
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn text-white">
      <div className="mb-8 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 glass rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 shadow-sm">
            {currentIdx + 1}
           </div>
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ bài Quiz</div>
        </div>
        <div className="flex items-center gap-4">
           {adminShowAnswer && (
             <div className="px-3 py-1 bg-rose-600 text-[9px] font-black rounded-full animate-pulse border border-rose-400">ADMIN MODE: {currentQ.correctAnswer}</div>
           )}
           <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-400">{score} Đúng</span>
              <div className="w-40 h-2 glass rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
           </div>
        </div>
      </div>

      <div className="glass p-10 rounded-[3rem] shadow-sm border border-white/10 mb-6 transition-all relative overflow-hidden">
        {wrongAttempts >= 4 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse"></div>
        )}
        
        <h3 className="text-xl font-bold leading-relaxed mb-12 text-center text-white">
          {currentQ.question}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQ.options.map((opt, i) => {
            let statusClass = "border-white/5 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10";
            if (selectedAnswer) {
              if (opt === currentQ.correctAnswer) statusClass = "border-emerald-500 bg-emerald-500/20 text-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]";
              else if (selectedAnswer === opt) statusClass = "border-rose-500 bg-rose-500/20 text-rose-400 animate-shake-lite";
              else statusClass = "opacity-40 grayscale border-white/5";
            } else if (adminShowAnswer && opt === currentQ.correctAnswer) {
              statusClass = "border-rose-500/50 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={`w-full p-6 rounded-3xl border-2 text-left font-bold transition-all flex items-center gap-4 group ${statusClass}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                  selectedAnswer && opt === currentQ.correctAnswer ? 'bg-emerald-500 text-white' : 'glass text-slate-400 group-hover:text-indigo-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedAnswer && (
        <div className="glass p-6 rounded-[2rem] border border-indigo-500/20 shadow-sm animate-fadeIn flex items-start gap-4">
          <div className="w-10 h-10 glass border border-indigo-500/30 rounded-full flex items-center justify-center text-lg shrink-0">💡</div>
          <div className="text-xs font-medium text-slate-300 leading-relaxed pt-1">
            <span className="font-black text-indigo-400 uppercase tracking-widest text-[10px] block mb-1">Giải thích từ Sryun:</span>
            {currentQ.explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
