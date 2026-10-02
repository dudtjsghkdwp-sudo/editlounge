import { NextRequest, NextResponse } from "next/server";
import { getScenes, saveScene, saveScenes, getProjectById } from "@/lib/db/store";
import { Scene } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scenes = await getScenes(params.id);
    return NextResponse.json({ success: true, scenes });
  } catch (error: any) {
    console.error("Scene 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "Scene 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { error: "해당 프로젝트가 존재하지 않습니다." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Support batch creation (e.g. from AI Storyboard) or single creation
    if (Array.isArray(body.scenes)) {
      const createdScenes: Scene[] = body.scenes.map((s: Partial<Scene>, idx: number) => ({
        id: "scene-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6) + "-" + idx,
        projectId: params.id,
        sceneNumber: s.sceneNumber || idx + 1,
        startTime: s.startTime ?? 0,
        endTime: s.endTime ?? 3,
        description: s.description || `Scene ${idx + 1}`,
        shotType: s.shotType || "Medium Wide Shot",
        cameraAngle: s.cameraAngle || "Eye Level",
        lens: s.lens || "35mm",
        composition: s.composition || "Rule of Thirds",
        cameraMovement: s.cameraMovement || "Slow Push In",
        subjectPosition: s.subjectPosition || "Right third of frame",
        lighting: s.lighting || "Soft Natural Light",
        keyLight: s.keyLight || "45 degree front-left",
        fillLight: s.fillLight || "Soft ambient fill",
        rimLight: s.rimLight || "Subtle back edge rim light",
        depthOfField: s.depthOfField || "Shallow",
        background: s.background || "Cinematic setting",
        mood: s.mood || "Calm, sophisticated",
        colorTone: s.colorTone || "Natural cool-neutral",
        action: s.action || s.description || "",
        imagePrompt: s.imagePrompt || "",
        videoPrompt: s.videoPrompt || "",
        negativePrompt: s.negativePrompt || "",
        status: s.status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      await saveScenes(createdScenes);
      return NextResponse.json({ success: true, scenes: createdScenes });
    }

    // Single scene creation
    const existingScenes = await getScenes(params.id);
    const nextNumber = existingScenes.length > 0
      ? Math.max(...existingScenes.map((s) => s.sceneNumber)) + 1
      : 1;

    const newScene: Scene = {
      id: "scene-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      projectId: params.id,
      sceneNumber: body.sceneNumber || nextNumber,
      startTime: body.startTime ?? (nextNumber - 1) * 3,
      endTime: body.endTime ?? nextNumber * 3,
      description: body.description || `새 장면 ${nextNumber}`,
      shotType: body.shotType || "Medium Wide Shot",
      cameraAngle: body.cameraAngle || "Eye Level",
      lens: body.lens || "35mm",
      composition: body.composition || "Rule of Thirds",
      cameraMovement: body.cameraMovement || "Slow Push In",
      subjectPosition: body.subjectPosition || "Center",
      lighting: body.lighting || "Soft Natural Light",
      keyLight: body.keyLight || "45 degree soft key",
      fillLight: body.fillLight || "Soft ambient fill",
      rimLight: body.rimLight || "Subtle rim light",
      depthOfField: body.depthOfField || "Shallow",
      background: body.background || "Cinematic environment",
      mood: body.mood || "Calm",
      colorTone: body.colorTone || "Natural cinematic",
      action: body.action || "",
      imagePrompt: body.imagePrompt || "",
      videoPrompt: body.videoPrompt || "",
      negativePrompt: body.negativePrompt || "",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveScene(newScene);
    return NextResponse.json({ success: true, scene: saved });
  } catch (error: any) {
    console.error("Scene 생성 실패:", error);
    return NextResponse.json(
      { error: "Scene 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
