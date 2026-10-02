import { NextRequest, NextResponse } from "next/server";
import { getProductById, saveProductProfile, deleteProductProfile } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) return NextResponse.json({ error: "제품을 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await getProductById(params.id);
    if (!existing) return NextResponse.json({ error: "제품을 찾을 수 없습니다." }, { status: 404 });
    const updates = await req.json();
    const updated = await saveProductProfile({
      ...existing,
      ...updates,
      id: params.id,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteProductProfile(params.id);
    if (!success) return NextResponse.json({ error: "삭제 실패" }, { status: 404 });
    return NextResponse.json({ success: true, message: "삭제되었습니다." });
  } catch (error: any) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
