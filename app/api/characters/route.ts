import { NextRequest, NextResponse } from "next/server";
import { getCharacters, saveCharacter } from "@/lib/db/store";
import { CharacterProfile } from "@/lib/types";

export async function GET() {
  try {
    const characters = await getCharacters();
    return NextResponse.json({ success: true, characters });
  } catch (error: any) {
    return NextResponse.json({ error: "캐릭터 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "캐릭터 이름을 입력해주세요." }, { status: 400 });
    }

    const newChar: CharacterProfile = {
      id: "char-" + Date.now().toString(36),
      name: body.name,
      gender: body.gender || "공통",
      age: body.age || "20대",
      appearance: body.appearance || "",
      hairstyle: body.hairstyle || "",
      costume: body.costume || "",
      bodyType: body.bodyType || "",
      facialFeatures: body.facialFeatures || "",
      features: body.features || "",
      referenceImageUrl: body.referenceImageUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveCharacter(newChar);
    return NextResponse.json({ success: true, character: saved });
  } catch (error: any) {
    return NextResponse.json({ error: "캐릭터 등록에 실패했습니다." }, { status: 500 });
  }
}
