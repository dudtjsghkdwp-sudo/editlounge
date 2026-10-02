import { NextRequest, NextResponse } from "next/server";
import { reorderScenes } from "@/lib/db/store";

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
