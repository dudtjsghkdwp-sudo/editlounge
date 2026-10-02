import { NextRequest, NextResponse } from "next/server";
import { generateSceneImage } from "@/lib/image/provider";
import { getSceneById, saveScene } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const { sceneId, prompt, aspectRatio } = await req.json();

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId가 누락되었습니다." }, { status: 400 });
    }

    const scene = await getSceneById(sceneId);
    if (!scene) {
      return NextResponse.json({ error: "Scene을 찾을 수 없습니다." }, { status: 404 });
    }

    const promptToUse = prompt || scene.imagePrompt || scene.description;
    const imageUrl = await generateSceneImage(promptToUse, aspectRatio);

    const updated = await saveScene({
      ...scene,
      imageUrl,
      imageStatus: "completed",
    });

    return NextResponse.json({ success: true, scene: updated, imageUrl });
  } catch (error: any) {
    console.error("이미지 생성 실패:", error);
    return NextResponse.json({ error: "이미지 생성에 실패했습니다." }, { status: 500 });
  }
}
