"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Cpu, ShieldCheck, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [videoModel, setVideoModel] = useState("sora-1.0");
  const [maskedKey, setMaskedKey] = useState("");
  const [hasValidKey, setHasValidKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success) {
          setHasValidKey(data.hasValidKey);
          setMaskedKey(data.maskedKey || "");
          if (data.model) setModel(data.model);
          if (data.videoModel) setVideoModel(data.videoModel);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          model,
          videoModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("설정이 성공적으로 저장되었습니다!");
        if (apiKey) {
          setHasValidKey(true);
          setMaskedKey(apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length - 4));
          setApiKey("");
        }
        setTimeout(() => setMessage(null), 3000);
      } else {
        alert(data.error || "설정 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          환경 설정 & AI 엔진 세팅
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          OpenAI API Key와 텍스트 모델을 설정합니다. API Key가 설정되지 않아도 내장 전문 영상 알고리즘이 상시 작동합니다.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Engine Status Card */}
      <div className="bg-[#12141c] border border-[#222636] rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          AI 엔진 가동 상태
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#171a25] p-4 rounded-xl border border-[#272d3e] flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                hasValidKey ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
              }`}
            />
            <div>
              <span className="text-xs font-bold text-white block">
                {hasValidKey ? "OpenAI 공식 API 활성화" : "내장 전문 연출 엔진 (Fallback 모드)"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {hasValidKey ? `키: ${maskedKey}` : "API 키 미설정 시에도 모든 기획·설계 기능 100% 정상 작동"}
              </span>
            </div>
          </div>

          <div className="bg-[#171a25] p-4 rounded-xl border border-[#272d3e] flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <div>
              <span className="text-xs font-bold text-white block">현재 활성 모델</span>
              <span className="text-[11px] text-zinc-400 font-mono">{model}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-[#12141c] border border-[#222636] rounded-2xl p-6 shadow-xl space-y-5 text-xs">
        <div>
          <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            OPENAI_API_KEY
          </label>
          <input
            type="password"
            placeholder={hasValidKey ? `등록됨 (${maskedKey}) - 변경 시에만 입력` : "sk-..."}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-[#181a24] border border-[#292d3c] rounded-xl px-4 py-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <span className="text-[10px] text-zinc-400 mt-1 block">
            * 입력된 API 키는 서버 측 `.env.local`에 안전하게 보관되며 클라이언트에 노출되지 않습니다.
          </span>
        </div>

        <div>
          <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            OPENAI_TEXT_MODEL
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#181a24] border border-[#292d3c] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="gpt-4o">gpt-4o (최고 성능 플래그십 모델 - 권장)</option>
            <option value="gpt-4o-mini">gpt-4o-mini (빠른 속도 및 가성비 모델)</option>
            <option value="gpt-4-turbo">gpt-4-turbo</option>
          </select>
        </div>

        <div>
          <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            OPENAI_VIDEO_MODEL
          </label>
          <select
            value={videoModel}
            onChange={(e) => setVideoModel(e.target.value)}
            className="w-full bg-[#181a24] border border-[#292d3c] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="sora-1.0">sora-1.0 (OpenAI 공식 비디오 모델 - 기본값)</option>
            <option value="sora-fast">sora-fast (고속 프리뷰 비디오 모델)</option>
          </select>
          <span className="text-[10px] text-zinc-400 mt-1 block">
            * 공식 OpenAI Video API 지원 모델을 지정합니다. (환경변수 OPENAI_VIDEO_MODEL 동기화)
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-blue-600/30"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            설정 저장
          </button>
        </div>
      </form>
    </div>
  );
}
