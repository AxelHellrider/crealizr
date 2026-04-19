type EnvCheckLevel = "warn" | "error";

type EnvCheckIssue = {
  level: EnvCheckLevel;
  message: string;
};

declare global {
  var __crealizrEnvCheckRan: boolean | undefined;
}

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function collectIssues(): EnvCheckIssue[] {
  const issues: EnvCheckIssue[] = [];

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE;
  const mailFrom = process.env.MAIL_FROM;
  const mailTo = process.env.MAIL_TO;

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

  const smtpValues = [smtpHost, smtpPort, smtpUser, smtpPass, mailFrom, mailTo];
  const hasAnySmtp = smtpValues.some(hasValue);

  if (!hasAnySmtp) {
    issues.push({
      level: "warn",
      message: "SMTP is not configured. Contact form submissions will fail with 502.",
    });
  }

  if (hasAnySmtp) {
    if (!hasValue(smtpHost)) issues.push({ level: "error", message: "Missing SMTP_HOST." });
    if (!hasValue(smtpUser)) issues.push({ level: "error", message: "Missing SMTP_USER." });
    if (!hasValue(smtpPass)) issues.push({ level: "error", message: "Missing SMTP_PASS." });

    if (hasValue(smtpPort)) {
      const parsedPort = Number(smtpPort);
      if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
        issues.push({ level: "error", message: `Invalid SMTP_PORT: "${smtpPort}".` });
      }
    }

    if (hasValue(smtpSecure) && smtpSecure !== "true" && smtpSecure !== "false") {
      issues.push({
        level: "error",
        message: `Invalid SMTP_SECURE: "${smtpSecure}" (expected "true" or "false").`,
      });
    }
  }

  if (hasValue(turnstileSiteKey) && !hasValue(turnstileSecret)) {
    issues.push({
      level: "warn",
      message: "NEXT_PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY is missing. Captcha UI will show, verification will fail.",
    });
  }

  if (!hasValue(turnstileSiteKey) && hasValue(turnstileSecret)) {
    issues.push({
      level: "warn",
      message: "TURNSTILE_SECRET_KEY is set but NEXT_PUBLIC_TURNSTILE_SITE_KEY is missing. Captcha will be required server-side but not shown client-side.",
    });
  }

  return issues;
}

export function runStartupEnvCheck(): void {
  if (globalThis.__crealizrEnvCheckRan) return;
  globalThis.__crealizrEnvCheckRan = true;

  const strictMode = process.env.STRICT_ENV_CHECK === "true";
  const issues = collectIssues();

  if (issues.length === 0) {
    console.info("[env-check] OK: startup environment validation passed.");
    return;
  }

  for (const issue of issues) {
    const line = `[env-check] ${issue.level.toUpperCase()}: ${issue.message}`;
    if (issue.level === "error") {
      console.error(line);
    } else {
      console.warn(line);
    }
  }

  if (strictMode && issues.some((i) => i.level === "error")) {
    throw new Error("[env-check] STRICT_ENV_CHECK=true and invalid environment was detected.");
  }
}
