"use client";

import { useState } from "react";
import { Camera, Sparkles, Sliders, CheckCircle2, Film } from "lucide-react";
import { DirectorRecommendation } from "@/lib/types";

export default function DirectorStudioPage() {
  const [concept, setConcept] = useState("공항에서 비행기를 기다리는 남자");
  const [style, setStyle] = useState("Premium TVCF");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DirectorRecommendation | null>(null);

  const sampleIdeas = [
    "공항에서 비행기를 기다리는 남자",
    "석양 아래 활주로를 향해 걸어가는 승무원",
    "비행기 창가 좌석에서 구름을 바라보는 여행객",
    "고급 향수 병 위로 떨어지는 빗방울",
    "스포츠카의 급가속과 휠의 회전 클로즈업",
  ];

  const handleGenerate = async (customConcept?: string) => {
    const textToUse = customConcept || concept;
    if (!textToUse.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: textToUse.trim(),
          projectStyle: style,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.recommendation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI DIRECTOR STUDIO
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Camera className="w-6 h-6 text-purple-400" />
          촬영 설계 & 감독 연출 스튜디오
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          장면 아이디어를 입력하면 전문 영화/광고 감독의 시각에서 샷, 앵글, 렌즈, 무브먼트, 조명을 종합 설계합니다.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-[#12141c] border border-[#232738] rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">
            장면 아이디어 및 콘셉트 입력
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="예: 공항에서 비행기를 기다리는 남자"
              className="flex-1 bg-[#181a24] border border-[#2b2f3e] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
            />
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-[#181a24] border border-[#2b2f3e] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Premium TVCF">Premium TVCF</option>
              <option value="Cinematic Film">Cinematic Film</option>
              <option value="Airline Commercial">Airline Commercial</option>
              <option value="Product Commercial">Product Commercial</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="Fantasy">Fantasy</option>
            </select>
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-purple-600/30"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              촬영 설계 생성
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] text-zinc-400 font-medium">추천 예시:</span>
          {sampleIdeas.map((idea) => (
            <button
              key={idea}
              onClick={() => {
                setConcept(idea);
                handleGenerate(idea);
              }}
              className="text-[11px] text-zinc-400 hover:text-purple-300 bg-[#171923] hover:bg-[#202330] border border-[#272b3a] px-2.5 py-1 rounded-full transition"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Output Design Result */}
      {result && (
        <div className="bg-[#12141c] border border-purple-800/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#212534] pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">AI 감독 연출 제안서</h2>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Style: {style}
            </span>
          </div>

          {/* Director Note */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30">
            <span className="text-xs font-bold text-purple-300 block mb-1">
              🎬 감독 연출 의도 (Director Rationale):
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">{result.directorNote}</p>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Shot Type</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{result.shotType}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Camera Angle</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{result.cameraAngle}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Lens</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{result.lens}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Movement</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{result.cameraMovement}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Composition</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{result.composition}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Lighting</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{result.lighting}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">심도 (DoF)</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{result.depthOfField}</span>
            </div>
            <div className="bg-[#171a25] p-3 rounded-xl border border-[#272d3e]">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">추천 Mood</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{result.mood}</span>
            </div>
          </div>

          {/* Action */}
          <div className="bg-[#171a25] p-4 rounded-xl border border-[#272d3e]">
            <span className="text-xs font-semibold text-zinc-400 block mb-1">피사체 구체 행동 (Action Blocking)</span>
            <p className="text-xs text-white leading-relaxed">{result.action}</p>
          </div>
        </div>
      )}
    </div>
  );
}
