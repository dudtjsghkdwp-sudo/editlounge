import { NextRequest, NextResponse } from "next/server";
import { getWorkflowTemplates, saveWorkflowTemplate } from "@/lib/db/store";
import { WorkflowTemplate } from "@/lib/types";

export async function GET() {
  try {
    const templates = await getWorkflowTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ error: "템플릿 목록 조회 실패" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "템플릿 이름을 입력해주세요." }, { status: 400 });
    }

    const newTemplate: WorkflowTemplate = {
      id: "tpl-" + Date.now().toString(36),
      name: body.name,
      description: body.description || "",
      type: body.type || "TVCF",
      duration: body.duration || 30,
      sceneCount: body.sceneCount || 5,
      aspectRatio: body.aspectRatio || "16:9",
      stylePreset: body.stylePreset || "premium-tvcf",
      isCustom: true,
    };

    const saved = await saveWorkflowTemplate(newTemplate);
    return NextResponse.json({ success: true, template: saved });
  } catch (error: any) {
    return NextResponse.json({ error: "템플릿 저장 실패" }, { status: 500 });
  }
}
