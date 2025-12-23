
import React, { useState, useEffect } from 'react';
import { generateHomework } from '../services/gemini';
import { HomeworkTask } from '../types';

interface HomeworkViewProps {
  unitName: string;
  onComplete: (xp: number) => void;
  adminShowAnswer?: boolean;
}

const HomeworkView: React.FC<HomeworkViewProps> = ({ unitName, onComplete, adminShowAnswer }) => {
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({});

  useEffect(() => {
    const fetchHomework = async () => {
      setLoading(true);
      const data = await generateHomework(unitName);
      setTasks(data.map((t: any) => ({ ...t, completed: false })));
      setLoading(false);
    };
    fetchHomework();
  }, [unitName]);

  const checkTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isCorrect = userAnswers[taskId]?.toLowerCase().trim() === task.correctAnswer.toLowerCase().trim();
    
    setFeedback(prev => ({ ...prev, [taskId]: isCorrect ? 'correct' : 'wrong' }));
    
    if (isCorrect) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      onComplete(50);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse text-indigo-400">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Sryun đang chuẩn bị bài tập...</p>
    </div>
  );

  const allCompleted = tasks.length > 0 && tasks.every(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn pb-32 text-white">
      <div className="glass p-12 rounded-[3.5rem] relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -mr-20 -mt-20"></div>
        <div className="relative z-10">
           <h2 className="text-4xl font-black mb-2 text-white tracking-tight">Thử Thách Về Nhà 🏠</h2>
           <p className="text-slate-400 font-medium">Nhiệm vụ cho: <b className="text-indigo-400">{unitName}</b></p>
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task, index) => (
          <div key={task.id} className={`glass p-10 rounded-[3rem] border transition-all ${
            task.completed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                   task.completed ? 'bg-emerald-500 text-white' : 'glass border border-indigo-500/30 text-indigo-400'
                 }`}>
                   {index + 1}
                 </span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {task.type === 'vocab' ? 'Từ vựng' : task.type === 'grammar' ? 'Ngữ pháp' : 'Dịch thuật'}
                 </span>
               </div>
               {task.completed && <span className="text-emerald-500 text-xl">✅</span>}
            </div>

            <h3 className="text-xl font-bold mb-8 leading-relaxed text-white">
              {task.question}
            </h3>

            {!task.completed ? (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={userAnswers[task.id] || ''}
                  onChange={(e) => setUserAnswers(prev => ({ ...prev, [task.id]: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && checkTask(task.id)}
                  placeholder={adminShowAnswer ? `Answer: ${task.correctAnswer}` : "Gõ câu trả lời của bạn..."}
                  className={`w-full px-8 py-5 glass border-2 rounded-[2rem] outline-none transition-all font-bold text-white placeholder:text-slate-600 ${
                    feedback[task.id] === 'wrong' ? 'border-rose-500 animate-shake-lite' : 'border-white/10 focus:border-indigo-500'
                  }`}
                />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold italic tracking-wide">💡 Gợi ý: {task.hint}</p>
                      {adminShowAnswer && (
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">ADMIN REVEAL: {task.correctAnswer}</p>
                      )}
                   </div>
                   <button 
                     onClick={() => checkTask(task.id)}
                     className="px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                   >
                     Kiểm tra
                   </button>
                </div>
              </div>
            ) : (
              <div className="glass p-5 rounded-2xl border border-emerald-500/30">
                <p className="text-sm font-bold text-emerald-400">Đáp án chính xác: <span className="text-white ml-2">{task.correctAnswer}</span></p>
              </div>
            )}
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="glass p-12 rounded-[4rem] text-center border-2 border-emerald-500/50 animate-float shadow-2xl">
           <div className="text-8xl mb-6">🏆</div>
           <h3 className="text-3xl font-black text-white mb-2 tracking-tighter">QUÁ TUYỆT VỜI!</h3>
           <p className="text-slate-400 font-bold mb-8 italic">"Bạn đã hoàn thành nhiệm vụ và nhận 150 XP thưởng!"</p>
           <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
           >
             Học tiếp thôi!
           </button>
        </div>
      )}
    </div>
  );
};

export default HomeworkView;
