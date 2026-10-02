import { NextRequest, NextResponse } from "next/server";
import { getSavedPrompts, saveSavedPrompt } from "@/lib/db/store";
import { SavedPrompt } from "@/lib/types";

export async function GET() {
  try {
    const prompts = await getSavedPrompts();
    return NextResponse.json({ success: true, prompts });
  } catch (error: any) {
    return NextResponse.json({ error: "프롬프트 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, promptText, category, isFavorite } = await req.json();
    if (!promptText) {
      return NextResponse.json({ error: "프롬프트 내용이 필요합니다." }, { status: 400 });
    }

    const newPrompt: SavedPrompt = {
      id: "saved-" + Date.now().toString(36),
      title: title || "저장된 프롬프트",
      promptText,
      category: category || "Commercial",
      isFavorite: !!isFavorite,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveSavedPrompt(newPrompt);
    return NextResponse.json({ success: true, prompt: saved });
  } catch (error: any) {
    return NextResponse.json({ error: "프롬프트 저장 실패" }, { status: 500 });
  }
}
