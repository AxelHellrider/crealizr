"use client";

import { FormEvent, useMemo, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const startedAt = useMemo(() => Date.now(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
      startedAt,
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
      return;
    } catch (submitError) {
      setState("error");
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
      <p className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" autoComplete="off" tabIndex={-1} />
        </label>
      </p>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-muted">Name</span>
        <input className="ui-input" type="text" name="name" required maxLength={100} autoComplete="name" />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-muted">Email</span>
        <input className="ui-input" type="email" name="email" required maxLength={254} autoComplete="email" />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-muted">Message</span>
        <textarea className="ui-input min-h-40" name="message" required maxLength={2000} />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="ui-button ui-button-primary mt-2 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {state === "success" && (
        <p className="text-sm text-green-700 dark:text-green-300">Message sent successfully.</p>
      )}
      {state === "error" && <p className="text-sm text-crimson">{error}</p>}
    </form>
  );
}
