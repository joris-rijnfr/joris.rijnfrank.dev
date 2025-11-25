import page404 from "./404.js"


export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        if(url.pathname.endsWith("/")) {
            url.pathname += "index";
        }

        // All possible imports embedded at build time, no directory traversal possible
        let pathModule;
        try {
            pathModule = await import(`./paths/${url.pathname.substring(1)}.js`);
        } catch(e) {
            return addCacheHeader(await page404.fetch(request, env, ctx));
        }

        return addCacheHeader(await pathModule.default.fetch(request, env, ctx));
    }
}



function addCacheHeader(response) {
    const headers = new Headers(response.headers);
    if(!headers.has("Cache-Control")) {
        headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=3600, stale-if-error=86400");
    }
    return new Response(response.body, {
        status: response.status,
        headers
    });
}
