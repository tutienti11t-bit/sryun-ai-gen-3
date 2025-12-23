import { GoogleGenAI, Modality } from "@google/genai";

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
    const text = String(req.body?.text ?? "");

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });

    const base64Audio =
      r.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

    res.status(200).json({ base64Audio });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Server error" });
  }
}
