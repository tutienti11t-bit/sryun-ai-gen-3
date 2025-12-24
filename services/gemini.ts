// aiClient.ts (copy paste nguyên file)

type GeminiResponse = {
  text?: string;
  valid?: boolean;
  data?: any;
  error?: string;
};

async function callGemini(action: string, payload: Record<string, any>) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as GeminiResponse;
      msg = j.error || msg;
    } catch {
      try {
        msg = (await res.text()) || msg;
      } catch {}
    }
    throw new Error(msg);
  }

  return (await res.json()) as GeminiResponse;
}

// =====================
// Tutor
// =====================
export const getAITutorResponse = async (userInput: string) => {
  try {
    const r = await callGemini("tutor", { userInput });
    return r.text || "Sryun đang bận một chút, thử lại sau nhé!";
  } catch (e) {
    console.error("AI tutor error:", e);
    return "Lỗi kết nối AI.";
  }
};

// =====================
// Lesson Plan
// (Server tự build prompt từ topic/unit/duration/focus)
// =====================
export const generateLessonPlan = async (
  topic: string,
  unit: string,
  duration: string,
  focus: string
) => {
  try {
    const r = await callGemini("lessonPlan", { topic, unit, duration, focus });
    return r.data ?? null;
  } catch (e) {
    console.error("Lesson plan error:", e);
    return null;
  }
};

// =====================
// Homework
// =====================
export const generateHomework = async (unitName: string) => {
  try {
    const r = await callGemini("homework", { unitName });
    return (r.data as any[]) ?? [];
  } catch (e) {
    console.error("Homework error:", e);
    return [];
  }
};

// =====================
// Validate Name
// =====================
export const validateNameAppropriateness = async (
  name: string
): Promise<boolean> => {
  try {
    const r = await callGemini("validateName", { name });
    return !!r.valid;
  } catch (e) {
    console.error("Validate name error:", e);
    return true; // fallback an toàn
  }
};

// =====================
// Quiz
// =====================
export const generateQuizQuestions = async (topic: string) => {
  try {
    const r = await callGemini("quiz", { topic });
    return (r.data as any[]) ?? [];
  } catch (e) {
    console.error("Quiz error:", e);
    return [];
  }
};

// =====================
// Listening
// =====================
export const generateListeningExercise = async (topic: string) => {
  try {
    const r = await callGemini("listening", { topic });
    return r.data ?? null;
  } catch (e) {
    console.error("Listening error:", e);
    return null;
  }
};
