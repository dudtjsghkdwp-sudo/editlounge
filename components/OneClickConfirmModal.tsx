"use client";

import { X, Rocket, Sparkles, AlertTriangle, Layers, Camera, PenTool, Image as ImageIcon, Video } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: () => void;
}

export default function OneClickConfirmModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-blue-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232738]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                선택 장면 원클릭 자동 제작
              </h3>
              <p className="text-xs text-zinc-400">선택된 {selectedCount}개 Scene 일괄 파이프라인</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Preview */}
        <div className="bg-[#161824] p-3.5 rounded-xl border border-[#262c3e] space-y-2 text-xs">
          <span className="text-zinc-400 font-semibold block text-[11px] uppercase">
            순차 실행 파이프라인 (단재 실패 시 중단 방어):
          </span>
          <div className="grid grid-cols-2 gap-2 text-zinc-200">
            <div className="flex items-center gap-2 p-1.5 bg-[#1b1f2e] rounded border border-[#2b3247]">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              <span>1. 촬영 설계</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-[#1b1f2e] rounded border border-[#2b3247]">
              <PenTool className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. 프롬프트 생성</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-[#1b1f2e] rounded border border-[#2b3247]">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. 키 이미지 생성</span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-[#1b1f2e] rounded border border-[#2b3247]">
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>4. AI 영상 생성</span>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            이미지 및 영상 생성 단계에서 API 사용량이 발생할 수 있습니다. 각 Scene의 키 이미지가
            Reference Image로 전달되어 움직임이 렌더링됩니다.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <Rocket className="w-4 h-4" />
            자동 제작 시작 ({selectedCount}개 Scene)
          </button>
        </div>
      </div>
    </div>
  );
}
