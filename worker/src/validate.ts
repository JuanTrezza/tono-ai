export const PLATFORMS = {
  linkedin: { name: 'LinkedIn', maxChars: 3000, maxOutputTokens: 2048 },
  instagram: { name: 'Instagram', maxChars: 2200, maxOutputTokens: 1536 },
  x: { name: 'X (Twitter)', maxChars: 280, maxOutputTokens: 512 },
  tiktok: { name: 'TikTok', maxChars: 2200, maxOutputTokens: 1536 },
} as const;

export const TONES = {
  profesional: 'Profesional: claro, sólido y con autoridad, sin sonar acartonado.',
  cercano: 'Cercano: conversacional y cálido, como si le hablaras a un colega.',
  inspirador: 'Inspirador: motivador y con propósito, sin frases hechas ni golpes bajos.',
  vendedor: 'Vendedor: persuasivo y orientado al beneficio concreto, sin exagerar ni prometer de más.',
  humoristico: 'Humorístico: ingenioso y liviano, con humor amable que no tape el mensaje.',
} as const;

export type Platform = keyof typeof PLATFORMS;
export type Tone = keyof typeof TONES;
export type Variant = 1 | 2 | 3;

export interface GenerateRequest {
  platform: Platform;
  tone: Tone;
  topic: string;
  audience: string;
  cta: string;
  emojis: boolean;
  hashtags: boolean;
  variant: Variant;
}

const LIMITS = { topic: 500, audience: 150, cta: 150 } as const;

type Result = { ok: true; value: GenerateRequest } | { ok: false; error: string };

const has = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
  Object.prototype.hasOwnProperty.call(obj, key);

/** Removes control characters (except newlines/tabs) and trims. */
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

export function validate(input: unknown): Result {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'El cuerpo debe ser un objeto JSON.' };
  }
  const b = input as Record<string, unknown>;

  if (typeof b.platform !== 'string' || !has(PLATFORMS, b.platform)) {
    return { ok: false, error: 'Plataforma inválida.' };
  }
  if (typeof b.tone !== 'string' || !has(TONES, b.tone)) {
    return { ok: false, error: 'Tono inválido.' };
  }
  if (b.variant !== 1 && b.variant !== 2 && b.variant !== 3) {
    return { ok: false, error: 'La variante debe ser 1, 2 o 3.' };
  }
  if (typeof b.emojis !== 'boolean' || typeof b.hashtags !== 'boolean') {
    return { ok: false, error: 'emojis y hashtags deben ser booleanos.' };
  }

  if (typeof b.topic !== 'string') {
    return { ok: false, error: 'El tema es obligatorio.' };
  }
  const topic = clean(b.topic);
  if (!topic) return { ok: false, error: 'El tema es obligatorio.' };
  if (topic.length > LIMITS.topic) {
    return { ok: false, error: `El tema no puede superar los ${LIMITS.topic} caracteres.` };
  }

  const optional = (key: 'audience' | 'cta', label: string): string | { error: string } => {
    const v = b[key];
    if (v === undefined || v === null) return '';
    if (typeof v !== 'string') return { error: `${label} debe ser texto.` };
    const s = clean(v);
    if (s.length > LIMITS[key]) return { error: `${label} no puede superar los ${LIMITS[key]} caracteres.` };
    return s;
  };

  const audience = optional('audience', 'La audiencia');
  if (typeof audience !== 'string') return { ok: false, error: audience.error };
  const cta = optional('cta', 'El llamado a la acción');
  if (typeof cta !== 'string') return { ok: false, error: cta.error };

  return {
    ok: true,
    value: {
      platform: b.platform,
      tone: b.tone,
      topic,
      audience,
      cta,
      emojis: b.emojis,
      hashtags: b.hashtags,
      variant: b.variant,
    },
  };
}
