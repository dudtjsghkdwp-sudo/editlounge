"use client";

import { useEffect, useState } from "react";
import { Video as VideoIcon, Film, Play, Download, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Scene, Project } from "@/lib/types";

export default function VideosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenesWithVideos, setScenesWithVideos] = useState<{ scene: Scene; project: Project }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const projRes = await fetch("/api/projects");
        const projData = await projRes.json();
        if (projData.success) {
          setProjects(projData.projects);
          const list: { scene: Scene; project: Project }[] = [];
          for (const p of projData.projects) {
            const scRes = await fetch(`/api/projects/${p.id}/scenes`);
            const scData = await scRes.json();
            if (scData.success) {
              for (const s of scData.scenes) {
                if (s.videoUrl) {
                  list.push({ scene: s, project: p });
                }
              }
            }
          }
          setScenesWithVideos(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
            <Film className="w-3.5 h-3.5" />
            AI VIDEO GALLERY
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <VideoIcon className="w-6 h-6 text-purple-400" />
            AI 생성 비디오 갤러리
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            각 Scene의 키 이미지를 기반으로 렌더링된 AI 비디오 클립을 모아보고 재생 및 다운로드합니다.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-[#13151c] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : scenesWithVideos.length === 0 ? (
        <div className="text-center py-20 bg-[#12141c] border border-dashed border-[#232734] rounded-2xl p-8 space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">생성된 비디오가 없습니다</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            프로젝트 상세 페이지에서 Scene 이미지를 생성한 후 [🎬 영상 생성]을 클릭하여 비디오를 렌더링해보세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition"
          >
            프로젝트 작업실로 이동
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenesWithVideos.map(({ scene, project }) => (
            <div
              key={scene.id}
              className="bg-[#12141c] border border-[#212534] hover:border-purple-600/40 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#232738]">
                  <video src={scene.videoUrl} controls className="w-full h-full object-cover" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span className="font-bold text-purple-400">
                      SCENE {String(scene.sceneNumber).padStart(2, "0")}
                    </span>
                    <span>
                      {scene.startTime}s ~ {scene.endTime}s ({scene.endTime - scene.startTime}초)
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{project.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {scene.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1e222e] flex items-center justify-between text-xs">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  프로젝트 보기
                </Link>
                <a
                  href={scene.videoUrl}
                  download={`${project.name}_Scene_${scene.sceneNumber}.mp4`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-[#191c28] hover:bg-purple-950/60 border border-[#282e42] text-purple-300 font-semibold text-[11px] flex items-center gap-1.5 transition"
                >
                  <Download className="w-3 h-3 text-purple-400" />
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
