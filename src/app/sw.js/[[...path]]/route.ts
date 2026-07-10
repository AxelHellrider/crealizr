import { createSerwistRoute } from "@serwist/turbopack";

// useNativeEsbuild defaults to true on Windows and false everywhere else,
// which pulls in `esbuild-wasm` on Linux hosts — a package never installed
// here. Forcing native `esbuild` avoids that platform-specific dependency
// entirely; it's already resolvable (see @serwist/turbopack's own deps).
const route = createSerwistRoute({ swSrc: "src/app/sw.ts", useNativeEsbuild: true });

export const { dynamic, dynamicParams, revalidate } = route;

// @serwist/turbopack (experimental Turbopack support, v9.5.11) types its
// generated route's catch-all param as a single `path: string`, but Next.js
// 16 actually requires `[[...path]]` catch-all segments to use `path: string[]`
// in both generateStaticParams and the handler's params — these adapters
// bridge the mismatch (joining/splitting on "/") rather than suppressing it.
export async function generateStaticParams() {
    const params = await route.generateStaticParams();
    return params.map(({ path }) => ({ path: path === "" ? [] : path.split("/") }));
}

export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) {
    const { path } = await context.params;
    return route.GET(request, { params: Promise.resolve({ path: (path ?? []).join("/") }) });
}
