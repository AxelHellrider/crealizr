import { createSerwistRoute } from "@serwist/turbopack";

const route = createSerwistRoute({ swSrc: "src/app/sw.ts" });

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
