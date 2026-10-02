import { DirectorRecommendation } from "../types";
import {
  SHOT_TYPES,
  CAMERA_ANGLES,
  LENSES,
  CAMERA_MOVEMENTS,
  LIGHTINGS,
} from "../presets/shotOptions";
import { callOpenAIJson } from "./openai";

export async function getDirectorRecommendation(
  concept: string,
  projectStyle?: string
): Promise<DirectorRecommendation> {
  const systemPrompt = `You are an elite Film & Commercial Director.
Given a raw scene concept, provide your visionary directorial blueprint: Shot, Angle, Lens, Composition, Camera Movement, Lighting, Depth of Field, Action, Mood, and a professional Director's Note explaining WHY this visual setup elevates the emotional impact.
Output JSON matching:
{
  "shotType": "One of: ${SHOT_TYPES.join(", ")}",
  "cameraAngle": "One of: ${CAMERA_ANGLES.join(", ")}",
  "lens": "One of: ${LENSES.join(", ")}",
  "composition": "string",
  "cameraMovement": "One of: ${CAMERA_MOVEMENTS.join(", ")}",
  "lighting": "One of: ${LIGHTINGS.join(", ")}",
  "depthOfField": "Shallow | Medium | Deep",
  "action": "Detailed cinematic action and blocking",
  "mood": "Emotional mood keywords",
  "directorNote": "Professional Korean director note explaining the creative rationale and visual storytelling intent"
}`;

  const userPrompt = `Concept/Action: ${concept}
Overall Visual Style: ${projectStyle || "Premium TVCF"}`;

  const fallback = (): DirectorRecommendation => {
    return {
      shotType: "Medium Wide Shot",
      cameraAngle: "Eye Level",
      lens: "35mm",
      composition: "Rule of Thirds with Deep Perspective",
      cameraMovement: "Slow Push In",
      lighting: "Soft Natural Light",
      depthOfField: "Shallow",
      action: `${concept} — 인물의 미세한 호흡과 시선 처리에 집중하며 감정의 여운을 극대화합니다.`,
      mood: "Calm, Anticipatory, Poetic",
      directorNote:
        "35mm 렌즈의 자연스러운 원근감과 인물을 화면 우측 3분할에 배치하여 공간의 개방감과 인물의 내면 심리를 동시에 담아냅니다. 느린 푸시인(Slow Push In) 무브먼트를 통해 시청자의 몰입을 점진적으로 유도하는 연출입니다.",
    };
  };

  return await callOpenAIJson<DirectorRecommendation>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    fallback
  );
}
