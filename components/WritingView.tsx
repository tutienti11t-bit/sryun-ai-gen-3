
import React, { useState, useEffect } from 'react';
import { generateWritingPrompt, evaluateWriting } from '../services/gemini';
import { AppView } from '../types';

const WritingView: React.FC<{ initialTopic?: string, onComplete: (xp: number) => void, onNavigate?: (view: AppView) => void }> = ({ initialTopic = '', onComplete, onNavigate }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [prompt, setPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (initialTopic) getPrompt();
  }, [initialTopic]);

  const getPrompt = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const p = await generateWritingPrompt(topic);
    setPrompt(p);
    setResult(null);
    setUserInput('');
    setLoading(false);
  };

  const handleEvaluate = async () => {
    if (!userInput.trim()) return;
    setEvaluating(true);
    const evaluation = await evaluateWriting(prompt, userInput);
    setResult(evaluation);
    setEvaluating(false);
    if (evaluation?.score) onComplete(evaluation.score * 5);
  };

  const wordCount = userInput.split(/\s+/).filter(x => x).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Sryun đang chuẩn bị...</p>
    </div>
  );

  if (!prompt) return (
    <div className="max-w-xl mx-auto glass p-6 md:p-12 rounded-3xl md:rounded-[3rem] border border-white/10 text-center text-white">
      <div className="text-5xl md:text-6xl mb-6 animate-float">✍️</div>
      <h2 className="text-2xl md:text-3xl font-black mb-4">Viết Cùng Sryun</h2>
      <input 
        type="text" 
        placeholder="Chủ đề (ví dụ: Music, Environment...)" 
        value={topic} 
        onChange={e => setTopic(e.target.value)} 
        className="w-full p-4 md:p-6 bg-slate-900 rounded-2xl border-2 border-white/10 mb-6 text-center font-bold text-white outline-none text-lg" 
      />
      <button onClick={getPrompt} className="w-full py-4 md:py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest">Bắt đầu ngay</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-12 pb-24 md:pb-32">
      <div className="bg-slate-900 p-5 md:p-10 rounded-2xl md:rounded-[2.5rem] border-l-4 md:border-l-8 border-indigo-500 shadow-2xl">
        <h4 className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">ĐỀ BÀI:</h4>
        <p className="text-base md:text-2xl font-bold text-white italic">"{prompt}"</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Gõ bài viết của bạn tại đây..."
              className="w-full h-[300px] md:h-[600px] p-5 md:p-10 bg-black/40 text-white text-base md:text-xl outline-none resize-none leading-relaxed placeholder:text-slate-700"
            />
            <div className="p-4 md:p-6 bg-slate-800/50 flex justify-between items-center border-t border-white/5">
              <span className="text-[10px] md:text-sm font-black text-slate-400">
                Số từ: <span className="text-indigo-400">{wordCount}</span>
              </span>
              <button onClick={() => setPrompt('')} className="text-[10px] font-bold text-rose-400">Đổi đề</button>
            </div>
          </div>
          <button 
            onClick={handleEvaluate}
            disabled={evaluating || wordCount < 5}
            className="w-full py-5 md:py-8 bg-white text-slate-900 rounded-2xl md:rounded-[2rem] font-black uppercase text-sm md:text-lg shadow-2xl disabled:opacity-50"
          >
            {evaluating ? 'Đang chấm điểm...' : 'Nộp bài & Chấm điểm 🚀'}
          </button>
        </div>

        <div className="space-y-6 md:space-y-12">
          {result && (
            <div className="animate-fadeIn space-y-6 md:space-y-12">
              <div className="bg-indigo-600 p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between text-white gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[9px] font-black uppercase opacity-70">Điểm số AI</p>
                  <div className="text-5xl md:text-7xl font-black">{result.score}<span className="text-xl md:text-2xl opacity-50">/10</span></div>
                </div>
                <div className="md:max-w-[60%] text-center md:text-right md:border-l border-white/20 md:pl-6">
                   <p className="text-sm md:text-lg font-bold italic leading-relaxed">"{result.feedback}"</p>
                </div>
              </div>

              <div className="bg-slate-950 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-emerald-500/20 shadow-2xl">
                <h5 className="text-emerald-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-8 flex items-center gap-2">
                  ✨ Văn mẫu từ Sryun
                </h5>
                <div className="space-y-4 md:space-y-8">
                  {result.betterVersion.split('\n\n').map((p: string, i: number) => (
                    <p key={i} className="text-sm md:text-xl text-slate-100 leading-relaxed italic border-l-2 border-emerald-500/20 pl-4 md:pl-6">
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:space-y-10">
                <h5 className="text-rose-400 font-black uppercase tracking-widest text-[9px] px-2">
                  BẢN TIN SỬA LỖI ({result.corrections.length})
                </h5>
                {result.corrections.map((c: any, i: number) => (
                  <div key={i} className="bg-slate-900 rounded-2xl md:rounded-[3rem] border border-white/10 shadow-xl overflow-hidden">
                    <div className="bg-white/5 px-4 md:px-6 py-2 md:py-3 flex items-center gap-3 border-b border-white/5">
                      <div className="w-5 h-5 md:w-8 md:h-8 bg-rose-600 rounded-md md:rounded-lg flex items-center justify-center text-white font-black text-[10px]">
                        {i + 1}
                      </div>
                      <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Chi tiết</span>
                    </div>
                    <div className="p-5 md:p-10 space-y-4 md:space-y-8">
                      <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                        <p className="text-slate-400 text-sm md:text-xl line-through italic">"{c.error}"</p>
                      </div>
                      <div className="flex justify-center text-2xl md:text-4xl">➡️</div>
                      <div className="bg-emerald-500/10 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border-2 border-emerald-500/30">
                        <p className="text-emerald-400 text-base md:text-2xl font-black leading-snug">{c.fix}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WritingView;
