"use client";

import { useState } from "react";
import { User, ShieldCheck, Lock, Sparkles, BookOpen, Layers, CheckCircle2 } from "lucide-react";

export default function CharactersPage() {
  const [activeTab, setActiveTab] = useState<"continuity" | "presets">("continuity");

  const characterPresets = [
    {
      id: "char-01",
      name: "20대 한국인 남성 여행객 (Eastar Project)",
      age: "20대 후반",
      features: "단정한 짧은 검은 머리, 또렷하고 친근한 이목구비, 밝고 긍정적인 미소",
      costume: "베이지 라이트 재킷, 깔끔한 이너 티셔츠, 캐주얼 슬랙스",
      props: "실버 기내용 캐리어, 스마트폰",
      lockRules: "헤어스타일 및 의상 불변, 손가락 5개 정상 표현, 컷 전환 시 옷 색상 고정",
    },
    {
      id: "char-02",
      name: "수아 (Sua - 셀 애니메이션 정본)",
      age: "고등학교 1학년 (17세)",
      features: "둥글고 친근한 얼굴, 짙은 흑갈색 단발 머리, 자연스러운 학생 비율",
      costume: "크림색 니트 카디건, 코랄 톤 상의, 연청 와이드 데님 팬츠",
      props: "스마트폰 (화면 상세는 미노출)",
      lockRules: "얇고 일정한 짙은 갈색 외곽선 유지, 2단계 셀 명암 고정, 얼굴 왜곡 절대 금지",
    },
    {
      id: "char-03",
      name: "이비 (Ibi - 컴패니언 로봇)",
      age: "AI 인터페이스",
      features: "흰색 곡면 몸체, 주황색 서브 프레임, 보라색 하체 및 관절, 앞면 디스플레이",
      costume: "일체형 매트 질감 외골격",
      props: "자체 부유 및 홀로그램",
      lockRules: "앞면 표정 디스플레이만 사용 (뒷면 디스플레이 절대 금지), 임의 부품 추가 금지",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          CHARACTER LOCK & CONTINUITY HARNESS
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          캐릭터 락 & 연속성 제어 시스템
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          영상 컷 간 피사체의 얼굴, 의상, 소품, 화풍이 변형되지 않도록 엄격한 연속성(Continuity) 규칙을 프롬프트에 고정합니다.
        </p>
      </div>

      {/* Philosophy Banner based on harness.md */}
      <div className="bg-[#12141c] border border-emerald-800/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Lock className="w-4 h-4" />
          <span>영상 PD 하네스(Harness) 4대 원칙</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#161924] p-3.5 rounded-xl border border-[#232a3a]">
            <span className="text-emerald-400 font-bold block mb-1">1. CHARACTER LOCK</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              승인 정본을 얼굴·의상·체형 기준으로 삼고, 컷 사이 임의 인물 추가나 변형을 원천 차단합니다.
            </p>
          </div>
          <div className="bg-[#161924] p-3.5 rounded-xl border border-[#232a3a]">
            <span className="text-blue-400 font-bold block mb-1">2. STYLE LOCK</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              프로젝트 공통 화풍(선 굵기, 색 분할, 명암 단계, 렌즈 감성)을 모든 프레임에 일관 유지합니다.
            </p>
          </div>
          <div className="bg-[#161924] p-3.5 rounded-xl border border-[#232a3a]">
            <span className="text-purple-400 font-bold block mb-1">3. CONTINUITY</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              문, 가구, 손에 든 소품의 위치가 컷 간에 소실되거나 순간이동하지 않도록 앵글을 계산합니다.
            </p>
          </div>
          <div className="bg-[#161924] p-3.5 rounded-xl border border-[#232a3a]">
            <span className="text-amber-400 font-bold block mb-1">4. PROMPT ASSEMBLY</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              하네스 규칙 → 기획 의도 → 화면 설계 → 세부 타임라인 순으로 프롬프트를 정밀 조립합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Character Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          등록된 캐릭터 락 프리셋
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {characterPresets.map((char) => (
            <div
              key={char.id}
              className="bg-[#12141c] border border-[#222636] hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                    {char.age}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">LOCKED</span>
                </div>

                <h3 className="text-base font-bold text-white">{char.name}</h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">외모 특징</span>
                    <span className="text-zinc-200">{char.features}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">고정 의상</span>
                    <span className="text-zinc-200">{char.costume}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-semibold">주요 소품</span>
                    <span className="text-zinc-200">{char.props}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1d222e]">
                <div className="bg-[#171a25] p-2.5 rounded-lg border border-[#262c3e] text-[11px]">
                  <span className="text-amber-400 font-bold block text-[10px] mb-0.5">⚠️ 연속성 락 규칙:</span>
                  <p className="text-zinc-300 leading-relaxed">{char.lockRules}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
