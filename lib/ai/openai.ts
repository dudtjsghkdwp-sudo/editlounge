export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_TEXT_MODEL || "gpt-4o";
  return { apiKey, model };
}

export async function callOpenAIJson<T>(
  messages: OpenAIMessage[],
  fallbackGenerator: () => T
): Promise<T> {
  const { apiKey, model } = getOpenAIConfig();

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_openai_api_key_here") {
    // API Key not set: use the specialized cinematic fallback generator
    return fallbackGenerator();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenAI API HTTP Error [${response.status}]:`, errText);
      // Fallback gracefully on quota or auth errors
      return fallbackGenerator();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI로부터 빈 응답을 받았습니다.");
    }

    return JSON.parse(content) as T;
  } catch (err: any) {
    console.error("OpenAI Call Error, using fallback:", err?.message || err);
    return fallbackGenerator();
  }
}
