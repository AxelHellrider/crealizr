import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // Serve the default locale's content at the bare root without an extra
  // client-visible redirect round-trip. This used to be a 307 to /en —
  // a full extra request/response cycle before any content could render,
  // flagged by PageSpeed Insights as "Avoid multiple page redirects" and
  // contributing to document request latency. Rewriting keeps "/" in the
  // address bar while routing internally to /en. The custom header lets
  // generateMetadata (layout.tsx) tell this case apart from a direct visit
  // to /en, so it can self-canonicalize to "/" instead of pointing at a
  // different hreflang URL than the one actually in the address bar.
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    const headers = new Headers(request.headers);
    headers.set('x-rewritten-from-root', '1');
    return NextResponse.rewrite(url, { request: { headers } });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
