"use client";

import { useEffect, useState } from "react";
import { PenTool, Copy, Check, Search, Film, Layers } from "lucide-react";
import { Scene, Project } from "@/lib/types";

export default function PromptsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, scenesRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/projects/proj-eastar-01/scenes"), // default load sample scenes or all
        ]);
        const projData = await projRes.json();
        const scenesData = await scenesRes.json();

        if (projData.success) {
          setProjects(projData.projects);
          if (projData.projects.length > 0) {
            setSelectedProjectId(projData.projects[0].id);
            // fetch scenes for first project
            const sRes = await fetch(`/api/projects/${projData.projects[0].id}/scenes`);
            const sData = await sRes.json();
            if (sData.success) setScenes(sData.scenes);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleProjectChange = async (projId: string) => {
    setSelectedProjectId(projId);
    setIsLoading(true);
    try {
      const sRes = await fetch(`/api/projects/${projId}/scenes`);
      const sData = await sRes.json();
      if (sData.success) setScenes(sData.scenes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredScenes = scenes.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.imagePrompt && s.imagePrompt.toLowerCase().includes(term)) ||
      (s.videoPrompt && s.videoPrompt.toLowerCase().includes(term)) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-indigo-400" />
            AI 프롬프트 허브
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            프로젝트별 Image Prompt와 Video Prompt를 한눈에 검토하고 원클릭 복사합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="bg-[#151722] border border-[#262a39] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="프롬프트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#151722] border border-[#262a39] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 w-48"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-[#13151c] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredScenes.length === 0 ? (
        <div className="text-center py-20 bg-[#12141c] border border-dashed border-[#232734] rounded-2xl p-8">
          <p className="text-zinc-400 text-sm">등록된 프롬프트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredScenes.map((scene) => (
            <div
              key={scene.id}
              className="bg-[#12141c] border border-[#212534] rounded-xl p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#1f2330] pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300">
                    SCENE {String(scene.sceneNumber).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-zinc-300 font-medium">{scene.description}</span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  {scene.startTime}s ~ {scene.endTime}s
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Image Prompt */}
                <div className="bg-[#161823] p-3.5 rounded-lg border border-[#262a39] relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-blue-400 font-sans">
                      IMAGE PROMPT
                    </span>
                    <button
                      onClick={() => handleCopy(scene.imagePrompt || "", `${scene.id}-img`)}
                      className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
                      title="복사"
                    >
                      {copiedKey === `${scene.id}-img` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {scene.imagePrompt || "(생성된 이미지 프롬프트가 없습니다)"}
                  </p>
                </div>

                {/* Video Prompt */}
                <div className="bg-[#161823] p-3.5 rounded-lg border border-[#262a39] relative group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-purple-400 font-sans">
                      VIDEO PROMPT
                    </span>
                    <button
                      onClick={() => handleCopy(scene.videoPrompt || "", `${scene.id}-vid`)}
                      className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
                      title="복사"
                    >
                      {copiedKey === `${scene.id}-vid` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {scene.videoPrompt || "(생성된 영상 프롬프트가 없습니다)"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
