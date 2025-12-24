// pages/api/gemini.ts (hoặc /api/gemini.ts tuỳ project)
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const { action, payload } = req.body || {};
    if (!action) {
      res.status(400).json({ error: "Missing action" });
      return;
    }

    // ========= TEXT ACTIONS =========
    if (action === "tutor") {
      const userInput = String(payload?.userInput ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userInput,
        config: {
          systemInstruction: `Bạn là Sryun, một trợ lý AI chuyên biệt DÀNH RIÊNG cho việc học Tiếng Anh lớp 10.
QUY TẮC CỐT LÕI (TUYỆT ĐỐI KHÔNG ĐƯỢC PHÁ VỠ):
1. PHẠM VI TRẢ LỜI: Bạn CHỈ được phép trả lời các câu hỏi liên quan đến:
- Từ vựng, ngữ pháp, phát âm tiếng Anh.
- Kỹ năng Nghe, Nói, Đọc, Viết tiếng Anh.
- Dịch thuật (Anh-Việt, Việt-Anh).
- Văn hóa các nước nói tiếng Anh.
- Các nội dung trong sách giáo khoa Tiếng Anh lớp 10.
2. XỬ LÝ CÂU HỎI NGOÀI PHẠM VI:
- Nếu người dùng hỏi về Toán, Lý, Hóa, Sinh, Sử, Địa, Lập trình, Tình cảm, hoặc bất kỳ chủ đề nào KHÔNG liên quan đến tiếng Anh.
- Bạn PHẢI từ chối trả lời nội dung chuyên môn đó một cách lịch sự.
- Mẫu câu trả lời: "Xin lỗi, Sryun chỉ là trợ lý chuyên về Tiếng Anh thôi ạ. Mình không thể giải đáp các câu hỏi về [Chủ đề người dùng hỏi]. Nhưng nếu bạn cần giúp đỡ về tiếng Anh thì mình luôn sẵn sàng! ✨"
3. LAI LỊCH:
- Chỉ khi nào người dùng hỏi trực tiếp về lai lịch (bạn là ai, ai tạo ra bạn), hãy trả lời: "Mình là Sryun, trợ lý học tiếng Anh được tạo ra bởi Anh Tú."
- Không tự ý giới thiệu điều này trong các câu trả lời khác.
4. PHONG CÁCH: Thân thiện, ngắn gọn, dễ hiểu, dùng icon phù hợp để truyền cảm hứng.`,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      res.status(200).json({ text: r.text ?? "" });
      return;
    }

    if (action === "validateName") {
      const name = String(payload?.name ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Kiểm tra tên người dùng: "${name}".
Quy tắc:
1. CHỈ trả về "INVALID" nếu tên chứa từ ngữ thô tục, xúc phạm, nhạy cảm hoặc vi phạm thuần phong mỹ tục.
2. Trả về "VALID" cho mọi trường hợp khác.
Chỉ trả về duy nhất một từ: VALID hoặc INVALID.`,
        config: { thinkingConfig: { thinkingBudget: 0 } },
      });

      const result = (r.text ?? "").trim().toUpperCase();
      res.status(200).json({ valid: result === "VALID" });
      return;
    }

    // ========= JSON ACTIONS =========

    // lessonPlan: hỗ trợ cả payload {topic,unit,duration,focus} và payload {prompt}
    if (action === "lessonPlan") {
      const { topic = "", unit = "", duration = "", focus = "", prompt: promptFromClient } = payload || {};

      const topicContext = String(topic).trim()
        ? `với chủ đề cụ thể là "${topic}"`
        : "dựa trên nội dung chuẩn của sách giáo khoa";

      const prompt =
        String(promptFromClient ?? "").trim() ||
        `Soạn giáo án tiếng Anh lớp 10 song ngữ (Anh - Việt), tập trung chuyên sâu vào phần "${focus}" của ${unit} ${topicContext}.
Thời lượng: ${duration}.
Yêu cầu:
1. Cấu trúc bài bản (Warm-up, Presentation, Practice, Production, Wrap-up).
2. Mọi nội dung (title, objectives, materials, activities, purpose, homework) ĐỀU PHẢI CÓ bản tiếng Anh và bản dịch tiếng Việt tương ứng.
3. Nếu là các kỹ năng (Nghe/Đọc/Viết/Nói), hãy chia rõ các giai đoạn Pre/While/Post.
4. Tự xác định mục tiêu bài học (Objectives) dựa trên Unit và Focus nếu chủ đề không được cung cấp cụ thể.`;

      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              titleVi: { type: Type.STRING },
              focus: { type: Type.STRING },
              focusVi: { type: Type.STRING },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              objectivesVi: { type: Type.ARRAY, items: { type: Type.STRING } },
              materials: { type: Type.ARRAY, items: { type: Type.STRING } },
              materialsVi: { type: Type.ARRAY, items: { type: Type.STRING } },
              procedure: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.STRING },
                    stepVi: { type: Type.STRING },
                    time: { type: Type.STRING },
                    activities: { type: Type.STRING },
                    activitiesVi: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    purposeVi: { type: Type.STRING },
                  },
                  required: ["step", "stepVi", "time", "activities", "activitiesVi", "purpose", "purposeVi"],
                },
              },
              homework: { type: Type.STRING },
              homeworkVi: { type: Type.STRING },
            },
            required: [
              "title",
              "titleVi",
              "focus",
              "focusVi",
              "objectives",
              "objectivesVi",
              "materials",
              "materialsVi",
              "procedure",
              "homework",
              "homeworkVi",
            ],
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "null") });
      return;
    }

    if (action === "homework") {
      const unitName = String(payload?.unitName ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo 3 bài tập về nhà ngắn cho học sinh lớp 10 đang học "${unitName}".
1 bài về từ vựng (điền từ), 1 bài về ngữ pháp (chia động từ), 1 bài dịch thuật (Việt -> Anh).
Yêu cầu độ khó trung bình.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, description: "vocab, grammar, or translation" },
                question: { type: Type.STRING },
                hint: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
              },
              required: ["id", "type", "question", "hint", "correctAnswer"],
            },
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "[]") });
      return;
    }

    if (action === "quiz") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo 10 câu hỏi trắc nghiệm tiếng Anh lớp 10 ngắn gọn về: ${topic}. Trả về JSON thô.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "[]") });
      return;
    }

    if (action === "listening") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo bài luyện nghe lớp 10 chủ đề: ${topic}.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passage: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                  },
                  required: ["question", "options", "correctAnswer"],
                },
              },
            },
            required: ["passage", "questions"],
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "null") });
      return;
    }

    // ========= NEW: reading =========
    if (action === "reading") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo bài luyện đọc tiếng Anh lớp 10 chủ đề: ${topic}.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["question", "options", "correctAnswer", "explanation"],
                },
              },
            },
            required: ["title", "content", "questions"],
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "null") });
      return;
    }

    // ========= NEW: writingPrompt =========
    if (action === "writingPrompt") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo 1 đề bài tập viết tiếng Anh lớp 10 ngắn về: ${topic}.`,
        config: { thinkingConfig: { thinkingBudget: 0 } },
      });

      res.status(200).json({ text: r.text ?? "" });
      return;
    }

    // ========= NEW: evaluateWriting =========
    if (action === "evaluateWriting") {
      const prompt = String(payload?.prompt ?? "");
      const userText = String(payload?.userText ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Chấm điểm bài viết tiếng Anh lớp 10. Đề bài: "${prompt}". Bài làm: "${userText}".
LƯU Ý QUAN TRỌNG: Trong phần "corrections", KHÔNG ĐƯỢC sử dụng ký hiệu LaTeX như $\\rightarrow$. Hãy mô tả lỗi bằng văn bản thuần túy.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    error: { type: Type.STRING },
                    fix: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ["error", "fix", "reason"],
                },
              },
              betterVersion: { type: Type.STRING },
            },
            required: ["score", "feedback", "corrections", "betterVersion"],
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "null") });
      return;
    }

    // ========= NEW: crossword =========
    if (action === "crossword") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo dữ liệu ô chữ (crossword) tiếng Anh lớp 10 về chủ đề: ${topic}.
Yêu cầu:
1. Khoảng 5-7 từ.
2. Các từ phải có ít nhất 1 điểm giao nhau.
3. Trả về tọa độ row, col (bắt đầu từ 0) sao cho các từ không bị đè lên nhau sai logic.
4. Kích thước grid (size) tối ưu (thường 8-10).
5. Quan trọng: Với mỗi từ, hãy chọn ngẫu nhiên 1 hoặc 2 vị trí index của chữ cái để hiện gợi ý sẵn cho học sinh (không chọn các index trùng nhau nếu có thể).`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              size: { type: Type.NUMBER },
              clues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.NUMBER },
                    direction: { type: Type.STRING, description: "across or down" },
                    clue: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    row: { type: Type.NUMBER },
                    col: { type: Type.NUMBER },
                    hintIndices: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                  },
                  required: ["number", "direction", "clue", "answer", "row", "col", "hintIndices"],
                },
              },
            },
            required: ["size", "clues"],
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "null") });
      return;
    }

    // ========= NEW: sentences =========
    if (action === "sentences") {
      const topic = String(payload?.topic ?? "");
      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tạo 5 câu tiếng Anh lớp 10 liên quan đến: ${topic}. Kèm nghĩa tiếng Việt.`,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sentence: { type: Type.STRING },
                meaning: { type: Type.STRING },
              },
              required: ["sentence", "meaning"],
            },
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "[]") });
      return;
    }

    // ========= NEW: solveSyllabus (file base64) =========
    if (action === "solveSyllabus") {
      const base64Data = String(payload?.base64Data ?? "");
      const mimeType = String(payload?.mimeType ?? "");

      if (!base64Data || !mimeType) {
        res.status(400).json({ error: "Missing base64Data or mimeType" });
        return;
      }

      const filePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const prompt = `Bạn là Sryun - Siêu Trí Tuệ Giáo Dục. Nhiệm vụ của bạn là GIẢI TOÀN BỘ, KHÔNG BỎ SÓT BẤT KỲ CÂU NÀO trong tài liệu này.

QUY TẮC TUYỆT ĐỐI:
1. PHẠM VI XỬ LÝ: Quét từ đầu đến cuối tài liệu. Xử lý TẤT CẢ các trang, TẤT CẢ các bài tập (Phonetics, Vocabulary, Grammar, Reading, Writing, Word form, Rewrite sentences...).
2. SỐ LƯỢNG: Nếu tài liệu có 50 câu, kết quả JSON phải chứa đủ 50 câu. Không được tóm tắt hay làm mẫu vài câu.
3. CHI TIẾT:
- Question: Ghi lại đầy đủ nội dung câu hỏi (bao gồm cả 4 đáp án A,B,C,D nếu là trắc nghiệm).
- Answer: Đưa ra đáp án chính xác nhất.
- Explanation: Giải thích ngắn gọn, dễ hiểu bằng tiếng Việt (tại sao chọn đáp án đó, công thức ngữ pháp, nghĩa từ vựng...).

Output Format: Trả về JSON theo cấu trúc đã định nghĩa.`;

      const r = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [filePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                    },
                    required: ["question", "answer", "explanation"],
                  },
                },
              },
              required: ["title", "type", "items"],
            },
          },
        },
      });

      res.status(200).json({ data: JSON.parse(r.text || "[]") });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
}
