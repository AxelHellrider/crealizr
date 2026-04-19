import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
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
  const originalWebhook = process.env.CONTACT_WEBHOOK_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CONTACT_WEBHOOK_URL = "https://example.test/webhook";
    (globalThis as { __contactRateBuckets?: Map<string, { count: number; resetAt: number }> }).__contactRateBuckets?.clear();
  });

  afterEach(() => {
    process.env.CONTACT_WEBHOOK_URL = originalWebhook;
  });

  it("accepts a credible valid payload and forwards it", async () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

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
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("accepts max-length boundary values", async () => {
    vi.spyOn(Date, "now").mockReturnValue(20_000);
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

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
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

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
