import { Scene, Project } from "../types";
import { DEFAULT_NEGATIVE_PROMPT } from "../presets/shotOptions";
import { callOpenAIJson } from "./openai";

export interface PromptGenerationResult {
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
}

export async function generatePrompts(
  scene: Partial<Scene>,
  project?: Partial<Project>
): Promise<PromptGenerationResult> {
  const systemPrompt = `You are a world-class prompt engineer specializing in state-of-the-art AI Video and Image generation models (e.g. Midjourney v6, Flux, Runway Gen-3, Luma Dream Machine, Sora, Kling).
Given the scene parameters, generate 3 specialized prompts in JSON format:
{
  "imagePrompt": "A single static frame description strictly adhering to the structure: Subject -> Character -> Environment -> Action -> Shot -> Camera Angle -> Lens -> Composition -> Lighting -> Color -> Mood -> Style -> Consistency keywords",
  "videoPrompt": "A motion-centric prompt describing temporal movement strictly adhering to: Camera Movement -> Subject Movement -> Environmental Movement -> Pacing -> Natural Motion details -> Consistency enforcement",
  "negativePrompt": "Comma separated negative triggers"
}

Rules for IMAGE PROMPT:
- Written in clear, evocative cinematic English.
- Emphasize photorealistic texture, authentic lighting, accurate anatomy.
- Include camera lens, framing, lighting, color, mood.

Rules for VIDEO PROMPT:
- Focus on kinematics and temporal change.
- Must describe camera movement, subject movement, environmental subtleties, smooth pacing.
- Emphasize 'natural motion, fluid transitions, no warping, photorealistic'.

Rules for NEGATIVE PROMPT:
- Maintain quality protection, anti-distortion, and consistency tags.`;

  const userPrompt = `Project: ${project?.name || "Commercial Video"}
Style: ${project?.globalStyle || project?.stylePreset || "Cinematic Commercial"}
Character / Subject: ${project?.character || "Main Character"}
Brand / Product: ${project?.brand || "None"}

Scene Number: ${scene.sceneNumber || 1}
Scene Description: ${scene.description || ""}
Action: ${scene.action || ""}
Shot Type: ${scene.shotType || "Medium Wide Shot"}
Camera Angle: ${scene.cameraAngle || "Eye Level"}
Lens: ${scene.lens || "35mm"}
Composition: ${scene.composition || "Rule of Thirds"}
Camera Movement: ${scene.cameraMovement || "Slow Push In"}
Subject Position: ${scene.subjectPosition || "Right third of frame"}
Lighting: ${scene.lighting || "Soft Natural Light"}
Key Light: ${scene.keyLight || "45 degree front-left"}
Fill Light: ${scene.fillLight || "Soft ambient fill"}
Rim Light: ${scene.rimLight || "Subtle back edge rim light"}
Depth of Field: ${scene.depthOfField || "Shallow"}
Background: ${scene.background || "Rich cinematic environment"}
Mood: ${scene.mood || "Calm, sophisticated, hopeful"}
Color Tone: ${scene.colorTone || "Natural cool-neutral cinematic"}`;

  const fallback = (): PromptGenerationResult => {
    const characterDesc = project?.character || "A stylish protagonist";
    const brandDesc = project?.brand ? `representing ${project.brand}` : "";
    const actionDesc = scene.action || scene.description || "standing gracefully";
    const shotDesc = scene.shotType || "Medium wide shot";
    const angleDesc = scene.cameraAngle || "Eye-level camera angle";
    const lensDesc = scene.lens || "35mm lens";
    const compDesc = scene.composition || "Rule of thirds composition";
    const lightDesc = scene.lighting || "Soft cinematic lighting";
    const moodDesc = scene.mood || "Calm, sophisticated, hopeful mood";
    const colorDesc = scene.colorTone || "Natural cool-neutral cinematic color palette";
    const bgDesc = scene.background || "modern architectural environment";
    const moveDesc = scene.cameraMovement || "Slow Push In";

    const imagePrompt = [
      `A cinematic commercial photograph of ${characterDesc} ${brandDesc}, ${actionDesc}.`,
      `Set inside ${bgDesc}.`,
      `${shotDesc}, ${angleDesc}, ${lensDesc}, ${compDesc}.`,
      `${lightDesc}, natural skin texture, delicate highlights, ${scene.depthOfField || "shallow"} depth of field.`,
      `Color graded in ${colorDesc}.`,
      `High-end commercial aesthetic, ${moodDesc}, 8k resolution, razor sharp focus, photorealistic masterpiece.`,
    ].join("\n\n");

    const videoPrompt = [
      `${characterDesc} in ${bgDesc}, ${actionDesc}.`,
      `The camera executes a smooth, cinematic ${moveDesc.toLowerCase()} maintaining steady visual cadence.`,
      `The subject performs subtle, natural body movements with fluid micro-expressions.`,
      `Gentle environmental atmosphere with soft light play and subtle background depth drift.`,
      `Smooth cinematic pacing, lifelike organic motion, no sudden jarring camera shake, consistent character morphology throughout.`,
    ].join("\n\n");

    return {
      imagePrompt,
      videoPrompt,
      negativePrompt: DEFAULT_NEGATIVE_PROMPT,
    };
  };

  return await callOpenAIJson<PromptGenerationResult>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    fallback
  );
}
