Deno.serve(handler);

async function handler(req: Request): Promise<Response> {
    if (req.method !== "POST") {
        return jsonResponse({
            error: "Method not allowed",
        }, 405);
    }
    try {
        const request: requestBody = await req.json();
        console.log(request);
        return jsonResponse(request);
    } catch (err) {
        return jsonResponse({
            error: (err as Error).message,
        }, 500);
    }
}

interface requestBody {
    url: string;
}

interface responseBody {
    title: string;
    description?: string;
    image?: string;
}

function jsonResponse(body: unknown, statusCode: number = 200): Response {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            "content-type": "application/json",
        },
    });
}
