import { NextRequest, NextResponse } from "next/server";
import { defaultVideoProvider } from "@/lib/video/provider";
import { getSceneById, saveScene } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const { projectId, sceneId, prompt, referenceImageUrl, duration, aspectRatio } = await req.json();

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId가 누락되었습니다." }, { status: 400 });
    }

    const scene = await getSceneById(sceneId);
    if (!scene) {
      return NextResponse.json({ error: "Scene을 찾을 수 없습니다." }, { status: 404 });
    }

    const videoPromptToUse = prompt || scene.videoPrompt || scene.action || scene.description;

    // Reference image is passed from scene.imageUrl or explicit parameter
    const refImage = referenceImageUrl || scene.imageUrl;

    const job = await defaultVideoProvider.createVideo({
      projectId: projectId || scene.projectId,
      sceneId,
      prompt: videoPromptToUse,
      referenceImageUrl: refImage,
      duration: duration || Math.max(1, scene.endTime - scene.startTime),
      aspectRatio,
    });

    // Update scene with current job
    await saveScene({
      ...scene,
      videoStatus: job.status,
      videoJobId: job.id,
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("영상 생성 요청 실패:", error);
    return NextResponse.json(
      { error: "현재 영상 생성 요청을 처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
