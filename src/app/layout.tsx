import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
