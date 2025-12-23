
import React, { useState } from 'react';
import { generateSentencesForGame } from '../services/gemini';
import { speakWithAI } from '../services/audio';

const ListeningHero: React.FC<{ onComplete: (xp: number) => void, adminShowAnswer?: boolean }> = ({ onComplete, adminShowAnswer }) => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'reveal' | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Advanced Normalization
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, "")
      .replace(/['’]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const startNewGame = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const result = await generateSentencesForGame(topic);
    if (result.length > 0) {
      setData(result);
      setCurrentIdx(0);
      setWrongAttempts(0);
      setFeedback(null);
      setUserInput('');
    }
    setLoading(false);
  };

  const handleSpeak = async () => {
    if (!data[currentIdx]) return;
    setIsSpeaking(true);
    await speakWithAI(data[currentIdx].sentence);
    setIsSpeaking(false);
  };

  const checkAnswer = () => {
    if (!data[currentIdx]) return;

    const target = normalizeText(data[currentIdx].sentence);
    const input = normalizeText(userInput);

    if (target === input) {
      setFeedback('correct');
      setWrongAttempts(0);
      // KHÔNG gọi proceed() tự động nữa.
      // UI sẽ hiển thị nút "Câu tiếp theo".
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setFeedback('wrong');

      if (newAttempts >= 3) {
        setFeedback('reveal');
        setUserInput(data[currentIdx].sentence);
      } else {
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const proceed = () => {
    // Hàm này chỉ được gọi khi bấm nút "Câu tiếp theo"
    if (currentIdx + 1 < data.length) {
      setCurrentIdx(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
      setWrongAttempts(0);
    } else {
      setFinished(true);
      // Tính điểm: Nếu tự làm hết (không bị reveal nhiều) thì điểm cao
      onComplete(120); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-indigo-400">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Sryun đang chuẩn bị âm thanh...</p>
    </div>
  );

  if (finished) return (
    <div className="glass p-12 rounded-[3rem] shadow-2xl text-center border border-white/10 animate-fadeIn text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -mr-20 -mt-20"></div>
      <div className="relative z-10">
        <div className="text-8xl mb-6 animate-bounce">👂</div>
        <h2 className="text-3xl font-black mb-2 tracking-tight">Listening Hero!</h2>
        <p className="text-slate-400 mb-8 font-medium">Đôi tai của bạn thật đáng kinh ngạc.</p>
        <div className="glass bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl mb-10">
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Phần thưởng</div>
          <div className="text-4xl font-black text-white">+120 XP</div>
        </div>
        <button onClick={() => { setData([]); setTopic(''); setFinished(false); setCurrentIdx(0); }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">Chơi chủ đề khác</button>
      </div>
    </div>
  );

  if (data.length === 0) return (
    <div className="max-w-xl mx-auto glass p-10 rounded-[3rem] shadow-2xl border border-white/10 text-center animate-fadeIn text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      <div className="text-6xl mb-6 animate-float">🎧</div>
      <h2 className="text-3xl font-black mb-4">Listening Hero</h2>
      <p className="text-slate-400 text-sm mb-10 leading-relaxed">Luyện nghe siêu tốc! Nghe AI đọc và viết lại chính xác câu tiếng Anh. Đừng lo về dấu câu, hãy tập trung vào từ vựng.</p>
      <input type="text" placeholder="Chủ đề: Daily life, Music, Nature..." value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-5 glass rounded-[2rem] border border-white/10 focus:border-indigo-500 mb-6 text-center font-bold text-white outline-none placeholder:text-slate-600 transition-all focus:ring-2 focus:ring-indigo-500/20" />
      <button onClick={startNewGame} className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-xl active:scale-95">Bắt đầu nghe</button>
    </div>
  );

  const wordCount = data[currentIdx]?.sentence ? data[currentIdx].sentence.split(' ').length : 0;
  const isCorrect = feedback === 'correct';
  const isReveal = feedback === 'reveal';
  const isWrong = feedback === 'wrong';

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-white pb-20">
      {/* Main Card */}
      <div className={`glass p-10 rounded-[3.5rem] border shadow-2xl text-center transition-all duration-500 relative overflow-hidden ${
        isCorrect ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 
        isReveal ? 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 
        'border-white/10'
      }`}>
        
        {/* Header Info */}
        <div className="flex justify-between items-center mb-8 px-2">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest glass px-3 py-1 rounded-full border border-white/5">
             Câu {currentIdx + 1}/{data.length}
           </span>
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 glass px-3 py-1 rounded-full border border-indigo-500/20">
             📝 {wordCount} Words
           </span>
        </div>

        {/* Speaker Button */}
        <div className="mb-8 relative group inline-block">
          <div className={`absolute inset-0 bg-indigo-500/30 rounded-full blur-2xl transition-all duration-500 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-0 group-hover:opacity-50'}`}></div>
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking || isReveal} // Không cho nghe lại khi đã reveal đáp án để tập trung đọc
            className={`relative w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all active:scale-90 border-4 ${
              isSpeaking ? 'bg-indigo-600 border-indigo-400 text-white scale-110' : 
              isReveal ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' :
              'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-500/50 text-white hover:scale-105'
            }`}
          >
            {isSpeaking ? '🔊' : '▶️'}
          </button>
        </div>
        
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 animate-pulse">
          {isSpeaking ? 'Đang đọc...' : 'Bấm để nghe'}
        </p>

        {/* Hidden Admin Answer */}
        {adminShowAnswer && data[currentIdx] && (
          <div className="mb-4 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl inline-block">
             <p className="text-[9px] text-rose-400 font-black tracking-widest">{data[currentIdx].sentence}</p>
          </div>
        )}

        {/* Feedback Messages */}
        <div className="min-h-[24px] mb-4">
          {wrongAttempts > 0 && !isReveal && !isCorrect && (
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-shake-lite">
              ⚠️ Chưa chính xác (Sai {wrongAttempts}/3)
            </p>
          )}
          {isCorrect && (
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-bounce">
              🎉 Chính xác! Bạn nghe tốt lắm.
            </p>
          )}
        </div>

        {/* Reveal Box */}
        {isReveal && data[currentIdx] && (
          <div className="mb-8 p-6 glass bg-amber-500/10 rounded-2xl border border-amber-500/30 animate-fadeIn">
            <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Đáp án đúng là:</h5>
            <p className="text-lg font-bold text-white italic">"{data[currentIdx].sentence}"</p>
          </div>
        )}

        {/* Input Area */}
        <div className="relative mb-8 group">
          <input 
            type="text"
            value={userInput}
            readOnly={isCorrect || isReveal}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isCorrect && !isReveal && checkAnswer()}
            placeholder="Gõ lại câu bạn nghe được..."
            className={`w-full p-6 rounded-[2rem] border-2 text-center text-lg font-bold transition-all outline-none bg-black/20 backdrop-blur-md placeholder:text-slate-600 ${
              isCorrect ? 'border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
              isWrong ? 'border-rose-500 text-rose-400 animate-shake shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 
              isReveal ? 'border-amber-500/50 text-slate-400' :
              'border-white/10 text-white focus:border-indigo-500 focus:bg-black/40'
            }`}
          />
          {!isCorrect && !isReveal && (
             <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-slate-500 uppercase bg-black/50 px-2 py-1 rounded-md">Enter ↵</span>
             </div>
          )}
        </div>
        
        {/* Actions */}
        {isCorrect || isReveal ? (
          <button 
            onClick={proceed}
            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 animate-fadeIn ${
               isCorrect ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30' : 
               'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <span>Câu tiếp theo</span>
            <span>➡️</span>
          </button>
        ) : (
          <button 
            onClick={checkAnswer} 
            className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Kiểm tra
          </button>
        )}
      </div>
    </div>
  );
};

export default ListeningHero;
