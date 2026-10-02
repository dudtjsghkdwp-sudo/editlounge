import { NextRequest, NextResponse } from "next/server";
import { getStyles, saveStyle } from "@/lib/db/store";
import { StylePreset } from "@/lib/types";

export async function GET() {
  try {
    const styles = await getStyles();
    return NextResponse.json({ success: true, styles });
  } catch (error: any) {
    console.error("스타일 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "스타일 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      cameraStyle,
      lightingStyle,
      colorStyle,
      compositionStyle,
      movementStyle,
      promptTemplate,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "스타일 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const newStyle: StylePreset = {
      id: "style-" + Date.now().toString(36),
      name,
      description: description || "",
      cameraStyle: cameraStyle || "",
      lightingStyle: lightingStyle || "",
      colorStyle: colorStyle || "",
      compositionStyle: compositionStyle || "",
      movementStyle: movementStyle || "",
      promptTemplate: promptTemplate || "",
    };

    const saved = await saveStyle(newStyle);
    return NextResponse.json({ success: true, style: saved });
  } catch (error: any) {
    console.error("스타일 생성 실패:", error);
    return NextResponse.json(
      { error: "스타일 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
