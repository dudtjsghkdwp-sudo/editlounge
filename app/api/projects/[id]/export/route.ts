import { NextRequest, NextResponse } from "next/server";
import { getProjectById, getScenes, getCharacters, getProductsProfiles, getStyles } from "@/lib/db/store";

// 19번: [프로젝트 JSON 내보내기]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });

    const scenes = await getScenes(params.id);
    const characters = await getCharacters();
    const products = await getProductsProfiles();
    const styles = await getStyles();

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      project,
      scenes,
      characters: characters.filter((c) => c.id === project.characterId),
      products: products.filter((p) => p.id === project.productId),
      styles: styles.filter((s) => s.id === project.stylePreset),
      generationMetadata: {
        totalScenes: scenes.length,
        totalDuration: project.duration,
        aspectRatio: project.aspectRatio,
      },
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(project.name)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "내보내기 실패" }, { status: 500 });
  }
}
