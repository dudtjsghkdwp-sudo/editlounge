import { ShotDesignData } from "../types";
import {
  SHOT_TYPES,
  CAMERA_ANGLES,
  LENSES,
  CAMERA_MOVEMENTS,
  LIGHTINGS,
} from "../presets/shotOptions";
import { callOpenAIJson } from "./openai";

export async function generateShotDesign(
  sceneDescription: string,
  projectContext?: {
    stylePreset?: string;
    character?: string;
    brand?: string;
    aspectRatio?: string;
  }
): Promise<ShotDesignData> {
  const systemPrompt = `You are a legendary director of photography (DP) and film director.
Analyze the scene description and design the camera, lighting, and visual composition like a master cinematographer.
Output strictly in JSON format with exactly the following 15 keys:
{
  "shotType": "One of: ${SHOT_TYPES.join(", ")}",
  "cameraAngle": "One of: ${CAMERA_ANGLES.join(", ")}",
  "lens": "One of: ${LENSES.join(", ")}",
  "composition": "e.g. Rule of Thirds, Center Framing, Leading Lines, Golden Ratio",
  "cameraMovement": "One of: ${CAMERA_MOVEMENTS.join(", ")}",
  "subjectPosition": "e.g. Right third of frame, Dead center, Foreground left",
  "lighting": "One of: ${LIGHTINGS.join(", ")}",
  "keyLight": "e.g. 45 degree front-left soft key, Golden window light",
  "fillLight": "e.g. Low intensity ambient fill, Soft bounce",
  "rimLight": "e.g. Subtle back edge rim separation, Hair backlight",
  "depthOfField": "Shallow, Medium, or Deep",
  "background": "Detailed description of the environment/set",
  "mood": "Emotional tone, e.g. Calm, sophisticated, hopeful",
  "colorTone": "Color palette, e.g. Natural cool-neutral cinematic, Teal & Orange",
  "action": "Precise cinematic actor movement and physical action"
}`;

  const userPrompt = `Scene Description: ${sceneDescription}
Visual Style: ${projectContext?.stylePreset || "Cinematic Commercial"}
Protagonist Character: ${projectContext?.character || "Main subject"}
Brand/Product: ${projectContext?.brand || "None"}
Aspect Ratio: ${projectContext?.aspectRatio || "16:9"}`;

  const fallback = (): ShotDesignData => {
    // Intelligent rule-based selection matching the description
    const desc = sceneDescription.toLowerCase();

    let shotType = "Medium Wide Shot";
    let lens = "35mm";
    let cameraMovement = "Slow Push In";
    let cameraAngle = "Eye Level";
    let lighting = "Soft Natural Light";

    if (desc.includes("얼굴") || desc.includes("표정") || desc.includes("눈") || desc.includes("미소")) {
      shotType = "Close Up";
      lens = "85mm";
      cameraMovement = "Static";
    } else if (desc.includes("도착") || desc.includes("풍경") || desc.includes("바다") || desc.includes("전경") || desc.includes("하늘")) {
      shotType = "Wide Shot";
      lens = "24mm";
      cameraMovement = "Slow Pull Out";
      cameraAngle = "Low Angle";
    } else if (desc.includes("걸어가") || desc.includes("이동") || desc.includes("달리")) {
      shotType = "Medium Shot";
      lens = "35mm";
      cameraMovement = "Tracking Shot";
    } else if (desc.includes("제품") || desc.includes("디테일") || desc.includes("손")) {
      shotType = "Macro Shot";
      lens = "100mm Macro";
      cameraMovement = "Rack Focus";
    }

    if (desc.includes("노을") || desc.includes("저녁") || desc.includes("햇살")) {
      lighting = "Golden Hour";
    } else if (desc.includes("실내") || desc.includes("스튜디오")) {
      lighting = "Three Point Lighting";
    }

    return {
      shotType,
      cameraAngle,
      lens,
      composition: "Rule of Thirds",
      cameraMovement,
      subjectPosition: "Right third of frame",
      lighting,
      keyLight: "45-degree front-left directional soft key",
      fillLight: "Soft low-intensity ambient fill",
      rimLight: "Subtle back edge rim light for separation",
      depthOfField: lens === "85mm" || lens === "100mm Macro" ? "Shallow" : "Medium",
      background: "Cinematic, rich atmospheric background fitting the scene narrative",
      mood: "Calm, sophisticated, hopeful",
      colorTone: "Natural cool-neutral cinematic with refined contrast",
      action: sceneDescription,
    };
  };

  return await callOpenAIJson<ShotDesignData>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    fallback
  );
}
