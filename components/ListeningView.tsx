
import React, { useState, useEffect, useRef } from 'react';
import { getAIAudioBuffer, speakWithBrowser } from '../services/audio';
// Import missing generateListeningExercise from gemini service
import { generateListeningExercise } from '../services/gemini';
import { AppView } from '../types';

const SHORTCUTS: { id: AppView; label: string; icon: string }[] = [
  { id: 'vocab', label: 'Từ Vựng', icon: '📖' },
  { id: 'grammar', label: 'Ngữ Pháp', icon: '⚖️' },
  { id: 'listening', label: 'Nghe', icon: '🎧' },
  { id: 'reading', label: 'Đọc', icon: '📚' },
  { id: 'writing', label: 'Viết', icon: '✍️' },
  { id: 'homework', label: 'Bài Tập', icon: '🏠' },
  { id: 'unit-test', label: 'Kiểm Tra', icon: '🏆' },
];

const ListeningView: React.FC<{ 
  initialTopic?: string, 
  onComplete: (xp: number) => void, 
  onNavigate?: (view: AppView) => void,
  adminShowAnswer?: boolean 
}> = ({ initialTopic = '', onComplete, onNavigate, adminShowAnswer }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useFallbackAudio, setUseFallbackAudio] = useState(false); // Trạng thái dùng giọng dự phòng
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (initialTopic) startExercise();
    return () => stopAudio();
  }, [initialTopic]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    cancelAnimationFrame(requestRef.current);
    setIsPlaying(false);
    // Nếu đang dùng browser speech thì cancel nó
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const startExercise = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    stopAudio();
    setAudioBuffer(null);
    setUseFallbackAudio(false);
    pauseOffsetRef.current = 0;
    setCurrentTime(0);

    const result = await generateListeningExercise(topic);
    setData(result);
    setAnswers(new Array(result?.questions?.length || 0).fill(''));
    setShowResult(false);
    
    // Tải trước audio buffer
    if (result?.passage) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const buffer = await getAIAudioBuffer(result.passage, audioCtxRef.current);
      if (buffer) {
        setAudioBuffer(buffer);
        setDuration(buffer.duration);
        setUseFallbackAudio(false);
      } else {
        // Nếu không lấy được buffer (do lỗi 429 hoặc khác), bật chế độ fallback
        setUseFallbackAudio(true);
        setDuration(0); // Không biết độ dài khi dùng fallback
      }
    }
    setLoading(false);
  };

  const updateProgress = () => {
    if (audioCtxRef.current && isPlaying) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
      setCurrentTime(elapsed);
      if (elapsed >= duration) {
        setIsPlaying(false);
        pauseOffsetRef.current = 0;
        setCurrentTime(0);
        cancelAnimationFrame(requestRef.current);
      } else {
        requestRef.current = requestAnimationFrame(updateProgress);
      }
    }
  };

  const playFromOffset = (offset: number) => {
    if (!audioBuffer || !audioCtxRef.current) return;
    
    stopAudio();
    
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);
    
    startTimeRef.current = audioCtxRef.current.currentTime;
    pauseOffsetRef.current = offset;
    
    source.start(0, offset);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    requestRef.current = requestAnimationFrame(updateProgress);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseOffsetRef.current = currentTime;
      stopAudio();
    } else {
      playFromOffset(currentTime >= duration ? 0 : currentTime);
    }
  };

  const seek = (seconds: number) => {
    if (!audioBuffer) return; // Không seek được nếu dùng fallback
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    if (isPlaying) {
      playFromOffset(newTime);
    } else {
      pauseOffsetRef.current = newTime;
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioBuffer) return;
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (isPlaying) {
      playFromOffset(newTime);
    } else {
      pauseOffsetRef.current = newTime;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let score = 0;
    data.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    return score;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 animate-pulse text-indigo-400">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="font-black uppercase tracking-widest text-xs">Sryun đang soạn bài nghe cho bạn...</p>
    </div>
  );

  if (!data) return (
    <div className="max-w-xl mx-auto glass p-10 rounded-[3rem] shadow-sm border border-white/10 text-center animate-fadeIn text-white">
      <div className="text-5xl mb-6">🎧</div>
      <h2 className="text-2xl font-black mb-2">Nghe Hiểu</h2>
      <p className="text-slate-400 text-sm mb-8">Nghe đoạn văn và trả lời câu hỏi trắc nghiệm.</p>
      <input 
        type="text" 
        placeholder="Chủ đề: My school, Family Life..." 
        value={topic} 
        onChange={e => setTopic(e.target.value)} 
        className="w-full p-4 glass rounded-2xl border-none ring-2 ring-indigo-50/10 focus:ring-indigo-500 mb-6 text-center font-bold text-white outline-none" 
      />
      <button onClick={startExercise} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest">Bắt đầu bài nghe</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn text-white pb-32">
      {/* Unit Navigation Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {SHORTCUTS.map(s => (
          <button
            key={s.id}
            onClick={() => s.id !== 'listening' && onNavigate?.(s.id)} 
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2 ${
              s.id === 'listening' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'glass text-slate-400 border-white/10 hover:border-indigo-500/50'
            }`}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Advanced Audio Player */}
      <div className="glass p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
             <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-125' : 'opacity-0 scale-100'}`}></div>
             
             {useFallbackAudio ? (
                /* FALLBACK PLAYER BUTTON */
                <button 
                  onClick={() => speakWithBrowser(data.passage)}
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all relative z-10 bg-amber-500 text-white hover:scale-110 active:scale-95 border-4 border-amber-300/30"
                >
                  <span className="text-3xl mb-1">🔊</span>
                  <span className="text-[7px] font-black uppercase">System Voice</span>
                </button>
             ) : (
                /* AI PLAYER BUTTON */
                <button 
                  onClick={togglePlay}
                  disabled={!audioBuffer}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all relative z-10 ${
                    !audioBuffer ? 'bg-white/5 text-slate-600' : 'bg-white text-slate-900 hover:scale-110 active:scale-95'
                  }`}
                >
                  {!audioBuffer ? '⏳' : isPlaying ? '⏸️' : '▶️'}
                </button>
             )}
          </div>

          <div className="w-full space-y-4">
            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-8">
              <button onClick={() => seek(-5)} disabled={!audioBuffer} className="text-2xl text-slate-400 hover:text-white transition-colors disabled:opacity-30">⏪</button>
              <div className="text-xs font-black font-mono text-indigo-400 min-w-[40px] text-center">
                {useFallbackAudio ? '--:--' : formatTime(currentTime)}
              </div>
              <button onClick={() => seek(5)} disabled={!audioBuffer} className="text-2xl text-slate-400 hover:text-white transition-colors disabled:opacity-30">⏩</button>
            </div>

            {/* Progress Slider */}
            <div className="relative group/slider px-4">
              <input 
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={handleSliderChange}
                disabled={!audioBuffer}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500 group-hover/slider:h-2 transition-all disabled:opacity-30"
              />
              <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>START</span>
                <span>{useFallbackAudio ? 'AUTO' : `${formatTime(duration)} END`}</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
             <h3 className="text-lg font-black text-white">Sryun Audio Assistant</h3>
             <p className={`text-[10px] font-black uppercase tracking-widest ${useFallbackAudio ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                {useFallbackAudio 
                  ? 'AI Quota Limit Reached - Using Backup Voice' 
                  : isPlaying ? 'Now Playing Passage...' : audioBuffer ? 'Ready to listen' : 'Synthesizing voice...'}
             </p>
          </div>
        </div>

        {/* Audio Visualizer Mock */}
        {isPlaying && !useFallbackAudio && (
          <div className="flex items-end justify-center gap-1 h-8 mt-4">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-indigo-500/50 rounded-full animate-bounce" 
                style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {data.questions.map((q: any, i: number) => (
          <div key={i} className={`glass p-8 rounded-[2.5rem] border transition-all ${showResult ? 'border-white/5' : 'border-white/10'}`}>
            <div className="flex items-start gap-4 mb-6">
               <span className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center font-black text-xs text-indigo-400 shrink-0">{i + 1}</span>
               <p className="font-bold text-slate-200 leading-relaxed">{q.question}</p>
            </div>
            
            <div className="grid gap-3">
              {q.options.map((opt: string) => {
                let statusStyle = "border-white/5 bg-white/5 hover:bg-white/10";
                if (answers[i] === opt) statusStyle = "border-indigo-500 bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/20";
                
                if (showResult) {
                  if (opt === q.correctAnswer) statusStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/20";
                  else if (answers[i] === opt && opt !== q.correctAnswer) statusStyle = "border-rose-500 bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/20";
                  else statusStyle = "opacity-30 grayscale border-white/5 bg-white/5";
                }

                return (
                  <button
                    key={opt}
                    disabled={showResult}
                    onClick={() => { if(!showResult) { const a = [...answers]; a[i] = opt; setAnswers(a); } }}
                    className={`w-full p-5 rounded-2xl text-left text-sm font-bold border-2 transition-all flex items-center justify-between group ${statusStyle}`}
                  >
                    <span>{opt}</span>
                    {showResult && opt === q.correctAnswer && <span className="text-emerald-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!showResult ? (
        <button 
          onClick={() => { setShowResult(true); onComplete(calculateScore() * 30); stopAudio(); }}
          className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all active:scale-95"
        >
          Nộp bài & Kiểm tra
        </button>
      ) : (
        <div className="glass p-12 rounded-[4rem] border border-indigo-500/30 text-center space-y-6 animate-epic-entry">
          <div className="text-6xl">📊</div>
          <div>
            <h4 className="text-4xl font-black text-white tracking-tighter mb-2">SCORE: {calculateScore()}/{data.questions.length}</h4>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Reward Achieved: +{calculateScore() * 30} XP</p>
          </div>
          <button 
            onClick={() => { setData(null); stopAudio(); }} 
            className="w-full py-5 glass border border-white/20 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Thử chủ đề mới
          </button>
        </div>
      )}
    </div>
  );
};

export default ListeningView;
