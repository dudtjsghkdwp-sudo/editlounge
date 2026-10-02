"use client";

import { useState } from "react";
import { X, Sparkles, Film, Clock, LayoutGrid, Palette, User, Tag, FileText } from "lucide-react";
import { Project, VideoType, VideoAspectRatio } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

const VIDEO_TYPES: VideoType[] = [
  "광고",
  "TVCF",
  "YouTube Shorts",
  "제품 광고",
  "브랜드 영상",
  "다큐멘터리",
  "판타지",
  "뮤직비디오",
  "기타",
];

const ASPECT_RATIOS: { value: VideoAspectRatio; label: string; desc: string }[] = [
  { value: "16:9", label: "16:9 와이드", desc: "TVCF, YouTube 가로, 영화" },
  { value: "9:16", label: "9:16 버티컬", desc: "Shorts, Reels, TikTok" },
  { value: "1:1", label: "1:1 정방형", desc: "Instagram 피드, 제품 쇼케이스" },
];

const STYLE_OPTIONS = [
  { id: "premium-tvcf", name: "Premium TVCF", label: "프리미엄 TVCF" },
  { id: "cinematic-film", name: "Cinematic Film", label: "시네마틱 필름" },
  { id: "youtube-shorts", name: "YouTube Shorts", label: "유튜브 쇼츠" },
  { id: "fantasy", name: "Fantasy", label: "판타지 / 에픽" },
  { id: "product-commercial", name: "Product Commercial", label: "제품 커머셜" },
  { id: "airline-commercial", name: "Airline Commercial", label: "항공 / 여행 감성" },
  { id: "documentary", name: "Documentary", label: "다큐멘터리" },
  { id: "beauty-commercial", name: "Beauty Commercial", label: "뷰티 / 코스메틱" },
  { id: "food-commercial", name: "Food Commercial", label: "푸드 / 미식" },
  { id: "custom", name: "Custom", label: "커스텀 직접 정의" },
];

export default function CreateProjectModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<VideoType>("TVCF");
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [duration, setDuration] = useState<number>(30);
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [stylePreset, setStylePreset] = useState("premium-tvcf");
  const [character, setCharacter] = useState("20대 한국인 남성");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("프로젝트 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedStyleObj = STYLE_OPTIONS.find((s) => s.id === stylePreset);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          aspectRatio,
          duration: Number(duration),
          sceneCount: Number(sceneCount),
          stylePreset,
          globalStyle: selectedStyleObj?.name || stylePreset,
          character: character.trim() || "주인공",
          brand: brand.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "프로젝트 생성에 실패했습니다.");
      }

      onCreated(data.project);
      onClose();
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12141c] border border-[#252834] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#222533] flex items-center justify-between bg-[#151722]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                새 영상 프로젝트 생성
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">영상 PD의 기획 의도와 촬영 스타일을 설정합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Workflow Template Quick Selector (Requirement 26) */}
          <div className="bg-[#171924] p-3 rounded-xl border border-[#262c3e] space-y-2">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              제작 템플릿 빠른 적용 (Workflow Templates)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "30초 TVCF", duration: 30, sceneCount: 5, aspectRatio: "16:9", type: "TVCF", style: "premium-tvcf" },
                { name: "15초 Shorts", duration: 15, sceneCount: 3, aspectRatio: "9:16", type: "YouTube Shorts", style: "youtube-shorts" },
                { name: "60초 Shorts", duration: 60, sceneCount: 6, aspectRatio: "9:16", type: "YouTube Shorts", style: "youtube-shorts" },
                { name: "제품 광고", duration: 20, sceneCount: 4, aspectRatio: "16:9", type: "제품 광고", style: "product-commercial" },
                { name: "항공사 광고", duration: 30, sceneCount: 5, aspectRatio: "16:9", type: "브랜드 영상", style: "airline-commercial" },
                { name: "AI 공모전", duration: 45, sceneCount: 6, aspectRatio: "16:9", type: "판타지", style: "fantasy" },
              ].map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => {
                    setDuration(tpl.duration);
                    setSceneCount(tpl.sceneCount);
                    setAspectRatio(tpl.aspectRatio as VideoAspectRatio);
                    setType(tpl.type as VideoType);
                    setStylePreset(tpl.style);
                    if (!name) setName(`${tpl.name} 프로젝트`);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#202434] hover:bg-blue-600/30 hover:border-blue-500 border border-[#2f354a] text-zinc-300 hover:text-white transition"
                >
                  ⚡ {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              프로젝트 이름 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 이스타항공 브랜드 TVCF - 날아오르는 순간"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Video Type & Aspect Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                영상 종류
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VideoType)}
                className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {VIDEO_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-blue-400" />
                영상 비율
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.value}
                    type="button"
                    onClick={() => setAspectRatio(ar.value)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition ${
                      aspectRatio === ar.value
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-[#181a24] border-[#2a2e3d] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {ar.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration & Scene Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                영상 전체 길이 (초)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Scene (장면) 수
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Overall Style Preset */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              전체 스타일 프리셋
            </label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.label})
                </option>
              ))}
            </select>
          </div>

          {/* Protagonist Character & Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                주인공 / 인물 락 (Character)
              </label>
              <input
                type="text"
                placeholder="예: 20대 한국인 남성, 단정한 셔츠"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                제품 / 브랜드 (선택)
              </label>
              <input
                type="text"
                placeholder="예: 이스타항공, 닥터지, 갤럭시"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Additional Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              영상 기획 의도 및 전체 스토리 설명
            </label>
            <textarea
              rows={3}
              placeholder="예: 바쁜 일상을 떠나 공항에서 설레는 비행기를 타고 새로운 목적지에 도착하는 여정. 따뜻하고 벅차오르는 감성."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181a24] border border-[#2a2e3d] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-[#222533] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  프로젝트 생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
