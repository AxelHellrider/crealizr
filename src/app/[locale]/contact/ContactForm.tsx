"use client";

import Link from "next/link";
import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

/** Combined submit + CAPTCHA state — Turnstile callbacks and the submit flow always update these fields together. */
type FormState = {
  state: SubmitState;
  error: string;
  turnstileToken: string;
  turnstileReady: boolean;
};

type FormAction =
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "CAPTCHA_SUCCESS"; token: string }
  | { type: "CAPTCHA_EXPIRED" }
  | { type: "CAPTCHA_ERROR"; message: string }
  | { type: "CAPTCHA_REQUIRED"; message: string }
  | { type: "RESET_CAPTCHA" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SUBMIT_START":
      return { ...state, state: "submitting", error: "" };
    case "SUBMIT_SUCCESS":
      return { ...state, state: "success" };
    case "SUBMIT_ERROR":
      return { ...state, state: "error", error: action.message };
    case "CAPTCHA_SUCCESS":
      return { ...state, turnstileToken: action.token, turnstileReady: true, error: "" };
    case "CAPTCHA_EXPIRED":
      return { ...state, turnstileToken: "", turnstileReady: false };
    case "CAPTCHA_ERROR":
      return { ...state, turnstileToken: "", turnstileReady: false, error: action.message, state: "error" };
    case "CAPTCHA_REQUIRED":
      return { ...state, state: "error", error: action.message };
    case "RESET_CAPTCHA":
      return { ...state, turnstileToken: "", turnstileReady: false };
    default:
      return state;
  }
}

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
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const turnstileEnabled = Boolean(turnstileSiteKey);

  const [{ state, error, turnstileToken, turnstileReady }, dispatch] = useReducer(formReducer, {
    state: "idle",
    error: "",
    turnstileToken: "",
    turnstileReady: !turnstileEnabled,
  });
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false);

  const startedAt = useRef(Date.now()).current;
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderTurnstile = useCallback(() => {
    if (!turnstileEnabled || !turnstileScriptLoaded) return;
    if (!window.turnstile || !widgetRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(widgetRef.current, {
      sitekey: turnstileSiteKey,
      theme: "auto",
      callback: (token: string) => {
        dispatch({ type: "CAPTCHA_SUCCESS", token });
      },
      "expired-callback": () => {
        dispatch({ type: "CAPTCHA_EXPIRED" });
      },
      "error-callback": () => {
        dispatch({ type: "CAPTCHA_ERROR", message: t("captchaError") });
      },
    });
  }, [turnstileEnabled, turnstileScriptLoaded, turnstileSiteKey, t]);

  function resetTurnstile() {
    if (!turnstileEnabled) return;
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
    dispatch({ type: "RESET_CAPTCHA" });
  }

  useEffect(() => {
    renderTurnstile();
  }, [renderTurnstile]);

  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (turnstileEnabled && !turnstileToken) {
      dispatch({ type: "CAPTCHA_REQUIRED", message: t("captchaRequired") });
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

    dispatch({ type: "SUBMIT_START" });

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
        throw new Error(body.error || t("submitError"));
      }

      dispatch({ type: "SUBMIT_SUCCESS" });
      form.reset();
      resetTurnstile();
      return;
    } catch (submitError) {
      dispatch({
        type: "SUBMIT_ERROR",
        message: submitError instanceof Error ? submitError.message : "Unexpected error.",
      });
      resetTurnstile();
    }
  }

  return (
      <>
        {turnstileEnabled && (
          <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
              strategy="afterInteractive"
              onLoad={() => setTurnstileScriptLoaded(true)}
          />
        )}

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 overflow-x-hidden" noValidate>
          <p className="hidden" aria-hidden="true">
            <label>
              Company
              <input name="company" autoComplete="off" tabIndex={-1} />
            </label>
          </p>

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-widest text-muted">{t("name")}</span>
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
            <span className="text-xs uppercase tracking-widest text-muted">{t("email")}</span>
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
            <span className="text-xs uppercase tracking-widest text-muted">{t("message")}</span>
            <textarea
                className="ui-input min-h-40"
                name="message"
                required
                maxLength={2000}
            />
          </label>

          {turnstileEnabled && (
            <div className="grid gap-2">
              <span className="text-xs uppercase tracking-widest text-muted">{t("verification")}</span>
              <div ref={widgetRef} className="overflow-x-hidden max-w-full" />
            </div>
          )}

          <p className="text-xs text-muted">
            {t.rich("privacyNotice", {
              link: (chunks) => (
                <Link href={`/${locale}/privacy`} className="ui-link">
                  {chunks}
                </Link>
              ),
            })}
          </p>

          <button
              type="submit"
              disabled={state === "submitting" || (turnstileEnabled && !turnstileReady)}
              className="ui-button ui-button-primary mt-2 w-full lg:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {state === "submitting"
              ? t("sending")
              : turnstileEnabled && !turnstileReady
                ? t("completeVerification")
                : t("sendMessage")}
          </button>

          {state === "success" && (
              <p className="text-sm text-green-700 dark:text-green-300">
                {t("success")}
              </p>
          )}

          {state === "error" && <p className="text-sm text-crimson">{error}</p>}
        </form>
      </>
  );
}
