
import React, { useState, useEffect } from 'react';
import { generateSentencesForGame } from '../services/gemini';

interface SentenceItem {
  sentence: string;
  meaning: string;
}

const SentenceBuilder: React.FC<{ onComplete: (xp: number) => void, adminShowAnswer?: boolean }> = ({ onComplete, adminShowAnswer }) => {
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<SentenceItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userWords, setUserWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'reveal' | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const startNewGame = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const result = await generateSentencesForGame(topic);
    if (result.length > 0) {
      setData(result);
      setupLevel(result[0]);
    }
    setLoading(false);
  };

  const setupLevel = (item: SentenceItem) => {
    const words = item.sentence.split(' ');
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setUserWords([]);
    setFeedback(null);
    setWrongAttempts(0);
  };

  const handleWordClick = (word: string, index: number) => {
    if (feedback === 'reveal') return;
    setUserWords(prev => [...prev, word]);
    setShuffledWords(prev => prev.filter((_, i) => i !== index));
  };

  const undoWord = (word: string, index: number) => {
    if (feedback === 'reveal') return;
    setShuffledWords(prev => [...prev, word]);
    setUserWords(prev => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    if (!data[currentIdx]) return;
    const currentSentence = data[currentIdx].sentence;
    if (userWords.join(' ') === currentSentence) {
      setFeedback('correct');
      setWrongAttempts(0);
      handleSuccess();
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setFeedback('wrong');
      
      if (newAttempts >= 5) {
        setFeedback('reveal');
        setUserWords(currentSentence.split(' '));
        setShuffledWords([]);
        setTimeout(() => handleSuccess(true), 3000);
      } else {
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const handleSuccess = (isAIAssisted: boolean = false) => {
    setTimeout(() => {
      if (currentIdx + 1 < data.length) {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        setupLevel(data[nextIdx]);
      } else {
        setFinished(true);
        onComplete(isAIAssisted ? 50 : 100);
      }
    }, isAIAssisted ? 3000 : 1000);
  };

  if (loading) return (
    <div className="flex flex-col items-center py-20 text-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-bold text-slate-400">Sryun đang trộn từ cho bạn...</p>
    </div>
  );

  if (finished) return (
    <div className="glass p-12 rounded-[3rem] shadow-sm text-center border border-white/10 animate-fadeIn text-white">
      <div className="text-6xl mb-4">🏗️</div>
      <h2 className="text-2xl font-black mb-2">Kiến trúc sư Ngôn ngữ!</h2>
      <p className="text-slate-400 mb-6">Bạn đã xây dựng xong tất cả các câu.</p>
      <div className="text-2xl font-black text-indigo-400 mb-8">+100 XP</div>
      <button onClick={() => { setData([]); setTopic(''); setFinished(false); setCurrentIdx(0); }} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all">Chơi tiếp chủ đề khác</button>
    </div>
  );

  if (data.length === 0) return (
    <div className="max-w-xl mx-auto glass p-10 rounded-[3rem] shadow-sm border border-white/10 text-center animate-fadeIn text-white">
      <div className="text-5xl mb-6">🏗️</div>
      <h2 className="text-2xl font-black mb-2">Sentence Builder</h2>
      <p className="text-slate-400 text-sm mb-8">Sắp xếp các từ thành câu hoàn chỉnh theo chủ đề thực tế!</p>
      <input type="text" placeholder="Chủ đề: Travel, Family, Tech..." value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-4 glass rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 mb-6 text-center font-bold text-white outline-none" />
      <button onClick={startNewGame} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-lg">Bắt đầu xây dựng</button>
    </div>
  );

  if (!data[currentIdx]) return <div className="text-center text-white py-20 animate-pulse">Loading data...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-white">
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Câu số {currentIdx + 1}/{data.length}</span>
        <h3 className="text-lg font-bold text-slate-200 mt-2">"{data[currentIdx].meaning}"</h3>
        {adminShowAnswer && (
          <div className="mt-3 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full inline-block">
             <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Target: {data[currentIdx].sentence}</span>
          </div>
        )}
      </div>

      <div className={`min-h-[120px] p-6 glass rounded-[2rem] border-2 border-dashed flex flex-wrap gap-2 items-center justify-center transition-all ${
        feedback === 'correct' ? 'border-emerald-500 bg-emerald-500/10' : 
        feedback === 'wrong' ? 'border-rose-500 bg-rose-500/10 animate-shake-lite' : 
        feedback === 'reveal' ? 'border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/10' : 
        'border-white/10'
      }`}>
        {userWords.length === 0 && <span className="text-slate-500 font-medium italic">Nhấn vào từ bên dưới để ghép câu...</span>}
        {userWords.map((w, i) => (
          <button 
            key={i} 
            onClick={() => undoWord(w, i)} 
            className={`px-4 py-2 rounded-xl shadow-sm font-bold transition-all ${
              feedback === 'reveal' ? 'bg-amber-100 text-amber-800' : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center py-4">
        {shuffledWords.map((w, i) => (
          <button key={i} onClick={() => handleWordClick(w, i)} className="px-4 py-3 glass border border-indigo-500/30 text-indigo-400 rounded-xl font-bold hover:bg-indigo-600 hover:text-white active:scale-95 transition-all shadow-sm">{w}</button>
        ))}
      </div>

      {shuffledWords.length === 0 && feedback !== 'reveal' && (
        <button onClick={checkAnswer} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95">Kiểm tra kết quả</button>
      )}
    </div>
  );
};

export default SentenceBuilder;
