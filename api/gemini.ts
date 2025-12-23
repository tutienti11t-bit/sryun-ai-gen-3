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

    // action: "tutor" | "lessonPlan" | "homework" | "validateName" | "quiz" | "listening"
    if (!action) {
      res.status(400).json({ error: "Missing action" });
      return;
    }

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

    // Các action JSON (giữ gần giống logic cũ)
    if (action === "lessonPlan") {
      const { topic = "", unit = "", duration = "", focus = "" } = payload || {};
      const topicContext = String(topic).trim()
        ? `với chủ đề cụ thể là "${topic}"`
        : "dựa trên nội dung chuẩn của sách giáo khoa";
      const prompt = `Soạn giáo án tiếng Anh lớp 10 song ngữ (Anh - Việt), tập trung chuyên sâu vào phần "${focus}" của ${unit} ${topicContext}.
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
                  required: [
                    "step",
                    "stepVi",
                    "time",
                    "activities",
                    "activitiesVi",
                    "purpose",
                    "purposeVi",
                  ],
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
                type: { type: Type.STRING },
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
        contents: `Tạo bài luyện nghe lớp 10 chủ đề: ${topic}. Trả về JSON thô.`,
        config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
      });

      // nếu model trả JSON string
      let data: any = null;
      try { data = JSON.parse(r.text || "null"); } catch { data = r.text || ""; }

      res.status(200).json({ data });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
}
