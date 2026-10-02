import fs from "fs";
import path from "path";
import {
  Project,
  Scene,
  StylePreset,
  GenerationJob,
  CharacterProfile,
  ProductProfile,
  SavedPrompt,
  WorkflowTemplate,
} from "../types";
import { DEFAULT_STYLE_PRESETS } from "../presets/styles";
import { DEFAULT_WORKFLOW_TEMPLATES, INITIAL_SAVED_PROMPTS } from "../presets/templates";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const SCENES_FILE = path.join(DATA_DIR, "scenes.json");
const STYLES_FILE = path.join(DATA_DIR, "styles.json");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
const CHARACTERS_FILE = path.join(DATA_DIR, "characters.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const PROMPTS_FILE = path.join(DATA_DIR, "prompts.json");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");

function ensureDirectoryAndFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STYLES_FILE)) {
    fs.writeFileSync(STYLES_FILE, JSON.stringify(DEFAULT_STYLE_PRESETS, null, 2), "utf-8");
  }

  if (!fs.existsSync(JOBS_FILE)) {
    fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(CHARACTERS_FILE)) {
    const initialCharacters: CharacterProfile[] = [
      {
        id: "char-eastar-01",
        name: "민우 (Minwoo)",
        gender: "남성",
        age: "20대 후반",
        appearance: "단정한 짧은 흑발, 맑고 또렷한 눈매, 친근하고 밝은 미소",
        hairstyle: "Clean short black taper haircut",
        costume: "Beige light linen jacket, white inner tee, navy relaxed slacks",
        bodyType: "Slim athletic, 178cm",
        facialFeatures: "Warm expressive eyes, approachable smile, defined jawline",
        features: "설레는 여행객 이미지, 자연스러운 제스처",
        referenceImageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1200&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "char-sua-02",
        name: "수아 (Sua - 셀 애니메이션)",
        gender: "여성",
        age: "17세 (고교 1년)",
        appearance: "둥글고 친근한 인상, 짙은 흑갈색 단발 머리",
        hairstyle: "Neat shoulder-length dark brown bob with soft bangs",
        costume: "Cream-colored knit cardigan, coral inner top, light blue denim",
        bodyType: "Natural teenage proportions",
        facialFeatures: "Big expressive eyes, 2-stage anime cel shading",
        features: "harness.md 기준 정본 캐릭터",
        referenceImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(initialCharacters, null, 2), "utf-8");
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    const initialProducts: ProductProfile[] = [
      {
        id: "prod-eastar-jet",
        name: "이스타항공 B737-8 항공기",
        brand: "Eastar Jet",
        modelName: "Boeing 737-8 Next Gen",
        color: "Clean Pearl White with Eastar Signature Red Winglet Star",
        material: "Aerospace composite aluminum and glossy enamel",
        shape: "Aerodynamic commercial jet airliner",
        size: "Commercial twin-engine airliner scale",
        keyFeatures: "Red star logo on vertical stabilizer, clean streamlined cabin windows",
        referenceImageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "prod-veloa-d1",
        name: "VÉLOA D1 프리미엄 식기세척기",
        brand: "VÉLOA",
        modelName: "D1 Countertop",
        color: "Ivory White with Matte Rose-Gold accents",
        material: "Ultra-fine matte antibacterial ceramic and tempered glass",
        shape: "Rounded rectangular compact countertop",
        size: "450mm x 420mm x 460mm",
        keyFeatures: "Hidden capacitive touch display, transparent viewing window, ambient interior LED",
        referenceImageUrl: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?q=80&w=1200&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2), "utf-8");
  }

  if (!fs.existsSync(PROMPTS_FILE)) {
    fs.writeFileSync(PROMPTS_FILE, JSON.stringify(INITIAL_SAVED_PROMPTS, null, 2), "utf-8");
  }

  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(DEFAULT_WORKFLOW_TEMPLATES, null, 2), "utf-8");
  }

  if (!fs.existsSync(PROJECTS_FILE)) {
    const sampleProjects: Project[] = [
      {
        id: "proj-eastar-01",
        name: "이스타항공 브랜드 TVCF - 날아오르는 순간",
        type: "TVCF",
        aspectRatio: "16:9",
        duration: 15,
        sceneCount: 5,
        stylePreset: "airline-commercial",
        globalStyle: "Airline Commercial",
        character: "20대 후반 단정한 여행객 남성, 미소 띤 설레는 표정",
        characterId: "char-eastar-01",
        brand: "이스타항공 (Eastar Jet)",
        productId: "prod-eastar-jet",
        description: "공항에서 출발하여 비행기에 탑승하고 새로운 목적지에 도착하기까지의 설렘과 편안한 비행 경험을 담은 감성적 항공사 광고",
        status: "in_progress",
        globalCharacter: "20대 후반 단정한 여행객 남성 (민우), 베이지 리넨 재킷, 단정한 흑발",
        globalProduct: "이스타항공 시그니처 레드 스타 로고가 새겨진 여객기",
        globalEnvironment: "현대적이고 웅장한 공항 터미널 및 하늘 위의 쾌적한 기내",
        globalLighting: "Golden hour and soft diffused commercial sunlight",
        globalColor: "Sky blue, crisp white, warm golden highlights",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(sampleProjects, null, 2), "utf-8");
  }

  if (!fs.existsSync(SCENES_FILE)) {
    const sampleScenes: Scene[] = [
      {
        id: "scene-eastar-01",
        projectId: "proj-eastar-01",
        sceneNumber: 1,
        startTime: 0,
        endTime: 3,
        description: "공항 터미널에서 캐리어를 끌며 출발 게이트 전광판을 올려다보는 남자의 설레는 시작",
        shotType: "Medium Wide Shot",
        cameraAngle: "Eye Level",
        lens: "35mm",
        composition: "Rule of Thirds",
        cameraMovement: "Slow Push In",
        subjectPosition: "Right third of frame",
        lighting: "Soft Natural Light",
        keyLight: "45 degree front-left golden sun",
        fillLight: "Soft modern terminal ambient fill",
        rimLight: "Subtle back edge rim light",
        depthOfField: "Shallow",
        background: "Modern Korean airport terminal with glass architectural curves",
        mood: "Calm, sophisticated, hopeful",
        colorTone: "Airy sky blue, gentle warm highlights",
        action: "남자가 캐리어를 잡고 부드럽게 전광판을 바라보며 설레는 미소를 짓는다",
        imagePrompt: "A cinematic commercial photograph of a handsome young Korean man in late 20s standing inside a modern Korean airport terminal, holding a luggage handle. Short neat black hair, beige light jacket, relaxed posture. Medium wide shot, eye-level camera angle, 35mm lens, rule of thirds composition. Soft golden morning light streaming through vast floor-to-ceiling glass windows, shallow depth of field with blurred airport travelers in background. World-class airline brand film aesthetic, calm, sophisticated, hopeful mood, 8k resolution, crisp commercial realism.",
        videoPrompt: "A young Korean man stands in a brightly lit modern airport terminal holding a sleek carry-on suitcase. The camera starts at a medium wide distance and performs a smooth, cinematic slow push in toward his upper body. He gently turns his gaze up toward the departure flight boards, his lips forming an anticipating, subtle smile. Ambient travelers softly move in the distant background out of focus. Smooth fluid camera motion, natural human breathing cadence, no jarring shakes.",
        negativePrompt: "low quality, blurry face, deformed hands, extra fingers, duplicate person, incorrect anatomy, distorted face, inconsistent character, different clothing, different hairstyle, text, logo, watermark, oversaturated colors, unwanted objects, unnatural motion, camera shake, flickering, warped background",
        imageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=1200&auto=format&fit=crop",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        imageStatus: "completed",
        videoStatus: "completed",
        status: "ready",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-eastar-02",
        projectId: "proj-eastar-01",
        sceneNumber: 2,
        startTime: 3,
        endTime: 6,
        description: "탑승구 통로(브릿지)를 걸어가며 창밖으로 주기되어 있는 빨간 별 포인트의 비행기를 바라봄",
        shotType: "Medium Shot",
        cameraAngle: "Shoulder Level",
        lens: "50mm",
        composition: "Diagonal Leading Lines",
        cameraMovement: "Tracking Shot",
        subjectPosition: "Center-left",
        lighting: "Warm Commercial Lighting",
        keyLight: "Sunlight reflecting off jet engine",
        fillLight: "Gentle jet bridge interior light",
        rimLight: "Bright morning edge glow on shoulder",
        depthOfField: "Medium",
        background: "Aircraft boarding bridge, tarmac with commercial airplane",
        mood: "Excited, anticipatory",
        colorTone: "Warm amber and crisp white",
        action: "탑승교를 걸어가며 기대감 가득한 눈빛으로 창밖 비행기를 쳐다본다",
        imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop",
        imageStatus: "completed",
        videoStatus: "not_generated",
        status: "designed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-eastar-03",
        projectId: "proj-eastar-01",
        sceneNumber: 3,
        startTime: 6,
        endTime: 9,
        description: "비행기 좌석에 편안하게 앉아 안전벨트를 매고 미소를 짓는 모습",
        shotType: "Medium Close Up",
        cameraAngle: "Eye Level",
        lens: "35mm",
        composition: "Rule of Thirds",
        cameraMovement: "Static",
        subjectPosition: "Center",
        lighting: "Soft Natural Light",
        keyLight: "Aircraft cabin window light",
        fillLight: "Overhead soft reading light",
        rimLight: "Gentle headrest rim light",
        depthOfField: "Shallow",
        background: "Clean, comfortable modern airplane cabin seat",
        mood: "Comfortable, serene, relaxed",
        colorTone: "Cozy warm neutral tones",
        action: "좌석 등받이에 기대어 숨을 고르고 만족스러운 미소를 짓는다",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
        imageStatus: "completed",
        videoStatus: "not_generated",
        status: "designed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-eastar-04",
        projectId: "proj-eastar-01",
        sceneNumber: 4,
        startTime: 9,
        endTime: 12,
        description: "구름 위를 날아가는 비행기 창문 너머로 쏟아지는 찬란한 태양과 구름 바다를 감상",
        shotType: "Close Up",
        cameraAngle: "Eye Level",
        lens: "50mm",
        composition: "Negative Space",
        cameraMovement: "Rack Focus",
        subjectPosition: "Left third looking out right",
        lighting: "Golden Hour",
        keyLight: "Blinding golden sunlight streaming through airplane window",
        fillLight: "Golden bounce from cabin interior",
        rimLight: "Strong hair golden rim glow",
        depthOfField: "Shallow",
        background: "Airplane oval window showing majestic sea of clouds under glowing sky",
        mood: "Awe-inspiring, poetic, dreamy",
        colorTone: "Golden hour sunset orange and deep cloud blue",
        action: "창문에 턱을 괴고 밖의 구름 바다를 황홀하게 응시한다",
        imageStatus: "not_generated",
        videoStatus: "not_generated",
        status: "designed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-eastar-05",
        projectId: "proj-eastar-01",
        sceneNumber: 5,
        startTime: 12,
        endTime: 15,
        description: "푸른 바다와 이국적인 휴양지에 도착해 캐리어를 끌고 활기차게 걸어나가는 마지막 장면",
        shotType: "Wide Shot",
        cameraAngle: "Low Angle",
        lens: "24mm",
        composition: "Symmetrical Centered",
        cameraMovement: "Slow Pull Out",
        subjectPosition: "Center walking toward horizon",
        lighting: "Hard Sunlight",
        keyLight: "Bright midday tropical sunlight",
        fillLight: "Sand and blue ocean bounce",
        rimLight: "Crisp tropical highlight",
        depthOfField: "Deep",
        background: "Exotic coastal destination with turquoise ocean and palm trees",
        mood: "Liberating, joyful, triumphant",
        colorTone: "Vivid azure, emerald, sunlit white",
        action: "남자가 선글라스를 끼며 푸른 해변을 향해 자신감 넘치게 걸어간다",
        imageStatus: "not_generated",
        videoStatus: "not_generated",
        status: "designed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(SCENES_FILE, JSON.stringify(sampleScenes, null, 2), "utf-8");
  }
}

// PROJECTS
export async function getProjects(): Promise<Project[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function saveProject(project: Project): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const now = new Date().toISOString();

  if (index >= 0) {
    projects[index] = { ...project, updatedAt: now };
  } else {
    projects.unshift({ ...project, createdAt: now, updatedAt: now });
  }

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");

  const scenes = await getScenes();
  const remainingScenes = scenes.filter((s) => s.projectId !== id);
  fs.writeFileSync(SCENES_FILE, JSON.stringify(remainingScenes, null, 2), "utf-8");

  return true;
}

// SCENES
export async function getScenes(projectId?: string): Promise<Scene[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(SCENES_FILE, "utf-8");
  const scenes: Scene[] = JSON.parse(data);
  if (projectId) {
    return scenes
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => a.sceneNumber - b.sceneNumber);
  }
  return scenes;
}

export async function getSceneById(id: string): Promise<Scene | null> {
  const scenes = await getScenes();
  return scenes.find((s) => s.id === id) || null;
}

export async function saveScene(scene: Scene): Promise<Scene> {
  const scenes = await getScenes();
  const index = scenes.findIndex((s) => s.id === scene.id);
  const now = new Date().toISOString();

  let saved: Scene;
  if (index >= 0) {
    saved = { ...scenes[index], ...scene, updatedAt: now };
    scenes[index] = saved;
  } else {
    saved = { ...scene, createdAt: now, updatedAt: now };
    scenes.push(saved);
  }

  fs.writeFileSync(SCENES_FILE, JSON.stringify(scenes, null, 2), "utf-8");
  return saved;
}

export async function saveScenes(newScenes: Scene[]): Promise<Scene[]> {
  const scenes = await getScenes();
  const now = new Date().toISOString();

  for (const newScene of newScenes) {
    const index = scenes.findIndex((s) => s.id === newScene.id);
    if (index >= 0) {
      scenes[index] = { ...scenes[index], ...newScene, updatedAt: now };
    } else {
      scenes.push({ ...newScene, createdAt: now, updatedAt: now });
    }
  }

  fs.writeFileSync(SCENES_FILE, JSON.stringify(scenes, null, 2), "utf-8");
  return newScenes;
}

export async function deleteScene(id: string): Promise<boolean> {
  const scenes = await getScenes();
  const filtered = scenes.filter((s) => s.id !== id);
  if (filtered.length === scenes.length) return false;

  fs.writeFileSync(SCENES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function reorderScenes(projectId: string, sceneIds: string[]): Promise<Scene[]> {
  const allScenes = await getScenes();
  const otherScenes = allScenes.filter((s) => s.projectId !== projectId);
  const projectScenes = allScenes.filter((s) => s.projectId === projectId);

  const sceneMap = new Map<string, Scene>();
  projectScenes.forEach((s) => sceneMap.set(s.id, s));

  let currentStartTime = 0;
  const reorderedProjectScenes: Scene[] = [];

  sceneIds.forEach((id, index) => {
    const scene = sceneMap.get(id);
    if (scene) {
      const dur = Math.max(1, scene.endTime - scene.startTime);
      const updated: Scene = {
        ...scene,
        sceneNumber: index + 1,
        startTime: currentStartTime,
        endTime: currentStartTime + dur,
        updatedAt: new Date().toISOString(),
      };
      currentStartTime += dur;
      reorderedProjectScenes.push(updated);
    }
  });

  const merged = [...otherScenes, ...reorderedProjectScenes];
  fs.writeFileSync(SCENES_FILE, JSON.stringify(merged, null, 2), "utf-8");
  return reorderedProjectScenes;
}

// STYLES
export async function getStyles(): Promise<StylePreset[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(STYLES_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveStyle(style: StylePreset): Promise<StylePreset> {
  const styles = await getStyles();
  const index = styles.findIndex((s) => s.id === style.id);
  if (index >= 0) {
    styles[index] = style;
  } else {
    styles.push(style);
  }
  fs.writeFileSync(STYLES_FILE, JSON.stringify(styles, null, 2), "utf-8");
  return style;
}

// JOBS (VIDEO & IMAGE & BATCH)
export async function getJobs(): Promise<GenerationJob[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(JOBS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function getJobById(id: string): Promise<GenerationJob | null> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === id) || null;
}

export async function saveJob(job: GenerationJob): Promise<GenerationJob> {
  const jobs = await getJobs();
  const index = jobs.findIndex((j) => j.id === job.id);
  const now = new Date().toISOString();

  let saved: GenerationJob;
  if (index >= 0) {
    saved = { ...jobs[index], ...job, updatedAt: now };
    jobs[index] = saved;
  } else {
    saved = { ...job, createdAt: now, updatedAt: now };
    jobs.unshift(saved);
  }

  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
  return saved;
}

// CHARACTERS (Phase 4)
export async function getCharacters(): Promise<CharacterProfile[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(CHARACTERS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function getCharacterById(id: string): Promise<CharacterProfile | null> {
  const characters = await getCharacters();
  return characters.find((c) => c.id === id) || null;
}

export async function saveCharacter(character: CharacterProfile): Promise<CharacterProfile> {
  const characters = await getCharacters();
  const index = characters.findIndex((c) => c.id === character.id);
  const now = new Date().toISOString();

  let saved: CharacterProfile;
  if (index >= 0) {
    saved = { ...characters[index], ...character, updatedAt: now };
    characters[index] = saved;
  } else {
    saved = { ...character, createdAt: now, updatedAt: now };
    characters.unshift(saved);
  }

  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2), "utf-8");
  return saved;
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const characters = await getCharacters();
  const filtered = characters.filter((c) => c.id !== id);
  if (filtered.length === characters.length) return false;
  fs.writeFileSync(CHARACTERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

// PRODUCTS (Phase 4)
export async function getProductsProfiles(): Promise<ProductProfile[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function getProductById(id: string): Promise<ProductProfile | null> {
  const products = await getProductsProfiles();
  return products.find((p) => p.id === id) || null;
}

export async function saveProductProfile(product: ProductProfile): Promise<ProductProfile> {
  const products = await getProductsProfiles();
  const index = products.findIndex((p) => p.id === product.id);
  const now = new Date().toISOString();

  let saved: ProductProfile;
  if (index >= 0) {
    saved = { ...products[index], ...product, updatedAt: now };
    products[index] = saved;
  } else {
    saved = { ...product, createdAt: now, updatedAt: now };
    products.unshift(saved);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  return saved;
}

export async function deleteProductProfile(id: string): Promise<boolean> {
  const products = await getProductsProfiles();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

// SAVED PROMPTS & FAVORITES (Phase 4)
export async function getSavedPrompts(): Promise<SavedPrompt[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(PROMPTS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveSavedPrompt(prompt: SavedPrompt): Promise<SavedPrompt> {
  const prompts = await getSavedPrompts();
  const index = prompts.findIndex((p) => p.id === prompt.id);
  const now = new Date().toISOString();

  let saved: SavedPrompt;
  if (index >= 0) {
    saved = { ...prompts[index], ...prompt };
    prompts[index] = saved;
  } else {
    saved = { ...prompt, createdAt: now };
    prompts.unshift(saved);
  }

  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), "utf-8");
  return saved;
}

export async function deleteSavedPrompt(id: string): Promise<boolean> {
  const prompts = await getSavedPrompts();
  const filtered = prompts.filter((p) => p.id !== id);
  if (filtered.length === prompts.length) return false;
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

// TEMPLATES (Phase 4)
export async function getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
  ensureDirectoryAndFiles();
  const data = fs.readFileSync(TEMPLATES_FILE, "utf-8");
  return JSON.parse(data);
}

export async function saveWorkflowTemplate(tpl: WorkflowTemplate): Promise<WorkflowTemplate> {
  const templates = await getWorkflowTemplates();
  const index = templates.findIndex((t) => t.id === tpl.id);
  if (index >= 0) {
    templates[index] = tpl;
  } else {
    templates.push(tpl);
  }
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), "utf-8");
  return tpl;
}
