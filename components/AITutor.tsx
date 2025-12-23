
import React, { useState, useRef, useEffect } from 'react';
import { getAITutorResponse } from '../services/gemini';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Chào bạn! Mình là Sryun AI. Hôm nay bạn muốn tìm hiểu về cấu trúc ngữ pháp hay từ vựng nào trong chương trình lớp 10 không? ✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getAITutorResponse(userMsg);
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 glass border border-indigo-500/30 rounded-full flex items-center justify-center text-3xl shadow-xl">🤖</div>
          <div>
            <h2 className="font-black text-white text-lg tracking-tight">Sryun AI Tutor</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Always Active</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] border transition-all ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white border-indigo-400/30 rounded-tr-none shadow-lg' 
                : 'glass text-slate-200 border-white/10 rounded-tl-none font-medium leading-relaxed'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="glass px-6 py-4 rounded-[2rem] rounded-tl-none flex gap-1.5 items-center border border-white/5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white/5 border-t border-white/5">
        <div className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ví dụ: Giải thích câu điều kiện loại 1..."
            className="flex-1 px-8 py-5 glass border border-white/10 rounded-[2rem] focus:border-indigo-500 focus:ring-0 outline-none text-white font-bold placeholder:text-slate-600 shadow-inner transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all disabled:opacity-30 shadow-xl active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-500 mt-4 font-black uppercase tracking-[0.2em] opacity-50">
          Sryun AI is an assistant. Cross-check facts for accuracy!
        </p>
      </div>
    </div>
  );
};

export default AITutor;
