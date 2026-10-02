"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Camera,
  Copy,
  Check,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Video,
  Clapperboard,
  Sliders,
  Image as ImageIcon,
  Play,
  Download,
  AlertTriangle,
  Film,
  CopyPlus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Scene, Project, DirectorRecommendation } from "@/lib/types";
import {
  SHOT_TYPES,
  CAMERA_ANGLES,
  LENSES,
  CAMERA_MOVEMENTS,
  LIGHTINGS,
} from "@/lib/presets/shotOptions";
import DirectorModal from "./DirectorModal";

interface Props {
  scene: Scene;
  project: Project;
  isSelected?: boolean;
  onToggleSelect?: (sceneId: string) => void;
  onMoveUp?: (sceneId: string) => void;
  onMoveDown?: (sceneId: string) => void;
  onDuplicate?: (sceneId: string) => void;
  onUpdate: (updatedScene: Scene) => void;
  onDelete: (sceneId: string) => void;
}

export default function SceneCard({
  scene,
  project,
  isSelected,
  onToggleSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onUpdate,
  onDelete,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingDesign, setIsEditingDesign] = useState(false);
  const [isDirectorOpen, setIsDirectorOpen] = useState(false);

  // Loading states
  const [isDesigning, setIsDesigning] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Video Generation confirmation modal & loading
  const [showVideoConfirm, setShowVideoConfirm] = useState(false);
  const [videoStatus, setVideoStatus] = useState<string>(scene.videoStatus || (scene.videoUrl ? "completed" : "not_generated"));
  const [videoJobId, setVideoJobId] = useState<string | undefined>(scene.videoJobId);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Local state
  const [localScene, setLocalScene] = useState<Scene>(scene);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync prop changes
  useEffect(() => {
    setLocalScene(scene);
    if (scene.videoStatus) {
      setVideoStatus(scene.videoStatus);
    } else if (scene.videoUrl) {
      setVideoStatus("completed");
    }
  }, [scene]);

  // Polling for video generation job
  useEffect(() => {
    if (videoStatus !== "queued" && videoStatus !== "processing") return;
    if (!videoJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/video/${videoJobId}`);
        const data = await res.json();
        if (data.success && data.job) {
          if (data.job.status === "completed" && data.job.resultUrl) {
            setVideoStatus("completed");
            const updated = {
              ...localScene,
              videoUrl: data.job.resultUrl,
              videoStatus: "completed" as const,
            };
            setLocalScene(updated);
            onUpdate(updated);
            clearInterval(interval);
          } else if (data.job.status === "failed") {
            setVideoStatus("failed");
            const updated = {
              ...localScene,
              videoStatus: "failed" as const,
              errorMessage: data.job.error || "영상 생성에 실패했습니다.",
            };
            setLocalScene(updated);
            onUpdate(updated);
            clearInterval(interval);
          } else if (data.job.status === "processing") {
            setVideoStatus("processing");
          }
        }
      } catch (err) {
        console.error("Job polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [videoStatus, videoJobId, localScene, onUpdate]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveScene = async (newSceneState?: Scene) => {
    const toSave = newSceneState || localScene;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/scenes/${toSave.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onUpdate(data.scene);
      }
    } catch (err) {
      console.error("Scene 저장 실패:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // AI Shot Design Call
  const handleAiShotDesign = async () => {
    setIsDesigning(true);
    try {
      const res = await fetch("/api/ai/shot-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneDescription: localScene.description || "기본 씬",
          projectContext: {
            stylePreset: project.stylePreset,
            character: project.character,
            brand: project.brand,
            aspectRatio: project.aspectRatio,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "AI 촬영 설계에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const updated: Scene = {
        ...localScene,
        ...data.design,
        status: "designed",
      };
      setLocalScene(updated);
      await handleSaveScene(updated);
    } catch (err) {
      console.error(err);
      alert("AI 촬영 설계에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDesigning(false);
    }
  };

  // AI Prompts Generation Call
  const handleAiPrompts = async () => {
    setIsPrompting(true);
    try {
      const res = await fetch("/api/ai/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scene: localScene,
          project,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "AI 프롬프트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const updated: Scene = {
        ...localScene,
        imagePrompt: data.prompts.imagePrompt,
        videoPrompt: data.prompts.videoPrompt,
        negativePrompt: data.prompts.negativePrompt,
        status: "ready",
      };
      setLocalScene(updated);
      await handleSaveScene(updated);
    } catch (err) {
      console.error(err);
      alert("AI 프롬프트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsPrompting(false);
    }
  };

  // AI Image Generation Call
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: localScene.id,
          prompt: localScene.imagePrompt || localScene.description,
          aspectRatio: project.aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "이미지 생성에 실패했습니다.");
        return;
      }

      const updated: Scene = {
        ...localScene,
        imageUrl: data.imageUrl,
        imageStatus: "completed",
      };
      setLocalScene(updated);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Video Generation Confirm & Trigger
  const handleStartVideoGeneration = () => {
    if (!localScene.imageUrl) {
      alert("먼저 이미지를 생성해주세요. 생성된 키 이미지를 Reference Image로 활용하여 영상을 제작합니다.");
      return;
    }
    setShowVideoConfirm(true);
  };

  const executeVideoGeneration = async () => {
    setShowVideoConfirm(false);
    setVideoStatus("queued");

    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          sceneId: localScene.id,
          prompt: localScene.videoPrompt || localScene.action || localScene.description,
          referenceImageUrl: localScene.imageUrl,
          duration: Math.max(1, localScene.endTime - localScene.startTime),
          aspectRatio: project.aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setVideoStatus("failed");
        alert(data.error || "영상 생성에 실패했습니다.");
        return;
      }

      setVideoJobId(data.job.id);
      setVideoStatus(data.job.status || "processing");

      const updated: Scene = {
        ...localScene,
        videoStatus: data.job.status || "processing",
        videoJobId: data.job.id,
      };
      setLocalScene(updated);
      onUpdate(updated);
    } catch (err) {
      console.error(err);
      setVideoStatus("failed");
      alert("영상 생성에 실패했습니다.");
    }
  };

  const handleApplyDirector = async (rec: DirectorRecommendation) => {
    const updated: Scene = {
      ...localScene,
      shotType: rec.shotType,
      cameraAngle: rec.cameraAngle,
      lens: rec.lens,
      composition: rec.composition,
      cameraMovement: rec.cameraMovement,
      lighting: rec.lighting,
      depthOfField: rec.depthOfField,
      action: rec.action,
      mood: rec.mood,
      status: "designed",
    };
    setLocalScene(updated);
    await handleSaveScene(updated);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleDownloadVideo = () => {
    if (!localScene.videoUrl) return;
    const a = document.createElement("a");
    a.href = localScene.videoUrl;
    a.download = `${project.name}_Scene_${localScene.sceneNumber}.mp4`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-[#13151c] border border-[#212532] rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#2f3547]">
      {/* Header Bar */}
      <div className="px-5 py-3.5 bg-[#171923] border-b border-[#212532] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Phase 4 Selection Checkbox (1번 요구사항) */}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onToggleSelect(localScene.id)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              title="장면 선택"
            />
          )}

          {/* Phase 4 Reorder Arrows (15번 요구사항) */}
          <div className="flex flex-col gap-0.5">
            {onMoveUp && (
              <button
                type="button"
                onClick={() => onMoveUp(localScene.id)}
                className="text-zinc-500 hover:text-white p-0.5"
                title="위로 이동"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
            )}
            {onMoveDown && (
              <button
                type="button"
                onClick={() => onMoveDown(localScene.id)}
                className="text-zinc-500 hover:text-white p-0.5"
                title="아래로 이동"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/40 text-blue-400 font-mono font-bold text-xs tracking-wider">
            SCENE {String(localScene.sceneNumber).padStart(2, "0")}
          </div>
          <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
            <span>
              {localScene.startTime}s ~ {localScene.endTime}s
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-300">
              {Math.max(1, localScene.endTime - localScene.startTime)}초 분량
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-1.5 ml-2 text-[10px] font-semibold">
            {localScene.imageUrl ? (
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                🖼️ Image Ready
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                🖼️ No Image
              </span>
            )}

            {videoStatus === "completed" && localScene.videoUrl ? (
              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 flex items-center gap-1">
                🎬 Video Ready
              </span>
            ) : videoStatus === "processing" || videoStatus === "queued" ? (
              <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300 flex items-center gap-1 animate-pulse">
                ⏳ Processing
              </span>
            ) : videoStatus === "failed" ? (
              <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-400">
                ❌ Failed
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                🎬 Not Generated
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiShotDesign}
            disabled={isDesigning}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isDesigning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            AI 촬영 설계
          </button>

          <button
            type="button"
            onClick={handleAiPrompts}
            disabled={isPrompting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isPrompting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            프롬프트 생성
          </button>

          <button
            type="button"
            onClick={() => setIsDirectorOpen(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/40 border border-purple-800/60 text-purple-300 hover:bg-purple-900/40 flex items-center gap-1 transition"
          >
            <Video className="w-3.5 h-3.5" />
            AI 감독
          </button>

          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(localScene.id)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-300 hover:bg-blue-950/40 transition"
              title="Scene 복제"
            >
              <CopyPlus className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveScene()}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="저장"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onDelete(localScene.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
            title="장면 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Body */}
      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* Phase 3 Core: Image & Video Generation Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#101217] p-4 rounded-xl border border-[#232736]">
            {/* 1. REFERENCE IMAGE AREA */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  REFERENCE IMAGE (키 프레임)
                </span>
                {localScene.imageUrl && (
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingImage ? "animate-spin" : ""}`} />
                    다시 생성
                  </button>
                )}
              </div>

              {localScene.imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#2b2f40] bg-black group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localScene.imageUrl}
                    alt={`Scene ${localScene.sceneNumber} Keyframe`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-mono">
                    Reference Keyframe
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-[#2b2f40] bg-[#14161f] flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <ImageIcon className="w-8 h-8 text-zinc-500" />
                  <p className="text-xs text-zinc-400">생성된 장면 이미지가 없습니다.</p>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        이미지 생성 중...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        🎨 이미지 생성
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 2. GENERATED VIDEO AREA */}
            <div className="space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-400" />
                  AI GENERATED VIDEO (움직임 비디오)
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {videoStatus === "completed" ? "Ready" : videoStatus}
                </span>
              </div>

              {/* Video Player or Progress/Prompt State */}
              {videoStatus === "completed" && localScene.videoUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-purple-800/40 bg-black">
                    <video
                      ref={videoRef}
                      src={localScene.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePlayVideo}
                        className="px-2.5 py-1 rounded bg-[#1e2230] hover:bg-[#282d40] text-white text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Play className="w-3.5 h-3.5 text-purple-400" />
                        재생
                      </button>
                      <button
                        onClick={handleDownloadVideo}
                        className="px-2.5 py-1 rounded bg-[#1e2230] hover:bg-[#282d40] text-white text-xs font-medium flex items-center gap-1 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-400" />
                        다운로드
                      </button>
                    </div>

                    <button
                      onClick={handleStartVideoGeneration}
                      className="text-xs text-zinc-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      다시 생성
                    </button>
                  </div>
                </div>
              ) : videoStatus === "processing" || videoStatus === "queued" ? (
                <div className="aspect-video rounded-lg border border-purple-800/40 bg-[#161424] flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
                  <div>
                    <h5 className="text-xs font-bold text-white">🎬 영상을 생성하고 있습니다...</h5>
                    <p className="text-[11px] text-purple-300/80 mt-1">영상 처리 중... 잠시만 기다려주세요.</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed border-[#2b2f40] bg-[#14161f] flex flex-col items-center justify-center p-4 text-center space-y-2.5">
                  <Film className="w-8 h-8 text-zinc-500" />
                  <p className="text-xs text-zinc-400">
                    {localScene.imageUrl
                      ? "키 이미지를 기반으로 모션을 부여하여 영상을 생성합니다."
                      : "먼저 이미지를 생성해주세요."}
                  </p>
                  <button
                    onClick={handleStartVideoGeneration}
                    disabled={!localScene.imageUrl || videoStatus === "processing"}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-purple-600/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Clapperboard className="w-4 h-4" />
                    🎬 영상 생성
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scene Description & Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                <span>장면 설명 (Scene Description)</span>
                <span className="text-[10px] text-zinc-400 font-mono">핵심 줄거리</span>
              </label>
              <textarea
                rows={2}
                value={localScene.description || ""}
                onChange={(e) => setLocalScene({ ...localScene, description: e.target.value })}
                onBlur={() => handleSaveScene()}
                placeholder="예: 공항에서 여행을 준비하는 남자"
                className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                <span>피사체 행동 (Action / Blocking)</span>
                <span className="text-[10px] text-zinc-400 font-mono">인물 동선 & 연기</span>
              </label>
              <textarea
                rows={2}
                value={localScene.action || ""}
                onChange={(e) => setLocalScene({ ...localScene, action: e.target.value })}
                onBlur={() => handleSaveScene()}
                placeholder="예: 캐리어를 잡고 전광판을 바라보며 미소를 짓는다"
                className="w-full bg-[#181a24] border border-[#2b2f3e] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Shot Design Grid (촬영 설계 결과) */}
          <div className="border border-[#232734] rounded-xl p-4 bg-[#151722]/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  촬영 설계 결과 (Shot Design Specification)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingDesign(!isEditingDesign)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                {isEditingDesign ? "완료" : "값 직접 수정"}
              </button>
            </div>

            {/* Design Parameters Badges or Form */}
            {isEditingDesign ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Shot Type</label>
                  <select
                    value={localScene.shotType || "Medium Wide Shot"}
                    onChange={(e) => setLocalScene({ ...localScene, shotType: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  >
                    {SHOT_TYPES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Camera Angle</label>
                  <select
                    value={localScene.cameraAngle || "Eye Level"}
                    onChange={(e) => setLocalScene({ ...localScene, cameraAngle: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  >
                    {CAMERA_ANGLES.map((ca) => (
                      <option key={ca} value={ca}>
                        {ca}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Lens</label>
                  <select
                    value={localScene.lens || "35mm"}
                    onChange={(e) => setLocalScene({ ...localScene, lens: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  >
                    {LENSES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Camera Movement</label>
                  <select
                    value={localScene.cameraMovement || "Slow Push In"}
                    onChange={(e) => setLocalScene({ ...localScene, cameraMovement: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  >
                    {CAMERA_MOVEMENTS.map((cm) => (
                      <option key={cm} value={cm}>
                        {cm}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Lighting</label>
                  <select
                    value={localScene.lighting || "Soft Natural Light"}
                    onChange={(e) => setLocalScene({ ...localScene, lighting: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  >
                    {LIGHTINGS.map((li) => (
                      <option key={li} value={li}>
                        {li}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Composition</label>
                  <input
                    type="text"
                    value={localScene.composition || ""}
                    onChange={(e) => setLocalScene({ ...localScene, composition: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Subject Position</label>
                  <input
                    type="text"
                    value={localScene.subjectPosition || ""}
                    onChange={(e) => setLocalScene({ ...localScene, subjectPosition: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-[10px] mb-1">Depth of Field</label>
                  <input
                    type="text"
                    value={localScene.depthOfField || ""}
                    onChange={(e) => setLocalScene({ ...localScene, depthOfField: e.target.value })}
                    className="w-full bg-[#1c1f2b] border border-[#2f3445] rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Shot</span>
                  <span className="text-white font-medium truncate block">{localScene.shotType || "—"}</span>
                </div>
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Angle</span>
                  <span className="text-white font-medium truncate block">{localScene.cameraAngle || "—"}</span>
                </div>
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Lens</span>
                  <span className="text-white font-medium truncate block">{localScene.lens || "—"}</span>
                </div>
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Composition</span>
                  <span className="text-white font-medium truncate block">{localScene.composition || "—"}</span>
                </div>
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Camera Move</span>
                  <span className="text-white font-medium truncate block">{localScene.cameraMovement || "—"}</span>
                </div>
                <div className="bg-[#191c26] p-2 rounded-lg border border-[#292e3f]">
                  <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Lighting</span>
                  <span className="text-white font-medium truncate block">{localScene.lighting || "—"}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3-Part Prompt Editor Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI PROMPTS (이미지 / 영상 / 네거티브)
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* IMAGE PROMPT */}
              <div className="bg-[#161823] border border-[#252938] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-400 tracking-wide">
                      IMAGE PROMPT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(localScene.imagePrompt || "", "imagePrompt")}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="클립보드 복사"
                    >
                      {copiedKey === "imagePrompt" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={localScene.imagePrompt || ""}
                    onChange={(e) =>
                      setLocalScene({ ...localScene, imagePrompt: e.target.value })
                    }
                    onBlur={() => handleSaveScene()}
                    placeholder="[프롬프트 생성] 버튼을 누르면 정적 키 프레임 설명이 생성됩니다."
                    className="w-full bg-[#12131a] border border-[#202330] rounded-lg p-2.5 text-xs text-zinc-200 font-mono leading-relaxed placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>Subject · Light · Lens · Angle</span>
                  <button
                    type="button"
                    onClick={() => handleSaveScene()}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    수정 저장
                  </button>
                </div>
              </div>

              {/* VIDEO PROMPT */}
              <div className="bg-[#161823] border border-[#252938] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-400 tracking-wide">
                      VIDEO PROMPT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(localScene.videoPrompt || "", "videoPrompt")}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="클립보드 복사"
                    >
                      {copiedKey === "videoPrompt" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={localScene.videoPrompt || ""}
                    onChange={(e) =>
                      setLocalScene({ ...localScene, videoPrompt: e.target.value })
                    }
                    onBlur={() => handleSaveScene()}
                    placeholder="[프롬프트 생성] 버튼을 누르면 동적 카메라 & 피사체 움직임이 생성됩니다."
                    className="w-full bg-[#12131a] border border-[#202330] rounded-lg p-2.5 text-xs text-zinc-200 font-mono leading-relaxed placeholder-zinc-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>Motion · Camera Move · Pacing</span>
                  <button
                    type="button"
                    onClick={() => handleSaveScene()}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    수정 저장
                  </button>
                </div>
              </div>

              {/* NEGATIVE PROMPT */}
              <div className="bg-[#161823] border border-[#252938] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400 tracking-wide">
                      NEGATIVE PROMPT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(localScene.negativePrompt || "", "negativePrompt")}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                      title="클립보드 복사"
                    >
                      {copiedKey === "negativePrompt" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={localScene.negativePrompt || ""}
                    onChange={(e) =>
                      setLocalScene({ ...localScene, negativePrompt: e.target.value })
                    }
                    onBlur={() => handleSaveScene()}
                    placeholder="품질 저하, 왜곡, 이상 신체 등을 방지하는 네거티브 키워드"
                    className="w-full bg-[#12131a] border border-[#202330] rounded-lg p-2.5 text-xs text-zinc-400 font-mono leading-relaxed placeholder-zinc-400 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                  <span>Anti-distortion · Quality Shield</span>
                  <button
                    type="button"
                    onClick={() => handleSaveScene()}
                    className="text-rose-400 hover:text-rose-300 font-medium"
                  >
                    수정 저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Video Generation (Requirement 14) */}
      {showVideoConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-purple-800/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI 영상 생성 확인</h3>
                <p className="text-xs text-zinc-400">Scene {localScene.sceneNumber} 비디오 렌더링</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-[#171a25] p-3.5 rounded-xl border border-[#272d3e]">
              이 Scene의 AI 영상을 생성합니다. <br />
              현재 키 이미지를 Reference Image로 삼아 카메라 모션 및 피사체 움직임을 렌더링하며,
              영상 생성 API 사용량이 발생할 수 있습니다.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowVideoConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeVideoGeneration}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition shadow-lg shadow-purple-600/30"
              >
                <Clapperboard className="w-3.5 h-3.5" />
                영상 생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Director Recommendation Modal */}
      <DirectorModal
        isOpen={isDirectorOpen}
        onClose={() => setIsDirectorOpen(false)}
        scene={localScene}
        onApply={handleApplyDirector}
        projectStyle={project.globalStyle || project.stylePreset}
      />
    </div>
  );
}
