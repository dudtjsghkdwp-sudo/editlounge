import { NextRequest, NextResponse } from "next/server";
import { generateShotDesign } from "@/lib/ai/shot-design";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sceneDescription, projectContext } = body;

    if (!sceneDescription) {
      return NextResponse.json(
        { error: "장면 설명이 누락되었습니다." },
        { status: 400 }
      );
    }

    const design = await generateShotDesign(sceneDescription, projectContext);
    return NextResponse.json({ success: true, design });
  } catch (error: any) {
    console.error("AI 촬영 설계 실패:", error);
    return NextResponse.json(
      { error: "AI 촬영 설계에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
