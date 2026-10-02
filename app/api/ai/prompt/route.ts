import { NextRequest, NextResponse } from "next/server";
import { generatePrompts } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene, project } = body;

    if (!scene) {
      return NextResponse.json(
        { error: "Scene 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    const prompts = await generatePrompts(scene, project);
    return NextResponse.json({ success: true, prompts });
  } catch (error: any) {
    console.error("AI 프롬프트 생성 실패:", error);
    return NextResponse.json(
      { error: "AI 프롬프트 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
