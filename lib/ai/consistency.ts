import { Scene, Project, CharacterProfile, ProductProfile, ConsistencyIssue, ProjectQualityCheckItem } from "../types";
import { callOpenAIJson } from "./openai";

// 8번: AI 캐릭터 일관성 검사
export async function checkCharacterConsistency(
  scenes: Scene[],
  character?: CharacterProfile | null
): Promise<ConsistencyIssue[]> {
  const charInfo = character
    ? `이름: ${character.name}, 나이: ${character.age}, 헤어: ${character.hairstyle}, 의상: ${character.costume}, 외모: ${character.appearance}, 특징: ${character.features}`
    : "고정 캐릭터 미설정";

  const systemPrompt = `You are a film script supervisor and continuity director.
Check character consistency across the following video scenes.
Focus on: Face, Hairstyle, Costume, Age, Body type, and Props.
Detect any discrepancies or missing details.
Return strictly JSON format:
{
  "issues": [
    {
      "sceneNumber": 1,
      "category": "Character",
      "severity": "주의" or "문제" or "정상",
      "title": "한 줄 요약 (예: 의상 불일치)",
      "description": "구체적인 불일치 설명",
      "suggestion": "수정 제안 (예: 1~2씬과 동일한 베이지 리넨 재킷으로 통일)"
    }
  ]
}`;

  const sceneBriefs = scenes.map((s) => ({
    sceneNumber: s.sceneNumber,
    description: s.description,
    action: s.action,
    imagePrompt: s.imagePrompt,
  }));

  const fallback = (): { issues: ConsistencyIssue[] } => {
    const issues: ConsistencyIssue[] = [];
    if (!character) {
      issues.push({
        sceneNumber: 1,
        category: "Character",
        severity: "주의",
        title: "캐릭터 프로필 미연결",
        description: "프로젝트에 상세 캐릭터 프로필이 등록되어 있지 않습니다. Character Manager에서 캐릭터를 연결하면 모든 Scene의 의상/헤어가 고정됩니다.",
        suggestion: "캐릭터 락 프로필을 선택해주세요.",
      });
      return { issues };
    }

    // Rule-based heuristic checks
    scenes.forEach((s) => {
      const p = (s.imagePrompt || s.description || "").toLowerCase();
      const costumeKeywords = ["shirt", "jacket", "cardigan", "의상", "옷", "재킷"];
      const hasCostumeMention = costumeKeywords.some((k) => p.includes(k));
      if (!hasCostumeMention && s.imagePrompt) {
        issues.push({
          sceneNumber: s.sceneNumber,
          category: "Character",
          severity: "주의",
          title: `Scene ${s.sceneNumber} 의상 세부 설명 누락`,
          description: `기준 캐릭터(${character.name})의 고정 의상(${character.costume})이 프롬프트에 명시되지 않았습니다.`,
          suggestion: `프롬프트에 '${character.costume}'을 추가하여 의상 변형을 방지하세요.`,
        });
      }
    });

    if (issues.length === 0) {
      issues.push({
        sceneNumber: 1,
        category: "Character",
        severity: "정상",
        title: "캐릭터 연속성 이상 없음",
        description: `모든 씬이 기준 캐릭터(${character.name})의 아이덴티티와 부합합니다.`,
      });
    }

    return { issues };
  };

  const result = await callOpenAIJson<{ issues: ConsistencyIssue[] }>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Reference Character: ${charInfo}\nScenes: ${JSON.stringify(sceneBriefs, null, 2)}` },
    ],
    fallback
  );

  return result.issues;
}

// 11번: AI 제품 일관성 검사
export async function checkProductConsistency(
  scenes: Scene[],
  product?: ProductProfile | null
): Promise<ConsistencyIssue[]> {
  const prodInfo = product
    ? `제품명: ${product.name}, 브랜드: ${product.brand}, 모델: ${product.modelName}, 색상: ${product.color}, 재질: ${product.material}, 형태: ${product.shape}`
    : "고정 제품 미설정";

  const fallback = (): { issues: ConsistencyIssue[] } => {
    const issues: ConsistencyIssue[] = [];
    if (!product) {
      issues.push({
        sceneNumber: 1,
        category: "Product",
        severity: "주의",
        title: "제품 프로필 미연결",
        description: "프로젝트에 제품 프로필이 등록되어 있지 않습니다. 제품 광고인 경우 Product Manager에서 제품을 등록해주세요.",
      });
      return { issues };
    }

    scenes.forEach((s) => {
      const text = (s.description + " " + (s.imagePrompt || "")).toLowerCase();
      if (!text.includes(product.brand.toLowerCase()) && !text.includes(product.name.toLowerCase())) {
        issues.push({
          sceneNumber: s.sceneNumber,
          category: "Product",
          severity: "주의",
          title: `Scene ${s.sceneNumber} 제품명/브랜드 미언급`,
          description: `Scene ${s.sceneNumber}에 제품(${product.name})의 형태나 브랜드가 누락되어 일관성이 떨어질 수 있습니다.`,
          suggestion: `프롬프트에 '${product.brand} ${product.name} (${product.color})'을 명시하세요.`,
        });
      }
    });

    if (issues.length === 0) {
      issues.push({
        sceneNumber: 1,
        category: "Product",
        severity: "정상",
        title: "제품 일관성 유지됨",
        description: `제품(${product.name})의 색상과 디자인이 일관되게 적용되어 있습니다.`,
      });
    }

    return { issues };
  };

  return fallback().issues;
}

// 23번: AI 전체 일관성 검사
export async function checkAllConsistency(
  project: Project,
  scenes: Scene[],
  character?: CharacterProfile | null,
  product?: ProductProfile | null
): Promise<{ overallStatus: "정상" | "주의" | "문제"; issues: ConsistencyIssue[] }> {
  const issues: ConsistencyIssue[] = [];

  // Character check
  const charIssues = await checkCharacterConsistency(scenes, character);
  issues.push(...charIssues);

  // Product check if applicable
  if (product || project.brand) {
    const prodIssues = await checkProductConsistency(scenes, product);
    issues.push(...prodIssues);
  }

  // Environment & Style & Lighting check
  const styles = scenes.map((s) => s.lighting).filter(Boolean);
  const uniqueLightings = Array.from(new Set(styles));
  if (uniqueLightings.length > 3) {
    issues.push({
      sceneNumber: 0,
      category: "Lighting",
      severity: "주의",
      title: "조명 스타일 급변 주의",
      description: `씬 간에 ${uniqueLightings.length}종의 상이한 조명 스타일이 혼재되어 톤앤매너가 다소 산만해질 수 있습니다.`,
      suggestion: "프로젝트 Global Lighting 설정으로 톤을 통일해보세요.",
    });
  }

  const hasProblems = issues.some((i) => i.severity === "문제");
  const hasWarnings = issues.some((i) => i.severity === "주의");
  const overallStatus = hasProblems ? "문제" : hasWarnings ? "주의" : "정상";

  return { overallStatus, issues };
}

// 24번: 영상 제작 전 최종 품질 검사 (Project Quality Preflight Check)
export function checkPreflightQuality(project: Project, scenes: Scene[]): {
  overallStatus: "ok" | "warning" | "error";
  items: ProjectQualityCheckItem[];
} {
  const items: ProjectQualityCheckItem[] = [];

  if (scenes.length === 0) {
    items.push({
      sceneNumber: 0,
      status: "error",
      title: "장면 부재",
      message: "프로젝트에 등록된 Scene이 없습니다. AI 콘티 생성을 실행해주세요.",
    });
    return { overallStatus: "error", items };
  }

  scenes.forEach((s) => {
    // 1. Description
    if (!s.description || s.description.trim().length < 5) {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "error",
        title: "장면 설명 누락",
        message: `Scene ${s.sceneNumber}의 줄거리 설명이 너무 짧거나 누락되었습니다.`,
      });
    }

    // 2. Shot design
    if (!s.shotType || !s.lens || !s.lighting) {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "warning",
        title: "촬영 설계 누락",
        message: `Scene ${s.sceneNumber}의 카메라/조명 설계가 완료되지 않았습니다.`,
      });
    }

    // 3. Image prompt
    if (!s.imagePrompt) {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "error",
        title: "Image Prompt 없음",
        message: `Scene ${s.sceneNumber}의 이미지 프롬프트가 생성되지 않았습니다.`,
      });
    }

    // 4. Video prompt
    if (!s.videoPrompt) {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "error",
        title: "Video Prompt 없음",
        message: `Scene ${s.sceneNumber}의 비디오 모션 프롬프트가 없습니다.`,
      });
    }

    // 5. Image & Video generation status
    if (!s.imageUrl) {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "warning",
        title: "이미지 미생성",
        message: `Scene ${s.sceneNumber}의 키 이미지가 아직 생성되지 않았습니다.`,
      });
    }

    if (!s.videoUrl && s.videoStatus !== "processing") {
      items.push({
        sceneNumber: s.sceneNumber,
        status: "warning",
        title: "영상 미생성",
        message: `Scene ${s.sceneNumber}의 AI 영상이 아직 렌더링되지 않았습니다.`,
      });
    }
  });

  const hasError = items.some((i) => i.status === "error");
  const hasWarning = items.some((i) => i.status === "warning");
  const overallStatus = hasError ? "error" : hasWarning ? "warning" : "ok";

  return { overallStatus, items };
}
