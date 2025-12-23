
import React from 'react';

const CATEGORIES = [
  'Unit 1: Family Life', 'Unit 2: Environment', 'Unit 3: Music', 'Unit 4: Community', 
  'Unit 5: Inventions', 'Unit 6: Equality', 'Unit 7: International', 'Unit 8: Education',
  'Unit 9: Protection', 'Unit 10: Tourism', 'Unit 11: Career', 'Unit 12: Life'
];

interface UnitSelectionProps {
  unlockedUnits: number;
  unitScores?: Record<number, number>;
  onSelect: (unitName: string) => void;
  onBack: () => void;
}

const UnitSelection: React.FC<UnitSelectionProps> = ({ unlockedUnits, unitScores = {}, onSelect, onBack }) => {
  return (
    <div className="space-y-8 md:space-y-12 animate-fadeIn pb-20">
      {/* Modern Back Button */}
      <button onClick={onBack} className="px-6 py-3 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2 w-fit">
        <span>←</span> Quay lại Trang chủ
      </button>

      <div className="text-center px-4">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 md:mb-4">Lộ trình Unit 🚀</h2>
        <p className="text-slate-400 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed">Mỗi Unit là một chặng đường mới. Hoàn thành bài kiểm tra để mở khóa bài tiếp theo!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {CATEGORIES.map((cat, index) => {
          const unitNum = index + 1;
          const isLocked = unitNum > unlockedUnits;
          const score = unitScores[unitNum];
          const hasAttempted = score !== undefined;

          return (
            <button
              key={cat}
              disabled={isLocked}
              onClick={() => onSelect(cat)}
              className={`glass-card p-6 md:p-10 rounded-2xl md:rounded-[3.5rem] text-left relative overflow-hidden group border border-white/5 ${
                isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer active:scale-95 hover:border-white/20'
              }`}
            >
              {hasAttempted && (
                <div className={`absolute top-4 right-4 md:top-8 md:right-8 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest glass border ${
                  score >= 8 ? 'text-emerald-400 border-emerald-400/30' : 
                  score >= 5 ? 'text-amber-400 border-amber-400/30' : 'text-rose-400 border-rose-400/30'
                }`}>
                  {score}/10
                </div>
              )}

              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center text-xl md:text-2xl mb-6 md:mb-8 shadow-2xl transition-all duration-500 group-hover:scale-110 ${
                isLocked ? 'bg-white/5 text-slate-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              }`}>
                {isLocked ? '🔒' : unitNum}
              </div>
              
              <h3 className="font-black text-lg md:text-2xl text-white mb-2 md:mb-3 tracking-tight">{cat}</h3>
              
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isLocked ? 'bg-slate-700' : hasAttempted && score >= 5 ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`}></span>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">
                  {isLocked ? 'Locked' : hasAttempted ? 'Completed' : 'Available'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnitSelection;
