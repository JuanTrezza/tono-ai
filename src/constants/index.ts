import { PlatformConfig, ToneConfig, TemplateItem, VariantNumber } from '../types';

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    maxChars: 3000,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    maxChars: 2200,
  },
  {
    id: 'x',
    name: 'X / Twitter',
    shortName: 'X',
    maxChars: 280,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    maxChars: 2200,
  },
];

export const TONES: ToneConfig[] = [
  { id: 'profesional', label: 'Profesional' },
  { id: 'cercano', label: 'Cercano' },
  { id: 'inspirador', label: 'Inspirador' },
  { id: 'vendedor', label: 'Vendedor' },
  { id: 'humoristico', label: 'Humorístico' },
];

export const VARIANT_FOCUSES: Record<VariantNumber, string> = {
  1: 'Directo',
  2: 'Historia personal',
  3: 'Gancho de contrariedad',
};

export const QUICK_TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-lanzamiento',
    title: 'Lanzamiento de producto',
    badge: 'B2B',
    description: 'Anuncio de nueva funcionalidad destacando el beneficio para el usuario final con estructura de gancho + problema + solución.',
    topic: 'Anuncio de nueva funcionalidad destacando el beneficio para el usuario final con estructura de gancho + problema + solución.',
    platform: 'linkedin',
    tone: 'profesional',
    audience: 'Fundadores, creadores de contenido y agencias',
    cta: 'Probar gratis con 14 días de prueba',
  },
  {
    id: 'tpl-leccion',
    title: 'Lección o fracaso constructivo',
    badge: 'Storytelling',
    description: 'Una reflexión honesta sobre un error en mi negocio que me enseñó a cambiar de enfoque y qué decisiones tomé para solucionarlo.',
    topic: 'Una reflexión honesta sobre un error en mi negocio que me enseñó a cambiar de enfoque y qué decisiones tomé para solucionarlo.',
    platform: 'linkedin',
    tone: 'inspirador',
    audience: 'Emprendedores y líderes de proyectos',
    cta: '¿Cuál fue el error que más te enseñó a vos? Te leo en comentarios.',
  },
  {
    id: 'tpl-carrusel',
    title: 'Carrusel de consejos prácticos',
    badge: 'Educativo',
    description: '5 herramientas indispensables que aumentan la productividad de un equipo remoto en 2025 explicadas paso a paso con beneficios claros.',
    topic: '5 herramientas indispensables que aumentan la productividad de un equipo remoto en 2025 explicadas paso a paso con beneficios claros.',
    platform: 'x',
    tone: 'cercano',
    audience: 'Profesionales remotos y equipos ágiles',
    cta: 'Guardá este post para cuando planifiques tu semana.',
  },
];

export const ALL_TEMPLATES: TemplateItem[] = [
  ...QUICK_TEMPLATES,
  {
    id: 'tpl-caso-estudio',
    title: 'Caso de estudio con métricas',
    badge: 'Resultados',
    description: 'Cómo logramos escalar los resultados en un 140% sin aumentar el presupuesto en pauta publicitaria.',
    topic: 'Caso de estudio: cómo aumentamos las conversiones optimizando la claridad del mensaje sin recurrir a descuentos ni clickbait agresivo.',
    platform: 'linkedin',
    tone: 'profesional',
    audience: 'Directores de marketing y ventas',
    cta: 'Dejá un comentario y te comparto el documento con el desglose paso a paso.',
  },
  {
    id: 'tpl-contrariedad',
    title: 'Desmitificación de una creencia común',
    badge: 'Opinión',
    description: 'Cuestionamiento de una práctica estándar en tu industria que considerás ineficiente o perjudicial.',
    topic: 'La mayoría cree que publicar 3 veces por día garantiza alcance orgánico. La realidad en 2025 es exactamente la contraria.',
    platform: 'x',
    tone: 'humoristico',
    audience: 'Creadores y estrategas de contenido',
    cta: '¿Estás de acuerdo o preferís cantidad antes que profundidad?',
  },
  {
    id: 'tpl-detras-de-escena',
    title: 'Detrás de escena / Hito del equipo',
    badge: 'Cultura',
    description: 'Mostrá el proceso real detrás del desarrollo de un proyecto o hito relevante de tu empresa.',
    topic: 'Lo que nadie te cuenta de armar una empresa desde cero: los 3 momentos críticos donde estuvimos a punto de abandonar y qué nos mantuvo a flote.',
    platform: 'instagram',
    tone: 'cercano',
    audience: 'Comunidad de emprendedores y clientes fieles',
    cta: 'Contame si alguna vez pasaste por una etapa similar en tu trabajo.',
  },
  {
    id: 'tpl-guion-tiktok',
    title: 'Guión de video corto con gancho visual',
    badge: 'Video',
    description: 'Estructura ágil para video vertical de 45 segundos con corte rápido y llamado a la acción conciso.',
    topic: '3 trucos sencillos que aplico todos los días antes de las 9:00 AM para no perder el foco con notificaciones.',
    platform: 'tiktok',
    tone: 'cercano',
    audience: 'Gente joven y profesionales en busca de hábitos saludables',
    cta: 'Seguime para más consejos prácticos de productividad diaria.',
  },
  {
    id: 'tpl-oferta-lanzamiento',
    title: 'Oferta directa de valor con urgencia',
    badge: 'Ventas',
    description: 'Presentación clara de un servicio o producto nuevo destacando la transformación que genera en el cliente.',
    topic: 'Abrimos 5 cupos para auditoría de estrategia de contenidos personalizada este mes. Te mostramos los cuellos de botella de tu cuenta.',
    platform: 'linkedin',
    tone: 'vendedor',
    audience: 'Dueños de negocio y marcas personales',
    cta: 'Escribime "AUDITORÍA" por mensaje directo y coordinamos una llamada rápida.',
  },
];

export const MAX_TOPIC_LENGTH = 500;
export const STORAGE_HISTORY_KEY = 'tono_post_history_v1';
export const MAX_HISTORY_ITEMS = 20;
