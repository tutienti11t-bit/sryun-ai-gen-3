
import React, { useState, useEffect } from 'react';
import { generateReadingExercise } from '../services/gemini';
import { AppView } from '../types';

const ReadingView: React.FC<{ initialTopic?: string, onComplete: (xp: number) => void, onNavigate?: (view: AppView) => void }> = ({ initialTopic = '', onComplete, onNavigate }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (initialTopic) handleStart();
  }, [initialTopic]);

  const handleStart = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const result = await generateReadingExercise(topic);
    setData(result);
    setUserAnswers(new Array(result?.questions?.length || 0).fill(''));
    setShowResult(false);
    setLoading(false);
  };

  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach((q: any, i: number) => {
      if (userAnswers[i] === q.correctAnswer) correct++;
    });
    return correct;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-indigo-400">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Sryun đang chuẩn bị...</p>
    </div>
  );

  if (!data) return (
    <div className="max-w-xl mx-auto glass p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] border border-white/10 text-center text-white">
      <div className="text-5xl md:text-6xl mb-6">📖</div>
      <h2 className="text-2xl md:text-3xl font-black mb-4">Đọc Hiểu</h2>
      <input 
        type="text" 
        placeholder="Chủ đề: Tourism, Inventions..." 
        value={topic} 
        onChange={e => setTopic(e.target.value)}
        className="w-full p-4 glass rounded-2xl border-none mb-6 text-center font-bold text-white outline-none"
      />
      <button onClick={handleStart} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-sm tracking-widest transition-all">Bắt đầu đọc</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-6 md:p-14 rounded-2xl md:rounded-[3.5rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-sky-400 mb-6 tracking-tight leading-tight">{data.title}</h2>
            <div className="text-slate-200 text-base md:text-lg leading-relaxed md:leading-[2.2rem] font-medium space-y-6 whitespace-pre-line">
              {data.content}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-2">Comprehension Check</h3>
          <div className="space-y-6">
            {data.questions.map((q: any, i: number) => (
              <div key={i} className="glass p-5 md:p-8 rounded-2xl md:rounded-[2.8rem] border border-white/10 shadow-sm">
                <div className="flex gap-4 mb-4 md:mb-6">
                  <span className="w-7 h-7 glass rounded-lg border border-sky-500/30 flex items-center justify-center font-black text-[10px] text-sky-400 shrink-0">{i + 1}</span>
                  <p className="font-bold text-slate-100 text-sm md:text-base">{q.question}</p>
                </div>
                <div className="grid gap-2 md:gap-3">
                  {q.options.map((opt: string) => {
                    let style = "glass border-white/5 text-slate-300 hover:bg-white/5";
                    if (userAnswers[i] === opt) style = "border-sky-500 bg-sky-500/20 text-sky-400";
                    if (showResult) {
                      if (opt === q.correctAnswer) style = "border-emerald-500 bg-emerald-500/20 text-emerald-400";
                      else if (userAnswers[i] === opt) style = "border-rose-500 bg-rose-500/20 text-rose-400";
                      else style = "opacity-30 grayscale border-white/5";
                    }
                    return (
                      <button key={opt} disabled={showResult} onClick={() => { const n = [...userAnswers]; n[i] = opt; setUserAnswers(n); }}
                        className={`w-full p-3 md:p-4.5 rounded-xl md:rounded-2xl text-left text-xs md:text-sm font-bold border-2 transition-all ${style}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!showResult ? (
            <button onClick={() => { setShowResult(true); onComplete(calculateScore() * 20); }}
              className="w-full py-5 md:py-6 bg-white text-slate-900 rounded-2xl md:rounded-[2rem] font-black uppercase text-sm md:text-lg shadow-2xl"
            >
              Submit Answers
            </button>
          ) : (
            <div className="glass p-8 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-sky-500/30 text-center space-y-4">
              <h4 className="text-3xl font-black text-white">Score: {calculateScore()}/{data.questions.length}</h4>
              <button onClick={() => { setData(null); setShowResult(false); }}
                className="w-full py-4 glass text-white rounded-2xl font-black uppercase text-xs"
              >
                Try Another Topic
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingView;
