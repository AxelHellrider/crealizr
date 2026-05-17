import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html style={{
      '--bg': '#0f0f13',
      '--text': '#e2e8f0',
      '--accent-gold': '#c5a059',
      '--accent-silver': '#a8b2c1',
      '--accent-crimson': '#dc2626',
      '--accent-blue-ishgard': '#3b82f6',
      '--accent-teal': '#14b8a6',
      '--accent-purple': '#8b5cf6',
      '--muted': '#64748b',
      '--bg-elev': '#1a1a23',
      '--card': '#15151e',
      '--glass-bg': 'rgba(26, 26, 35, 0.8)',
      '--glass-border': 'rgba(197, 160, 89, 0.15)',
      '--border-silver': '1px solid rgba(168, 178, 193, 0.15)',
    } as React.CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
