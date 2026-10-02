import { NextRequest, NextResponse } from "next/server";
import { checkAllConsistency } from "@/lib/ai/consistency";
import { getProjectById, getScenes, getCharacterById, getProductById } from "@/lib/db/store";

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
    const character = project.characterId ? await getCharacterById(project.characterId) : null;
    const product = project.productId ? await getProductById(project.productId) : null;

    const report = await checkAllConsistency(project, scenes, character, product);
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("일관성 검사 실패:", error);
    return NextResponse.json({ error: "일관성 검사에 실패했습니다." }, { status: 500 });
  }
}
