"use client";

import { useState } from "react";
import { X, Globe, Sparkles, User, Box, Sun, Palette, Compass, Save } from "lucide-react";
import { Project } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSaved: (updatedProject: Project) => void;
}

export default function GlobalSettingsModal({
  isOpen,
  onClose,
  project,
  onSaved,
}: Props) {
  const [globalCharacter, setGlobalCharacter] = useState(project.globalCharacter || project.character || "");
  const [globalProduct, setGlobalProduct] = useState(project.globalProduct || project.brand || "");
  const [globalEnvironment, setGlobalEnvironment] = useState(project.globalEnvironment || "");
  const [globalLighting, setGlobalLighting] = useState(project.globalLighting || "");
  const [globalColor, setGlobalColor] = useState(project.globalColor || "");
  const [globalStyle, setGlobalStyle] = useState(project.globalStyle || project.stylePreset || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalCharacter,
          globalProduct,
          globalEnvironment,
          globalLighting,
          globalColor,
          globalStyle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSaved(data.project);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("글로벌 설정 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-blue-500/30 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-[#212534] bg-[#161823] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                프로젝트 공통 글로벌 설정 (Global Settings)
              </h3>
              <p className="text-xs text-zinc-400">
                모든 Scene의 프롬프트와 연출 설계에 일관되게 주입되는 기본값입니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Global Character */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Global Character (공통 인물 및 고정 의상)
            </label>
            <input
              type="text"
              value={globalCharacter}
              onChange={(e) => setGlobalCharacter(e.target.value)}
              placeholder="예: 20대 후반 한국인 남성, 베이지 린넨 재킷, 단정한 흑발 쉼표머리"
              className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Global Product */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              Global Product / Brand (공통 제품 모델 및 디자인)
            </label>
            <input
              type="text"
              value={globalProduct}
              onChange={(e) => setGlobalProduct(e.target.value)}
              placeholder="예: 이스타항공 보잉 737-8 항공기 (레드 윙렛 스타 로고)"
              className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Global Environment */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Global Environment (공통 배경 및 공간적 톤앤매너)
            </label>
            <input
              type="text"
              value={globalEnvironment}
              onChange={(e) => setGlobalEnvironment(e.target.value)}
              placeholder="예: 현대적인 곡면 글래스 공항 터미널 및 청명한 하늘 위의 기내"
              className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Global Lighting & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Global Lighting (공통 조명 룩)
              </label>
              <input
                type="text"
                value={globalLighting}
                onChange={(e) => setGlobalLighting(e.target.value)}
                placeholder="예: Soft Natural Light with Golden Hour sunbeams"
                className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                Global Color (공통 컬러 그레이딩)
              </label>
              <input
                type="text"
                value={globalColor}
                onChange={(e) => setGlobalColor(e.target.value)}
                placeholder="예: Sky blue, pearl white, warm golden highlights"
                className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#212534] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              공통 설정 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
