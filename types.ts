
export interface Word {
  id: string;
  term: string;
  definition: string;
  example: string;
  image: string;
  category: string;
}

export interface GrammarPoint {
  unit: number;
  title: string;
  titleVi: string;
  explanation: string;
  explanationVi: string;
  structures: { label: string; labelVi: string; formula: string }[];
  examples: string[];
  exampleMeanings: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type AppView = 'home' | 'units' | 'unit-hub' | 'vocab' | 'ai-tutor' | 'games' | 'grammar' | 'profile' | 'unit-test' | 'listening' | 'writing' | 'reading' | 'homework' | 'lesson-plan' | 'syllabus-solver';

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  badges: string[];
  streak: number;
  unlockedUnits: number;
  avatar?: string;
  lastLoginDate?: string;
  homeworkStreak?: number;
  skills: {
    vocab: number;
    grammar: number;
    listening: number;
    writing: number;
  };
}

export interface HomeworkTask {
  id: string;
  type: 'vocab' | 'grammar' | 'translation';
  question: string;
  hint: string;
  correctAnswer: string;
  completed: boolean;
}

export interface CrosswordClue {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  row: number;
  col: number;
  hintIndices: number[];
}

export interface CrosswordData {
  size: number;
  clues: CrosswordClue[];
}

export interface SyllabusItem {
  question: string;
  answer: string;
  explanation: string;
}

export interface SyllabusSection {
  title: string;
  type: string;
  items: SyllabusItem[];
}

export const getRank = (level: number) => {
  if (level <= 5) {
    return { title: 'Newbie Scholar', color: 'text-slate-400', bg: 'bg-slate-100', icon: '🐣', aura: '' };
  }
  if (level <= 14) {
    return { title: 'English Explorer', color: 'text-indigo-400', bg: 'bg-indigo-100', icon: '🛶', aura: '' };
  }
  if (level <= 25) {
    return { title: 'Experienced Scholar', color: 'text-emerald-400', bg: 'bg-emerald-100', icon: '📖', aura: '' };
  }
  if (level <= 49) {
    return { 
      title: 'Straight-A student', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-50', 
      icon: '⭐', 
      aura: 'aura-gold' 
    };
  }
  if (level <= 99) {
    return { 
      title: 'Academic Whiz', 
      color: 'text-rose-400', 
      bg: 'bg-rose-50', 
      icon: '🔥', 
      aura: 'aura-fire' 
    };
  }
  return { 
    title: 'CELESTIAL MONARCH', 
    color: 'text-rainbow font-black italic', 
    bg: 'bg-white', 
    icon: '💎', 
    aura: 'animate-rainbow-card' 
  };
};
