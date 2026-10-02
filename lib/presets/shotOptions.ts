export const SHOT_TYPES = [
  "Extreme Wide Shot",
  "Wide Shot",
  "Full Shot",
  "Medium Wide Shot",
  "Medium Shot",
  "Medium Close Up",
  "Close Up",
  "Extreme Close Up",
  "Over The Shoulder",
  "POV",
  "Two Shot",
  "Low Angle Shot",
  "High Angle Shot",
  "Top Down Shot",
  "Macro Shot",
] as const;

export const CAMERA_ANGLES = [
  "Eye Level",
  "Low Angle",
  "High Angle",
  "Bird's Eye",
  "Top Down",
  "Dutch Angle",
  "Overhead",
  "Ground Level",
  "Shoulder Level",
] as const;

export const LENSES = [
  "18mm",
  "24mm",
  "28mm",
  "35mm",
  "50mm",
  "85mm",
  "100mm Macro",
  "135mm",
] as const;

export const CAMERA_MOVEMENTS = [
  "Static",
  "Slow Push In",
  "Slow Pull Out",
  "Dolly In",
  "Dolly Out",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Tracking Shot",
  "Orbit",
  "Crane Up",
  "Crane Down",
  "Handheld",
  "Steadicam",
  "Rack Focus",
] as const;

export const LIGHTINGS = [
  "Soft Natural Light",
  "Hard Sunlight",
  "Golden Hour",
  "Blue Hour",
  "Studio Softbox",
  "Three Point Lighting",
  "Rembrandt Lighting",
  "Window Light",
  "Backlight",
  "Rim Light",
  "Neon Lighting",
  "Cool Commercial Lighting",
  "Warm Commercial Lighting",
  "Dramatic Cinematic Lighting",
] as const;

export const DEFAULT_NEGATIVE_PROMPT =
  "low quality, blurry face, deformed hands, extra fingers, duplicate person, incorrect anatomy, distorted face, inconsistent character, different clothing, different hairstyle, text, logo, watermark, oversaturated colors, unwanted objects, unnatural motion, camera shake, flickering, warped background";
