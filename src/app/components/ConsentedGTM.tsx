"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { useCookieConsent } from "@/app/context/CookieConsentContext";

const GTM_ID = "GTM-MXCP2F57";

/** Loads Google Tag Manager only once a visitor has granted cookie consent — never on first paint, never for "denied"/"unset". */
export default function ConsentedGTM() {
    const { status } = useCookieConsent();
    if (status !== "granted") return null;
    return <GoogleTagManager gtmId={GTM_ID} />;
}
