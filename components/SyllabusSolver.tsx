
import React, { useState, useRef } from 'react';
import { solveSyllabus } from '../services/gemini';
import { SyllabusSection } from '../types';

interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

const SyllabusSolver: React.FC = () => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [results, setResults] = useState<SyllabusSection[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract pure base64 part
        const base64 = result.split(',')[1];
        setFileData({
          base64: base64,
          mimeType: file.type,
          name: file.name
        });
        setResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!fileData) return;
    setLoading(true);
    const data = await solveSyllabus(fileData.base64, fileData.mimeType);
    setResults(data);
    setLoading(false);
  };

  const renderFilePreview = () => {
    if (!fileData) return (
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-110 transition-transform text-indigo-400">
          📂
        </div>
        <h3 className="text-xl font-black text-white mb-2">Chạm để tải tài liệu lên</h3>
        <p className="text-slate-500 text-sm">Hỗ trợ PDF hoặc Ảnh (JPG, PNG)</p>
      </div>
    );

    const isImage = fileData.mimeType.startsWith('image/');

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        {isImage ? (
          <img src={`data:${fileData.mimeType};base64,${fileData.base64}`} alt="Uploaded preview" className="max-h-[300px] object-contain rounded-2xl shadow-lg mb-4" />
        ) : (
          <div className="w-24 h-24 bg-rose-500/20 rounded-2xl flex items-center justify-center text-5xl text-rose-400 mb-4 border border-rose-500/30">
             {fileData.mimeType.includes('pdf') ? '📄' : '📝'}
          </div>
        )}
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-white/10 text-center">
          <p className="text-white font-bold text-sm truncate max-w-[200px]">{fileData.name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Ready to solve</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-32">
      {/* Header */}
      <div className="glass p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[120px] -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 text-white tracking-tight">Syllabus Solver ⚡</h2>
          <p className="text-slate-400 font-medium max-w-lg">Tải lên đề cương (PDF hoặc Ảnh). Sryun sẽ phân tích và giải thích chi tiết từng câu cho bạn!</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`glass rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center min-h-[400px] cursor-pointer transition-all group relative overflow-hidden ${
              fileData ? 'border-indigo-500/50' : 'border-white/10 hover:border-indigo-500 hover:bg-white/5'
            }`}
          >
            {renderFilePreview()}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              onChange={handleFileUpload} 
            />
            
            {fileData && (
              <div className="absolute bottom-4 right-4 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-emerald-400 tracking-widest pointer-events-none border border-emerald-500/30">
                File Loaded
              </div>
            )}
          </div>

          <button 
            onClick={handleSolve}
            disabled={!fileData || loading}
            className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
              !fileData ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
              loading ? 'bg-indigo-600/80 text-white cursor-wait' :
              'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang đọc tài liệu...</span>
              </>
            ) : (
              <>
                <span>🚀 Giải Đề Ngay</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <div className="space-y-6 h-full">
           {loading && (
             <div className="h-full glass rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border border-white/10">
               <div className="text-6xl mb-6 animate-bounce">🤖</div>
               <h3 className="text-2xl font-black text-white mb-2">Sryun đang phân tích...</h3>
               <p className="text-slate-400 text-sm">Hệ thống đang đọc nội dung file, tìm câu hỏi và soạn lời giải thích dễ hiểu nhất cho bạn.</p>
               <div className="w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full mt-8 overflow-hidden">
                 <div className="h-full bg-indigo-500 animate-shimmer-sweep w-1/2 rounded-full"></div>
               </div>
             </div>
           )}

           {!loading && results.length === 0 && !fileData && (
             <div className="h-full glass rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center border border-white/10 opacity-50">
               <div className="text-6xl mb-6 grayscale">📄</div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Kết quả sẽ hiện ở đây</p>
             </div>
           )}

           {!loading && results.length > 0 && (
             <div className="space-y-8 animate-fadeIn">
               {results.map((section, idx) => (
                 <div key={idx} className="glass rounded-[2.5rem] border border-white/10 overflow-hidden">
                   <div className="bg-white/5 px-8 py-5 border-b border-white/5 flex items-center gap-4">
                     <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-sm">{idx + 1}</span>
                     <div>
                       <h3 className="text-lg font-black text-white">{section.title}</h3>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{section.type}</span>
                     </div>
                   </div>
                   
                   <div className="p-8 space-y-8">
                     {section.items.map((item, itemIdx) => (
                       <div key={itemIdx} className="group">
                         <div className="flex gap-4 mb-3">
                           <span className="text-slate-500 font-bold text-sm shrink-0 mt-1">Q{itemIdx + 1}.</span>
                           <p className="text-white font-medium text-lg leading-relaxed">{item.question}</p>
                         </div>
                         
                         <div className="pl-8 space-y-4 border-l-2 border-indigo-500/20 ml-2">
                            <div className="glass bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl inline-block">
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Đáp án</span>
                              <span className="text-emerald-300 font-black text-xl">{item.answer}</span>
                            </div>
                            
                            <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                 <span className="text-lg">💡</span> Giải thích chi tiết
                               </p>
                               <p className="text-slate-300 text-sm leading-relaxed italic">{item.explanation}</p>
                            </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusSolver;
