import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  startedAt?: number;
  turnstileToken?: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_FORM_FILL_MS = 1500;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const globalRateBuckets =
    (globalThis as { __contactRateBuckets?: Map<string, RateBucket> }).__contactRateBuckets ??
    new Map<string, RateBucket>();

(globalThis as { __contactRateBuckets?: Map<string, RateBucket> }).__contactRateBuckets = globalRateBuckets;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const xRealIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || xRealIp || "";
}

function getClientKey(request: NextRequest): string {
  const ip = getClientIp(request) || "unknown";
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

function escapeHtml(value: string): string {
  return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
}

function validatePayload(payload: ContactPayload): string | null {
  const name = sanitizeInput(payload.name || "");
  const email = sanitizeInput(payload.email || "");
  const message = sanitizeInput(payload.message || "");
  const company = sanitizeInput(payload.company || "");
  const startedAt = Number(payload.startedAt || 0);
  const turnstileToken = sanitizeInput(payload.turnstileToken || "");

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

  if (!turnstileToken) {
    return "Captcha verification is required.";
  }

  return null;
}

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("TURNSTILE_SECRET_KEY is missing.");
  }

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error("Turnstile verification request failed.");
  }

  const result = (await response.json()) as TurnstileVerifyResponse;
  if (!result.success) {
    console.error("Turnstile error codes:", result["error-codes"]);
  }

  return result.success;
}

async function sendContactEmail(payload: Required<Pick<ContactPayload, "name" | "email" | "message">>) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user;
  const to = process.env.MAIL_TO || "contact@crealizr.net";

  if (!host || !user || !pass || !from || !to) {
    throw new Error("Email configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");

  await transporter.sendMail({
    from: `"CRealizr Contact Form" <${from}>`,
    to,
    replyTo: payload.email,
    subject: `New contact form submission from ${payload.name}`,
    text: [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      payload.message,
    ].join("\n"),
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
  });
}

export async function POST(request: NextRequest) {
  const key = getClientKey(request);

  if (isRateLimited(key)) {
    return NextResponse.json(
        { error: "Too many requests. Please wait and try again." },
        { status: 429 }
    );
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
  const turnstileToken = sanitizeInput(payload.turnstileToken || "");
  const ip = getClientIp(request);

  try {
    const isHuman = await verifyTurnstile(turnstileToken, ip);

    if (!isHuman) {
      return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 }
      );
    }

    await sendContactEmail({ name, email, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
        { error: "Message accepted but delivery failed. Please email contact@crealizr.net directly." },
        { status: 502 }
    );
  }
}