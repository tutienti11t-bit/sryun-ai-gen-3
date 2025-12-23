
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import AITutor from './components/AITutor';
import VocabTheme from './components/VocabTheme';
import GrammarView from './components/GrammarView';
import GatewayTest from './components/GatewayTest';
import QuizGame from './components/QuizGame';
import CrosswordGame from './components/CrosswordGame';
import SentenceBuilder from './components/SentenceBuilder';
import ListeningHero from './components/ListeningHero';
import ListeningView from './components/ListeningView';
import WritingView from './components/WritingView';
import ReadingView from './components/ReadingView';
import HomeworkView from './components/HomeworkView';
import LevelUpModal from './components/LevelUpModal';
import UnitSelection from './components/UnitSelection';
import UnitHub from './components/UnitHub';
import LessonPlanView from './components/LessonPlanView';
import SyllabusSolver from './components/SyllabusSolver'; // Imported
import { AppView, UserProfile, getRank } from './types';
import { validateNameAppropriateness } from './services/gemini';

const XP_PER_LEVEL = 200; 
const MAX_LEVEL = 100;
const MAX_SKILL_POINTS = 1000; // Points required for 100% mastery

const getStreakInfo = (streak: number) => {
  if (streak >= 365) return { icon: '☀️', color: 'from-orange-500 via-yellow-400 to-red-500', title: 'SOLAR GOD', bg: 'bg-white/10' };
  if (streak >= 100) return { icon: '🌈', color: 'from-indigo-500 via-purple-500 to-pink-500', title: 'TIME BENDER', bg: 'bg-indigo-900/40' };
  if (streak >= 50) return { icon: '🏮', color: 'from-rose-500 to-orange-500', title: 'FLAME MASTER', bg: 'bg-rose-900/40' };
  if (streak >= 10) return { icon: '🔮', color: 'from-purple-500 to-indigo-600', title: 'WIZARD', bg: 'bg-purple-900/40' };
  return { icon: '🔥', color: 'from-orange-500 to-yellow-500', title: 'STREAKING', bg: 'bg-white/5' };
};

const StreakCelebration: React.FC<{ streak: number, onClose: () => void }> = ({ streak, onClose }) => {
  const info = getStreakInfo(streak);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ animation: `hyperspace ${2 + i * 0.2}s linear infinite`, animationDelay: `-${i * 0.1}s` }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg animate-epic-entry">
        <div className={`p-1 bg-gradient-to-b ${info.color} rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]`}>
          <div className="bg-slate-900 rounded-[3.8rem] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <div className="relative mb-8">
              <div className="text-[12rem] leading-none mb-4 animate-float drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                {info.icon}
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black opacity-10 text-white pointer-events-none italic select-none">
                {streak}
              </div>
            </div>

            <h2 className="text-5xl font-black text-white mb-2 tracking-tighter animate-glitch">
              UNSTOPPABLE!
            </h2>
            <p className="text-indigo-400 font-black tracking-[0.3em] text-xs mb-10 uppercase italic">
              {info.title} ARCHIEVED
            </p>

            <div className="glass p-10 rounded-[2.5rem] border border-white/10 mb-10 relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-[9px] font-black text-slate-900 uppercase">
                Active Streak
              </div>
              <div className={`text-8xl font-black bg-gradient-to-br ${info.color} bg-clip-text text-transparent italic`}>
                {streak}
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Days of Excellence</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-6 bg-white hover:bg-indigo-50 text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-4"
            >
              KEEP GOING ⚡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [selectedUnitCat, setSelectedUnitCat] = useState('Unit 1: Family Life');
  const [gameType, setGameType] = useState<'selection' | 'quiz' | 'crossword' | 'builder' | 'listening'>('selection');
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unitScores, setUnitScores] = useState<Record<number, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    name: 'Học sinh lớp 10',
    level: 1,
    xp: 0,
    badges: ['Học giả nhí'],
    streak: 0,
    unlockedUnits: 3,
    skills: { vocab: 0, grammar: 0, listening: 0, writing: 0 }
  });

  useEffect(() => {
    const savedXP = localStorage.getItem('sryun_xp');
    const savedUnlocked = localStorage.getItem('sryun_unlocked_units');
    const savedName = localStorage.getItem('sryun_name');
    const savedAvatar = localStorage.getItem('sryun_avatar');
    const savedStreak = localStorage.getItem('sryun_streak');
    const savedLastLogin = localStorage.getItem('sryun_last_login');
    const savedScores = localStorage.getItem('sryun_unit_scores');
    const savedBadges = localStorage.getItem('sryun_badges');
    const savedSkills = localStorage.getItem('sryun_skills');

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    let currentStreak = savedStreak ? parseInt(savedStreak) : 0;
    
    if (savedLastLogin) {
      const lastLogin = new Date(savedLastLogin);
      const diffTime = now.getTime() - lastLogin.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) currentStreak += 1;
      else if (diffDays > 1) currentStreak = 1;
      else if (diffDays === 0 && currentStreak === 0) currentStreak = 1;
    } else {
      currentStreak = 1;
    }

    localStorage.setItem('sryun_streak', currentStreak.toString());
    localStorage.setItem('sryun_last_login', todayStr);

    let currentXP = savedXP ? parseInt(savedXP) : 0;
    let currentUnlocked = savedUnlocked ? parseInt(savedUnlocked) : 3;
    let currentBadges = savedBadges ? JSON.parse(savedBadges) : ['Học giả nhí'];
    let currentSkills = savedSkills ? JSON.parse(savedSkills) : { vocab: 0, grammar: 0, listening: 0, writing: 0 };
    
    if (savedScores) {
      try {
        setUnitScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }

    const calculatedLevel = Math.min(MAX_LEVEL, Math.floor(currentXP / XP_PER_LEVEL) + 1);

    setUser(prev => ({ 
      ...prev, 
      name: savedName || prev.name,
      avatar: savedAvatar || undefined,
      xp: currentXP, 
      streak: currentStreak,
      unlockedUnits: currentUnlocked, 
      badges: currentBadges,
      level: calculatedLevel,
      skills: currentSkills
    }));
  }, []);

  const handleXPChange = (amount: number) => {
    setUser(prev => {
      const newXP = Math.max(0, prev.xp + amount);
      let newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      newLevel = Math.min(MAX_LEVEL, newLevel);
      
      let newBadges = [...prev.badges];
      
      localStorage.setItem('sryun_xp', newXP.toString());
      
      if (newLevel > prev.level) {
        setShowLevelUp(true);
        if (newLevel === MAX_LEVEL && !newBadges.includes('Học bá')) {
          newBadges.push('Học bá');
          localStorage.setItem('sryun_badges', JSON.stringify(newBadges));
        }
      }
      
      return { ...prev, xp: newXP, level: newLevel, badges: newBadges };
    });
  };

  const handleSkillUpdate = (type: 'vocab' | 'grammar' | 'listening' | 'writing', amount: number) => {
    setUser(prev => {
      const newSkills = { ...prev.skills, [type]: Math.min(MAX_SKILL_POINTS, prev.skills[type] + amount) };
      localStorage.setItem('sryun_skills', JSON.stringify(newSkills));
      return { ...prev, skills: newSkills };
    });
  };

  const handleStreakChange = (amount: number) => {
    setUser(prev => {
      const newStreak = Math.max(0, prev.streak + amount);
      localStorage.setItem('sryun_streak', newStreak.toString());
      
      const milestones = [3, 5, 10, 25, 50, 100, 200, 300, 365];
      if (milestones.includes(newStreak)) {
        setShowStreakMilestone(true);
      }

      return { ...prev, streak: newStreak };
    });
  };

  const handleProfileUpdate = async () => {
    if (!tempName.trim()) return;
    setIsValidating(true);
    setNameFeedback({ type: null, message: '' });
    
    const isValid = await validateNameAppropriateness(tempName);
    if (isValid) {
      setUser(prev => ({ ...prev, name: tempName }));
      localStorage.setItem('sryun_name', tempName);
      setNameFeedback({ type: 'success', message: '✨ Đổi tên thành công' });
      
      setTimeout(() => {
        setIsEditing(false);
        setNameFeedback({ type: null, message: '' });
      }, 2000);
    } else {
      setNameFeedback({ type: 'error', message: '⚠️ Tên chứa từ ngữ không phù hợp' });
    }
    setIsValidating(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUser(prev => ({ ...prev, avatar: base64String }));
        localStorage.setItem('sryun_avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnitUnlock = (score: number) => {
    const currentUnitNum = parseInt(selectedUnitCat.match(/\d+/)?.[0] || "1");
    const newScores = { ...unitScores, [currentUnitNum]: score };
    setUnitScores(newScores);
    localStorage.setItem('sryun_unit_scores', JSON.stringify(newScores));

    if (score >= 5 && currentUnitNum === user.unlockedUnits) {
      const nextUnlocked = user.unlockedUnits + 1;
      setUser(prev => ({ ...prev, unlockedUnits: nextUnlocked }));
      localStorage.setItem('sryun_unlocked_units', nextUnlocked.toString());
    }
    
    // Reward Skill Points for Passing the Unit
    handleSkillUpdate('vocab', score * 3);
    handleSkillUpdate('grammar', score * 3);
    
    setView('units');
    handleXPChange(score * 10);
  };

  const userRank = getRank(user.level);
  const currentLevelXP = user.xp % XP_PER_LEVEL;
  const progressPercent = user.level === MAX_LEVEL ? 100 : (currentLevelXP / XP_PER_LEVEL) * 100;

  const calculateSkillPercent = (points: number) => Math.min(100, Math.floor((points / MAX_SKILL_POINTS) * 100));

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="space-y-10 animate-fadeIn">
            {/* Bento Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-2 glass p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-center border border-white/10`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[120px] -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-[2.5rem] border-4 glass flex items-center justify-center p-1 transition-all duration-500 ${userRank.aura}`}>
                      <div className="w-full h-full rounded-[2.1rem] overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">🎓</div>}
                      </div>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                      {userRank.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-4xl font-black mb-2 ${user.level === 100 ? 'text-rainbow' : 'text-white'}`}>
                      Hey, {user.name.split(' ').slice(-1)[0]}! 👋
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-5 py-2 glass rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 ${userRank.color}`}>
                        {userRank.title}
                      </span>
                      <span className="text-slate-400 font-bold text-sm">Level {user.level} {user.level === MAX_LEVEL && ' (MAX)'}</span>
                    </div>
                    <div className="mt-8 w-full md:w-80">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                        <span>XP Progress</span>
                        <span>{user.level === MAX_LEVEL ? '100%' : `${currentLevelXP}/${XP_PER_LEVEL}`}</span>
                      </div>
                      <div className="h-4 glass rounded-full overflow-hidden p-1 border border-white/5">
                        <div className={`h-full rounded-full transition-all duration-1000 ${user.level === 100 ? 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-rainbow-bg' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'}`} style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-rows-2 gap-6">
                <div className="glass p-8 rounded-[2.5rem] flex items-center justify-between border border-white/10 group">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Streak</p>
                    <div className="text-4xl font-black text-white">{user.streak} Days</div>
                  </div>
                  <div className="text-5xl group-hover:scale-125 transition-transform">🔥</div>
                </div>
                <div className="glass p-8 rounded-[2.5rem] flex items-center justify-between border border-white/10 group">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total XP</p>
                    <div className="text-4xl font-black text-white">{user.xp}</div>
                  </div>
                  <div className="text-5xl group-hover:scale-125 transition-transform">⭐</div>
                </div>
              </div>
            </div>

            {/* Content Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <button onClick={() => setView('units')} className="glass-card p-10 rounded-[3.5rem] text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">🎯</div>
                  <h3 className="text-2xl font-black text-white mb-2">Lộ trình Unit</h3>
                  <p className="text-slate-400 text-sm font-medium">Bám sát chương trình SGK lớp 10 mới nhất.</p>
               </button>
               <button onClick={() => setView('syllabus-solver')} className="glass-card p-10 rounded-[3.5rem] text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">⚡</div>
                  <h3 className="text-2xl font-black text-white mb-2">Giải Đề Cương</h3>
                  <p className="text-slate-400 text-sm font-medium">Tải ảnh đề cương, AI giải chi tiết ngay.</p>
               </button>
               <button onClick={() => setView('lesson-plan')} className="glass-card p-10 rounded-[3.5rem] text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">📁</div>
                  <h3 className="text-2xl font-black text-white mb-2">Soạn Giáo Án</h3>
                  <p className="text-slate-400 text-sm font-medium">Công cụ hỗ trợ giáo viên soạn bài chuyên nghiệp.</p>
               </button>
               <button onClick={() => setView('ai-tutor')} className="glass-card p-10 rounded-[3.5rem] text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-transparent"></div>
                  <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">🤖</div>
                  <h3 className="text-2xl font-black text-white mb-2">Sryun AI Tutor</h3>
                  <p className="text-slate-400 text-sm font-medium">Giải đáp mọi thắc mắc 24/7 tức thì.</p>
               </button>
            </div>
          </div>
        );
      case 'units':
        return <UnitSelection unlockedUnits={user.unlockedUnits} unitScores={unitScores} onSelect={(unit) => { setSelectedUnitCat(unit); setView('unit-hub'); }} onBack={() => setView('home')} />;
      case 'unit-hub':
        return <UnitHub unitName={selectedUnitCat} onSelectModule={(v) => setView(v)} onBack={() => setView('units')} />;
      case 'vocab': 
        return <VocabTheme 
          unlockedUnits={user.unlockedUnits} 
          selectedUnit={selectedUnitCat} 
          setSelectedUnit={setSelectedUnitCat} 
          onNext={() => { 
            handleSkillUpdate('vocab', 15); 
            setView('unit-hub'); 
          }} 
          onBack={() => setView('unit-hub')} 
        />;
      case 'grammar': 
        return <GrammarView 
          unit={parseInt(selectedUnitCat.match(/\d+/)?.[0] || "1")} 
          onNext={() => {
            handleSkillUpdate('grammar', 15);
            setView('unit-hub');
          }} 
          onBack={() => setView('unit-hub')} 
        />;
      case 'unit-test': 
        return <GatewayTest unit={parseInt(selectedUnitCat.match(/\d+/)?.[0] || "1")} onSuccess={handleUnitUnlock} onBack={() => setView('unit-hub')} />;
      case 'listening': 
        return (
          <div className="animate-fadeIn">
            <button onClick={() => setView('unit-hub')} className="mb-8 px-6 py-3 glass rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">← Quay lại Unit</button>
            <ListeningView 
              initialTopic={selectedUnitCat} 
              onComplete={(xp) => { 
                handleXPChange(xp); 
                handleSkillUpdate('listening', 20); 
              }} 
              onNavigate={setView} 
            />
          </div>
        );
      case 'reading': 
        return (
          <div className="animate-fadeIn">
            <button onClick={() => setView('unit-hub')} className="mb-8 px-6 py-3 glass rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">← Quay lại Unit</button>
            <ReadingView initialTopic={selectedUnitCat} onComplete={handleXPChange} onNavigate={setView} />
          </div>
        );
      case 'writing': 
        return (
          <div className="animate-fadeIn">
            <button onClick={() => setView('unit-hub')} className="mb-8 px-6 py-3 glass rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">← Quay lại Unit</button>
            <WritingView 
              initialTopic={selectedUnitCat} 
              onComplete={(xp) => {
                handleXPChange(xp);
                handleSkillUpdate('writing', 25); 
              }} 
              onNavigate={setView} 
            />
          </div>
        );
      case 'homework':
        return <HomeworkView unitName={selectedUnitCat} onComplete={handleXPChange} />;
      case 'lesson-plan':
        return <LessonPlanView />;
      case 'syllabus-solver':
        return <SyllabusSolver />; 
      case 'ai-tutor': return <AITutor />;
      case 'games':
        if (gameType === 'selection') return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fadeIn">
            {[
              { id: 'quiz', icon: '📝', label: 'Trắc nghiệm' },
              { id: 'crossword', icon: '🧩', label: 'Ô chữ AI' },
              { id: 'builder', icon: '🏗️', label: 'Sắp xếp câu' },
              { id: 'listening', icon: '👂', label: 'Listening Hero' }
            ].map(g => (
              <button 
                key={g.id} 
                onClick={() => setGameType(g.id as any)} 
                className="glass-card p-12 rounded-[4rem] text-center flex flex-col items-center gap-6 group"
              >
                <span className="text-7xl group-hover:scale-125 transition-transform duration-500">{g.icon}</span>
                <span className="font-black text-white uppercase tracking-[0.3em] text-sm">{g.label}</span>
              </button>
            ))}
          </div>
        );
        return (
          <div className="animate-fadeIn">
            <button onClick={() => setGameType('selection')} className="mb-8 px-6 py-3 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white">← Quay lại</button>
            {gameType === 'quiz' && <QuizGame onComplete={handleXPChange} />}
            {gameType === 'crossword' && <CrosswordGame onComplete={handleXPChange} />}
            {gameType === 'builder' && <SentenceBuilder onComplete={handleXPChange} />}
            {gameType === 'listening' && <ListeningHero onComplete={(xp) => { handleXPChange(xp); handleSkillUpdate('listening', 15); }} />}
          </div>
        );
      case 'profile':
        return (
          <div className="animate-fadeIn pb-32">
            <div className="bento-grid">
              {/* Box 1: Profile Header (Large) */}
              <div className="md:col-span-3 glass-card p-10 rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] -mr-40 -mt-40"></div>
                <div className="relative group">
                  <div className={`w-40 h-40 rounded-[3rem] border-4 glass flex items-center justify-center p-1 transition-all group-hover:rotate-3 ${userRank.aura}`} onClick={() => fileInputRef.current?.click()}>
                    <div className="w-full h-full rounded-[2.8rem] overflow-hidden">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="text-7xl">🎓</div>}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-[2.8rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Đổi ảnh</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>

                <div className="flex-1 space-y-4">
                   {isEditing ? (
                     <div className="space-y-4 max-w-sm">
                       <input 
                         type="text" 
                         value={tempName} 
                         onChange={(e) => setTempName(e.target.value)} 
                         className="w-full px-6 py-4 glass border border-white/20 rounded-2xl text-xl font-black text-white focus:border-indigo-500 outline-none" 
                         autoFocus 
                       />
                       <div className="flex gap-2">
                         <button onClick={handleProfileUpdate} disabled={isValidating} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">{isValidating ? '...' : 'Lưu'}</button>
                         <button onClick={() => setIsEditing(false)} className="px-4 py-3 glass text-white rounded-xl font-black uppercase text-[10px] tracking-widest">Hủy</button>
                       </div>
                       {nameFeedback.message && (
                         <p className={`text-[10px] font-bold ${nameFeedback.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>{nameFeedback.message}</p>
                       )}
                     </div>
                   ) : (
                     <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <h2 className={`text-4xl font-black tracking-tighter ${user.level === 100 ? 'text-rainbow' : 'text-white'}`}>{user.name}</h2>
                         <button onClick={() => { setTempName(user.name); setIsEditing(true); }} className="p-2 glass rounded-full hover:bg-white/10 transition-colors">✏️</button>
                       </div>
                       <div className="flex flex-wrap items-center gap-2">
                         <span className={`px-4 py-1.5 glass rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${userRank.color}`}>{userRank.title}</span>
                         <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Level {user.level}</span>
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Box 2: XP Hub (Small Square) */}
              <div className="glass-card p-8 rounded-[3rem] flex flex-col justify-between border border-white/10 relative group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-3xl"></div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">XP Progress</p>
                   <div className="text-4xl font-black text-white tracking-tighter">{currentLevelXP} <span className="text-xs text-slate-500">/ {XP_PER_LEVEL}</span></div>
                </div>
                <div className="mt-6">
                   <div className="h-2 glass rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                   </div>
                </div>
              </div>

              {/* Box 3: Stats Row (Long Vertical or Grid Item) */}
              <div className="glass-card p-8 rounded-[3rem] border border-white/10 flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Global Streak</p>
                   <div className="text-5xl font-black text-orange-400 tracking-tighter italic">{user.streak}🔥</div>
                </div>
                <p className="text-[9px] font-bold text-slate-600 mt-4 leading-relaxed uppercase tracking-widest">Giữ vững phong độ để mở khóa bí thuật!</p>
              </div>

              {/* Box 4: Skill Radar/Bars (Middle Size) */}
              <div className="md:col-span-2 glass-card p-8 rounded-[3rem] border border-white/10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">Skill Mastery 📊</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Vocabulary', val: calculateSkillPercent(user.skills.vocab), color: 'bg-indigo-500' },
                    { label: 'Grammar', val: calculateSkillPercent(user.skills.grammar), color: 'bg-purple-500' },
                    { label: 'Listening', val: calculateSkillPercent(user.skills.listening), color: 'bg-emerald-500' },
                    { label: 'Writing', val: calculateSkillPercent(user.skills.writing), color: 'bg-rose-500' }
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 mb-2">
                        <span>{s.label}</span>
                        <span>{s.val}%</span>
                      </div>
                      <div className="h-1.5 glass rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} transition-all duration-1000`} style={{ width: `${s.val}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 5: Badges Showcase (Large Row) */}
              <div className="md:col-span-4 glass-card p-10 rounded-[4rem] border border-white/10">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Legacy Badges 🏅</h3>
                   <span className="text-[9px] font-black text-slate-500 uppercase">{user.badges.length} Unlocked</span>
                </div>
                <div className="flex flex-wrap gap-6 justify-start">
                  {user.badges.map(b => (
                    <div key={b} className="group relative">
                      <div className="w-20 h-20 glass rounded-[2rem] border border-white/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl bg-gradient-to-br from-white/5 to-transparent">
                        {b === 'Học giả nhí' ? '🐣' : b === 'Học bá' ? '👑' : '🎖️'}
                      </div>
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none whitespace-nowrap border border-white/20">
                         <span className="text-[9px] font-black uppercase text-white tracking-widest">{b}</span>
                      </div>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {[...Array(Math.max(0, 6 - user.badges.length))].map((_, i) => (
                    <div key={i} className="w-20 h-20 glass rounded-[2rem] border border-white/5 opacity-20 flex items-center justify-center text-xl grayscale">
                      🔒
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-indigo-500 selection:text-white">
      {showLevelUp && <LevelUpModal level={user.level} onClose={() => setShowLevelUp(false)} />}
      {showStreakMilestone && <StreakCelebration streak={user.streak} onClose={() => setShowStreakMilestone(false)} />}
      
      {/* Mobile Menu Toggle Button - Always visible on mobile */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-6 left-6 z-50 w-12 h-12 glass rounded-full flex items-center justify-center text-xl text-white shadow-xl active:scale-95 transition-transform"
      >
        ☰
      </button>

      <Sidebar 
        currentView={view} 
        setView={(v) => { setView(v); setGameType('selection'); setIsEditing(false); }} 
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />
      
      <main className="flex-1 md:ml-80 p-5 md:p-12 transition-all pt-24 md:pt-12">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
