// services/gemini.ts
type ApiResponse<T> = { data?: T; text?: string; valid?: boolean; error?: string };

async function callGemini<T>(
  action: string,
  payload: Record<string, any>
): Promise<ApiResponse<T>> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  const data = (await res.json()) as ApiResponse<T>;

  if (!res.ok) {
    throw new Error(data?.error || `Gemini API error (${res.status})`);
  }

  return data;
}

export const getAITutorResponse = async (userInput: string) => {
  try {
    const res = await callGemini<string>("tutor", { userInput });
    return res.text || "Sryun đang bận một chút, thử lại sau nhé!";
  } catch (e) {
    console.error("AI tutor error:", e);
    return "Lỗi kết nối AI.";
  }
};

export const generateLessonPlan = async (
  topic: string,
  unit: string,
  duration: string,
  focus: string
) => {
  try {
    const res = await callGemini<any>("lessonPlan", { topic, unit, duration, focus });
    return res.data ?? null;
  } catch (e) {
    console.error("Lesson plan error:", e);
    return null;
  }
};

export const generateHomework = async (unitName: string) => {
  try {
    const res = await callGemini<any[]>("homework", { unitName });
    return res.data ?? [];
  } catch (e) {
    console.error("Homework error:", e);
    return [];
  }
};

export const validateNameAppropriateness = async (name: string): Promise<boolean> => {
  try {
    const res = await callGemini<never>("validateName", { name });
    return !!res.valid;
  } catch (e) {
    console.error("Validate name error:", e);
    return true; // fallback an toàn
  }
};

export const generateQuizQuestions = async (topic: string) => {
  try {
    const res = await callGemini<any[]>("quiz", { topic });
    return res.data ?? [];
  } catch (e) {
    console.error("Quiz error:", e);
    return [];
  }
};

export const generateListeningExercise = async (topic: string) => {
  try {
    const res = await callGemini<any>("listening", { topic });
    return res.data ?? null;
  } catch (e) {
    console.error("Listening error:", e);
    return null;
  }
};

// Nếu backend chưa có action này thì bạn add sau.
// Tạm thời để không crash build.
export const generateReadingExercise = async (topic: string) => {
  try {
    const res = await callGemini<any>("reading", { topic });
    return res.data ?? null;
  } catch (e) {
    console.error("Reading error:", e);
    return null;
  }
};

// Nếu backend chưa có action này thì bạn add sau.
// Tạm thời để không crash build.
export const evaluateWriting = async (prompt: string, userText: string) => {
  try {
    const res = await callGemini<any>("evaluateWriting", { prompt, userText });
    return res.data ?? null;
  } catch (e) {
    console.error("Evaluate writing error:", e);
    return null;
  }
};

// Nếu backend chưa có action này thì bạn add sau.
// Tạm thời để không crash build.
export const generateWritingPrompt = async (topic: string) => {
  try {
    const res = await callGemini<any>("writingPrompt", { topic });
    return res.text || "Hãy viết một đoạn văn ngắn về gia đình của bạn.";
  } catch (e) {
    console.error("Writing prompt error:", e);
    return "Viết về sở thích của bạn.";
  }
};

// ✅ CÁI QUAN TRỌNG: phải có export này để CrosswordGame import được
export const generateCrosswordData = async (topic: string) => {
  try {
    const res = await callGemini<any>("crossword", { topic });
    return res.data ?? null;
  } catch (e) {
    console.error("Crossword error:", e);
    return null;
  }
};

// Nếu backend chưa có action này thì bạn add sau.
// Tạm thời để không crash build.
export const generateSentencesForGame = async (topic: string) => {
  try {
    const res = await callGemini<any[]>("sentences", { topic });
    return res.data ?? [];
  } catch (e) {
    console.error("Sentences error:", e);
    return [];
  }
};

// Nếu backend chưa có action này thì bạn add sau.
// Tạm thời để không crash build.
export const solveSyllabus = async (base64Data: string, mimeType: string) => {
  try {
    const res = await callGemini<any[]>("solveSyllabus", { base64Data, mimeType });
    return res.data ?? [];
  } catch (e) {
    console.error("Solve syllabus error:", e);
    return [];
  }
};
