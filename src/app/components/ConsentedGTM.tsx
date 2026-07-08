import { GoogleTagManager } from "@next/third-parties/google";

const GTM_ID = "GTM-MXCP2F57";

/** Always loads GTM so the tag is present in server-rendered HTML; Consent Mode v2 defaults (set by ConsentDefault) keep it from writing analytics/ad cookies until the visitor grants consent. */
export default function ConsentedGTM() {
    return (
        <>
            {/* @next/third-parties doesn't emit GTM's standard <noscript> fallback, so it's added manually right after it in body order. */}
            <noscript>
                <iframe
                    src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                    height="0"
                    width="0"
                    style={{ display: "none", visibility: "hidden" }}
                />
            </noscript>
            <GoogleTagManager gtmId={GTM_ID} />
        </>
    );
}
