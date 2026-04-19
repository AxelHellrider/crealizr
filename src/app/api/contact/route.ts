import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  startedAt?: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_FORM_FILL_MS = 1500;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const globalRateBuckets =
  (globalThis as { __contactRateBuckets?: Map<string, RateBucket> }).__contactRateBuckets ??
  new Map<string, RateBucket>();

(globalThis as { __contactRateBuckets?: Map<string, RateBucket> }).__contactRateBuckets = globalRateBuckets;

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const xRealIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || xRealIp || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `${ip}:${userAgent.slice(0, 80)}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = globalRateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    globalRateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return true;
  }

  bucket.count += 1;
  return false;
}

function sanitizeInput(value: string): string {
  return value.replace(/\0/g, "").trim();
}

function validatePayload(payload: ContactPayload): string | null {
  const name = sanitizeInput(payload.name || "");
  const email = sanitizeInput(payload.email || "");
  const message = sanitizeInput(payload.message || "");
  const company = sanitizeInput(payload.company || "");
  const startedAt = Number(payload.startedAt || 0);

  if (company.length > 0) {
    return "Invalid submission.";
  }

  if (!name || name.length > 100) {
    return "Name is required and must be 100 characters or fewer.";
  }

  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return "A valid email is required.";
  }

  if (!message || message.length > 2000) {
    return "Message is required and must be 2000 characters or fewer.";
  }

  if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FORM_FILL_MS) {
    return "Submission completed too quickly. Please try again.";
  }

  return null;
}

async function forwardToWebhook(payload: Required<Pick<ContactPayload, "name" | "email" | "message">>) {
  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error("Webhook delivery failed.");
  }
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as ContactPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const name = sanitizeInput(payload.name || "");
  const email = sanitizeInput(payload.email || "");
  const message = sanitizeInput(payload.message || "");

  try {
    await forwardToWebhook({ name, email, message });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Message accepted but delivery failed. Please email contact@crealizr.net." }, { status: 502 });
  }
}
