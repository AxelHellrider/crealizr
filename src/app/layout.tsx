import "./globals.css";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html style={{
      '--surface-base':   '#0f0f13',
      '--surface-raised': '#1a1a23',
      '--surface-card':   '#15151e',
      '--surface-glass':  'rgba(26, 26, 35, 0.8)',
      '--text-base':       '#e2e8f0',
      '--text-secondary':  '#64748b',
      '--accent-primary':  '#c5a059',
      '--accent-secondary':'#a8b2c1',
      '--accent-tertiary': '#dc2626',
      '--accent-special':  '#3b82f6',
      '--accent-teal':     '#14b8a6',
      '--accent-purple':   '#8b5cf6',
      '--border-accent':   'rgba(197, 160, 89, 0.4)',
      '--border-subtle':   'rgba(168, 178, 193, 0.15)',
      '--border-glass':    'rgba(197, 160, 89, 0.15)',
    } as React.CSSProperties}>
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-MXCP2F57');`}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MXCP2F57"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
