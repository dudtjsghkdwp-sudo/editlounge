import { NextRequest, NextResponse } from "next/server";
import { saveProject, saveScenes } from "@/lib/db/store";
import { Project, Scene } from "@/lib/types";

// 20번: [프로젝트 JSON 가져오기]
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.project || !data.project.name) {
      return NextResponse.json(
        { error: "유효하지 않은 프로젝트 JSON 포맷입니다. (project 객체 누락)" },
        { status: 400 }
      );
    }

    const newProjectId = "proj-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const importedProject: Project = {
      ...data.project,
      id: newProjectId,
      name: `${data.project.name} (가져옴)`,
      createdAt: now,
      updatedAt: now,
    };

    await saveProject(importedProject);

    let importedScenes: Scene[] = [];
    if (Array.isArray(data.scenes)) {
      importedScenes = data.scenes.map((s: Partial<Scene>, idx: number) => ({
        ...s,
        id: "scene-" + Date.now().toString(36) + idx + Math.random().toString(36).substring(2, 5),
        projectId: newProjectId,
        createdAt: now,
        updatedAt: now,
      })) as Scene[];

      await saveScenes(importedScenes);
    }

    return NextResponse.json({ success: true, project: importedProject, scenes: importedScenes });
  } catch (error: any) {
    console.error("JSON 가져오기 실패:", error);
    return NextResponse.json(
      { error: "JSON 파일 파싱 또는 가져오기에 실패했습니다. 올바른 형식의 JSON인지 확인해주세요." },
      { status: 400 }
    );
  }
}
