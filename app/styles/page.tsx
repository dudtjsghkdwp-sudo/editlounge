"use client";

import { useEffect, useState } from "react";
import { Palette, Plus, X, Sparkles, Check } from "lucide-react";
import { StylePreset } from "@/lib/types";

export default function StylesPage() {
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Style Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cameraStyle, setCameraStyle] = useState("");
  const [lightingStyle, setLightingStyle] = useState("");
  const [colorStyle, setColorStyle] = useState("");
  const [compositionStyle, setCompositionStyle] = useState("");
  const [movementStyle, setMovementStyle] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");

  const fetchStyles = async () => {
    try {
      const res = await fetch("/api/styles");
      const data = await res.json();
      if (data.success) {
        setStyles(data.styles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  const handleCreateStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description,
          cameraStyle,
          lightingStyle,
          colorStyle,
          compositionStyle,
          movementStyle,
          promptTemplate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStyles((prev) => [...prev, data.style]);
        setIsModalOpen(false);
        setName("");
        setDescription("");
        setCameraStyle("");
        setLightingStyle("");
        setColorStyle("");
        setCompositionStyle("");
        setMovementStyle("");
        setPromptTemplate("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-pink-400" />
            스타일 프리셋 라이브러리
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            영상 종류별 최적의 카메라 장비, 조명 세팅, 컬러 룩앤필 프리셋을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 transition shadow-lg shadow-pink-600/30"
        >
          <Plus className="w-4 h-4" />
          새 스타일 추가
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-[#13151c] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {styles.map((style) => (
            <div
              key={style.id}
              className="bg-[#12141c] border border-[#212534] hover:border-pink-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-400 bg-pink-950/60 px-2.5 py-0.5 rounded-full border border-pink-800/50">
                    PRESET
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">ID: {style.id}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {style.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{style.description}</p>

                <div className="space-y-1.5 pt-2 text-[11px]">
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block font-semibold text-[10px]">📷 카메라 & 렌즈</span>
                    <span className="text-zinc-200 line-clamp-1">{style.cameraStyle || "—"}</span>
                  </div>
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block font-semibold text-[10px]">💡 조명 스타일</span>
                    <span className="text-zinc-200 line-clamp-1">{style.lightingStyle || "—"}</span>
                  </div>
                  <div className="bg-[#171923] p-2 rounded-lg border border-[#242838]">
                    <span className="text-zinc-400 block font-semibold text-[10px]">🎨 색감 & 톤</span>
                    <span className="text-zinc-200 line-clamp-1">{style.colorStyle || "—"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1e222e] text-[10px] text-zinc-400">
                <span className="font-semibold text-zinc-400 block mb-0.5">프롬프트 템플릿:</span>
                <p className="text-zinc-400 line-clamp-2 italic font-mono">
                  {style.promptTemplate || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Style Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#252838] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#202330] bg-[#161823] flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                새 스타일 프리셋 추가
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStyle} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">스타일 이름 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: Cyberpunk Neo-Noir"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">스타일 설명</label>
                <textarea
                  rows={2}
                  placeholder="스타일의 분위기와 연출 의도"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">카메라 & 렌즈 스타일</label>
                <input
                  type="text"
                  placeholder="예: Anamorphic lens with cyan horizontal flares"
                  value={cameraStyle}
                  onChange={(e) => setCameraStyle(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">조명 세팅 (Lighting)</label>
                <input
                  type="text"
                  placeholder="예: High contrast neon magenta and cyan rim light"
                  value={lightingStyle}
                  onChange={(e) => setLightingStyle(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">컬러 그레이딩 (Color)</label>
                <input
                  type="text"
                  placeholder="예: Deep obsidian black, neon accents, dystopian tone"
                  value={colorStyle}
                  onChange={(e) => setColorStyle(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">프롬프트 템플릿 키워드</label>
                <input
                  type="text"
                  placeholder="예: Cyberpunk cinematic masterpiece, neon glow, wet pavement reflections"
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#292d3c] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold"
                >
                  프리셋 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
