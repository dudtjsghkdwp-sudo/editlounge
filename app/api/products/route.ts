import { NextRequest, NextResponse } from "next/server";
import { getProductsProfiles, saveProductProfile } from "@/lib/db/store";
import { ProductProfile } from "@/lib/types";

export async function GET() {
  try {
    const products = await getProductsProfiles();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: "제품 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "제품 이름을 입력해주세요." }, { status: 400 });
    }

    const newProd: ProductProfile = {
      id: "prod-" + Date.now().toString(36),
      name: body.name,
      brand: body.brand || "",
      modelName: body.modelName || "",
      color: body.color || "",
      material: body.material || "",
      shape: body.shape || "",
      size: body.size || "",
      keyFeatures: body.keyFeatures || "",
      referenceImageUrl: body.referenceImageUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveProductProfile(newProd);
    return NextResponse.json({ success: true, product: saved });
  } catch (error: any) {
    return NextResponse.json({ error: "제품 등록에 실패했습니다." }, { status: 500 });
  }
}
