
import React from 'react';
import { AppView } from '../types';

interface UnitHubProps {
  unitName: string;
  onSelectModule: (view: AppView) => void;
  onBack: () => void;
}

const UnitHub: React.FC<UnitHubProps> = ({ unitName, onSelectModule, onBack }) => {
  const modules = [
    { id: 'vocab', label: 'Từ Vựng', icon: '📖', color: 'text-indigo-400', border: 'border-indigo-500/20', desc: 'Học từ mới' },
    { id: 'grammar', label: 'Ngữ Pháp', icon: '⚖️', color: 'text-purple-400', border: 'border-purple-500/20', desc: 'Cấu trúc câu' },
    { id: 'listening', label: 'Nghe', icon: '🎧', color: 'text-emerald-400', border: 'border-emerald-500/20', desc: 'Nghe hiểu' },
    { id: 'reading', label: 'Đọc', icon: '📚', color: 'text-sky-400', border: 'border-sky-500/20', desc: 'Đọc văn bản' },
    { id: 'writing', label: 'Viết', icon: '✍️', color: 'text-amber-400', border: 'border-amber-500/20', desc: 'Chấm điểm AI' },
    { id: 'homework', label: 'Bài Tập', icon: '🏠', color: 'text-blue-400', border: 'border-blue-500/20', desc: 'Củng cố' },
    { id: 'unit-test', label: 'Kiểm Tra', icon: '🏆', color: 'text-rose-400', border: 'border-rose-500/20', desc: 'Mở khóa Unit' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn pb-24">
      {/* Modern Back Button */}
      <div className="flex flex-col gap-4">
        <button onClick={onBack} className="px-6 py-3 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2 w-fit">
          <span>←</span> Quay lại Lộ trình
        </button>
        
        <div className="flex items-center gap-4 px-2">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">{unitName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Skill Hub Center</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModule(m.id as AppView)}
            className={`glass-card p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] border transition-all text-left group relative overflow-hidden ${m.border}`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xl">↗</span>
            </div>
            <div className="text-3xl md:text-4xl mb-4 md:mb-8 group-hover:scale-125 transition-transform duration-500 inline-block">
              {m.icon}
            </div>
            <h3 className="font-black text-lg md:text-2xl text-white mb-1 tracking-tight">{m.label}</h3>
            <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white/70 transition-colors">{m.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default UnitHub;
