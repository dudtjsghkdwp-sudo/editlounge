import { Project, Scene } from "../types";
import { callOpenAIJson } from "./openai";

interface StoryboardAiResponse {
  scenes: Array<{
    sceneNumber: number;
    startTime: number;
    endTime: number;
    description: string;
    action: string;
    mood: string;
  }>;
}

export async function generateStoryboard(project: Project): Promise<Partial<Scene>[]> {
  const duration = project.duration || 30;
  const count = project.sceneCount || 5;
  const timePerScene = Math.max(1, Math.round(duration / count));

  const systemPrompt = `You are a world-class professional commercial film director and storyboard artist.
Your job is to break down a video project into exactly ${count} cinematic scenes, totaling ${duration} seconds.
Output strictly in JSON format matching the schema:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "startTime": 0,
      "endTime": ${timePerScene},
      "description": "한 줄 한국어 장면 설명",
      "action": "피사체의 구체적인 움직임과 동선",
      "mood": "분위기 (예: Calm / Hopeful)"
    }
  ]
}
Each scene MUST have continuous logical flow, consistent character, and compelling narrative arc.
Language for description, action, mood must be in Korean (with English keywords where appropriate).`;

  const userPrompt = `Project Title: ${project.name}
Video Type: ${project.type}
Aspect Ratio: ${project.aspectRatio}
Duration: ${duration} seconds
Scene Count: ${count}
Visual Style: ${project.globalStyle || project.stylePreset}
Character/Protagonist: ${project.character}
Brand/Product: ${project.brand || "None"}
Story/Description: ${project.description}`;

  const fallback = (): StoryboardAiResponse => {
    // Generate intelligent default storyboard based on narrative curve
    const scenes: StoryboardAiResponse["scenes"] = [];
    const narrativePhases = [
      { name: "도입 및 인물/공간 소개", mood: "차분함, 호기심 (Calm, Curious)" },
      { name: "상황의 전개 및 주요 행동 시작", mood: "흥미로움, 기대감 (Intrigued, Anticipatory)" },
      { name: "갈등 또는 몰입의 고조/핵심 경험", mood: "깊은 몰입, 감동 (Immersive, Emotional)" },
      { name: "클라이맥스 및 브랜드 가치 발현", mood: "환희, 찬란함 (Euphoric, Inspiring)" },
      { name: "여운과 결말 및 브랜드 인상", mood: "자신감, 희망 (Confident, Hopeful)" },
    ];

    for (let i = 0; i < count; i++) {
      const start = i * timePerScene;
      const end = i === count - 1 ? duration : (i + 1) * timePerScene;
      const phase = narrativePhases[i % narrativePhases.length];

      scenes.push({
        sceneNumber: i + 1,
        startTime: start,
        endTime: end,
        description: `${project.name} - [Scene ${i + 1}] ${phase.name} : ${project.character || "주인공"}의 시선`,
        action: `${project.character || "주인공"}이(가) ${project.description || "장면"}에 몰입하며 자연스러운 제스처와 시선 이동을 보여준다.`,
        mood: phase.mood,
      });
    }

    return { scenes };
  };

  const result = await callOpenAIJson<StoryboardAiResponse>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    fallback
  );

  return result.scenes.map((s, idx) => ({
    sceneNumber: idx + 1,
    startTime: s.startTime,
    endTime: s.endTime,
    description: s.description,
    action: s.action,
    mood: s.mood,
    status: "draft" as const,
  }));
}
