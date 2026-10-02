import { NextRequest, NextResponse } from "next/server";
import { getProjectById, saveProject, deleteProject } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("프로젝트 조회 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getProjectById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updates = await req.json();
    const updated = await saveProject({
      ...existing,
      ...updates,
      id: params.id,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    console.error("프로젝트 수정 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteProject(params.id);
    if (!success) {
      return NextResponse.json(
        { error: "프로젝트를 삭제하지 못했습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    console.error("프로젝트 삭제 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
