"use client";

import Script from "next/script";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

declare global {
  interface Window {
    turnstile?: {
      render: (
          container: HTMLElement | string,
          options: {
            sitekey: string;
            theme?: "light" | "dark" | "auto";
            callback?: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
          }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);

  const startedAt = useMemo(() => Date.now(), []);
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  function renderTurnstile() {
    if (!window.turnstile || !widgetRef.current || widgetIdRef.current) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      setError("Turnstile site key is missing.");
      setState("error");
      return;
    }

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token: string) => {
        setTurnstileToken(token);
        setTurnstileReady(true);
        setError("");
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setTurnstileReady(false);
      },
      "error-callback": () => {
        setTurnstileToken("");
        setTurnstileReady(false);
        setError("Captcha failed to load. Please refresh and try again.");
        setState("error");
      },
    });
  }

  function resetTurnstile() {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
    setTurnstileToken("");
    setTurnstileReady(false);
  }

  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!turnstileToken) {
      setState("error");
      setError("Please complete the captcha before sending.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
      startedAt,
      turnstileToken,
    };

    setState("submitting");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Unable to send message right now.");
      }

      setState("success");
      form.reset();
      resetTurnstile();
      return;
    } catch (submitError) {
      setState("error");
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
      resetTurnstile();
    }
  }

  return (
      <>
        <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={renderTurnstile}
        />

        <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
          <p className="hidden" aria-hidden="true">
            <label>
              Company
              <input name="company" autoComplete="off" tabIndex={-1} />
            </label>
          </p>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Name</span>
            <input
                className="ui-input"
                type="text"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Email</span>
            <input
                className="ui-input"
                type="email"
                name="email"
                required
                maxLength={254}
                autoComplete="email"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Message</span>
            <textarea
                className="ui-input min-h-40"
                name="message"
                required
                maxLength={2000}
            />
          </label>

          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">Verification</span>
            <div ref={widgetRef} />
          </div>

          <button
              type="submit"
              disabled={state === "submitting" || !turnstileReady}
              className="ui-button ui-button-primary mt-2 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {state === "submitting" ? "Sending..." : "Send Message"}
          </button>

          {state === "success" && (
              <p className="text-sm text-green-700 dark:text-green-300">
                Message sent successfully.
              </p>
          )}

          {state === "error" && <p className="text-sm text-crimson">{error}</p>}
        </form>
      </>
  );
}