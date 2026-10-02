import { NextRequest, NextResponse } from "next/server";
import { getDirectorRecommendation } from "@/lib/ai/director";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, projectStyle } = body;

    if (!concept) {
      return NextResponse.json(
        { error: "장면 아이디어/콘셉트가 누락되었습니다." },
        { status: 400 }
      );
    }

    const recommendation = await getDirectorRecommendation(concept, projectStyle);
    return NextResponse.json({ success: true, recommendation });
  } catch (error: any) {
    console.error("AI 감독 추천 실패:", error);
    return NextResponse.json(
      { error: "AI 감독 추천에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
