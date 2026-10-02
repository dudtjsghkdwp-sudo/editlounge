import { NextRequest, NextResponse } from "next/server";
import { generateStoryboard } from "@/lib/ai/storyboard";
import { Project } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project: Project = body.project;

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    const scenes = await generateStoryboard(project);
    return NextResponse.json({ success: true, scenes });
  } catch (error: any) {
    console.error("AI 콘티 생성 실패:", error);
    return NextResponse.json(
      { error: "AI 콘티 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
