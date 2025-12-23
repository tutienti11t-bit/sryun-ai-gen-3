
import React, { useEffect, useState } from 'react';
import { getRank } from '../types';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
  const rank = getRank(level);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMaxLevel = level === 100;

  useEffect(() => {
    setShowConfetti(true);
    
    // Màn hình rung mạnh chỉ một lần duy nhất lúc xuất hiện (Impact effect)
    const shakeClass = 'animate-shake-once';
    document.body.classList.add(shakeClass);
    
    const timer = setTimeout(() => {
      document.body.classList.remove(shakeClass);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fadeIn">
      {/* Confetti System */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(isMaxLevel ? 150 : 50)].map((_, i) => (
            <div 
              key={i} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                background: isMaxLevel 
                  ? ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'][Math.floor(Math.random() * 6)]
                  : ['#818cf8', '#c084fc', '#fb7185', '#facc15', '#4ade80'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                width: isMaxLevel ? `${Math.random() * 15 + 10}px` : `${Math.random() * 10 + 5}px`,
                height: isMaxLevel ? `${Math.random() * 15 + 10}px` : `${Math.random() * 10 + 5}px`,
                borderRadius: isMaxLevel ? '2px' : '50%'
              }}
            />
          ))}
        </div>
      )}

      <div className="relative w-full max-w-sm">
        {/* Glow Aura behind card */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[120px] opacity-70 animate-pulse ${
          isMaxLevel ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' : level >= 50 ? 'bg-rose-500' : 'bg-indigo-500'
        }`} />

        <div className={`relative bg-slate-900 border-2 rounded-[4rem] p-10 text-center shadow-[0_0_100px_rgba(0,0,0,1)] animate-epic-entry overflow-hidden ${
          isMaxLevel ? 'animate-rainbow-card scale-110' : 'border-white/20'
        }`}>
          {/* Card Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer-sweep" style={{ animationDuration: '2s' }}></div>
          
          <div className="relative z-10">
            <div className={`text-[10rem] mb-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-float`}>
              {rank.icon}
            </div>

            <div className="space-y-2 mb-8">
              <h2 className={`text-5xl font-black italic tracking-tighter ${isMaxLevel ? 'text-rainbow' : 'text-white'}`}>
                {isMaxLevel ? 'MAX LEVEL!' : 'LEVEL UP!'}
              </h2>
              <p className={`${isMaxLevel ? 'text-white' : 'text-emerald-400'} font-black tracking-[0.4em] text-[10px] uppercase opacity-80`}>
                {isMaxLevel ? 'YOU ARE THE SUPREME' : 'Promotion achieved'}
              </p>
            </div>

            <div className="relative inline-block mb-10">
               <div className={`absolute inset-0 blur-2xl opacity-30 animate-pulse ${isMaxLevel ? 'bg-white' : 'bg-indigo-500'}`}></div>
               <div className={`relative glass border px-10 py-5 rounded-3xl flex items-center gap-6 group ${isMaxLevel ? 'border-white' : 'border-white/10'}`}>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rank Status</p>
                    <h3 className={`text-2xl font-black italic tracking-tight ${rank.color}`}>
                      {rank.title}
                    </h3>
                  </div>
                  <div className="h-10 w-px bg-white/10"></div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tier</p>
                    <div className={`text-3xl font-black italic ${isMaxLevel ? 'text-rainbow' : 'text-indigo-400'}`}>
                      Lvl {level}
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={onClose}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 border-t border-white/20 ${
                  isMaxLevel ? 'bg-white text-black hover:bg-slate-100' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30'
                }`}
              >
                {isMaxLevel ? 'ETERNAL GLORY 💎' : 'Claim Rewards ⚡'}
              </button>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                {isMaxLevel ? 'You have reached the end of the journey' : 'Tap to continue your legacy'}
              </p>
            </div>
          </div>
        </div>

        {/* Level Number Floating Background */}
        <div className={`absolute -bottom-10 -right-10 text-[15rem] font-black italic select-none pointer-events-none -z-10 ${
          isMaxLevel ? 'text-white/10 animate-pulse' : 'text-white/5'
        }`}>
          {level}
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
