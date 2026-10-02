import { NextRequest, NextResponse } from "next/server";
import { checkPreflightQuality } from "@/lib/ai/consistency";
import { getProjectById, getScenes } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId가 필요합니다." }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const scenes = await getScenes(projectId);
    const report = checkPreflightQuality(project, scenes);

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("품질 검사 실패:", error);
    return NextResponse.json({ error: "품질 검사에 실패했습니다." }, { status: 500 });
  }
}
