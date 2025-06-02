import * as cheerio from "npm:cheerio";

Deno.serve(handler);

/**
 * @name handler
 * @desc Main request handler
 * @param {Request} req
 */
async function handler(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return jsonResponse({
            error: "Method not allowed",
        }, 405);
    }
    try {
        const request: requestBody = await req.json();
        if (!request.url) {
            return jsonResponse({
                error: "url not defined",
            }, 400);
        }
        const contents = await fetchUrlContents(request.url);
        const $ = cheerio.load(contents);
        console.log($.html());
        const title = $('meta[property="og:title"]').attr("content");
        const image = $('meta[property="og:image"]').attr("content");
        const description = $('meta[property="og:description"]').attr(
            "content",
        );
        return jsonResponse({ title, image, description });
    } catch (err) {
        return jsonResponse({
            error: (err as Error).message,
        }, 500);
    }
}

/**
 * @name requestBody
 * @desc Request body interface
 */
interface requestBody {
    url: string;
}

/**
 * @name responseBody
 * @desc Response body interface
 */
interface responseBody {
    title?: string;
    description?: string;
    image?: string;
    error?: string;
}

/**
 * @name fetchUrlContents
 * @param {string} url
 * @desc Custom fetch functions to handle security redirects
 */
async function fetchUrlContents(url: string): Promise<string> {
    const headers = new Headers({
        "accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ru,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua":
            '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
    });
    let ticker = 0;
    while (true) {
        if (ticker > 20) {
            throw new Error("too many redirects");
        }
        const res = await fetch(url, {
            headers: headers,
            referrerPolicy: "no-referrer-when-downgrade",
            method: "GET",
            mode: "cors",
            credentials: "include",
            redirect: "manual",
        });
        if (res.status >= 400) {
            console.error(`[${res.status}] unable to fetch ${url}`);
            throw new Error(`unable to fetch ${url}`);
        }
        const location = res.headers.get("location");

        if (location) {
            const cookies = res.headers.getSetCookie();
            if (cookies.length > 0) {
                const allCookies = headers.get("cookie")?.split(";") || [];
                for (const cookie of cookies) {
                    allCookies.push(cookie.split(";")[0]);
                }
                headers.set("cookie", allCookies.join(";"));
            }
            url = location;
            ticker++;
            continue;
        }
        return await res.text();
    }
}

/**
 * @name jsonResponse
 * @desc Helper function to wrap responses as JSON
 * @param {responseBody} body
 * @param {number} statusCode
 */
function jsonResponse(body: responseBody, statusCode: number = 200): Response {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            "content-type": "application/json",
        },
    });
}
