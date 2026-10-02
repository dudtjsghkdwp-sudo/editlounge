import { NextRequest, NextResponse } from "next/server";
import { getSavedPrompts, saveSavedPrompt, deleteSavedPrompt } from "@/lib/db/store";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prompts = await getSavedPrompts();
    const existing = prompts.find((p) => p.id === params.id);
    if (!existing) return NextResponse.json({ error: "프롬프트를 찾을 수 없습니다." }, { status: 404 });

    const updates = await req.json();
    const updated = await saveSavedPrompt({
      ...existing,
      ...updates,
      id: params.id,
    });
    return NextResponse.json({ success: true, prompt: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "프롬프트 업데이트 실패" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteSavedPrompt(params.id);
    if (!success) return NextResponse.json({ error: "삭제 실패" }, { status: 404 });
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
