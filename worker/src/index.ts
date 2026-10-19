import { buildPrompt, SYSTEM_INSTRUCTION } from './prompt';
import { PLATFORMS, validate, type GenerateRequest } from './validate';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions?alt=sse';
const MAX_BODY_BYTES = 4096;
const UPSTREAM_TIMEOUT_MS = 60_000;

const MSG = {
  quota: 'El servicio de IA está saturado o sin cuota disponible. Probá de nuevo en unos minutos.',
  upstream: 'No se pudo generar el post en este momento. Probá de nuevo.',
  blocked: 'No se pudo generar un post con ese contenido. Probá reformulando el tema.',
  rateLimit: 'Demasiados pedidos. Esperá un minuto y probá de nuevo.',
  config: 'El servicio no está configurado correctamente.',
} as const;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
    const cors = origin && allowed.includes(origin) ? corsHeaders(origin) : null;

    if (url.pathname !== '/generate') return text('No encontrado.', 404, cors);

    // Only the allowed frontends may call the API. Browsers enforce CORS; this also
    // rejects casual non-browser calls that don't send an allowed Origin.
    if (!cors) return text('Origen no permitido.', 403, null);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    if (request.method !== 'POST') {
      return text('Método no permitido.', 405, { ...cors, Allow: 'POST, OPTIONS' });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const { success } = await env.RATE_LIMITER.limit({ key: `generate:${ip}` });
    if (!success) return text(MSG.rateLimit, 429, { ...cors, 'Retry-After': '60' });

    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
      return text('El cuerpo debe ser JSON (Content-Type: application/json).', 415, cors);
    }
    if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES) {
      return text('El pedido es demasiado grande.', 413, cors);
    }
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return text('El pedido es demasiado grande.', 413, cors);

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return text('JSON inválido.', 400, cors);
    }
    const parsed = validate(body);
    if (!parsed.ok) return text(parsed.error, 400, cors);

    if (!env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY no está configurada');
      return text(MSG.config, 500, cors);
    }

    return generate(parsed.value, env, cors);
  },
} satisfies ExportedHandler<Env>;

async function generate(req: GenerateRequest, env: Env, cors: Record<string, string>): Promise<Response> {
  const platform = PLATFORMS[req.platform];
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        model: env.GEMINI_MODEL,
        system_instruction: SYSTEM_INSTRUCTION,
        input: buildPrompt(req),
        stream: true,
        store: false,
        generation_config: {
          max_output_tokens: platform.maxOutputTokens,
          thinking_level: 'low',
        },
      }),
      signal: abort.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error('Gemini fetch failed', err instanceof Error ? err.message : err);
    return text(MSG.upstream, 502, cors);
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    // Log status and body for debugging; never forward them to the client.
    console.error('Gemini error', upstream.status, (await upstream.text().catch(() => '')).slice(0, 500));
    return upstream.status === 429 ? text(MSG.quota, 503, cors) : text(MSG.upstream, 502, cors);
  }

  const events = sseEvents(upstream.body);
  const finish = () => {
    clearTimeout(timeout);
    abort.abort();
  };

  // Wait for the first text chunk so errors that happen before any output
  // can still be reported with a proper HTTP status.
  let first: string;
  try {
    const result = await nextText(events);
    if (result.kind !== 'text') {
      finish();
      console.error('Gemini returned no text', result.kind === 'done' ? 'empty' : result.detail);
      return text(result.kind === 'blocked' ? MSG.blocked : MSG.upstream, 502, cors);
    }
    first = result.text;
  } catch (err) {
    finish();
    console.error('Gemini stream failed', err instanceof Error ? err.message : err);
    return text(MSG.upstream, 502, cors);
  }

  const encoder = new TextEncoder();
  let emitted = 0;

  // Hard cap at the platform limit in case the model overshoots.
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, chunk: string): boolean => {
    const room = platform.maxChars - emitted;
    const piece = chunk.length > room ? chunk.slice(0, room) : chunk;
    if (piece) controller.enqueue(encoder.encode(piece));
    emitted += piece.length;
    return emitted < platform.maxChars;
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      if (!emit(controller, first.trimStart())) {
        finish();
        controller.close();
      }
    },
    async pull(controller) {
      try {
        const result = await nextText(events);
        if (result.kind === 'text' && emit(controller, result.text)) return;
        if (result.kind === 'error' || result.kind === 'blocked') {
          console.error('Gemini stream ended with error', result.detail);
        }
      } catch (err) {
        console.error('Gemini stream failed', err instanceof Error ? err.message : err);
      }
      finish();
      controller.close();
    },
    cancel() {
      // The client aborted (e.g. "Detener"): stop the upstream request too.
      finish();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...cors,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

type StreamResult =
  | { kind: 'text'; text: string }
  | { kind: 'done' }
  | { kind: 'blocked'; detail: unknown }
  | { kind: 'error'; detail: unknown };

/** Advances the Gemini event stream until the next text delta or a terminal event. */
async function nextText(events: AsyncGenerator<unknown>): Promise<StreamResult> {
  while (true) {
    const { value, done } = await events.next();
    if (done) return { kind: 'done' };
    const ev = value as {
      event_type?: string;
      delta?: { type?: string; text?: string };
      error?: unknown;
      interaction?: { status?: string };
    };

    switch (ev.event_type) {
      case 'step.delta':
        if (ev.delta?.type === 'text' && ev.delta.text) return { kind: 'text', text: ev.delta.text };
        break;
      case 'error':
        return { kind: 'error', detail: ev.error };
      case 'interaction.completed': {
        const status = ev.interaction?.status;
        // "incomplete" = hit max_output_tokens; whatever text we got is still usable.
        if (status === 'failed' || status === 'cancelled') return { kind: 'blocked', detail: status };
        return { kind: 'done' };
      }
    }
  }
}

/** Parses a Server-Sent Events body into JSON payloads. */
async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;

      let boundary: number;
      while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');

        const data = block
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n');
        if (!data) continue;
        if (data === '[DONE]') return;
        try {
          yield JSON.parse(data);
        } catch {
          // Ignore malformed or non-JSON events.
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

function corsHeaders(origin: string): Record<string, string> {
  return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
}

function text(message: string, status: number, headers: Record<string, string> | null): Response {
  return new Response(message, {
    status,
    headers: {
      ...(headers ?? { Vary: 'Origin' }),
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
