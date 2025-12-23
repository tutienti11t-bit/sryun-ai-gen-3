
import React, { useState } from 'react';
import { generateLessonPlan } from '../services/gemini';

const UNITS = [
  'Unit 1: Family Life', 'Unit 2: Environment', 'Unit 3: Music', 'Unit 4: Community', 
  'Unit 5: Inventions', 'Unit 6: Equality', 'Unit 7: International', 'Unit 8: Education',
  'Unit 9: Protection', 'Unit 10: Tourism', 'Unit 11: Career', 'Unit 12: Life'
];

const FOCUS_OPTIONS = [
  'Lesson 1: Getting Started',
  'Lesson 2: Language',
  'Lesson 3: Reading',
  'Lesson 4: Speaking',
  'Lesson 5: Listening',
  'Lesson 6: Writing',
  'Lesson 7: Communication and Culture / CLIL',
  'Lesson 8: Looking Back & Project'
];

type LanguageMode = 'en' | 'vi' | 'bilingual';

const LessonPlanView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]);
  const [duration, setDuration] = useState('45 minutes');
  const [langMode, setLangMode] = useState<LanguageMode>('bilingual');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateLessonPlan(topic, unit, duration, focus);
    setPlan(result);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!plan) return;
    
    let text = "";
    if (langMode === 'en' || langMode === 'bilingual') {
      text += `--- ENGLISH VERSION ---\n`;
      text += `LESSON PLAN: ${plan.title}\n`;
      text += `Focus: ${plan.focus}\n`;
      text += `Objectives: ${plan.objectives.join(', ')}\n`;
      text += `Procedure:\n${plan.procedure.map((p: any) => `- ${p.step} (${p.time}): ${p.activities}`).join('\n')}\n`;
      text += `Homework: ${plan.homework}\n\n`;
    }
    
    if (langMode === 'vi' || langMode === 'bilingual') {
      text += `--- BẢN TIẾNG VIỆT ---\n`;
      text += `GIÁO ÁN: ${plan.titleVi}\n`;
      text += `Trọng tâm: ${plan.focusVi}\n`;
      text += `Mục tiêu: ${plan.objectivesVi.join(', ')}\n`;
      text += `Tiến trình:\n${plan.procedure.map((p: any) => `- ${p.stepVi} (${p.time}): ${p.activitiesVi}`).join('\n')}\n`;
      text += `Bài tập: ${plan.homeworkVi}\n`;
    }

    navigator.clipboard.writeText(text.trim());
    alert('Đã sao chép giáo án vào bộ nhớ tạm!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn pb-32 text-white">
      <div className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 tracking-tight">Sryun Teacher's Desk 📁</h2>
          <p className="text-slate-400 font-medium">Soạn giáo án tiếng Anh lớp 10 chuyên nghiệp, đa ngôn ngữ.</p>
        </div>
      </div>

      {!plan && !loading && (
        <div className="glass p-10 rounded-[3rem] border border-white/10 space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Chủ đề bài học (Tùy chọn)</label>
              <input 
                type="text" 
                placeholder="Để trống nếu soạn theo Unit" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-6 py-4 glass border border-white/10 rounded-2xl focus:border-emerald-500 outline-none font-bold placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Thuộc Unit</label>
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-6 py-4 glass border border-white/10 rounded-2xl focus:border-emerald-500 outline-none font-bold appearance-none bg-slate-900"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Phần soạn bài (Lesson)</label>
              <select 
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full px-6 py-4 glass border border-white/10 rounded-2xl focus:border-emerald-500 outline-none font-bold appearance-none bg-slate-900"
              >
                {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Thời lượng tiết học</label>
            <div className="flex flex-wrap gap-4">
              {['45 minutes', '90 minutes', 'Extra class'].map(d => (
                <button 
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    duration === d ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'glass border-white/10 text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-50 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            🚀 SOẠN GIÁO ÁN SONG NGỮ
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-24 text-emerald-400">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="font-black uppercase tracking-widest text-[10px] animate-pulse text-center">
            Sryun đang biên dịch nội dung song ngữ...<br/>Vui lòng chờ trong giây lát.
          </p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4">
            <div className="flex glass p-1 rounded-2xl border border-white/10">
               {[
                 { id: 'bilingual', label: 'Song ngữ' },
                 { id: 'en', label: 'English' },
                 { id: 'vi', label: 'Tiếng Việt' }
               ].map(l => (
                 <button 
                  key={l.id}
                  onClick={() => setLangMode(l.id as LanguageMode)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    langMode === l.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                 >
                   {l.label}
                 </button>
               ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPlan(null)} className="px-6 py-3 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Soạn lại</button>
              <button onClick={copyToClipboard} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Sao chép</button>
            </div>
          </div>

          <div className="glass p-12 rounded-[4rem] border border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            
            <div className="space-y-4 border-b border-white/10 pb-8">
              {(langMode === 'en' || langMode === 'bilingual') && (
                <h1 className="text-4xl font-black tracking-tight text-white">{plan.title}</h1>
              )}
              {(langMode === 'vi' || langMode === 'bilingual') && (
                <h2 className={`text-2xl font-bold tracking-tight ${langMode === 'bilingual' ? 'text-slate-400 italic' : 'text-white'}`}>
                  {plan.titleVi}
                </h2>
              )}
              <div className="flex flex-wrap gap-4 pt-2">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px] glass px-3 py-1 rounded-full border border-emerald-500/20">{unit}</p>
                <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px] glass px-3 py-1 rounded-full border border-indigo-500/20">
                  {langMode === 'vi' ? plan.focusVi : plan.focus}
                </p>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] glass px-3 py-1 rounded-full border border-white/10">{duration}</p>
              </div>
            </div>

            <section className="space-y-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 
                {langMode === 'vi' ? 'Mục tiêu bài học' : 'Learning Objectives'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.objectives.map((obj: string, i: number) => (
                  <div key={i} className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                    {(langMode === 'en' || langMode === 'bilingual') && (
                      <p className="text-sm font-medium leading-relaxed">🎯 {obj}</p>
                    )}
                    {(langMode === 'vi' || langMode === 'bilingual') && (
                      <p className={`text-sm ${langMode === 'bilingual' ? 'text-slate-400 italic border-t border-white/5 pt-2' : 'font-medium'}`}>
                        🇻🇳 {plan.objectivesVi[i]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 
                {langMode === 'vi' ? 'Tiến trình giảng dạy' : 'Teaching Procedure'}
              </h3>
              <div className="space-y-6">
                {plan.procedure.map((p: any, i: number) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 glass border border-emerald-500/30 rounded-full flex items-center justify-center font-black text-[10px] text-emerald-400 shrink-0">
                         {p.time}
                       </div>
                       <div className="w-0.5 h-full bg-white/5 group-last:hidden"></div>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex-1 hover:border-emerald-500/30 transition-all space-y-4">
                       <div>
                         <h4 className="font-black text-white text-lg">
                           {langMode === 'vi' ? p.stepVi : p.step}
                           {langMode === 'bilingual' && <span className="text-slate-500 font-bold ml-2">({p.step})</span>}
                         </h4>
                         <p className="text-slate-400 text-[11px] leading-relaxed mt-1 italic font-bold">
                           🎯 {langMode === 'vi' ? p.purposeVi : p.purpose}
                           {langMode === 'bilingual' && <span className="block opacity-60 text-[9px] mt-1 font-medium">{p.purpose}</span>}
                         </p>
                       </div>
                       
                       <div className="p-5 glass rounded-2xl border border-white/5 bg-white/[0.02]">
                         {(langMode === 'en' || langMode === 'bilingual') && (
                           <p className="text-slate-200 text-sm leading-relaxed font-medium">{p.activities}</p>
                         )}
                         {(langMode === 'vi' || langMode === 'bilingual') && (
                           <p className={`text-sm leading-relaxed ${langMode === 'bilingual' ? 'text-slate-400 italic border-t border-white/5 mt-3 pt-3' : 'text-slate-200 font-medium'}`}>
                             {p.activitiesVi}
                           </p>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                {langMode === 'vi' ? 'Bài tập về nhà:' : 'Homework Assigned:'}
              </h4>
              <div className="space-y-2">
                {(langMode === 'en' || langMode === 'bilingual') && (
                  <p className="text-slate-200 text-sm font-bold">"{plan.homework}"</p>
                )}
                {(langMode === 'vi' || langMode === 'bilingual') && (
                  <p className={`text-sm ${langMode === 'bilingual' ? 'text-slate-400 italic border-t border-amber-500/10 pt-2' : 'text-slate-200 font-bold'}`}>
                    "{plan.homeworkVi}"
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanView;
