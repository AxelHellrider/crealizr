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
  // address bar while routing internally to /en; each page's own
  // `alternates.canonical` still points at the locale-prefixed URL for SEO.
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.rewrite(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
};
