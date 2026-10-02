"use client";

import { X, ShieldCheck, AlertTriangle, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { ConsistencyIssue } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: {
    overallStatus: "정상" | "주의" | "문제";
    issues: ConsistencyIssue[];
  } | null;
  onFixIssue?: (issue: ConsistencyIssue) => void;
}

export default function ConsistencyReportModal({
  isOpen,
  onClose,
  report,
  onFixIssue,
}: Props) {
  if (!isOpen || !report) return null;

  const isOk = report.overallStatus === "정상";
  const isWarn = report.overallStatus === "주의";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-[#252838] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI 일관성 검사 리포트 (Consistency Report)
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isOk
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : isWarn
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  종합 평가: {report.overallStatus}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                인물(의상/헤어), 제품, 조명, 앵글, 화풍의 컷 간 연속성을 분석합니다.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Issues List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {report.issues.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-white">모든 씬의 일관성이 완벽합니다!</p>
              <p className="text-xs text-zinc-400">캐릭터 및 제품 외형이 충돌 없이 유지되고 있습니다.</p>
            </div>
          ) : (
            report.issues.map((issue, idx) => (
              <div
                key={idx}
                className="bg-[#171a25] p-4 rounded-xl border border-[#262c3e] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {issue.severity === "문제" ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : issue.severity === "주의" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="font-bold text-white">
                      {issue.sceneNumber ? `Scene ${String(issue.sceneNumber).padStart(2, "0")} - ` : ""}
                      {issue.title}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {issue.category}
                  </span>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed">{issue.description}</p>

                {issue.suggestion && (
                  <div className="p-2.5 rounded-lg bg-[#12141e] border border-[#222738] text-[11px] text-amber-200/90 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-amber-300">수정 가이드: </strong>
                      {issue.suggestion}
                    </span>
                  </div>
                )}
              </div>
            ))
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
