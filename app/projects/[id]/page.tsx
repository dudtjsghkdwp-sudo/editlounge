"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Camera,
  PenTool,
  Plus,
  Clock,
  LayoutGrid,
  Layers,
  RefreshCw,
  Film,
  CheckCircle2,
  AlertCircle,
  Palette,
  User,
  Building,
  Rocket,
  CheckSquare,
  Square,
  Globe,
  Copy,
  Download,
  ShieldCheck,
  ClipboardCheck,
  FileSpreadsheet,
  CopyPlus,
  Share2,
} from "lucide-react";
import { Project, Scene, ConsistencyIssue, ProjectQualityCheckItem } from "@/lib/types";
import SceneCard from "@/components/SceneCard";
import OneClickConfirmModal from "@/components/OneClickConfirmModal";
import GlobalSettingsModal from "@/components/GlobalSettingsModal";
import ConsistencyReportModal from "@/components/ConsistencyReportModal";
import PreflightCheckModal from "@/components/PreflightCheckModal";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global action loading states
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Phase 4: Multi-selection (1번 요구사항)
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);

  // Phase 4: Modals
  const [isOneClickModalOpen, setIsOneClickModalOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isConsistencyModalOpen, setIsConsistencyModalOpen] = useState(false);
  const [isPreflightModalOpen, setIsPreflightModalOpen] = useState(false);

  // Phase 4: Reports
  const [consistencyReport, setConsistencyReport] = useState<{
    overallStatus: "정상" | "주의" | "문제";
    issues: ConsistencyIssue[];
  } | null>(null);

  const [preflightReport, setPreflightReport] = useState<{
    overallStatus: "ok" | "warning" | "error";
    items: ProjectQualityCheckItem[];
  } | null>(null);

  // Phase 4: Batch Queue Dashboard State (4, 5번 요구사항)
  const [queueState, setQueueState] = useState<{
    isActive: boolean;
    progress: number;
    currentTask: string;
    sceneStatuses: Record<string, "waiting" | "processing" | "done" | "failed">;
    failedSceneIds: string[];
  }>({
    isActive: false,
    progress: 0,
    currentTask: "",
    sceneStatuses: {},
    failedSceneIds: [],
  });

  const fetchProjectAndScenes = async () => {
    try {
      setIsLoading(true);
      const [projRes, scenesRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/scenes`),
      ]);

      const projData = await projRes.json();
      const scenesData = await scenesRes.json();

      if (!projRes.ok || !projData.success) {
        throw new Error(projData.error || "프로젝트를 불러오지 못했습니다.");
      }

      setProject(projData.project);
      if (scenesData.success) {
        setScenes(scenesData.scenes);
        // Default select all scenes for ease
        setSelectedSceneIds(scenesData.scenes.map((s: Scene) => s.id));
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectAndScenes();
    }
  }, [projectId]);

  // Total Duration Calculation (17번 요구사항)
  const totalDuration = useMemo(() => {
    return scenes.reduce((sum, s) => sum + Math.max(1, s.endTime - s.startTime), 0);
  }, [scenes]);

  // Selection handlers
  const handleToggleSelectScene = (sceneId: string) => {
    setSelectedSceneIds((prev) =>
      prev.includes(sceneId) ? prev.filter((id) => id !== sceneId) : [...prev, sceneId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedSceneIds.length === scenes.length) {
      setSelectedSceneIds([]);
    } else {
      setSelectedSceneIds(scenes.map((s) => s.id));
    }
  };

  // AI 콘티 생성
  const handleGenerateStoryboard = async () => {
    if (!project) return;
    if (
      scenes.length > 0 &&
      !confirm("기존 Scene 목록을 AI가 생성한 새로운 콘티 구성으로 갱신하시겠습니까?")
    ) {
      return;
    }

    setIsGeneratingStoryboard(true);
    setStatusMessage("AI 감독이 영상 흐름과 씬을 구성 중입니다...");

    try {
      const res = await fetch("/api/ai/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "AI 콘티 생성 실패");

      const saveRes = await fetch(`/api/projects/${projectId}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes: data.scenes }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setScenes(saveData.scenes);
        setSelectedSceneIds(saveData.scenes.map((s: Scene) => s.id));
        setStatusMessage("AI 콘티가 생성되었습니다!");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || "오류가 발생했습니다.");
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Phase 4: Batch Actions on Selected Scenes (1번 요구사항)
  const targetScenes = scenes.filter((s) => selectedSceneIds.includes(s.id));

  // 1. 선택 장면 촬영 설계 일괄 생성
  const handleBatchShotDesign = async () => {
    if (targetScenes.length === 0) return alert("선택된 Scene이 없습니다.");
    setStatusMessage(`${targetScenes.length}개 선택 장면의 촬영 설계를 시작합니다...`);

    const updatedMap = new Map<string, Scene>();
    for (const sc of targetScenes) {
      try {
        const res = await fetch("/api/ai/shot-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneDescription: sc.description,
            projectContext: {
              stylePreset: project?.stylePreset,
              character: project?.globalCharacter || project?.character,
              brand: project?.globalProduct || project?.brand,
              aspectRatio: project?.aspectRatio,
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = { ...sc, ...data.design, status: "designed" as const };
          await fetch(`/api/scenes/${sc.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
          updatedMap.set(sc.id, updated);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setScenes((prev) => prev.map((s) => updatedMap.get(s.id) || s));
    setStatusMessage("선택 장면 촬영 설계가 완료되었습니다!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 2. 선택 장면 프롬프트 일괄 생성
  const handleBatchPrompts = async () => {
    if (targetScenes.length === 0) return alert("선택된 Scene이 없습니다.");
    setStatusMessage(`${targetScenes.length}개 선택 장면의 프롬프트를 생성 중입니다...`);

    const updatedMap = new Map<string, Scene>();
    for (const sc of targetScenes) {
      try {
        const res = await fetch("/api/ai/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scene: sc,
            project: {
              ...project,
              character: project?.globalCharacter || project?.character,
              brand: project?.globalProduct || project?.brand,
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = {
            ...sc,
            imagePrompt: data.prompts.imagePrompt,
            videoPrompt: data.prompts.videoPrompt,
            negativePrompt: data.prompts.negativePrompt,
            status: "ready" as const,
          };
          await fetch(`/api/scenes/${sc.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
          updatedMap.set(sc.id, updated);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setScenes((prev) => prev.map((s) => updatedMap.get(s.id) || s));
    setStatusMessage("선택 장면 프롬프트 생성이 완료되었습니다!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 3. 선택 장면 이미지 일괄 생성
  const handleBatchImages = async () => {
    if (targetScenes.length === 0) return alert("선택된 Scene이 없습니다.");
    setStatusMessage(`${targetScenes.length}개 장면의 키 이미지를 생성 중입니다...`);

    const updatedMap = new Map<string, Scene>();
    for (const sc of targetScenes) {
      try {
        const res = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: sc.id,
            prompt: sc.imagePrompt || sc.description,
            aspectRatio: project?.aspectRatio,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = { ...sc, imageUrl: data.imageUrl, imageStatus: "completed" as const };
          updatedMap.set(sc.id, updated);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setScenes((prev) => prev.map((s) => updatedMap.get(s.id) || s));
    setStatusMessage("선택 장면 키 이미지 생성이 완료되었습니다!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 4. 선택 장면 영상 일괄 생성
  const handleBatchVideos = async () => {
    if (targetScenes.length === 0) return alert("선택된 Scene이 없습니다.");
    setStatusMessage(`${targetScenes.length}개 장면의 영상 생성을 큐에 등록합니다...`);

    const updatedMap = new Map<string, Scene>();
    for (const sc of targetScenes) {
      if (!sc.imageUrl) continue; // skip if no reference image
      try {
        const res = await fetch("/api/generate/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            sceneId: sc.id,
            prompt: sc.videoPrompt || sc.action || sc.description,
            referenceImageUrl: sc.imageUrl,
            duration: Math.max(1, sc.endTime - sc.startTime),
            aspectRatio: project?.aspectRatio,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const updated = {
            ...sc,
            videoStatus: data.job.status || "processing",
            videoJobId: data.job.id,
          };
          updatedMap.set(sc.id, updated);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setScenes((prev) => prev.map((s) => updatedMap.get(s.id) || s));
    setStatusMessage("선택 장면 영상 생성이 시작되었습니다!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Phase 4: ONE CLICK WORKFLOW (2번 요구사항)
  // 순차 파이프라인: 촬영설계 -> 프롬프트 -> 이미지 -> 영상 (단재 실패 시 중단 방어)
  const handleStartOneClickPipeline = async (retrySceneIds?: string[]) => {
    const scenesToProcess = retrySceneIds
      ? scenes.filter((s) => retrySceneIds.includes(s.id))
      : targetScenes;

    if (scenesToProcess.length === 0) return alert("처리할 Scene이 없습니다.");

    const initialStatuses: Record<string, "waiting" | "processing" | "done" | "failed"> = {};
    scenesToProcess.forEach((s) => (initialStatuses[s.id] = "waiting"));

    setQueueState({
      isActive: true,
      progress: 0,
      currentTask: "자동 제작 파이프라인 준비 중...",
      sceneStatuses: initialStatuses,
      failedSceneIds: [],
    });

    const failed: string[] = [];
    const totalSteps = scenesToProcess.length * 4;
    let completedSteps = 0;

    for (const sc of scenesToProcess) {
      setQueueState((prev) => ({
        ...prev,
        currentTask: `Scene ${sc.sceneNumber} 자동 제작 중...`,
        sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "processing" },
      }));

      let currentScene = sc;

      // Step 1: 촬영 설계
      try {
        setQueueState((prev) => ({ ...prev, currentTask: `Scene ${sc.sceneNumber} 1/4 촬영 설계 중...` }));
        const res1 = await fetch("/api/ai/shot-design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneDescription: currentScene.description,
            projectContext: {
              stylePreset: project?.stylePreset,
              character: project?.globalCharacter || project?.character,
              brand: project?.globalProduct || project?.brand,
            },
          }),
        });
        const d1 = await res1.json();
        if (!d1.success) throw new Error("촬영 설계 실패");
        currentScene = { ...currentScene, ...d1.design, status: "designed" };
        completedSteps++;
        setQueueState((prev) => ({ ...prev, progress: Math.round((completedSteps / totalSteps) * 100) }));
      } catch (err) {
        failed.push(sc.id);
        setQueueState((prev) => ({
          ...prev,
          sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "failed" },
          failedSceneIds: [...prev.failedSceneIds, sc.id],
        }));
        continue;
      }

      // Step 2: 프롬프트 생성
      try {
        setQueueState((prev) => ({ ...prev, currentTask: `Scene ${sc.sceneNumber} 2/4 프롬프트 생성 중...` }));
        const res2 = await fetch("/api/ai/prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scene: currentScene, project }),
        });
        const d2 = await res2.json();
        if (!d2.success) throw new Error("프롬프트 생성 실패");
        currentScene = {
          ...currentScene,
          imagePrompt: d2.prompts.imagePrompt,
          videoPrompt: d2.prompts.videoPrompt,
          negativePrompt: d2.prompts.negativePrompt,
          status: "ready",
        };
        completedSteps++;
        setQueueState((prev) => ({ ...prev, progress: Math.round((completedSteps / totalSteps) * 100) }));
      } catch (err) {
        failed.push(sc.id);
        setQueueState((prev) => ({
          ...prev,
          sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "failed" },
          failedSceneIds: [...prev.failedSceneIds, sc.id],
        }));
        continue;
      }

      // Step 3: 키 이미지 생성
      try {
        setQueueState((prev) => ({ ...prev, currentTask: `Scene ${sc.sceneNumber} 3/4 키 이미지 생성 중...` }));
        const res3 = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: currentScene.id,
            prompt: currentScene.imagePrompt,
            aspectRatio: project?.aspectRatio,
          }),
        });
        const d3 = await res3.json();
        if (!d3.success) throw new Error("이미지 생성 실패");
        currentScene = { ...currentScene, imageUrl: d3.imageUrl, imageStatus: "completed" };
        completedSteps++;
        setQueueState((prev) => ({ ...prev, progress: Math.round((completedSteps / totalSteps) * 100) }));
      } catch (err) {
        failed.push(sc.id);
        setQueueState((prev) => ({
          ...prev,
          sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "failed" },
          failedSceneIds: [...prev.failedSceneIds, sc.id],
        }));
        continue;
      }

      // Step 4: AI 영상 생성 요청
      try {
        setQueueState((prev) => ({ ...prev, currentTask: `Scene ${sc.sceneNumber} 4/4 영상 렌더링 큐 등록 중...` }));
        const res4 = await fetch("/api/generate/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            sceneId: currentScene.id,
            prompt: currentScene.videoPrompt,
            referenceImageUrl: currentScene.imageUrl,
            duration: Math.max(1, currentScene.endTime - currentScene.startTime),
            aspectRatio: project?.aspectRatio,
          }),
        });
        const d4 = await res4.json();
        if (!d4.success) throw new Error("영상 렌더링 요청 실패");
        currentScene = {
          ...currentScene,
          videoStatus: d4.job.status || "processing",
          videoJobId: d4.job.id,
        };
        completedSteps++;
        setQueueState((prev) => ({
          ...prev,
          progress: Math.round((completedSteps / totalSteps) * 100),
          sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "done" },
        }));
      } catch (err) {
        failed.push(sc.id);
        setQueueState((prev) => ({
          ...prev,
          sceneStatuses: { ...prev.sceneStatuses, [sc.id]: "failed" },
          failedSceneIds: [...prev.failedSceneIds, sc.id],
        }));
        continue;
      }

      // Update local and server scene state
      await fetch(`/api/scenes/${currentScene.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentScene),
      });

      setScenes((prev) => prev.map((s) => (s.id === currentScene.id ? currentScene : s)));
    }

    setQueueState((prev) => ({
      ...prev,
      progress: 100,
      currentTask:
        failed.length === 0
          ? "모든 Scene의 원클릭 제작이 성공적으로 완료되었습니다!"
          : `${failed.length}개 장면에서 오류가 발생했습니다. 재시도 가능합니다.`,
    }));
  };

  // Phase 4: Scene Duplicate (14번)
  const handleDuplicateScene = async (sceneId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/scenes/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId }),
      });
      const data = await res.json();
      if (data.success) {
        setScenes([...scenes, data.scene]);
        setSelectedSceneIds((prev) => [...prev, data.scene.id]);
        setStatusMessage("Scene이 복제되었습니다!");
        setTimeout(() => setStatusMessage(null), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 4: Scene Reorder (15번)
  const handleMoveScene = async (sceneId: string, direction: "up" | "down") => {
    const index = scenes.findIndex((s) => s.id === sceneId);
    if (index < 0) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === scenes.length - 1) return;

    const newScenes = [...scenes];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIdx];
    newScenes[targetIdx] = temp;

    const newIds = newScenes.map((s) => s.id);
    try {
      const res = await fetch(`/api/projects/${projectId}/scenes/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneIds: newIds }),
      });
      const data = await res.json();
      if (data.success) {
        setScenes(data.scenes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 4: Project Duplicate (18번)
  const handleDuplicateProject = async () => {
    if (!confirm("이 프로젝트 전체(Scenes, 설정 포함)를 복제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("프로젝트가 성공적으로 복제되었습니다.");
        router.push(`/projects/${data.project.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 4: JSON Export (19번)
  const handleExportJson = () => {
    window.open(`/api/projects/${projectId}/export`, "_blank");
  };

  // Phase 4: AI Consistency Check (23번)
  const handleRunConsistencyCheck = async () => {
    setStatusMessage("AI 감독이 전체 일관성을 정밀 분석 중입니다...");
    try {
      const res = await fetch("/api/ai/consistency/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        setConsistencyReport(data.report);
        setIsConsistencyModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusMessage(null);
    }
  };

  // Phase 4: Preflight Quality Check (24번)
  const handleRunPreflightCheck = async () => {
    try {
      const res = await fetch("/api/ai/quality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        setPreflightReport(data.report);
        setIsPreflightModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Phase 4: Export CSV (25번)
  const handleExportCsv = () => {
    const headers = [
      "SceneNumber",
      "Time",
      "Description",
      "ShotType",
      "CameraAngle",
      "Lens",
      "CameraMovement",
      "Lighting",
      "Mood",
      "ImagePrompt",
      "VideoPrompt",
    ];
    const rows = scenes.map((s) => [
      s.sceneNumber,
      `"${s.startTime}s~${s.endTime}s"`,
      `"${(s.description || "").replace(/"/g, '""')}"`,
      `"${s.shotType || ""}"`,
      `"${s.cameraAngle || ""}"`,
      `"${s.lens || ""}"`,
      `"${s.cameraMovement || ""}"`,
      `"${s.lighting || ""}"`,
      `"${s.mood || ""}"`,
      `"${(s.imagePrompt || "").replace(/"/g, '""')}"`,
      `"${(s.videoPrompt || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.name}_촬영설계표.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Phase 4: Copy All Prompts (25번)
  const handleCopyAllPrompts = () => {
    const text = scenes
      .map(
        (s) =>
          `=== SCENE ${s.sceneNumber} (${s.startTime}s~${s.endTime}s) ===\n[IMAGE PROMPT]\n${s.imagePrompt || ""}\n\n[VIDEO PROMPT]\n${s.videoPrompt || ""}\n`
      )
      .join("\n----------------------------------------\n\n");
    navigator.clipboard.writeText(text);
    setStatusMessage("모든 Scene의 프롬프트가 클립보드에 복사되었습니다!");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Scene delete
  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm("이 장면을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/scenes/${sceneId}`, { method: "DELETE" });
      if (res.ok) {
        setScenes((prev) => prev.filter((s) => s.id !== sceneId));
        setSelectedSceneIds((prev) => prev.filter((id) => id !== sceneId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scene update
  const handleUpdateScene = (updatedScene: Scene) => {
    setScenes((prev) => prev.map((s) => (s.id === updatedScene.id ? updatedScene : s)));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-zinc-400">프로젝트 작업실 로딩 중...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">{error || "프로젝트를 찾을 수 없습니다."}</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> 홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          프로젝트 목록으로
        </Link>
        {statusMessage && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-medium animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            {statusMessage}
          </div>
        )}
      </div>

      {/* Project Master Header */}
      <div className="bg-[#12141c] border border-[#212534] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-400">
                {project.type || "TVCF"}
              </span>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded">
                비율 {project.aspectRatio}
              </span>

              {/* Requirement 17: TOTAL XX.X sec Duration */}
              <span className="text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-700/60 px-2.5 py-1 rounded flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                TOTAL {totalDuration.toFixed(1)} sec ({scenes.length} Scenes)
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">{project.name}</h1>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
              {project.description || "등록된 설명이 없습니다."}
            </p>
          </div>

          {/* Master Action Utility Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateStoryboard}
              disabled={isGeneratingStoryboard}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a1e2b] border border-[#2f354a] text-blue-300 hover:bg-[#23293a] flex items-center gap-1.5 transition"
            >
              {isGeneratingStoryboard ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Film className="w-3.5 h-3.5" />
              )}
              AI 콘티 생성
            </button>

            {/* Phase 4: Consistency & Preflight Check (23, 24번) */}
            <button
              onClick={handleRunConsistencyCheck}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a2522] border border-emerald-800/60 text-emerald-300 hover:bg-[#20312d] flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              AI 일관성 검사
            </button>

            <button
              onClick={handleRunPreflightCheck}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#261e20] border border-amber-800/60 text-amber-300 hover:bg-[#33272a] flex items-center gap-1.5 transition"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
              🎬 최종 품질 검사
            </button>

            {/* Phase 4: Global Settings (12번) */}
            <button
              onClick={() => setIsGlobalSettingsOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#171a25] border border-[#262c3e] text-zinc-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              글로벌 설정
            </button>

            {/* Phase 4: Duplicate & Export (18, 19, 25번) */}
            <button
              onClick={handleDuplicateProject}
              className="p-2 rounded-xl bg-[#171a25] border border-[#262c3e] text-zinc-400 hover:text-white transition"
              title="프로젝트 전체 복제"
            >
              <CopyPlus className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-[#171a25] border border-[#262c3e] text-zinc-400 hover:text-white transition"
              title="프로젝트 JSON 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportCsv}
              className="p-2 rounded-xl bg-[#171a25] border border-[#262c3e] text-zinc-400 hover:text-white transition"
              title="촬영 설계표 CSV 내보내기"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyAllPrompts}
              className="p-2 rounded-xl bg-[#171a25] border border-[#262c3e] text-zinc-400 hover:text-white transition"
              title="프롬프트 전체 복사"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Context Indicators */}
        <div className="pt-4 border-t border-[#1d212d] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#171923] p-2.5 rounded-lg border border-[#232734]">
            <Palette className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-zinc-400">스타일:</span>
            <span className="text-white font-medium truncate">
              {project.globalStyle || project.stylePreset}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#171923] p-2.5 rounded-lg border border-[#232734]">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-400">캐릭터 락:</span>
            <span className="text-white font-medium truncate">
              {project.globalCharacter || project.character}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#171923] p-2.5 rounded-lg border border-[#232734]">
            <Building className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-zinc-400">제품/브랜드 락:</span>
            <span className="text-white font-medium truncate">
              {project.globalProduct || project.brand || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Phase 4: Queue Dashboard (4, 5번 요구사항) */}
      {queueState.isActive && (
        <div className="bg-[#12141c] border border-blue-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                제작 큐 대시보드 (Generation Queue Dashboard)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
              전체 진행률: {queueState.progress}%
            </span>
          </div>

          {/* Progress Bar (████████░░░░ 75%) */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-[#181a24] rounded-full overflow-hidden border border-[#272c3e] p-0.5">
              <div
                style={{ width: `${queueState.progress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="text-zinc-300 font-medium">{queueState.currentTask}</span>
              <span>{queueState.progress}% 완료</span>
            </div>
          </div>

          {/* Scene Queue Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
            {scenes.map((s) => {
              const st = queueState.sceneStatuses[s.id] || "waiting";
              return (
                <div
                  key={s.id}
                  className={`p-2 rounded-lg border flex items-center justify-between font-mono text-[11px] ${
                    st === "done"
                      ? "bg-emerald-950/30 border-emerald-800 text-emerald-300"
                      : st === "processing"
                      ? "bg-blue-950/30 border-blue-700 text-blue-300 animate-pulse"
                      : st === "failed"
                      ? "bg-rose-950/30 border-rose-800 text-rose-300"
                      : "bg-[#161822] border-[#252838] text-zinc-400"
                  }`}
                >
                  <span>S{s.sceneNumber}</span>
                  <span>
                    {st === "done"
                      ? "✅ 완료"
                      : st === "processing"
                      ? "🔄 진행 중"
                      : st === "failed"
                      ? "❌ 실패"
                      : "⏳ 대기"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Retry Button if failed */}
          {queueState.failedSceneIds.length > 0 && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleStartOneClickPipeline(queueState.failedSceneIds)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                실패한 {queueState.failedSceneIds.length}개 장면 다시 시도
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Timeline Bar */}
      {scenes.length > 0 && (
        <div className="bg-[#12141c] border border-[#212534] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="font-semibold text-zinc-300">
              타임라인 큐 (0s ~ {totalDuration.toFixed(1)}s)
            </span>
            <span>{scenes.length}개 장면 분할</span>
          </div>
          <div className="h-6 w-full bg-[#181a24] rounded-lg overflow-hidden flex border border-[#252a3b] p-0.5 gap-1">
            {scenes.map((s) => {
              const dur = Math.max(1, s.endTime - s.startTime);
              return (
                <div
                  key={s.id}
                  style={{ flex: dur }}
                  className={`h-full rounded text-[10px] font-mono flex items-center justify-center font-bold transition-all hover:brightness-125 cursor-pointer ${
                    s.status === "ready"
                      ? "bg-purple-600/70 text-purple-100"
                      : s.status === "designed"
                      ? "bg-blue-600/70 text-blue-100"
                      : "bg-zinc-700/60 text-zinc-300"
                  }`}
                  title={`SCENE ${s.sceneNumber}: ${s.startTime}s~${s.endTime}s (${s.description})`}
                >
                  S{s.sceneNumber} ({dur}s)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 4: 5 Scene Workflow & One-Click Toolbar (1, 2, 3번 요구사항) */}
      <div className="bg-[#12141c] border border-blue-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-[#171a25] px-3 py-1.5 rounded-lg border border-[#262c3e] transition"
          >
            {selectedSceneIds.length === scenes.length ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-500" />
            )}
            <span>전체 선택 ({selectedSceneIds.length}/{scenes.length})</span>
          </button>
          <span className="text-xs text-zinc-400">선택된 장면에 대해 일괄 작업 및 자동 제작을 실행합니다.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchShotDesign}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171924] border border-[#282d3e] text-blue-300 hover:bg-[#202434] transition"
          >
            선택 장면 촬영 설계
          </button>

          <button
            onClick={handleBatchPrompts}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171924] border border-[#282d3e] text-indigo-300 hover:bg-[#202434] transition"
          >
            선택 장면 프롬프트 생성
          </button>

          <button
            onClick={handleBatchImages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171924] border border-[#282d3e] text-emerald-300 hover:bg-[#202434] transition"
          >
            선택 장면 이미지 생성
          </button>

          <button
            onClick={handleBatchVideos}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#171924] border border-[#282d3e] text-purple-300 hover:bg-[#202434] transition"
          >
            선택 장면 영상 생성
          </button>

          {/* Requirement 2: [🚀 선택 장면 자동 제작] */}
          <button
            onClick={() => setIsOneClickModalOpen(true)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Rocket className="w-3.5 h-3.5" />
            🚀 선택 장면 자동 제작
          </button>
        </div>
      </div>

      {/* Scenes List Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            장면 시퀀스 (Scenes)
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {scenes.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            각 Scene을 체크박스로 선택하여 일괄 제작하거나, 화살표 버튼으로 순서를 변경할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Scenes Cards Grid */}
      <div className="space-y-4">
        {scenes.map((scene) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            project={project}
            isSelected={selectedSceneIds.includes(scene.id)}
            onToggleSelect={handleToggleSelectScene}
            onMoveUp={(id) => handleMoveScene(id, "up")}
            onMoveDown={(id) => handleMoveScene(id, "down")}
            onDuplicate={handleDuplicateScene}
            onUpdate={handleUpdateScene}
            onDelete={handleDeleteScene}
          />
        ))}
      </div>

      {/* Phase 4 Modals */}
      <OneClickConfirmModal
        isOpen={isOneClickModalOpen}
        onClose={() => setIsOneClickModalOpen(false)}
        selectedCount={selectedSceneIds.length}
        onConfirm={handleStartOneClickPipeline}
      />

      <GlobalSettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        project={project}
        onSaved={(updated) => setProject(updated)}
      />

      <ConsistencyReportModal
        isOpen={isConsistencyModalOpen}
        onClose={() => setIsConsistencyModalOpen(false)}
        report={consistencyReport}
      />

      <PreflightCheckModal
        isOpen={isPreflightModalOpen}
        onClose={() => setIsPreflightModalOpen(false)}
        report={preflightReport}
      />
    </div>
  );
}
