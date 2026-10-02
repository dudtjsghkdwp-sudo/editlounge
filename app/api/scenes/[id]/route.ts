import { NextRequest, NextResponse } from "next/server";
import { getSceneById, saveScene, deleteScene } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scene = await getSceneById(params.id);
    if (!scene) {
      return NextResponse.json(
        { error: "Scene을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, scene });
  } catch (error: any) {
    console.error("Scene 조회 실패:", error);
    return NextResponse.json(
      { error: "Scene 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getSceneById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Scene을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updates = await req.json();
    const updated = await saveScene({
      ...existing,
      ...updates,
      id: params.id,
    });

    return NextResponse.json({ success: true, scene: updated });
  } catch (error: any) {
    console.error("Scene 수정 실패:", error);
    return NextResponse.json(
      { error: "Scene 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteScene(params.id);
    if (!success) {
      return NextResponse.json(
        { error: "Scene을 삭제하지 못했습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    console.error("Scene 삭제 실패:", error);
    return NextResponse.json(
      { error: "Scene 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
