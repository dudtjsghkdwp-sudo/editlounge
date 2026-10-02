export type VideoAspectRatio = "16:9" | "9:16" | "1:1";

export type VideoType =
  | "광고"
  | "TVCF"
  | "YouTube Shorts"
  | "제품 광고"
  | "브랜드 영상"
  | "다큐멘터리"
  | "판타지"
  | "뮤직비디오"
  | "기타";

export interface Project {
  id: string;
  name: string;
  type: VideoType | string;
  aspectRatio: VideoAspectRatio;
  duration: number; // in seconds
  sceneCount: number;
  stylePreset: string;
  globalStyle?: string;
  character: string;
  characterId?: string;
  brand?: string;
  productId?: string;
  description: string;
  status?: "draft" | "in_progress" | "completed";

  // Phase 4: Global Settings (12번)
  globalCharacter?: string;
  globalProduct?: string;
  globalEnvironment?: string;
  globalLighting?: string;
  globalColor?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ShotDesignData {
  shotType: string;
  cameraAngle: string;
  lens: string;
  composition: string;
  cameraMovement: string;
  subjectPosition: string;
  lighting: string;
  keyLight: string;
  fillLight: string;
  rimLight: string;
  depthOfField: string;
  background: string;
  mood: string;
  colorTone: string;
  action: string;
}

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface GenerationJob {
  id: string;
  projectId: string;
  sceneId: string;
  type: "video" | "image" | "batch";
  status: JobStatus;
  progress?: number;
  provider: string;
  model: string;
  prompt?: string;
  referenceImageUrl?: string;
  duration?: number;
  aspectRatio?: string;
  resultUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scene extends Partial<ShotDesignData> {
  id: string;
  projectId: string;
  sceneNumber: number;
  startTime: number;
  endTime: number;
  description: string;

  imagePrompt?: string;
  videoPrompt?: string;
  negativePrompt?: string;

  imageUrl?: string;
  videoUrl?: string;

  imageStatus?: "not_generated" | JobStatus;
  videoStatus?: "not_generated" | JobStatus;
  videoJobId?: string;

  status?: "draft" | "designed" | "ready" | "error";
  errorMessage?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  cameraStyle: string;
  lightingStyle: string;
  colorStyle: string;
  compositionStyle: string;
  movementStyle: string;
  promptTemplate: string;
}

export interface DirectorRecommendation {
  shotType: string;
  cameraAngle: string;
  lens: string;
  composition: string;
  cameraMovement: string;
  lighting: string;
  depthOfField: string;
  action: string;
  mood: string;
  directorNote?: string;
}

// Phase 4: Character Manager (6, 7, 8번)
export interface CharacterProfile {
  id: string;
  name: string;
  gender: string;
  age: string;
  appearance: string;
  hairstyle: string;
  costume: string;
  bodyType: string;
  facialFeatures: string;
  features: string;
  referenceImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Phase 4: Product Manager (9, 10, 11번)
export interface ProductProfile {
  id: string;
  name: string;
  brand: string;
  modelName: string;
  color: string;
  material: string;
  shape: string;
  size: string;
  keyFeatures: string;
  referenceImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Phase 4: Prompt Library & Favorites (21, 22번)
export type PromptCategory =
  | "Camera"
  | "Lighting"
  | "Product"
  | "Character"
  | "Fantasy"
  | "Commercial"
  | "Shorts"
  | "Cinematic";

export interface SavedPrompt {
  id: string;
  title: string;
  promptText: string;
  category: PromptCategory;
  isFavorite: boolean;
  createdAt: string;
}

// Phase 4: Consistency & Quality Check Results (8, 11, 23, 24번)
export interface ConsistencyIssue {
  sceneId?: string;
  sceneNumber: number;
  category: "Character" | "Product" | "Environment" | "Lighting" | "Color" | "Camera" | "Style" | "Brand";
  severity: "정상" | "주의" | "문제";
  title: string;
  description: string;
  suggestion?: string;
}

export interface ProjectQualityCheckItem {
  sceneNumber: number;
  status: "ok" | "warning" | "error";
  title: string;
  message: string;
}

// Phase 4: Workflow Template (26, 28번)
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  type: VideoType;
  duration: number;
  sceneCount: number;
  aspectRatio: VideoAspectRatio;
  stylePreset: string;
  defaultPromptIdeas?: string[];
  isCustom?: boolean;
}
