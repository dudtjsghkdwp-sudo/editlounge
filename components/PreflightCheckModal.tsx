"use client";

import { X, CheckCircle2, AlertTriangle, AlertCircle, Film, Sparkles } from "lucide-react";
import { ProjectQualityCheckItem } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: {
    overallStatus: "ok" | "warning" | "error";
    items: ProjectQualityCheckItem[];
  } | null;
}

export default function PreflightCheckModal({ isOpen, onClose, report }: Props) {
  if (!isOpen || !report) return null;

  const isOk = report.overallStatus === "ok";
  const isWarn = report.overallStatus === "warning";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-blue-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#212534] bg-[#161823] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isOk
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isWarn
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-rose-500/20 text-rose-400"
              }`}
            >
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🎬 영상 제작 전 최종 검사 리포트
              </h3>
              <p className="text-xs text-zinc-400">
                렌더링 전 촬영 설계, 프롬프트, 키 이미지, 시간 큐의 누락을 검사합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {report.items.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">모든 사전 제작 준비가 완료되었습니다!</p>
              <p className="text-xs text-zinc-400">누락된 기획 요소 없이 곧바로 영상 렌더링을 진행할 수 있습니다.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {report.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-start gap-3 ${
                    item.status === "error"
                      ? "bg-rose-950/20 border-rose-800/40 text-rose-200"
                      : item.status === "warning"
                      ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                      : "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                  }`}
                >
                  {item.status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : item.status === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 flex-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>
                        {item.sceneNumber ? `Scene ${String(item.sceneNumber).padStart(2, "0")}: ` : ""}
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#212534] bg-[#161823] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
