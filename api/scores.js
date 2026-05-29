export const config = { runtime: "edge" };

const SCORE_KEY = process.env.SCORE_KEY || "ttworldcup:scores";
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": process.env.SCORE_ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type"
};

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireRedisConfig() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return json(501, {
      error: "Score API storage is not configured.",
      setup: "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on the serverless host."
    });
  }
  return null;
}

async function redis(command) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`Redis REST returned ${response.status}`);
  return response.json();
}

function hasWriteAccess(request) {
  const expectedToken = process.env.SCORE_WRITE_TOKEN;
  if (!expectedToken) return false;
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  return token === expectedToken;
}

async function readScores() {
  const result = await redis(["GET", SCORE_KEY]);
  if (!result.result) return { scores: {}, updatedAt: null };
  const stored = JSON.parse(result.result);
  return {
    scores: isPlainObject(stored.scores) ? stored.scores : {},
    updatedAt: stored.updatedAt || null
  };
}

async function writeScores(scores) {
  const updatedAt = new Date().toISOString();
  await redis(["SET", SCORE_KEY, JSON.stringify({ scores, updatedAt })]);
  return { scores, updatedAt };
}

export default async function handler(request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });

  const missingConfig = requireRedisConfig();
  if (missingConfig) return missingConfig;

  try {
    if (request.method === "GET") return json(200, await readScores());

    if (!hasWriteAccess(request)) return json(403, { error: "A valid score write token is required." });

    if (request.method === "PUT") {
      const payload = await request.json();
      if (!isPlainObject(payload.scores)) return json(400, { error: "Request body must include a scores object." });
      return json(200, await writeScores(payload.scores));
    }

    if (request.method === "DELETE") return json(200, await writeScores({}));

    return json(405, { error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return json(500, { error: "Score API request failed." });
  }
}
