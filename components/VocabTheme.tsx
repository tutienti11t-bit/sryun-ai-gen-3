
import React, { useState } from 'react';
import { Word, AppView } from '../types';
import { speakWithAI } from '../services/audio';

const INITIAL_WORDS: Word[] = [
  // UNIT 1: FAMILY LIFE
  { id: 'u1-1', term: 'Homemaker', definition: 'Người nội trợ', example: 'My mother is a homemaker, she takes care of our family very well.', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },
  { id: 'u1-2', term: 'Breadwinner', definition: 'Trụ cột gia đình', example: 'In many modern families, both parents are breadwinners.', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },
  { id: 'u1-3', term: 'Household chores', definition: 'Công việc nhà', example: 'We split the household chores equally among family members.', image: 'https://images.unsplash.com/photo-1581579186913-45ac3e6e3dd2?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },
  { id: 'u1-4', term: 'Extended family', definition: 'Gia đình đa thế hệ', example: 'She grew up in a large extended family with grandparents and cousins.', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },
  { id: 'u1-5', term: 'Nuclear family', definition: 'Gia đình hạt nhân', example: 'A nuclear family consists of parents and children living together.', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },
  { id: 'u1-6', term: 'Responsibility', definition: 'Trách nhiệm', example: 'It is my responsibility to clean my room every weekend.', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80', category: 'Unit 1: Family Life' },

  // UNIT 2: HUMANS AND THE ENVIRONMENT
  { id: 'u2-1', term: 'Carbon footprint', definition: 'Dấu chân carbon', example: 'Using public transport is a great way to reduce your carbon footprint.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80', category: 'Unit 2: Environment' },
  { id: 'u2-2', term: 'Eco-friendly', definition: 'Thân thiện với môi trường', example: 'This store uses eco-friendly packaging for all products.', image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80', category: 'Unit 2: Environment' },
  { id: 'u2-3', term: 'Sustainable', definition: 'Bền vững', example: 'Sustainable development is crucial for our future.', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80', category: 'Unit 2: Environment' },
  { id: 'u2-4', term: 'Refillable', definition: 'Có thể làm đầy lại', example: 'I always carry a refillable water bottle to school.', image: 'https://images.unsplash.com/photo-1602143407151-0111419516eb?auto=format&fit=crop&w=600&q=80', category: 'Unit 2: Environment' },
  { id: 'u2-5', term: 'Organic', definition: 'Hữu cơ', example: 'Organic food is grown without harmful chemicals.', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', category: 'Unit 2: Environment' },

  // UNIT 3: MUSIC
  { id: 'u3-1', term: 'Performance', definition: 'Buổi biểu diễn', example: 'The band gave a wonderful performance at the music festival.', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=600&q=80', category: 'Unit 3: Music' },
  { id: 'u3-2', term: 'Talent', definition: 'Tài năng', example: 'He has a great talent for playing the piano.', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', category: 'Unit 3: Music' },
  { id: 'u3-3', term: 'Audience', definition: 'Khán giả', example: 'The audience clapped loudly after the song ended.', image: 'https://images.unsplash.com/photo-1475721027767-p05a623901fa?auto=format&fit=crop&w=600&q=80', category: 'Unit 3: Music' },
  { id: 'u3-4', term: 'Judge', definition: 'Ban giám khảo', example: 'The judges were impressed by her voice.', image: 'https://images.unsplash.com/photo-1531496730074-83d639b7519b?auto=format&fit=crop&w=600&q=80', category: 'Unit 3: Music' },
  { id: 'u3-5', term: 'Eliminate', definition: 'Loại bỏ', example: 'Three contestants were eliminated from the show last night.', image: 'https://images.unsplash.com/photo-1555618063-27464a395988?auto=format&fit=crop&w=600&q=80', category: 'Unit 3: Music' },

  // UNIT 4: FOR A BETTER COMMUNITY
  { id: 'u4-1', term: 'Volunteer', definition: 'Tình nguyện viên', example: 'They volunteered to teach English to children in remote areas.', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80', category: 'Unit 4: Community' },
  { id: 'u4-2', term: 'Donate', definition: 'Quyên góp', example: 'We donated books and clothes to the local charity.', image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80', category: 'Unit 4: Community' },
  { id: 'u4-3', term: 'Generous', definition: 'Hào phóng', example: 'Thank you for your generous donation to our fund.', image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=600&q=80', category: 'Unit 4: Community' },
  { id: 'u4-4', term: 'Non-profit', definition: 'Phi lợi nhuận', example: 'She works for a non-profit organisation that helps homeless people.', image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80', category: 'Unit 4: Community' },
  { id: 'u4-5', term: 'Remote area', definition: 'Vùng sâu vùng xa', example: 'Education is hard to access in some remote areas.', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80', category: 'Unit 4: Community' },

  // UNIT 5: INVENTIONS
  { id: 'u5-1', term: 'Artificial Intelligence', definition: 'Trí tuệ nhân tạo', example: 'AI is changing the way we work and live.', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80', category: 'Unit 5: Inventions' },
  { id: 'u5-2', term: 'Portable', definition: 'Có thể mang theo', example: 'Laptops are portable computers that you can carry easily.', image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=600&q=80', category: 'Unit 5: Inventions' },
  { id: 'u5-3', term: 'Economical', definition: 'Tiết kiệm', example: 'This hybrid car is very economical to run.', image: 'https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=600&q=80', category: 'Unit 5: Inventions' },
  { id: 'u5-4', term: 'Versatile', definition: 'Đa năng', example: 'A smartphone is a versatile device used for calls, photos, and internet.', image: 'https://images.unsplash.com/photo-1585076641399-5c06d1b3365f?auto=format&fit=crop&w=600&q=80', category: 'Unit 5: Inventions' },
  { id: 'u5-5', term: 'Invention', definition: 'Phát minh', example: 'The light bulb was a revolutionary invention.', image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&q=80', category: 'Unit 5: Inventions' },

  // UNIT 6: GENDER EQUALITY
  { id: 'u6-1', term: 'Gender equality', definition: 'Bình đẳng giới', example: 'Gender equality ensures equal opportunities for everyone.', image: 'https://images.unsplash.com/photo-1628198908920-53086438676d?auto=format&fit=crop&w=600&q=80', category: 'Unit 6: Equality' },
  { id: 'u6-2', term: 'Discrimination', definition: 'Sự phân biệt đối xử', example: 'Discrimination based on gender is illegal in many countries.', image: 'https://images.unsplash.com/photo-1525357816819-392d2380d821?auto=format&fit=crop&w=600&q=80', category: 'Unit 6: Equality' },
  { id: 'u6-3', term: 'Eliminate', definition: 'Loại bỏ', example: 'We must work together to eliminate gender bias.', image: 'https://images.unsplash.com/photo-1598618443855-232ee0f819f3?auto=format&fit=crop&w=600&q=80', category: 'Unit 6: Equality' },
  { id: 'u6-4', term: 'Opportunity', definition: 'Cơ hội', example: 'Education provides better job opportunities for women.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80', category: 'Unit 6: Equality' },
  { id: 'u6-5', term: 'Domestic violence', definition: 'Bạo lực gia đình', example: 'Victims of domestic violence need support and protection.', image: 'https://images.unsplash.com/photo-1588611910260-845257740cb8?auto=format&fit=crop&w=600&q=80', category: 'Unit 6: Equality' },

  // UNIT 7: VIETNAM AND INTERNATIONAL ORGANISATIONS
  { id: 'u7-1', term: 'Organisation', definition: 'Tổ chức', example: 'Viet Nam joined several international organisations.', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80', category: 'Unit 7: International' },
  { id: 'u7-2', term: 'Goal', definition: 'Mục tiêu', example: 'The main goal of the UN is to maintain world peace.', image: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=600&q=80', category: 'Unit 7: International' },
  { id: 'u7-3', term: 'Promote', definition: 'Thúc đẩy', example: 'UNICEF works to promote the rights of every child.', image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80', category: 'Unit 7: International' },
  { id: 'u7-4', term: 'Participate', definition: 'Tham gia', example: 'Vietnam actively participates in ASEAN activities.', image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80', category: 'Unit 7: International' },
  { id: 'u7-5', term: 'Relation', definition: 'Quan hệ', example: 'We aim to strengthen diplomatic relations with other countries.', image: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&w=600&q=80', category: 'Unit 7: International' },

  // UNIT 8: NEW WAYS TO LEARN
  { id: 'u8-1', term: 'Blended learning', definition: 'Học tập kết hợp', example: 'Blended learning allows students to learn both online and in class.', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80', category: 'Unit 8: Education' },
  { id: 'u8-2', term: 'Digital device', definition: 'Thiết bị số', example: 'Tablets are useful digital devices for learning.', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80', category: 'Unit 8: Education' },
  { id: 'u8-3', term: 'Face-to-face', definition: 'Trực tiếp / Mặt đối mặt', example: 'I prefer face-to-face discussions over online chat.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', category: 'Unit 8: Education' },
  { id: 'u8-4', term: 'Strategy', definition: 'Chiến lược', example: 'You need a good strategy to learn vocabulary effectively.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80', category: 'Unit 8: Education' },
  { id: 'u8-5', term: 'Access', definition: 'Truy cập', example: 'Students need internet access to complete online assignments.', image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80', category: 'Unit 8: Education' },

  // UNIT 9: PROTECTING THE ENVIRONMENT
  { id: 'u9-1', term: 'Preserve', definition: 'Bảo tồn', example: 'We must preserve our traditional culture and nature.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80', category: 'Unit 9: Protection' },
  { id: 'u9-2', term: 'Biodiversity', definition: 'Đa dạng sinh học', example: 'Rainforests are rich in biodiversity.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', category: 'Unit 9: Protection' },
  { id: 'u9-3', term: 'Deforestation', definition: 'Nạn phá rừng', example: 'Deforestation is a major cause of climate change.', image: 'https://images.unsplash.com/photo-1516214104703-d670b80f256a?auto=format&fit=crop&w=600&q=80', category: 'Unit 9: Protection' },
  { id: 'u9-4', term: 'Endangered', definition: 'Có nguy cơ tuyệt chủng', example: 'Tigers are an endangered species.', image: 'https://images.unsplash.com/photo-1549480017-d76466a4b7e8?auto=format&fit=crop&w=600&q=80', category: 'Unit 9: Protection' },
  { id: 'u9-5', term: 'Global warming', definition: 'Sự nóng lên toàn cầu', example: 'Global warming is melting the polar ice caps.', image: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=600&q=80', category: 'Unit 9: Protection' },

  // UNIT 10: ECOTOURISM
  { id: 'u10-1', term: 'Ecotourism', definition: 'Du lịch sinh thái', example: 'Ecotourism is responsible travel to natural areas.', image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=600&q=80', category: 'Unit 10: Tourism' },
  { id: 'u10-2', term: 'Destination', definition: 'Điểm đến', example: 'Vietnam is a popular tourist destination.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', category: 'Unit 10: Tourism' },
  { id: 'u10-3', term: 'Impact', definition: 'Tác động', example: 'Tourism can have a negative impact on the local environment.', image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80', category: 'Unit 10: Tourism' },
  { id: 'u10-4', term: 'Conservation', definition: 'Sự bảo tồn', example: 'Money from ecotourism often supports wildlife conservation.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80', category: 'Unit 10: Tourism' },
  { id: 'u10-5', term: 'Local culture', definition: 'Văn hóa địa phương', example: 'Visitors should respect the local culture.', image: 'https://images.unsplash.com/photo-1550100136-e074fa714874?auto=format&fit=crop&w=600&q=80', category: 'Unit 10: Tourism' },

  // UNIT 11: CAREER CHOICE
  { id: 'u11-1', term: 'Career path', definition: 'Con đường sự nghiệp', example: 'Choosing a career path is a difficult decision.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', category: 'Unit 11: Career' },
  { id: 'u11-2', term: 'Qualification', definition: 'Bằng cấp / Trình độ', example: 'You need good qualifications to get a high-paying job.', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', category: 'Unit 11: Career' },
  { id: 'u11-3', term: 'Skill', definition: 'Kỹ năng', example: 'Communication skills are important in any job.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', category: 'Unit 11: Career' },
  { id: 'u11-4', term: 'Flexitime', definition: 'Thời gian linh hoạt', example: 'Employees appreciate flexitime so they can manage their own schedule.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', category: 'Unit 11: Career' },
  { id: 'u11-5', term: 'Adaptable', definition: 'Có khả năng thích nghi', example: 'In a fast-changing world, workers need to be adaptable.', image: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?auto=format&fit=crop&w=600&q=80', category: 'Unit 11: Career' },

  // UNIT 12: CYBER SOCIETY
  { id: 'u12-1', term: 'Cyberbullying', definition: 'Bắt nạt qua mạng', example: 'Cyberbullying can cause serious mental health issues.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', category: 'Unit 12: Life' },
  { id: 'u12-2', term: 'Privacy', definition: 'Sự riêng tư', example: 'You should protect your privacy when using social media.', image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80', category: 'Unit 12: Life' },
  { id: 'u12-3', term: 'Social media', definition: 'Mạng xã hội', example: 'Teenagers spend a lot of time on social media.', image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=600&q=80', category: 'Unit 12: Life' },
  { id: 'u12-4', term: 'Connect', definition: 'Kết nối', example: 'Technology helps us connect with friends all over the world.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', category: 'Unit 12: Life' },
  { id: 'u12-5', term: 'Addiction', definition: 'Sự nghiện ngập', example: 'Smartphone addiction is becoming a problem among young people.', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=600&q=80', category: 'Unit 12: Life' },
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

interface VocabThemeProps {
  unlockedUnits: number;
  selectedUnit: string;
  setSelectedUnit: (cat: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const VocabTheme: React.FC<VocabThemeProps> = ({ unlockedUnits, selectedUnit, setSelectedUnit, onNext, onBack }) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredWords = INITIAL_WORDS.filter(w => w.category === selectedUnit);

  const handleSpeak = async (word: Word) => {
    setSpeakingId(word.id);
    await speakWithAI(word.term);
    setSpeakingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-32">
      <div className="flex flex-col gap-6">
        <button onClick={onBack} className="px-6 py-3 glass rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2 w-fit">
          <span>←</span> Quay lại Unit
        </button>

        {/* Unit Navigation Shortcuts - Optimized Font */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {SHORTCUTS.map(s => (
            <button
              key={s.id}
              onClick={() => s.id !== 'vocab' && onNext()}
              className={`px-6 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-2.5 ${
                s.id === 'vocab' 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' 
                  : 'glass text-slate-500 border-white/10 hover:border-indigo-500/50 hover:text-white'
              }`}
            >
              <span className="text-base">{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWords.length > 0 ? filteredWords.map(word => (
          <div key={word.id} className="glass-card rounded-[3.5rem] overflow-hidden border border-white/10 group transition-all duration-500">
            <div className="h-56 overflow-hidden relative">
              <img src={word.image} alt={word.term} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="p-8">
              <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{word.term}</h3>
              <p className="text-sm text-indigo-400 font-bold mb-6">{word.definition}</p>
              
              <div className="glass p-5 rounded-3xl border border-white/5 mb-8">
                <p className="text-[13px] italic text-slate-400 leading-relaxed font-medium">"{word.example}"</p>
              </div>

              <button 
                onClick={() => handleSpeak(word)}
                className={`w-full py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 ${
                  speakingId === word.id 
                    ? 'bg-indigo-50 text-indigo-600 animate-pulse' 
                    : 'glass text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {speakingId === word.id ? '🔊 Đang đọc...' : '🔊 Phát âm'}
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-20">
            <p className="text-slate-500 font-bold">Từ vựng cho Unit này đang được cập nhật...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabTheme;
