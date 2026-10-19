import { GenerationParams } from '../types';

export const isDemoMode = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.trim() === '';

interface GeneratePostOptions {
  params: GenerationParams;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
}

/**
 * Service function that coordinates post generation via streaming.
 * If VITE_API_URL is missing or empty, it runs in Demo Mode simulating real-time streaming.
 */
export async function streamPostGeneration({ params, signal, onChunk }: GeneratePostOptions): Promise<string> {
  if (isDemoMode) {
    return simulateDemoStreaming({ params, signal, onChunk });
  }

  const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  const targetUrl = `${baseUrl}/generate`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: params.platform,
        tone: params.tone,
        topic: params.topic,
        audience: params.audience,
        cta: params.cta,
        emojis: params.emojis,
        hashtags: params.hashtags,
        variant: params.variant,
      }),
      signal,
    });
  } catch (err: unknown) {
    if (signal?.aborted) {
      throw new DOMException('Generación detenida por el usuario', 'AbortError');
    }
    const message = err instanceof Error ? err.message : 'Error de conexión con el servidor de TONO.';
    throw new Error(`No se pudo conectar con el servidor: ${message}`);
  }

  if (response.status === 429) {
    throw new Error('Llegaste al límite de generaciones, probá en un rato');
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errText = await response.text();
      errorDetail = errText ? ` (${errText})` : '';
    } catch {
      // ignore
    }
    throw new Error(`Error en el servidor [${response.status}]${errorDetail}. Inténtalo de nuevo.`);
  }

  if (!response.body) {
    throw new Error('La respuesta del servidor no contiene datos de texto.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedText = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        throw new DOMException('Generación detenida por el usuario', 'AbortError');
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      onChunk(accumulatedText);
    }
  } catch (readError: unknown) {
    if (signal?.aborted || (readError instanceof DOMException && readError.name === 'AbortError')) {
      throw new DOMException('Generación detenida por el usuario', 'AbortError');
    }
    throw readError;
  }

  return accumulatedText;
}

/**
 * High-fidelity demo mode streaming generator.
 * Creates realistic, high-quality Spanish social media post copy for each variant and platform.
 */
async function simulateDemoStreaming({ params, signal, onChunk }: GeneratePostOptions): Promise<string> {
  const fullText = buildDemoPostText(params);
  let streamed = '';

  // Simulate token by token or word by word delivery
  const words = fullText.split(' ');
  const totalWords = words.length;

  for (let i = 0; i < totalWords; i++) {
    if (signal?.aborted) {
      throw new DOMException('Generación detenida por el usuario', 'AbortError');
    }

    streamed += (i === 0 ? '' : ' ') + words[i];
    onChunk(streamed);

    // Dynamic delay between 18ms and 45ms to simulate realistic neural streaming
    const delay = Math.floor(Math.random() * 25) + 18;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return streamed;
}

/**
 * Builds authentic post text tailored specifically to the platform, tone, and variant focus.
 */
function buildDemoPostText(params: GenerationParams): string {
  const { platform, tone, topic, audience, cta, emojis, hashtags, variant } = params;

  const topicSnippet = topic.trim();
  const audienceText = audience.trim() ? audience.trim() : 'profesionales y creadores';
  const ctaText = cta.trim() ? cta.trim() : getDefaultCta(platform);

  // Variant 1: Directo
  if (variant === 1) {
    return generateDirectVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags });
  }

  // Variant 2: Historia personal
  if (variant === 2) {
    return generateStoryVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags });
  }

  // Variant 3: Gancho de contrariedad
  return generateContrarianVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags });
}

function getDefaultCta(platform: string): string {
  switch (platform) {
    case 'linkedin':
      return '¿Cómo gestionás este desafío en tu equipo? Te leo en comentarios.';
    case 'instagram':
      return 'Guardá este post para consultarlo cuando planifiques tu próxima semana.';
    case 'x':
      return '¿Estás de acuerdo o tenés otra perspectiva? Dejá tu respuesta acá abajo.';
    case 'tiktok':
      return 'Seguime para más claves prácticas sobre productividad y negocio.';
    default:
      return 'Compartí tu opinión en los comentarios.';
  }
}

interface GeneratorProps {
  platform: string;
  tone: string;
  topicSnippet: string;
  audienceText: string;
  ctaText: string;
  emojis: boolean;
  hashtags: boolean;
}

function generateDirectVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags }: GeneratorProps): string {
  const eBullet = emojis ? '👉 ' : '• ';
  const eCheck = emojis ? '✅ ' : '1. ';
  const eRocket = emojis ? '🚀 ' : '';
  const eLight = emojis ? '💡 ' : '';

  if (platform === 'x') {
    let text = `${eRocket}${topicSnippet}.\n\nPara ${audienceText}, la clave es simple:\n- Ejecución ágil\n- Medir antes de opinar\n- Menos ruido y más impacto\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Estrategia #Productividad`;
    }
    return text;
  }

  if (platform === 'linkedin') {
    let text = `La mayor trampa no es la falta de ideas. Es el tiempo que te consume el formato.\n\n${topicSnippet}\n\nSi tu foco está puesto en ${audienceText}, estos son los 3 pasos que marcan la diferencia hoy:\n\n${eBullet}1. Simplificar la estructura: gancho claro en la primera línea.\n${eBullet}2. Traducir conceptos abstractos en acciones cuantificables.\n${eBullet}3. Reducir la fricción operativa para publicar de forma consistente.\n\n${eCheck}Resultado: Menos horas perdidas frente a la hoja en blanco y más tiempo dedicado a la estrategia real.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Productividad #EstrategiaDigital #CrecimientoB2B #Contenido`;
    }
    return text;
  }

  if (platform === 'instagram') {
    let text = `${eRocket}Clave directa para ${audienceText}:\n\n${topicSnippet}\n\n${eLight}3 principios no negociables:\n${eBullet}Menos complejidad innecesaria\n${eBullet}Consistencia sobre perfección\n${eBullet}Foco en la solución del usuario\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Estrategia #CreadoresDeContenido #MarketingDigital #Tips`;
    }
    return text;
  }

  // TikTok
  let text = `[Guión directo de 30 segundos]\n\n"Si sos parte de ${audienceText}, frená un segundo.\n\n${topicSnippet}.\n\nAcá va el paso a paso exacto que tenés que aplicar hoy:\n1. Definí tu objetivo principal.\n2. Automatizá lo repetitivo.\n3. Medí el resultado en 7 días.\n\n${ctaText}"`;
  if (hashtags) {
    text += `\n\n#Productividad #Consejos #AprenderEnTikTok #Viral`;
  }
  return text;
}

function generateStoryVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags }: GeneratorProps): string {
  const ePin = emojis ? '📍 ' : '';
  const eSpark = emojis ? '✨ ' : '';

  if (platform === 'x') {
    let text = `Hace unos meses pasaba horas trabado en cómo encarar esto:\n\n"${topicSnippet}"\n\nEl punto de quiebre fue entender que la consistencia le gana a la inspiración.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Storytelling #Aprendizaje`;
    }
    return text;
  }

  if (platform === 'linkedin') {
    let text = `Hace 6 meses pasaba 3 horas cada domingo planificando los contenidos de la semana. La mitad quedaba a medias por puro agotamiento mental.\n\nEl problema de fondo era este:\n"${topicSnippet}"\n\nDiseñamos un sistema pensado específicamente para ${audienceText}. No para reemplazar el criterio propio, sino para multiplicar la velocidad de iteración.\n\n${ePin}Tres aprendizajes clave que transformaron el proceso:\n1. La consistencia le gana a la inspiración de última hora.\n2. La tecnología es un sparring creativo, no un piloto automático.\n3. Cuando eliminás la fricción de arranque, publicás con el triple de claridad.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Emprendimiento #MarketingDigital #Creadores #Lecciones`;
    }
    return text;
  }

  if (platform === 'instagram') {
    let text = `${eSpark}Una confesión honesta sobre cómo cambió mi forma de trabajar:\n\n${topicSnippet}\n\nDurante mucho tiempo pensé que tenía que hacerlo todo a pulmón. Hoy entiendo que el valor está en el mensaje, no en el sufrimiento de redactarlo.\n\nUn recordatorio para ${audienceText}: tu tiempo vale más cuando estás creando valor real.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Emprender #MarcasPersonales #Reflexion #Productividad`;
    }
    return text;
  }

  // TikTok
  let text = `[Storytelling en primera persona - 45s]\n\n"Te voy a contar lo que me pasó cuando intenté resolver esto:\n\n${topicSnippet}\n\nTerminé frustrado, perdiendo horas y sin avanzar. Hasta que hice un solo cambio estructural.\n\nSi estás en ${audienceText}, no cometas mi mismo error.\n\n${ctaText}"`;
  if (hashtags) {
    text += `\n\n#HistoriaReal #Storytime #Emprendedores #Negocios`;
  }
  return text;
}

function generateContrarianVariant({ platform, tone, topicSnippet, audienceText, ctaText, emojis, hashtags }: GeneratorProps): string {
  const eAlert = emojis ? '👀 ' : '';
  const eFire = emojis ? '🔥 ' : '';

  if (platform === 'x') {
    let text = `${eAlert}Opinión impopular:\n\nLa mayoría comete el mismo error con este tema: ${topicSnippet}.\n\nNo necesitás más volumen, necesitás más precisión y criterio.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Debate #Opinion`;
    }
    return text;
  }

  if (platform === 'linkedin') {
    let text = `El 90% de quienes crean contenido cometen el mismo error: escriben pensando en algoritmos, no en personas con poder de decisión.\n\n${eAlert}La realidad sobre este tema:\n${topicSnippet}\n\nSi tu audiencia es ${audienceText}, dejar de seguir modas superficiales es el mejor atajo hacia la autoridad real.\n\nLos 3 mitos que conviene desterrar hoy:\n- Mito 1: "Más publicaciones siempre significan más clientes" (Falso: la relevancia manda).\n- Mito 2: "Hay que sonar sofisticado para vender" (Falso: la claridad genera confianza).\n- Mito 3: "Las herramientas reemplazan la estrategia" (Falso: potencian lo que ya tenés definido).\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#EstrategiaB2B #ContenidoDeValor #Desmitificando #Growth`;
    }
    return text;
  }

  if (platform === 'instagram') {
    let text = `${eFire}Dejá de hacer lo que todos hacen con esto:\n\n"${topicSnippet}"\n\nEl juego en redes cambió para ${audienceText}. Menos fórmulas vacías y más sustancia aplicable.\n\n${ctaText}`;
    if (hashtags) {
      text += `\n\n#Mitos #MarketingHonesto #ContenidoDigital #Estrategia`;
    }
    return text;
  }

  // TikTok
  let text = `[Gancho de contrariedad - 35s]\n\n"Te mintieron sobre cómo funciona esto.\n\nTe dicen que tenés que pasarte 5 horas al día creando posts. Pero la realidad es otra:\n\n${topicSnippet}\n\nGuardate esto antes de que sigas perdiendo el tiempo haciendo lo que ya no funciona.\n\n${ctaText}"`;
  if (hashtags) {
    text += `\n\n#MitosDesmentidos #ConsejosReales #Viralizar #Creadores`;
  }
  return text;
}
