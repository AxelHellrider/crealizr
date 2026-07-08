import Script from "next/script";

/** Sets Google Consent Mode v2 defaults (all denied) before GTM loads, so the tag itself is always present in the served HTML — only the cookies it's allowed to write depend on the visitor's later decision. */
export default function ConsentDefault() {
    return (
        <Script id="consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ window.dataLayer.push(arguments); }
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied'
              });
            `}
        </Script>
    );
}
