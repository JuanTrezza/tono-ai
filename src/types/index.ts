export type PlatformId = 'linkedin' | 'instagram' | 'x' | 'tiktok';

export type ToneId = 'profesional' | 'cercano' | 'inspirador' | 'vendedor' | 'humoristico';

export type VariantNumber = 1 | 2 | 3;

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  maxChars: number;
  shortName: string;
}

export interface ToneConfig {
  id: ToneId;
  label: string;
}

export interface GenerationParams {
  platform: PlatformId;
  tone: ToneId;
  topic: string;
  audience: string;
  cta: string;
  emojis: boolean;
  hashtags: boolean;
  variant: VariantNumber;
}

export interface VariantState {
  variant: VariantNumber;
  focus: string; // #1: "Directo", #2: "Historia personal", #3: "Gancho de contrariedad"
  content: string;
  isStreaming: boolean;
  error: string | null;
  abortController?: AbortController;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  platform: PlatformId;
  tone: ToneId;
  topic: string;
  audience: string;
  cta: string;
  emojis: boolean;
  hashtags: boolean;
  variants: {
    variant: VariantNumber;
    focus: string;
    content: string;
  }[];
}

export interface TemplateItem {
  id: string;
  title: string;
  badge: string;
  topic: string;
  platform: PlatformId;
  tone: ToneId;
  audience?: string;
  cta?: string;
  description?: string;
}
