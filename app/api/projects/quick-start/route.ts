import { NextRequest, NextResponse } from "next/server";
import { saveProject, saveScenes } from "@/lib/db/store";
import { generateStoryboard } from "@/lib/ai/storyboard";
import { generateShotDesign } from "@/lib/ai/shot-design";
import { generatePrompts } from "@/lib/ai/prompts";
import { Project, Scene } from "@/lib/types";

// 27번: [빠른 영상 제작] (Quick Start)
export async function POST(req: NextRequest) {
  try {
    const { name, type, duration, aspectRatio, description, character, stylePreset } = await req.json();

    const sceneCount = duration <= 15 ? 3 : duration <= 30 ? 5 : 6;
    const projectId = "proj-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      name: name || `${type || "TVCF"} - ${description?.slice(0, 15) || "새 영상"}`,
      type: type || "TVCF",
      aspectRatio: aspectRatio || "16:9",
      duration: Number(duration) || 30,
      sceneCount,
      stylePreset: stylePreset || "premium-tvcf",
      globalStyle: stylePreset || "Premium TVCF",
      character: character || "20대 한국인 남성",
      description: description || "새로운 AI 영상 기획",
      status: "in_progress",
      createdAt: now,
      updatedAt: now,
    };

    await saveProject(newProject);

    // 1. AI Storyboard
    const storyboardScenes = await generateStoryboard(newProject);

    // 2. AI Shot Design & Prompts for each scene
    const completeScenes: Scene[] = [];
    for (let i = 0; i < storyboardScenes.length; i++) {
      const s = storyboardScenes[i];
      const sceneId = "scene-" + Date.now().toString(36) + i + Math.random().toString(36).substring(2, 5);

      const shotDesign = await generateShotDesign(s.description || `Scene ${i + 1}`, {
        stylePreset: newProject.stylePreset,
        character: newProject.character,
        aspectRatio: newProject.aspectRatio,
      });

      const tempScene: Partial<Scene> = {
        ...s,
        ...shotDesign,
        sceneNumber: i + 1,
      };

      const prompts = await generatePrompts(tempScene, newProject);

      completeScenes.push({
        ...shotDesign,
        id: sceneId,
        projectId,
        sceneNumber: i + 1,
        startTime: s.startTime ?? i * 3,
        endTime: s.endTime ?? (i + 1) * 3,
        description: s.description || `Scene ${i + 1}`,
        action: s.action || shotDesign.action || "",
        mood: s.mood || shotDesign.mood || "",
        imagePrompt: prompts.imagePrompt,
        videoPrompt: prompts.videoPrompt,
        negativePrompt: prompts.negativePrompt,
        status: "ready",
        createdAt: now,
        updatedAt: now,
      });
    }

    await saveScenes(completeScenes);

    return NextResponse.json({ success: true, project: newProject, scenes: completeScenes });
  } catch (error: any) {
    console.error("빠른 영상 제작 실패:", error);
    return NextResponse.json({ error: "빠른 영상 제작에 실패했습니다." }, { status: 500 });
  }
}
