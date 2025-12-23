
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// BỘ NHỚ ĐỆM (CACHE) - Lưu trữ AudioBuffer để không phải gọi API lại
const audioCache = new Map<string, AudioBuffer>();

// Chuyển đổi Base64 sang Uint8Array
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Giải mã dữ liệu PCM thô sang AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Fallback: Sử dụng Web Speech API (Giọng đọc trình duyệt)
export const speakWithBrowser = (text: string) => {
  return new Promise<boolean>((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error("Browser does not support TTS.");
      resolve(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; 
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Google US English")) || 
                  voices.find(v => v.lang === "en-US") ||
                  voices.find(v => v.lang.startsWith("en"));
    
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve(true);
    utterance.onerror = (e) => {
      console.error("Browser TTS error", e);
      resolve(false);
    }

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Lấy AudioBuffer từ Gemini TTS (CÓ CACHING)
 */
export const getAIAudioBuffer = async (text: string, audioCtx: AudioContext): Promise<AudioBuffer | null> => {
  // 1. Kiểm tra Cache trước
  const cacheKey = `${text}-${audioCtx.sampleRate}`;
  if (audioCache.has(cacheKey)) {
    console.log("🔊 Playing from Cache (Saved API Quota)");
    // Clone buffer để tránh vấn đề khi play nhiều lần trên một số trình duyệt cũ
    const cachedBuffer = audioCache.get(cacheKey)!;
    // Ta trả về trực tiếp reference, AudioContext hiện đại xử lý tốt việc dùng lại buffer data
    return cachedBuffer;
  }

  try {
    // 2. Nếu chưa có trong cache, gọi API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }], // Prompt ngắn gọn hơn để tiết kiệm token
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioData = decodeBase64(base64Audio);
    const buffer = await decodeAudioData(audioData, audioCtx, 24000, 1);

    // 3. Lưu vào Cache
    audioCache.set(cacheKey, buffer);
    
    return buffer;
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
        console.warn("Gemini TTS Quota Exceeded. Switching to Browser Fallback.");
    } else {
        console.error("Lỗi lấy AudioBuffer từ AI:", error);
    }
    return null;
  }
};

/**
 * Hàm phát âm thanh thông minh (AI -> Cache -> Browser Fallback)
 */
export const speakWithAI = async (text: string) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await getAIAudioBuffer(text, audioCtx);
    
    if (buffer) {
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
      return true;
    }
    
    return await speakWithBrowser(text);
  } catch (error) {
    return await speakWithBrowser(text);
  }
};
