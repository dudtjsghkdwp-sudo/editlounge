import { getOpenAIConfig } from "../ai/openai";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
];

export async function generateSceneImage(prompt: string, aspectRatio?: string): Promise<string> {
  const { apiKey } = getOpenAIConfig();

  if (apiKey && apiKey.length > 20) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.slice(0, 1000),
          n: 1,
          size: aspectRatio === "9:16" ? "1024x1792" : aspectRatio === "1:1" ? "1024x1024" : "1792x1024",
          quality: "standard",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) {
          return data.data[0].url;
        }
      } else {
        const errText = await res.text();
        console.warn("OpenAI Image Generation non-200:", errText);
      }
    } catch (err) {
      console.warn("OpenAI Image API error, using cinematic fallback:", err);
    }
  }

  // Fallback to high-resolution cinematic reference image
  const idx = Math.abs(prompt.length) % SAMPLE_IMAGES.length;
  return SAMPLE_IMAGES[idx];
}
