import { NextRequest, NextResponse } from "next/server";
import { getProjects, saveProject } from "@/lib/db/store";
import { Project } from "@/lib/types";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error("프로젝트 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      aspectRatio,
      duration,
      sceneCount,
      stylePreset,
      globalStyle,
      character,
      brand,
      description,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "프로젝트 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const newProject: Project = {
      id: "proj-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name,
      type: type || "광고",
      aspectRatio: aspectRatio || "16:9",
      duration: Number(duration) || 30,
      sceneCount: Number(sceneCount) || 5,
      stylePreset: stylePreset || "premium-tvcf",
      globalStyle: globalStyle || "Premium TVCF",
      character: character || "주인공",
      brand: brand || "",
      description: description || "",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveProject(newProject);
    return NextResponse.json({ success: true, project: saved });
  } catch (error: any) {
    console.error("프로젝트 생성 실패:", error);
    return NextResponse.json(
      { error: "프로젝트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
