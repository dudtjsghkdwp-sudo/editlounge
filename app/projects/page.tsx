"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Film, Clock, Layers, Calendar, Trash2, ArrowRight } from "lucide-react";
import { Project } from "@/lib/types";
import CreateProjectModal from "@/components/CreateProjectModal";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("프로젝트를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.type && p.type.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-blue-400" />
            프로젝트 관리
          </h1>
          <p className="text-xs text-zinc-400 mt-1">제작 중인 모든 영상 기획 프로젝트를 열람하고 관리합니다.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="프로젝트 / 브랜드 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#151722] border border-[#252838] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 w-56"
          />
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            새 프로젝트
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[#13151c] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#12141c] border border-dashed border-[#232734] rounded-2xl p-8">
          <p className="text-zinc-400 text-sm">일치하는 프로젝트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="cinema-card rounded-xl p-5 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/60">
                    {project.type || "TVCF"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                      {project.aspectRatio}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                  {project.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {project.description || "등록된 설명이 없습니다."}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1e222e] space-y-2 text-xs text-zinc-400">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{project.duration}초</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>{project.sceneCount} Scenes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1">
                    열기 <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newP) => {
          setProjects((prev) => [newP, ...prev]);
          router.push(`/projects/${newP.id}`);
        }}
      />
    </div>
  );
}
