"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, X, Sparkles, Film, Clock, LayoutGrid, Palette, User, FileText } from "lucide-react";
import { VideoType, VideoAspectRatio, Project } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

export default function QuickStartModal({ isOpen, onClose, onCreated }: Props) {
  const router = useRouter();
  const [type, setType] = useState<VideoType>("TVCF");
  const [duration, setDuration] = useState<number>(30);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("16:9");
  const [description, setDescription] = useState("");
  const [character, setCharacter] = useState("20대 한국인 남성");
  const [stylePreset, setStylePreset] = useState("premium-tvcf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState("");

  if (!isOpen) return null;

  const handleQuickStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("영상 주제나 기획 아이디어를 한 줄 이상 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setCurrentStepText("1/4. 프로젝트 및 타임라인 구성 중...");

    try {
      const res = await fetch("/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          duration: Number(duration),
          aspectRatio,
          description: description.trim(),
          character: character.trim(),
          stylePreset,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "빠른 제작에 실패했습니다.");
      }

      if (onCreated) onCreated(data.project);
      onClose();
      router.push(`/projects/${data.project.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-amber-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222533] bg-[#161823] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ⚡ 빠른 영상 제작 (Quick Start)
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-zinc-400">
                기본 조건만 입력하면 AI가 콘티, Scene, 촬영 설계, 프롬프트를 원스톱 생성합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isGenerating} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleQuickStart} className="p-6 space-y-4 text-xs">
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-12 h-12 rounded-full border-3 border-amber-500/30 border-t-amber-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">AI 감독이 전체 영상을 원스톱 제작 중입니다</h4>
                <p className="text-xs text-amber-300 font-mono animate-pulse">{currentStepText}</p>
              </div>
              <p className="text-[11px] text-zinc-400 max-w-xs">
                콘티 기획 → 15개 촬영 앵글 설계 → 정적/동적 프롬프트 조립이 순차 진행됩니다.
              </p>
            </div>
          ) : (
            <>
              {/* Subject Description */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  영상 주제 / 핵심 아이디어 *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="예: 20대 남자가 비행기를 타고 새로운 도시로 떠나는 설레는 여정. 이스타항공의 따뜻하고 감성적인 분위기."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none text-xs"
                />
              </div>

              {/* Type & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">영상 종류</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VideoType)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="TVCF">TVCF</option>
                    <option value="광고">광고</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="제품 광고">제품 광고</option>
                    <option value="브랜드 영상">브랜드 영상</option>
                    <option value="판타지">판타지</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">화면 비율</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="16:9">16:9 와이드 (가로/TV)</option>
                    <option value="9:16">9:16 버티컬 (Shorts/Reels)</option>
                    <option value="1:1">1:1 정방형 (피드)</option>
                  </select>
                </div>
              </div>

              {/* Duration & Protagonist */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    영상 길이 (초)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  >
                    <option value={15}>15초 (3 Scenes)</option>
                    <option value={30}>30초 (5 Scenes - 권장)</option>
                    <option value={60}>60초 (6 Scenes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    주인공 (Character Lock)
                  </label>
                  <input
                    type="text"
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                    placeholder="예: 20대 한국인 남성, 베이지 셔츠"
                    className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Style Preset */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  전체 스타일
                </label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-white"
                >
                  <option value="premium-tvcf">Premium TVCF (고급 광고)</option>
                  <option value="cinematic-film">Cinematic Film (35mm 영화 필름)</option>
                  <option value="airline-commercial">Airline Commercial (항공/여행 감성)</option>
                  <option value="product-commercial">Product Commercial (제품 매크로)</option>
                  <option value="youtube-shorts">YouTube Shorts (고선명 숏폼)</option>
                  <option value="fantasy">Fantasy (판타지/신비)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#222533] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black flex items-center gap-2 transition shadow-lg shadow-amber-500/30"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  AI가 전체 제작 구성
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
