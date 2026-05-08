/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ── In-memory rate limiter ─────────────────────────────────────────────────
const store = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function checkRateLimit(id: string): boolean {
  const now = Date.now();
  const entry = store.get(id);
  if (!entry || now > entry.reset) {
    store.set(id, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

// Clean up stale entries occasionally
let lastClean = Date.now();
function maybeClean() {
  const now = Date.now();
  if (now - lastClean < 5 * 60_000) return;
  lastClean = now;
  for (const [k, v] of store.entries()) {
    if (now > v.reset) store.delete(k);
  }
}

// ── Model preference list (first available wins) ───────────────────────────
const MODEL_FALLBACKS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    maybeClean();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[gemini] Missing GEMINI_API_KEY');
      return json({ error: 'API configuration error.' }, 500);
    }

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: 'Invalid JSON body.' }, 400);

    const {
      prompt,
      model: preferredModel,
      userId = 'anonymous',
    } = body as { prompt?: string; model?: string; userId?: string };

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return json({ error: 'A non-empty prompt string is required.' }, 400);
    }
    if (prompt.length > 20_000) {
      return json({ error: 'Prompt exceeds maximum allowed length.' }, 400);
    }

    // Rate limit
    const clientId = req.headers.get('X-User-ID') ?? userId;
    if (!checkRateLimit(clientId)) {
      return json({ error: 'Rate limit exceeded. Please wait a minute.' }, 429);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build model list: requested first, then fallbacks
    const candidates = preferredModel
      ? [preferredModel, ...MODEL_FALLBACKS.filter(m => m !== preferredModel)]
      : MODEL_FALLBACKS;

    // Safety settings — permissive enough for general assistants
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    let lastError: unknown;
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);

        // Check for safety blocks
        const candidate = result.response.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
          return json({ error: 'Content was blocked by safety filters. Please rephrase your message.' }, 422);
        }

        const text = result.response.text();
        if (!text) {
          return json({ error: 'The model returned an empty response.' }, 502);
        }

        return json({ response: text, model: modelName }, 200);

      } catch (err: any) {
        lastError = err;

        // Don't try fallback on auth/quota errors
        const msg: string = err?.message ?? '';
        if (msg.includes('API_KEY') || msg.includes('PERMISSION_DENIED')) {
          console.error('[gemini] Auth error:', msg);
          return json({ error: 'API authentication error.' }, 500);
        }
        if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
          return json({ error: 'API quota exceeded. Please try again later.' }, 429);
        }

        // Model not found → try next
        if (msg.includes('not found') || msg.includes('404')) {
          console.warn(`[gemini] Model not found: ${modelName}, trying next…`);
          continue;
        }

        // Unexpected error — log and try next
        console.error(`[gemini] Error with model ${modelName}:`, msg);
      }
    }

    // All models failed
    console.error('[gemini] All models failed. Last error:', lastError);
    return json({ error: 'AI service is temporarily unavailable. Please try again.' }, 503);

  } catch (err: any) {
    console.error('[gemini] Unhandled error:', err);
    return json({ error: 'Internal server error.' }, 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-User-ID',
    },
  });
}

// ── Helper ─────────────────────────────────────────────────────────────────
function json(body: object, status: number) {
  return NextResponse.json(body, { status });
}