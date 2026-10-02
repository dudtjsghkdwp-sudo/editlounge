import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

export async function GET() {
  try {
    let apiKey = process.env.OPENAI_API_KEY || "";
    let model = process.env.OPENAI_TEXT_MODEL || "gpt-4o";
    let videoModel = process.env.OPENAI_VIDEO_MODEL || "sora-1.0";

    if (fs.existsSync(ENV_LOCAL_PATH)) {
      const content = fs.readFileSync(ENV_LOCAL_PATH, "utf-8");
      const keyMatch = content.match(/OPENAI_API_KEY=(.*)/);
      const modelMatch = content.match(/OPENAI_TEXT_MODEL=(.*)/);
      const videoModelMatch = content.match(/OPENAI_VIDEO_MODEL=(.*)/);
      if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim();
      if (modelMatch && modelMatch[1]) model = modelMatch[1].trim();
      if (videoModelMatch && videoModelMatch[1]) videoModel = videoModelMatch[1].trim();
    }

    const hasValidKey = apiKey.length > 10;
    const maskedKey = hasValidKey
      ? apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length - 4)
      : "";

    return NextResponse.json({
      success: true,
      hasValidKey,
      maskedKey,
      model,
      videoModel,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "설정을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, model, videoModel } = await req.json();

    const keyToSave = apiKey !== undefined ? apiKey.trim() : process.env.OPENAI_API_KEY || "";
    const modelToSave = model || process.env.OPENAI_TEXT_MODEL || "gpt-4o";
    const videoModelToSave = videoModel || process.env.OPENAI_VIDEO_MODEL || "sora-1.0";

    const lines = [
      `OPENAI_API_KEY=${keyToSave}`,
      `OPENAI_TEXT_MODEL=${modelToSave}`,
      `OPENAI_VIDEO_MODEL=${videoModelToSave}`,
    ];

    fs.writeFileSync(ENV_LOCAL_PATH, lines.join("\n") + "\n", "utf-8");
    process.env.OPENAI_API_KEY = keyToSave;
    process.env.OPENAI_TEXT_MODEL = modelToSave;
    process.env.OPENAI_VIDEO_MODEL = videoModelToSave;

    return NextResponse.json({
      success: true,
      message: "설정이 성공적으로 저장되었습니다.",
    });
  } catch (error: any) {
    console.error("설정 저장 실패:", error);
    return NextResponse.json(
      { error: "설정 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
