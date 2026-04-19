import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { POST } from "@/app/api/contact/route";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
  company?: string;
  startedAt: number;
};

function makeRequest(payload: ContactPayload, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "vitest-agent",
      "x-forwarded-for": "203.0.113.5",
      ...headers,
    },
    body: JSON.stringify(payload),
  }) as NextRequest;
}

async function responseBody(response: Response) {
  return (await response.json()) as { ok?: boolean; error?: string };
}

describe("contact api validation and credibility", () => {
  const originalTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const originalSmtpHost = process.env.SMTP_HOST;
  const originalSmtpUser = process.env.SMTP_USER;
  const originalSmtpPass = process.env.SMTP_PASS;
  const originalMailFrom = process.env.MAIL_FROM;
  const originalMailTo = process.env.MAIL_TO;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TURNSTILE_SECRET_KEY = "";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "mailer@example.com";
    process.env.SMTP_PASS = "secret";
    process.env.MAIL_FROM = "mailer@example.com";
    process.env.MAIL_TO = "contact@crealizr.net";
    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({}),
    } as unknown as ReturnType<typeof nodemailer.createTransport>);
    (globalThis as { __contactRateBuckets?: Map<string, { count: number; resetAt: number }> }).__contactRateBuckets?.clear();
  });

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalTurnstileSecret;
    process.env.SMTP_HOST = originalSmtpHost;
    process.env.SMTP_USER = originalSmtpUser;
    process.env.SMTP_PASS = originalSmtpPass;
    process.env.MAIL_FROM = originalMailFrom;
    process.env.MAIL_TO = originalMailTo;
  });

  it("accepts a credible valid payload and sends email", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);

    const payload: ContactPayload = {
      name: "Alice DM",
      email: "alice@example.com",
      message: "I found a bug in the travel encounter generator.",
      startedAt: 8_000,
      company: "",
    };
    const response = await POST(makeRequest(payload));
    const body = await responseBody(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("accepts max-length boundary values", async () => {
    vi.spyOn(Date, "now").mockReturnValue(20_000);

    const payload: ContactPayload = {
      name: "A".repeat(100),
      email: "a@b.co",
      message: "M".repeat(2000),
      startedAt: 18_000,
      company: "",
    };
    const response = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.6" }));

    expect(response.status).toBe(200);
  });

  it("rejects honeypot-filled bot submissions", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    const payload: ContactPayload = {
      name: "Alice DM",
      email: "alice@example.com",
      message: "Hello",
      startedAt: 8_000,
      company: "bot-filled-field",
    };
    const response = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.7" }));
    const body = await responseBody(response);

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/invalid submission/i);
  });

  it("rejects too-fast submissions", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    const payload: ContactPayload = {
      name: "Alice DM",
      email: "alice@example.com",
      message: "Hello",
      startedAt: 9_200,
      company: "",
    };
    const response = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.8" }));
    const body = await responseBody(response);

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/too quickly/i);
  });

  it("rejects invalid email format", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    const payload: ContactPayload = {
      name: "Alice DM",
      email: "not-an-email",
      message: "Hello",
      startedAt: 8_000,
      company: "",
    };
    const response = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.9" }));
    const body = await responseBody(response);

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/valid email/i);
  });

  it("rate-limits bursts after five attempts per client key", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);

    const payload: ContactPayload = {
      name: "Alice DM",
      email: "alice@example.com",
      message: "Repeated message.",
      startedAt: 8_000,
      company: "",
    };

    for (let i = 0; i < 5; i += 1) {
      const ok = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.10" }));
      expect(ok.status).toBe(200);
    }

    const limited = await POST(makeRequest(payload, { "x-forwarded-for": "203.0.113.10" }));
    const body = await responseBody(limited);

    expect(limited.status).toBe(429);
    expect(body.error).toMatch(/too many requests/i);
  });
});
