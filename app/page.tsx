"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Film,
  Clock,
  LayoutGrid,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
  Clapperboard,
  Layers,
  Zap,
  Upload,
} from "lucide-react";
import { Project } from "@/lib/types";
import CreateProjectModal from "@/components/CreateProjectModal";
import QuickStartModal from "@/components/QuickStartModal";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("프로젝트 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProjects((prev) => [data.project, ...prev]);
        router.push(`/projects/${data.project.id}`);
      } else {
        alert(data.error || "가져오기 실패");
      }
    } catch (err) {
      alert("올바른 JSON 파일이 아닙니다.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("정말 이 프로젝트를 삭제하시겠습니까? 관련 Scene 데이터도 모두 삭제됩니다.")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("삭제 실패:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Hero */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141724] via-[#171a2b] to-[#12141e] border border-[#222738] p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              영상 PD를 위한 AI 프리프로덕션 워크스테이션
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              AI VIDEO DIRECTOR
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
              장면 기획, 15축 카메라 촬영 설계, 조명 및 미장센 구축, 정적/동적 AI 프롬프트 생성을
              자동화하여 고품질 영상 제작을 가속화합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsQuickStartOpen(true)}
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-black" />
              빠른 영상 제작
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트
            </button>

            <label className="px-4 py-3.5 rounded-xl font-semibold text-xs bg-[#1a1d28] hover:bg-[#232838] border border-[#2b3145] text-zinc-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{isImporting ? "가져오는 중..." : "JSON 가져오기"}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              최근 프로젝트
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {projects.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-400">진행 중인 영상 기획 프로젝트를 선택하여 상세 작업실로 들어갑니다.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-56 bg-[#13151c] border border-[#1f232e] rounded-xl animate-pulse p-6"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-[#12141c] border border-dashed border-[#232734] rounded-2xl p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center">
              <Clapperboard className="w-7 h-7 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">생성된 프로젝트가 없습니다</h3>
              <p className="text-xs text-zinc-400 mt-1">
                새 프로젝트 버튼을 눌러 첫 번째 영상 프로젝트를 시작해보세요.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트 생성
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="cinema-card rounded-xl p-5 flex flex-col justify-between group relative cursor-pointer"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/60">
                      {project.type || "TVCF"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                        {project.aspectRatio}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-800 transition"
                        title="프로젝트 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Project Name */}
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                    {project.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || "등록된 설명이 없습니다."}
                  </p>
                </div>

                {/* Card Meta Footer */}
                <div className="pt-4 border-t border-[#1e222e] space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{project.duration}초</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>{project.sceneCount} Scenes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      상세 보기
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
          router.push(`/projects/${newProj.id}`);
        }}
      />

      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        onCreated={(newProj) => {
          setProjects((prev) => [newProj, ...prev]);
        }}
      />
    </div>
  );
}
