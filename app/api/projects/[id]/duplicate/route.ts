import { NextRequest, NextResponse } from "next/server";
import { getProjectById, getScenes, saveProject, saveScenes } from "@/lib/db/store";
import { Project, Scene } from "@/lib/types";

// 18번: [프로젝트 복제]
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const original = await getProjectById(params.id);
    if (!original) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const newProjectId = "proj-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const duplicatedProject: Project = {
      ...original,
      id: newProjectId,
      name: `${original.name} (사본)`,
      createdAt: now,
      updatedAt: now,
    };

    await saveProject(duplicatedProject);

    // Duplicate all scenes
    const originalScenes = await getScenes(params.id);
    const duplicatedScenes: Scene[] = originalScenes.map((s, idx) => ({
      ...s,
      id: "scene-" + Date.now().toString(36) + idx + Math.random().toString(36).substring(2, 5),
      projectId: newProjectId,
      createdAt: now,
      updatedAt: now,
    }));

    await saveScenes(duplicatedScenes);

    return NextResponse.json({ success: true, project: duplicatedProject, scenes: duplicatedScenes });
  } catch (error: any) {
    console.error("프로젝트 복제 실패:", error);
    return NextResponse.json({ error: "프로젝트 복제에 실패했습니다." }, { status: 500 });
  }
}
