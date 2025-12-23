
import React from 'react';
import { GrammarPoint, AppView } from '../types';

const GRAMMAR_DATA: GrammarPoint[] = [
  {
    unit: 1,
    title: 'Present Simple vs. Present Continuous',
    titleVi: 'Hiện tại Đơn vs. Hiện tại Tiếp diễn',
    explanation: 'Distinguishing between daily habits and actions happening at the moment of speaking.',
    explanationVi: 'Phân biệt giữa thói quen hàng ngày và hành động đang diễn ra ngay tại thời điểm nói.',
    structures: [
      { label: 'Present Simple', labelVi: 'Hiện tại Đơn', formula: 'S + V(s/es) / S + do/does not + V' },
      { label: 'Present Continuous', labelVi: 'Hiện tại Tiếp diễn', formula: 'S + am/is/are + V-ing' }
    ],
    examples: [
      'My mother usually cooks dinner.',
      'She is cooking dinner right now.'
    ],
    exampleMeanings: [
      'Mẹ tôi thường xuyên nấu bữa tối (thói quen).',
      'Bà ấy đang nấu bữa tối ngay bây giờ (đang xảy ra).'
    ]
  },
  {
    unit: 2,
    title: 'Future with Will vs. Be going to',
    titleVi: 'Tương lai với Will vs. Be going to',
    explanation: 'Use "will" for instant decisions, "be going to" for pre-planned intentions.',
    explanationVi: 'Dùng "will" cho các quyết định tức thời, "be going to" cho các kế hoạch/dự định đã có từ trước.',
    structures: [
      { label: 'Will', labelVi: 'Sẽ (tức thì)', formula: 'S + will + V-inf' },
      { label: 'Be going to', labelVi: 'Sẽ (kế hoạch)', formula: 'S + am/is/are + going to + V-inf' }
    ],
    examples: [
      'The phone is ringing. I will answer it.',
      'I am going to visit my grandparents this weekend.'
    ],
    exampleMeanings: [
      'Điện thoại đang reo. Tôi sẽ nghe máy (quyết định ngay lúc đó).',
      'Tôi định sẽ đi thăm ông bà vào cuối tuần này (đã lên kế hoạch).'
    ]
  },
  {
    unit: 3,
    title: 'To-infinitives and Bare infinitives',
    titleVi: 'Động từ nguyên mẫu có To và không To',
    explanation: 'Some verbs are followed by "to V", others use the base form "V".',
    explanationVi: 'Một số động từ theo sau bởi "to V", số khác lại dùng động từ nguyên mẫu không "to".',
    structures: [
      { label: 'To-inf', labelVi: 'V có to', formula: 'want, decide, hope, promise... + to V' },
      { label: 'Bare-inf', labelVi: 'V không to', formula: 'make, let, can, must... + V' }
    ],
    examples: [
      'I want to become a singer.',
      'My parents let me go out with friends.'
    ],
    exampleMeanings: [
      'Tôi muốn trở thành một ca sĩ.',
      'Bố mẹ cho phép tôi đi chơi với bạn bè.'
    ]
  },
  {
    unit: 4,
    title: 'Past Simple vs. Past Continuous',
    titleVi: 'Quá khứ Đơn vs. Quá khứ Tiếp diễn',
    explanation: 'Actions that happened at a specific time vs. actions in progress in the past.',
    explanationVi: 'Hành động đã xảy ra và kết thúc vs. hành động đang diễn ra tại một thời điểm trong quá khứ.',
    structures: [
      { label: 'Past Simple', labelVi: 'Quá khứ Đơn', formula: 'S + V2/ed' },
      { label: 'Past Continuous', labelVi: 'Quá khứ Tiếp diễn', formula: 'S + was/were + V-ing' }
    ],
    examples: [
      'I was doing my homework when the phone rang.',
      'While we were playing football, it started to rain.'
    ],
    exampleMeanings: [
      'Tôi đang làm bài tập thì điện thoại reo (hành động đang làm bị xen vào).',
      'Trong lúc chúng tôi đang chơi bóng đá, trời bắt đầu mưa.'
    ]
  },
  {
    unit: 5,
    title: 'Present Perfect',
    titleVi: 'Thì Hiện tại Hoàn thành',
    explanation: 'Actions that happened at an unspecified time or started in the past and continue to the present.',
    explanationVi: 'Hành động xảy ra không rõ thời gian hoặc bắt đầu trong quá khứ và kéo dài đến hiện tại.',
    structures: [
      { label: 'Form', labelVi: 'Cấu trúc', formula: 'S + have/has + V3/ed' },
      { label: 'Signals', labelVi: 'Dấu hiệu', formula: 'since, for, already, yet, ever, never' }
    ],
    examples: [
      'I have lived here for ten years.',
      'She has already finished her project.'
    ],
    exampleMeanings: [
      'Tôi đã sống ở đây được 10 năm rồi (và vẫn đang sống).',
      'Cô ấy đã hoàn thành xong dự án của mình rồi.'
    ]
  },
  {
    unit: 6,
    title: 'Passive Voice with Modals',
    titleVi: 'Câu bị động với Động từ khuyết thiếu',
    explanation: 'Forming passive sentences using modal verbs like can, must, should.',
    explanationVi: 'Cách lập câu bị động khi có các động từ như can (có thể), must (phải), should (nên).',
    structures: [
      { label: 'Form', labelVi: 'Cấu trúc', formula: 'S + modal verb + be + V3/ed' }
    ],
    examples: [
      'This work must be finished before 5 PM.',
      'Gender equality should be promoted everywhere.'
    ],
    exampleMeanings: [
      'Công việc này phải được hoàn thành trước 5 giờ chiều.',
      'Bình đẳng giới nên được thúc đẩy ở mọi nơi.'
    ]
  },
  {
    unit: 7,
    title: 'Comparative and Superlative Adjectives',
    titleVi: 'So sánh Hơn và So sánh Nhất',
    explanation: 'Comparing two or more things using short and long adjectives.',
    explanationVi: 'So sánh giữa hai hoặc nhiều sự vật/người sử dụng tính từ ngắn và tính từ dài.',
    structures: [
      { label: 'Comparative', labelVi: 'So sánh Hơn', formula: 'adj-er + than / more + adj + than' },
      { label: 'Superlative', labelVi: 'So sánh Nhất', formula: 'the + adj-est / the most + adj' }
    ],
    examples: [
      'This book is more interesting than that one.',
      'He is the tallest student in my class.'
    ],
    exampleMeanings: [
      'Cuốn sách này thú vị hơn cuốn kia.',
      'Cậu ấy là học sinh cao nhất trong lớp tôi.'
    ]
  },
  {
    unit: 8,
    title: 'Relative Clauses (Defining)',
    titleVi: 'Mệnh đề quan hệ xác định',
    explanation: 'Using who, whom, which, that to give essential information about a noun.',
    explanationVi: 'Sử dụng các từ nối để cung cấp thông tin quan trọng giúp xác định danh từ đứng trước.',
    structures: [
      { label: 'Who/Whom', labelVi: 'Cho người', formula: 'N (person) + who/whom + ...' },
      { label: 'Which/That', labelVi: 'Cho vật', formula: 'N (thing) + which/that + ...' }
    ],
    examples: [
      'The man who lives next door is a doctor.',
      'The laptop that I bought yesterday is very fast.'
    ],
    exampleMeanings: [
      'Người đàn ông sống cạnh nhà tôi là một bác sĩ.',
      'Chiếc máy tính xách tay tôi mua hôm qua chạy rất nhanh.'
    ]
  },
  {
    unit: 9,
    title: 'Reported Speech (Statements)',
    titleVi: 'Câu tường thuật (Câu kể)',
    explanation: 'Reporting what someone else said by shifting tenses and pronouns.',
    explanationVi: 'Thuật lại lời nói của người khác bằng cách lùi thì và thay đổi đại từ phù hợp.',
    structures: [
      { label: 'Tense change', labelVi: 'Lùi thì', formula: 'Present Simple -> Past Simple' },
      { label: 'Pronouns', labelVi: 'Đại từ', formula: 'I -> He/She, We -> They, etc.' }
    ],
    examples: [
      'Direct: "I am happy," he said.',
      'Reported: He said that he was happy.'
    ],
    exampleMeanings: [
      'Trực tiếp: "Tôi đang hạnh phúc," anh ấy nói.',
      'Gián tiếp: Anh ấy nói rằng anh ấy đang hạnh phúc.'
    ]
  },
  {
    unit: 10,
    title: 'Conditional Sentences Type 1 & 2',
    titleVi: 'Câu điều kiện loại 1 và loại 2',
    explanation: 'Type 1 for real possibilities; Type 2 for imaginary/unreal situations.',
    explanationVi: 'Loại 1 dùng cho giả thiết có thật; Loại 2 cho giả thiết không có thật ở hiện tại.',
    structures: [
      { label: 'Type 1', labelVi: 'Loại 1 (Có thật)', formula: 'If + S + V(s/es), S + will + V' },
      { label: 'Type 2', labelVi: 'Loại 2 (Giả định)', formula: 'If + S + V2/ed (were), S + would + V' }
    ],
    examples: [
      'If it rains, we will stay at home.',
      'If I were you, I would study harder.'
    ],
    exampleMeanings: [
      'Nếu trời mưa, chúng ta sẽ ở nhà (có khả năng mưa).',
      'Nếu tôi là bạn, tôi sẽ học chăm hơn (nhưng tôi không thể là bạn).'
    ]
  },
  {
    unit: 11,
    title: 'Relative Clauses with Prepositions',
    titleVi: 'Mệnh đề quan hệ có giới từ',
    explanation: 'How to place prepositions in relative clauses formally and informally.',
    explanationVi: 'Cách đặt giới từ trong mệnh đề quan hệ (trang trọng và thông thường).',
    structures: [
      { label: 'Structure', labelVi: 'Cấu trúc', formula: 'Noun + Preposition + which/whom' }
    ],
    examples: [
      'The company for which she works is very large.',
      'The man to whom I spoke is my teacher.'
    ],
    exampleMeanings: [
      'Công ty mà cô ấy làm việc cho rất lớn.',
      'Người đàn ông mà tôi đã nói chuyện cùng là thầy giáo của tôi.'
    ]
  },
  {
    unit: 12,
    title: 'Passive Voice Review',
    titleVi: 'Ôn tập Câu bị động',
    explanation: 'Comprehensive review of passive voice across various tenses.',
    explanationVi: 'Ôn tập tổng quát cách chuyển đổi câu bị động qua các thì khác nhau.',
    structures: [
      { label: 'General Form', labelVi: 'Dạng chung', formula: 'S + be + V3/ed (+ by O)' }
    ],
    examples: [
      'English is spoken all over the world.',
      'The house was built in 1990.'
    ],
    exampleMeanings: [
      'Tiếng Anh được nói trên khắp thế giới.',
      'Ngôi nhà đã được xây dựng vào năm 1990.'
    ]
  }
];

const SHORTCUTS: { id: AppView; label: string; icon: string }[] = [
  { id: 'vocab', label: 'Từ Vựng', icon: '📖' },
  { id: 'grammar', label: 'Ngữ Pháp', icon: '⚖️' },
  { id: 'listening', label: 'Nghe', icon: '🎧' },
  { id: 'reading', label: 'Đọc', icon: '📚' },
  { id: 'writing', label: 'Viết', icon: '✍️' },
  { id: 'homework', label: 'Bài Tập', icon: '🏠' },
  { id: 'unit-test', label: 'Kiểm Tra', icon: '🏆' },
];

interface GrammarViewProps {
  unit: number;
  onNext: () => void;
  onBack: () => void;
}

const GrammarView: React.FC<GrammarViewProps> = ({ unit, onNext, onBack }) => {
  const data = GRAMMAR_DATA.find(g => g.unit === unit);

  if (!data) return <div className="p-10 text-center font-bold text-slate-500">Dữ liệu ngữ pháp đang được cập nhật...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-32 text-white">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between px-2">
          <button onClick={onBack} className="px-6 py-3 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <span>←</span> Quay lại Unit
          </button>
          <span className="px-5 py-2 glass border border-purple-500/30 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            Grammar Zone: Unit {unit}
          </span>
        </div>

        {/* Unit Navigation Shortcuts - Optimized Font */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {SHORTCUTS.map(s => (
            <button
              key={s.id}
              onClick={() => s.id !== 'grammar' && onBack()} 
              className={`px-6 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2.5 ${
                s.id === 'grammar' 
                  ? 'bg-purple-600 text-white border-purple-500 shadow-xl shadow-purple-500/20' 
                  : 'glass text-slate-500 border-white/10 hover:border-purple-500/50 hover:text-white'
              }`}
            >
              <span className="text-base">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-800 p-8 md:p-12 text-white relative">
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-1 tracking-tighter">{data.title}</h2>
            <p className="text-purple-200 font-bold mb-4 opacity-80">{data.titleVi}</p>
            <div className="space-y-2">
               <p className="text-purple-100 font-medium leading-relaxed max-w-2xl text-sm md:text-base">{data.explanation}</p>
               <p className="text-purple-300 font-medium italic text-xs md:text-sm border-l-2 border-purple-400 pl-3">{data.explanationVi}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12 space-y-12">
          <div className="grid gap-6 md:grid-cols-2">
            {data.structures.map((s, i) => (
              <div key={i} className="glass p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 group hover:border-purple-500/50 transition-all">
                <div className="mb-4">
                  <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em]">{s.label}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{s.labelVi}</p>
                </div>
                <div className="bg-slate-900/50 text-emerald-400 p-5 md:p-6 rounded-2xl md:rounded-3xl font-mono text-sm border border-white/5 shadow-inner leading-relaxed overflow-x-auto">
                  {s.formula}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-black text-white flex items-center gap-4">
              <span className="w-10 h-10 glass border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center text-lg">💡</span>
              Example Usage (Ví dụ)
            </h4>
            <div className="grid gap-4">
              {data.examples.map((ex, i) => (
                <div key={i} className="flex gap-4 md:gap-6 p-5 md:p-6 glass border border-white/5 rounded-2xl md:rounded-3xl hover:border-purple-500/30 transition-all items-start">
                  <span className="text-purple-500 font-black italic text-xl opacity-40 mt-0.5">0{i+1}</span>
                  <div className="space-y-1">
                    <p className="text-slate-100 font-bold leading-relaxed text-sm md:text-base">{ex}</p>
                    <p className="text-slate-400 font-medium text-xs md:text-sm italic">{data.exampleMeanings[i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarView;
