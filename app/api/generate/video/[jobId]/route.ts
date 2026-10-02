import { NextRequest, NextResponse } from "next/server";
import { defaultVideoProvider } from "@/lib/video/provider";
import { getSceneById, saveScene } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await defaultVideoProvider.getVideoStatus(params.jobId);

    // If job has completed or failed, synchronize with the scene
    if (job.sceneId) {
      const scene = await getSceneById(job.sceneId);
      if (scene) {
        if (job.status === "completed" && job.resultUrl && scene.videoUrl !== job.resultUrl) {
          await saveScene({
            ...scene,
            videoUrl: job.resultUrl,
            videoStatus: "completed",
          });
        } else if (job.status === "failed") {
          await saveScene({
            ...scene,
            videoStatus: "failed",
            errorMessage: job.error,
          });
        } else if (job.status === "processing" && scene.videoStatus !== "processing") {
          await saveScene({
            ...scene,
            videoStatus: "processing",
          });
        }
      }
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Job 상태 조회 실패:", error);
    return NextResponse.json(
      { error: "영상 생성 상태를 조회하지 못했습니다." },
      { status: 404 }
    );
  }
}
