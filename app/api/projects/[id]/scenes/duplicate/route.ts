import { NextRequest, NextResponse } from "next/server";
import { getSceneById, getScenes, saveScene, reorderScenes } from "@/lib/db/store";
import { Scene } from "@/lib/types";

// 14번: [Scene 복제]
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sceneId } = await req.json();
    if (!sceneId) {
      return NextResponse.json({ error: "sceneId가 필요합니다." }, { status: 400 });
    }

    const original = await getSceneById(sceneId);
    if (!original) {
      return NextResponse.json({ error: "복제할 Scene을 찾을 수 없습니다." }, { status: 404 });
    }

    const allScenes = await getScenes(params.id);
    const nextNumber = allScenes.length > 0 ? Math.max(...allScenes.map((s) => s.sceneNumber)) + 1 : 1;
    const dur = Math.max(1, original.endTime - original.startTime);
    const lastEndTime = allScenes.length > 0 ? Math.max(...allScenes.map((s) => s.endTime)) : 0;

    const duplicatedScene: Scene = {
      ...original,
      id: "scene-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      sceneNumber: nextNumber,
      startTime: lastEndTime,
      endTime: lastEndTime + dur,
      description: `${original.description} (복제)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveScene(duplicatedScene);
    return NextResponse.json({ success: true, scene: saved });
  } catch (error: any) {
    console.error("Scene 복제 실패:", error);
    return NextResponse.json({ error: "Scene 복제에 실패했습니다." }, { status: 500 });
  }
}

// 15, 16번: Scene 순서 변경 및 타임라인 자동 재계산
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sceneIds } = await req.json();
    if (!Array.isArray(sceneIds)) {
      return NextResponse.json({ error: "sceneIds 배열이 필요합니다." }, { status: 400 });
    }

    const reordered = await reorderScenes(params.id, sceneIds);
    return NextResponse.json({ success: true, scenes: reordered });
  } catch (error: any) {
    console.error("Scene 순서 변경 실패:", error);
    return NextResponse.json({ error: "Scene 순서 변경에 실패했습니다." }, { status: 500 });
  }
}
