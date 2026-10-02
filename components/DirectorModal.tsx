"use client";

import { useState } from "react";
import { X, Sparkles, Video, Check, HelpCircle } from "lucide-react";
import { DirectorRecommendation, Scene } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scene?: Scene | null;
  onApply: (recommendation: DirectorRecommendation) => void;
  projectStyle?: string;
}

export default function DirectorModal({
  isOpen,
  onClose,
  scene,
  onApply,
  projectStyle,
}: Props) {
  const [concept, setConcept] = useState(scene?.description || "공항에서 비행기를 기다리는 남자");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<DirectorRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRecommend = async () => {
    if (!concept.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: concept.trim(),
          projectStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI 감독 추천을 생성하지 못했습니다.");
      }

      setRecommendation(data.recommendation);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (recommendation) {
      onApply(recommendation);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12141c] border border-[#262a39] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#202330] bg-[#161823] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI DIRECTOR 연출 추천
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">장면 아이디어를 입력하면 전문 영화감독의 시각화 설계를 제공합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              장면 연출 아이디어 / 콘셉트
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="예: 공항에서 비행기를 기다리는 남자"
                className="flex-1 bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleRecommend}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                감독 추천
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {recommendation && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-300">감독의 연출 의도: </span>
                  {recommendation.directorNote || "인물의 감정선과 미장센을 극대화하는 맞춤 구도입니다."}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Shot</span>
                  <span className="text-white font-medium">{recommendation.shotType}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Angle</span>
                  <span className="text-white font-medium">{recommendation.cameraAngle}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Lens</span>
                  <span className="text-white font-medium">{recommendation.lens}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Composition</span>
                  <span className="text-white font-medium">{recommendation.composition}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Camera Movement</span>
                  <span className="text-white font-medium">{recommendation.cameraMovement}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Lighting</span>
                  <span className="text-white font-medium">{recommendation.lighting}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39]">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">심도 (Depth of Field)</span>
                  <span className="text-white font-medium">{recommendation.depthOfField}</span>
                </div>
                <div className="bg-[#171923] p-2.5 rounded-lg border border-[#262a39] col-span-2">
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">추천 Mood</span>
                  <span className="text-white font-medium">{recommendation.mood}</span>
                </div>
              </div>

              <div className="bg-[#171923] p-3 rounded-lg border border-[#262a39] text-xs">
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold mb-1">피사체 행동 (Action)</span>
                <p className="text-zinc-200 leading-relaxed">{recommendation.action}</p>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  이 설정 적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
